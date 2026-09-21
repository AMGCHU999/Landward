import CtaBanner from './landward/CtaBanner'
import Faq from './landward/Faq'
import Footer from './landward/Footer'
import Header from './landward/Header'
import Hero from './landward/Hero'
import Pricing from './landward/Pricing'
import RequestSection from './landward/RequestSection'
import ScreeningDemo from './landward/ScreeningDemo'
import Segments from './landward/Segments'
import TrustBar from './landward/TrustBar'
import TwoGates from './landward/TwoGates'

export default function LandingPage() {
  return (
    <>
      <Header />
      <Hero />
      <TrustBar />
      <TwoGates />
      <Pricing />
      {/* Dev-only: its buttons call dev-server routes that don't exist in the deployed site. */}
      {import.meta.env.DEV && <ScreeningDemo />}
      <RequestSection />
      <Segments />
      <Faq />
      <CtaBanner />
      <Footer />
    </>
  )
}
