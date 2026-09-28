/**
 * Búsqueda de pasajes en el propio dispositivo (paso 1 del buscador).
 *
 * «la mujer estaba vestida de escarlata» → Ap 17:4, sin servidor y sin coste:
 * el índice (public/data/busqueda/{obra}.json) se descarga una vez y se busca
 * en memoria. 31.000 versos se recorren en milisegundos.
 *
 * Criterios, en orden de peso:
 *   1. Si la consulta ES una referencia («Ap 17:4», «Juan 3:16»), se va directo.
 *   2. Frase exacta dentro del verso (normalizada): la señal más fuerte.
 *   3. Palabras de la consulta presentes como palabra completa.
 *   4. Presentes como prefijo («vestid» → «vestida»), con menos peso.
 *   5. Proximidad: las palabras aparecen cerca y en el mismo orden.
 *
 * Normalización: sin tildes ni diéresis, minúsculas, sin puntuación. La RV1909
 * escribe «á» y «fué»: sin esto, «a todo hombre» no encontraría «á todo hombre».
 *
 * El paso 2 (Jev reordenando los candidatos para búsquedas por idea) se apoya
 * en esta lista: Jev elige entre como mucho 255 opciones, no recorre la Biblia.
 */

export type Resultado = { ref: string; osis: string; c: number; v: number; texto: string; puntos: number };
type Verso = { ref: string; osis: string; c: number; v: number; texto: string; norm: string; palabras: string[] };

const cacheIndices = new Map<string, Verso[]>();

export const normaliza = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Palabras vacías: no cuentan como coincidencia salvo que la consulta sea sólo eso. */
const VACIAS = new Set(
  "a al el la los las lo un una unos unas de del y e o u que en por para con sin se su sus mi mis tu tus le les me te nos os es era fue fuera ser muy mas pero como cuando donde porque pues si no ya asi este esta estos estas ese esa aquel aquella cual cuales quien".split(" ")
);

export async function cargaIndice(obra: string): Promise<Verso[]> {
  const enCache = cacheIndices.get(obra);
  if (enCache) return enCache;
  const r = await fetch(`/data/busqueda/${obra}.json`);
  if (!r.ok) throw new Error(`índice de búsqueda no disponible: ${obra}`);
  const j = (await r.json()) as { v: string[] };
  const versos: Verso[] = j.v.map((linea) => {
    const i = linea.indexOf("|");
    const ref = linea.slice(0, i);
    const texto = linea.slice(i + 1);
    const [osis, c, v] = ref.split(".");
    const norm = normaliza(texto);
    return { ref, osis, c: Number(c), v: Number(v), texto, norm, palabras: norm.split(" ") };
  });
  cacheIndices.set(obra, versos);
  return versos;
}

/**
 * Equivalencias que cruzan versiones: la RV1909 escribe «Jehová» donde las
 * modernas y el lector escriben «Señor». Sin esto, «el Señor es mi pastor» no
 * encontraba el Salmo 23 en la RV1909.
 */
const EQUIVALENTES: Record<string, string> = { senor: "jehova", jehova: "senor" };

export function busca(versos: Verso[], consulta: string, max = 40): Resultado[] {
  const q = normaliza(consulta);
  if (q.length < 2) return [];
  const todos = q.split(" ");
  const utiles = todos.filter((t) => !VACIAS.has(t));
  const terminos = utiles.length ? utiles : todos;
  // con muchas palabras se exige la mayoría, no todas: el lector cita de memoria
  const minimo = terminos.length <= 2 ? terminos.length : Math.ceil(terminos.length * 0.6);

  const salida: Resultado[] = [];
  for (const ver of versos) {
    let aciertos = 0;
    let puntos = 0;
    const posiciones: number[] = [];
    for (const t of terminos) {
      let pos = ver.palabras.indexOf(t);
      if (pos === -1 && EQUIVALENTES[t]) pos = ver.palabras.indexOf(EQUIVALENTES[t]);
      if (pos !== -1) {
        puntos += 3;
      } else if (t.length >= 4) {
        pos = ver.palabras.findIndex((p) => p.startsWith(t));
        if (pos !== -1) puntos += 2;
      }
      if (pos !== -1) {
        aciertos++;
        posiciones.push(pos);
      }
    }
    if (aciertos < minimo) continue;
    // frase exacta: la señal más fuerte
    if (q.length >= 8 && ver.norm.includes(q)) puntos += 12;
    // proximidad y orden: palabras juntas y en el mismo orden que la consulta
    if (posiciones.length > 1) {
      const orden = posiciones.every((p, i) => i === 0 || p > posiciones[i - 1]);
      const tramo = Math.max(...posiciones) - Math.min(...posiciones);
      if (orden) puntos += 2;
      puntos += Math.max(0, 4 - tramo / terminos.length);
    }
    // a igualdad, el verso corto es el más específico
    puntos -= ver.palabras.length / 200;
    salida.push({ ref: ver.ref, osis: ver.osis, c: ver.c, v: ver.v, texto: ver.texto, puntos });
  }
  salida.sort((a, b) => b.puntos - a.puntos);
  return salida.slice(0, max);
}

/* — Paso 3 del buscador: comentarios y recursos —
   Índices `public/data/busqueda/com-{obra}.json` con líneas «ref|obra|texto»,
   generados por `scripts/genera-busqueda.mjs`. Carga perezosa por obra y
   búsqueda con el mismo motor de pasajes (normalización sin tildes, prefijos,
   proximidad). Los nombres de obra en el índice llevan sufijo -es: es la obra
   traducida la que se busca. */

export type VersoCom = Verso & { obra: string };

export async function cargaComentarios(obra: string): Promise<VersoCom[]> {
  const enCache = cacheIndices.get("com:" + obra);
  if (enCache) return enCache as VersoCom[];
  const mf = await (await fetch(`/data/busqueda/com-${obra}.json`)).json() as { trozos: number };
  const versos: VersoCom[] = [];
  for (let i = 1; i <= mf.trozos; i++) {
    const rr = await fetch(`/data/busqueda/com-${obra}-${String(i).padStart(2, "0")}.json`);
    if (!rr.ok) throw new Error(`trozo de comentarios no disponible: ${obra} ${i}`);
    const j = (await rr.json()) as { v: string[] };
    for (const linea of j.v) {
    const p1 = linea.indexOf("|");
    const p2 = linea.indexOf("|", p1 + 1);
    const ref = linea.slice(0, p1);
    const obraId = linea.slice(p1 + 1, p2);
    const texto = linea.slice(p2 + 1);
    const [osis, c, v] = ref.split(".");
      const norm = normaliza(texto);
      versos.push({ ref, osis, c: Number(c), v: Number(v), texto, norm, palabras: norm.split(" "), obra: obraId });
    }
  }
  cacheIndices.set("com:" + obra, versos as Verso[]);
  return versos;
}

export function buscaComentarios(versos: VersoCom[], consulta: string, max = 30): Array<Resultado & { obra: string }> {
  const mapa = new Map(versos.map((v) => [v.ref, v.obra]));
  return busca(versos, consulta, max).map((r) => ({ ...r, obra: mapa.get(r.ref) ?? "" }));
}

/** Fragmento con contexto alrededor de la primera coincidencia (el índice trae el párrafo entero). */
export function contexto(texto: string, consulta: string, radio = 110): string {
  const q = normaliza(consulta).split(" ").filter((t) => t.length >= 3);
  const norm = normaliza(texto);
  let pos = -1;
  for (const t of q) {
    pos = norm.indexOf(t);
    if (pos !== -1) break;
  }
  if (pos === -1) return texto.slice(0, radio * 2) + (texto.length > radio * 2 ? "…" : "");
  const desde = Math.max(0, pos - radio);
  const hasta = Math.min(texto.length, pos + radio);
  return (desde > 0 ? "… " : "") + texto.slice(desde, hasta).trim() + (hasta < texto.length ? " …" : "");
}

/** Tramos del texto a resaltar: las palabras (o prefijos) de la consulta. */
export function tramosResaltados(texto: string, consulta: string): Array<{ t: string; marca: boolean }> {
  const terminos = normaliza(consulta).split(" ").filter((t) => t && !VACIAS.has(t));
  if (!terminos.length) return [{ t: texto, marca: false }];
  return texto.split(/(\s+)/).map((pal) => {
    const n = normaliza(pal);
    return { t: pal, marca: !!n && terminos.some((t) => n === t || (t.length >= 4 && n.startsWith(t))) };
  });
}

/**
 * Busca en VARIAS versiones y fusiona por referencia (se queda con la mejor
 * puntuación de cada versículo). Cada versión cubre lo que a la otra le falta:
 * «vanidad de vanidades» sólo está en la RV1909; «el Señor es mi pastor», en la
 * VBL. El texto mostrado es el de la versión preferida si la tiene.
 */
export function buscaEnVarias(indices: Array<{ obra: string; versos: Verso[] }>, consulta: string, preferida: string, max = 40): Resultado[] {
  const mejor = new Map<string, Resultado & { obra: string }>();
  for (const { obra, versos } of indices) {
    for (const r of busca(versos, consulta, max * 2)) {
      const previo = mejor.get(r.ref);
      if (!previo || r.puntos > previo.puntos) mejor.set(r.ref, { ...r, obra });
    }
  }
  const orden = [...mejor.values()].sort((a, b) => b.puntos - a.puntos).slice(0, max);
  const pref = indices.find((i) => i.obra === preferida);
  if (!pref) return orden;
  const porRef = new Map(pref.versos.map((v) => [v.ref, v.texto]));
  return orden.map((r) => ({ ...r, texto: porRef.get(r.ref) ?? r.texto }));
}

/**
 * Paso 2: Jev reordena por SENTIDO los mejores candidatos locales
 * (functions/api/busca-ia.ts). Devuelve la lista reordenada con la
 * probabilidad de Jev en `ia`; los que no se enviaron quedan detrás.
 */
export async function ordenaConIA(consulta: string, res: Resultado[], n = 20): Promise<Array<Resultado & { ia?: number }>> {
  const envio = res.slice(0, n);
  const r = await fetch("/api/busca-ia", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ consulta, candidatos: envio.map((x) => ({ ref: x.ref, texto: x.texto })) }),
  });
  if (!r.ok) throw new Error(r.status === 429 ? "Demasiadas búsquedas: espera un minuto." : "La IA no está disponible ahora.");
  const { orden } = (await r.json()) as { orden: Array<{ ref: string; p: number }> };
  const porRef = new Map(envio.map((x) => [x.ref, x]));
  const arriba = orden.filter((o) => porRef.has(o.ref)).map((o) => ({ ...porRef.get(o.ref)!, ia: o.p }));
  return [...arriba, ...res.slice(n)];
}
