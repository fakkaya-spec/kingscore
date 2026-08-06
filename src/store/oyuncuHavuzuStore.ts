// Kayıtlı oyuncu havuzu: masalardan bağımsız yaşayan kalıcı isim listesi.
// Her değişiklik persist ile anında MMKV'ye yazılır.

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { kimlikUret, mmkvDepo } from './depo';

export interface HavuzOyuncusu {
  id: string;
  ad: string;
  emoji?: string; // eski kayıtlarla uyumluluk için duruyor; arayüzde artık kullanılmıyor
  foto?: string; // cihazdaki fotoğraf dosyasının yolu (opsiyonel)
}

interface HavuzDurumu {
  havuz: HavuzOyuncusu[];

  havuzaEkle: (ad: string, foto?: string) => HavuzOyuncusu;
  havuzdaGuncelle: (id: string, ad: string, foto?: string) => void;
  havuzdanSil: (id: string) => void;
}

export const useOyuncuHavuzuStore = create<HavuzDurumu>()(
  persist(
    (set) => ({
      havuz: [],

      havuzaEkle: (ad, foto) => {
        const oyuncu: HavuzOyuncusu = { id: kimlikUret(), ad: ad.trim(), foto };
        set((d) => ({ havuz: [...d.havuz, oyuncu] }));
        return oyuncu;
      },

      havuzdaGuncelle: (id, ad, foto) =>
        set((d) => ({
          havuz: d.havuz.map((o) => (o.id === id ? { ...o, ad: ad.trim(), foto } : o)),
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
