// Shape of a completed Certn background check report, as consumed by the risk
// evaluator. Certn's real webhook payload carries more fields than this; these
// are the ones the evaluator actually reads.

export interface CertnCreditSummary {
  bureau_score: number | null;
  delinquencies_24mo: number;
  collections_open: number;
  bankruptcy_or_consumer_proposal: boolean;
  narrative: string;
}

export interface CertnCriminalRecord {
  jurisdiction: string;
  offense: string;
  disposition: string;
  date: string;
  narrative: string;
}

export interface CertnLitigationRecord {
  source: "LTB" | "CanLII" | "civil_court";
  case_number: string;
  date: string;
  narrative: string;
}

export interface CertnIdentityVerification {
  status: "verified" | "partial" | "unverified";
  narrative: string;
}

export interface CertnReport {
  applicant_id: string;
  tag: string;
  identity: CertnIdentityVerification;
  credit: CertnCreditSummary;
  litigation: CertnLitigationRecord[];
  criminal: CertnCriminalRecord[] | null;
}

export type RiskTier = "low" | "medium" | "high";

export interface TenantRiskEvaluation {
  riskTier: RiskTier;
  riskTierConfidence: number;
  compositeScore: number;
  dimensions: {
    financialRisk: { score: number; confidence: number; legend: Record<string, unknown> };
    tenancyHistoryRisk: { score: number; confidence: number; legend: Record<string, unknown> };
    criminalRelevance: { score: number; confidence: number; legend: Record<string, unknown> } | null;
  };
  flags: {
    priorEvictionOrder: number;
    identityMismatch: number;
  };
  requiresManualReview: boolean;
  reviewReasons: string[];
}
