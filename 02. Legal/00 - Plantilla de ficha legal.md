# Plantilla de ficha legal

> Regla dura de bitácora: **ninguna obra entra a la base sin esta ficha aprobada.**
> La licencia se cita **literal**, nunca parafraseada. Si es ambigua, se marca y se escala (no se asume permiso).
> Basada en: checklist de 12 preguntas (ChatGPT, finalistas) + campos GLM (regla del traductor, jurisdicción, copyleft, embeddings).

## Identificación

| Campo | Valor |
|---|---|
| `obra_id` | (OSIS o slug interno) |
| Obra y edición exacta | |
| Titular de derechos | |
| Idioma | |
| Formato de ingesta | USFM 3 / OSIS / XML / OCR |
| URL de origen | |
| Fecha de consulta y verificación (`verified_at`) | |
| Jurisdicción de análisis | EUA · España · América Latina (vida+70) |

## Licencia

| Campo | Valor |
|---|---|
| Licencia exacta (citada literal) | «…» |
| URL del texto de la licencia (archivado junto a la ficha) | |
| `licencia_del_repositorio` vs `licencia_del_contenido` | El MIT/GPL de un repo **nunca** se hereda al texto |
| `traductor` y `año_muerte_traductor` | El DP lo determina la traducción, no solo el autor (GLM) |
| `derechos_edicion_digital` | El marcado/estructura puede tener derechos propios (caso CCEL/ThML) |
| `derechos_imagen` | En facsímiles y escaneos: capa aparte del texto |
| Copyleft | CC BY-SA obliga a heredar ShareAlike en derivados (marcar `copyleft_heredado`) |

## Checklist de las 12 preguntas (ChatGPT, adoptado íntegro)

| # | Pregunta | Respuesta |
|---|---|---|
| 1 | ¿Podemos almacenar el texto en nuestro servidor? | |
| 2 | ¿Podemos crear índices de búsqueda y embeddings? (`permite_embeddings`) | |
| 3 | ¿Podemos servir el texto completo por web y móvil? | |
| 4 | ¿Podemos permitir offline? | |
| 5 | ¿Podemos mostrar publicidad o cobrar suscripción? | |
| 6 | ¿Podemos modificar formato/ortografía/segmentación? | |
| 7 | ¿Podemos traducir o generar derivados? (`permite_traduccion_derivada`) | |
| 8 | ¿Qué avisos de copyright deben mostrarse? | |
| 9 | ¿Existe límite de usuarios, versos, llamadas o concurrencia? | |
| 10 | ¿Qué ocurre al cancelar la licencia? | |
| 11 | ¿La licencia cubre iOS y Android? | |
| 12 | ¿El permiso es mundial o depende de jurisdicción? | |

## Uso en la plataforma

| Campo | Valor |
|---|---|
| Alcance (núcleo MVP / segunda ola) | |
| Capa (texto / léxico / comentario / conexión) | |
| Restricciones técnicas | flags: `restricted` (sin caché offline, sin índice semántico) |
| Atribución visible requerida | texto exacto para el panel «Fuentes» |
| Estado | `borrador` / `aprobada` / `observada` |
