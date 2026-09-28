"""Sonido de la intro de AION → public/intro/aion.wav

Uso: python scripts/intro-sonido.py

Compuesto en SEGUNDOS, sincronizado con la animación de components/Intro.tsx:
  0,40 s  la llama se enciende      → nace un pad cálido (Re) muy suave
  1,60 s  + i·0,12  llega la luz i   → una celesta por luz, pentatónica ascendente
  2,45 s  aparece el nombre          → el acorde se abre (coro muy bajo)
  ~4,2 s  fin, con cola de reverberación

Motor: score.py de 1-Altrium (mido → FluidSynth), banco GeneralUser GS
(licencia libre, uso comercial permitido). Salida mono 24 kHz, normalizada y
con fundido: ~200 KB, se descarga sólo cuando se muestra la intro.
"""
import os, sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import resample_poly

TOOLS = r'C:\Users\TRADING\Desktop\ProyectosWEB\1-Altrium\video\tools'
sys.path.insert(0, TOOLS)
from score import Score, render, SF_GM  # noqa: E402

AQUI = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.join(AQUI, '..', 'public', 'intro')
os.makedirs(SALIDA, exist_ok=True)
MID = os.path.join(SALIDA, '_aion.mid')
WAV_BRUTO = os.path.join(SALIDA, '_aion_bruto.wav')

s = Score()
PAD, CELESTA, CORO = 0, 1, 2
s.program(PAD, 89)       # Pad 2 (warm)
s.program(CELESTA, 8)    # Celesta
s.program(CORO, 52)      # Choir Aahs

# la llama: pad en Re que crece despacio
s.cc(PAD, 7, 0, 0)
s.ramp(PAD, 7, 0, 92, 0.40, 1.60)
s.chord(PAD, [50, 57, 62], 0.40, 3.6, vel=62)
s.ramp(PAD, 7, 92, 0, 3.4, 4.3)

# las siete luces: pentatónica de Re ascendente, cada una al llegar
LUCES = [74, 76, 78, 81, 83, 86, 88]
for i, n in enumerate(LUCES):
    s.note(CELESTA, n, 1.60 + i * 0.12, 1.4, vel=58 + i * 3)

# el nombre: el acorde se abre (Re add9)
s.cc(CORO, 7, 0, 0)
s.ramp(CORO, 7, 0, 55, 2.45, 3.0)
s.chord(CORO, [62, 66, 69, 76], 2.45, 1.7, vel=50, roll=0.04)
s.ramp(CORO, 7, 55, 0, 3.4, 4.2)

s.save(MID)
render(MID, WAV_BRUTO, SF_GM, gain=0.5, reverb=True)

sr, x = wavfile.read(WAV_BRUTO)
x = x.astype(np.float32)
if x.ndim == 2:
    x = x.mean(axis=1)
x = resample_poly(x, 1, 2)  # 48 kHz → 24 kHz
sr = 24000
x = x[: int(sr * 4.6)]
fin = int(sr * 0.8)
x[-fin:] *= np.linspace(1, 0, fin) ** 2
x /= max(1e-9, np.abs(x).max())
x *= 0.8
wavfile.write(os.path.join(SALIDA, 'aion.wav'), sr, (x * 32767).astype(np.int16))
os.remove(MID); os.remove(WAV_BRUTO)
print('ok', os.path.getsize(os.path.join(SALIDA, 'aion.wav')) // 1024, 'KB')
