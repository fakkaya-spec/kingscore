// Oyuncu fotoğrafı seçme ve cihazda saklama. Tamamen yerel; hiçbir yere yüklenmez.

import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

const KLASOR = new Directory(Paths.document, 'oyuncu-fotograflari');

/**
 * Galeriden kare kırpılmış fotoğraf seçtirir, kalıcı klasöre kopyalar
 * ve dosya yolunu döner. İzin verilmez ya da vazgeçilirse null.
 */
export async function fotoSec(): Promise<string | null> {
  const izin = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!izin.granted) return null;

  const secim = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.4,
  });
  if (secim.canceled || secim.assets.length === 0) return null;

  try {
    KLASOR.create({ intermediates: true, idempotent: true });
    const hedef = new File(KLASOR, `oyuncu-${Date.now()}.jpg`);
    new File(secim.assets[0].uri).copy(hedef);
    return hedef.uri;
  } catch {
    return null;
  }
}

/** Kullanılmayan fotoğraf dosyasını siler (yoksa sessizce geçer). */
export function fotoSil(uri?: string): void {
  if (!uri) return;
  try {
    const dosya = new File(uri);
    if (dosya.exists) dosya.delete();
  } catch {
    // dosya zaten yok ya da erişilemiyor — kozmetik veri, sessizce geç
  }
}
