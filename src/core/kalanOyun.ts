// Masadaki her oyun türünün kaç kez daha oynanabileceğini hesaplar — saf fonksiyon.

import { CEZA_MASA_LIMITI, KOZ_HAKKI } from './sabitler';
import type { Masa, OyunTuru } from './tipler';

export interface KalanOyunSatiri {
  tur: OyunTuru;
  kalan: number;
}

/** Özet satırındaki sabit gösterim sırası. */
export const OZET_SIRASI: OyunTuru[] = [
  'KOZ',
  'EL_ALMAZ',
  'ERKEK_ALMAZ',
  'KIZ_ALMAZ',
  'KUPA_ALMAZ',
  'RIFKI',
  'SON_IKI',
];

/**
 * Her oyun türü için masada kalan oynanma sayısı.
 * Koz kapasitesi 4 oyuncu × koz hakkı; her ceza türü masa limitine tabidir.
 */
export function kalanOyunOzeti(masa: Pick<Masa, 'eller'>): KalanOyunSatiri[] {
  const oynanan: Partial<Record<OyunTuru, number>> = {};
  for (const el of masa.eller) {
    oynanan[el.tur] = (oynanan[el.tur] ?? 0) + 1;
  }
  return OZET_SIRASI.map((tur) => {
    const kapasite = tur === 'KOZ' ? 4 * KOZ_HAKKI : CEZA_MASA_LIMITI;
    return { tur, kalan: Math.max(0, kapasite - (oynanan[tur] ?? 0)) };
  });
}
