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
              <li>Our risk assessment: Low / Medium / High, with the reasons shown — you make the call</li>
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

        <div className="scope-note" style={{ marginTop: 28 }}>
          Only the $45 core screening report and the $350 10-report pack are live today. All pricing here
          is subject to change before public launch. Neither revenue line funds or relates to the free legal
          referral described above: Landward does not charge for, take a cut of, or act as a party to any
          LSO-licensed paralegal&apos;s or lawyer&apos;s retainer — that boundary stays fixed regardless of
          which products a landlord buys.
        </div>
      </div>
    </section>
  )
}
