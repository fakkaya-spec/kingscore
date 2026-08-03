// Geçmiş masa detayı: salt okunur skor tablosu.

import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SkorTablosu } from '@/bilesenler/SkorTablosu';
import { useMasaStore } from '@/store/masaStore';
import { useRenkler } from '@/tema/renkler';

export default function GecmisDetayEkrani() {
  const r = useRenkler();
  const { id } = useLocalSearchParams<{ id: string }>();
  const masa = useMasaStore((d) => d.gecmis.find((m) => m.id === id));

  if (!masa) {
    return (
      <View style={[stiller.bosGovde, { backgroundColor: r.zemin }]}>
        <Text style={{ color: r.soluk }}>Masa bulunamadı.</Text>
      </View>
    );
  }

  const tarih = new Date(masa.baslangic).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <View style={[stiller.govde, { backgroundColor: r.zemin }]}>
      <Stack.Screen options={{ title: masa.ad || tarih }} />
      <SkorTablosu masa={masa} hakGoster={false} />
    </View>
  );
}

const stiller = StyleSheet.create({
  govde: { flex: 1, padding: 12 },
  bosGovde: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
