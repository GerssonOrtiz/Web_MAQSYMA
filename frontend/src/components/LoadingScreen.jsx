import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * LoadingScreen with cinematic brand animation:
 * 1. Shows minimalist pulsating neon dots and brand tag (without misleading percentage bar).
 * 2. Waits for both a minimum presentation time AND hero ready signal (textures preloaded).
 * 3. Dynamically calculates the exact coordinates of the navbar logo anchor.
 * 4. Smoothly animates/flies into the navbar corner position.
 * 5. Fades out the loading backdrop, revealing the interactive 3D hero and full UI.
 */
export default function LoadingScreen({ onLoadingComplete, isReady = true }) {
  const [phase, setPhase] = useState("center"); // 'center' | 'fly' | 'done'
  const [targetRect, setTargetRect] = useState(null);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    // Elegant minimum duration of 1.4s so the brand animation is appreciated
    const minTimer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 1400);

    return () => clearTimeout(minTimer);
  }, []);

  useEffect(() => {
    // When both minimum display time elapsed AND hero assets are ready
    if (minTimeElapsed && isReady && phase === "center") {
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

      const timer = setTimeout(() => {
        setPhase("fly");
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [minTimeElapsed, isReady, phase]);

  const handleFlyComplete = () => {
    setPhase("done");
    if (onLoadingComplete) onLoadingComplete();
  };

  if (phase === "done") return null;

  // Center coordinates
  const centerX = typeof window !== "undefined" ? window.innerWidth / 2 : 500;
  const centerY = typeof window !== "undefined" ? window.innerHeight / 2 : 400;

  return (
    <AnimatePresence>
      <motion.div
        key="loader-backdrop"
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === "fly" ? 0 : 1 }}
        transition={{ duration: 0.65, delay: phase === "fly" ? 0.35 : 0 }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#06080a] select-none"
      >
        {/* Subtle radial glow in background */}
        <div className="pointer-events-none absolute h-96 w-96 rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="pointer-events-none absolute h-64 w-64 rounded-full bg-amber-500/10 blur-[80px]" />

        {/* Minimalist Brand Dots & Tag — No fake progress bar */}
        <motion.div
          animate={{
            opacity: phase === "fly" ? 0 : 1,
            scale: phase === "fly" ? 0.9 : 1,
          }}
          transition={{ duration: 0.3 }}
          className="absolute flex flex-col items-center space-y-6 pt-52"
        >
          {/* Minimalist pulsing dots */}
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-cyan-400"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.25, 0.8] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Minimalist brand text */}
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/40">
            MAQSYMA · INDUSTRIAL
          </span>
        </motion.div>
      </motion.div>

      {/* The Animated Logo: Center -> Navbar Top-Left Corner */}
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
          phase === "center"
            ? {
                left: centerX,
                top: centerY,
                x: "-50%",
                y: "-50%",
                scale: 1.4,
                opacity: 1,
              }
            : targetRect
            ? {
                left: targetRect.x,
                top: targetRect.y,
                x: "-50%",
                y: "-50%",
                scale: 0.55,
                opacity: 0, // Fades right as it aligns over the real navbar logo
              }
            : {
                opacity: 0,
              }
        }
        transition={
          phase === "fly"
            ? {
                duration: 0.75,
                ease: [0.22, 1, 0.36, 1], // Smooth cinematic bezier
              }
            : {
                duration: 0.5,
                ease: "easeOut",
              }
        }
        onAnimationComplete={() => {
          if (phase === "fly") handleFlyComplete();
        }}
        className="pointer-events-none fixed z-[110]"
      >
        <img
          src="/assets/Logo_MAQSYMA.png"
          alt="MAQSYMA Industrial"
          className="h-16 md:h-20 w-auto object-contain drop-shadow-[0_0_25px_rgba(0,240,255,0.35)]"
        />
      </motion.div>
    </AnimatePresence>
  );
}
