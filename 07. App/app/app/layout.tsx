import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Biblioteca — estudio bíblico serio, en español",
  description:
    "Biblioteca cristiana digital: texto bíblico, lenguas originales, comentarios, diccionarios y notas del lector, conectados alrededor de cada pasaje. Construcción inicial sobre corpus libre verificado.",
};

/** Anti-parpadeo: fija el tema antes del primer paint (localStorage → preferencia del sistema). */
const temaInit = `try{var t=localStorage.getItem('tema')||(window.matchMedia('(prefers-color-scheme: dark)').matches?'oscuro':'claro');document.documentElement.setAttribute('data-theme',t)}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: temaInit }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
