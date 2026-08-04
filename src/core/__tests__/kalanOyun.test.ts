// Kalan oyun özeti testleri: boş masa, kısmi oynanmış masa ve tükenen türler.

import { kalanOyunOzeti, OZET_SIRASI } from '../kalanOyun';
import type { El, OyunTuru } from '../tipler';

function elYap(tur: OyunTuru, sira: number): El {
  return {
    id: `el${sira}`,
    sira,
    secenOyuncuId: 'o1',
    tur,
    adetler: {},
    puanlar: {},
    kingMi: false,
    olusturmaZamani: 0,
  };
}

function ellerYap(turler: OyunTuru[]): { eller: El[] } {
  return { eller: turler.map((tur, i) => elYap(tur, i + 1)) };
}

describe('kalanOyunOzeti', () => {
  it('boş masada tüm kapasiteleri döner: koz 8, her ceza 2', () => {
    const ozet = kalanOyunOzeti(ellerYap([]));
    expect(ozet.map((s) => s.tur)).toEqual(OZET_SIRASI);
    expect(ozet.find((s) => s.tur === 'KOZ')?.kalan).toBe(8);
    for (const satir of ozet) {
      if (satir.tur !== 'KOZ') expect(satir.kalan).toBe(2);
    }
    // Kalan oyun sayılarının toplamı masadaki toplam el sayısına eşit olmalı
    expect(ozet.reduce((t, s) => t + s.kalan, 0)).toBe(20);
  });

  it('oynanan eller kalan sayıları düşürür', () => {
    const ozet = kalanOyunOzeti(
      ellerYap(['KOZ', 'KOZ', 'KOZ', 'EL_ALMAZ', 'RIFKI', 'KUPA_ALMAZ', 'KUPA_ALMAZ']),
    );
    const kalanlar = Object.fromEntries(ozet.map((s) => [s.tur, s.kalan]));
    expect(kalanlar).toEqual({
      KOZ: 5,
      EL_ALMAZ: 1,
      ERKEK_ALMAZ: 2,
      KIZ_ALMAZ: 2,
      KUPA_ALMAZ: 0,
      RIFKI: 1,
      SON_IKI: 2,
    });
  });

  it('tükenmiş türde sıfırın altına inmez', () => {
    const ozet = kalanOyunOzeti(ellerYap(['RIFKI', 'RIFKI', 'RIFKI']));
    expect(ozet.find((s) => s.tur === 'RIFKI')?.kalan).toBe(0);
  });
});
