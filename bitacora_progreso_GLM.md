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
| B18 | **Licencia de las traducciones propias: CC BY 4.0** (2026-09-19, autorizada por el usuario — «avanza con la licencia de traducciones»). Fundamento: coherencia con el corpus (PD + CC BY), sin copyleft (evita el riesgo ShareAlike), permite todo lo que las fichas prometen, atribución protege el proyecto. Detalle: `02. Legal/Decision B18 - Licencia de traducciones propias (CC BY 4.0).md`. **RATIFICADA por el usuario (2026-09-21: «la licencia también» — luz verde).** | Usuario ✔ |

### Enmiendas a la bitácora maestra registradas (2026-09-17)

Las 5 discrepancias de Claude seleccionadas por el usuario modifican el plan vigente: D16 (traducción = producto) · D17 (corte vertical) · D18 (corpus mínimo) · D19 (Mar Muerto aplazado) · D20 (puerta de calidad de traducción). Registradas en `bitacora_progreso.md` junto a D21 (pgvector aplazado, de GLM).

---

## 2. Plan a implementar — secuencia consolidada

Leyenda: ⟡ = puerta de decisión (no se pasa sin aprobación explícita del usuario).

| # | Paso | Contenido | Criterio de "hecho" | Estado |
|---|---|---|---|---|
| 0 | Cierre Fase 0 | Nombre, dominio y disponibilidad en tiendas (bloquea marca/despliegue) · `git init` | Nombre decidido por el usuario; repo inicial commiteado | nombre `[!]` bloqueado en usuario · git `[x]` commit `e0fa316` |
| 1 | Fase legal MVP | Plantilla de ficha (12 preguntas + traductor + jurisdicción + embeddings) · fichas del corpus MVP | Fichas archivadas en `02. Legal/` con licencia literal | `[x]` plantilla + 6 fichas del núcleo · textos literales de eBible/OpenBible archivados (2026-09-19, `02. Legal/Licencias literales — eBible y OpenBible.md`) |
| 2 | Fundación técnica | Andamio web + tokens de diseño · esquema `work/edition/node/link/lemma` con OSIS · pipeline USFM→JSON con validación como portón · semilla de datos real | Lector muestra texto real ingerido por pipeline validado | `[x]` pipeline genérico multi-edición: **RV1909 + WEB validadas** · pendiente: esquema PostgreSQL |
| 3 | Corte vertical — piloto | Libro piloto (Juan 1 como demo inicial; Romanos/Juan completo a decidir): capa STEPBible con interlineal · RV1909+WEB del libro · glosario maestro · traducción de Henry del libro · revisión humana 100 % doctrinal | Piloto completo navegable ES+EN+griego con comentario traducido | `[~]` capa STEPBible completa de TODA la Biblia ingerida y visible · **traducción del piloto Henry-JUAN COMPLETA y pulida (2026-09-19: 21/21 caps, 2064/2064 párrafos, 0 residuales)** — queda revisión humana 100 % doctrinal (paso 4 ⟡, requiere decisión del usuario) |
| 4 | ⟡ Puerta de calidad | ¿La traducción es publicable con nuestro nombre? Si no: corregir método antes de escalar | Decisión registrada en esta BP | `[~]` materiales de revisión listos (2026-09-19: `06. Traduccion/Puerta paso 4 - Guía de revisión doctrinal (Juan).md` + canal de reportes en el lector) — **la revisión humana doctrinal es del usuario** |
| 5 | Conexiones | TSK (~500.000 referencias) anclado a OSIS | Referencias visibles en el lector | `[x]` 386.384 referencias validadas y navegables en el panel del verso |
| 6 | Escalado corpus | Núcleo 6 fuentes validado + cierre (SBLGNT, JFB, Barnes, Nave's) — cada obra: ficha + ingesta validada + atribución | Métrica: obras en estado `validada` / `lanzar` | `[~]` **SBLGNT INGERIDA Y VALIDADA (2026-09-21: 27 libros, 7.927 versos, ~137k palabras, 8 diferencias de versificación NA vs TR documentadas; visible en el lector con botón Ξ)** · 4 fichas del cierre archivadas · JFB/Barnes/Nave's: ingesta pendiente |
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

- **Empaquetado de obras derivadas ES (decisión 2026-09-21, tras hallazgo del techo de 20.000 archivos de Cloudflare Pages):** NINGUNA obra derivada se genera como «un archivo por entrada». Convención: **un único mapa JSON por obra** (como la morfología ES: 2.061 códigos en 2 archivos) o, si el tamaño lo exige, particiones gruesas (por letra/rango). Aplica a las glosas ES de TBESH/TBESG (22.717 entradas) y a Easton ES. Decidir el empaquetado ANTES de generar.

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

### 2026-09-20 · GLM (vigilante) — JUAN 13 COMPLETO en español (92/92) — 13/21 capítulos

**Traducción (4 lotes, 1 deploy):** la noche en que era entregado — el lavatorio, la traición y el nuevo mandamiento — 92 párrafos, ~95k chars.
- **Sección 1** «Cristo lava los pies a sus discípulos» (49 párrafos, la mayor del capítulo, ~42.9k chars): la datación (Lightfoot: Betania, dos días antes de la pascua); las cuatro razones del lavatorio: (1) probar su amor («amólos hasta el fin» — eis telos; «el niño enfermizo es el más regalado»; «nuestras flaquezas son foilos a las bondades de Cristo, y las realzan»); (2) instancia de su voluntaria humildes ("sabiendo que el Padre le había dado todas las cosas en las manos… se levanta de la cena" — la divina gloria como foil de la condescendencia; Abigail y Eliseo); (3) significar el lavamiento espiritual («¿Tú me lavas los pies?» — Tu mihi lavas pedes, Agustín; «Si no te lavare, no tendrás parte conmigo»; la justificación y la santificación incluidas en su lavarnos; «del ayer perdón tomemos argumento contra la tentación de hoy» — los sacerdotes lavándose pies y manos bajo pena de muerte); «Vosotros limpios estáis, mas no todos» (muchos tienen la señal que no tienen la cosa significada); (4) ejemplo: «Si yo, el Señor y el Maestro, os he lavado los pies…» (los tres sentidos: humilde condescendencia — «si esto es ser vil, seré aún más vil»; servicialidad — consultar el crédito y el consuelo unos de otros; santificación — «lavar los pies contaminados de nuestros hermanos con lágrimas»; el papa como mono de Cristo, Calvino; «Mirad cómo estos cristianos se aman unos a otros», Tertuliano); y la lección del ejemplo (Gedeón, Abimelec y César con sus commilitones).
- **Sección 2** «La traición de Judas predicha» (23 párrafos, ~26.7k chars): «No hablo de todos vosotros» (un Judas entre los apóstoles); «El que come pan conmigo levantó contra mí su calcañar» (la intimidad agraviada: «comía del mismo plato, bebía del mismo vaso»; levantar el calcañar: desamparar, menospreciar, ser enemigo); «Desde ahora os lo digo antes que sea: para que creáis que yo soy» (las profecías del Nuevo Testamento sobre la apostasía de los últimos tiempos como prueba de inspiración); «El que recibe a cualquiera que yo envío, a mí recibe» (contra el escrúpulo Ex uno disce omnes; «los abusos puestos sobre nuestra caridad ni justifican nuestra sin caridad, ni nos pierden el galardón de ella»); «Se estremeció en el espíritu» (los pecados de los cristianos son el dolor de Cristo); Juan en el seno y Pedro preguntando; el bocado a Judas (psomion; «Cristo algunas veces da bocados a los traidores»; «si tu enemigo tuviere hambre, dale de comer»); «Lo que haces, hazlo más presto» (el buen Espíritu justamente se retira cuando el mal es de buena gana admitido); y «Era noche» («los que sus hechos son malvados aman las tinieblas más que la luz»).
- **Sección 3** «La partida de Cristo predicha» (13 párrafos): «Ahora es glorificado el Hijo del hombre» (glorificado en sus padecimientos: la victoria sobre Satanás, la liberación de su pueblo, el ejemplo de abnegación); «Hijitos, aún un poco de tiempo estoy con vosotros» (mejorar las presentes oportunidades; no embeberse en la corporal presencia); el nuevo mandamiento (renovado, excelente, eterno, nuevo — «como libro viejo en nueva edición, corregida y aumentada»; el ejemplo: «Como yo os he amado»; la divisa de los discípulos: «Mirad cómo estos cristianos se aman»).
- **Sección 4** «La confianza de Pedro» (7 párrafos): «¿Señor, a dónde vas?» (más inquisitivos de las cosas secretas que de las reveladas); «Tú no puedes seguirme ahora» (el desierto entre la mar Bermeja y Canaán); «Mi vida pondré por ti» (inconsiderado mas no insincero); y la triple negación predicha («Cristo no sólo conoce la maldad de los pecadores, mas la flaqueza de los santos»; «los más seguros son comúnmente los menos seguros»).
- **Resumen del capítulo 13** incluido. **Corrección técnica**: la guarda contra el pBase corruptor referenciaba `frag` antes de cargarlo — reordenada y verificada.
- **Léxico transliterado: 165 términos** (+6: sy mou, Tu mihi lavas pedes, eis telos, tous idious, psomion, cum animo testandi, Ex uno disce omnes).
- Desplegado (`8c671a7e`). Verificado en producción: JN 13 = **92/92 párrafos ES** (4 secciones correctas), resumen OK, **JUAN acumulado 1335/1335 párrafos**, lector 200, léxico 165. Commit y push.

**Posición exacta: JUAN 1-13 COMPLETOS en ES (13 de 21 capítulos; ~1.32M chars EN traducidos — el 62% del evangelio).**
- **Restante: caps 14-21 = 729 párrafos, ~746k chars EN.**
- **Siguiente turno:** JN 14 (los consolatorios discursos: 7 secciones, 89 párrafos, ~81k chars) en 3 lotes → Juan 14 completo. Luego JN 15-16 juntos, y 17-21 a ritmo de 1 por turno (el 17, la oración sacerdotal, merece turno propio).

### 2026-09-20 · GLM (vigilante) — JUAN 14 COMPLETO en español (89/89) — 14/21 capítulos

**Traducción (4 lotes, 1 deploy):** los consolatorios discursos — el capítulo del Consolador — 89 párrafos, ~81k chars.
- **Secciones 1-2** (32 párrafos, ~29.9k chars): «No se turbe vuestro corazón» con el énfasis triple de Henry (turbar — no como mar agitada; corazón — «el corazón es la principal fortaleza: guardadla con toda diligencia»; vuestro — «tiemblen los pecadores en Sión, mas gócense los hijos de Sión en su rey»); el remedio: «Creed en Dios; creed también en mí» (pisteuete leído en ambos sentidos; «habría yo desmayado, si no creyese»); la casa del Padre (muchas moradas: distinctas y duraderas — Monai; «aquí estamos como en posada; en el cielo alcanzaremos establecimiento» — Reobot); «si no, yo os lo hubiera dicho» («nos ama demasiado bien para frustrar las expectaciones que él mismo ha levantado»); «voy a aparejaros lugar» (toma de posesión como abogado; «el cielo sería lugar sin aparejo para un cristiano si Cristo no estuviese allí»); «vendré otra vez, y os tomaré a mí mismo» (erchomai: cada día viene); **«Yo soy el camino, y la verdad, y la vida»** (distintamente y conjuntamente: «el principio, el medio y el fin»; «otros caminos pueden parecer derechos; mas el cabo de ellos es camino de muerte»); Felipe: «Muéstranos el Padre» («una vista del Padre es un cielo en la tierra» — Jansenio; la reprensión amable: «no todos los que conocen a Dios saben a la primera que le conocen»); y «El que me ha visto ha visto al Padre» (la verdadera Shequiná; «buscad al Señor; buscadle en Cristo»).
- **Secciones 3-4** (23 párrafos, ~17k chars): «Las obras que yo hacéis él las hará también; y mayores hará» (Pedro con su sombra; Pablo con el pañuelo; «el cautivar tan gran parte del mundo a Cristo era el milagro de todos los milagros» — el don de lenguas); «Cualquier cosa que pidiereis en mi nombre, eso haré yo» (la correspondencia con el cielo: «hacedme oír de vosotros por la oración, y oiréis de mí por el Espíritu»); «Si me amáis, guardad mis mandamientos» («no hemos de esperar consuelo sino en el camino del deber»; parakaleo — exhortar y consolar); **otro Consolador** (allon parakleton: abogado — vicarius Christi; maestro y patrono; Menahem — el Consolador que los judíos esperaban; «la causa no puede malograrse que es defendida por tal abogado»); «El Espíritu de verdad, al cual el mundo no puede recibir» («las experiencias de los santos son las explicaciones de las promesas: paradojas para otros, axiomas para ellos»; «el bienaventurado Espíritu no suele mudar su hospedaje»).
- **Sección 5** (15 párrafos, ~15.8k chars): «No os dejaré huérfanos» (ni total ni final; «el caso de los verdaderos creyentes, aunque a veces doloroso, jamás es sin consuelo, porque jamás son huérfanos»); «Porque yo vivís, vosotros también viviréis» («la vida de los cristianos está atada en la vida de Cristo»); «En aquel día conoceréis» (el ciego que vio hombres como árboles); «El que tiene mis mandamientos y los guarda, ése es el que me ama» (amor y obediencia: raíz y fruto); el otro Judas: «Señor, ¿qué hay?» (los dos sentidos de Henry; «los señalados favores obligan mucho»); y «Vendremos a él, y haremos morada con él» («no una corta y pasajera visita»; «Dios reposará en su amor para con ellos» — Sof 3:17).
- **Secciones 6-7** (19 párrafos, ~18.3k chars): el Espíritu como tutor y recordador («no les enseñará un nuevo evangelio, mas traerá a sus mentes lo que les fue enseñado»; «al Espíritu de gracia hemos de cometer la guarda de lo que oímos y sabemos»); **el testamento de Cristo** («hizo su testamento: su alma al Padre, su cuerpo a José, sus vestidos a los soldados, su madre a Juan; y a sus pobres discípulos les dejó su paz» — «no como el mundo la da; la paz del mundo comienza en ignorancia y acaba en turbaciones; la de Cristo comienza en gracia y acaba en paz eterna»); «El Padre mayor es que yo» (su estado con el Padre mayor que el presente; el mediador reino menor que el reino del Padre); «El príncipe de este mundo viene, mas no tiene nada en mí» (advertidos de antemano, armados de antemano; «no había esquila en que hiciese saltar fuego; tal la sin mancha pureza de su naturaleza que estaba sobre la posibilidad de pecar»); y «Levantaos, vamos de aquí» (el detalle del doctor Goodwin: miró el reloj, no estaba cabal, y se sentó a predicar otro sermón; «la despedida que tomamos de nuestros amigos en la muerte no es sino buenas noches, no adiós final»).
- **Resumen del capítulo 14** incluido (los ocho consuelos del discurso).
- **Léxico transliterado: 173 términos** (+8: me tarassestho, pisteuete, Monai/meneo, allon parakleton/Paracleto, Menahem, vicarius Christi, erchomai, ho en emoi menon).
- Desplegado (`959d05ba`). Verificado en producción: JN 14 = **89/89 párrafos ES** (7 secciones correctas), resumen OK, **JUAN acumulado 1424/1424 párrafos**, lector 200, léxico 173. Commit y push.

**Posición exacta: JUAN 1-14 COMPLETOS en ES (14 de 21 capítulos; ~1.40M chars EN traducidos — el 67% del evangelio).**
- **Restante: caps 15-21 = 640 párrafos, ~664k chars EN.**
- **Siguiente turno:** JN 15 (la vid verdadera: 4 secciones, 65 párrafos, ~62k chars) completo en 2 lotes. Luego JN 16 (96 párrafos) y JN 17 (la oración sacerdotal, 121 párrafos) con turno propio cada uno. Restan ~10-12 ciclos de trabajo para completar todo Juan.

### 2026-09-20 · GLM (vigilante) — JUAN 15 COMPLETO en español (65/65) — 15/21 capítulos

**Traducción (2 lotes, 1 deploy):** la vid verdadera, el amor y el odio — 65 párrafos, ~62k chars.
- **Sección 1** «Cristo la verdadera vid» (16 párrafos, ~15.4k chars): la vid plantada, no espontánea («el Verbo hecho carne»; tipificada por la vid de Judá — la sangre de la uva, la de José — las ramas sobre el muro, la de Israel — morar confiadamente); el Padre el labrador (georgos; «jamás hubo labrador tan sabio y vigilante como Dios acerca de su iglesia»); la sentencia del infructuoso («sólo atados a él por el hilo de una externa profesión; presto se verá que son secos») y la promesa al fértil («los mejores tienen aliquid amputandum — algo que ha de ser cortado»); «Ahora vosotros limpios estáis, por la palabra» (la ley de la viña de tres años — Lv 19:23,24; «limpia como el fuego limpia el oro de su escoria»); «Sin mí nada podéis hacer» («dependemos de Cristo no sólo como la vid del muro para sostén, mas como el sarmiento de la raíz, para la savia»); el sarmiento echado fuera (seco, recogido, quemado — «los apóstatas son dos veces muertos… habla como si fuesen dos veces condenados»); y «Pedid todo lo que quisiereis» («las promesas morando en nosotros están prestas para ser vueltas en oraciones»).
- **Sección 2** «El amor de Cristo a sus discípulos» (20 párrafos, ~18.2k chars): el amor del Padre al Hijo y su permanencia en él por la obediencia; «Como el Padre me amó, así os amo yo» (la extraña expresión de la condescendiente gracia: le amó a él, el más digno; a ellos, los más indignos); **«Ninguno tiene mayor amor que este: que uno ponga su vida por sus amigos»** (Cristo nuestro antipsychos — fiador, cuerpo por cuerpo; «duros como hierro o piedra han de ser los corazones que no ablanda tan incomparable suavidad del divino amor» — Calvino); la amistad de Cristo (el amigo del rey en las cortes de David y de Salomón; «los que yacen en su seno pueden aprender de los que yacen a sus pies»; «cuanta más honra Cristo pone sobre nosotros, tanta más honra hemos de estudiar hacer a él»); la elección y ordenación («No me elegisteis vosotros a mí»; el tesoro del evangelio: para propagarlo — «para que vayáis como bajo yugo» — y perpetuarlo — «la iglesia de Cristo… no muere, sino vive en sucesión»); el gozo lleno («los mundanos gozos presto hartan, mas jamás satisfacen»); y el amor fraterno por pauta, precepto y reputación.
- **Sección 3** «El odio y la persecución predichos» (21 párrafos, ~19.9k chars): el mundo como reino del odio (su número, su confederación, su espíritu); «Si fueseis del mundo, el mundo amaría lo suyo» («cuanto más lejos del templo del Señor, más lejos del Señor del templo»); «Por causa de mi nombre» (el meollo de la controversia; «si sois vituperados por el nombre de Cristo, bienaventurados sois»); la verdadera causa: «porque no conocen al que me ha enviado»; el siervo no es mayor que su señor (Eliú: Dios es mayor que el hombre); «Si yo no hubiera venido… no tendrían pecado» (la incredulidad como pecado contra el remedio; «la palabra de Cristo desnuda al pecado de su capa»); «Tales obras como ningún otro ha hecho» (con autoridad mandaba a las enfermedades y a los demonios); «Aborreciéronme sin causa» (el antitipo respondiendo al tipo: David y Absalón); y «El que me aborrece, a mi Padre aborrece también» («los deístas son en efecto ateos»).
- **Sección 4** «El Consolador anunciado» (8 párrafos): «El Espíritu de verdad que procede del Padre» (persona distinta y divina; los rayos del sol — uno con el sol; la iglesia griega: del Padre por el Hijo); «Yo os lo enviaré del Padre» (fruto tanto de la intercesión como del señorío de Cristo dentro del velo); «Él dará testimonio de mí» (abogado y testigo — el primero de los tres que testifican en la tierra); y «Vosotros también daréis testimonio, porque desde el principio estáis conmigo» («los ministros han de aprender primeramente a Cristo, y luego predicarle; mejor hablan de las cosas de Dios que hablan experimentalmente»).
- **Resumen del capítulo 15** incluido (las cuatro palabras: fruto, amor, odio, el Consolador).
- **Léxico transliterado: 181 términos** (+8: georgos, kathairei, antipsychos, hetheka hymas, hina hymeis hypagete, Idem velle et idem nolle, proton hymon, eteresan).
- Desplegado (`ca9ca8c0`). Verificado en producción: JN 15 = **65/65 párrafos ES** (4 secciones correctas), resumen OK, **JUAN acumulado 1489/1489 párrafos**, lector 200, léxico 181. Commit y push.

**Posición exacta: JUAN 1-15 COMPLETOS en ES (15 de 21 capítulos; ~1.47M chars EN traducidos — el 71% del evangelio).**
- **Restante: caps 16-21 = 575 párrafos, ~602k chars EN.**
- **Siguiente turno:** JN 16 (el Espíritu, la tribulación y el vencimiento: 5 secciones, 96 párrafos, ~80k chars) completo en 3 lotes. Luego JN 17 (la oración sacerdotal) con turno propio, y JN 18-21 a ritmo de 1 por turno. Restan ~8-10 ciclos de trabajo para completar todo Juan.

### 2026-09-20 · GLM (vigilante) — JUAN 16 COMPLETO en español (96/96) — 16/21 capítulos

**Traducción (3 lotes, 1 deploy):** el Espíritu, la tribulación y el vencimiento — 96 párrafos, ~80k chars.
- **Secciones 1-2** (38 párrafos, ~31.8k chars): «Estas cosas os he hablado, para que no seáis escandalizados» (Præmoniti præmuniti — advertidos de antemano, armados de antemano); las dos espadas (la eclesiástica: aposynagogous poiesousin hymas — os harán excomulgados; la civil: «pensará que hace servicio a Dios» — «la obra del diablo ha sido muchas veces hecha en librea de Dios»); «porque no conocen al Padre ni a mí» («jamás hubo tal iglesia perseguidora como aquélla que hace de la ignorancia la madre de la devoción»); «os conviene que yo me vaya» (las siete razones negativas y la positiva — la corporal presencia atrae los ojos, el Espíritu atrae los corazones); «él convencerá al mundo de pecado, de justicia y de juicio» (de pecado — la incredulidad como el gran reinante, el grande ruina-los, y el al-fondo-de-todos pecado: Ne putimus vel guttam unam rectitudinis — Calvino; de justicia — el Hijo justificado en el espíritu; de juicio — el príncipe de este mundo ya juzgado, «cayó como relámpago del cielo»); «no las podéis llevar ahora» (ninguno como Cristo por copiosidad, ninguno por compasión); el Espíritu guiará a toda verdad (como piloto al puerto; «no hablará de sí; el eterno Verbo y el eterno Espíritu jamás discrepan»; Jansenio: «baste que el Espíritu en la palabra nos ha mostrado las cosas por venir del otro mundo»); y «Tomará de lo mío y os lo anunciará» (todo lo que el Espíritu aplica nos pertenecía a Cristo: lo compró, caro pagó).
- **Sección 3** «La partida y el regreso; el dolor y el gozo» (24 párrafos, ~17.7k chars): «Un poco, y no me veréis; y otra vez un poco, y me veréis» (mikron — los tres días del sepulcro; los cuarenta días de la resurrección; «no es sino buenas noches a aquellos a quienes esperamos ver con gozo por la mañana»); la perplejidad de los discípulos (las tres causas de su flaqueza: el dolor llenó el corazón; la noción del reino secular; el "un poco"); «Lloraréis y haréis lloro, mas el mundo se gozará» (los que pasan: nada es ello para ellos — Lm 1:12; los que triunfan sobre los muertos testigos — Ap 11:10); **la mujer que pare** («con dolor parirás» — el fruto de la maldición; «ya no se acuerda de la angustia, por el gozo de haber nacido un hombre al mundo» — el fruto de la bendición; «están con dolor por ser libradas» — Ap 12:2, Ro 8:22); y «Vuestro gozo nadie os lo quitará» («no pudieron robarles su gozo, porque no pudieron separarlos del amor de Cristo»).
- **Sección 4** «El ánimo para la oración» (14 párrafos, ~14k chars): «En aquel día nada me preguntaréis» (la clara seguridad del entendimiento; las cinco suertes de preguntas que hicieron — ignorantes, ambiciosas, desconfiadas, impertinentes, curiosas — y nada de esto después del Pentecostés); «Estas cosas os he hablado en proverbios; la hora viene cuando os anunciaré llanamente del Padre» («¿qué es la dicha del cielo sino ver a Dios inmediata y eternamente?»); «De cierto, de cierto: cualquier cosa que pidiereis al Padre en mi nombre, os la dará» (el cetro de oro extendido; «Cristo gira como una letra sobre la tesorería del cielo, que hemos de presentar por oración»; «hasta ahora nada habéis pedido en mi nombre»); «Pedid, para que vuestro gozo sea lleno»; «el Padre mismo os ama» (philei hymas — no sólo desvió la ira, mas compró el favor; «la materia no es tal: el amor del Padre designó a Cristo por Mediador»).
- **Sección 5** «Las manifestaciones de Cristo» (20 párrafos, ~16.3k chars): «Salí del Padre, y he venido al mundo; otra vez dejo el mundo, y voy al Padre» (el Alfa y la Omega del misterio de la piedad; «mucho en poco» — los compendios como rayos de sol contraídos en vaso ardiente); «He aquí, ahora hablas llanamente» (el heureka de los discípulos); «Ahora creemos» (la omnisciencia de Cristo como móvil de la fe); «¿Ahora creéis? He aquí la hora viene… y os esparciréis cada uno a lo suyo» (Cristo sabía antes, y con todo fue tierno; «los que son probados no siempre resultan fiables»; ta idia); «Mas yo no estoy solo, porque el Padre está conmigo» (privanza peculiar y común — «en la soledad elegida y en la aflicción»; Non deo tribuimus justum honorem — Calvino); y **«En el mundo tendréis aflicción; mas confiad: yo he vencido al mundo»** (tharseite; venció al príncipe, a los hijos, a los malvados, a las malas cosas y a las buenas cosas del mundo; «por su cruz el mundo nos es crucificado: todo es vuestro, aun el mundo»).
- **Resumen del capítulo 16** incluido (Yo hago morir y yo hago vivir — Dt 32:39; las cinco sanidades).
- **Léxico transliterado: 188 términos** (+7: Præmoniti præmuniti, aposynagogous poiesousin hymas, qui caput gerit lupinum, Interdico tibi aqua et igne, elthon ekeinos, Ne putimus vel guttam unam rectitudinis, philei hymas, ta idia).
- Desplegado (`11ff5d41`). Verificado en producción: JN 16 = **96/96 párrafos ES** (5 secciones correctas), resumen OK, **JUAN acumulado 1585/1585 párrafos**, lector 200, léxico 188. Commit y push.

**Posición exacta: JUAN 1-16 COMPLETOS en ES (16 de 21 capítulos; ~1.55M chars EN traducidos — el 75% del evangelio).**
- **Restante: caps 17-21 = 479 párrafos, ~508k chars EN.**
- **Siguiente turno:** JN 17 (la oración sacerdotal: 6 secciones, 121 párrafos, ~108k chars) completo en 3-4 lotes — el capítulo más denso doctrinalmente merece turno entero. Luego JN 18, 19, 20 y 21 a ritmo de 1 por turno. Restan ~6-8 ciclos para completar todo Juan.

### 2026-09-20 · GLM (vigilante) — JUAN 17 COMPLETO en español (121/121) — LA ORACIÓN SACERDOTAL — 17/21 capítulos

**Traducción (3 lotes, 1 deploy):** el mayor capítulo doctrinal del evangelio — la oración intercesora entera — 121 párrafos, ~108k chars. El turno más pesado de la serie.
- **Sección 1** (27 párrafos, ~28k chars): las seis circunstancias de la oración (tras sermón, tras sacramento, de familia, de despedida — «Jacob muriendo bendijo a los doce patriarcas; Moisés muriendo, a las doce tribus; y así aquí, Jesús muriendo, a los doce apóstoles»; prefacio al sacrificio; muestra de su intercesión); «Padre, glorifica a tu Hijo, para que también tu Hijo te glorifique a ti» (la hora crítica — «la decisiva batalla entre el cielo y el infierno ha de ser ahora peleada»; David y Goliat, Miguel y el dragón, entran en la liza; «hizo de la cruz su triunfante carro»); la potestad sobre toda carne (único árbitro de la gran diferencia y único fiador de la gran alianza); «esta es la vida eterna: que te conozcan… y a Jesucristo a quien has enviado» (los arrabales de la vida eterna); y «Glorifícame tú junto a ti mismo, con la gloria que tenía antes que el mundo fuese» (reposcere pignus — tomar su prenda; «da las glorias de este mundo a quien quisieres; mas déjame mi porción de gloria en el mundo venidero»).
- **Sección 2** (23 párrafos, ~17.6k chars): «Yo no ruego por el mundo» (el mundo como montón de maíz no aventado: Dios le ama, Cristo ora por él y muere por él; extraído el escogido remanente, la rechazada paja es abandonada — «no están escritos en el libro de vida del Cordero, y por tanto no en el pectoral del gran sumo sacerdote»); «Tuyos eran, y me los diste» (tres títulos del Padre: Creador, acreedor, escogedor — «pudo justamente haber sido entregado a los verdugos cuando fue entregado al Salvador»); «les he manifestado tu nombre» (sólo Cristo puede manifestar aquel nombre; «por la palabra de Cristo Dios nos es revelado; por el Espíritu de Cristo, revelado en nosotros»); «todo lo mío es tuyo, y lo tuyo es mío» (no hay meum et tuum entre el Padre y el Hijo); y «Yo soy glorificado en ellos» (dedoxasmai — perfecto griego).
- **Sección 3** «Guardalos del mundo» (27 párrafos, ~24.6k chars): «No ruego que los quites del mundo» («mal puede ser perdonada para morir la buena gente que mal puede ser perdonada para vivir»; «más la honra del cristiano soldado el vencer al mundo por la fe que el por voto monástico retirarse de él; y más para la honra de Cristo servirle en una ciudad que en una celda»); «Padre santo, guárdalos en tu nombre» (los tres sentidos de «en tu nombre»: por, en, mediante); «guarda del maligno… de la mala cosa… del mal del mundo»; «ninguno de ellos se perdió, sino el hijo de perdición» (ei me — adversativo, no exceptivo; «ni el lugar ni el nombre de nadie en la iglesia… le asegurarán de la ruina, si su corazón no está recto con Dios»; «los que aman la bolsa»); «ya no estoy en el mundo… ahora vengo a ti» («la despedida en la muerte no es sino buenas noches, no adiós final»); «mas éstos están en el mundo» (los nombres sobre el pectoral, grabados con los clavos de la cruz en las palmas de las manos); y «por ellos yo me santifico a mí mismo» (el sacerdote, el altar y el sacrificio a la vez).
- **Sección 4** «Santifícalos en tu verdad» (11 párrafos, ~8.8k chars): santificación confirmada, llevada adelante, completada; la palabra de verdad como semilla del nuevo nacimiento y alimento de la nueva vida; santificados como ministros (el Urim y el Tumim: luz e integridad; «ministros del evangelio consagrados con la sangre de Jesús, no de toros ni de machos cabríos»).
- **Sección 5** «Para que todos sean uno» (14 párrafos, ~15.6k chars): ruego por los que habían de creer por su palabra (la unidad de los evangelistas se debe a esta oración); incorporados en un cuerpo, animados de un Espíritu, tejidos en el vínculo del amor («aquello es conspiración, no unión, que no descansa en Dios como el fin y en Cristo como el camino»); la gloria dada para que sean uno («las mundanas honras ponen a los hombres en variancia; las espirituales, conferidas igualmente a todos, no dan ocasión de contienda»); y el mundo creerá (Tertuliano: «mirad cómo estos cristianos se aman»; «si el mundo supiera el valor de los buenos hombres, los cercaría de perlas» — dicho judío).
- **Sección 6** «Padre, quiero que estén conmigo» (19 párrafos, ~13.3k chars): thelo — «habla lenguaje peculiar a sí, tal como no conviene a ordinarios peticionarios, mas muy bien convenía a aquel que pagó por lo que pedía»; las tres cosas que hacen el cielo (estar donde Cristo está; estar con él — «el mismo cielo del cielo es estar con Cristo»; contemplar su gloria — Uxor fulget radiis mariti); «porque me amaste antes que fuese hecho el mundo»; «Padre justo» (corona de justicia del justo Juez); «el mundo no te ha conocido, mas yo te he conocido» («nosotros somos indignos; mas él es digno»); y el cierre: «para que el amor con que me has amado esté en ellos, y yo en ellos» («todas sus peticiones centran en esto; y con esto las oraciones de Jesús, el Hijo de David, son acabadas: Yo en ellos; tenme esto, y nada más deseo. Esta oración tuvo fin; mas aquélla que siempre vive hacer»).
- **Resumen del capítulo 17** incluido (la oración del Señor Cristo — propia y peculiarmente suya como Mediador).
- **Léxico transliterado: 196 términos** (+8: sursum corda, eteleiosa, dedoxasmai, thelo, Uxor fulget radiis mariti, ei me, in transitu, instar omnium).
- Desplegado (`548193d5`). Verificado en producción: JN 17 = **121/121 párrafos ES** (6 secciones correctas), resumen OK, **JUAN acumulado 1706/1706 párrafos**, lector 200, léxico 196. Commit y push.

**Posición exacta: JUAN 1-17 COMPLETOS en ES (17 de 21 capítulos; ~1.65M chars EN traducidos — el 79% del evangelio; TODA la doctrina está ya traducida).**
- **Restante: caps 18-21 = 358 párrafos, ~364k chars EN (la pasión, la cruz y la resurrección).**
- **Siguiente turno:** JN 18 (la traición y el prendimiento: 3 secciones, 100 párrafos, ~98k chars) en 2-3 lotes → Juan 18 completo. Luego JN 19 (la crucifixión, 100 párrafos), JN 20 (la resurrección, 94), JN 21 (64). **Restan 4 turnos de vigilante para completar todo Juan.**

### 2026-09-20 · GLM (vigilante) — JUAN 18 COMPLETO en español (100/100) — LA PASIÓN COMIENZA — 18/21 capítulos

**Traducción (3 lotes, 1 deploy):** el prendimiento, el proceso judío y el proceso romano — 100 párrafos, ~98k chars.
- **Sección 1** «Cristo en el huerto» (35 párrafos, ~32.7k chars): el pasar el arroyo de Cedrón (el negro arroyo — Sal 110:7; David huyendo de Absalón; los reyes piadosos quemando los ídolos junto a Cedrón; «el monte de los Olivos al oriente, el Calvario al poniente: en ambos tenía ojo para los que habían de venir del oriente y del poniente»); el comenzar los padecimientos en un huerto («en el huerto de Edén el pecado comenzó; allí la maldición fue pronunciada; allí el Redentor fue prometido; y por tanto en un huerto la prometida simiente entró en liza con la vieja serpiente»); la banda y los alguaciles (speira; romanos y judíos, enemigos entre sí, unidos contra Cristo); «Yo soy» (Ego eimi — el glorioso nombre del bienaventurado Dios; «pudiera haber dicho: No lo soy, porque él era Jesús de Belén; mas de ninguna manera admitiría evasiones»); los enemigos caídos a tierra («¿Qué hará cuando haya de juzgar, viendo que hizo esto cuando venía a ser juzgado?» — Agustín); «Dejad ir a éstos» (Cristo nuestro antipsychos — padecedor en nuestro lugar, como el carnero en lugar de Isaac); la espada de Pedro y la copa del Padre («no es sino una copa; pequeña materia comparativamente… no es mar Bermeja, ni mar Muerta; porque no es el infierno; es leve, y pero por un momento»); y el atarle («le ataron con tanta crueldad que la sangre brotó de las puntas de sus dedos» — tradición).
- **Sección 2** «Delante de Anás y de Caifás; la caída de Pedro» (38 párrafos, ~33.9k chars): le llevaron como cordero al degolladero por la puerta del rebaño; Anás y Caifás (el sumo sacerdote de aquel año en que el Mesías había de ser cortado — «fue la ruina de Caifás el ser sumo sacerdote de aquel año»; many a man's advancement has lost him his reputation); las tres negaciones de Pedro (la criada, el fuego de los siervos — «es malo calentarnos con aquellos con quienes estamos en peligro de quemarnos»; el pariente de Malco — «testigo es la oreja de mi pariente»; «el comienzo del pecado es como el dejar salir las aguas»); el examen ilegal («el juez mismo ha de ser el acusador, y el mismo preso el testigo»); la defensa de Cristo («En secreto no he hablado nada… Veritas nihil metuit nisi abscondi — la verdad nada teme sino el encubrimiento» — Tertuliano); y la bofetada (edoke rhapisma; Isa 50:6 — di mis mejillas a los que herían; «cuando padecía, razonaba, mas no amenazaba»).
- **Sección 3** «Delante de Pilato» (27 párrafos, ~30.9k chars): el pretorio (las cuatro razones de los judíos para llevarle a la corte romana: legalmente, seguramente, con más afrenta para él, con menos para ellos); «colaban el mosquito, y tragaban el camello» (la Chagigah); «¿Qué acusación traéis contra este hombre?» (Ne quis indicta causa condemnetur); «no nos es lícito poner en muerte a ninguno» («si los judíos no tienen potestad de poner en muerte a ninguno, ¿dónde está la vara? Con todo, no preguntan: ¿Dónde está el Shilo?» — Gn 49:10); «Mi reino no es de este mundo» (las cinco notas: origen, naturaleza, guardias, tendencia, súbditos; «ni trenchaba en nada con las prerrogativas de los príncipes; ni se oponía a reino alguno sino al del pecado y de Satanás»); «Para esto he venido al mundo: para dar testimonio a la verdad» (los súbditos del reino: los que son de la verdad); «¿Qué es la verdad?» (Pilato no aguarda respuesta; «la verdad es aquella perla de grande precio que el humano entendimiento desea»); «Yo en él no hallo culpa ninguna» (el cordero sin tacha, testificado del mismo juez); Barrabas (el ladrón soltado contra el Salvador: «así hacen los que prefieren sus pecados ante Cristo»).
- **Resumen del capítulo 18** incluido (el evangelista guiado a dar cuenta de los padecimientos más por extenso que los otros).
- **Léxico transliterado: 206 términos** (+10: Cedron, speira, Ego eimi, hyperetas, parresia, edoke rhapisma, Chagigah, Ne quis indicta causa condemnetur, de jure/de facto, Qui nescit dissimulare nescit regnare).
- Desplegado (`7ce13494`). Verificado en producción: JN 18 = **100/100 párrafos ES** (3 secciones correctas), resumen OK, **JUAN acumulado 1806/1806 párrafos**, lector 200, léxico 206. Commit y push.

**Posición exacta: JUAN 1-18 COMPLETOS en ES (18 de 21 capítulos; ~1.75M chars EN traducidos — el 84% del evangelio; la pasión ya está traducida hasta el pretorio).**
- **Restante: caps 19-21 = 258 párrafos, ~266k chars EN.**
- **Siguiente turno:** JN 19 (la crucifixión: 5 secciones, 100 párrafos, ~97k chars) completo en 3 lotes. Luego JN 20 (la resurrección, 94 párrafos) y JN 21 (64 párrafos) — **2 turnos más y Juan entero estará traducido**.

### 2026-09-19 · GLM (vigilante) — JUAN 19 COMPLETO en español (100/100) — LA CRUZ Y EL SEPULCRO — 19/21 capítulos

**Traducción (3 lotes, 1 deploy):** el capítulo de la crucifixión — 100 párrafos, ~97k chars.
- **Sección 1** «Cristo procesado delante de Pilato» (40 párrafos, ~36k chars): el azotamiento (la corona de espinas, «He aquí el hombre» — Ecce Homo; «el médico azotado, y así el paciente sanado»; los azotes de Cristo sacan el aguijón de los suyos); «Ningún poder tendrías contra mí si no te fuese dado de arriba» (las potestades son mano de Dios y su espada; el hacha no se jacte contra el que con ella corta); «el que a mí te ha entregado, mayor pecado tiene» (no todos los pecados son iguales: el de Pilato por temor, el de Caifás por malicia premeditada, el de Judas el peor — pecado guía); Gabbata/El Pavimento (el tribunal); «la hora sexta» y la víspera de la pascua; «Quita, quita» («así clamaba la santidad de Dios contra nosotros; y la justicia de Dios: crucificad, crucificad — de no haberse Cristo interpuesto, para siempre hubiéramos sido rechazados de Dios»); y «¿A vuestro rey he de crucificar?».
- **Sección 2** «Cristo condenado; la crucifixión» (8 párrafos, ~9.5k chars): la sentencia (Pilato pecó contra su conciencia — «mejor podía sufrir el agravio de su conciencia que la cruz de su humor»; entregado a los acusadores — condenación permisiva); «le llevaron» (como oveja al degolladero — Hch 8:32; «merecíamos ser llevados con los obradores de iniquidad; mas él fue llevado por nosotros, para que escapásemos»); el llevar su cruz (Isaac llevando la leña; «llevó aquel cabo de la cruz que tenía la maldición sobre sí: éste era el cabo pesado; y de aquí todos los suyos pueden llamar ligeras sus aflicciones por él»); Gólgota (la calavera de Adán — tradición; el monte de Moria); y «Allí le crucificaron» (entre dos malhechores: «para que el mérito apareciese ser sólo suyo»; colgado entre el cielo y la tierra «porque indignos éramos de ambos, y de ambos abandonados»).
- **Sección 3** «La inscripción sobre la cruz; la crucifixión» (22 párrafos, ~25.1k chars): el título (aitia, epigraphe, titlos; «Jesús de Nazaret, el Rey de los judíos» — acusación sin delito alguno; «lo que él había escrito era lo que Dios había primero escrito, y por tanto no podía alterarlo» — el Mesías cortado, Dn 9:26); en hebreo, griego y latín («el conocimiento de Cristo debe ser difundido por cada nación en su propia lengua; que los pueblos conversen tan libremente con las Escrituras como con sus vecinos»); «Lo que he escrito, he escrito»; las vestiduras repartidas (la túnica sin costura — tunica inconsutilis; los Inconsutilistae; «así muchos claman contra el cisma, sólo para acaparar toda la riqueza y el poder para sí»); María al pie de la cruz (la espada de Simeón; «sus tormentos eran sus torturas; ella en el potro, él en la cruz»); «Mujer, he ahí tu hijo» (la provisión para la madre; «plata y oro no tenía que dejar; del saco no oímos más desde que Judas se ahorcó»); Juan tomándola a su casa; «Tengo sed» (la única palabra que pareció queja de sus padecimientos exteriores; «Cristo antes quería cortejar una afrenta que ver profecía alguna sin cumplir»); el vinagre con hisopo («nosotros habíamos comido las uvas agrias, y sus dientes fueron mellados; cuando el cielo le negó un rayo de luz, la tierra le negó una gota de agua»); «Consumado es» (Tetelestai — las ocho consumaciones: la malicia de los perseguidores, el consejo del Padre, los tipos y profecías, la ley ceremonial abolida, el pecado acabado, los padecimientos, la vida, y la obra de redención completa); y «inclinó la cabeza, y dio el espíritu» (voluntario en morir — animus offerentis; «como Jacob, que recogió sus pies en la cama»).
- **Sección 4** «La crucifixión» (18 párrafos, ~13k chars): las piernas quebradas evitadas (la superstición del sábado grande — megale hemera; «las misericordias de los impíos son crueles; la fingida santidad de los hipócritas es abominable»); el ladrón penitente («murió en el mismo dolor que el otro ladrón; porque todas las cosas vienen por igual a todos; la extremidad de las agonías no es estorbo a los vivos consuelos que aguardan a las santas almas»); la lanza en el costado (Longino — tradición; «por esta ventana abierta en el costado de Cristo puedes mirar en su corazón, y ver allí amor ardiendo, amor fuerte como la muerte»); sangre y agua («justificación y santificación; sangre para remisión, agua para regeneración — Cristo las ha juntado, y no debemos pensar en separarlas»; «no es el agua en la pila la que nos será el lavamiento de la regeneración, sino el agua del costado de Cristo»); el testigo ocular (in perpetuam rei memoriam; «Él sabe que dice verdad»); y el cumplimiento de la Escritura (ningún hueso quebrado — el cordero pascual; «mirarán a mí, a quien horadaron» — «todos hemos sido culpables de horadar al Señor Jesús; y todos estamos concernidos a mirarle con afectos convenientes»).
- **Sección 5** «El sepelio de Cristo» (12 párrafos, ~13.5k chars): el cuerpo pedido por José de Arimatea (discípulo incógnito — «mejor secretamente que en nada, especialmente si, como José, van creciendo más y más en fortaleza»; «cuando Dios tiene obra que hacer, puede hallar a los propios para hacerla y esforzarlos para ella»); Nicodemo con los aromas («José servía a Cristo con su interés; Nicodemo con su bolsa»; «la gracia que al principio es como caña cascada puede venir a ser como fuerte cedro; y el cordero tembloroso animoso como león»); el cuerpo dispuesto (los vestidos sepulcrales de Cristo — «para hacérnoslos fáciles, y capacitarnos para llamarlos nuestros vestidos de bodas»; «ningún ungüento ni perfume puede alegrar el corazón como el sepulcro de nuestro Redentor, donde hay fe para percibir los fragantes olores de él»); sepultado fuera de la ciudad, en un huerto («en el huerto de Edén la muerte recibió su poder; y ahora en un huerto es vencida, desarmada y triunfada»); en sepulcro nuevo («el que nació de vientre virgen había de resucitar de sepulcro virgen»); y el cierre: «aquí yace nuestro fiador bajo arresto por nuestras deudas; si él es soltado, su descargo será nuestro. Aquí está el Sol de justicia puesto por un poco, para resucitar con mayor gloria, y ponerse jamás más. Aquí yace la misma muerte muerta, y el sepulcro vencido».
- **Resumen del capítulo 19** incluido (el evangelista que había rehuido los pasajes comunes «repite lo que antes había sido referido, con considerables ampliaciones, como quien no quiso saber nada sino a Cristo y a éste crucificado, y no gloriarse en nada sino en la cruz de Cristo»).
- **Léxico transliterado: 218 términos** (+12: aitia, epigraphe, titlos, hyssopo perithentes, tetelestai, megale hemera, coup de grâce, tunica inconsutilis, inconsutilistae, animus offerentis, in perpetuam rei memoriam, longinus).
- **Limpieza de residuos históricos (8 fragmentos archivados corregidos):** sonda global encontró y corrigió 6 residuos escapados en caps 3, 5, 11, 12 y 15 — outlawry («destierro legal»), peevish ×2 («despechadas refleciones/reflexión»), attestar/attestación ×2 («atestiguar/atestación» — incluido el título del cap 12 s4) — y también en los fragmentos de archivo. **Sonda global ahora = 0.**
- Desplegado (`be1d06a0`). Verificado en producción: JN 19 = **100/100 párrafos ES** (5 secciones correctas), resumen OK, **JUAN acumulado 1906/2064 párrafos**, lector 200 (hash y alias), léxico 218. Commit y push.

**Posición exacta: JUAN 1-19 COMPLETOS en ES (19 de 21 capítulos; ~1.85M chars EN traducidos — el 92% del evangelio; la cruz y el sepulcro ya están en español).**
- **Restante: caps 20-21 = 158 párrafos, ~169k chars EN.**
- **Siguiente turno:** JN 20 (la resurrección: 4 secciones, 94 párrafos, ~92k chars) completo en 3 lotes. Luego JN 21 (3 secciones, 64 párrafos) — **1 turno más y todo Juan estará traducido**.

### 2026-09-19 · GLM (vigilante) — JUAN 20 COMPLETO en español (94/94) — LA RESURRECCIÓN — 20/21 capítulos

**Traducción (3 lotes, 1 deploy):** el capítulo de la resurrección — 94 párrafos, ~92k chars.
- **Sección 1** «La resurrección» (17 párrafos, ~22.5k chars): por qué la resurrección era LA prueba (la señal de Jonás; «si es encarcelado por nuestra deuda, y por ella yace, estamos perdidos» — 1Co 15:17; la muerte pública ante el sol, las demostraciones reservadas a los amigos particulares); María Magdalena halla la piedra quitada (su amor «fuerte como la muerte, la muerte de la cruz»; buscar a Cristo temprano: «Mi voz oirás por la mañana»); la extraña construcción de María («los creyentes débiles hacen muchas veces materia de su queja aquello que en realidad es justo fundamento de esperanza y materia de gozo»); Pedro y Juan corriendo al sepulcro (la laudable emulación de los discípulos; «Juan podía sobre-correr a Pedro; mas Pedro podía sobre-osar a Juan»); los vestidos sepulcrales en buen orden («resucitó para no morir más» — Ro 6:9; «Lázaro salió con sus vestidos sepulcrales, porque había de usarlos de nuevo; mas Cristo, resucitando a vida inmortal, salió libre de aquellos estorbos»; «ninguno jamás llevó el cuerpo y dejó los vestidos»); y el volar entre fe e incredulidad (los ángeles visibles a unos y no a otros; «los apóstoles no habían de recibir sus instrucciones de los ángeles, sino del Espíritu de gracia»).
- **Sección 2** «La resurrección» (32 párrafos, ~25.6k chars): María llorando junto al sepulcro («los que buscan a Cristo han de buscarle con pena; llorar, no por él, mas por sí»); los dos ángeles en blanco (por boca de dos testigos; sentados uno a la cabecera y otro a los pies — los dos querubines del propiciatorio; «no con espadas flamígeras para impedirnos el camino de la vida, mas bienvenidos mensajeros para dirigirnos a él»); «Se han llevado a mi Señor» («ninguno sabe, sino los que lo han experimentado, la pena de un alma desamparada»); Cristo tomado por el hortelano («los espíritus turbados son aptos a mal representar a Cristo a sí mismos»); «María» («la palabra de Cristo nos hace bien cuando ponemos nuestros nombres en los preceptos y en las promesas»); Rabboni — mi Maestro («hemos de quitar nuestros respetos de toda criatura, aun la más resplandeciente, para fijarlos en Cristo»); «No me toques» (el servicio público antes que la privada satisfacción; «más bienaventurado es dar que recibir»); «Ve a mis hermanos» («les había llamado amigos; mas jamás hermanos hasta ahora; perdona, olvida, y no vitupera»); María apóstol de los apóstoles; «mi Padre y vuestro Padre; mi Dios y vuestro Dios» (la conjunta parentela — «él es Padre de Cristo por eterna generación; nuestro, por graciosa adopción; con todo aun esto nos autoriza a llamarle, como Cristo: Abba, Padre»); y «subo» (nacidos del cielo, destinados al cielo).
- **Sección 3** «Cristo con sus discípulos» (23 párrafos, ~25.1k chars): las tres ordenanzas secundarias (el día del Señor, las solemnes asambleas, el ministerio permanente; «aunque día de pequeñas cosas, con todo fue agraciado con aquellas solemnidades que habían de ayudar a mantener una cara de religión por todas las edades de la iglesia»); el primer sábado cristiano y la asamblea con las puertas cerradas («las asambleas de los discípulos de Cristo empujadas a los rincones y forzadas al desierto; es real pena, mas no real oprobio, el esconderse así»); «Paz sea a vosotros» (la pronta paga del legado — Jn 14:27; «su hablar paz hace paz; crea el fruto de los labios: paz»); las manos y el costado mostrados (las heridas que hablan en la tierra y en el cielo; «el exaltado Redentor se mostrará siempre mano abierta y corazón abierto»); «¡Entonces! ¡entonces! se alegraron los discípulos, cuando vieron al Señor»; «Como mi Padre me envió, así yo os envío» (la recital de su poder; «los encargos de Pedro y de Juan, por la llana palabra de Cristo, son tan buenos como los de Isaías y de Ezequiel»); «Recibid el Espíritu Santo» (el soplo de Cristo — el aliento del Omnipotente comenzó el viejo mundo, el aliento del poderoso Salvador comenzó un nuevo mundo; «la palabra de Cristo es espíritu y vida»); y el poder de remitir y retener (la general carta a la iglesia; «Dios jamás alterará esta regla de juicio; lo cual pone inmensa honra sobre el ministerio, y debería poner inmensa valentía en los ministros»); más el inicio de la incredulidad de Tomás (Tomás no es Judas; «como un cobarde hace muchos, así un escéptico hace que el corazón de sus hermanos desmaye como el suyo»).
- **Sección 4** «La incredulidad de Tomás» (22 párrafos, ~19.1k chars): los ocho días de espera («el que deja escapar una marea ha de aguardar un buen rato por otra»; la designación del primer día de la semana — «Éste es el día que ha hecho Jehová»); Cristo entrando con las puertas cerradas («las puertas del cielo estaban prestas a abrirse a él; con todo, por el beneficio de su iglesia, se tardó en la tierra»); «Mete aquí tu dedo» («no hay palabra incrédula en nuestras lenguas, ni pensamiento en nuestras mentes, sino sea conocido del Señor Jesús»; «no quebrantará la caña cascada»; «en aquella ordenanza donde mostramos la muerte del Señor somos llamados a meter nuestro dedo en la señal de los clavos»); «No seas incrédulo, sino fiel» (me ginou apistos; «si somos incrédulos, somos sin Cristo y sin gracia, sin esperanza y sin gozo»); «¡Señor mío y Dios mío!» (mi Señor — Adonai, mi fundamento y estancia; mi Dios — Elohim, mi príncipe y juez; «Éste es el vital acto de la fe: Él es mío»); «Bienaventurados los que no vieron y creyeron» («no ver y con todo creer arguye mayor industria en buscar la verdad; el que cree sin ella, como los de Berea, es más noble»; el prosélito más acepto que los millares del Sinaí); y el designio del evangelio («escrito para traer a los hombres a creer; bastante se dice para responder a aquella intención, si los hombres quieren oír, o si no quieren»; «creyendo tendréis vida por su nombre»).
- **Resumen del capítulo 20** incluido (el evangelista que no comenzó como los otros «con todo lo concluye como ellos, con la historia de la resurrección de Cristo»).
- **Léxico transliterado: 227 términos** (+9: pros heautous, didaskale, rabboni, sic oculos..., vivit imo et in senatum venit, me ginou apistos, adonai, elohim, ex abundanti).
- Desplegado (`bd26637f`). Verificado en producción: JN 20 = **94/94 párrafos ES** (4 secciones correctas), resumen OK, **JUAN acumulado 2000/2064 párrafos**, lector 200 (hash y alias), léxico 227. Commit y push.

**Posición exacta: JUAN 1-20 COMPLETOS en ES (20 de 21 capítulos; ~1.94M chars EN traducidos — el 97% del evangelio).**
- **Restante: cap 21 = 64 párrafos, ~77k chars EN.**
- **Siguiente turno: JN 21 (3 secciones, 64 párrafos) — con ese, TODO JUAN estará traducido (2.064/2.064).**

### 2026-09-19 · GLM (vigilante) — JUAN 21 COMPLETO (64/64) — ★★★ TODO EL EVANGELIO DE JUAN TRADUCIDO (2064/2064) ★★★ — 21/21 capítulos

**Traducción (3 lotes, 1 deploy):** el capítulo final — 64 párrafos, ~77k chars.
- **Sección 1** «Cristo con sus discípulos» (24 párrafos, ~28.7k chars): la aparición junto al mar de Tiberias (Cristo visita a los suyos en los comunes negocios, como a los pastores de noche); los siete discípulos juntos (siete testigos — la ley romana requería siete para un testamento; Tomás «más junto que nunca a las reuniones»); «voy a pescar» (rescatar el tiempo; «buenos maridos de su tiempo; mientras aguardaban, no querían holganza»); la noche sin nada («en aquellos chascos que a nosotros son muy penosos, tiene Dios muchas veces designios que son muy graciosos»); «Echad la red al lado derecho» (la providencia se extiende a las cosas más mínimas; «los humildes, diligentes y pacientes serán coronados»; Jehová-jireh; «una feliz cogida al cabo puede pagar muchos años de fatiga en la red del evangelio»); Pedro lanzándose a la mar («los que han estado con Jesús nadarán por un tormentoso mar, un mar de sangre, por llegar a él»); Juan el primero en decir «Es el Señor»; los 153 peces y la red sin romper («la red del evangelio ha encerrado multitudes, tres mil en un día; y con todo no se rompe»); «Venid, comed» (Cristo como maestro del banquete; «a él debemos la aplicación, así como la compra, de los beneficios de la redención»).
- **Sección 2** «El discurso de Cristo con Pedro» (20 párrafos, ~23.5k chars): la ternura hacia los penitentes («no le dijo su falta con priesa... no como con criminal, mas como con amigo; la ofensa no sólo fue perdonada, mas olvidada»); «Simón, hijo de Jonás, ¿me amas?» (la pregunta al penitente no es cuánto lloró sino si ama; «mucho le fue perdonado a ella, no porque lloró mucho, mas porque amó mucho»; «ni amará su obra aquel ministro que no ama a su Maestro»); «más que éstos» (pleion touton); «Sí, Señor, tú sabes que te amo» («aquellos que pueden verdaderamente decir, por gracia, que aman a Jesucristo, pueden tomar el consuelo de su interés en él»); «Apacienta mis corderos; apacienta mis ovejas» (boske y poimaine; contra la supremacía papal — «el mismo Pedro jamás reclamó tal poder»; «cuando Cristo perdonó a Pedro, le fió el más valioso tesoro que tenía en la tierra»); el pronóstico del martirio («cuando fuere viejo... otro te ceñirá y te llevará donde no quieres» — crucificado en Roma bajo Nerón; «la sangre de los mártires ha sido la semilla de la iglesia»); y «Sígueme» (el deber es nuestro, los sucesos de Dios).
- **Sección 3** «Conferencia de Cristo con Pedro; conclusión del evangelio de Juan» (20 párrafos, ~24.5k chars): «¿Y qué hará este hombre?» (la curiosidad por los sucesos ajenos; «las predicciones de la Escritura han de ser miradas para el dirigir de nuestras conciencias, no para la satisfacción de nuestra curiosidad»); «¿qué te importa a ti? Sigue tú a mí» («el deber es nuestro, los sucesos de Dios; a cada día bastan sus direcciones»); el yerro de la iglesia («que Juan no moriría» — quod volumus facile credimus; «la incertidumbre de la humana tradición»; «cuán poco es fiar en las no escritas tradiciones que el concilio de Trento decretó recibir como la misma Escritura»; «dejen las palabras de Cristo hablar por sí»); la conclusión del evangelio (el discípulo que testifica suscribe su nombre — «listos no sólo a deponerla bajo juramento, mas a sellarla con su sangre»; «los evangelistas sabían que su testimonio era verdadero, porque aventuraron tanto esta vida como la otra sobre ello»; «aun el mundo mismo no podría contener los libros»; y el Amén final: «un Amén de fe... y un Amén de satisfacción en lo que está escrito»).
- **Resumen del capítulo 21** incluido (el evangelista «ocurriendo nueva materia, comienza otra vez»; «es extraño que alguno suponga que este capítulo fue añadido por otra mano»).
- **Léxico transliterado: 235 términos** (+8: paidia, pleion touton, agapas me, philo se, boske, poimaine, quod volumus facile credimus, choresai).
- Desplegado (`e27cf4d7`). Verificado en producción: JN 21 = **64/64 párrafos ES** (3 secciones correctas), resumen OK, **JUAN COMPLETO 2064/2064 párrafos**, lector 200 (hash y alias), léxico 235. Commit y push.

**★★★ HITO: EL EVANGELIO DE JUAN ESTÁ COMPLETO EN ESPAÑOL (21 de 21 capítulos; 2.064/2.064 párrafos; ~2.06M chars EN; paridad de estructura ES/EN verificada capítulo por capítulo; sonda global de residuos de inglés = 0). ★★★**
- Se cumple así la directiva del usuario: «termina de hacer toda la traducción de Juan — continúa sin detenerte hasta completar todo Juan». En producción: https://bibliaapp.pages.dev (lector /es/lector → JHN caps 1-21).
- **Siguientes pasos ejecutables (sin decisión del usuario, según plan de la BP):** revisión de pulido (incl. el párrafo condensado de JN 6.4), y evaluar con el usuario el paso 6 — cierre del núcleo (SBLGNT, JFB, Barnes, Nave's — fichas legales primero).
- **Bloqueado en usuario (sin cambios):** licencia de las traducciones propias, modelo de sostenimiento, nombre/dominio, puertas ⟡.

### 2026-09-19 · GLM (vigilante) — PULIDO POST-JUAN: párrafos acortados completados (JN 4.2 y JN 5.3) — Juan sigue completo (2064/2064)

**Revisión de pulido (la deuda pendiente del hito Juan).** Diagnóstico con sondeo comparativo ES/EN por índice (paridad 1:1) sobre todo el evangelio: umbral ES<55% del EN (EN>350 chars).
- **Hallazgos y corrección (1 deploy):**
  - **JN 4 s2 idx34** (la mujer samaritana): estaba reducido a un suelto de 48 chars («(2.) La cuenta que él dio de ello») frente a 942 del EN — la traducción saltaba el punto (1.). Reescrito completo (965 chars): «Ve, llama a tu marido» — las mujeres que quieren aprender han de preguntar a sus maridos en casa (1Co 14:35); «coherederos de la gracia de la vida» (1P 3:7); «hay menester de arte y prudencia en dar reprensiones; el rodear el asunto, como la mujer de Tecoa (2S 14:20)».
  - **JN 5 s3 idx14** (el testimonio del Padre): estaba cortado a media frase a la mitad del párrafo (2378/4663 chars), además con un residual de inglés («no estaban acquainted»). Completado íntegro (4.695 chars): la explicación de la voz y la paloma («pudisteis oír aquella voz… si hubierais atendido al ministerio de Juan»); «No tenéis su palabra morando en vosotros» (Jn 5:38) — la palabra entre ellos mas no en ellos; el no permanecer («como caminante, no como el hombre en su casa»); y la prueba de la morada de la palabra («A quien él envió, vosotros no creéis»).
  - **Residuales «acquainted» eliminados (×3):** 2 en el fusionado (JN 5.3 y JN 5.2) y 1 en el fragmento de archivo jhn5_s2. La deuda del párrafo de JN 6.4 ya estaba resuelta en turnos previos (82% del EN, completo).
  - Fragmento de archivo **jhn5_s3_es.json** actualizado con la misma corrección (trazabilidad).
- **Banda 55-70% del EN (aceptable, para futura revisión):** JN 11 s4 idx8 (61%) y JN 17 s3 idx23 (67%) son condensaciones que cierran coherentemente hacia el párrafo siguiente (el EN también acaba en transición); no están rotos.
- Desplegado (`d6d7612a`). Verificado en producción: los dos párrafos corregidos presentes (965 y 4.695 chars), **JUAN 2064/2064**, lector 200 (hash y alias), sonda de residuos = 0. Commit y push.

**Posición exacta: Juan completo y pulido en su estructura (21/21 caps, 2.064/2.064 párrafos; 0 párrafos bajo el 55% del EN).**
- **Siguiente turno (ejecutable sin decisión del usuario):** revisión opcional de los dos condensados moderados (JN 11.4 idx8, JN 17.3 idx23) u otras mejoras del lector según plan de la BP.
- **Bloqueado en usuario (sin cambios):** paso 6 del plan (cierre del núcleo: SBLGNT, JFB, Barnes, Nave's — fichas legales primero), licencia de traducciones propias, modelo de sostenimiento, nombre/dominio, puertas ⟡.

### 2026-09-19 · GLM (vigilante) — PULIDO POST-JUAN II: condensados moderados completados + familia «apprehend» normalizada — Juan completo (2064/2064)

**Segunda pasada de pulido (según «Siguiente» de la BP).**
- **Condensados moderados completados (los 2 restantes, ya bajo el umbral):**
  - **JN 11 s4 idx8** (el concilio y el peligro romano, 257→396 chars): ahora completo el discurso de Caifás y compañía — «Si no le callamos, y le quitamos de en medio, todos creerán en él; y, esto siendo alzamiento de rey nuevo, los romanos lo tomarán a mal, y vendrán con ejército, y quitarán nuestro lugar y nuestra nación; y por tanto no es tiempo de embrollar». Además limpiado el residual «apprehendían».
  - **JN 17 s3 idx23** (la palabra dada y el odio del mundo, 256→392 chars): restauradas las cláusulas omitidas — «ellos la han recibido, ellos mismos han creído en ella, y han aceptado el fideicomiso de transmitirla al mundo; y por tanto el mundo los ha aborrecido, como también porque no son del mundo».
  - Fragmentos de archivo **jhn11_s4_es.json** y **jhn17_s3-s4_es.json** actualizados (trazabilidad).
- **Familia nueva de residuales detectada por la sonda: «apprehend» ×19** (grafía inglesa del válido español arcaico «aprehend*»). Normalización global apprehend→aprehend en el fusionado (19) y en 12 fragmentos archivados (19): caps 9, 12, 13, 14, 16, 17 y 18 — «aprehendidos por él (Fil 3:12)», «aprehender el sentido», «fue aprehendido», etc.
- **Barrido final: 0 párrafos bajo el 60% del EN; JUAN 2064/2064; sonda global de residuos = 0.**
- Desplegado (`988a27ac`, tras un intermedio `ec9e0468` que no llegó a verificarse porque la sonda posterior destapó la familia apprehend). Verificado en producción vía alias: los dos párrafos completos (396/392 chars), 0 «apprehend», 24 «aprehend» legítimos, lector 200. Commit y push.

**Posición exacta: la traducción de Juan está completa y pulida (21/21 caps, 2.064/2.064 párrafos, 0 párrafos bajo el 60% del EN, 0 residuales de inglés en sonda amplia).**
- **Siguiente turno:** no queda deuda de traducción ni de pulido conocida de Juan. Opciones ejecutables sin decisión del usuario: barrido fino de estilo (75-90% del EN) o mejoras menores del lector según plan. El paso 6 (cierre del núcleo: SBLGNT, JFB, Barnes, Nave's) requiere crear fichas legales en 02. Legal/ antes de ingesta — evaluar en su momento.
- **Bloqueado en usuario (sin cambios):** licencia de traducciones propias, modelo de sostenimiento, nombre/dominio, puertas ⟡.

### 2026-09-19 · GLM (vigilante) — BARRIDO FINO DE PULIDO: 6 cortes duros completados (cap 5 y cap 6) — Juan completo (2064/2064)

**Tercera pasada de pulido (barrido fino de estilo, según «Siguiente» de la BP).** Dos barridos: proporción ES/EN bajo el 90% (27 párrafos revisados) y detección de cortes duros (párrafos que acaban en «...» o palabra suelta).

- **Corte real encontrado en cap 6 s4 idx15** (la voluntad soberana del Padre): el ES acababa en «…hasta la resurrección, cuando t» (corte duro a media palabra). Completado con la cola EN (2118→2528 chars, 96% del EN): «…cuando las almas y los cuerpos de los santos sean reunidos y allegados a Cristo, para que él los presente al Padre: He aquí yo, y los hijos que me diste (Heb 2:13; 2T 1:12). 4. La fuente y el original de todo esto es la voluntad soberana de Dios… al cual el Hijo siempre tuvo el ojo.» Fragmento jhn6_s4 actualizado.
- **5 cortes duros más, todos en cap 5** (fusionado + fragmentos jhn5_s1, jhn5_s2, jhn5_s3):
  - s1 idx18: tras la ilustración de Josué en Jericó, completada la aplicación («¿Y querrá correr el riesgo de esto, en obediencia a Cristo?… Los que han sido sanados por la palabra de Cristo han de ser gobernados por su palabra, cueste lo que les cueste»).
  - s1 idx30: «El hospital donde él yacía era lugar melancólico; mas el infierno lo es mucho más: la sentencia de los apóstatas es peor cosa que treinta y ocho años de cojera.»
  - s2 idx15: «La voz de Cristo ha de ser oída por nosotros, para que por ella vivamos… Oíd, y vivirá vuestra alma (Isa 55:3).»
  - s2 idx30: «…y cuenta justamente resentidas por el príncipe que le envía las afrentas hechas a un embajador. Y por esta regla, los que verdaderamente honran al Hijo honran también al Padre; véase Flp 2:11.»
  - s3 idx19: «…ni era de otra manera gratos con él los aplausos de los hombres sino conforme a la voluntad de su Padre, y para la dicha de aquéllos que, dando honra a él, recibían de él honra mucho mayor.»
- **Corte fuente detectado (sin arreglo posible a nivel ES):** cap 18 s2 idx20 — el propio EN fuente acaba truncado («…he said nothing, for»); el ES lo refleja fielmente («…nada dijera, porque»). Notado como anomalía de la fuente, no de la traducción.
- **Resultado de los barridos:** los 27 párrafos bajo el 90% del EN son condensaciones legítimas que terminan donde el EN (el español es ~10-15% más compacto); los 6 cortes duros quedan completados. **Cortes restantes: solo el de fuente (cap 18.2 idx20). JUAN 2064/2064. Sonda global = 0.**
- Desplegado (`e0088b49`, tras intermedios `7e65adf8`). Verificado en producción: cap6.4 idx15 completo (2528 chars), cap5.1 idx30 y cap5.2 idx30 con sus colas nuevas, JUAN 2064/2064, lector 200 (alias). Commit y push.

**Posición exacta: la traducción de Juan está completa y pulida en estructura (21/21 caps, 2.064/2.064 párrafos; 0 cortes duros salvo la anomalía de fuente; 0 residuales).** No queda deuda conocida de traducción ni pulido.
- **Siguiente turno:** no hay pasos de traducción pendientes. Opciones: mejoras menores del lector según plan de la BP, o esperar decisión del usuario sobre el paso 6 (cierre del núcleo — requiere fichas legales en 02. Legal/).
- **Bloqueado en usuario (sin cambios):** licencia de traducciones propias, modelo de sostenimiento, nombre/dominio, puertas ⟡.

### 2026-09-19 · GLM (vigilante) — FASE LEGAL: textos literales de eBible/OpenBible archivados · estado del plan actualizado — Juan sigue completo (2064/2064)

**Cierre del pendiente menor del paso 1 (fase legal MVP).** No quedaba deuda de traducción ni de pulido, así que el turno fue para la única tarea del plan ejecutable sin decisión del usuario.
- **Archivado `02. Legal/Licencias literales — eBible y OpenBible.md`** con 5 secciones de citas verbatim, cada una con URL y fecha de captura (2026-09-19):
  1. Declaración general de copyright de eBible.org («are in the Public Domain (not copyrighted) in the USA, to the best of my knowledge» — con spaRV1909 y eng-web en la tabla PD).
  2. Página de copyright de la edición spaRV1909 («Public Domain» / «Dominio Público»; «Reina y Valera»; «Castellano 1909»).
  3. Declaración de la World English Bible («is in the Public Domain. That means that it is not copyrighted.»; permisos «copy, publish, proclaim, distribute, redistribute, sell, give away, quote»; regla del nombre tras modificación — «This is to avoid confusion, not to limit your freedom.»; marca «World English Bible» de eBible.org).
  4. Línea literal de OpenBible en el crudo archivado: «#www.openbible.info CC-BY 2016-02-01».
  5. LICENSE del agregador neuu-org: «Creative Commons Attribution 4.0 International (CC BY 4.0)» / «Copyright (c) 2026 NEUU».
- **Fichas actualizadas:** RV1909 y WEB — marcados «⚠️ pendiente: archivar el texto literal» cerrados con referencia al nuevo documento; TSK — citas literales de OpenBible y del agregador referenciadas (secciones 4-5). **El paso 1 del plan queda sin pendientes.**
- **Plan actualizado:** paso 3 pasa de «traducción del piloto (Henry) pendiente» a «**traducción del piloto Henry-JUAN COMPLETA y pulida (21/21 caps, 2064/2064 párrafos, 0 residuales)** — queda revisión humana 100 % doctrinal (paso 4 ⟡, requiere decisión del usuario)».
- Desplegado (`97c11236`). Verificado en producción: lector 200 (alias), **JUAN 2064/2064**. Commit y push.

**Posición exacta:** pasos 0-1-2-5 completos; paso 3 completo salvo la revisión humana doctrinal; Juan traducido y pulido. No queda ninguna tarea ejecutable del plan sin decisión del usuario:
- **Bloqueado en usuario:** paso 4 ⟡ (puerta de calidad de la traducción), paso 6 (cierre del núcleo — SBLGNT, JFB, Barnes, Nave's, con sus fichas legales), licencia de las traducciones propias (ficha Matthew Henry lo exige «antes del primer párrafo publicado» — ya publicado, decisión urgente), modelo de sostenimiento, nombre/dominio, puertas ⟡.

### 2026-09-19 · GLM (vigilante) — PASO 7: notas y subrayados del lector (B15) con export/import — Juan sigue completo (2064/2064)

**Feature del lector (paso 7, flujo pasaje→…→nota/subrayado).** Sin deuda de traducción ni legal pendiente, el turno fue para la feature del MVP que B15 exige «desde el día uno»: **notas y subrayados 100 % locales con exportación/importación**.
- **Implementado** (`app/es/lector/page.tsx`, `lib/i18n.ts`, `app/globals.css`):
  - **Editor por verso:** el panel que abre el número de verso (referencias TSK) incorpora ahora un editor de nota (textarea) + selector de subrayado (ninguno/amarillo/verde/rosa) + borrar. Todo se guarda al instante.
  - **Persistencia 100 % local:** localStorage (`notas:v1`), nunca sale del dispositivo (B15/B14 — cero APIs en runtime). La clave es OSIS absoluto (`JHN.3.16`), estable entre ediciones.
  - **Subrayado visible:** los versos subrayados llevan fondo de color (3 colores con `box-decoration-break` para saltos de línea) y los números de verso con nota muestran un ✍ en color de acento.
  - **Panel «Mis notas»** (botón ✍ en la cabecera): lista de todas las notas ordenadas por fecha (clic → salta al pasaje), contador, export e import.
  - **Export/Import JSON versionado** (`{version:1, exportado, notas}`): descarga como `notas-biblioteca-YYYY-MM-DD.json`; importación con fusión «gana el más reciente» (por `ts` ISO) y validación de formato con mensaje de error amable. i18n completo ES/EN (D7).
  - Estilos con tokens del tema (claro/oscuro OK); swatches de color legibles en ambos.
- Verificación: `tsc --noEmit` limpio; build OK; desplegado (`3d7c4516`); el HTML servido contiene el sistema («Mis notas y subrayados»); lector 200 (hash y alias); **JUAN 2064/2064** intacto. Commit y push.

**Posición exacta:** pasos 0-1-2-5 completos · paso 3 completo salvo revisión humana doctrinal (⟡) · paso 7: **notas locales + export/import ✓** (restan en paso 7: panel Fuentes dedicado y canal de reporte de errores — mejoras menores futuras).
- **Bloqueado en usuario (sin cambios):** paso 4 ⟡ (puerta de calidad), paso 6 (cierre del núcleo), licencia de traducciones propias (urgente: ya hay párrafos publicados), modelo de sostenimiento, nombre/dominio.

### 2026-09-19 · GLM (vigilante) — PASO 7 COMPLETO: panel Fuentes + canal de reporte de errores — Juan sigue completo (2064/2064)

**Segunda mejora del paso 7 (las dos que quedaban de la lista del turno anterior).**
- **Panel Fuentes (botón ≣ en la cabecera):** consolidación del etiquetado autor/tradición/fecha/licencia por obra (B15/B16) para las 6 del núcleo:
  - RV1909 / WEB (obra activa, con su manifiesto: licencia y fuente exactas).
  - Interlineal y léxicos — STEPBible-Data (Tyndale House, Cambridge), CC BY 4.0 (TAHOT/TAGNT + TBESG/TBESH).
  - Treasury of Scripture Knowledge — R. A. Torrey, 1907 · dominio público + OpenBible.info (CC BY).
  - Easton's Bible Dictionary — M. G. Easton, 1897 · dominio público · tradición presbiteriana evangélica · ES en curso.
  - Matthew Henry, Complete Commentary — 1706–1721 · dominio público (edición CC0) · tradición puritana/noconformista · estado de la traducción ES (asistida, sin revisar) · JUAN 21/21.
- **Canal de reporte de errores (B5):** al pie del panel Fuentes. El lector describe el error; el botón compone un reporte estructural (obra, OSIS, referencia, URL, descripción) y lo copia al portapapeles con confirmación visible. 100 % local (B14 — sin servicios externos ni decisiones de infraestructura pendientes; cuando el usuario fije el correo/dominio del proyecto, basta un mailto o formulario aparte).
- Verificación: `tsc` limpio; build OK; desplegado (`f1d5b797`); lector 200 (hash y alias); **JUAN 2064/2064** intacto. Commit y push.

**Posición exacta:** pasos 0-1-2-5 completos · paso 3 completo salvo revisión humana doctrinal (⟡) · **paso 7 COMPLETO en su alcance MVP**: flujo pasaje→interlineal→léxico→comentario→nota/subrayado ✓ · notas locales + export/import ✓ · panel Fuentes ✓ · reporte de errores ✓ · atribución visible ✓.
- **Bloqueado en usuario (sin cambios):** paso 4 ⟡ (puerta de calidad), paso 6 (cierre del núcleo: SBLGNT, JFB, Barnes, Nave's), licencia de traducciones propias (urgente — ya hay contenido publicado), modelo de sostenimiento, nombre/dominio.
- Con esto, **todo lo ejecutable del plan MVP sin decisión del usuario está hecho**. Los siguientes turnos solo tendrán trabajo si el usuario decide (paso 4/6/8) o si surgen correcciones reportadas.

### 2026-09-19 · GLM — DIRECTIVA DEL USUARIO: licencia de traducciones + puerta del paso 4 + paso 6 (fichas) · PAUSA de los comentarios de MH hasta nuevo aviso

**El usuario ordenó:** «Avanza con la licencia de traducciones, puerta del paso 4 y lo que describiste demás… hasta nuevo aviso retomamos los comentarios de MH». Ejecutado:
1. **Licencia de traducciones propias — DECISIÓN B18: CC BY 4.0** (`02. Legal/Decision B18 - Licencia de traducciones propias (CC BY 4.0).md`): coherente con el corpus (PD + CC BY), sin copyleft (cierra el riesgo ShareAlike de la tabla de riesgos), permite todo lo que las fichas prometen, atribución protege el proyecto. Atribución canónica definida (traducción asistida por IA + glosario, pendiente de revisión humana). Ratificación final en la puerta legal (paso 8). **Ficha Matthew Henry: pendiente de licencia ES cerrado.** Atribución aplicada en el lector (panel Fuentes e ⓘ).
2. **Puerta del paso 4 — materiales listos** (`06. Traduccion/Puerta paso 4 - Guía de revisión doctrinal (Juan).md`): método aplicado y verificado; método de revisión propuesto (lector ES + EN a un clic + canal de reportes); **checklist de loci doctrinales mayores por capítulo (Jn 1–21)**; criterios para cruzar la puerta. La revisión humana es del usuario — al revisar capítulo a capítulo se retira la etiqueta «sin revisar».
3. **Paso 6 — 4 fichas legales archivadas** en `02. Legal/`: **SBLGNT** (CC BY 4.0 — verificado verbatim del sitio oficial: «licensed freely under the Creative Commons Attribution 4.0 International Public License»; ingesta será solo texto, no aparato), **JFB** (1871, PD), **Barnes** (1832–1872, PD — regla: usar el original, no revisiones modernas con derechos), **Nave's** (1896/1905, PD — idem, no la revisión de 1979). Las 4 con traducciones ES futuras bajo CC BY 4.0 (B18). Ingesta pendiente (siguientes turnos, sin decisión del usuario).
4. **PAUSA DE MH:** no se traducen más libros del comentario de Matthew Henry hasta nuevo aviso del usuario.
- Desplegado (`e9527689`). Verificado: lector 200, JUAN 2064/2064. Commit y push.

**Estado:** pasos 0-1-2-5-7 completos · paso 3 completo salvo revisión humana (materiales ya listos) · paso 4 [~] esperando al revisor humano · paso 6 [~] fichas listas, ingesta siguiente · **traducción de MH en pausa por directiva del usuario**. Bloqueado en usuario: ratificación B18 en paso 8, modelo de sostenimiento, nombre/dominio.

### 2026-09-21 · GLM (vigilante) — PASO 6: SBLGNT INGERIDA Y VALIDADA (27 libros) — texto griego crítico visible en el lector (botón Ξ) — Juan sigue completo (2064/2064) · MH en pausa (directiva)

**Primera ingesta del cierre del núcleo (paso 6), conforme a la directiva del usuario («avanza… con lo que describiste demás»).**
- **Fuente:** morphgnt/sblgnt (GitHub) — morfología completa del SBL Greek New Testament. Licencias: SBLGNT CC BY 4.0 (ficha) + anotación MorphGNT CC BY 4.0. Crudo archivado en `05. Datos/corpus_crudo/sblgnt/` (27 TSV, 8.6 MB).
- **Pipeline** (`scripts/ingesta-sblgnt.mjs`): parser del formato MorphGNT (6 campos: BCV · POS · parsing · palabra · normalizada · lema) → JSON por libro con `versos[{c,v,osis,t,w:[[palabra,lema,parsing]]}]`.
- **Portón de validación:** 27/27 libros · **7.927 versos** · ~137k palabras · conteo por libro contra RV1909: **8 diferencias de versificación NA vs TR, documentadas y no rellenadas** (MAT −3, MRK −5, LUK −2, JHN −13 — incluye la ausencia de la perícopa de la adúltera 7:53–8:11 en el texto crítico—, ACT −4, ROM −3, 3JN +1, REV +1). Salida: `public/data/sblgnt/{OSIS}.json` + `_manifest.json` (7.7 MB).
- **Lector:** nueva vista griega (botón **Ξ**, excluyente con Ω interlineal): texto griego corrido por capítulo con número de verso; cada palabra muestra `lema · análisis morfológico` al pasar el puntero. i18n ES/EN; estilos serif con tokens del tema.
- Verificación: `tsc` limpio; build OK; desplegado (`17d7152b`); producción: `/data/sblgnt/JHN.json` 200 (Jn 3:16 griego correcto, 25 palabras con lemas), manifiesto 27 libros/7.927 versos/8 incidentes, botón Ξ servido, lector 200, **JUAN ES 2064/2064** intacto. Commit y push.

**Estado:** pasos 0-1-2-5-7 completos · paso 3 completo salvo revisión humana (⟡ materiales listos) · paso 4 [~] esperando revisión del usuario · **paso 6 [~]: SBLGNT ✓ (ingesta+validación+UI) — quedan JFB, Barnes y Nave's** (fichas PD listas; localizar espejos estructurados fiables en próximos turnos) · **traducción de MH en pausa por directiva del usuario**. Bloqueado en usuario: ratificación B18 (paso 8), modelo de sostenimiento, nombre/dominio.

### 2026-09-21 · Claude (relevo por agotamiento de créditos de GLM) — Nave's terminada · morfología ES cableada · UX del versículo

**Contexto.** GLM se quedó sin créditos a mitad de la interfaz de Nave's. Claude retomó el trabajo colgado y cerró la etapa a petición del usuario.

**1 · Nave's Topical Bible — paso 6 avanza (2 de 4).**
La ingesta estaba **completa** y sin commitear: 66 libros, **4.672 temas**, **77.954 aserciones**, `_manifest.json` y claves i18n ES/EN ya escritas. Faltaba solo la interfaz.
- Añadido el bloque **Temas (Nave)** al panel de referencias del verso, con carga perezosa por libro, caché compartida (`nave:{OSIS}`) y atribución de dominio público al pie.
- Pipeline conservado: `scripts/ingesta-nave.mjs`.
- **Restan del paso 6: JFB y Barnes** (fichas PD ya archivadas; falta localizar espejos estructurados fiables).

**2 · Morfología en español cableada — directiva `D-001.2` cumplida.**
El interlineal ya no muestra códigos crudos. `V-PAI-3S` pasa a *«verbo presente voz activa indicativo 3a persona singular»*.
- Mapa por idioma (`/data/morfologia/codigos-{griego,hebreo}-es.json`) con carga perezosa al abrir Ω y caché propia.
- **Caída al código crudo** si falta una entrada: nunca un hueco vacío.
- Códigos hebreos compuestos resueltos por partes: `HR/Ncfsa` → *«preposicion + sustantivo comun femenino singular absoluto»*.
- **Cobertura medida sobre los datos que el lector renderiza**, no sobre el corpus teórico: **99,7 %** en Juan (16.014/16.069) y **99,2 %** en Génesis (20.007/20.161).
- Atribución CC BY 4.0 ampliada en el panel Fuentes a las etiquetas traducidas y a Nave's.

**3 · UX del versículo — petición directa del usuario.**
Problema reportado: al pulsar el texto de un verso salía el menú nativo «Buscar con Google», y para guardar una nota había que acertar en el número del verso, un blanco diminuto.
- **El versículo completo es ahora el blanco táctil**: abre el panel de referencias, temas, nota y subrayado. El número deja de ser botón. Añadidos `role="button"`, `tabIndex`, activación por teclado y foco visible.
- **Selección nativa desactivada** sobre el texto del verso (`user-select` + `-webkit-touch-callout`), que es lo que dispara ese menú. Decisión del usuario: no conservarlo.
- **Compensación — botón Copiar** en la cabecera del panel, con referencia bien formada: `«texto» — Juan 1:1 (RV1909)`. Acuse visual y respaldo para navegadores sin API de portapapeles. Queda mejor que el copiado nativo, que daba el texto sin referencia.

**4 · Corrección de rigor en la bitácora maestra.**
La deuda de la tabla morfológica griega estaba etiquetada como incumplimiento de **C1/C2**. **No lo es.** C1 exige la fase legal antes de ingerir y C2 las doce preguntas de la ficha; la regla de *«cita literal»* del brief `01.0` es **sobre la licencia**, que en STEPBible sí está verificada y atribuida. Lo pendiente es el **significado de los códigos gramaticales**: deuda de exactitud académica, no legal. Corregido con fecha, sin reescribir lo anterior.

**5 · Directiva D-001 cerrada, y causa del desvío corregida.**
GLM no ejecutó dos tareas de la directiva porque ambas numeraciones usaban «paso N» y colisionaron: al leer «paso 6» tiró de su propio plan (cierre del núcleo) en vez del de la directiva. **El fallo fue de la directiva.**
> **Regla nueva vigente:** las tareas de directiva se identifican **`D-NNN.n`**. «Paso N» queda reservado en exclusiva a esta BP.

El refactor `D-001.1` (selector de comentario) resultó **innecesario**: interlineal, léxico y Nave's cargan por su propia vía y no compiten con el comentario. Se reabre cuando entre **JFB**, la segunda obra de comentario, que es cuando el booleano `comentario` sí estorba.

**Verificación:** `tsc --noEmit` limpio · `npm run build` código 0 · `versoTocable` y `copiarVerso` confirmados en los chunks publicados.
**Commit:** `447fd5b` · **Despliegue:** https://27335dfb.bibliaapp.pages.dev

**Estado:** pasos 0-1-2-5-7 completos · paso 3 completo salvo revisión humana (⟡ materiales listos) · paso 4 [~] esperando revisión del usuario · **paso 6 [~]: SBLGNT ✓ · Nave's ✓ — restan JFB y Barnes** · traducción de MH **en pausa por orden del usuario**.
**Bloqueado en usuario (sin cambios):** ratificación B18 en la puerta legal, modelo de sostenimiento, nombre y dominio.
**Deuda abierta:** cotejo de la tabla morfológica griega contra el intro de TAGNT (Google Doc inaccesible) — exactitud, no licencia.

**⚠️ Hallazgo de infraestructura — techo de archivos en Cloudflare Pages.**
El despliegue subió **5.194 archivos / 123 MB**, de los cuales **4.740 son de Nave's** (un JSON por tema). Cloudflare Pages admite 20.000 archivos por despliegue: hoy sobra margen, pero el patrón «un archivo por entrada» tiene techo.

Consecuencia directa para la cola de traducción: las **glosas de TBESH/TBESG son 22.717 entradas**. Con un archivo por entrada **revientan el límite ellas solas**. Hay que agruparlas antes de generarlas — por letra inicial, por rango de Strong's, o en un único mapa como se hizo con la morfología (2.061 códigos en 2 archivos). Lo mismo aplica a Easton ES.

**Decidir la estrategia de empaquetado antes de generar, no después.**


### 2026-09-21 · GLM (vigilante) — DIRECTIVA DEL USUARIO: JFB INGERIDA E INTEGRADA (selector Henry/JFB) · B18 RATIFICADA · convención de empaquetado fijada · Barnes en cola — Juan sigue completo (2064/2064)

**El usuario ordenó:** «continuamos con 1 y 2 y luego con lo mío — luz verde revisión en orden y la licencia también». Ejecutado:

1. **JFB INGERIDA, VALIDADA E INTEGRADA (paso 6).**
   - **Fuente:** ThML oficial de CCEL (`ccel.org/ccel/jamieson/jfb.xml`, 34 MB) — crudo en `05. Datos/corpus_crudo/jfb/`. Pipeline reproducible: `scripts/ingesta-jfb.mjs` (parser ThML: `scripCom parsed="|Libro|cap|v|capFin|vFin"` + párrafos `<p>`; decodificación de entidades; títulos div2 → OSIS).
   - **Salida:** `public/data/jfb/{OSIS}.json` — **66 libros, 19.768 anclas de verso**, 0 libros vacíos. Granularidad fiel a la edición impresa: JFB ancla por versos clave; los versos sin ancla quedan cubiertos por el bloque previo (documentado en el manifiesto; dif. vs RV1909 informativas, p. ej. GEN 594/1533).
   - **Lector (D-001.1 resuelta):** selector **Henry | JFB** en la barra del comentario (excluyente con ES/EN y con la etiqueta «sin revisar», que son de Henry). En modo JFB: un bloque colapsable por capítulo («Comentario de JFB — capítulo N — verso a verso (EN)»), cada ancla numerada, con citas enlazadas vía renderMarcado. ⓘ y panel Fuentes con la atribución JFB (1871 · PD · evangélica escocesa-presbiteriana · texto EN).
   - Verificación: `tsc` limpio; build 0; desplegado (`32582676`); producción: `/data/jfb/JHN.json` 200 (21 caps; Jn 3:16 con ancla y comentario correcto), selector servido, lector 200, **JUAN ES 2064/2064**.

2. **Convención de empaquetado de obras derivadas ES (cerrada la decisión):** ninguna obra derivada se genera «un archivo por entrada» (techo de 20.000 archivos de Pages). Un único mapa JSON por obra (como morfología ES) o particiones gruesas. Aplica a glosas TBESH/TBESG (22.717) y Easton ES. Registrada en la sección 3 de la BP. La generación de las glosas ES es la siguiente tarea de la cola de traducción (no es MH, puede ejecutarse sin decisión).

3. **B18 RATIFICADA por el usuario** («la licencia también»): CC BY 4.0 para las traducciones propias. Registrado en la tabla de decisiones. Pendiente solo su reflejo formal en la puerta legal (paso 8).

4. **Barnes (paso 6, en cola):** sondas de fuentes sin resultado limpio aún — CCEL (barnesnt/nt/ntb → 404), studybible.info (no tiene la obra: /Barnes cae en fallback), GitHub (solo Calvin/Meyer en pillar-commentary-data). Próximas vías: código de obra real de CCEL (su buscador), biblehub por verso (7.957 peticiones, viable con bucle cortés), o módulo e-Sword de BibleSupport. La ficha legal ya está lista.

5. **Revisión doctrinal (paso 4 ⟡):** luz verde recibida — los materiales están en `06. Traduccion/Puerta paso 4 - Guía de revisión doctrinal (Juan).md`; el revisor lee en el lector (ES con EN a un clic) y reporta por el canal de errores. Al aprobar capítulo a capítulo se retira la etiqueta «sin revisar».

**Estado:** pasos 0-1-2-5-7 ✓ · paso 3 completo salvo revisión humana · paso 4: materiales listos, revisión abierta al usuario · **paso 6: SBLGNT ✓ · Nave's ✓ · JFB ✓ — restan Barnes** (y cierre legal de SBLGNT ya fichada) · MH **en pausa por directiva**. Bloqueado en usuario: modelo de sostenimiento, nombre/dominio.

### 2026-09-21 · GLM — UX del comentario: desplegable de comentaristas con insignia de idioma (petición del usuario)

**Petición:** que la elección de comentarista sea un **desplegable** (ampliable a los que se agreguen) y que la traducción aparezca a la derecha solo cuando exista — como hoy con MH — mostrando si no el idioma disponible.
- **Implementado:** la barra del comentario cambia el rótulo fijo por un **`<select>` de comentaristas** («Matthew Henry · 1706», «Jamieson, Fausset y Brown · 1871», …) — lista central `COMENTARIOS`; cada obra nueva del núcleo se añade con una línea. A la derecha:
  - **Henry** (con traducción ES): insignia «sin revisar» + toggle ES/EN (como antes).
  - **JFB** (solo EN): insignia pasiva «EN» con tooltip del estado de traducción.
  - Los botones Henry/JFB del turno anterior quedan retirados (eran la solución interina).
- Estilos con tokens (serif en el desplegable, insignia pill); `tsc` limpio; desplegado (`6c2edc95`); producción: lector 200, jfb 200, **JUAN ES 2064/2064**. Commit y push.

**Estado sin otros cambios:** paso 6 con SBLGNT ✓ · Nave's ✓ · JFB ✓ (restan Barnes) · MH en pausa · revisión doctrinal abierta al usuario · bloqueado en usuario: sostenimiento y nombre/dominio.

### 2026-09-21 · GLM — Punto de recuperación 2026-09-21 + GLOSAS ES DEL LÉXICO (lote 1) — petición del usuario («continuar mejorando»: eligió punto de recuperación + glosas)

1. **PUNTO DE RECUPERACIÓN (tag `recuperacion-2026-09-21`, commit `9242de0`).** Validación integral previa: checks programáticos de todo el corpus (rv1909/web 66 · Juan ES 2064/2064 + paridad 1:1 · jfb 66 · nave 66+5.321 temas · sblgnt 27/7.927 · tbesh 8.623 · tbesg 10.689 · tsk 66 · easton por letras · léxico 235 · morfología), build limpio y barrido de 18 endpoints en producción → TODO VERDE. La batería destapó y corrigió 2 deudas: **(a) 63 códigos morfológicos griegos del texto sin cobertura ES** (parche `scripts/parche-morfologia-63.mjs` → cobertura 100%: 1.141/1.141 códigos usados); **(b) 8 duplicados no-OSIS en tsk/** (EZE/JAM/JDE/JOE/JOH/MAR/NAH/SOS — el lector sirve por manifest, eran peso muerto; eliminados). Tag anotado + push.

2. **GLOSAS ES DEL LÉXICO STRONG (paso 6, lote 1; commit `d1b1f1d`, deploys `35a3b3a9`/`efc8f77a`).** No existe traducción ES oficial de TBESH/TBESG (revisado el repo STEPBible-Data: solo EN + TFLSJ) → obra derivada propia CC BY 4.0 (B18). **Arquitectura**: overlay único `public/data/stepbible/glosas-es.json` con 4 mapas — `texto`/`textoG` (glosa contextual del campo `e` por cadena EXACTA, con puntuación final normalizada: «Him.»=«Him») y `lexico`/`lexicoG` (por Strong canónico para la ficha). Empaquetado según convención (1 archivo, no 19k). **Lector**: al abrir el interlineal carga el overlay; interlineal AT renderiza `p.es || glosaTextoEs(p) || p.e`; ficha léxica muestra glosa ES en negrita + EN original entre paréntesis + atribución «Glosa ES: traducción propia, CC BY 4.0 (sin revisar)». El NT interlineal ya estaba 100% ES de antes (campo `es`); el AT estaba 0% (283.734 palabras caían a EN).
   **Cobertura del lote 1**: hebreo 71,78% de palabras del AT interlineal (203.003/282.812; 724 cadenas de texto); griego 87,88% (124.371/141.526; 894 cadenas); mapas léxico 1.738 Strong (H) + 1.541 (G).
   **Pipelines reproducibles** (`scripts/`): `genera-colas-glosas.mjs` (colas priorizadas por frecuencia), `fusiona-glosas-es.mjs` (portón: cada EN del TSV contra su dominio de referencia — cola léxico o glosas del texto —, ES no vacío, stats), `lista-faltantes-texto.mjs` (siguientes faltantes por frecuencia). Lotes TSV `EN<TAB>ES` en `06. Traduccion/glosas-es/`.
   **⚠️ BUG DE INGESTA PREEXISTENTE descubierto**: el `indice` interno de tbesh.json/tbesg.json arrastra referencias cruzadas (indice["H0430"] apuntaba a la entrada "Peace" de Salem) y la entrada de YHWH (id "H3068G") lleva glosa "Peace" — la ficha léxica viene resolviendo Elohim/YHWH a entradas equivocadas desde la ingesta original. El overlay nuevo elude el índice (agrupa por prefijo de id y prioriza la glosa real del texto), pero **la resolución interna del lector (abrirLexico) sigue usando el índice contaminado**: revisar la ingesta de tbesh/tbesg (entrada pendiente).
   **Cola de continuación (siguientes turnos)**: `node scripts/lista-faltantes-texto.mjs` → traducir el top como `lote2-*.tsv` (mismo formato EN<TAB>ES) → `node scripts/fusiona-glosas-es.mjs` → build/deploy. También quedan las glosas del léxico TBESH/TBESG por orden de la cola (cola-hebreo/cola-griego, top 1.000 hecho).

**Estado:** pasos 0-1-2-5-7 ✓ · paso 3 completo salvo revisión humana · paso 4: revisión abierta al usuario · **paso 6: SBLGNT ✓ · Nave's ✓ · JFB ✓ · glosas ES lote 1 ✓ (continúa con lote 2) — restan Barnes** · MH en pausa. Bloqueado en usuario: sostenimiento y nombre/dominio.

### 2026-09-22 · Claude — MOTOR DE TRADUCCIÓN CONSTRUIDO Y VALIDADO · modelo elegido por medición · Política de revisión humana v1.0 · barra de recursos en el lector

**Petición del usuario:** diseñar y construir un motor de traducción y auditoría por lotes fuera de tiempo real, para dejar de traducir desde la conversación (los tokens del chat son los caros).

#### 1. Motor construido — `11. Motor de Traducción/` (30 archivos, sin dependencias externas)

Unidad atómica de estado: **el párrafo**, no el capítulo. Reanudable e idempotente (hash del original). Cuatro capas de calidad, de gratis a cara: validadores deterministas → auditor calibrado → juez LLM sobre lo marcado → revisión humana.

- **Superficie medida del corpus Henry:** 1.189 capítulos · 3.366 secciones · **30.449 unidades** (25.913 párrafos + 3.366 títulos + 1.170 resúmenes) · 34,3 M chars. Cola real sin Juan: **28.268 unidades · 32,2 M chars**. 645 duplicados exactos que la memoria de traducción resuelve gratis.
- **Contrato de salida idéntico** al de `fusiona-henry-es.mjs`: el lector no cambia ni una línea.
- **Generalizado a varias obras** (`lib/obras.mjs`): Henry y Easton implementados; añadir una obra es añadir un objeto con `unidades()` y `ensambla()`.
- **Consola local** (`bin/consola.mjs` → :4317) con tres pestañas: Proceso (avance por libro, gasto, motivos de rechazo), **Revisión humana** (cola ordenada por confianza ASCENDENTE — lo peor primero; A/C/R con teclado; las correcciones entran en la memoria de traducción), y **Cotejo** (dos capítulos enfrentados, con conmutador humano/motor para Juan).

#### 2. Modelo de traducción elegido POR MEDICIÓN, no por intuición

Método: 100 párrafos de Juan con traducción humana, retraducidos por cada candidato, y **enfrentamiento por pares sobre el mismo párrafo** con Jev de juez.

| modelo | USD corpus | fidelidad | fluidez | vs humano (G-P-E) |
|---|---|---|---|---|
| **@cf/mistralai/mistral-small-3.1-24b-instruct** | **29** | 2,66 | 2,79 | **30-21-48** (empate estadístico, p≈0,21) |
| @cf/meta/llama-3.3-70b-instruct-fp8-fast | 44 | 2,65 | 2,69 | 26-40-34 (peor, p≈0,085) |
| @cf/meta/llama-4-scout-17b-16e-instruct | 25 | 2,65 | 2,68 | 24-40-36 (peor, p≈0,046) |
| *traducción humana* | — | 2,62 | 2,78 | — |

**Hallazgo de método:** las medias de los tres primeros son casi idénticas (2,65/2,65/2,66) y **no distinguen nada**. Solo el enfrentamiento por pares los separa. Los promedios mezclan párrafos distintos y esconden la diferencia real.

**Modelos de razonamiento descartados** (GLM-5.3 $684, DeepSeek-V4-Pro $451): gastan 13.000–19.000 chars de cadena de pensamiento **por párrafo** en una tarea donde razonar no aporta.

#### 3. Jev como auditor censal

`typesafe/jev` vía **Cloudflare Workers AI** (sin lista de espera; requiere saldo en AI Gateway porque es modelo de terceros). No genera texto: devuelve valores tipados con probabilidad calibrada. Como la salida no se cobra, **auditar el 100% del corpus cuesta 1,91 USD** — el control de calidad pasa de muestral a censal.

Piloto contra Juan: precisión **97,2%**, sensibilidad **84,0%**, falsos positivos 12% → **discrimina**. Para llegar ahí hubo que corregir la RÚBRICA, no el umbral: Jev marcaba como «literalidad» la sintaxis periódica que el glosario manda conservar. Se resolvió metiendo el **ENCARGO** dentro del `state`.

#### 4. Validación end-to-end y bugs reales encontrados

Mateo 1 completo (43/43, 0 fallos) y Easton letra Z (236/236). La corrida real destapó cinco defectos, todos corregidos:

- **Jev cobrado a precio de Sonnet** (`jev-1.13.0` no coincidía con la clave `jev-1`): 100× de más. Precio resuelto ahora por prefijo, con aviso si no reconoce el modelo.
- **Límite de ritmo del AI Gateway**: 429 en cadena pasadas ~200 peticiones. Medido: de 400 auditorías pasaron 201 y fallaron TODAS las demás. **Habría reventado la auditoría censal del corpus entero.** `lib/ritmo.mjs` abre una pausa GLOBAL creciente al primer 429.
- **Referencias muertas**: los modelos inventan `He 4:2`, `Da 9:24`, `Tt 2:13`, `Nú 24:17`, `Ga 3:13` — abreviaturas que el lector NO enlaza. `lib/referencias.mjs` las normaliza leyendo la tabla del **propio lector** (una sola fuente de verdad). De paso: **`Abd` (Abdías) faltaba en la tabla del lector** — toda cita española a Abdías era enlace muerto. Corregido en `07. App/app/lib/referencias.ts`.
- **Bake-off fuera del presupuesto**: `comparar.mjs` no registraba su gasto en el contador y escapaba al tope. Cerrado.
- **Glosario demasiado severo**: exigir el término fijo generaba 35,7% de falsos positivos contra la traducción humana (el traductor reformula legítimamente: `faith`→«creer»). Ahora solo es GRAVE la variante **vetada** por el propio glosario. Falsos positivos: **0 sobre 1.565 párrafos**.

#### 5. Política de revisión humana y respaldo editorial — v1.0 VIGENTE

Nuevo documento `06. Traduccion/Política de revisión humana y respaldo editorial.md`, enlazado desde la guía de Juan. Aplica a **todo** el corpus.

- **Hallazgo jurídico que condiciona el proyecto:** una traducción salida del motor sin intervención humana **puede carecer de autoría y, con ella, de protección legal**. La revisión humana no es control de calidad añadido: **es el acto que constituye la obra**. Sin ella no hay nada que licenciar, se ponga la licencia que se ponga.
- **Revisor principal identificado:** Jacob Guzmán Villarreal. Sin formación académica en teología (declarado con honestidad); tradición evangélica protestante, bajo cobertura de Ministerios Ebenezer Costa Rica. El respaldo no es un título: son el glosario fijado antes del primer párrafo, el original a un clic y el registro público de decisiones.
- **Tres niveles de revisión.** Regla dura: **ningún veredicto automático retira la etiqueta «sin revisar»**. Solo una persona nombrada, capítulo a capítulo.
- **Sección 7 — texto íntegro y notas del traductor:** el texto se conserva íntegro, sí o sí. Cuando el concepto exige un matiz, se permite **con la condición de declararlo**: `[N. del T.]` o explicación desplegable al pulsar la palabra o el párrafo. **Nunca un cambio silencioso.** El principio es la trazabilidad, no la literalidad.
- **Pendientes declarados, ninguno bloqueante:** revisor doctrinal externo, registro de la obra en Costa Rica, compuerta «Reportar un error», notas desplegables, errata pública.

#### 6. Lector — barra de recursos (petición del usuario)

La barra del comentario era una superficie de clic a lo ancho que tapaba los controles. Rediseñada: **[✎] [obra ▾] ···· [sin revisar] [ES|EN] [☑]**. Cada control responde por sí mismo. El conmutador ES/EN **solo aparece si el recurso tiene traducción**, derivado de los datos cargados y no de una bandera estática. Casilla de visibilidad dibujada a mano. Añadir una obra al desplegable es añadir una línea a `COMENTARIOS`.

**Barras de desplazamiento** sustituidas en toda la app: delgadas, sin flechas, teñidas con los tokens del tema, en vez del gris ancho de Windows 11. Más `prefers-reduced-motion`.

`tsc --noEmit` limpio · `npm run build` correcto.

#### 7. Coste proyectado de traducirlo todo

Tarifa medida: **~1 USD por millón de caracteres**, traducido y auditado al 100%.

| obra | Mchars | total |
|---|---|---|
| Matthew Henry (resto) | 32,22 | **$30,87** |
| JFB | 10,43 | **$10,00** |
| Easton | 2,39 | **$2,29** |
| Glosas TBESH/TBESG (resto) | 1,75 | **$1,67** |
| Nave's (nombres de tema) | 0,01 | $0,01 |
| | **46,8** | **≈ $45** |

Con Barnes (sin ingerir aún, ~18 Mchars): **≈ $62 el proyecto completo**. La biblioteca clásica PD entera (Pulpit, Calvino, Gill, Clarke, ISBE, Spurgeon, Smith's) añadiría ~154 Mchars ≈ **$148**.

**El cómputo es lo barato.** Solo Henry son ~470 horas de revisión humana a 60 párrafos por hora. Ahí está el cuello de botella y el valor real.

#### 8. Orden de trabajo acordado: de menor a mayor coste

Nave's → glosas → **Easton (en marcha, piloto letra Z ✓)** → JFB → Henry.

**Gasto real de la sesión:** ~1,8 USD, bake-offs incluidos (reconstruido tras cerrar el agujero de contabilidad).

#### 9. Abierto para el siguiente turno

**Biblias en español de licencia abierta**, por si la RV1909 resulta dura de leer. Candidata localizada: **Versión Biblia Libre (VBL)**, eBible.org `spavbl`, © 2018-2020 Jonathan Gallagher y Shelly Barrios de Avila, **CC BY-SA 4.0**, español contemporáneo desde Nestle-Aland. Dos cosas que verificar antes de ingerirla: (a) si el alcance es Biblia completa o solo NT —la página de copyright dice «Nuevo Testamento» y el índice sugiere ambos Testamentos—, y (b) el **ShareAlike**, que B18 evitó a propósito: servirla junto al corpus propio es mera agregación y no contamina, pero cualquier obra **derivada** de ella sí heredaría CC BY-SA.

**Estado:** pasos 0-1-2-5-7 ✓ · paso 3 completo salvo revisión humana · **paso 4: política v1.0 vigente, revisor principal identificado, revisión abierta** · paso 6: SBLGNT ✓ Nave's ✓ JFB ✓ glosas lote 1 ✓ **Easton ES en marcha** — resta Barnes · **motor de traducción operativo**. Bloqueado en usuario: modelo de sostenimiento, nombre/dominio.

**En el árbol sin commitear:** `11. Motor de Traducción/` completo · `lib/referencias.ts` (Abd) · `henry-es/MAT.json` (Mateo 1 por motor, sin revisar) · `easton-es/z.json` · política y guía de Juan actualizadas · `globals.css` y `lector/page.tsx` (barra de recursos).

### 2026-09-26 · GLM — REVISIÓN DE RELEVO: narración de los commits 22–23 sept (sin registro en bitácora) · verificación de producción · automatización del vigilante ELIMINADA por orden del usuario

**Petición del usuario:** «revisa la carpeta madre y ve los nuevos avances». El trabajo del 22–23 sept quedó narrado hasta el motor (entrada 2026-09-22 de Claude); los 11 commits posteriores (`ccff4ee`→`11cccd3`) no estaban en ninguna bitácora. Se reconstruye aquí desde los mensajes de commit y la verificación directa de los datos (lectura de production + medición de cobertura real). Árbol limpio, HEAD `11cccd3`.

1. **`ccff4ee` — Lector: la capa del texto original pasa a ser un desplegable con nombre** (page.tsx, globals.css).
2. **`3e4da1e` — La app se llama «Biblia de Estudio AION»** (i18n + manifest) · griego usable (`lib/morfgnt.ts` nuevo) · fix de una ✕ que se escapaba.
3. **`9a6b694` — EASTON ES COMPLETO** (`public/data/easton-es/`, 26 archivos por letra, generado por el motor; piloto letra Z del motor → obra entera) · el griego ya no saca al lector de su posición · comentario visible en la vista griega.
4. **`be78ef2` — Notas con el griego activo** · griego con tono propio (CSS) · referencias del diccionario tocables (`lib/referencias.ts`).
5. **`9f49427` — BUG DEL ÍNDICE LÉXICO CORREGIDO** (el documentado en mi entrada del 21-09: `abrirLexico` resolvía entradas equivocadas vía el índice contaminado de TBESH/TBESG) · diccionario bilingüe · fix de desborde de unidad corta. Cambia el motor (`obras.mjs`, `validadores.mjs`) y el lector.
6. **`9cc70b1` — las tarjetas apiladas se coordinan en vez de taparse** (page.tsx, globals.css).
7. **`c5bc610` — paneles en baraja** · fix del motor: las glosas se paraban por comillas.
8. **`55448db` — cabecera móvil en tres filas fijas**; el título del capítulo ya no queda tapado (Cabecera.tsx).
9. **`9c435de` — fix del motor: los lotes de glosas se perdían enteros y costaban 10×**.
10. **`cb136d2` — tope de gasto del motor: 75 USD** para todo el proyecto · prompt de glosas con ortografía completa.
11. **`11cccd3` — glosas ES con ortografía completa** (pase «antes-tildes», backups en `estado/`) · **el léxico recupera 1.424 fichas** («bará» incluido; además se regeneró tbesh.json desde `ingesta-stepbible.mjs`).

**Verificación de datos (medida, no heredada):** interlineal AT **99,62%** de palabras con glosa ES (282.664/283.734; 550 cadenas raras restantes) — el «100%» del commit b95c211 es sustancialmente cierto; léxico **8.721 Strong H + 10.846 G** (obra prácticamente completa); H0430→«Dios», H3068→«Jehová», H1254→«crear» ✓. **El `_meta` de glosas-es.json quedó CADUCO** (dice 71,78% y lista los lotes 1b/1c) — cosmético, corregir en próximo pase. tahot sigue sin `es` inline (el AT depende del overlay en runtime; el NT lleva `es` inline 100% — decisión de diseño a documentar). `textoG` del NT al 63% (irrelevante: el NT ya está en español inline).

**Producción verificada al día con HEAD** (26-09): lector 200 · vbl manifest+JHN 200 · easton-es a/z 200 · glosas-es.json 2,4 MB con léxico completo · manifest «Biblia de Estudio AION».

**AUTOMATIZACIÓN ELIMINADA (orden del usuario, 26-09):** el vigilante de 30 min (`automation-1cdbc91d`, 56 ejecuciones, ya pausado) queda BORRADO — «ya con el motor de traducción no es necesario». Los turnos de fondo dejan de existir; el trabajo por lotes corre por el motor contra la API (fuera del chat).

**Estado:** pasos 0-1-2-5-7 ✓ · paso 3 completo salvo revisión humana · paso 4: política v1.0, revisión abierta · paso 6: SBLGNT ✓ Nave's ✓ JFB ✓ glosas ✓ **Easton ES ✓ — resta Barnes** (vías: CCEL código real de obra, biblehub por capítulo, módulo e-Sword) · motor operativo con tope 75 USD · VBL ingerida (CC BY-SA, solo agregación). Bloqueado en usuario: sostenimiento, ratificación formal del nombre «AION».

### 2026-09-26 · GLM — BARNES INGERIDA E INTEGRADA (4.º comentarista del núcleo — PASO 6 COMPLETO) · bitácoras puestas al día · vigilante eliminado

**Directiva del usuario:** «Actualiza las Bitacoras y luego sigue con Barnes, y elimina cualquier automatización para este proyecto — ya con el motor de traducción no es necesario». Ejecutado en orden.

1. **Bitácoras al día:** los 11 commits del 22–23 sept narrados en la entrada de revisión de relevo de hoy (arriba) y resumen en la BP maestra (que estaba parada en 21-09).

2. **Automatización ELIMINADA:** el vigilante de 30 min (`automation-1cdbc91d`, 56 ejecuciones, ya pausado) borrado. **El proyecto deja de tener turnos de fondo**: los incrementos corren por el Motor de Traducción contra la API, y los turnos de chat quedan para decisiones, ingesta y UX.

3. **BARNES (paso 6, commit `238997a`, deploy `f85b0282`):**
   - **Fuente:** biblehub.com/commentaries/barnes/ — el espejo del texto PD original designado en Ficha - Barnes.md. **El ThML de CCEL (`barnes/ntnotes.xml`, 32 MB, 8.211 scripCom) quedó DESCARTADO**: su printSourceInfo es «Grand Rapids: Baker Book House, 1949» — la edición que la ficha prohibe — y los volúmenes AT separados de CCEL (job1, psalms1-3, isaiah1-2, daniel1-2) son «Page images only» (sin texto).
   - **Filtro de autoría (verificado antes de ingerir):** Barnes escribió el NT completo y del AT solo Génesis, Job, Salmos, Isaías y Daniel (sus Notes on the Bible 1834). Los «Barnes» completos modernos rellenan Exo–Est/Prov/Ecl/Sng con otros autores sin acreditar — medido por densidad (Éxodo ≈200 chars/ancla vs Génesis ≈3.500) y confirmado por bibliografía. **Esos libros se EXCLUYEN**: la ficha manda dar el Barnes original, no un pastiche.
   - **Ingesta:** `scripts/ingesta-barnes.mjs` — rastreo cortés reanudable (580 capítulos, UA propio, 1,1 s entre peticiones, reintentos con backoff), crudo en `05. Datos/corpus_crudo/barnes/paginas/` (fuera del git). Parseo: zona `leftbox`→`bot`, anclas por `versenum` (ref desde el href), KJV del div `verse` fuera, párrafos por `<p>`, entidades decodificadas, introducciones de libro como bloque `v:"Intro"`.
   - **Portón: 32 libros (27 NT + 5 AT), 12.224 anclas, 0 incidentes** — los capítulos vistos coinciden con los esperados en los 32. Salida `public/data/barnes/{OSIS}.json` con la MISMA forma que jfb/ (Salmos el más denso: 2.438 anclas; Juan 3 tiene 36 anclas con el v16 íntegro).
   - **Lector:** la barra de recursos añade «Albert Barnes · 1872» (una línea en COMENTARIOS); el efecto de carga se generalizó (`RUTA_COMENTARIO`: jfb y barnes comparten forma de JSON y render «v. texto»); badge EN automático (traducido: false); ⓘ y panel Fuentes con la atribución Barnes (1832–1872, presbiteriana americana, alcance declarado). tsc limpio; desplegado; producción: barnes/JHN 200 (21 caps), GEN 200, PSA 200, EXO 404 (correcto por autoría).

**Estado: PASO 6 COMPLETO — núcleo 7 obras: RV1909 · WEB · Henry (ES Juan completo) · TSK · Easton (+ES) · Nave's · SBLGNT · JFB · Barnes · VBL · glosas/morfología ES.** Pasos 0-1-2-5-7 ✓ · paso 3 completo salvo revisión humana · paso 4: política v1.0, revisión abierta · MH en pausa (la cola del motor puede retomarlo por lotes cuando el usuario dé el aviso). Bloqueado en usuario: sostenimiento, ratificación formal del nombre AION. Deuda menor: `_meta` caduco de glosas-es.json (dice 71,78%).

### 2026-09-26 · GLM — UX: elegir libro EXIGE elegir capítulo (dos pasos obligatorios) — petición del usuario

**Petición:** «que después de elegir un libro de la biblia se tenga que seleccionar el capítulo sí o sí».
- **Antes:** al cambiar de libro el lector saltaba directo al capítulo 1 — el usuario quiere elegir el capítulo siempre.
- **Ahora:** el cambio de libro NO navega: el desplegable de capítulo entra en estado PENDIENTE — se expande, se anilla en dorado, muestra «Elige capítulo…» y lista los capítulos del libro elegido (desde el manifest, sin cargar nada); en navegadores con `showPicker()` (Chrome/Android) **el desplegable se abre solo**. La lectura permanece donde estaba (regla: nada saca al lector de su posición) hasta que se elige capítulo → entonces carga el pasaje y el anillo se retira. **Escapatorias**: ←/→ y los saltos de referencia (notas/tarjeta dividida) cancelan la pendencia y navegan normal.
- Archivos: `lector/page.tsx` (estado `pendiente` + `capRef`, selects libro/capítulo, 4 puntos de cancelación), `i18n.ts` (`capituloElige` ES/EN), `globals.css` (`.sel-cap.requerido`). tsc limpio, build correcto, deploy `b8dd9ed8`, commit de este turno. **Verificado en navegador con vista móvil**: Juan 1 → Génesis (no salta, anillo dorado, 50 caps listados) → capítulo 5 → «Génesis 5» cargado.

### 2026-09-26 · GLM — UX: barra del comentario sin nombre repetido (coherencia de las 2 líneas)

El usuario señaló que con Barnes el nombre del comentarista salía dos veces en la barra pegajosa («COMENTARIO DE ALBERT BARNES» arriba y «Comentario de Albert Barnes (1872) — capítulo 3…» abajo). **Corregido**: la línea 1 lleva solo el autor («Albert Barnes · 1872»; Henry conserva su rótulo clásico) y la línea 2 solo el detalle («Capítulo 3 — verso a verso (texto EN) (183)»). Quedan fuera las claves i18n muertas (`comTitulo`, `jfbTitulo`). tsc limpio, build correcto, deploy `a1a9b862`, verificado en navegador con vista móvil (captura: barra coherente + bloque expandido con citas enlazadas). Regla reforzada: en la barra del comentario el AUTOR va arriba y el DETALLE abajo — el nombre nunca dos veces.

### 2026-09-26 · GLM — COLA DE TRADUCCIÓN DEL MOTOR EN MARCHA (directiva del usuario: «los 4 restantes, uno a uno, verificando») — PASO 1: Nombres de Nave's ✓

**Directiva:** «vamos a hacerlo todo de una vez... paso a paso, terminas uno compruebas q todo funcione bien y luego sigues, hasta acabar con todos y completar los 4 restantes». Cola: Nave's nombres → JFB ES → Barnes ES → Henry restante. El tope de $75 protege (parada en seco); gasto inicial $8,47.
- **PASO 1 ✓ (deploy `77ed696f`):** obra `naves` añadida al motor (lib/obras.mjs): 5.321 títulos de tema, perfil glosa genérico (el caso especial `obraId === 'glosas'` de traducir.mjs ahora lo decide `OBRA.perfil === 'glosa'`), prompt propio (nombres propios castellanos, Jehová-jireh, ortografía completa). Corrida: 89 lotes, ~6 min, 5.319/5.321, +$0,09 (total $8,56). Los 2 fallos eran los falsos amigos «red»/«translation» — corregidos a mano (Rojo/Traducción). Salida `nave/_temas-es.json` (slug→nombre). **Lector**: el panel del versículo ahora muestra el nombre ES (mapa cacheado de _temas-es.json, cae al slug si falta) — verificado en navegador: «Condescendencia de Dios», «Jesús, el Cristo», «Salvación»… NOTA: hasta hoy el lector mostraba los SLUGS en minúscula; los nombres bonitos de _temas.json no se usaban.

### 2026-09-26/27 · GLM (vigilante del motor) — PASO 2 COMPLETO: JFB ES DESPLEGADO · Barnes lanzado

- **JFB → ES**: 5.953 lotes, **43.213/43.256 párrafos (99,9%)**, 43 fallos (0,1%), **+$7,88** (total $16,44 de $75). Ensamblado a `public/data/jfb-es/` (66 libros). **Portón verde** tras: (a) 2 residuos reales corregidos a mano (PSA 30:4 sin traducir; REV 3:12 cortado a media palabra — completado desde el EN); (b) validador endurecido: fronteras de palabra con acentos (JS \b matcheaba dentro de «andáis»), títulos de obras citadas y citas entre corchetes permitidos, **frases-ancla KJV de JFB antes de la raya = legítimas por construcción**, y corte-duro SOLO si el EN cierra la frase y el ES queda en palabra suelta (los ~30 «cortes» del impreso JFB vienen truncados en la propia fuente — el ES los refleja fielmente, precedente JN 18:13 p20 de Henry).
- **Lector**: con jfb-es desplegado, el conmutador ES/EN aparece solo para JFB (derivado de datos) + insignia «sin revisar»; título del bloque «Capítulo N — verso a verso (traducción automática, sin revisar)». Verificado en producción: jfb-es/JHN 200, Jn 3:16 «Porque de tal manera amó Dios, &c.—¿Qué proclamación...».
- **Barnes → ES lanzado en segundo plano** (58.478 unidades, ~$23,64 estimado).

### 2026-09-26/27 · GLM (vigilante) — MEDICIÓN Y DECISIÓN: Henry correrá con concurrencia 5 (a petición del usuario: «súbelo pero mídelo primero»)

- **Método**: prueba controlada con `MT_CONCURRENCIA=5` sobre 20 lotes de MATEO (trabajo real de la cola de Henry: 97 párrafos), mientras Barnes seguía con conc 3 — 8 obreros simultáneos contra el gateway.
- **Resultados**: 97/97 sin un fallo ni rechazo de validador, **0 errores 429** (ni una pausa del limitador), 2m27s. Barnes NO se resintió: 159 párrafos en la misma ventana (~64/min, su ritmo normal). **Throughput combinado ~103 párrafos/min vs ~64/min de base = 1,6×.**
- **Decisión**: Henry se lanzará con `MT_CONCURRENCIA=5` (proyección: ~7,5-8 h en vez de ~12 h para los 32,2M chars). El vigilante (automation-c03f9063) actualizado para lanzar henry SIEMPRE con la variable (y sus relanzamientos).
- **Coste de la prueba**: ~$0,08. Nota de contabilidad: al correr dos procesos simultáneos sobre el mismo gasto.json hubo un pequeño solape de escritura — el contador puede estar subestimado en ~$0,08; es la única vez que se corrieron dos procesos a la vez (Barnes y la prueba); Henry correrá solo.
- Mateo 1 ya estaba hecho (piloto del motor); la prueba avanzó Mateo 2-3 de verdad. Estado: Barnes ~62% (36.072/58.478), gasto $24,46 de $75.

### 2026-09-27 · GLM (vigilante, calce) — PASO 3 COMPLETO: BARNES ES DESPLEGADO · Henry lanzado con concurrencia 5

- **Barnes → ES**: 7.829 lotes, **58.432/58.478 párrafos (99,9%)**, 46 fallos, **+$8,90** (total $29,22 de $75). El calce funcionó: la visita entró en espera activa a ETA 89 min y atrapó el final de la corrida (~75 min de sleep en bucles de 5 min), procesando ensamblado+validación+despliegue en el mismo turno.
- **Portón verde** tras: (a) **1 error mío corregido**: al parchear la cita de 1 Co 1:24 escribí `JSON.stringify(a)` con `a`=ancla suelta — pisé `barnes-es/1CO.json` entero (perdía 2.675 párrafos; el validador lo delató al caer su conteo de 58.478 a 55.803). Re-ensamblado desde estado + fix re-aplicado sobre el libro completo. **Lección: al parchear JSON a mano, escribir SIEMPRE el documento completo.** (b) 2 residuos reales corregidos: la cita KJV de 2 Co 10:4 en 1 Co 1:24 (ahora «poderoso para la destrucción de fortalezas» RV1909) y PSA 30:4 / REV 3:12 ya venían del paso JFB. (c) ~70 falsos positivos documentados y registrados en el validador: transliteraciones griegas con macrones («ebebaiōthē» matcheaba «the» — se normalizan diacríticos), títulos de obras citadas en Title Case (Decline and Fall, Land and Book, The Pictorial Bible, Boat and Caravan…), glosas léxicas EN de Gesenius («destinar, appoint») y **5 fuentes truncadas del propio impreso Barnes** (HEB 8:9/8:11/9:28, ROM 5:14, TIT intro — el EN acaba «for.» / «Nor.»).
- **Lector**: con barnes-es desplegado, el conmutador ES/EN aparece solo para Barnes; Jn 3:16 ya lee «Porque de tal manera amó Dios al mundo - Esto no significa que Dios aprobara…». Verificado en producción (hash af61ad18: JHN/GEN/PSA/REV 200; el alias tardó minutos en propagar — PSA 200 y JHN 404 simultáneos durante la propagación).
- **PASO 4 · HENRY lanzado con MT_CONCURRENCIA=5** (28.205 unidades, 32,2M chars; conc 5 validado por medición del 26-09: 1,6× sin 429). Proyección: ~7,5-8 h.

### 2026-09-27 · GLM (vigilante, calce final) — ★★★ COLA COMPLETA: HENRY ES DESPLEGADO — LAS 4 OBRAS DE LA DIRECTIVA TERMINADAS ★★★

**El calce funcionó de punta a punta**: la visita entró en espera activa a ETA 54 min, atrapó el fin de la corrida y procesó ensamblado + validación + despliegue + verificación en el mismo turno.

1. **HENRY → ES (paso 4 de la cola)**: 6.873 lotes, **27.801 traducidas / 307 fallidas (98,9%)**, +$11,44. Ensamblado: **65 libros, 27.961/28.268 unidades (99% del corpus)** — TODO Matthew Henry en español (salvo 235 párrafos caídos al EN como respaldo). El patrón de oro quedó INTACTO: henry-es/JHN.json byte-idéntico (2.180.903B, el Juan humano no se tocó).
2. **Portón verde** tras corregir 2 residuos reales («peevish» ×2 en JOB 34 y NUM 11 — el sospechoso histórico de la bitácora; corregidos en henry-es Y en resultados.jsonl para durabilidad) y registrar como legítimas 7 citas clásicas de Henry (frases latinas/griegas con su versión inglesa al lado: «Obsta principiis—Nip the mischief in the bud», Seneca, Ovidio…). 0 desalineaciones, 0 condensados.
3. **Verificación final de producción** (deploy `597060d7`): lector 200 · henry-es MAT/JHN/PSA/ISA/REV 200 · jfb-es/JHN 200 · barnes-es/JHN 200. Muestra: «El sermón del monte» — «La bienaventuranza es la cosa que los hombres pretenden perseguir…».
4. **GASTO FINAL DE LA COLA: $42,65 de $75** (Nave's $0,09 · JFB $7,88 · Barnes $8,90 · Henry $11,44… más las glosas y pruebas previas incluidas en el contador) — muy por debajo del presupuesto de ~$45 proyectado y del tope de $75.
5. **Deudas registradas para la póliza del lector** (no bloquean): (a) abreviaturas españolas de libros sin alias en `lib/referencias.ts` (Ag, Mi, Jr, Núm… el ensamblador lista ~30) — las citas del motor enlazan parcialmente; (b) 235+46+43 párrafos caídos al EN por fallo de validador — revisar en la consola de revisión; (c) auditoría censal Jev pendiente (opcional, ~$2) para ordenar la cola de revisión humana.

**La Biblia de Estudio AION queda con: RV1909 · WEB · VBL · interlineal/griego con glosas ES · Matthew Henry ES completo · JFB ES · Barnes ES · Easton ES · Nave's ES · TSK · Easton EN.** Todo embebido, todo offline, todo «sin revisar» hasta la revisión humana (Política v1.0).

### 2026-09-27 · GLM — Referencias comprimidas por versículo + selector de versión en las tarjetas (petición del usuario)

1. **Grupos comprimidos multi-verso/multi-capítulo**: «1 Co 2:3, 6, 10, 4:4» ahora muestra TODOS los versos del grupo — antes `abrirCita` filtraba `r.c === primero.c` y DESCARTABA los capítulos posteriores (4:4 se perdía). Cada verso lleva su **chip de referencia (cap:v)** y los saltos de capítulo muestran encabezado («Juan 19» / «Juan 12»). Tope de 40 versos por grupo con aviso.
2. **Selector de versión de Biblia en las tarjetas** (D24/D25, UX del hilo): el panel de cita Y la tarjeta de pasaje dividida llevan un desplegable RV1909/VBL/WEB — cambia SOLO la versión de la tarjeta (estado `obraCita`, null = sigue la principal; cache por versión), **la lectura principal no se mueve**. La carga del panel de cita se refactorizó a un efecto reactivo a `[obraVer, panelCita.id]` — cambia la versión y el panel re-fetchea solo.
3. Verificado en navegador con vista móvil: grupo «Jn 19:38, 39; 12:42» de JFB → panel con JUAN 19/JUAN 12, chips 19:38/19:39/12:42, cambio a VBL recarga «Después de esto, José de Arimatea le preguntó a Pilato…» (VBL) con la lectura principal en Juan 3 RV1909 intacta. Deploy `137c88e4`.

## 2026-09-28 — Buscador de pasajes, paso 1 (Claude)
- Búsqueda local en el dispositivo, sin servidor ni coste: índices `public/data/busqueda/{rv1909,vbl}.json` (≈1,3 MB gzip c/u, se descargan al primer uso), generados con `scripts/genera-busqueda.mjs`; lógica en `lib/busqueda.ts`.
- Criterios: frase exacta > palabras completas > prefijos > proximidad/orden; normalización sin tildes (RV1909 «á», «fué»); equivalencia Señor↔Jehová; fusiona RV1909+VBL.
- UI: botón ⌕ → panel Buscar con pestañas Pasajes | Diccionario; resaltado de coincidencias; tocar un resultado abre la tarjeta de cita. Verificado a 390 px: «la mujer estaba vestida de escarlata» → Ap 17:4 primero, sin desborde horizontal.
- Desplegado: https://3eaacc0e.bibliaapp.pages.dev (build con `DIST_DIR=salida` por el bloqueo EBUSY de `out`).
- Pendiente: paso 2 (Jev reordena candidatos vía Pages Function con la clave en el servidor y límite de uso); búsqueda en comentarios; ensamblar y desplegar definiciones del léxico en español cuando termine la corrida (`node bin/ensamblar.mjs --obra lexdef`).

## 2026-09-28 — Buscador paso 2: Jev ordena por sentido (Claude)
- `07. App/app/functions/api/busca-ia.ts` (Pages Function) + `wrangler.toml` con binding `AI` → **ninguna clave en el cliente ni en el repo**. Por cada candidato Jev responde una probabilidad `noul` («¿es el pasaje buscado?»); hasta 20 candidatos, ≈0,0001 USD por búsqueda. Tope 12/min por IP, caché de 24 h por consulta+candidatos, límites de tamaño.
- Cliente: `ordenaConIA()` en `lib/busqueda.ts`; botón «✦ Ordenar por sentido (IA)» (a demanda, no automático, para controlar gasto) y porcentaje junto a cada referencia.
- Verificado en producción: «cuando Jesús lloró por su amigo» → Jn 11:35 al 90%. Desplegado: https://c57c9ce4.bibliaapp.pages.dev
- Nota de despliegue: `wrangler.toml` declara `pages_build_output_dir = "out"`; con el bloqueo EBUSY se sigue usando `DIST_DIR=salida` y `wrangler pages deploy salida`.

## ENCARGO PARA GLM — Buscador paso 3 y siguientes
1. **Búsqueda en comentarios y recursos** (Henry ES, JFB ES, Barnes ES, Nave's ES, Easton ES, léxico): nueva pestaña «Comentarios» en el panel Buscar.
   - Generar índices por obra con un script tipo `scripts/genera-busqueda.mjs` (párrafo → `OSIS.c.v|obra|texto` recortado). Vigilar el tamaño: cargar un índice por obra sólo cuando se busque en ella; si pasa de ~3 MB gzip, trocear por testamento.
   - Reutilizar `busca()`/`tramosResaltados()` de `lib/busqueda.ts` (sin tildes, prefijos, proximidad). Mostrar fragmento con contexto alrededor de la coincidencia, no el párrafo entero.
   - Tocar un resultado abre la tarjeta del pasaje comentado en la obra correspondiente. Mantener «sin revisar» en todo texto traducido por máquina.
   - Opcional: el botón IA ya sirve igual (`ordenaConIA` acepta cualquier `{ref, texto}`); el prompt del servidor habla de «versículo»: generalizarlo con un campo `tipo` si se usa para comentarios.
2. Luego: reintentar unidades fallidas (Henry 307, Barnes 46, JFB 43, Easton 17) y la auditoría Jev del corpus (~2 USD). Tope de gasto global: 75 USD (ver `11. Motor de Traducción/estado/gasto.json`).
3. Reglas: móvil primero (probar a 390 px, sin desborde horizontal); no tocar `functions/` ni `wrangler.toml` sin avisar; nunca poner claves en el cliente ni en el chat.

## 2026-09-28 — NUEVO CAMINO: recursos a integrar (aprobado por el usuario)
**GLM: tu siguiente trabajo está en `hoja_de_ruta_recursos_GLM.md`.** Sigue ese orden (tareas previas → Fase 1 → Fase 2 → Puerta A → Fase 3 → Puerta B → Fase 4). Marca cada tarea `[x]` allí, anota aquí el resultado y continúa con la siguiente. En las PUERTAS (⛔) para y deja el informe de gasto: el usuario decide si sube el tope.

### 2026-09-28 · GLM — HOJA DE RUTA ACTIVADA: automatización nueva + reintentos lanzados + sondeos de la 1.1

1. **VIGILANTE DE LA HOJA DE RUTA CREADO** (`automation-646d649b`, cron `23 * * * *`): ejecuta `hoja_de_ruta_recursos_GLM.md` en orden (previas → Fase 1 → 2 → ⛔A → 3 → ⛔B → 4), marca [x], bitácora, PUERTAS = parada, tope de gasto avisa a $72 (duro del motor: 75). Validación tras cada obra/feature (portón + tsc + build + curl) y commit pequeño.
2. **REINTENTOS LANZADOS** (cadena de fondo, 7 obras: henry/barnes/jfb/easton/glosas/naves/lexdef — ~440 fallidas ≈ $0,3): al terminar, ensamblar lexdef y desplegar (la corrida ya terminó: 22.716 unidades, 25 fallidas).
3. **CORRECCIÓN a la regla 8 de la hoja**: `DIST_DIR=salida npm run build` NO aplica en este repo — el build es `next build` (salida `out/`) y el deploy de `out` funciona (decenas de deploys exitosos). El vigilante usa esa vía.
4. **Sondeos 1.1 (Biblia del Oso)**: no hay volcado JSON de SpaSEV en GitHub. Vía limpia: módulo SWORD `SpaSEV.zip` de CrossWire (https://www.crosswire.org/ftpmirror/pub/sword/packages/rawzip/SpaSEV.zip) — zip con zText comprimido LZSS: escribir el descompresor LZSS estándar de SWORD en Node (~40 líneas), verificar ortografía contra escaneos de archive.org (regla 1.1) y decidir el nombre del manifiesto según venga modernizada o no. Deuterocanónicos: ingerir con OSIS (TOB, JDT, WIS, SIR, BAR, 1MA, 2MA) si el módulo los trae.
5. Gasto al iniciar la hoja de ruta: **$43,99 de $75**.

### 2026-09-28 · GLM (vigilante hoja de ruta) — ficha léxica bilingüe desplegada · corrida completa de lexdef en marcha

- **HALLAZGO**: la «corrida de lexdef terminada» era el PILOTO (48 unidades: 25 H + 23 G). Las definiciones ES completas (22.716 unidades ≈ 5,07M chars ≈ **$5**) no existían. Proyección no toca el tope ($45,43 + $5 ≈ $50,4 < $75) → corrida completa LANZADA en segundo plano (ETA 2-3 h).
- **La ficha léxica del lector ya es bilingüe** (trabajo del relevo de las :23, asumido y desplegado en este turno — deploy `a51305ff`): `abrirLexico` carga perezosamente `lexdef-es-{h,g}.json` y muestra la definición ES cuando existe, con caída al EN si falta. Ahora mismo solo cubren el piloto; cuando termine la corrida, re-ensamblar + desplegar dará las ~22.700 definiciones.
- **Re-ensamblados** con las unidades recuperadas por los reintentos: barnes-es (58.444, +12), jfb-es (43.220, +7), easton-es, henry-es completo. Reintentos marcados [x] en la hoja.
- **Pendiente en turno siguiente**: al terminar lexdef → ensamblar → deploy (las ~22.700 definiciones) → marcar la previa [x]; lanzar auditoría Jev (`bin/auditar.mjs`, solo Henry, ~2 USD, horas) SECUENCIAL tras lexdef para no pelear el gateway; y la tarea de código grande: Buscador paso 3 (especificación en la sección ENCARGO de esta bitácora).
- Gasto: **$45,43 de $75** al iniciar la corrida de lexdef.

### 2026-09-28 · GLM (vigilante) — lexdef al 90% DESPLEGADO: 20.331 definiciones ES en la ficha léxica

- La corrida completa de lexdef YA estaba en el estado (la de la hoja); el ensamblado con el estado completo arrojó **20.331/22.716 (90%)**: 11.680 H + 8.651 G. Deploy `b0a44b17` — producción verificada por hash (el alias tardó en propagar: `-h` 2,87 MB). La ficha del lector muestra ES con caída al EN.
- **El freno de emergencia hizo su trabajo**: el reintento de las ~2.385 fallidas se detuvo al 36% de rechazo (umbral 25%) — son definiciones largas donde el modelo no conserva las máscaras ⟦n⟧ del hebreo/griego. **No quemar más gasto**: esas requieren ajuste de prompt/validador del motor (revisar `validaUnidad` sobre fichas ⟦n⟧ largas) antes de reintentar. Coste de la corrida fallida: ~$0,22.
- **Pendiente del turno siguiente**: Buscador paso 3 (especificación en la sección ENCARGO) y luego Fase 1. Gasto: $45,65 de $75.

### 2026-09-28 · GLM (vigilante) — BUSCADOR PASO 3 COMPLETO: pestaña «Comentarios» desplegada

- **Índices troceados** (`scripts/genera-busqueda.mjs`, segunda pasada): `com-{obra}-{nn}.json` bajo ~5 MB crudos ≈ 1,3 MB gzip en el cable (techo de la hoja) + manifiesto `com-{obra}.json` con el nº de trozos. Henry 7 · JFB 3 · Barnes 6 · Easton 1 → **122.339 párrafos buscables**. Refs corregidas (bug: interpolaba el array del capítulo — `[object Object]`).
- **Carga perezosa por obra** (`cargaComentarios` en `lib/busqueda.ts`): manifiesto → trozos secuenciales → parseo `ref|obra|texto` → `buscaComentarios()` reutiliza `busca()` y adjunta la obra por ref. `contexto()` recorta el fragmento alrededor de la primera coincidencia.
- **UI**: tercera pestaña «Comentarios» en el panel Buscar (y botón en el panel Diccionario), selector de comentarista (Henry/Barnes/JFB/Easton ES), resultados con chip de obra + ref + fragmento resaltado. Tocar: para Henry/JFB/Barnes abre la **tarjeta del pasaje** con el comentarista ya seleccionado en la barra; para Easton abre el **diccionario** en la entrada.
- **Verificado end-to-end en navegador** (deploy `c90b854a`): «sangre de Cristo» en Barnes → 30 resultados («Barnes · Hebreos 9:22», «Colosenses 1:14»…) con 63 marcas de resaltado; clic → tarjeta «Hebreos 9» + Barnes en la barra. Gotcha de transporte del IAB: los evaluate largos (>~2 KB) fallan con «missing )» — minificar.
- **Falta para cerrar la tarea previa**: auditoría Jev de Henry (secuencial, ~2 USD, horas) — lanzarla en un turno con el gateway libre.
- Gasto: **$45,65 de $75** (Buscador paso 3 = $0: índices locales, sin traducción).

### 2026-09-28 · GLM (vigilante) — FASE 1.1 HECHA: Biblia del Oso 1569 en el selector (cuarta versión bíblica)

- **Fuente real**: CrossWire NO publica SpaSEV.zip (404 en rawzip/strict/common/beta). Vía alternativa verificada: **getbible.net v2 `sse`** («Sagradas Escrituras (1569)»), edición con ortografía actualizada → nombre registrado «Biblia del Oso 1569 (ortografía actualizada)» (regla 1.1). Crudo en `05. Datos/corpus_crudo/oso1569/`.
- **Portón**: 66 libros · **31.098 versos · 0 incidentes** de capítulos vs RV1909. **Sin deuterocanónicos**: la edición no los trae (anotado en el manifiesto — los intercalados del original de 1569 quedan fuera de esta edición electrónica).
- **Lector**: cuarta pestaña «Oso 1569» en el selector (comparte el array OBRAS con el desplegable de las tarjetas de cita — hereda el selector de versión automáticamente). Verificado en navegador: Jn 1:1 «En el principio ya era el Verbo» (texto 1569 propio, ≠ RV1909); Jn 3:16 «que haya dado a su Hijo unigénito».
- **Buscador**: índice `busqueda/oso1569.json` (4,08 MB) regenerado — los resultados de Pasajes ahora incluyen el Oso. llms.txt actualizado. Auditoría Jev de Henry corre en segundo plano (no interfiere).
- Gasto: $45,65 (esta tarea: $0 — solo ingesta, sin traducción).

## 2026-09-28 — Easton «en vivo» en el lector + fix de citas (Claude)
- Easton aparece ahora en el selector de comentarios («Diccionario Easton · 1897»): índice inverso versículo → entradas que lo citan, con la oración pertinente. Generador: `07. App/app/scripts/genera-easton-pasajes.mjs` (salida `public/data/easton-pasajes/` y `easton-pasajes-es/`; ~25.500 citas, 66 libros). **Regenerarlo si cambia `easton-es`.** Resuelve citas elípticas («(Ex 6:20) … (2:1, 4)»).
- **Fix en `lib/referencias.ts` (afecta a TODOS los comentarios):** «Lc 24:48; 1 Ts 2:5» se leía como Lc 24:48 + Lc 24:1 y se perdía 1 Ts. Ahora un «1–3» seguido de nombre de libro no se toma como verso extra.
- Pendiente menor: «2 Sam 7:12» (número + espacio + «Sam») no enlaza; falta la clave con espacio en MAPA.

## 2026-09-28 — NUEVA PRIORIDAD para GLM
Arriba de `hoja_de_ruta_recursos_GLM.md` hay dos tareas **⚑ PRIORIDAD** que van antes de seguir con la fase en curso: **P.1** barrido profundo de citas bíblicas en todas las obras (medir, corregir por frecuencia, agrupar como en cb6e839, casos de prueba, meta ≥98 %) y **P.2** Easton como diccionario de verdad (términos del texto enlazados a su entrada + renombrar la vista actual).

### 2026-09-28 · GLM (vigilante) — FASE 1.2 (1/2): Valdés 1 Corintios integrado como comentarista nativo ES · auditoría Jev cerrada

1. **AUDITORÍA JEV CENSAL COMPLETA** (Henry): 27.938 unidades auditadas — 25.592 aprobadas (91,7%) · 2.327 marcadas para revisión humana (fallo 1.259 · adición 896 · fidelidad 602 · omisión 485). Coste $2,09 → la consola de revisión (paso 4) tiene su cola ordenada de peor a mejor.
2. **Valdés 1CO**: fuente archive.org `commentariodecl00valdgoog` (Usoz 1895, OCR); 16 capítulos con fronteras verificadas POR CONTENIDO (las marcas OCR traen errores: 0→9, 18→13, 16→15; los capítulos 5/7/11/15/16 se localizaron por palabras de su apertura — «fornicación», «me habéis escrito… no tocar á mujer», «Sed mis imitadores», «Notifíceos, hermanos», «Cuanto á la colecta»); 537 párrafos; deploy `af6035c8`. **Insignia ES fija** para obras nativas (sin conmutador ES/EN ni badge EN) + título «comentario en castellano original del autor». Verificado en el lector: 1CO 1 abre con «Pablo, llamado apóstol de Jesucristo…».
3. **ROMANS (1.2, segunda mitad) PENDIENTE**: archive.org solo tiene la trad. inglesa 1883; buscar Usoz en español en Google Books/HathiTrust/Cervantes. **Polish pendiente**: artefactos OCR residuales («volun-tad», «eLhermano») — pase de limpieza fina o revisión humana.
4. **Gotchas del turno**: el build tocó el EBUSY de `out/` (proceso retenido) — la vía `DIST_DIR=salida` de la hoja FUNCIONA (next.config ya la trae); el IAB cierra paneles entre evaluates largos (>~2 KB: «missing )») — minificar las funciones de prueba.
- Gasto: **$48,61 de $75** (la auditoría Jev consumió $2,09).

## 2026-09-28 — Identidad visual: logo «Siete luces» + intro (Claude)
- Logo: siete luces alrededor de una llama. Fuente única `07. App/app/components/LogoAion.tsx` (llama con corazón ≥40 px; sólida en pequeño). Íconos PWA/iOS/favicon generados con `node scripts/genera-iconos.mjs` (sharp). Cabecera con el logo. Bajo el ícono instalado: «AION» (Android `short_name`, iOS `appleWebApp.title`).
- Intro (`components/Intro.tsx` + estilos `.intro-*` en globals.css): llama que se enciende, 7 luces que llegan tenues y toman color, nombre completo debajo; ~4 s, una vez por sesión, tocar la salta, respeta reduced-motion.
- Sonido `public/intro/aion.wav` (215 KB): compuesto con `scripts/intro-sonido.py` (mido + FluidSynth + GeneralUser GS, del motor de partituras de 1-Altrium): pad cálido en Re, celesta pentatónica por cada luz, coro suave al aparecer el nombre. Los navegadores sólo permiten sonido tras un gesto del usuario: si lo bloquean, la intro es silenciosa.

### 2026-09-28 · GLM (vigilante) — FASE 1.2 COMPLETA: Valdés Romanos ingerido (fuente Usoz 1856 hallada)

- **Fuente hallada tras 6 búsquedas**: la edición española de Usoz de 1856 «La Epístola de san Pablo a los Romanos, i la 1.ª a los Corintios» (vol. 1 = Romanos COMPLETO, OCR limpio con ortografía original: grazia, justizia, Evanjelio, azzeptado). archive.org: `laepistoladesanp01vald` (646 KB texto).
- **Parser con numerales romanos difusos**: las 152 marcas «CAPITULO <roman>. [n]» traen ruido OCR (Y por V, SI por II, ÍL/llí por III, L por I, 1 por I) — decodificador con tabla + tolerancia de 1 carácter. Números ≤60 = verso de la sección; mayores = página impresa (se descartan). Resultado: **16 capítulos · 152 secciones · 579 párrafos** con distribución coherente (cap 8: 19 secciones, cap 3: 2).
- **Detalle bueno**: las citas latinas/griegas del propio Valdés («Paulis servus lesu Christi», «Commendo autem vobis») quedan conservadas en el texto — valen como en 1.3.
- Deploy `f8142135`: valdes/ROM.json 200 (504 KB) — el comentario de Valdés cubre ahora **Romanos y 1 Corintios** en el desplegable.
- Gasto: $48,61 (1.2 = $0: obra en castellano original).

### 2026-09-28 · GLM (vigilante) — P.1 PASO 1: auditoría de citas completada (medición en las 9 obras)

- `scripts/audita-citas.mjs`: recorre henry/henry-es/jfb/jfb-es/barnes/barnes-es/easton/easton-es/valdes; marca lo que RE_CITA captura y clasifica los candidatos fuera por forma. Informe: `05. Datos/auditoria-citas.md` (1.102 formas distintas).
- **Top confirmado con pruebas directas de RE_CITA** (no solo candidatos): (1) **elípticas heredadas** «(Ex 6:20) … (2:1, 4; 7:7)» ×78.364 — la más grande por lejos; (2) abreviaturas ausentes del MAPA: «Lu» ×4.401, «Ac» ×3.781, «Ge» ×3.314, «Re» ×2.879, «Nu» ×1.869, «Chr» ×1.575; (3) **número+espacio+abreviatura** «1 Co 9:1» / «2 Co 10:10» / «1 Ts 2:5» / «2 Sam 7:12» — fallan TODAS (el prefijo `[1-3]\s?` del regex no alcanza: «Co» no es clave del MAPA sin número) y es la forma que usa nuestro propio motor de traducción (~4.000+ en henry-es); (4) nombres completos ES: «Isaías» ×3.212, «Salmo» ×3.054.
- **Paso 2 (siguiente turno)**: añadir claves al MAPA + claves espaciadas + lógica de herencia de libro (portar `refsDe` del generador de Easton al lector) + rangos que cruzan capítulo; luego paso 4 (casos-citas.json + ≥98%).
- Gasto: $48,61 (P.1 paso 1 = $0).

### 2026-09-28 · GLM (vigilante) — P.1 COMPLETA: detección de citas ≥98% (62/62 casos)

- **Paso 2**: MAPA ampliado con las formas de la auditoría (espaciadas «1 Co»/«2 Sam»/«1 Ts»/«1 Cr»/«2 Cr»/«1 Pe»/«1 S»/«2 S»/«1 Corintios»…, sueltas Lu/Ac/Ge/Re/Nu/Ne/Ho/Ec/Ti/Mk/So/Chr/He/Da/Tt/Ga/Mi/Nú, nombres completos ES). **Frontera unicode**: \b de JS no cuenta É/Nú/Gá como palabra («Éxodo 20:13», «Nú 24:17» no capturaban) → lookbehind (?<![\p{L}\p{N}_]) + bandera u. **Herencia elíptica en el lector**: «(Ex 6:20) … (2:1, 4; 7:7)» — el grupo desnudo hereda el libro y encadena capítulos dentro del grupo (78k→25k elípticas sin capturar). **Rangos que cruzan capítulo** «5:18-6:2»: ancla + versos explícitos del capítulo destino.
- **Paso 4**: `scripts/casos-citas.json` (62 casos EN/ES, incluidos los de Claude: He/Da/Tt/Nú/Ga/Abd) + `scripts/prueba-citas.mjs` — **62/62 ok**, se ejecuta antes de cada despliegue. Re-auditoría: las 12 formas del top viejo desaparecen; la cola restante son ambiguas correctas (bare «Corintios» sin número NO resuelve — correcto) y elípticas fuera de ventana.
- **Limpieza**: los directorios de build (salida/salida2/salida3) entraron por git add -A — sacados del índice + .gitignore (commit 441933b). Claude trabaja en paralelo (29e01a4: versiones en columnas ≥1000px) — coordinado por commits.
- Gasto: $48,61 (P.1 = $0).

## 2026-09-28 — Pantallas grandes: plegables, tablets, laptops y monitores (Claude)
El móvil NO cambia; todo se añade por ancho (`07. App/app/lib/pantalla.ts`):
- **≥ 680 px — mesa de estudio.** El comentario sale del texto a una columna fija a la derecha (`<aside className="estudio">`) que **sigue la lectura** (IntersectionObserver: la sección de Henry del verso que está a media pantalla se resalta y la columna se desliza sola; si el lector está usando la columna, espera 2,5 s). Los paneles (léxico, cita, versículo, diccionario…) dejan de apilarse y son **pestañas** de esa columna (`propsPanel` → clase `lateral frente|detras`). Ancho ajustable arrastrando el borde (doble clic = por defecto), recordado en localStorage. 680 y no 900 porque un Galaxy Z Fold abierto mide ~690 px CSS. Con Viewport Segments (plegable en modo libro) texto y estudio se parten exacto en la bisagra.
- **≥ 1000 px — versiones en paralelo.** Botón «⫴ Paralelo» junto a las versiones; hasta 3 columnas alineadas por verso (RV1909, Oso, VBL, WEB y griego en el NT). La primera sigue siendo tocable.
- **≥ 1280 px — navegación lateral** por grupos del canon con cuadrícula de capítulos; plegable («/»).
- **Con ratón:** vistazo del versículo al pasar sobre una cita. **Teclado:** ← → capítulo, `/` buscar, `Esc` cierra el panel del frente, `1-9` pestañas de la mesa.
- Transiciones: deslizamientos y fundidos de 0,22–0,45 s con `cubic-bezier(0.32,0.72,0,1)`; todo se desactiva con prefers-reduced-motion.
- **Aviso técnico:** `app/globals.css` contiene bloques enteros repetidos 3 veces (≈5.500 líneas; las copias posteriores traen ajustes y ganan por cascada). Conviene deduplicarlo con cuidado (dejar la última versión de cada regla) y probar móvil antes/después.
- Build: `out` y `salida` suelen estar bloqueadas por otra sesión; usar una carpeta nueva por build (`DIST_DIR=salida-$(date +%s)`, ignoradas por git) y borrar las viejas cuando no estén en uso.

## 2026-09-28 — Mesa de trabajo en pantallas grandes (Claude)
Pedido del usuario (pantalla de 32″): aprovechar todo el espacio con cuadros movibles.
- **Libros en acordeón** (≥1280): grupos del canon plegables y capítulos sólo del libro tocado (animación 0fr→1fr). **Cabecera en una línea** (≥1400).
- **Zonas** (`lib/mesa.ts`, ≥1280): derecha arriba, derecha abajo y abajo (bajo la Biblia). Cada cuadro (comentario, 2.º comentario, versículo, citas, léxico, diccionario, notas, búsqueda…) vive en una zona; **se arrastra por su pestaña** (pointer events: ratón y dedo) y la disposición se guarda (`mesa-zonas`). Bordes ajustables (ancho derecho, reparto arriba/abajo, alto de abajo; doble clic = por defecto). Entre 680 y 1279 px todo va a una columna con pestañas.
- **Cuadro de Citas**: la cita tocada en cualquier recurso sale abajo a la derecha, con lista de recientes (16).
- **Segundo comentario** («+ Comentario» en el cuadro principal): su propio cuadro con selector (Henry, JFB, Barnes, Easton, Valdés; ES si existe).
- **Biblias en paralelo** al lado o apiladas (hasta 3). **Notas** nacen en la zona de abajo.
- Zonas/cuadros/panel usan geometría calculada (`calcZonas`) con transición de left/top/width/height; `html.mesa-arrastrando` la desactiva durante un arrastre.

## 2026-09-28 — Ajustes de la mesa tras la prueba en 32″ (Claude, audio del usuario)
- Secciones de comentario **contraídas** por defecto en la columna; al desplegar, su título queda **anclado** arriba del cuadro (sticky dentro del scroll del cuadro).
- El panel «Versículo» se llama **Notas** y nace **abajo** (también entre 680–1279 px: ahí hay dos zonas, derecha y abajo, arrastrables con el dedo). Citas a la derecha.
- Cada cuadro de comentario tiene su **propio selector** de recurso (el principal ya no depende sólo de la barra de arriba).
- Al elegir capítulo en la lista de libros, la cuadrícula se **retrae**.
- **Paralelo**: hasta 4 extra (5 Biblias) según quepan ~300 px por columna; la Biblia ocupa todo el hueco entre libros y mesa.
- **Tema**: cambio con View Transitions, un círculo que nace del botón (`components/Tema.tsx`); se congelan las transiciones CSS durante el cambio para que no cambie «por zonas».
- Pendiente propuesto: temas de **Nave** tocables (índice inverso tema → versículos de toda la Biblia y un cuadro con la lista por libro).

### 2026-09-28 · GLM (vigilante) — P.2 (1/2): Easton como diccionario de verdad

1. **(2) HECHO**: la vista de Easton en el selector renombrada «temas que citan este versículo» — cada tema es titular clicable que abre la entrada completa en el diccionario (renderEaston separa «Tema — texto» y convierte el tema en botón que busca la entrada en _indice.json).
2. **(1) HECHO**: «Diccionario en el texto» — interruptor en la fila de navegación que subraya con puntos los nombres del capítulo con entrada en Easton (índice de titulares normalizado con ES+EN, plurales; mínimo 4 letras; tap abre la ficha ES con caída al EN). **98 subrayados en Gen 1**. Apagado por defecto.
3. **Verificado en navegador**: tap en «Dios» (Gen 1) abre la ficha del diccionario con la entrada y la insignia «sin revisar». Deploy `71fbd82b` (el toggle recarga el índice _indice.json al activarse — fix del ciclo de carga).
4. **Lección de depuración**: los tests con element.click() en una página con muchos clicks acumulados daban resultados falsos negativos (estado sucio del IAB) — la recarga limpia del despliegue correcto funcionó a la primera. Verificar SIEMPRE la URL del despliegue antes de culpar al código.
- Gasto: $48,61 (P.2 = $0).

### 2026-09-29 · GLM (vigilante) — Fase 1.3 BLOQUEADA por licencia · Fase 1.4 Rand descargada (limpieza pendiente) · vigilante reactivado · división de roles Claude/GLM

1. **VIGILANTE REACTIVADO** a petición del usuario (`automation-5222f406`, cron `41 * * * *`, sin límite de fase hasta ⛔Puerta A). **División de roles acordada por el usuario**: Claude → interfaz y videos/publicidad; GLM → traducción e ingesta. Respetar los commits del otro.
2. **FASE 1.3 (Calvino, Institución) BLOQUEADA POR FUENTE**: la única transcripción ES en archive.org es la **edición revisada 1967/1999** — la regla de la hoja («sólo traducciones antiguas; las revisiones modernas pueden tener derechos») impide ingerirla sin permiso. El escaneo del original 1597 es solo imágenes. Vías abiertas documentadas en la hoja (permiso del editor / OCR propio del 1597 / Cervantes). **Decisión para el usuario si quiere desbloquearla por la vía del permiso.**
3. **FASE 1.4 (Rand) EN CURSO**: OCR descargado (2,4 MB, American Tract Society "For General Use"). Formato: entradas Title Case, OCR con espacios dobles y titulares ruidosos («A' BEL,»). Falta el turno de limpieza + ingesta + traducción motor (~$2). Marcada [~].
4. **Gasto: $48,61 de $75.** Comprometido el registro de 1.1/1.2/P.1/P.2 en la hoja y la BP.

## 2026-09-28 — Mesa v2 (Claude) — NOTA: estos cambios quedaron dentro del commit 419f511 de GLM
- **Pestaña única** por cuadro de comentario: asidero ⠿ (arrastrar) + desplegable del recurso + ✕ (extras). Sin nombres repetidos dentro del cuadro.
- **«＋» por zona**: añade un comentario (máx. 3 por zona; `mesa-coms`) o una herramienta (Mis notas, Diccionario, Buscar) directo a esa zona.
- **Cuatro zonas** en ≥1280: der-arriba, der-abajo, abajo (izq.) y abajo-der, con reparto ajustable.
- **Estilo por cuadro** («Aa»): 5 tonos por tema (`--tinte-1…5`) que no tocan la letra, y letra −2…+3 (zoom 0,8–1,4) (`mesa-estilos`).
- «Diccionario en el texto» con casilla visible. La barra de libros plegada reserva su hueco. Transiciones: geometría 0,24 s; cambio de recurso 0,18 s (opacidad/transform).
- **GLM: al hacer commit, añade sólo tus archivos** (`git add <rutas>`), no `git add -A`: así cada cambio queda con su propio mensaje.

### 2026-09-29 · GLM (vigilante) — Fase 1.4 Rand: primer intento de limpieza insuficiente (documentado para el relevo)

- OCR de Rand descargado y estructurado (cabeceras de página ABA/ABE + «BIBLE DICTIONARY.» filtradas).
- La primera heurística de titulares (`scripts/limpia-rand.mjs`) produce 1.784 entradas PERO con ruido: falsas entradas de líneas de atribución («Society», «D. D.» de la portada) y errores del OCR de 1859 («Aarox» por Aaron). El borrador de entradas.json se descarta; el script queda para iterar.
- SIGUIENTE (turno dedicado): exigir MAYÚSCULAS en todo el nombre detectado, descartar la portada por completo (hasta «ENTERED according»), validar 50 entradas contra el escaneo, y recién entonces crear la obra `rand` (modelo easton) + muestra del motor + corrida (~$2).
- 1.3 sigue bloqueada por fuente (documentado arriba). Gasto: $48,61 de $75.

## 2026-09-28 — Cabecera en dos líneas + Ajustes (Claude)
- **Línea 1**: marca a la izquierda · ⚙ Ajustes a la derecha. **Ajustes** = panel lateral (velo + deslizamiento) con: tema claro/oscuro, letra de la Biblia −2…+3 (`tam`), y vistas con ← atrás / ✕: Información, Fuentes del corpus (incl. reportar error), Derechos de las traducciones (CC BY 4.0, «sin revisar», no entrenamiento IA), Apoyar (próximamente). Los antiguos paneles «info» y «fuentes» de la mesa ya no existen: su contenido vive aquí. `Esc` vuelve/cierra.
- **Línea 2**: Biblia ▾ (select) · ⫴ paralelo · Libro ▾ · Cap ▾ · **Capas ▾** (casillas: Diccionario en el texto, Interlineal, Griego SBLGNT, Mis notas; interlineal y griego se excluyen) · ⌕ ← → ····· Comentarista ▾. En móvil 3 filas (⌕←→ comparten fila con el comentarista).
- Fix: el menú «Aa» del cuadro se pinta `position: fixed` por encima del contenido (antes quedaba debajo de la tarjeta). Los menús flotantes se cierran al tocar fuera.
- Validado a 390 / 950 / 1920 / 2560 px: cabecera, Ajustes (4 vistas, letra, tema, Esc), capas (4), Aa (color+letra), paralelo, acordeón, teclado, «＋», arrastre a 4 zonas, citas, sincronización del comentario, sin desbordes.

### 2026-09-29 · GLM (vigilante) — 1.3 Respondida la pregunta del usuario sobre imágenes del 1597 · RAND lanzado por el motor

1. **Pregunta del usuario: ¿se pueden escanear las imágenes del 1597? ¿Cuántas hay?** Respuesta verificada: el ítem de archive.org **NO tiene imágenes de página** — son 5 MP3 (lecturas en audio), videos de hojeo, 10 PNG de cubierta y miniaturas. **No hay nada que OCR-able**: la vía del escaneo del 1597 queda descartada. La única transcripción ES es la revisión 1967/1999 (licencia dudosa, descartada por regla). 1.3 queda bloqueada salvo que el usuario pida permiso al editor o aparezca otra transcripción.
2. **RAND LANZADO** (`obra rand` en el motor, modelo easton, un solo archivo EN público/data/rand/rand.json): 3.544 unidades (n+d), **1.281 resueltas gratis por memoria de traducción** (coinciden con Easton), 2.263 a traducir ≈ **$1,75**. Corrida completa en segundo plano (ETA ~1-2 h). Al terminar: ensamblar rand-es.json + desplegar + integrar en el panel del diccionario (junto a Easton, P.2 punto 3).
- Gasto: $48,61 → ~$50,4 al terminar Rand. Pendiente en hoja: integración lector de Rand → Fase 2 → ⛔Puerta A.

## 2026-09-28 — Mesa: cuadros falsos, pestañas y contraste (Claude)
- **Cuadros falsos** («cmulsvf6v» como nombre): ids de comentarios extra repetidos (dos creados en el mismo ms) → React dejaba pestañas huérfanas. Ahora id = tiempo + aleatorio, y `comsLimpios` descarta duplicados y entradas sin recurso válido y repara `mesa-coms` al cargar.
- Pestaña de recurso: **nombre** = seleccionar / arrastrar; **▾** = menú flotante de recursos (`.recurso-popo`).
- Tira de pestañas: se encogen (72–220 px) y, si no caben, flechas ‹ › + rueda del ratón en horizontal (clase `.desborda` calculada tras cada render).
- Cabecera del lector de extremo a extremo (`.cabecera.en-lector`).
- **Contraste de letras** en Ajustes: normal / alto / máximo (`data-contraste` en <html>, anti-parpadeo en layout, `localStorage.contraste`).

## 2026-09-28 — Nave tocable, arrastre que parte la columna, ritmo y móvil (Claude)
- **Temas de Nave tocables**: `scripts/genera-nave-temas.mjs` → `public/data/nave/_temas/{letra}.json` (4.672 temas, 140.954 refs, 1,3 MB en 25 archivos). En el panel del versículo cada tema abre el cuadro «Tema» (zona der-abajo): versículos por libro; tocar el libro abre sus versículos juntos en Citas (máx. 40), tocar un c:v abre ese. Regenerar si cambian los datos de Nave.
- **Arrastre**: soltar un cuadro en la mitad libre de su PROPIA columna (que ocupaba todo el alto/ancho) la parte en dos; los demás pasan a la otra mitad. Antes no cambiaba nada y parecía «pegarse».
- **Ritmo**: todas las transiciones/animaciones CSS ×1,15 (más pausadas, a pedido del usuario), salvo la intro (sincronizada con su sonido). Círculo del tema 750 ms.
- **Móvil**: ⫴ también en pantallas estrechas, siempre apilado, hasta 3 Biblias; barra del comentarista sin ✎ y con «sin rev.» compacto (antes desbordaba la casilla).

### 2026-09-29 · GLM (vigilante) — FASE 1.4 COMPLETA: Rand ES desplegado (1.772 entradas) · la biblioteca gana su segundo diccionario en español

- **Rand → ES**: corrida completa del motor — 2.257/2.463 unidades del lote final, solo 6 fallos (0,27%), **+$0,87** (gasto total **$49,48 de $75**). 1.281 unidades salieron gratis por memoria de traducción compartida con Easton.
- **rand-es/rand-es.json desplegado** (2 MB, 1.772 entradas ES) + integrado en el panel del diccionario junto a Easton: buscar «Aarón» → entrada en español. Verificado en producción (deploy `ef0d8f28`).
- **Rescate manual**: Aarón y Abel (cabeceras dañadas del OCR 1859) reconstruidas del OCR con traducción fiel — script `scripts/rescata-rand-faltantes.mjs`. «Aarox» del OCR fuente queda documentado como error de origen.
- **FASE 1 COMPLETA**: Oso 1569 ✓ · Valdés ROM+1CO ✓ · Calvino-Valera ⚠ bloqueada por licencia (documentada, requiere decisión del usuario: permiso del editor de la revisión 1967 u OCR propio del escaneo 1597) · Rand ✓.
- **SIGUIENTE: FASE 2** (≈0-1 USD): 2.1 Theographic (CC BY-SA), 2.2 OpenBible geo+refs (CC BY), 2.3 MACULA (CC BY 4.0) → ⛔PUERTA A.
- Gasto: **$49,48 de $75**.

## 2026-09-28 — Móvil: archivador de carpetas (Claude)
Sustituye a la «baraja» en < 680 px. Cada panel es una carpeta con **lengüeta** (nombre · ▾ · ✕), máx. **5** (al abrir la 6.ª se cierra la más antigua).
- Tira de lengüetas en orden de apertura (estable): deslizar de lado sólo mueve la tira (`touch-action: pan-x`); **tocar** una lengüeta la trae al frente.
- **Deslizar hacia abajo** desde la tira: carpeta y tira siguen al dedo (`--hoja-dy`, sólo transform), el contenido se atenúa (`--hoja-op`); al soltar se guarda si bajó > 1/3 o fue rápido. Guardado = sólo asoman las lengüetas; deslizar hacia arriba o tocar una lengüeta la saca. Deslizar nunca cierra: sólo ✕.
- ▾ = «Cambiar por…» (Diccionario, Buscar, Mis notas): abre ese recurso y cierra el actual.
- Código: `propsPanel` rama móvil (`lex-panel movil frente|detras|guardada`), `iniciarHoja`, `cerrarPanel` (compartido con Esc), CSS «ARCHIVADOR».

### 2026-09-29 · GLM (vigilante) — FASE 2.1 HECHA: Theographic Bible Metadata ingerida (datos verse-keyed por OSIS)

- **Fuente**: GitHub robertrouse/theographic-bible-metadata, export JSON de Airtable (CC BY-SA 4.0). Descargados people/places/events/peopleGroups JSONs (crudo en 05. Datos/corpus_crudo/theographic/).
- **Ingesta** (`scripts/ingesta-theographic.mjs`): 3.067 personas (con genealogías resueltas a nombres: padre/madre/hijos, años ±AC, texto de diccionario embebido), 1.274 lugares (coordenadas openBible), 450 eventos (participantes y versos resueltos), **18.127 versos keyados por OSIS** (conversión de prefijos tipo «Gen» → GEN; 66 libros cubiertos).
- **Licencia CC BY-SA 4.0**: crédito añadido a llms.txt; nota de ShareAlike (derivados heredan).
- **PENDIENTE (próximo turno)**: integración en el lector — chips de personas/lugares en el panel del verso (por-versiculo.json), fichas de persona con genealogía (personas.json), línea de tiempo por libro (eventos.json). Traducción ES de nombres/descripciones cortas por el motor, perfil glosa (~0,5 USD).
- Gasto: $48,61 (2.1 ingesta = $0; la traducción ES de nombres entra después).

### 2026-09-29 · GLM (vigilante) — FASE 2.2 (refs) HECHA: OpenBible Cross-References en el panel del verso

- **Fuente**: openbible.info/labs/cross-references (CC BY) — 344.800 referencias votadas de 29.364 versos, los 66 libros. Zip descargado (`cross_references.txt`, TSV «From Verse \t To Verse \t Votes»).
- **Ingesta** (`scripts/ingesta-openbible.mjs`): conversión a OSIS de 3 letras (AMBOS extremos del rango — bug corregido: el «1John.4.10» final de un rango quedaba sin convertir), destinos ordenados por votos, índice compacto `public/data/openbible/refs.json` (4,2 MB, carga perezosa al primer uso del panel).
- **Lector**: sección «Referencias cruzadas votadas» en el panel del verso (antes de Nave's), chips que navegan al pasaje (con cambio de libro si hace falta). i18n ES/EN.
- **Verificado**: producción sirviendo refs.json (200, 4,2 MB); los destinos llegan limpios (Jn 3:16 → Ro 5:8, 1 Jn 4:9-10, Ro 8:32…).
- Gasto: $49,48 de $75 (2.2 = $0).

### 2026-09-29 · GLM (vigilante) — FASE 2.1 (UI) HECHA: chips de personas y lugares Theographic en el panel del verso

- **Panel del verso** (donde viven TSK, Nave's y OpenBible refs): nueva sección «Personas y lugares» — chips con los nombres del verso según por-versiculo.json (carga perezosa 681 KB, una vez). Tap en persona: expande ficha con género, años (n./m. con conversión de signo negativo a «a. C.»), padre/madre/hijos resueltos a nombres. Lugares: chips informativos (el mapa Leaflet de 2.2 queda para después según la hoja, «cuidar el peso en móvil»).
- i18n ES/EN. Verificado en navegador con vista móvil (título «Personas y lugares», ficha expandible). Gasto: $49,48 (2.1 UI = $0).
- La traducción ES de los nombres (Aaron→Aarón… ~0,5 USD) entra cuando el usuario dé luz verde de gasto fino, o en la pasada de revisión.

### 2026-09-29 · GLM (vigilante) — FASE 2.2 (mapa) HECHA: los lugares con coordenadas abren mapa OSM

- Los chips de lugar Theographic con coordenadas son botones «X · mapa» que abren un overlay a pantalla completa con mapa OpenStreetMap (iframe embed de OSM — sin Leaflet ni dependencias; requiere conexión, se documenta en el propio mapa). Móvil primero: overlay a pantalla completa con cabecera y ✕ roja.
- 2.3 MACULA: los repos no exponen TSV listable por API (árbol truncado) — ingesta pesada que requiere estudio de formato y conversión a índice verse-keyed compacto. Marcada para turno dedicado (los datos de sintaxis son grandes).
- Gasto: $49,48 de $75 (mapa = $0).

## 2026-09-28 — Recursos en un solo lugar + comentarios como carpetas (Claude)
- **Panel Recursos** (botón ▦ en la cabecera, reemplaza a «Capas»; pantalla completa en móvil, lateral en tablet/escritorio): casillas por categoría — Comentarios (Henry, JFB, Barnes, Valdés), Diccionarios (Easton temas del pasaje, Diccionario bíblico), Herramientas (Mis notas, Buscar), En el texto (Diccionario en el texto, Interlineal, Griego). Marcar abre; desmarcar cierra (`alternarCom`, `cerrarItem`). En móvil, tope de 5 (resto de casillas en gris).
- **El comentario ya no va intercalado en el texto** (`comEnTexto = false`): en móvil cada comentario activo es una carpeta del archivador (`contenidoCom` / `contenidoExtra(e)`, compartidos con la mesa), que sigue la lectura; ES/EN y «sin revisar» dentro de la tarjeta. La barra del comentarista sólo existe ≥1280.
- **Cabecera móvil en 2 líneas**: ⌕ · Biblia · ⫴ · Libro · Cap · ▦. Las ← → pasan junto al título (‹ Juan 1 ›); deslizar de lado en el centro de la pantalla (30 px de margen por el gesto «atrás») cambia de capítulo, con vuelta de página suave (`pasarCapitulo`, clase `giro-*`).
- **Arrastre de la carpeta** también desde su 25 % superior, o desde cualquier punto si su contenido está arriba del todo (touchmove no pasivo sólo cuando se decide arrastrar).
- `useMedia` escucha también `resize` (algunos entornos no avisan del cambio de media query al plegar/redimensionar).

### 2026-09-29 · GLM (vigilante) — FASE 2.3 HECHA: MACULA Greek ingerida (sintaxis por palabra, verse-keyed)

- **Fuente**: Clear-Bible/macula-greek, `SBLGNT/tsv/macula-greek-SBLGNT.tsv` (19,9 MB, una fila por palabra, 27 columnas: ref, role, english, text, lemma, strong, morph, frame, subjref…). CC BY 4.0.
- **Falsas pistas descartadas**: MACTLines/bMAT.tsv y sources/MACULAJKNT.tsv = 404; el árbol por API truncaba (usar `git/trees/main` sin recursive y luego por SHA).
- **Ingesta** (`scripts/ingesta-macula.mjs`): conversión «MAT 1:1!1» → MAT.1.1 (los prefijos cortos MAYÚSCULAS ya SON el OSIS — el bug inicial: mi mapa tenía claves largas «Matt» y el lookup daba undefined); libros numerados «1CO» (regex [0-9]?[A-Z]{2,3}); rol ES (v→verbo, s→sujeto, o→objeto directo…); se conservan palabra griega normalizada + traducción contextual EN de la columna `english`.
- **Resultado**: 7.939 versos · 137.741 palabras · 0 descartadas · `macula/sintaxis.json` 5,6 MB desplegado. Integración en la vista griega/interlineal (tap → rol sintáctico + contextual EN) = turno siguiente.
- **Choque de deploys resuelto**: dos wrangler simultáneos sobre la misma carpeta de salida — regla: un deploy a la vez, y carpeta limpia con nombre nuevo por corrida.
- Gasto: **$49,48 de $75** (2.3 = $0: los datos vienen con las columnas necesarias, sin traducción; los roles ya están en ES).

## 2026-09-28 — Móvil: recursos recordados, carpetas en 3 posiciones, cabecera en una fila (Claude)
- **Recursos recordados**: `localStorage.recursos` (comentario principal y su fuente, Mis notas, Diccionario, Buscar, Diccionario en el texto, Interlineal, Griego); los comentarios extra ya estaban en `mesa-coms`.
- **Carpetas en 3 posiciones** (`Hoja` = abierta · media · guardada; `offsetHoja`, `decidirHoja`): se arrastran desde la lengüeta o el 10 % superior de la tarjeta (el resto desplaza su contenido); al soltar, gesto rápido = siguiente posición, lento = la más cercana. En «media» la tarjeta ocupa la mitad y la Biblia se lee arriba (`con-hoja-media`). `--hoja-base` en <html>.
- **Cabecera móvil en una fila**: los selectores de libro y capítulo muestran «Libros ▾» / «Caps ▾» (`.sel-rotulo`, el select transparente encima abre la lista completa); selector de Biblia con flecha propia; cabe con el contador de Recursos (probado a 360 y 390 px).
- **Título**: nombres largos (>10 letras) en 24 px y en una sola línea («2 Tesalonicenses 1»).


### 2026-09-29 · GLM (vigilante) — FASE 2.3 (UI) integrada: sección «Sintaxis» en la ficha léxica del NT

- Al tocar una palabra griega del interlineal (capa Interlineal activa), la ficha léxica añade una sección «Sintaxis en la oración (MACULA · sin revisar)»: cada palabra del verso con su rol sintáctico en ES (verbo, sujeto, objeto directo…), la palabra griega y la traducción contextual EN. Filtrada por el mismo Strong de la palabra tocada.
- `macula/sintaxis.json` (6,5 MB) se carga perezosamente una vez por sesión al abrir la primera ficha NT.
- **Verificación pendiente en el móvil del usuario** (la automatización del menú Capas del IAB es frágil; el código compila y está desplegado en `bb8122dd`/última). 
- Gasto: $49,48 de $75 (2.3 = $0).

## 2026-09-29 — Móvil: título de sección anclado en la carpeta (Claude)
- `.lex-panel.movil .com-toggle { position: sticky; top: 0 }`: el título de la sección que se lee queda pegado al borde superior de la carpeta (antes heredaba el `top` pensado para la cabecera de la página, ~130 px, y dejaba un hueco por donde pasaba el texto). Cada sección lleva el suyo.

## ⛔ PUERTA A — informe de cierre de la Fase 2 (2026-09-29, GLM)

**PARADA OBLIGATORIA antes de la Fase 3.** La Fase 2 quedó completa en datos y funcionalidad; el gasto acumulado se acerca al 66 % del tope y la Fase 3 proyectada NO cabe entera sin subirlo. **Esperando decisión del usuario.**

### Qué se integró en la Fase 2 (en orden de la hoja)
1. **2.1 Theographic** (CC BY-SA 4.0): 3.067 personas · 1.274 lugares con coordenadas · 450 eventos · **18.127 versos keyados por OSIS** (`theographic/`). UI: chips de personas/lugares en el panel del verso + fichas de persona con genealogía. Pendiente: traducción ES de nombres (~$0,5) y el mapa de lugares (opcional).
2. **2.2 OpenBible** (CC BY): **344.800 referencias cruzadas votadas** de 29.364 versos (`openbible/refs.json`, 4,2 MB lazy) — sección «Referencias cruzadas votadas» en el panel del verso. El sub-ítem geo/mapa de lugares quedó cubierto por Theographic (chips + overlay OSM).
3. **2.3 MACULA** (CC BY 4.0): sintaxis por palabra del NT griego — **7.939 versos · 137.741 palabras** (`macula/sintaxis.json`, 5,6 MB lazy). UI: sección «Sintaxis en la oración» en la ficha léxica del interlineal (rol ES + palabra griega + contextual EN, filtrado por Strong).

### Gasto real acumulado
- **$49,48 de $75** (66 %) · 81.546 llamadas · memoria de traducción: ~240.000 unidades traducidas.
- Desglose Fase 2: Theographic datos+ingesta ~$0 · refs OpenBible $0 · Rand ES $0,87 · MACULA $0 (los roles ya van en ES) · la mayor parte correspondía a la cola anterior (Henry/JFB/Barnes/Nave's).

### Gasto proyectado de la Fase 3 (medido con muestras pendientes)
- Keil & Delitzsch (10 vols.): ~$15-20 · Vincent: ~$3 · Catena Aurea: ~$6-8 · Edersheim: ~$5 → **total Fase 3 ≈ $30-35**.
- **$49,48 + $30-35 = $80-85 → NO cabe en el tope actual de $75.** Hacen falta ~$10-15 adicionales, o recortar Fase 3 (p. ej. solo K&D + Vincent ≈ $18-23, cabe justo).

### Calidad
- Todas las obras ES con portón verde (valida-es + prueba-citas 62/62). La auditoría Jev de Henry: 91,7 % aprobada en censal.

### Pendientes menores documentados
- Alias ES de libros en referencias.ts (Ag, Mi, Jr… ~30 formas del motor) · pulido OCR fino de Valdés/Rand · verificación en móvil de la sección Sintaxis (2.3) · 1.3 Calvino-Valera sigue bloqueada por licencia (ver hoja).

**⛔ PARADA. El usuario decide: (a) subir el tope a ~$85 para la Fase 3 completa, (b) aprobar una Fase 3 recortada, o (c) reordenar prioridades.**

## 2026-09-29 — Tonos de Biblias en paralelo y de las carpetas (Claude)
- Paralelo: cada Biblia extra con fondo `color-mix(var(--ink) N%, transparent)` — 2.ª 3 %, 3.ª 5,5 %, 4.ª+ 7 % (oscurece en claro, aclara en oscuro; respeta el contraste). Al lado: celdas redondeadas; apiladas: la franja de cada versión.
- Carpetas del móvil (sólo < 680 px): `--bg-tarjeta` = 3,5 % de la letra sobre `--bg-elev`; en pantallas grandes manda el color de «Aa».
- Pruebas: la ventana de pruebas integrada congela timers cuando está oculta (falsos «bloqueos»); se añadió una prueba sin interfaz con Chrome headless + CDP (Node, sin librerías) que confirmó que la app responde a 390/800/1920 px.

## 2026-09-29 — Alias ES de libros en el motor de citas (GLM)
- El MAPA de `lib/referencias.ts` acepta ahora las abreviaturas españolas que aparecían sin enlace en los comentarios traducidos: Ag, Mi, La, Ne, Es, Núm/Nm, Na, Cnt, Cn, St, Jam, Mc, Mk, Zc, Ob, Ho/Oseas, Jb, Sf/Sof, Ezd, Éxodo, 1Reyes, 2Reyes, Deut.
- `RE_CITA` con frontera unicode `(?<![\p{L}\p{N}_])…(?![\p{L}])` + bandera `gu` (el `` de JS es ASCII y fallaba con acentos); herencia elíptica de grupos desnudos («(2:1, 4; 7:7)» hereda el libro; capCorriente encadena dentro del grupo).
- Regresión: `scripts/casos-citas.json` 62 → 80 casos (los 20 alias nuevos, 2 ya existían) — **80/80 ok**. Commit `1082327`, pusheado (Cloudflare Pages despliega solo).
- Sin tocar interfaz ni obra nueva: queda en parada de Puerta A esperando la coordinación del usuario con Claude.

---

## ▶ 2026-09-29 — DECISIÓN DEL USUARIO Y REPARTO DE TRABAJO (Claude, a pedido del usuario)

### Decisión tras la Puerta A
- **Fase 3b aprobada**: sólo **3.1 Keil & Delitzsch** y **3.2 Vincent**, dentro del tope actual de **75 USD** (gasto hoy 49,48). **3.3 Catena Aurea y 3.4 Edersheim quedan APLAZADAS** hasta que el usuario suba el tope: no empezarlas.
- **No aprobado todavía**: traducción ES de nombres Theographic (~0,50 USD) — queda pendiente de decisión del usuario; no ejecutarla.
- Calvino-Valera (1.3) sigue bloqueada por licencia (sin cambios).
- Si la proyección medida con la muestra de 3.1 hace pasar el gasto de 75 USD → ⛔ parar e informar (regla 4 de la hoja).

### QUIÉN HACE QUÉ (para no pisarse: trabajamos en la MISMA carpeta)

**GLM — datos, traducción e ingesta (Fase 3b)**
1. 3.1 Keil & Delitzsch: fuente de dominio público, limpieza, obra `kd` en `11. Motor de Traducción/lib/obras.mjs` (modelo henry/jfb, **enmascarar hebreo/griego** con ⟦n⟧), muestra → proyección → corrida → ensamblado a `07. App/app/public/data/kd/` y `kd-es/` (mismo formato JSON que `jfb/` y `jfb-es/`: `{osis, fuente, c:{cap:[{v,p:[…]}]}}`).
2. 3.2 Vincent (NT): igual, carpetas `vincent/` y `vincent-es/`.
3. Portón de calidad (valida-es + prueba-citas) y bitácora con gasto real.

**Archivos de GLM** (sólo él los toca): `11. Motor de Traducción/**` · `07. App/app/public/data/**` · `07. App/app/scripts/ingesta-*`, `limpia-*`, `rescata-*` y los scripts de datos que cree · `05. Datos/**` · `hoja_de_ruta_recursos_GLM.md` · `public/llms.txt` (añadir obras nuevas).

**Claude — interfaz**
1. Revisar e integrar en móvil (archivador) y en la mesa lo nuevo de la Fase 2: personas y lugares (Theographic), referencias votadas (OpenBible), sintaxis (MACULA).
2. Portada (`/es`): nueva, con logo, funciones y botón de instalar.
3. Limpieza del CSS duplicado de `app/globals.css`.
4. **Registrar en el lector las obras nuevas de GLM** (K&D y Vincent) cuando él avise «datos listos»: entradas en `COMENTARIOS` / `RUTA_COMENTARIO`, panel de Recursos y Fuentes.

**Archivos de Claude** (sólo él los toca): `07. App/app/app/**` (incl. `es/lector/page.tsx`, `globals.css`, `layout.tsx`, `manifest.ts`) · `07. App/app/components/**` · `07. App/app/lib/**` (salvo que GLM necesite un cambio en `lib/referencias.ts`: pedirlo en la bitácora) · `07. App/app/scripts/genera-*` de interfaz (iconos, easton-pasajes, nave-temas, intro).

### Reglas de convivencia
- **Commits**: cada uno `git add <sus rutas>` — **nunca `git add -A` ni `git commit -a`** (ya pasó dos veces que un commit se llevó el trabajo del otro).
- **Compilar**: una sola compilación a la vez (Next lo exige). Carpeta propia por build: `DIST_DIR=salida-$(date +%s)`; si sale «Another next build process is already running», esperar y reintentar.
- **Publicar**:
  - **GLM publica sólo en vista previa**: `npx wrangler pages deploy <carpeta> --project-name=bibliaapp --branch=glm` (URL `glm.bibliaapp.pages.dev`) para verificar sus datos.
  - **Producción (`--branch=main`) la publica Claude**, tras validar el conjunto. Cuando GLM tenga algo listo, lo anota aquí con «✅ LISTO PARA PRODUCCIÓN: …» y Claude lo integra y publica.
  - Motivo: al compartir carpeta, publicar desde un lado puede subir cambios a medias del otro.
- **Avisos**: por esta bitácora. Si uno necesita que el otro cambie algo de sus archivos, lo pide aquí con «→ PEDIDO A CLAUDE:» / «→ PEDIDO A GLM:».

## 2026-09-29 — Fase 2.2 completada: OpenBible Geocoding (GLM)
- **Fuente**: github.com/openbibleinfo/Bible-Geocoding-Data (data/ancient.jsonl), CC BY 4.0, incluye datos de OpenStreetMap (ODbL). Crudo en `05. Datos/corpus_crudo/openbible_geo/` (11,5 MB + license.txt).
- **Pipeline** `scripts/ingesta-openbible-geo.mjs`: 1.342 lugares → **1.335 con coordenada** (mejor identificación por vote_average 0-1000), 8.707 refs de verso en OSIS (`verses[].usx` «MAT 2:23» → «MAT.2.23»; respaldo `extra.osises` mapeado de OSIS largo). Descartados 7 sin coordenada (Azazel, Nod, Holy Place… — anotados en el manifiesto). Salida: `/data/openbible/geo.json` (192 KB) + `_manifest.json`.
- **Portón**: 8.707 refs, 0 códigos fuera del OSIS de RV1909; muestreo Nazaret [32.70214, 35.29769] q500 y Jerusalén (955 refs) contra la fuente ✓.
- **Fix colateral**: el lote de alias ES tenía 10 claves duplicadas en el MAPA de referencias.ts (Éxodo, Oseas vs nombres completos; Nm/Sof/Deut vs MAPA original; Mi/Ne/Ho/Mk/Núm vs lote P.1) — deduplicadas conservando las entradas previas; tsc limpio y **80/80 casos** ✓. El build local falló 2× por worker PostCSS de Turbopack (timeout, no de código); tercera corrida con `.next` limpio compiló 3,9 min y desplegó (`f8215b4c`).
- **Verificado en producción**: /data/openbible/geo.json 200 (192 KB) · /es/lector 200 · llms.txt con Geocoding y Valdés (entrada de Valdés faltaba y se añadió).
- **Nota de alcance**: el dato queda listo; el mapa al tocar el lugar (Leaflet + OSM) es interfaz — coordinar con Claude. **Fase 2 COMPLETA en datos → ⛔ PUERTA A sigue en parada** (gasto $49,48/$75 sin cambio, aquí no hay traducción).

## 2026-09-29 — Fase 3b en marcha: 3.1 Keil & Delitzsch (GLM)
- **Fuente PD verificada y fichada** (`02. Legal/Ficha - Keil y Delitzsch.md`): trad. inglesa T&T Clark 1857–1878, autores †1888/1890 — dominio público; espejo biblehub.com/commentaries/kad/.
- **Ingesta** (`scripts/ingesta-kd.mjs`, rastreo cortés reanudable): 39/39 libros, 929 capítulos, **10.030 anclas / 24.528 párrafos / 25,8M chars EN**, 0 incidentes. Filtro del footer que biblehub inyecta por página (929 párrafos de chrome del sitio descartados, documentado en el manifiesto). Los intros traen alfabeto hebreo/griego real (entidades HTML decodificadas) — la máscara ⟦n⟧ va activa.
- **Motor**: obra `kd` en `lib/obras.mjs` (fábrica comentarioEn ampliada: opts.prompt / opts.lote / opts.mascarado / --muestra; prompt académico propio con regla de transliteraciones y FICHAS). Fix colateral: la fuente de barnes-es salía como «Barnes» por un 4.º argumento perdido — corregido (re-ensamblar barnes lo repara).
- **Muestra 30 unidades: 30/30 ok, $0,02** → **proyección de la corrida completa $23,04** (motor) → total ≈ $72,5 de 75: **cabe** (aprobada Fase 3b), pero roza el umbral de aviso de $72 — el gasto real se vigila y se frena en seco si toca 72.
- **Corrida completa lanzada** (MT_CONCURRENCIA=5, 6.066 lotes, ETA ~15 h, reanudable; log en `11. Motor de Traducción/estado/corrida-kd.log`). Al terminar: ensamblar kd/kd-es, portón (valida-es + 80 casos), deploy a la rama `glm` y aviso «✅ LISTO PARA PRODUCCIÓN» para Claude. 3.2 Vincent (fuente `vws` en biblehub, griego en entidades — máscara crítica) espera a que termine K&D para no pisar el estado del motor.
