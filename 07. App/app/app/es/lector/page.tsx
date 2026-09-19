"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Cabecera from "@/components/Cabecera";
import { t } from "@/lib/i18n";

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

  const limpiarDef = (d: string) =>
    d
      .replace(/<BR\s*\/?>/gi, "\n")
      .replace(/<ref='([^']+)'>/g, "$1 ")
      .replace(/<[^>]+>/g, "")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .trim();

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

          {nVacios > 0 && (
            <div className="avisos">
              Edición de trabajo: {nVacios} marcadores de verso quedaron vacíos en la edición fuente
              (versificación propia o versos en nota) y están documentados en el manifiesto de
              ingesta. No se rellenaron de memoria.
            </div>
          )}

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
              {versos.map((v) => (
                <span key={v.osis} className="verso" data-osis={v.osis}>
                  <sup className="num">{v.v}</sup>
                  {v.t}{" "}
                </span>
              ))}
            </div>
          )}

          <div className="atribucion-obra">
            <span>
              <b>{manifest?.obra}</b>
            </span>
            <span>{manifest?.licencia}</span>
            <span>{manifest?.fuente}</span>
            {interlineal && <span>
              <b>Interlineal:</b> STEPBible-Data (TAHOT/TAGNT, CC BY 4.0)
            </span>}
            <span>
              Ingesta validada: {manifest?.total_versos.toLocaleString("es")} versos ·{" "}
              {manifest?.fecha_ingesta}
            </span>
            <span>
              OSIS {osis}.{cap}
            </span>
          </div>
        </div>
      </main>

      {lex && (
        <div className="lex-panel" role="dialog" aria-label={tr.lexico}>
          <div className="lex-panel-inner">
            <div className="lex-cabecera">
              <span className="lex-palabra">{lex.palabra.g}</span>
              <button className="icono-btn" onClick={() => setLex(null)} aria-label={tr.lexCerrar}>
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

      <footer className="pie">
        <div className="pie-inner">
          <span>{manifest?.obra}</span>
          <span>{tr.pieOrigen}</span>
        </div>
      </footer>
    </>
  );
}
