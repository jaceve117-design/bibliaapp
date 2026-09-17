# Ideas finalistas de Posturas de GLM

> **Selección manual del usuario** · 17 de septiembre de 2026
> Fuente: análisis de GLM (ZCode) sobre las cuatro investigaciones — `01.1` (Claude), `01.2` (GLM), ChatGPT (PDF) y Gemini (PDF).
> Este documento, junto a su par de Claude, alimenta el **documento final de metodología** del proyecto.
> **Ideas seleccionadas: 19 de 35.**

---

## A · Corpus y contenido del MVP

### [G-A1] Corpus MVP minimalista: 7 obras impecables antes que 60 a medias

**Postura:** El MVP se lanza solo con RV1909, WEB, STEPBible-Data completo (TAHOT/TAGNT/TBESH/TBESG), SBLGNT, Henry+JFB+Barnes, Easton+Nave's+Strong, y TSK. Cada obra entra verificada de principio a fin; una obra mal ingerida es deuda técnica y reputacional.

**Paso a seguir:** Fijar esta lista como lista cerrada de Fase 3 y no abrir nuevas obras hasta que las 7 pasen validación completa.

### [G-A6] Segunda ola ordenada: ISBE tras limpieza OCR, luego Clarke, Gill, Calvino, K&D, Vulgata/LXX/TR, Sefaria, Pleiades

**Postura:** El enriquecimiento tiene orden: primero lo que completa el estudio (ISBE, más comentarios), luego lo histórico-contextual.

**Paso a seguir:** Definir la segunda ola como backlog priorizado en la bitácora tras el lanzamiento del MVP.

## B · Legal y licencias

### [G-B9] Abogado de PI solo antes del lanzamiento comercial — y con foco en jurisdicción

**Postura:** Las cuatro razonamos con derecho de EUA (umbral 1929, renovación); España y América Latina usan vida+70, con resultados distintos obra por obra. La revisión profesional no es para el arranque, sí para el lanzamiento monetizado.

**Paso a seguir:** Presupuestar la revisión legal como hito del lanzamiento comercial, con la tabla de fichas ya completa para acortar el trabajo del abogado.

## C · Arquitectura y datos

### [G-C1] OSIS como referencia canónica + parser de entrada ES/EN

**Postura:** OSIS (John.3.16) es estándar real y establecido; mejor que una convención propia. Con bible-passage-reference-parser, 'San Juan 3:16-17' y 'Jn 3, 16' se normalizan de un golpe.

**Paso a seguir:** Adoptar OSIS como clave de alineación universal de todos los nodos y del anclaje de notas.

### [G-C2] USFM 3 como formato de ingesta primario

**Postura:** Es el estándar de las Sociedades Bíblicas y todos los corpus serios lo exportan. OSIS de respaldo; ZefaniaXML solo como último recurso.

**Paso a seguir:** Pipeline: USFM → parser propio → esquema node/edition con validación como portón.

### [G-C3] Búsqueda semántica con embeddings APLAZADA

**Postura:** Con TSK + Nave's + lemas de Strong, la búsqueda 'por idea' ya funciona sorprendentemente bien sin vectores. pgvector es fácil de añadir después a una BD bien diseñada; hacerlo desde el día uno invita a afinar embeddings en vez de limpiar textos.

**Paso a seguir:** PostgreSQL + tsvector (spanish/english) en el MVP; pgvector como mejora posterior con datos de búsqueda reales de usuarios.

### [G-C5] Offline: SQLite-WASM + IndexedDB en web, SQLite nativo en móvil

**Postura:** Permite búsqueda de texto completo del lado del cliente y conserva esquemas/índices entre web y móvil. Pero el subconjunto offline se decide con datos de uso, no por decreto.

**Paso a seguir:** Arquitectura offline en Fase 2; tamaño y contenido del paquete offline definidos tras el lanzamiento web.

### [G-C7] Modelo de datos work/edition/node/link/lemma con la licencia como campo de primera clase

**Postura:** Cada nodo es consultable con su licencia; eso permite filtrar qué se cachea, qué se indexa y qué se exporta sin lógica especial por fuente.

**Paso a seguir:** Esquema en Fase 2 con license_id obligatorio en work y flags (restricted, copyleft, permite_embeddings).

## D · Producto y UX

### [G-D1] El MVP es una sola experiencia impecable: pasaje → interlineal → léxico → comentario → nota/subrayado

**Postura:** Todo lo demás (manuscritos, geografía, audio, planes de lectura) es post-MVP. El encadenamiento de estudio en español es el hueco que ninguna plataforma gratuita cubre hoy.

**Paso a seguir:** Definición de 'hecho' del MVP = ese flujo completo sin fricción en las 7 obras del corpus.

### [G-D2] Notas y subrayados 100% locales primero, con exportación/importación desde el día uno

**Postura:** Lectura anónima (D4) ya lo pide. La exportación/importación es el seguro de datos del usuario y elimina la prisa por construir cuentas.

**Paso a seguir:** Feature del MVP: exportar notas/subrayados a un archivo portable (JSON/Markdown) y reimportarlos.

### [G-D3] Atribución visible por obra en la interfaz

**Postura:** CC BY la exige (STEPBible, SBLGNT) y además genera confianza académica: el usuario ve de dónde sale cada texto.

**Paso a seguir:** Panel 'Fuentes' por obra, accesible desde el lector, alimentado por el Rights Registry.

### [G-D4] Tipografía de lectura prolongada con hebreo y griego real, y modo claro/oscuro por tokens

**Postura:** La estética elegante y vanguardista (requisito del proyecto) se sostiene en tipografía: soporte real de hebreo, griego politónico y transliteración desde el sistema de tokens, no como parche.

**Paso a seguir:** En Fase 5: seleccionar tipografías probadas para hebreo/griego y definir tokens antes de diseñar pantallas.

## E · Metodología, fases y ejecución

### [G-E1] Fase 1 sobre las 7 obras del MVP esta semana — y solo sobre ellas

**Postura:** Hacer fichas de todo el universo es otra forma de alcance infinito. La Fase 1 cubre exactamente el corpus del MVP; el resto de fichas se hace justo antes de ingestar cada obra nueva.

**Paso a seguir:** Fichas legales de las 7 obras como primer entregable concreto del proyecto.

### [G-E2] Validación automática como PORTÓN de ingesta, no como control final

**Postura:** Conteo de versículos, detección de lagunas, validación de referencias: si falla, la obra no entra a la BD. Es la mitigación del riesgo n.º 1 (calidad de ingesta).

**Paso a seguir:** Construir el validador antes que el primer parser (tarea 3.1 ampliada).

### [G-E3] Medir primero el OCR real de una obra 'difícil' antes de comprometer la Fase 3 completa

**Postura:** ISBE, Biblical Illustrator y M'Clintock-Strong tienen OCR deficiente; nadie cuantificó cuánto. La limpieza puede costar más que la traducción.

**Paso a seguir:** Spike de 2–3 días: ingestar ISBE de prueba, medir % de error y decidir con números.

### [G-E4] Estimación honesta: 4–6 meses de MVP con 1 dev + 1 editor parcial; 60% del esfuerzo es limpieza de datos

**Postura:** El roadmap de 90 días de ChatGPT es el doble de optimista. Prometer 4–6 meses es prometer lo descubrible.

**Paso a seguir:** Planificar el lanzamiento web con margen y reportar avance por obra validada, no por semana de calendario.

### [G-E5] La traducción ES es trabajo editorial con glosario fijo y trazabilidad — nunca procesamiento por lotes

**Postura:** Es el diferenciador del proyecto y también su riesgo reputacional: una mala traducción de Henry destruye la credibilidad. Orden: Easton y Nave (alto uso, entradas cortas) → Henry → resto.

**Paso a seguir:** Fase 4 con glosario maestro, memoria de traducción, muestreo con revisión humana y marcado de estado por obra.

### [G-E6] Canal de reporte de errores del lector desde el lanzamiento

**Postura:** El mecanismo para que el lector reporte errores de traducción o de texto no es un feature post-MVP: es el sistema de control de calidad distribuido más barato que existe.

**Paso a seguir:** Botón 'reportar problema' anclado al pasaje en el MVP, con cola de revisión editorial.

### [G-E7] El proyecto avanza por obras validadas, no por pasos administrativos

**Postura:** Mi regla de ejecución: cada semana cierra con N obras con ficha + ingesta validada + atribución visible. La bitácora registra avance real, no actividad.

**Paso a seguir:** Métrica semanal del proyecto: obras en estado 'lanzar' y obras en estado 'validada'.

---

*Documento generado por el seleccionador de posturas de GLM. Combinar con "Ideas finalistas de Posturas de Claude" para armar el paso a paso final del proyecto.*
