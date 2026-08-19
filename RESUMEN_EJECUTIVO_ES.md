# Resumen ejecutivo — Three HUD

## Qué estamos construyendo

Una librería **retained-mode**, tipada y canvas-native para diseñar HUDs e interfaces de juegos directamente dentro de Three.js, sin convertir cada control en HTML/CSS y sin obligar al consumidor a usar React.

El producto debe resolver bien cinco problemas concretos:

1. **Coordenadas de diseño previsibles:** crear el HUD en 1920×1080 u otra resolución lógica y escalarlo a cualquier viewport.
2. **Capas con políticas distintas:** UI suave, UI pixel-art y retículas nativas pueden coexistir sin compartir un escalado incorrecto.
3. **Texto intercambiable:** Windfoil, SDF y bitmap implementan contratos comunes; los widgets no conocen el backend.
4. **Vocabulario de juego:** barras, rings, gauges, crosshairs, slots, inventarios y hotbars vienen incluidos.
5. **Producto publicable:** importación SSR-safe, tree shaking, tarball probado en un consumidor externo, límites arquitectónicos y evidencia visual/performance.

## Decisión principal

La librería usa un **workspace liviano**, pero publica **un solo paquete en v0.1**. Los backends se aíslan mediante subpath exports:

```text
@scope/three-hud
@scope/three-hud/text/windfoil
@scope/three-hud/text/sdf
@scope/three-hud/text/bitmap
```

No se fragmenta el proyecto en seis paquetes prematuramente. El playground y los fixtures sí viven fuera del paquete para probar que la API pública alcanza.

## Windfoil

Windfoil es la apuesta técnica más interesante y también el mayor riesgo. Por eso aparece primero como un programa de investigación con gate:

- demostrar overlay Three.js WebGPU sin parches privados;
- portar preprocessing de curvas y row bands de forma limpia y tipada;
- renderizar instancias de glifos con APIs públicas;
- medir zoom, DPR, clipping, memoria, minificación y device loss;
- registrar una decisión: **production candidate**, **experimental adapter** o **blocked research**.

El fracaso del gate no bloquea la librería: SDF y bitmap mantienen el producto funcional.

## Qué entra en v0.1

- árbol retained-mode;
- lifecycle explícito;
- layers y reference resolution;
- `contain`, `cover`, `native`, `stretch`, `integer`;
- safe frame, zoom y pixel snapping;
- rects, rounded rects, lines, images, nine-slice, arcs y rings;
- fuentes por URL/bytes/preprocesadas;
- texto LTR básico con kerning, líneas, wrap y align;
- Windfoil según gate, SDF baseline y bitmap pixel-perfect;
- absolute, stack y fixed grid;
- clipping rectangular;
- pointer input, hit testing, hover/press/click/capture;
- themes;
- Panel, Label, IconLabel, LinearBar, RadialBar, Gauge, Crosshair, Slot, InventoryGrid y Hotbar;
- diagnostics, visual regression, benchmarks, package gates y release automation.

## Qué queda fuera

- CSS/Flexbox completo;
- React como requisito;
- world-space UI y XR;
- teclado/gamepad/focus accesible;
- IME y campos de texto;
- shaping complejo y bidi completo;
- drag & drop;
- editor visual;
- animador propio;
- fuentes incluidas en el npm package.

## Cómo está organizado el trabajo

El paquete contiene **73 tickets detallados**, cada uno con:

- resultado esperado;
- alcance;
- criterios de aceptación;
- comandos de verificación;
- evidencia obligatoria;
- riesgos;
- exclusiones;
- dependencias.

El orden de trabajo se divide en seis gates:

- **M0:** probar arquitectura y Windfoil;
- **M1:** core, viewport y primitivas;
- **M2:** texto y layout;
- **M3:** input y widgets;
- **M4:** release candidate;
- **M5:** publicación `v0.1.0`.

La primera unidad de ejecución real es `HUD-001`; el gate técnico central es `HUD-011`; el cierre de release es `HUD-073`.
