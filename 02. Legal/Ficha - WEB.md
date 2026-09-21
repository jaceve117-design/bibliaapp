# Ficha legal — World English Bible (WEB)

> Estado: **aprobada para ingesta** (ya ingerida y validada el 2026-09-17)
> Uso: núcleo MVP · capa: texto bíblico EN principal

## Identificación

| Campo | Valor |
|---|---|
| `obra_id` | `WEB` |
| Obra y edición exacta | World English Bible (edición eBible.org `eng-web`, 2024-01-15) |
| Titular de derechos | Texto: dominio público (compilación de Michael Paul Johnson y equipo eBible) |
| Idioma | Inglés |
| Formato de ingesta | USFM 3 → JSON propio (`scripts/ingesta.mjs web`) |
| URL de origen | https://ebible.org/Scriptures/eng-web_usfm.zip |
| `verified_at` | 2026-09-17 (ingesta directa del sitio oficial) · 2026-09-19 (texto literal de copyright archivado) |
| Jurisdicción | PD en EUA (dedicación explícita del proyecto) · mundial |

## Licencia

- Licencia exacta: **Dominio público** — la WEB está dedicada explícitamente al dominio público por su editor. Cita literal: «is in the Public Domain. That means that it is not copyrighted.»; «copy, publish, proclaim, distribute, redistribute, sell, give away, quote»; regla de nombre tras modificación — **archivadas en `02. Legal/Licencias literales — eBible y OpenBible.md`** (secciones 1 y 3).
- **Marca registrada (dato crítico):** el nombre «World English Bible» es una marca registrada de Michael Paul Johnson. Regla: el texto es PD, pero si usamos el *nombre* debemos cumplir sus pautas de uso (atribución y aviso de que no es una edición oficial de su editorial). Alternativa limpia: mostrar «WEB» con nuestra propia ficha de procedencia. Decisión de interfaz pendiente — hoy el lector muestra «WEB».
- `traductor`: Michael Paul Johnson et al. (1997–presente, actualización continua).
- Copyleft: ninguno.

## Checklist de las 12 preguntas

| # | Pregunta | Respuesta |
|---|---|---|
| 1 | ¿Almacenar? | Sí (PD) |
| 2 | ¿Índices y embeddings? | Sí — `permite_embeddings: sí` |
| 3 | ¿Servir completo? | Sí |
| 4 | ¿Offline? | Sí |
| 5 | ¿Monetizar? | Sí (PD) — con respeto de la marca si usamos el nombre completo |
| 6 | ¿Modificar formato/segmentación? | Sí |
| 7 | ¿Traducir/derivados? | Sí |
| 8 | ¿Avisos? | Atribución de edición: «World English Bible · Dominio público · Fuente: eBible.org» (visible en lector) + revisar pautas de la marca antes de usar el nombre completo en marketing |
| 9 | ¿Límites? | Ninguno |
| 10 | ¿Al cancelar? | N/A |
| 11 | ¿iOS y Android? | Sí |
| 12 | ¿Mundial? | Sí |

## Ingesta ejecutada (2026-09-17)

- **31.103 marcadores de verso**, 66 libros canónicos (los deuterocanónicos del ZIP quedan preservados en el crudo para la decisión pendiente de canon), 0 lagunas, anclas pasadas.
- **Versificación verificada con evidencia:** ROM 16 termina en v24 — la doxología TR 16:25-27 va en nota al pie y `\v 25` queda como marcador vacío. Por eso ROM = 434 (no 433) y el total es 31.103.
- **5 versos vacíos en la fuente** documentados en `public/data/web/_manifest.json`.
- Marcado `\w|strong="Gxxxx"` preservado en el crudo.
- Crudo en `05. Datos/corpus_crudo/web_usfm/` con su ZIP.
