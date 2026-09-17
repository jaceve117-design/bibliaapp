import Link from "next/link";
import Cabecera from "@/components/Cabecera";
import { t } from "@/lib/i18n";

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
            <div className="n">31.102</div>
            <div className="et">{tr.dato1}</div>
          </div>
          <div className="dato">
            <div className="n">66</div>
            <div className="et">{tr.dato2}</div>
          </div>
          <div className="dato">
            <div className="n">18</div>
            <div className="et">{tr.dato3}</div>
          </div>
          <div className="dato">
            <div className="n">100%</div>
            <div className="et">{tr.dato4}</div>
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
