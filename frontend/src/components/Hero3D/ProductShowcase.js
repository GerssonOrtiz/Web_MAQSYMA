import * as THREE from "three";

/**
 * Creates futuristic technological energy pedestals, industrial robotic armatures,
 * holographic data rings and dynamic welding arc flashes at each showcase waypoint.
 *
 * This provides the visual 3D soul of the industrial nave while the physical products
 * are crisply and responsiveness presented in the 2D Glass HUD Cards.
 */
export function createProductShowcase() {
  const group = new THREE.Group();

  const stations = {
    warrior: {
      group: new THREE.Group(),
      pos: new THREE.Vector3(0, 0.45, 0),
      accent: 0x00f0ff, // Cyan
      name: "WARRIOR CORE",
    },
    rustler: {
      group: new THREE.Group(),
      pos: new THREE.Vector3(9.0, 0.35, -26),
      accent: 0xffaa00, // Amber / Industrial Gold
      name: "RUSTLER STATION",
    },
    rogue: {
      group: new THREE.Group(),
      pos: new THREE.Vector3(-8.5, 0.15, -54),
      accent: 0x00e5ff, // Electric Blue
      name: "ROGUE CELL",
    },
    epp: {
      group: new THREE.Group(),
      pos: new THREE.Vector3(0, 0.6, -88),
      accent: 0xffb703, // Safety Amber / Red
      name: "SAFETY ARENA",
    },
  };

  // Shared Core Materials & Geometries
  const darkCoreMat = new THREE.MeshStandardMaterial({
    color: 0x12171f,
    roughness: 0.3,
    metalness: 0.85,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0x4a5568,
    roughness: 0.2,
    metalness: 0.9,
  });

  // Track dynamic animated meshes
  const animatedElements = [];

  // Helper to build a 3D Cyber Industrial Hologram Core at each waypoint
  const createCoreStation = (key, config) => {
    const stationGroup = stations[key].group;
    stationGroup.position.copy(config.pos);

    const glowColor = config.accent;
    const glowMat = new THREE.MeshStandardMaterial({
      color: 0x020810,
      emissive: glowColor,
      emissiveIntensity: 2.2,
      roughness: 0.2,
    });

    const holoLineMat = new THREE.MeshBasicMaterial({
      color: glowColor,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });

    // 1. Heavy Octagonal Industrial Base Turntable
    const baseGeo = new THREE.CylinderGeometry(3.6, 4.0, 0.6, 8);
    const baseMesh = new THREE.Mesh(baseGeo, darkCoreMat);
    baseMesh.position.y = -2.2;
    stationGroup.add(baseMesh);

    const baseRingGeo = new THREE.TorusGeometry(3.8, 0.08, 12, 32);
    const baseRing = new THREE.Mesh(baseRingGeo, glowMat);
    baseRing.rotation.x = Math.PI / 2;
    baseRing.position.y = -1.9;
    stationGroup.add(baseRing);

    // 2. Heavy Articulated Robotic Welding Torches / Pillars
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const rx = Math.cos(angle) * 3.1;
      const rz = Math.sin(angle) * 3.1;

      const pylonGeo = new THREE.BoxGeometry(0.35, 3.2, 0.35);
      const pylon = new THREE.Mesh(pylonGeo, chromeMat);
      pylon.position.set(rx, -0.4, rz);
      stationGroup.add(pylon);

      // Pylon neon beacon
      const beaconGeo = new THREE.SphereGeometry(0.12, 12, 12);
      const beacon = new THREE.Mesh(beaconGeo, glowMat);
      beacon.position.set(rx, 1.25, rz);
      stationGroup.add(beacon);
    }

    // 3. Central Levitating Holographic Arc Core (Octahedron + Wireframe cage)
    const innerGeo = new THREE.OctahedronGeometry(1.6, 0);
    const innerCore = new THREE.Mesh(innerGeo, glowMat);
    innerCore.position.y = 0.6;
    stationGroup.add(innerCore);

    const outerCageGeo = new THREE.IcosahedronGeometry(2.4, 1);
    const outerCage = new THREE.Mesh(outerCageGeo, holoLineMat);
    outerCage.position.y = 0.6;
    stationGroup.add(outerCage);

    // 4. Horizontal Holographic Concentric Data Rings
    const ring1Geo = new THREE.RingGeometry(2.0, 2.08, 36);
    const ring1 = new THREE.Mesh(ring1Geo, holoLineMat);
    ring1.rotation.x = Math.PI / 2;
    ring1.position.y = 0.6;
    stationGroup.add(ring1);

    const ring2Geo = new THREE.RingGeometry(2.7, 2.76, 36);
    const ring2 = new THREE.Mesh(ring2Geo, holoLineMat);
    ring2.rotation.x = Math.PI / 2;
    ring2.position.y = 0.6;
    stationGroup.add(ring2);

    // 5. Vertical Welding Light Flash (Point Light)
    const arcLight = new THREE.PointLight(glowColor, 4.0, 16);
    arcLight.position.set(0, 0.6, 0);
    stationGroup.add(arcLight);

    animatedElements.push({
      innerCore,
      outerCage,
      ring1,
      ring2,
      arcLight,
      baseRotSpeed: key === "warrior" ? 0.015 : key === "rustler" ? 0.02 : 0.018,
      stationGroup,
    });

    group.add(stationGroup);
  };

  Object.entries(stations).forEach(([key, config]) => {
    createCoreStation(key, config);
  });

  return {
    group,
    stations,
    updateCursorEffect: (normMouseX, normMouseY) => {
      animatedElements.forEach((el, idx) => {
        // Continuous smooth rotation of holographic core
        el.innerCore.rotation.y += el.baseRotSpeed;
        el.innerCore.rotation.x += el.baseRotSpeed * 0.5;

        el.outerCage.rotation.y -= el.baseRotSpeed * 0.8;
        el.outerCage.rotation.z += el.baseRotSpeed * 0.4;

        el.ring1.rotation.z += el.baseRotSpeed * 1.2;
        el.ring2.rotation.z -= el.baseRotSpeed * 0.7;

        // Subtle interactive response to cursor
        const targetHover = (normMouseY * 0.25);
        el.innerCore.position.y = 0.6 + Math.sin(Date.now() * 0.003 + idx) * 0.15 + targetHover;
        el.outerCage.position.y = el.innerCore.position.y;
        el.ring1.position.y = el.innerCore.position.y;
        el.ring2.position.y = el.innerCore.position.y;

        // Dynamic arc intensity pulse
        el.arcLight.intensity = 3.5 + Math.sin(Date.now() * 0.008 + idx * 2) * 1.2;
      });
    },
    dispose: () => {
      darkCoreMat.dispose();
      chromeMat.dispose();
      group.traverse((child) => {
        if (child.isMesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
            else child.material.dispose();
          }
        }
      });
    },
  };
}
