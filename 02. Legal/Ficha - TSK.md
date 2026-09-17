# Ficha legal — Treasury of Scripture Knowledge (TSK)

> Estado: **aprobada** (pendiente de ingesta — paso 5 del plan)
> Uso: núcleo MVP · capa: conexiones (referencias cruzadas)

## Identificación

| Campo | Valor |
|---|---|
| `obra_id` | `TSK` |
| Obra y edición exacta | The Treasury of Scripture Knowledge (compilación de R.A. Torrey y otros, ed. 1907; original de T. Scott, s. XVIII–XIX) |
| Titular de derechos | Ninguno: dominio público |
| Idioma | Inglés (las referencias son universales; los extractos de texto en inglés NO se publican — solo la referencia) |
| Formato de ingesta | Dataset estructurado de OpenBible.info (TSV/JSON) o derivación de módulos SWORD → tabla `link` sobre OSIS |
| URL de origen | https://www.openbible.info/links/ (y http://www.sacred-textos? fijar) |
| `verified_at` | ⚠️ pendiente: archivar la declaración de licencia de OpenBible para ESTE dataset (la licencia de OpenBible se declara por dataset, no global) |
| Jurisdicción | PD EUA · mundial |

## Licencia

- La obra subyacente (1907): **dominio público** por fecha.
- El dataset de OpenBible.info: ⚠️ verificar declaración específica (el sitio declara licencias por dataset; históricamente CC BY para datos derivados). Regla C7: la licencia del repo/proveedor no se hereda automáticamente — se archiva la declaración del dataset concreto.
- Copyleft: por confirmar según dataset.

## Checklist de las 12 preguntas

1. Almacenar: **sí** · 2. Embeddings: **sí** · 3. Servir completo (referencias, sin extractos): **sí** · 4. Offline: **sí** · 5. Monetizar: **sí** · 6. Modificar: **sí** (normalización OSIS) · 7. Derivados: **sí** · 8. Avisos: «Treasury of Scripture Knowledge (1907) · Dominio público» + crédito de normalización si usamos el dataset de OpenBible · 9-12: sin límites, N/A, sí, mundial.

## Notas de ingesta

- ~500.000 referencias cruzadas. Cada entrada: `(osis_origen, osis_destino)` — ingestable directo en `link`.
- Cuidado: el dataset de OpenBible referencia versificación KJV — mapear a la versificación de cada edición servida (tarea 2.2, casos: ROM 16:24-27, Salmos títulos, MAL 4 vs 3:24).
- Valor: convierte el lector en red navegable; sustituye la búsqueda semántica aplazada (D21) en el MVP.
