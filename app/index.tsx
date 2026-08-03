// Ana ekran: Yeni Masa, Devam Et, Geçmiş, Kurallar, Ayarlar.

import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Buton } from '@/bilesenler/Buton';
import { TOPLAM_EL_SAYISI } from '@/core/sabitler';
import { hafifTitret } from '@/servisler/titresim';
import { usePro } from '@/store/proStore';
import { useMasaStore, yeniMasaHakkiVarMi } from '@/store/masaStore';
import { useRenkler } from '@/tema/renkler';

export default function AnaEkran() {
  const router = useRouter();
  const r = useRenkler();
  const aktifMasa = useMasaStore((d) => d.aktifMasa);
  const proMu = usePro();

  return (
    <SafeAreaView style={[stiller.govde, { backgroundColor: r.zemin }]}>
      <ScrollView contentContainerStyle={stiller.icerik}>
        <Text style={[stiller.logo, { color: r.altin }]}>♠ KING SKOR ♥</Text>
        <Text style={[stiller.slogan, { color: r.soluk }]}>
          Kağıt kalem yok, tartışma yok.
        </Text>

        {aktifMasa && (
          <Pressable
            onPress={() => {
              hafifTitret();
              router.push('/masa');
            }}
            style={[stiller.devamKarti, { backgroundColor: r.zeminKoyu, borderColor: r.altin }]}
          >
            <Text style={[stiller.devamBaslik, { color: r.altin }]}>
              Devam Et — {aktifMasa.eller.length}/{TOPLAM_EL_SAYISI} el
            </Text>
            <Text style={[stiller.devamAlt, { color: r.soluk }]} numberOfLines={1}>
              {aktifMasa.ad ? `${aktifMasa.ad} · ` : ''}
              {aktifMasa.oyuncular.map((o) => o.ad).join(', ')}
            </Text>
          </Pressable>
        )}

        <Buton
          baslik="YENİ MASA"
          buyuk
          onPress={() => {
            // Ücretsizde günde 1 masa; hakkı bitince paywall (masa ortasında asla kilit yok)
            router.push(yeniMasaHakkiVarMi(proMu) ? '/oyuncular' : '/paywall');
          }}
          stil={stiller.aralik}
        />
        <Buton
          baslik={proMu ? 'Geçmiş Masalar' : 'Geçmiş Masalar 🔒'}
          tur="ikincil"
          onPress={() => router.push('/gecmis')}
          stil={stiller.aralik}
        />
        <Buton
          baslik="Kurallar & Puan Tablosu"
          tur="ikincil"
          onPress={() => router.push('/kurallar')}
          stil={stiller.aralik}
        />
        <Buton
          baslik="Ayarlar"
          tur="ikincil"
          onPress={() => router.push('/ayarlar')}
          stil={stiller.aralik}
        />

        <View style={stiller.altBilgi}>
          <Text style={[stiller.altMetin, { color: r.soluk }]}>
            Tüm veriler cihazınızda kalır · İnternet gerekmez
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const stiller = StyleSheet.create({
  govde: { flex: 1 },
  icerik: { padding: 24, paddingTop: 48, gap: 4 },
  logo: { fontSize: 34, fontWeight: '900', textAlign: 'center', letterSpacing: 2 },
  slogan: { fontSize: 15, textAlign: 'center', marginBottom: 28 },
  devamKarti: {
    borderWidth: 2,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  devamBaslik: { fontSize: 20, fontWeight: '800' },
  devamAlt: { fontSize: 14, marginTop: 4 },
  aralik: { marginBottom: 12 },
  altBilgi: { marginTop: 24, alignItems: 'center' },
  altMetin: { fontSize: 12 },
});
