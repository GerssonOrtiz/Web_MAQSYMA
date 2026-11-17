import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { useReducedMotion } from "framer-motion";
import { createIndustrialStage } from "./Hero3D/IndustrialStage";
import { createProductShowcase } from "./Hero3D/ProductShowcase";
import { createLightingRig } from "./Hero3D/LightingRig";
import { initHeroScrollTimeline } from "./Hero3D/CameraTimeline";
import CinemaOverlay from "./Hero3D/CinemaOverlay";

export default function Hero() {
  const rm = useReducedMotion();
  const scrollWrapperRef = useRef(null);
  const canvasContainerRef = useRef(null);

  // Active scene & scroll progress states for reactive UI
  const [activeScene, setActiveScene] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Mouse coordinates (normalized -1 to 1)
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Active scene ref for RAF access (avoids stale closure)
  const activeSceneRef = useRef(0);

  // WebGL context tracking
  const webglStateRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (rm) return;
    const { innerWidth, innerHeight } = window;
    // Map to normalized range [-1, 1]
    const normX = (e.clientX / innerWidth) * 2 - 1;
    const normY = -(e.clientY / innerHeight) * 2 + 1;
    mouseRef.current.targetX = normX;
    mouseRef.current.targetY = normY;
  }, [rm]);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.targetX = 0;
    mouseRef.current.targetY = 0;
  }, []);

  useEffect(() => {
    const container = canvasContainerRef.current;
    const scrollWrapper = scrollWrapperRef.current;
    if (!container || !scrollWrapper) return;

    // 1. THREE.JS SCENE SETUP
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06080a);
    scene.fog = new THREE.Fog(0x06080a, 65, 180);

    const fogConfig = [
      { near: 55, far: 160 },   // Escena 0 — nave entera visible
      { near: 45, far: 130 },   // Escena 1 — foco corto
      { near: 40, far: 115 },   // Escena 2 — foco corto
      { near: 65, far: 210 },   // Escena 3 — EPP necesita fondo despejado
    ];

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      250
    );
    camera.position.set(0, 2.2, 18);

    const renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
      antialias: true,
      alpha: false,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 2. INDUSTRIAL SCENE MODULES
    const stage = createIndustrialStage();
    scene.add(stage.group);

    const products = createProductShowcase();
    scene.add(products.group);

    const lighting = createLightingRig();
    scene.add(lighting.group);

    // 3. GSAP SCROLL TIMELINE
    const cameraTimeline = initHeroScrollTimeline({
      scrollContainer: scrollWrapper,
      camera,
      onSceneChange: (sceneIdx, progress) => {
        setActiveScene(sceneIdx);
        activeSceneRef.current = sceneIdx;  // ← keep ref in sync for RAF
      },
      onProgressUpdate: (progress) => {
        setScrollProgress(progress);
      },
    });

    // 4. RAF ANIMATION LOOP
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerping for independent responsiveness
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      // Update particles
      stage.updateParticles(elapsedTime);

      // Smooth fog transition based on active scene
      const targetFog = fogConfig[activeSceneRef.current] || fogConfig[0];
      if (scene.fog) {
        scene.fog.near += (targetFog.near - scene.fog.near) * 0.02;
        scene.fog.far  += (targetFog.far  - scene.fog.far)  * 0.02;
      }

      // Independent cursor effect on products
      products.updateCursorEffect(mouse.x, mouse.y);

      // Update camera positioning with scroll + cursor offset
      cameraTimeline.updateCameraFrame(mouse.x, mouse.y);

      // Update dynamic cursor light
      const currentZ = cameraTimeline.getCurrentZ();
      lighting.updateCursorLight(mouse.x, mouse.y, currentZ);

      renderer.render(scene, camera);
    };

    animate();

    // 5. RESIZE HANDLER
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // Store references for clean disposal
    webglStateRef.current = {
      renderer,
      scene,
      stage,
      products,
      lighting,
      cameraTimeline,
      handleResize,
    };

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);

      cameraTimeline.kill();
      stage.dispose();
      products.dispose();
      lighting.dispose();

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [rm]);

  return (
    <div
      ref={scrollWrapperRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full bg-[#06080a]"
      // 400vh enables high fidelity scroll trajectory through the 4 scenes
      style={{ height: "400vh" }}
    >
      {/* Sticky Fullscreen 3D Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Three.js Canvas Container */}
        <div ref={canvasContainerRef} className="absolute inset-0 h-full w-full" />

        {/* Ambient Film Vignette Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-radial-vignette opacity-70" />

        {/* 2D HUD / Typography & Cinematic Interactions Overlay */}
        <CinemaOverlay activeScene={activeScene} progress={scrollProgress} />
      </div>
    </div>
  );
}
