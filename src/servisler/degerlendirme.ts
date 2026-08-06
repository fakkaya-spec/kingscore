// App Store puan penceresi: Apple'ın resmi StoreReview API'si.
// Kurallar gereği koşulsuz ve nadir gösterilir — kullanıcı en az ikinci
// masasını bitirdiğinde, yalnızca bir kez istenir (iOS zaten yılda 3 ile sınırlar).

import * as StoreReview from 'expo-store-review';
import { useAyarStore } from '@/store/ayarStore';

export async function belkiDegerlendirmeIste(bitenMasaSayisi: number): Promise<void> {
  const { degerlendirmeIstendi, degerlendirmeIstendiIsaretle } = useAyarStore.getState();
  if (degerlendirmeIstendi || bitenMasaSayisi < 2) return;
  try {
    if (await StoreReview.hasAction()) {
      degerlendirmeIstendiIsaretle();
      await StoreReview.requestReview();
    }
  } catch {
    // pencere açılamazsa sessizce geç; oyun akışı etkilenmez
  }
}
