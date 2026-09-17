/**
 * Catálogo de strings — un solo lugar por idioma (decisión D7: ES principal, EN secundario).
 * Las rutas /es y /en comparten estas claves; ningún string suelto en componentes.
 */
export type Locale = "es" | "en";

export const T = {
  es: {
    marcaProvisional: "Biblioteca",
    nombreProvisional: "nombre provisional",
    heroKicker: "Biblioteca cristiana digital · construcción inicial",
    heroTitulo1: "Toda la Escritura.",
    heroTitulo2: "Todo el estudio.",
    heroTitulo3: "En español.",
    heroSub:
      "Una plataforma de estudio bíblico serio: texto, lenguas originales, comentarios, diccionarios y notas del lector, conectados alrededor de cada pasaje. Construida sobre un corpus libre, verificado y atribuido.",
    heroCta: "Abrir el lector",
    heroNota: "Fase 0 · construcción inicial — el lector ya sirve la Biblia completa.",
    dato1: "versículos ingeridos y validados",
    dato2: "libros, canon protestante",
    dato3: "versos vacíos en la fuente, documentados",
    dato4: "notas al pie del USFM, limpiadas",
    lector: "Lector",
    libro: "Libro",
    capitulo: "Capítulo",
    anterior: "Anterior",
    siguiente: "Siguiente",
    tema: "Cambiar tema",
    pieFuente: "Reina-Valera 1909 · Dominio público",
    pieOrigen: "Fuente: eBible.org (USFM)",
    pieIngesta: "Ingesta validada: 31.102 versículos · 2026-09-17",
    avisoObra:
      "Edición de trabajo: 18 versículos quedaron vacíos en la edición fuente (versificación que fusiona versos) y están documentados en el manifiesto de ingesta. No se rellenaron de memoria.",
  },
  en: {
    marcaProvisional: "Library",
    nombreProvisional: "placeholder name",
    heroKicker: "Digital Christian library · early build",
    heroTitulo1: "All of Scripture.",
    heroTitulo2: "All of the study.",
    heroTitulo3: "In Spanish first.",
    heroSub:
      "A serious Bible study platform: text, original languages, commentaries, dictionaries and the reader's own notes, connected around every passage. Built on a free, verified and attributed corpus.",
    heroCta: "Open the reader",
    heroNota: "Phase 0 · early build — the reader already serves the complete Bible.",
    dato1: "verses ingested and validated",
    dato2: "books, Protestant canon",
    dato3: "verses empty in the source, documented",
    dato4: "USFM footnotes cleaned",
    lector: "Reader",
    libro: "Book",
    capitulo: "Chapter",
    anterior: "Previous",
    siguiente: "Next",
    tema: "Toggle theme",
    pieFuente: "Reina-Valera 1909 · Public domain",
    pieOrigen: "Source: eBible.org (USFM)",
    pieIngesta: "Validated ingest: 31,102 verses · 2026-09-17",
    avisoObra:
      "Working edition: 18 verses were empty in the source edition (verse merging versification) and are documented in the ingest manifest. They were not filled from memory.",
  },
} as const;

export const t = (locale: Locale) => T[locale];
