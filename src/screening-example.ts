import * as dotenv from "dotenv";
import * as path from "path";
import { evaluateTenantRisk } from "./screening/evaluate";
import type { CertnReport } from "./screening/types";
import cleanReport from "./fixtures/sample-certn-report.json";
import highRiskReport from "./fixtures/sample-certn-report-high-risk.json";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function runExample() {
  for (const [label, report] of [
    ["clean applicant", cleanReport],
    ["high-risk applicant", highRiskReport],
  ] as const) {
    console.log(`\nEvaluating ${label}...`);
    try {
      const evaluation = await evaluateTenantRisk(report as CertnReport);
      console.log(JSON.stringify(evaluation, null, 2));
    } catch (error: any) {
      console.error(`Failed to evaluate ${label}:`);
      console.error(error.message || error);
    }
  }
}

runExample();
