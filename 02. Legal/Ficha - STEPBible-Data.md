# Ficha legal — STEPBible-Data (TAHOT, TAGNT, TBESH, TBESG, TFLSJ)

> Estado: **aprobada** (pendiente de ingesta — tarea 3.5/3.6 de bitácora)
> Uso: núcleo MVP · capa: lenguas originales, morfología y léxicos. El activo abierto más valioso del proyecto.

## Identificación

| Campo | Valor |
|---|---|
| `obra_id` | `STEPBIBLE-DATA` |
| Obra y edición exacta | STEPBible-Data: TAHOT (AT hebreo con morfología, base Westminster Leningrad), TAGNT (NT griego amalgamado NA27/28+TR+SBLGNT+Byz+WH), TBESH (léxico hebreo), TBESG (léxico griego), TFLSJ (Liddell-Scott-Jones) |
| Titular de derechos | Tyndale House, Cambridge / STEPBible |
| Idiomas | Hebreo, griego, inglés (definiciones de léxicos) |
| Formato de ingesta | TSV tabular → nuestro esquema `node/lemma` |
| URL de origen | https://github.com/STEPBible/STEPBible-Data |
| `verified_at` | **2026-09-14 — verificado en vivo**: el README del repo declara la licencia CC BY 4.0 (única ficha del núcleo con texto de licencia ya leído en su fuente) |
| Jurisdicción | Mundial (CC BY 4.0 es jurisdicción-neutral) |

## Licencia

- Licencia exacta: **Creative Commons Attribution 4.0 International (CC BY 4.0)** — «You are free to share and adapt the data for any purpose, including commercially, provided attribution is given». Cita del README del repositorio oficial (verificada 2026-09-14).
- Obligación: **atribución visible** (ya contemplada: panel «Fuentes») + declarar modificaciones si se alteran los datos.
- `permite_embeddings: sí` · `permite_traduccion_derivada: sí` (las definiciones de TBESH/TBESG pueden traducirse al español — manteniendo atribución).
- Copyleft: ninguno (BY, no SA).

## Checklist de las 12 preguntas

1. Almacenar: **sí** · 2. Embeddings: **sí** · 3. Servir completo: **sí** · 4. Offline: **sí** · 5. Monetizar: **sí** · 6. Modificar formato: **sí, documentando cambios** · 7. Traducir/derivados: **sí, con atribución** · 8. Avisos: «Datos bíblicos originales: STEPBible-Data (Tyndale House), licencia CC BY 4.0» · 9. Límites: ninguno · 10. Cancelación: N/A · 11. iOS/Android: sí · 12. Mundial: sí.

## Notas de ingesta

- El TSV de TAHOT/TAGNT alinea cada palabra hebreo/griega con lema, morfología y Strong extendido — es la base del interlineal y del enlace pasaje→léxico.
- TAGNT es *amalgamado* (variantes de NA28, TR, SBLGNT, Byz): decidir por edición al ingerir (guardar la variante como atributo, no como texto distinto).
- Conexión con RV1909/WEB: vía número de Strong sobre el marcado `\w|strong` ya preservado en nuestros crudos.
