import { TypeSafeClient, choice, score, noul } from "@typesafe-ai/sdk";
import type { EntryType } from "@typesafe-ai/sdk";
import type { CertnReport, RiskTier, TenantRiskEvaluation } from "./types.js";

// Code-owned so a weighting change never requires re-running inference.
const DIMENSION_WEIGHTS_WITH_CRIMINAL = { financialRisk: 0.5, tenancyHistoryRisk: 0.35, criminalRelevance: 0.15 };
const DIMENSION_WEIGHTS_NO_CRIMINAL = { financialRisk: 0.6, tenancyHistoryRisk: 0.4, criminalRelevance: 0 };

// A confirmed eviction/unpaid-rent order or an identity mismatch is a hard
// signal, not one to average away against an otherwise clean financial picture.
const EVICTION_OVERRIDE_THRESHOLD = 0.7;
const IDENTITY_MISMATCH_THRESHOLD = 0.6;
const LOW_CONFIDENCE_REVIEW_THRESHOLD = 0.5;

let sharedClient: TypeSafeClient | null = null;
function getClient(): TypeSafeClient {
  if (!sharedClient) sharedClient = new TypeSafeClient();
  return sharedClient;
}

const riskTierQuestion = choice(
  "Considering `identity_verification`, `credit_summary`, `litigation_records`, and `criminal_records`, and applying only tenancy-relevant reasoning (ability to pay rent, and history of tenancy-related legal disputes — never a protected human-rights ground), which overall tenant risk tier fits this applicant?",
  {
    low: "Stable credit, no confirmed tenant-at-fault eviction or unpaid-rent judgment, and no tenancy-relevant criminal history.",
    medium: "Some financial strain (isolated delinquencies, thin credit) or an old or minor litigation record, but nothing that alone would justify rejection.",
    high: "A confirmed eviction or unpaid-rent judgment against the applicant, severe or active financial distress (bankruptcy, open collections, or a pattern of delinquency), or a criminal record directly relevant to tenant or property safety.",
  },
);

const financialRiskQuestion = score(
  "How much risk does `credit_summary` indicate for on-time rent payment?",
  [
    "Stable credit history; no meaningful delinquencies or open collections.",
    "Minor, isolated late payments; no open collections and no bankruptcy or consumer proposal.",
    "A clear pattern of delinquency, or an open collections account.",
    "Severe distress: an active bankruptcy or consumer proposal, or multiple open collections alongside delinquencies.",
  ] as const,
);

const tenancyHistoryRiskQuestion = score(
  "How much risk does `litigation_records` indicate for this applicant's tenancy, based on the LTB, CanLII, and civil court narratives?",
  [
    "No litigation records, or records where the applicant was not at fault (e.g. a landlord-initiated matter that was dismissed, or the applicant as a non-liable party).",
    "Minor or old disputes (e.g. a resolved maintenance or notice dispute) with no order against the applicant.",
    "A civil judgment or order against the applicant for a lease-related matter other than eviction or unpaid rent.",
    "A confirmed eviction order or unpaid-rent judgment against the applicant.",
  ] as const,
);

const criminalRelevanceQuestion = score(
  "How relevant is `criminal_records` to the safety of the property, other tenants, or on-time rent payment?",
  [
    "No records, or records unrelated to tenancy (dismissed, or unrelated to property, violence, or fraud).",
    "A record with some relevance (e.g. a minor property offense) but limited or dated.",
    "A record directly relevant to tenant or property safety (violence in a residence, arson, property destruction, or housing-related fraud).",
  ] as const,
);

const priorEvictionOrderQuestion = noul(
  "Do `litigation_records` describe an order or judgment specifically against this applicant for eviction or unpaid rent — as opposed to the applicant being a non-liable party, or a landlord-initiated matter that was dismissed or withdrawn?",
  {
    true: "A tribunal or court order or judgment was made against the applicant for eviction or unpaid rent.",
    false: "No such order exists, or the applicant was not the party found liable.",
  },
);

const identityMismatchQuestion = noul(
  "Does `identity_verification` describe a mismatch between the applicant's stated identity and the verified records (name, date of birth, SIN, or address inconsistency), rather than a clean, fully matched verification?",
  {
    true: "The narrative describes a partial match or an inconsistency.",
    false: "The narrative describes a full, clean match.",
  },
);

export async function evaluateTenantRisk(
  report: CertnReport,
  client: TypeSafeClient = getClient(),
): Promise<TenantRiskEvaluation> {
  const hasCriminal = Boolean(report.criminal && report.criminal.length > 0);

  // The domain types describe this shape precisely; EntryType's index signature
  // is just how the SDK spells "JSON-compatible" for arbitrary state.
  const state = {
    identity_verification: report.identity,
    credit_summary: report.credit,
    litigation_records: report.litigation,
    criminal_records: report.criminal ?? [],
  } as unknown as EntryType;

  // Both branches ask every question over the same state in one request; the
  // criminal-relevance question only makes sense once a criminal check ran.
  const { answers } = hasCriminal
    ? await client.systemOne({
        state,
        questions: {
          riskTier: riskTierQuestion,
          financialRisk: financialRiskQuestion,
          tenancyHistoryRisk: tenancyHistoryRiskQuestion,
          criminalRelevance: criminalRelevanceQuestion,
          priorEvictionOrder: priorEvictionOrderQuestion,
          identityMismatch: identityMismatchQuestion,
        },
      })
    : await client.systemOne({
        state,
        questions: {
          riskTier: riskTierQuestion,
          financialRisk: financialRiskQuestion,
          tenancyHistoryRisk: tenancyHistoryRiskQuestion,
          priorEvictionOrder: priorEvictionOrderQuestion,
          identityMismatch: identityMismatchQuestion,
        },
      });

  // `answers` is a union of two SystemOne result shapes keyed by `hasCriminal`;
  // that's the same runtime condition, so branch on it directly rather than
  // fighting TypeScript's narrowing over a mapped-type union.
  const criminalRelevance = hasCriminal
    ? (() => {
        const criminalAnswer = (answers as Record<string, unknown>).criminalRelevance as {
          score: number;
          confidence: number;
          legend: unknown;
        };
        return {
          score: criminalAnswer.score,
          confidence: criminalAnswer.confidence,
          legend: criminalAnswer.legend as Record<string, unknown>,
        };
      })()
    : null;

  const reviewReasons: string[] = [];
  let riskTier: RiskTier = answers.riskTier.choice;

  if (answers.priorEvictionOrder.noul >= EVICTION_OVERRIDE_THRESHOLD && riskTier !== "high") {
    riskTier = "high";
    reviewReasons.push(
      "Litigation records indicate a confirmed eviction or unpaid-rent order; tier escalated to high regardless of the model's overall pick.",
    );
  }

  if (answers.identityMismatch.noul >= IDENTITY_MISMATCH_THRESHOLD) {
    reviewReasons.push("Identity verification narrative suggests a partial match or an inconsistency.");
  }

  if (answers.riskTier.confidence < LOW_CONFIDENCE_REVIEW_THRESHOLD) {
    reviewReasons.push(
      `Overall risk tier confidence (${answers.riskTier.confidence.toFixed(2)}) is below the review threshold.`,
    );
  }

  const weights = criminalRelevance ? DIMENSION_WEIGHTS_WITH_CRIMINAL : DIMENSION_WEIGHTS_NO_CRIMINAL;
  const compositeScore =
    (answers.financialRisk.score / 3) * weights.financialRisk +
    (answers.tenancyHistoryRisk.score / 3) * weights.tenancyHistoryRisk +
    (criminalRelevance ? criminalRelevance.score / 2 : 0) * weights.criminalRelevance;

  return {
    riskTier,
    riskTierConfidence: answers.riskTier.confidence,
    compositeScore,
    dimensions: {
      financialRisk: {
        score: answers.financialRisk.score,
        confidence: answers.financialRisk.confidence,
        legend: answers.financialRisk.legend as Record<string, unknown>,
      },
      tenancyHistoryRisk: {
        score: answers.tenancyHistoryRisk.score,
        confidence: answers.tenancyHistoryRisk.confidence,
        legend: answers.tenancyHistoryRisk.legend as Record<string, unknown>,
      },
      criminalRelevance,
    },
    flags: {
      priorEvictionOrder: answers.priorEvictionOrder.noul,
      identityMismatch: answers.identityMismatch.noul,
    },
    requiresManualReview: reviewReasons.length > 0,
    reviewReasons,
  };
}
