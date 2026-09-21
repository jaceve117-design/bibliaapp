# Ficha legal — Jamieson, Fausset and Brown Commentary (JFB)

> Estado: **aprobada y ejecutada** (ingesta validada 2026-09-21)
> Uso previsto: comentario bíblico EN (traducción ES en ola posterior)

## Identificación

| Campo | Valor |
|---|---|
| `obra_id` | `JFB` |
| Obra y edición exacta | A Commentary, Critical and Explanatory, on the Whole Bible — Robert Jamieson, A. R. Fausset, David Brown (1871) |
| Titular de derechos | Ninguno vigente: dominio público (publicación 1871, autores fallecidos 1879/1910/1897) |
| Idioma | Inglés |
| Formato de ingesta | Texto estructurado por verso → JSON propio |
| URL de origen | https://www.ccel.org/ccel/jamieson/jfb.xml (ThML oficial; crudo en `05. Datos/corpus_crudo/jfb/`) |
| `verified_at` | 2026-09-19 (status PD) · **2026-09-21: ingesta ejecutada desde CCEL ThML oficial** (66 libros, 19.768 anclas de verso) |
| Jurisdicción | PD en EUA (pre-1929) · PD en España/AL (autores fallecidos hace más de 70 años) |

## Licencia

- Licencia exacta: **Dominio público** por antigüedad (Inglaterra, 1871).
- `traductor` (para nuestra versión ES): GLM + revisión humana 100 % doctrinal — obra derivada propia, licencia **CC BY 4.0** (decisión B18, 2026-09-19).
- Copyleft: ninguno. `permite_embeddings: sí`.

## Ingesta ejecutada (2026-09-21)

- **66 libros, 19.768 anclas de verso** (`public/data/jfb/{OSIS}.json` + manifiesto).
- JFB comenta por **anclas de versículo** (grupos): los versos sin ancla quedan cubiertos por el bloque previo, fiel a la edición impresa. Diferencias de granularidad vs RV1909 documentadas en el manifiesto (esperadas).
- Integración: selector Henry/JFB en la barra del comentario (D-001.1 resuelta).

## Checklist de las 12 preguntas

| # | Pregunta | Respuesta |
|---|---|---|
| 1 | ¿Almacenar en nuestro servidor? | Sí (PD) |
| 2 | ¿Índices y embeddings? | Sí |
| 3 | ¿Servir completo por web y móvil? | Sí |
| 4 | ¿Offline? | Sí |
| 5 | ¿Monetizar? | Sí |
| 6 | ¿Modificar formato/ortografía/segmentación? | Sí |
| 7 | ¿Traducir/derivados? | Sí (nuestra traducción ES será CC BY 4.0) |
| 8 | ¿Avisos de copyright? | «JFB (1871) · Dominio público» |
| 9 | ¿Límites? | Ninguno |
| 10 | ¿Al cancelar? | N/A |
| 11 | ¿iOS y Android? | Sí |
| 12 | ¿Mundial? | Sí |
