import * as THREE from "three";

/**
 * Creates 2.5D physical product billboards in Three.js world space
 * using official transparent WEBP product photography.
 * 
 * Configures:
 * - Real scale & perspective
 * - Alpha transparency & dual-side handling
 * - Contact shadow geometry under each machine
 * - Subtle independent floating / inspection response
 */
export function createProductShowcase() {
  const group = new THREE.Group();
  const textureLoader = new THREE.TextureLoader();

  const products = {
    warrior: {
      group: new THREE.Group(),
      mesh: null,
      shadow: null,
      targetPos: new THREE.Vector3(0, 0.4, 0),
    },
    rustler: {
      group: new THREE.Group(),
      mesh: null,
      shadow: null,
      targetPos: new THREE.Vector3(9, 0.3, -26),
    },
    rogue: {
      group: new THREE.Group(),
      mesh: null,
      shadow: null,
      targetPos: new THREE.Vector3(-8.5, 0.1, -54),
    },
  };

  // Reusable Contact Shadow Geometry & Material
  const shadowGeo = new THREE.PlaneGeometry(6.4, 3.8);
  const createContactShadow = () => {
    // Generate procedural radial gradient shadow texture
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(64, 64, 10, 64, 64, 60);
    gradient.addColorStop(0, "rgba(0, 0, 0, 0.85)");
    gradient.addColorStop(0.5, "rgba(0, 0, 0, 0.45)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(canvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -2.74;
    return shadowMesh;
  };

  // Helper to build high-end product plane
  const setupProductMesh = (itemKey, imagePath, width, height, position) => {
    textureLoader.load(
      imagePath,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.generateMipmaps = true;

        const planeGeo = new THREE.PlaneGeometry(width, height);
        const planeMat = new THREE.MeshStandardMaterial({
          map: texture,
          transparent: true,
          roughness: 0.35,
          metalness: 0.15,
          side: THREE.DoubleSide,
          alphaTest: 0.05,
        });

        const mesh = new THREE.Mesh(planeGeo, planeMat);
        mesh.castShadow = true;

        const productGroup = products[itemKey].group;
        productGroup.position.copy(position);

        const contactShadow = createContactShadow();
        productGroup.add(contactShadow);
        productGroup.add(mesh);

        products[itemKey].mesh = mesh;
        products[itemKey].shadow = contactShadow;
        group.add(productGroup);
      },
      undefined,
      (err) => {
        console.warn(`Error loading product texture ${imagePath}`, err);
      }
    );
  };

  // 1. Warrior 500i — Industrial flagship (large, imposing)
  setupProductMesh(
    "warrior",
    "/assets/hero/products/warrior-500i/front.webp",
    6.6,
    5.6,
    products.warrior.targetPos
  );

  // 2. Rustler EM455i — Heavy-duty workshop power
  setupProductMesh(
    "rustler",
    "/assets/hero/products/rustler-em455i/front.webp",
    5.8,
    5.0,
    products.rustler.targetPos
  );

  // 3. Rogue EM210 PRO — Compact precision
  setupProductMesh(
    "rogue",
    "/assets/hero/products/rogue-em210/front.webp",
    4.8,
    4.2,
    products.rogue.targetPos
  );

  return {
    group,
    products,
    updateCursorEffect: (normMouseX, normMouseY) => {
      // Gentle parallax and physical tilt on active items
      if (products.warrior.mesh) {
        products.warrior.mesh.rotation.y = normMouseX * 0.12;
        products.warrior.mesh.rotation.x = -normMouseY * 0.08;
      }
      if (products.rustler.mesh) {
        products.rustler.mesh.rotation.y = normMouseX * 0.12;
        products.rustler.mesh.rotation.x = -normMouseY * 0.08;
      }
      if (products.rogue.mesh) {
        products.rogue.mesh.rotation.y = normMouseX * 0.12;
        products.rogue.mesh.rotation.x = -normMouseY * 0.08;
      }
    },
    dispose: () => {
      shadowGeo.dispose();
      Object.values(products).forEach((p) => {
        if (p.mesh) {
          if (p.mesh.geometry) p.mesh.geometry.dispose();
          if (p.mesh.material) {
            if (p.mesh.material.map) p.mesh.material.map.dispose();
            p.mesh.material.dispose();
          }
        }
        if (p.shadow) {
          if (p.shadow.material) {
            if (p.shadow.material.map) p.shadow.material.map.dispose();
            p.shadow.material.dispose();
          }
        }
      });
    },
  };
}
