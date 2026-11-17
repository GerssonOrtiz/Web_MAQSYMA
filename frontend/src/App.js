import { Component, useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import Manifesto from "./components/Manifesto";
import Categories from "./components/Categories";
import FeaturedMachines from "./components/FeaturedMachines";
import Selector from "./components/Selector";
import Applications from "./components/Applications";
import TechInfo from "./components/TechInfo";
import Quote from "./components/Quote";
import Footer from "./components/Footer";
import LoadingScreen from "./components/LoadingScreen";
import { initSmoothScroll } from "./lib/scroll";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: false };
  }
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-ink px-6 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-mist">
            MAQSYMA — la página no se pudo mostrar. Recarga para reintentar.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    // Force instant scroll restoration to top on refresh
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    const destroy = initSmoothScroll();
    return typeof destroy === "function" ? destroy : undefined;
  }, []);

  return (
    <ErrorBoundary>
      <div className="grain min-h-screen overflow-x-clip bg-ink font-sans text-fog">
        <LoadingScreen
          isReady={heroReady}
          onLoadingComplete={() => setLoadingComplete(true)}
        />
        <Navbar />
        <main>
          <Hero onReady={() => setHeroReady(true)} />
          <Marquee />
          <Manifesto />
          <Categories />
          <FeaturedMachines />
          <Selector />
          <Applications />
          <TechInfo />
          <Quote />
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
