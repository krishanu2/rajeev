import Nav from "./components/Nav";
import Hero from "./components/Hero";
import SymptomSelector from "./components/SymptomSelector";
import About from "./components/About";
import Story from "./components/Story";
import Results from "./components/Results";
import Testimonials from "./components/Testimonials";
import Programs from "./components/Programs";
import FunWithFitness from "./components/FunWithFitness";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import CursorGlow from "./components/CursorGlow";
import ScrollProgress from "./components/ScrollProgress";

export default function App() {
  return (
    <>
      <div className="grain-overlay" />
      <div className="vignette" />
      <ScrollProgress />
      <CursorGlow />
      <Nav />
      <main>
        <Hero />
        <SymptomSelector />
        <About />
        <Story />
        <Results />
        <Testimonials />
        <Programs />
        <FunWithFitness />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
