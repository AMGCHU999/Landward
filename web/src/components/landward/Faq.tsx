export default function Faq() {
  return (
    <section id="faq" className="section-surface">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">Before you sign up</div>
          <h2>Questions landlords ask us first.</h2>
        </div>
        <div className="faq">
          <details className="faq-item" open>
            <summary>Is this rent guarantee insurance?</summary>
            <p>
              No. Screening reduces the odds of a bad tenant, and our network of licensed Ontario
              paralegals and lawyers can represent you at the LTB or in Small Claims Court if one still
              slips through — but neither is an insurance payout, and we won't describe it as one. If you
              need your rent insured outright, that's a different product, and not one we offer today.
            </p>
          </details>
          <details className="faq-item">
            <summary>Does the applicant ever pay?</summary>
            <p>
              No. The report is billed to the landlord. An applicant only ever sees a consent screen, never
              a payment step.
            </p>
          </details>
          <details className="faq-item">
            <summary>What exactly does "legal support on both ends" mean?</summary>
            <p>
              Front end: the Landward report is structured under Ontario's Human Rights Code criteria, with
              defensible documentation. Back end: if a tenant defaults, we connect you directly with an
              independent, licensed paralegal or lawyer from our network, who provides legal consultation
              and tribunal or court representation under a standard retainer agreement between the two of
              you.
            </p>
          </details>
          <details className="faq-item">
            <summary>Do you charge for the legal referral, or take a cut of their fee?</summary>
            <p>
              No, on both counts. The introduction is free, and Landward is not paid by and does not pay
              the paralegal or lawyer you're connected with. Their fees are a separate matter between the
              two of you — Landward is not a law firm and doesn't provide legal advice or representation
              itself.
            </p>
          </details>
          <details className="faq-item">
            <summary>Do they collect the debt for me after a judgment?</summary>
            <p>
              No — that's a deliberate boundary the professionals in our network work within.
              Representation runs through to the order or judgment. Enforcement and collection from there
              is a separate step, one a landlord would take themselves or refer to a licensed collection
              agency.
            </p>
          </details>
          <details className="faq-item">
            <summary>Is a criminal record check actually legal to use in tenant screening?</summary>
            <p>
              Yes, in Ontario. "Record of offences" is a protected ground under the Human Rights Code for
              employment screening specifically — it isn't one of the Code's housing grounds. A criminal
              record check is available as an add-on to your report for exactly this reason.
            </p>
          </details>
          <details className="faq-item">
            <summary>Where do you operate?</summary>
            <p>
              Ontario, at launch. Every part of this page — the pricing, the legal-venue detail, the
              compliance framing — is built for Ontario specifically, not adapted from a generic
              Canada-wide product.
            </p>
          </details>
        </div>
      </div>
    </section>
  )
}
