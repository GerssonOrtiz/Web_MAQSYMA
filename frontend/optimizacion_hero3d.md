# ⚡ Plan de Optimización — Hero 3D · MAQSYMA

> **Fecha:** Noviembre 2026 · **Archivos clave:** `Hero.jsx` · `IndustrialStage.js` · `ProductShowcase.js` · `LoadingScreen.jsx`

---

## 1. Diagnóstico — Por qué hay Latencia y Pantallazos Negros

### 1.1 Causas identificadas del scroll entrecortado

```
Síntomas reportados:
  ✗ La escena se pone negra al hacer scroll rápido
  ✗ Microfreezes / latencia al pasar de un "punto" al siguiente
  ✗ Sensación de no fluidez en móviles o laptops con GPU integrada
```

**Causa raíz #1 — Geometría excesiva no instanciada**

Los `createCorrugatedWall()` actuales generan ~**880 `Mesh` individuales** (55 columnas × 8 filas × 2 paredes). Cada `Mesh` es una draw call separada. Con 880 draw calls solo para las paredes, el GPU se satura antes de renderizar los productos.

```
Inventario actual de draw calls estimadas:
  Paredes paneladas:      ~880  (el problema más grande)
  Columnas HEB:           ~108  (9 vanos × 2 lados × 6 piezas)
  Racks industriales:     ~96   (12 racks × 8 piezas)
  Lámparas:               ~66   (22 lámparas × 3 piezas)
  Chispas:                1     (Points = 1 draw call, OK)
  ─────────────────────────────
  TOTAL estimado:         ~1200 draw calls por frame
  
  Límite sano para 60fps en laptop con GPU integrada: ~200-400
```

**Causa raíz #2 — Texturas de producto cargadas sin preload**

`THREE.TextureLoader` carga las imágenes de producto (`warrior/front.webp`, etc.) de forma asíncrona **después** de que el Three.js ya comenzó a renderizar. Esto produce el flash negro: el renderer intenta mostrar una textura que aún no llegó desde el servidor.

**Causa raíz #3 — RAF sin throttling en tabs inactivos**

El `requestAnimationFrame` corre a 60fps aunque el usuario no vea la escena (tab en segundo plano, scroll fuera del viewport). Desperdicia CPU/GPU y causa acumulación de lag cuando el usuario regresa a la pestaña.

**Causa raíz #4 — `setScrollProgress` en cada frame de scroll**

`onProgressUpdate` llama a `setScrollProgress(progress)` en cada tick de GSAP ScrollTrigger, que provoca un **re-render de React** completo del componente en cada pixel de scroll. Esto es costoso.

---

## 2. Optimizaciones de Fluidez — Implementación

### 2.1 🔥 CRÍTICO — Reemplazar paredes por `InstancedMesh`

**Impacto: reduce de ~880 draw calls a 2.** Es la mejora más importante.

```js
// En IndustrialStage.js — reemplazar createCorrugatedWall() por:

const createInstancedWalls = () => {
  const panelW = 3.0, panelH = 3.5;
  const cols = Math.ceil(160 / panelW);   // 54
  const rows = Math.ceil(24  / panelH);   // 7
  const count = cols * rows;              // 378 paneles por pared = 756 total

  // Material base único compartido
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x101418,
    roughness: 0.72,
    metalness: 0.45,
  });

  const panelGeo = new THREE.BoxGeometry(0.10, panelH - 0.04, panelW - 0.04);
  const instancedWall = new THREE.InstancedMesh(panelGeo, wallMat, count * 2);
  instancedWall.castShadow = false;
  instancedWall.receiveShadow = false;

  const dummy = new THREE.Object3D();
  let idx = 0;

  [-19, 19].forEach((wx) => {               // dos paredes
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const pz = -160 / 2 + col * panelW + panelW / 2;
        const py = -24  / 2 + row * panelH + panelH / 2;
        // Offset leve en X para simular relieve (alternado)
        const offsetX = (col + row) % 2 === 0 ? 0 : 0.03;

        dummy.position.set(wx + (wx < 0 ? -offsetX : offsetX), py + 8.8, pz - 55);
        dummy.updateMatrix();
        instancedWall.setMatrixAt(idx, dummy.matrix);

        // Variar color ligeramente usando setColorAt
        const c = (col + row) % 2 === 0 ? 0.063 : 0.069;
        instancedWall.setColorAt(idx, new THREE.Color(c, c + 0.002, c + 0.004));
        idx++;
      }
    }
  });

  instancedWall.instanceMatrix.needsUpdate = true;
  if (instancedWall.instanceColor) instancedWall.instanceColor.needsUpdate = true;

  return instancedWall;
};

group.add(createInstancedWalls());
// Eliminar las llamadas a createCorrugatedWall() y leftWall/rightWall
```

---

### 2.2 🔥 CRÍTICO — Instanciar también columnas y racks

```js
// Columnas HEB — una sola InstancedMesh para todos los webs
const columnCount = 9 * 2; // 9 vanos × 2 lados = 18
const colWebGeo = new THREE.BoxGeometry(0.14, 22, 0.7);
const colWebInstanced = new THREE.InstancedMesh(colWebGeo, structuralSteelMat, columnCount);
// ... (setMatrixAt en loop sobre colZPositions y ±18.5)
group.add(colWebInstanced);

// Racks — 6 posiciones × 2 lados × 4 postes = 48 postes → 1 draw call
const rackPostGeo = new THREE.BoxGeometry(0.12, 8.5, 0.12);
const rackPostInstanced = new THREE.InstancedMesh(rackPostGeo, darkSteelMat, 48);
// ... (setMatrixAt en loop sobre rackZ, sides y esquinas)
group.add(rackPostInstanced);
```

**Resultado final de draw calls con instancing:**

| Elemento | Sin instancing | Con instancing |
|---|---|---|
| Paredes | ~880 | **2** |
| Columnas HEB | ~108 | **4** (web, flanges, basePlate, topPlate) |
| Racks | ~96 | **2** (postes + vigas) |
| **Total** | **~1200** | **~130** |

---

### 2.3 Throttling del RAF — Pausa cuando no es visible

```js
// En Hero.jsx — dentro del useEffect, después de crear el renderer:

// Visibility API: pausa el RAF cuando el tab no está activo
let isVisible = true;
const onVisibility = () => {
  isVisible = !document.hidden;
};
document.addEventListener('visibilitychange', onVisibility);

// IntersectionObserver: pausa cuando el hero no está en viewport
let isInViewport = true;
const observer = new IntersectionObserver(
  ([entry]) => { isInViewport = entry.isIntersecting; },
  { threshold: 0.01 }
);
observer.observe(container);

// Modificar el RAF:
const animate = () => {
  animationFrameId = requestAnimationFrame(animate);

  // Skip render if not visible — ahorra 60fps de GPU innecesario
  if (!isVisible || !isInViewport) return;

  // ... resto del código de animate
};

// En el cleanup:
document.removeEventListener('visibilitychange', onVisibility);
observer.disconnect();
```

---

### 2.4 Eliminar re-renders de React en cada tick de scroll

```js
// En Hero.jsx — reemplazar useState por useRef para el progreso

// ANTES (causa un re-render de React por cada pixel de scroll):
const [scrollProgress, setScrollProgress] = useState(0);
// ...
onProgressUpdate: (progress) => { setScrollProgress(progress); },

// DESPUÉS — el progreso va por ref al overlay vía callback directo:
const scrollProgressRef = useRef(0);

// Pasar un setter al overlay que actualice el DOM directamente
const overlayProgressRef = useRef(null); // ref al DOM del overlay

onProgressUpdate: (progress) => {
  scrollProgressRef.current = progress;
  // Actualizar el DOM del progress bar directamente, sin re-render React
  if (overlayProgressRef.current) {
    overlayProgressRef.current.style.width = `${Math.round(progress * 100)}%`;
  }
},
```

> [!TIP]
> Con este cambio, el scroll del Hero pasa de ~60 re-renders React/segundo a **0**. Solo el cambio de escena (`onSceneChange`) sigue siendo un re-render, lo cual es correcto (es un cambio significativo de UI).

---

### 2.5 PixelRatio Adaptativo según Rendimiento

```js
// En Hero.jsx — detectar si el dispositivo es de baja potencia
const isLowEnd = () => {
  // GPU integrada o móvil probable si:
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4; // GB (si disponible)
  return cores <= 4 || memory <= 2;
};

renderer.setPixelRatio(
  isLowEnd()
    ? Math.min(window.devicePixelRatio, 1.0)   // Calidad reducida
    : Math.min(window.devicePixelRatio, 2.0)   // Alta calidad
);

// También reducir antialias en dispositivos de baja potencia:
const renderer = new THREE.WebGLRenderer({
  powerPreference: "high-performance",
  antialias: !isLowEnd(),  // Sin antialias en low-end = +15-20% FPS
  alpha: false,
});
```

---

## 3. Imágenes: ¿Supabase CDN o Assets Locales?

### 3.1 Análisis comparativo

| Factor | Assets Locales (`/public/assets/`) | Supabase Storage CDN |
|---|---|---|
| **Latencia inicial** | ✅ Servidas desde el mismo dominio (Vercel CDN) | ⚠️ Request a subdominio externo (`*.supabase.co`) |
| **Cache** | ✅ Cache-Control del CDN de Vercel automático | ⚠️ Requiere configurar headers de caché manualmente |
| **CORS** | ✅ Sin problemas de CORS | ⚠️ Puede requerir configuración de CORS en Supabase |
| **Flash negro al cargar** | ⚠️ Mismo problema si no hay preload | ⚠️ Peor: latencia de red adicional a otro dominio |
| **Actualizar imágenes** | ⚠️ Requiere redeploy | ✅ Cambio inmediato desde panel |
| **Tamaño del bundle** | Neutral (en `/public`, no en bundle JS) | Neutral |
| **Costo** | ✅ Gratis (incluido en Vercel) | ⚠️ Tiene límite de transferencia en plan gratuito |

### 3.2 Veredicto

> [!IMPORTANT]
> **Para el Hero 3D: mantener las imágenes en `/public/assets/` y agregar preload.** Mover a Supabase empeoraría la latencia porque agrega un salto de red extra antes del primer render.
>
> Supabase Storage SÍ conviene para: imágenes de productos del catálogo, fotos de blog, contenido dinámico que cambia frecuentemente (sin redeploy).

### 3.3 La solución real al flash negro: Preload de texturas ANTES del RAF

```js
// En Hero.jsx — precargar todas las texturas antes de iniciar el renderer

const PRODUCT_IMAGES = [
  '/assets/hero/products/warrior-500i/front.webp',
  '/assets/hero/products/rustler-em455i/front.webp',
  '/assets/hero/products/rogue-em210/front.webp',
  '/assets/hero/products/epp-zone/front.webp',
];

// Función de preload con Promise
const preloadTextures = (paths) => {
  const loader = new THREE.TextureLoader();
  return Promise.all(
    paths.map(
      (p) =>
        new Promise((resolve) => {
          loader.load(p, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.minFilter = THREE.LinearMipmapLinearFilter;
            tex.generateMipmaps = true;
            resolve({ path: p, texture: tex });
          },
          undefined,
          () => resolve({ path: p, texture: null }) // Fail gracefully
          );
        })
    )
  );
};

// En el useEffect:
useEffect(() => {
  let cancelled = false;

  preloadTextures(PRODUCT_IMAGES).then((textures) => {
    if (cancelled) return;

    // Pasar el mapa de texturas precargadas al ProductShowcase
    const textureMap = Object.fromEntries(
      textures.filter((t) => t.texture).map((t) => [t.path, t.texture])
    );

    // Inicializar la escena ya con texturas listas
    initScene(textureMap); // ← mover toda la lógica de Three.js aquí
  });

  return () => { cancelled = true; };
}, [rm]);
```

> [!NOTE]
> Con este patrón, el `LoadingScreen` no desaparece hasta que las 4 texturas estén cargadas. Elimina el flash negro por completo porque el renderer nunca intenta mostrar una textura vacía.

### 3.4 Formato y compresión óptimos de imágenes

```bash
# Las imágenes actuales son .webp — correcto.
# Verificar que estén bien comprimidas:

# Tamaño recomendado por imagen de producto:
# warrior/front.webp  → máx 400KB, 1200×1200px, calidad 85
# rustler/front.webp  → máx 350KB, 1000×1000px, calidad 85
# rogue/front.webp    → máx 280KB, 900×900px,   calidad 85
# epp-zone/front.webp → máx 450KB, 1400×900px,  calidad 85

# Si alguna supera estos límites, recomprimir con:
# squoosh.app (online) o cwebp -q 85 input.png -o output.webp
```

---

## 4. Mejora del Preloader — Quitar la Barra de Carga

### 4.1 Estado actual

El `LoadingScreen.jsx` actual muestra:
- ✅ Logo animado que vuela al navbar (efecto cinematográfico — mantener)
- ✅ Glows de fondo (cyan + amber — mantener)
- ❌ Barra de progreso `<div h-1 w-48>` con porcentaje falso (quitar)
- ❌ Texto "X% INICIALIZANDO MAQSYMA" (simplificar)

### 4.2 Nuevo diseño sin barra — Preloader Minimalista

```jsx
// LoadingScreen.jsx — reemplazar la sección de progress HUD por:

{/* Reemplaza el bloque completo de progress HUD */}
<motion.div
  animate={{
    opacity: phase === "fly" ? 0 : 1,
    scale: phase === "fly" ? 0.9 : 1,
  }}
  transition={{ duration: 0.3 }}
  className="absolute flex flex-col items-center space-y-6 pt-52"
>
  {/* Spinner minimalista — 3 puntos pulsantes */}
  <div className="flex items-center gap-2">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="h-1.5 w-1.5 rounded-full bg-cyan-400"
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          delay: i * 0.2,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>

  {/* Texto de marca minimalista — sin porcentaje */}
  <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/40">
    MAQSYMA · INDUSTRIAL
  </span>
</motion.div>
```

### 4.3 Integrar el preloader con la carga real de texturas

El problema del `progress` actual es que **es simulado** — no refleja la carga real. Con el preload de texturas, el preloader puede mostrarse hasta que las 4 imágenes realmente estén listas:

```jsx
// En App.js — pasar el estado real al LoadingScreen
export default function App() {
  const [ready, setReady] = useState(false);

  return (
    <ErrorBoundary>
      <div className="...">
        {!ready && (
          <LoadingScreen onLoadingComplete={() => setReady(true)} />
        )}
        <Navbar />
        <main>
          {/* Hero recibe onReady para notificar cuando las texturas cargaron */}
          <Hero onReady={() => setReady(true)} />
          {/* resto del contenido */}
        </main>
      </div>
    </ErrorBoundary>
  );
}
```

```jsx
// LoadingScreen.jsx simplificado — sin barra, sin porcentaje falso
// La animación dura mínimo 1.2s (suficiente para las texturas en conexión rápida)
// y espera a que Hero llame onLoadingComplete

useEffect(() => {
  // Esperar mínimo 1.4s para que el logo se vea correctamente
  const minTimer = setTimeout(() => {
    setPhase("ready-to-fly");
  }, 1400);
  return () => clearTimeout(minTimer);
}, []);

useEffect(() => {
  // Volar cuando tanto el tiempo mínimo cumplió como Hero está listo
  if (phase === "ready-to-fly" && heroReady) {
    setPhase("fly");
  }
}, [phase, heroReady]);
```

> [!TIP]
> Este patrón es el que usa **Vercel, Linear y Loom**: el loader espera el tiempo mínimo de animación Y que el contenido real esté listo. Nunca más flash negro.

---

## 5. Optimización del Entorno 3D — Detalles Adicionales

### 5.1 Frustum Culling Mejorado

Three.js ya hace frustum culling, pero las geometrías grandes (purlines de 160u de largo) lo bloquean:

```js
// En IndustrialStage.js — dividir objetos muy largos en segmentos
// ANTES: una purlin de 160u — siempre visible aunque esté fuera de cámara
const purlin = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 160), darkSteelMat);

// DESPUÉS: purlines en segmentos de 40u — el culling las descarta al salir de cámara
for (let seg = 0; seg < 4; seg++) {
  const purlin = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 40), darkSteelMat);
  purlin.position.z = -15 + seg * 40;
  group.add(purlin);
}
```

### 5.2 Reducir Luces Activas Simultáneas

Actualmente hay **13+ luces** activas simultáneamente (ambient + hemi + directional + 4 spotlights + 8 point lights). Cada luz con shadow cost = O(n_objetos) extra.

```js
// En LightingRig.js — desactivar spotlights de zonas no visibles según la escena:
// Exponer método updateActiveScene al exterior

return {
  group,
  updateActiveScene: (sceneIdx) => {
    // Solo activar la spotlight de la escena activa
    spotWarrior.intensity  = sceneIdx === 0 ? 9.0 : 2.0;
    spotRustler.intensity  = sceneIdx === 1 ? 8.8 : 2.0;
    spotRogue.intensity    = sceneIdx === 2 ? 8.5 : 2.0;
    spotEPP.intensity      = sceneIdx === 3 ? 9.5 : 2.0;
  },
  updateCursorLight,
  dispose,
};

// En Hero.jsx — llamar en onSceneChange:
onSceneChange: (sceneIdx) => {
  setActiveScene(sceneIdx);
  activeSceneRef.current = sceneIdx;
  lighting.updateActiveScene(sceneIdx);
},
```

### 5.3 LOD (Level of Detail) para Elementos Distantes

```js
// Usar THREE.LOD para los racks que están lejos de la cámara
import { LOD } from 'three';

const rackLOD = new THREE.LOD();

// Alta calidad (cerca: < 30 unidades de la cámara)
rackLOD.addLevel(createIndustrialRack_HQ(rz, side), 0);

// Baja calidad (lejos: > 30 unidades — un simple BoxGeometry)
const rackLow = new THREE.Mesh(
  new THREE.BoxGeometry(2.6, 8.5, 9.0),
  darkSteelMat
);
rackLOD.addLevel(rackLow, 30);

group.add(rackLOD);
```

### 5.4 Comprimir la Niebla para Reducir Rasterización

```js
// La niebla actual en Escena 1 (near: 45, far: 130) deja mucha geometría
// visible. Ajustar para que el GPU descarte más fragmentos:

const fogConfig = [
  { near: 50, far: 150 },   // Escena 0 — Warrior visible + algo de fondo
  { near: 38, far: 100 },   // Escena 1 — Rustler en foco, fondo muy oscuro
  { near: 32, far: 95  },   // Escena 2 — Rogue en foco, fondo muy oscuro
  { near: 60, far: 200 },   // Escena 3 — EPP necesita el backwall visible
];
```

---

## 6. Sugerencias Adicionales de Mejora

### 6.1 🎬 "Scroll Snap" Suave por Escena

Actualmente el scroll es completamente libre (400vh). Agregar un snap suave entre escenas mejora la narrativa:

```js
// En CameraTimeline.js — agregar "pausa dramática" al llegar a cada waypoint impar
// (los waypoints pares son el "close-up" de cada producto)

// Incrementar el scrub cuando se acerca a un punto clave:
scrollTrigger: {
  scrub: 1.2,  // actual
  // Cambiar a scrub adaptativo: más suave en zonas de producto
}

// Alternativa CSS en el scrollWrapper:
// scroll-snap-type: y mandatory;  (con sections de 100vh)
```

### 6.2 🔊 Sonido Ambiental Opcional

Una capa de sonido industrial muy sutil (zumbido eléctrico, chispas lejanas) sincronizada con la escena activa incrementa la inmersión significativamente. Usar `Howler.js` (3KB gzipped):

```js
// Solo se activa si el usuario ya interactuó con la página (política de autoplay)
import { Howl } from 'howler';

const ambientSounds = {
  0: new Howl({ src: ['/audio/welding_arc.mp3'], volume: 0.08, loop: true }),
  3: new Howl({ src: ['/audio/industrial_hum.mp3'], volume: 0.05, loop: true }),
};
```

### 6.3 📱 Fallback para Móvil (< 768px)

En pantallas pequeñas, el Hero 3D corre a baja resolución y el scroll de 400vh es difícil de manejar. Sugerencia: en mobile, reemplazar el Hero 3D por una versión estática con `<img>` y parallax CSS puro:

```jsx
// En Hero.jsx
const isMobile = window.innerWidth < 768;

return isMobile
  ? <HeroMobileStatic />  // Versión ligera: imagen + texto + botón
  : <HeroWebGL />;        // Versión 3D completa
```

**Beneficios:** elimina 580KB de bundle Three.js en mobile, carga instantánea, mejor SEO.

### 6.4 ✨ Efecto de "Scan Line" al cambiar de Escena

Al cambiar entre el Warrior → Rustler → Rogue → EPP, agregar un flash horizontal de "scan" cinematográfico:

```jsx
// En CinemaOverlay.jsx — agregar junto al AnimatePresence del title:
<AnimatePresence>
  <motion.div
    key={`scan-${activeScene}`}
    initial={{ scaleY: 0, opacity: 0.6 }}
    animate={{ scaleY: [0, 1, 1, 0], opacity: [0, 0.4, 0.4, 0] }}
    transition={{ duration: 0.5, times: [0, 0.2, 0.8, 1] }}
    className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-cyan-400 shadow-[0_0_20px_#00f0ff]"
  />
</AnimatePresence>
```

### 6.5 🖥 Indicador de FPS en Desarrollo

Agregar `stats.js` solo en `NODE_ENV === 'development'` para monitorear el rendimiento durante el desarrollo:

```js
// En Hero.jsx — solo en desarrollo
if (process.env.NODE_ENV === 'development') {
  const Stats = (await import('three/examples/jsm/libs/stats.module.js')).default;
  const stats = new Stats();
  stats.showPanel(0); // 0 = FPS, 1 = MS, 2 = MB
  document.body.appendChild(stats.dom);

  // En el RAF:
  const animate = () => {
    stats.begin();
    // ... render ...
    stats.end();
  };
}
```

### 6.6 🌐 Precarga de la Siguiente Ruta (Prefetch)

```jsx
// En index.html o App.js — precargar assets críticos del hero:
<link rel="preload" href="/assets/hero/products/warrior-500i/front.webp" as="image" type="image/webp" />
<link rel="preload" href="/assets/hero/products/rustler-em455i/front.webp" as="image" type="image/webp" />
<link rel="preload" href="/assets/hero/products/rogue-em210/front.webp" as="image" type="image/webp" />
<link rel="preload" href="/assets/hero/products/epp-zone/front.webp" as="image" type="image/webp" />
<link rel="preload" href="/assets/Logo_MAQSYMA.png" as="image" />
```

Esto hace que el navegador descargue las imágenes en paralelo con el JS, antes de que Three.js las solicite.

### 6.7 📊 Web Vitals Mínimas Recomendadas

| Métrica | Actual estimado | Objetivo |
|---|---|---|
| **LCP** (Largest Contentful Paint) | ~3-4s (canvas 3D tarda) | < 2.5s con preload |
| **CLS** (Cumulative Layout Shift) | ~0 (canvas ocupa 100vh fijo) | < 0.1 ✅ |
| **FID** / **INP** | ~200-400ms (RAF bloqueante) | < 100ms con RAF throttling |
| **TTI** (Time to Interactive) | ~4-5s | < 3s con instancing |

---

## 7. Checklist de Implementación — Por Prioridad

```
🔴 CRÍTICO — Fluidez inmediata
  [ ] Reemplazar createCorrugatedWall() por InstancedMesh (880→2 draw calls)
  [ ] Instanciar columnas HEB y racks (108+96→6 draw calls)
  [ ] Throttling RAF con visibilitychange + IntersectionObserver
  [ ] Preload de texturas ANTES de iniciar el RAF (elimina flash negro)
  [ ] <link rel="preload"> en index.html para las 4 imágenes de producto

🟡 IMPORTANTE — Calidad de experiencia
  [ ] Eliminar barra de progreso del LoadingScreen (reemplazar por dots)
  [ ] Conectar LoadingScreen con carga real de texturas (no tiempo simulado)
  [ ] Pasar scrollProgress por ref en lugar de useState (0 re-renders React)
  [ ] PixelRatio adaptativo según hardware (isLowEnd())
  [ ] updateActiveScene() en LightingRig — reducir intensidad de luces no activas

🟢 MEJORAS — Pulido y experiencia
  [ ] LOD para racks lejanos (> 30 unidades de cámara)
  [ ] Comprimir fogConfig — near/far más agresivos en escenas 1 y 2
  [ ] Scan line effect al cambiar de escena (CinemaOverlay)
  [ ] HeroMobile estático para dispositivos < 768px
  [ ] Stats.js en development para monitoreo de FPS
  [ ] Sonido ambiental (Howler.js) — opcional, con toggle en UI
```

---

> [!WARNING]
> El cambio más crítico es el `InstancedMesh` para las paredes. Con ~880 draw calls solo para los paneles, en hardware integrado (Intel Iris, Apple M-chip con memoria compartida) se puede caer a 15-20fps. Con instancing, el mismo hardware debe lograr 55-60fps estables.

> [!NOTE]
> Las imágenes de producto deben quedarse en `/public/assets/` (Vercel CDN). Moverlas a Supabase solo tiene sentido cuando el catálogo crezca y necesites actualizarlas sin redeploy — en ese momento, usa el Storage CDN de Supabase con `Cache-Control: public, max-age=31536000` en los headers del bucket.
