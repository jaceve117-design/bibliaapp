import Link from "next/link";
import Cabecera from "@/components/Cabecera";
import { t } from "@/lib/i18n";
import TiraMarquee from "@/components/TiraMarquee";

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

const TIRA = [
  "Matthew Henry · completo en español, capítulo a capítulo",
  "Keil y Delitzsch · el AT completo, 24.305 párrafos traducidos",
  "Marvin Vincent · estudio de palabras griegas del NT",
  "Jamieson-Fausset-Brown · 19.768 anclas de versículo",
  "Albert Barnes · NT completo + Génesis, Job, Salmos, Isaías y Daniel",
  "Juan de Valdés · 1556/1557, en su castellano original",
  "Biblia del Oso 1569 · ortografía actualizada, 31.098 versos",
  "344.000 referencias cruzadas votadas",
  "1.335 lugares bíblicos con coordenadas y mapa",
  "Sintaxis griega palabra por palabra (MACULA)",
  "Nave's y TSK conectados a cada versículo",
  "22.700 términos del léxico hebreo-griego en español",
  "100% gratuita · sin cuentas · sin anuncios · funciona sin conexión",
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

        <TiraMarquee items={TIRA} />

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

        <section className="portada-libre" aria-label="Gratuita y multiplataforma">
          <div className="portada-libre-caja">
            <b>100% gratuita, en cualquier dispositivo</b>
            <p>
              Sin cuentas, sin suscripciones y sin anuncios: úsala en tu móvil, tablet o PC,
              instálala como aplicación y estudia incluso sin conexión.
            </p>
          </div>
          <div className="portada-libre-caja en-camino">
            <b>En camino: la app oficial para Android e iOS</b>
            <p>Ya estamos trabajando en ella — la misma biblioteca de estudio, en tu bolsillo.</p>
          </div>
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
