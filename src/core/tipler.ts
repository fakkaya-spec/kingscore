// King oyunu veri modeli — React'ten tamamen bağımsız saf tipler.

export type OyunTuru =
  | 'KOZ'
  | 'EL_ALMAZ'
  | 'KUPA_ALMAZ'
  | 'KIZ_ALMAZ'
  | 'ERKEK_ALMAZ'
  | 'SON_IKI'
  | 'RIFKI';

export type Koz = 'MACA' | 'KUPA' | 'KARO' | 'SINEK';

export interface Oyuncu {
  id: string;
  ad: string;
  emoji: string;
}

/** Birim puanlar. Cezalar negatif tutulur (ör. kupaAlmaz = -30). */
export interface PuanTablosu {
  koz: number;
  elAlmaz: number;
  kupaAlmaz: number;
  kizAlmaz: number;
  erkekAlmaz: number;
  sonIki: number;
  rifki: number;
}

export interface El {
  id: string;
  sira: number; // 1..20
  secenOyuncuId: string; // eli söyleyen
  tur: OyunTuru;
  koz?: Koz; // tur === 'KOZ' ise zorunlu
  adetler: Record<string, number>; // oyuncuId -> alınan birim adedi
  puanlar: Record<string, number>; // hesaplanmış puan
  kingMi: boolean;
  olusturmaZamani: number;
}

export interface Masa {
  id: string;
  ad?: string; // "Cuma Akşamı" gibi, opsiyonel
  oyuncular: [Oyuncu, Oyuncu, Oyuncu, Oyuncu];
  puanTablosu: PuanTablosu; // masa oluşturulurken snapshot
  eller: El[];
  baslangic: number;
  bitis?: number;
}

/** El girişi doğrulama sonucu. */
export interface DogrulamaSonucu {
  gecerli: boolean;
  toplam: number; // girilen birim toplamı
  hedef: number; // olması gereken toplam
  mesaj: string; // "1 kupa eksik" gibi canlı geri bildirim
}

/** Bir oyuncunun kalan söyleme hakları. */
export interface KalanHak {
  koz: number; // 0..2
  ceza: number; // 0..3
}

export type SonucDurumu =
  | 'TEK_KRAL' // tek kişi artıda
  | 'IKILI_CIKIS' // iki kişi artıda
  | 'TEK_TAVUK' // tek kişi ekside
  | 'UC_BATTI' // üç kişi ekside
  | 'BERABERE';

export interface SiralamaSatiri {
  oyuncu: Oyuncu;
  puan: number;
  sira: number; // 1 = birinci (aynı puanlar aynı sırayı paylaşır)
  kingSayisi: number;
}

export interface MasaIstatistikleri {
  kingSayisi: number;
  enCokRifkiYiyen?: { oyuncu: Oyuncu; adet: number };
  enTemizOyuncu?: { oyuncu: Oyuncu; temizElSayisi: number };
  enCokElAlan?: { oyuncu: Oyuncu; elSayisi: number };
}

export interface MasaSonucu {
  siralama: SiralamaSatiri[];
  durum: SonucDurumu;
  toplamSifir: boolean; // altın doğrulama kuralı
  istatistikler: MasaIstatistikleri;
}
