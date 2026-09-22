# Ficha legal — Versión Biblia Libre (VBL)

> **Estado:** ingerida y validada · 2026-09-22
> **⚠ ÚNICA obra del corpus con ShareAlike.** Leer la sección 4 antes de derivar nada de ella.

## 1. Identificación

| campo | valor |
|---|---|
| **Obra** | Versión Biblia Libre · *The Holy Bible in Spanish, Free Bible Version* |
| **Traductores** | Jonathan Gallagher y Shelly Barrios de Avila |
| **Colaboradores** | Gustavo Sanabria y Rebekah Põldaas |
| **Copyright** | © 2018-2020 Jonathan Gallagher y Shelly Barrios de Avila |
| **Editor** | Free Bible Ministry — www.freebibleversion.org |
| **Texto base** | Nestle-Aland (texto crítico) |
| **Código eBible** | `spavbl` |
| **Fuente del crudo** | https://ebible.org/Scriptures/spavbl_usfm.zip (2,7 MB, descargado 2026-09-22) |
| **Crudo en** | `05. Datos/corpus_crudo/vbl_usfm/` |
| **Salida** | `07. App/app/public/data/vbl/` |

## 2. Licencia

**Creative Commons Attribution-ShareAlike 4.0** (CC BY-SA 4.0).

Cita literal de la página de copyright de la edición (`ebible.org/spavbl/copyright.htm`,
capturada 2026-09-22):

> «copyright © 2018-2020 Jonathan Gallagher y Shelly Barrios de Avila»
> «This translation is made available to you under the terms of the Creative Commons
> Attribution Share-Alike license 4.0»

Obligaciones que impone:

1. **Atribución** — incluir el copyright y la información de la fuente.
2. **Indicar cambios** — señalar cualquier modificación del texto.
3. **ShareAlike** — redistribuir las obras derivadas bajo la misma licencia.

## 3. Por qué entra al corpus

La RV1909 es dominio público y es el texto base del proyecto, pero su castellano de 1909
(«á», «fué», «crió», sintaxis decimonónica) es una barrera real de comprensión. La VBL es
español contemporáneo, traducido con el propósito explícito de evitar «términos difíciles
o confusos», y con licencia abierta.

**No sustituye a la RV1909**, que sigue siendo el texto al que se alinean las citas de los
comentarios (ver Glosario maestro, principio 2). Entra como **lectura alternativa** en el
selector del lector, junto a RV1909 y WEB.

## 4. ⚠ El ShareAlike y la decisión B18

**B18 eligió CC BY 4.0 para las traducciones propias y descartó el copyleft a propósito**,
precisamente para no arrastrar obligaciones de ShareAlike. La VBL es la única pieza del
corpus que lo trae. Conviene tener claro qué contamina y qué no:

**No contamina — agregación.** Servir la VBL en el lector junto a las traducciones propias
es una *colección de obras*, no una obra derivada. Cada obra conserva su licencia: la VBL
sigue CC BY-SA, y Henry-ES, las glosas y la morfología siguen CC BY 4.0. El ShareAlike **no
se propaga** a las traducciones propias, que no derivan de la VBL sino del inglés de Henry.

**Sí contamina — obra derivada.** Cualquier trabajo construido **sobre el texto de la VBL**
hereda CC BY-SA 4.0. Por ejemplo: un interlineal que incruste su texto, una revisión o
edición de sus versículos, una armonía que lo reescriba, o una obra que mezcle su texto con
otro de forma inseparable.

**Regla práctica para el proyecto:**

> La VBL se **sirve**, no se **transforma**. Se muestra tal cual, con su atribución. Si
> alguna vez se quiere derivar algo de ella, esa pieza concreta se publica bajo CC BY-SA 4.0
> y se documenta aquí — nunca se mezcla en silencio con material CC BY.

## 5. Versificación

La VBL traduce desde **Nestle-Aland** (texto crítico), mientras que la RV1909 viene del
linaje *Textus Receptus*. Las diferencias de versificación son **correctas y esperadas**,
no defectos de ingesta: el texto crítico omite pasajes que el TR incluye.

Por eso su entrada en `scripts/ingesta.mjs` lleva `totalEsperado: null` y `anclas: {}`:
exigirle el recuento de la RV1909 habría hecho fallar el portón por una diferencia legítima.
Sí se valida el **canon completo (66 libros)** y la **secuencia sin lagunas ni duplicados**.

Resultado de la ingesta: **31.102 marcadores de verso · 66 libros · 16 versos vacíos en la
fuente**, documentados en `public/data/vbl/_manifest.json`.

## 6. Atribución que debe mostrar el lector

En el panel Fuentes, cuando la VBL esté seleccionada:

> **Versión Biblia Libre** — © 2018-2020 Jonathan Gallagher y Shelly Barrios de Avila.
> Traducción desde Nestle-Aland. Licencia CC BY-SA 4.0. Texto sin modificar.
> freebibleversion.org

La coletilla «texto sin modificar» no es un adorno: es el cumplimiento del punto 2 de la
licencia (indicar los cambios). Mientras el texto se sirva íntegro, eso es lo que hay que
declarar. Si alguna vez se modificara, **hay que decir qué se cambió**.

## 7. Pendientes

- [ ] Reflejar la atribución de la sección 6 en el panel Fuentes del lector.
- [ ] Revisar que la ficha de RV1909 mencione que la VBL es alternativa, no reemplazo.
