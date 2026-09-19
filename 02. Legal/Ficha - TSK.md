# Ficha legal — Treasury of Scripture Knowledge (TSK) + OpenBible cross-references

> Estado: **aprobada y ejecutada** (ingesta validada 2026-09-17)
> Uso: núcleo MVP · capa: conexiones (referencias cruzadas)

## Identificación

| Campo | Valor |
|---|---|
| `obra_id` | `TSK` |
| Obra y ediciones | (a) The Treasury of Scripture Knowledge, R.A. Torrey (1897/1907) · (b) Cross-references comunitarias de OpenBible.info |
| Titular de derechos | (a) Ninguno: dominio público · (b) OpenBible.info (CC BY) |
| Idioma | Referencias universales (sin texto lingüístico publicado) |
| Formato de ingesta | JSON shards (TSK) + TSV (OpenBible) → `refs` agrupadas por verso sobre OSIS |
| URL de origen | https://github.com/neuu-org/bible-crossrefs-dataset (agregador, CC BY 4.0) — crudo conservado en `05. Datos/corpus_crudo/tsk_data/` |
| `verified_at` | **2026-09-17**: LICENSE del agregador leída (CC BY 4.0); OpenBible declara su licencia en el encabezado del propio TSV («CC-BY 2016-02-01»); TSK es PD por fecha (1897/1907) |
| Jurisdicción | Mundial |

## Licencia

- TSK subyacente: **dominio público** (Torrey, 1897).
- OpenBible cross-refs: **CC BY 2016** (citada literal en la primera línea del archivo crudo).
- Agregador neuu-org: **CC BY 4.0** (verificado).
- Consecuencia: atribución visible en el panel de referencias del lector (ya implementado): «TSK (Torrey, 1907 · dominio público) + OpenBible.info (CC BY)».
- `permite_embeddings: sí` · copyleft: ninguno (BY).

## Ingesta ejecutada (2026-09-17)

- **386.384 referencias** en **30.412 versos**, 66 libros, `public/data/tsk/{OSIS}.json`.
- **Portón: 99,94 % de orígenes alineados** a RV1909 (31.084 de 31.103). Los destinos no resolubles por versificación (88.069, típicamente Salmos NRSV y variantes KJV) se descartaron y quedan contados en `_manifest.json`.
- Fusión: referencias «ambos» (presentes en TSK y OpenBible) primero, luego OpenBible por votos, luego TSK.

## Notas

- Nota original de investigación: ~500.000 refs de TSK crudo; tras validación contra nuestra versificación quedan 386.384 usables. El resto no se pierde: queda en el crudo para el mapeo de versificación (tarea 2.2).
- Valor: sustituye la búsqueda semántica aplazada (D21) — red navegable de ~13 referencias por verso promedio.
