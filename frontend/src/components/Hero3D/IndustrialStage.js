import * as THREE from "three";

/**
 * Creates an authentic industrial workshop interior (Taller de Soldadura y Manufactura)
 * built 100% via code with Three.js.
 * 
 * Features:
 * - Industrial concrete workshop floor with lane safety markings (amarillo y negro)
 * - Industrial workshop walls (corrugated metallic panels, ventilation ducts, crane rails)
 * - Heavy industrial gantry crane / Puente grúa overhead
 * - Technical machinery workbenches & tool cabinets (bancos de trabajo metálicos)
 * - Overhead industrial high-bay workshop pendant lamps
 * - Subtle welding spark particles with realistic physics
 */
export function createIndustrialStage() {
  const group = new THREE.Group();

  // 1. WORKSHOP MATERIALS
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x181c22,
    roughness: 0.38,
    metalness: 0.3,
  });

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x12161b,
    roughness: 0.75,
    metalness: 0.5,
  });

  const steelStructureMat = new THREE.MeshStandardMaterial({
    color: 0x222a33,
    roughness: 0.45,
    metalness: 0.85,
  });

  const safetyYellowMat = new THREE.MeshStandardMaterial({
    color: 0xffb703,
    roughness: 0.4,
    metalness: 0.2,
  });

  const toolCabinetMat = new THREE.MeshStandardMaterial({
    color: 0x1e2730,
    roughness: 0.35,
    metalness: 0.7,
  });

  const lampEmissiveMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
  });

  // 2. CONCRETE WORKSHOP FLOOR
  const floorGeo = new THREE.PlaneGeometry(120, 220);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -3.2, -55);
  floor.receiveShadow = true;
  group.add(floor);

  // Workshop safety stripes / Demarcación de zona de trabajo
  const stripeGeo = new THREE.PlaneGeometry(0.35, 180);
  const stripeLeft = new THREE.Mesh(stripeGeo, safetyYellowMat);
  stripeLeft.rotation.x = -Math.PI / 2;
  stripeLeft.position.set(-13, -3.18, -55);
  group.add(stripeLeft);

  const stripeRight = new THREE.Mesh(stripeGeo, safetyYellowMat);
  stripeRight.rotation.x = -Math.PI / 2;
  stripeRight.position.set(13, -3.18, -55);
  group.add(stripeRight);

  // Subtle floor grid lines
  const gridHelper = new THREE.GridHelper(120, 30, 0xffb703, 0x2a3642);
  gridHelper.position.set(0, -3.17, -55);
  if (gridHelper.material) {
    gridHelper.material.opacity = 0.28;
    gridHelper.material.transparent = true;
  }
  group.add(gridHelper);

  // 3. WORKSHOP SIDE WALLS & VENTILATION DUCTS
  const wallGeo = new THREE.PlaneGeometry(220, 24);

  // Left wall
  const leftWall = new THREE.Mesh(wallGeo, wallMat);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-18, 8, -55);
  group.add(leftWall);

  // Right wall
  const rightWall = new THREE.Mesh(wallGeo, wallMat);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(18, 8, -55);
  group.add(rightWall);

  // Overhead ventilation duct (Tubería de extracción de humos de soldadura)
  const ductGeo = new THREE.CylinderGeometry(0.9, 0.9, 190, 16);
  const duct = new THREE.Mesh(ductGeo, steelStructureMat);
  duct.rotation.x = Math.PI / 2;
  duct.position.set(-12, 12.5, -55);
  group.add(duct);

  // 4. OVERHEAD GANTRY CRANE (Puente Grúa Industrial)
  const craneBeamGeo = new THREE.BoxGeometry(36, 0.9, 1.4);
  const craneRailGeo = new THREE.BoxGeometry(0.5, 0.5, 200);

  // Rails along walls
  const craneRailL = new THREE.Mesh(craneRailGeo, steelStructureMat);
  craneRailL.position.set(-17.5, 14, -55);
  group.add(craneRailL);

  const craneRailR = new THREE.Mesh(craneRailGeo, steelStructureMat);
  craneRailR.position.set(17.5, 14, -55);
  group.add(craneRailR);

  // Double Gantry Beams
  const craneBeam1 = new THREE.Mesh(craneBeamGeo, safetyYellowMat);
  craneBeam1.position.set(0, 14.5, -15);
  group.add(craneBeam1);

  const craneBeam2 = new THREE.Mesh(craneBeamGeo, safetyYellowMat);
  craneBeam2.position.set(0, 14.5, -60);
  group.add(craneBeam2);

  // Gantry trolley/hoist block
  const hoistGeo = new THREE.BoxGeometry(2.5, 1.2, 1.8);
  const hoist = new THREE.Mesh(hoistGeo, steelStructureMat);
  hoist.position.set(2, 14.2, -15);
  group.add(hoist);

  // 5. WORKSHOP WORKBENCHES & TOOL CABINETS ALONG THE WALLS
  const benchGeo = new THREE.BoxGeometry(3.5, 2.2, 7.0);
  const zCabinets = [6, -18, -42, -68, -90];

  zCabinets.forEach((zPos, idx) => {
    // Left side benches
    const benchL = new THREE.Mesh(benchGeo, toolCabinetMat);
    benchL.position.set(-16, -2.1, zPos);
    group.add(benchL);

    // Bench stainless steel top
    const topL = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.12, 7.2), steelStructureMat);
    topL.position.set(-16, -0.95, zPos);
    group.add(topL);

    // Right side tool storage
    const benchR = new THREE.Mesh(benchGeo, toolCabinetMat);
    benchR.position.set(16, -2.1, zPos);
    group.add(benchR);

    const topR = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.12, 7.2), steelStructureMat);
    topR.position.set(16, -0.95, zPos);
    group.add(topR);

    // Industrial high-bay ceiling lamps (Campanas industriales de taller)
    const lampGeo = new THREE.CylinderGeometry(0.1, 1.2, 0.7, 16);
    const lamp = new THREE.Mesh(lampGeo, steelStructureMat);
    lamp.position.set(idx % 2 === 0 ? -4 : 4, 13.8, zPos);
    group.add(lamp);

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), lampEmissiveMat);
    bulb.position.set(idx % 2 === 0 ? -4 : 4, 13.3, zPos);
    group.add(bulb);
  });

  // 6. PRODUCT MAIN SHOWCASE PEDESTALS
  // Warrior 500i main heavy industrial base
  const warriorPodium = new THREE.Mesh(
    new THREE.BoxGeometry(8.5, 0.6, 7.0),
    steelStructureMat
  );
  warriorPodium.position.set(0, -2.95, 0);
  group.add(warriorPodium);

  const warriorTrim = new THREE.Mesh(
    new THREE.BoxGeometry(8.8, 0.08, 7.2),
    safetyYellowMat
  );
  warriorTrim.position.set(0, -2.62, 0);
  group.add(warriorTrim);

  // Rustler EM455i heavy workstation base
  const rustlerPodium = new THREE.Mesh(
    new THREE.BoxGeometry(7.5, 0.6, 6.5),
    steelStructureMat
  );
  rustlerPodium.position.set(9, -2.95, -26);
  group.add(rustlerPodium);

  const rustlerTrim = new THREE.Mesh(
    new THREE.BoxGeometry(7.7, 0.08, 6.7),
    safetyYellowMat
  );
  rustlerTrim.position.set(9, -2.62, -26);
  group.add(rustlerTrim);

  // Rogue EM210 PRO compact workbench station
  const roguePodium = new THREE.Mesh(
    new THREE.BoxGeometry(6.2, 0.6, 5.2),
    steelStructureMat
  );
  roguePodium.position.set(-8.5, -2.95, -54);
  group.add(roguePodium);

  const rogueTrim = new THREE.Mesh(
    new THREE.BoxGeometry(6.4, 0.08, 5.4),
    safetyYellowMat
  );
  rogueTrim.position.set(-8.5, -2.62, -54);
  group.add(rogueTrim);

  // 7. WELDING SPARKS / AMBIENT PARTICLES
  // Realistic workshop welding spark burst particles
  const sparkCount = 140;
  const sparkPositions = new Float32Array(sparkCount * 3);
  const sparkColors = new Float32Array(sparkCount * 3);

  for (let i = 0; i < sparkCount; i++) {
    const i3 = i * 3;
    sparkPositions[i3] = (Math.random() - 0.5) * 20;
    sparkPositions[i3 + 1] = Math.random() * 8 - 1;
    sparkPositions[i3 + 2] = Math.random() * -110 + 10;

    // Golden amber welding spark colors
    sparkColors[i3] = 1.0;
    sparkColors[i3 + 1] = 0.7 + Math.random() * 0.3;
    sparkColors[i3 + 2] = 0.2;
  }

  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPositions, 3));
  sparkGeo.setAttribute("color", new THREE.BufferAttribute(sparkColors, 3));

  const sparkMat = new THREE.PointsMaterial({
    size: 0.18,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const sparks = new THREE.Points(sparkGeo, sparkMat);
  group.add(sparks);

  return {
    group,
    updateParticles: (time) => {
      const positions = sparkGeo.attributes.position.array;
      for (let i = 0; i < sparkCount; i++) {
        const i3 = i * 3;
        // Natural gentle spark flicker & gravity drift
        positions[i3 + 1] -= 0.012;
        if (positions[i3 + 1] < -3.1) {
          positions[i3 + 1] = Math.random() * 6 + 1;
        }
      }
      sparkGeo.attributes.position.needsUpdate = true;
    },
    dispose: () => {
      floorGeo.dispose();
      floorMat.dispose();
      wallGeo.dispose();
      wallMat.dispose();
      steelStructureMat.dispose();
      safetyYellowMat.dispose();
      toolCabinetMat.dispose();
      lampEmissiveMat.dispose();
      ductGeo.dispose();
      craneBeamGeo.dispose();
      craneRailGeo.dispose();
      hoistGeo.dispose();
      benchGeo.dispose();
      sparkGeo.dispose();
      sparkMat.dispose();
    },
  };
}
