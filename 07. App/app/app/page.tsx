import { redirect } from "next/navigation";

/** ES es el idioma principal: la raíz redirige a /es. La ruta /en llegará con la misma estructura. */
export default function Raiz() {
  redirect("/es");
}
