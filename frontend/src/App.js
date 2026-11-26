import { Component, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import Manifesto from "./components/Manifesto";
import Nosotros from "./components/Nosotros";
import Categories from "./components/Categories";
import FeaturedMachines from "./components/FeaturedMachines";
import CatalogStore from "./components/CatalogStore";
import Applications from "./components/Applications";
import TechInfo from "./components/TechInfo";
import Quote from "./components/Quote";
import Footer from "./components/Footer";
import TrustBar from "./components/TrustBar";
import WhatsAppFAB from "./components/WhatsAppFAB";
import LoadingScreen from "./components/LoadingScreen";
import { initSmoothScroll, scrollToSection } from "./lib/scroll";

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

function RouteScrollManager() {
  const location = useLocation();

  useEffect(() => {
    const targetSection = location.state?.scrollTo;
    if (targetSection) {
      const timer = setTimeout(() => scrollToSection(targetSection), 120);
      return () => clearTimeout(timer);
    }
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.state]);

  return null;
}

function HomePage({ onHeroReady }) {
  return (
    <main>
      <Hero onReady={onHeroReady} />
      <Marquee />
      <TrustBar />
      <Manifesto />
      <Nosotros />
      <Categories />
      <FeaturedMachines />
      <Applications />
      <TechInfo />
      <Quote />
    </main>
  );
}

function CatalogPage({ onReady }) {
  useEffect(() => {
    onReady();
  }, [onReady]);

  return (
    <main>
      <CatalogStore />
      <Quote />
    </main>
  );
}

export default function App() {
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    const destroy = initSmoothScroll();
    return typeof destroy === "function" ? destroy : undefined;
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <RouteScrollManager />
        <div className="grain min-h-screen overflow-x-clip bg-ink font-sans text-fog">
          <LoadingScreen
            isReady={heroReady || loadingComplete}
            onLoadingComplete={() => setLoadingComplete(true)}
          />
          <Navbar />
          <Routes>
            <Route
              path="/"
              element={<HomePage onHeroReady={() => setHeroReady(true)} />}
            />
            <Route
              path="/catalogo"
              element={<CatalogPage onReady={() => setHeroReady(true)} />}
            />
          </Routes>
          <Footer />
          <WhatsAppFAB />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
