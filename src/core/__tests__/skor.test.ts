// Skor motoru testleri — her oyun türü, sınır durumlar, King ve toplam=0 invariantı.

import { CEZA_TURLERI, VARSAYILAN_PUAN_TABLOSU } from '../sabitler';
import {
  cezaKullanimlari,
  elDogrula,
  genelIstatistikler,
  kalanHaklar,
  kingMi,
  kingYapanOyuncu,
  oyunBittiMi,
  puanHesapla,
  secilebilirOyunlar,
  siradakiOyuncu,
  sonucBelirle,
  toplamSifirMi,
  toplamSkorlar,
} from '../skor';
import type { El, Koz, Masa, Oyuncu, OyunTuru } from '../tipler';

const OYUNCULAR: [Oyuncu, Oyuncu, Oyuncu, Oyuncu] = [
  { id: 'o1', ad: 'Ali', emoji: '🦊' },
  { id: 'o2', ad: 'Ayşe', emoji: '🐻' },
  { id: 'o3', ad: 'Mehmet', emoji: '🦁' },
  { id: 'o4', ad: 'Zeynep', emoji: '🐼' },
];
const IDLER = OYUNCULAR.map((o) => o.id);

let elSayaci = 0;

function elYap(
  tur: OyunTuru,
  adetler: Record<string, number>,
  secen: string = 'o1',
  koz?: Koz,
): El {
  elSayaci += 1;
  return {
    id: `el${elSayaci}`,
    sira: elSayaci,
    secenOyuncuId: secen,
    tur,
    koz,
    adetler,
    puanlar: puanHesapla({ tur, adetler }, VARSAYILAN_PUAN_TABLOSU),
    kingMi: kingMi({ tur, adetler }),
    olusturmaZamani: 0,
  };
}

function masaYap(eller: El[] = []): Masa {
  return {
    id: 'masa1',
    oyuncular: OYUNCULAR,
    puanTablosu: VARSAYILAN_PUAN_TABLOSU,
    eller,
    baslangic: 0,
  };
}

/** Tam bir oyun üretir: her oyuncu 2 koz + 3 ceza söyler, her ceza türü 2 kez oynanır. */
function tamOyunYap(): Masa {
  const eller: El[] = [];
  // Her ceza türü 2 kez: 12 ceza elini 4 oyuncuya 3'er hak olarak dağıt
  const cezaSirasi: [OyunTuru, string][] = [
    ['EL_ALMAZ', 'o1'],
    ['KUPA_ALMAZ', 'o1'],
    ['KIZ_ALMAZ', 'o1'],
    ['ERKEK_ALMAZ', 'o2'],
    ['SON_IKI', 'o2'],
    ['RIFKI', 'o2'],
    ['EL_ALMAZ', 'o3'],
    ['KUPA_ALMAZ', 'o3'],
    ['KIZ_ALMAZ', 'o3'],
    ['ERKEK_ALMAZ', 'o4'],
    ['SON_IKI', 'o4'],
    ['RIFKI', 'o4'],
  ];
  const dagitim: Record<OyunTuru, Record<string, number>> = {
    KOZ: { o1: 13, o2: 0, o3: 0, o4: 0 },
    EL_ALMAZ: { o1: 4, o2: 3, o3: 3, o4: 3 },
    KUPA_ALMAZ: { o1: 4, o2: 3, o3: 3, o4: 3 },
    KIZ_ALMAZ: { o1: 1, o2: 1, o3: 1, o4: 1 },
    ERKEK_ALMAZ: { o1: 2, o2: 2, o3: 2, o4: 2 },
    SON_IKI: { o1: 1, o2: 1, o3: 0, o4: 0 },
    RIFKI: { o1: 1, o2: 0, o3: 0, o4: 0 },
  };
  for (const [tur, secen] of cezaSirasi) {
    eller.push(elYap(tur, dagitim[tur], secen));
  }
  // 8 koz eli: her oyuncu 2 kez, tüm elleri hep o1 alsın (basit senaryo)
  const kozSecenler = ['o1', 'o1', 'o2', 'o2', 'o3', 'o3', 'o4', 'o4'];
  for (const secen of kozSecenler) {
    eller.push(elYap('KOZ', { o1: 13, o2: 0, o3: 0, o4: 0 }, secen, 'MACA'));
  }
  return masaYap(eller);
}

beforeEach(() => {
  elSayaci = 0;
});

// ---------- puanHesapla ----------

describe('puanHesapla', () => {
  test('Koz: alınan her el +50', () => {
    const p = puanHesapla({ tur: 'KOZ', adetler: { o1: 7, o2: 3, o3: 2, o4: 1 } }, VARSAYILAN_PUAN_TABLOSU);
    expect(p).toEqual({ o1: 350, o2: 150, o3: 100, o4: 50 });
  });

  test('Koz: 13 elin toplamı +650 dağıtır', () => {
    const p = puanHesapla({ tur: 'KOZ', adetler: { o1: 13, o2: 0, o3: 0, o4: 0 } }, VARSAYILAN_PUAN_TABLOSU);
    expect(Object.values(p).reduce((a, b) => a + b, 0)).toBe(650);
  });

  test('El Almaz: alınan her el −50, toplam −650', () => {
    const p = puanHesapla({ tur: 'EL_ALMAZ', adetler: { o1: 5, o2: 4, o3: 2, o4: 2 } }, VARSAYILAN_PUAN_TABLOSU);
    expect(p).toEqual({ o1: -250, o2: -200, o3: -100, o4: -100 });
    expect(Object.values(p).reduce((a, b) => a + b, 0)).toBe(-650);
  });

  test('Kupa Almaz: her kupa −30, 13 kupa toplam −390', () => {
    const p = puanHesapla({ tur: 'KUPA_ALMAZ', adetler: { o1: 13, o2: 0, o3: 0, o4: 0 } }, VARSAYILAN_PUAN_TABLOSU);
    expect(p.o1).toBe(-390);
  });

  test('Kız Almaz: her kız −100, 4 kız toplam −400', () => {
    const p = puanHesapla({ tur: 'KIZ_ALMAZ', adetler: { o1: 2, o2: 1, o3: 1, o4: 0 } }, VARSAYILAN_PUAN_TABLOSU);
    expect(p).toEqual({ o1: -200, o2: -100, o3: -100, o4: 0 });
  });

  test('Erkek Almaz: her vale/papaz −60, 8 kart toplam −480', () => {
    const p = puanHesapla({ tur: 'ERKEK_ALMAZ', adetler: { o1: 8, o2: 0, o3: 0, o4: 0 } }, VARSAYILAN_PUAN_TABLOSU);
    expect(p.o1).toBe(-480);
  });

  test('Son İki: her el −180, iki el aynı kişide −360', () => {
    const p = puanHesapla({ tur: 'SON_IKI', adetler: { o1: 2, o2: 0, o3: 0, o4: 0 } }, VARSAYILAN_PUAN_TABLOSU);
    expect(p.o1).toBe(-360);
  });

  test('Rıfkı: kupa papazını alan −320', () => {
    const p = puanHesapla({ tur: 'RIFKI', adetler: { o1: 0, o2: 1, o3: 0, o4: 0 } }, VARSAYILAN_PUAN_TABLOSU);
    expect(p.o2).toBe(-320);
  });

  test('özel puan tablosu ile hesaplar (yöresel kural)', () => {
    const ozel = { ...VARSAYILAN_PUAN_TABLOSU, rifki: -500 };
    const p = puanHesapla({ tur: 'RIFKI', adetler: { o1: 1 } }, ozel);
    expect(p.o1).toBe(-500);
  });
});

// ---------- kingMi ----------

describe('kingMi', () => {
  test('koz elinde 11 el alan King yapar', () => {
    expect(kingMi({ tur: 'KOZ', adetler: { o1: 11, o2: 2, o3: 0, o4: 0 } })).toBe(true);
  });

  test('koz elinde 10 el King değildir (sınır)', () => {
    expect(kingMi({ tur: 'KOZ', adetler: { o1: 10, o2: 3, o3: 0, o4: 0 } })).toBe(false);
  });

  test('13 el alan King yapar ve doğru oyuncu bulunur', () => {
    const el = { tur: 'KOZ' as const, adetler: { o1: 0, o2: 13, o3: 0, o4: 0 } };
    expect(kingMi(el)).toBe(true);
    expect(kingYapanOyuncu(el)).toBe('o2');
  });

  test('ceza elinde 11+ birim King sayılmaz', () => {
    expect(kingMi({ tur: 'KUPA_ALMAZ', adetler: { o1: 13, o2: 0, o3: 0, o4: 0 } })).toBe(false);
  });
});

// ---------- elDogrula ----------

describe('elDogrula', () => {
  test('Koz: toplam 13 ise geçerli', () => {
    const s = elDogrula('KOZ', { o1: 5, o2: 4, o3: 3, o4: 1 }, IDLER);
    expect(s.gecerli).toBe(true);
    expect(s.mesaj).toBe('13 / 13 ✔');
  });

  test('Kupa Almaz: 12 kupa girilirse "1 kupa eksik" der', () => {
    const s = elDogrula('KUPA_ALMAZ', { o1: 6, o2: 6, o3: 0, o4: 0 }, IDLER);
    expect(s.gecerli).toBe(false);
    expect(s.mesaj).toBe('12 / 13 — 1 kupa eksik');
  });

  test('Kız Almaz: 5 kız girilirse "1 kız fazla" der', () => {
    const s = elDogrula('KIZ_ALMAZ', { o1: 2, o2: 2, o3: 1, o4: 0 }, IDLER);
    expect(s.gecerli).toBe(false);
    expect(s.mesaj).toBe('5 / 4 — 1 kız fazla');
  });

  test('Erkek Almaz: toplam 8 olmalı', () => {
    expect(elDogrula('ERKEK_ALMAZ', { o1: 3, o2: 3, o3: 2, o4: 0 }, IDLER).gecerli).toBe(true);
    expect(elDogrula('ERKEK_ALMAZ', { o1: 3, o2: 3, o3: 1, o4: 0 }, IDLER).gecerli).toBe(false);
  });

  test('Son İki: tam 2 el dağıtılmalı, aynı kişiye 2 de olabilir', () => {
    expect(elDogrula('SON_IKI', { o1: 2, o2: 0, o3: 0, o4: 0 }, IDLER).gecerli).toBe(true);
    expect(elDogrula('SON_IKI', { o1: 1, o2: 1, o3: 0, o4: 0 }, IDLER).gecerli).toBe(true);
    expect(elDogrula('SON_IKI', { o1: 1, o2: 0, o3: 0, o4: 0 }, IDLER).gecerli).toBe(false);
  });

  test('Rıfkı: tam 1 oyuncu işaretli olmalı', () => {
    expect(elDogrula('RIFKI', { o1: 0, o2: 0, o3: 1, o4: 0 }, IDLER).gecerli).toBe(true);
    expect(elDogrula('RIFKI', { o1: 1, o2: 1, o3: 0, o4: 0 }, IDLER).gecerli).toBe(false);
    expect(elDogrula('RIFKI', {}, IDLER).gecerli).toBe(false);
  });

  test('negatif ya da ondalıklı adet geçersizdir', () => {
    expect(elDogrula('KOZ', { o1: -1, o2: 14, o3: 0, o4: 0 }, IDLER).gecerli).toBe(false);
    expect(elDogrula('KOZ', { o1: 6.5, o2: 6.5, o3: 0, o4: 0 }, IDLER).gecerli).toBe(false);
  });

  test('boş giriş: hedefin tamamı eksik gösterilir', () => {
    const s = elDogrula('KOZ', {}, IDLER);
    expect(s.gecerli).toBe(false);
    expect(s.mesaj).toBe('0 / 13 — 13 el eksik');
  });
});

// ---------- haklar ve sıra ----------

describe('kalanHaklar / secilebilirOyunlar / siradakiOyuncu', () => {
  test('başlangıçta herkesin 2 koz + 3 ceza hakkı vardır', () => {
    const haklar = kalanHaklar(masaYap());
    for (const id of IDLER) expect(haklar[id]).toEqual({ koz: 2, ceza: 3 });
  });

  test('el söyleyince hak düşer', () => {
    const masa = masaYap([
      elYap('KOZ', { o1: 13, o2: 0, o3: 0, o4: 0 }, 'o1', 'KUPA'),
      elYap('RIFKI', { o1: 1, o2: 0, o3: 0, o4: 0 }, 'o2'),
    ]);
    const haklar = kalanHaklar(masa);
    expect(haklar.o1).toEqual({ koz: 1, ceza: 3 });
    expect(haklar.o2).toEqual({ koz: 2, ceza: 2 });
  });

  test('2 koz hakkını kullanan oyuncuya koz kapanır', () => {
    const masa = masaYap([
      elYap('KOZ', { o1: 13, o2: 0, o3: 0, o4: 0 }, 'o1', 'MACA'),
      elYap('KOZ', { o1: 13, o2: 0, o3: 0, o4: 0 }, 'o1', 'KUPA'),
    ]);
    const koz = secilebilirOyunlar(masa, 'o1').find((s) => s.tur === 'KOZ')!;
    expect(koz.secilebilir).toBe(false);
    expect(koz.neden).toBe('hakkın bitti');
  });

  test('masada 2 kez oynanan ceza türü herkese kapanır', () => {
    const masa = masaYap([
      elYap('RIFKI', { o1: 1, o2: 0, o3: 0, o4: 0 }, 'o1'),
      elYap('RIFKI', { o2: 1, o1: 0, o3: 0, o4: 0 }, 'o2'),
    ]);
    const rifki = secilebilirOyunlar(masa, 'o3').find((s) => s.tur === 'RIFKI')!;
    expect(rifki.secilebilir).toBe(false);
    expect(rifki.neden).toBe('2/2 oynandı');
    expect(cezaKullanimlari(masa).RIFKI).toBe(2);
  });

  test('3 ceza hakkını bitiren oyuncuya tüm cezalar kapanır', () => {
    const masa = masaYap([
      elYap('EL_ALMAZ', { o1: 13, o2: 0, o3: 0, o4: 0 }, 'o1'),
      elYap('KUPA_ALMAZ', { o1: 13, o2: 0, o3: 0, o4: 0 }, 'o1'),
      elYap('RIFKI', { o1: 1, o2: 0, o3: 0, o4: 0 }, 'o1'),
    ]);
    const secenekler = secilebilirOyunlar(masa, 'o1');
    for (const tur of CEZA_TURLERI) {
      const s = secenekler.find((x) => x.tur === tur)!;
      expect(s.secilebilir).toBe(false);
    }
    // koz hakkı hâlâ açık
    expect(secenekler.find((x) => x.tur === 'KOZ')!.secilebilir).toBe(true);
  });

  test('sıra saat yönünün tersine döner: el sayısına göre oyuncu', () => {
    const masa = masaYap();
    expect(siradakiOyuncu(masa)!.id).toBe('o1');
    masa.eller.push(elYap('RIFKI', { o1: 1, o2: 0, o3: 0, o4: 0 }, 'o1'));
    expect(siradakiOyuncu(masa)!.id).toBe('o2');
    masa.eller.push(elYap('RIFKI', { o2: 1, o1: 0, o3: 0, o4: 0 }, 'o2'));
    expect(siradakiOyuncu(masa)!.id).toBe('o3');
  });

  test('20 el bitince sıra kimseye gelmez', () => {
    const masa = tamOyunYap();
    expect(masa.eller).toHaveLength(20);
    expect(siradakiOyuncu(masa)).toBeUndefined();
    expect(oyunBittiMi(masa)).toBe(true);
  });
});

// ---------- toplamlar ve altın kural ----------

describe('toplamSkorlar / toplam=0 invariantı', () => {
  test('tek ceza turu setinin toplamı −2600', () => {
    const setToplami =
      13 * -50 + 13 * -30 + 4 * -100 + 8 * -60 + 2 * -180 + 1 * -320;
    expect(setToplami).toBe(-2600);
  });

  test('boş masada herkes 0', () => {
    expect(toplamSkorlar(masaYap())).toEqual({ o1: 0, o2: 0, o3: 0, o4: 0 });
    expect(toplamSifirMi(masaYap())).toBe(true);
  });

  test('tam oyunda (20 el) toplam MUTLAKA 0 olur', () => {
    const masa = tamOyunYap();
    const toplamlar = toplamSkorlar(masa);
    expect(Object.values(toplamlar).reduce((a, b) => a + b, 0)).toBe(0);
    expect(toplamSifirMi(masa)).toBe(true);
  });

  test('ara skorlar da her an toplam 0 verir (her el kendi içinde dengeli değil ama izleme doğru)', () => {
    // Koz eli tek başına +650 dağıtır; invariant ancak oyun bütününde 0'lanır.
    // Burada motorun toplama işleminin tutarlılığı test edilir.
    const masa = masaYap([elYap('KOZ', { o1: 7, o2: 3, o3: 2, o4: 1 }, 'o1', 'KARO')]);
    const toplamlar = toplamSkorlar(masa);
    expect(Object.values(toplamlar).reduce((a, b) => a + b, 0)).toBe(650);
    expect(toplamSifirMi(masa)).toBe(false);
  });
});

// ---------- sonuç ----------

describe('sonucBelirle', () => {
  test('tek kişi artıda → TEK_KRAL (horoz)', () => {
    const masa = masaYap([
      elYap('KOZ', { o1: 13, o2: 0, o3: 0, o4: 0 }, 'o1', 'MACA'), // o1 +650
      elYap('EL_ALMAZ', { o1: 0, o2: 5, o3: 4, o4: 4 }, 'o2'), // diğerleri eksi
    ]);
    const sonuc = sonucBelirle(masa);
    expect(sonuc.durum).toBe('TEK_KRAL');
    expect(sonuc.siralama[0].oyuncu.id).toBe('o1');
    expect(sonuc.siralama[0].sira).toBe(1);
  });

  test('iki kişi artıda → IKILI_CIKIS', () => {
    const masa = masaYap([
      elYap('KOZ', { o1: 7, o2: 6, o3: 0, o4: 0 }, 'o1', 'KUPA'),
      elYap('EL_ALMAZ', { o1: 0, o2: 0, o3: 7, o4: 6 }, 'o3'),
    ]);
    expect(sonucBelirle(masa).durum).toBe('IKILI_CIKIS');
  });

  test('tek kişi ekside → TEK_TAVUK', () => {
    const masa = masaYap([
      elYap('KOZ', { o1: 5, o2: 4, o3: 4, o4: 0 }, 'o1', 'SINEK'),
      elYap('RIFKI', { o1: 0, o2: 0, o3: 0, o4: 1 }, 'o4'),
    ]);
    const sonuc = sonucBelirle(masa);
    expect(sonuc.durum).toBe('TEK_TAVUK');
    expect(sonuc.siralama[3].oyuncu.id).toBe('o4');
  });

  test('herkes 0 → BERABERE', () => {
    expect(sonucBelirle(masaYap()).durum).toBe('BERABERE');
  });

  test('aynı puanlar aynı sırayı paylaşır', () => {
    const masa = masaYap([
      elYap('KOZ', { o1: 6, o2: 6, o3: 1, o4: 0 }, 'o1', 'MACA'),
    ]);
    const s = sonucBelirle(masa).siralama;
    expect(s[0].sira).toBe(1);
    expect(s[1].sira).toBe(1);
    expect(s[2].sira).toBe(3);
  });

  test('istatistikler: king sayısı, en çok rıfkı yiyen, en temiz oyuncu', () => {
    const masa = masaYap([
      elYap('KOZ', { o1: 12, o2: 1, o3: 0, o4: 0 }, 'o1', 'KUPA'), // o1 King
      elYap('RIFKI', { o1: 0, o2: 1, o3: 0, o4: 0 }, 'o2'),
      elYap('RIFKI', { o1: 0, o2: 1, o3: 0, o4: 0 }, 'o3'),
      elYap('KUPA_ALMAZ', { o1: 5, o2: 5, o3: 3, o4: 0 }, 'o4'), // o4 temiz çıktı
    ]);
    const { istatistikler } = sonucBelirle(masa);
    expect(istatistikler.kingSayisi).toBe(1);
    expect(istatistikler.enCokRifkiYiyen).toEqual({ oyuncu: OYUNCULAR[1], adet: 2 });
    expect(istatistikler.enTemizOyuncu!.oyuncu.id).toBe('o4');
  });

  test('tam oyunun sonucunda toplamSifir true döner (altın kural)', () => {
    const sonuc = sonucBelirle(tamOyunYap());
    expect(sonuc.toplamSifir).toBe(true);
  });
});

// ---------- genel istatistikler (Pro) ----------

describe('genelIstatistikler', () => {
  test('boş geçmişte güvenli boş sonuç döner', () => {
    const g = genelIstatistikler([]);
    expect(g.masaSayisi).toBe(0);
    expect(g.enCokRifkiYiyen).toBeUndefined();
    expect(g.enCokKingYapan).toBeUndefined();
    expect(g.oyuncuOrtalamalari).toEqual([]);
  });

  test('rıfkı ve King sayıları oyuncu ADI üzerinden masalar arası toplanır', () => {
    // Aynı isimler farklı masalarda farklı id alır; ad bazlı gruplanmalı
    const masa1 = masaYap([
      elYap('RIFKI', { o1: 1, o2: 0, o3: 0, o4: 0 }, 'o2'),
      elYap('KOZ', { o1: 13, o2: 0, o3: 0, o4: 0 }, 'o1', 'MACA'), // Ali King
    ]);
    const masa2 = masaYap([
      elYap('RIFKI', { o1: 1, o2: 0, o3: 0, o4: 0 }, 'o3'),
      elYap('KOZ', { o1: 0, o2: 12, o3: 1, o4: 0 }, 'o2', 'KUPA'), // Ayşe King
    ]);
    const g = genelIstatistikler([masa1, masa2]);
    expect(g.masaSayisi).toBe(2);
    expect(g.enCokRifkiYiyen).toEqual({ ad: 'Ali', adet: 2 });
    expect(g.enCokKingYapan!.adet).toBe(1); // Ali ve Ayşe 1'er kez; en büyük 1
  });

  test('oyuncu ortalamaları masa başına hesaplanır ve büyükten küçüğe sıralanır', () => {
    const masa1 = masaYap([elYap('KOZ', { o1: 13, o2: 0, o3: 0, o4: 0 }, 'o1', 'MACA')]); // Ali +650
    const masa2 = masaYap([elYap('RIFKI', { o1: 1, o2: 0, o3: 0, o4: 0 }, 'o1')]); // Ali -320
    const g = genelIstatistikler([masa1, masa2]);
    const ali = g.oyuncuOrtalamalari.find((o) => o.ad === 'Ali')!;
    expect(ali.masaSayisi).toBe(2);
    expect(ali.ortalama).toBe(Math.round((650 - 320) / 2));
    expect(g.oyuncuOrtalamalari[0].ortalama).toBeGreaterThanOrEqual(
      g.oyuncuOrtalamalari[g.oyuncuOrtalamalari.length - 1].ortalama,
    );
  });
});
