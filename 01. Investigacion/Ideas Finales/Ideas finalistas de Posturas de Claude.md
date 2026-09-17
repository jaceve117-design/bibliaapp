# Ideas finalistas de Posturas de Claude

> **Origen:** `01.5.2 - Claude - Conclusion particular.md`, desglosada en ideas seleccionables.
> **Seleccionadas por el humano el 2026-09-17.**
> **Resultado:** 36 elementos — 27 ideas y 9 pasos, de los cuales 5 discrepan del plan vigente.
> Este documento es una de las mitades de la metodología final del proyecto. Se une con las ideas finalistas de GLM.

---

## Estrategia de producto

Dónde está el valor real y qué construimos primero. Aquí están mis tres discrepancias más fuertes con el plan que yo mismo escribí.

### A1 — La traducción al español es el producto, no la Fase 4

RV1909, Matthew Henry, Easton y Strong's existen gratis en diez apps. Nadie cambia de app por tenerlos otra vez con mejor tipografía. Lo único que no existe en ningún lado es el acervo clásico completo en español bien traducido. El lector, el interlineal y la búsqueda son el envase. Cuando haya que elegir entre pulir una función y avanzar la traducción, gana la traducción.

`DISCREPA DEL PLAN`

### A2 — Corte vertical de un solo libro antes de cualquier ingesta masiva

Romanos o Juan completo de punta a punta: texto ES y EN, griego con morfología, tres comentarios traducidos de verdad, diccionario enlazado, notas y subrayados funcionando, ficha legal cerrada de cada fuente. Atraviesa las nueve fases en pequeño y responde la única pregunta que importa: ¿la traducción sale lo bastante buena? Si no sale, lo sabes en semanas y con un libro.

`DISCREPA DEL PLAN`

### A3 — MVP de seis fuentes, no de ocho bloques

RV1909, World English Bible, STEPBible-Data, Easton's, Matthew Henry y el Treasury of Scripture Knowledge. Nada más. La ISBE son nueve mil entradas con OCR sucio de 1915: es magnífica y puede esperar a la v2.

`DISCREPA DEL PLAN`

### A4 — Aplazar el módulo general del Mar Muerto

Legalmente solo podemos enlazar y curar fichas: las imágenes son de la IAA, las transcripciones críticas de Oxford y Brill, la traducción española de Trotta. Es mucho trabajo editorial para entregar ficha más enlace. En la versión 1 es posicionamiento, no función.

`DISCREPA DEL PLAN`

### A5 — Conservar solo el ángulo Qumrán ↔ texto masorético

Mostrar dónde un testigo de Qumrán difiere del texto masorético, anclado al versículo concreto. Eso sí es contenido real, ninguna app popular lo ofrece, y se puede hacer con datos en dominio público. Es un módulo estrecho y honesto en vez de una promesa grande y vacía.

`IDEA NUEVA`

### A6 — Etiquetar siempre autor, tradición y fecha en cada obra

Principio editorial que aportó ChatGPT y que yo elevaría a decisión formal. Presentar cinco siglos de exégesis reformada como una sola voz es históricamente falso y el lector serio lo nota. Etiquetar no diluye la postura protestante: la hace honesta.

`IDEA NUEVA`

---

## Calidad editorial y traducción

El riesgo real no es legal, es que la traducción suene mal o resbale en un término doctrinal. Esto es el mecanismo de confianza del producto.

### B1 — Glosario teológico maestro antes del primer párrafo traducido

Justificación, propiciación, expiación, pacto, redención, santificación, elección. Traducción fija y justificada para cada término técnico, ES↔EN, decidida antes de empezar. Cambiar un término a mitad del corpus obliga a rehacer todo lo anterior.

`IDEA NUEVA`

### B2 — Revisión humana del 100% de lo doctrinalmente sensible

No muestreo. El muestreo sirve para prosa narrativa; no sirve para un párrafo donde Calvino define la imputación. El público de este producto lleva siglos discutiendo sobre estas palabras exactas y detecta un desliz de inmediato.

`IDEA NUEVA`

### B3 — El original siempre visible a un clic

Trazabilidad como función de interfaz, no como metadato. Cada párrafo traducido conserva enlace directo a su original en inglés. Es lo que permite al lector verificar en vez de confiar a ciegas.

`IDEA NUEVA`

### B4 — Memoria de traducción para coherencia entre volúmenes

Sin ella, Matthew Henry cambia de vocabulario entre Génesis y Apocalipsis y se nota. La memoria de traducción es lo que hace que veintitrés volúmenes suenen a un solo traductor.

`IDEA NUEVA`

### B5 — Guía de estilo: transliteración, nombres propios y citas internas

Cómo se transliteran hebreo y griego, qué forma toman los nombres propios, y —lo más delicado— qué pasa cuando un comentario del siglo XVIII cita un versículo con su propia traducción que no coincide con la nuestra.

`IDEA NUEVA`

### B6 — Canal para que el lector reporte errores de traducción

Convierte a los usuarios en el control de calidad que no podemos pagar, y comunica que sabemos que la traducción es perfectible. En este público, eso genera confianza en lugar de restarla.

`IDEA NUEVA`

---

## Blindaje legal

Se resuelve con disciplina, no con incertidumbre. Es trabajo, pero es el trabajo que evita que el proyecto muera de golpe.

### C1 — La fase legal va completa antes del primer byte descargado

Ficha aprobada por obra antes de ingerir. Es la regla dura que ya está en la bitácora y la que más tentación da de saltarse cuando hay prisa.

`YA ES DECISIÓN`

### C2 — Ficha por obra con las doce preguntas contractuales

¿Podemos almacenar, indexar, generar embeddings, servir completo, permitir offline, monetizar, modificar formato, traducir? ¿Qué avisos mostrar, qué límites hay, qué pasa al cancelar, cubre iOS y Android, es mundial o por jurisdicción? Plantilla de ChatGPT, adoptada íntegra.

`YA ES DECISIÓN`

### C5 — Regla del traductor: el dominio público lo determina la traducción

La Institución de Calvino traducida por Battles tiene derechos de Eerdmans aunque Calvino lleve cinco siglos muerto. Campo obligatorio en la ficha: traductor y año de su muerte, no solo los del autor. Hallazgo de GLM.

`IDEA NUEVA`

### C6 — No ingerir desde CCEL sin resolver los derechos de su marcado

La CCEL reclama propiedad sobre su codificación ThML aunque el texto sea dominio público. Por obra: buscar otra fuente sin marcado propietario, pedir autorización expresa, o rehacer el marcado desde el escaneo. Yo la había dado por ingestable: estaba mal.

`IDEA NUEVA`

### C8 — Analizar jurisdicción de España y América Latina, no solo EE.UU.

Las cuatro investigaciones razonan con derecho estadounidense: umbral de 1929, renovación, fair use. Aquí el criterio es vida del autor más setenta años, y da resultados distintos obra por obra.

`IDEA NUEVA`

### C9 — Revisión por abogado de propiedad intelectual antes de publicar

Recomendación explícita de ChatGPT que suscribo. No sustituye la disciplina de las fichas: la valida.

`YA ES DECISIÓN`

---

## Arquitectura

Decisiones técnicas que condicionan todo lo demás. Casi todas ya están en la bitácora como D9 a D15: aquí puedes reafirmarlas o revertirlas.

### D1 — OSIS como referencia canónica universal

Formato John.3.16, estándar real y establecido. Sustituye el ref_canonical que yo había inventado. Entrada del usuario normalizada con bible-passage-reference-parser, que ya resuelve «San Juan 3:16-17», «Jn 3, 16» y «1Jn 1.9» en español e inglés. Hallazgo de Gemini.

`YA ES DECISIÓN`

### D2 — USFM 3 como formato de ingesta primario

Es el estándar de las Sociedades Bíblicas y todos los corpus serios lo exportan. OSIS como respaldo, ZefaniaXML solo como último recurso. Hallazgo de GLM.

`YA ES DECISIÓN`

### D3 — SQLite sobre WebAssembly más IndexedDB en web, SQLite nativo en móvil

Esquemas e índices compartidos entre las dos plataformas. Permite búsqueda de texto completo del lado del cliente, que un service worker no da. Hallazgo de Gemini.

`YA ES DECISIÓN`

### D4 — Sincronización por CRDT, diseñada ahora e implementada después

UUID generado en el cliente y marca de tiempo UTC de alta resolución. Si el esquema de anotaciones no nace pensado para esto, migrarlo más tarde cuesta los cuadernos de los usuarios.

`YA ES DECISIÓN`

### D5 — No embeber software GPL en la aplicación

Del ecosistema SWORD usamos el catálogo como lista de compras y el formato de datos para extraer una vez. No enlazamos libsword ni sus envoltorios. Gemini proponía lo contrario; GLM tenía razón.

`YA ES DECISIÓN`

### D7 — Soporte de obras restringidas desde el esquema, no como parche

Obras que no se cachean offline y no entran al índice semántico. Si algún día llega una traducción licenciada, el sistema ya sabe tratarla distinto sin rediseñar nada.

`IDEA NUEVA`

### D8 — Toda respuesta generada por IA cita su fuente o no se emite

source_id y passage_id obligatorios. Nunca atribuir a una fuente lo que produjo el modelo. En este dominio, una cita inventada es un daño reputacional del que no se vuelve.

`YA ES DECISIÓN`

### D9 — Nunca APIs de terceros en tiempo de ejecución

Las APIs públicas sirven solo como medio de descarga inicial del corpus. Es lo que hace posible el offline real y lo que nos independiza de los términos cambiantes de un proveedor.

`YA ES DECISIÓN`

### D10 — Si entra una traducción con derechos, es por contrato directo

Nunca vía API.Bible: su caché caduca a los 30 días, exige telemetría FUMS y prohíbe procesar el texto con modelos de lenguaje. Las tres condiciones son incompatibles con el offline, con la lectura anónima y con la búsqueda semántica.

`YA ES DECISIÓN`

---

## Pasos a seguir

Mi propuesta de orden de ejecución. Los pasos marcados con ⟡ son puertas: no se pasa de ahí sin una decisión explícita tuya.

### E1 — Definir nombre, dominio y disponibilidad en tiendas

Bloquea marca, diseño y despliegue. Es lo primero porque todo lo demás cuelga de ahí.

`YA ES DECISIÓN` · `ORDEN 01`

### E3 — Plantilla de ficha legal y las seis fichas del MVP

RV1909, WEB, STEPBible, Easton, Matthew Henry y TSK. Seis fichas completas con licencia archivada literal, no parafraseada.

`IDEA NUEVA` · `ORDEN 02`

### E7 — Elegir el libro piloto e ingerir su capa STEPBible

Morfología, léxicos e interlineal alineado palabra a palabra, solo para ese libro.

`IDEA NUEVA` · `ORDEN 03`

### E9 — Traducir el comentario de Matthew Henry sobre el libro piloto

La prueba de fuego: prosa larga, densa y doctrinalmente cargada.

`IDEA NUEVA` · `ORDEN 04`

### E11 — Revisión editorial humana del piloto completo

Con el glosario en la mano y un revisor con formación teológica. Aquí se descubre lo que el pipeline no ve.

`IDEA NUEVA` · `ORDEN 05`

### E12 — PUERTA · Decisión sobre la calidad de la traducción

¿Es lo bastante buena para publicarse con nuestro nombre? Si no lo es, se corrige el método antes de escalar. Escalar una traducción mediocre es el único error irreversible del proyecto.

`DISCREPA DEL PLAN` · `PUERTA DE DECISIÓN` · `ORDEN 06`

### E14 — Treasury of Scripture Knowledge y referencias cruzadas

Unas 500.000 referencias que convierten una colección de textos en una red navegable.

`IDEA NUEVA` · `ORDEN 07`

### E17 — Aplicación móvil con Capacitor

Android primero, iOS después. Mismo build, SQLite nativo para el corpus local.

`IDEA NUEVA` · `ORDEN 08`

### E18 — PUERTA · Revisión legal final y lanzamiento

Página pública de atribuciones, revisión de abogado, y solo entonces publicar.

`YA ES DECISIÓN` · `PUERTA DE DECISIÓN` · `ORDEN 09`

---

## Descartadas

Se registran para que la decisión quede trazable y se pueda revisar más adelante.

- `A7` Mantener a Clarke y a los padres pese al curado protestante
- `A8` Estado de revisión de cada traducción visible al lector
- `B7` Orden de traducción: Easton primero, después Matthew Henry
- `C3` Decidir esta semana la licencia de nuestras propias traducciones
- `C4` Decidir esta semana el modelo de sostenimiento
- `C7` La licencia del repositorio nunca se hereda al contenido
- `C10` Cada módulo del catálogo SWORD necesita su propia ficha
- `D6` El corpus CC BY-SA debe ser separable desde el modelo de datos
- `E2` PUERTA · Decidir licencia de nuestras traducciones y modelo de sostenimiento
- `E4` Esquema de datos con OSIS y el modelo de anotaciones
- `E5` Glosario teológico maestro, versión 1
- `E6` Pipeline de ingesta USFM y carga de RV1909 más WEB
- `E8` Traducir las entradas de Easton referenciadas en el libro piloto
- `E10` Construir el lector completo, solo para ese libro
- `E13` Escalar la ingesta al resto del corpus del MVP
- `E15` PWA y corpus offline empaquetado
- `E16` Cuentas y sincronización de notas

---

## Secuencia de ejecución resultante

01. Definir nombre, dominio y disponibilidad en tiendas
02. Plantilla de ficha legal y las seis fichas del MVP
03. Elegir el libro piloto e ingerir su capa STEPBible
04. Traducir el comentario de Matthew Henry sobre el libro piloto
05. Revisión editorial humana del piloto completo
06. **PUERTA · Decisión sobre la calidad de la traducción**
07. Treasury of Scripture Knowledge y referencias cruzadas
08. Aplicación móvil con Capacitor
09. **PUERTA · Revisión legal final y lanzamiento**


*Generado desde el selector de ideas de la postura de Claude.*
