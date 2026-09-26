"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Cabecera from "@/components/Cabecera";
import TamTexto from "@/components/TamTexto";
import { t } from "@/lib/i18n";
import { parejaDe } from "@/lib/alinea-gr";
import { morfGntEs } from "@/lib/morfgnt";
import { parseCita, segmentarPorCitas } from "@/lib/referencias";

type Libro = { osis: string; nombre: string; caps: number; versos: number };
type Verso = { c: number; v: number; osis: string; t: string };
type ObraJson = { osis: string; nombre: string; versos: Verso[] };
type Manifest = {
  obra: string;
  osis_obra: string;
  licencia: string;
  fuente: string;
  fecha_ingesta: string;
  total_versos: number;
  incidentes: { ref: string; tipo: string }[];
  libros: Libro[];
};
type Palabra = { g: string; t: string; e: string; es?: string; s: string; m: string; lex?: string; tp: string };
type InterJson = { osis: string; dir: "ltr" | "rtl"; versos: Record<string, Palabra[]> };
type GrVerso = { c: number; v: number; osis: string; t: string; w: [string, string, string][] };
type GrJson = { osis: string; versos: GrVerso[] };
type EntradaLex = { w: string; t: string; m: string; g: string; d: string };
// `e` es el titular en español de la traducción propia. El índice se construyó
// con el titular INGLÉS, así que sin esto «Marta» no encontraba nada y había que
// escribir «Martha» para llegar a una entrada cuyo contenido ya estaba en español.
type IndiceItem = { s: string; n: string; l: string; e?: string };
type EntradaDic = { n: string; d: string; r: string[] };
type SeccionHenry = { t: string; v: number | null; p: string[] };
type HenryJson = { osis: string; c: Record<string, { r: string | null; s: SeccionHenry[] }> };
type HenryEsJson = HenryJson & { estado?: string };
type JfbJson = { osis: string; c: Record<string, { v: number; p: string[] }[]> };
type Termino = { t: string; variantes: string[]; idioma: string; sig: string };
type PanelCita = { etiqueta: string; osis: string; c: number; versos: { v: number; t: string }[]; cargando: boolean; mas: boolean };
type ColorSubrayado = "" | "amarillo" | "verde" | "rosa";
type Nota = { texto: string; color: ColorSubrayado; ts: string };
type Notas = Record<string, Nota>;
const CLAVE_NOTAS = "notas:v1";
const COLORES: ColorSubrayado[] = ["", "amarillo", "verde", "rosa"];

const OBRAS = [
  { id: "rv1909", etiqueta: "RV1909" },
  // Versión Biblia Libre: español contemporáneo desde Nestle-Aland. Está para el
  // lector al que la RV1909 («á», «fué», «crió») se le hace cuesta arriba.
  { id: "vbl", etiqueta: "VBL" },
  { id: "web", etiqueta: "WEB" },
];
// Recursos del desplegable de la barra inferior. Añadir una obra nueva al núcleo
// es añadir una línea aquí: `traducido` enciende solo el conmutador ES/EN.
const COMENTARIOS = [
  { id: "henry", etiqueta: "Matthew Henry", anio: "1706", traducido: true },
  { id: "jfb", etiqueta: "Jamieson, Fausset y Brown", anio: "1871", traducido: false },
  { id: "barnes", etiqueta: "Albert Barnes", anio: "1872", traducido: false },
] as const;
type ComFuente = (typeof COMENTARIOS)[number]["id"];
// obras de comentario EN servidas de /data/{ruta}/{OSIS}.json (misma forma de JSON para todas)
const RUTA_COMENTARIO: Partial<Record<ComFuente, string>> = { jfb: "jfb", barnes: "barnes" };
const OSIS_INICIAL = "JHN";
const CAP_INICIAL = 1;
const NT = new Set(["MAT", "MRK", "LUK", "JHN", "ACT", "ROM", "1CO", "2CO", "GAL", "EPH", "PHP", "COL", "1TH", "2TH", "1TI", "2TI", "TIT", "PHM", "HEB", "JAS", "1PE", "2PE", "1JN", "2JN", "3JN", "JUD", "REV"]);
const cache = new Map<string, unknown>();
const cacheLex = new Map<string, { entradas: Record<string, EntradaLex>; indice: Record<string, string[]> }>();

export default function Lector() {
  const tr = t("es");
  const [obra, setObra] = useState("rv1909");
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [osis, setOsis] = useState(OSIS_INICIAL);
  const [cap, setCap] = useState(CAP_INICIAL);
  const [texto, setTexto] = useState<ObraJson | null>(null);
  const [cargando, setCargando] = useState(true);
  const [interlineal, setInterlineal] = useState(false);
  // morfología en español (STEPBible traducido) y temas de Nave's
  const [morfEs, setMorfEs] = useState<Record<string, string> | null>(null);
  // glosas ES de TBESH/TBESG (traducción propia sobre la glosa EN, CC BY 4.0 — B18):
  // texto = glosa contextual por cadena exacta (interlineal AT); lexico = por Strong canónico (ficha)
  const [glosasEs, setGlosasEs] = useState<{
    texto: Record<string, string>;
    textoG: Record<string, string>;
    lexico: Record<string, string>;
    lexicoG: Record<string, string>;
  } | null>(null);
  const [naveTemas, setNaveTemas] = useState<string[] | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [interData, setInterData] = useState<InterJson | null>(null);
  const [griego, setGriego] = useState(false);
  const [grData, setGrData] = useState<GrJson | null>(null);
  // palabra del SBLGNT seleccionada. Es estado propio y no reutiliza `lex`
  // porque el dato es distinto: MorphGNT da lema y análisis, no número Strong.
  const [grPal, setGrPal] = useState<
    { g: string; lemma: string; pos: string; ref: string; v: number; i: number } | null
  >(null);
  const [lex, setLex] = useState<{ palabra: Palabra; entrada?: EntradaLex } | null>(null);
  const [panelRefs, setPanelRefs] = useState<{ verso: Verso; refs: string[]; cargadas: boolean } | null>(null);
  const [dicPanel, setDicPanel] = useState(false);
  const [dicIndice, setDicIndice] = useState<IndiceItem[] | null>(null);
  const [dicQuery, setDicQuery] = useState("");
  const [dicEntrada, setDicEntrada] = useState<EntradaDic | null>(null);
  // si la entrada mostrada viene de la traducción propia (para la insignia)
  const [dicEnEs, setDicEnEs] = useState(false);
  const [comentario, setComentario] = useState(false);
  const [henry, setHenry] = useState<HenryJson | null>(null);
  const [henryEs, setHenryEs] = useState<HenryEsJson | null>(null);
  const [comIdioma, setComIdioma] = useState<"es" | "en">("es");
  const [comFuente, setComFuente] = useState<ComFuente>("henry");
  const [jfbData, setJfbData] = useState<JfbJson | null>(null);
  const [panelCita, setPanelCita] = useState<PanelCita | null>(null);
  const [panelTermino, setPanelTermino] = useState<Termino | null>(null);
  const [panelInfo, setPanelInfo] = useState(false);
  const [pasaje, setPasaje] = useState<{ osis: string; c: number } | null>(null);
  const [pasajeTexto, setPasajeTexto] = useState<ObraJson | null>(null);
  const [lexico, setLexico] = useState<Termino[] | null>(null);
  const [notas, setNotas] = useState<Notas>({});
  const [panelNotas, setPanelNotas] = useState(false);
  const [msgNotas, setMsgNotas] = useState<string | null>(null);
  const refArchivo = useRef<HTMLInputElement>(null);
  const [panelFuentes, setPanelFuentes] = useState(false);
  const [reporteTexto, setReporteTexto] = useState("");
  const [reporteCopiado, setReporteCopiado] = useState(false);
  const reTerminos = useRef<RegExp | null>(null);
  const columna = useRef<HTMLDivElement>(null);
  const lexCache = useRef(cacheLex);

  // El SBLGNT son 27 libros. Si el lector lo tiene activo y navega al AT, la
  // capa se apaga sola: quedarse encendida sin datos dejaría la vista vacía
  // sin explicar por qué.
  useEffect(() => {
    if (griego && !NT.has(osis)) setGriego(false);
  }, [osis, griego]);

  // notas y subrayados (B15): 100 % locales, persistidas en este dispositivo
  useEffect(() => {
    try {
      const crudo = localStorage.getItem(CLAVE_NOTAS);
      if (crudo) setNotas(JSON.parse(crudo) as Notas);
    } catch {
      /* almacenamiento no disponible: las notas simplemente no persisten */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_NOTAS, JSON.stringify(notas));
    } catch {
      /* cuota llena u omiso del navegador */
    }
  }, [notas]);

  const claveNota = (v: { osis?: string; c: number; v: number }, osisActual = osis) =>
    `${v.osis ?? osisActual}.${v.c}.${v.v}`;

  const ponerNota = (clave: string, parche: Partial<Nota>) => {
    setNotas((prev) => {
      const base: Nota = prev[clave] ?? { texto: "", color: "", ts: new Date().toISOString() };
      return { ...prev, [clave]: { ...base, ...parche, ts: new Date().toISOString() } };
    });
  };

  const borrarNota = (clave: string) => {
    setNotas((prev) => {
      const copia = { ...prev };
      delete copia[clave];
      return copia;
    });
  };

  // export/import (B15): las notas salen y entran como JSON versionado
  const exportarNotas = () => {
    const paquete = { version: 1, exportado: new Date().toISOString(), notas };
    const blob = new Blob([JSON.stringify(paquete, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notas-biblioteca-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importarNotas = async (archivo: File) => {
    try {
      const paquete = JSON.parse(await archivo.text()) as { version?: number; notas?: Notas };
      if (!paquete || typeof paquete !== "object" || !paquete.notas || typeof paquete.notas !== "object") {
        setMsgNotas(tr.notasImportError);
        return;
      }
      setNotas((prev) => {
        const fusion = { ...prev };
        for (const [clave, nota] of Object.entries(paquete.notas!)) {
          if (!nota || typeof nota !== "object") continue;
          const existente = fusion[clave];
          if (!existente || existente.ts < nota.ts) fusion[clave] = nota;
        }
        return fusion;
      });
      setMsgNotas(tr.notasImportOk);
    } catch {
      setMsgNotas(tr.notasImportError);
    }
  };

  // canal de reporte de errores (B5): el reporte se compone localmente con contexto exacto
  const componerReporte = () =>
    [
      "— Reporte de error —",
      `Obra: ${manifest?.obra ?? obra} (${manifest?.osis_obra ?? obra})`,
      `Referencia: ${osis}.${cap}`,
      `URL: ${typeof window !== "undefined" ? window.location.href : ""}`,
      "",
      "Descripción:",
      reporteTexto.trim() || "(sin descripción)",
    ].join("\n");

  const copiarReporte = async () => {
    try {
      await navigator.clipboard.writeText(componerReporte());
      setReporteCopiado(true);
      setTimeout(() => setReporteCopiado(false), 4000);
    } catch {
      /* portapapeles no disponible */
    }
  };

  // obra desde la URL al entrar
  useEffect(() => {
    const o = new URLSearchParams(window.location.search).get("obra");
    if (o && OBRAS.some((x) => x.id === o)) setObra(o);
  }, []);

  // manifiesto por obra: lista de libros + datos de atribución
  useEffect(() => {
    setManifest(null);
    fetch(`/data/${obra}/_manifest.json`)
      .then((r) => r.json())
      .then(setManifest)
      .catch(() => setManifest(null));
  }, [obra]);

  // ?ref=JHN.3 — referencia compartible al entrar
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (!ref) return;
    const [o, c] = ref.split(".");
    if (/^[1-3]?[A-Z]{2,3}$/.test(o) && Number(c) >= 1) {
      setOsis(o);
      setCap(Number(c));
    }
  }, []);

  // carga del texto bíblico (con caché por obra)
  useEffect(() => {
    let vivo = true;
    const clave = `${obra}:${osis}`;
    const enCache = cache.get(clave) as ObraJson | undefined;
    if (enCache) {
      setTexto(enCache);
      setCargando(false);
      return;
    }
    setCargando(true);
    setTexto(null);
    fetch(`/data/${obra}/${osis}.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((json: ObraJson) => {
        if (!vivo) return;
        cache.set(clave, json);
        setTexto(json);
        setCargando(false);
      })
      .catch(() => vivo && setCargando(false));
    return () => {
      vivo = false;
    };
  }, [obra, osis]);

  // Carga del interlineal (TAHOT/TAGNT por libro).
  // También se carga con el GRIEGO activo, aunque no se dibuje: es la fuente de
  // la glosa y el número de Strong que la tarjeta del SBLGNT muestra sin sacar
  // al lector de donde está.
  useEffect(() => {
    if (!interlineal && !griego) {
      setInterData(null);
      return;
    }
    const clave = `step:${osis}`;
    const enCache = cache.get(clave) as InterJson | undefined;
    if (enCache) {
      setInterData(enCache);
      return;
    }
    setInterData(null);
    const corpus = NT.has(osis) ? "tagnt" : "tahot";
    fetch(`/data/stepbible/${corpus}/${osis}.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json: InterJson | null) => {
        if (json) cache.set(clave, json);
        setInterData(json);
      })
      .catch(() => setInterData(null));
  }, [interlineal, griego, osis]);

  // morfología en español: mapa por idioma, cargado al abrir el interlineal
  useEffect(() => {
    if (!interlineal) return;
    const idioma = NT.has(osis) ? "griego" : "hebreo";
    const clave = `morf:${idioma}`;
    const enCache = cache.get(clave) as Record<string, string> | undefined;
    if (enCache) {
      setMorfEs(enCache);
      return;
    }
    fetch(`/data/morfologia/codigos-${idioma}-es.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json: { codigos?: Record<string, string> } | null) => {
        const mapa = json?.codigos ?? null;
        if (mapa) cache.set(clave, mapa);
        setMorfEs(mapa);
      })
      .catch(() => setMorfEs(null));
    // solo depende del interlineal: la vista griega descifra con lib/morfgnt.ts,
    // que usa el esquema MorphGNT y no esta tabla.
  }, [interlineal, osis]);

  // glosas ES de TBESH/TBESG (overlay propio, CC BY 4.0 — B18): cargado al abrir el interlineal
  useEffect(() => {
    if (!interlineal) return;
    const clave = "glosas:es";
    const enCache = cache.get(clave) as {
      texto: Record<string, string>;
      textoG: Record<string, string>;
      lexico: Record<string, string>;
      lexicoG: Record<string, string>;
    } | undefined;
    if (enCache) {
      setGlosasEs(enCache);
      return;
    }
    fetch(`/data/stepbible/glosas-es.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (json: {
          texto?: Record<string, string>;
          textoG?: Record<string, string>;
          lexico?: Record<string, string>;
          lexicoG?: Record<string, string>;
        } | null) => {
          if (json?.texto && json?.textoG && json?.lexico && json?.lexicoG) {
            const mapa = { texto: json.texto, textoG: json.textoG, lexico: json.lexico, lexicoG: json.lexicoG };
            cache.set(clave, mapa);
            setGlosasEs(mapa);
          }
        }
      )
      .catch(() => setGlosasEs(null));
  }, [interlineal]);

  // texto griego (SBLGNT): carga perezosa por libro
  useEffect(() => {
    if (!griego) {
      setGrData(null);
      return;
    }
    const clave = `sblgnt:${osis}`;
    const enCache = cache.get(clave) as GrJson | undefined;
    if (enCache) {
      setGrData(enCache);
      return;
    }
    setGrData(null);
    fetch(`/data/sblgnt/${osis}.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json: GrJson | null) => {
        if (json) cache.set(clave, json);
        setGrData(json);
      })
      .catch(() => setGrData(null));
  }, [griego, osis]);

  const caps = texto?.versos.length
    ? Math.max(...texto.versos.map((v) => v.c))
    : (manifest?.libros.find((l) => l.osis === osis)?.caps ?? 1);

  const versos = texto?.versos.filter((v) => v.c === cap) ?? [];

  const ir = useCallback(
    (delta: number) => {
      const nueva = cap + delta;
      if (nueva >= 1) setCap(nueva);
      else {
        const idx = manifest?.libros.findIndex((l) => l.osis === osis) ?? -1;
        const previo = idx > 0 ? manifest?.libros[idx - 1] : undefined;
        if (previo) {
          setOsis(previo.osis);
          setCap(previo.caps);
        }
      }
    },
    [cap, osis, manifest]
  );

  const adelante = useCallback(
    (delta: number) => {
      const nueva = cap + delta;
      if (nueva <= caps) setCap(nueva);
      else {
        const idx = manifest?.libros.findIndex((l) => l.osis === osis) ?? -1;
        const proximo = manifest && idx >= 0 ? manifest.libros[idx + 1] : undefined;
        if (proximo) {
          setOsis(proximo.osis);
          setCap(1);
        }
      }
    },
    [cap, caps, osis, manifest]
  );

  // teclado: flechas cambian de capítulo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") ir(-1);
      if (e.key === "ArrowRight") adelante(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ir, adelante]);

  // URL compartible + scroll al tope al cambiar de capítulo
  useEffect(() => {
    if (cargando) return;
    window.history.replaceState(null, "", `/es/lector?obra=${obra}&ref=${osis}.${cap}`);
    // Al tope de la VENTANA, no de la columna: `scrollIntoView` pegaba la
    // columna al borde superior de la pantalla, justo debajo de la cabecera
    // fija (183px en móvil), y el título del capítulo quedaba siempre tapado.
    window.scrollTo({ top: 0 });
  }, [obra, osis, cap, cargando]);

  // comentario de Matthew Henry: carga perezosa por libro (EN + traducción ES si existe)
  useEffect(() => {
    if (!comentario) {
      setHenry(null);
      setHenryEs(null);
      return;
    }
    const clave = `henry:${osis}`;
    const enCache = cache.get(clave) as HenryJson | undefined;
    if (enCache) {
      setHenry(enCache);
    } else {
      setHenry(null);
      fetch(`/data/henry/${osis}.json`)
        .then((r) => (r.ok ? r.json() : null))
        .then((json: HenryJson | null) => {
          if (json) cache.set(clave, json);
          setHenry(json);
        })
        .catch(() => setHenry(null));
    }
    const claveEs = `henry-es:${osis}`;
    const esCache = cache.get(claveEs) as HenryEsJson | undefined;
    if (esCache) {
      setHenryEs(esCache);
      return;
    }
    setHenryEs(null);
    fetch(`/data/henry-es/${osis}.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json: HenryEsJson | null) => {
        if (json) cache.set(claveEs, json);
        setHenryEs(json);
      })
      .catch(() => setHenryEs(null));
  }, [comentario, osis]);

  // comentarios EN (JFB, Barnes): carga perezosa por libro — misma forma de JSON para todos
  useEffect(() => {
    const ruta = comentario ? RUTA_COMENTARIO[comFuente] : undefined;
    if (!ruta) {
      setJfbData(null);
      return;
    }
    const clave = `com:${ruta}:${osis}`;
    const enCache = cache.get(clave) as JfbJson | undefined;
    if (enCache) {
      setJfbData(enCache);
      return;
    }
    setJfbData(null);
    fetch(`/data/${ruta}/${osis}.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json: JfbJson | null) => {
        if (json) cache.set(clave, json);
        setJfbData(json);
      })
      .catch(() => setJfbData(null));
  }, [comentario, comFuente, osis]);

  // etiqueta morfológica legible: traduce el código; si falta, devuelve el código crudo.
  // Los códigos hebreos compuestos vienen separados por "/" (prefijo/raíz/sufijo).
  const morfLegible = (codigo: string): string => {
    if (!codigo) return "";
    if (!morfEs) return codigo;
    const partes = codigo.split("/").map((c) => morfEs[c.trim()] ?? c.trim());
    return partes.join(" + ");
  };

  // copia el versículo con su referencia bien formada: «texto» — Juan 3:16 (RV1909)
  const copiarVerso = async (v: Verso) => {
    const sigla = manifest?.osis_obra ?? obra.toUpperCase();
    const libro = info?.nombre ?? v.osis.split(".")[0];
    const texto = `\u00ab${v.t}\u00bb \u2014 ${libro} ${v.c}:${v.v} (${sigla})`;
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      // navegadores sin permiso de portapapeles: selección temporal
      const ta = document.createElement("textarea");
      ta.value = texto;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* sin portapapeles disponible */
      }
      ta.remove();
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  };

  // referencias cruzadas (TSK): carga perezosa al primer clic en un número de verso
  const abrirReferencias = (v: Verso) => {
    setPanelRefs({ verso: v, refs: [], cargadas: false });
    // temas de Nave's para este verso
    setNaveTemas(null);
    const claveNave = `nave:${osis}`;
    const naveCache = cache.get(claveNave) as { versos: Record<string, string[]> } | undefined;
    const usarNave = (d: { versos?: Record<string, string[]> }) =>
      setNaveTemas(d.versos?.[`${v.c}.${v.v}`] ?? []);
    if (naveCache) {
      usarNave(naveCache);
    } else {
      fetch(`/data/nave/${osis}.json`)
        .then((r) => (r.ok ? r.json() : { versos: {} }))
        .then((d) => {
          cache.set(claveNave, d);
          usarNave(d);
        })
        .catch(() => setNaveTemas([]));
    }
    const clave = `tsk:${osis}`;
    const enCache = cache.get(clave) as Record<string, string[]> | undefined;
    const usar = (datos: Record<string, string[]>) =>
      setPanelRefs({ verso: v, refs: datos[`${v.c}.${v.v}`] ?? [], cargadas: true });
    if (enCache) {
      usar(enCache);
      return;
    }
    fetch(`/data/tsk/${osis}.json`)
      .then((r) => (r.ok ? r.json() : { refs: {} }))
      .then((data) => {
        cache.set(clave, data);
        usar(data);
      })
      .catch(() => setPanelRefs({ verso: v, refs: [], cargadas: true }));
  };

  // diccionario Easton: índice + definiciones por letra, todo con caché
  const abrirDic = () => {
    setDicPanel(true);
    if (!dicIndice) {
      fetch("/data/easton/_indice.json")
        .then((r) => r.json())
        .then(setDicIndice)
        .catch(() => setDicIndice([]));
    }
  };

  const normalizar = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const resultadosDic = (() => {
    if (!dicIndice) return [];
    const q = normalizar(dicQuery.trim());
    if (!q) return dicIndice.slice(0, 25);
    const empiezan: IndiceItem[] = [];
    const contiene: IndiceItem[] = [];
    for (const item of dicIndice) {
      // se busca en ES y en EN a la vez: el lector escribe «Marta» o «Martha»
      // y llega a la misma entrada
      const formas = [normalizar(item.n)];
      if (item.e) formas.push(normalizar(item.e));
      if (formas.some((n) => n.startsWith(q))) empiezan.push(item);
      else if (formas.some((n) => n.includes(q))) contiene.push(item);
      if (empiezan.length >= 30) break;
    }
    return [...empiezan, ...contiene].slice(0, 40);
  })();

  const abrirEntradaDic = (item: IndiceItem) => {
    const clave = `dic:${item.l}`;
    // Se piden las dos ediciones a la vez: la inglesa (completa) y la propia en
    // español. Si la entrada tiene ES, manda el ES; si no —hay 17 que el motor
    // no pudo cerrar—, cae al inglés en vez de dejar el hueco en blanco.
    const usar = (
      en: { entradas: Record<string, EntradaDic> },
      es: { entradas: Record<string, Partial<EntradaDic>> } | null
    ) => {
      const base = en.entradas[item.s];
      if (!base) { setDicEntrada(null); setDicEnEs(false); return; }
      const trad = es?.entradas?.[item.s];
      const hayEs = !!(trad?.n || trad?.d);
      setDicEnEs(hayEs);
      setDicEntrada(
        hayEs ? { ...base, n: trad?.n || base.n, d: trad?.d || base.d } : base
      );
    };
    const enCache = cache.get(clave) as
      | { en: { entradas: Record<string, EntradaDic> }; es: { entradas: Record<string, Partial<EntradaDic>> } | null }
      | undefined;
    if (enCache) {
      usar(enCache.en, enCache.es);
      return;
    }
    Promise.all([
      fetch(`/data/easton/${item.l}.json`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/data/easton-es/${item.l}.json`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ])
      .then(([en, es]) => {
        if (!en) { setDicEntrada(null); return; }
        cache.set(clave, { en, es });
        usar(en, es);
      })
      .catch(() => setDicEntrada(null));
  };

  // léxico transliterado (D22): se carga al abrir el comentario; el render lo usa para términos clicables
  useEffect(() => {
    if (!comentario || lexico) return;
    fetch("/data/lexico-translit.json")
      .then((r) => (r.ok ? r.json() : { terminos: [] }))
      .then((d) => {
        const terminos: Termino[] = d.terminos ?? [];
        setLexico(terminos);
        const variantes = terminos
          .flatMap((t) => t.variantes)
          .sort((a, b) => b.length - a.length)
          .map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
        reTerminos.current = variantes.length ? new RegExp("\\b(" + variantes.join("|") + ")\\b", "gi") : null;
      })
      .catch(() => setLexico([]));
  }, [comentario, lexico]);

  // tarjeta de pasaje (pantalla dividida): carga el libro citado sin mover la lectura principal
  useEffect(() => {
    if (!pasaje) {
      setPasajeTexto(null);
      return;
    }
    const clave = `obra:${pasaje.osis}`;
    const enCache = cache.get(clave) as ObraJson | undefined;
    if (enCache) {
      setPasajeTexto(enCache);
      return;
    }
    setPasajeTexto(null);
    fetch(`/data/${obra}/${pasaje.osis}.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json: ObraJson | null) => {
        if (json) cache.set(clave, json);
        setPasajeTexto(json);
      })
      .catch(() => setPasajeTexto(null));
  }, [pasaje, obra]);

  // altura del header fijo: referencia para las barras de comentario ancladas (sticky)
  useEffect(() => {
    const medir = () => {
      const cab = document.querySelector(".cabecera");
      if (cab) document.documentElement.style.setProperty("--altura-cabecera", cab.getBoundingClientRect().bottom + "px");
    };
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, []);

  // ficha léxica: busca el Strong en TBESG (griego) o TBESH (hebreo)
  // Strong canónico (G1510_A → G1510) y glosas ES del overlay propio
  const canonStrong = (s: string) => s.replace(/[A-Z_]*$/, "").replace(/_.*$/, "").toUpperCase();
  const glosaTextoEs = (p: Palabra): string | null => {
    if (!glosasEs || p.es) return null;
    const mapa = p.s.startsWith("G") ? glosasEs.textoG : glosasEs.texto;
    return mapa[p.e.replace(/[.,;:!?…]+$/, "")] ?? null;
  };
  const glosaLexicoEs = (p: Palabra): string | null => {
    if (!glosasEs) return null;
    const mapa = p.s.startsWith("G") ? glosasEs.lexicoG : glosasEs.lexico;
    return mapa[canonStrong(p.s)] ?? null;
  };
  /**
   * PILA DE PANELES.
   *
   * Los paneles del lector son todos `position: fixed; bottom: 0`, así que el
   * último abierto tapaba al anterior: al pulsar una cita dentro del
   * diccionario, la tarjeta del versículo se comía la del diccionario.
   *
   * Aquí se lleva el ORDEN de apertura. El más reciente se queda abajo del
   * todo; el anterior sube y se encoge, pero sigue visible. Pulsando sobre él
   * vuelve al frente y el otro se agacha. Nadie desaparece sin avisar.
   */
  const ABIERTOS: Record<string, boolean> = {
    dic: !!dicPanel,
    griego: !!grPal,
    lex: !!lex,
    refs: !!panelRefs,
    cita: !!panelCita,
    termino: !!panelTermino,
    fuentes: !!panelFuentes,
    notas: !!panelNotas,
    info: !!panelInfo,
  };
  const firmaPila = Object.entries(ABIERTOS).filter(([, v]) => v).map(([k]) => k).join(",");
  const [pila, setPila] = useState<string[]>([]);
  useEffect(() => {
    const vivos = firmaPila ? firmaPila.split(",") : [];
    setPila((prev) => {
      const quedan = prev.filter((id) => vivos.includes(id));
      const nuevos = vivos.filter((id) => !quedan.includes(id));
      return [...quedan, ...nuevos];
    });
  }, [firmaPila]);

  /** Props de posición para un panel según su sitio en la pila. */
  const propsPanel = (id: string) => {
    const i = pila.indexOf(id);
    const prof = i === -1 ? 0 : pila.length - 1 - i;
    const enPila = pila.length > 1;
    return {
      className:
        `lex-panel prof-${Math.min(prof, 3)}` +
        (enPila ? " apilado" : "") +
        (enPila && prof > 0 ? " pestana" : ""),
      style: { zIndex: 60 + Math.max(0, i) },
      // pulsar una pestaña la trae al frente; la que estaba se agacha
      onPointerDown: () => {
        if (prof > 0) setPila((p) => [...p.filter((x) => x !== id), id]);
      },
    };
  };

  const abrirLexico = (p: Palabra) => {
    setLex({ palabra: p });
    const esGriego = p.s.startsWith("G");
    const archivo = esGriego ? "tbesg" : "tbesh";
    const cargar = (data: { entradas: Record<string, EntradaLex>; indice: Record<string, string[]> }) => {
      const intentos = [p.s, p.s.replace(/[A-Za-z]+$/, ""), p.s.replace(/[A-Za-z]+$/, "") + "G", p.s.replace(/[A-Za-z]+$/, "") + "H"];
      let entrada: EntradaLex | undefined;
      for (const id of intentos) {
        if (data.entradas[id]) {
          entrada = data.entradas[id];
          break;
        }
        const lista = data.indice[id];
        if (lista?.length) {
          entrada = data.entradas[lista[0]];
          break;
        }
      }
      setLex({ palabra: p, entrada });
    };
    const enCache = lexCache.current.get(archivo);
    if (enCache) {
      cargar(enCache);
      return;
    }
    fetch(`/data/stepbible/${archivo}.json`)
      .then((r) => r.json())
      .then((data) => {
        lexCache.current.set(archivo, data);
        cargar(data);
      })
      .catch(() => setLex({ palabra: p }));
  };

  const info = manifest?.libros.find((l) => l.osis === osis);
  const nVacios = manifest?.incidentes.length ?? 0;
  const dir = interData?.dir ?? "ltr";

  // comentario: contenido según idioma (ES preferido si existe traducción del capítulo;
  // secciones sin traducir caen al original EN con etiqueta — trazabilidad B3)
  const capClave = String(cap);
  const capEs = henryEs?.c[capClave];
  const esCapDisp = !!capEs;
  const idiomaEfectivo: "es" | "en" = esCapDisp && comIdioma === "es" ? "es" : "en";
  // ¿Este recurso ofrece ES? Se deriva de los datos cargados, no de la bandera del
  // catálogo: así el conmutador ES/EN aparece en cuanto exista la traducción, sin
  // tocar código, y no miente si el archivo aún no está desplegado.
  const recursoTraducido = comFuente === "henry" ? !!henryEs : false;

  // Pareja de la palabra del SBLGNT en el interlineal (glosa + Strong).
  // Se calcula al vuelo: alinear un versículo son unas decenas de comparaciones.
  const grParejaInter = (() => {
    if (!grPal || !interData) return null;
    const gv = (grData?.versos ?? []).find((x) => x.osis === grPal.ref);
    if (!gv) return null;
    return parejaDe(gv.w, interData.versos[`${gv.c}.${gv.v}`], grPal.i);
  })();
  const capCom = henry?.c[capClave];
  const rCom = idiomaEfectivo === "es" && esCapDisp ? (capEs?.r ?? null) : (capCom?.r ?? null);
  const seccionesCom = (capCom?.s ?? []).map((sEn, i) => {
    if (idiomaEfectivo === "es") {
      const sEs = capEs?.s?.[i];
      if (sEs) {
        const pTrad = sEs.p.filter(Boolean);
        if (pTrad.length) {
          // sección parcial: solo los párrafos ya traducidos (el original EN queda a un clic)
          return { ...sEn, t: sEs.t || sEn.t, v: sEs.v || sEn.v, p: pTrad, sinTraducir: false, parcial: pTrad.length < (sEn.p?.length ?? 0) };
        }
        return { ...sEn, sinTraducir: true };
      }
      return { ...sEn, sinTraducir: true };
    }
    return { ...sEn, sinTraducir: false };
  });

  // comentarios EN (JFB/Barnes): párrafos del capítulo, un elemento por ancla de verso («v. texto»)
  const comSel = COMENTARIOS.find((c) => c.id === comFuente) ?? COMENTARIOS[0];
  const capComEn = jfbData?.c[capClave];
  const parrafosComEn = (capComEn ?? []).flatMap((e) => e.p.map((x) => `${e.v}. ${x}`));

  const limpiarDef = (d: string) =>
    d
      .replace(/<BR\s*\/?>/gi, "\n")
      .replace(/<ref='([^']+)'>/g, "$1 ")
      .replace(/<[^>]+>/g, "")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .trim();

  // D22: cita clicable → pop-up con el texto del verso en la obra activa
  const abrirCita = (cita: NonNullable<ReturnType<typeof parseCita>>) => {
    const primero = cita.refs[0];
    const ultima = cita.refs[cita.refs.length - 1];
    const mismoCap = ultima.c === primero.c;
    const visibles = mismoCap ? cita.refs.filter((r) => r.v <= primero.v + 11) : cita.refs.filter((r) => r.c === primero.c).slice(0, 12);
    const mas = cita.refs.length > visibles.length;
    setPanelCita({ etiqueta: cita.etiqueta, osis: primero.osis, c: primero.c, versos: [], cargando: true, mas });
    const clave = `${obra}:${primero.osis}`;
    const usar = (data: ObraJson) => {
      const lista = visibles.map((r) => {
        const v = data.versos.find((x) => x.c === r.c && x.v === r.v);
        return { v: r.v, t: v?.t ?? "" };
      }).filter((v) => v.t);
      setPanelCita((prev) => (prev && prev.etiqueta === cita.etiqueta ? { ...prev, versos: lista, cargando: false } : prev));
    };
    const enCache = cache.get(clave) as ObraJson | undefined;
    if (enCache) {
      usar(enCache);
      return;
    }
    fetch(`/data/${obra}/${primero.osis}.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: ObraJson | null) => {
        if (!data) {
          setPanelCita((prev) => (prev && prev.etiqueta === cita.etiqueta ? { ...prev, cargando: false } : prev));
          return;
        }
        cache.set(clave, data);
        usar(data);
      })
      .catch(() => setPanelCita(null));
  };

  // D22: renderiza un párrafo con citas y términos transliterados clicables
  const renderMarcado = (texto: string): React.ReactNode => {
    const nodos: React.ReactNode[] = [];
    let clave = 0;
    for (const seg of segmentarPorCitas(texto)) {
      if (seg.tipo === "cita" && seg.cita) {
        const cita = seg.cita;
        nodos.push(
          <button key={clave++} className="cita" onClick={() => abrirCita(cita)} title={tr.verTexto}>
            {seg.contenido}
          </button>
        );
        continue;
      }
      const trozo = seg.contenido;
      if (!reTerminos.current) {
        nodos.push(<span key={clave++}>{trozo}</span>);
        continue;
      }
      let ultimo = 0;
      for (const m of trozo.matchAll(reTerminos.current)) {
        const idx = m.index ?? 0;
        if (idx > ultimo) nodos.push(<span key={clave++}>{trozo.slice(ultimo, idx)}</span>);
        const term = (lexico ?? []).find((t) => t.variantes.some((v) => v.toLowerCase() === m[0].toLowerCase()));
        nodos.push(
          <button
            key={clave++}
            className="termino"
            onClick={() => term && setPanelTermino(term)}
            title={term ? term.idioma + " · " + term.sig : undefined}
          >
            {trozo.slice(idx, idx + m[0].length)}
          </button>
        );
        ultimo = idx + m[0].length;
      }
      if (ultimo < trozo.length) nodos.push(<span key={clave++}>{trozo.slice(ultimo)}</span>);
    }
    return nodos;
  };

  // pantalla dividida: tarjeta de pasaje abajo, lectura principal arriba intacta
  const abrirTarjeta = (osisDest: string, capDest: number) => {
    setPasaje({ osis: osisDest, c: capDest });
    setPanelCita(null);
    setPanelRefs(null);
  };

  return (
    <>
      <Cabecera
        locale="es"
        enLector
        extra={
          // Información y fuentes del corpus en UN botón, arriba junto al tema.
          // Antes eran dos iconos (ⓘ y ≣) en la fila de navegación, y en móvil
          // empujaban «Solo el texto» a una línea propia.
          <button
            className="icono-btn"
            onClick={() => setPanelInfo(true)}
            aria-label={`${tr.info} · ${tr.fuentes}`}
            title={`${tr.info} · ${tr.fuentes}`}
          >
            ⓘ
          </button>
        }
      >
        <div className="cabecera-sub-inner">
          <div className="obras-toggle" role="tablist" aria-label="Obra">
            {OBRAS.map((o) => (
              <button
                key={o.id}
                role="tab"
                aria-selected={obra === o.id}
                className={`obras-tab${obra === o.id ? " activa" : ""}`}
                onClick={() => setObra(o.id)}
              >
                {o.etiqueta}
              </button>
            ))}
          </div>
          <select
            className="sel"
            aria-label={tr.libro}
            value={osis}
            onChange={(e) => {
              setOsis(e.target.value);
              setCap(1);
            }}
          >
            {(manifest?.libros ?? []).map((l) => (
              <option key={l.osis} value={l.osis}>
                {l.nombre}
              </option>
            ))}
          </select>
          {/* Fila de navegación: capítulo · capa del original · acciones.
              Agrupada para que en móvil ocupe SIEMPRE su propia línea en vez de
              partirse donde caiga el ancho. */}
          <div className="nav-fila">
            <select
              className="sel sel-cap"
              aria-label={tr.capitulo}
              value={cap}
              onChange={(e) => setCap(Number(e.target.value))}
            >
              {Array.from({ length: caps }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
              {/* Capa del texto original. Es un control APARTE del comentario a
                  propósito: el comentario se muestra DEBAJO del texto, el
                  interlineal TRANSFORMA el texto. Mezclarlos haría ambiguo el
                  checkbox y quitaría la combinación más útil de estudio
                  (interlineal arriba + comentario abajo). */}
              <span className={`rec-original rec-original-nav${interlineal || griego ? " activa" : ""}`}>
                <span className="rec-icono rec-icono-orig" aria-hidden="true">
                  {griego ? "Ξ" : "Ω"}
                </span>
                <select
                  className="rec-sel rec-sel-orig"
                  aria-label="Capa del texto original"
                  value={interlineal ? "inter" : griego ? "sblgnt" : "ninguno"}
                  onChange={(e) => {
                    const v = e.target.value;
                    setInterlineal(v === "inter");
                    setGriego(v === "sblgnt");
                  }}
                >
                  <option value="ninguno">Solo el texto</option>
                  <option value="inter">
                    Interlineal ({NT.has(osis) ? "griego" : "hebreo"})
                  </option>
                  {/* El SBLGNT son 27 libros: en el AT la opción ni se ofrece.
                      Antes el icono Ξ se mostraba en Oseas y no podía hacer nada. */}
                  {NT.has(osis) && <option value="sblgnt">Griego SBLGNT</option>}
                </select>
              </span>

            <div className="lector-acciones">
              <button
                className="icono-btn"
                onClick={abrirDic}
                aria-label={tr.diccionario}
                title={tr.diccionario}
              >
                ⌕
              </button>
              <button
                className={`icono-btn${Object.keys(notas).length ? " activo" : ""}`}
                onClick={() => {
                  setPanelNotas(true);
                  setMsgNotas(null);
                }}
                aria-label={tr.notas}
                title={tr.notas}
              >
                ✍
              </button>
              <button className="icono-btn" onClick={() => ir(-1)} aria-label={tr.anterior} title={tr.anterior}>
                ←
              </button>
              <button className="icono-btn" onClick={() => adelante(1)} aria-label={tr.siguiente} title={tr.siguiente}>
                →
              </button>
            </div>
          </div>
        </div>
        {/* Barra de recursos: [obra ▾] · [ES|EN si hay traducción] · [☑ mostrar]
            Nada de una zona de clic a lo ancho: cada control es suyo, y así el
            desplegable y el conmutador de idioma no quedan tapados. */}
        <div className="com-strip-fila">
          <div className={`rec-barra${comentario ? " activa" : ""}`}>

            <span className="rec-icono" aria-hidden="true">✎</span>

            <select
              className="rec-sel"
              aria-label={tr.comentario}
              value={comFuente}
              onChange={(e) => setComFuente(e.target.value as ComFuente)}
            >
              {COMENTARIOS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.etiqueta} · {c.anio}
                </option>
              ))}
            </select>

            <span className="rec-der">
              {comentario && recursoTraducido && idiomaEfectivo === "es" && esCapDisp && (
                <span className="badge-revision" title={tr.estadoNota}>
                  {tr.sinRevisar}
                </span>
              )}

              {recursoTraducido ? (
                <span className="rec-idioma" role="group" aria-label="Idioma del recurso">
                  <button
                    type="button"
                    className={`rec-idioma-tab${comIdioma === "es" ? " activa" : ""}`}
                    onClick={() => setComIdioma("es")}
                    aria-pressed={comIdioma === "es"}
                    aria-label="Recurso en español"
                  >
                    ES
                  </button>
                  <button
                    type="button"
                    className={`rec-idioma-tab${comIdioma === "en" ? " activa" : ""}`}
                    onClick={() => setComIdioma("en")}
                    aria-pressed={comIdioma === "en"}
                    aria-label="Resource in English"
                  >
                    EN
                  </button>
                </span>
              ) : (
                <span className="rec-idioma-fijo" title={tr.comentarioEN}>EN</span>
              )}

              <label className="rec-check" title={comentario ? tr.comentario : tr.comentario}>
                <input
                  type="checkbox"
                  checked={comentario}
                  onChange={(e) => setComentario(e.target.checked)}
                  aria-label={tr.comentario}
                />
                <span className="rec-check-caja" aria-hidden="true" />
              </label>
            </span>
          </div>
        </div>
      </Cabecera>

      <main>
        <div
          className={`lector-columna${pila.length ? ` con-panel pila-${Math.min(pila.length, 2)}` : ""}`}
          ref={columna}
        >
          <div className="lector-titulo">
            <h1 className="serif-display">
              {info?.nombre ?? texto?.nombre ?? "…"} {cap}
            </h1>
            <span className="ref-osis">
              {osis}.{cap} · {manifest?.osis_obra ?? ""}
            </span>
          </div>

          {cargando ? (
            <p style={{ color: "var(--muted)" }}>…</p>
          ) : griego ? (
            /* Griego emparejado: el griego solo no dice nada a quien no lo lee.
               Cada versículo lleva ARRIBA su texto en la versión elegida y DEBAJO
               el griego crítico, para que se vea de qué habla cada verso. Las
               palabras son botones de verdad: antes tenían pinta de clicables
               (un `title`) y no hacían nada. */
            <div className="texto-biblico griego-par">
              {/* El comentario también vive aquí: texto + griego + comentario a
                  la vez es justo la mesa de trabajo de quien estudia el original.
                  Antes solo aparecía en la vista sin capas. */}
              {comentario && comFuente === "henry" && rCom && (
                <div className="com-resumen">
                  <div className="com-titulo">{tr.resumenCapitulo}</div>
                  {renderMarcado(rCom)}
                </div>
              )}
              {comentario && comFuente !== "henry" && parrafosComEn.length > 0 && (
                <ComentarioBloque
                  autor={comSel.etiqueta}
                  seccion={{ t: `${tr.comTitulo.replace("{s}", comSel.etiqueta + " (" + comSel.anio + ")")} ${cap} — ${tr.jfbModo}`, v: null, p: parrafosComEn, sinTraducir: false }}
                  tr={tr}
                  renderFn={renderMarcado}
                />
              )}
              {(grData?.versos ?? [])
                .filter((gv) => gv.c === cap)
                .map((gv) => {
                  const esp = versos.find((v) => v.c === gv.c && v.v === gv.v);
                  const secciones =
                    comentario && comFuente === "henry"
                      ? seccionesCom.filter((s) => s.v === gv.v)
                      : [];
                  return (
                    <div key={gv.osis} className="gr-par" data-osis={gv.osis}>
                      {/* La línea en español es tocable, igual que en la vista
                          normal: abre abajo el versículo con sus referencias y
                          el editor de notas. Sin esto las notas no funcionaban
                          con el griego activo. */}
                      <p
                        className={`gr-es versoTocable${
                          esp && notas[claveNota(esp)]?.color
                            ? ` subrayado-${notas[claveNota(esp)].color}`
                            : ""
                        }`}
                        role="button"
                        tabIndex={0}
                        title={tr.abrirVerso}
                        aria-label={`${gv.c}:${gv.v} — ${tr.abrirVerso}`}
                        onClick={() => esp && abrirReferencias(esp)}
                        onKeyDown={(e) => {
                          if ((e.key === "Enter" || e.key === " ") && esp) {
                            e.preventDefault();
                            abrirReferencias(esp);
                          }
                        }}
                      >
                        <sup className={`num${esp && notas[claveNota(esp)] ? " con-nota" : ""}`}>
                          {gv.v}
                        </sup>
                        {esp?.t ?? <span style={{ color: "var(--muted)" }}>—</span>}
                      </p>
                      <p className="gr-gr" lang="el">
                        {gv.w.map(([g, lemma, pos], i) => (
                          <button
                            key={i}
                            className={`palabra-g${
                              grPal && grPal.ref === gv.osis && grPal.i === i ? " activa" : ""
                            }`}
                            onClick={() =>
                              setGrPal({ g, lemma, pos, ref: gv.osis, v: gv.v, i })
                            }
                            title={`${lemma} · ${morfGntEs(pos)}`}
                          >
                            {g}
                          </button>
                        ))}
                      </p>
                      {secciones.map((sec, i) => (
                        <ComentarioBloque
                          key={`${gv.osis}-${i}`}
                          seccion={sec}
                          tr={tr}
                          renderFn={renderMarcado}
                        />
                      ))}
                    </div>
                  );
                })}
              {grData && !(grData.versos ?? []).some((gv) => gv.c === cap) && (
                <p style={{ color: "var(--muted)" }}>…</p>
              )}
            </div>
          ) : interlineal ? (
            <div className={`interlin${dir === "rtl" ? " rtl" : ""}`}>
              {versos.map((v) => {
                const palabras = interData?.versos[`${v.c}.${v.v}`];
                return (
                  <div key={v.osis} className="interlin-verso">
                    {/* Misma mecánica que en las Biblias: tocar el número abre
                        abajo el versículo en español con sus referencias. En el
                        interlineal hace más falta todavía, porque la vista
                        descompone el original y se pierde el hilo del verso. */}
                    <button
                      className="interlin-num"
                      onClick={() => abrirReferencias(v)}
                      aria-label={`${v.c}:${v.v} — ${tr.abrirVerso}`}
                      title={tr.abrirVerso}
                    >
                      {v.v}
                    </button>
                    {palabras?.length ? (
                      palabras.map((p, i) => (
                        <button
                          key={i}
                          className="palabra"
                          onClick={() => abrirLexico(p)}
                          title={`${p.s} · ${morfLegible(p.m)}`}
                        >
                          <span className="w">{p.g}</span>
                          <span className="gl">{p.es || glosaTextoEs(p) || p.e}</span>
                          <span className="st">
                            {p.s} · {morfLegible(p.m)}
                          </span>
                        </button>
                      ))
                    ) : (
                      <span className="sin-interlin">{v.t}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="texto-biblico">
              {comentario && comFuente === "henry" && rCom && (
                <div className="com-resumen">
                  <div className="com-titulo">{tr.resumenCapitulo}</div>
                  {renderMarcado(rCom)}
                </div>
              )}
              {comentario && comFuente !== "henry" && parrafosComEn.length > 0 && (
                <ComentarioBloque
                  autor={comSel.etiqueta}
                  seccion={{ t: `${tr.comTitulo.replace("{s}", comSel.etiqueta + " (" + comSel.anio + ")")} ${cap} — ${tr.jfbModo}`, v: null, p: parrafosComEn, sinTraducir: false }}
                  tr={tr}
                  renderFn={renderMarcado}
                />
              )}
              {versos.map((v) => {
                const secciones =
                  comentario && comFuente === "henry"
                    ? seccionesCom.filter((s) => s.v === v.v)
                    : [];
                const nVerso = notas[claveNota(v)];
                return (
                  <span key={v.osis} style={{ display: "inline" }}>
                    <span
                      className={`verso versoTocable${nVerso?.color ? ` subrayado-${nVerso.color}` : ""}`}
                      data-osis={v.osis}
                      role="button"
                      tabIndex={0}
                      aria-label={`${v.c}:${v.v} \u2014 ${tr.abrirVerso}`}
                      title={tr.abrirVerso}
                      onClick={() => abrirReferencias(v)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          abrirReferencias(v);
                        }
                      }}
                    >
                      <sup className={`num${nVerso ? " con-nota" : ""}`}>{v.v}</sup>
                      {v.t}
                    </span>{" "}
                    {secciones.map((s, i) => (
                      <ComentarioBloque key={`${v.osis}-${i}`} seccion={s} tr={tr} renderFn={renderMarcado} />
                    ))}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {dicPanel && (
        <div {...propsPanel("dic")} role="dialog" aria-label={tr.diccionario}>
          <div className="lex-panel-inner">
            <div className="lex-cabecera">
              <span className="lex-palabra" style={{ fontSize: 20 }}>
                {tr.diccionario}
              </span>
              <button
                className="icono-btn cerrar"
                onClick={() => {
                  setDicPanel(false);
                  setDicEntrada(null);
                  setDicQuery("");
                }}
                aria-label={tr.lexCerrar}
              >
                ✕
              </button>
            </div>
            {dicEntrada ? (
              <>
                <div
                  className="lex-palabra"
                  style={{ fontSize: 24, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}
                >
                  {dicEntrada.n}
                  {/* La política exige que el lector sepa siempre en qué estado
                      está el texto que lee. Esta traducción es del motor y no
                      ha pasado por revisión humana. */}
                  {dicEnEs && (
                    <span className="badge-revision" title={tr.estadoNota}>
                      {tr.sinRevisar}
                    </span>
                  )}
                </div>
                {/* La definición pasa por renderMarcado: las citas que Easton
                    intercala en la prosa —«(Ex. 6:20)»— se vuelven tocables,
                    igual que en los comentarios. */}
                <div className="lex-def" style={{ marginTop: 10 }}>
                  {renderMarcado(dicEntrada.d)}
                </div>
                {dicEntrada.r?.length > 0 && (
                  <div className="lex-meta dic-refs" style={{ marginTop: 14 }}>
                    <span className="dic-refs-rotulo">Refs:</span>{" "}
                    {dicEntrada.r.slice(0, 24).map((ref, i) => (
                      <span key={i}>
                        {i > 0 && <span className="dic-refs-sep"> · </span>}
                        {renderMarcado(ref)}
                      </span>
                    ))}
                  </div>
                )}
                <div className="lex-fuente">{tr.fuenteDic}</div>
                <button
                  className="btn btn-fantasma"
                  style={{ marginTop: 14 }}
                  onClick={() => setDicEntrada(null)}
                >
                  ← {tr.volver}
                </button>
              </>
            ) : (
              <>
                <input
                  className="sel"
                  style={{ width: "100%", marginBottom: 12 }}
                  placeholder={tr.buscarDic}
                  value={dicQuery}
                  onChange={(e) => setDicQuery(e.target.value)}
                  autoFocus
                />
                <div className="refs-lista">
                  {resultadosDic.map((item) => (
                    <button key={item.s + item.l} className="ref-item" onClick={() => abrirEntradaDic(item)}>
                      {/* manda el título en español cuando existe; el inglés
                          queda detrás, tenue, para quien busque por él */}
                      {item.e ?? item.n}
                      {item.e && item.e !== item.n && (
                        <span className="ref-item-en"> · {item.n}</span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="lex-fuente">{tr.fuenteDic}</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tarjeta de la palabra del SBLGNT. El texto crítico trae lema y análisis
          morfológico, pero NO número de Strong ni glosa: eso vive en el
          interlineal (TAGNT). En vez de fingir un dato que no está, se ofrece
          el salto al interlineal, que sí lo tiene. */}
      {grPal && (
        <div {...propsPanel("griego")} role="dialog" aria-label="Palabra del texto griego">
          <div className="lex-panel-inner">
            <div className="lex-cabecera">
              <span className="lex-palabra" lang="el">{grPal.g}</span>
              <button
                className="icono-btn cerrar"
                onClick={() => setGrPal(null)}
                aria-label={tr.lexCerrar}
              >
                ✕
              </button>
            </div>
            <div className="lex-meta">
              {osis} {cap}:{grPal.v} · SBLGNT
            </div>
            {/* La glosa y el Strong vienen del interlineal, alineados aquí
                mismo: mandar al lector a otra vista le rompía la secuencia de
                palabras que venía descubriendo. */}
            {grParejaInter ? (
              <div className="lex-glosa">
                <b>{glosaLexicoEs(grParejaInter as never) || grParejaInter.es || grParejaInter.e}</b>
                {grParejaInter.es && grParejaInter.e && grParejaInter.es !== grParejaInter.e && (
                  <span className="lex-glosa-en"> ({grParejaInter.e})</span>
                )}
              </div>
            ) : (
              <div className="lex-glosa" style={{ color: "var(--muted)" }}>
                <i>sin glosa alineada para esta palabra</i>
              </div>
            )}

            <div className="lex-def">
              <b lang="el">{grPal.lemma}</b> · forma de diccionario
            </div>
            <div className="lex-def">{morfGntEs(grPal.pos)}</div>
            <div className="lex-def" style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
              {grParejaInter?.s ? `Strong ${grParejaInter.s} · ` : ""}
              MorphGNT <code>{grPal.pos}</code>
            </div>

            <button
              className="btn-inter-sec"
              onClick={() => {
                setGrPal(null);
                setGriego(false);
                setInterlineal(true);
              }}
              title="Cambia de vista: perderás el punto donde estabas leyendo el griego"
            >
              ↓ Ver el versículo entero en el interlineal
            </button>
          </div>
        </div>
      )}

      {lex && (
        <div {...propsPanel("lex")} role="dialog" aria-label={tr.lexico}>
          <div className="lex-panel-inner">
            <div className="lex-cabecera">
              <span className="lex-palabra">{lex.palabra.g}</span>
              <button className="icono-btn cerrar" onClick={() => setLex(null)} aria-label={tr.lexCerrar}>
                ✕
              </button>
            </div>
            {lex.entrada ? (
              <>
                <div className="lex-meta">
                  {lex.entrada.t} · {lex.entrada.m} · {lex.palabra.s}
                </div>
                <div className="lex-glosa">
                  <b>{glosaLexicoEs(lex.palabra) || lex.entrada.g}</b>
                  {glosaLexicoEs(lex.palabra) && <span className="lex-glosa-en"> ({lex.entrada.g})</span>}
                  {lex.palabra.lex && <span> — {lex.palabra.lex}</span>}
                </div>
                <div className="lex-def">{limpiarDef(lex.entrada.d)}</div>
              </>
            ) : (
              <div className="lex-meta">Sin entrada léxica para {lex.palabra.s}.</div>
            )}
            <div className="lex-fuente">
              Léxico: TBESG/TBESH — STEPBible-Data (Tyndale House), CC BY 4.0
              {lex.entrada && glosaLexicoEs(lex.palabra)
                ? " · Glosa ES: traducción propia, CC BY 4.0 (sin revisar)"
                : ""}
            </div>
          </div>
        </div>
      )}

      {panelRefs && (
        <div {...propsPanel("refs")} role="dialog" aria-label={tr.referencias}>
          <div className="lex-panel-inner">
            <div className="lex-cabecera">
              <span className="lex-palabra" style={{ fontSize: 20 }}>
                {tr.referencias} · {info?.nombre} {panelRefs.verso.c}:{panelRefs.verso.v}
              </span>
              <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                <button
                  className="icono-btn"
                  onClick={() => copiarVerso(panelRefs.verso)}
                  aria-label={tr.copiarVerso}
                  title={tr.copiarVerso}
                >
                  {copiado ? "\u2713" : "\u29c9"}
                </button>
                <button className="icono-btn cerrar" onClick={() => setPanelRefs(null)} aria-label={tr.lexCerrar}>
                  ✕
                </button>
              </span>
            </div>
            {panelRefs.cargadas ? (
              panelRefs.refs.length ? (
                <div className="refs-lista">
                  {panelRefs.refs.map((r) => {
                    const [o, c, v] = r.split(".");
                    const libro = manifest?.libros.find((l) => l.osis === o);
                    return (
                      <button
                        key={r}
                        className="ref-item"
                        onClick={() => {
                          const [o, c] = r.split(".");
                          abrirTarjeta(o, Number(c));
                        }}
                      >
                        <b>{libro?.nombre ?? o}</b> {c}:{v}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="lex-meta">{tr.sinReferencias}</div>
              )
            ) : (
              <div className="lex-meta">…</div>
            )}
            {naveTemas !== null && (
              <div className="info-seccion">
                <div className="info-titulo">{tr.temasNave}</div>
                {naveTemas.length ? (
                  <div className="refs-lista">
                    {naveTemas.map((t) => (
                      <span key={t} className="ref-item" style={{ cursor: "default" }}>
                        {t.replace(/-/g, " ")}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="lex-meta">{tr.sinTemas}</div>
                )}
                <div className="lex-meta">{tr.fuenteNave}</div>
              </div>
            )}
            {(() => {
              const clave = claveNota(panelRefs.verso);
              const nota = notas[clave];
              return (
                <div className="nota-editor">
                  <div className="info-titulo">
                    {tr.nota} · {info?.nombre} {panelRefs.verso.c}:{panelRefs.verso.v}
                  </div>
                  <textarea
                    className="nota-area"
                    placeholder={tr.notaPlaceholder}
                    value={nota?.texto ?? ""}
                    onChange={(e) => ponerNota(clave, { texto: e.target.value })}
                    rows={4}
                  />
                  <div className="nota-colores" role="group" aria-label={tr.notaColor}>
                    {COLORES.map((c) => (
                      <button
                        key={c || "ninguno"}
                        className={`color-btn${(nota?.color ?? "") === c ? " activo" : ""}${c ? ` swatch-${c}` : ""}`}
                        onClick={() => ponerNota(clave, { color: c })}
                        title={c ? tr.notaColor + ": " + c : tr.sinColor}
                        aria-label={c ? tr.notaColor + ": " + c : tr.sinColor}
                      />
                    ))}
                    <span style={{ flex: 1 }} />
                    {nota && (
                      <button className="btn btn-fantasma" onClick={() => borrarNota(clave)}>
                        {tr.borrarNota}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
            <div className="lex-fuente">{tr.fuenteRefs}</div>
          </div>
        </div>
      )}
   
      {panelCita && (
        <div {...propsPanel("cita")} role="dialog" aria-label={tr.verTexto}>
          <div className="lex-panel-inner">
            <div className="lex-cabecera">
              <span className="lex-palabra" style={{ fontSize: 20 }}>
                {panelCita.etiqueta} · {manifest?.osis_obra}
              </span>
              <button className="icono-btn cerrar" onClick={() => setPanelCita(null)} aria-label={tr.lexCerrar}>
                ✕
              </button>
            </div>
            {panelCita.cargando ? (
              <div className="lex-meta">…</div>
            ) : panelCita.versos.length ? (
              <>
                <div className="cita-versos">
                  {panelCita.versos.map((v) => (
                    <div key={v.v} className="cita-verso">
                      <sup className="num">{v.v}</sup> {v.t}
                    </div>
                  ))}
                </div>
                <button
                  className="btn btn-fantasma"
                  style={{ marginTop: 12 }}
                  onClick={() => abrirTarjeta(panelCita.osis, panelCita.c)}
                >
                  {tr.abrirPasaje}
                </button>
              </>
            ) : (
              <div className="lex-meta">{tr.citaVacia}</div>
            )}
            <div className="lex-fuente">{tr.pieFuente}</div>
          </div>
        </div>
      )}

      {panelTermino && (
        <div {...propsPanel("termino")} role="dialog" aria-label={tr.lexico}>
          <div className="lex-panel-inner">
            <div className="lex-cabecera">
              <span className="lex-palabra" style={{ fontSize: 20 }}>
                {panelTermino.t}
              </span>
              <button className="icono-btn cerrar" onClick={() => setPanelTermino(null)} aria-label={tr.lexCerrar}>
                ✕
              </button>
            </div>
            <div className="lex-meta">{panelTermino.idioma}</div>
            <div className="lex-def">{panelTermino.sig}</div>
            <div className="lex-fuente">Curaduría editorial · {tr.fuenteRefs}</div>
          </div>
        </div>
      )}

      {panelFuentes && (
        <div {...propsPanel("fuentes")} role="dialog" aria-label={tr.fuentes}>
          <div className="lex-panel-inner">
            <div className="lex-cabecera">
              <span className="lex-palabra" style={{ fontSize: 20 }}>
                {tr.fuentes}
              </span>
              <button
                className="icono-btn cerrar"
                onClick={() => {
                  setPanelFuentes(false);
                  setReporteTexto("");
                  setReporteCopiado(false);
                }}
                aria-label={tr.lexCerrar}
              >
                ✕
              </button>
            </div>
            <div className="fuente-item">
              <b>{manifest?.obra}</b> · {manifest?.licencia}
              <div className="lex-meta">{manifest?.fuente} · {tr.fuentesEstadoNucleo}</div>
              {obra === "vbl" && (
                // CC BY-SA obliga a indicar si el texto se modificó. Mientras se
                // sirva íntegro, hay que declararlo: no es adorno, es la licencia.
                <div className="lex-meta">
                  Traducción desde Nestle-Aland · <b>texto sin modificar</b> ·
                  freebibleversion.org · ShareAlike: ver ficha legal
                </div>
              )}
            </div>
            <div className="fuente-item">
              <b>Interlineal y léxicos</b> — STEPBible-Data (Tyndale House), CC BY 4.0
              <div className="lex-meta">TAHOT/TAGNT + TBESG/TBESH · autoridad académica Tyndale House, Cambridge · {tr.fuentesEstadoNucleo}</div>
            </div>
            <div className="fuente-item">
              <b>Treasury of Scripture Knowledge</b> — R. A. Torrey, 1907 · dominio público
              <div className="lex-meta">+ OpenBible.info cross-references (CC BY) · {tr.fuentesEstadoNucleo}</div>
            </div>
            <div className="fuente-item">
              <b>Easton's Bible Dictionary</b> — M. G. Easton, 1897 · dominio público
              <div className="lex-meta">tradición: presbiteriana evangélica (escocesa-estadounidense) · {tr.fuentesEstadoNucleo} · ES en curso</div>
            </div>
            <div className="fuente-item">
              <b>Matthew Henry, Complete Commentary</b> — Matthew Henry, 1706–1721 · dominio público (edición CC0)
              <div className="lex-meta">
                tradición: puritana/noconformista inglesa · {henryEs ? tr.fuentesEstadoEs : tr.fuentesEstadoEn} · JUAN 21/21
                <br />
                Traducción ES: obra derivada propia · CC BY 4.0 (decisión B18)
              </div>
            </div>
            <div className="fuente-item">
              <b>Jamieson, Fausset and Brown Commentary</b> — 1871 · dominio público
              <div className="lex-meta">
                tradición: evangélica escocesa-presbiteriana · {tr.fuentesEstadoEn} · texto EN · {tr.fuenteJfbCobertura}
              </div>
            </div>
            <div className="fuente-item">
              <b>Notes on the New / Old Testament — Albert Barnes</b> — 1832–1872 · dominio público
              <div className="lex-meta">
                tradición: presbiteriana americana · {tr.fuentesEstadoEn} · texto EN · {tr.fuenteBarnesCobertura}
              </div>
            </div>
            <div className="nota-editor">
              <div className="info-titulo">{tr.reportarError}</div>
              <textarea
                className="nota-area"
                placeholder={tr.reportarPlaceholder}
                value={reporteTexto}
                onChange={(e) => setReporteTexto(e.target.value)}
                rows={3}
              />
              <div className="notas-acciones">
                <button className="btn btn-fantasma" onClick={copiarReporte}>
                  ⧉ {reporteCopiado ? tr.reporteCopiado : tr.copiarReporte}
                </button>
              </div>
              <div className="lex-meta" style={{ marginTop: 8 }}>{tr.fuenteReporte}</div>
            </div>
          </div>
        </div>
      )}

      {panelNotas && (
        <div {...propsPanel("notas")} role="dialog" aria-label={tr.notas}>
          <div className="lex-panel-inner">
            <div className="lex-cabecera">
              <span className="lex-palabra" style={{ fontSize: 20 }}>
                {tr.notas} · {Object.keys(notas).length}
              </span>
              <button
                className="icono-btn cerrar"
                onClick={() => {
                  setPanelNotas(false);
                  setMsgNotas(null);
                }}
                aria-label={tr.lexCerrar}
              >
                ✕
              </button>
            </div>
            {msgNotas && <div className="lex-meta" style={{ color: "var(--accent-strong)" }}>{msgNotas}</div>}
            {Object.keys(notas).length ? (
              <div className="refs-lista">
                {Object.entries(notas)
                  .sort((a, b) => (b[1].ts > a[1].ts ? 1 : -1))
                  .map(([clave, nota]) => {
                    const [o, c, v] = clave.split(".");
                    const libro = manifest?.libros.find((l) => l.osis === o);
                    return (
                      <button
                        key={clave}
                        className={`ref-item${nota.color ? ` swatch-${nota.color}` : ""}`}
                        onClick={() => {
                          setOsis(o);
                          setCap(Number(c));
                          setPanelNotas(false);
                        }}
                      >
                        <b>
                          {libro?.nombre ?? o} {c}:{v}
                        </b>
                        {nota.texto ? ` — ${nota.texto.slice(0, 60)}${nota.texto.length > 60 ? "…" : ""}` : ` — ${tr.conNota}`}
                      </button>
                    );
                  })}
              </div>
            ) : (
              <div className="lex-meta">{tr.notasVacias}</div>
            )}
            <div className="notas-acciones">
              <button className="btn btn-fantasma" onClick={exportarNotas} disabled={!Object.keys(notas).length}>
                ⭳ {tr.exportarNotas}
              </button>
              <button className="btn btn-fantasma" onClick={() => refArchivo.current?.click()}>
                ⭱ {tr.importarNotas}
              </button>
              <input
                ref={refArchivo}
                type="file"
                accept="application/json,.json"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) importarNotas(f);
                  e.target.value = "";
                }}
              />
            </div>
            <div className="lex-fuente">{tr.fuenteNotas}</div>
          </div>
        </div>
      )}

      {panelInfo && (
        <div {...propsPanel("info")} role="dialog" aria-label={tr.info}>
          <div className="lex-panel-inner">
            <div className="lex-cabecera">
              <span className="lex-palabra" style={{ fontSize: 20 }}>
                {tr.info}
              </span>
              <button className="icono-btn cerrar" onClick={() => setPanelInfo(false)} aria-label={tr.lexCerrar}>
                ✕
              </button>
            </div>
            {/* Fuentes del corpus vive ahora dentro de Información: un solo botón
                arriba en vez de dos iconos en la fila de navegación. Se abre
                encima (baraja) y la información queda como pestaña detrás. */}
            <button
              className="btn-inter"
              style={{ marginTop: 4 }}
              onClick={() => {
                setPanelFuentes(true);
                setReporteTexto("");
                setReporteCopiado(false);
              }}
            >
              ≣ {tr.fuentes} →
            </button>
            <div className="info-seccion">
              <div className="info-titulo">{tr.infoReferencia}</div>
              <div className="lex-def">
                {info?.nombre} {cap} · {osis}.{cap} · {manifest?.osis_obra}
              </div>
            </div>
            {nVacios > 0 && (
              <div className="info-seccion">
                <div className="info-titulo">{tr.infoEdicion}</div>
                <div className="lex-def">
                  {nVacios} {tr.infoEdicionTexto}
                </div>
              </div>
            )}
            {comentario && (
              <div className="info-seccion">
                <div className="info-titulo">{tr.infoComentario}</div>
                <div className="lex-def">
                  {comFuente === "henry" ? (
                    <>
                      Matthew Henry, Complete Commentary (1706–1721) · Dominio público · edición CC0 · traducción ES CC BY 4.0 ·{" "}
                      {henryEs ? tr.estadoNota : tr.comentarioEN}
                    </>
                  ) : (
                    comFuente === "barnes" ? (
                      <>Albert Barnes, Notes on the New / Old Testament (1832–1872) · Dominio público · texto original EN (traducción ES en cola)</>
                    ) : (
                      <>Jamieson, Fausset and Brown Commentary (1871) · Dominio público · texto EN (traducción ES en cola)</>
                    )
                  )}
                </div>
              </div>
            )}
            <div className="info-seccion">
              <div className="info-titulo">{tr.infoAtribucion}</div>
              <div className="lex-def">
                <b>{manifest?.obra}</b> · {manifest?.licencia}
                <br />
                {manifest?.fuente}
                <br />
                {tr.pieIngesta}: {manifest?.total_versos.toLocaleString("es")} · {manifest?.fecha_ingesta}
              </div>
              {interlineal && (
                <div className="lex-def">
                  Interlineal, léxicos y etiquetas morfológicas: STEPBible-Data (Tyndale House,
                  Cambridge), CC BY 4.0 · traducción al español de las etiquetas CC BY 4.0 (B18)
                </div>
              )}
              <div className="lex-def">{tr.fuenteNave}</div>
            </div>
          </div>
        </div>
      )}

      {pasaje && (
        <div className="split-card">
          <div className="split-cab">
            <span className="split-titulo">
              {manifest?.libros.find((l) => l.osis === pasaje.osis)?.nombre ?? pasaje.osis} {pasaje.c}
            </span>
            <span className="split-acciones">
              <button className="icono-btn cerrar" onClick={() => setPasaje(null)} aria-label={tr.lexCerrar} title={tr.lexCerrar}>
                ✕
              </button>
            </span>
          </div>
          <div className="split-contenido">
            {pasajeTexto ? (
              <div className="texto-biblico split-versos">
                {pasajeTexto.versos
                  .filter((v) => v.c === pasaje.c)
                  .map((v) => (
                    <span key={v.osis} className="verso" data-osis={v.osis}>
                      <sup className="num">{v.v}</sup> {v.t}{" "}
                    </span>
                  ))}
              </div>
            ) : (
              <p style={{ color: "var(--muted)" }}>…</p>
            )}
            <div className="lex-fuente" style={{ marginTop: 14 }}>
              {manifest?.obra} · {pasaje.osis}.{pasaje.c}
            </div>
          </div>
        </div>
      )}

      <footer className="pie">
        <div className="pie-inner">
          <span>{manifest?.obra}</span>
          <span>{tr.pieOrigen}</span>
        </div>
      </footer>
    </>
  );
}

/** Bloque de comentario de Henry colapsado por defecto (los capítulos son extensos). */
function ComentarioBloque({
  seccion,
  tr,
  renderFn,
  autor,
}: {
  seccion: SeccionHenry & { sinTraducir?: boolean };
  autor?: string;
  tr: ReturnType<typeof t>;
  renderFn: (texto: string) => React.ReactNode;
}) {
  const [abierto, setAbierto] = useState(false);
  const [anclada, setAnclada] = useState(false);
  const [infoAbierta, setInfoAbierta] = useState(false);
  const barraRef = useRef<HTMLDivElement>(null);

  // detección de anclaje: la barra está clavada bajo el header mientras se lee la sección
  useEffect(() => {
    if (!abierto) {
      setAnclada(false);
      return;
    }
    const verificar = () => {
      const barra = barraRef.current;
      if (!barra) return;
      const tope = document.querySelector(".cabecera")?.getBoundingClientRect().bottom ?? 0;
      const r = barra.getBoundingClientRect();
      setAnclada(r.top <= tope + 1 && r.bottom > tope + 1);
    };
    verificar();
    window.addEventListener("scroll", verificar, { passive: true });
    window.addEventListener("resize", verificar);
    return () => {
      window.removeEventListener("scroll", verificar);
      window.removeEventListener("resize", verificar);
    };
  }, [abierto]);

  return (
    <span className="com-bloque-wrap">
      <div
        ref={barraRef}
        className={`com-toggle${abierto ? " abierto" : ""}${anclada ? " anclada" : ""}`}
        role="button"
        tabIndex={0}
        aria-expanded={abierto}
        onClick={() => setAbierto(!abierto)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setAbierto(!abierto);
        }}
      >
        <span className="com-flecha">{abierto ? "▾" : "▸"}</span>
        <span className="com-etiqueta">
          <span className="l1">{autor ? `Comentario de ${autor}` : tr.comentarioDe}</span>
          <span className="l2">
            <i>{seccion.t}</i> ({seccion.p.length})
            {seccion.sinTraducir && <b> · {tr.sinTraducir}</b>}
          </span>
        </span>
        <button
          className="com-info-btn"
          onClick={(e) => {
            e.stopPropagation();
            setInfoAbierta(!infoAbierta);
          }}
          aria-label={tr.info}
          title={tr.info}
        >
          i
        </button>
      </div>
      {infoAbierta && (
        <span className="com-info-popo">
          <b>{tr.ancladaTitulo}</b>
          <br />
          {tr.ancladaInfo}
        </span>
      )}
      <span className={`com-bloque${abierto ? " abierto" : ""}`}>
        <span className="com-bloque-int">
          <span className="com-titulo">
            {seccion.t}
            {seccion.v ? ` — desde el verso ${seccion.v}` : ""}
          </span>
          {seccion.p.map((p, i) => (
            <span key={i} className="com-parrafo">
              {renderFn(p)}
            </span>
          ))}
        </span>
      </span>
    </span>
  );
}
