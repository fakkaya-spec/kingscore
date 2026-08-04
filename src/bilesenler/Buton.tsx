import React from 'react';
import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { hafifTitret } from '@/servisler/titresim';
import { useRenkler } from '@/tema/renkler';

interface Props {
  baslik: string;
  onPress: () => void;
  tur?: 'birincil' | 'ikincil' | 'tehlike';
  buyuk?: boolean;
  pasif?: boolean;
  stil?: ViewStyle;
}

export function Buton({ baslik, onPress, tur = 'birincil', buyuk, pasif, stil }: Props) {
  const r = useRenkler();
  const zemin =
    tur === 'birincil' ? r.altin : tur === 'tehlike' ? r.kirmizi : 'transparent';
  const metinRengi = tur === 'ikincil' ? r.metin : '#1A1A1A';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={pasif}
      onPress={() => {
        hafifTitret();
        onPress();
      }}
      style={({ pressed }) => [
        stiller.govde,
        buyuk && stiller.buyuk,
        {
          backgroundColor: pasif ? r.pasif : zemin,
          borderColor: tur === 'ikincil' ? r.cizgi : 'transparent',
          borderWidth: tur === 'ikincil' ? 1 : 0,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
      ]}
    >
      <Text
        style={[
          stiller.metin,
          buyuk && stiller.buyukMetin,
          { color: pasif ? '#6b6b6b' : metinRengi },
        ]}
      >
        {baslik}
      </Text>
    </Pressable>
  );
}

const stiller = StyleSheet.create({
  govde: {
    minHeight: 48, // dokunma hedefi min 48dp
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyuk: {
    minHeight: 64,
    borderRadius: 18,
  },
  metin: {
    fontSize: 17,
    fontWeight: '700',
  },
  buyukMetin: {
    fontSize: 22,
  },
});
