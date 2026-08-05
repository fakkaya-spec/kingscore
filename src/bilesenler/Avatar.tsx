// Oyuncu avatarı: fotoğraf varsa yuvarlak fotoğraf, yoksa emoji.

import React from 'react';
import { Image, Text } from 'react-native';

interface Props {
  emoji: string;
  foto?: string;
  boyut?: number;
}

export function Avatar({ emoji, foto, boyut = 28 }: Props) {
  if (foto) {
    return (
      <Image
        source={{ uri: foto }}
        style={{ width: boyut, height: boyut, borderRadius: boyut / 2 }}
      />
    );
  }
  return <Text style={{ fontSize: boyut * 0.82, lineHeight: boyut * 1.05 }}>{emoji}</Text>;
}
