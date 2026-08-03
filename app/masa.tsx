// Masa ekranı: skor tablosu, sıra bandı, EL GİR butonu, geri al.

import { Stack, useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import React, { useEffect } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Buton } from '@/bilesenler/Buton';
import { SkorTablosu } from '@/bilesenler/SkorTablosu';
import { elBasligi, oyunBittiMi, siradakiOyuncu } from '@/core/skor';
import type { El } from '@/core/tipler';
import { ortaTitret } from '@/servisler/titresim';
import { useMasaStore } from '@/store/masaStore';
import { useRenkler } from '@/tema/renkler';

export default function MasaEkrani() {
  useKeepAwake(); // masadayken ekran kapanmasın
  const router = useRouter();
  const r = useRenkler();
  const masa = useMasaStore((d) => d.aktifMasa);
  const { elSil, sonEliGeriAl } = useMasaStore();

  const bitti = masa ? masa.bitis !== undefined || oyunBittiMi(masa) : false;

  useEffect(() => {
    if (!masa) {
      router.replace('/');
      return;
    }
    if (bitti) {
      router.replace('/sonuc');
    }
  }, [masa, bitti, router]);

  if (!masa || bitti) return null;

  const sirali = siradakiOyuncu(masa);

  const satirMenusu = (el: El) => {
    Alert.alert(`${el.sira}. ${elBasligi(el)}`, undefined, [
      {
        text: 'Bu eli düzenle',
        onPress: () =>
          router.push({
            pathname: '/el-giris',
            params: { elId: el.id, tur: el.tur, koz: el.koz ?? '', secen: el.secenOyuncuId },
          }),
      },
      {
        text: 'Bu eli sil',
        style: 'destructive',
        onPress: () => {
          ortaTitret();
          elSil(el.id);
        },
      },
      { text: 'Vazgeç', style: 'cancel' },
    ]);
  };

  const geriAl = () => {
    if (masa.eller.length === 0) return;
    const son = masa.eller[masa.eller.length - 1];
    Alert.alert('Son eli geri al', `${son.sira}. ${elBasligi(son)} silinecek. Emin misiniz?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Geri Al',
        style: 'destructive',
        onPress: () => {
          ortaTitret();
          sonEliGeriAl();
        },
      },
    ]);
  };

  return (
    <SafeAreaView edges={['bottom']} style={[stiller.govde, { backgroundColor: r.zemin }]}>
      <Stack.Screen
        options={{
          title: masa.ad || 'Masa',
          headerRight: () => (
            <Pressable
              accessibilityLabel="Son eli geri al"
              onPress={geriAl}
              disabled={masa.eller.length === 0}
              style={stiller.geriAlTusu}
            >
              <Text style={{ color: masa.eller.length === 0 ? r.pasif : r.altin, fontSize: 24 }}>
                ↩
              </Text>
            </Pressable>
          ),
        }}
      />

      <View style={stiller.tabloAlani}>
        <SkorTablosu masa={masa} onSatirUzunBas={satirMenusu} />
      </View>

      {/* Sıra bandı */}
      {sirali && (
        <View style={[stiller.siraBandi, { backgroundColor: r.altin }]}>
          <Text style={stiller.siraMetni}>
            SIRA: {sirali.emoji} {sirali.ad.toLocaleUpperCase('tr')}
          </Text>
          <Text style={stiller.siraAlt}>
            {masa.eller.length + 1}. el · {20 - masa.eller.length} el kaldı
          </Text>
        </View>
      )}

      <Buton
        baslik="EL GİR"
        buyuk
        onPress={() => router.push('/oyun-sec')}
        stil={stiller.elGirButonu}
      />
    </SafeAreaView>
  );
}

const stiller = StyleSheet.create({
  govde: { flex: 1, padding: 12 },
  tabloAlani: { flex: 1 },
  siraBandi: {
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  siraMetni: { fontSize: 22, fontWeight: '900', color: '#1A1A1A', letterSpacing: 1 },
  siraAlt: { fontSize: 13, color: '#1A1A1A', opacity: 0.75, marginTop: 2 },
  elGirButonu: { marginTop: 10 },
  geriAlTusu: { minWidth: 48, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
