// Ses efektleri (expo-audio). Ayarlardan kapatılabilir; hata olursa sessizce geçer.
// Not: Şartnamede expo-av istendi ancak SDK 57'de kaldırıldığı için resmi halefi
// expo-audio kullanıldı (bkz. README).

import { createAudioPlayer } from 'expo-audio';
import { useAyarStore } from '@/store/ayarStore';

export type SesAdi = 'zafer' | 'kayip' | 'kart' | 'king' | 'rifki';

const KAYNAKLAR: Record<SesAdi, number> = {
  zafer: require('../../assets/sesler/zafer.wav'),
  kayip: require('../../assets/sesler/kayip.wav'),
  kart: require('../../assets/sesler/kart.wav'),
  king: require('../../assets/sesler/king.wav'),
  rifki: require('../../assets/sesler/rifki.wav'),
};

export function sesCal(ad: SesAdi): void {
  if (!useAyarStore.getState().sesler) return;
  try {
    const calar = createAudioPlayer(KAYNAKLAR[ad]);
    calar.play();
    // Kısa efektler bittikten sonra kaynağı bırak
    setTimeout(() => {
      try {
        calar.remove();
      } catch {
        // zaten bırakılmış olabilir
      }
    }, 3000);
  } catch {
    // ses çalınamazsa oyun akışı etkilenmez
  }
}
