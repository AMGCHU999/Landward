// Certn Centric API client. The Legacy API (api.certn.co/api/v1/hr/...) was retired,
// so cases are ordered via POST /api/public/cases/order/ with an Api-Key header.
// Sandbox and production are separate accounts with separate keys.
export type CertnEnvironment = "sandbox" | "production";

// Production is the Canada region (Landward screens Ontario tenants).
const CERTN_BASE_URLS: Record<CertnEnvironment, string> = {
  sandbox: "https://api.sandbox.certn.co",
  production: "https://api.ca.certn.co",
};

const CERTN_API_KEY_VARS: Record<CertnEnvironment, string> = {
  sandbox: "CERTN_SANDBOX_API_KEY",
  production: "CERTN_PRODUCTION_API_KEY",
};

// Credit report templates (Client Portal > Settings > Templates) belong to one account,
// so sandbox and production each have their own template ID.
const CERTN_CREDIT_TEMPLATE_VARS: Record<CertnEnvironment, string> = {
  sandbox: "CERTN_SANDBOX_CREDIT_TEMPLATE_ID",
  production: "CERTN_PRODUCTION_CREDIT_TEMPLATE_ID",
};

export type CertnCheckArguments = Record<string, Record<string, unknown>>;

// Landward's standard tenant screening: OneID identity verification plus a Canadian
// credit report (Equifax). With a template, address-based ordering (MULTI_REGION) takes
// its look-back period and minimum address duration from the template; without one, the
// order falls back to a single Canadian credit report.
export function buildScreeningChecks(creditTemplateId?: string): CertnCheckArguments {
  const creditReport: Record<string, unknown> = creditTemplateId
    ? { ordering_type: "MULTI_REGION", template_id: creditTemplateId, INCLUDE_PREVIOUS_NAMES: true }
    : {
        ordering_type: "SINGLE_REGION",
        umbrella_client_permitted_child_check_types: ["CANADIAN_CREDIT_REPORT_1"],
        INCLUDE_PREVIOUS_NAMES: true,
      };
  return { IDENTITY_VERIFICATION_1: {}, CREDIT_REPORT_1: creditReport };
}

export interface CertnScreeningRequest {
  email: string;
  // true: Certn emails the invite. false: the invite link is returned for Landward to deliver.
  sendInviteEmail?: boolean;
}

export interface CertnCaseResponse {
  id: string;
  invite_link?: string;
  [key: string]: unknown;
}

export interface CertnClientOptions {
  environment?: CertnEnvironment;
  apiKey?: string;
  creditTemplateId?: string;
}

// Defaults to sandbox so a missing setting can never run billed production checks.
export function resolveCertnEnvironment(
  value: string | undefined = process.env.CERTN_ENV
): CertnEnvironment {
  if (!value) return "sandbox";
  if (value === "sandbox" || value === "production") return value;
  throw new Error(`Invalid CERTN_ENV "${value}". Use "sandbox" or "production".`);
}

export async function orderScreeningCase(
  request: CertnScreeningRequest,
  options: CertnClientOptions = {}
): Promise<CertnCaseResponse> {
  const environment = options.environment ?? resolveCertnEnvironment();
  const keyVar = CERTN_API_KEY_VARS[environment];
  const apiKey = options.apiKey ?? process.env[keyVar];
  if (!apiKey) {
    throw new Error(`Missing Certn ${environment} API key. Set ${keyVar} or pass apiKey explicitly.`);
  }
  if (!request.email || !request.email.includes("@")) {
    throw new Error("A valid applicant email is required.");
  }

  const creditTemplateId =
    options.creditTemplateId ?? (process.env[CERTN_CREDIT_TEMPLATE_VARS[environment]] || undefined);
  const sendInviteEmail = request.sendInviteEmail ?? true;
  const response = await fetch(`${CERTN_BASE_URLS[environment]}/api/public/cases/order/`, {
    method: "POST",
    headers: {
      Authorization: `Api-Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email_address: request.email,
      send_invite_email: sendInviteEmail,
      return_invite_link: !sendInviteEmail,
      check_types_with_arguments: buildScreeningChecks(creditTemplateId),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Certn ${environment} API error ${response.status}: ${body}`);
  }

  return response.json() as Promise<CertnCaseResponse>;
}
