// Puan tablosu özelleştirme (premium): 7 birim puan düzenlenebilir.
// Değişiklik yalnız yeni kurulacak masalara uygulanır (masadaki snapshot kilitlidir).

import { useRouter } from 'expo-router';
import { Lock } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Buton } from '@/bilesenler/Buton';
import { HEDEF_BIRIM, OYUN_ADI, PUAN_ALANI } from '@/core/sabitler';
import type { OyunTuru } from '@/core/tipler';
import { useAyarStore } from '@/store/ayarStore';
import { usePro } from '@/store/proStore';
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
  const proMu = usePro();

  // Ücretsiz kullanıcı ekranı görür ama düzenleyemez — kilit rozeti üstte durur
  return (
    <ScrollView
      style={{ backgroundColor: r.zemin }}
      contentContainerStyle={stiller.icerik}
      keyboardShouldPersistTaps="handled"
    >
      {!proMu && (
        <View style={[stiller.kilitBandi, { backgroundColor: r.zeminKoyu, borderColor: r.altin }]}>
          <View style={stiller.kilitSatiri}>
            <Lock color={r.altin} size={16} strokeWidth={2.25} />
            <Text style={[stiller.kilitMetin, { color: r.altin }]}>
              Puan tablosunu özelleştirme Premium ile açılır
            </Text>
          </View>
          <Buton baslik="Premium'u İncele" onPress={() => router.push('/paywall')} />
        </View>
      )}
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
              editable={proMu}
              onChangeText={(metin) => {
                const sayi = parseInt(metin, 10);
                if (!Number.isNaN(sayi)) puanGuncelle(alan, sayi);
                else if (metin === '' || metin === '-') puanGuncelle(alan, 0);
              }}
              keyboardType="numbers-and-punctuation"
              maxLength={6}
              style={[
                stiller.girdi,
                {
                  backgroundColor: r.zeminKoyu,
                  color: deger > 0 ? r.yesil : r.kirmizi,
                  borderColor: r.cizgi,
                  opacity: proMu ? 1 : 0.5,
                },
              ]}
            />
          </View>
        );
      })}

      <Buton
        baslik="Varsayılana Dön"
        tur="ikincil"
        pasif={!proMu}
        onPress={varsayilanaDon}
        stil={stiller.aralik}
      />
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
  kilitBandi: { borderWidth: 2, borderRadius: 14, padding: 14, marginBottom: 12, gap: 10 },
  kilitSatiri: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  kilitMetin: { fontSize: 15, fontWeight: '800', textAlign: 'center' },
});
