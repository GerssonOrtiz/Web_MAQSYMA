import * as THREE from "three";

/**
 * Creates the cinematic lighting rig for the industrial 3D experience.
 * Enhanced to provide high contrast, vivid machine illumination (no dark photos)
 * and rich volumetric workshop reflections.
 */
export function createLightingRig() {
  const group = new THREE.Group();

  // 1. Ambient baseline
  const ambientLight = new THREE.AmbientLight(0x222b35, 2.8);
  group.add(ambientLight);

  // 2. Workshop Hemisphere Light (warm ceiling / cool reflective ground)
  const hemiLight = new THREE.HemisphereLight(0x3a4c5e, 0x14181f, 2.2);
  hemiLight.position.set(0, 24, 0);
  group.add(hemiLight);

  // 3. Key Spotlights dedicated directly onto each 3D product showcase
  // Spotlight 1: Warrior 500i
  const spotWarrior = new THREE.SpotLight(0xffffff, 8.5);
  spotWarrior.position.set(3, 10, 12);
  spotWarrior.target.position.set(0, 0.5, 0);
  spotWarrior.angle = Math.PI / 4;
  spotWarrior.penumbra = 0.5;
  group.add(spotWarrior);
  group.add(spotWarrior.target);

  // Front fill for Warrior
  const frontFillWarrior = new THREE.DirectionalLight(0xffffff, 2.5);
  frontFillWarrior.position.set(0, 4, 15);
  group.add(frontFillWarrior);

  // Spotlight 2: Rustler EM455i
  const spotRustler = new THREE.SpotLight(0xfff3e3, 8.0);
  spotRustler.position.set(13, 11, -16);
  spotRustler.target.position.set(9, 0.4, -26);
  spotRustler.angle = Math.PI / 4;
  spotRustler.penumbra = 0.5;
  group.add(spotRustler);
  group.add(spotRustler.target);

  const frontFillRustler = new THREE.DirectionalLight(0xffffff, 2.2);
  frontFillRustler.position.set(9, 4, -14);
  group.add(frontFillRustler);

  // Spotlight 3: Rogue EM210 PRO
  const spotRogue = new THREE.SpotLight(0xe8f4ff, 7.8);
  spotRogue.position.set(-5, 10, -44);
  spotRogue.target.position.set(-8.5, 0.2, -54);
  spotRogue.angle = Math.PI / 4;
  spotRogue.penumbra = 0.5;
  group.add(spotRogue);
  group.add(spotRogue.target);

  const frontFillRogue = new THREE.DirectionalLight(0xffffff, 2.0);
  frontFillRogue.position.set(-8.5, 4, -42);
  group.add(frontFillRogue);

  // Spotlight 4: Ecosystem Center
  const spotEco = new THREE.SpotLight(0x00f0ff, 5.0);
  spotEco.position.set(0, 16, -72);
  spotEco.target.position.set(0, 0, -88);
  spotEco.angle = Math.PI / 3.8;
  spotEco.penumbra = 0.6;
  group.add(spotEco);
  group.add(spotEco.target);

  // Dynamic reactive cursor light
  const cursorLight = new THREE.PointLight(0x00f0ff, 2.8, 35);
  cursorLight.position.set(0, 2, 8);
  group.add(cursorLight);

  return {
    group,
    updateCursorLight: (normMouseX, normMouseY, currentCameraZ) => {
      cursorLight.position.x = normMouseX * 12;
      cursorLight.position.y = normMouseY * 6 + 1;
      cursorLight.position.z = currentCameraZ - 4;
    },
    dispose: () => {
      ambientLight.dispose();
      hemiLight.dispose();
      spotWarrior.dispose();
      frontFillWarrior.dispose();
      spotRustler.dispose();
      frontFillRustler.dispose();
      spotRogue.dispose();
      frontFillRogue.dispose();
      spotEco.dispose();
      cursorLight.dispose();
    },
  };
}
