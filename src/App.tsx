import Nav from "./components/Nav";
import Hero from "./components/Hero";
import SymptomSelector from "./components/SymptomSelector";
import About from "./components/About";
import Manifesto from "./components/Manifesto";
import Story from "./components/Story";
import Results from "./components/Results";
import Testimonials from "./components/Testimonials";
import Programs from "./components/Programs";
import FunWithFitness from "./components/FunWithFitness";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import CursorGlow from "./components/CursorGlow";
import ScrollProgress from "./components/ScrollProgress";
import IntroOverlay from "./components/IntroOverlay";
import Beat from "./components/Beat";
import { SelectionProvider } from "./context/SelectionContext";

export default function App() {
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
          <Testimonials />
        </Beat>
        <Beat id="invitation" tone="invitation">
          <Programs />
          <FunWithFitness />
          <CTA />
        </Beat>
      </main>
      <Footer />
    </SelectionProvider>
  );
}
