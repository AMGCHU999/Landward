export default function Header() {
  return (
    <header className="site">
      <div className="wrap nav">
        <div className="brand">
          <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
            <circle cx="13" cy="13" r="11" fill="none" stroke="currentColor" strokeWidth="1.3" />
            <line x1="13" y1="3" x2="13" y2="7" stroke="currentColor" strokeWidth="1.3" />
            <line x1="13" y1="19" x2="13" y2="23" stroke="currentColor" strokeWidth="1.3" />
            <line x1="3" y1="13" x2="7" y2="13" stroke="currentColor" strokeWidth="1.3" />
            <line x1="19" y1="13" x2="23" y2="13" stroke="currentColor" strokeWidth="1.3" />
            <polygon points="13,7 15.4,13 13,19 10.6,13" fill="currentColor" />
          </svg>
          Landward
        </div>
        <nav className="links">
          <a href="#how">How it works</a>
          <a href="#pricing">Pricing</a>
          <a href="#who">Who it's for</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="nav-actions">
          <a className="btn btn-ghost" href="https://client.certn.co/ca" target="_blank" rel="noopener noreferrer">Log in</a>
          <a className="btn btn-primary" href="#get-started">Screen an applicant — $45</a>
        </div>
      </div>
    </header>
  )
}
