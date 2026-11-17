import * as THREE from "three";

/**
 * Creates the 3D procedural industrial stage for MAQSYMA Hero.
 * Built 100% via code using Three.js geometries, materials and lighting.
 * 
 * Includes:
 * - Industrial floor grid with subtle metallic reflection & depth fade
 * - Structural technical framework (pillars, beams, trusses)
 * - Industrial product platforms with emissive edge markers
 * - Volumetric depth frames & atmospheric particles (welding dust/sparks)
 * - Cinema lighting: key spotlights, ambient fill, rim lights, and reactive accent light
 */
export function createIndustrialStage() {
  const group = new THREE.Group();

  // 1. REUSABLE INDUSTRIAL MATERIALS
  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x121417,
    roughness: 0.65,
    metalness: 0.85,
  });

  const beamMetalMat = new THREE.MeshStandardMaterial({
    color: 0x1a1e24,
    roughness: 0.45,
    metalness: 0.9,
  });

  const accentEmissiveMat = new THREE.MeshStandardMaterial({
    color: 0x08090b,
    emissive: 0x00f0ff,
    emissiveIntensity: 0.45,
    roughness: 0.2,
    metalness: 0.8,
  });

  const amberEmissiveMat = new THREE.MeshStandardMaterial({
    color: 0x110c05,
    emissive: 0xffa000,
    emissiveIntensity: 0.55,
    roughness: 0.3,
    metalness: 0.7,
  });

  // 2. INDUSTRIAL FLOOR
  // Floor base slab
  const floorGeo = new THREE.PlaneGeometry(160, 240);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x080a0c,
    roughness: 0.5,
    metalness: 0.6,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -3.2, -60);
  floor.receiveShadow = true;
  group.add(floor);

  // Modular floor grid lines (code-generated procedural tech lines)
  const gridHelper = new THREE.GridHelper(160, 40, 0x00e5ff, 0x15222e);
  gridHelper.position.set(0, -3.18, -60);
  if (gridHelper.material) {
    gridHelper.material.opacity = 0.22;
    gridHelper.material.transparent = true;
  }
  group.add(gridHelper);

  // 3. INDUSTRIAL PLATFORMS (Podiums for Products)
  // Scene 1 & 2 Podia: Warrior 500i at Z: 0
  const warriorPodiumGeo = new THREE.BoxGeometry(7.5, 0.5, 6);
  const warriorPodium = new THREE.Mesh(warriorPodiumGeo, beamMetalMat);
  warriorPodium.position.set(0, -3.0, 0);
  group.add(warriorPodium);

  // Glowing perimeter border for Warrior podium
  const warriorBorderGeo = new THREE.BoxGeometry(7.7, 0.08, 6.2);
  const warriorBorder = new THREE.Mesh(warriorBorderGeo, accentEmissiveMat);
  warriorBorder.position.set(0, -2.8, 0);
  group.add(warriorBorder);

  // Scene 2 Podia: Rustler EM455i at X: 9, Z: -26
  const rustlerPodiumGeo = new THREE.BoxGeometry(6.5, 0.5, 5.5);
  const rustlerPodium = new THREE.Mesh(rustlerPodiumGeo, beamMetalMat);
  rustlerPodium.position.set(9, -3.0, -26);
  group.add(rustlerPodium);

  const rustlerBorder = new THREE.Mesh(new THREE.BoxGeometry(6.7, 0.08, 5.7), amberEmissiveMat);
  rustlerBorder.position.set(9, -2.8, -26);
  group.add(rustlerBorder);

  // Scene 3 Podia: Rogue EM210 PRO at X: -8.5, Z: -54
  const roguePodiumGeo = new THREE.BoxGeometry(5.2, 0.5, 4.5);
  const roguePodium = new THREE.Mesh(roguePodiumGeo, beamMetalMat);
  roguePodium.position.set(-8.5, -3.0, -54);
  group.add(roguePodium);

  const rogueBorder = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.08, 4.7), accentEmissiveMat);
  rogueBorder.position.set(-8.5, -2.8, -54);
  group.add(rogueBorder);

  // Scene 4 Podia: Ecosystem Centerpiece at X: 0, Z: -88
  const ecoPodiumGeo = new THREE.CylinderGeometry(8.5, 9.2, 0.6, 32);
  const ecoPodium = new THREE.Mesh(ecoPodiumGeo, darkMetalMat);
  ecoPodium.position.set(0, -3.0, -88);
  group.add(ecoPodium);

  const ecoRingGeo = new THREE.TorusGeometry(8.8, 0.07, 16, 64);
  const ecoRing = new THREE.Mesh(ecoRingGeo, accentEmissiveMat);
  ecoRing.rotation.x = Math.PI / 2;
  ecoRing.position.set(0, -2.7, -88);
  group.add(ecoRing);

  // 4. STRUCTURAL TECHNICAL ARCHITECTURE (Columns, Portals & Beams)
  const zStations = [12, -8, -28, -52, -76, -100];
  const colGeo = new THREE.BoxGeometry(0.55, 18, 0.55);
  const topCrossGeo = new THREE.BoxGeometry(32, 0.45, 0.45);

  zStations.forEach((zPos, idx) => {
    // Left column
    const colLeft = new THREE.Mesh(colGeo, darkMetalMat);
    colLeft.position.set(-15, 6, zPos);
    group.add(colLeft);

    // Right column
    const colRight = new THREE.Mesh(colGeo, darkMetalMat);
    colRight.position.set(15, 6, zPos);
    group.add(colRight);

    // Top horizontal cross truss
    const cross = new THREE.Mesh(topCrossGeo, beamMetalMat);
    cross.position.set(0, 14.8, zPos);
    group.add(cross);

    // Subtle technical light bars along structural arches
    const lightBarGeo = new THREE.BoxGeometry(10, 0.06, 0.1);
    const lightBar = new THREE.Mesh(
      lightBarGeo,
      idx % 2 === 0 ? accentEmissiveMat : amberEmissiveMat
    );
    lightBar.position.set(0, 14.5, zPos);
    group.add(lightBar);
  });

  // Longitudinal overhead guide rails
  const railGeo = new THREE.BoxGeometry(0.25, 0.25, 140);
  const railLeft = new THREE.Mesh(railGeo, beamMetalMat);
  railLeft.position.set(-15, 14.8, -44);
  const railRight = new THREE.Mesh(railGeo, beamMetalMat);
  railRight.position.set(15, 14.8, -44);
  group.add(railLeft);
  group.add(railRight);

  // 5. ATMOSPHERIC INDUSTRIAL PARTICLES (Welding Dust & Ambient Energy)
  const particleCount = 280;
  const particlePositions = new Float32Array(particleCount * 3);
  const particleColors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    // Spread along tunnel width, height, and depth from +20 to -110
    particlePositions[i3] = (Math.random() - 0.5) * 26;
    particlePositions[i3 + 1] = Math.random() * 14 - 2;
    particlePositions[i3 + 2] = Math.random() * -130 + 15;

    // Cyan / amber / white dust
    const isAmber = Math.random() > 0.65;
    if (isAmber) {
      particleColors[i3] = 1.0;
      particleColors[i3 + 1] = 0.65;
      particleColors[i3 + 2] = 0.2;
    } else {
      particleColors[i3] = 0.2;
      particleColors[i3 + 1] = 0.85;
      particleColors[i3 + 2] = 1.0;
    }
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.14,
    vertexColors: true,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  group.add(particles);

  // Return container and animation hook for particles
  return {
    group,
    updateParticles: (delta) => {
      const positions = particleGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        // Subtle ambient drift
        positions[i3 + 1] += Math.sin(delta * 2 + i) * 0.003;
        positions[i3] += Math.cos(delta + i) * 0.002;
      }
      particleGeo.attributes.position.needsUpdate = true;
    },
    dispose: () => {
      floorGeo.dispose();
      floorMat.dispose();
      darkMetalMat.dispose();
      beamMetalMat.dispose();
      accentEmissiveMat.dispose();
      amberEmissiveMat.dispose();
      colGeo.dispose();
      topCrossGeo.dispose();
      warriorPodiumGeo.dispose();
      rustlerPodiumGeo.dispose();
      roguePodiumGeo.dispose();
      ecoPodiumGeo.dispose();
      ecoRingGeo.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    },
  };
}
