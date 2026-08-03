// Pro durumu. RevenueCat'ten gelen son bilinen entitlement MMKV'de saklanır;
// internet yokken Pro kullanıcı ASLA kilitlenmez.

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvDepo } from './depo';

interface ProDurumu {
  proMu: boolean;
  sonKontrol: number | null; // en son mağaza doğrulama zamanı
  proAyarla: (proMu: boolean) => void;
}

export const useProStore = create<ProDurumu>()(
  persist(
    (set) => ({
      proMu: false,
      sonKontrol: null,
      proAyarla: (proMu) => set({ proMu, sonKontrol: Date.now() }),
    }),
    {
      name: 'king-skor-pro',
      storage: createJSONStorage(() => mmkvDepo),
    },
  ),
);

/** Ekranlarda kullanılacak kısayol hook'u: RevenueCat `pro` entitlement'ı. */
export function usePro(): boolean {
  return useProStore((d) => d.proMu);
}
