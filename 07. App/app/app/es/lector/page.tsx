"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Cabecera from "@/components/Cabecera";
import { t } from "@/lib/i18n";

type Libro = { osis: string; nombre: string; caps: number; versos: number };
type Verso = { c: number; v: number; osis: string; t: string };
type ObraJson = { osis: string; nombre: string; versos: Verso[] };

const OSIS_INICIAL = "JHN";
const CAP_INICIAL = 1;
const cache = new Map<string, ObraJson>();

export default function Lector() {
  const tr = t("es");
  const [libros, setLibros] = useState<Libro[]>([]);
  const [osis, setOsis] = useState(OSIS_INICIAL);
  const [cap, setCap] = useState(CAP_INICIAL);
  const [obra, setObra] = useState<ObraJson | null>(null);
  const [cargando, setCargando] = useState(true);
  const columna = useRef<HTMLDivElement>(null);

  // manifiesto: lista de libros
  useEffect(() => {
    fetch("/data/rv1909/_manifest.json")
      .then((r) => r.json())
      .then((m) => setLibros(m.libros))
      .catch(() => setLibros([]));
  }, []);

  // ?ref=JHN.1 — referencia compartible al entrar
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (!ref) return;
    const [o, c] = ref.split(".");
    if (/^[1-3]?[A-Z]{2,3}$/.test(o) && Number(c) >= 1) {
      setOsis(o);
      setCap(Number(c));
    }
  }, []);

  // carga del libro (con caché en memoria)
  useEffect(() => {
    let vivo = true;
    const enCache = cache.get(osis);
    if (enCache) {
      setObra(enCache);
      setCargando(false);
      return;
    }
    setCargando(true);
    setObra(null);
    fetch(`/data/rv1909/${osis}.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((json: ObraJson) => {
        if (!vivo) return;
        cache.set(osis, json);
        setObra(json);
        setCargando(false);
      })
      .catch(() => vivo && setCargando(false));
    return () => {
      vivo = false;
    };
  }, [osis]);

  const caps = obra?.versos.length
    ? Math.max(...obra.versos.map((v) => v.c))
    : (libros.find((l) => l.osis === osis)?.caps ?? 1);

  const versos = obra?.versos.filter((v) => v.c === cap) ?? [];

  const ir = useCallback(
    (delta: number) => {
      const nueva = cap + delta;
      if (nueva >= 1) setCap(nueva);
      else {
        const idx = libros.findIndex((l) => l.osis === osis);
        const previo = libros[idx - 1];
        if (previo) {
          setOsis(previo.osis);
          setCap(previo.caps);
        }
      }
    },
    [cap, osis, libros]
  );

  const adelante = useCallback(
    (delta: number) => {
      const nueva = cap + delta;
      if (nueva <= caps) setCap(nueva);
      else {
        const idx = libros.findIndex((l) => l.osis === osis);
        const proximo = libros[idx + 1];
        if (proximo) {
          setOsis(proximo.osis);
          setCap(1);
        }
      }
    },
    [cap, caps, osis, libros]
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
    window.history.replaceState(null, "", `/es/lector?ref=${osis}.${cap}`);
    columna.current?.scrollIntoView({ block: "start" });
  }, [osis, cap, cargando]);

  const info = libros.find((l) => l.osis === osis);

  return (
    <>
      <Cabecera locale="es" />
      <main>
        <div className="cabecera" style={{ position: "static", backdropFilter: "none", background: "transparent", borderBottom: "none" }}>
          <div className="cabecera-inner" style={{ maxWidth: 720, paddingBlock: 18 }}>
            <select
              className="sel"
              aria-label={tr.libro}
              value={osis}
              onChange={(e) => {
                setOsis(e.target.value);
                setCap(1);
              }}
            >
              {libros.map((l) => (
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
              <button className="icono-btn" onClick={() => ir(-1)} aria-label={tr.anterior} title={tr.anterior}>
                ←
              </button>
              <button className="icono-btn" onClick={() => adelante(1)} aria-label={tr.siguiente} title={tr.siguiente}>
                →
              </button>
            </div>
          </div>
        </div>

        <div className="lector-columna" ref={columna}>
          <div className="lector-titulo">
            <h1 className="serif-display">
              {info?.nombre ?? obra?.nombre ?? "…"} {cap}
            </h1>
            <span className="ref-osis">
              {osis}.{cap} · RV1909
            </span>
          </div>

          <div className="avisos">{tr.avisoObra}</div>

          {cargando ? (
            <p style={{ color: "var(--muted)" }}>…</p>
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
              <b>{tr.pieFuente}</b>
            </span>
            <span>{tr.pieOrigen}</span>
            <span>OSIS {osis}.{cap}</span>
          </div>
        </div>
      </main>
      <footer className="pie">
        <div className="pie-inner">
          <span>{tr.pieIngesta}</span>
          <span>{tr.pieOrigen}</span>
        </div>
      </footer>
    </>
  );
}
