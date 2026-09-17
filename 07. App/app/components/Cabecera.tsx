import Link from "next/link";
import Tema from "./Tema";
import { t, type Locale } from "@/lib/i18n";

/** Cabecera fija (sticky). `children` se renderiza como segunda fila, también fija. */
export default function Cabecera({
  locale,
  children,
}: {
  locale: Locale;
  children?: React.ReactNode;
}) {
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
      {children ? <div className="cabecera-sub">{children}</div> : null}
    </header>
  );
}
