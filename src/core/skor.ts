// King skor motoru — saf fonksiyonlar, React'ten tamamen bağımsız.

import {
  BIRIM_ADI,
  CEZA_HAKKI,
  CEZA_MASA_LIMITI,
  CEZA_TURLERI,
  HEDEF_BIRIM,
  KING_ESIGI,
  KOZ_HAKKI,
  OYUN_ADI,
  PUAN_ALANI,
  TOPLAM_EL_SAYISI,
} from './sabitler';
import type {
  DogrulamaSonucu,
  El,
  GenelIstatistikler,
  KalanHak,
  Masa,
  MasaIstatistikleri,
  MasaSonucu,
  Oyuncu,
  OyunTuru,
  PuanTablosu,
  SonucDurumu,
} from './tipler';

/** Girilen adetlerden her oyuncunun puanını hesaplar. */
export function puanHesapla(
  el: Pick<El, 'tur' | 'adetler'>,
  tablo: PuanTablosu,
): Record<string, number> {
  const birim = tablo[PUAN_ALANI[el.tur]];
  const puanlar: Record<string, number> = {};
  for (const [oyuncuId, adet] of Object.entries(el.adetler)) {
    const puan = adet * birim;
    puanlar[oyuncuId] = puan === 0 ? 0 : puan; // -0 üretme
  }
  return puanlar;
}

/** Koz elinde 11+ el alan oyuncu King yapmış sayılır. */
export function kingMi(el: Pick<El, 'tur' | 'adetler'>): boolean {
  if (el.tur !== 'KOZ') return false;
  return Object.values(el.adetler).some((adet) => adet >= KING_ESIGI);
}

/** Koz elinde King yapan oyuncunun id'si (yoksa undefined). */
export function kingYapanOyuncu(el: Pick<El, 'tur' | 'adetler'>): string | undefined {
  if (el.tur !== 'KOZ') return undefined;
  return Object.entries(el.adetler).find(([, adet]) => adet >= KING_ESIGI)?.[0];
}

/**
 * El girişini doğrular: birim toplamı hedefe eşit olmalı,
 * adetler negatif olmamalı. Canlı geri bildirim mesajı üretir.
 */
export function elDogrula(
  tur: OyunTuru,
  adetler: Record<string, number>,
  oyuncuIdleri: string[],
): DogrulamaSonucu {
  const hedef = HEDEF_BIRIM[tur];
  const birimAdi = BIRIM_ADI[tur];
  let toplam = 0;

  for (const id of oyuncuIdleri) {
    const adet = adetler[id] ?? 0;
    if (adet < 0 || !Number.isInteger(adet)) {
      return { gecerli: false, toplam: 0, hedef, mesaj: 'Geçersiz adet girildi' };
    }
    toplam += adet;
  }

  if (toplam === hedef) {
    return { gecerli: true, toplam, hedef, mesaj: `${toplam} / ${hedef} ✔` };
  }
  if (toplam < hedef) {
    const eksik = hedef - toplam;
    return {
      gecerli: false,
      toplam,
      hedef,
      mesaj: `${toplam} / ${hedef} — ${eksik} ${birimAdi} eksik`,
    };
  }
  const fazla = toplam - hedef;
  return {
    gecerli: false,
    toplam,
    hedef,
    mesaj: `${toplam} / ${hedef} — ${fazla} ${birimAdi} fazla`,
  };
}

/** Her oyuncunun kalan koz/ceza söyleme haklarını döner. */
export function kalanHaklar(masa: Masa): Record<string, KalanHak> {
  const haklar: Record<string, KalanHak> = {};
  for (const oyuncu of masa.oyuncular) {
    haklar[oyuncu.id] = { koz: KOZ_HAKKI, ceza: CEZA_HAKKI };
  }
  for (const el of masa.eller) {
    const hak = haklar[el.secenOyuncuId];
    if (!hak) continue;
    if (el.tur === 'KOZ') hak.koz -= 1;
    else hak.ceza -= 1;
  }
  return haklar;
}

/** Her ceza türünün masada kaç kez oynandığını döner. */
export function cezaKullanimlari(masa: Masa): Record<OyunTuru, number> {
  const sayilar = Object.fromEntries(CEZA_TURLERI.map((t) => [t, 0])) as Record<OyunTuru, number>;
  for (const el of masa.eller) {
    if (el.tur !== 'KOZ') sayilar[el.tur] += 1;
  }
  return sayilar;
}

export interface OyunSecenegi {
  tur: OyunTuru;
  secilebilir: boolean;
  neden?: string; // seçilemiyorsa nedeni ("hakkın bitti", "2/2 oynandı")
}

/** Sıradaki oyuncunun seçebileceği oyunları, seçilemeyenlerin nedeniyle birlikte döner. */
export function secilebilirOyunlar(masa: Masa, oyuncuId: string): OyunSecenegi[] {
  const haklar = kalanHaklar(masa)[oyuncuId] ?? { koz: 0, ceza: 0 };
  const kullanim = cezaKullanimlari(masa);
  const secenekler: OyunSecenegi[] = [];

  secenekler.push(
    haklar.koz > 0
      ? { tur: 'KOZ', secilebilir: true }
      : { tur: 'KOZ', secilebilir: false, neden: 'hakkın bitti' },
  );

  for (const tur of CEZA_TURLERI) {
    if (haklar.ceza <= 0) {
      secenekler.push({ tur, secilebilir: false, neden: 'hakkın bitti' });
    } else if (kullanim[tur] >= CEZA_MASA_LIMITI) {
      secenekler.push({ tur, secilebilir: false, neden: `${CEZA_MASA_LIMITI}/${CEZA_MASA_LIMITI} oynandı` });
    } else {
      secenekler.push({ tur, secilebilir: true });
    }
  }
  return secenekler;
}

/**
 * Sıradaki oyuncu: son eli söyleyenin bir sonrası (oturma sırasına göre).
 * El silme/düzenleme rotasyonu kaydırmış olabilir; bu yüzden el sayısına değil
 * son elin söyleyenine bakılır ve hakkı kalmayan oyuncu atlanır — böylece
 * "sıra hakkı bitmiş oyuncuda" kilitlenmesi yaşanmaz.
 */
export function siradakiOyuncu(masa: Masa): Oyuncu | undefined {
  if (masa.eller.length >= TOPLAM_EL_SAYISI) return undefined;
  const haklar = kalanHaklar(masa);
  const sonEl = masa.eller[masa.eller.length - 1];
  const sonIndeks = sonEl
    ? masa.oyuncular.findIndex((o) => o.id === sonEl.secenOyuncuId)
    : -1;
  for (let adim = 1; adim <= 4; adim += 1) {
    const aday = masa.oyuncular[(sonIndeks + adim + 4) % 4];
    const hak = haklar[aday.id];
    // Hakkı olan her oyuncunun seçebileceği bir oyun mutlaka vardır:
    // ceza hakkı varsa masadaki 12 ceza slotunun tamamı dolmuş olamaz.
    if ((hak?.koz ?? 0) > 0 || (hak?.ceza ?? 0) > 0) return aday;
  }
  return undefined; // kimsenin hakkı kalmamış (tutarsız kayıt) — güvenli çıkış
}

/** Oyuncu başına toplam skor. */
export function toplamSkorlar(masa: Masa): Record<string, number> {
  const toplamlar: Record<string, number> = {};
  for (const oyuncu of masa.oyuncular) toplamlar[oyuncu.id] = 0;
  for (const el of masa.eller) {
    for (const [oyuncuId, puan] of Object.entries(el.puanlar)) {
      toplamlar[oyuncuId] = (toplamlar[oyuncuId] ?? 0) + puan;
    }
  }
  return toplamlar;
}

/** Altın doğrulama kuralı: dört oyuncunun puan toplamı her an 0 olmalıdır. */
export function toplamSifirMi(masa: Masa): boolean {
  const toplamlar = toplamSkorlar(masa);
  return Object.values(toplamlar).reduce((a, b) => a + b, 0) === 0;
}

export function oyunBittiMi(masa: Masa): boolean {
  return masa.eller.length >= TOPLAM_EL_SAYISI;
}

/** Bir eli tam adıyla yazar: "Koz ♠" ya da "Kupa Almaz". */
export function elBasligi(el: Pick<El, 'tur' | 'koz'>): string {
  if (el.tur === 'KOZ' && el.koz) {
    const simge = { MACA: '♠', KUPA: '♥', KARO: '♦', SINEK: '♣' }[el.koz];
    return `${OYUN_ADI.KOZ} ${simge}`;
  }
  return OYUN_ADI[el.tur];
}

function istatistikleriHesapla(masa: Masa): MasaIstatistikleri {
  const oyuncuMap = new Map(masa.oyuncular.map((o) => [o.id, o]));
  let kingSayisi = 0;
  const rifkiSayilari: Record<string, number> = {};
  const temizEller: Record<string, number> = {};
  const alinanEller: Record<string, number> = {};

  for (const oyuncu of masa.oyuncular) {
    rifkiSayilari[oyuncu.id] = 0;
    temizEller[oyuncu.id] = 0;
    alinanEller[oyuncu.id] = 0;
  }

  for (const el of masa.eller) {
    if (el.kingMi) kingSayisi += 1;
    for (const oyuncu of masa.oyuncular) {
      const adet = el.adetler[oyuncu.id] ?? 0;
      if (el.tur === 'RIFKI' && adet > 0) rifkiSayilari[oyuncu.id] += adet;
      if (el.tur !== 'KOZ' && adet === 0) temizEller[oyuncu.id] += 1; // cezadan sıfırla çıkmak temizdir
      if (el.tur === 'KOZ' || el.tur === 'EL_ALMAZ') alinanEller[oyuncu.id] += adet;
    }
  }

  const enBuyuk = (kayitlar: Record<string, number>) => {
    let iyiId: string | undefined;
    let iyiDeger = 0;
    for (const [id, deger] of Object.entries(kayitlar)) {
      if (deger > iyiDeger) {
        iyiDeger = deger;
        iyiId = id;
      }
    }
    return iyiId ? { oyuncu: oyuncuMap.get(iyiId)!, deger: iyiDeger } : undefined;
  };

  const rifki = enBuyuk(rifkiSayilari);
  const temiz = enBuyuk(temizEller);
  const elci = enBuyuk(alinanEller);

  return {
    kingSayisi,
    enCokRifkiYiyen: rifki ? { oyuncu: rifki.oyuncu, adet: rifki.deger } : undefined,
    enTemizOyuncu: temiz ? { oyuncu: temiz.oyuncu, temizElSayisi: temiz.deger } : undefined,
    enCokElAlan: elci ? { oyuncu: elci.oyuncu, elSayisi: elci.deger } : undefined,
  };
}

/** Oyun sonunda sıralamayı, sonuç durumunu ve eğlenceli istatistikleri belirler. */
export function sonucBelirle(masa: Masa): MasaSonucu {
  const toplamlar = toplamSkorlar(masa);
  const kingSayilari: Record<string, number> = {};
  for (const oyuncu of masa.oyuncular) kingSayilari[oyuncu.id] = 0;
  for (const el of masa.eller) {
    const kral = kingYapanOyuncu(el);
    if (kral) kingSayilari[kral] = (kingSayilari[kral] ?? 0) + 1;
  }

  const sirali = [...masa.oyuncular].sort(
    (a, b) => (toplamlar[b.id] ?? 0) - (toplamlar[a.id] ?? 0),
  );
  const siralama = sirali.map((oyuncu) => ({
    oyuncu,
    puan: toplamlar[oyuncu.id] ?? 0,
    sira: 0, // aşağıda doldurulur; aynı puanlar aynı sırayı paylaşır
    kingSayisi: kingSayilari[oyuncu.id] ?? 0,
  }));
  let sira = 0;
  siralama.forEach((satir, i) => {
    if (i === 0 || satir.puan !== siralama[i - 1].puan) sira = i + 1;
    satir.sira = sira;
  });

  const artida = siralama.filter((s) => s.puan > 0).length;
  const ekside = siralama.filter((s) => s.puan < 0).length;

  let durum: SonucDurumu;
  if (artida === 0 && ekside === 0) durum = 'BERABERE';
  else if (artida === 1 && ekside === 3) durum = 'TEK_KRAL';
  else if (artida === 2) durum = 'IKILI_CIKIS';
  else if (ekside === 1) durum = 'TEK_TAVUK';
  else if (ekside >= 3) durum = 'UC_BATTI';
  else if (artida === 1) durum = 'TEK_KRAL';
  else durum = 'BERABERE';

  return {
    siralama: siralama.map(({ oyuncu, puan, sira: s, kingSayisi }) => ({
      oyuncu,
      puan,
      sira: s,
      kingSayisi,
    })),
    durum,
    toplamSifir: toplamSifirMi(masa),
    istatistikler: istatistikleriHesapla(masa),
  };
}

/**
 * Geçmiş masaların tamamı üzerinden oyuncu-ADI bazlı istatistikler (Pro özelliği).
 * Aynı isim farklı masalarda farklı id alır; bu yüzden ad üzerinden gruplanır.
 */
export function genelIstatistikler(masalar: Masa[]): GenelIstatistikler {
  const rifkiler: Record<string, number> = {};
  const kingler: Record<string, number> = {};
  const toplamlarAdBazli: Record<string, { toplam: number; masaSayisi: number }> = {};

  for (const masa of masalar) {
    const toplamlar = toplamSkorlar(masa);
    const adMap = new Map(masa.oyuncular.map((o) => [o.id, o.ad]));

    for (const oyuncu of masa.oyuncular) {
      const kayit = toplamlarAdBazli[oyuncu.ad] ?? { toplam: 0, masaSayisi: 0 };
      kayit.toplam += toplamlar[oyuncu.id] ?? 0;
      kayit.masaSayisi += 1;
      toplamlarAdBazli[oyuncu.ad] = kayit;
    }

    for (const el of masa.eller) {
      if (el.tur === 'RIFKI') {
        for (const [id, adet] of Object.entries(el.adetler)) {
          const ad = adMap.get(id);
          if (ad && adet > 0) rifkiler[ad] = (rifkiler[ad] ?? 0) + adet;
        }
      }
      const kralId = kingYapanOyuncu(el);
      const kralAd = kralId ? adMap.get(kralId) : undefined;
      if (kralAd) kingler[kralAd] = (kingler[kralAd] ?? 0) + 1;
    }
  }

  const enBuyuk = (kayitlar: Record<string, number>) => {
    let iyiAd: string | undefined;
    let iyiDeger = 0;
    for (const [ad, deger] of Object.entries(kayitlar)) {
      if (deger > iyiDeger) {
        iyiDeger = deger;
        iyiAd = ad;
      }
    }
    return iyiAd ? { ad: iyiAd, adet: iyiDeger } : undefined;
  };

  const oyuncuOrtalamalari = Object.entries(toplamlarAdBazli)
    .map(([ad, k]) => ({
      ad,
      ortalama: Math.round(k.toplam / k.masaSayisi),
      masaSayisi: k.masaSayisi,
    }))
    .sort((a, b) => b.ortalama - a.ortalama);

  return {
    masaSayisi: masalar.length,
    enCokRifkiYiyen: enBuyuk(rifkiler),
    enCokKingYapan: enBuyuk(kingler),
    oyuncuOrtalamalari,
  };
}
