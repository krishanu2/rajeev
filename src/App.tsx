import { useEffect } from "react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import SymptomSelector from "./components/SymptomSelector";
import About from "./components/About";
import Manifesto from "./components/Manifesto";
import Story from "./components/Story";
import Results from "./components/Results";
import Testimonials from "./components/Testimonials";
import Gallery from "./components/Gallery";
import Programs from "./components/Programs";
import FunWithFitness from "./components/FunWithFitness";
import FAQ from "./components/FAQ";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import CursorGlow from "./components/CursorGlow";
import ScrollProgress from "./components/ScrollProgress";
import IntroOverlay from "./components/IntroOverlay";
import Beat from "./components/Beat";
import { SelectionProvider } from "./context/SelectionContext";

export default function App() {
  // Catches an affiliate link like fitwithrajeev.com/?ref=ARPITA4F2 on
  // first load. Saved to localStorage (not just the URL) so the referral
  // survives even if the visitor books days later on a return visit — the
  // code rides along automatically whenever BookingWidget submits. Then the
  // ?ref= is stripped from the visible address bar so it doesn't linger in
  // a bookmark or a screenshot.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref && /^[A-Za-z0-9]{2,14}$/.test(ref)) {
      localStorage.setItem("fwr_ref", ref.toUpperCase());
      params.delete("ref");
      const clean =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : "") +
        window.location.hash;
      window.history.replaceState({}, "", clean);
    }
  }, []);

  return (
    <SelectionProvider>
      <div className="grain-overlay" />
      <div className="vignette" />
      <IntroOverlay />
      <ScrollProgress />
      <CursorGlow />
      <Nav />
      <main>
        <Beat id="confrontation" tone="confrontation">
          <Hero />
        </Beat>
        <Beat id="recognition" tone="recognition">
          <SymptomSelector />
        </Beat>
        <Beat id="human" tone="human">
          <About />
          <Manifesto />
          <Story />
        </Beat>
        <Beat id="evidence" tone="evidence">
          <Results />
          <Gallery />
          <Testimonials />
        </Beat>
        <Beat id="invitation" tone="invitation">
          <Programs />
          <FunWithFitness />
          <FAQ />
          <CTA />
        </Beat>
      </main>
      <Footer />
    </SelectionProvider>
  );
}
