# HERO MAQSYMA — SCROLL-DRIVEN ANIMATION & INTERACTIVE MOUSE EFFECTS

## OBJETIVO PRINCIPAL

Implementa una experiencia visual interactiva y cinematográfica en la sección HERO de MAQSYMA.

El elemento protagonista es una máquina de soldar. La experiencia debe combinar dos sistemas de animación independientes:

**1. SCROLL-DRIVEN ANIMATION**

El desplazamiento vertical del visitante controla la evolución visual del Hero, incluyendo profundidad, perspectiva, escala, posición y transiciones entre estados.

**2. INTERACTIVE MOUSE EFFECTS**

El movimiento del cursor genera una respuesta visual sobre la máquina, mediante inclinación tridimensional, iluminación dinámica, reflejos y desplazamiento parallax de la imagen.

Ambos sistemas deben funcionar simultáneamente sin interferir entre sí.

El cursor nunca debe modificar el progreso del scroll ni desplazar la cámara principal.

El scroll nunca debe producir movimientos erráticos en la respuesta del cursor.

El resultado debe transmitir tecnología industrial, potencia, precisión y sofisticación.

---

# 1. COMPOSICIÓN VISUAL DEL HERO

Construye una escena cinematográfica industrial.

La composición debe incluir:

### Elemento protagonista

Una máquina de soldar de gran tamaño, ubicada como punto focal de la composición.

La máquina debe conservar:

- Geometría original.
- Logotipo.
- Modelo.
- Controles.
- Pantalla.
- Conectores.
- Colores.
- Detalles físicos.

No deformes ni alteres las características del producto.

### Escenario

Utiliza una composición industrial oscura con:

- Fondo negro o gris grafito.
- Iluminación blanca o azulada.
- Reflejos metálicos.
- Profundidad ambiental.
- Partículas sutiles.
- Pequeños detalles de iluminación.
- Sombras controladas.

La máquina debe destacar claramente respecto al fondo.

### Información comercial

Mantén los elementos informativos del Hero:

- Identidad MAQSYMA.
- Titular comercial.
- Descripción.
- Botones de acción.
- Información complementaria.

Los textos deben permanecer legibles y estables durante las transformaciones de la escena.

No permitas que las animaciones de la máquina desplacen, deformen o interfieran con los elementos de navegación y conversión.

---

# 2. ESTRUCTURA DEL SCROLL Y CÁMARA

La sección debe utilizar dos elementos:

- Un contenedor exterior que determina la distancia total de desplazamiento.
- Un escenario interior con posición sticky que permanece temporalmente fijo mientras se desarrolla la animación.

La escena visual debe responder a un único progreso global de scroll.

Comportamiento:

- Inicio: cuando el Hero entra en la ventana.
- Activación: comienza la secuencia de transformación.
- Desarrollo: la cámara virtual evoluciona según el desplazamiento.
- Final: se completa la animación y se libera el escenario.
- Sincronización: avanzar o retroceder el scroll actualiza inmediatamente el estado visual.

No utilices animaciones independientes que continúen reproduciéndose cuando el usuario deja de desplazarse.

No utilices temporizadores para controlar el avance de la cámara.

No interceptes la rueda del ratón ni los gestos táctiles.

El desplazamiento debe seguir siendo nativo.

La posición de la cámara debe depender exclusivamente del progreso del scroll.

Si utilizas suavizado, debe ser mínimo y no producir una deriva perceptible después de detener el desplazamiento.

Recalcula las dimensiones al cambiar el tamaño de la ventana.

---

# 3. SECUENCIA DE ANIMACIÓN DEL HERO

Divide el recorrido en cuatro fases.

Los porcentajes corresponden al progreso local de la animación del Hero.

## FASE A — ACTIVACIÓN (0–20%)

La escena comienza con la máquina en una posición visual de presentación.

- La máquina aparece progresivamente.
- Recupera su contraste y luminosidad.
- El fondo adquiere profundidad.
- Se activan gradualmente los elementos ambientales.
- El titular y la descripción aparecen mediante máscaras de revelado.
- Los botones aparecen después del contenido principal.

La entrada debe sentirse cinematográfica.

Evita que todos los elementos aparezcan simultáneamente.

## FASE B — APROXIMACIÓN (20–45%)

La cámara virtual comienza a aproximarse a la máquina.

- La escala aparente aumenta progresivamente.
- La máquina adquiere mayor protagonismo.
- La perspectiva cambia suavemente.
- El fondo genera una sensación de profundidad.
- La iluminación resalta los detalles del equipo.
- Los elementos ambientales pueden presentar parallax.

La máquina debe sentirse como un objeto tridimensional dentro de un escenario real.

No utilices únicamente un zoom de imagen. Combina escala, perspectiva, posición y profundidad para generar la sensación de movimiento de cámara.

## FASE C — PRESENTACIÓN (45–75%)

La máquina alcanza su posición protagonista.

- Mantiene una escala cómoda de visualización.
- Los detalles del equipo permanecen nítidos.
- La iluminación destaca su geometría.
- El escenario mantiene una profundidad perceptible.
- Los elementos comerciales permanecen legibles.
- La respuesta al cursor funciona plenamente.

Reduce la velocidad aparente de transformación.

Esta fase debe permitir que el visitante examine visualmente la máquina.

Si el visitante detiene el scroll, toda la escena debe permanecer estable.

No avances automáticamente a la siguiente fase.

## FASE D — TRANSICIÓN Y SALIDA (75–100%)

La cámara continúa su recorrido.

- La máquina puede desplazarse ligeramente hacia una posición secundaria.
- El escenario cambia progresivamente su escala y perspectiva.
- Los elementos ambientales pierden protagonismo.
- Los elementos de texto pueden completar su transición.
- El Hero termina su recorrido y libera la posición sticky.

La salida debe integrarse naturalmente con la siguiente sección de la página.

No generes saltos de composición, pantallas negras ni movimientos bruscos.

La transición debe poder recorrerse en ambos sentidos mediante scroll.

---

# 4. EFECTO 3D DEL MOUSE — INCLINACIÓN DE LA MÁQUINA

Implementa un sistema independiente de seguimiento del cursor.

Este efecto debe activarse cuando el puntero se encuentre sobre la zona visual de la máquina.

Calcula la posición del cursor respecto al centro del contenedor de la máquina, no respecto a toda la ventana.

Comportamiento:

- Cursor a la izquierda: inclinación horizontal correspondiente.
- Cursor a la derecha: inclinación en sentido contrario.
- Cursor arriba: inclinación vertical.
- Cursor abajo: inclinación vertical opuesta.

Utiliza una transformación tridimensional mediante `rotateX()` y `rotateY()`.

Parámetros orientativos:

- Rotación horizontal máxima: 4–5 grados.
- Rotación vertical máxima: 3–4 grados.
- Transición de respuesta: fluida y progresiva.
- Retorno a posición neutral: 300–500 ms.

La inclinación debe sentirse como una respuesta física de un objeto tridimensional.

No exageres los movimientos.

La máquina debe conservar su legibilidad y sus proporciones.

Cuando el cursor abandone la zona interactiva:

- La inclinación vuelve a cero.
- La imagen recupera su posición original.
- El reflejo desaparece progresivamente.
- El parallax interior vuelve a su estado inicial.

No utilices el movimiento del cursor para modificar el progreso del scroll.

---

# 5. ILUMINACIÓN DINÁMICA Y REFLEJOS

Añade una respuesta de iluminación vinculada al cursor.

El objetivo es generar la sensación de que la máquina tiene una superficie física iluminada por una fuente de luz dinámica.

Implementa:

### Reflejo superficial

- Un reflejo amplio y translúcido.
- Movimiento sincronizado con el cursor.
- Intensidad baja.
- Bordes suaves.
- Limitado a la superficie visual de la máquina.

### Iluminación ambiental

Puede utilizarse un gradiente radial dinámico que siga parcialmente al cursor.

Debe integrarse con la iluminación original del escenario.

No debe parecer una mancha blanca superpuesta.

### Detalles metálicos

Los reflejos pueden destacar sutilmente:

- Bordes.
- Superficies metálicas.
- Esquinas.
- Paneles.
- Elementos de la carcasa.

No alteres el color original del equipo.

No generes reflejos que oculten logotipos o controles.

---

# 6. PARALLAX INTERIOR

Añade un pequeño desplazamiento independiente de la imagen de la máquina.

Cuando el cursor se mueve:

- La imagen puede desplazarse ligeramente dentro de su contenedor.
- El desplazamiento debe ser coherente con la inclinación.
- El movimiento debe mantenerse entre 4 y 8 píxeles aproximadamente.
- Debe existir un margen de recorte suficiente para evitar espacios vacíos.

El contenedor exterior conserva su posición determinada por el scroll.

La superficie interior responde al cursor.

Esta separación es fundamental para evitar que ambos sistemas de movimiento se interfieran.

---

# 7. INDEPENDENCIA DE LOS DOS SISTEMAS

Implementa una arquitectura que separe claramente:

**Sistema A — Scroll**

Controla:

- Posición de la cámara.
- Profundidad.
- Escala.
- Perspectiva.
- Posición global de la máquina.
- Progreso de la secuencia.

**Sistema B — Mouse**

Controla:

- Inclinación local.
- Reflejos.
- Iluminación dinámica.
- Parallax interior.

El sistema de scroll debe transformar el contenedor exterior.

El sistema de cursor debe transformar una superficie interior independiente.

No permitas que ambos sistemas sobrescriban la misma propiedad `transform`.

Puedes utilizar elementos HTML anidados para separar las transformaciones.

La composición final debe sumar ambos movimientos sin conflictos.

---

# 8. TRANSICIONES Y MICROINTERACCIONES

Utiliza transiciones controladas.

- Aparición de textos mediante máscaras.
- Desplazamientos verticales pequeños.
- Cambios progresivos de opacidad.
- Revelado escalonado de elementos.
- Iluminación dinámica.
- Inclinación suave.
- Retorno progresivo a posición neutral.

Evita:

- Rebotes exagerados.
- Movimientos bruscos.
- Parpadeos.
- Escalados repentinos.
- Rotaciones excesivas.
- Animaciones permanentes sin función.

Las transiciones deben sentirse fluidas, precisas y cinematográficas.

---

# 9. RESPONSIVE Y DISPOSITIVOS TÁCTILES

En escritorio:

- Mantén la animación completa de scroll.
- Activa la interacción del cursor.
- Conserva la perspectiva tridimensional.
- Prioriza la calidad visual.

En tablet:

- Reduce las rotaciones.
- Ajusta la profundidad.
- Evita que el escenario se desborde.

En móvil:

- Elimina el seguimiento del cursor.
- No utilices giroscopio.
- Mantén una composición estable.
- Reduce la intensidad del recorrido de scroll si resulta necesario.
- Conserva la legibilidad de los textos y botones.

No sacrifiques la experiencia móvil por mantener efectos innecesarios.

---

# 10. ACCESIBILIDAD Y MOVIMIENTO REDUCIDO

Respeta `prefers-reduced-motion`.

Cuando esté activado:

- Desactiva la inclinación tridimensional.
- Elimina el seguimiento del cursor.
- Elimina los reflejos dinámicos.
- Reduce o elimina las transformaciones de cámara.
- Presenta la máquina en una posición estable.
- Mantén toda la información y las acciones disponibles.

Ningún contenido esencial debe depender de las animaciones.

---

# 11. IMPLEMENTACIÓN TÉCNICA

Antes de implementar, inspecciona el Hero existente y determina:

- Qué componente contiene la máquina.
- Cómo está estructurada la composición.
- Qué framework utiliza el proyecto.
- Qué sistema de animación está instalado.
- Qué estilos controlan actualmente las transformaciones.
- Si existen conflictos con otras animaciones.

Utiliza las tecnologías existentes.

Si el proyecto utiliza GSAP, puedes implementar el comportamiento de scroll con `ScrollTrigger`.

Configura:

- `scrub` para sincronizar el progreso con el scroll.
- `pin` para mantener temporalmente fija la escena.
- `start` y `end` para definir el recorrido.
- `invalidateOnRefresh` para recalcular dimensiones.
- Limpieza de instancias y eventos al desmontar el componente.

Si el proyecto utiliza otra solución, implementa el mismo comportamiento con las herramientas disponibles.

No instales bibliotecas innecesarias.

### Organización del código

Mantén separados:

1. Controlador del progreso de scroll.
2. Transformaciones de la cámara.
3. Sistema de seguimiento del cursor.
4. Sistema de iluminación.
5. Gestión de estados interactivos.

Evita modificar propiedades compartidas desde diferentes controladores.

No provoques renderizados innecesarios en cada movimiento del cursor o evento de scroll.

Prioriza la fluidez y el rendimiento.

---

# 12. VALIDACIÓN FINAL

Comprueba cada comportamiento de manera independiente.

### Validación del scroll

- El Hero activa correctamente su recorrido.
- El escenario permanece fijo durante el tramo establecido.
- La máquina cambia de escala progresivamente.
- La perspectiva genera sensación real de profundidad.
- Detener el scroll detiene la animación.
- Retroceder el scroll revierte exactamente la secuencia.
- La salida hacia la siguiente sección es natural.

### Validación del cursor

- La máquina responde al movimiento del puntero.
- La inclinación utiliza el centro de la máquina como referencia.
- La iluminación sigue al cursor.
- El reflejo está limitado a la superficie del equipo.
- Al abandonar la máquina, vuelve a su posición neutral.
- El cursor no modifica el progreso de scroll.

### Validación conjunta

- Scroll y cursor funcionan simultáneamente.
- No existen conflictos entre transformaciones.
- La máquina no presenta saltos.
- No aparecen deformaciones.
- La animación es fluida.
- No hay interferencias con los botones.
- La navegación continúa funcionando.

### Validación responsive

- Escritorio.
- Tablet.
- Móvil.
- Movimiento reducido.

---

# RESULTADO ESPERADO

El Hero de MAQSYMA debe convertirse en una experiencia industrial interactiva.

El visitante debe percibir una máquina de soldar como un objeto protagonista dentro de un escenario cinematográfico.

Al desplazarse, la cámara evoluciona de forma sincronizada con el scroll.

Al mover el cursor, la máquina responde con inclinación, iluminación y reflejos.

Ambos comportamientos deben funcionar simultáneamente, de manera independiente y sin interrupciones.

**No te limites a añadir animaciones de entrada. Implementa un sistema real de animación vinculado al scroll y una interacción tridimensional independiente controlada por el cursor.**

Implementa los cambios sobre el Hero existente, conserva su contenido comercial y no modifiques las demás secciones de MAQSYMA.