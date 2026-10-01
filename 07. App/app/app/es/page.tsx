import Link from "next/link";
import Cabecera from "@/components/Cabecera";
import { t } from "@/lib/i18n";

/** Recursos que hoy ya sirven en el lector (2026-09-30). */
const RECURSOS = [
  {
    t: "Texto bíblico",
    d: "Reina-Valera 1909 y Biblia del Oso 1569 — dos biblias completas en español, con VBL como versión moderna. Nuevo Testamento griego SBLGNT con lemas y morfología.",
  },
  {
    t: "Comentarios clásicos",
    d: "Matthew Henry, Jamieson-Fausset-Brown, Albert Barnes, Keil y Delitzsch (AT completo) y Marvin Vincent (NT), en inglés y en español; Juan de Valdés en su castellano original.",
  },
  {
    t: "Diccionarios y léxico",
    d: "Easton y Rand en español, léxico STEPBible de hebreo y griego con morfología traducida, y Nave's: los temas de cada versículo.",
  },
  {
    t: "Estudio conectado",
    d: "344.000 referencias cruzadas votadas, geografía de 1.335 lugares con mapa, sintaxis griega por palabra, notas y subrayados del lector, y búsqueda offline.",
  },
];

export default function Portada() {
  const tr = t("es");
  return (
    <>
      <Cabecera locale="es" />
      <main>
        <section className="hero">
          <div className="hero-regla" />
          <div className="kicker">{tr.heroKicker}</div>
          <h1 className="serif-display">
            {tr.heroTitulo1}
            <br />
            <em>{tr.heroTitulo2}</em>
            <br />
            {tr.heroTitulo3}
          </h1>
          <p className="sub">{tr.heroSub}</p>
          <Link href="/es/lector" className="btn btn-primario">
            {tr.heroCta} →
          </Link>
          <p style={{ marginTop: 18, fontFamily: "var(--sans)", fontSize: 13, color: "var(--muted)" }}>
            {tr.heroNota}
          </p>
        </section>

        <section className="dato-fila" aria-label="Estado del corpus">
          <div className="dato">
            <div className="n">62.200</div>
            <div className="et">{tr.dato1}</div>
          </div>
          <div className="dato">
            <div className="n">6</div>
            <div className="et">{tr.dato2}</div>
          </div>
          <div className="dato">
            <div className="n">344.000</div>
            <div className="et">{tr.dato3}</div>
          </div>
          <div className="dato">
            <div className="n">3 + 1</div>
            <div className="et">{tr.dato4}</div>
          </div>
        </section>

        <section className="portada-recursos" aria-label="Recursos de la biblioteca">
          <div className="kicker">Lo que hay dentro</div>
          <div className="portada-grid">
            {RECURSOS.map((r) => (
              <div key={r.t} className="portada-tarjeta">
                <b>{r.t}</b>
                <p>{r.d}</p>
              </div>
            ))}
          </div>
          <Link href="/es/lector" className="btn btn-fantasma">
            Verlo en el lector →
          </Link>
        </section>
      </main>
      <footer className="pie">
        <div className="pie-inner">
          <span>{tr.pieFuente}</span>
          <span>{tr.pieOrigen}</span>
          <span>{tr.pieIngesta}</span>
        </div>
      </footer>
    </>
  );
}
