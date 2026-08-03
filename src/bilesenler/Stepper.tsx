import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { hafifTitret } from '@/servisler/titresim';
import { useRenkler } from '@/tema/renkler';

interface Props {
  deger: number;
  enAz?: number;
  enCok: number;
  onDegis: (yeni: number) => void;
}

/** Büyük dokunma alanlı − [ 0 ] + adım kontrolü; tek elle kullanılabilir. */
export function Stepper({ deger, enAz = 0, enCok, onDegis }: Props) {
  const r = useRenkler();

  const degistir = (fark: number) => {
    const yeni = deger + fark;
    if (yeni < enAz || yeni > enCok) return;
    hafifTitret();
    onDegis(yeni);
  };

  return (
    <View style={stiller.govde}>
      <Pressable
        accessibilityLabel="Azalt"
        onPress={() => degistir(-1)}
        style={({ pressed }) => [
          stiller.tus,
          { backgroundColor: r.zeminKoyu, opacity: deger <= enAz ? 0.35 : pressed ? 0.7 : 1 },
        ]}
      >
        <Text style={[stiller.tusMetni, { color: r.metin }]}>−</Text>
      </Pressable>
      <Text style={[stiller.deger, { color: r.metin }]}>{deger}</Text>
      <Pressable
        accessibilityLabel="Artır"
        onPress={() => degistir(1)}
        style={({ pressed }) => [
          stiller.tus,
          { backgroundColor: r.zeminKoyu, opacity: deger >= enCok ? 0.35 : pressed ? 0.7 : 1 },
        ]}
      >
        <Text style={[stiller.tusMetni, { color: r.metin }]}>+</Text>
      </Pressable>
    </View>
  );
}

const stiller = StyleSheet.create({
  govde: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tus: {
    width: 56,
    height: 56, // 48dp üstü dokunma hedefi
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tusMetni: {
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 34,
  },
  deger: {
    width: 52,
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
});
