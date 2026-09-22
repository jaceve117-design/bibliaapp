// Parche: añade los códigos morfológicos griegos usados en el texto (tagnt) que faltaban
// en el mapa ES. Detectado por la batería de validación del punto de recuperación 2026-09-21
// (cobertura 1080/1141). Vocabulario y convenciones del propio archivo:
//   D (voz) = "voz deponente media" (cf. V-2ADI), N = "voz deponente media o pasiva" (cf. V-RNI),
//   AO = "voz deponente pasiva" (cf. V-AOI), -C = comparativo (cf. A-ASN-C),
//   -S = superlativo (cf. A-ASM-S), -L = topónimo (cf. N-NSM-L), -ARAM = (arameo) (cf. ficha hebrea).
import fs from "node:fs";

const ruta = new URL("../public/data/morfologia/codigos-griego-es.json", import.meta.url);
const j = JSON.parse(fs.readFileSync(ruta, "utf8"));

const nuevos = {
  "V-PMP-DPM": "verbo presente voz media participio dativo plural masculino",
  "V-PEP-DPM": "verbo presente voz media o pasiva participio dativo plural masculino",
  "V-RAS-1P": "verbo perfecto voz activa subjuntivo 1a persona plural",
  "V-RAS-1S": "verbo perfecto voz activa subjuntivo 1a persona singular",
  "V-RAS-2S": "verbo perfecto voz activa subjuntivo 2a persona singular",
  "V-AOI-1S": "verbo aoristo voz deponente pasiva indicativo 1a persona singular",
  "V-2ADM-3S": "verbo segundo aoristo voz deponente media imperativo 3a persona singular",
  "V-2ADM-2S": "verbo segundo aoristo voz deponente media imperativo 2a persona singular",
  "V-2ADS-1S": "verbo segundo aoristo voz deponente media subjuntivo 1a persona singular",
  "V-2ADS-1P": "verbo segundo aoristo voz deponente media subjuntivo 1a persona plural",
  "V-AMM-3S": "verbo aoristo voz media imperativo 3a persona singular",
  "V-PMM-3S": "verbo presente voz media imperativo 3a persona singular",
  "V-PMM-3P": "verbo presente voz media imperativo 3a persona plural",
  "V-IPI-2P": "verbo imperfecto voz pasiva indicativo 2a persona plural",
  "V-IMI-2P": "verbo imperfecto voz media indicativo 2a persona plural",
  "A-ASN-S": "adjetivo acusativo singular neutro superlativo",
  "A-NPN-S": "adjetivo nominativo plural neutro superlativo",
  "V-PPM-3P": "verbo presente voz pasiva imperativo 3a persona plural",
  "V-PPS-1S": "verbo presente voz pasiva subjuntivo 1a persona singular",
  "N-NSM-ARAM": "sustantivo nominativo singular masculino (arameo)",
  "S-1PNSF": "pronombre posesivo 1a persona plural nominativo singular femenino",
  "S-1PGPF": "pronombre posesivo 1a persona plural genitivo plural femenino",
  "S-1PDPM": "pronombre posesivo 1a persona plural dativo plural masculino",
  "V-RNI-1P": "verbo perfecto voz deponente media o pasiva indicativo 1a persona plural",
  "V-PMS-1P": "verbo presente voz media subjuntivo 1a persona plural",
  "V-PMS-2S": "verbo presente voz media subjuntivo 2a persona singular",
  "F-2APN": "pronombre reflexivo 2a persona acusativo plural neutro",
  "V-PMP-GSN": "verbo presente voz media participio genitivo singular neutro",
  "V-PMP-GSF": "verbo presente voz media participio genitivo singular femenino",
  "V-AMP-GPM": "verbo aoristo voz media participio genitivo plural masculino",
  "V-AMP-NSF": "verbo aoristo voz media participio nominativo singular femenino",
  "V-2APP-DSN": "verbo segundo aoristo voz pasiva participio dativo singular neutro",
  "V-2APP-GPM": "verbo segundo aoristo voz pasiva participio genitivo plural masculino",
  "V-2APP-ASM": "verbo segundo aoristo voz pasiva participio acusativo singular masculino",
  "A-DSN-C": "adjetivo dativo singular neutro comparativo",
  "A-VPM-C": "adjetivo vocativo plural masculino comparativo",
  "A-GPM-C": "adjetivo genitivo plural masculino comparativo",
  "A-DSF-C": "adjetivo dativo singular femenino comparativo",
  "V-PAO-2P": "verbo presente voz activa optativo 2a persona plural",
  "V-AAP-DPN": "verbo aoristo voz activa participio dativo plural neutro",
  "V-RNN": "verbo perfecto voz deponente media o pasiva infinitivo",
  "V-RNP-APM": "verbo perfecto voz deponente media o pasiva participio acusativo plural masculino",
  "V-RNP-ASF": "verbo perfecto voz deponente media o pasiva participio acusativo singular femenino",
  "V-RNP-NPM": "verbo perfecto voz deponente media o pasiva participio nominativo plural masculino",
  "V-PNP-DSF": "verbo presente voz deponente media o pasiva participio dativo singular femenino",
  "V-ANP-NSN": "verbo aoristo voz deponente media o pasiva participio nominativo singular neutro",
  "N-DPM-C": "sustantivo dativo plural masculino comparativo",
  "N-DSM-C": "sustantivo dativo singular masculino comparativo",
  "N-APF-C": "sustantivo acusativo plural femenino comparativo",
  "V-POP-NPM": "verbo presente voz pasiva optativo nominativo plural masculino",
  "I-GPN": "pronombre interrogativo genitivo plural neutro",
  "V-RDI-3S": "verbo perfecto voz deponente media indicativo 3a persona singular",
  "V-2RAP-NSF": "verbo segundo perfecto voz activa participio nominativo singular femenino",
  "K-NPF": "pronombre correlativo nominativo plural femenino",
  "A-GPM-L": "adjetivo genitivo plural masculino topónimo",
  "V-2RPP-GSF": "verbo segundo perfecto voz pasiva participio genitivo singular femenino",
  "V-2AMI-1P": "verbo segundo aoristo voz media indicativo 1a persona plural",
  "Q-ASF": "pronombre correlativo o interrogativo acusativo singular femenino",
  "V-2APS-1P": "verbo segundo aoristo voz pasiva subjuntivo 1a persona plural",
  "V-RMP-GSF": "verbo perfecto voz media participio genitivo singular femenino",
  "V-PDP-NPM": "verbo presente voz deponente media participio nominativo plural masculino",
  "X-NPN": "pronombre indefinido nominativo plural neutro",
  "V-AOO-3S": "verbo aoristo voz deponente pasiva optativo 3a persona singular",
};

let anadidos = 0, duplicados = 0;
for (const [k, v] of Object.entries(nuevos)) {
  if (j.codigos[k]) { duplicados++; continue; }
  j.codigos[k] = v;
  anadidos++;
}
j._meta.codigos = Object.keys(j.codigos).length;
j._meta.fecha = "2026-09-21";

fs.writeFileSync(ruta, JSON.stringify(j, null, 1) + "\n", "utf8");
console.log(`añadidos: ${anadidos} | ya existían: ${duplicados} | total: ${j._meta.codigos}`);
