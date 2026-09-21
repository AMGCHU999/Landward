export interface CertnScreeningRequest {
  email: string
  sendInviteEmail?: boolean
}

export async function submitScreeningApplicant(payload: CertnScreeningRequest) {
  const response = await fetch('/api/certn/applicants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const body = await response.json()
  if (!response.ok) {
    throw new Error(body.error || `Request failed with status ${response.status}`)
  }
  return body
}
