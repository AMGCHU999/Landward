// Shape of a completed Certn background check report, as assembled into the
// Landward Report. Certn's real webhook payload carries more fields than this;
// these are the ones the report presents as facts.
//
// Landward performs no risk assessment: no scoring, no Low/Medium/High tier.
// The report presents verified facts and evidence; the landlord decides.

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
