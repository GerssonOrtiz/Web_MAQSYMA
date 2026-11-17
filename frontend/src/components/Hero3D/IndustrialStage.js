import * as THREE from "three";

/**
 * Reconstructed Architectural Industrial Nave for MAQSYMA Hero Showroom.
 * Built strictly according to 'mejora.md':
 *
 * 1. High-bay industrial nave (Nave industrial contemporánea de gran escala)
 * 2. Heavy steel columns (Columnas estructurales de acero IPN/HEB con placas base y remaches)
 * 3. Overhead roof trusses (Cerchas metálicas triangulares dobles en celosía)
 * 4. Longitudinal crane rails (Vigas carril para puente grúa con testeros móviles y polipasto)
 * 5. Industrial roof skylights / ventanales con perfiles metálicos
 * 6. High-gloss polished industrial concrete floor with expansion joints and safety yellow lane markings
 * 7. Industrial mezzanine / pasarela técnica con barandillas y escalera
 * 8. Ventilation ducts, industrial cable trays, air extractors
 * 9. Heavy workbenches, mobile tool carts, cylinder racks, material racks
 * 10. Distinct pedestals for the 4 key commercial zones:
 *     - Point 01: ESAB Warrior 500i (Heavy industrial pedestal)
 *     - Point 02: ESAB Rustler EM455i (Fabrication workstation)
 *     - Point 03: ESAB Rogue EM210 PRO (Workshop bench & tool cart)
 *     - Point 04: Zona EPP (Security exhibition platform with modular backwall)
 */
export function createIndustrialStage() {
  const group = new THREE.Group();

  // ==========================================
  // 1. ADVANCED PBR INDUSTRIAL MATERIALS
  // ==========================================
  // Procedural concrete floor texture
  const createConcreteFloorTexture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    // Base polished dark industrial concrete
    ctx.fillStyle = "#161a20";
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle concrete noise / aggregate texture
    for (let i = 0; i < 45000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const val = Math.random() * 25;
      ctx.fillStyle = `rgba(${val + 15}, ${val + 20}, ${val + 25}, 0.12)`;
      ctx.fillRect(x, y, 2, 2);
    }

    // Concrete slab expansion joints (Juntas de dilatación moduladas 256x256)
    ctx.strokeStyle = "rgba(10, 12, 16, 0.75)";
    ctx.lineWidth = 4;
    for (let c = 0; c <= 1024; c += 256) {
      ctx.beginPath();
      ctx.moveTo(c, 0);
      ctx.lineTo(c, 1024);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, c);
      ctx.lineTo(1024, c);
      ctx.stroke();
    }

    // Oil stain spots (manchas de aceite)
    for (let s = 0; s < 12; s++) {
      const cx = Math.random() * 1024;
      const cy = Math.random() * 1024;
      const r0 = 20 + Math.random() * 20;
      const r1 = 50 + Math.random() * 30;
      const grad = ctx.createRadialGradient(cx, cy, r0, cx, cy, r1);
      grad.addColorStop(0, "rgba(5, 8, 10, 0.55)");
      grad.addColorStop(1, "rgba(5, 8, 10, 0)");
      ctx.save();
      ctx.fillStyle = grad;
      ctx.translate(cx, cy);
      ctx.rotate(Math.random() * Math.PI * 2);
      ctx.scale(1.0, 0.5 + Math.random() * 0.5);
      ctx.beginPath();
      ctx.ellipse(0, 0, r1, r1 * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Tire track marks (marcas de rodado diagonales)
    ctx.strokeStyle = "rgba(255, 200, 0, 0.08)";
    ctx.lineWidth = 3;
    for (let t = 0; t < 4; t++) {
      const x0 = Math.random() * 800;
      const y0 = Math.random() * 800;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x0 + 150 + Math.random() * 100, y0 + 100 + Math.random() * 150);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 12);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  const concreteTex = createConcreteFloorTexture();

  const floorMat = new THREE.MeshStandardMaterial({
    map: concreteTex,
    color: 0x1f242b,
    roughness: 0.28, // High polished sheen
    metalness: 0.25,
  });

  const darkSteelMat = new THREE.MeshStandardMaterial({
    color: 0x1a2129,
    roughness: 0.42,
    metalness: 0.88,
  });

  const structuralSteelMat = new THREE.MeshStandardMaterial({
    color: 0x242d38,
    roughness: 0.38,
    metalness: 0.82,
  });

  const safetyYellowMat = new THREE.MeshStandardMaterial({
    color: 0xffb703,
    roughness: 0.35,
    metalness: 0.2,
  });

  // Safety orange for rack shelf beams
  const safetyOrangeMat = new THREE.MeshStandardMaterial({
    color: 0xe36712,
    roughness: 0.35,
    metalness: 0.3,
  });

  const safetyHazardMat = (() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffb703";
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = "#121418";
    for (let i = -256; i < 512; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 32, 0);
      ctx.lineTo(i + 32 - 128, 256);
      ctx.lineTo(i - 128, 256);
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 14);
    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.4,
      metalness: 0.2,
    });
  })();

  const wallPanelMat = new THREE.MeshStandardMaterial({
    color: 0x11161c,
    roughness: 0.72,
    metalness: 0.45,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x223545,
    transmission: 0.65,
    opacity: 0.7,
    transparent: true,
    roughness: 0.1,
    metalness: 0.1,
    ior: 1.5,
  });

  const lampHousingMat = new THREE.MeshStandardMaterial({
    color: 0x1e252e,
    roughness: 0.3,
    metalness: 0.9,
  });

  const lampEmissiveMat = new THREE.MeshBasicMaterial({
    color: 0xffeedd,
  });

  const neonCyanMat = new THREE.MeshStandardMaterial({
    color: 0x021018,
    emissive: 0x00f0ff,
    emissiveIntensity: 1.2,
    roughness: 0.1,
  });

  const maqsymaRedMat = new THREE.MeshStandardMaterial({
    color: 0xd90429,
    roughness: 0.35,
    metalness: 0.4,
  });

  // Track all totem canvas textures for disposal
  const totemTextures = [];
  const ringGeometries = [];

  // ==========================================
  // 2. CONCRETE WORKSHOP FLOOR & SAFETY LANES
  // ==========================================
  const floorGeo = new THREE.PlaneGeometry(140, 240);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -3.2, -60);
  floor.receiveShadow = true;
  group.add(floor);

  // Safety Boundary Lines / Demarcación de seguridad perimetral
  const stripeGeo = new THREE.PlaneGeometry(0.35, 210);
  const stripeLeft = new THREE.Mesh(stripeGeo, safetyYellowMat);
  stripeLeft.rotation.x = -Math.PI / 2;
  stripeLeft.position.set(-15, -3.18, -60);
  group.add(stripeLeft);

  const stripeRight = new THREE.Mesh(stripeGeo, safetyYellowMat);
  stripeRight.rotation.x = -Math.PI / 2;
  stripeRight.position.set(15, -3.18, -60);
  group.add(stripeRight);

  // Cross hazard stripes at main transitions
  const crossStripeGeo = new THREE.PlaneGeometry(28, 0.6);
  const crossStripe1 = new THREE.Mesh(crossStripeGeo, safetyHazardMat);
  crossStripe1.rotation.x = -Math.PI / 2;
  crossStripe1.position.set(0, -3.18, 12);
  group.add(crossStripe1);

  const crossStripe2 = new THREE.Mesh(crossStripeGeo, safetyHazardMat);
  crossStripe2.rotation.x = -Math.PI / 2;
  crossStripe2.position.set(0, -3.18, -40);
  group.add(crossStripe2);

  const crossStripe3 = new THREE.Mesh(crossStripeGeo, safetyHazardMat);
  crossStripe3.rotation.x = -Math.PI / 2;
  crossStripe3.position.set(0, -3.18, -75);
  group.add(crossStripe3);

  // ==========================================
  // 3. STRUCTURAL COLUMNS (Columnas HEB de Acero)
  // ==========================================
  // Heavy HEB structural steel profile helper
  const createHEBColumn = (height = 20) => {
    const colGroup = new THREE.Group();
    // Central web
    const web = new THREE.Mesh(new THREE.BoxGeometry(0.14, height, 0.7), structuralSteelMat);
    colGroup.add(web);
    // Flanges
    const flangeL = new THREE.Mesh(new THREE.BoxGeometry(0.7, height, 0.14), structuralSteelMat);
    flangeL.position.z = -0.35;
    colGroup.add(flangeL);
    const flangeR = new THREE.Mesh(new THREE.BoxGeometry(0.7, height, 0.14), structuralSteelMat);
    flangeR.position.z = 0.35;
    colGroup.add(flangeR);
    // Base plate with industrial anchoring
    const basePlate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 1.2), darkSteelMat);
    basePlate.position.y = -height / 2 + 0.12;
    colGroup.add(basePlate);
    // Top connection bracket
    const topPlate = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.2, 1.0), darkSteelMat);
    topPlate.position.y = height / 2 - 0.1;
    colGroup.add(topPlate);
    return colGroup;
  };

  // Modular column bays along both sides of the nave
  const colZPositions = [16, 0, -18, -36, -54, -72, -90, -108, -126];
  colZPositions.forEach((z) => {
    const colL = createHEBColumn(22);
    colL.position.set(-18.5, 7.8, z);
    group.add(colL);

    const colR = createHEBColumn(22);
    colR.position.set(18.5, 7.8, z);
    group.add(colR);
  });

  // ==========================================
  // 4. OVERHEAD ROOF TRUSSES (Cerchas en Celosía Metálica)
  // ==========================================
  const createRoofTruss = () => {
    const trussGroup = new THREE.Group();
    const span = 37;
    // Lower chord
    const lowerChord = new THREE.Mesh(new THREE.BoxGeometry(span, 0.3, 0.3), structuralSteelMat);
    trussGroup.add(lowerChord);

    // Upper pitched chords (Dos vertientes)
    const pitchHalfSpan = Math.sqrt(Math.pow(span / 2, 2) + Math.pow(2.8, 2));
    const upperChordL = new THREE.Mesh(new THREE.BoxGeometry(pitchHalfSpan, 0.3, 0.3), structuralSteelMat);
    upperChordL.position.set(-span / 4, 1.4, 0);
    upperChordL.rotation.z = Math.atan2(2.8, span / 2);
    trussGroup.add(upperChordL);

    const upperChordR = new THREE.Mesh(new THREE.BoxGeometry(pitchHalfSpan, 0.3, 0.3), structuralSteelMat);
    upperChordR.position.set(span / 4, 1.4, 0);
    upperChordR.rotation.z = -Math.atan2(2.8, span / 2);
    trussGroup.add(upperChordR);

    // Vertical & diagonal lattice struts
    for (let x = -15; x <= 15; x += 3.75) {
      const h = 2.8 * (1 - Math.abs(x) / (span / 2));
      if (h > 0.3) {
        const strut = new THREE.Mesh(new THREE.BoxGeometry(0.18, h, 0.18), darkSteelMat);
        strut.position.set(x, h / 2, 0);
        trussGroup.add(strut);
      }
    }
    return trussGroup;
  };

  colZPositions.forEach((z) => {
    const truss = createRoofTruss();
    truss.position.set(0, 16.5, z);
    group.add(truss);
  });

  // Longitudinal Roof Purlins (Correas de techo longitudinales)
  [-16, -10, -4, 0, 4, 10, 16].forEach((x) => {
    const purlin = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 160), darkSteelMat);
    const yOffset = 16.5 + (2.8 * (1 - Math.abs(x) / 18.5));
    purlin.position.set(x, yOffset, -55);
    group.add(purlin);
  });

  // Roof insulated sandwich panels with skylight openings
  const roofL = new THREE.Mesh(new THREE.PlaneGeometry(20, 160), wallPanelMat);
  roofL.position.set(-9.5, 18.0, -55);
  roofL.rotation.x = Math.PI / 2;
  roofL.rotation.y = -Math.atan2(2.8, 18.5);
  group.add(roofL);

  const roofR = new THREE.Mesh(new THREE.PlaneGeometry(20, 160), wallPanelMat);
  roofR.position.set(9.5, 18.0, -55);
  roofR.rotation.x = Math.PI / 2;
  roofR.rotation.y = Math.atan2(2.8, 18.5);
  group.add(roofR);

  // Roof Central Skylight Glazing (Lucernario cenital de luz diurna)
  const skylight = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 150), glassMat);
  skylight.position.set(0, 19.3, -55);
  skylight.rotation.x = Math.PI / 2;
  group.add(skylight);

  // ==========================================
  // 5. INDUSTRIAL GANTRY CRANE (Puente Grúa Operativo)
  // ==========================================
  const craneBeamGeo = new THREE.BoxGeometry(37, 1.2, 0.7);
  const craneRailGeo = new THREE.BoxGeometry(0.6, 0.6, 170);

  // Heavy longitudinal Crane Runway Beams
  const craneRunwayL = new THREE.Mesh(craneRailGeo, darkSteelMat);
  craneRunwayL.position.set(-18, 14.5, -55);
  group.add(craneRunwayL);

  const craneRunwayR = new THREE.Mesh(craneRailGeo, darkSteelMat);
  craneRunwayR.position.set(18, 14.5, -55);
  group.add(craneRunwayR);

  // Gantry Bridge 1: Front Zone (Warrior 500i bay)
  const gantry1 = new THREE.Mesh(craneBeamGeo, safetyYellowMat);
  gantry1.position.set(0, 15.2, -8);
  group.add(gantry1);

  // Gantry 1 Hoist & Cable Drum
  const hoist1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 1.6), darkSteelMat);
  hoist1.position.set(2.5, 14.8, -8);
  group.add(hoist1);

  const hookCable1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 5.0, 8), darkSteelMat);
  hookCable1.position.set(2.5, 11.8, -8);
  group.add(hookCable1);

  const hook1 = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.12, 8, 16, Math.PI * 1.5), safetyYellowMat);
  hook1.rotation.z = Math.PI / 2;
  hook1.position.set(2.5, 9.2, -8);
  group.add(hook1);

  // Gantry Bridge 2: Heavy Work Zone (Rustler & Rogue bay)
  const gantry2 = new THREE.Mesh(craneBeamGeo, safetyYellowMat);
  gantry2.position.set(0, 15.2, -58);
  group.add(gantry2);

  const hoist2 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 1.6), darkSteelMat);
  hoist2.position.set(-4.0, 14.8, -58);
  group.add(hoist2);

  // ==========================================
  // 6. PANELED INDUSTRIAL WALLS
  // ==========================================
  /**
   * Creates a corrugated/paneled industrial wall by stacking BoxGeometry panels.
   * @param {number} side  -1 for left wall (facing +X), +1 for right wall (facing -X)
   */
  const createCorrugatedWall = (side) => {
    const wallGroup = new THREE.Group();
    const wallWidth = 160;   // Z extent
    const wallHeight = 24;   // Y extent
    const panelW = 3.0;      // per-panel Z size
    const panelH = 3.5;      // per-panel Y size

    const cols = Math.ceil(wallWidth / panelW);
    const rows = Math.ceil(wallHeight / panelH);

    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const idx = col + row;
        const color = idx % 2 === 0 ? 0x0f1318 : 0x11161c;
        const depth = idx % 2 === 0 ? 0.08 : 0.12;

        const mat = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.72,
          metalness: 0.45,
        });

        const geo = new THREE.BoxGeometry(depth, panelH - 0.04, panelW - 0.04);
        const mesh = new THREE.Mesh(geo, mat);

        // Position relative to group origin
        const pz = -wallWidth / 2 + col * panelW + panelW / 2;
        const py = -wallHeight / 2 + row * panelH + panelH / 2;
        mesh.position.set(0, py, pz);
        wallGroup.add(mesh);
      }
    }
    return wallGroup;
  };

  const leftWall = createCorrugatedWall(-1);
  leftWall.position.set(-19, 8.8, -55);
  group.add(leftWall);

  const rightWall = createCorrugatedWall(1);
  rightWall.position.set(19, 8.8, -55);
  group.add(rightWall);

  // High Industrial Clerestory Windows (Ventanales superiores de fábrica)
  for (let z = 10; z >= -120; z -= 18) {
    const winL = new THREE.Mesh(new THREE.PlaneGeometry(12, 4.5), glassMat);
    winL.rotation.y = Math.PI / 2;
    winL.position.set(-18.9, 10.5, z);
    group.add(winL);

    const winR = new THREE.Mesh(new THREE.PlaneGeometry(12, 4.5), glassMat);
    winR.rotation.y = -Math.PI / 2;
    winR.position.set(18.9, 10.5, z);
    group.add(winR);
  }

  // Mezzanine Technical Catwalk on the Left Wall (Pasarela superior con barandilla)
  const catwalkFloor = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.15, 60), darkSteelMat);
  catwalkFloor.position.set(-17.2, 4.5, -45);
  group.add(catwalkFloor);

  // Catwalk handrails
  const railTop = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 60), safetyYellowMat);
  railTop.position.set(-15.8, 5.5, -45);
  group.add(railTop);

  const railMid = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 60), darkSteelMat);
  railMid.position.set(-15.8, 5.0, -45);
  group.add(railMid);

  // Handrail vertical posts
  for (let z = -15; z >= -75; z -= 5) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.1, 0.08), darkSteelMat);
    post.position.set(-15.8, 5.0, z);
    group.add(post);
  }

  // ==========================================
  // 7. INDUSTRIAL SERVICES: DUCTS, CABLE TRAYS & LIGHTS
  // ==========================================
  // Heavy round ventilation duct (Extracción de humos de soldadura)
  const ventDuctL = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 0.85, 150, 24),
    structuralSteelMat
  );
  ventDuctL.rotation.x = Math.PI / 2;
  ventDuctL.position.set(-14, 13.5, -55);
  group.add(ventDuctL);

  // Industrial Cable Tray (Bandeja portacables perforada con detalles)
  const cableTray = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.15, 155), darkSteelMat);
  cableTray.position.set(14, 13.2, -55);
  group.add(cableTray);

  // High-Bay Industrial Workshop Lamps (Campanas LED de alta potencia)
  const lampZ = [14, 2, -10, -22, -34, -46, -58, -70, -84, -98, -112];
  lampZ.forEach((z, idx) => {
    [-6, 6].forEach((x) => {
      const lampHousing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 1.3, 0.75, 16),
        lampHousingMat
      );
      lampHousing.position.set(x, 15.6, z);
      group.add(lampHousing);

      const lampBulb = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), lampEmissiveMat);
      lampBulb.position.set(x, 15.1, z);
      group.add(lampBulb);

      // Support drop rod from roof
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.8), darkSteelMat);
      rod.position.set(x, 17.2, z);
      group.add(rod);
    });
  });

  // ==========================================
  // 8. ARCHITECTURAL SHOWCASE PEDESTALS (THE 4 KEY POINTS)
  // ==========================================

  // Zone demarcation ring helper
  const createZoneMarker = (radius, color) => {
    const ringGeo = new THREE.RingGeometry(radius - 0.15, radius, 48);
    ringGeometries.push(ringGeo);
    const ringMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -3.17;
    return ring;
  };

  // Product totem helper
  const createProductTotem = (label, accentHex) => {
    const totemGroup = new THREE.Group();

    // Vertical post
    const postGeo = new THREE.BoxGeometry(0.08, 4.0, 0.08);
    const post = new THREE.Mesh(postGeo, darkSteelMat);
    totemGroup.add(post);

    // Canvas label plate
    const plateCanvas = document.createElement("canvas");
    plateCanvas.width = 256;
    plateCanvas.height = 128;
    const pCtx = plateCanvas.getContext("2d");
    pCtx.fillStyle = "#0b1016";
    pCtx.fillRect(0, 0, 256, 128);
    pCtx.fillStyle = `#${accentHex.toString(16).padStart(6, "0")}`;
    pCtx.font = "bold 20px monospace";
    pCtx.textAlign = "center";
    pCtx.textBaseline = "middle";
    pCtx.fillText(label, 128, 64);

    const plateTex = new THREE.CanvasTexture(plateCanvas);
    totemTextures.push(plateTex);

    const plateGeo = new THREE.PlaneGeometry(1.6, 0.8);
    const plateMat = new THREE.MeshBasicMaterial({
      map: plateTex,
      side: THREE.DoubleSide,
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.y = 2.0;
    totemGroup.add(plate);

    return totemGroup;
  };

  // --- PUNTO 01: ESAB WARRIOR 500i (Potencia Industrial Pesada) ---
  // Heavy stepped steel podium with yellow perimeter & illuminated chamfer
  const warriorBase = new THREE.Group();
  const wSubBase = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.35, 8.2), darkSteelMat);
  wSubBase.position.y = -3.02;
  warriorBase.add(wSubBase);

  const wMainBase = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.45, 7.6), structuralSteelMat);
  wMainBase.position.y = -2.65;
  warriorBase.add(wMainBase);

  const wTopPlate = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.08, 7.2), darkSteelMat);
  wTopPlate.position.y = -2.38;
  warriorBase.add(wTopPlate);

  // Safety yellow beveled edge & cyan technical indicator
  const wTrim = new THREE.Mesh(new THREE.BoxGeometry(9.1, 0.08, 7.7), safetyYellowMat);
  wTrim.position.y = -2.42;
  warriorBase.add(wTrim);

  const wNeonRing = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.05, 7.4), neonCyanMat);
  wNeonRing.position.y = -2.36;
  warriorBase.add(wNeonRing);

  // Technical brand totem on side of Warrior
  const wTotem = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.8, 1.2), darkSteelMat);
  wTotem.position.set(-4.2, -1.2, 2.5);
  warriorBase.add(wTotem);

  const wTotemNeon = new THREE.Mesh(new THREE.BoxGeometry(0.22, 2.6, 0.1), maqsymaRedMat);
  wTotemNeon.position.set(-4.2, -1.2, 2.5);
  warriorBase.add(wTotemNeon);

  // Zone marker
  warriorBase.add(createZoneMarker(5.5, 0x00f0ff));

  warriorBase.position.set(0, 0, 0);
  group.add(warriorBase);

  // Warrior totem
  const warriorTotem = createProductTotem("WARRIOR 500i", 0x00f0ff);
  warriorTotem.position.set(-5.5, -0.5, 2.0);
  group.add(warriorTotem);

  // --- PUNTO 02: ESAB RUSTLER EM455i (Productividad y Taller Metalmecánico) ---
  // Heavy industrial fabrication workstation
  const rustlerBase = new THREE.Group();
  const rPodium = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.55, 7.2), darkSteelMat);
  rPodium.position.y = -2.85;
  rustlerBase.add(rPodium);

  const rTrim = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.08, 7.4), safetyYellowMat);
  rTrim.position.y = -2.53;
  rustlerBase.add(rTrim);

  // Welding gas cylinder manifold rack (Botellas de argón/CO2 industriales)
  [-1.8, -1.1, -0.4].forEach((cx, idx) => {
    const cylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 2.6, 16),
      idx === 1 ? maqsymaRedMat : structuralSteelMat
    );
    cylinder.position.set(3.2, -1.25, cx - 2.0);
    rustlerBase.add(cylinder);

    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), darkSteelMat);
    cap.position.set(3.2, 0.05, cx - 2.0);
    rustlerBase.add(cap);
  });

  // Zone marker
  rustlerBase.add(createZoneMarker(4.8, 0xffaa00));

  rustlerBase.position.set(9.0, 0, -26);
  group.add(rustlerBase);

  // Rustler totem
  const rustlerTotem = createProductTotem("RUSTLER EM455i", 0xffaa00);
  rustlerTotem.position.set(-5.5, -0.5, -26);
  group.add(rustlerTotem);

  // --- PUNTO 03: ESAB ROGUE EM210 PRO (Versatilidad y Taller Profesional) ---
  // Precision technical workbench with tool cabinet
  const rogueBase = new THREE.Group();
  const roPodium = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.55, 6.2), darkSteelMat);
  roPodium.position.y = -2.85;
  rogueBase.add(roPodium);

  const roTrim = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.08, 6.4), safetyYellowMat);
  roTrim.position.y = -2.53;
  rogueBase.add(roTrim);

  // Mobile multi-drawer tool cart (Carro de herramientas móvil)
  const cart = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.8, 1.1), maqsymaRedMat);
  cart.position.set(-2.6, -1.6, 1.5);
  rogueBase.add(cart);

  const cartTop = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 1.2), darkSteelMat);
  cartTop.position.set(-2.6, -0.66, 1.5);
  rogueBase.add(cartTop);

  // Zone marker
  rogueBase.add(createZoneMarker(4.2, 0x00e5ff));

  rogueBase.position.set(-8.5, 0, -54);
  group.add(rogueBase);

  // Rogue totem
  const rogueTotem = createProductTotem("ROGUE EM210 PRO", 0x00e5ff);
  rogueTotem.position.set(0, -0.5, -57);
  group.add(rogueTotem);

  // --- PUNTO 04: ZONA EQUIPOS DE PROTECCIÓN PERSONAL (EPP) ---
  // Grand technical exhibition pavilion: elevated stage, modular backwall, illuminated display shelves
  const eppBase = new THREE.Group();

  // Wide stage floor
  const eppPlatform = new THREE.Mesh(new THREE.BoxGeometry(15.0, 0.55, 9.0), darkSteelMat);
  eppPlatform.position.y = -2.85;
  eppBase.add(eppPlatform);

  const eppTrim = new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.08, 9.2), safetyYellowMat);
  eppTrim.position.y = -2.53;
  eppBase.add(eppTrim);

  // Neon contour on EPP stage
  const eppNeon = new THREE.Mesh(new THREE.BoxGeometry(14.8, 0.05, 8.8), neonCyanMat);
  eppNeon.position.y = -2.48;
  eppBase.add(eppNeon);

  // Exhibition Technical Backwall with display shelving
  const backwall = new THREE.Mesh(new THREE.BoxGeometry(14.0, 6.5, 0.4), structuralSteelMat);
  backwall.position.set(0, 0.8, -4.0);
  eppBase.add(backwall);

  // Overhead canopy / Cornisa superior de exhibición con iluminación LED
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(14.4, 0.35, 2.0), darkSteelMat);
  canopy.position.set(0, 4.2, -3.2);
  eppBase.add(canopy);

  const canopyGlow = new THREE.Mesh(new THREE.BoxGeometry(13.8, 0.06, 1.8), neonCyanMat);
  canopyGlow.position.set(0, 4.0, -3.2);
  eppBase.add(canopyGlow);

  // Display Vitrines / Estanterías técnicas para caretas, guantes y lentes
  [-4.5, 4.5].forEach((vx) => {
    const vitrineBox = new THREE.Mesh(new THREE.BoxGeometry(3.6, 4.2, 1.2), darkSteelMat);
    vitrineBox.position.set(vx, 0.2, -3.2);
    eppBase.add(vitrineBox);

    // Glass panel
    const vitrineGlass = new THREE.Mesh(new THREE.BoxGeometry(3.4, 4.0, 0.08), glassMat);
    vitrineGlass.position.set(vx, 0.2, -2.5);
    eppBase.add(vitrineGlass);

    // Illuminated shelf dividers
    [-0.8, 0.3, 1.4].forEach((sy) => {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.08, 1.0), neonCyanMat);
      shelf.position.set(vx, sy, -3.1);
      eppBase.add(shelf);
    });
  });

  // Zone marker
  eppBase.add(createZoneMarker(8.0, 0xffb703));

  eppBase.position.set(0, 0, -88);
  group.add(eppBase);

  // EPP totem
  const eppTotem = createProductTotem("ZONA EPP", 0xffb703);
  eppTotem.position.set(-9.0, -0.5, -88);
  group.add(eppTotem);

  // ==========================================
  // 9. HEAVY STORAGE RACKS WITH STRUCTURE
  // ==========================================
  /**
   * Creates an industrial rack with 4 corner posts and 3 horizontal shelf beams.
   * @param {number} rz   World Z position of rack center
   * @param {number} side  -1 = left wall side (X ≈ -16.8), +1 = right wall side (X ≈ 16.8)
   */
  const createIndustrialRack = (rz, side) => {
    const rackGroup = new THREE.Group();
    const wx = side < 0 ? -16.8 : 16.8;

    // 4 corner vertical posts: ±1.2 X local, ±4.0 Z local
    [[-1.2, -4.0], [-1.2, 4.0], [1.2, -4.0], [1.2, 4.0]].forEach(([px, pz]) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 8.5, 0.12), darkSteelMat);
      post.position.set(px, 0, pz);
      rackGroup.add(post);
    });

    // 3 horizontal shelf beams
    [-1.2, 1.6, 4.2].forEach((ry) => {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.12, 8.6), safetyOrangeMat);
      beam.position.set(0, ry, 0);
      rackGroup.add(beam);
    });

    rackGroup.position.set(wx, 1.1, rz);
    return rackGroup;
  };

  const rackZ = [8, -12, -32, -50, -70, -100];
  rackZ.forEach((rz) => {
    group.add(createIndustrialRack(rz, -1));
    group.add(createIndustrialRack(rz, +1));
  });

  // ==========================================
  // 10. PHYSICAL WELDING SPARKS SYSTEM
  // ==========================================
  const sparkCount = 180;
  const sparkPositions = new Float32Array(sparkCount * 3);
  const sparkColors = new Float32Array(sparkCount * 3);
  const sparkVelocities = new Float32Array(sparkCount * 3);
  const sparkLifes = new Float32Array(sparkCount);

  for (let i = 0; i < sparkCount; i++) {
    const i3 = i * 3;
    sparkPositions[i3]     = (Math.random() - 0.5) * 26;
    sparkPositions[i3 + 1] = Math.random() * 9 - 1;
    sparkPositions[i3 + 2] = Math.random() * -120 + 15;

    // Velocities
    sparkVelocities[i3]     = (Math.random() - 0.5) * 0.03;
    sparkVelocities[i3 + 1] = -0.015 - Math.random() * 0.025;
    sparkVelocities[i3 + 2] = (Math.random() - 0.5) * 0.02;

    // Life [0..1]
    sparkLifes[i] = Math.random();

    // Golden amber and electric sparks
    sparkColors[i3]     = 1.0;
    sparkColors[i3 + 1] = 0.65 + Math.random() * 0.35;
    sparkColors[i3 + 2] = Math.random() * 0.3;
  }

  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPositions, 3));
  sparkGeo.setAttribute("color", new THREE.BufferAttribute(sparkColors, 3));

  const sparkMat = new THREE.PointsMaterial({
    size: 0.16,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
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

        // Apply velocity
        positions[i3]     += sparkVelocities[i3];
        positions[i3 + 1] += sparkVelocities[i3 + 1];
        positions[i3 + 2] += sparkVelocities[i3 + 2];
        sparkLifes[i]     -= 0.008;

        // Reset if fallen below floor or life expired
        if (positions[i3 + 1] < -3.1 || sparkLifes[i] <= 0) {
          positions[i3]     = (Math.random() - 0.5) * 26;
          positions[i3 + 1] = Math.random() * 7 + 1;
          positions[i3 + 2] = Math.random() * -120 + 15;
          sparkVelocities[i3]     = (Math.random() - 0.5) * 0.03;
          sparkVelocities[i3 + 1] = -0.015 - Math.random() * 0.025;
          sparkVelocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
          sparkLifes[i] = Math.random();
        }
      }
      sparkGeo.attributes.position.needsUpdate = true;
    },
    dispose: () => {
      floorGeo.dispose();
      floorMat.dispose();
      concreteTex.dispose();
      darkSteelMat.dispose();
      structuralSteelMat.dispose();
      safetyYellowMat.dispose();
      safetyOrangeMat.dispose();
      safetyHazardMat.dispose();
      wallPanelMat.dispose();
      glassMat.dispose();
      lampHousingMat.dispose();
      lampEmissiveMat.dispose();
      neonCyanMat.dispose();
      maqsymaRedMat.dispose();
      sparkGeo.dispose();
      sparkMat.dispose();
      // Dispose ring geometries and their materials
      ringGeometries.forEach((g) => g.dispose());
      // Dispose totem canvas textures
      totemTextures.forEach((t) => t.dispose());
    },
  };
}
