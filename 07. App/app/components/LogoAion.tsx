/**
 * Logo de AION: siete luces alrededor de una llama.
 *
 * Siete lámparas y el fuego que las enciende. `completo` lleva la llama con
 * corazón (hueco en forma de gota); en tamaños pequeños ese detalle se pierde,
 * así que por debajo de ~40 px se usa la llama sólida.
 *
 * Las mismas formas se exportan para la intro (components/Intro.tsx) y para el
 * generador de íconos (scripts/genera-iconos.mjs): una sola fuente de verdad.
 */

/** Centros de las siete luces (radio 32, empezando arriba, en sentido horario). */
export const LUCES: Array<[number, number]> = [0, 1, 2, 3, 4, 5, 6].map((k) => {
  const a = (-90 + (k * 360) / 7) * (Math.PI / 180);
  return [+(32 * Math.cos(a)).toFixed(2), +(32 * Math.sin(a)).toFixed(2)];
});
export const R_LUZ = 6.5;

export const LLAMA =
  "M 0 -16 C 3 -9 10 -4 10 5 C 10 12 5.5 16 0 16 C -5.5 16 -10 12 -10 5 C -10 -1 -6 -4 -4.5 -9 C -3 -5 -1 -3 0 -3 C 1.5 -7 1 -12 0 -16 Z";
export const CORAZON = "M 0 2 C 2.5 5 4.5 7.5 4.5 10 C 4.5 12.6 2.5 14 0 14 C -2.5 14 -4.5 12.6 -4.5 10 C -4.5 7.5 -2.5 5 0 2 Z";

export default function LogoAion({
  size = 24,
  completo,
  titulo = "AION",
  className,
}: {
  size?: number;
  completo?: boolean;
  titulo?: string;
  className?: string;
}) {
  const conCorazon = completo ?? size >= 40;
  return (
    <svg
      width={size}
      height={size}
      viewBox="-40 -40 80 80"
      role="img"
      aria-label={titulo}
      className={className}
      fill="currentColor"
    >
      {LUCES.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={R_LUZ} />
      ))}
      <path d={conCorazon ? `${LLAMA} ${CORAZON}` : LLAMA} fillRule="evenodd" />
    </svg>
  );
}
