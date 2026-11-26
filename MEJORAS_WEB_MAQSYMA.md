# 🔧 Plan de Mejoras — Web MAQSYMA (Soldadoras ESAB)

> **Fecha:** Noviembre 2026  
> **Rama:** `develop/HeroEmergent`  
> **Archivos clave:** `HeroCinematic.jsx` · `CatalogStore.jsx` · `FeaturedMachines.jsx` · `Selector.jsx` · `Categories.jsx` · `Navbar.jsx`

---

## 📋 Índice de Fases

| Fase | Nombre | Prioridad | Impacto |
|------|--------|-----------|---------|
| **1** | [Rediseño del Hero](#fase-1--rediseño-del-hero) | 🔴 Crítica | Conversión, rendimiento, primera impresión |
| **2** | [Mejora del Catálogo (CatalogStore)](#fase-2--mejora-del-catálogo-catalogstore) | 🔴 Crítica | Búsqueda de productos, decisión de compra |
| **3** | [Sistema de Filtros Avanzados](#fase-3--sistema-de-filtros-avanzados) | 🟡 Alta | Experiencia de búsqueda técnica industrial |
| **4** | [Optimización de Rendimiento y Compatibilidad](#fase-4--optimización-de-rendimiento-y-compatibilidad) | 🟡 Alta | Firefox, móviles, SEO |
| **5** | [Mejoras de Conversión y Confianza](#fase-5--mejoras-de-conversión-y-confianza) | 🟢 Media | Tasa de cotización, credibilidad |
| **6** | [Mejoras Adicionales Propuestas](#fase-6--mejoras-adicionales-propuestas) | 🟢 Media | Experiencia completa, retención |

---

## Fase 1 — Rediseño del Hero

### Diagnóstico actual

El Hero (`HeroCinematic.jsx`) es un recorrido cinematográfico de 8 escenas ligado al scroll con una altura de **`1250vh` en móvil / `1600vh` en desktop** (~16 pantallas de alto). Esto genera los siguientes problemas:

1. **Scroll trap:** El usuario debe desplazarse 12–16 pantallas antes de ver el primer producto o CTA real
2. **Rotaciones `rotateY` con `transformPerspective: 1400`:** En Firefox causa re-rasterizado constante → jank/tirones
3. **Sin propuesta de valor inmediata:** Los primeros 3 segundos muestran solo la fachada exterior + "Desliza para iniciar el recorrido ↓"
4. **Imágenes externas (CDN emergentagent.com):** Carga dependiente de un CDN de terceros
5. **Sin CTA de conversión en viewport inicial:** No hay botón de WhatsApp ni catálogo visible sin hacer scroll

### 1.1 — Reducir la altura del scroll del Hero

**Archivo:** `frontend/src/components/HeroCinematic.jsx`  
**Línea:** `303`

```jsx
// ANTES (actual):
<section ref={ref} className="relative h-[1250vh] md:h-[1600vh]" ...>

// DESPUÉS (propuesto):
<section ref={ref} className="relative h-[300vh] md:h-[400vh]" ...>
```

**Instrucciones:**
1. Reducir la altura del contenedor `section` a `300vh` / `400vh`
2. Recalcular los keyframes (`KF`) para que las transiciones entre escenas ocurran en el nuevo rango. Condensar de 8 escenas a **4 hitos clave**:
   - Hito 1 (0–25%): **Fachada + Propuesta de valor** → Mantener `ext`
   - Hito 2 (25–50%): **Showroom interior** → Fundir `room` + `st1`
   - Hito 3 (50–75%): **Equipo estrella** → Usar la mejor escena de `st2` o `st3`
   - Hito 4 (75–100%): **Desembocadura** → Transición fluida al Marquee
3. Eliminar las escenas `wide` y `portal` del recorrido (pueden reutilizarse en la sección de Aplicaciones)

### 1.2 — Agregar propuesta de valor inmediata al viewport inicial

**Archivo:** `frontend/src/components/HeroCinematic.jsx`  
**Ubicación:** Dentro del `<div className="sticky top-0 h-screen ...">`, después del gradient overlay (línea ~314)

Agregar un bloque de contenido visible sin scroll:

```jsx
{/* Bloque de propuesta de valor — siempre visible al cargar */}
<motion.div
  style={{ opacity: hintOpacity }} // desaparece al iniciar scroll
  className="absolute inset-x-5 bottom-0 z-20 pb-20 sm:inset-x-auto sm:left-12 sm:bottom-24 sm:max-w-2xl"
>
  <p className="mono-label flex items-center gap-3">
    <span className="inline-block h-2 w-2 bg-accent" />
    Distribuidor Autorizado ESAB en Perú
  </p>
  <h1 className="mt-4 font-display text-[clamp(2.5rem,7vw,5.5rem)] font-black uppercase leading-[0.92] tracking-tight">
    Potencia para<br />
    soldar <span className="text-accent">sin límites.</span>
  </h1>
  <p className="mt-4 max-w-xl text-base leading-relaxed text-mist sm:text-lg">
    Equipos MIG, TIG, MMA y Multiproceso con garantía oficial,
    stock inmediato y asesoría técnica directa.
  </p>
  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
    <button
      type="button"
      className="btn-primary"
      onClick={() => scrollToSection("maquinas")}
    >
      Ver catálogo completo <span aria-hidden="true">→</span>
    </button>
    <a
      className="btn-ghost"
      href={waLink("Hola MAQSYMA, quiero cotizar un equipo de soldadura.")}
      target="_blank"
      rel="noopener noreferrer"
    >
      Cotizar por WhatsApp
    </a>
  </div>
  {/* Insignias de confianza */}
  <div className="mt-6 flex flex-wrap gap-4 border-t border-white/10 pt-4">
    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-mist">
      ✓ Garantía oficial ESAB
    </span>
    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-mist">
      ✓ Stock inmediato
    </span>
    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-mist">
      ✓ Envío a nivel nacional
    </span>
  </div>
</motion.div>
```

### 1.3 — Agregar botón "Saltar recorrido"

**Archivo:** `frontend/src/components/HeroCinematic.jsx`  
**Ubicación:** Junto al hint de scroll (línea ~356)

```jsx
{/* Botón para saltar el recorrido */}
<motion.button
  style={{ opacity: hintOpacity }}
  onClick={() => scrollToSection("maquinas")}
  className="absolute bottom-7 right-5 z-20 border border-white/15 bg-ink/60 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-mist backdrop-blur-sm transition-colors hover:border-accent hover:text-accent sm:right-12"
>
  Saltar al catálogo ↓
</motion.button>
```

### 1.4 — Eliminar rotaciones 3D (compatibilidad Firefox)

**Archivo:** `frontend/src/components/HeroCinematic.jsx`  
**Líneas:** 38, 44, 49 (propiedades `r` en los keyframes `KF`)

```jsx
// ANTES:
st1: {
  ...
  r: [[0.27, 0.33], [2, -1.5]],  // ← ELIMINAR
},
st2: {
  ...
  r: [[0.44, 0.5], [-1.8, 1.6]], // ← ELIMINAR
},
st3: {
  ...
  r: [[0.64, 0.705], [2.2, -2.2]], // ← ELIMINAR
},

// DESPUÉS:
// Eliminar las propiedades `r` de cada keyframe.
// En el componente Scene, eliminar la línea:
//   const rotate = useTransform(progress, spec.r ? ...);
// Y en el motion.div style, cambiar:
//   rotateY: rotate, transformPerspective: 1400
// Por:
//   (nada, eliminar ambas propiedades del style)
```

**Instrucciones detalladas:**
1. En el objeto `KF`, eliminar la propiedad `r` de los keyframes `st1`, `st2` y `st3`
2. En el componente `Scene` (línea 97–111):
   - Eliminar la línea `const rotate = useTransform(...)`
   - Remover `rotateY: rotate` y `transformPerspective: 1400` del `style`
3. Reemplazar la ilusión de profundidad con un sutil efecto de escala: agregar `s` con rango más estrecho (1.0 → 1.06) en cada escena

### 1.5 — Optimizar la precarga de imágenes del Hero

**Archivo:** `frontend/src/components/HeroCinematic.jsx`  
**Líneas:** 243–255

```jsx
// ANTES: Precarga las primeras 3 imágenes sin prioridad
const preloadList = [SCENES.ext, SCENES.room, SCENES.st1];

// DESPUÉS: Usar fetchpriority alta para la primera y lazy para el resto
useEffect(() => {
  // Imagen principal: precarga con alta prioridad
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = SCENES.ext;
  link.fetchPriority = "high";
  document.head.appendChild(link);

  // Resto de imágenes: precarga en background con baja prioridad
  const lazy = [SCENES.room, SCENES.st1, SCENES.st2];
  lazy.forEach((url) => {
    const img = new Image();
    img.loading = "lazy";
    img.src = url;
  });

  if (onReady) {
    const timer = setTimeout(() => onReady(), 200);
    return () => { clearTimeout(timer); document.head.removeChild(link); };
  }
  return () => document.head.removeChild(link);
}, [onReady]);
```

### 1.6 — Hero estático (StaticHero) como fallback mejorado

**Archivo:** `frontend/src/components/HeroCinematic.jsx`  
**Función:** `StaticHero` (línea 174–227)

**Instrucciones:**
1. El `StaticHero` actual es bueno pero le falta el botón directo de WhatsApp como CTA primario
2. Agregar las mismas insignias de confianza (Garantía, Stock, Envío nacional) del punto 1.2
3. Asegurarse de que `StaticHero` se muestra también en Firefox cuando se detecta scroll jank (ver Fase 4)

---

## Fase 2 — Mejora del Catálogo (CatalogStore)

### Diagnóstico actual

`CatalogStore.jsx` tiene buena base: grid de productos, búsqueda por texto, tabs de categoría, modal de ficha técnica. Pero carece de funcionalidad industrial clave:

1. **Sin filtros técnicos:** No hay filtro por amperaje, voltaje, ni alimentación eléctrica
2. **Sin comparación de equipos:** No se pueden comparar 2–3 máquinas lado a lado
3. **Sin ordenamiento:** No se puede ordenar por amperaje, nombre o relevancia
4. **Sin paginación o "load more":** Si el catálogo crece (>20 equipos), renderiza todos de golpe
5. **Encoding corrupto en datos:** Los datos en `esabProducts.js` tienen encoding incorrecto (`MonofÃ¡sica` en lugar de `Monofásica`)

### 2.1 — Corregir encoding de datos de productos

**Archivo:** `frontend/src/data/esabProducts.js`

**Instrucciones:**
1. Abrir el archivo y buscar/reemplazar todos los caracteres con encoding corrupto:
   - `Ã¡` → `á`
   - `Ã³` → `ó`
   - `Ãº` → `ú`
   - `Ã©` → `é`
   - `Ã±` → `ñ`
   - `Ã­` → `í`
2. Guardar con encoding UTF-8 sin BOM
3. Verificar que todos los modelos, descripciones y features muestren los acentos correctamente

### 2.2 — Agregar barra de ordenamiento

**Archivo:** `frontend/src/components/CatalogStore.jsx`  
**Ubicación:** Junto al campo de búsqueda (después de línea 105)

```jsx
// Nuevo estado
const [sortBy, setSortBy] = useState("default");

// Lógica de ordenamiento (dentro del useMemo, después del filter)
const sortedProducts = useMemo(() => {
  const list = [...filteredProducts];
  switch (sortBy) {
    case "amperage-asc":
      return list.sort((a, b) => parseInt(a.amperage) - parseInt(b.amperage));
    case "amperage-desc":
      return list.sort((a, b) => parseInt(b.amperage) - parseInt(a.amperage));
    case "name-asc":
      return list.sort((a, b) => a.model.localeCompare(b.model));
    case "name-desc":
      return list.sort((a, b) => b.model.localeCompare(a.model));
    default:
      return list;
  }
}, [filteredProducts, sortBy]);

// UI: Selector de orden (junto al input de búsqueda)
<select
  value={sortBy}
  onChange={(e) => setSortBy(e.target.value)}
  className="bg-coal/70 border border-white/10 px-3 py-2 font-mono text-xs text-fog focus:border-accent focus:outline-none"
>
  <option value="default">Orden predeterminado</option>
  <option value="amperage-desc">Mayor amperaje primero</option>
  <option value="amperage-asc">Menor amperaje primero</option>
  <option value="name-asc">Nombre A → Z</option>
  <option value="name-desc">Nombre Z → A</option>
</select>
```

### 2.3 — Agregar contador visible de resultados filtrados

**Archivo:** `frontend/src/components/CatalogStore.jsx`  
**Ubicación:** Debajo de la barra de filtros (después del `</div>` del contenedor de filtros, ~línea 106)

```jsx
{/* Resumen de filtro activo */}
{(selectedCat !== "ALL" || searchQuery) && (
  <div className="mt-4 flex items-center gap-3 font-mono text-[11px] text-mist">
    <span>
      Mostrando <span className="text-accent font-bold">{filteredProducts.length}</span> de {ESAB_PRODUCTS.length} equipos
    </span>
    {selectedCat !== "ALL" && (
      <span className="border border-white/10 bg-coal/50 px-2 py-0.5 text-fog">
        {selectedCat}
        <button onClick={() => setSelectedCat("ALL")} className="ml-1.5 text-mist hover:text-accent">×</button>
      </span>
    )}
    {searchQuery && (
      <span className="border border-white/10 bg-coal/50 px-2 py-0.5 text-fog">
        "{searchQuery}"
        <button onClick={() => setSearchQuery("")} className="ml-1.5 text-mist hover:text-accent">×</button>
      </span>
    )}
  </div>
)}
```

### 2.4 — Mejorar el modal de ficha técnica

**Archivo:** `frontend/src/components/CatalogStore.jsx`  
**Función:** `ProductDetailModal` (línea 219)

**Instrucciones:**
1. **Agregar cierre con tecla Escape:**
   ```jsx
   useEffect(() => {
     const onKey = (e) => e.key === "Escape" && onClose();
     window.addEventListener("keydown", onKey);
     window.__lenis?.stop();
     return () => {
       window.removeEventListener("keydown", onKey);
       window.__lenis?.start();
     };
   }, [onClose]);
   ```
2. **Detener scroll del fondo** (Lenis) cuando el modal está abierto (ya se hace en `FeaturedMachines.jsx` pero falta en `CatalogStore.jsx`)
3. **Agregar galería de imágenes** si el producto tiene más de una imagen (campo `images` en la data)
4. **Agregar botón de "Descargar ficha PDF"** más prominente si existe `datasheet_url`

### 2.5 — Agregar sistema básico de comparación de equipos

**Archivo:** Crear `frontend/src/components/CompareDrawer.jsx` (nuevo)

**Instrucciones:**
1. En `CatalogStore.jsx`, agregar un estado `compareList` (máx. 3 productos)
2. En cada tarjeta de producto, agregar un checkbox/botón "Comparar" que añade o quita del `compareList`
3. Cuando `compareList.length >= 2`, mostrar un drawer fijo en la parte inferior de la pantalla:
   ```jsx
   <div className="fixed bottom-0 inset-x-0 z-50 border-t border-white/15 bg-coal/95 backdrop-blur-md p-4">
     <div className="section-head flex items-center justify-between">
       <span className="font-mono text-xs text-fog">
         {compareList.length} equipos para comparar
       </span>
       <div className="flex gap-3">
         <button className="btn-ghost !py-2 !text-[10px]" onClick={() => setCompareList([])}>
           Limpiar
         </button>
         <button className="btn-primary !py-2 !text-[10px]" onClick={() => setShowCompare(true)}>
           Comparar ahora
         </button>
       </div>
     </div>
   </div>
   ```
4. El modal de comparación muestra una tabla de 2–3 columnas con especificaciones enfrentadas:
   - Modelo, Proceso, Amperaje, Voltaje, Alimentación, Ciclo de trabajo, Features

---

## Fase 3 — Sistema de Filtros Avanzados

### Diagnóstico actual

El filtrado actual solo permite:
- Tabs de categoría (MIG, MMA, TIG, etc.)
- Búsqueda de texto libre

**Falta lo que un comprador industrial realmente necesita:**
- Filtrar por rango de amperaje (100–200A, 200–400A, 400A+)
- Filtrar por tipo de alimentación eléctrica (Monofásica 220V / Trifásica 380V-440V)
- Filtrar por voltaje
- Filtrar por aplicación (Estructura, Mantenimiento, Producción, etc.)

### 3.1 — Crear componente de panel de filtros lateral

**Archivo:** Crear `frontend/src/components/FilterPanel.jsx` (nuevo)

```jsx
import { useState } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

const AMPERAGE_RANGES = [
  { id: "0-200", label: "Hasta 200A", min: 0, max: 200 },
  { id: "200-350", label: "200A – 350A", min: 200, max: 350 },
  { id: "350-500", label: "350A – 500A", min: 350, max: 500 },
  { id: "500+", label: "500A o más", min: 500, max: Infinity },
];

const POWER_SUPPLY = [
  { id: "mono", label: "Monofásica (220V)" },
  { id: "tri", label: "Trifásica (380V / 440V)" },
  { id: "multi", label: "Multivoltaje" },
];

const APPLICATIONS = [
  "Estructura metálica",
  "Fabricación industrial",
  "Mantenimiento",
  "Producción en serie",
  "Taller general",
  "Soldadura de precisión",
];

export default function FilterPanel({ filters, onFilterChange, productCount, totalCount }) {
  const [expanded, setExpanded] = useState({ amperage: true, power: true, application: false });

  const toggle = (key) => setExpanded((e) => ({ ...e, [key]: !e[key] }));

  return (
    <aside className="border border-white/10 bg-coal/50 p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-fog">
          <SlidersHorizontal className="w-4 h-4 text-accent" />
          Filtros técnicos
        </h3>
        <span className="font-mono text-[10px] text-mist">
          {productCount} de {totalCount}
        </span>
      </div>

      {/* Filtro por amperaje */}
      <div>
        <button onClick={() => toggle("amperage")} className="flex w-full items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-wider text-fog">Amperaje</span>
          <ChevronDown className={`w-3.5 h-3.5 text-mist transition-transform ${expanded.amperage ? "rotate-180" : ""}`} />
        </button>
        {expanded.amperage && (
          <div className="mt-3 space-y-2">
            {AMPERAGE_RANGES.map((r) => (
              <label key={r.id} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.amperageRanges?.includes(r.id)}
                  onChange={() => onFilterChange("amperageRanges", r.id)}
                  className="accent-accent"
                />
                <span className="font-mono text-[11px] text-mist group-hover:text-fog">{r.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Filtro por alimentación eléctrica */}
      <div>
        <button onClick={() => toggle("power")} className="flex w-full items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-wider text-fog">Alimentación</span>
          <ChevronDown className={`w-3.5 h-3.5 text-mist transition-transform ${expanded.power ? "rotate-180" : ""}`} />
        </button>
        {expanded.power && (
          <div className="mt-3 space-y-2">
            {POWER_SUPPLY.map((ps) => (
              <label key={ps.id} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.powerSupply?.includes(ps.id)}
                  onChange={() => onFilterChange("powerSupply", ps.id)}
                  className="accent-accent"
                />
                <span className="font-mono text-[11px] text-mist group-hover:text-fog">{ps.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Filtro por aplicación */}
      <div>
        <button onClick={() => toggle("application")} className="flex w-full items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-wider text-fog">Aplicación</span>
          <ChevronDown className={`w-3.5 h-3.5 text-mist transition-transform ${expanded.application ? "rotate-180" : ""}`} />
        </button>
        {expanded.application && (
          <div className="mt-3 space-y-2">
            {APPLICATIONS.map((app) => (
              <label key={app} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.applications?.includes(app)}
                  onChange={() => onFilterChange("applications", app)}
                  className="accent-accent"
                />
                <span className="font-mono text-[11px] text-mist group-hover:text-fog">{app}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Botón limpiar filtros */}
      <button
        onClick={() => onFilterChange("reset")}
        className="w-full btn-ghost !py-2 !text-[10px]"
      >
        Limpiar todos los filtros
      </button>
    </aside>
  );
}
```

### 3.2 — Integrar FilterPanel en CatalogStore

**Archivo:** `frontend/src/components/CatalogStore.jsx`

**Instrucciones:**
1. Importar el componente `FilterPanel`
2. Agregar estado `filters`:
   ```jsx
   const [filters, setFilters] = useState({
     amperageRanges: [],
     powerSupply: [],
     applications: [],
   });
   ```
3. Función de manejo de filtros:
   ```jsx
   const handleFilterChange = (type, value) => {
     if (type === "reset") {
       setFilters({ amperageRanges: [], powerSupply: [], applications: [] });
       return;
     }
     setFilters((prev) => {
       const list = prev[type] || [];
       return {
         ...prev,
         [type]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
       };
     });
   };
   ```
4. Actualizar el `useMemo` de `filteredProducts` para aplicar los filtros técnicos **además** de la categoría y búsqueda actuales:
   ```jsx
   const filteredProducts = useMemo(() => {
     return ESAB_PRODUCTS.filter((p) => {
       // Filtro de categoría (ya existe)
       const matchCat = selectedCat === "ALL" || p.category === selectedCat;

       // Filtro de búsqueda (ya existe)
       const q = searchQuery.toLowerCase().trim();
       const matchSearch = !q || p.model.toLowerCase().includes(q) || ...;

       // NUEVO: Filtro de amperaje
       const matchAmperage = filters.amperageRanges.length === 0 || filters.amperageRanges.some((rangeId) => {
         const amp = parseInt(p.amperage);
         const range = AMPERAGE_RANGES.find((r) => r.id === rangeId);
         return range && amp >= range.min && amp < range.max;
       });

       // NUEVO: Filtro de alimentación eléctrica
       const matchPower = filters.powerSupply.length === 0 || filters.powerSupply.some((psId) => {
         const supply = p.power_supply?.toLowerCase() || "";
         if (psId === "mono") return supply.includes("mono");
         if (psId === "tri") return supply.includes("tri");
         if (psId === "multi") return supply.includes("multi");
         return false;
       });

       return matchCat && matchSearch && matchAmperage && matchPower;
     });
   }, [selectedCat, searchQuery, filters]);
   ```
5. Cambiar el layout del grid para incluir el panel lateral:
   ```jsx
   <div className="mt-10 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
     {/* Panel de filtros lateral (desktop) */}
     <div className="hidden lg:block">
       <FilterPanel
         filters={filters}
         onFilterChange={handleFilterChange}
         productCount={filteredProducts.length}
         totalCount={ESAB_PRODUCTS.length}
       />
     </div>

     {/* Grid de productos */}
     <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
       {/* ... tarjetas de producto existentes ... */}
     </div>
   </div>
   ```
6. En **móvil**, mostrar los filtros en un drawer/bottom sheet activado por un botón:
   ```jsx
   <button
     onClick={() => setShowFiltersMobile(true)}
     className="lg:hidden btn-ghost !py-2 !text-[10px] flex items-center gap-2"
   >
     <SlidersHorizontal className="w-3.5 h-3.5" />
     Filtros técnicos
     {activeFilterCount > 0 && (
       <span className="bg-accent text-ink px-1.5 py-0.5 text-[9px] font-bold">{activeFilterCount}</span>
     )}
   </button>
   ```

### 3.3 — Agregar filtro rápido por rango de amperaje con slider visual

**Archivo:** `frontend/src/components/FilterPanel.jsx`

**Instrucciones (opcional, mejora de UX):**
1. Agregar un componente de rango doble (dual range slider) con valores de 0A a 700A
2. El usuario puede arrastrar los extremos para definir el rango exacto
3. Usar un `input[type=range]` doble nativo con estilos custom, o implementar con `@radix-ui/react-slider` si se prefiere una dependencia

---

## Fase 4 — Optimización de Rendimiento y Compatibilidad

### 4.1 — Detectar Firefox y acotar el smooth scroll de Lenis

**Archivo:** `frontend/src/lib/scroll.js`

```jsx
// ANTES:
export function initSmoothScroll() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  ...
}

// DESPUÉS:
export function initSmoothScroll() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");

  const lenis = new Lenis({
    duration: isFirefox ? 0.85 : 1.15,       // Más rápido en Firefox
    smoothWheel: !isFirefox,                   // Desactivar en Firefox (nativo es mejor)
    wheelMultiplier: isFirefox ? 1.2 : 1,      // Compensar multiplicador
    touchMultiplier: isFirefox ? 1.5 : 2,
  });
  ...
}
```

### 4.2 — Lazy load de imágenes del catálogo

**Archivo:** `frontend/src/components/CatalogStore.jsx`  
**Línea:** 124–129

```jsx
// ANTES:
<img
  src={p.main_image}
  alt={`Equipo ${p.brand} ${p.model}`}
  loading="lazy"
  className="max-h-full max-w-full object-contain ..."
/>

// DESPUÉS: Agregar srcset y sizes para responsive, y un placeholder de baja calidad
<img
  src={p.main_image}
  alt={`Equipo ${p.brand} ${p.model}`}
  loading="lazy"
  decoding="async"
  width={400}
  height={300}
  className="max-h-full max-w-full object-contain ..."
  style={{ contentVisibility: "auto" }}
/>
```

### 4.3 — Optimizar re-renders del Hero por scroll

**Archivo:** `frontend/src/components/HeroCinematic.jsx`  
**Líneas:** 260–265

```jsx
// ANTES: setSeg y setPct provocan re-render en cada pixel de scroll
useMotionValueEvent(scrollYProgress, "change", (v) => {
  let s = 0;
  for (let i = 0; i < SEGMENTS.length; i++) if (v >= SEGMENTS[i][0]) s = i;
  setSeg((c) => (c === s ? c : s));  // Re-render cuando cambia segmento (OK)
  setPct(Math.round(v * 100));        // RE-RENDER EN CADA 1% DE SCROLL (PROBLEMA)
});

// DESPUÉS: Usar refs para el porcentaje, solo re-render cuando cambia el segmento
const pctRef = useRef(null);

useMotionValueEvent(scrollYProgress, "change", (v) => {
  let s = 0;
  for (let i = 0; i < SEGMENTS.length; i++) if (v >= SEGMENTS[i][0]) s = i;
  setSeg((c) => (c === s ? c : s));

  // Actualizar el porcentaje con DOM directo (sin re-render)
  const pctValue = Math.round(v * 100);
  if (pctRef.current) {
    pctRef.current.textContent = String(pctValue).padStart(3, "0") + "%";
  }
  // Actualizar barra de progreso con DOM directo
  const barEl = document.querySelector("[data-hero-progress-bar]");
  if (barEl) barEl.style.width = `${pctValue}%`;
});

// En el JSX, cambiar el <span> del porcentaje:
<span ref={pctRef} className="font-mono text-[9px] tabular-nums text-mist">000%</span>
// Y la barra de progreso:
<span className="block h-px bg-accent transition-[width] duration-150" data-hero-progress-bar style={{ width: "0%" }} />
```

### 4.4 — Navbar: Agregar fondo semi-transparente al hacer scroll

**Archivo:** `frontend/src/components/Navbar.jsx`

**Instrucciones:**
1. Actualmente el navbar es `bg-transparent` siempre, lo que dificulta la legibilidad cuando hay contenido claro debajo
2. Agregar detección de scroll para aplicar backdrop:
   ```jsx
   const [scrolled, setScrolled] = useState(false);

   useEffect(() => {
     const onScroll = () => setScrolled(window.scrollY > 60);
     window.addEventListener("scroll", onScroll, { passive: true });
     return () => window.removeEventListener("scroll", onScroll);
   }, []);

   // En el <header>:
   <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
     scrolled ? "bg-ink/90 backdrop-blur-md border-b border-white/10 shadow-lg" : "bg-transparent"
   }`}>
   ```

---

## Fase 5 — Mejoras de Conversión y Confianza

### 5.1 — Botón flotante de WhatsApp

**Archivo:** Crear `frontend/src/components/WhatsAppFAB.jsx` (nuevo)

```jsx
import { waLink } from "../lib/scroll";

export default function WhatsAppFAB() {
  return (
    <a
      href={waLink("Hola MAQSYMA, necesito asesoría sobre equipos de soldadura.")}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-[#25D366]/30 transition-transform hover:scale-110 active:scale-95"
      aria-label="Contactar por WhatsApp"
    >
      <svg viewBox="0 0 24 24" fill="white" className="h-7 w-7">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>
  );
}
```

**Integración en `App.js`:**
```jsx
import WhatsAppFAB from "./components/WhatsAppFAB";
// ...
<Footer />
<WhatsAppFAB />
```

### 5.2 — Completar datos de contacto

**Archivo:** `frontend/src/components/Quote.jsx`  
**Líneas:** 8–14

```jsx
// ANTES: Datos placeholder
const CONTACTS = [
  ["Correo", "[correo] — por confirmar"],
  ["WhatsApp", WHATSAPP_DISPLAY],
  ["Teléfono", "[teléfono] — por confirmar"],
  ["Ubicación", "[ubicación] — por confirmar"],
  ["Horario", "[horario] — por confirmar"],
];

// DESPUÉS: Reemplazar con datos reales del negocio
// ACCIÓN REQUERIDA: Solicitar al cliente los datos definitivos
```

**Lo mismo aplica al Footer** (`Footer.jsx`, líneas 57–58):
```jsx
<li>[correo] — por confirmar</li>
<li>[ubicación] — por confirmar</li>
```

### 5.3 — Agregar sección de respaldo/confianza (Trust Bar)

**Archivo:** Crear `frontend/src/components/TrustBar.jsx` (nuevo)

**Ubicación en App.js:** Después del `<Marquee />` y antes de `<Manifesto />`

```jsx
export default function TrustBar() {
  const TRUST_ITEMS = [
    { icon: "🛡️", label: "Garantía oficial ESAB" },
    { icon: "🔧", label: "Servicio técnico autorizado" },
    { icon: "📦", label: "Stock disponible" },
    { icon: "🚚", label: "Envío a nivel nacional" },
    { icon: "💬", label: "Asesoría técnica directa" },
  ];

  return (
    <section className="border-b border-white/10 bg-coal/30 py-8">
      <div className="section-head">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {TRUST_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-lg">{item.icon}</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-fog/80">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### 5.4 — Mejorar el mensaje predeterminado de WhatsApp por producto

**Archivo:** `frontend/src/components/CatalogStore.jsx`  
**Línea:** 180

```jsx
// ANTES:
href={waLink(`Hola MAQSYMA, deseo cotizar el equipo ${p.brand} ${p.model} (${p.sku}).`)}

// DESPUÉS: Incluir más contexto para que el asesor responda más rápido
href={waLink(
  `Hola MAQSYMA, me interesa el equipo:\n` +
  `📋 ${p.brand} ${p.model}\n` +
  `⚡ ${p.amperage} · ${p.process}\n` +
  `🔖 SKU: ${p.sku}\n\n` +
  `¿Podrían enviarme cotización y disponibilidad?`
)}
```

---

## Fase 6 — Mejoras Adicionales Propuestas

### 6.1 — SEO: Agregar meta tags y Open Graph

**Archivo:** `public/index.html`

**Instrucciones:**
1. Agregar `<meta name="description" content="...">` con texto descriptivo del negocio
2. Agregar Open Graph tags para compartir en redes sociales:
   ```html
   <meta property="og:title" content="MAQSYMA — Equipos de Soldadura ESAB" />
   <meta property="og:description" content="Distribuidor autorizado ESAB en Perú. MIG, TIG, MMA, Multiproceso y accesorios con garantía oficial." />
   <meta property="og:image" content="/og-image.jpg" />
   <meta property="og:type" content="website" />
   ```
3. Generar una imagen OG (1200×630px) con la fachada del showroom y el logo MAQSYMA

### 6.2 — Mejorar accesibilidad del Selector de procesos

**Archivo:** `frontend/src/components/Selector.jsx`

**Instrucciones:**
1. El Selector actual muestra "Amperaje: Según modelo" y "Alimentación: Según modelo" como datos fijos
2. Cambiar para que, al seleccionar un proceso, muestre los modelos reales disponibles en ese proceso desde `ESAB_PRODUCTS`:
   ```jsx
   // Filtrar productos por proceso seleccionado
   const matchingProducts = ESAB_PRODUCTS.filter((p) =>
     p.process.toLowerCase().includes(PROCS[selected].name.toLowerCase()) ||
     p.category.toLowerCase().includes(PROCS[selected].name.toLowerCase())
   );
   ```
3. Mostrar una lista compacta de los modelos que coinciden con el proceso:
   ```jsx
   {matchingProducts.length > 0 && (
     <div className="mt-6">
       <p className="mono-label">Equipos disponibles en este proceso</p>
       <ul className="mt-3 space-y-2">
         {matchingProducts.slice(0, 4).map((p) => (
           <li key={p.id} className="flex items-center justify-between border-b border-white/5 pb-2">
             <span className="font-mono text-xs text-fog">{p.model}</span>
             <span className="font-mono text-[10px] text-accent">{p.amperage}</span>
           </li>
         ))}
       </ul>
     </div>
   )}
   ```

### 6.3 — Agregar micro-interacciones al grid de categorías

**Archivo:** `frontend/src/components/Categories.jsx`

**Instrucciones:**
1. Las imágenes de categoría usan Unsplash/Pexels genéricos. Reemplazar con fotos reales del showroom MAQSYMA cuando estén disponibles
2. Agregar un CTA por categoría que lleve directamente al catálogo con el filtro activo:
   ```jsx
   <button
     onClick={() => {
       scrollToSection("tienda");
       // Comunicar al CatalogStore qué categoría activar
       window.dispatchEvent(new CustomEvent("filter-category", { detail: cat.id }));
     }}
     className="mt-3 btn-ghost !py-1.5 !px-3 !text-[9px]"
   >
     Ver equipos {cat.name} →
   </button>
   ```

### 6.4 — Unificar las dos experiencias de catálogo

**Diagnóstico:** Actualmente existen **dos** secciones de catálogo:
- `FeaturedMachines.jsx` → Experiencia 3D "túnel" con scroll (sección `#maquinas`)
- `CatalogStore.jsx` → Grid filtrable con tabs (sección `#tienda`)

Esto confunde al usuario: ¿cuál es el catálogo real?

**Instrucciones:**
1. Convertir `FeaturedMachines` en una sección breve de **"Equipos Destacados"** (3–5 productos) **sin** el efecto túnel en scroll
2. Reemplazar el túnel por tarjetas horizontales con scroll snap o un carrusel sutil
3. Mantener `CatalogStore` como el catálogo principal completo
4. Agregar desde `FeaturedMachines` un enlace claro: *"Ver catálogo completo →"* que lleve a `#tienda`

### 6.5 — TechInfo: Agregar contenido educativo

**Archivo:** `frontend/src/components/TechInfo.jsx`

**Instrucciones:**
1. Si esta sección existe vacía o como placeholder, llenarla con guías breves:
   - "¿Qué proceso de soldadura necesito?" (decisión rápida)
   - "¿Qué amperaje necesito según mi material?" (tabla referencial)
   - "MIG vs TIG vs MMA: diferencias clave" (comparativa)
2. Esto posiciona la web como referente técnico y mejora SEO con keywords long-tail

---

## 📊 Resumen de Prioridad de Implementación

| Orden | Tarea | Fase | Esfuerzo | Impacto |
|-------|-------|------|----------|---------|
| 1 | Corregir encoding de datos (`esabProducts.js`) | 2.1 | 🟢 Bajo | Alto — Bug visual |
| 2 | Reducir altura del Hero + agregar CTA inmediato | 1.1, 1.2 | 🟡 Medio | Alto — Conversión |
| 3 | Eliminar rotaciones 3D (Firefox) | 1.4 | 🟢 Bajo | Alto — Rendimiento |
| 4 | Agregar botón "Saltar recorrido" | 1.3 | 🟢 Bajo | Medio — UX |
| 5 | Agregar botón flotante de WhatsApp | 5.1 | 🟢 Bajo | Alto — Conversión |
| 6 | Navbar con fondo en scroll | 4.4 | 🟢 Bajo | Medio — UX |
| 7 | Completar datos de contacto reales | 5.2 | 🟢 Bajo | Alto — Confianza |
| 8 | Ordenamiento en catálogo | 2.2 | 🟡 Medio | Medio — UX |
| 9 | Sistema de filtros técnicos | 3.1, 3.2 | 🔴 Alto | Alto — Búsqueda industrial |
| 10 | Trust Bar (insignias de confianza) | 5.3 | 🟢 Bajo | Medio — Confianza |
| 11 | Comparador de equipos | 2.5 | 🔴 Alto | Alto — Decisión de compra |
| 12 | Unificar experiencias de catálogo | 6.4 | 🟡 Medio | Alto — Claridad del sitio |
| 13 | Optimizar re-renders del Hero | 4.3 | 🟡 Medio | Medio — Rendimiento |
| 14 | Detectar Firefox → ajustar Lenis | 4.1 | 🟢 Bajo | Medio — Compatibilidad |
| 15 | SEO: meta tags + OG | 6.1 | 🟢 Bajo | Medio — Descubrimiento |
| 16 | Contenido educativo (TechInfo) | 6.5 | 🟡 Medio | Medio — SEO, retención |

---

## ⚠️ Notas Importantes

1. **Las imágenes del Hero** se cargan desde `customer-assets-gfyr7b9c.emergentagent.net` y `static.prod-images.emergentagent.com`. Si estos CDN se caen o cambian de política, el Hero se rompe. Se recomienda hospedar copias locales en `/public/assets/hero/` como fallback.

2. **Los datos de productos** (`esabProducts.js`) tienen problemas de encoding UTF-8. Esto es el fix más urgente porque afecta la presentación de **todos** los productos en el catálogo.

3. **Lenis smooth scroll** entra en conflicto con Firefox en dispositivos con touchpad. Si se observa jank persistente en Firefox, considerar desactivarlo completamente para ese navegador y usar `scroll-behavior: smooth` nativo.

4. **El componente `TechInfo`** no fue revisado en detalle por falta de contenido significativo. Evaluar si agrega valor o si puede unificarse con otra sección.

5. **Las URLs de contacto en `Quote.jsx` y `Footer.jsx`** tienen placeholders (`[correo] — por confirmar`). Es imprescindible completar estos datos antes de cualquier campaña de marketing.
