# MAQSYMA — Showroom Digital de Equipos de Soldadura

## Problema original
Página comercial premium (especificada para Framer, construida en React) para MAQSYMA, vendedora de máquinas de soldar, corte y accesorios. Objetivo: llevar al visitante por DESCUBRIR → EXPLORAR → COMPARAR → ENTENDER → ELEGIR → COTIZAR. Todo en español. Prohibido inventar modelos, precios, especificaciones, certificaciones, clientes o testimonios.

## Decisiones del usuario (ask_human)
1. Catálogo administrable en base de datos (sin panel admin todavía): cada máquina es un registro independiente consumido dinámicamente, con todos los campos CMS (marca, modelo, categoría, proceso, imágenes, descripción, amperaje, voltaje, alimentación, factor de trabajo, aplicaciones, características, precio, disponibilidad, ficha técnica, SKU, enlace de cotización).
2. Cotización SOLO por contacto directo (correo y WhatsApp), sin formulario.
3. WhatsApp real: +51 957 082 739 (wa.me/51957082739). Correo, teléfono, ubicación y horario: placeholders [correo]/[teléfono]/[ubicación]/[horario] claramente identificables.

## Arquitectura
- Backend FastAPI (puerto 8000, rutas /api): tabla `products` en Supabase (PostgreSQL) con validación Pydantic. CRUD completo: GET/POST/PUT/DELETE /api/products y autenticación admin (/api/admin/login, /api/admin/me).
- Frontend React (puerto 3000): single page, framer-motion + lenis, Tailwind con tema propio (ink #07080A, fog #F4F5F8, mist #94A3B8, accent #00E676). Tipografías: Big Shoulders Display (titulares), Switzer vía Fontshare (texto), JetBrains Mono (datos técnicos).
- Logo SVG original (M angular + chispa verde) usado en navbar y como favicon.svg.

## Secciones implementadas (2026-11-16)
1. Navbar fija con blur, indicador "ATENCIÓN COMERCIAL DISPONIBLE", menú móvil accesible (ESC, aria-expanded).
2. Hero: secuencia de activación ~1.5s (revelado enmascarado línea a línea, 000%→100%, mensajes INICIANDO→SISTEMA LISTO), foto cinematográfica de producto con spotlight al cursor y parallax sutil de scroll, franja técnica, placeholders "SEGÚN MODELO".
3. Marquee editorial lento (procesos, una copia aria-hidden).
4. Manifiesto con lectura progresiva ligada al scroll (palabra por palabra, fijación ~2.2 pantallas desktop / 1.65 móvil, contador 000-100%, barra y 4 hitos: Tecnología/Precisión/Rendimiento/Confiabilidad). Retrocede con el scroll. Versión estática con prefers-reduced-motion.
5. Categorías editoriales (MMA, MIG/MAG, TIG, Corte Plasma, Multiproceso, Accesorios): hover en desktop con preview fija, tap-expand en móvil.
6. Máquinas destacadas v2 (2026-11-16): showroom 3D scroll-driven — contenedor alto ((N+2)·100vh) con escenario sticky, perspectiva 1100px + preserve-3d, marcos en eje Z separados 850px, cámara virtual avanzada por scrollYProgress (d_i = i+1 − p·(N+1)), marcos huecos intermedios, alternancia horizontal sutil, velo atmosférico por distancia, banda de datos independiente (marca, modelo, código MQ—00X, categoría, proceso, amperaje, voltaje, descripción, CTAs) visible solo cerca del protagonista, indicadores fijos (actual 01/N, modelo, barra de progreso, EXPLORANDO CATÁLOGO), tilt+reflejo solo en protagonista (pointer-events none en el resto), ficha técnica en modal con datos reales del catálogo (ESC/cierre/bloqueo lenis). Fallback vertical estático en móvil (<768px) y con prefers-reduced-motion, conservando todas las máquinas, datos y acciones. Contador con unidades reales del catálogo.
7. Selector interactivo 60/40 (MMA, MIG/MAG, TIG, PLASMA, MULTIPROCESO): hover/clic/teclado, panel técnico con radar decorativo y datos "SEGÚN MODELO" (sin métricas inventadas).
8. Aplicaciones industriales: 8 aplicaciones, grid asimétrico con parallax y revelado por máscara.
9. Información técnica HUD en JetBrains Mono con valores marcados como ejemplo visual.
10. Cotización: transición de caracteres única (~620ms) al entrar en viewport, CTAs a WhatsApp, tabla de contacto con placeholders y WhatsApp real.
11. Footer con navegación y estado del catálogo.

## Verificado (preview)
- CRUD API con curl (crear/leer/actualizar/eliminar; respuesta serializa id).
- Escritorio 1440px y móvil 390px: sin scroll horizontal, menú móvil, selector con hover/clic, imágenes cargando (4/4 producto, 8/8 aplicaciones), hero 100%/SISTEMA LISTO.
- Bug corregido: imágenes lazy dentro de contenedores clip-path no cargaban → revelado movido al árbol de variantes del artículo y carga eager.

## Pendiente / siguientes
- Cargar catálogo real (POST /api/products o reemplazar registros de ejemplo; el badge EJEMPLO se apaga con is_example=false).
- Completar datos de contacto reales (correo, teléfono, ubicación, horario) en Quote/Footer.
- Panel administrativo y ficha técnica detallada por producto (estructura ya soportada en el modelo).
- Fotografías reales de los equipos cuando existan (las imágenes actuales son renders de ejemplo genéricos sin marca).
