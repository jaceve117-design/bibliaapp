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

const OBRAS = [
  { id: "rv1909", etiqueta: "RV1909" },
  { id: "web", etiqueta: "WEB" },
];
const OSIS_INICIAL = "JHN";
const CAP_INICIAL = 1;
const cache = new Map<string, ObraJson>();

export default function Lector() {
  const tr = t("es");
  const [obra, setObra] = useState("rv1909");
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [osis, setOsis] = useState(OSIS_INICIAL);
  const [cap, setCap] = useState(CAP_INICIAL);
  const [texto, setTexto] = useState<ObraJson | null>(null);
  const [cargando, setCargando] = useState(true);
  const columna = useRef<HTMLDivElement>(null);

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

  // carga del libro (con caché en memoria por obra)
  useEffect(() => {
    let vivo = true;
    const clave = `${obra}:${osis}`;
    const enCache = cache.get(clave);
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

  const info = manifest?.libros.find((l) => l.osis === osis);
  const nVacios = manifest?.incidentes.length ?? 0;

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
      <footer className="pie">
        <div className="pie-inner">
          <span>{manifest?.obra}</span>
          <span>{tr.pieOrigen}</span>
        </div>
      </footer>
    </>
  );
}
