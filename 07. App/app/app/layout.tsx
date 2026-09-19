import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegistrarSW from "@/components/RegistrarSW";

export const metadata: Metadata = {
  title: "Biblioteca — estudio bíblico serio, en español",
  description:
    "Biblioteca cristiana digital: texto bíblico, lenguas originales, comentarios, diccionarios y notas del lector, conectados alrededor de cada pasaje. Construcción inicial sobre corpus libre verificado.",
  applicationName: "Biblioteca",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Biblioteca" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/icon-192.png" },
};

export const viewport: Viewport = {
  themeColor: "#12100d",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** Anti-parpadeo: fija tema y tamaño de texto antes del primer paint. */
const temaInit = `try{var t=localStorage.getItem('tema')||(window.matchMedia('(prefers-color-scheme: dark)').matches?'oscuro':'claro');document.documentElement.setAttribute('data-theme',t);var f=localStorage.getItem('tam');if(f)document.documentElement.style.setProperty('--factor-texto',f)}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: temaInit }} />
      </head>
      <body>
        {children}
        <RegistrarSW />
      </body>
    </html>
  );
}
