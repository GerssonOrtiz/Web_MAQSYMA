import * as THREE from "three";

/**
 * Creates the cinematic lighting rig for the industrial 3D experience.
 * Incorporates:
 * - Ambient base tone
 * - Hemisphere industrial fill (sky slate / ground metallic charcoal)
 * - Three dedicated key spotlights targeted at podiums
 * - Reactive cursor fill light (for dynamic highlights)
 */
export function createLightingRig() {
  const group = new THREE.Group();

  // 1. Ambient soft baseline
  const ambientLight = new THREE.AmbientLight(0x0e1319, 1.8);
  group.add(ambientLight);

  // 2. Industrial Hemisphere (cyan-tinted cold roof / dark ground)
  const hemiLight = new THREE.HemisphereLight(0x1a2936, 0x05070a, 1.2);
  hemiLight.position.set(0, 20, 0);
  group.add(hemiLight);

  // 3. Key Spotlights for each Station
  // Spotlight 1: Warrior 500i
  const spotWarrior = new THREE.SpotLight(0xffffff, 4.5);
  spotWarrior.position.set(4, 12, 10);
  spotWarrior.target.position.set(0, 0, 0);
  spotWarrior.angle = Math.PI / 4.5;
  spotWarrior.penumbra = 0.6;
  group.add(spotWarrior);
  group.add(spotWarrior.target);

  // Rim back light for Warrior
  const rimWarrior = new THREE.DirectionalLight(0x00f0ff, 2.2);
  rimWarrior.position.set(-6, 8, -6);
  group.add(rimWarrior);

  // Spotlight 2: Rustler EM455i
  const spotRustler = new THREE.SpotLight(0xffe8d0, 4.2);
  spotRustler.position.set(14, 12, -18);
  spotRustler.target.position.set(9, 0, -26);
  spotRustler.angle = Math.PI / 4.5;
  spotRustler.penumbra = 0.6;
  group.add(spotRustler);
  group.add(spotRustler.target);

  // Spotlight 3: Rogue EM210 PRO
  const spotRogue = new THREE.SpotLight(0xd5eaff, 4.0);
  spotRogue.position.set(-4, 12, -46);
  spotRogue.target.position.set(-8.5, 0, -54);
  spotRogue.angle = Math.PI / 4.5;
  spotRogue.penumbra = 0.6;
  group.add(spotRogue);
  group.add(spotRogue.target);

  // Spotlight 4: Ecosystem Center
  const spotEco = new THREE.SpotLight(0x00e5ff, 3.5);
  spotEco.position.set(0, 16, -72);
  spotEco.target.position.set(0, 0, -88);
  spotEco.angle = Math.PI / 3.8;
  spotEco.penumbra = 0.7;
  group.add(spotEco);
  group.add(spotEco.target);

  // Dynamic reactive cursor light
  const cursorLight = new THREE.PointLight(0x00f0ff, 1.5, 30);
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
      rimWarrior.dispose();
      spotRustler.dispose();
      spotRogue.dispose();
      spotEco.dispose();
      cursorLight.dispose();
    },
  };
}
