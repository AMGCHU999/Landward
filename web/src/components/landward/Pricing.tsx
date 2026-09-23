export default function Pricing() {
  return (
    <section id="pricing" className="section-surface">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">Pricing</div>
          <h2>One report. Two simple ways to buy it.</h2>
          <p>
            Screening pays the bills on day one. Everything below it is future SaaS and marketplace
            revenue — technology and listing fees, kept entirely separate from the independent legal
            retainers described in the two gates above.
          </p>
        </div>

        <div className="price-block">
          <div className="price-main">
            <div className="amount">
              $45<span>per report, CAD</span>
            </div>
            <ul className="includes">
              <li>Credit report</li>
              <li>Identity verification</li>
              <li>Court &amp; LTB history check</li>
              <li>Defensible, Code-compliant documentation</li>
            </ul>
          </div>
          <div className="price-main">
            <div className="amount">
              $350<span>10-report pack, CAD</span>
            </div>
            <ul className="includes">
              <li>Same full report — $35 per screening</li>
              <li>Use reports in any order, for any applicant</li>
              <li>Valid 12 months from purchase</li>
              <li>Built for landlords and managers with steady turnover</li>
            </ul>
          </div>
          <div className="price-side">
            <h4>Who pays</h4>
            <p>
              Landward is landlord-pays by design — an applicant is never shown a payment screen before you
              see their report.
            </p>
            <div className="who-pays">landlord.pays == true</div>
          </div>
        </div>

        <div className="matrix-intro">
          <div className="tag mono">03–04 · Recurring &amp; marketplace lines</div>
          <h3>Beyond the report</h3>
        </div>

        <div className="matrix-block">
          <div className="matrix-grid">
            <div className="matrix-card flagship">
              <div className="tag mono">01 · Core</div>
              <h4>Applicant screening</h4>
              <div className="price">
                $45<span>per report, CAD</span>
              </div>
              <p className="note">The flagship product above — billed to the landlord, one report per applicant.</p>
            </div>

            <div className="matrix-card">
              <div className="tag mono">02 · Pack</div>
              <h4>10-report pack</h4>
              <div className="price">
                $350<span>one-time, CAD</span>
              </div>
              <div className="price-addon">valid 12 months</div>
              <p className="note">
                Ten full screening reports for $350 — $35 each, below the $45 pay-as-you-go rate.
                Valid for 12 months from purchase. Built for portfolios with steady turnover.
              </p>
            </div>

            <div className="matrix-card">
              <div className="tag mono">03 · Subscription</div>
              <h4>Compliance &amp; tax toolkit</h4>
              <div className="price">
                $9.99<span>per month, CAD</span>
              </div>
              <div className="price-addon">unlimited use</div>
              <p className="note">
                Rental-income record-keeping structured around CRA Form T776 (Statement of Real Estate
                Rentals), for landlords filing their own return.
              </p>
            </div>
          </div>

          <div className="vendor-directory">
            <div className="vendor-track">
              <div className="tag mono">04a · Flat-rate track</div>
              <h4>Vendor directory — standard &amp; spotlight</h4>
              <p className="note">
                A curated directory of Markham/Scarborough-area contractors and service providers, sold as a
                flat monthly listing fee.
              </p>
              <ul className="sub-tiers">
                <li>
                  Standard listing <b>$79/mo</b>
                </li>
                <li>
                  Spotlight / featured <b>$149–$249/mo</b>
                </li>
              </ul>
            </div>
            <div className="vendor-track">
              <div className="tag mono">04b · Performance-pay track</div>
              <h4>Vendor directory — pay per click / lead</h4>
              <p className="note">
                Benchmarked to the Thumbtack/Angi model — vendors pay only for traffic or delivered leads
                instead of a flat listing fee.
              </p>
              <ul className="sub-tiers">
                <li>
                  Pay-per-click <b>$2.00–$5.00/click</b>
                </li>
                <li>
                  Pay-per-lead <b>$25/lead</b>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="scope-note" style={{ marginTop: 28 }}>
          Only the $45 core screening report and the $350 10-report pack are live today. The compliance
          &amp; tax toolkit and vendor directory are proposed, pre-launch revenue lines — not yet available,
          billed, or priced in final form. The compliance &amp; tax toolkit references CRA Form T776 for
          context only; it&apos;s a record-keeping aid, not tax, legal, or accounting advice, and doesn&apos;t
          replace a licensed accountant. Vendor directory listings, including paid spotlight placement and
          pay-per-click/lead traffic, are paid advertising — not a background check, endorsement, or
          verification of any contractor or service provider. None of these revenue lines fund or relate to
          the free legal referral described above: Landward does not charge for, take a cut of, or act as a
          party to any LSO-licensed paralegal&apos;s or lawyer&apos;s retainer — that boundary stays fixed
          regardless of which SaaS products a landlord subscribes to. All pricing here is subject to change
          before public launch.
        </div>
      </div>
    </section>
  )
}
