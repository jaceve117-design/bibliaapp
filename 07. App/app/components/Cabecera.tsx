import Link from "next/link";
import Tema from "./Tema";
import { t, type Locale } from "@/lib/i18n";

export default function Cabecera({ locale }: { locale: Locale }) {
  const tr = t(locale);
  return (
    <header className="cabecera">
      <div className="cabecera-inner">
        <Link href={`/${locale}`} className="marca">
          <span className="punto" />
          {tr.marcaProvisional}
        </Link>
        <div className="lector-acciones">
          <Link
            href={`/${locale}/lector`}
            style={{
              fontFamily: "var(--sans)",
              fontSize: 14,
              color: "var(--ink-soft)",
              textDecoration: "none",
              marginRight: 8,
            }}
          >
            {tr.lector}
          </Link>
          <Tema etiqueta={tr.tema} />
        </div>
      </div>
    </header>
  );
}
