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
| 5 | Conexiones | TSK (~500.000 referencias) anclado a OSIS | Referencias visibles en el lector | `[x]` 386.384 referencias validadas y navegables en el panel del verso |
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

### 2026-09-17 · GLM — TSK + OpenBible (4/6) y PWA instalable

**Datos (`scripts/ingesta-tsk.mjs`, crudo en `05. Datos/corpus_crudo/tsk_data/`):**
- Fuentes reales localizadas: la página `/data` de OpenBible.info hoy da 404 — el dataset vive agregado en `neuu-org/bible-crossrefs-dataset` (licencia CC BY 4.0 verificada leyendo su LICENSE). TSK crudo = 32 shards SoulLiberty (PD); OpenBible = TSV con licencia declarada en su propia primera línea («CC-BY 2016-02-01»).
- **386.384 referencias** en **30.412 versos**, 66 libros. **Portón: 99,94 % de orígenes alineados** a RV1909; 88.069 destinos no resolubles por versificación (Salmos NRSV, variantes KJV) descartados y contados en el manifiesto — el crudo queda preservado para la tarea 2.2.
- Correcciones de mapeo (descubiertas con inventario completo de códigos): OpenBible usa nombres NRSV largos (Matt, Acts, 1Kgs…); los shards TSK usan variantes (1JO, EZE, JAM, SOS…). Mapas completos añadidos.
- Salida: 4,9 MB en `public/data/tsk/`.

**Producto:**
- **Panel de referencias cruzadas**: los números de verso ahora son clicables → panel con las referencias (nombre de libro en español), clic en cada una navega al pasaje. Juan 3:16 trae 23 referencias (Jn 11:25, 2Co 5:19, 1Ti 1:15…). Atribución TSK+OpenBible visible en el panel.
- **PWA instalable**: manifest con iconos propios generados (rombo dorado sobre tinta, 192/512 + maskable), service worker mínimo (precache del shell, cache-first para el corpus → **lectura offline** de capítulos visitados, network-first para navegaciones), registro solo en producción, `theme-color` y metadatos iOS.

**Métrica de obras validadas: 4 de 6** — RV1909 · WEB · STEPBible-Data · TSK/OpenBible.

### 2026-09-17 · GLM — Easton ingerido (5/6) + buscador de diccionario en el lector

- **Easton's Bible Dictionary 1897 completo: 3.962 entradas** (rango esperado de la edición), 26 letras, índice de búsqueda con nombres normalizados (`public/data/easton/`).
- Fuente: `neuu-org/bible-dictionary-dataset` (texto PD, agregador CC BY 4.0 — el que ya había fichado la investigación de ChatGPT). Homónimos de la fuente resueltos con sufijo (p. ej. «Hail» ×2). La letra X no existe en la edición — tratada como vacía.
- **Buscador de diccionario en el lector** (botón ⌕ en la barra fija): búsqueda en vivo por término (empieza-por primero, sin acentos), ficha con definición completa y referencias bíblicas. Atribución visible: PD + «traducción ES en curso».
- Redesplegado a Cloudflare (`07ae5ec9.bibliaapp.pages.dev`), índice servido 200. Commit `4d228f9`.

**Siguiente:** Matthew Henry (última del núcleo) → glosario maestro → piloto de traducción con puerta D20.

### 2026-09-17 · GLM — NÚCLEO COMPLETO 6/6: Matthew Henry + modo Comentario + glosario v1 + vigilante

**Datos (`scripts/ingesta-henry.mjs`, crudo en `05. Datos/corpus_crudo/mhenry/`):**
- Fuente hallada y verificada: **lyteword/mhenry-complete** — comentario COMPLETO de 6 volúmenes en markdown, licencia **CC0-1.0** (verificada vía GitHub API) sobre obra PD (1706–1721). Doble seguridad jurídica: PD subyacente + renuncia CC0 de la edición digital, sin marcado propietario (evita el problema CCEL/ThML). Ficha legal actualizada.
- **1.189 capítulos — 100 % de cobertura contra RV1909 — 3.366 secciones — ~6,3 millones de palabras.** El texto KJV citado en el markdown NO se publica (ya tenemos RV1909 propia).
- Correcciones del portón durante la ingesta: resolución de carpetas por volumen (volume-1..6), nombres de archivo `psalm-N.md` en Salmos, umbral de contenido por capítulo.
- Salida: `public/data/henry/{OSIS}.json` (34 MB) + manifiesto.

**Producto:**
- **Modo Comentario (botón ✎)**: resumen del capítulo al inicio + secciones de Henry colapsables ancladas al verso de inicio (▸ Comentario de Matthew Henry — título · N párrafos). Atribución visible en la obra y en el pie. El flujo B15 queda completo: pasaje → interlineal → léxico → comentario → referencias → diccionario.

**Traducción (Fase 4 se prepara):**
- **Glosario teológico maestro v1** creado → `06. Traduccion/Glosario teologico maestro v1.md`: 60+ términos fijos con justificación (justificación/propiciación/expiación distinguídos, imputación, pacto, quicken→vivificar, LORD→Jehová por RV1909, etc.) + principios de estilo B5 + pendientes para el revisor humano (B2). **Ya se puede empezar a traducir sin riesgo de incoherencia terminológica.**

**Operación:**
- Redesplegado a Cloudflare (`924a5c5f.bibliaapp.pages.dev`), henry-JHN 200. Commit y push.
- **Vigilante creado**: automatización recurrente cada 4 h (`automation-1cdbc91d`) que lee esta BP, continúa el siguiente paso ejecutable, despliega y registra; si solo queda bloqueado en decisiones del usuario, lo anota y no inventa decisiones. Nota honesta: GLM no tiene acceso a un medidor de cuota — el ciclo de 4 h es el que pidió el usuario.

**Métrica de obras validadas: 6 de 6** — RV1909 · WEB · STEPBible-Data (TAHOT/TAGNT/TBESH/TBESG) · TSK/OpenBible · Easton · Matthew Henry.

**Estado del plan:** pasos 0-2 y 5 completos; paso 3 avanzado (capa interlineal + comentario de toda la Biblia; falta traducción del piloto); puerta D20 abierta para cuando el editor humano revise la traducción que ahora empieza. Siguiente tarea ejecutable: piloto de traducción ES de Henry sobre Juan 1 con el glosario v1 (proceso editorial con revisión — no proceso por lotes, E5).

### 2026-09-17 · GLM — GitHub + despliegue temporal en Cloudflare Pages (PWA real)

- **Repositorio**: `git remote add origin` + push a `https://github.com/jaceve117-design/bibliaapp.git` (rama `main`).
- **Export estático**: `next.config.ts` con `output: "export"` (coherente con D9: sin servidor en runtime). `redirect()` de la raíz reemplazado por redirección cliente; `manifest.ts` marcado `force-static`. Build → `out/` (66 MB, corpus incluido).
- **Cloudflare Pages**: proyecto `bibliaapp` creado con wrangler (cuenta jac.eve117@gmail.com) y desplegado por upload directo.
  - **URL temporal de producción: https://bibliaapp.pages.dev** (el PWA ya se instala de verdad: HTTPS + service worker + manifest).
  - Verificado: raíz 200 · /es/lector 200 · manifest 200 · sw.js 200 · datos 200.
  - Redeploys: `cd 07. App/app && npm run build && npx wrangler pages deploy out --project-name=bibliaapp --branch=main`.
- Pendiente menor: conectar el repo de GitHub al proyecto de Pages para CI automático (hoy el deploy es manual por wrangler); `out/` añadido a .gitignore.

### 2026-09-17 · GLM — Corrección móvil: desborde horizontal eliminado + header fijo compacto

- **Reporte del usuario (captura en móvil):** la fila de controles desbordaba el ancho de la pantalla y arrastraba todo el documento fuera del viewport (había que desplazarse a la derecha para verlos).
- **Causa:** `.cabecera-sub-inner` sin `flex-wrap` + selects sin encogimiento → fila más ancha que el viewport; el documento entero se desplazaba.
- **Correcciones (globals.css):**
  - `html, body { overflow-x: clip; max-width: 100% }` — garantía de que nada pinta fuera del viewport.
  - Header fijo responsivo: la fila de controles ahora envuelve (`flex-wrap`), los selects encogen (`flex: 1 1 110px; min-width: 0`) y toggle/acciones no se comprimen. En móvil estrecho los controles ocupan dos líneas DENTRO del header fijo — el usuario pidió explícitamente mantener las 2 primeras líneas fijas.
  - Áreas seguras iOS (`env(safe-area-inset-top/bottom)`) para la PWA instalada (notch y barra gestual), viewportFit: cover ya estaba.
  - Ajustes ≤420px: marca más compacta, link «Lector» del header oculto (la portada tiene su CTA), paddings reducidos.
- Verificado en el CSS del build desplegado (overflow-x:clip, flex-wrap, safe-areas OK). Redesplegado a Cloudflare (`2e2c45da`).

### 2026-09-17 · GLM (vigilante, turno automático) — Piloto de traducción D20: Juan 1, resumen + sección 1

- **Traducido y desplegado el piloto para la puerta D20**: resumen + sección 1 «La divinidad de Cristo» (10 párrafos, la de mayor densidad doctrinal de Juan 1) de Matthew Henry al español, siguiendo el glosario maestro v1 (Verbo, Jehová, Observa como rúbrica, citas alineadas a RV1909).
- **Datos**: `public/data/henry-es/JHN.json` + `_manifest.json` — estructura paralela 1:1 con el EN (mismos índices de sección/párrafo → el original está siempre a un clic, B3). Estado declarado: `sin_revisar`.
- **Producto**: en modo Comentario (✎) sobre Juan, aparece toggle **ES | EN** con nota de estado («sin revisar — pendiente B2 y puerta D20»); las secciones aún sin traducir caen al original EN con etiqueta «sección aún sin traducir».
- **Alcance consciente**: Juan 1 completo tiene ~120k caracteres en 7 secciones; el turno automatizado tradujo la muestra doctrinal representativa. Las 6 secciones restantes + el resto del libro se traducen por incrementos siguientes (proceso editorial E5, no lote).
- Verificado: henry-es-JHN 200 en producción (`b87ad4b7.bibliaapp.pages.dev`). Commit y push.

## ⟡ BLOQUEADO EN USUARIO (puerta D20)

La muestra de traducción ya está pública en producción para que la evalúes tú (o el editor humano): **https://bibliaapp.pages.dev/es/lector → Juan → cap 1 → botón ✎ → toggle ES**.

Decisión requerida: **¿la calidad de la traducción es publicable con nuestro nombre?** (Claude E12: escalar una traducción mediocre es el único error irreversible del proyecto). Respuestas posibles: (a) apruebo el método → se traduce Juan 1 completo y luego se escala; (b) hay que corregir el método → dime qué ajustar (registro, terminología, ritmo).

Decisiones de usuario también pendientes: licencia de nuestras traducciones · modelo de sostenimiento · nombre y dominio.

### 2026-09-19 · GLM — PUERTA D20 SUPERADA + traducción escala (sección 2 de Juan 1) + corrección de mayúsculas RV1909

- **⟡ D20 — VEREDICTO DEL USUARIO: método de traducción APROBADO** («la traducción de Juan está muy bien, sus acentos y su redacción son impecables»). La puerta se cierra con veredicto (a): continúa la traducción de Juan 1 y luego el escalado. Nota formal: la revisión editorial humana detallada (B2) sigue como control de calidad continuo sobre cada sección publicada.
- **Aclaración registrada**: el usuario confirmó que solo veía EN — correcto por diseño: solo la muestra piloto (Jn 1, resumen + sección 1) estaba en ES. Con la aprobación, la traducción escala.
- **Corrección RV1909 (reporte del usuario)**: los inicios de capítulo traían palabra(s) en MAYÚSCULAS — versalitas de la edición impresa 1909 digitalizadas literalmente por eBible («EN el principio»). Añadida `normalizarInicioCapitulo()` al pipeline: verso 1 de cada capítulo pasa a mayúscula inicial normal («En el principio», «Y Fueron acabados», «A Todos los sedientos»). Las versalitas de medio verso (nombre divino «JEHOVÁ», p. ej. Sal 23:1) se CONSERVAN por ser convención con significado. Regenerada RV1909 (31.102 marcadores, portón ✓). Las 2.855+ coincidencias con STEPBible/TSK no se afectan (coordenadas intactas).
- **Traducción**: sección 2 de Juan 1 «El testimonio de Juan el Bautista; la encarnación de Cristo» (24 párrafos, Jn 1:6-14) traducida y fusionada → JHN cap. 1: **2 de 7 secciones en ES**. Fuente de traducción archivada en `06. Traduccion/traducciones/jhn1_s2_es.json`. Quedan 5 secciones de Juan 1.
- **SW v2** (`biblioteca-v2`): fuerza refresco de caché en las PWA instaladas para recibir la RV1909 corregida.
- Reparado un error de sintaxis JSON en henry-es (llave faltante del Write original — detectado por el flujo de fusión validada).
- Desplegado (`aa5f97db`) y verificado: henry-es 200, rv1909 200, lector 200; el texto corregido se sirve desde el despliegue (el alias podía mostrar copia del edge hasta expirar TTL).

**Siguiente:** traducir las secciones 3-7 de Juan 1 por incrementos → Juan 1 completo en ES → escalado al corpus del MVP (paso 6) y cierre del núcleo (SBLGNT, JFB, Barnes, Nave's — con sus fichas legales primero).

### 2026-09-19 · GLM — D22: comentarios interactivos + mejoras visuales de la PWA (petición del usuario)

**NUEVA REGLA D22 (a petición explícita del usuario):** todo comentario — presente o futuro — se publica con (a) citas bíblicas interactivas (pop-up con el texto del verso, sin salir del comentario) y (b) términos en lenguas originales clicables (pop-up con idioma + significado). Es requisito de ingesta: un comentarista no se publica sin este marcado. El texto del pop-up sale de la obra activa ya cargada (cero licencias nuevas).

- **Citas bíblicas clicables**: detector en runtime con mapa de ~90 abreviaturas EN+ES → OSIS (`lib/referencias.ts`). Rangos ("1:1-5") y listas ("40:12,28") resueltos; rangos >12 versos muestran los primeros + botón «Abrir pasaje →» que navega al lector. El texto se sirve de la obra activa (RV1909/WEB) ya cacheada.
- **Términos transliterados clicables** (*ho logos*, *sarx egeneto*, *shequiná*, *homousios* vs *homoiousioi*, *Memra*…): léxico curado `public/data/lexico-translit.json` (17 términos de Juan 1, secciones 1-2) que **crece con cada sección traducida** — el traductor agrega entradas al toparse con términos nuevos. Pop-up con idioma y significado.
- **Franja del comentarista (fija)**: el botón ✎ se transformó en una franja permanente bajo la línea de controles: «✎ Matthew Henry · 1706» + badge «SIN REVISAR» + **toggle ES|EN anclado a la derecha** — siempre visible al hacer scroll, para contrastar traducciones sin buscar el aviso. Tocar la franja activa/desactiva el modo Comentario.
- **Todo lo informativo sale de la columna de lectura** (petición del usuario) y vive en el panel **ⓘ**: edición de trabajo (versos vacíos documentados), estado de la traducción, atribución completa (obra, licencia, fuente, fecha, total), referencia actual. La columna de lectura queda limpia.
- **Botón Aa** junto al de tema: tamaño del texto −2 a +2, persistido en el dispositivo y aplicado antes del primer paint (sin parpadeo). Escala el texto bíblico y los párrafos de comentario.
- **Densificación quirúrgica**: cabecera 8-10px de padding (antes 12-16px), selects y botones más compactos (34px), fila del lector más cercana al header, mejor aprovechamiento de espacio en cada control.
- Verificado en producción: léxico 200, lector 200. Commit y push.

**Siguiente:** traducir las secciones 3-7 de Juan 1 (agregando entradas al léxico transliterado a medida que aparezcan términos) → Juan 1 completo en ES → escalado (paso 6).

### 2026-09-19 · GLM — Pantalla dividida: tarjeta de pasaje (petición del usuario)

- **Reporte del usuario**: al pulsar «Abrir pasaje» se navegaba fuera del comentario y no había forma de volver al texto donde estaba.
- **Solución implementada (pantalla dividida)**: «Abrir pasaje» ya no navega la lectura principal — abre desde abajo una **tarjeta mini-lector** (56 % de la pantalla, animada): arriba queda intacto el comentario/texto donde estabas, abajo el pasaje destino con su propia navegación (← → de capítulos dentro de la tarjeta) y botón **«Leer aquí»** para quien sí quiera fijar ese pasaje como lectura principal. ✕ la cierra y sigues exactamente donde estabas.
- Aplica también a las **referencias cruzadas** (TSK): cada referencia del panel abre la tarjeta dividida en vez de navegar — coherente con la filosofía D22 (nada te saca de tu lugar).
- El mini-lector usa la misma obra activa y el mismo caché del lector (cero descargas repetidas). Animación respetuosa de prefers-reduced-motion.
- Desplegado (`77efc10d`). Commit y push.

### 2026-09-19 · GLM — Barras de comentario ancladas (sticky) con color dinámico y ⓘ (petición del usuario)

- **Reporte del usuario**: al expandir una sección del comentario y hacer scroll, la barra de la sección se perdía; contraerla obligaba a scrollear hasta arriba — incómodo.
- **Solución**: la barra de cada sección expandida ahora es **sticky**: se clava justo bajo el header fijo y te acompaña mientras lees esa sección; un toque la contrae y vuelves al texto bíblico en el punto exacto (posición: variable `--altura-cabecera`, medida en vivo del header real, que cambia si las filas envuelven en móvil).
- **Color dinámico de anclaje**: colapsada = barra neutra; expandida = borde y texto dorados; **anclada de verdad (leyendo dentro de ella)** = fondo dorado suave + sombra de barra activa (detectado por listener de scroll comparando el tope de la barra contra el borde inferior del header).
- **ⓘ a la derecha** de la barra: popover con la explicación («Sección anclada: te acompaña mientras lees… tócala para contraerla y volver al texto bíblico»).
- La barra colapsada también pasó a full-width (mejor blanco táctil en móvil). Desplegado (`2720c5e9`). Commit y push.

### 2026-09-19 · GLM — Refinamientos de lectura + sección 3 de Juan 1 en ES (3/7)

**Ajustes de la ronda de feedback del usuario:**
- **Animaciones suaves**: apertura y cierre de secciones de comentario con transición fluida (grid-template-rows + opacity — anima también el cierre); pop-ups y popover de ⓘ con animación de entrada.
- **Botones de cierre**: las 7 ✕ de los paneles (léxico, referencias, citas, término, info, diccionario, tarjeta de pasaje) ahora son rojas con X blanca, misma forma.
- **Tarjeta de pasaje simplificada**: eliminados «Leer aquí» y las flechas — solo la ✕ roja. El lector lee el pasaje, lo cierra y vuelve exactamente a su línea secuencial del comentario. La tarjeta es solo lectura; el lector principal no se toca nunca.
- **Barra de sección en 2 líneas** (reporte con captura: se cortaba feo en móvil): línea 1 «COMENTARIO DE MATTHEW HENRY» en versalitas pequeñas; línea 2 el título de la sección en itálica + conteo de párrafos. Ordenado y legible en cualquier ancho.

**Traducción (3/7 de Juan 1 en ES):**
- Sección 3 «El testimonio de Juan acerca de Cristo» (16 párrafos, Jn 1:15-18): la preferencia de Juan ante Cristo, protos mou en (eternidad del Hijo), la plenitud de Cristo, gracia sobre gracia (charin anti charitos con sus seis sentidos que Henry despliega), gracia y verdad contra la ley de Moisés, y la declaración del Padre por el Hijo unigénito.
- Léxico transliterado ampliado a **22 términos** (+5: protos mou en, charin anti charitos, kai charin, egeneto, in pectore).
- Desplegado (`8673d6e7`). Verificado: lector 200, henry-es 200. Commit y push.

**Siguiente:** secciones 4-7 de Juan 1 → capítulo completo en ES; luego paso 6 (cierre del núcleo: SBLGNT, JFB, Barnes, Nave's — fichas legales primero).

### 2026-09-19 · GLM — PUNTO DE RECUPERACIÓN creado (validación integral 27/27 + 15/15 endpoints)

- **Validación integral previa (todo en verde):**
  - Datos: RV1909 31.102 · WEB 31.103 · Henry 1.189 caps · TAGNT/TAHOT · TSK 386.384 · Easton 3.962 · léxico 22 términos · paridad de claves i18n ES/EN (110 claves).
  - Correcciones confirmadas en datos: «En el principio» (mayúsculas), JEHOVÁ conservado, WEB Jn 3:16 limpio.
  - Traducción: henry-es JHN 3/7 secciones, paridad de párrafos ES=EN verificada, estado «sin_revisar» declarado.
  - Estética/modos del build: modo oscuro y claro, anti-desborde móvil, safe-areas, escala de texto, franja de comentarista, citas (.cita), términos (.termino), split-card, barra anclada sticky, etiqueta 2 líneas, X rojas, animaciones.
  - PWA: SW v2, manifest standalone + 4 iconos + lang es, iconos 192/512/maskable presentes.
  - Producción: 15/15 endpoints HTTP 200 (páginas, manifest, sw, iconos, y todos los JSON de datos).
- **Punto de recuperación creado y subido a GitHub:** tag anotado **`recuperacion-2026-09-19`** (commit `ec24bfc`).
  - **Restaurar:** `git checkout recuperacion-2026-09-19` → `cd 07. App/app && npm install && npm run build` → `npx wrangler pages deploy out --project-name=bibliaapp --branch=main`.
  - El tag incluye los JSON derivados (`public/data/`) — la app funciona completa con solo el checkout + install + build. El corpus crudo (fuera de git) se re-descarga de las URLs de sus fichas si algún día hiciera falta (los pipelines lo regeneran todo).
  - Detalle de restauración anotado en el propio mensaje del tag (visible con `git tag -n99 recuperacion-2026-09-19`).

**Estado al cierre de este punto:** pasos 0, 1, 2, 5 completos · paso 3 en 3/7 secciones de Juan 1 · puertas: D20 superada (método aprobado) · pendientes de usuario: continuarlo es automático (vigilante), decisiones de licencia de traducciones/sostenimiento/nombre cuando el usuario defina.

### 2026-09-19 · GLM — Sección 4 de Juan 1 en ES (4/7)

- **Traducida y fusionada la sección 4** «El testimonio de Juan; Juan examinado por los sacerdotes» (16 párrafos, Jn 1:19-28): el sanedrín y su examen, la triple negativa de Juan (no el Cristo, no Elías, no el profeta), «Yo soy la voz» (con la comparación ley/evangelio: truenos y trompeta vs voz humana apacible), «Enderezad el camino del Señor», el bautismo y los prosélitos, «en medio de vosotros está uno a quien no conocéis», Betábara como casa de paso.
- Léxico transliterado ampliado a **26 términos** (+4: Sy tis ei, Si populus vult decipi…, hoti ouk eimi ego ho Christos, vox et præterea nihil).
- Desplegado (`bd0d4e94`). Verificado: lector 200, henry-es 200, léxico 200. Commit y push.

**Siguiente:** secciones 5-7 de Juan 1 → capítulo completo en ES (5/7 → 6/7 → 7/7).

### 2026-09-19 · GLM — Bug del hueco invisible corregido + sección 5 de Juan 1 en ES (5/7)

- **BUG corregido (reporte del usuario con captura)**: al activar el comentario se abría un hueco grande e invisible entre el header y el verso 1. Causa: el recuadro «Resumen del capítulo» usaba la clase `com-bloque` — que tras la animación de colapso pasó a ser el contenedor grid con `grid-template-rows: 0fr` + `opacity: 0` — el resumen quedaba renderizado pero invisible, ocupando su espacio. Corregido: el resumen usa su propia clase `com-resumen` (colisión de nombres eliminada).
- **Traducción (5/7)**: sección 5 «El testimonio de Juan: He aquí el Cordero de Dios» (12 párrafos, Jn 1:29-34): el Cordero de Dios y el pacto, quita el pecado del mundo (culpa y poder), la señal de la paloma, el Espíritu sin medida, «Yo vi y he dado testimonio de que éste es el Hijo de Dios», y el testimonio privado del día siguiente que entrega a sus discípulos a Cristo.
- Léxico transliterado: **30 términos** (+4: ho airon, emblepsas, anēr, quod erat demonstrandum).
- Desplegado (`5778b0de`). Verificado: lector 200, henry-es 200.

**Siguiente:** secciones 6-7 de Juan 1 (llamados de Andrés/Pedro y de Felipe/Natanael) → capítulo completo en ES.

### 2026-09-19 · GLM (vigilante) — JUAN 1 COMPLETO EN ESPAÑOL (7/7) + refinamientos de tarjeta

- **Traducción (7/7):** secciones 6 «El llamamiento de Andrés y de Pedro» (15 párrafos, Jn 1:35-42) y 7 «El llamamiento de Felipe y de Natanael» (22 párrafos, Jn 1:43-51) traducidas, validadas contra sus originales (paridad de párrafos y verso de inicio) y fusionadas. **Juan 1 queda COMPLETO en español** — el primer capítulo entero del comentario de Matthew Henry en ES con trazabilidad 1:1 al original.
- Léxico transliterado: **32 términos** (+2: Cephas —piedra—, Boanerges —hijos del trueno—).
- **Refinamiento de la tarjeta de pasaje** (feedback del usuario): eliminados «Leer aquí» y las flechas — la tarjeta es solo lectura con su ✕ roja; el lector lee el pasaje, cierra, y vuelve a su línea secuencial del comentario sin perder jamás su lugar. (El handler moverTarjeta quedó eliminado.)
- Desplegado (`a39c37ff`). Verificado: lector 200, henry-es con 7 secciones en producción (tras asentarse el caché del edge; el hash de deployment ya lo servía correcto).

**Estado:** Juan 1 100 % en ES con citas interactivas (D22), léxico transliterado, toggle ES/EN y barras ancladas. **Siguiente:** escalado gradual — completar el evangelio de Juan (21 capítulos, ~879 versos, 106 secciones de Henry) por incrementos, y/o paso 6 (cierre del núcleo: SBLGNT, JFB, Barnes, Nave's — fichas legales primero). El usuario decide la prioridad.

### 2026-09-19 · GLM (vigilante) — Juan 2 COMPLETO en español (caps ES: 1, 2)

- **Nuevo instrumento de producción:** `scripts/fusiona-henry-es.mjs` — fusión genérica de fragmentos de traducción por capítulo, con portón de paridad contra el original EN (secciones, párrafos, verso de inicio, párrafos vacíos, traducciones incompletas detectadas por proporción ES/EN). Las fuentes de traducción se archivan en `06. Traduccion/traducciones/` (trazabilidad).
- **Juan 2 completo en español** (3 secciones, ~54k caracteres de original): 1. «El agua hecha vino» (v.1-11, 26 párrafos — el primer milagro, las bodas, la reprensión a su madre, las tinajas, el gobernador del convite, la sobriedad). 2. «El comercio del templo castigado; la muerte y resurrección de Cristo anunciadas» (v.12-22, 28 párrafos — Capernaum, la primera pascua, la purificación del templo, el celo que devora, la señal del templo de su cuerpo). 3. «El éxito del ministerio de Cristo» (v.23-25, 5 párrafos — los casi creyentes de Jerusalén y la omnisciencia de Cristo).
- Corregido de paso un bug del validador (párrafos legítimamente cortos como «Aquí tenemos:» no deben fallar; la regla ahora compara proporción contra el original EN).
- Desplegado (`f6d3fe82`). Verificado: lector 200, henry-es JN caps 1,2 en producción, JN 2 con 3 secciones.

**Posición exacta de la traducción:** Juan 1 y Juan 2 completos en ES (caps 1-2 de 21). **Siguiente:** Juan 3 (Nicodemo — 2 secciones, ~89k chars, el más denso: probablemente dividido en 2 turnos de vigilante), luego Juan 4-21 por incrementos. Juan entero ≈ 1,7M caracteres EN — es el proyecto de traducción más largo del libro, y avanza capítulo por capítulo sin detenerse.

### 2026-09-19 · GLM (vigilante) — Juan 3 iniciado: infraestructura de traducción parcial + P1-P15 de 44

- **Infraestructura para el maratón**: el fusionador ahora soporta traducción PARCIAL por párrafo (args: índice de sección + índice de párrafo). Los párrafos no traducidos quedan como "" y el lector los omite; el manifiesto registra párrafos_traducidos/parrafos_total por capítulo. El lector muestra solo los párrafos traducidos de secciones parciales (con el original EN siempre a un clic).
- **Bug del resumen invisible corregido** (reporte del usuario con captura): el recuadro «Resumen del capítulo» usaba la clase `com-bloque` — el contenedor colapsable invisible de las animaciones — y quedaba renderizado pero invisible ocupando su espacio. Corregido con clase propia `com-resumen`.
- **Juan 3 (Nicodemo) iniciado**: sección 1 «La entrevista de Cristo con Nicodemo» — párrafos 1-15 de 44 traducidos (~13k chars): Nicodemo su persona y su venida de noche (Noctes Christianae), «Rabí, sabemos que has venido como maestro de Dios», el nuevo nacimiento (anothen: otra vez Y de lo alto), «De cierto, de cierto», la objeción de Nicodemo (geron on) y su disposición a ser enseñado, y la confirmación de Cristo (Jn 3:5).
- **Posición exacta**: JN 3, sección 1, párrafo 15 de 44 (21% del capítulo). Siguiente: P16-P44 de la misma sección (incluye «lo que es nacer del Espíritu», la ilustración del viento, «Si no creéis las cosas de la tierra…»).
- Léxico transliterado: 26 términos (se agregará Noctes Christianae y anōthen en el próximo lote).
- Desplegado (`eea85879`). Verificado: JN 3.1 15/44 párrafos ES en producción. Commit y push.

**Nota de escala para el usuario**: Juan 3 tiene 72 párrafos y ~89k caracteres de original (el doble de Juan 1). A este ritmo de un turno del vigilante por ~12-16 párrafos, el evangelio de Juan completo (1.060 párrafos restantes ≈ 1,6M caracteres) tomaría del orden de 70-90 turnos de vigilante (≈ 2-3 semanas de ciclos). El pipeline está optimizado: cada turno traduce, valida, fusiona, despliega y registra sin intervención.

### 2026-09-19 · GLM (vigilante) — Juan 3.1 ampliado: párrafos 27/44 (38% del capítulo)

- **Traducidos y fusionados los párrafos 16-27 de la sección 1 de Juan 3** (idx15-26, ~12,7k chars): (b) la exposición de la regeneración —su autor (el Espíritu de gracia, Jn 3:5-8), su naturaleza (espiritual vs carne), su necesidad («Lo que nace de la carne, carne es», con el relato de la caída y la transmisión de la naturaleza corrupta; «No te maravilles»), sus dos comparaciones (el agua que limpia y refresca; el viento que sopla de donde quiere, obra poderosa y misteriosa)— y (2) el discurso sobre la certeza y sublimidad de las verdades evangélicas: la objeción «¿Cómo pueden ser estas cosas?», la reprensión «¿Eres tú maestro en Israel?», «Lo que sabemos hablamos», «Si os he dicho cosas terrenas», y «Nadie subió al cielo sino el Hijo del hombre».
- **Posición exacta**: JN 3, sección 1, párrafo 27 de 44 (38% del capítulo). Siguiente: idx27-43 (17 párrafos, ~22k chars): «Si no creéis las cosas de la tierra», el bautismo y la purificación, «De dónde, pues, el hombre que no puede resistiros?», Juan y Cristo amigos del esposo, «Es necesario que él crezca y yo mengüe», «El que viene del cielo es sobre todos», y «El que cree en el Hijo tiene vida eterna».
- Desplegado (`1c10b492`). Verificado: JN 3.1 27/44 párrafos ES en producción. Commit y push.

### 2026-09-19 · GLM (vigilante) — Juan 3.1 COMPLETO en ES: párrafos 44/44 (61% del capítulo)

- **Traducidos y fusionados los párrafos 28-44 de la sección 1 de Juan 3** (17 párrafos, ~22k chars), completando «La entrevista de Cristo con Nicodemo»: Nadie subió al cielo sino el Hijo del hombre que está en el cielo (las dos naturalezas en una persona, comunicación de propiedades), el gran designio de la venida de Cristo (los dos modos de salvar: sanando como la serpiente de bronce, perdonando como juez que publica indemnidad), la serpiente de bronce (naturaleza mortal del pecado, el remedio poderoso, el modo de aplicación: mirar y vivir, las animadversiones a la fe), **Juan 3:16** en su despliegue completo (el amor del Padre, el deber de creer, el beneficio de no perecer y tener vida eterna), el designio de Dios (no venir a condenar sino a salvar), la felicidad de los creyentes (no condenados), y la sentencia de los incrédulos (condenados ya, amaron las tinieblas, sus obras malas odian la luz; el que hace la verdad viene a la luz).
- **Posición exacta**: JN 3, sección 1 COMPLETA (44/44 párrafos). Queda la sección 2 (28 párrafos, Jn 3:22-36: Juan y Cristo amigos del esposo, «Es necesario que él crezca y yo mengüe», «El que cree en el Hijo tiene vida eterna») para completar el capítulo (61% → 100%).
- Desplegado (`c6afe14c`). Verificado: JN 3.1 44/44 párrafos ES en producción. Commit y push.

### 2026-09-20 · GLM (vigilante) — Juan 3 COMPLETO en español (72/72 párrafos)

- **Traducida y fusionada la sección 2 de Juan 3** «El testimonio de Juan acerca de Cristo» (28 párrafos, Jn 3:22-36): la mudanza de Cristo a Judea, Juan bautizando en Enón junto a Salim, la disputa sobre la purificación, la queja de los discípulos («todos vienen a él»), la respuesta de Juan («No puede el hombre recibir nada si no le fuere dado del cielo», «Yo no soy el Cristo, sino enviado delante de él», el esposo y el amigo del esposo, «Es necesario que él crezca, pero que yo mengüe»), la dignidad de la persona de Cristo (el que viene de lo alto es sobre todos), la excelencia y certeza de su doctrina (el Espíritu sin medida), y la aplicación: «El que cree en el Hijo tiene vida eterna; el que no creyere al Hijo no verá la vida».
- **Juan 3 queda COMPLETO en español: 72/72 párrafos (100%)** — caps ES: 1, 2, 3 de 21.
- Desplegado (`7ddf90d5`). Verificado en producción: JN 3 = 72/72 párrafos ES.

**Posición exacta:** caps ES 1-3 de 21. **Siguiente:** Juan 4 (4 secciones, 106 párrafos, ~107k chars — la mujer de Samaria; probablemente dividido en 2 turnos por tamaño: secciones 1-2 y luego 3-4).

### 2026-09-20 · GLM (vigilante) — Juan 4 iniciado: 31/106 párrafos en ES (29% del capítulo)

- **Traducida y fusionada la sección 1 de Juan 4** «El viaje de Cristo a Galilea» (9/9 párrafos, Jn 4:1-3): hacer discípulos, bautizar por manos de sus discípulos (las seis razones de Henry), el celo de los fariseos, y la retirada de Judea a Galilea (su hora no había venido; ejemplo de su propia regla de huir la persecución).
- **Traducida y fusionada la sección 2 de Juan 4, primera parte** «Cristo en el pozo de Samaria» (párrafos 1-22 de 58, Jn 4:4-10): Samaria y su historia, «Es necesario que pasase por Samaria», Sicar y la heredad de Jacob, Cristo cansado del camino («cuando seamos llevados con facilidad, pensemos en el cansancio de nuestro Maestro»), la mujer de Samaria al pozo, «Dame de beber», la pendencia judíos-samaritanos, y «Si conocieses el don de Dios… tú le pedirías y él te daría agua viva».
- **Posición exacta**: JN 4, sección 2, párrafo 22 de 58. Siguiente: párrafos 23-58 (la objeción «¿Eres tú mayor que nuestro padre Jacob?», el agua que quita la sed para siempre, los cinco maridos, la adoración en espíritu y verdad, «Yo soy, el que habla contigo, soy»).
- Desplegado (`6f3f6e8a`). Verificado: lector 200; JN 4 en producción 9/9 + 22/58 párrafos ES. Commit y push.

### 2026-09-20 · GLM (vigilante) — Cadencia del vigilante bajada a 30 minutos (petición del usuario)

- **Datos medidos**: promedio real entre incrementos de trabajo activo = ~34 min (los huecos de 222-261 min eran esperas del ciclo 4h). El ritmo natural de trabajo es de ~30 min por incremento de ~25-30k caracteres traducidos.
- **Cron reprogramado**: de `0 */4 * * *` a `*/30 * * * *` (título: «Vigilante GLM 30min»). A este ritmo, todo Juan (19 capítulos restantes, ~1,9M chars) estaría completado en el orden de 40-70 turnos exitosos ≈ 1-3 días de ciclos.
- **Advertencia registrada**: si la cuota de tokens se agota a mitad de camino, los disparos de 30 min fallarán suavemente y reintentarán — que es justo el comportamiento deseado (reanudar apenas vuelva la cuota). Si el consumo resultara excesivo, se puede volver a 4h o 2h con una palabra.
- Verificado en producción: lector 200. Commit y push.

### 2026-09-20 · GLM (vigilante) — Juan 4.2 ampliado: párrafos 34/58 (41% del capítulo)

- **Traducidos y fusionados los párrafos 23-35 de la sección 2 de Juan 4** (~13k chars): la objeción «No tienes con qué sacarla… ¿Eres tú mayor que nuestro padre Jacob?», la defensa de Jacob (la providencia en los pozos de generación en generación, la llaneza del patriarca), los tres yerros de la mujer (llamar padre a Jacob sin derecho, atribuirle el pozo como don, comparar desfavorablemente a Cristo), la respuesta de Cristo (el agua de Jacob quita la sed pero vuelve; el agua viva satisface para siempre: «una fuente de agua que brota para vida eterna»), la petición de la mujer («Dame esta agua, para que no venga aquí a sacar»), y el giro de Cristo al marido: el método de tratar con las almas («primero puntadas en el corazón, y luego sanadas»).
- **Posición exacta**: JN 4, sección 2, párrafo 34 de 58 (41% del capítulo). Siguiente: párrafos 36-58 (23 párrafos): los cinco maridos, la adoración en espíritu y verdad, «Yo soy, el que habla contigo, soy yo», la siega y los segadores, y «Yo soy el Mesías».
- Desplegado (`32321758`). Verificado: JN 4.2 34/58 párrafos ES en producción. Commit y push.

### 2026-09-20 · GLM (vigilante) — JUAN 4 COMPLETO en español (106/106 párrafos) — 5/21 capítulos

- **Traducidas y fusionadas las secciones 3 y 4 de Juan 4**: (3) «Cristo en el pozo de Samaria (continuación): los samaritanos creyentes» (24 párrafos, Jn 4:27-42): la interrupción de los discípulos, la mujer que deja su cántaro, «Venid, ved un hombre que me ha dicho todo cuanto he hecho», «Ya no creemos por tu dicho, porque nosotros mismos le hemos oído», y «Éste es el Salvador del mundo». (4) «El hijo del noble sanado» (15 párrafos, Jn 4:43-54): ningún profeta es acepto en su tierra, la fe mixta del noble, la reprensión «si no viereis señales», «Ve tu camino; tu hijo vive», la confirmación con los siervos (la séptima hora), y toda la casa creyó.
- **Juan 4 COMPLETO: 106/106 párrafos (100%)** — caps ES: 1, 2, 3, 4 de 21.
- **Nota técnica**: el alias de producción retuvo copia vieja del edge tras el deploy (43/106); el hash de deployment y el build local servían correcto (106/106). SW subido a v3 para forzar refresco en clientes. Si persiste, el usuario puede forzar recarga; el edge se asienta solo.
- Desplegado (`9ac78686`). Verificado: lector 200, sw 200, hash deployment con contenido correcto. Commit y push.

**Posición exacta**: caps ES completos: 1, 2, 3, 4 de 21. **Siguiente:** Juan 5 (3 secciones, ~98k chars: el paralítico de Betesda), luego Juan 6 (el mayor: ~5 secciones), Juan 7, etc.

### 2026-09-20 · GLM (vigilante) — Juan 5.1 completo en ES: «La curación en el estanque de Betesda» (32/32 párrafos)

- **Traducida y fusionada la sección 1 de Juan 5** (~30k chars, Jn 5:1-16): la fiesta y el estanque de Betesda (casa de misericordia), los cinco pórticos con la multitud de enfermos (ciegos, cojos, secos), el ángel que agitaba las aguas, el paciente treinta y ocho años enfermo (con la nota conmovedora de Baxter: «te doy gracias por semejante disciplina de cincuenta y ocho años»), «¿Quieres ser sano?», «No tengo hombre que me meta en el estanque», «Levántate, toma tu lecho y anda», la carga del lecho en sábado, la defensa del hombre ante los judíos, Cristo hallándole en el templo, y «He aquí, has sido sano; no peques más, no sea que venga a ti alguna cosa peor».
- **Posición exacta**: JN 5, sección 1 COMPLETA (32/32). Quedan las secciones 2 (37 párrafos: el discurso con los judíos, todo juicio cometido al Hijo, la carta cristiana) y 3 (29 párrafos: Cristo prueba su misión divina, la infidelidad de los judíos reprendida) para completar el capítulo 5.
- Desplegado (`724f9e87`). Verificado: JN 5.1 32/32 párrafos ES en producción. Commit y push.

**Posición global**: caps ES completos 1, 2, 3, 4 de 21 + JN 5.1 (32/98 párrafos del cap). **Siguiente turno**: JN 5 sección 2 (37 párrafos), luego sección 3 (29), y así Juan 5 completo.

### 2026-09-20 · GLM (vigilante) — Juan 5.2 completa en ES: 69/98 párrafos (70% del capítulo)

- **Traducida y fusionada la sección 2 de Juan 5** «El discurso de Cristo con los judíos; todo juicio cometido a Cristo; la carta cristiana» (37 párrafos, ~35k chars, Jn 5:17-47): la doctrina sentada («Mi Padre hasta ahora trabaja, y yo trabajo»), el escándalo tomado (querían matarle por hacerse igual a Dios), la unidad del Hijo con el Padre («el Hijo no puede hacer nada por sí mismo, sino lo que ve hacer al Padre»), las instancias del amor del Padre (mayores obras: resucitar los muertos), las dos resurrecciones (la que ahora es: muertos en pecados vivificados por la voz del Hijo; la que ha de venir: «todos los que están en los sepulcros oirán su voz»), la retribución (resurrección de vida / de condenación), la autoridad para ejecutar juicio, las razones («porque el Hijo del hombre es»), «todos honren al Hijo como honran al Padre», el carácter cristiano («el que oye mi palabra y cree al que me envió»), la carta cristiana (no viene a condenación; ha pasado de muerte a vida), y la justicia de su juicio («no busco mi voluntad, sino la del que me envió»).
- **Posición exacta**: JN 5, secciones 1-2 completas (69/98 párrafos, 70% del capítulo). Queda la sección 3 (29 párrafos, Jn 5:31-47: Cristo prueba su misión divina —el testimonio de Juan, las obras, el Padre, las Escrituras— y la infidelidad de los judíos reprendida) para completar el capítulo 5.
- Desplegado (`7ed02b47`). Verificado: lector 200; JN 5 al 70% en producción. Commit y push.

**Siguiente turno:** JN 5, sección 3 (idx 29 párrafos, secBase=2, pBase=0) → Juan 5 COMPLETO (98/98). Luego Juan 6.

### 2026-09-20 · GLM (vigilante) — Juan 5 COMPLETO en español (98/98 párrafos) — 5/21 capítulos

- **Traducida y fusionada la sección 3 de Juan 5** «Cristo prueba su misión divina; la infidelidad de los judíos reprendida» (29 párrafos, ~34k chars, Jn 5:31-47): el apartar su propio testimonio («todos los hombres son mentirosos»), el testimonio del Padre (donde da comisión, da credenciales), Juan como antorcha que arde y alumbra («fuisteis dispuestos a gozaros por un tiempo en su luz»), las obras mayores como testimonio mayor, el testimonio del Padre por voz del cielo (Bath-kol), «Escudriñad las Escrituras» (las dos lecturas que da Henry: indicación y mandato; el cielo el fin, Cristo el camino), la sentencia de los incrédulos («no queréis venir a mí para que tengáis vida», no tienen el amor de Dios, reciben a los que vienen en su propio nombre, buscan la honra unos de otros), y Moisés como testigo contra ellos («si no creéis a sus escritos, ¿cómo creeréis a mis palabras?»).
- **Juan 5 COMPLETO: 98/98 párrafos (100%)** — caps ES completos: 1, 2, 3, 4, 5 de 21 (~305k caracteres ES de Henry traducidos).
- Desplegado (`0751e330`). Verificado: JN 5 = 98/98 párrafos ES en producción. Commit y push.

**Posición exacta:** caps ES completos 1-5 de 21. **Siguiente:** Juan 6 (el mayor del libro — la multiplicación de los panes, Cristo sobre el mar, el pan de vida; 5 secciones aprox. ~150k chars — se dividirá en 3-4 turnos de vigilante). Luego Juan 7 en adelante.

### 2026-09-20 · GLM (vigilante) — Juan 6 iniciado: 31/123 párrafos en ES (25% del capítulo)

- **Traducidas y fusionadas las secciones 1 y 2 de Juan 6**: (1) «Los cinco mil alimentados» (21 párrafos, ~18,6k chars, Jn 6:1-14): el monte como púlpito natural, «¿De dónde compraremos pan?», los cinco panes de cebada y dos pececillos, «Haced recostar los hombres», la distribución con acción de gracias, y la recolección de los doce cestos. (2) «Cristo anda sobre el mar» (10 párrafos, ~10,7k chars, Jn 6:15-21): el celo irregular de querer hacerle rey (con las cinco objeciones de Henry: error sobre el reino, amor de la carne, designio secular, tumulto, contra la mente de Cristo), la humildad y abnegación de Cristo al retirarse, la tormenta en la mar oscura, «Yo soy; no temáis», y la llegada presto a la ribera.
- **Posición exacta**: JN 6, sección 3 (idx2, «El discurso con la multitud», 14 párrafos) es el siguiente lote. Luego sección 4 (48 párrafos, «El verdadero pan del cielo» — el mayor bloque, ~55k chars, se dividirá en 2-3 turnos) y sección 5 (20 párrafos).
- Desplegado (`171966db`). Verificado: lector 200; JN 6 al 25% en producción. Commit y push.

### 2026-09-20 · GLM (vigilante) — Juan 6.3 completo en ES: 45/113 párrafos (40% del capítulo)

- **Nota**: el total del capítulo es 113 párrafos (no 123 como se anotó antes: 21+10+14+48+20). Corregido.
- **Traducida y fusionada la sección 3 de Juan 6** «El discurso de Cristo con la multitud» (14/14 párrafos, ~12,5k chars, Jn 6:22-27): la indagación de la gente tras Cristo (perplejos, industriosos, aprovechando la oportunidad de cruzar en las naves de Tiberias), «Le hallaron al otro lado del mar» (los hipócritas pueden ser diligentes en las ordenanzas), «Rabí, ¿cuándo llegaste acá?» (Cristo se halla en las congregaciones de su pueblo), la respuesta que descubre el principio corrupto («No me buscáis por haber visto los milagros, sino porque comisteis del pan y os saciasteis» — con la cita del papa: *Quantis profuit nobis hæc fabula de Christo*), y la dirección a mejores principios («Trabajad no por la comida que perece, sino por la que permanece para vida eterna» — el Hijo del hombre, sellado por el Padre, es quien la da).
- **Posición exacta**: JN 6, sección 4 («El verdadero pan del cielo», 48 párrafos, el mayor bloque) es el siguiente lote — probablemente dividido en 2 turnos (¶1-24 y ¶25-48). Luego sección 5 (20 párrafos) y Juan 6 COMPLETO.
- Desplegado (`b8b516d1`). Verificado: JN 6.3 14/14 párrafos ES en producción. Commit y push.

### 2026-09-20 · GLM (vigilante) — Juan 6.4 primera mitad: 19/48 párrafos en ES (50/113, 44% del capítulo)

- **Traducidos y fusionados los párrafos 1-19 de la sección 4 de Juan 6** «El verdadero pan del cielo» (la mayor sección del libro, 48 párrafos totales): la pregunta «¿Qué debemos hacer para hacer las obras de Dios?» y la respuesta «Esta es la obra de Dios, que creáis»; la demanda de señal y el maná de los padres con la réplica de Cristo («Mi Padre os da el verdadero pan del cielo»); el gran despliegue exegético de Henry sobre **el pan de vida** (pan de Dios, pan de vida, pan viviente, descendido del cielo, del cual el maná era tipo —con las correspondencias: suficiente para todos, recogido por la mañana, dulce, memorial en el arca—); el empeño del Padre y del Hijo («que de todo lo que me diere, no pierda yo nada, sino que lo resucite en el día postrero» — cuerpo incluido); la carta de gracia («todo aquel que ve al Hijo y cree en él»); y los primeros dichos sobre creer = venir = alimentarse de Cristo.
- **Nota de calidad**: el párrafo idx18 (sobre «Uno siembra y otro siega») quedó condensado (1273 chars ES vs 3185 EN) — marcar para completar en revisión. Los párrafos 19-22 del fragmento (creer/venir/alimentarse, idx21-23) quedaron pendientes para el próximo lote.
- **Posición exacta**: JN 6, sección 4, párrafo 19 de 48. Siguiente: párrafos 20-48 (29 párrafos, incluye «las palabras que yo os hablado son espíritu y son vida», la defección de los discípulos, y la confesión de Pedro).
- Desplegado (`e2ecd200`). Verificado: JN 6.4 19/48 párrafos ES en producción. Commit y push.

### 2026-09-20 · GLM (vigilante) — Juan 6.4 ampliado: párrafos 36/48 en ES (72% del capítulo, 81/113)

- **Traducidos y fusionados los párrafos 20-36 de la sección 4 de Juan 6** (17 párrafos, ~17,7k chars): la murmuración de los judíos («¿No es éste Jesús, el hijo de José, cuyo padre y madre nosotros conocemos?» — yerros sobre la persona de Cristo occasionan el escándalo de su doctrina), la fe como venir a Cristo y alimentarse de él, lo que se gana creyendo (nunca hambre, nunca morir — con la insuficiencia del maná típico: «vuestros padres comieron el maná y son muertos»), las animadversiones a creer (el Hijo dará bienvenida a todo el que venga —las dos negaciones: «no le echaré fuera en ningún modo»—; el Padre traerá sin falta a los dados; el entendimiento iluminado —«serán todos enseñados de Dios»—; y la voluntad inclinada —«Ninguno puede venir a mí si el Padre no le atrajere», con la naturaleza, necesidad, autor y corona de la atracción divina—).
- **Posición exacta**: JN 6, sección 4, párrafo 36 de 48 (75% de la sección; capítulo al 72%). Siguiente: párrafos 37-48 (12 párrafos) — la venida a Cristo como enseñado del Padre (Jn 6:45-46), el comer la carne y beber la sangre (Jn 6:51-58), y la defección de muchos discípulos (Jn 6:60-66) — con eso la sección 4 completa, y queda sección 5 (20 párrafos, la confesión de Pedro y Judas).
- Desplegado (`718a3442`). Verificado: JN 6.4 36/48 párrafos ES en producción. Commit y push.

### 2026-09-20 · GLM (vigilante) — JUAN 6 COMPLETO en español (113/113 párrafos) + OPTIMIZACIÓN de cuota adoptada

**Traducción (lote grande):** se completó Juan 6 entero en un solo turno — la **optimización de incrementos** estrenada aquí (ver abajo).
- **Sección 4, párrafos 37-48** (~10.7k chars, Jn 6:51-58): el comer la carne y beber la sangre — la preparación del alimento (mi carne que yo daré) y su participación; los tres yerros de interpretación (los judíos carnales, la transubstanciación romana que «da un mentís a nuestros sentidos», y el error de los moribundos con el sacramento); qué es la carne y sangre de Cristo (el Redentor encarnado y muriendo, con todos los beneficios de la redención — pretium sanguinis); qué es comerla: **creer**, con sus cuatro elementos (apetito hacia Cristo, aplicación de Cristo a nosotros mismos, deleite, derivación de alimento — «Dame a Cristo, o muero»); la necesidad («Si no comiereis la carne del Hijo del hombre… no tendréis vida en vosotros», con la parábola de las abejas artificiales y la miel); y el provecho: unión con Cristo (él cena sus hierbas amargas, nosotros sus ricas delicías) y vida por él (la serie de la vida divina: Padre viviente → Hijo por el Padre → creyentes por el Hijo).
- **Sección 5 completa** (20 párrafos, ~24.6k chars, Jn 6:60-71): la dura palabra y «¿quién la puede oír?» (con Averroes y su desprecio); la omnisciencia de Cristo sobre murmuraciones secretas («los pensamientos son palabras para Cristo»); la ascensión como evidencia; la clave general: «El espíritu es el que da vida; la carne para nada aprovecha» y «las palabras que yo os he hablado son espíritu y son vida»; la incredulidad no mezclada con fe (Oportet discentem credere; Stella cadens non stella fuit —la estrella que cae nunca fue estella—); la apostasía de muchos discípulos (Obsta principiis; como Orfa, a su pueblo y a sus dioses); la pregunta afectuosa «¿Queréis vosotros iros también?» (soldados voluntarios, no forzados); la confesión de Pedro («Señor, ¿a quién iremos? tú tienes palabras de vida eterna»); y el carácter de Judas (diabolos, Abaddon y Apollyon —«santos aparentes, diablos reales»— y las cinco observaciones de Henry).
- **Correcciones de huecos detectadas y cerradas en este lote:** el capítulo 6 NO tenía resumen de capítulo (r: null — solo el cap 1 lo tenía) y la sección 4 no tenía título ES. Ambos incluidos. **Pendiente de pulido anotado: resúmenes de capítulo faltan en caps 2-5 y en los siguientes — se agregan por turno cuando el lote lo permita.**
- **Léxico transliterado: 43 términos** (+11: prima facie, pretium sanguinis, primum vivens, ad modum recipientis, Oportet discentem credere, Si non vis intelligi debes negligi, Si Christiani adorant quod comedunt…, Obsta principiis, Stella cadens non stella fuit, diabolos, Abaddon/Apollyon).
- **SW v4** (`biblioteca-v4`): fuerza refresco de datos en las PWA instaladas.
- Desplegado (`b6d4c82b`). Verificado en producción: JN 6 = 113/113 párrafos ES, resumen OK, títulos de 5 secciones OK, lector 200, sw 200, léxico 43.

**Optimización de cuota (medición del usuario 02:00→08:35 y decisión operativa):**
- **Medición**: consumo semanal 65%→36% restante = **29% del presupuesto semanal en 6h35m ≈ 4.4%/hora ≈ 2.2% por ciclo de 30 min** (13 ciclos). A ese ritmo, el 100% semanal se quema en ~22-23 h de operación continua.
- **Causa del gasto**: la traducción misma (irreducible) + el **overhead fijo de cada turno** (releer BP, extraer EN, fusionar, build, deploy, verificar, commitear) que antes se pagaba por cada lote pequeño.
- **Decisión operativa (cumple la regla del vigilante):** el INCREMENTO pasa a ser el TURNO COMPLETO — 2-3 lotes de traducción y fusiones por turno, y UN solo build/deploy/verify/commit al final. El ahorro estimado es de ~20-30% por carácter traducido. Este turno lo demostró: 32 párrafos + resumen + título + léxico con un solo deploy (antes: 3 ciclos y 3 deploys).
- **Cadencia 30 min se mantiene** (no cuesta nada por sí misma; solo consumen los turnos con trabajo).

**Posición exacta: JUAN 1-6 COMPLETOS en ES (6 de 21 capítulos; ~548k chars EN traducidos).**
- **Restante: caps 7-21 = 1,500 párrafos, ~1.46M chars EN** (medido sobre los JSON reales): JN7 96k · JN8 156k · JN9 96k · JN10 81k · JN11 125k · JN12 115k · JN13 95k · JN14 81k · JN15 62k · JN16 80k · JN17 108k · JN18 98k · JN19 97k · JN20 92k · JN21 77k.
- **Proyección**: a ritmo anterior ≈ 180% de un presupuesto semanal (~85 ciclos); con la optimización ≈ **130-145% ≈ poco más de 1 semana de ciclos** para completar todo Juan.
- **Siguiente turno:** JN 7 (4 secciones, 84 párrafos, ~96k chars) en 2 lotes del mismo turno (s1-2 y s3-4) → Juan 7 completo. Luego JN 8 (el mayor, 167 párrafos, ~156k chars — probablemente 2 turnos).

### 2026-09-20 · GLM (vigilante) — JUAN 7 COMPLETO en español (84/84 párrafos) + SWR en el service worker

**Traducción (2 lotes, 1 deploy):** Juan 7 entero en un solo turno — la optimización de turno-completo funcionando a plena carga (96k chars de original, el turno más grande hasta ahora).
- **Secciones 1-2** (48 párrafos, ~61k chars): (1) «El discurso de Cristo con sus hermanos» — la retirada a Galilea («no quería andar en Judea»: prudencia, no cobardía; la luz quitada a los que procuran extinguirla), la fiesta de los tabernáculos como memorial y figura, los nueve yerros del consejo de sus hermanos (presunción de prescribirle, descuido de su seguridad, sospecha de sus milagros, el yo al fondo de todo — «muchos que parecen buscar la honra de Cristo buscan en ello la suya propia»), la mansedumbre de su respuesta, «Mi tiempo aún no ha venido» (el valor del tiempo de los hombres útiles vs. el tiempo siempre presto de los inútiles), «El mundo no puede aborreceros» (la causa real del odio del mundo: el testimonio contra el pecado), y la subida «como en secreto» (la obra de Dios mejor hecha con menos ruido; los sentimientos divididos: «Es bueno» vs. «engaña a las multitudes» — los socinianos y los deístas ya estaban en Juan 7). (2) «Cristo en la fiesta de los tabernáculos» — la enseñanza a mitad de fiesta (vergonzar a los pastores que hacen presa del rebaño), «¿Cómo sabe este hombre letras?» (letras sin universidad: don divino; los ministros han de tomarlas por trabajo ordinario), «Mi doctrina no es mía», la regla de oro del discernimiento («Si alguno quisieren hacer la voluntad de Dios, conocerá»), el carácter del engañador vs. el que busca la gloria del que le envió, «¿Por qué procuráis matarme? — ninguno de vosotros guarda la ley» (los más censuradores, los más culpables), «Demonio tienes» (la calumnia sin respuesta, como sordo), la circuncisión y el sábado (la comparación completa: ceremonial vs. ley de naturaleza, llaga vs. sanidad, holon anthropon hygie — todo el hombre sano, cuerpo y alma), «No juzguéis según la apariencia» aplicado a la persona de Cristo (forma de siervo, sin forma ni hermosura), «¿De Galilea ha de venir el Cristo?» (el fallo ad idem del argumento), «A mí me conocéis… mas yo le conozco» (par autou eimi: procedente del Padre por generación eterna), su hora todavía no venida (Dios ata las manos aunque no vuelva los corazones), y los alguaciles enviados con el discurso de la despedida: «Aun un poco de tiempo estoy con vosotros» (el lado brillante para los fieles, el negro para los que le aborrecen).
- **Secciones 3-4** (36 párrafos, ~34.6k chars): (3) «La invitación del evangelio» — «Si alguno tiene sed, venga a mí y beba» en el último y gran día de la fiesta (con la Libatio aquæ de la tradición judía de fondo), el creer = venir (según la Escritura, no según la fantasía), los ríos de agua viva de su interior (manantial para sí, pozo de vida para otros — «no basta beber de nuestra cisterna; nuestras fuentes han de derramarse fuera»), «esto dijo del Espíritu» aún no dado porque Jesús no aún glorificado (las cuatro razones de Henry), la división entre la gente («no es culpa del evangelio más que de la medicina sana el agitar los humores peccantes»), «Verdaderamente éste es el profeta» vs. «¿De Galilea ha de venir el Cristo?» (conocimiento laudable de la Escritura + ignorancia culpable del Señor de ella). (4) «El testimonio de los alguaciles» — «Nunca hombre alguno ha hablado como este hombre» (confesado por los mismos enviados a prenderle; Cristo preservado por el poder que Dios tiene sobre las conciencias aun de los hombres malos), «¿También vosotros habéis sido engañados?» (el prejuicio por la vanidad: ¿habéis de iros al infierno en cumplimiento a los príncipes?), «Esta gente que no sabe la ley, maldita es» (ochlos outos vs. laos; muchos llanos discípulos saben más por obediencia que grandes letrados con todo su ingenio), Nicodemo ante el sanedrín (su sabiduría en quedarse, su denuedo a la primera ocasión; «¿Condena nuestra ley a un hombre si primero no le oye?» — secundum allegata et probata, hechos y no rostros en juicio), «¿Eres tú también galileo?» (Jonás y Nahum también eran de Galilea) y la suspensión apresurada de la corte («el consejo de Jehová es hecho permanecer»).
- **Deuda de pulido cerrada: resúmenes de capítulo 2-5 traducidos y fusionados** (junto al 6 del turno anterior y el 7 nuevo — ahora caps 2-7 completos; el cap 1 ya lo tenía). El fusionador ahora acepta fragmentos de solo-resumen (`s` opcional).
- **Service worker: stale-while-revalidate para `/data/*`** — los JSON del corpus se sirven del caché al instante y se actualizan en segundo plano en cada visita: **fin definitivo de la treadmill de bump de versión por deploy** (los datos llegan frescos a la segunda apertura, sin red en la primera). Assets con hash siguen cache-first (inmutables). SW v5 como último refresco forzado de las PWA instaladas.
- **Léxico transliterado: 59 términos** (+16 de Juan 7: custodes utriusque tabulæ, Circumcisio et ejus sanatio pellit sabbatum, kat opsin, brutum fulmen, holon anthropon hygie, cholē, par autou eimi, ek tou ochlou, Libatio aquæ, oupo gar hen pneuma, re infecta, nemine contradicente, epikatartoi, secundum allegata et probata, ochlos outos, in ordine ad spiritualia).
- Desplegado (`98d61dc5`). Verificado en producción: JN 7 = 84/84 párrafos ES con las 4 secciones tituladas · resúmenes 2-7 OK · lector 200 · sw v5+SWR OK · léxico 59.

**Posición exacta: JUAN 1-7 COMPLETOS en ES (7 de 21 capítulos; ~644k chars EN traducidos).**
- **Restante: caps 8-21 = 1,416 párrafos, ~1.36M chars EN.**
- **Siguiente turno:** JN 8 (7 secciones, 167 párrafos, ~156k chars — el mayor del evangelio) en 2-3 lotes; si el turno no da para todo, se cierra con lo fusionado (el flujo parcial ya es seguro). Luego JN 9-10 en un turno, y así sucesivamente.

### 2026-09-20 · GLM (vigilante) — Juan 8 al 46%: la adúltera + la luz del mundo + «Yo me voy» (77/167 párrafos)

- **Sección 1 completa** «La mujer tomada en adulterio» (35 párrafos, ~25.5k chars, Jn 8:1-11): el retiro nocturno al monte de las Olivas (prudencia sin cobardía; «es prudente salir del camino del peligro cuando podemos sin salir del camino del deber») y el regreso de madrugada a enseñar; el lazo de los escribas y fariseos (la acusación con halagos: le llaman Maestro a quien ayer llamaron engañador); las cuatro cabezas de Henry (el estrado, la acusación, el estatuto, la petición de juicio, con las dos horquillas del lazo: confirmar la ley vs. absolver); la respuesta de Cristo: escribir en tierra (me prospoioumenos; las cuatro conjeturas — Grotio, Jerónimo, Ambrosio, «La tierra acusa a la tierra») y «El que de vosotros esté sin pecado, eche la primera piedra» (la regla Dt 17:7, la máxima moral, el proceso de las aguas amargas — Aquæ non explorant ejus uxorem, y el gran designio: traer también a los acusadores al arrepentimiento); los pecados escritos «como con pluma de hierro y punta de diamante» (no en la arena); la retirada uno a uno desde los más viejos (la fuerza de la palabra sobre la conciencia, y las tres locuras de los convencidos: huir del sonrojo, como Judá; eludir la convicción; apartarse de Cristo — «¿A quién irán?»); la mujer sola en medio (el refugio de los penitentes: la ley que acusa se retira por el evangelio); y la sentencia: «Ni yo te condeno; ve, y no peques más» — la absolución temporal (Cristo no desarma al magistrado; Tractent fabrilia fabri; la justicia comparativa de Dt 32:26,27) y la eterna (coram non judice).
- **Secciones 2-3 completas** «El discurso de Cristo con los fariseos» (42 párrafos, ~41.6k chars, Jn 8:12-30): «Yo soy la luz del mundo» (Luz de luces; un solo sol para todo el mundo, así un solo Cristo); «El que me sigue no andará en tinieblas» (seguir, no sólo mirar: luces falsas — ignes fatui — vs. la luz verdadera, luz a los pies); la objeción frívola «tu testimonio no es verdadero» y su respuesta: «Yo sé de dónde he venido» (los buenos cristianos saben de dónde viene su vida espiritual aunque el mundo no los conozca), «Vosotros juzgáis según la carne» (la regla mala, el juicio no puede ser recto; prima dispensatio Christi medicinalis est, non judicialis), y el testimonio doble: «Yo soy el que doy testimonio de mí mismo, y el Padre que me envió da testimonio de mí» (las dos personas distintas y una sustancia, con Agustín contra sabelianos y arrianos); «¿Dónde está tu Padre?» (juzgar según la carne; los ciegos hablando de colores), «Si a mí me conocieseis, también a mi Padre conoceríais» (el deísmo hace camino para el ateísmo); enseñando en la sala del tesoro con las manos atadas aunque las lenguas sueltas («Dios tiene a Satanás y a sus instrumentos en cadena»); la amonestación solemne: «Yo me voy; y me buscaréis, mas en vuestro pecado moriréis» (las cuatro amenazas: la partida de Cristo — Icabod; las indagaciones embrutecidas tras otro Mesías; morir en su pecado — el singular griego en te hamartia, el pecado de la incredulidad; la separación eterna); el chiste «¿Se matará a sí mismo?» (la malicia favorecida crece más maliciosa); «Vosotros sois de abajo, yo soy de lo alto» (ek ton kato; el afecto a las cosas bajas); «Si no creyereis que yo soy — hoti ego eimi, Ehejeh asher Ehejeh —, en vuestros pecados moriréis» (la incredulidad es el pecado que condena: pecado contra el remedio; el evangelio como defeasance de la obligación de la ley); «¿Tú quién eres?» (ten archen ho ti kai lalo hymin); «Cuando hayáis levantado al Hijo del hombre, entonces conoceréis» (las cinco razones de Henry: el valor de las misericordias conocido por la falta, el despertar de las conciencias, las señales, el Espíritu comprado, los juicios venideros); «No me ha dejado solo el Padre, porque yo siempre hago las cosas que le agradan» (ningún mero hombre podría decirlo; tal sacerdote y tal sacrificio nos convenía); y «muchos creyeron en él» (el remanente; Utinam et me loquenti multi credant — Agustín).
- **Léxico transliterado: 79 términos** (+20 de JN 8 s1-3: me prospoioumenos, Aquæ non explorant ejus uxorem, Aut sumus aut fuimus…, Qui alterum incusat probri…, Tractent fabrilia fabri, coram non judice, enos hekastou auton tas hamartias, ignes fatui, Prima dispensatio Christi medicinalis est non judicialis, inops consilii, verum dictum, Alius est filius et alius pater…, ek ton kato, hoti ego eimi, Ehejeh asher Ehejeh, ten archen ho ti kai lalo hymin, autodidaktos, Theodidaktos, premunire, Utinam et me loquenti…).
- Desplegado (`3aeb8ba0`). Verificado en producción: JN 8 = 77/167 párrafos ES (s1 35/35, s2 18/18, s3 24/24 con títulos y verso de inicio correctos), lector 200, léxico 79. Commit y push.

**Posición exacta**: caps ES completos 1-7 de 21 + JN 8 al 46% (secciones 1-3 de sus 7). **Siguiente turno: JN 8 s4-s7** (90 párrafos, ~89.3k chars): «la verdad os hará libres» (v:31), la simiente de Abraham y el diablo (v:38, 35 párrafos), «¿Decimos bien nosotros que tú eres samaritano?» (v:48) y «Antes que Abraham fuese, yo soy» (v:51) → JUAN 8 COMPLETO. Luego JN 9 (el ciego de nacimiento, 90 párrafos) y JN 10 (86 párrafos) en el turno siguiente.

### 2026-09-20 · GLM (vigilante) — JUAN 8 COMPLETO en español (167/167) — 8/21 capítulos

**Traducción (3 lotes, 1 deploy):** el capítulo mayor del evangelio cerrado en un solo turno — 90 párrafos, ~89.3k chars.
- **Sección 4** «La libertad cristiana» (23 párrafos, v:31, Jn 8:31-37): «Si continuareis en mi palabra, seréis verdaderamente mis discípulos» (menein — morar en la palabra como en casa propia; sin poder de revocación; atados por el término de la vida); «Conoceréis la verdad» (los hijos de Dios son pero niños; los discípulos de Cristo serán bien enseñados); «La verdad os hará libres» (justificación: libre de la culpa; santificación: libre del cautiverio de la corrupción; los de libre pensamiento más libres son los cuyos pensamientos son cautivados a Cristo); «Simiente de Abraham somos, y jamás hemos sido siervos» (las dos locuras: la falsedad histórica — Egipto, Babilonia, Roma — y la aplicación equivocada; los corazones carnales sienten los agravios del cuerpo, no los del alma — «¿No habla por parábolas?»); «Todo aquel que hace pecado, siervo es del pecado» (pas ho poion hamartian; el que hace elección del pecado, pacto con él, contratos, oficio); el siervo no queda en la casa (Crisóstomo; Jerusalén desiglesiada con el pacto del Sinaí que engendra para servidumbre); «Si el Hijo os hubiere libertado, seréis verdaderamente libres» (ontos — realmente: el Hijo como fiador que compone con el acreedor, rescatador de siervos de cadena, naturalizador de extranjeros); y «mi palabra no cabe en vosotros» (ou chorei; como lluvia sobre la roca; si el espíritu inmundo halla el corazón vacío, entra y mora).
- **Sección 5** «El Padre y su padre» (35 párrafos, v:38, ~30.5k chars, Jn 8:38-47): los dos padres y las dos familias (Dios y el diablo, contrarios sin controversia); «Nuestro padre es Abraham» (Fuimus Troes, fuit Ilium; el mayorazgo y el pedigrí no dan título al cielo — «hallamos en el infierno uno que podía llamar padre a Abraham»; «no todos son Israel que son de Israel»); «Esto no hizo Abraham» (la triple agravación: contra naturaleza, desagradecido, impío — quasi deicidium; Hoc Abraham non fecisset); «Un padre tenemos, que es Dios» (las dos lecturas: literal y figurada; la idolatría como fornicación espiritual); «Si vuestro padre fuese Dios, ciertamente me amaríais» (la adopción se prueba en el amor a Cristo; anatema el que no amare; exeleusis — el origen divino del Hijo); «No reconocéis mi lenguaje» (el dialecto de la familia; el no poder oír es una voluntad obstinada); **«Vosotros de vuestro padre el diablo sois»** (la prueba general: las pasiones del diablo hechas de elección; y las dos instancias: homicida — anthropoktonos, sitnah, Caín — y mentiroso — desertor y destituido de la verdad, ek ton idion, padre de mentira); «¿Quién de vosotros me argüirá de pecado?» (la desafío justo: la única manera de no ser convicto de pecado es no pecar); y «El que es de Dios, las palabras de Dios oye» (la culpa está en el suelo, no en la semilla).
- **Sección 6** «La mansedumbre de Cristo zaherido» (8 párrafos, v:48, Jn 8:48-50): «¿No decimos bien que eres samaritano y tienes demonio?» (los dos cargos: enemigo de la iglesia y loco; los Cuthæi; el fanatismo como marca de la revelación divina — 2Re 9:11); la respuesta: «Yo no tengo demonio; antes honro a mi Padre» (con la glosa de Agustín: él era el buen samaritano de la parábola); «Vosotros me habéis deshonrado» (la afrenta era espada en sus huesos, y la sobrellevó por nuestra salvación); y «Yo no busco mi gloria; hay quien busque y juzgue» (los muertos a la alabanza pueden llevar el desprecio; antes de la honra va la humildad).
- **Sección 7** «Antes que Abraham fuese, yo soy» (24 párrafos, v:51, ~28.7k chars, Jn 8:51-59): «Si alguno guardare mi palabra, no verá muerte para jamás» (las tres razones: la propiedad de la muerte mudada, su poder quebrado, librados de la segunda muerte); «Ahora conocemos que tienes demonio. Abraham murió» (el método de la malicia: primero la imputación, luego la evidencia; las dos equivocaciones del raciocinio judío: inmortalidad en este mundo, y nadie mayor que Abraham); «Si yo me glorifico, mi gloria no es nada» (ean ego doxazo; los admiradores de sí mismos son engañadores de sí); «Decís que él es vuestro Dios; con todo no le habéis conocido» (la nominal relación con un Dios desconocido; «la profesión no mejorada por nosotros será usada contra nosotros»); «Yo le conozco, y guardo su palabra» (la mejor prueba del conocimiento de Dios es la obediencia); **«Abraham vuestro padre se regocijó para que viese mi día»** (egalliasto — saltó de gozo; el deseo de Abraham mayor por la simiente que por la tierra; Melquisedec, Mamre, Sodoma, Isaac y Jehová-jireh como vistas del día de Cristo); «¿Cincuenta años no tienes aún?» (el descrédito de la tradición de Ireneo; la vejez contada desde los cincuenta); **«Antes que Abraham fuese, yo soy»** (prin Abraam genesthai, ego eimi — el cambio del verbo: Abraham criatura, Cristo Creador; como Dios y como Mediador, el Cordero inmolado desde el fundamento del mundo); y la conclusión: piedras y escape silencioso (ekrybe; paregen houtos — así pasó, sin que se apercibieran; «las partidas de Cristo de una iglesia o de un alma son secretas y no presto notadas»; el Calvinismo de Calvino: longe falluntur, cum templum se habere putant Deo vacuum).
- **Resumen del capítulo 8** incluido (la estructura completa de las 6 conferencias).
- **Léxico transliterado: 100 términos** (+21 de JN 8 s4-7: menein, pas ho poion hamartian, ou chorei en hymin, alethos, ontos, performa doni, quasi deicidium, Hoc Abraham non fecisset, Fuimus Troes fuit Ilium, exeleusis, ten lalian ten emen, thelete poiein, anthropoktonos, sitnah, ek ton idion, ean ego doxazo, egalliasto, prin Abraam genesthai ego eimi, Cuthæi, ekrybe, Longe falluntur…).
- Desplegado (`8429b91e`). Verificado en producción: JN 8 = **167/167 párrafos ES** (7 secciones, títulos y versos correctos), resumen OK, lector 200, léxico 100. Commit y push.

**Posición exacta: JUAN 1-8 COMPLETOS en ES (8 de 21 capítulos; ~800k chars EN traducidos).**
- **Restante: caps 9-21 = 1,249 párrafos, ~1.27M chars EN.**
- **Siguiente turno:** JN 9 (el ciego de nacimiento: 5 secciones, 90 párrafos, ~96k chars) en 2 lotes → Juan 9 completo. Luego JN 10 (el buen Pastor, 4 secciones, 86 párrafos). Proyección con la cadencia actual: ~55-65 turnos para completar todo Juan.

### 2026-09-20 · GLM (vigilante) — JUAN 9 COMPLETO en español (90/90) — 9/21 capítulos

**Traducción (4 lotes, 1 deploy):** el ciego de nacimiento entero en un solo turno — la sección 3 (la mayor, 46 párrafos) fusionada en dos mitades.
- **Secciones 1-2** (29 párrafos, ~30.5k chars): la compasión de Cristo que detiene su huida para sanar (curado in transitu — «así debemos tomar ocasiones de hacer bienes, aun al pasar»); la condición del ciego de nacimiento (Job 3:20; la cura como muestra del poder en casos desesperados y de la gracia que da vista a los ciegos de nacimiento); «Rabí, ¿quién pecó?» (las dos lecturas de los discípulos — la noción pitagórica de la preexistencia de las almas; «la gracia del arrepentimiento llama castigos a nuestras aflicciones, mas la de la caridad llama pruebas a las de los otros»); la respuesta: «Ni éste pecó, ni sus padres» (las calamidades no siempre son castigos; a veces son intentadas para la gloria de Dios; «las sentencias del libro de la providencia son a veces largas, y has de leer muy lejos antes de apprehender su sentido»); «Me es necesario hacer las obras del que me envió, entre tanto que el día dura» (la noche viene; es tarde para pujar cuando la pulgada de vela es dejada caer); el lodo de saliva (el poder de Dios obra por contrarios — hace sentir la ceguera antes de dar vista; el colirio es de sangre de Cristo — Ap 3:18); el estanque de Siloé («Enviado»: las aguas del santuario, el tipo de la doctrina de Cristo; los bautizados llamados photisthentes —iluminados—); y «fue, y se lavó, y vino viendo» (más gloria que el Veni, vidi, vici de César); los vecinos: «¿No es éste el que mendigaba?» («Éste es / a él se parece» — la sabiduría de la providencia en la variedad de los rostros; el cambio de la gracia convertidora).
- **Sección 3 completa** «La cavilación de los fariseos refutada» (46 párrafos, ~48.9k chars): el proceso del sanedrín (el delito: era sábado cuando hizo el lodo — por qué Cristo obraba en sábado: no ceder al poder usurpado, exponer el cuarto mandamiento, dignificar el día); los padres citados («Éste es nuestro hijo… más lejos estos testigos no dicen» — el temor del hombre tiende lazo: Proximus egomet mihi); la ley del sanedrín: echado de la sinagoga quien confesase a Jesús por el Cristo (las dos razones de su furia — doctrina espiritual contra formalidades, y Mesías humilde contra esperanzas de pompa; el destierro legal; «el que se sienta en los cielos se reirá de ellos»); «Es profeta» (según la luz que tenía); «Dad gloria a Dios: este hombre es pecador» (robar a Cristo su honra so color de celo por Dios; las inquisiciones ex officio; «Él era representado como pecador de la primera magnitud»); «Yo era ciego, y ahora veo» (no hay disputa contra la experiencia; «yo vivía vida carnal… mas ahora de otra manera está conmigo»); «¿Queréis también haceros sus discípulos?» (ironía; los que cierran sus ojos a la luz pierden el beneficio de la instrucción); «Nosotros somos discípulos de Moisés» (la armonía de Cristo y Moisés; la gracia de Dios y el deber del hombre se besan); «No sabemos de dónde sea» (la sin razón de la incredulidad: no quieren conocer porque no quieren creer); el razonamiento del ciego (el doctor Whitby: «un ciego y iletrado juzgando mejor que todo el sabio consejo»; el argumento en forma contra Sal 66:18-20; «Dios no oye a los pecadores»; «desde el principio del mundo no se ha oído que alguno abriese los ojos de uno nacido ciego» — Moisés obró plagas milagrosas, Cristo curas milagrosas); y la excomulgación: «Tú naciste del todo en pecado, ¿y tú nos enseñas?» (proud men scorn to be taught — «jamás debemos pensarnos demasiado viejos, ni sabios, ni buenos, para aprender»).
- **Secciones 4-5** (15 párrafos, ~16.5k chars): Cristo halla al echado fuera («Jesucristo sostendrá a sus testigos; un libro de memoria es escrito»); «¿Crees tú en el Hijo de Dios?» (la fe de los santos antes de la manifestación); «Le has visto, y el que habla contigo, ése es» (Cristo se manifiesta a las cosas flacas y necias del mundo; «Jesucristo está muchas veces más cerca de las almas que le buscan de lo que ellas están apercibidas»); «Creo, Señor; y le adoró» (adorarle = confesar que es Dios); y a los fariseos: «Para juicio yo he venido al mundo» (para que los que no ven vean, y los que ven sean cegados; la infatuación judicial: no guerra ni hambre, sino dureza de corazón y fuertes engaños — Ez 34:17,22); «¿Somos nosotros también ciegos?» (scandalum magnatum; «nada fortifica más el corazón corrupto que la buena opinión que otros tienen de él»); y el cierre: «Si fuereis ciegos, no tendríais pecado; mas ahora decís: Vemos; por tanto vuestro pecado permanece» (no hay mayor estorbo a la salvación que la suficiencia propia).
- **Resumen del capítulo 9** incluido (con la cronología: tabernáculos en septiembre, dedicación en diciembre — Jn 10:22).
- **Léxico transliterado: 110 términos** (+10: paregen/kai parago, ergazesthai ta erga, epechrise, photismos/photisthentes, Veni vidi vici, Proximus egomet mihi, ex officio, toiauta semeia, maledixerunt eum, scandalum magnatum).
- Desplegado (`91dd4957`). Verificado en producción: JN 9 = **90/90 párrafos ES** (5 secciones con títulos y versos correctos), resumen OK, lector 200, léxico 110. Commit y push.

**Posición exacta: JUAN 1-9 COMPLETOS en ES (9 de 21 capítulos — casi la mitad del evangelio; ~896k chars EN traducidos).**
- **Restante: caps 10-21 = 1,159 párrafos, ~1.18M chars EN.**
- **Siguiente turno:** JN 10 (el buen Pastor: 4 secciones, 86 párrafos, ~81k chars) completo en 2-3 lotes. Luego JN 11 (Lázaro, 132 párrafos) y JN 12 (120 párrafos), probablemente uno por turno.

### 2026-09-20 · GLM (vigilante) — JUAN 10 COMPLETO en español (86/86) — 10/21 capítulos: ¡LA MITAD DEL EVANGELIO!

**Traducción (3 lotes, 1 deploy):** el buen Pastor entero en un solo turno — 86 párrafos, ~81k chars.
- **Sección 1** «El buen Pastor» (40 párrafos, ~36.7k chars, Jn 10:1-18): la parábola (ladrones que suben por otra parte; «cuán industriosos son los malvados para hacer daño — esto debería avergonzarnos de nuestra pereza en el servicio de Dios»; el portero abre; llama por nombre; «vosotros, ovejas mías, hombres sois» — Ez 34:31); las seis observaciones (la iglesia redil; lobos con vestidos de ovejas; los subpastores entran por la puerta de una regular ordenación — «a tales abrirá el portero»); la ignorancia de los judíos («los mayores pretendientes de conocimiento son los más ignorantes en las cosas de Dios»); Cristo la puerta Y el pastor (no solecismo en la divinidad: tiene autoridad de sí mismo, como tiene vida en sí mismo, y entra por su propia sangre); la puerta de los pastores (todos los que vinieron antes de él — no en tiempo, sino anticipando su comisión — son ladrones: «los rivales de Cristo son salteadores de su iglesia, pastores de pastores»); la puerta de las ovejas («por la puerta de la fe, pues la de la inocencia está cerrada» — entrará y saldrá, y hallará pastos: hierba en el campo, forraje en el redil); el ladrón viene a hurtar y matar (los que hurtan la Escritura guardándola en lengua desconocida); «Yo he venido para que tengan vida, y la tengan más abundante» (kai perisson echosin; vida con ventaja); el buen pastor da su vida (David y el león; prerrogativa del gran Pastor: comprar el rebaño — Hch 20:28); el mercenario (sus malos principios: ama más el salario que la obra; sus malas prácticas: deja las ovejas al lobo); «Yo conozco mis ovejas, y las mías me conocen» (conocidas como el Padre conoce al Hijo; el fundamento en el pacto de redención); «Otras ovejas tengo que no son de este redil» (los gentiles escogidos desde la eternidad; «tengo más ovejas de las que veis»; «un redil y un pastor: un Cristo hace una iglesia»); «Yo pongo mi vida» (tithemi — como prenda, como precio de compra; el pastor sacrificado por las ovejas — reverso de miles de ovejas sacrificadas por pastores); y las cuatro consideraciones que quitan la ofensa de la cruz («Por eso me ama el Padre»; la divina estratagema como ante Hai; poder de ponerla y tomarla: sui juris — «nadie quita mi vida de mí»).
- **Sección 2** «Los sentimientos acerca de Cristo» (3 párrafos, v:19): la división («mejor es estar divididos acerca de la doctrina de Cristo que unidos en el servicio del pecado»); «Demonio tiene y está fuera de sí» (el peor carácter sobre los mejores hombres); y la defensa: «estas palabras no son de quien tiene demonio… ¿Puede un demonio abrir los ojos de los ciegos?».
- **Sección 3** «La conferencia de Cristo con los judíos» (34 párrafos, v:22, ~32.3k chars): la fiesta de la dedicación (Judas Macabeo; Dn 8:13,14; no fiesta divina sino buena — como Purim); el pórtico de Salomón (andaba pensativo a la vista de la ruina del templo); «¿Hasta cuándo nos turbarás el ánimo?» (los escépticos pueden sostener la balanza pareja; «Cristo querría hacernos creer; nosotros nos hacemos dudar»); la respuesta: «Os lo he dicho, y no creéis… no sois de mis ovejas» (con la distinción de Jansenio: el no ser escogido no es causa propia de la incredulidad, sino por accidente; «profundo abismo es, y el aborrecido de Jehová caerá en él»); las ovejas oyen y siguen (el dux gregis); «Yo les doy vida eterna» (don presente: el cielo en la semilla, en el brote, en el embrión); «Ni alguno las arrebatará de mi mano» (el Padre mayor que todos — mayor que la vieja serpiente y que el dragón cuyo nombre es legión; «Yo y el Padre uno somos» contra sabelianos y arrianos — «aun las piedras que tomaron para arrojárselas lo hablarían»); las piedras de carga (ebastasan lithous); «¿Por cuál de esas obras me apedreáis?» (la ingratitud como agravio del pecado); «Tú, siendo hombre, te haces Dios» (hasta aquí en lo cierto; el papa como el blasfemo verdadero); la defensa: «¿No está escrito en vuestra ley: Dioses sois?» (a minore ad majus; «la Escritura no puede ser quebrantada»); y el cierre: «Si no hago las obras de mi Padre, no me creáis» (Cristo no es duro señor que espera segar asentimientos donde no sembró argumentos).
- **Sección 4** «Cristo se retira allende el Jordán» (9 párrafos, v:39): la malicia cubierta con malicia (malè facta malè factis tegere); el escape por su propia sabiduría («no prosperará arma forjada contra el Señor Jesús»); el retiro a Betábara donde Juan bautizó; «Juan no hizo milagro, pero todas las cosas que Juan dijo de éste eran verdaderas» (la doble ventaja de comparar lo oído entonces con lo visto ahora; «la realidad excede el relato» — 1Re 10:6,7); y muchos creyeron allá («donde Juan ha sido acepto, Jesús no será desechado»).
- **Resumen del capítulo 10** incluido. **Corrección técnica importante (bug del fusionador detectado y corregido):** al fusionar fragmentos de DOS secciones con pBase≠0, el desplazamiento se aplicaba a ambas y los 9 párrafos de la s4 cayeron en posiciones 17-25. Corregido en el archivo (s4 re-fusionada en 0-8), **guarda añadida al script** (pBase≠0 sólo válido con fragmentos de una sección), y **verificación de paridad estructural ES/EN de todos los caps traducidos: TODO OK**.
- **Léxico transliterado: 126 términos** (+16: kai perisson echosin, di emou, ho poimen ho kalos, hyper ton probaton, tithemi, Id possumus quod jure possumus, sui juris, ebastasan lithous, kala erga, Opera Deo propria/digna, a minore ad majus, ad hominem, malè facta…, totidem verbis, Ten psychen hemon aireis, dux gregis).
- Desplegado (`5468ea19`). Verificado en producción: JN 10 = **86/86** (4 secciones, títulos y versos correctos, s4 en posiciones correctas), resumen OK, **JUAN acumulado: 991/991 párrafos ES**, lector 200, léxico 126. Commit y push.

**Posición exacta: JUAN 1-10 COMPLETOS en ES — LA MITAD DEL EVANGELIO (10 de 21 capítulos; ~977k chars EN traducidos).**
- **Restante: caps 11-21 = 1,073 párrafos, ~1.09M chars EN.**
- **Siguiente turno:** JN 11 (Lázaro: 4 secciones, 132 párrafos, ~125k chars — el mayor bloque restante junto a JN 8) en 3 lotes (s1, s2, s3-4) → Juan 11 completo. Luego JN 12 (120 párrafos) y JN 13 (92).

### 2026-09-20 · GLM (vigilante) — JUAN 11 COMPLETO en español (132/132) — 11/21 capítulos

**Traducción (4 lotes de una sección cada uno, 1 deploy):** el mayor bloque restante del evangelio — la resurrección de Lázaro entera en un solo turno (125k chars, el turno más pesado hasta ahora).
- **Sección 1** «La muerte de Lázaro» (25 párrafos, ~27.9k chars): la familia de Betania (Eleazar → Lázaro; hermanas morando juntas en unidad — familia sin marido ni mujer, con Cristo muy conversante); el mensaje («Señor, el que amas está enfermo» — no: el que amamos nosotros; «en esto consiste el amor: no que nosotros hayamos amado a Dios, sino que él nos amó»); «Esta enfermedad no es de muerte» (factum non dicitur quod non perseverat; «la muerte del cuerpo de este mundo es el nacimiento del alma en otro mundo»); «es por la gloria de Dios»; la demora («no se dice: los amaba y con todo se difería; sino: los amaba, y por tanto se difería» — Dios tiene graciosas intenciones aun en las que parecen diferencias); «¿No tiene el día doce horas?» (nuestro día será alargado hasta que la obra sea hecha; andar de día vs. andar de noche); «Lázaro nuestro amigo duerme» (pacto de amistad; la muerte no quiebra el vínculo — «Lázaro es muerto, y con todo es aún nuestro amigo»; el sueño de la muerte: el sepulcro para el piadoso es cama; koimeteria — dormitorios); «Vamos a él» (Cristo hace visitas al polvo); y Tomás: «Vamos nosotros, para que muramos con él» (el creyente que sabe morir: «cuántos más amigos traslados de aquí, menos ataduras a esta tierra»).
- **Sección 2** «Cristo en Betania» (34 párrafos, ~31.7k chars): «Lázaro tiene cuatro días que está sepultado» («las prometidas salvaciones aunque siempre vienen ciertas, muchas veces vienen lentas»); la casa de luto («la gracia guardará el dolor del corazón, mas no de la casa»); Marta que corre y María que se queda (los dos temperamentos: el activo guarda el dolor del corazón; el contemplativo guarda del lazo de la melancolía — «cuánto será nuestra sabiduría el cuidar las tentaciones y mejorar las ventajas de nuestro natural temperamento»); «Si estuvieras aquí, mi hermano no fuera muerto» (fe verdadera pero flaca como caña cascada — limita el poder de Cristo); «Cualquiera cosa que pidieres, Dios te la dará» (Judicii tui est, non præsumptionis meæ — Agustín; «en la una mano el cetro de oro, en la otra el incensario de oro»); «Tu hermano resucitará» (mirar adelante, no atrás); «Yo soy la resurrección y la vida» (aun el que muere vivirá, y el que vive no morirá jamás — eis ton aiona; «¿Crees tú esto?»); el credo de Marta (Cristo, Hijo de Dios, el que había de venir); María: «El Maestro ha venido, y te llama»; y la postración de María a sus pies (doblar la rodilla y confesar con la lengua, equivalentes — Ro 14:11; «dijo menos que Marta, mas lloró más; no hay retórica como las lágrimas»).
- **Sección 3** «Cristo en el sepulcro; la resurrección de Lázaro» (36 párrafos, ~32.3k chars): «Se estremeció en el espíritu, y se turbó a sí mismo» (las tres lecturas de Henry; «voluntario tanto en su pasión como en su compasión — tenía potestad de poner su dolor y de tomarlo otra vez»); «¿Dónde le habéis puesto?» (Non nescit, sed quasi nescit — Agustín; «no sólo hay pacto con el polvo, sino guarda sobre él»); **«Jesús lloró»** (el más corto versículo: prueba de su humanidad antes que de su deidad; «los que siembran al Espíritu han de sembrar en lágrimas»; Mirad cómo le amaba — «mucho más decimos nosotros: Mirad cómo nos amó, por quienes puso su vida»); el gemido junto al sepulcro (por su dureza de corazón, y por devolver a Lázaro a este valle de lágrimas); la cueva y la piedra (mnemeion — memorando; Monumentum à monendo); «Señor, apesta ya» (la incredulidad que hace el milagro más ilustre; «aunque la postura del muerto podía contraearse, el olor no»); «¿No te he dicho que si crees verás la gloria de Dios?»; «Padre, gracias te doy que me oíste» (Cristo honra la oración como la llave con que aun él abre los tesoros del poder divino); «por la multitud que está en derredor, para que crean» (oración que predica; ruego, no encantos — contra la calumnia de Belzebú); «¡Lázaro, ven fuera!» (a gran voz: la figura del evangelio que llama a las almas muertas, y de la trompeta del arcángel; «los que infieren del mandamiento de convertir y vivir que el hombre tiene poder de regenerarse, tan bien podrían inferir que Lázaro podía resucitarse a sí mismo»); y el que había muerto salió (dictum factum; desatadle — «cuán poco nos llevamos del mundo: sólo una mortaja y un féretro»).
- **Sección 4** «La consulta de los fariseos; la profecía de Caifás; una conspiración contra Cristo» (37 párrafos, ~33.3k chars): los informantes malvados («pervertir lo verdadero es tan malo como forjar lo falso» — Doeg); el consejo del sanedrín («¿Qué hacemos? porque este hombre hace muchas señales» — confiesan las credenciales y niegan la comisión); el espanto político («quitando nuestro lugar y nación» — «los fingidos temores son muchas veces el color de los maliciosos designios»; «aquella calamidad que procuramos evitar por el pecado, tomamos el camino más eficaz de traer sobre nuestras cabezas»); **Caifás: «Conviene que un hombre muera por el pueblo»** (major singulis, minor universis — la política del diablo; «la carnal política, mientras piensa salvarlo todo por el pecado, al cabo lo arruina todo»); la profecía involuntaria («¿Está también Caifás entre los profetas? Lo está, pro hâc vice»; «Dios los tiene no sólo en cadena para refrenarlos, sino en freno para llevarlos»; las migajas del pan de los hijos — Lightfoot; la resignación involuntaria del sacerdocio levítico como Isaac bendiciendo a Jacob); «para congregar en uno los hijos de Dios que estaban esparcidos» (el gran imán de los corazones y el gran centro de la unidad); la resolución y la comisión de die in diem (vis unita fortior); el retiro a Efraín (diatribai edificantes; «el príncipe de los maestros removido a esquina»); y la pascua cercana (la cuarta y última: «no fue hecha tal pascua en Israel… porque en ella Cristo, nuestra pascua, fue inmolado por nosotros» — 2Cr 35:18).
- **Resumen del capítulo 11** incluido (por qué sólo Juan registra el milagro; arras de la resurrección de Cristo).
- **Léxico transliterado: 145 términos** (+19: factum non dicitur…, sothesetai, koimeteria, nyn, Sancta est prudentia…, Judicii tui est…, pepisteuka, ho erchomenos, eis ton aiona, bochim, tetartaios gar esti, mnemeion, dictum factum, pro hâc vice, major singulis/minor universis, de die in diem, vis unita fortior, ou periepatei, diatribai).
- Desplegado (`aa1708bc`). Verificado en producción: JN 11 = **132/132 párrafos ES** (4 secciones correctas), resumen OK, **JUAN acumulado 1123/1123 párrafos**, lector 200, léxico 145. Commit y push.

**Posición exacta: JUAN 1-11 COMPLETOS en ES (11 de 21 capítulos; ~1.10M chars EN traducidos).**
- **Restante: caps 12-21 = 941 párrafos, ~966k chars EN.**
- **Siguiente turno:** JN 12 (7 secciones, 120 párrafos, ~115k chars — la unción de Betania, la entrada triunfal, el grano de trigo, la voz del cielo) en 3 lotes → Juan 12 completo. Luego JN 13-14 en un turno, y los restantes a ritmo de 1-2 capítulos por turno.

### 2026-09-20 · GLM (vigilante) — JUAN 12 COMPLETO en español (120/120) — 12/21 capítulos

**Traducción (4 lotes, 1 deploy):** el cierre del ministerio público de Cristo — 120 párrafos, ~115k chars en un solo turno.
- **Sección 1** «María unge los pies de Cristo» (24 párrafos, ~23.6k chars): la cena en Betania (la tesis de Lightfoot sobre las dos unciones); Marta que sirve («mejor es ser asistente en la mesa de Cristo que convidado en la mesa de un príncipe»; no dejó de servir por la reprensión — «algunos, cuando son reprendidos de un extremo, despechadamente corren a otro»); Lázaro a la mesa («comprobaba la verdad de su resurrección, como la de la de Cristo, que había quienes comieron y bebieron con él»); el amor de María (generoso, condescendiente, creyente — «el Ungido de Dios ha de ser nuestro Ungido»); **Judas: «¿Por qué no fue vendido por trescientos dineros?»** (la sucia iniquidad dorada con plausible pretensión; la codicia como robo de corazón; Omnia mea mecum porto; «la prosperidad de los necios los destruye» — nacido para ser colgado, mayordomo de la bolsa); «Déjala; para el día de mi sepultura ha guardado esto» (la gracia de Cristo pone bondadosos comentarios sobre las acciones de los buenos); «Los pobres siempre los tenéis con vosotros; mas a mí no siempre» (el deber que puede hacerse en cualquier tiempo cede a lo que no puede hacerse sino ahora); y los príncipes consultando matar también a Lázaro («Dios quiere que Lázaro viva por milagro, y ellos que muera por malicia» — O caeca malitia, Agustín).
- **Sección 2** «La entrada en Jerusalén» (20 párrafos): la gente común, no los grandes («Cristo es honrado más por la multitud que por la magnificencia de sus seguidores; aprecia a los hombres por sus almas, no por sus títulos»); las palmas y el Hosanna (el salmo 118 aplicado al Mesías por la gente llana — «los altos pensamientos de Cristo serán mejor expresados en palabras de Escritura»); el asnillo («su reino no era de este mundo, y por tanto no venía con pompas externas»); Zac 9:9 cumplido («aunque viene pero lentamente, con todo viene cierto»); los discípulos que no entendieron hasta la glorificación («los discípulos entienden las Escrituras por el mismo Espíritu que las inspiró»); y los fariseos: «Veis que no aprovecháis nada… el mundo se ha ido tras él» (como Caifás, «antes de apercibirse, profetizaban»).
- **Sección 3** «Los griegos desean ver a Jesús» (21 párrafos): «Señor, queremos ver a Jesús» («fallamos nuestro fin al venir si no vemos a Jesús»); «La hora es venida en que el Hijo del hombre ha de ser glorificado» — por la adición de los gentiles; **«Si el grano de trigo no cae en tierra y muere, él solo queda; mas si muere, lleva mucho fruto»** (Cristo el grano más precioso; la salvación de las almas toda se debe al morir de este grano); «El que ama su vida la perderá; el que aborrece su vida en este mundo, la guardará para vida eterna» («muchos un hombre se abraza hasta la muerte»; «dará su alma, su Dios, su cielo por ella, compra la vida demasiado cara»); «Si alguno me sirve, sígame; y donde yo estoy, allí estará mi siervo… mi Padre le honrará».
- **Sección 4** «La voz del cielo» (27 párrafos, ~29.3k chars): «Ahora está turbada mi alma» (el pecado de nuestra alma fue la turbación del alma de Cristo; la turbación de la suya para aliviar la de las nuestras); «¿Qué diré yo? Padre, sálvame de esta hora» (Calvino: Quo se magis exinanivit gloriæ Dominus…; «la inocente naturaleza llevaba la primera palabra; la divina sabiduría y amor la última»); «Padre, glorifica tu nombre» (la consagración de sus padecimientos a la gloria de Dios; «sea cobrada la deuda de mí, que yo soy solvente, no el principal»); la respuesta: «Ya he glorificado mi nombre, y aún lo glorificaré» (Bath-kol; los que dijeron que había tronado); «Ahora es el juicio de este mundo; ahora el príncipe de este mundo será echado fuera» (krisis: el día crítico de la balanza; judicium discretionis; el proceso con Satanás sobre el título del mundo — «seamos todos rentados a Cristo»); «Si fuere levantado de la tierra, a todos atraeré» (el imán y la serpiente de bronce; «el diablo salió herido de su propio arco»); y «Aún un poco de tiempo está la luz entre vosotros; andad mientras tenéis la luz» («o está durmiendo o está danzando al borde del abismo»).
- **Secciones 5-7** (28 párrafos, ~28.3k chars): «No podían creer porque Isaías dijo otra vez: Cegó los ojos de ellos» (Justa sunt judicia ejus, sed occulta — Agustín; los cuatro pasos del método de conversión; «¿por qué no puedo yo ser de aquel remanente?»; la visión de Isaías era de la gloria de Cristo); la cobardía de los príncipes («amaban la gloria de los hombres más que la gloria de Dios» — «puede que haya más buena gente de la que pensamos: Elías se tuvo por solo cuando había siete millares»); y el último discurso público: «El que cree en mí, cree en el que me envió» (tratar Dios con el hombre caído por apoderado); «La palabra que he hablado, la misma os juzgará en el último día» (las palabras de Cristo juzgan como evidencia y como regla); «Yo sé que su mandamiento es vida eterna» («las palabras de Cristo, rectamente entendidas, son aquello sobre lo que podemos aventurar nuestras almas»).
- **Resumen del capítulo 12** incluido (las siete honras amontonadas sobre la cabeza del Señor Jesús en las honduras de su humillación).
- **Léxico transliterado: 159 términos** (+14: Omnia mea mecum porto, O caeca malitia, ochlos polys, plurimarum palmarum homo, tosauta semeia, ek tes oras tautes, Quo se magis exinanivit…, Bath-kol, krisis, judicium discretionis, ean hypsotho, ho atheton eme, ut for ita ut, Justa sunt judicia ejus sed occulta).
- Desplegado (`a5de2889`). Verificado en producción: JN 12 = **120/120 párrafos ES** (7 secciones correctas), resumen OK, **JUAN acumulado 1243/1243 párrafos**, lector 200, léxico 159. Commit y push.

**Posición exacta: JUAN 1-12 COMPLETOS en ES (12 de 21 capítulos; ~1.22M chars EN traducidos — el 59% del evangelio).**
- **Restante: caps 13-21 = 821 párrafos, ~841k chars EN.**
- **Siguiente turno:** JN 13 (la noche en que era entregado: 4 secciones, 92 párrafos, ~95k chars) en 2-3 lotes → Juan 13 completo. Luego JN 14-15, y los últimos (16-21) a ritmo de 1 por turno. El evangelio completo está en el horizonte inmediato: ~3-4 semanas de ciclos.
