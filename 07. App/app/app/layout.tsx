import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegistrarSW from "@/components/RegistrarSW";
import Intro from "@/components/Intro";

export const metadata: Metadata = {
  title: "Biblia de Estudio AION — estudio bíblico serio, en español",
  description:
    "Biblia de Estudio AION: texto bíblico, lenguas originales, comentarios, diccionarios y notas del lector, conectados alrededor de cada pasaje. Construcción inicial sobre corpus libre verificado.",
  applicationName: "Biblia de Estudio AION",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "AION" },
  icons: {
    icon: [{ url: "/icons/aion.svg", type: "image/svg+xml" }, { url: "/icons/icon-192.png", sizes: "192x192" }],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#12100d",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** Anti-parpadeo: fija tema y tamaño de texto antes del primer paint, y oculta la intro si ya se vio en esta sesión. */
const temaInit = `try{var t=localStorage.getItem('tema')||(window.matchMedia('(prefers-color-scheme: dark)').matches?'oscuro':'claro');document.documentElement.setAttribute('data-theme',t);var f=localStorage.getItem('tam');if(f)document.documentElement.style.setProperty('--factor-texto',f)}catch(e){}try{if(sessionStorage.getItem('aion-intro'))document.documentElement.classList.add('sin-intro')}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: temaInit }} />
      </head>
      <body>
        <Intro />
        {children}
        <RegistrarSW />
      </body>
    </html>
  );
}
