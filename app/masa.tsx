// Masa ekranı: Genel/Detaylı görünüm, skor tablosu, kalan oyunlar, sıra bandı, EL GİR.

import { Stack, useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { Undo2 } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Buton } from '@/bilesenler/Buton';
import { SkorTablosu } from '@/bilesenler/SkorTablosu';
import { kalanOyunOzeti } from '@/core/kalanOyun';
import { OYUN_ADI } from '@/core/sabitler';
import { elBasligi, oyunBittiMi, siradakiOyuncu, toplamSkorlar } from '@/core/skor';
import type { El, Masa } from '@/core/tipler';
import { ortaTitret } from '@/servisler/titresim';
import { useAyarStore, type MasaGorunumu } from '@/store/ayarStore';
import { useMasaStore } from '@/store/masaStore';
import { useRenkler } from '@/tema/renkler';

/** Masanın karşısından okunacak sade görünüm: ad + toplam, dev puntolarla. */
function GenelGorunum({ masa }: { masa: Masa }) {
  const r = useRenkler();
  const toplamlar = toplamSkorlar(masa);
  const sirali = [...masa.oyuncular].sort(
    (a, b) => (toplamlar[b.id] ?? 0) - (toplamlar[a.id] ?? 0),
  );
  const lider = sirali[0] ? (toplamlar[sirali[0].id] ?? 0) : 0;

  return (
    <ScrollView
      style={[stiller.genelCerceve, { borderColor: r.altin, backgroundColor: r.zeminKoyu }]}
      contentContainerStyle={stiller.genelIcerik}
    >
      {sirali.map((oyuncu) => {
        const puan = toplamlar[oyuncu.id] ?? 0;
        const liderMi = masa.eller.length > 0 && puan === lider && puan > 0;
        return (
          <View
            key={oyuncu.id}
            style={[
              stiller.genelSatir,
              { borderColor: liderMi ? r.altin : r.cizgi },
              liderMi && { backgroundColor: r.kart },
            ]}
          >
            <Text
              numberOfLines={1}
              style={[stiller.genelAd, { color: liderMi ? r.kartUstu : r.metin }]}
            >
              {oyuncu.emoji} {oyuncu.ad}
            </Text>
            <Text
              style={[
                stiller.genelPuan,
                { color: puan < 0 ? r.kirmizi : liderMi ? r.altin : r.metin },
              ]}
            >
              {puan > 0 ? `+${puan}` : puan}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

/** Tüm masanın durumu tek satırda: her oyunun kaç kez daha oynanabileceği. */
function KalanOyunlar({ masa }: { masa: Masa }) {
  const r = useRenkler();
  const ozet = kalanOyunOzeti(masa);
  return (
    <View style={stiller.kalanOyunSatiri}>
      {ozet.map((satir, i) => (
        <Text
          key={satir.tur}
          style={[stiller.kalanOyunMetni, { color: satir.kalan === 0 ? r.pasif : r.soluk }]}
        >
          {OYUN_ADI[satir.tur]} ({satir.kalan}){i < ozet.length - 1 ? ' · ' : ''}
        </Text>
      ))}
    </View>
  );
}

export default function MasaEkrani() {
  useKeepAwake(); // masadayken ekran kapanmasın
  const router = useRouter();
  const r = useRenkler();
  const masa = useMasaStore((d) => d.aktifMasa);
  const { elSil, sonEliGeriAl } = useMasaStore();
  const gorunum = useAyarStore((d) => d.masaGorunumu);
  const gorunumSec = useAyarStore((d) => d.masaGorunumuSec);

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

  const sekmeler: { deger: MasaGorunumu; ad: string }[] = [
    { deger: 'genel', ad: 'Genel' },
    { deger: 'detayli', ad: 'Detaylı' },
  ];

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
              <Undo2
                color={masa.eller.length === 0 ? r.pasif : r.altin}
                size={24}
                strokeWidth={2.5}
              />
            </Pressable>
          ),
        }}
      />

      {/* Genel / Detaylı segment */}
      <View style={[stiller.segment, { backgroundColor: r.zeminKoyu, borderColor: r.cizgi }]}>
        {sekmeler.map((sekme) => {
          const aktif = gorunum === sekme.deger;
          return (
            <Pressable
              key={sekme.deger}
              accessibilityRole="tab"
              accessibilityState={{ selected: aktif }}
              onPress={() => gorunumSec(sekme.deger)}
              style={[stiller.sekme, aktif && { backgroundColor: r.altin }]}
            >
              <Text style={[stiller.sekmeMetni, { color: aktif ? '#1A1A1A' : r.soluk }]}>
                {sekme.ad}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={stiller.tabloAlani}>
        {gorunum === 'genel' ? (
          <GenelGorunum masa={masa} />
        ) : (
          <SkorTablosu masa={masa} onSatirUzunBas={satirMenusu} />
        )}
      </View>

      <KalanOyunlar masa={masa} />

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
  segment: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    marginBottom: 10,
  },
  sekme: {
    flex: 1,
    borderRadius: 9,
    paddingVertical: 8,
    alignItems: 'center',
  },
  sekmeMetni: { fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  tabloAlani: { flex: 1 },
  genelCerceve: { flex: 1, borderWidth: 2, borderRadius: 16 },
  genelIcerik: { padding: 10, gap: 8 },
  genelSatir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  genelAd: { fontSize: 24, fontWeight: '800', flexShrink: 1, marginRight: 12 },
  genelPuan: { fontSize: 44, fontWeight: '900', fontVariant: ['tabular-nums'] },
  kalanOyunSatiri: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 2,
  },
  kalanOyunMetni: { fontSize: 12, fontWeight: '600', lineHeight: 18 },
  siraBandi: {
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  siraMetni: { fontSize: 22, fontWeight: '900', color: '#1A1A1A', letterSpacing: 1 },
  siraAlt: { fontSize: 13, color: '#1A1A1A', opacity: 0.75, marginTop: 2 },
  elGirButonu: { marginTop: 10 },
  geriAlTusu: { minWidth: 48, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
