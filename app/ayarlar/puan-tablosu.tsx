// Puan tablosu özelleştirme (premium): 7 birim puan düzenlenebilir.
// Değişiklik yalnız yeni kurulacak masalara uygulanır (masadaki snapshot kilitlidir).

import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Buton } from '@/bilesenler/Buton';
import { HEDEF_BIRIM, OYUN_ADI, PUAN_ALANI } from '@/core/sabitler';
import type { OyunTuru } from '@/core/tipler';
import { useAyarStore } from '@/store/ayarStore';
import { usePremium } from '@/store/premiumStore';
import { useRenkler } from '@/tema/renkler';

const SIRA: OyunTuru[] = [
  'KOZ',
  'EL_ALMAZ',
  'KUPA_ALMAZ',
  'KIZ_ALMAZ',
  'ERKEK_ALMAZ',
  'SON_IKI',
  'RIFKI',
];

export default function PuanTablosuEkrani() {
  const router = useRouter();
  const r = useRenkler();
  const { puanTablosu, puanGuncelle, varsayilanaDon } = useAyarStore();
  const premiumMu = usePremium();

  if (!premiumMu) {
    return (
      <View style={[stiller.kilit, { backgroundColor: r.zemin }]}>
        <Text style={stiller.kilitEmoji}>🔒</Text>
        <Text style={[stiller.kilitMetin, { color: r.metin }]}>
          Puan tablosunu özelleştirme King Skor Pro ile açılır.
        </Text>
        <Buton baslik="Pro'yu İncele" onPress={() => router.push('/paywall')} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: r.zemin }}
      contentContainerStyle={stiller.icerik}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[stiller.aciklama, { color: r.soluk }]}>
        Yörenizin kurallarına göre birim puanları değiştirin. Cezaları eksi (−) girin.
        Değişiklik yeni masalara uygulanır; devam eden masanın puanları kilitlidir.
      </Text>

      {SIRA.map((tur) => {
        const alan = PUAN_ALANI[tur];
        const deger = puanTablosu[alan];
        return (
          <View key={tur} style={[stiller.satir, { borderBottomColor: r.cizgi }]}>
            <View style={stiller.satirMetinleri}>
              <Text style={[stiller.oyun, { color: r.metin }]}>{OYUN_ADI[tur]}</Text>
              <Text style={[stiller.altBilgi, { color: r.soluk }]}>
                {HEDEF_BIRIM[tur]} birim × {deger} ={' '}
                {deger * HEDEF_BIRIM[tur] > 0 ? '+' : ''}
                {deger * HEDEF_BIRIM[tur]}
              </Text>
            </View>
            <TextInput
              value={String(deger)}
              onChangeText={(metin) => {
                const sayi = parseInt(metin, 10);
                if (!Number.isNaN(sayi)) puanGuncelle(alan, sayi);
                else if (metin === '' || metin === '-') puanGuncelle(alan, 0);
              }}
              keyboardType="numbers-and-punctuation"
              maxLength={6}
              style={[
                stiller.girdi,
                { backgroundColor: r.zeminKoyu, color: deger > 0 ? r.yesil : r.kirmizi, borderColor: r.cizgi },
              ]}
            />
          </View>
        );
      })}

      <Buton baslik="Varsayılana Dön" tur="ikincil" onPress={varsayilanaDon} stil={stiller.aralik} />
    </ScrollView>
  );
}

const stiller = StyleSheet.create({
  icerik: { padding: 20, paddingBottom: 40 },
  aciklama: { fontSize: 13, lineHeight: 19, marginBottom: 12 },
  satir: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  satirMetinleri: { flex: 1 },
  oyun: { fontSize: 17, fontWeight: '700' },
  altBilgi: { fontSize: 12, marginTop: 2, fontVariant: ['tabular-nums'] },
  girdi: {
    width: 96,
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  aralik: { marginTop: 20 },
  kilit: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  kilitEmoji: { fontSize: 64 },
  kilitMetin: { fontSize: 16, textAlign: 'center' },
});
