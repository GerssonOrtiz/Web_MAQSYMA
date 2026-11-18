# 🎬 PLAN: Hero Parallax Cinematográfico con Frames Extraídos de Video

> Transformar los 4 videos del showroom MAQSYMA en una experiencia de scroll parallax multicapa con profundidad real, eliminando la dependencia de Three.js para el hero principal y usando imágenes estáticas de alta calidad con movimiento parallax para lograr rendimiento superior en móviles y escritorio.

---

## 📋 Índice

1. [Contexto y Diagnóstico](#1-contexto-y-diagnóstico)
2. [Inventario de Videos](#2-inventario-de-videos)
3. [Estrategia de Extracción de Frames](#3-estrategia-de-extracción-de-frames)
4. [Arquitectura Parallax Multicapa](#4-arquitectura-parallax-multicapa)
5. [Pipeline de Procesamiento de Imágenes](#5-pipeline-de-procesamiento-de-imágenes)
6. [Diseño del Componente Hero Parallax](#6-diseño-del-componente-hero-parallax)
7. [Experiencia Responsive](#7-experiencia-responsive)
8. [Implementación Técnica](#8-implementación-técnica)
9. [Optimización de Rendimiento](#9-optimización-de-rendimiento)
10. [Cronograma de Ejecución](#10-cronograma-de-ejecución)

---

## 1. Contexto y Diagnóstico

### Estado Actual
El Hero de MAQSYMA es un escenario 3D completo construido con **Three.js + GSAP ScrollTrigger** que genera una nave industrial procedural con:
- 4 zonas de exhibición (Warrior, Rustler, Rogue, EPP)
- Recorrido cinemático controlado por scroll (`400vh`)
- HUD overlay con fichas técnicas

### Problema
- **GPU-intensivo**: Rendering en tiempo real consume recursos significativos
- **Móvil**: Requiere fallback estático en pantallas < 768px
- **Carga inicial**: Precarga de texturas WebGL + geometría = tiempo alto de first paint
- **Los 4 videos del showroom** (`public/assets/hero/videos/`) NO se utilizan actualmente

### Propuesta
Usar los **4 videos cinematográficos del showroom** como fuente de frames estáticos de alta calidad, descomponerlos en **capas de profundidad** (fondo, medio, primer plano) y construir un **hero parallax scroll-driven** que:
- Funcione con rendimiento nativo CSS/JS (sin WebGL)
- Ofrezca la misma sensación de inmersión 3D mediante parallax multicapa
- Sea **responsive-first** (móvil y escritorio con la misma calidad)
- Pueda coexistir o reemplazar el hero 3D actual

---

## 2. Inventario de Videos

| Video | Archivo | Resolución | FPS | Duración | Frames | Contenido |
|-------|---------|-----------|-----|----------|--------|-----------|
| 1 | `1.mp4` | 1280×720 | 24 | 5.0s | 120 | **Fachada exterior** del showroom MAQSYMA/ESAB — Logo principal, ventanales, iluminación dorada, piso reflejante |
| 2 | `2.mp4` | 1280×720 | 24 | 5.0s | 120 | **Lobby interior** — Recepción con logo MAQSYMA, pedestal de exhibición, logo ESAB al fondo, piso pulido |
| 3 | `3.mp4` | 1280×720 | 24 | 10.0s | 240 | **Showroom central** — Máquinas ESAB en pedestales, pared central con logo, banderas ESAB, "Build Stronger" |
| 4 | `4.mp4` | 1280×720 | 24 | 10.0s | 240 | **Zona EPP** — Cascos de soldadura, guantes, accesorios, logo MAQSYMA, exhibidores de accesorios |

**Total**: ~720 frames disponibles · ~22.5 MB de video fuente

---

## 3. Estrategia de Extracción de Frames

### 3.1 Frames Clave por Video (FFmpeg)

No necesitamos los 720 frames. Seleccionaremos **frames clave estratégicos** que capturen los mejores momentos de cada escena:

```bash
# Directorio de salida
mkdir -p public/assets/hero/frames/{scene-1,scene-2,scene-3,scene-4}/{bg,mid,fg}

# ─── ESCENA 1: Fachada (5s, 24fps = 120 frames) ───
# Extraer 6 frames clave a intervalos de ~0.8s
ffmpeg -i public/assets/hero/videos/1.mp4 \
  -vf "select='eq(n\,0)+eq(n\,20)+eq(n\,40)+eq(n\,60)+eq(n\,80)+eq(n\,100)',scale=1920:1080:flags=lanczos" \
  -vsync vfr -q:v 1 \
  public/assets/hero/frames/scene-1/key_%02d.png

# ─── ESCENA 2: Lobby (5s = 120 frames) ───
ffmpeg -i public/assets/hero/videos/2.mp4 \
  -vf "select='eq(n\,0)+eq(n\,24)+eq(n\,48)+eq(n\,72)+eq(n\,96)+eq(n\,110)',scale=1920:1080:flags=lanczos" \
  -vsync vfr -q:v 1 \
  public/assets/hero/frames/scene-2/key_%02d.png

# ─── ESCENA 3: Showroom (10s = 240 frames) ───
ffmpeg -i public/assets/hero/videos/3.mp4 \
  -vf "select='eq(n\,0)+eq(n\,40)+eq(n\,80)+eq(n\,120)+eq(n\,160)+eq(n\,200)+eq(n\,230)',scale=1920:1080:flags=lanczos" \
  -vsync vfr -q:v 1 \
  public/assets/hero/frames/scene-3/key_%02d.png

# ─── ESCENA 4: EPP (10s = 240 frames) ───
ffmpeg -i public/assets/hero/videos/4.mp4 \
  -vf "select='eq(n\,0)+eq(n\,40)+eq(n\,80)+eq(n\,120)+eq(n\,160)+eq(n\,200)+eq(n\,230)',scale=1920:1080:flags=lanczos" \
  -vsync vfr -q:v 1 \
  public/assets/hero/frames/scene-4/key_%02d.png
```

### 3.2 Frames para Parallax Continuo (Scroll-Driven)

Para el efecto de movimiento continuo al hacer scroll, extraemos **una secuencia más densa** del frame más representativo de cada escena:

```bash
# Secuencia de scroll para Escena 1 (fachada → entrada)
# 30 frames para suavidad de scroll
ffmpeg -i public/assets/hero/videos/1.mp4 \
  -vf "fps=6,scale=1920:1080:flags=lanczos" \
  -q:v 2 \
  public/assets/hero/frames/scene-1/scroll_%03d.webp

# Repetir para escenas 2, 3, 4 con misma lógica
```

### 3.3 Frame Principal de Alta Resolución (Hero Shot)

```bash
# El frame más impactante de cada video como "hero shot" a máxima calidad
ffmpeg -i public/assets/hero/videos/1.mp4 -ss 2.5 -frames:v 1 -q:v 1 \
  -vf "scale=2560:1440:flags=lanczos" \
  public/assets/hero/frames/scene-1/hero_shot.png

ffmpeg -i public/assets/hero/videos/2.mp4 -ss 2.0 -frames:v 1 -q:v 1 \
  -vf "scale=2560:1440:flags=lanczos" \
  public/assets/hero/frames/scene-2/hero_shot.png

ffmpeg -i public/assets/hero/videos/3.mp4 -ss 4.0 -frames:v 1 -q:v 1 \
  -vf "scale=2560:1440:flags=lanczos" \
  public/assets/hero/frames/scene-3/hero_shot.png

ffmpeg -i public/assets/hero/videos/4.mp4 -ss 5.0 -frames:v 1 -q:v 1 \
  -vf "scale=2560:1440:flags=lanczos" \
  public/assets/hero/frames/scene-4/hero_shot.png
```

---

## 4. Arquitectura Parallax Multicapa

### 4.1 Sistema de Capas de Profundidad

Cada escena se descompone en **3 capas parallax** con velocidades de scroll distintas:

```
┌─────────────────────────────────────────────────────────┐
│                    VIEWPORT (100vh)                       │
│                                                          │
│  ┌─ CAPA 3: FOREGROUND (z=30) ──── speed: 1.4x ──────┐ │
│  │  Partículas / chispas / humo / bordes de máquinas   │ │
│  │  Elementos que pasan rápido al scrollear             │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌─ CAPA 2: MIDGROUND (z=0) ───── speed: 1.0x ───────┐ │
│  │  Máquinas ESAB / Pedestales / Logos / Muebles       │ │
│  │  El sujeto principal - velocidad base                │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌─ CAPA 1: BACKGROUND (z=-30) ── speed: 0.3x ───────┐ │
│  │  Estructura nave / Cerchas / Lucernario / Paredes   │ │
│  │  Se mueve lento = sensación de PROFUNDIDAD           │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌─ CAPA 0: DEEP BG ───────────── speed: 0.1x ───────┐ │
│  │  Gradiente/niebla oscura #06080A → transparente     │ │
│  │  Estático o casi estático                            │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Mapa de Capas por Escena

#### Escena 1 — Fachada Exterior
| Capa | Contenido | Velocidad Parallax | Efecto |
|------|-----------|-------------------|--------|
| **BG** | Cielo al atardecer + estructura superior del edificio | 0.2x | Apenas se mueve |
| **MID** | Fachada principal: ventanales, logo MAQSYMA, puertas | 1.0x | Referencia |
| **FG** | Vegetación lateral izquierda + reflejos del piso | 1.5x | Profundidad rápida |
| **Overlay** | Niebla/vignette radial + partículas luminosas flotando | CSS animated | Atmósfera |

#### Escena 2 — Lobby Interior
| Capa | Contenido | Velocidad Parallax | Efecto |
|------|-----------|-------------------|--------|
| **BG** | Techo con luces LED lineales + estructura metálica | 0.3x | Lento |
| **MID** | Recepción, logo MAQSYMA en pared, logo ESAB, pedestales | 1.0x | Base |
| **FG** | Pedestal dorado cercano + planta izquierda | 1.4x | Rápido |
| **Overlay** | Destellos de luz dorada + scan line sutil | CSS animated | Atmósfera tech |

#### Escena 3 — Showroom Central
| Capa | Contenido | Velocidad Parallax | Efecto |
|------|-----------|-------------------|--------|
| **BG** | Pared posterior con logo MAQSYMA + cerchas superiores | 0.25x | Muy lento |
| **MID** | Máquinas ESAB en pedestales + banderas | 1.0x | Base |
| **FG** | Máquinas laterales más cercanas (Rogue/Warrior al borde) | 1.6x | Inmersión |
| **Overlay** | Chispas de soldadura procedurales (canvas) + niebla amber | JS animated | Soldadura viva |

#### Escena 4 — Zona EPP
| Capa | Contenido | Velocidad Parallax | Efecto |
|------|-----------|-------------------|--------|
| **BG** | Pared de accesorios (guantes, cables, boquillas) + techo | 0.3x | Fondo |
| **MID** | Cascos de soldadura en exhibidores + logo + mesa central | 1.0x | Base |
| **FG** | Máquina ESAB izquierda + exhibidor frontal | 1.5x | Profundidad |
| **Overlay** | Halo rojo de seguridad (#FF3300) + scan perimetral | CSS + canvas | Alerta EPP |

---

## 5. Pipeline de Procesamiento de Imágenes

### 5.1 Separación en Capas (Semi-automática)

Para cada hero shot, se crean las 3 capas usando un **workflow asistido**:

```
Hero Shot (PNG 2560×1440)
     │
     ├─→ [Paso 1] Recorte de fondo → bg_layer.webp
     │     FFmpeg: Crop de zona superior/fondo del frame
     │     + blur gaussiano suave (simula profundidad de campo)
     │
     ├─→ [Paso 2] Sujeto principal → mid_layer.webp
     │     El frame completo (sirve como capa base)
     │
     └─→ [Paso 3] Elementos de primer plano → fg_layer.webp
           Recorte/mask de elementos laterales o cercanos
           Con transparencia (PNG con alpha)
```

### 5.2 Comandos FFmpeg para Post-procesado

```bash
# ── BG Layer: Blur de profundidad de campo ──
ffmpeg -i scene-1/hero_shot.png \
  -vf "crop=1920:600:0:0,scale=1920:1080:flags=lanczos,gblur=sigma=8" \
  -q:v 2 scene-1/bg/bg_layer.webp

# ── MID Layer: Frame completo optimizado ──
ffmpeg -i scene-1/hero_shot.png \
  -vf "scale=1920:1080:flags=lanczos" \
  -q:v 3 scene-1/mid/mid_layer.webp

# ── FG Layer: Recorte lateral con gradiente de transparencia ──
# (Requiere composición manual o script Python para mask)

# ── Formato final WebP para web ──
# Desktop: 1920×1080 @ quality 80
# Mobile:  828×1792 (iPhone Pro) @ quality 75
# Tablet:  1194×834 @ quality 78
```

### 5.3 Optimización de Assets Finales

| Formato | Resolución | Calidad | Uso |
|---------|-----------|---------|-----|
| `.webp` | 1920×1080 | q80 | Desktop BG/MID layers |
| `.webp` | 828×1792 | q75 | Mobile (vertical crop) |
| `.webp` | 960×540 | q70 | Low-end / `Save-Data` header |
| `.png` | 1920×1080 | — | FG layers con alpha (transparencia) |
| `.avif` | 1920×1080 | q65 | Navegadores modernos (30-50% más liviano) |

---

## 6. Diseño del Componente Hero Parallax

### 6.1 Estructura de Componentes React

```
HeroParallax/
├── HeroParallax.jsx          ← Orquestador principal
├── ParallaxScene.jsx         ← Una escena (bg + mid + fg + overlay)
├── ParallaxLayer.jsx         ← Capa individual con velocidad
├── SceneTransition.jsx       ← Crossfade entre escenas
├── SparkOverlay.jsx          ← Chispas procedurales (canvas 2D)
├── HeroTypography.jsx        ← Texto / CTA del hero
├── ProgressIndicator.jsx     ← Minimap NAVE → EPP (reutilizable)
└── hooks/
    ├── useParallaxScroll.js  ← Hook de scroll normalizado
    └── useIntersection.js    ← Lazy loading de capas
```

### 6.2 Mecánica de Scroll

```
Scroll Position (0% ─────────────────────────── 100%)
                 │                                │
 ┌───────────────┼────────────────────────────────┼──┐
 │ Scene 1       │ Scene 2    │ Scene 3  │ Scene 4│  │
 │ (0%-25%)      │ (25%-50%)  │(50%-75%) │(75-100)│  │
 │ Fachada       │ Lobby      │Showroom  │ EPP    │  │
 └───────────────┴────────────┴──────────┴────────┘
       ↕               ↕           ↕          ↕
   Parallax Y       Parallax Y  Parallax Y  Parallax Y
   + Fade In/Out    + Crossfade + Scale     + Final CTA
```

### 6.3 JSX Conceptual

```jsx
// HeroParallax.jsx
<section className="relative w-full" style={{ height: '400vh' }}>
  <div className="sticky top-0 h-screen w-full overflow-hidden">

    {/* Capa de fondo profundo — velocidad 0.2x */}
    <ParallaxLayer speed={0.2} className="absolute inset-0">
      <picture>
        <source srcSet="/assets/hero/frames/active/bg.avif" type="image/avif" />
        <source srcSet="/assets/hero/frames/active/bg.webp" type="image/webp" />
        <img src="/assets/hero/frames/active/bg.jpg" className="object-cover w-full h-full" />
      </picture>
    </ParallaxLayer>

    {/* Capa media — velocidad 1.0x (referencia) */}
    <ParallaxLayer speed={1.0} className="absolute inset-0">
      <img src="/assets/hero/frames/active/mid.webp" className="object-cover w-full h-full" />
    </ParallaxLayer>

    {/* Capa frontal — velocidad 1.5x */}
    <ParallaxLayer speed={1.5} className="absolute inset-0 pointer-events-none">
      <img src="/assets/hero/frames/active/fg.png" className="object-contain w-full h-full" />
    </ParallaxLayer>

    {/* Overlay atmosférico */}
    <SparkOverlay scene={activeScene} />

    {/* Vignette cinematográfico */}
    <div className="pointer-events-none absolute inset-0 bg-radial-vignette opacity-70" />

    {/* Tipografía y CTA */}
    <HeroTypography scene={activeScene} progress={progress} />

    {/* Minimap */}
    <ProgressIndicator progress={progress} scene={activeScene} />
  </div>
</section>
```

---

## 7. Experiencia Responsive

### 7.1 Breakpoints y Adaptación

```
┌──────────────────────────────────────────────────────────┐
│  DESKTOP (≥1024px)                                        │
│  ───────────────────                                      │
│  • 4 capas parallax completas (BG + MID + FG + Overlay)  │
│  • Parallax de mouse (gyroscope-like en hover)           │
│  • Chispas de soldadura con canvas 2D                     │
│  • Transiciones crossfade suaves entre escenas           │
│  • Minimap lineal NAVE → EPP                              │
│  • Resolución: 1920×1080 webp/avif                       │
├──────────────────────────────────────────────────────────┤
│  TABLET (768px–1023px)                                    │
│  ──────────────────────                                   │
│  • 3 capas parallax (BG + MID + FG, sin overlay canvas)  │
│  • Sin parallax de mouse                                  │
│  • Partículas reducidas (CSS particles)                   │
│  • Resolución: 1194×834 webp                             │
├──────────────────────────────────────────────────────────┤
│  MOBILE (< 768px)                                         │
│  ────────────────                                         │
│  • 2 capas parallax (BG desenfocado + MID)               │
│  • Scroll vertical nativo (sin librería extra)           │
│  • Giroscopio del dispositivo como parallax sutil        │
│  • FG layer desactivada (rendimiento)                    │
│  • Resolución: 828×1792 webp (crop vertical)             │
│  • Scroll height reducido: 300vh (vs 400vh desktop)      │
│  • prefers-reduced-motion: solo fades, sin parallax      │
└──────────────────────────────────────────────────────────┘
```

### 7.2 Crop Vertical para Móvil

Los frames 16:9 requieren un **crop inteligente** para 9:16 (móvil):

```bash
# Crop centrado en el sujeto principal (máquina/logo)
ffmpeg -i scene-3/hero_shot.png \
  -vf "crop=720:1280:280:0,scale=828:1472:flags=lanczos" \
  -q:v 2 scene-3/mid/mid_mobile.webp
```

> [!TIP]
> El punto focal de cada escena está centrado o ligeramente a la derecha.
> El crop debe preservar el logo MAQSYMA y la máquina protagonista de cada zona.

---

## 8. Implementación Técnica

### 8.1 Motor de Parallax (Scroll-Driven Animations API)

Priorizar la API nativa `ScrollTimeline` de CSS para rendimiento composited:

```css
/* Parallax con Scroll-Driven Animations (Chrome 115+, Firefox 125+) */
@keyframes parallax-bg {
  from { transform: translateY(0); }
  to   { transform: translateY(-30vh); }
}

.parallax-bg {
  animation: parallax-bg linear;
  animation-timeline: scroll();
  animation-range: entry 0% exit 100%;
  will-change: transform;
}

/* Fallback JS para Safari */
```

### 8.2 Fallback con GSAP ScrollTrigger

```js
// Para navegadores sin Scroll-Driven Animations
gsap.to('.parallax-bg', {
  y: '-30vh',
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero-parallax',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.8,
  }
});
```

### 8.3 Parallax de Mouse / Giroscopio

```js
// Desktop: Mouse parallax (reutiliza mouseRef existente)
const handleMouseParallax = (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 2;
  const y = (e.clientY / window.innerHeight - 0.5) * 2;
  bgLayer.style.transform = `translate(${x * -8}px, ${y * -8}px)`;
  midLayer.style.transform = `translate(${x * -4}px, ${y * -4}px)`;
  fgLayer.style.transform = `translate(${x * 6}px, ${y * 6}px)`;
};

// Mobile: DeviceOrientation (giroscopio sutil)
window.addEventListener('deviceorientation', (e) => {
  const tiltX = (e.gamma || 0) / 45;  // -1 to 1
  const tiltY = (e.beta || 0 - 45) / 45;
  // Mismo efecto con valores del giroscopio
});
```

### 8.4 Chispas de Soldadura (Canvas 2D Ligero)

```js
// SparkOverlay.jsx — Canvas 2D en lugar de Three.js particles
// 60-80 partículas con gravedad y fade
// Solo activo en escenas 1–3 (no en EPP)
// requestAnimationFrame con IntersectionObserver
```

---

## 9. Optimización de Rendimiento

### 9.1 Budget de Performance

| Métrica | Objetivo Desktop | Objetivo Mobile |
|---------|-----------------|-----------------|
| LCP (Largest Contentful Paint) | < 2.0s | < 2.5s |
| FID (First Input Delay) | < 50ms | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.05 | < 0.05 |
| Total asset weight (hero) | < 800 KB | < 400 KB |
| Layers composited | 4 | 2 |

### 9.2 Estrategia de Carga

```
1. CRITICAL PATH (above-fold):
   └─ Escena 1 MID layer (webp, inline critical CSS)
      Preload con <link rel="preload" as="image">

2. LAZY LOAD (IntersectionObserver):
   ├─ Escena 1 BG + FG → cuando hero entra al viewport
   ├─ Escena 2 completa → cuando scroll > 15%
   ├─ Escena 3 completa → cuando scroll > 40%
   └─ Escena 4 completa → cuando scroll > 65%

3. ADAPTIVE LOADING:
   ├─ navigator.connection.effectiveType === '4g' → Full quality
   ├─ effectiveType === '3g' → 960×540, sin FG layer
   ├─ Save-Data header → Imagen única sin parallax
   └─ prefers-reduced-motion → Fades estáticos sin movimiento
```

### 9.3 Formato de Imagen y `<picture>`

```html
<picture>
  <!-- AVIF: 30-50% más pequeño (Chrome, Firefox) -->
  <source srcset="bg_desktop.avif" media="(min-width: 1024px)" type="image/avif">
  <source srcset="bg_mobile.avif" media="(max-width: 767px)" type="image/avif">
  <!-- WebP: Soporte universal -->
  <source srcset="bg_desktop.webp" media="(min-width: 1024px)" type="image/webp">
  <source srcset="bg_mobile.webp" media="(max-width: 767px)" type="image/webp">
  <!-- JPEG fallback -->
  <img src="bg_desktop.jpg" alt="Showroom MAQSYMA" loading="eager" fetchpriority="high">
</picture>
```

---

## 10. Cronograma de Ejecución

### Fase 1 — Extracción y Procesamiento (FFmpeg)
> **Herramienta**: `ffmpeg-skill`

| Paso | Acción | Comando/Herramienta | Output |
|------|--------|---------------------|--------|
| 1.1 | Extraer hero shots (1 frame clave por video) | `ffmpeg -ss X -frames:v 1` | 4× PNG 2560×1440 |
| 1.2 | Extraer secuencias scroll (6fps por video) | `ffmpeg -vf fps=6` | ~180 frames totales |
| 1.3 | Upscale a 1920×1080 con Lanczos | `ffmpeg -vf scale=1920:1080:flags=lanczos` | PNGs de alta calidad |
| 1.4 | Crear crops verticales para móvil | `ffmpeg -vf crop` | 4× WebP 828×1792 |

### Fase 2 — Separación de Capas
| Paso | Acción | Herramienta | Output |
|------|--------|-------------|--------|
| 2.1 | Crear BG layers (blur + crop superior) | FFmpeg + script Python | 4× bg_layer.webp |
| 2.2 | Crear MID layers (frame completo) | FFmpeg | 4× mid_layer.webp |
| 2.3 | Crear FG layers (recorte con alpha) | Script Python + FFmpeg | 4× fg_layer.png |
| 2.4 | Generar variantes AVIF | FFmpeg | 12× .avif |

### Fase 3 — Componente React
| Paso | Acción | Dependencia |
|------|--------|-------------|
| 3.1 | Crear `HeroParallax.jsx` y sub-componentes | Fase 2 |
| 3.2 | Hook `useParallaxScroll` con ScrollTimeline + GSAP fallback | — |
| 3.3 | Integrar `SparkOverlay` (canvas 2D) | — |
| 3.4 | Reutilizar `CinemaOverlay` / `ProgressIndicator` | Hero3D existente |
| 3.5 | Responsive: breakpoints + giroscopio | — |
| 3.6 | A/B: Flag para alternar Hero3D vs HeroParallax | — |

### Fase 4 — Optimización y QA
| Paso | Acción |
|------|--------|
| 4.1 | Lighthouse audit (LCP < 2.0s, CLS < 0.05) |
| 4.2 | Test en dispositivos reales (Android Chrome, iOS Safari) |
| 4.3 | Test `prefers-reduced-motion` |
| 4.4 | Test `Save-Data` header |
| 4.5 | Comparación visual Hero3D vs HeroParallax |

---

## 📂 Estructura de Assets Final

```
public/assets/hero/
├── videos/                   ← Fuente original (no se sirven al cliente)
│   ├── 1.mp4
│   ├── 2.mp4
│   ├── 3.mp4
│   └── 4.mp4
├── products/                 ← Existente (imágenes de productos)
│   └── ...
└── frames/                   ← NUEVO: Assets parallax generados
    ├── scene-1/              ← Fachada
    │   ├── bg/
    │   │   ├── bg_desktop.webp
    │   │   ├── bg_desktop.avif
    │   │   └── bg_mobile.webp
    │   ├── mid/
    │   │   ├── mid_desktop.webp
    │   │   ├── mid_desktop.avif
    │   │   └── mid_mobile.webp
    │   └── fg/
    │       └── fg_desktop.png   ← Con alpha (transparencia)
    ├── scene-2/              ← Lobby
    │   └── (misma estructura)
    ├── scene-3/              ← Showroom
    │   └── (misma estructura)
    └── scene-4/              ← EPP
        └── (misma estructura)
```

---

## ⚡ Decisiones Clave

> [!IMPORTANT]
> **¿Reemplazar o coexistir con Hero 3D?**
>
> Se recomienda un **flag de feature** que permita elegir:
> - `REACT_APP_HERO_MODE=3d` → Hero Three.js actual (desktop potente)
> - `REACT_APP_HERO_MODE=parallax` → Hero Parallax (default para todos)
> - `REACT_APP_HERO_MODE=auto` → Parallax en móvil, 3D en desktop con GPU dedicada

> [!WARNING]
> **Los videos originales NO deben servirse al cliente web.**
> Son ~22 MB en total. Solo se usan como materia prima para extracción de frames.
> Los assets finales (webp/avif) deben pesar < 800 KB en total para desktop.

> [!NOTE]
> **¿Por qué no usar `<video>` directamente?**
> - Los videos son 720p con 24fps — insuficiente para scroll parallax suave
> - El autoplay en móvil está restringido (require muted + inline)
> - El parallax multicapa con video requeriría 4 `<video>` simultáneos
> - Las imágenes estáticas con CSS transforms dan mejor rendimiento que decodificación de video

---

## 🛠 Herramientas del Agente a Utilizar

| Herramienta | Uso |
|-------------|-----|
| **ffmpeg-skill** | Extracción de frames, upscale, crop, blur, conversión a webp/avif |
| **swarm** | Paralelizar procesamiento de los 4 videos simultáneamente |
| **impeccable** | Revisión de la experiencia UX/UI del parallax resultante |
| **cyber-glassmorphism-ui** | Tokens de diseño dark mode para los overlays y tipografía del hero |

---

*Plan creado el 2026-11-18 · Proyecto MAQSYMA · Hero Parallax Cinematográfico*
