import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Cinematographic Camera & Scroll Progression Director.
 * Coordinates GSAP ScrollTrigger with Three.js camera position and lookAt vectors
 * traversing the 4 focal zones as specified in mejora.md:
 * 
 * Scene 0 (0.00 - 0.25): Entrada a la Nave & Descubrimiento de ESAB Warrior 500i CC/CV
 * Scene 1 (0.25 - 0.50): Transición fluida & Enfoque a ESAB Rustler EM455i
 * Scene 2 (0.50 - 0.75): Navegación hacia zona de taller & ESAB Rogue EM210 PRO
 * Scene 3 (0.75 - 1.00): Apertura espacial hacia Zona de Equipos de Protección Personal (EPP)
 */
export function initHeroScrollTimeline({
  scrollContainer,
  camera,
  onSceneChange,
  onProgressUpdate,
}) {
  // Camera trajectory keyframe targets: smooth forward progression through the industrial nave
  const waypoints = [
    // 0: Entrance - looking down the high-bay nave
    { pos: new THREE.Vector3(0, 2.2, 19), look: new THREE.Vector3(0, 0.45, 0), scene: 0 },
    // 1: Warrior 500i Close inspection
    { pos: new THREE.Vector3(0, 1.2, 8.5), look: new THREE.Vector3(0, 0.45, 0), scene: 0 },
    // 2: Smooth gliding transition towards Rustler (right side bay)
    { pos: new THREE.Vector3(4.8, 1.8, -12), look: new THREE.Vector3(7.0, 0.5, -22), scene: 1 },
    // 3: Rustler EM455i Workstation focus
    { pos: new THREE.Vector3(8.5, 1.15, -18.5), look: new THREE.Vector3(9.0, 0.4, -26), scene: 1 },
    // 4: Smooth transition across nave towards Rogue EM210 PRO (left side bay)
    { pos: new THREE.Vector3(-2.8, 1.7, -38), look: new THREE.Vector3(-6.5, 0.4, -48), scene: 2 },
    // 5: Rogue EM210 PRO Workshop station inspection
    { pos: new THREE.Vector3(-7.2, 0.95, -47.0), look: new THREE.Vector3(-8.5, 0.25, -54), scene: 2 },
    // 6: Camera glides centrally towards the grand EPP exhibition pavilion
    { pos: new THREE.Vector3(-1.5, 2.6, -72), look: new THREE.Vector3(0, 0.6, -88), scene: 3 },
    // 7: EPP Showcase front-center cinematic view
    { pos: new THREE.Vector3(0, 1.4, -79.5), look: new THREE.Vector3(0, 0.6, -88), scene: 3 },
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
        if (p < 0.25) activeScene = 0;
        else if (p < 0.50) activeScene = 1;
        else if (p < 0.75) activeScene = 2;
        else activeScene = 3;

        if (onSceneChange) onSceneChange(activeScene, p);
      },
    },
  });

  // Staged smooth tweening between waypoints across the 0..1 timeline duration
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
      // Subtle cursor parallax on camera frame
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
