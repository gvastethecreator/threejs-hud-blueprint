# Resumen ejecutivo — Three HUD

## Qué construimos

Una librería retained-mode, tipada y canvas-native para HUDs de juego dentro de Three.js. No convierte cada control en HTML o CSS. No obliga a React.

El producto resuelve cinco problemas:

1. **Coordenadas de diseño estables.** Autoría en 1920×1080 u otra resolución lógica, y escala a cualquier viewport.
2. **Capas con políticas distintas.** UI suave, UI pixel-art y retículas nativas pueden coexistir.
3. **Texto intercambiable.** Windfoil, SDF y bitmap implementan el mismo contrato. Los widgets no conocen el backend.
4. **Vocabulario de juego.** Barras, anillos, gauges, crosshairs, slots, inventarios y hotbars.
5. **Paquete publicable.** Importación segura en SSR, tree shaking, tarball en un consumidor externo, y evidencia visual y de rendimiento.

## Decisión principal

El workspace es liviano. v0.1 publica un solo paquete. Los backends se aíslan con subpath exports:

```text
@scope/three-hud
@scope/three-hud/text/windfoil
@scope/three-hud/text/sdf
@scope/three-hud/text/bitmap
```

El playground y los fixtures viven fuera del paquete para probar que la API pública alcanza.

## Windfoil

Windfoil es la apuesta técnica de mayor riesgo. Entra como adaptador experimental en WebGPU nativo. Si el gate falla, SDF y bitmap mantienen el producto.

## Qué entra en v0.1

- árbol retained-mode y lifecycle explícito
- layers y reference resolution
- `contain`, `cover`, `native`, `stretch`, `integer`
- primitivas, texto LTR básico, layout, input y themes
- Panel, Label, IconLabel, LinearBar, RadialBar, Gauge, Crosshair, Slot, InventoryGrid y Hotbar
- diagnostics, visual regression, benchmarks y gates de paquete

## Qué queda fuera

- CSS o Flexbox completo
- React como requisito
- world-space UI y XR
- teclado, gamepad y focus accesible
- IME y campos de texto
- shaping complejo y bidi completo
- drag and drop, editor visual, animador propio
- fuentes dentro del paquete npm

## Estado actual

El código de v0.1 existe en este workspace. HUD-073 se cerró en local. La publicación npm sigue bloqueada: el nombre es `@scope/three-hud` y no hay autenticación de registro.

El siguiente trabajo no es un ticket nuevo de producto. Es una revisión de calidad de cada ticket de implementación contra sus criterios de aceptación y su evidencia.

## Cómo está organizado el trabajo

Hay 73 tickets, 12 epics y 6 gates de evidencia: M0 a M5. Los briefs están en `planning/tickets/`. El cierre de publicación es `HUD-073`.
