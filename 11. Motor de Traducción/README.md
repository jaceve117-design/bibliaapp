# Motor de Traducción y Auditoría por Lotes — Matthew Henry EN → ES

Pipeline fuera de tiempo real. **No traduce desde la conversación**: corre solo contra
la API. Los tokens caros son los del chat; aquí sólo se paga el texto.

## Escala real del corpus (medida, no estimada)

| | |
|---|---|
| Capítulos | 1.189 |
| Unidades traducibles | **30.449** (25.913 párrafos + 3.366 títulos + 1.170 resúmenes) |
| Ya hecho a mano | Juan — 2.181 unidades (**patrón de oro**, nunca se retraduce) |
| Cola real | **28.268 unidades · 32,2 M caracteres** |
| Coste de traducción | **~29 USD** con `@cf/mistralai/mistral-small-3.1-24b-instruct` (medido) |
| Auditoría censal con Jev | **~2 USD** (la salida no se cobra) |
| *Referencia* | *~198 USD con `claude-sonnet-5`* |

## Arquitectura

La unidad atómica de estado es el **párrafo**, no el capítulo: si falla el párrafo 40
de un capítulo de 8.000 palabras, se reintenta el párrafo. El lote es sólo una unidad
de eficiencia de red.

```
henry/{OSIS}.json ──► extracción ──► memoria de traducción (hash) ──► lotes
                                              │                        │
                                     (645 duplicados gratis)     traductor LLM
                                                                       │
   CAPA 1 · validadores deterministas ◄────────────────────────────────┘
   gratis · exacta · 0% falsos positivos sobre el oro
        │ pasa                          │ falla grave
        ▼                               ▼
   CAPA 2 · auditor                reintento con el motivo inyectado
   Jev censal (~1 USD) o                 │ falla otra vez
   juez LLM muestreado                   ▼
        │                           estado: fallida
        ▼
   CAPA 3 · consola de revisión humana (paso 4)
   cola ordenada por confianza ASCENDENTE — lo peor primero
        │
        ▼
   henry-es/{OSIS}.json   (contrato idéntico al de fusiona-henry-es.mjs)
```

### Por qué así

- **El formato no se pide, se hace imposible de romper.** La ingesta ya entrega texto
  plano (`ingesta-henry.mjs` limpia el markup y descarta las citas KJV), así que no hay
  etiquetas que un modelo pueda corromper. Lo que sí se verifica mecánicamente:
  cardinalidad, referencias, cifras, longitud.
- **Lo que un regex resuelve con certeza no se le pregunta a un modelo**, por barato
  que sea. La capa 1 es gratis y exacta; la capa 2 es para juicio.
- **Jev es auditor, no traductor.** No genera texto. Como su salida no se cobra,
  auditar el 100% cuesta ~1 USD: el control de calidad pasa de muestral a **censal**.
  Pero el pipeline **no depende** de Jev (acceso anticipado): degrada solo a juez LLM
  muestreado.
- **El humano manda.** Ningún veredicto de IA retira la etiqueta «sin revisar».

## Uso

```bash
node bin/piloto.mjs                 # capa 1 contra Juan — gratis, sin claves
node bin/piloto.mjs --auditor       # ¿Jev discrimina bueno de malo? (~centavos)
node bin/piloto.mjs --traductor     # ¿el motor alcanza tu Juan? (~centavos)

node bin/traducir.mjs --simular     # coste y lotes, sin llamadas
node bin/traducir.mjs --libro MAT   # traduce un libro
node bin/traducir.mjs               # toda la cola, en el orden de config.mjs

node bin/auditar.mjs                # capa 2
node bin/ensamblar.mjs              # escribe henry-es/{OSIS}.json
node bin/consola.mjs                # http://localhost:4317 — proceso + revisión
```

Reanudable e idempotente: matas el proceso, lo relanzas, sigue donde iba. Si cambia el
original (cambia su hash), se rehace **esa** unidad y sólo esa.

### Claves

```bash
export ANTHROPIC_API_KEY=...   # traductor
export GEMINI_API_KEY=...      # auditor de repuesto
export MT_TOPE_USD=200         # tope duro; el motor para en seco
```

**Jev tiene dos rutas** y el adaptador elige sola; Cloudflare tiene prioridad:

```bash
# A) Cloudflare Workers AI — modelo typesafe/jev. SIN lista de espera.
#    Es la ruta corta: este proyecto ya usa la cuenta de Cloudflare para Pages.
export CLOUDFLARE_ACCOUNT_ID=...
export CLOUDFLARE_API_TOKEN=...   # token con permiso Workers AI: Read

# B) TypeSafe directo — acceso anticipado vía console.typesafe.ai
export JEV_API_KEY=...
```

Comprueba cuál está activa:

```bash
node -e "import('./lib/proveedores/jev.mjs').then(m=>console.log(m.rutaActiva()))"
```

## Frenos

- **Límite de ritmo del gateway.** El AI Gateway corta con 429 en cadena pasadas unas
  200 peticiones seguidas a un modelo de terceros: medido, en una corrida de 400
  auditorías pasaron las primeras 201 y fallaron **todas** las demás. `lib/ritmo.mjs`
  abre una pausa GLOBAL creciente al primer 429 (de nada sirve que un obrero espere
  mientras los otros siguen machacando) y la relaja sola al volver a pasar peticiones.
  Sin esto, la auditoría censal del corpus se pierde entera a los pocos minutos.
- **Tope de gasto duro.** Al alcanzarlo el motor se detiene; el estado queda guardado.
- **Freno por tasa de rechazo.** Si >25% de los últimos 50 lotes se rechazan, para:
  significa que algo se rompió sistémicamente y no quieres descubrirlo 900 capítulos
  después.
- **Juan es intocable.** `ensamblar.mjs` nunca sobrescribe `JHN.json`.

## Validación end-to-end (ejecutada sobre Mateo 1)

Corrida completa traducir → auditar → ensamblar, con datos reales:

| | |
|---|---|
| Traducción | 43/43 unidades · **0 fallos de capa 1** · 0,033 USD |
| Auditoría censal (Jev) | 39 aprobadas · 4 marcadas · **0,0029 USD** → **1,91 USD el corpus** |
| Ensamblado | contrato del lector intacto: secciones, anclas `v` y cardinalidad idénticas al EN |
| `tsc --noEmit` de la app | limpio |

### Bake-off de traductores (100 párrafos de Juan · Jev de juez · tu traducción de línea base)

Todos sobre **los mismos** 100 párrafos, enfrentados par a par:

| modelo | USD corpus | fidelidad | fluidez | vs humano (G-P-E) | veredicto |
|---|---|---|---|---|---|
| *traducción humana* | — | 2,62 | 2,78 | — | — |
| **@cf/mistralai/mistral-small-3.1-24b-instruct** | **29** | 2,66 | **2,79** | **30-21-48** | empate estadístico (p≈0,21) |
| @cf/meta/llama-3.3-70b-instruct-fp8-fast | 44 | 2,65 | 2,69 | 26-40-34 | peor (p≈0,085) |
| @cf/meta/llama-4-scout-17b-16e-instruct | 25 | 2,65 | 2,68 | 24-40-36 | peor (p≈0,046) |
| @cf/openai/gpt-oss-20b | 52 | 2,32 | 2,40 | — *(n=8)* | descartado |
| @cf/qwen/qwen3-30b-a3b-fp8 | 16 | 2,36 | 2,56 | — *(n=8)* | descartado |
| @cf/meta/llama-3.1-8b-instruct-fp8 | 13 | — | — | — | **falla: 1/8, no sostiene el JSON** |
| claude-sonnet-5 *(sin medir)* | *198* | — | — | — | — |

**Las medias no distinguen nada**: 2,65 / 2,65 / 2,66 para los tres primeros. Sólo el
enfrentamiento por pares los separa. De ahí que `bin/comparar.mjs` informe G-P-E.

**Elegido: Mistral-Small-3.1-24B** — 34% más barato que Llama-3.3-70B y el único que no
queda por debajo de la traducción humana. Corpus completo: **~29 USD**.

### Modelos de razonamiento: descartados

Los modelos de razonamiento gastan 13.000–19.000 caracteres de cadena de pensamiento
**por párrafo** en una tarea donde razonar no aporta: salen 11–17× más caros.

**Advertencia sobre esta tabla:** que las máquinas puntúen por encima del humano no
prueba que sean mejores — prueba que la rúbrica mide fidelidad y fluidez, no VOZ.
Lo que hace bueno a tu Juan (una misma voz sostenida a lo largo de 28.000 párrafos,
las decisiones del glosario aplicadas con criterio, la cadencia de Henry) es
precisamente lo que ninguna rúbrica puntúa. La decisión es leer el cotejo.

## El sesgo de la métrica: los modelos modernizan

Comparando el MISMO párrafo (Jn 13:1-17) entre la traducción humana y Mistral-Small:

> **humano** — «era acción de singular naturaleza… no fuese que su aceptamiento de
> aquello pareciese tomar estado, **prestamente** lo equilibra con este acto de
> **abajamiento**»
>
> **Mistral** — «fue una acción de naturaleza singular… para que su aceptación de esto
> no pareciera tomar estado, **pronto** lo equilibra con este acto de **abatimiento**»

El modelo moderniza, y Jev le premia la **fluidez** por ello — cuando el principio 1
del glosario prohíbe expresamente academizar o modernizar. El `score` de `registro`
debería cazarlo pero sólo tiene tres niveles: demasiado grueso.

**Consecuencia práctica:** parte de la ventaja que un modelo saca en la tabla puede
venir de hacer justo lo que el encargo veta. Por eso la tabla nunca decide sola.

## Método de comparación: pares, no promedios

Medido sobre Juan 1 (123 párrafos, mismo texto, dos traductores, mismo juez):

| traductor | aprobadas | fidelidad | fluidez | registro |
|---|---|---|---|---|
| humano | 80/100 | 2,660 | **2,683** | **1,691** |
| motor (Llama-3.3-70B) | 96/101 | **2,690** | 2,589 | 1,604 |

Los promedios parecen empatados. **Párrafo a párrafo: humano 40, motor 18, empate 42.**
El humano gana más de dos a uno, y el promedio lo escondía porque mezcla párrafos
distintos. Por eso `bin/comparar.mjs` informa `vs_humano (Gana-Pierde-Empata)` sobre
el mismo párrafo, y no sólo medias.

Nótese también que **el motor pasa la puerta de aprobación MÁS veces que el humano**
(96/101 contra 80/100) siendo peor en el cotejo directo: la puerta mide ausencia de
defectos detectables, no calidad. La traducción humana es más libre y dispara más
banderas.

## Resultado del piloto de la capa 1 (ejecutado)

Sobre los 1.565 párrafos de Juan con traducción humana:

- **0 falsos positivos** (0,0%) — el validador nunca bloquea trabajo bueno.
- Detección sobre degradaciones deliberadas: omisión 78%, texto-máquina 100%,
  registro 29%, terminología 16%, literalidad 0%.

## Resultado del piloto de la capa 2 — Jev (ejecutado)

Precisión **97,2%** · sensibilidad **84,0%** · falsos positivos **12%** → **discrimina**.

Para llegar ahí hubo que corregir la rúbrica, no el umbral: Jev marcaba como
«literalidad» la sintaxis periódica que tu glosario manda conservar. Se resolvió
metiendo el ENCARGO dentro del `state` (ver `lib/proveedores/jev.mjs`), que es lo
que le faltaba saber. Los falsos positivos bajaron de 16% a 12%.

Jev devuelve `score` **continuo** (2,64), no el índice entero del nivel, y su
`confidence` baja siempre que el valor cae entre dos niveles — por eso la confianza
**no** entra en la decisión de aprobar: se usa para ordenar la cola humana.

## Normalización de referencias

Los modelos inventan abreviaturas razonables que el lector NO sabe enlazar
(`He 4:2`, `Da 9:24`, `Tt 2:13`, `Nú 24:17`, `Ga 3:13`). No se le pide al modelo que
acierte: `lib/referencias.mjs` las reescribe de forma determinista a las formas que
usa tu Juan, leyendo la tabla del **propio lector** para que no puedan divergir.
Se aplica al traducir y otra vez al ensamblar (idempotente).

Encontró además un hueco real en la app: `Abd` (Abdías) no estaba en la tabla del
lector — toda cita española a Abdías era un enlace muerto. Corregido en
`07. App/app/lib/referencias.ts`.

Registro y literalidad en cero **es lo correcto**: son juicio, no forma, y son
exactamente el trabajo de la capa 2. Ese reparto es el que hay que verificar con
`--auditor` antes de lanzar la corrida completa.

### Mejora barata pendiente en tu glosario

La detección **grave** de terminología se dispara sólo con las variantes que el propio
glosario veta entre comillas angulares (`NO sustituir por «expiación»`, `No «alianza»`).
Hoy son **7 de 63 términos**. Cada veto que añadas a la columna de justificación del
`Glosario teologico maestro v1.md` amplía la detección mecánica **sin tocar código y
sin coste**.

## Estado en disco (`estado/`)

| archivo | qué es |
|---|---|
| `resultados.jsonl` | una fila por unidad traducida; la última por id gana |
| `auditoria.jsonl` | veredictos de la capa 2 |
| `revision.jsonl` | **decisiones humanas** — mandan sobre la IA |
| `memoria.json` | memoria de traducción por hash del original |
| `gasto.json` | contador de coste acumulado |
| `piloto-*.json` | resultados de calibración (no tocan producción) |

## Decisiones pendientes del usuario

Marcadas con `⟡` en `config.mjs`. Hoy corren con estos valores **supuestos**:

1. **Traductor**: `claude-sonnet-5`.
2. **Orden de la cola**: NT completo → Génesis/Salmos/Proverbios → resto del AT.
3. **Autocorrección**: sólo fallos deterministas de forma. Nada doctrinal sin humano.
4. **Tope de gasto**: 150 USD — *por debajo* de los ~198 que cuesta el corpus entero.
5. **Auditor**: `auto` (Jev si hay clave, si no Gemini muestreado).
