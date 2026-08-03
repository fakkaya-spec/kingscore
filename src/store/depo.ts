// MMKV tabanlı kalıcı depolama. Her yazma anında diske iner (çökme güvenliği).

import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

export const mmkv = createMMKV({ id: 'king-skor' });

/** zustand persist middleware'inin beklediği StateStorage arayüzü. */
export const mmkvDepo: StateStorage = {
  getItem: (ad) => mmkv.getString(ad) ?? null,
  setItem: (ad, deger) => {
    mmkv.set(ad, deger);
  },
  removeItem: (ad) => {
    mmkv.remove(ad);
  },
};

/** Basit benzersiz kimlik üretici (sunucu yok, çakışma riski pratikte sıfır). */
export function kimlikUret(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
