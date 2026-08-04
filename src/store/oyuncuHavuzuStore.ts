// Kayıtlı oyuncu havuzu: masalardan bağımsız yaşayan kalıcı isim listesi.
// Her değişiklik persist ile anında MMKV'ye yazılır.

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { kimlikUret, mmkvDepo } from './depo';

export interface HavuzOyuncusu {
  id: string;
  ad: string;
  emoji: string;
}

interface HavuzDurumu {
  havuz: HavuzOyuncusu[];

  havuzaEkle: (ad: string, emoji: string) => HavuzOyuncusu;
  havuzdaGuncelle: (id: string, ad: string, emoji: string) => void;
  havuzdanSil: (id: string) => void;
}

export const useOyuncuHavuzuStore = create<HavuzDurumu>()(
  persist(
    (set) => ({
      havuz: [],

      havuzaEkle: (ad, emoji) => {
        const oyuncu: HavuzOyuncusu = { id: kimlikUret(), ad: ad.trim(), emoji };
        set((d) => ({ havuz: [...d.havuz, oyuncu] }));
        return oyuncu;
      },

      havuzdaGuncelle: (id, ad, emoji) =>
        set((d) => ({
          havuz: d.havuz.map((o) => (o.id === id ? { ...o, ad: ad.trim(), emoji } : o)),
        })),

      havuzdanSil: (id) =>
        set((d) => ({ havuz: d.havuz.filter((o) => o.id !== id) })),
    }),
    {
      name: 'king-skor-oyuncu-havuzu',
      storage: createJSONStorage(() => mmkvDepo),
    },
  ),
);
