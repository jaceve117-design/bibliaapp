# Bitácora de progreso

**Proyecto:** Biblioteca cristiana digital — Biblias, comentarios, diccionarios, teología, enciclopedias y manuscritos.
**Carpeta madre:** `20. Biblias_Comments_Dicionarios`
**Inicio:** 2026-09-14
**Estado global:** Construcción en curso — núcleo 6/6 ingerido · PWA desplegada · traducción de Matthew Henry avanzando por Juan.
**No hay directiva operativa activa. D-001 cerrada el 2026-09-21; queda una deuda de exactitud declarada sobre la tabla morfológica griega.**

---

# ⚠️ DIRECTIVA OPERATIVA ACTIVA — LEER ANTES DE CADA TURNO

> **Para la automatización de GLM.** Este bloque se lee **primero**, en cada turno, antes de continuar con cualquier traducción.
> Si hay una directiva marcada `ACTIVA`, **la directiva manda sobre la traducción de Matthew Henry.**
> Cuando una directiva se completa, se marca `CUMPLIDA` con fecha y se reanuda el ciclo normal.

---

## Cláusula permanente · Reserva de cuota

**Vigente desde 2026-09-20. No caduca.**

La automatización **se detiene por sí sola cuando la cuota semanal restante baja al 10 % o menos.**

Al detenerse:
1. Termina limpiamente el incremento en curso — nunca dejar una sección a medias ni un commit parcial.
2. Anota en `bitacora_progreso_GLM.md`: fecha, cuota restante y punto exacto donde quedó.
3. **No reanuda sola.** Espera instrucción explícita del usuario.

El 10 % es reserva operativa: existe para que quede margen de trabajo manual y de corrección de urgencias hasta el reinicio del ciclo semanal.

---

## Directiva D-001 · `CUMPLIDA` · 2026-09-21 · Ventana de integración

**Emitida** 2026-09-20 por Claude · **cerrada** 2026-09-21 por Claude.

> ⚠️ **Lección registrada.** Esta directiva numeraba sus tareas “paso 0…paso 5” y el plan propio de GLM también numera “paso 0…paso 7”. Las dos numeraciones colisionaron y GLM ejecutó su paso 6 (cierre del núcleo) en vez del de la directiva. El fallo fue de la directiva, no de GLM.
>
> **Regla nueva:** las tareas de una directiva se identifican **`D-NNN.n`** (p. ej. `D-001.3`), nunca “paso N” a secas. “Paso N” queda reservado en exclusiva al plan de `bitacora_progreso_GLM.md`.

| Tarea | Estado |
|---|---|
| `D-001.0` Pausar Matthew Henry limpiamente | ✅ hecha por GLM |
| `D-001.1` Refactor del selector de comentario | ✅ **resuelta de otra forma** — innecesaria: el interlineal, el léxico y Nave's cargan por su propia vía y no compiten con el comentario. Se reabrirá cuando entre una **segunda obra de comentario** (JFB), que es cuando el booleano `comentario` sí estorba. |
| `D-001.2` Cablear la morfología en español | ✅ hecha por Claude 2026-09-21 |
| `D-001.3` Atribución CC BY 4.0 de STEPBible | ✅ hecha — ampliada a las etiquetas traducidas y a Nave's |
| `D-001.4` Cotejar la tabla griega contra el intro de TAGNT | ❌ **NO HECHA.** Deuda de exactitud, no legal — ver bloqueo abajo. |
| `D-001.5` Cerrar la ventana y reanudar Henry | ✅ ventana cerrada · Henry sigue en pausa **por orden posterior del usuario**, no por esta directiva |

### ⚠️ Bloqueo abierto que sobrevive a esta directiva

La tabla morfológica **griega** sigue con `verificada_en_fuente: false`. Se reconstruyó sobre el esquema Robinson/Tauber porque el intro oficial de TAGNT vive en un Google Doc que no es accesible programáticamente.

**Corrección (2026-09-21):** esto se etiquetó mal como incumplimiento de C1/C2. **No lo es.** C1 exige la fase legal cerrada antes de ingerir y C2 las doce preguntas contractuales de la ficha; ninguna habla de cotejar legendas. La regla de *«cita literal, no interpretación»* está en el brief `01.0` y es **sobre la licencia**, que en STEPBible sí está verificada, archivada y atribuida.

Lo que sigue sin verificar no es la licencia sino **el significado de los códigos gramaticales**: es deuda de **exactitud académica**, no de cumplimiento legal. Importa — es una herramienta de estudio bíblico — pero es otra categoría. La tabla hebrea sí está cotejada contra la legenda oficial de OpenScriptures.

Riesgo real: bajo. La cobertura medida sobre datos reales es del 99,7 % y las etiquetas de muestra son correctas. Pero es deuda declarada, no resuelta. Se cierra cuando alguien con acceso al documento coteje las ~80 entradas de la sección `griego` de `06. Traduccion/morfologia/morfologia-atomos-es.json`, corrija lo que discrepe y regenere.

---

## Cola posterior · no ejecutar sin directiva propia

Siguiente lote de traducción barata, por orden de valor por esfuerzo. **Se programa más adelante**, en su propia ventana, no dentro de D-001:

1. **Glosas de TBESH y TBESG** — 22.717 definiciones breves del léxico hebreo y griego. Es lo que completa el interlineal en español: las etiquetas morfológicas ya están en español, la definición de la palabra aún no.
2. **Easton en español** — 3.962 entradas, ya ingerido en inglés.
3. **Nombres de tema de Nave's** — 4.672 temas, ya ingeridos y visibles en inglés.
4. **Encabezados del TSK.**

Y como decisión de producto pendiente del usuario: **traducir JFB completo antes de terminar Henry**, para dar comentario en el 100 % de los versículos en vez de profundidad en el 0,5 %. Requiere antes las fichas legales de JFB, Barnes, Nave's y SBLGNT (regla C1: nada entra sin ficha).

---

## Cómo usar esta bitácora

Este archivo es la **fuente única de verdad** del proyecto. Cualquier persona o IA que entre a trabajar aquí lee este archivo primero y no necesita nada más para ubicarse.

Reglas de uso:

1. **No se borra nada.** Los pasos completados se marcan, no se eliminan. El historial es parte del valor.
2. **Cada paso terminado se anota** en la sección *Registro cronológico* al final, con fecha, quién lo hizo (Claude / GLM / Humano) y qué archivos tocó.
3. **Los estados son:** `[ ]` pendiente · `[~]` en curso · `[x]` hecho · `[!]` bloqueado o con decisión pendiente.
4. **Si una decisión cambia**, se anota en *Decisiones tomadas* con la fecha y el motivo. No se reescribe la decisión anterior.
5. **Nada entra al repositorio de datos sin su ficha de licencia.** Es regla dura, ver Fase 2.
6. **El bloque de directiva operativa se lee primero, en cada turno.** Una directiva `ACTIVA` tiene prioridad sobre el ciclo normal de traducción. Al completarla se marca `CUMPLIDA` con fecha y se reanuda el ciclo.

---

## Decisiones tomadas

| # | Decisión | Valor | Fecha |
|---|---|---|---|
| D1 | Corpus de arranque | **Solo material libre** (dominio público + licencias permisivas). Material licenciado se evalúa después, si vale la pena. | 2026-09-14 |
| D2 | Traducción al español | **Sí, traducimos todo** el material relevante que solo exista en inglés. Con el cuidado que exige la naturaleza de los documentos: traducción asistida + revisión, glosario teológico fijo, marcado de procedencia y trazabilidad al original. | 2026-09-14 |
| D3 | Tradición del curado | **Protestante.** Define priorización de obras, redacción de fichas y voz editorial. | 2026-09-14 |
| D4 | Acceso | **Lectura anónima primero.** Notas y subrayados en local. La cuenta de usuario llega después, para sincronización. | 2026-09-14 |
| D5 | Almacenamiento | **Todo en base de datos propia.** Sin dependencia de APIs externas en runtime. Offline obligatorio. | 2026-09-14 |
| D6 | Prioridad de plataforma | **Web y tablet primero**, luego móvil. El diseño arranca en breakpoint tablet/desktop. | 2026-09-14 |
| D7 | Idiomas | **ES principal, EN secundario.** Arquitectura multi-idioma desde el día uno. | 2026-09-14 |
| D8 | Postura legal | Protección desde el inicio: procedencia por obra, atribuciones visibles, cero scraping, términos y avisos redactados antes del lanzamiento. | 2026-09-14 |
| D9 | Referencia canónica | **OSIS** (`John.3.16`) como estándar. Sustituye el formato propio `GEN.1.1` de `01.1`. Entrada del usuario normalizada con `bible-passage-reference-parser`. | 2026-09-15 |
| D10 | Formato de ingesta | **USFM 3** primario · OSIS de respaldo · ZefaniaXML solo como último recurso. | 2026-09-15 |
| D11 | Motor offline | **SQLite sobre WebAssembly + IndexedDB** en web, SQLite nativo en móvil, con esquemas e índices compartidos. | 2026-09-15 |
| D12 | Sincronización | **CRDT** con UUID generado en cliente y marca de tiempo UTC de alta resolución. Se diseña ahora, se implementa en Fase 7. | 2026-09-15 |
| D13 | Software GPL | **No se embebe.** Del ecosistema SWORD usamos catálogo y formato de datos, nunca la biblioteca. | 2026-09-15 |
| D14 | Traducciones con derechos | Si alguna entra, es por **contrato directo**, nunca vía API.Bible, y vive en una capa que no se cachea offline ni entra al índice semántico. Motivo: las condiciones de API.Bible (la caché caduca a los 30 días, telemetría FUMS obligatoria, prohibido procesar con LLM) son incompatibles con D4, D5 y la Fase 4. | 2026-09-15 |
| D15 | Capa de IA | Toda respuesta generada **cita su fuente** (`source_id` + `passage_id`) o no se emite. | 2026-09-15 |
| D16 | Prioridad de producto | **La traducción al español es el producto central.** El lector es el envase; cuando haya conflicto de prioridad, gana la traducción. *(finalistas: Claude A1)* | 2026-09-17 |
| D17 | Método de desarrollo | **Corte vertical:** un libro piloto (Romanos o Juan) de punta a punta antes de cualquier ingesta masiva. *(finalistas: Claude A2)* | 2026-09-17 |
| D18 | Corpus MVP | **Núcleo mínimo de 6 fuentes** (RV1909, WEB, STEPBible-Data, Easton, Matthew Henry, TSK) + cierre del núcleo (SBLGNT, JFB, Barnes, Nave's). ISBE y el resto pasan a segunda ola. *(finalistas: Claude A3 + GLM A1/A6)* | 2026-09-17 |
| D19 | Mar Muerto | **Módulo general aplazado a post-v1.** Cuando entre, solo el ángulo Qumrán ↔ texto masorético anclado al versículo. *(finalistas: Claude A4/A5)* | 2026-09-17 |
| D20 | Calidad de traducción | **Puerta dura:** no se escala la ingesta hasta aprobar la revisión editorial humana del piloto. Escalar una traducción mediocre es el único error irreversible. *(finalistas: Claude E12)* | 2026-09-17 |
| D21 | Búsqueda semántica | **pgvector aplazado a post-MVP.** El MVP busca con `tsvector` (spanish/english); la búsqueda "por idea" provisional sale de TSK + Nave's + lemas. *(finalistas: GLM C3)* | 2026-09-17 |
| D22 | Tercera ola del corpus | **Confesiones y patrística.** Tras la segunda ola (ISBE, Clarke, Gill, Calvino, Keil & Delitzsch, Vulgata/LXX/TR, Sefaria, Pleiades) entra el bloque que hoy falta: confesiones y catecismos históricos (Westminster, Heidelberg, Dordrecht, Segunda Helvética) y padres de la iglesia (edición Schaff). Cubre el hueco de teología sistemática: el corpus actual explica qué dice cada pasaje, no qué cree la tradición ni de dónde sale. | 2026-09-20 |
| D23 | Prioridad de traducción | **Los gloss del léxico y el vocabulario morfológico se traducen antes que más prosa de comentario.** Unos miles de definiciones breves (TBESH/TBESG) y un vocabulario cerrado de etiquetas morfológicas desbloquean el interlineal completo para el lector hispanohablante; es el mayor valor por palabra traducida de todo el proyecto. | 2026-09-20 |

### Decisiones pendientes

- [!] **Nombre de la plataforma y dominio.** Bloquea marca, diseño y despliegue.
- [!] **Alcance del canon.** ¿Incluimos deuterocanónicos como material de consulta histórica, marcados como tales? Relevante para LXX y Vulgata, que ya están en el corpus libre.
- [!] **Modelo de sostenimiento.** Gratuito, donaciones, o freemium. Afecta directamente qué licencias podríamos necesitar más adelante (el uso comercial cambia las tarifas).
- [!] **Licencia de nuestras propias traducciones.** D2 nos convierte en autores: una traducción nueva de una obra en dominio público es obra derivada con derechos propios, y son nuestros. Probablemente el activo más valioso del proyecto. **Hay que decidirlo antes de traducir el primer párrafo.**
- [!] **Jurisdicción de referencia.** Las cuatro investigaciones razonan con derecho estadounidense (umbral 1929, renovación, *fair use*). En la UE y América Latina el criterio es vida del autor + 70 años, con resultados distintos obra por obra.

---

## Estructura de la carpeta madre

```
20. Biblias_Comments_Dicionarios/
├── bitacora_progreso.md          ← este archivo, fuente única de verdad
├── 01. Investigacion/            investigaciones de fuentes, licencias y competencia
├── 02. Legal/                    licencias, atribuciones, términos, política de privacidad
├── 03. Arquitectura/             esquema de datos, decisiones técnicas, diagramas
├── 04. Diseno/                   sistema visual, tokens, maquetas, flujos
├── 05. Datos/                    corpus crudo, pipelines de ingesta, base normalizada
├── 06. Traduccion/               glosario teológico, corpus traducido, control de calidad
├── 07. App/                      código de la aplicación web
├── 08. Deploy/                   infraestructura, CI/CD, build móvil
├── 09. Marca/                    logo, tipografías, identidad
└── 10. Archivo/                  material descartado o versiones superadas
```

---

## Plan de trabajo

### Fase 0 — Orden e investigación · `[~]` en curso

- [x] **0.1** Investigación de fuentes y licencias por Claude → `01. Investigacion/01.1`
- [x] **0.2** Estructura de carpetas de la carpeta madre
- [x] **0.3** Bitácora creada con decisiones D1–D8
- [x] **0.4** Investigación paralela por GLM → `01. Investigacion/01.2`
- [x] **0.4b** Investigaciones adicionales de ChatGPT (`01.3`) y Gemini (`01.4`)
- [x] **0.5** Cruce de las cuatro investigaciones → **`01. Investigacion/01.5 - CONCLUSION FINAL.md`** · documento maestro, reemplaza a las cuatro como referencia operativa
- [ ] **0.6** Análisis de competencia: YouVersion, Blue Letter Bible, STEP Bible, e-Sword, Logos, Bibliatodo, **Ezra Project** (modelo de notas y etiquetas) y **And Bible** (offline) → `01. Investigacion/01.6`
- [ ] **0.7** Definir nombre, dominio y disponibilidad en tiendas de apps
- [ ] **0.8** `git init` y primer commit de la estructura

### Fase 1 — Fundamento legal · `[ ]`

Se hace **antes** de descargar el primer byte de corpus. No después.

- [ ] **1.1** Registro maestro de licencias: una ficha por obra con titular, licencia exacta, texto de la licencia archivado, URL de origen, fecha de consulta → `02. Legal/`
- [ ] **1.2** Redactar el aviso de atribuciones que exige CC BY (STEPBible, SBLGNT) y decidir dónde se muestra en la interfaz
- [ ] **1.3** Términos de uso y política de privacidad en ES y EN
- [ ] **1.4** Política de contenido: qué se puede exportar, imprimir, compartir y cachear por tipo de licencia
- [ ] **1.5** Aviso de traducción: texto legal que acompaña a todo material traducido por nosotros, declarando el original, su licencia y el método de traducción
- [ ] **1.6** Declaración de titularidad sobre nuestras traducciones y decisión de con qué licencia las publicamos
- [ ] **1.7** Cumplimiento de privacidad para notas de usuario (RGPD / CCPA) aunque arranque anónimo
- [ ] **1.8** **Plantilla de ficha legal** con el checklist de 12 preguntas (¿podemos almacenar, indexar, generar embeddings, servir completo, permitir offline, monetizar, modificar formato, traducir? ¿qué avisos mostrar? ¿qué límites hay? ¿qué pasa al cancelar? ¿cubre iOS y Android? ¿es mundial o por jurisdicción?) más los campos nuevos del cruce: `jurisdiccion`, `traductor`, `anio_muerte_traductor`, `derechos_edicion_digital`, `derechos_imagen`, `licencia_del_repositorio` vs `licencia_del_contenido`, `permite_embeddings`, `permite_traduccion_derivada`, `copyleft_heredado`
- [ ] **1.9** **Resolver la vía CCEL.** Reclama derechos sobre su marcado ThML aunque el texto sea dominio público. Por obra: buscar fuente alternativa sin marcado propietario, pedir autorización expresa, o rehacer el marcado desde el escaneo original
- [ ] **1.10** Verificar la licencia literal de la **Berean Standard Bible** antes de clasificarla
- [ ] **1.11** Consultar a **ABS y a SBU** sobre la titularidad territorial de la RVR1960 (sin urgencia, D1 la deja fuera del arranque)
- [ ] **1.12** Revisión por abogado de propiedad intelectual antes del lanzamiento público

### Fase 2 — Modelo de datos y esquema · `[ ]`

- [ ] **2.1** Esquema definitivo: `work`, `edition`, `node`, `link`, `lemma`, `license` → `03. Arquitectura/`
- [ ] **2.2** Especificación de `osis_ref` (D9): normalización con `bible-passage-reference-parser`, versificación y mapeo entre sistemas distintos (LXX vs TM, numeración de Salmos)
- [ ] **2.3** Esquema de anotación: `annotation_id` (UUID de cliente), `osis_reference`, `version_id`, `start_offset`, `end_offset`, `highlight_color`, `note_content` (JSONB), `updated_at` (UTC de alta resolución)
- [ ] **2.4** Modelo de búsqueda: léxica con `tsvector` en español e inglés, semántica con `pgvector`
- [ ] **2.5** Estrategia offline (D11): SQLite-WASM + IndexedDB en web, SQLite nativo en móvil. Qué subconjunto se empaqueta, tamaño objetivo, sincronización incremental
- [ ] **2.7** Separabilidad del corpus **CC BY-SA** en el modelo de datos: el copyleft se hereda a lo que traduzcamos, así que no puede mezclarse con dominio público en un mismo volumen
- [ ] **2.8** Soporte de obras restringidas, que no se cachean offline ni entran al índice semántico (D14), desde el esquema y no como parche
- [ ] **2.6** Migraciones iniciales y semillas

### Fase 3 — Ingesta del corpus · `[ ]`

Regla dura: **ninguna obra entra sin su ficha de licencia de la Fase 1 ya aprobada.**

- [ ] **3.1** Pipeline genérico de ingesta con validación, reporte y reversión → `05. Datos/`
- [ ] **3.2** Biblias en español: RV 1909, Biblia del Oso 1569, RV 1865
- [ ] **3.3** Biblias en inglés: WEB, BSB, KJV, ASV
- [ ] **3.4** Textos antiguos: Vulgata Clementina, Septuaginta, Textus Receptus
- [ ] **3.5** STEPBible-Data: TAHOT hebreo y TAGNT griego con morfología completa
- [ ] **3.6** Léxicos: TBESH, TBESG, TFLSJ y Strong's
- [ ] **3.7** Alineación interlineal palabra a palabra contra `osis_ref`
- [ ] **3.8** Comentarios en inglés: Matthew Henry, JFB, Clarke, Gill, Barnes, Calvino, Pulpit
- [ ] **3.9** Diccionarios y enciclopedias: ISBE, Easton's, Smith's, Nave's, Torrey's
- [ ] **3.10** Teología y patrística desde CCEL, con prioridad protestante: Calvino, Lutero, Spurgeon, Wesley, Edwards, Agustín, padres ante-nicenos
- [ ] **3.11** Confesiones y catecismos: Westminster, Heidelberg, Dordrecht, Segunda Confesión Helvética
- [ ] **3.12** Módulo Mar Muerto: fichas curadas por rollo con enlace IIIF a la fuente oficial, sin alojar imágenes con derechos
- [ ] **3.13** Verificación de integridad: conteo de versículos (RV1909 = 31.101), detección de lagunas, validación de referencias cruzadas
- [ ] **3.14** **Treasury of Scripture Knowledge** vía OpenBible: ~500.000 referencias cruzadas, ingestable tal cual
- [ ] **3.15** Geografía: **Pleiades** (CC BY 3.0) + OpenBible Geocoded Places
- [ ] **3.16** Comentario protestante extendido: Ellicott, Lange, Bengel, Maclaren, Simeon, *Treasury of David*, y **Juan de Valdés** (s. XVI, español original)
- [ ] **3.17** Material CC BY-SA en español de **unfoldingWord / Door43**, mantenido separable (ver 2.7)
- [ ] **3.18** Audio: **LibriVox RV1909** en español
- [ ] **3.19** **Medir la calidad real del OCR** de ISBE y del *Biblical Illustrator* antes de comprometer su ingesta — la limpieza puede costar más que la traducción
- [ ] **3.20** Cada módulo tomado del catálogo SWORD necesita su propia ficha: **CrossWire advierte que sus módulos tienen derechos distintos entre sí y que muchos no son redistribuibles**

### Fase 4 — Traducción al español · `[ ]`

El diferenciador del proyecto. Se trata como trabajo editorial, no como procesamiento por lotes.

- [ ] **4.1** Glosario teológico maestro ES↔EN: términos técnicos con traducción fija y justificación → `06. Traduccion/`
- [ ] **4.2** Guía de estilo: registro, tratamiento de citas bíblicas dentro del comentario, nombres propios, transliteración de hebreo y griego
- [ ] **4.3** Pipeline de traducción con memoria de traducción y coherencia entre volúmenes
- [ ] **4.4** Trazabilidad: cada párrafo traducido conserva enlace a su original, siempre consultable en la interfaz
- [ ] **4.5** Control de calidad por muestreo con revisión humana, y marcado de estado por obra: sin revisar / revisado parcial / revisado completo
- [ ] **4.6** Prioridad de traducción: primero Easton's e ISBE (consulta de alto uso), luego Matthew Henry, luego el resto
- [ ] **4.7** Mecanismo para que el lector reporte errores de traducción

### Fase 5 — Diseño · `[ ]`

- [ ] **5.1** Dirección visual: elegante y vanguardista, sin caer en el cliché de "app bíblica". Paleta, tipografías, tokens → `04. Diseno/`
- [ ] **5.2** Tipografía para lectura prolongada, con soporte real de hebreo, griego politónico y transliteración
- [ ] **5.3** Modo claro y oscuro desde el sistema de tokens
- [ ] **5.4** Pantallas núcleo a breakpoint tablet y escritorio: lector, panel paralelo, interlineal, búsqueda, entrada de diccionario, ficha de manuscrito
- [ ] **5.5** Sistema de notas y subrayados: paleta de resaltado, panel de notas, etiquetas, colecciones
- [ ] **5.6** Accesibilidad: contraste, foco visible, navegación por teclado, tamaño de texto ajustable, `prefers-reduced-motion`
- [ ] **5.7** Adaptación a móvil

### Fase 6 — Aplicación web · `[ ]`

- [ ] **6.1** Andamiaje Next.js + TypeScript + Tailwind, PWA desde el inicio → `07. App/`
- [ ] **6.2** Internacionalización con rutas `/es` y `/en`, todos los textos en catálogo
- [ ] **6.3** Lector: navegación por libro y capítulo, versificación, referencias cruzadas
- [ ] **6.4** Panel paralelo: varias traducciones y obras ancladas al mismo versículo
- [ ] **6.5** Vista interlineal con morfología y acceso al léxico por palabra
- [ ] **6.6** Búsqueda léxica y semántica con filtros por obra, testamento, idioma y tipo
- [ ] **6.7** Notas y subrayados en almacenamiento local, con exportación
- [ ] **6.8** Módulo de manuscritos y Mar Muerto con visor IIIF
- [ ] **6.9** Service worker y corpus offline
- [ ] **6.10** Rendimiento: carga del lector, virtualización de capítulos largos, prefetch de contexto

### Fase 7 — Cuentas y sincronización · `[ ]`

- [ ] **7.1** Autenticación
- [ ] **7.2** Migración de notas locales a la cuenta sin pérdida
- [ ] **7.3** Sincronización con resolución de conflictos
- [ ] **7.4** Exportación e importación completa de los datos del usuario

### Fase 8 — Móvil · `[ ]`

- [ ] **8.1** Capacitor sobre el build web → `08. Deploy/`
- [ ] **8.2** SQLite local para corpus offline en dispositivo
- [ ] **8.3** Build y publicación en Android
- [ ] **8.4** Build y publicación en iOS
- [ ] **8.5** Revisión de cumplimiento en tiendas: declaración de licencias y contenido religioso

### Fase 9 — Lanzamiento · `[ ]`

- [ ] **9.1** Infraestructura, dominio, certificados, respaldos
- [ ] **9.2** Página de atribuciones y licencias pública y accesible
- [ ] **9.3** Analítica respetuosa de privacidad
- [ ] **9.4** Revisión legal final antes de publicar
- [ ] **9.5** Lanzamiento web
- [ ] **9.6** Lanzamiento móvil

---

## Registro cronológico

### 2026-09-14 · Claude

- Investigación completa de fuentes y licencias del universo de material cristiano digital: biblias, lenguas originales, comentarios, diccionarios, enciclopedias, teología, patrística y Mar Muerto. Clasificación en libre / condicionado / pago.
  → `01. Investigacion/01.1 - Claude - Acervo y Licencias.md`
- Estructura de carpetas numerada creada en la carpeta madre.
- Bitácora inicial con plan de nueve fases y decisiones D1 a D8 registradas.
- Pendiente inmediato: investigación de GLM y cruce de resultados.

### 2026-09-14 · GLM

- Investigación paralela (tarea 0.4): acervo, licencias, plataformas de código abierto (SWORD, And Bible, Ezra Project, Sefaria) y los 10 huecos del brief (material ES libre, Qumrán, IIIF, referencias cruzadas, atlas, audio, himnarios). Clasificación LIBRE / CONDICIONADO / PAGO, con riesgos y ambigüedades señalados (sección R1–R7).
  → `01. Investigacion/01.2 - GLM - Investigacion.md`
- Aportación de regla nueva para fichas de licencia: el DP se determina por traducción y fecha de muerte del traductor, no solo del autor original (ej.: *Institución* de Calvino tr. Battles tiene derechos).
- Fuentes verificadas en vivo: STEPBible-Data (CC BY 4.0), Leon Levy DSS Library (sin API pública), eBible.org, SWORD/CrossWire.
- Pendiente inmediato: cruce de 01.1 y 01.2 en `01.3` (tarea 0.5) y competencia en `01.4` (tarea 0.6).

### 2026-09-15 · Claude

- Leídas e integradas las cuatro investigaciones paralelas: `01.1` Claude, `01.2` GLM, `01.3` ChatGPT (PDF), `01.4` Gemini (PDF).
- Archivos de investigación renumerados por orden de llegada; la conclusión pasa a `01.5` y competencia a `01.6`.
- **Creada `01.5 - CONCLUSION FINAL.md`** — documento maestro que reemplaza a las cuatro como referencia operativa del proyecto.
- Resueltas cuatro divergencias: licencia de la BSB, derechos de la CCEL sobre su marcado ThML, uso del ecosistema SWORD, y titularidad territorial de la RVR1960.
- Hallazgo decisivo: las condiciones de API.Bible (caché que caduca a los 30 días, telemetría FUMS obligatoria, prohibición de procesar con LLM) son **arquitectónicamente incompatibles** con D4, D5 y la Fase 4. Confirma D1 y obliga a D14.
- Registradas las decisiones **D9 a D15** y tres decisiones pendientes nuevas, incluida la licencia de nuestras propias traducciones.
- Fases 1, 2 y 3 ampliadas con 17 pasos nuevos derivados del cruce.
- Pendiente inmediato: análisis de competencia (0.6) y arranque de la Fase 1.

### 2026-09-15 · GLM

- Creada **conclusión particular** a petición del usuario: segundo punto de vista redactado desde las cuatro investigaciones de entrada (01.1, 01.2, ChatGPT, Gemini), sin tomar como base el documento maestro `01.5`, para comparación manual.
  → `01. Investigacion/01.5.1 - GLM - Conclusion particular.md`
- Tesis de GLM: la batalla se gana en la **calidad de la ingesta y la traducción al español**, no en las licencias; corpus MVP minimalista (7 obras impecables antes que 60 a medias); sugiere conversación temprana con SBU por RVR1960 y posponer CRDT, embeddings, audio, atlas y licencias comerciales.
- `01.5 - CONCLUSION FINAL.md` sigue siendo la referencia operativa. Pendiente: competencia (0.6) y Fase 1.
- Creada `01.5.2 - Claude - Conclusion particular.md` a petición del humano: postura propia y separada del documento maestro. Cuatro discrepancias con el plan vigente, pendientes de decisión:
  1. La traducción no debería ser la Fase 4 sino el centro del producto.
  2. Sustituir la cascada de nueve fases por un **corte vertical de un solo libro** antes de la ingesta masiva.
  3. Reducir el corpus del MVP de ocho bloques a **seis fuentes**.
  4. **Aplazar el módulo del Mar Muerto**, salvo el ángulo de divergencias Qumrán/texto masorético ancladas al versículo.

### 2026-09-20 · Claude

- Revisión del estado del proyecto tras la construcción de GLM: núcleo 6/6 ingerido, TSK con 386.384 referencias navegables, PWA desplegada, Matthew Henry traducido hasta Juan 6.
- Inventario de recursos teológicos del corpus entregado al usuario: núcleo ya ingerido, cierre del núcleo (JFB, Barnes, Nave's, SBLGNT) y segunda ola.
- Señalado el hueco de **teología sistemática y patrística**, caído del plan al recortar a seis fuentes. El usuario lo repone como **tercera ola** → **D22**.
- Análisis de carga de traducción por recurso. Conclusiones:
  - **No se traduce** el texto fuente (hebreo, griego, latín), la RV1909 ni las referencias del TSK.
  - **Ya existe en español en dominio público** buena parte de la tercera ola: confesiones y catecismos con traducciones históricas, y la *Institución* de Calvino en la traducción de **Cipriano de Valera (1597)**. Se busca y verifica, no se traduce.
  - **Mayor valor por palabra:** los gloss de TBESH/TBESG y el vocabulario cerrado de etiquetas morfológicas → **D23**.
  - Riesgo señalado: **John Gill** es, con diferencia, la obra de mayor volumen del backlog; conviene medir su coste antes de comprometerla.
  - Nota de coherencia: la tercera ola (D22) revierte parcialmente `A7`, que el usuario había descartado en las ideas finalistas. Queda anotado para que la trazabilidad sea honesta.

### 2026-09-20 · Claude — Morfología en español (primer entregable de traducción barata)

**Verificación previa:** automatización de GLM **activa** (commits cada ~30 min, Juan 8 en curso). Se aplicó la regla del usuario: se ejecuta solo lo que no colisiona.

- **NO ejecutado:** refactor del selector de comentario en `page.tsx`. Sí colisiona — GLM edita código de la app (service worker, rutas de `/data`) y despliega cada media hora; un refactor a medias en un archivo de 1.095 líneas iría a producción. **Requiere pausar la automatización.**
- **Sí ejecutado (100 % aditivo, archivos nuevos):** traducción del vocabulario morfológico de STEPBible → `06. Traduccion/morfologia/` y copia lista para consumir en `07. App/app/public/data/morfologia/`.

**Resultado medido:** 2.061 códigos traducidos (1.082 griegos + 941 hebreos/arameos) que etiquetan 474.911 palabras de toda la Biblia. Cobertura **99,94 %** de los tokens del NT y **99,40 %** del AT. Los dos esquemas son composicionales, así que la fuente real es un diccionario de ~150 átomos del que se componen todos los códigos: corregir un átomo y regenerar recalcula todo de forma coherente.

**Procedencia, con una asimetría que hay que cerrar:**
- *Hebreo* — verificado literalmente contra la legenda oficial de OpenScriptures que TAHOT declara seguir. `verificada_en_fuente: true`.
- *Griego* — ⚠️ **PENDIENTE.** El intro oficial de TAGNT vive en un Google Doc no accesible programáticamente; la tabla se reconstruyó sobre el esquema Robinson/Tauber. **Incumple C1/C2 (cita literal) y no debe publicarse sin cotejo.** Marcado `verificada_en_fuente: false`. Es un cotejo de una sentada: ~80 entradas.
- Lo no resuelto **no se inventó**: quedó registrado en `_pendientes.json`.

**Atribución CC BY 4.0 obligatoria** donde se muestren: *«Datos morfológicos de STEPBible.org, Tyndale House Cambridge, CC BY 4.0»*. La traducción de las etiquetas es obra derivada nuestra.

**Pendiente para cablearlo en el lector** — entra en la misma ventana que el refactor, con la automatización pausada.

**Nota sobre Cloudflare:** el usuario confirma suscripción de pago y que el espacio no es restricción. El límite relevante deja de ser el almacén y pasa a ser el **paquete offline** (B11): qué subconjunto baja al dispositivo. Se decide con datos de uso, no ahora.

### 2026-09-21 · Claude — Cierre de la etapa de integración

GLM se quedó sin créditos a mitad de la interfaz de Nave's. Retomado y cerrado en tres frentes.

**1 · Nave's terminada.** La ingesta estaba **completa** y sin commitear: 66 libros, 4.672 temas, 77.954 aserciones, manifiesto y textos i18n en ES y EN. Solo faltaba la interfaz. Añadido el bloque **Temas (Nave)** al panel de referencias del verso, con carga perezosa por libro, caché compartida y su atribución de dominio público.

**2 · Morfología en español cableada.** El interlineal ya no muestra `V-PAI-3S` sino *«verbo presente voz activa indicativo 3a persona singular»*. Mapa por idioma con carga perezosa y caída al código crudo si falta una entrada — nunca un hueco vacío. Los códigos hebreos compuestos se resuelven por partes: `HR/Ncfsa` → *«preposicion + sustantivo comun femenino singular absoluto»*.

**Cobertura verificada sobre los datos que el lector renderiza de verdad**, no sobre el corpus teórico: **99,7 %** en Juan (16.014/16.069 palabras) y **99,2 %** en Génesis (20.007/20.161). `tsc` limpio y build correcto.

**3 · D-001 cerrada y causa del desvío corregida.** GLM no ejecutó dos tareas de la directiva porque ambas numeraciones usaban “paso N” y colisionaron. Culpa de la directiva. Regla nueva: las tareas de directiva se identifican `D-NNN.n`; “paso N” queda reservado al plan de GLM.

**Queda un bloqueo declarado:** la tabla morfológica griega sigue sin cotejar en fuente y ya está en producción. Riesgo bajo por la cobertura medida, pero es deuda abierta. **No es deuda legal sino de exactitud:** la licencia está verificada; lo que no se ha cotejado es el significado de los códigos.

**También anotado:** el refactor del selector de comentario resultó innecesario para esta etapa — interlineal, léxico y Nave's no compiten con el comentario. Se reabre cuando entre JFB, que es la segunda obra de comentario y el momento real en que el booleano estorba.


### 2026-09-26 · GLM — Registro de los hitos 22–23 sept (motor, AION, Easton ES, glosas completas, VBL) · vigilante eliminado

Narra los 13 commits (`8dbf068`→`11cccd3`) que no constaban en esta bitácora; el detalle de archivo por archivo está en `bitacora_progreso_GLM.md` (entradas 2026-09-22 de Claude y 2026-09-26 de GLM).

1. **Motor de Traducción operativo** (`11. Motor de Traducción/`): traducción y auditoría por lotes fuera de tiempo real; unidad = párrafo; modelo elegido por enfrentamiento por pares contra el patrón de oro de Juan (`mistral-small-3.1-24b`, ~$29 todo Henry); Jev como auditor censal (~$2); tope de gasto $75; política de coste registrada (~$45 toda la biblioteca, ~$62 con Barnes). La revisión humana pasa a ser el acto que constituye la obra (Política v1.0, revisor principal nombrado).
2. **Paso 6 avanza a 6/7 obras:** Easton ES completo por el motor; glosas ES del interlineal y del léxico terminadas (AT 99,62 % de palabras, léxico 8.721 H + 10.846 G Strong); quedaba ingerir VBL (66 libros, 31.102 versos, CC BY-SA 4.0 — solo agregación, las derivadas heredarían ShareAlike). **Resta Barnes.**
3. **Marca:** la app pasa a llamarse «Biblia de Estudio AION» (manifest, i18n). Ratificación formal pendiente del usuario.
4. **Correcciones de fondo:** bug del índice léxico (resolvía entradas equivocadas — el descubierto el 21-09) corregido; lotes de glosas que se perdían enteros (coste 10×) corregido; ortografía completa con tildes en las glosas.
5. **El vigilante de 30 min queda ELIMINADO** (orden del usuario del 26-09: «ya con el motor de traducción no es necesario») — 56 ejecuciones, ya estaba pausado. Los incrementos de trabajo dejan de venir de turnos de fondo: corren por el motor contra la API.
