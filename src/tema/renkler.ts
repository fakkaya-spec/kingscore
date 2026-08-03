// Tasarım dili: koyu yeşil çuha masa, altın vurgu, krem kart yüzeyleri.

import { useAyarStore } from '@/store/ayarStore';

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

export const KOYU: Renkler = {
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

export const ACIK: Renkler = {
  zemin: '#EFE9DA',
  zeminKoyu: '#E2D9C4',
  kart: '#FFFFFF',
  kartUstu: '#1A1A1A',
  metin: '#173B2E',
  soluk: '#5E7A6E',
  altin: '#A98307',
  kirmizi: '#C1272D',
  yesil: '#1F8A4C',
  cizgi: '#CBBFA6',
  pasif: '#B8AF98',
};

/** Seçili temanın renk paletini döner (varsayılan koyu). */
export function useRenkler(): Renkler {
  const tema = useAyarStore((d) => d.tema);
  return tema === 'acik' ? ACIK : KOYU;
}
