import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Cinematographic Camera & Scroll Progression Director.
 * Coordinates GSAP ScrollTrigger with Three.js camera position and lookAt vectors
 * traversing the 4 scenes:
 * 
 * Scene 01 (0.00 - 0.22): Entrada al Espacio Industrial (Frontal approach to Warrior)
 * Scene 02 (0.22 - 0.50): Potencia y Tecnología (Warrior focus -> smooth glide to Rustler)
 * Scene 03 (0.50 - 0.78): Soluciones para Cada Profesional (Rogue EM210 PRO inspection)
 * Scene 04 (0.78 - 1.00): Ecosistema MAQSYMA (Wide pullback, categories showcase)
 */
export function initHeroScrollTimeline({
  scrollContainer,
  camera,
  onSceneChange,
  onProgressUpdate,
}) {
  // Camera trajectory keyframe targets
  const waypoints = [
    // 0: Entrance - looking down the hall
    { pos: new THREE.Vector3(0, 2.2, 18), look: new THREE.Vector3(0, 0.4, 0), scene: 0 },
    // 1: Warrior 500i Close-up
    { pos: new THREE.Vector3(0, 1.2, 8.5), look: new THREE.Vector3(0, 0.5, 0), scene: 1 },
    // 2: Transition glide towards Rustler
    { pos: new THREE.Vector3(4.8, 1.8, -12), look: new THREE.Vector3(6.5, 0.6, -20), scene: 1 },
    // 3: Rustler EM455i Focus
    { pos: new THREE.Vector3(8.5, 1.1, -19), look: new THREE.Vector3(9.0, 0.5, -26), scene: 1 },
    // 4: Smooth pan to Rogue EM210 PRO
    { pos: new THREE.Vector3(-3.0, 1.6, -38), look: new THREE.Vector3(-6.0, 0.4, -48), scene: 2 },
    // 5: Rogue EM210 PRO Intimate inspection
    { pos: new THREE.Vector3(-7.2, 0.9, -47.5), look: new THREE.Vector3(-8.5, 0.3, -54), scene: 2 },
    // 6: Camera rises & pulls back towards Ecosystem
    { pos: new THREE.Vector3(-2.0, 4.5, -66), look: new THREE.Vector3(0, 0.5, -84), scene: 3 },
    // 7: Full Ecosystem Grand Wide Angle
    { pos: new THREE.Vector3(0, 6.2, -74), look: new THREE.Vector3(0, 0.2, -92), scene: 3 },
  ];

  // Animated interpolator proxy
  const proxy = {
    progress: 0,
    camX: waypoints[0].pos.x,
    camY: waypoints[0].pos.y,
    camZ: waypoints[0].pos.z,
    lookX: waypoints[0].look.x,
    lookY: waypoints[0].look.y,
    lookZ: waypoints[0].look.z,
  };

  const currentLookAt = new THREE.Vector3(proxy.lookX, proxy.lookY, proxy.lookZ);

  // Build the master continuous GSAP timeline tied to scrollContainer
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scrollContainer,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.2,
      onUpdate: (self) => {
        const p = self.progress;
        if (onProgressUpdate) onProgressUpdate(p);

        let activeScene = 0;
        if (p < 0.24) activeScene = 0;
        else if (p < 0.52) activeScene = 1;
        else if (p < 0.78) activeScene = 2;
        else activeScene = 3;

        if (onSceneChange) onSceneChange(activeScene, p);
      },
    },
  });

  // Staged linear tweening between waypoints across the 0..1 timeline duration
  const segments = waypoints.length - 1;
  const segDur = 1 / segments;

  for (let i = 0; i < segments; i++) {
    const nextWp = waypoints[i + 1];
    tl.to(
      proxy,
      {
        camX: nextWp.pos.x,
        camY: nextWp.pos.y,
        camZ: nextWp.pos.z,
        lookX: nextWp.look.x,
        lookY: nextWp.look.y,
        lookZ: nextWp.look.z,
        ease: "power1.inOut",
        duration: segDur,
      },
      i * segDur
    );
  }

  return {
    timeline: tl,
    updateCameraFrame: (cursorOffsetX = 0, cursorOffsetY = 0) => {
      // Independent subtle cursor offset applied to camera position
      camera.position.x = proxy.camX + cursorOffsetX * 0.45;
      camera.position.y = proxy.camY + cursorOffsetY * 0.35;
      camera.position.z = proxy.camZ;

      currentLookAt.set(
        proxy.lookX + cursorOffsetX * 0.15,
        proxy.lookY + cursorOffsetY * 0.1,
        proxy.lookZ
      );
      camera.lookAt(currentLookAt);
    },
    getCurrentZ: () => proxy.camZ,
    kill: () => {
      tl.kill();
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
    },
  };
}
