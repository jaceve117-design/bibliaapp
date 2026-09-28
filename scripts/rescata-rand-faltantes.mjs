/**
 * Rescate de entradas que la limpieza automática perdió por ruido del OCR.
 * Añade a rand.json (EN) y rand-es.json (ES) las entradas conocidas que faltan,
 * con su texto reconstruido del OCR (Aaron es la más importante: primer
 * personaje del diccionario y muy citada).
 *
 * Uso: node scripts/rescata-rand-faltantes.mjs
 */
import fs from "node:fs";

const RUTA_EN = "07. App/app/public/data/rand/rand.json";
const RUTA_ES = "07. App/app/public/data/rand-es/rand-es.json";

const en = JSON.parse(fs.readFileSync(RUTA_EN, "utf8"));
const es = JSON.parse(fs.readFileSync(RUTA_ES, "utf8"));

const RESCATE = [
  {
    s: "aaron",
    nEn: "Aaron",
    nEs: "Aarón",
    dEs: "Hijo de Amram y de Joquebed, de la tribu de Leví, y hermano de Moisés y de María, Éx. 6:20; nació por el año A. M. 2430; A. C. 1574. Era tres años mayor que Moisés, Éx. 7:7; y fue el portavoz y ayudante de éste en la salida de Israel de Egipto, Éx. 4:16. Su esposa fue Eliseba, hija de Amminadab; y sus hijos, Nadab, Abiú, Eleazar e Itamar. Tenía 83 años cuando Dios lo llamó a reunirse con Moisés en el desierto cerca de Horeb. Cooperando con su hermano en el éxodo de Egipto, Éx. 4-16, sostuvo sus manos en la batalla con Amalec, Éx. 17; y subió al monte Sinaí con él para ver la gloria de Dios, Éx. 24:1, 2, 9-11. La principal distinción de Aarón consistió en la elección de él y de su posteridad masculina para el sacerdocio. Fue consagrado primer sumo sacerdote por dirección de Dios, Éx. 28, 29; Lev. 8; y fue después confirmado en su oficio por la destrucción de Coré y su compañía, por el cese de la plaga a su intercesión, y por la vara florecida, Núm. 16, 17. Fue fiel y abnegado en los deberes de su oficio, y con mansedumbre «guardó silencio» cuando sus hijos Nadab y Abiú fueron muertos, Lev. 10:1-3. Sin embargo cayó a veces en pecados graves: hizo el becerro de oro en Sinaí, Éx. 32; se unió a María en sedición contra Moisés, Núm. 12; y con Moisés desobedeció a Dios en Cades, Núm. 20:8-12. Dios, por tanto, no le permitió entrar en la tierra prometida; sino que murió en el monte Hor, en Edom, en el año cuarenta después de salir de Egipto, a la edad de unos 123 años, Núm. 20:22-29; 33:39. En su oficio de sumo sacerdote, Aarón fue un tipo eminente de Cristo, siendo «llamado de Dios» y ungido; llevando los nombres de las tribus sobre su pecho; comunicando la voluntad de Dios por Urim y Tumim; entrando en el Lugar Santísimo el Día de la Expiación, «no sin sangre»; e intercediendo por el pueblo de Dios y bendiciéndolo. Véase SACERDOTE.",
  },
  {
    s: "abel",
    nEn: "Abel",
    nEs: "Abel",
    dEs: "El segundo hijo de Adán y Eva. Se hizo pastor, y ofreció a Dios un sacrificio de sus rebaños, al mismo tiempo que Caín su hermano ofrecía de los frutos de la tierra. Dios tuvo respeto al sacrificio de Abel, y no al de Caín; de ahí que Caín en su ira matara a Abel, Gn. 4. Fue «por fe» que Abel ofreció un sacrificio más aceptable que Caín; esto es, su corazón estaba recto hacia Dios, y lo adoraba en obediencia confiada a las direcciones divinas. Su ofrenda, hecha por el derramamiento de sangre, era la de un pecador penitente que confiaba en la expiación ordenada por Dios; y fue aceptada, «Dios dando testimonio de sus ofrendas», probablemente por fuego del cielo; «por la cual alcanzó testimonio de que era justo», esto es, justificado, Heb. 11:4. «La sangre de Abel» clamaba desde la tierra pidiendo venganza, Gn. 4:10; pero la sangre de Cristo reclama perdón y salvación para su pueblo, Heb. 12:24; 1 Jn. 1:7.",
  },
];

let añadidasEn = 0, añadidasEs = 0;
for (const r of RESCATE) {
  if (!en.entradas.some((e) => e.s === r.s)) {
    en.entradas.push({ s: r.s, n: r.nEn, d: "(Ver la entrada reconstruida en rand-es; OCR de 1859 dañado en esta entrada.)" });
    añadidasEn++;
  }
  if (!es.entradas.some((e) => e.s === r.s)) {
    es.entradas.push({ s: r.s, n: r.nEs, d: r.dEs });
    añadidasEs++;
  }
}
en.total = en.entradas.length;
es.total = es.entradas.length;
fs.writeFileSync(RUTA_EN, JSON.stringify(en));
fs.writeFileSync(RUTA_ES, JSON.stringify(es));
console.log(`EN +${añadidasEn} · ES +${añadidasEs} (total ES: ${es.entradas.length})`);
