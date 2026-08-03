import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { satinAlmayiBaslat } from '@/servisler/satinalma';
import { useAyarStore } from '@/store/ayarStore';
import { useRenkler } from '@/tema/renkler';

export default function KokYerlesim() {
  const r = useRenkler();
  const tema = useAyarStore((d) => d.tema);

  useEffect(() => {
    // Mağaza SDK'sı arka planda başlar; internet yoksa MMKV'deki durum geçerli kalır
    satinAlmayiBaslat();
  }, []);

  return (
    <>
      <StatusBar style={tema === 'koyu' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: r.zeminKoyu },
          headerTintColor: r.altin,
          headerTitleStyle: { fontWeight: '800' },
          contentStyle: { backgroundColor: r.zemin },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'King Skor', headerShown: false }} />
        <Stack.Screen name="oyuncular" options={{ title: 'Oyuncular' }} />
        <Stack.Screen name="masa" options={{ title: 'Masa', headerBackVisible: false }} />
        <Stack.Screen name="oyun-sec" options={{ title: 'Oyun Seç', presentation: 'modal' }} />
        <Stack.Screen name="el-giris" options={{ title: 'El Girişi' }} />
        <Stack.Screen name="sonuc" options={{ title: 'Sonuç', headerBackVisible: false }} />
        <Stack.Screen name="gecmis" options={{ title: 'Geçmiş Masalar' }} />
        <Stack.Screen name="gecmis-detay" options={{ title: 'Masa Detayı' }} />
        <Stack.Screen name="kurallar" options={{ title: 'Kurallar & Puan Tablosu' }} />
        <Stack.Screen name="paywall" options={{ title: 'King Skor Pro', presentation: 'modal' }} />
        <Stack.Screen name="gizlilik" options={{ title: 'Gizlilik Politikası' }} />
        <Stack.Screen name="ayarlar/index" options={{ title: 'Ayarlar' }} />
        <Stack.Screen name="ayarlar/puan-tablosu" options={{ title: 'Puan Tablosu' }} />
      </Stack>
    </>
  );
}
