import React, { useEffect, useRef } from "react";

export default function SparkCanvas({ scene = 0 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = null;
    let isVisible = true;
    let width = (canvas.width = canvas.parentElement.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement.clientHeight || window.innerHeight);

    const onResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement.clientHeight || window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    // Cantidad de chispas según escena
    const particleCount = scene === 3 ? 20 : 65;
    const particles = [];

    // Colores cálidos y eléctricos de soldadura
    const colors = [
      "rgba(255, 200, 50, ",
      "rgba(255, 140, 20, ",
      "rgba(255, 240, 180, ",
      "rgba(0, 240, 255, ",
    ];

    const resetParticle = (p) => {
      // Origen de emisión (simula puesto de soldadura / centro de escena)
      const originX = width * (0.35 + Math.random() * 0.35);
      const originY = height * (0.55 + Math.random() * 0.25);
      
      p.x = originX;
      p.y = originY;
      p.vx = (Math.random() - 0.48) * 4.5;
      p.vy = -Math.random() * 5.5 - 1.5;
      p.gravity = 0.12 + Math.random() * 0.08;
      p.size = 1.0 + Math.random() * 2.2;
      p.alpha = 0.8 + Math.random() * 0.2;
      p.decay = 0.012 + Math.random() * 0.02;
      p.color = colors[Math.floor(Math.random() * colors.length)];
    };

    for (let i = 0; i < particleCount; i++) {
      const p = {};
      resetParticle(p);
      // Randomize initial progress
      p.alpha = Math.random();
      particles.push(p);
    }

    const render = () => {
      if (!isVisible) {
        animId = null;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.y > height || p.x < 0 || p.x > width) {
          resetParticle(p);
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.max(0, p.alpha)})`;
        ctx.shadowBlur = p.size * 4;
        ctx.shadowColor = p.color === colors[3] ? "#00f0ff" : "#ffb703";
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animId) {
          animId = requestAnimationFrame(render);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(canvas);

    animId = requestAnimationFrame(render);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
    };
  }, [scene]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10 h-full w-full opacity-80"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
