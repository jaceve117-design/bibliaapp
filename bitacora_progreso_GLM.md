# BP — Bitácora de Progreso GLM

**Proyecto:** Biblioteca cristiana digital (nombre provisional — decisión pendiente E1)
**Rol de GLM:** constructor único de la implementación.
**BP creada:** 2026-09-17 · **Inicio de construcción:** 2026-09-17
**Fuente de decisiones:** `01. Investigacion/Ideas Finales/` (ideas finalistas de Claude y de GLM, seleccionadas por el usuario) + `bitacora_progreso.md` (bitácora maestra, D1–D15).

> Esta BP registra **el plan a implementar** y **el paso a paso de cómo se va desarrollando**.
> La bitácora maestra sigue siendo la fuente de verdad estratégica; esta BP es la fuente de verdad operativa de la construcción. Nada se borra: lo completado se marca, lo cambiado se anota con fecha y motivo.

---

## 1. Decisiones adoptadas para la construcción (del cruce de ideas finalistas)

| # | Decisión | Origen |
|---|---|---|
| B1 | **La traducción al español es el producto central.** El lector es el envase; cuando haya conflicto de prioridad, gana la traducción. | Claude A1 ✔ seleccionada |
| B2 | **Desarrollo por corte vertical:** un libro piloto (Romanos o Juan) de punta a punta antes de cualquier ingesta masiva. | Claude A2 ✔ |
| B3 | **Corpus MVP mínimo:** núcleo de 6 fuentes (RV1909, WEB, STEPBible-Data, Easton, Matthew Henry, TSK) + cierre del núcleo (SBLGNT, JFB, Barnes, Nave's). ISBE y el resto → segunda ola. | Claude A3 + GLM A1/A6 ✔ |
| B4 | **Módulo general del Mar Muerto aplazado a post-v1.** Cuando entre, solo el ángulo Qumrán ↔ texto masorético anclado al versículo. | Claude A4/A5 ✔ |
| B5 | **Aparato de traducción:** glosario maestro antes del primer párrafo · revisión humana del 100 % de lo doctrinal (no muestreo) · original siempre a un clic · memoria de traducción · guía de estilo · canal de reporte de errores del lector. | Claude B1–B6 + GLM E5/E6 ✔ |
| B6 | **Fase legal acotada al corpus MVP** (no al universo). Ficha con las 12 preguntas + campos traductor/muerte del traductor, jurisdicción ES-AL, embeddings sí/no. | GLM E1 + Claude C1/C2/C5/C6/C8 ✔ |
| B7 | **Abogado de PI solo en la puerta de lanzamiento comercial**, con las fichas ya completas. | GLM B9 + Claude C9 ✔ |
| B8 | **OSIS referencia canónica** (`John.3.16`) + `bible-passage-reference-parser` para entrada ES/EN. | GLM C1 + Claude D1 ✔ |
| B9 | **USFM 3 formato de ingesta primario.** OSIS respaldo, ZefaniaXML último recurso. | GLM C2 + Claude D2 ✔ |
| B10 | **Licencia como campo de primera clase** en el modelo de datos: `license_id` obligatorio + flags (restricted, copyleft, permite_embeddings). | GLM C7 ✔ |
| B11 | **Offline:** SQLite-WASM + IndexedDB en web, SQLite nativo en móvil; esquemas e índices compartidos. Subconjunto offline decidido con datos de uso. | GLM C5 + Claude D3 ✔ |
| B12 | **Esquema de anotación diseñado CRDT-ready ahora** (UUID en cliente + timestamp UTC alta resolución); mecanismo de sync se implementa en su fase. | Claude D4 ✔ |
| B13 | **Búsqueda semántica (pgvector) aplazada a post-MVP.** MVP con tsvector `spanish`/`english` sobre PostgreSQL. | GLM C3 ✔ |
| B14 | **Cero GPL embebida** (del ecosistema SWORD: catálogo y formato, no el motor) · **cero APIs de terceros en runtime** · **traducciones con derechos solo por contrato directo, nunca API.Bible** · **IA siempre cita fuente o no emite** · **obras restringidas soportadas desde el esquema**. | Claude D5/D7/D8/D9/D10 ✔ |
| B15 | **Experiencia MVP = un solo flujo impecable:** pasaje → interlineal → léxico → comentario → nota/subrayado, en las obras del corpus. Notas 100 % locales con exportación/importación desde el día uno. Atribución visible por obra. | GLM D1/D2/D3 ✔ |
| B16 | **Estética:** sobria, elegante, minimalista y vanguardista; tipografía de lectura prolongada con hebreo y griego real, tokens con modo claro/oscuro. Etiquetado autor/tradición/fecha en cada obra. | GLM D4 + Claude A6 ✔ |
| B17 | **Ejecución:** validación automática como PORTÓN de ingesta · Fase legal solo sobre el MVP · spike de OCR de ISBE antes de comprometer la segunda ola · avance por **obras validadas**, no por pasos administrativos. Estimación honesta: 4–6 meses MVP (1 dev + 1 editor parcial, 60 % limpieza de datos). | GLM E1–E4/E7 ✔ |

### Enmiendas a la bitácora maestra registradas (2026-09-17)

Las 5 discrepancias de Claude seleccionadas por el usuario modifican el plan vigente: D16 (traducción = producto) · D17 (corte vertical) · D18 (corpus mínimo) · D19 (Mar Muerto aplazado) · D20 (puerta de calidad de traducción). Registradas en `bitacora_progreso.md` junto a D21 (pgvector aplazado, de GLM).

---

## 2. Plan a implementar — secuencia consolidada

Leyenda: ⟡ = puerta de decisión (no se pasa sin aprobación explícita del usuario).

| # | Paso | Contenido | Criterio de "hecho" | Estado |
|---|---|---|---|---|
| 0 | Cierre Fase 0 | Nombre, dominio y disponibilidad en tiendas (bloquea marca/despliegue) · `git init` | Nombre decidido por el usuario; repo inicial commiteado | nombre `[!]` bloqueado en usuario · git `[x]` commit `e0fa316` |
| 1 | Fase legal MVP | Plantilla de ficha (12 preguntas + traductor + jurisdicción + embeddings) · fichas del corpus MVP | Fichas archivadas en `02. Legal/` con licencia literal | `[x]` plantilla + 6 fichas del núcleo · ⚠️ pendiente menor: archivar textos literales de eBible/OpenBible |
| 2 | Fundación técnica | Andamio web + tokens de diseño · esquema `work/edition/node/link/lemma` con OSIS · pipeline USFM→JSON con validación como portón · semilla de datos real | Lector muestra texto real ingerido por pipeline validado | `[x]` pipeline genérico multi-edición: **RV1909 + WEB validadas** · pendiente: esquema PostgreSQL |
| 3 | Corte vertical — piloto | Libro piloto (Juan 1 como demo inicial; Romanos/Juan completo a decidir): capa STEPBible con interlineal · RV1909+WEB del libro · glosario maestro · traducción de Henry del libro · revisión humana 100 % doctrinal | Piloto completo navegable ES+EN+griego con comentario traducido | `[~]` capa STEPBible completa de TODA la Biblia ingerida y visible · traducción del piloto (Henry) pendiente |
| 4 | ⟡ Puerta de calidad | ¿La traducción es publicable con nuestro nombre? Si no: corregir método antes de escalar | Decisión registrada en esta BP | `[ ]` |
| 5 | Conexiones | TSK (~500.000 referencias) anclado a OSIS | Referencias visibles en el lector | `[ ]` |
| 6 | Escalado corpus | Núcleo 6 fuentes validado + cierre (SBLGNT, JFB, Barnes, Nave's) — cada obra: ficha + ingesta validada + atribución | Métrica: obras en estado `validada` / `lanzar` | `[ ]` |
| 7 | Producto completo | Flujo pasaje→interlineal→léxico→comentario→nota/subrayado · notas locales + export/import · panel Fuentes · reporte de errores · etiquetado autor/tradición/fecha | Flujo completo sin fricción en el corpus | `[ ]` |
| 8 | ⟡ Puerta legal | Página pública de atribuciones · revisión abogado PI (foco ES/AL) | Informe favorable registrado | `[ ]` |
| 9 | Lanzamiento web | PWA + offline empaquetado | Web pública | `[ ]` |
| 10 | Traducción continua | Easton/Nave → Henry → resto, con trazabilidad al original | Backlog por obra con estado de revisión | `[ ]` |
| 11 | Móvil | Capacitor sobre build web · SQLite nativo | Android primero → iOS | `[ ]` |

### Riesgos con dueño

| Riesgo | Mitigación | Estado |
|---|---|---|
| Ingesta con textos mal limpiados | Validador como portón (conteo de versículos, lagunas, refs) | construyéndose con la semilla |
| Copyleft heredado en traducciones (CC BY-SA) | Sin dueño tras la selección — no bloquea el MVP; decidir antes de ingerir material ShareAlike | `[!]` abierto |
| Alcance infinito | Lista cerrada B3; una obra entra cuando está verificada de principio a fin | vigente |
| Licencia de nuestras traducciones + modelo de sostenimiento | Pendientes de la bitácora maestra; las exigirá la puerta legal (paso 8) | `[!]` usuario |

---

## 3. Decisiones técnicas de construcción (concretas, para esta implementación)

- **Stack:** Next.js (App Router) + TypeScript. CSS con **tokens propios** en `globals.css` (variables CSS): la estética manda sobre el framework.
- **Tipografía:** stacks de sistema en esta fase inicial (Georgia/Palatino serif de lectura + system-ui de interfaz). La selección de tipografías autoalojadas con hebreo/griego real es tarea de Fase de diseño (B16) — **no** bloquea el arranque.
- **i18n:** rutas `/es` primero (ES principal); catálogo de strings centralizado desde el día uno para habilitar `/en` sin refactor (decisión D7 de bitácora maestra).
- **Datos de semilla:** descarga real de RV1909 en USFM desde eBible.org (dominio público) + parser propio mínimo → JSON por libro con `osis_ref`. Es el pipeline B9 en miniatura, con validación de conteo.
- **Tema:** claro/oscuro por tokens + `prefers-color-scheme` + toggle manual persistido.
- **Atribución visible** desde la primera pantalla del lector (B15/G-D3).

---

## 4. Registro cronológico

### 2026-09-17 · GLM — Inicio de construcción

- BP creada con el plan consolidado de las ideas finalistas (secciones 1–3).
- Enmiendas D16–D21 registradas en la bitácora maestra.
- Entorno verificado: Node v24.15.0, npm 11.12.1.

### 2026-09-17 · GLM — Primer incremento: corpus + web (pasos 0 y 2)

**Datos (pipeline B9 + portón E2):**
- RV1909 descargada de eBible.org en USFM (2,3 MB, 66 libros). Crudo archivado en `05. Datos/corpus_crudo/rv1909_usfm` con su ZIP de procedencia.
- `07. App/app/scripts/ingesta-rv1909.mjs`: parser USFM→JSON por libro con **portón de validación** (66 libros exactos, capítulos por libro, secuencia sin lagunas ni duplicados, 11 libros ancla, total exacto).
- **Portón funcionó de verdad:** detectó 3 errores del propio pipeline en su primera corrida (mapeo de códigos de archivo, notas al pie multilínea, orden de limpieza de marcadores `\add*`) y quedó corregido.
- Resultado validado: **31.102 versículos** (versificación linaje TR/KJV), 66 libros, **18 versos vacíos en la edición fuente** documentados en `manifest.incidentes` (p. ej. JOB 35:16 fusionado en 35:15). No se rellenaron: regla de no-fabricación.
- Hallazgo para el futuro: el USFM trae marcado `\w|strong="Hxxxx"` — alineación palabra↔Strong ya embebida en el crudo, materia prima del interlineal (tarea 3.7).
- Salida: `public/data/rv1909/{OSIS}.json` + `_manifest.json` (5,5 MB) — carga diferida por libro.

**Web (`07. App/app`, Next.js 16 + TypeScript + Tailwind 4):**
- Sistema de diseño propio en tokens CSS (`globals.css`): marfil/tinta/oro en claro, carbón cálido en oscuro; serif de lectura + sans de interfaz; `prefers-reduced-motion` respetado. Tipografías autoalojadas (hebreo/griego) quedan para la fase de diseño (B16).
- Rutas `/es` y `/es/lector`; raíz `/` redirige a `/es` (D7). Catálogo de strings `lib/i18n.ts` con ES y EN ya escritos.
- **Lector funcional con la Biblia completa**: selector de 66 libros y capítulos, flechas ←/→ de teclado, `?ref=JHN.3` compartible, números de verso en OSIS (`data-osis`, anclaje futuro de notas), atribución visible por obra, tema claro/oscuro persistido sin parpadeo.
- Aviso editorial visible: los 18 versos vacíos de la fuente se declaran al lector.
- `npm run build` ✓ (4 rutas estáticas) · prueba de humo con `next start` ✓ (portada, lector, JSON servido, redirect 307).

**Repo:**
- `git init` en la carpeta madre + `.gitignore` + commit inicial `e0fa316`.

**Métrica de obras validadas:** RV1909 → estado **`validada`** (1 de las 6 del núcleo).

**Siguiente:** paso 1 — plantilla de ficha legal + fichas de las 6 fuentes del núcleo en `02. Legal/`; en paralelo, descarga USFM de WEB (EN) y su ingesta por el mismo pipeline.

### 2026-09-17 · GLM — WEB validada + fichas legales del núcleo + selector de obra (pasos 1 y 2 completados)

**Datos:**
- WEB (English Bible) descargada de eBible.org y ingerida por el pipeline generalizado (`scripts/ingesta.mjs <edición>`). **31.103 marcadores validados**, 66 libros canónicos; los deuterocanónicos del ZIP quedan preservados en el crudo para la decisión pendiente de canon.
- **Hallazgo de versificación con evidencia del crudo:** WEB sigue la versificación crítica en Romanos — el capítulo 16 termina en v24, la doxología TR 16:25-27 va en nota al pie y `\v 25` queda vacío. Por eso ROM = 434 marcadores y el total es 31.103 (no 31.102). Registrado en el config del pipeline y en la ficha legal. Esto es materia prima para la tarea 2.2 (mapeo de versificación).
- Fix de limpieza: marcadores de nivel carácter `\+w … \+w*` ahora se eliminan correctamente (afectaba a la WEB).
- Métrica: **2 obras validadas de 6** (RV1909 31.102 · WEB 31.103).

**Legal (`02. Legal/`):**
- `00 - Plantilla de ficha legal.md`: 12 preguntas contractuales (ChatGPT) + campos GLM (traductor/muerte, jurisdicción, copyleft, embeddings, licencia de repo ≠ contenido, derechos de edición e imagen).
- 6 fichas del núcleo: **RV1909** y **WEB** (aprobadas y ejecutadas), **STEPBible-Data** (CC BY 4.0, única con licencia verificada en vivo), **Easton**, **Matthew Henry**, **TSK** (aprobadas, con fuente concreta ⚠️ por fijar antes de ingerir). Nota crítica en WEB: el nombre «World English Bible» es marca registrada — hoy la interfaz muestra «WEB».

**Producto:**
- Lector con **selector de obra RV1909 | WEB** (toggle segmentado en la barra fija), URL `?obra=web&ref=JHN.3`, atribución por obra servida desde el manifiesto (obra, licencia, fuente, fecha, total), aviso editorial genérico con conteo real de versos vacíos.
- La barra fija de libros/capítulos (petición del usuario) quedó integrada como segunda fila del header sticky.
- Build ✓ · prueba de humo ✓ (es 200, JSON de ambas obras servido).

**Siguiente:** descargar + ingestar STEPBible-Data (TSV→lemma) y su validación; luego TSK; luego el corte vertical del libro piloto (paso 3).

### 2026-09-17 · GLM — STEPBible-Data ingerida: interlineal completo de la Biblia (paso 2 cerrado, paso 3 avanzado)

**Datos (`scripts/ingesta-stepbible.mjs`, crudo en `05. Datos/corpus_crudo/stepbible_data/`):**
- TAGNT (NT griego amalgamado): **141.720 palabras**, 27 libros. Con **glosas en inglés Y en español** — la columna ES venía en el TSV del propio Tyndale House: el interlineal en español es gratis.
- TAHOT (AT hebreo, Westminster Leningrad): **283.734 palabras**, 39 libros, con morfología completa.
- TBESG (10.689 entradas) y TBESH (8.623): léxicos completos con definición.
- **Portón contra RV1909: 425.354 coordenadas exactas (99,98 %) · 100 desajustes de versificación documentados** (p. ej. NUM.12.16, vacío en nuestra edición). El mapeo formal de versificación (tarea 2.2) ya tiene su tabla de casos real.
- Correcciones durante la ingesta (el portón las detectó): prefijo de léxicos (`G0` solo agarraba 1/10 de las entradas → regex `^G\d+\t`), marcadores de nivel carácter `\+w`, y limpieza del translit pegado al griego.
- Salida: 51 MB en `public/data/stepbible/` — JSON por libro + léxicos + manifiesto.

**Producto:**
- **Modo interlineal en el lector** (botón Ω en la barra fija): cada verso como fichas de palabra (palabra original · glosa ES o EN · Strong + morfología), dirección RTL automática en hebreo, clic en palabra → **ficha léxica** (TBESG/TBESH) en panel inferior con definición y atribución. Este es el primer eslabón del flujo B15: pasaje → interlineal → léxico.
- Build ✓ · prueba de humo ✓ (lector 200, tagnt/tahot/tbesg servidos).

**Repo:**
- `05. Datos/corpus_crudo/` excluido del git (`re-descargable`, URLs y procedencia en fichas y manifiestos) para mantener el repo ligero; el crudo sigue en disco.

**Métrica de obras validadas: 3 de 6** — RV1909 · WEB · STEPBible-Data (TAHOT+TAGNT+TBESH+TBESG).

**Siguiente:** TSK (referencias cruzadas) → 4/6; después Easton y Matthew Henry; con las 6, glosario maestro y piloto de traducción (puerta D20).
