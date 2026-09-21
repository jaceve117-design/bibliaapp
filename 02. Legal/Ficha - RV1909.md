# Ficha legal — Reina-Valera 1909 (RV1909)

> Estado: **aprobada para ingesta** (ya ingerida y validada el 2026-09-17)
> Uso: núcleo MVP · capa: texto bíblico ES principal

## Identificación

| Campo | Valor |
|---|---|
| `obra_id` | `RV1909` |
| Obra y edición exacta | Santa Biblia — Reina-Valera 1909 (edición eBible.org `spaRV1909`) |
| Titular de derechos | Ninguno vigente: dominio público (traducción Cipriano de Valera lineage, 1902/1909, Sociedad Bíblica Británica y Extranjera) |
| Idioma | Español |
| Formato de ingesta | USFM 3 → JSON propio (`scripts/ingesta.mjs rv1909`) |
| URL de origen | https://ebible.org/Scriptures/spaRV1909_usfm.zip |
| `verified_at` | 2026-09-14 (existencia y descripción en ebible.org) · 2026-09-19 (texto literal de copyright archivado) |
| Jurisdicción | PD en EUA (publicación 1909, pre-1928) · PD en España/AL (traductores fallecidos hace más de 70 años) |

## Licencia

- Licencia exacta: **Dominio público** (declarada por eBible.org para esta edición). Cita literal: «Public Domain» / «Dominio Público» (página de la edición) y «are in the Public Domain (not copyrighted) in the USA, to the best of my knowledge» (declaración general de eBible.org) — **archivadas en `02. Legal/Licencias literales — eBible y OpenBible.md`** (secciones 1-2).
- `traductor`: equipo de la British and Foreign Bible Society (1902/1909) — fallecidos hace más de 80 años.
- `derechos_edicion_digital`: eBible.org publica la edición sin restricción de redistribución; el marcado USFM usado es estándar. Riesgo bajo.
- Copyleft: ninguno.

## Checklist de las 12 preguntas

| # | Pregunta | Respuesta |
|---|---|---|
| 1 | ¿Almacenar en nuestro servidor? | Sí (PD) |
| 2 | ¿Índices y embeddings? | Sí (PD) — `permite_embeddings: sí` |
| 3 | ¿Servir completo por web y móvil? | Sí |
| 4 | ¿Offline? | Sí |
| 5 | ¿Monetizar? | Sí (PD) |
| 6 | ¿Modificar formato/ortografía/segmentación? | Sí |
| 7 | ¿Traducir/derivados? | Sí |
| 8 | ¿Avisos de copyright? | Atribución honesta de edición: «Reina-Valera 1909 · Dominio público · Fuente: eBible.org» (ya visible en el lector) |
| 9 | ¿Límites? | Ninguno |
| 10 | ¿Al cancelar? | N/A |
| 11 | ¿iOS y Android? | Sí |
| 12 | ¿Mundial? | Sí |

## Ingesta ejecutada (2026-09-17)

- **31.102 marcadores de verso**, 66 libros, 0 lagunas, 11 anclas estrictas pasadas.
- **18 versos vacíos en la edición fuente** documentados en `public/data/rv1909/_manifest.json` (`incidentes`). Ejemplo: JOB 35:16 fusionado en 35:15. No se rellenaron.
- Marcado `\w|strong="Hxxxx"` preservado en el crudo para la futura capa interlineal (tarea 3.7).
- Crudo archivado en `05. Datos/corpus_crudo/rv1909_usfm/` con su ZIP de procedencia.
