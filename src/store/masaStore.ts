// Masa durumu: aktif masa, geçmiş masalar, el ekleme/düzenleme/silme.
// Her değişiklik persist ile anında MMKV'ye yazılır.

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { TOPLAM_EL_SAYISI, UCRETSIZ_MASA_HAKKI } from '@/core/sabitler';
import { kingMi, puanHesapla } from '@/core/skor';
import type { El, Koz, Masa, Oyuncu, OyunTuru } from '@/core/tipler';
import { useAyarStore } from './ayarStore';
import { kimlikUret, mmkvDepo } from './depo';

export interface ElGirdisi {
  tur: OyunTuru;
  koz?: Koz;
  secenOyuncuId: string;
  adetler: Record<string, number>;
}

interface MasaDurumu {
  aktifMasa: Masa | null;
  gecmis: Masa[];
  sonOyuncular: Oyuncu[] | null; // "Aynı ekiple başla" için
  kurulanMasaSayisi: number; // ücretsiz deneme sınırı için ömür boyu sayaç

  masaKur: (oyuncular: [Oyuncu, Oyuncu, Oyuncu, Oyuncu], ad?: string) => void;
  elKaydet: (girdi: ElGirdisi) => El;
  elGuncelle: (elId: string, adetler: Record<string, number>, koz?: Koz) => void;
  elSil: (elId: string) => void;
  sonEliGeriAl: () => void;
  masayiKapat: () => void; // biten masayı geçmişe taşı
  masayiSil: () => void; // aktif masayı tamamen iptal et
  gecmistenSil: (masaId: string) => void;
  tumGecmisiSil: () => void;
  gecmisiIceAktar: (masalar: Masa[]) => void;
}

export const useMasaStore = create<MasaDurumu>()(
  persist(
    (set, get) => ({
      aktifMasa: null,
      gecmis: [],
      sonOyuncular: null,
      kurulanMasaSayisi: 0,

      masaKur: (oyuncular, ad) => {
        // O anki puan tablosu masaya kopyalanır ve kilitlenir
        const puanTablosu = { ...useAyarStore.getState().puanTablosu };
        const masa: Masa = {
          id: kimlikUret(),
          ad: ad?.trim() || undefined,
          oyuncular,
          puanTablosu,
          eller: [],
          baslangic: Date.now(),
        };
        set((d) => ({
          aktifMasa: masa,
          sonOyuncular: oyuncular,
          kurulanMasaSayisi: d.kurulanMasaSayisi + 1,
        }));
      },

      elKaydet: (girdi) => {
        const masa = get().aktifMasa;
        if (!masa) throw new Error('Aktif masa yok');
        const el: El = {
          id: kimlikUret(),
          sira: masa.eller.length + 1,
          secenOyuncuId: girdi.secenOyuncuId,
          tur: girdi.tur,
          koz: girdi.tur === 'KOZ' ? girdi.koz : undefined,
          adetler: { ...girdi.adetler },
          puanlar: puanHesapla(girdi, masa.puanTablosu),
          kingMi: kingMi(girdi),
          olusturmaZamani: Date.now(),
        };
        const eller = [...masa.eller, el];
        const kingdeBiter = useAyarStore.getState().kingdeBiter;
        const bitti = eller.length >= TOPLAM_EL_SAYISI || (kingdeBiter && el.kingMi);
        set({
          aktifMasa: { ...masa, eller, bitis: bitti ? Date.now() : undefined },
        });
        return el;
      },

      elGuncelle: (elId, adetler, koz) => {
        const masa = get().aktifMasa;
        if (!masa) return;
        const eller = masa.eller.map((el) =>
          el.id === elId
            ? {
                ...el,
                koz: el.tur === 'KOZ' ? (koz ?? el.koz) : undefined,
                adetler: { ...adetler },
                puanlar: puanHesapla({ tur: el.tur, adetler }, masa.puanTablosu),
                kingMi: kingMi({ tur: el.tur, adetler }),
              }
            : el,
        );
        set({ aktifMasa: { ...masa, eller } });
      },

      elSil: (elId) => {
        const masa = get().aktifMasa;
        if (!masa) return;
        const eller = masa.eller
          .filter((el) => el.id !== elId)
          .map((el, i) => ({ ...el, sira: i + 1 }));
        set({ aktifMasa: { ...masa, eller, bitis: undefined } });
      },

      sonEliGeriAl: () => {
        const masa = get().aktifMasa;
        if (!masa || masa.eller.length === 0) return;
        set({
          aktifMasa: { ...masa, eller: masa.eller.slice(0, -1), bitis: undefined },
        });
      },

      masayiKapat: () => {
        const masa = get().aktifMasa;
        if (!masa) return;
        const bitmis: Masa = { ...masa, bitis: masa.bitis ?? Date.now() };
        set((d) => ({
          aktifMasa: null,
          gecmis: [bitmis, ...d.gecmis],
        }));
      },

      masayiSil: () => set({ aktifMasa: null }),

      gecmistenSil: (masaId) =>
        set((d) => ({ gecmis: d.gecmis.filter((m) => m.id !== masaId) })),

      tumGecmisiSil: () => set({ gecmis: [] }),

      gecmisiIceAktar: (masalar) =>
        set((d) => {
          // Aynı id'li masaları ezmeden birleştir
          const mevcut = new Set(d.gecmis.map((m) => m.id));
          const yeniler = masalar.filter((m) => !mevcut.has(m.id));
          return { gecmis: [...yeniler, ...d.gecmis] };
        }),
    }),
    {
      name: 'king-skor-masa',
      storage: createJSONStorage(() => mmkvDepo),
    },
  ),
);

/**
 * Yeni masa başlatma hakkı (olay anında çağrılır, render içinde değil).
 * Premium: sınırsız. Ücretsiz: toplam UCRETSIZ_MASA_HAKKI deneme masası;
 * başlamış masa asla kilitlenmez.
 */
export function yeniMasaHakkiVarMi(proMu: boolean): boolean {
  if (proMu) return true;
  return useMasaStore.getState().kurulanMasaSayisi < UCRETSIZ_MASA_HAKKI;
}
