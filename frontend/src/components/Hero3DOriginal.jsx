import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { useReducedMotion } from "framer-motion";
import { createIndustrialStage } from "./Hero3D/IndustrialStage";
import { createProductShowcase } from "./Hero3D/ProductShowcase";
import { createLightingRig } from "./Hero3D/LightingRig";
import { initHeroScrollTimeline } from "./Hero3D/CameraTimeline";
import CinemaOverlay from "./Hero3D/CinemaOverlay";

const PRODUCT_IMAGES = [
  "/assets/hero/products/warrior-500i/front.webp",
  "/assets/hero/products/rustler-em455i/front.webp",
  "/assets/hero/products/rogue-em210/front.webp",
  "/assets/hero/products/epp-zone/team.webp",
  "/assets/hero/products/epp-zone/front.webp",
];

const preloadTextures = (paths) => {
  const loader = new THREE.TextureLoader();
  return Promise.all(
    paths.map(
      (p) =>
        new Promise((resolve) => {
          loader.load(
            p,
            (tex) => {
              tex.colorSpace = THREE.SRGBColorSpace;
              tex.minFilter = THREE.LinearMipmapLinearFilter;
              tex.generateMipmaps = true;
              resolve({ path: p, texture: tex });
            },
            undefined,
            () => resolve({ path: p, texture: null })
          );
        })
    )
  );
};

const isLowEndDevice = () => {
  if (typeof navigator === "undefined") return false;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;
  return cores <= 4 || memory <= 2;
};

export default function Hero({ onReady }) {
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

    let cancelled = false;
    let cleanupFn = () => {};

    preloadTextures(PRODUCT_IMAGES).then((loaded) => {
      if (cancelled) return;

      const textureMap = {};
      loaded.forEach((item) => {
        if (item.texture) textureMap[item.path] = item.texture;
      });

      if (onReady) onReady();

      // 1. THREE.JS SCENE SETUP
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x06080a);
      scene.fog = new THREE.Fog(0x06080a, 50, 150);

      // Compressed fog configurations for sharper depth culling & fragment discarding
      const fogConfig = [
        { near: 50, far: 150 }, // Escena 0 — Warrior + nave
        { near: 38, far: 100 }, // Escena 1 — Rustler en foco
        { near: 32, far: 95 },  // Escena 2 — Rogue en foco
        { near: 60, far: 200 }, // Escena 3 — EPP
      ];

      const camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        250
      );
      camera.position.set(0, 2.2, 18);

      const lowEnd = isLowEndDevice();

      const renderer = new THREE.WebGLRenderer({
        powerPreference: "high-performance",
        antialias: !lowEnd,
        alpha: false,
      });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(
        lowEnd
          ? Math.min(window.devicePixelRatio, 1.0)
          : Math.min(window.devicePixelRatio, 2.0)
      );
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.appendChild(renderer.domElement);

      // 2. INDUSTRIAL SCENE MODULES
      const stage = createIndustrialStage();
      scene.add(stage.group);

      const products = createProductShowcase(textureMap);
      scene.add(products.group);

      const lighting = createLightingRig();
      scene.add(lighting.group);

      // 3. GSAP SCROLL TIMELINE
      const cameraTimeline = initHeroScrollTimeline({
        scrollContainer: scrollWrapper,
        camera,
        onSceneChange: (sceneIdx, progress) => {
          setActiveScene(sceneIdx);
          activeSceneRef.current = sceneIdx;
          if (lighting.updateActiveScene) lighting.updateActiveScene(sceneIdx);
        },
        onProgressUpdate: (progress) => {
          setScrollProgress(progress);
        },
      });

      // 4. RAF ANIMATION LOOP WITH THROTTLING
      let animationFrameId;
      let clock = new THREE.Clock();

      // Visibility API & Intersection Observer
      let isVisible = !document.hidden;
      const onVisibility = () => {
        isVisible = !document.hidden;
      };
      document.addEventListener("visibilitychange", onVisibility);

      let isInViewport = true;
      const observer = new IntersectionObserver(
        ([entry]) => {
          isInViewport = entry.isIntersecting;
        },
        { threshold: 0.01 }
      );
      observer.observe(container);

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        // Skip rendering when tab is inactive or hero is off-viewport
        if (!isVisible || !isInViewport) return;

        const delta = clock.getDelta();
        const elapsedTime = clock.getElapsedTime();

        // Smooth mouse lerping
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

      webglStateRef.current = {
        renderer,
        scene,
        stage,
        products,
        lighting,
        cameraTimeline,
        handleResize,
      };

      cleanupFn = () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener("resize", handleResize);
        document.removeEventListener("visibilitychange", onVisibility);
        observer.disconnect();

        cameraTimeline.kill();
        stage.dispose();
        products.dispose();
        lighting.dispose();

        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };
    });

    return () => {
      cancelled = true;
      cleanupFn();
    };
  }, [rm, onReady]);

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
