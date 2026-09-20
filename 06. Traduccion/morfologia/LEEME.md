# Morfología en español

Traducción al español del vocabulario morfológico de STEPBible-Data (TAHOT hebreo y TAGNT griego).

**Autor de la traducción:** Claude (Opus 5) · **Fecha:** 2026-09-20
**Estado de revisión:** `sin_revisar` — pendiente de revisión humana.

---

## Por qué esto primero

Es el mayor valor por palabra traducida de todo el proyecto. No son dos mil cadenas sueltas: los dos esquemas son **composicionales**, así que se traduce un vocabulario cerrado de átomos —unas 150 entradas entre los dos idiomas— y de ahí se componen los **2.061 códigos** que aparecen en el corpus, que a su vez etiquetan **474.911 palabras** de toda la Biblia.

Hasta ahora el lector hispanohablante abría el interlineal y encontraba `V-PAI-3S`. Ahora encuentra *«verbo presente voz activa indicativo 3ª persona singular»*.

## Archivos

| Archivo | Contenido |
|---|---|
| `morfologia-atomos-es.json` | El diccionario de átomos con su procedencia. Es la fuente: si hay que corregir algo, se corrige aquí y se regenera. |
| `codigos-griego-es.json` | 1.082 códigos griegos → etiqueta en español. Cobertura **99,94 %** de los tokens del NT. |
| `codigos-hebreo-es.json` | 941 códigos hebreos y arameos → etiqueta en español. Cobertura **99,40 %** de los tokens del AT. |
| `_pendientes.json` | Los átomos que el corpus usa y que **no** están resueltos. No se inventaron: se registraron. |

## Procedencia — y una diferencia importante entre los dos

**Hebreo — verificado en fuente.** La tabla completa de códigos se tomó literalmente de la legenda oficial de OpenScriptures, que es la que TAHOT declara seguir:
`https://hb.openscriptures.org/parsing/HebrewMorphologyCodes.html` (consultada el 2026-09-20).
Se añadió el subtipo `Nt` = *título*, extensión de Tyndale que no figura en esa legenda pero que el corpus usa de forma inequívoca — se confirmó inspeccionando los datos, donde aparece consistentemente sobre «Faraón».

**Griego — PENDIENTE DE VERIFICACIÓN.** ⚠️
La legenda oficial de TAGNT vive en un Google Doc que no es accesible de forma programática (`TinyURL.com/TAGNT-Intro`). La tabla griega se reconstruyó sobre el esquema Robinson/Tauber, que es el que TAGNT declara usar como base.

**Esto incumple la regla C1/C2 del proyecto: cita literal, no de memoria.** Queda marcado en el manifiesto con `verificada_en_fuente: false` y **no debe publicarse sin cotejarse antes** contra el documento oficial. Es un cotejo de una sentada: abrir el documento y verificar unas ochenta entradas.

## Atribución obligatoria

Los datos morfológicos de origen son **CC BY 4.0**. La licencia exige atribución visible allí donde se muestren:

> Datos morfológicos de STEPBible.org, Tyndale House Cambridge, CC BY 4.0

La traducción al español de las etiquetas es obra derivada nuestra.

## Cómo regenerar

Los tres JSON se producen con un script que lee el corpus crudo de `05. Datos/corpus_crudo/stepbible_data/`, extrae todos los códigos realmente usados, los compone contra el diccionario de átomos y reporta la cobertura. Corregir un átomo y regenerar recalcula los 2.061 códigos de forma coherente.

## Qué falta

- [ ] Cotejar la tabla griega contra el intro oficial de TAGNT y poner `verificada_en_fuente: true`
- [ ] Resolver los átomos de `_pendientes.json` (0,06 % del griego, 0,60 % del hebreo)
- [ ] Revisión humana de la terminología gramatical en español
- [ ] Decidir la forma de presentación en el lector: etiqueta completa, abreviada, o ambas según el espacio
- [ ] Cablear en el lector — **requiere el refactor del selector de comentario**, pendiente de pausar la automatización de traducción
