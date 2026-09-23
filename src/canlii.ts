// CanLII API client (https://api.canlii.org/v1/).
//
// Landward uses this to pull Landlord and Tenant Board (LTB) decisions and
// other tribunal/court records as an independent litigation signal, mapped
// into the same CertnLitigationRecord shape the risk evaluator consumes.
//
// API key: issued by CanLII (free for non-commercial use); passed as the
// `api_key` query parameter on every request.
//
// IMPORTANT LIMITATION (per CanLII's official docs): caseBrowse has NO
// server-side search parameter. You can only paginate and filter by date
// (published/modified/decision date). Name-based matching therefore happens
// client-side: browse recent decisions in a database, fetch metadata per
// case, and keep the ones whose title mentions the applicant. Keep
// `maxCases` small — this is intentionally throttled.
const CANLII_BASE_URL = "https://api.canlii.org/v1";

const CANLII_API_KEY_VAR = "CANLII_API_KEY";
// CanLII database ID for the Ontario Landlord and Tenant Board. Override via
// env if CanLII changes it; verify with listCaseDatabases().
const CANLII_LTB_DATABASE_VAR = "CANLII_LTB_DATABASE_ID";
const DEFAULT_LTB_DATABASE_ID = "onltb";

export type CanLIILanguage = "en" | "fr";

export interface CanLIIClientOptions {
  apiKey?: string;
  language?: CanLIILanguage;
}

export interface CanLIICaseDatabase {
  databaseId: string;
  jurisdiction: string;
  name: string;
}

export interface CanLIICaseSummary {
  databaseId: string;
  caseId: string;
  title: string;
  citation: string;
}

export interface CanLIICaseMetadata extends CanLIICaseSummary {
  url: string;
  decisionDate: string;
  docketNumber?: string;
  keywords?: string[];
}

export interface BrowseCasesOptions extends CanLIIClientOptions {
  databaseId?: string;
  offset?: number;
  resultCount?: number;
  decisionDateAfter?: string; // YYYY-MM-DD
  decisionDateBefore?: string; // YYYY-MM-DD
  publishedAfter?: string; // YYYY-MM-DD
  publishedBefore?: string; // YYYY-MM-DD
}

export interface FindLitigationOptions extends CanLIIClientOptions {
  /** CanLII database ID(s) to search. Defaults to the LTB database. */
  databaseIds?: string[];
  /** Only consider decisions on/after this date (YYYY-MM-DD). Defaults to 7 years ago. */
  decisionDateAfter?: string;
  /** Cap on cases inspected per database; client-side filtering is costly. */
  maxCases?: number;
  /** Value for the `source` field of matched records. Defaults to "LTB". */
  source?: "LTB" | "CanLII" | "civil_court";
}

function resolveApiKey(explicit?: string): string {
  const apiKey = explicit ?? process.env[CANLII_API_KEY_VAR];
  if (!apiKey) {
    throw new Error(`Missing CanLII API key. Set ${CANLII_API_KEY_VAR} or pass apiKey explicitly.`);
  }
  return apiKey;
}

export function resolveLtbDatabaseId(): string {
  return process.env[CANLII_LTB_DATABASE_VAR] || DEFAULT_LTB_DATABASE_ID;
}

async function canliiGet<T>(path: string, params: Record<string, string | number>, apiKey?: string): Promise<T> {
  const key = resolveApiKey(apiKey);
  const query = new URLSearchParams({ api_key: key });
  for (const [k, v] of Object.entries(params)) query.set(k, String(v));
  const response = await fetch(`${CANLII_BASE_URL}${path}?${query}`);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`CanLII API error ${response.status}: ${body}`);
  }
  return response.json() as Promise<T>;
}

/** List all CanLII case databases (courts/tribunals). Use this to verify database IDs. */
export async function listCaseDatabases(options: CanLIIClientOptions = {}): Promise<CanLIICaseDatabase[]> {
  const language = options.language ?? "en";
  const data = await canliiGet<{ caseDatabases: CanLIICaseDatabase[] }>(
    `/caseBrowse/${language}/`,
    {},
    options.apiKey,
  );
  return data.caseDatabases;
}

/** Browse decisions in one database — paginated, date-filterable, most-recent-first. */
export async function browseCases(options: BrowseCasesOptions): Promise<CanLIICaseSummary[]> {
  const { databaseId = resolveLtbDatabaseId(), offset = 0, resultCount = 100 } = options;
  const language = options.language ?? "en";
  const params: Record<string, string | number> = { offset, resultCount };
  if (options.decisionDateAfter) params.decisionDateAfter = options.decisionDateAfter;
  if (options.decisionDateBefore) params.decisionDateBefore = options.decisionDateBefore;
  if (options.publishedAfter) params.publishedAfter = options.publishedAfter;
  if (options.publishedBefore) params.publishedBefore = options.publishedBefore;
  const data = await canliiGet<{ cases: CanLIICaseSummary[] }>(
    `/caseBrowse/${language}/${databaseId}/`,
    params,
    options.apiKey,
  );
  return data.cases;
}

/** Full metadata for one decision. */
export async function getCaseMetadata(
  databaseId: string,
  caseId: string,
  options: CanLIIClientOptions = {},
): Promise<CanLIICaseMetadata> {
  const language = options.language ?? "en";
  return canliiGet<CanLIICaseMetadata>(
    `/caseBrowse/${language}/${databaseId}/${caseId}/`,
    {},
    options.apiKey,
  );
}

function sevenYearsAgo(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 7);
  return d.toISOString().slice(0, 10);
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
}

function titleMentionsName(title: string, name: string): boolean {
  const normalizedTitle = ` ${normalizeName(title)} `;
  const parts = normalizeName(name).split(" ").filter(Boolean);
  return parts.length > 0 && parts.every((part) => normalizedTitle.includes(` ${part} `));
}

/**
 * Find litigation records mentioning an applicant's name in CanLII databases.
 *
 * Because CanLII exposes no name search, this pages through recent decisions
 * (newest first) and matches titles client-side — keep `maxCases` modest.
 * Returns records in the shape the tenant-risk evaluator consumes.
 */
export async function findLitigationByName(
  name: string,
  options: FindLitigationOptions = {},
): Promise<import("./screening/types.js").CertnLitigationRecord[]> {
  if (!name.trim()) throw new Error("An applicant name is required.");
  const databaseIds = options.databaseIds ?? [resolveLtbDatabaseId()];
  const decisionDateAfter = options.decisionDateAfter ?? sevenYearsAgo();
  const maxCases = options.maxCases ?? 200;
  const source = options.source ?? "LTB";
  const language = options.language ?? "en";

  const records: import("./screening/types.js").CertnLitigationRecord[] = [];
  for (const databaseId of databaseIds) {
    let offset = 0;
    let inspected = 0;
    for (;;) {
      const batch = await browseCases({
        databaseId,
        offset,
        resultCount: Math.min(100, maxCases - inspected),
        decisionDateAfter,
        language,
        apiKey: options.apiKey,
      });
      if (batch.length === 0) break;
      for (const summary of batch) {
        inspected += 1;
        if (!titleMentionsName(summary.title, name)) continue;
        const meta = await getCaseMetadata(databaseId, summary.caseId, {
          language,
          apiKey: options.apiKey,
        });
        records.push({
          source,
          case_number: meta.docketNumber || meta.caseId,
          date: meta.decisionDate,
          narrative: `${meta.title} (${meta.citation}). ${meta.url}`,
        });
      }
      if (batch.length < 100 || inspected >= maxCases) break;
      offset += batch.length;
    }
  }
  return records;
}
