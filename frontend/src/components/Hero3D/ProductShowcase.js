import * as THREE from "three";

/**
 * Creates 2.5D physical product showcases enclosed in illuminated 3D industrial pedestals
 * and glass-accented frames for the 4 key points:
 * 1. ESAB Warrior 500i CC/CV
 * 2. ESAB Rustler EM455i
 * 3. ESAB Rogue EM210 PRO
 * 4. Zona Equipos de Protección Personal (EPP)
 */
export function createProductShowcase(textureMap = {}) {
  const group = new THREE.Group();
  const textureLoader = new THREE.TextureLoader();

  const products = {
    warrior: {
      group: new THREE.Group(),
      mesh: null,
      frameGroup: null,
      targetPos: new THREE.Vector3(0, 0.45, 0),
    },
    rustler: {
      group: new THREE.Group(),
      mesh: null,
      frameGroup: null,
      targetPos: new THREE.Vector3(9.0, 0.35, -26),
    },
    rogue: {
      group: new THREE.Group(),
      mesh: null,
      frameGroup: null,
      targetPos: new THREE.Vector3(-8.5, 0.15, -54),
    },
    epp: {
      group: new THREE.Group(),
      mesh: null,
      frameGroup: null,
      targetPos: new THREE.Vector3(0, 0.6, -88),
    },
  };

  // Reusable Contact Shadow
  const shadowGeo = new THREE.PlaneGeometry(8.0, 5.0);
  const createContactShadow = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(64, 64, 15, 64, 64, 62);
    gradient.addColorStop(0, "rgba(0, 0, 0, 0.9)");
    gradient.addColorStop(0.55, "rgba(0, 0, 0, 0.5)");
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
    shadowMesh.position.y = -2.48;
    return shadowMesh;
  };

  // Helper to build a 3D industrial enclosure/box around the product
  const create3DIndustrialBox = (width, height, depth, accentColor = 0x00f0ff) => {
    const boxGroup = new THREE.Group();

    // 1. Backing panel (Dark matte carbon backplate with subtle glow)
    const backGeo = new THREE.PlaneGeometry(width * 1.12, height * 1.12);
    const backMat = new THREE.MeshStandardMaterial({
      color: 0x0b1016,
      roughness: 0.8,
      metalness: 0.6,
    });
    const backMesh = new THREE.Mesh(backGeo, backMat);
    backMesh.position.z = -0.55;
    boxGroup.add(backMesh);

    // 2. Beveled Metallic Enclosure Frame (Code-built 3D Frame)
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x242d38,
      roughness: 0.35,
      metalness: 0.85,
    });

    const thickness = 0.16;
    const halfW = (width * 1.12) / 2;
    const halfH = (height * 1.12) / 2;

    // Top beam
    const topBeam = new THREE.Mesh(
      new THREE.BoxGeometry(width * 1.12 + thickness * 2, thickness, depth),
      frameMat
    );
    topBeam.position.set(0, halfH + thickness / 2, 0);
    boxGroup.add(topBeam);

    // Bottom beam
    const bottomBeam = new THREE.Mesh(
      new THREE.BoxGeometry(width * 1.12 + thickness * 2, thickness, depth),
      frameMat
    );
    bottomBeam.position.set(0, -halfH - thickness / 2, 0);
    boxGroup.add(bottomBeam);

    // Left beam
    const leftBeam = new THREE.Mesh(
      new THREE.BoxGeometry(thickness, height * 1.12, depth),
      frameMat
    );
    leftBeam.position.set(-halfW - thickness / 2, 0, 0);
    boxGroup.add(leftBeam);

    // Right beam
    const rightBeam = new THREE.Mesh(
      new THREE.BoxGeometry(thickness, height * 1.12, depth),
      frameMat
    );
    rightBeam.position.set(halfW + thickness / 2, 0, 0);
    boxGroup.add(rightBeam);

    // 3. Neon Luminous Edge Accents (Cyber-industrial highlight)
    const neonMat = new THREE.MeshStandardMaterial({
      color: 0x020a10,
      emissive: accentColor,
      emissiveIntensity: 1.0,
      roughness: 0.1,
    });

    const neonBarTop = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.95, 0.05, 0.05),
      neonMat
    );
    neonBarTop.position.set(0, halfH + 0.02, depth / 2 + 0.02);
    boxGroup.add(neonBarTop);

    const neonBarBottom = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.95, 0.05, 0.05),
      neonMat
    );
    neonBarBottom.position.set(0, -halfH - 0.02, depth / 2 + 0.02);
    boxGroup.add(neonBarBottom);

    return boxGroup;
  };

  // Helper to attach product mesh using preloaded or fallback loaded texture
  const applyTextureToProduct = (itemKey, texture, width, height, position, accentColor) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = true;

    const planeGeo = new THREE.PlaneGeometry(width, height);
    const planeMat = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      roughness: 0.15,
      metalness: 0.05,
      side: THREE.DoubleSide,
      alphaTest: 0.08,
      emissive: 0xffffff,
      emissiveMap: texture,
      emissiveIntensity: 0.60,
    });

    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.castShadow = true;

    const productGroup = products[itemKey].group;
    productGroup.position.copy(position);

    // Contact reflection plane
    const reflGeo = new THREE.PlaneGeometry(width * 0.85, height * 0.35);
    const reflMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const reflMesh = new THREE.Mesh(reflGeo, reflMat);
    reflMesh.rotation.x = Math.PI / 2;
    reflMesh.scale.y = -1;
    reflMesh.position.y = -height / 2 - 0.08;
    productGroup.add(reflMesh);

    // Add 3D Frame Enclosure
    const frame = create3DIndustrialBox(width, height, 0.7, accentColor);
    productGroup.add(frame);

    // Contact shadow on platform
    const contactShadow = createContactShadow();
    productGroup.add(contactShadow);

    productGroup.add(mesh);

    products[itemKey].mesh = mesh;
    products[itemKey].frameGroup = frame;
    group.add(productGroup);
  };

  // Helper to load and mount product
  const setupProductMesh = (
    itemKey,
    imagePath,
    width,
    height,
    position,
    accentColor
  ) => {
    if (textureMap && textureMap[imagePath]) {
      applyTextureToProduct(itemKey, textureMap[imagePath], width, height, position, accentColor);
      return;
    }

    textureLoader.load(
      imagePath,
      (texture) => {
        applyTextureToProduct(itemKey, texture, width, height, position, accentColor);
      },
      undefined,
      (err) => {
        console.warn(`Error loading product texture ${imagePath}`, err);
      }
    );
  };

  // 1. Warrior 500i
  setupProductMesh(
    "warrior",
    "/assets/hero/products/warrior-500i/front.webp",
    6.6,
    5.6,
    products.warrior.targetPos,
    0x00f0ff // Cyan
  );

  // 2. Rustler EM455i
  setupProductMesh(
    "rustler",
    "/assets/hero/products/rustler-em455i/front.webp",
    5.8,
    5.0,
    products.rustler.targetPos,
    0xffaa00 // Industrial Gold
  );

  // 3. Rogue EM210 PRO
  setupProductMesh(
    "rogue",
    "/assets/hero/products/rogue-em210/front.webp",
    4.8,
    4.2,
    products.rogue.targetPos,
    0x00e5ff // Electric Blue
  );

  // 4. Zona EPP (Seguridad Industrial para Soldador)
  setupProductMesh(
    "epp",
    "/assets/hero/products/epp-zone/front.webp",
    9.0,   // ancho para formato landscape
    6.0,
    products.epp.targetPos,
    0xffb703 // Safety Amber
  );

  return {
    group,
    products,
    updateCursorEffect: (normMouseX, normMouseY) => {
      ["warrior", "rustler", "rogue", "epp"].forEach((key) => {
        const p = products[key];
        if (p.mesh && p.frameGroup) {
          const rotY = normMouseX * 0.22;  // era 0.14
          const rotX = -normMouseY * 0.16; // era 0.10
          p.mesh.rotation.y = rotY;
          p.mesh.rotation.x = rotX;
          p.frameGroup.rotation.y = rotY * 0.8;
          p.frameGroup.rotation.x = rotX * 0.8;
        }
      });
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
      });
    },
  };
}
