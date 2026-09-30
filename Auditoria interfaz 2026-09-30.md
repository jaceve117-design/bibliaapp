# Auditoría de interfaz — Biblia de Estudio AION (2026-09-30)

Auditada por GLM en navegador real (IAB) sobre producción tras desplegar el título
anclado + badge de recursos. Vistas probadas: **móvil 390×844, tablet 768×1024,
escritorio 1440×900**, tema oscuro y claro, con y sin recursos activos.
El objetivo fue ENCONTRAR bugs, no repararlos: cada hallazgo va con severidad y
sugerencia de arreglo para la próxima etapa.

## Hallazgos (orden de severidad)

| # | Severidad | Hallazgo | Dónde | Sugerencia |
|---|---|---|---|---|
| A1 | **GRAVE** | Interlineal: la tarjeta flotante (palabra original + glosa + morfología) queda auto-abierta sobre el contenido al activar la capa o cargar el capítulo, tapa el texto y no se cierra tocando fuera | móvil, capa Interlineal | cerrar la tarjeta al tocar fuera y no abrirla por defecto; anclarla a la palabra tocada |
| A2 | **GRAVE** | Cambio de tema en caliente: las carpetas de comentario ya abiertas no se repintan (quedan oscuras en tema claro hasta recargar) | móvil, Ajustes → Tema | que los colores de carpeta usen variables de tema (no valores fijos) y re-render al cambiar |
| A3 | Media | Interlineal en tema claro: morfología gris muy tenue sobre caja blanca (contraste bajo) | móvil/PC, tema claro | subir contraste de la línea de morfología (`--muted` → tono más oscuro en claro) |
| A4 | Media | Jerarquía de capas vs título anclado: tarjetas flotantes del interlineal y tooltips pasan por encima del título sticky — decidir qué manda | móvil | definir z-index coherente: overlays activos sobre el sticky, pero cerrables |
| A5 | Menor (UX) | Dos contadores parecidos: barra «▦ 2» (recursos ACTIVOS) y badge «▦ 7» (recursos DISPONIBLES del capítulo) — confunde | móvil/PC | distinguir iconos o etiquetas («activos» vs «disponibles») |
| A6 | Mantenimiento | CSS duplicado: `.lector-titulo` (y otras reglas) repetidas 4× en globals.css — cualquier cambio futuro debe ir al final | globals.css | limpieza pendiente de Claude (ya anotada en su lista) |
| A7 | Media (verificar) | El scroller real no es `document.body` (scrollTo sobre body no mueve; `window.scrollY` sí refleja) — puede afectar la restauración de posición al volver de un recurso | móvil | identificar el contenedor de scroll y revisar restauración de posición |
| A8 | Menor | Buscador: pestaña «Comentarios» solo lista Matthew Henry; K&D/Vincent/JFB/Barnes faltan hasta registrar las obras; «Preparando la búsqueda…» persiste demasiado sin progreso | búsqueda | generar índices de búsqueda de las obras nuevas; barra de progreso |
| A9 | Nota | En el navegador de pruebas (IAB) scroll táctil y captura dan timeout tras uso prolongado — falsos negativos del HARNESS, no de la app; revalidar en móvil real | pruebas | revalidar A1/A2 con dedo real |
| A10 | Pendiente | K&D y Vincent no aparecen aún en el selector COMENTARIOS ni en Recursos/Fuentes (los DATOS ya están publicados y el badge los cuenta) | lector | registrar en COMENTARIOS/RUTA_COMENTARIO (archivos de Claude) |

## Verificado OK (sin hallazgos)

- **Badge de recursos ▦ 7**: contador exacto y contextual — GEN 1 → 7 (Henry, JFB, Barnes, K&D, Nave's, TSK, Easton; sin Vincent), JHN 3 → 7 (con Vincent, sin K&D). Tooltip con los nombres; toque abre el panel Recursos. Posición: sobre «GEN.1 · RV1909», como pidió el usuario.
- **Título de capítulo anclado**: visible con scroll profundo en móvil (top estable 107px bajo la cabecera) y PC (128px), fondo con desenfoque, no interfiere con la lectura.
- Comentario de Matthew Henry: resumen de capítulo en ES, insignia «sin revisar», conmutador ES/EN, citas enlazadas (Job 35:10), bloques plegables por verso con eventos Theographic intercalados.
- Panel Recursos completo (comentarios/diccionarios/herramientas/en el texto) y Ajustes con la sección Diagnóstico (capturó 36+ eventos en vivo).
- Buscador: pestañas Pasajes/Comentarios/Diccionario, indización local, abre como cuadro de la mesa en PC.
- Interlineal hebreo en PC: cajas por verso con Strong (H7225…) y morfología traducida — excelente para estudio.
- Mesa de escritorio 1440px: texto + cuadro de comentario con barra propia; tema claro legible tras recarga.
- Tablet 768px: render correcto de Juan 3 con badge y título.

## Pendientes de segunda pasada (con dedo real en el móvil)

- Sintaxis MACULA: Capas → Interlineal (NT) → tocar palabra griega → sección Sintaxis en la ficha.
- Mapa al tocar un lugar Theographic (chip «X · mapa»).
- Notas y subrayados (✍) con export/import.
- Griego Ξ (texto corrido SBLGNT) y K&D/Vincent cuando Claude los registre.
- Instalación PWA y offline (avión) tras estos cambios.
