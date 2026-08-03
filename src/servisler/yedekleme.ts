// Geçmiş masaları JSON olarak dışa/içe aktarma (yedekleme). Tamamen cihaz üstü.

import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { Masa } from '@/core/tipler';
import { useMasaStore } from '@/store/masaStore';

const YEDEK_SURUMU = 1;

interface YedekDosyasi {
  uygulama: 'king-skor';
  surum: number;
  tarih: number;
  masalar: Masa[];
}

/** Geçmiş masaları JSON dosyasına yazıp paylaşım sayfasını açar. */
export async function disaAktar(): Promise<boolean> {
  const { gecmis, aktifMasa } = useMasaStore.getState();
  const yedek: YedekDosyasi = {
    uygulama: 'king-skor',
    surum: YEDEK_SURUMU,
    tarih: Date.now(),
    masalar: aktifMasa ? [aktifMasa, ...gecmis] : gecmis,
  };
  const dosya = new File(Paths.cache, `king-skor-yedek-${Date.now()}.json`);
  dosya.write(JSON.stringify(yedek, null, 2));
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(dosya.uri, {
      mimeType: 'application/json',
      dialogTitle: 'King Skor yedeğini kaydet',
    });
    return true;
  }
  return false;
}

/** Dosya seçtirip yedeği geçmişe ekler. Dönen değer: eklenen masa sayısı (-1 = geçersiz dosya). */
export async function iceAktar(): Promise<number> {
  const secim = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });
  if (secim.canceled || secim.assets.length === 0) return 0;

  try {
    const icerik = await new File(secim.assets[0].uri).text();
    const yedek = JSON.parse(icerik) as YedekDosyasi;
    if (yedek.uygulama !== 'king-skor' || !Array.isArray(yedek.masalar)) return -1;

    const oncekiSayi = useMasaStore.getState().gecmis.length;
    useMasaStore.getState().gecmisiIceAktar(yedek.masalar.filter((m) => m.bitis));
    return useMasaStore.getState().gecmis.length - oncekiSayi;
  } catch {
    return -1;
  }
}
