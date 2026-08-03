// Tasarım dili: koyu masa temaları. Varsayılan yeşil çuha; ahşap ve
// gece mavisi Pro ile açılır.

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
}

/** Yeşil çuha (varsayılan, ücretsiz). */
export const CUHA: Renkler = {
  zemin: '#0B3D2E',
  zeminKoyu: '#072A20',
  kart: '#F5EFE0',
  kartUstu: '#1A1A1A',
  metin: '#F5EFE0',
  soluk: '#9DBFB2',
  altin: '#D4AF37',
  kirmizi: '#E4574F',
  yesil: '#6FCF97',
  cizgi: '#1C5A46',
  pasif: '#3A6B5B',
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
  kirmizi: '#E4574F',
  yesil: '#8FCF97',
  cizgi: '#5A4330',
  pasif: '#6B5641',
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
  kirmizi: '#E4574F',
  yesil: '#6FCF97',
  cizgi: '#1E3560',
  pasif: '#3C5480',
};

export const TEMALAR: Record<Tema, Renkler> = {
  cuha: CUHA,
  ahsap: AHSAP,
  gece: GECE,
};

export const TEMA_ADLARI: Record<Tema, string> = {
  cuha: 'Yeşil Çuha',
  ahsap: 'Ahşap',
  gece: 'Gece Mavisi',
};

/** Seçili temanın renk paletini döner (varsayılan yeşil çuha). */
export function useRenkler(): Renkler {
  const tema = useAyarStore((d) => d.tema);
  return TEMALAR[tema] ?? CUHA;
}
