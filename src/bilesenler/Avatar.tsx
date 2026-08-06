// Oyuncu avatarı: fotoğraf varsa yuvarlak fotoğraf, yoksa adın baş harfi.

import React from 'react';
import { Image, Text, View } from 'react-native';
import { useRenkler } from '@/tema/renkler';

interface Props {
  ad: string;
  foto?: string;
  boyut?: number;
}

export function Avatar({ ad, foto, boyut = 28 }: Props) {
  const r = useRenkler();

  if (foto) {
    return (
      <Image
        source={{ uri: foto }}
        style={{ width: boyut, height: boyut, borderRadius: boyut / 2 }}
      />
    );
  }

  const harf = ad.trim().charAt(0).toLocaleUpperCase('tr') || '?';
  return (
    <View
      style={{
        width: boyut,
        height: boyut,
        borderRadius: boyut / 2,
        borderWidth: Math.max(1.5, boyut / 22),
        borderColor: r.altin,
        backgroundColor: r.zeminKoyu,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        allowFontScaling={false}
        style={{
          fontSize: boyut * 0.52,
          lineHeight: boyut * 0.62,
          fontWeight: '900',
          color: r.altin,
        }}
      >
        {harf}
      </Text>
    </View>
  );
}
