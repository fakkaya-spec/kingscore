// Premium durumu. RevenueCat'ten gelen son bilinen durum MMKV'de saklanır;
// internet yokken premium kullanıcı asla kilitlenmez.

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvDepo } from './depo';

interface PremiumDurumu {
  premiumMu: boolean;
  sonKontrol: number | null; // en son mağaza doğrulama zamanı
  premiumAyarla: (premiumMu: boolean) => void;
}

export const usePremiumStore = create<PremiumDurumu>()(
  persist(
    (set) => ({
      premiumMu: false,
      sonKontrol: null,
      premiumAyarla: (premiumMu) => set({ premiumMu, sonKontrol: Date.now() }),
    }),
    {
      name: 'king-skor-premium',
      storage: createJSONStorage(() => mmkvDepo),
    },
  ),
);

/** Ekranlarda kullanılacak kısayol hook'u. */
export function usePremium(): boolean {
  return usePremiumStore((d) => d.premiumMu);
}
