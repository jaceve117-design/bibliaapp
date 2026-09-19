# Ficha legal — Matthew Henry, Complete Commentary (1706–1714)

> Estado: **aprobada y ejecutada** (ingesta validada 2026-09-17)
> Uso: núcleo MVP · capa: comentario expositivo-devocional — pieza central del piloto de traducción (puerta D20)

## Identificación

| Campo | Valor |
|---|---|
| `obra_id` | `HENRY-COMPLETO` |
| Obra y edición exacta | Exposition of the Old and New Testaments — edición completa de 6 volúmenes (1706–1714 por M. Henry; completado por discípulos hasta 1721) |
| Titular de derechos | Ninguno: dominio público (obra) · edición markdown: lyteword/mhenry-complete bajo **CC0-1.0** (renuncia explícita) |
| Idioma | Inglés (traducción ES planificada — pieza central del producto) |
| Formato de ingesta | Markdown (edición CC0) → JSON por libro (`scripts/ingesta-henry.mjs`) |
| URL de origen | https://github.com/lyteword/mhenry-complete (CC0-1.0 verificada via GitHub API) |
| `verified_at` | **2026-09-17**: licencia CC0-1.0 verificada; la obra subyacente es PD por antigüedad (autor †1714, colaboradores s. XVIII) |
| Jurisdicción | PD mundial |

## Licencia

- **Doble seguridad jurídica:** (1) obra subyacente en dominio público por fecha y muerte del autor; (2) la edición digital usada está dedicada al dominio público por CC0-1.0 — sin marcado propietario (a diferencia del caso CCEL/ThML).
- `traductor` (para nuestra versión ES): GLM + revisión humana 100 % doctrinal (B2) — la traducción será obra derivada propia; **su licencia es decisión pendiente de bitácora, a cerrar antes del primer párrafo publicado**.
- Copyleft: ninguno.
- ⚠️ Regla del traductor ya aplicada: esta edición es el comentario COMPLETO original, no una revisión moderna con derechos.

## Ingesta ejecutada (2026-09-17)

- **1.189 capítulos (100 % de cobertura contra RV1909) · 3.366 secciones · ~6,3 millones de palabras.**
- Estructura: resumen de capítulo + secciones con verso de inicio derivado de las citas con superíndices. El texto KJV citado entre secciones NO se publica (ya tenemos RV1909 propia).
- Portón pasado: 66 libros, 0 capítulos faltantes, contenido verificado por capítulo.
- Salida: `public/data/henry/{OSIS}.json` (34 MB) + manifiesto. Crudo en `05. Datos/corpus_crudo/mhenry/`.
- En el lector: modo Comentario (botón ✎) con secciones colapsables ancladas al verso de inicio.

## Checklist de las 12 preguntas

1. Almacenar: **sí** · 2. Embeddings: **sí** · 3. Servir completo: **sí** · 4. Offline: **sí** · 5. Monetizar: **sí** · 6. Modificar formato/segmentación: **sí** · 7. Derivados: **sí** · 8. Avisos: «Matthew Henry, Complete Commentary (1706–1721) · Dominio público · edición CC0 · Traducción ES: [nuestra nota]» · 9-12: sin límites, N/A, sí, mundial.
