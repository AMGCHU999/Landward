import { test } from "node:test";
import assert from "node:assert/strict";
import type { TypeSafeClient } from "@typesafe-ai/sdk";
import { evaluateTenantRisk as rootEvaluate } from "./evaluate.js";
import { evaluateTenantRisk as webEvaluate } from "../../web/src/server/screeningEvaluator.js";
import type { CertnReport } from "./types.js";
import cleanReport from "../fixtures/sample-certn-report.json";
import highRiskReport from "../fixtures/sample-certn-report-high-risk.json";

interface FakeAnswers {
  tier?: "low" | "medium" | "high";
  tierConfidence?: number;
  financial?: number;
  tenancy?: number;
  criminal?: number;
  eviction?: number;
  identity?: number;
}

function fakeClient(a: FakeAnswers = {}) {
  const calls: Array<{ state: unknown; questions: Record<string, unknown> }> = [];
  const client = {
    systemOne: async (request: { state: unknown; questions: Record<string, unknown> }) => {
      calls.push(request);
      const answers: Record<string, unknown> = {
        riskTier: {
          type: "choice",
          choice: a.tier ?? "low",
          confidence: a.tierConfidence ?? 0.95,
          probabilities: {},
        },
        financialRisk: { type: "score", score: a.financial ?? 0, confidence: 1, legend: {}, probabilities: {} },
        tenancyHistoryRisk: { type: "score", score: a.tenancy ?? 0, confidence: 1, legend: {}, probabilities: {} },
        priorEvictionOrder: { type: "noul", noul: a.eviction ?? 0.02 },
        identityMismatch: { type: "noul", noul: a.identity ?? 0.02 },
      };
      if ("criminalRelevance" in request.questions) {
        answers.criminalRelevance = {
          type: "score",
          score: a.criminal ?? 0,
          confidence: 0.9,
          legend: {},
          probabilities: {},
        };
      }
      return { model: "jev-latest", answers, usage: { input_tokens: 0, output_tokens: 0 } };
    },
  };
  return { client: client as unknown as TypeSafeClient, calls };
}

for (const [label, evaluate] of [
  ["root", rootEvaluate],
  ["web bridge", webEvaluate],
] as const) {
  test(`${label}: clean applicant with no criminal check: low tier, no review, no criminal question asked`, async () => {
    const { client, calls } = fakeClient();
    const result = await evaluate(cleanReport as CertnReport, client);

    assert.equal(calls.length, 1);
    assert.ok(!("criminalRelevance" in calls[0].questions));
    assert.equal(result.riskTier, "low");
    assert.equal(result.dimensions.criminalRelevance, null);
    assert.equal(result.compositeScore, 0);
    assert.equal(result.requiresManualReview, false);
    assert.deepEqual(result.reviewReasons, []);
  });

  test(`${label}: criminal records present: criminal-relevance question is asked and reported`, async () => {
    const { client, calls } = fakeClient({ criminal: 1 });
    const result = await evaluate(highRiskReport as CertnReport, client);

    assert.ok("criminalRelevance" in calls[0].questions);
    assert.equal(result.dimensions.criminalRelevance?.score, 1);
  });

  test(`${label}: empty criminal array is treated as no criminal check`, async () => {
    const { client, calls } = fakeClient();
    await evaluate({ ...(cleanReport as CertnReport), criminal: [] }, client);
    assert.ok(!("criminalRelevance" in calls[0].questions));
  });

  test(`${label}: confirmed eviction order escalates a non-high tier to high and flags review`, async () => {
    const { client } = fakeClient({ tier: "medium", eviction: 0.9 });
    const result = await evaluate(cleanReport as CertnReport, client);

    assert.equal(result.riskTier, "high");
    assert.equal(result.requiresManualReview, true);
    assert.match(result.reviewReasons[0], /eviction/i);
  });

  test(`${label}: eviction probability just below threshold does not escalate`, async () => {
    const { client } = fakeClient({ tier: "medium", eviction: 0.69 });
    const result = await evaluate(cleanReport as CertnReport, client);

    assert.equal(result.riskTier, "medium");
    assert.equal(result.requiresManualReview, false);
  });

  test(`${label}: identity mismatch flags manual review without changing the tier`, async () => {
    const { client } = fakeClient({ tier: "low", identity: 0.8 });
    const result = await evaluate(cleanReport as CertnReport, client);

    assert.equal(result.riskTier, "low");
    assert.equal(result.requiresManualReview, true);
    assert.match(result.reviewReasons[0], /identity/i);
  });

  test(`${label}: low tier confidence flags manual review`, async () => {
    const { client } = fakeClient({ tierConfidence: 0.4 });
    const result = await evaluate(cleanReport as CertnReport, client);

    assert.equal(result.requiresManualReview, true);
    assert.match(result.reviewReasons[0], /confidence/i);
  });

  test(`${label}: composite score uses the with-criminal weights when a criminal check ran`, async () => {
    const { client } = fakeClient({ financial: 3, tenancy: 3, criminal: 2 });
    const result = await evaluate(highRiskReport as CertnReport, client);

    assert.ok(Math.abs(result.compositeScore - 1) < 1e-9);
  });

  test(`${label}: composite score uses the no-criminal weights otherwise`, async () => {
    const { client } = fakeClient({ financial: 3, tenancy: 0 });
    const result = await evaluate(cleanReport as CertnReport, client);

    assert.ok(Math.abs(result.compositeScore - 0.6) < 1e-9);
  });

  test(`${label}: all reasons accumulate when several signals fire`, async () => {
    const { client } = fakeClient({ tier: "medium", tierConfidence: 0.3, eviction: 0.95, identity: 0.95 });
    const result = await evaluate(highRiskReport as CertnReport, client);

    assert.equal(result.reviewReasons.length, 3);
  });

  test(`${label}: report data is passed to the model as named state`, async () => {
    const { client, calls } = fakeClient();
    await evaluate(highRiskReport as CertnReport, client);

    const state = calls[0].state as Record<string, unknown>;
    assert.deepEqual(Object.keys(state).sort(), [
      "credit_summary",
      "criminal_records",
      "identity_verification",
      "litigation_records",
    ]);
  });
}

test("web bridge shares the root implementation instead of a copy", () => {
  assert.equal(webEvaluate, rootEvaluate);
});
