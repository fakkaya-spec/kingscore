// Uygulama ayarları: sesler, animasyonlar, King kuralı, düzenlenebilir puan tablosu, tema.

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { VARSAYILAN_PUAN_TABLOSU } from '@/core/sabitler';
import type { PuanTablosu } from '@/core/tipler';
import { mmkvDepo } from './depo';

export type Tema = 'cuha' | 'ahsap' | 'gece' | 'yaz';
export type MasaGorunumu = 'genel' | 'detayli';

interface AyarDurumu {
  sesler: boolean;
  animasyonlar: boolean;
  kingdeBiter: boolean; // King yapılınca oyun biter (varsayılan açık)
  tema: Tema;
  masaGorunumu: MasaGorunumu; // masa ekranındaki Genel/Detaylı sekmesi
  puanTablosu: PuanTablosu; // yeni masalara kopyalanacak taslak

  seslerAc: (acik: boolean) => void;
  animasyonlarAc: (acik: boolean) => void;
  kingdeBiterAc: (acik: boolean) => void;
  temaSec: (tema: Tema) => void;
  masaGorunumuSec: (gorunum: MasaGorunumu) => void;
  puanGuncelle: (alan: keyof PuanTablosu, deger: number) => void;
  varsayilanaDon: () => void;
}

export const useAyarStore = create<AyarDurumu>()(
  persist(
    (set) => ({
      sesler: true,
      animasyonlar: true,
      kingdeBiter: true,
      tema: 'yaz',
      masaGorunumu: 'detayli',
      puanTablosu: { ...VARSAYILAN_PUAN_TABLOSU },

      seslerAc: (acik) => set({ sesler: acik }),
      animasyonlarAc: (acik) => set({ animasyonlar: acik }),
      kingdeBiterAc: (acik) => set({ kingdeBiter: acik }),
      temaSec: (tema) => set({ tema }),
      masaGorunumuSec: (gorunum) => set({ masaGorunumu: gorunum }),
      puanGuncelle: (alan, deger) =>
        set((d) => ({ puanTablosu: { ...d.puanTablosu, [alan]: deger } })),
      varsayilanaDon: () => set({ puanTablosu: { ...VARSAYILAN_PUAN_TABLOSU } }),
    }),
    {
      name: 'king-skor-ayarlar',
      storage: createJSONStorage(() => mmkvDepo),
    },
  ),
);
