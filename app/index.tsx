// Ana ekran: büyük YENİ MASA kartı + devam eden masa kartı; diğerleri alt ikon satırında.

import { useRouter } from 'expo-router';
import { BookOpen, History, Lock, Play, Settings, Spade } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  const altSatir = [
    {
      ad: 'Geçmiş',
      Ikon: proMu ? History : Lock,
      git: () => router.push('/gecmis'),
    },
    { ad: 'Kurallar', Ikon: BookOpen, git: () => router.push('/kurallar') },
    { ad: 'Ayarlar', Ikon: Settings, git: () => router.push('/ayarlar') },
  ];

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
            <View style={stiller.kartBaslikSatiri}>
              <Play color={r.altin} size={20} strokeWidth={2.5} />
              <Text style={[stiller.devamBaslik, { color: r.altin }]}>
                Devam Et — {aktifMasa.eller.length}/{TOPLAM_EL_SAYISI} el
              </Text>
            </View>
            <Text style={[stiller.devamAlt, { color: r.soluk }]} numberOfLines={1}>
              {aktifMasa.ad ? `${aktifMasa.ad} · ` : ''}
              {aktifMasa.oyuncular.map((o) => o.ad).join(', ')}
            </Text>
          </Pressable>
        )}

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            hafifTitret();
            // Ücretsizde toplam 4 deneme masası; hakkı bitince paywall (masa ortasında asla kilit yok)
            router.push(yeniMasaHakkiVarMi(proMu) ? '/oyuncular' : '/paywall');
          }}
          style={({ pressed }) => [
            stiller.yeniMasaKarti,
            { backgroundColor: r.altin, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Spade color="#1A1A1A" size={34} strokeWidth={2.25} fill="#1A1A1A" />
          <Text style={stiller.yeniMasaMetni}>YENİ MASA</Text>
          <Text style={stiller.yeniMasaAlt}>4 oyuncu seç, dağıtmaya başla</Text>
        </Pressable>

        <View style={[stiller.altSatir, { borderColor: r.cizgi }]}>
          {altSatir.map(({ ad, Ikon, git }) => (
            <Pressable
              key={ad}
              accessibilityRole="button"
              accessibilityLabel={ad}
              onPress={() => {
                hafifTitret();
                git();
              }}
              style={({ pressed }) => [stiller.altTus, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Ikon color={r.soluk} size={22} strokeWidth={2} />
              <Text style={[stiller.altTusMetni, { color: r.soluk }]}>{ad}</Text>
            </Pressable>
          ))}
        </View>

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
  kartBaslikSatiri: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  devamBaslik: { fontSize: 20, fontWeight: '800' },
  devamAlt: { fontSize: 14, marginTop: 4 },
  yeniMasaKarti: {
    borderRadius: 22,
    paddingVertical: 34,
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  yeniMasaMetni: { fontSize: 30, fontWeight: '900', color: '#1A1A1A', letterSpacing: 2 },
  yeniMasaAlt: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', opacity: 0.7 },
  altSatir: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: 16,
  },
  altTus: { alignItems: 'center', gap: 4, minWidth: 72, paddingVertical: 6 },
  altTusMetni: { fontSize: 13, fontWeight: '600' },
  altBilgi: { marginTop: 24, alignItems: 'center' },
  altMetin: { fontSize: 12 },
});
