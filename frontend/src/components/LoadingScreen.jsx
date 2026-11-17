import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * LoadingScreen with cinematic brand animation:
 * 1. Starts prominently centered on the dark industrial backdrop with glow effects and progress indicators.
 * 2. Dynamically calculates the exact coordinates of the navbar logo anchor.
 * 3. Smoothly animates/flies into the navbar corner position.
 * 4. Fades out the loading backdrop, revealing the interactive 3D hero and full UI.
 */
export default function LoadingScreen({ onLoadingComplete }) {
  const [phase, setPhase] = useState("center"); // 'center' | 'fly' | 'done'
  const [targetRect, setTargetRect] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress counter animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const step = Math.floor(Math.random() * 18) + 10;
        return Math.min(100, prev + step);
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      // Find the navbar destination anchor
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

      // Small pause at 100% before transition
      const timer = setTimeout(() => {
        setPhase("fly");
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [progress]);

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

        {/* Center Progress HUD (fades out as logo flies) */}
        <motion.div
          animate={{
            opacity: phase === "fly" ? 0 : 1,
            scale: phase === "fly" ? 0.9 : 1,
          }}
          transition={{ duration: 0.3 }}
          className="absolute flex flex-col items-center space-y-4 pt-44"
        >
          {/* Progress bar */}
          <div className="h-1 w-48 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 via-accent to-cyan-400"
              style={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>

          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-white/60">
            <span className="text-cyan-400 font-bold">{progress}%</span>
            <span>INICIALIZANDO MAQSYMA</span>
          </div>
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
