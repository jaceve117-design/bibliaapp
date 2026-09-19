import Link from "next/link";
import Tema from "./Tema";
import { t, type Locale } from "@/lib/i18n";

/** Cabecera fija (sticky). `children` se renderiza como filas extra, también fijas. `extra` va junto al botón de tema. */
export default function Cabecera({
  locale,
  extra,
  children,
}: {
  locale: Locale;
  extra?: React.ReactNode;
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
          {extra}
          <Tema etiqueta={tr.tema} />
        </div>
      </div>
      {children ? <div className="cabecera-sub">{children}</div> : null}
    </header>
  );
}
