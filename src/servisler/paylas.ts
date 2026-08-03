// Skor tablosunu PNG olarak yakalayıp paylaşma.

import type { RefObject } from 'react';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

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
