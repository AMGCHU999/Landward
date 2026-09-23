export default function TwoGates() {
  return (
    <section id="how">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">The two gates</div>
          <h2>Screening reduces the risk. Our affiliated paralegal network backs you up if it happens anyway.</h2>
          <p>
            Both halves exist because one on its own isn't the whole job — a well-screened tenant is far
            less likely to default, but "less likely" isn't "never," and that's exactly the moment most
            screening companies leave you on your own.
          </p>
        </div>
        <div className="gates">
          <div className="gate-col front">
            <div className="tag mono">Front end — before you approve</div>
            <h3>The Landward Report</h3>
            <p className="desc">
              One report, built the way a lawyer would build it: correct under Ontario's Human Rights Code,
              documented well enough to defend if a rejected applicant disputes the decision.
            </p>
            <ul className="gate-list">
              <li>
                <span className="num mono">01</span>
                <div>
                  <b>Credit report</b>
                  <span>The financial picture, verified.</span>
                </div>
              </li>
              <li>
                <span className="num mono">02</span>
                <div>
                  <b>Identity verification</b>
                  <span>Included standard — not an upsell.</span>
                </div>
              </li>
              <li>
                <span className="num mono">03</span>
                <div>
                  <b>Court &amp; LTB history check</b>
                  <span>Public court and tribunal decisions, searched for you.</span>
                </div>
              </li>
              <li>
                <span className="num mono">04</span>
                <div>
                  <b>Risk verdict</b>
                  <span>Low / Medium / High — scored across credit, tenancy history, and identity, with the reasons shown.</span>
                </div>
              </li>
            </ul>
          </div>
          <div className="gate-col back">
            <div className="tag mono">Back end — if it goes wrong</div>
            <h3>Legal consulting &amp; independent representation</h3>
            <p className="desc">
              If a tenant stops paying or a dispute arises, we connect you directly — at no cost — with
              independent, licensed paralegals and lawyers from our network, who advocate for you in the
              appropriate forum.
            </p>
            <ul className="gate-list">
              <li>
                <span className="num mono">01</span>
                <div>
                  <b>Landlord and Tenant Board</b>
                  <span>Rent-arrears applications, notices, and eviction hearings while the tenancy is active.</span>
                </div>
              </li>
              <li>
                <span className="num mono">02</span>
                <div>
                  <b>Small Claims Court</b>
                  <span>For a former tenant, once the LTB's one-year window closes. Both forums now share the same $50,000 jurisdiction as of October 2025.</span>
                </div>
              </li>
            </ul>
            <div className="scope-note">
              Scope: independent representation through to the order or judgment, under a separate client
              retainer between you and the professional you're connected with — Landward is not a party to
              it and is not paid a referral fee. Enforcement and collection afterward are handled
              separately.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
