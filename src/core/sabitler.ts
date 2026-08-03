import type { Koz, OyunTuru, PuanTablosu } from './tipler';

/** Varsayılan puan tablosu. Cezalar negatif birim puan olarak tutulur. */
export const VARSAYILAN_PUAN_TABLOSU: PuanTablosu = {
  koz: 50,
  elAlmaz: -50,
  kupaAlmaz: -30,
  kizAlmaz: -100,
  erkekAlmaz: -60,
  sonIki: -180,
  rifki: -320,
};

export const TOPLAM_EL_SAYISI = 20;
export const KOZ_HAKKI = 2; // oyuncu başına
export const CEZA_HAKKI = 3; // oyuncu başına
export const CEZA_MASA_LIMITI = 2; // her ceza türü masada en fazla 2 kez
export const KING_ESIGI = 11; // koz elinde bu kadar ve üstü el alan King yapar

export const CEZA_TURLERI: OyunTuru[] = [
  'EL_ALMAZ',
  'KUPA_ALMAZ',
  'KIZ_ALMAZ',
  'ERKEK_ALMAZ',
  'SON_IKI',
  'RIFKI',
];

/** Her oyun türünde dağıtılması gereken toplam birim sayısı. */
export const HEDEF_BIRIM: Record<OyunTuru, number> = {
  KOZ: 13,
  EL_ALMAZ: 13,
  KUPA_ALMAZ: 13,
  KIZ_ALMAZ: 4,
  ERKEK_ALMAZ: 8,
  SON_IKI: 2,
  RIFKI: 1,
};

/** Doğrulama mesajlarında kullanılacak birim adı. */
export const BIRIM_ADI: Record<OyunTuru, string> = {
  KOZ: 'el',
  EL_ALMAZ: 'el',
  KUPA_ALMAZ: 'kupa',
  KIZ_ALMAZ: 'kız',
  ERKEK_ALMAZ: 'erkek',
  SON_IKI: 'el',
  RIFKI: 'rıfkı',
};

export const OYUN_ADI: Record<OyunTuru, string> = {
  KOZ: 'Koz',
  EL_ALMAZ: 'El Almaz',
  KUPA_ALMAZ: 'Kupa Almaz',
  KIZ_ALMAZ: 'Kız Almaz',
  ERKEK_ALMAZ: 'Erkek Almaz',
  SON_IKI: 'Son İki',
  RIFKI: 'Rıfkı',
};

/** Oyun türünün puan tablosundaki alan adı. */
export const PUAN_ALANI: Record<OyunTuru, keyof PuanTablosu> = {
  KOZ: 'koz',
  EL_ALMAZ: 'elAlmaz',
  KUPA_ALMAZ: 'kupaAlmaz',
  KIZ_ALMAZ: 'kizAlmaz',
  ERKEK_ALMAZ: 'erkekAlmaz',
  SON_IKI: 'sonIki',
  RIFKI: 'rifki',
};

export const KOZ_SIMGESI: Record<Koz, string> = {
  MACA: '♠',
  KUPA: '♥',
  KARO: '♦',
  SINEK: '♣',
};

export const KOZ_ADI: Record<Koz, string> = {
  MACA: 'Maça',
  KUPA: 'Kupa',
  KARO: 'Karo',
  SINEK: 'Sinek',
};

export const KOZLAR: Koz[] = ['MACA', 'KUPA', 'KARO', 'SINEK'];

/** Oyun seçim kartlarındaki minik hatırlatma metinleri (birim puana göre üretilir). */
export function oyunAciklamasi(tur: OyunTuru, tablo: PuanTablosu): string {
  const birim = tablo[PUAN_ALANI[tur]];
  switch (tur) {
    case 'KOZ':
      return `her el +${Math.abs(birim)}`;
    case 'EL_ALMAZ':
      return `her el −${Math.abs(birim)}`;
    case 'KUPA_ALMAZ':
      return `her kupa −${Math.abs(birim)}`;
    case 'KIZ_ALMAZ':
      return `her kız −${Math.abs(birim)}`;
    case 'ERKEK_ALMAZ':
      return `her vale/papaz −${Math.abs(birim)}`;
    case 'SON_IKI':
      return `son iki elin her biri −${Math.abs(birim)}`;
    case 'RIFKI':
      return `kupa papazını alan −${Math.abs(birim)}`;
  }
}

export const OYUNCU_EMOJILERI = [
  '🦊',
  '🐻',
  '🦁',
  '🐼',
  '🐸',
  '🐵',
  '🦉',
  '🐺',
  '🐯',
  '🐨',
  '🐰',
  '🦅',
];
