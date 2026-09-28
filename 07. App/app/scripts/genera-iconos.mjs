/**
 * Íconos de AION a partir del logo (components/LogoAion.tsx) → public/icons/
 *
 * Uso: node scripts/genera-iconos.mjs
 *
 * - aion.svg              favicon vectorial (llama sólida: a 16 px el corazón no se ve)
 * - icon-192/512.png      ícono de app: fondo oscuro, logo completo (llama con corazón)
 * - icon-*-maskable.png   Android adaptable: logo dentro de la zona segura (80 %)
 * - apple-touch-icon.png  iPhone, 180 px (iOS redondea las esquinas solo)
 * - app/favicon.ico       32 px, llama sólida
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'icons');
const src = fs.readFileSync(path.join(ROOT, 'components', 'LogoAion.tsx'), 'utf8');
const LLAMA = src.match(/export const LLAMA =\s*"([^"]+)"/)[1];
const CORAZON = src.match(/export const CORAZON = "([^"]+)"/)[1];

const FONDO = '#12100d';
const ORO = '#c9a45a';
const luces = [0, 1, 2, 3, 4, 5, 6]
  .map((k) => {
    const a = ((-90 + (k * 360) / 7) * Math.PI) / 180;
    return `<circle cx="${(32 * Math.cos(a)).toFixed(2)}" cy="${(32 * Math.sin(a)).toFixed(2)}" r="6.5"/>`;
  })
  .join('');

/** escala = fracción del lienzo que ocupa el logo (su caja es 80×80 unidades). */
function svg({ tam, escala, fondo = true, corazon = true, esquinas = 0 }) {
  const s = (tam * escala) / 80;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tam}" height="${tam}" viewBox="0 0 ${tam} ${tam}">
${fondo ? `<rect width="${tam}" height="${tam}" rx="${esquinas}" fill="${FONDO}"/>` : ''}
<g transform="translate(${tam / 2} ${tam / 2}) scale(${s})" fill="${ORO}">${luces}<path fill-rule="evenodd" d="${corazon ? `${LLAMA} ${CORAZON}` : LLAMA}"/></g>
</svg>`;
}

const png = (nombre, opciones) =>
  sharp(Buffer.from(svg(opciones))).png().toFile(path.join(OUT, nombre)).then(() => console.log('✓', nombre));

fs.writeFileSync(
  path.join(OUT, 'aion.svg'),
  svg({ tam: 64, escala: 0.8, corazon: false, esquinas: 14 })
);
console.log('✓ aion.svg');
await png('icon-192.png', { tam: 192, escala: 0.66 });
await png('icon-512.png', { tam: 512, escala: 0.66 });
await png('icon-192-maskable.png', { tam: 192, escala: 0.52 });
await png('icon-512-maskable.png', { tam: 512, escala: 0.52 });
await png('apple-touch-icon.png', { tam: 180, escala: 0.64 });
// favicon.ico: un PNG de 32 px dentro de un contenedor ICO
const p32 = await sharp(Buffer.from(svg({ tam: 32, escala: 0.86, corazon: false, esquinas: 7 }))).png().toBuffer();
const cab = Buffer.alloc(22);
cab.writeUInt16LE(0, 0); cab.writeUInt16LE(1, 2); cab.writeUInt16LE(1, 4);
cab.writeUInt8(32, 6); cab.writeUInt8(32, 7); cab.writeUInt16LE(1, 10); cab.writeUInt16LE(32, 12);
cab.writeUInt32LE(p32.length, 14); cab.writeUInt32LE(22, 18);
fs.writeFileSync(path.join(ROOT, 'app', 'favicon.ico'), Buffer.concat([cab, p32]));
console.log('✓ app/favicon.ico');
