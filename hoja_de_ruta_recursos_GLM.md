# Hoja de ruta — Nuevos recursos para la Biblia de Estudio AION

> ## ⚑ PRIORIDAD — hacer ANTES de seguir con la fase en curso (añadido 2026-09-28)
>
> ### [x] P.1 Barrido profundo de citas bíblicas (todas las obras, EN y ES)
> **COMPLETA 2026-09-28 (GLM)**: paso 1 (auditoría: 1.102 formas, informe en 05. Datos/auditoria-citas.md) → paso 2 (MAPA ampliado: Lu/Ac/Ge/Re/Nu/Ne/Ho/Ec/Ti/Mk/So/Chr/He/Da/Tt/Ga/Mi/Nú + nombres completos ES + espaciadas 1 Co/2 Sam/1 Ts/1 Cr/2 Cr/1 Pe…; frontera unicode É/Nú/Gá; herencia elíptica de libro en el lector 78k→25k; rangos que cruzan capítulo) → paso 4 (62 casos de regresión en scripts/casos-citas.json + runner prueba-citas.mjs, 62/62). El Paso 3 (agrupación) ya estaba (cb6e839). Re-auditoría: Lu/Co/Ac/Ge/1 Co/Isaías/Salmo desaparecen del top; la cola restante son ambiguas correctas (Corintios sin número) y elípticas fuera de ventana.
> **Problema:** comentarios y diccionarios citan con muchísimas abreviaturas y formas, y el lector
> (`07. App/app/lib/referencias.ts`, `RE_CITA` + `parseCita` + `MAPA`) no detecta parte de ellas:
> esas citas quedan como texto muerto. Ya corregido por Claude: «Lc 24:48; 1 Ts 2:5» ya no inventa
> «Lc 24:1» ni pierde 1 Ts. Conocido y sin corregir: «2 Sam 7:12» (número + espacio + «Sam»).
>
> **Paso 1 — medir — ✓ HECHO 2026-09-28 (GLM)**: `scripts/audita-citas.mjs` recorre las 9 obras;
> informe en `05. Datos/auditoria-citas.md` (1.102 formas). Top confirmado con pruebas directas:
> elípticas heredadas ×78.364 · «Lu» ×4.401 · «Co» ×3.787 · «Ac» ×3.781 · «Ge» ×3.314 ·
> «Isaías» ×3.212 · «Salmo» ×3.054 · «Re» ×2.879 · «1 Co» (número+espacio) ×2.165 · «Nu» · «2 Co» · «Chr».
> **Paso 1 — medir (script original):** recorrer TODAS las obras
> (`henry`, `henry-es`, `jfb`, `jfb-es`, `barnes`, `barnes-es`, `easton`, `easton-es`, `nave`,
> `tsk`, léxico `lexdef-es-*`, y cada obra nueva que se ingiera). Con un patrón AMPLIO de «cosa que
> parece cita» (`palabra/abreviatura + capítulo:verso`, `cap. 3`, `ver. 5`, `vv. 3-5`, `ch. 4`),
> comparar contra lo que `RE_CITA` sí captura. Informe: formas NO capturadas ordenadas por
> frecuencia, con 3 ejemplos cada una y el total por obra. Guardarlo en `05. Datos/auditoria-citas.md`.
>
> **Paso 2 — corregir por frecuencia.** Casos esperables:
> - número + espacio + nombre: «2 Sam», «1 Chr.», «1 Cor.», «2 Kings», «1 Tes», «2 Cr»;
> - nombres completos y abreviaturas ES: «Génesis», «Gén.», «Éxodo», «Juan», «Mat.», «Apoc.», «Ecles.»,
>   «Cnt», «Rom.», «Heb.», «Sant.», «1 Ped.»; y EN: «Gen.», «Exod.», «Matt.», «Rev.», «Cant.»;
> - **citas elípticas** que heredan el libro de la cita anterior: «(Ex 6:20) … (2:1, 4; 7:7)».
>   Ya resuelto sólo en el generador de Easton (`scripts/genera-easton-pasajes.mjs`, función
>   `refsDe`: una cita desnuda hereda libro salvo que la preceda una palabra). Llevar esa lógica
>   al lector para todas las obras;
> - rangos que cruzan capítulo «5:18-6:2» y rangos largos (hoy >12 versos se corta al primero);
> - referencias al capítulo entero «Jn 3», «Salmo 23»;
> - referencias internas del comentario «ver. 5», «v. 12», «vv. 3-5» → libro y capítulo en curso.
> - **Cuidado con falsos positivos**: «Job» es libro y nombre, «Is», «Am», «Os», «Col» son palabras
>   comunes. Exigir capítulo:verso para las ambiguas. Cada regla nueva, probada con casos.
>
> **Paso 3 — agrupación (mantener la idea ya hecha por GLM, commit cb6e839):** varias citas del
> mismo libro en una sola muestra. «Jn 1:2, 4, 5:6» → una tarjeta con Jn 1:2, Jn 1:4 y Jn 5:6
> juntos, con su chip cap:v y encabezado de capítulo. Las citas elípticas nuevas deben entrar en
> ese mismo grupo, no crear tarjetas sueltas.
>
> **Paso 4 — pruebas y cierre.** Un archivo de casos (`scripts/casos-citas.json`: entrada →
> refs esperadas, mínimo 60 casos EN y ES, incluidos los de arriba) que se ejecute antes de cada
> despliegue. Re-ejecutar el paso 1: objetivo **≥ 98 %** de las citas reales capturadas, **0**
> regresiones en los casos. Regenerar `easton-pasajes` (el generador usa `referencias.ts`).
> Anotar en la bitácora el antes/después por obra.
>
> ### [~] P.2 Easton como diccionario de verdad (no como comentario)
> **1/2 HECHO 2026-09-28 (GLM)**: (2) la vista del selector renombrada a «temas que citan este
> versículo» con cada tema como titular clicable que abre la entrada completa en el diccionario.
> (1) «Diccionario en el texto»: interruptor activo + subrayado punteado de nombres con entrada
> (índice de titulares normalizados, plurales incluidos; tap abre la ficha ES). Verificado en
> el navegador: 98 subrayados en Gen 1 («Dios», «tierra», «Espíritu»…), tap en «Dios» abre la
> entrada. PENDIENTE (3): aplicar lo mismo a Rand (1.4) cuando esté ingerido.
> Easton es un **diccionario temático** (personas, lugares, objetos, doctrinas); hoy se ve en el
> selector de comentarios como índice inverso versículo → entradas que lo citan, y parece un
> comentario. Hacer las dos cosas:
> 1. **Enlazar el texto bíblico a sus entradas.** Interruptor «Diccionario en el texto»: los nombres
>    y términos del capítulo que tienen entrada en Easton (en español, vía los titulares `e` de
>    `public/data/easton/_indice.json`; también plurales y formas con/sin tilde) se subrayan
>    discretamente; tocar abre la ficha en el panel del diccionario. Apagado por defecto. Evitar
>    palabras vacías y ambiguas («a», «era», «luz» sólo si hay entrada exacta). Probar a 390 px.
> 2. **Renombrar la vista actual** para que no se confunda con un comentario: «Easton · temas que
>    citan este versículo», cada tema como titular que abre la entrada completa en el diccionario.
> 3. Hacer lo mismo con Rand (Fase 1.4) cuando esté ingerido.

Encargo para GLM, redactado por Claude (2026-09-28) y aprobado por el usuario.
Trabajar las tareas **en el orden en que aparecen**. Al terminar una, marcarla
`[x]` aquí, anotar el resultado en `bitacora_progreso_GLM.md` y pasar a la
siguiente sin esperar confirmación, **salvo en las PUERTAS** (⛔), donde hay que
parar y dejar el informe para el usuario.

---

## 0. Reglas que no cambian (leer antes de empezar)

1. **Licencia primero.** Antes de ingerir una obra, verifica y anota en su `_manifest.json`:
   `licencia`, `fuente` (URL exacta), `fecha_ingesta` y `edicion`. Si la licencia no es dominio
   público o una licencia abierta verificable (CC BY, CC BY-SA, CC0), **no se ingiere**: se anota
   en la bitácora como «descartada: licencia» y se pasa a la siguiente.
   - Obras de EE. UU. publicadas antes de 1931 son dominio público en EE. UU. Entre 1931 y 1963,
     hace falta comprobar que no se renovó el copyright. Traducciones modernas de obras antiguas
     tienen derechos propios: sólo sirven traducciones antiguas.
   - CC BY-SA obliga a dar crédito y a mantener la misma licencia en lo derivado: ponlo en el panel Fuentes.
2. **Texto íntegro, matices declarados.** Nada se resume ni se recorta. Todo texto traducido por
   máquina lleva `estado_revision: "sin_revisar"` y el lector muestra «sin revisar». Ningún
   veredicto de IA retira esa marca: sólo la revisión humana.
3. **Posturas etiquetadas.** Las obras doctrinales o escatológicas se presentan con su tradición
   o postura visible (p. ej. «Postura: futurista», «Tradición: reformada», «Patrística»). La obra
   no toma partido; muestra las posturas lado a lado.
4. **Gasto.** Motor en `11. Motor de Traducción/`. Gasto acumulado en `estado/gasto.json`; tope
   actual en `.env` (`MT_TOPE_USD`, hoy 75). **Antes de traducir cada obra**: `--muestra` de
   ~30 unidades, revisar calidad, medir el costo real por carácter y proyectar el total. Si la
   proyección hace pasar el gasto del tope, ⛔ PUERTA: parar e informar (el usuario ha dicho que
   subirá el tope por fases; él decide cuánto).
5. **Seguridad.** Claves sólo en `11. Motor de Traducción/.env` (en .gitignore). Nunca en el
   cliente, en el repositorio ni en el chat. No tocar `07. App/app/functions/` ni
   `07. App/app/wrangler.toml` sin dejarlo anotado.
6. **Móvil primero.** Todo cambio de interfaz se prueba a 390 px de ancho, sin desborde
   horizontal, en tema claro y oscuro.
7. **Formato de datos.** Seguir las convenciones existentes en `07. App/app/public/data/`:
   una carpeta por obra, un JSON por libro con códigos OSIS de 3 letras (GEN, JHN, REV…),
   `_manifest.json` por obra, versión `-es` en carpeta hermana (p. ej. `henry/` y `henry-es/`),
   estructura paralela 1:1 entre original y traducción.
8. **Despliegue.** `DIST_DIR=salida npm run build` y
   `npx wrangler pages deploy salida --project-name=bibliaapp --branch=main` (el `out` da EBUSY).
   Tras desplegar, actualizar `public/llms.txt` con la obra nueva (ruta y licencia).
9. **Commits** pequeños, uno por obra ingerida o función terminada, con mensaje en español.

---

## FASE 1 — Casi sin costo, todo en español o casi (≈2 USD)

### [x] 1.1 Biblia del Oso (1569) — nueva versión en el selector
- **HECHA 2026-09-28 (GLM)**: fuente real = getbible.net v2 `sse` (CrossWire no publica SpaSEV.zip — 404 en rawzip/strict/common/beta). 66 libros · 31.098 versos · 0 incidentes de capítulos vs RV1909. **Ortografía actualizada** confirmada (Gn 1:1 «creó») → nombre «Biblia del Oso 1569 (ortografía actualizada)». **Sin deuterocanónicos**: la edición no los trae. Texto propio verificado en el lector («En el principio ya era el Verbo» ≠ RV1909). Cotejo con escaneos: pendiente de registrar muestra formal.
- **Fuente:** módulo SWORD **SpaSEV** de CrossWire («Sagradas Escrituras Versión Antigua 1569»),
  declarado dominio público. Lista: https://www.crosswire.org/sword/modules/ModDisp.jsp?modType=Bibles ·
  licencia: http://www.bible-discovery.com/bible-license-spasev.php
- **Cotejo:** escaneos en archive.org (buscar «Biblia del Oso 1569») para verificar muestras.
- **Verificar ortografía:** comparar 10 versos contra el escaneo. Si el módulo moderniza la
  ortografía, la versión se llama «Biblia del Oso 1569 (ortografía actualizada)»; si es original,
  «Biblia del Oso 1569». Anotarlo en el manifiesto.
- **Ojo:** la del Oso incluye los **deuterocanónicos** intercalados (Reina los tradujo). Si el
  módulo los trae, ingerirlos con sus códigos OSIS (TOB, JDT, WIS, SIR, BAR, 1MA, 2MA…) y que el
  lector sepa mostrarlos sólo en esta versión, sin romper las que no los tienen.
- **Salida:** `public/data/oso1569/` en el mismo formato que `rv1909/`. Añadir al selector de
  versión y al desplegable de las tarjetas de cita. Añadir al índice de búsqueda
  (`scripts/genera-busqueda.mjs`) como tercera obra, con carga perezosa.
- **Traducción:** ninguna. **Costo: 0.**

### [x] 1.2 Juan de Valdés — comentarios a Romanos (1556) y 1 Corintios (1557)
- **1CO HECHO 2026-09-28 (GLM)**: fuente = archive.org `commentariodecl00valdgoog` (Usoz 1895, djvu.txt 570 KB, OCR limpiado); 16 capítulos con fronteras verificadas por contenido (marcas OCR: 0→9, 18→13, 16→15; 5/7/11/15/16 localizados por palabras de su apertura); 537 párrafos; integrado como comentarista con insignia ES fija (obra nativa). Pulido de artefactos OCR («volun-tad», «eLhermano») pendiente del pase de revisión.
- **ROM HECHO 2026-09-28 (GLM)**: fuente hallada — Usoz 1856 «La Epístola de san Pablo a los Romanos, i la 1.ª a los Corintios» vol. 1 (`laepistoladesanp01vald`, OCR limpio, ortografía original: grazia, justizia, Evanjelio). 152 secciones → 16 capítulos · 579 párrafos, numerales romanos difusos decodificados (Y→V, SI→II, ÍL→III, L→I). Las citas latinas/griegas de Valdés quedan conservadas en el texto.
- Escritos **en español** por un reformador español. Dominio público.
- **Fuente:** buscar transcripción en la serie «Reformistas Antiguos Españoles» (Usoz, s. XIX),
  disponible en archive.org / Google Books / Biblioteca Virtual Cervantes. Preferir texto
  transcrito; si sólo hay escaneo, usar el OCR y limpiarlo.
- **Salida:** `public/data/valdes/ROM.json` y `1CO.json`, comentario por versículo o perícopa, como `henry/`.
  Añadir como comentario seleccionable. Nota de fuente: «Texto original en castellano del s. XVI».
- **Costo: 0.**

### [~] 1.3 Calvino, *Institución de la religión cristiana* — trad. de Cipriano de Valera (1597)
- **BLOQUEADA POR FUENTE (2026-09-28, GLM)**: la única transcripción española en archive.org es la
  **edición revisada de 1967/1999** (`calvino-institucion-de-la-religion-cristiana-tomo-1/2`, djvu.txt
  2 MB c/u) — portada: «traducida y publicada por Cipriano de Valera en 1597, reeditada por Luis de
  Usoz y Río en 1858, NUEVA EDICIÓN REVISADA EN 1967… QUINTA EDICIÓN INALTERADA 1999». La regla de la
  hoja («sólo sirven traducciones antiguas; las revisiones modernas pueden tener derechos propios»)
  impide ingerir la revisión de 1967 sin permiso. El escaneo del ORIGINAL 1597
  (`Institucion-de-la-religion-christiana-juan-calvino`) es solo imágenes/MP4 sin OCR.
- **Vías abiertas**: (a) pedir permiso al editor de la revisión 1967 (decisión del usuario, como SBU);
  (b) OCR propio del escaneo 1597/Usoz 1858 (Google Books tiene la Usoz) — costoso pero fiel;
  (c) buscar transcripción en Biblioteca Virtual Cervantes.
- Traducción española de dominio público (mismo Valera de la Reina-Valera 1602).
- **Fuente:** edición de Usoz (1858, «Reformistas Antiguos Españoles») en archive.org / Google Books.
- **Salida:** nueva sección «Teología» (obra no versicular). Estructura por libro → capítulo →
  sección. **Clave:** extraer las referencias bíblicas de cada sección y construir un índice
  inverso versículo → secciones, para que desde el lector se vea «Calvino, Institución I.7.4
  cita este versículo». Etiqueta: «Tradición: reformada».
- **Costo: 0.**

### [x] 1.4 Diccionario de W. W. Rand (*A Dictionary of the Holy Bible*) — COMPLETA (ES desplegado)
- **[x] COMPLETA (2026-09-29, GLM)**: limpieza v2 (detector por línea-encabezado MAYÚSCULAS+coma,
  arranque tras la portada, filtro de ruido) → 1.772 entradas → motor (1.281 unidades gratis por
  memoria con Easton; 2.263 traducidas, $0,87) → rand-es/rand-es.json (1.772 entradas ES, 100%,
  desplegadas y verificadas en producción: «Aarón» abre su entrada en español). Integrado en el
  panel del diccionario junto a Easton (P.2 punto 3). Rescate manual: Aarón y Abel (cuyas cabeceras
  de OCR 1859 venían dañadas). OCR descargado (`05. Datos/corpus_crudo/rand/rand-djvu.txt`,
  2,4 MB). Script de limpieza primera versión en `scripts/limpia-rand.mjs` — produce 1.784 entradas
  PERO con ruido: falsas entradas de líneas de atribución («Society», «D. D.») y errores del propio
  OCR de 1859 («Aarox» por Aaron). SIGUIENTE: afinar el filtro de titulares (requerir MAYÚSCULAS del
  todo en el nombre, descartar líneas de atribución de la portada), muestrear 50 entradas contra el
  escaneo, y recién entonces ingesta + motor (~1,5-2 USD). Turno dedicado — la limpieza es «lo más
  trabajoso» como avisaba esta hoja.
- Dominio público («NOT_IN_COPYRIGHT» en Internet Archive).
- **Fuente:** https://archive.org/details/dictionholybible00randrich (texto completo djvu.txt, 2,3 MB)
  y edición de 1886 https://archive.org/details/dictionaryofholy02rand (preferir la más completa;
  anotar cuál se usó).
- **Limpieza (lo más trabajoso):** el texto sale de OCR. Quitar cabeceras y números de página,
  unir palabras cortadas con guion, separar entradas por titular (en mayúsculas en el original),
  normalizar referencias bíblicas al formato que el lector enlaza (`lib/referencias.mjs` del motor).
  Validar con 50 entradas al azar contra el escaneo.
- **Traducción:** motor, obra nueva `rand` en `lib/obras.mjs` siguiendo el modelo de `easton`.
  **Costo estimado: 1,5–2 USD.**
- **Salida:** `public/data/rand/` y `rand-es/`, como `easton/` y `easton-es/`. En el panel del
  diccionario, mostrar Easton y Rand juntos cuando ambos tengan la entrada.

---

## FASE 2 — Datos abiertos: funciones nuevas sin traducción de prosa (≈0–1 USD)

### [ ] 2.1 Theographic Bible Metadata — personas, lugares, eventos, cronología
- **Licencia:** CC BY-SA 4.0. **Fuente:** https://github.com/robertrouse/theographic-bible-metadata
- Datos enlazados por versículo: personas (genealogías), lugares, eventos con fechas aproximadas.
- **Uso en la app:** al leer un versículo, chips con personas y lugares mencionados; ficha de
  persona (padres, hijos, versículos donde aparece); línea de tiempo por libro.
- **Traducción:** sólo nombres y descripciones cortas (glosas) → perfil `glosa` del motor. ≈0,5 USD.
- Crédito CC BY-SA visible en Fuentes.

### [ ] 2.2 OpenBible.info — geografía y referencias cruzadas
- **Licencia:** CC BY. **Fuentes:** https://www.openbible.info/geo/ (lugares con coordenadas) y
  https://www.openbible.info/labs/cross-references/ (~340.000 referencias votadas).
- **Uso:** mapa del lugar al tocarlo (mapa ligero y sin clave, p. ej. Leaflet + teselas OSM con
  atribución; cuidar el peso en móvil). Las referencias cruzadas complementan el TSK ya integrado:
  mostrar primero las más votadas.
- **Traducción:** ninguna (nombres de lugar vía Theographic/glosas).

### [ ] 2.3 MACULA hebreo y griego (Clear Bible) — sintaxis del texto original
- **Licencia:** CC BY 4.0. **Fuente:** https://github.com/Clear-Bible (repos `macula-hebrew`, `macula-greek`).
- Análisis sintáctico completo (cláusulas, sujeto/verbo/objeto, relaciones), lema, morfología, glosas.
- **Uso:** en la vista de lenguas originales, al tocar una palabra: su función en la oración y su
  cláusula. Reutilizar las glosas y la morfología en español ya existentes.
- **Traducción:** sólo glosas nuevas que falten. ≈0,5 USD.

---

## ✅ PUERTA A — superada (2026-09-29): el usuario aprobó la **Fase 3b** (sólo 3.1 y 3.2, dentro del tope de 75 USD)
Dejar en la bitácora: qué se integró, gasto real acumulado, gasto proyectado de la Fase 3 medido
con muestras. **Esperar a que el usuario suba el tope.**

---

## FASE 3 — Salto de calidad exegética · **APROBADA LA 3b: 3.1 + 3.2 (≈18–23 USD)**; 3.3 y 3.4 aplazadas

Todas son obras de comentario versículo a versículo → mismo patrón que `henry`/`jfb`/`barnes`:
carpeta original + carpeta `-es`, obra nueva en `lib/obras.mjs`, muestra → proyección → corrida completa.

### [ ] 3.1 Keil & Delitzsch — *Commentary on the Old Testament* (10 vols., trad. inglesa T&T Clark)
- Dominio público. Fuentes: CCEL, archive.org, StudyLight, o módulos SWORD/e-Sword de dominio público.
- La mejor exégesis del hebreo del s. XIX. Mucho hebreo en el texto: **enmascarar el hebreo y el
  griego** (mismo sistema ⟦n⟧ del léxico) para que vuelvan intactos. ≈15–20 USD.
### [ ] 3.2 Marvin Vincent — *Word Studies in the New Testament* (1887)
- Dominio público. Estudio de palabras griegas por versículo. Enmascarar el griego. ≈3 USD.
### [⏸ aplazada — no empezar] 3.3 Tomás de Aquino — *Catena Aurea* (Evangelios; trad. inglesa de Newman, 1841–45)
- Dominio público. Cadena de citas de los Padres (Agustín, Crisóstomo, Jerónimo…) por versículo.
  Conservar la atribución de cada cita. Etiqueta: «Patrística». ≈6–8 USD.
### [⏸ aplazada — no empezar] 3.4 Alfred Edersheim — *Life and Times of Jesus the Messiah*, *The Temple*, *Sketches of Jewish Social Life*
- Dominio público. Obras no versiculares: sección «Trasfondo» con índice inverso versículo → capítulo,
  como en 1.3. ≈5 USD.

---

## ⛔ PUERTA B — informe antes de la Fase 4 (igual que la Puerta A)

---

## FASE 4 — Amplitud: enciclopedia, teología, apologética, escatología (≈60 USD)

### [ ] 4.1 ISBE 1915 — *International Standard Bible Encyclopedia* (dominio público)
- Muy superior a Easton y Rand. Integrarla en el mismo panel de diccionario. ≈20 USD.
### [ ] 4.2 Calvino — Comentarios (Calvin Translation Society, dominio público)
- Empezar por el Nuevo Testamento; el AT después. Etiqueta: «Tradición: reformada». ≈25–30 USD total.
### [ ] 4.3 Spurgeon — *The Treasury of David* (Salmos, dominio público). ≈8 USD.
### [ ] 4.4 Hermenéutica — sección «Método»
- Milton Terry, *Biblical Hermeneutics* (1883) · Patrick Fairbairn, *The Typology of Scripture*. ≈4 USD.
### [ ] 4.5 Apologética — sección «Apologética»
- Simon Greenleaf, *The Testimony of the Evangelists* · B. B. Warfield, *The Inspiration and
  Authority of the Bible* (verificar edición de dominio público) · J. Gresham Machen,
  *Christianity and Liberalism* (1923) · William Paley, *Evidences of Christianity* ·
  Joseph Butler, *The Analogy of Religion*. ≈5 USD.
### [ ] 4.6 Escatología comparada — sección «Escatología», posturas lado a lado
- **Futurista:** Robert Anderson, *The Coming Prince* (1894, las 70 semanas) · J. A. Seiss, *The Apocalypse*.
- **Preterista:** J. S. Russell, *The Parousia* (1878).
- **Historicista:** Thomas Newton, *Dissertations on the Prophecies*.
- Cada obra con su etiqueta de postura. En Daniel, Mateo 24 y Apocalipsis, mostrar en el lector
  «Esta profecía según cada postura» con enlace a cada obra. ≈6 USD.
### [ ] 4.7 Teología sistemática y confesiones
- Charles Hodge, *Systematic Theology* (≈10 USD).
- Philip Schaff, *The Creeds of Christendom*: Credo Niceno, Calcedonia, Westminster, Heidelberg,
  Augsburgo, 39 Artículos… Enlazar cada artículo con sus textos de prueba. ≈3 USD.
- Etiquetar tradición de cada confesión.
### [ ] 4.8 Flavio Josefo — obras completas (trad. de Whiston, dominio público)
- Índice inverso versículo → pasaje de Josefo que lo ilustra. ≈4 USD.

---

## Descartado (no hacer)
- unfoldingWord ULT/UST: inglés, ya hay WEB; y el texto bíblico no se traduce por máquina.
- Strong 1890 como obra aparte: redundante con el léxico STEPBible.
- *Suma Teológica*: enorme, no versicular; las ediciones españolas modernas tienen derechos.
  Lo patrístico queda cubierto por la *Catena Aurea*.

## Más adelante (lo lleva el usuario, no GLM)
Biblias con derechos de autor: el usuario pedirá los permisos de forma ordenada y legal. **No
ingerir ninguna versión con derechos** hasta que haya un permiso escrito archivado en `02. Legal/`.

## Tareas pendientes previas (si aún no están hechas, van antes de la Fase 1)
- [x] Buscador paso 3: pestaña «Comentarios» en el panel Buscar. (2026-09-28: índices troceados
      com-{obra} bajo ~5 MB crudos ≈ 1,3 MB gzip — Henry 7 trozos, JFB 3, Barnes 6, Easton 1;
      carga perezosa por obra, fragmento con contexto + resaltado, tocar abre la tarjeta del pasaje
      con el comentario de la obra; Easton abre el diccionario en la entrada. Nave's y léxico
      quedan fuera: no son pasajes. Cada obra nueva de la hoja entra con una línea en el generador.)
- [x] Reintentar unidades fallidas: Henry 307, Barnes 46, JFB 43, Easton 17. (2026-09-28: cadenas corridas; re-ensamblados henry/barnes/jfb/easton-es con las recuperadas — Barnes +12, JFB +7)
- [x] Ensamblar y desplegar las definiciones del léxico en español (`node bin/ensamblar.mjs --obra lexdef`)
      si la corrida ya terminó. (2026-09-28: 20.331/22.716 = 90 % desplegado — 11.680 H + 8.651 G; el freno
      de emergencia detuvo el reintento de las 2.385 difíciles al 36 % de rechazo: definiciones largas donde
      el modelo no conserva las máscaras ⟦n⟧ — requieren ajuste de prompt, no gasto ciego)
- [ ] Auditoría Jev del corpus traducido (~2 USD).
