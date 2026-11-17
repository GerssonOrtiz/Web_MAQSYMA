import * as THREE from "three";

/**
 * Creates the cinematic industrial lighting rig for MAQSYMA Hero Showroom.
 * Designed with high contrast, crisp key spotlights and rich architectural fill:
 * - Spotlights for each of the 4 commercial zones:
 *   1. ESAB Warrior 500i
 *   2. ESAB Rustler EM455i
 *   3. ESAB Rogue EM210 PRO
 *   4. Zona EPP (Seguridad Industrial)
 * - Industrial warm high-bay hemisphere light
 * - Volumetric colored side rim accents
 * - Responsive interactive cursor light
 */
export function createLightingRig() {
  const group = new THREE.Group();

  // 1. Ambient baseline
  const ambientLight = new THREE.AmbientLight(0x222b35, 3.0);
  group.add(ambientLight);

  // 2. Workshop Hemisphere Light (warm ceiling daylight / cool reflective ground)
  const hemiLight = new THREE.HemisphereLight(0x40556c, 0x181e26, 2.4);
  hemiLight.position.set(0, 24, 0);
  group.add(hemiLight);

  // 3. Main Industrial Nave Directional Sunbeam / Skylight Light
  const skylightBeam = new THREE.DirectionalLight(0xeef6ff, 1.8);
  skylightBeam.position.set(-6, 26, 10);
  group.add(skylightBeam);

  // 4. Spotlights dedicated to the 4 showcase zones:

  // --- Zone 1: Warrior 500i (Cyan / Industrial White) ---
  const spotWarrior = new THREE.SpotLight(0xffffff, 9.0);
  spotWarrior.position.set(3.5, 11, 13);
  spotWarrior.target.position.set(0, 0.5, 0);
  spotWarrior.angle = Math.PI / 4;
  spotWarrior.penumbra = 0.5;
  group.add(spotWarrior);
  group.add(spotWarrior.target);

  const frontFillWarrior = new THREE.DirectionalLight(0xffffff, 2.6);
  frontFillWarrior.position.set(0, 4, 16);
  group.add(frontFillWarrior);

  const rimWarrior = new THREE.PointLight(0x00f0ff, 2.4, 25);
  rimWarrior.position.set(-5, 3, -3);
  group.add(rimWarrior);

  // --- Zone 2: Rustler EM455i (Amber / Golden Warm) ---
  const spotRustler = new THREE.SpotLight(0xfff3e3, 8.8);
  spotRustler.position.set(13.5, 11, -15);
  spotRustler.target.position.set(9.0, 0.4, -26);
  spotRustler.angle = Math.PI / 4;
  spotRustler.penumbra = 0.5;
  group.add(spotRustler);
  group.add(spotRustler.target);

  const frontFillRustler = new THREE.DirectionalLight(0xffffff, 2.4);
  frontFillRustler.position.set(9.0, 4, -14);
  group.add(frontFillRustler);

  const rimRustler = new THREE.PointLight(0xffb703, 2.2, 25);
  rimRustler.position.set(14, 3, -29);
  group.add(rimRustler);

  // --- Zone 3: Rogue EM210 PRO (Electric Blue / Technical Clean) ---
  const spotRogue = new THREE.SpotLight(0xe8f4ff, 8.5);
  spotRogue.position.set(-5.0, 10, -43);
  spotRogue.target.position.set(-8.5, 0.2, -54);
  spotRogue.angle = Math.PI / 4;
  spotRogue.penumbra = 0.5;
  group.add(spotRogue);
  group.add(spotRogue.target);

  const frontFillRogue = new THREE.DirectionalLight(0xffffff, 2.2);
  frontFillRogue.position.set(-8.5, 4, -42);
  group.add(frontFillRogue);

  const rimRogue = new THREE.PointLight(0x00e5ff, 2.0, 25);
  rimRogue.position.set(-13, 2, -57);
  group.add(rimRogue);

  // --- Zone 4: EPP (Seguridad Industrial - High Visibility Amber/White) ---
  const spotEPP = new THREE.SpotLight(0xfffaed, 9.5);
  spotEPP.position.set(0, 13, -74);
  spotEPP.target.position.set(0, 0.6, -88);
  spotEPP.angle = Math.PI / 3.5;
  spotEPP.penumbra = 0.55;
  group.add(spotEPP);
  group.add(spotEPP.target);

  const frontFillEPP = new THREE.DirectionalLight(0xffffff, 2.8);
  frontFillEPP.position.set(0, 5, -76);
  group.add(frontFillEPP);

  const rimEPPLeft = new THREE.PointLight(0xffb703, 3.2, 28);
  rimEPPLeft.position.set(-6, 3, -87);
  group.add(rimEPPLeft);

  const rimEPPRight = new THREE.PointLight(0x00f0ff, 3.2, 28);
  rimEPPRight.position.set(6, 3, -87);
  group.add(rimEPPRight);

  // Rim light de seguridad (rojo advertencia) para zona EPP
  const rimEPPSafety = new THREE.PointLight(0xff3300, 2.0, 22);
  rimEPPSafety.position.set(0, 5, -92);
  group.add(rimEPPSafety);

  // Dynamic reactive cursor light
  const cursorLight = new THREE.PointLight(0x00f0ff, 2.8, 35);
  cursorLight.position.set(0, 2, 8);
  group.add(cursorLight);

  return {
    group,
    updateActiveScene: (sceneIdx) => {
      // Focus spotlight intensity on active scene, attenuate non-active
      spotWarrior.intensity = sceneIdx === 0 ? 9.0 : 2.0;
      spotRustler.intensity = sceneIdx === 1 ? 8.8 : 2.0;
      spotRogue.intensity   = sceneIdx === 2 ? 8.5 : 2.0;
      spotEPP.intensity     = sceneIdx === 3 ? 9.5 : 2.0;
    },
    updateCursorLight: (normMouseX, normMouseY, currentCameraZ) => {
      cursorLight.position.x = normMouseX * 12;
      cursorLight.position.y = normMouseY * 6 + 1;
      cursorLight.position.z = currentCameraZ - 4;
    },
    dispose: () => {
      ambientLight.dispose();
      hemiLight.dispose();
      skylightBeam.dispose();
      spotWarrior.dispose();
      frontFillWarrior.dispose();
      rimWarrior.dispose();
      spotRustler.dispose();
      frontFillRustler.dispose();
      rimRustler.dispose();
      spotRogue.dispose();
      frontFillRogue.dispose();
      rimRogue.dispose();
      spotEPP.dispose();
      frontFillEPP.dispose();
      rimEPPLeft.dispose();
      rimEPPRight.dispose();
      rimEPPSafety.dispose();
      cursorLight.dispose();
    },
  };
}
