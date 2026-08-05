// Tasarım dili: varsayılan açık "yazlık" tema; yeşil çuha da ücretsizdir.
// Ahşap ve gece mavisi Premium ile açılır.

import { useAyarStore, type Tema } from '@/store/ayarStore';

export interface Renkler {
  zemin: string;
  zeminKoyu: string;
  kart: string; // kart yüzeyi
  kartUstu: string; // kart üstündeki metin
  metin: string;
  soluk: string;
  altin: string;
  kirmizi: string; // kupa/karo ve eksi puanlar
  yesil: string; // artı puanlar
  cizgi: string;
  pasif: string;
  acikMi: boolean; // açık temada durum çubuğu koyu yazılır
}

/**
 * Yeşil çuha (ücretsiz).
 * Zemin bilinçli olarak teal'den uzak, derin ve sıcak bir yeşildir;
 * altın baskın vurgu, kırmızı yalnızca rıfkı ve negatif puanlarda kullanılır.
 */
export const CUHA: Renkler = {
  zemin: '#0A2E1F',
  zeminKoyu: '#051D12',
  kart: '#F5EFE0',
  kartUstu: '#1A1A1A',
  metin: '#F5EFE0',
  soluk: '#93B5A5',
  altin: '#D4AF37',
  kirmizi: '#C1272D',
  yesil: '#6FCF97',
  cizgi: '#164632',
  pasif: '#2F5A45',
  acikMi: false,
};

/** Ahşap masa (Pro). */
export const AHSAP: Renkler = {
  zemin: '#3E2A1B',
  zeminKoyu: '#2B1D12',
  kart: '#F5EFE0',
  kartUstu: '#1A1A1A',
  metin: '#F2E7D5',
  soluk: '#BCA588',
  altin: '#D4AF37',
  kirmizi: '#C1272D',
  yesil: '#8FCF97',
  cizgi: '#5A4330',
  pasif: '#6B5641',
  acikMi: false,
};

/** Gece mavisi (Pro). */
export const GECE: Renkler = {
  zemin: '#0E1F3D',
  zeminKoyu: '#081428',
  kart: '#EDF1F7',
  kartUstu: '#1A1A1A',
  metin: '#EDF1F7',
  soluk: '#8FA3C4',
  altin: '#D4AF37',
  kirmizi: '#C1272D',
  yesil: '#6FCF97',
  cizgi: '#1E3560',
  pasif: '#3C5480',
  acikMi: false,
};

/** Yazlık (varsayılan, ücretsiz): açık, ferah; yaz akşamı bahçe masası. */
export const YAZ: Renkler = {
  zemin: '#F6F1E3',
  zeminKoyu: '#FFFFFF',
  kart: '#FFFFFF',
  kartUstu: '#1F2A20',
  metin: '#243528',
  soluk: '#77836F',
  altin: '#B8912A',
  kirmizi: '#C1272D',
  yesil: '#2E7D46',
  cizgi: '#DFD6BD',
  pasif: '#C9C2AD',
  acikMi: true,
};

export const TEMALAR: Record<Tema, Renkler> = {
  cuha: CUHA,
  ahsap: AHSAP,
  gece: GECE,
  yaz: YAZ,
};

export const TEMA_ADLARI: Record<Tema, string> = {
  cuha: 'Yeşil Çuha',
  ahsap: 'Ahşap',
  gece: 'Gece Mavisi',
  yaz: 'Yazlık',
};

/** Seçili temanın renk paletini döner (varsayılan yazlık). */
export function useRenkler(): Renkler {
  const tema = useAyarStore((d) => d.tema);
  return TEMALAR[tema] ?? YAZ;
}
