"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Cabecera from "@/components/Cabecera";
import TamTexto from "@/components/TamTexto";
import { t } from "@/lib/i18n";
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
type EntradaLex = { w: string; t: string; m: string; g: string; d: string };
type IndiceItem = { s: string; n: string; l: string };
type EntradaDic = { n: string; d: string; r: string[] };
type SeccionHenry = { t: string; v: number | null; p: string[] };
type HenryJson = { osis: string; c: Record<string, { r: string | null; s: SeccionHenry[] }> };
type HenryEsJson = HenryJson & { estado?: string };
type Termino = { t: string; variantes: string[]; idioma: string; sig: string };
type PanelCita = { etiqueta: string; osis: string; c: number; versos: { v: number; t: string }[]; cargando: boolean; mas: boolean };

const OBRAS = [
  { id: "rv1909", etiqueta: "RV1909" },
  { id: "web", etiqueta: "WEB" },
];
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
  const [interData, setInterData] = useState<InterJson | null>(null);
  const [lex, setLex] = useState<{ palabra: Palabra; entrada?: EntradaLex } | null>(null);
  const [panelRefs, setPanelRefs] = useState<{ verso: Verso; refs: string[]; cargadas: boolean } | null>(null);
  const [dicPanel, setDicPanel] = useState(false);
  const [dicIndice, setDicIndice] = useState<IndiceItem[] | null>(null);
  const [dicQuery, setDicQuery] = useState("");
  const [dicEntrada, setDicEntrada] = useState<EntradaDic | null>(null);
  const [comentario, setComentario] = useState(false);
  const [henry, setHenry] = useState<HenryJson | null>(null);
  const [henryEs, setHenryEs] = useState<HenryEsJson | null>(null);
  const [comIdioma, setComIdioma] = useState<"es" | "en">("es");
  const [panelCita, setPanelCita] = useState<PanelCita | null>(null);
  const [panelTermino, setPanelTermino] = useState<Termino | null>(null);
  const [panelInfo, setPanelInfo] = useState(false);
  const [pasaje, setPasaje] = useState<{ osis: string; c: number } | null>(null);
  const [pasajeTexto, setPasajeTexto] = useState<ObraJson | null>(null);
  const [lexico, setLexico] = useState<Termino[] | null>(null);
  const reTerminos = useRef<RegExp | null>(null);
  const columna = useRef<HTMLDivElement>(null);
  const lexCache = useRef(cacheLex);

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

  // carga del interlineal (TAHOT/TAGNT por libro)
  useEffect(() => {
    if (!interlineal) {
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
  }, [interlineal, osis]);

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
    columna.current?.scrollIntoView({ block: "start" });
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

  // referencias cruzadas (TSK): carga perezosa al primer clic en un número de verso
  const abrirReferencias = (v: Verso) => {
    setPanelRefs({ verso: v, refs: [], cargadas: false });
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
      const n = normalizar(item.n);
      if (n.startsWith(q)) empiezan.push(item);
      else if (n.includes(q)) contiene.push(item);
      if (empiezan.length >= 30) break;
    }
    return [...empiezan, ...contiene].slice(0, 40);
  })();

  const abrirEntradaDic = (item: IndiceItem) => {
    const clave = `dic:${item.l}`;
    const usar = (data: { entradas: Record<string, EntradaDic> }) =>
      setDicEntrada(data.entradas[item.s] ?? null);
    const enCache = cache.get(clave) as { entradas: Record<string, EntradaDic> } | undefined;
    if (enCache) {
      usar(enCache);
      return;
    }
    fetch(`/data/easton/${item.l}.json`)
      .then((r) => r.json())
      .then((data) => {
        cache.set(clave, data);
        usar(data);
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
  const capCom = henry?.c[capClave];
  const rCom = idiomaEfectivo === "es" && esCapDisp ? (capEs?.r ?? null) : (capCom?.r ?? null);
  const seccionesCom = (capCom?.s ?? []).map((sEn, i) => {
    if (idiomaEfectivo === "es") {
      const sEs = capEs?.s?.[i];
      if (sEs) return { ...sEs, sinTraducir: false };
      return { ...sEn, sinTraducir: true };
    }
    return { ...sEn, sinTraducir: false };
  });

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
      <Cabecera locale="es">
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
          <select
            className="sel"
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
          <div className="lector-acciones">
            <button
              className="icono-btn"
              onClick={abrirDic}
              aria-label={tr.diccionario}
              title={tr.diccionario}
            >
              ⌕
            </button>
            <button className="icono-btn" onClick={() => setPanelInfo(true)} aria-label={tr.info} title={tr.info}>
              ⓘ
            </button>
            <button
              className={`icono-btn${interlineal ? " activo" : ""}`}
              onClick={() => setInterlineal(!interlineal)}
              aria-label={tr.interlineal}
              title={tr.interlineal}
              style={interlineal ? { borderColor: "var(--accent)", color: "var(--accent-strong)" } : undefined}
            >
              Ω
            </button>
            <button className="icono-btn" onClick={() => ir(-1)} aria-label={tr.anterior} title={tr.anterior}>
              ←
            </button>
            <button className="icono-btn" onClick={() => adelante(1)} aria-label={tr.siguiente} title={tr.siguiente}>
              →
            </button>
          </div>
        </div>
        <div className="com-strip-fila">
          <div
            className={`com-strip${comentario ? " activa" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => setComentario(!comentario)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setComentario(!comentario);
            }}
            aria-pressed={comentario}
            title={tr.comentario}
          >
            <span className="com-strip-izq">
              <span className="com-strip-icono">✎</span>
              <span className="autor">{tr.autorComentario}</span>
            </span>
            <span
              className="com-strip-der"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              role="group"
              aria-label={tr.comentario}
            >
              {henryEs && (
                <>
                  {idiomaEfectivo === "es" && esCapDisp && (
                    <span className="badge-revision" title={tr.estadoNota}>
                      {tr.sinRevisar}
                    </span>
                  )}
                  <span className="obras-toggle">
                    <button
                      className={`obras-tab${comIdioma === "es" ? " activa" : ""}`}
                      onClick={() => setComIdioma("es")}
                      aria-label="Comentario en español"
                    >
                      ES
                    </button>
                    <button
                      className={`obras-tab${comIdioma === "en" ? " activa" : ""}`}
                      onClick={() => setComIdioma("en")}
                      aria-label="Commentary in English"
                    >
                      EN
                    </button>
                  </span>
                </>
              )}
            </span>
          </div>
        </div>
      </Cabecera>

      <main>
        <div className="lector-columna" ref={columna}>
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
          ) : interlineal ? (
            <div className={`interlin${dir === "rtl" ? " rtl" : ""}`}>
              {versos.map((v) => {
                const palabras = interData?.versos[`${v.c}.${v.v}`];
                return (
                  <div key={v.osis} className="interlin-verso">
                    <sup className="num">{v.v}</sup>
                    {palabras?.length ? (
                      palabras.map((p, i) => (
                        <button
                          key={i}
                          className="palabra"
                          onClick={() => abrirLexico(p)}
                          title={`${p.s} · ${p.m}`}
                        >
                          <span className="w">{p.g}</span>
                          <span className="gl">{p.es || p.e}</span>
                          <span className="st">
                            {p.s} · {p.m}
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
              {comentario && rCom && (
                <div className="com-resumen">
                  <div className="com-titulo">{tr.resumenCapitulo}</div>
                  {renderMarcado(rCom)}
                </div>
              )}
              {versos.map((v) => {
                const secciones = comentario
                  ? seccionesCom.filter((s) => s.v === v.v)
                  : [];
                return (
                  <span key={v.osis} style={{ display: "inline" }}>
                    <span className="verso" data-osis={v.osis}>
                      <sup className="num ref-btn" onClick={() => abrirReferencias(v)} title={tr.referencias} role="button">
                        {v.v}
                      </sup>
                      {v.t}{" "}
                    </span>
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
        <div className="lex-panel" role="dialog" aria-label={tr.diccionario}>
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
                <div className="lex-palabra" style={{ fontSize: 24 }}>
                  {dicEntrada.n}
                </div>
                <div className="lex-def" style={{ marginTop: 10 }}>
                  {dicEntrada.d}
                </div>
                {dicEntrada.r?.length > 0 && (
                  <div className="lex-meta" style={{ marginTop: 14 }}>
                    Refs: {dicEntrada.r.slice(0, 12).join(" · ")}
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
                      {item.n}
                    </button>
                  ))}
                </div>
                <div className="lex-fuente">{tr.fuenteDic}</div>
              </>
            )}
          </div>
        </div>
      )}

      {lex && (
        <div className="lex-panel" role="dialog" aria-label={tr.lexico}>
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
                  <b>{lex.entrada.g}</b>
                  {lex.palabra.lex && <span> — {lex.palabra.lex}</span>}
                </div>
                <div className="lex-def">{limpiarDef(lex.entrada.d)}</div>
              </>
            ) : (
              <div className="lex-meta">Sin entrada léxica para {lex.palabra.s}.</div>
            )}
            <div className="lex-fuente">
              Léxico: TBESG/TBESH — STEPBible-Data (Tyndale House), CC BY 4.0
            </div>
          </div>
        </div>
      )}

      {panelRefs && (
        <div className="lex-panel" role="dialog" aria-label={tr.referencias}>
          <div className="lex-panel-inner">
            <div className="lex-cabecera">
              <span className="lex-palabra" style={{ fontSize: 20 }}>
                {tr.referencias} · {info?.nombre} {panelRefs.verso.c}:{panelRefs.verso.v}
              </span>
              <button className="icono-btn cerrar" onClick={() => setPanelRefs(null)} aria-label={tr.lexCerrar}>
                ✕
              </button>
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
            <div className="lex-fuente">{tr.fuenteRefs}</div>
          </div>
        </div>
      )}

      {panelCita && (
        <div className="lex-panel" role="dialog" aria-label={tr.verTexto}>
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
        <div className="lex-panel" role="dialog" aria-label={tr.lexico}>
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

      {panelInfo && (
        <div className="lex-panel" role="dialog" aria-label={tr.info}>
          <div className="lex-panel-inner">
            <div className="lex-cabecera">
              <span className="lex-palabra" style={{ fontSize: 20 }}>
                {tr.info}
              </span>
              <button className="icono-btn cerrar" onClick={() => setPanelInfo(false)} aria-label={tr.lexCerrar}>
                ✕
              </button>
            </div>
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
                  Matthew Henry, Complete Commentary (1706–1721) · Dominio público · edición CC0 ·{" "}
                  {henryEs ? tr.estadoNota : tr.comentarioEN}
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
                  Interlineal y léxicos: STEPBible-Data (Tyndale House), CC BY 4.0
                </div>
              )}
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
}: {
  seccion: SeccionHenry & { sinTraducir?: boolean };
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
          <span className="l1">{tr.comentarioDe}</span>
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
