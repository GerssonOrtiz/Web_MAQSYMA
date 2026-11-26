import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * LoadingScreen — Intro Cinematográfica de Marca MAQSYMA
 *
 * El preload NO es un indicador de carga. Es la tarjeta de presentación
 * de MAQSYMA. Secuencia de 7 fases:
 *
 * 0.0s  NEGRO     — Pantalla oscura elegante
 * 0.4s  LOGO      — Logo emerge con fade-in y escala
 * 1.2s  TAGLINE   — Texto "MAQSYMA · INDUSTRIAL" aparece
 * 2.0s  AMBIENT   — Glow ambiental breathing (cyan + ámbar)
 * 3.0s  DOTS      — Los 3 dots entran como cierre decorativo (NO indicador de carga)
 * Ready FLY       — Logo vuela cinematográficamente al navbar
 * Done  DONE      — Pantalla removida, hero visible
 */

const TIMELINE = {
  LOGO_IN:    400,   // ms hasta mostrar logo
  TAGLINE_IN: 1200,  // ms hasta tagline
  AMBIENT_IN: 2000,  // ms hasta efecto ambiental
  DOTS_IN:    3000,  // ms hasta mostrar los 3 dots
  FLY_DELAY:  350,   // ms extra para ver los dots antes de volar
};

export default function LoadingScreen({ onLoadingComplete, isReady = true }) {
  const [phase, setPhase] = useState("black"); // black | logo | tagline | ambient | dots | fly | done
  const [dotsVisible, setDotsVisible] = useState(false);
  const [presentationDone, setPresentationDone] = useState(false);
  const [targetRect, setTargetRect] = useState(null);

  // Secuencia cinematográfica de presentación
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("logo"),    TIMELINE.LOGO_IN),
      setTimeout(() => setPhase("tagline"), TIMELINE.TAGLINE_IN),
      setTimeout(() => setPhase("ambient"), TIMELINE.AMBIENT_IN),
      setTimeout(() => {
        setPhase("dots");
        setDotsVisible(true);       // Dots aparecen a los 3 segundos
        setPresentationDone(true);  // Presentación completada
      }, TIMELINE.DOTS_IN),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Iniciar vuelo cuando presentación termine Y assets estén listos
  useEffect(() => {
    if (presentationDone && isReady && phase === "dots") {
      const flyTimer = setTimeout(() => {
        const anchor = document.getElementById("navbar-logo-anchor");
        if (anchor) {
          const rect = anchor.getBoundingClientRect();
          setTargetRect({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            width: rect.width || 120,
            height: rect.height || 36,
          });
        }
        setPhase("fly");
      }, TIMELINE.FLY_DELAY);
      return () => clearTimeout(flyTimer);
    }
  }, [presentationDone, isReady, phase]);

  const handleFlyComplete = () => {
    setPhase("done");
    if (onLoadingComplete) onLoadingComplete();
  };

  if (phase === "done") return null;

  const centerX = typeof window !== "undefined" ? window.innerWidth / 2 : 500;
  const centerY = typeof window !== "undefined" ? window.innerHeight / 2 : 400;

  // Fases que muestran el backdrop
  const showBackdrop = phase !== "done";
  // El backdrop se desvanece solo en fase "fly"
  const backdropOpacity = phase === "fly" ? 0 : 1;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="loader-backdrop"
        initial={{ opacity: 1 }}
        animate={{ opacity: backdropOpacity }}
        transition={{ duration: 0.7, delay: phase === "fly" ? 0.3 : 0 }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#06080a] select-none"
      >
        {/* Glow ambiental — aparece en fase "ambient" y "dots" */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "ambient" || phase === "dots" || phase === "fly" ? 1 : 0 }}
          transition={{ duration: 1.2 }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          {/* Cyan glow — izquierda */}
          <div
            className="absolute h-80 w-80 rounded-full bg-cyan-500/10 blur-[120px] animate-breathe"
            style={{ left: "35%", top: "40%" }}
          />
          {/* Ámbar glow — derecha */}
          <div
            className="absolute h-64 w-64 rounded-full bg-amber-500/8 blur-[100px] animate-breathe"
            style={{ right: "35%", top: "45%", animationDelay: "1.5s" }}
          />
        </motion.div>

        {/* Tagline y Dots — bloque inferior al logo */}
        <motion.div
          animate={{
            opacity: phase === "fly" ? 0 : 1,
            scale: phase === "fly" ? 0.92 : 1,
          }}
          transition={{ duration: 0.3 }}
          className="absolute flex flex-col items-center space-y-5"
          style={{ top: "calc(50% + 72px)" }}
        >
          {/* Tagline — aparece en fase tagline+ */}
          <AnimatePresence>
            {(phase === "tagline" || phase === "ambient" || phase === "dots") && (
              <motion.span
                key="tagline"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="font-mono text-[9px] uppercase tracking-[0.35em] text-white/35"
              >
                MAQSYMA · INDUSTRIAL
              </motion.span>
            )}
          </AnimatePresence>

          {/* Dots — aparecen a los 3 segundos como cierre decorativo */}
          <AnimatePresence>
            {dotsVisible && phase !== "fly" && (
              <motion.div
                key="dots"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-2"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-cyan-400"
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scale: [0.8, 1.25, 0.8],
                    }}
                    transition={{
                      // Entrada inicial
                      opacity: { duration: 1.2, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" },
                      scale: { duration: 1.2, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" },
                    }}
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Línea decorativa inferior — aparece con tagline */}
        <AnimatePresence>
          {(phase === "tagline" || phase === "ambient" || phase === "dots") && (
            <motion.div
              key="bottom-line"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-10 left-1/2 h-px w-16 origin-center bg-white/15"
              style={{ translateX: "-50%" }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Logo animado: Centro → Navbar */}
      <motion.div
        key="flying-logo"
        initial={{
          position: "fixed",
          left: centerX,
          top: centerY,
          x: "-50%",
          y: "-50%",
          scale: 1.4,
          opacity: 0,
        }}
        animate={
          phase === "black"
            ? {
                left: centerX,
                top: centerY,
                x: "-50%",
                y: "-50%",
                scale: 1.4,
                opacity: 0,
              }
            : phase === "logo" || phase === "tagline" || phase === "ambient" || phase === "dots"
            ? {
                left: centerX,
                top: centerY,
                x: "-50%",
                y: "-50%",
                scale: 1.4,
                opacity: 1,
              }
            : phase === "fly" && targetRect
            ? {
                left: targetRect.x,
                top: targetRect.y,
                x: "-50%",
                y: "-50%",
                scale: 0.55,
                opacity: 0,
              }
            : { opacity: 0 }
        }
        transition={
          phase === "logo"
            ? { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
            : phase === "fly"
            ? { duration: 0.75, ease: [0.22, 1, 0.36, 1] }
            : { duration: 0.5, ease: "easeOut" }
        }
        onAnimationComplete={() => {
          if (phase === "fly") handleFlyComplete();
        }}
        className="pointer-events-none fixed z-[110]"
      >
        {/* Drop shadow glow que pulsa suavemente */}
        <img
          src="/assets/Logo_MAQSYMA.png"
          alt="MAQSYMA Industrial"
          className="h-16 md:h-20 w-auto object-contain drop-shadow-[0_0_30px_rgba(0,229,255,0.3)]"
        />
      </motion.div>
    </AnimatePresence>
  );
}
