// Skor tablosunu PNG olarak yakalayıp paylaşma + arkadaş daveti.

import type { RefObject } from 'react';
import { Share } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

// YER TUTUCU: App Store ID belli olunca gerçek mağaza linkiyle değiştirilecek.
const DAVET_LINKI = 'https://apps.apple.com/app/king-skor/id0000000000';

/**
 * Sistem paylaşım sayfasını düz metin davetle açar.
 * expo-sharing yalnız dosya paylaştığı için metin daveti RN Share ile gider;
 * sunucu, hesap veya takip yoktur — metin olduğu gibi paylaşılır.
 */
export async function davetPaylas(): Promise<boolean> {
  try {
    await Share.share({
      message: `King Skor ile skor tutuyoruz, sen de indir: ${DAVET_LINKI}`,
    });
    return true;
  } catch {
    return false;
  }
}

/** Verilen görünümü PNG'ye çevirip paylaşım sayfasını açar. */
export async function goruntuyuPaylas(ref: RefObject<unknown>): Promise<boolean> {
  try {
    const uri = await captureRef(ref as RefObject<number>, {
      format: 'png',
      quality: 1,
    });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Skoru paylaş',
      });
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
