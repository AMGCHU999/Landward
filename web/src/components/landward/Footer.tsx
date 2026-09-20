export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">Landward</div>
          <div className="foot-cols">
            <div className="foot-col">
              <h5>Product</h5>
              <a href="#how">How it works</a>
              <a href="#pricing">Pricing</a>
              <a href="#who">For property managers</a>
            </div>
            <div className="foot-col">
              <h5>Company</h5>
              <a href="#">About</a>
              <a href="#">Contact</a>
            </div>
            <div className="foot-col">
              <h5>Legal</h5>
              <a href="#">Privacy policy</a>
              <a href="#">Terms of service</a>
            </div>
          </div>
        </div>
        <div className="foot-legal">
          <span>© 2026 Landward. Ontario, Canada.</span>
          <span className="mono">LW–2026–ON</span>
        </div>
        <p className="foot-note">
          <strong>Legal disclaimer:</strong> Landward is an automated tenant screening and legal document
          workflow platform owned and operated by QuadCore Technologies Inc. Landward is not a law firm,
          does not directly provide legal advice or legal representation, and is not a party to any
          retainer agreement. All legal consultations, document filings, and tribunal or court
          representation are provided independently by licensed Ontario paralegals and lawyers, operating
          within their authorized Law Society of Ontario (LSO) scope of practice, under a separate retainer
          agreement directly between them and the landlord. Landward neither pays nor is paid a referral
          fee for these introductions, and none of this constitutes a guarantee of any outcome.
        </p>
        <p className="foot-note">
          Pre-launch page. Landward is not yet registered as a trade name or subsidiary of QuadCore
          Technologies Inc., a licensed consumer reporting agency, or a party to a signed data-bureau
          agreement — those steps are in progress. Pricing and included checks reflect the current business
          plan and are subject to change before public launch.
        </p>
      </div>
    </footer>
  )
}
