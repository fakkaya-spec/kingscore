// Masa ekranı: Genel/Detaylı görünüm, skor tablosu, kalan oyunlar, sıra bandı, EL GİR.

import { Stack, useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { House, Undo2 } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '@/bilesenler/Avatar';
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
  const animasyonlar = useAyarStore((d) => d.animasyonlar);
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
      {sirali.map((oyuncu, i) => {
        const puan = toplamlar[oyuncu.id] ?? 0;
        const liderMi = masa.eller.length > 0 && puan === lider && puan > 0;
        return (
          <Animated.View
            key={oyuncu.id}
            entering={animasyonlar ? FadeInDown.delay(i * 70).springify().damping(14) : undefined}
            style={[
              stiller.genelSatir,
              { borderColor: liderMi ? r.altin : r.cizgi },
              liderMi && { backgroundColor: r.kart },
            ]}
          >
            <View style={stiller.genelAdSatiri}>
              <Avatar emoji={oyuncu.emoji} foto={oyuncu.foto} boyut={30} />
              <Text
                numberOfLines={1}
                style={[stiller.genelAd, { color: liderMi ? r.kartUstu : r.metin }]}
              >
                {oyuncu.ad}
              </Text>
            </View>
            <Text
              style={[
                stiller.genelPuan,
                { color: puan < 0 ? r.kirmizi : liderMi ? r.altin : r.metin },
              ]}
            >
              {puan > 0 ? `+${puan}` : puan}
            </Text>
          </Animated.View>
        );
      })}
    </ScrollView>
  );
}

/** Tüm masanın durumu: her oyunun kaç kez daha oynanabileceği, rozetler halinde. */
function KalanOyunlar({ masa, buyuk }: { masa: Masa; buyuk?: boolean }) {
  const r = useRenkler();
  const ozet = kalanOyunOzeti(masa);
  return (
    <View style={stiller.kalanOyunSatiri}>
      {ozet.map((satir) => {
        const bitti = satir.kalan === 0;
        return (
          <View
            key={satir.tur}
            style={[
              stiller.kalanOyunRozeti,
              buyuk && stiller.kalanOyunRozetiBuyuk,
              { borderColor: bitti ? r.cizgi : r.altin, opacity: bitti ? 0.45 : 1 },
            ]}
          >
            <Text
              style={[
                stiller.kalanOyunMetni,
                buyuk && stiller.kalanOyunMetniBuyuk,
                { color: bitti ? r.pasif : r.metin },
              ]}
            >
              {OYUN_ADI[satir.tur]}
            </Text>
            <Text
              style={[
                stiller.kalanOyunSayi,
                buyuk && stiller.kalanOyunSayiBuyuk,
                { color: bitti ? r.pasif : r.altin },
              ]}
            >
              {satir.kalan}
            </Text>
          </View>
        );
      })}
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
  const animasyonlar = useAyarStore((d) => d.animasyonlar);

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
    // Ortadan silme rotasyonu bozar; ara eller yalnız düzenlenir (tür dahil),
    // silme sadece son elde sunulur
    const sonElMi = masa.eller[masa.eller.length - 1]?.id === el.id;
    Alert.alert(`${el.sira}. ${elBasligi(el)}`, undefined, [
      {
        text: 'Bu eli düzenle',
        onPress: () =>
          router.push({ pathname: '/oyun-sec', params: { elId: el.id } }),
      },
      ...(sonElMi
        ? [
            {
              text: 'Bu eli sil',
              style: 'destructive' as const,
              onPress: () => {
                ortaTitret();
                elSil(el.id);
              },
            },
          ]
        : []),
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
          // Masa kaybolmaz: ana ekrandaki "Devam Et" kartından geri dönülür
          headerLeft: () => (
            <Pressable
              accessibilityLabel="Ana sayfaya dön"
              onPress={() => router.replace('/')}
              style={stiller.geriAlTusu}
            >
              <House color={r.altin} size={22} strokeWidth={2.25} />
            </Pressable>
          ),
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

      {gorunum === 'genel' ? (
        // Genel: kutu içeriğe göre daralır, kalan oyun rozetleri boşalan alanda büyür
        <>
          <GenelGorunum masa={masa} />
          <KalanOyunlar masa={masa} buyuk />
          {masa.eller.length > 0 && (
            <Text style={[stiller.duzeltmeIpucu, { color: r.soluk }]}>
              Yanlış girilen bir eli düzeltmek için Detaylı görünüme geç, satıra uzun bas.
            </Text>
          )}
          <View style={stiller.esnekBosluk} />
        </>
      ) : (
        <>
          <View style={stiller.tabloAlani}>
            <SkorTablosu masa={masa} onSatirUzunBas={satirMenusu} />
          </View>
          {masa.eller.length > 0 && (
            <Text style={[stiller.duzeltmeIpucu, { color: r.soluk }]}>
              Bir eli düzeltmek veya silmek için satırına uzun bas.
            </Text>
          )}
          <KalanOyunlar masa={masa} />
        </>
      )}

      {/* Sıra bandı: oyuncu değişince yumuşakça yenilenir */}
      {sirali && (
        <Animated.View
          key={sirali.id}
          entering={animasyonlar ? FadeInDown.springify().damping(15) : undefined}
          style={[stiller.siraBandi, { backgroundColor: r.altin }]}
        >
          <View style={stiller.siraSatiri}>
            <Avatar emoji={sirali.emoji} foto={sirali.foto} boyut={24} />
            <Text style={stiller.siraMetni}>SIRA: {sirali.ad.toLocaleUpperCase('tr')}</Text>
          </View>
          <Text style={stiller.siraAlt}>
            {masa.eller.length + 1}. el · {20 - masa.eller.length} el kaldı
          </Text>
        </Animated.View>
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
  esnekBosluk: { flex: 1 },
  genelCerceve: { flexGrow: 0, borderWidth: 2, borderRadius: 16 },
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
  genelAdSatiri: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
    marginRight: 12,
  },
  genelAd: { fontSize: 24, fontWeight: '800', flexShrink: 1 },
  genelPuan: { fontSize: 44, fontWeight: '900', fontVariant: ['tabular-nums'] },
  kalanOyunSatiri: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  kalanOyunRozeti: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  kalanOyunRozetiBuyuk: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, gap: 7 },
  kalanOyunMetni: { fontSize: 14, fontWeight: '700' },
  kalanOyunMetniBuyuk: { fontSize: 18 },
  kalanOyunSayi: { fontSize: 16, fontWeight: '900', fontVariant: ['tabular-nums'] },
  kalanOyunSayiBuyuk: { fontSize: 21 },
  siraBandi: {
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  siraSatiri: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  siraMetni: { fontSize: 22, fontWeight: '900', color: '#1A1A1A', letterSpacing: 1 },
  siraAlt: { fontSize: 13, color: '#1A1A1A', opacity: 0.75, marginTop: 2 },
  duzeltmeIpucu: { fontSize: 11, textAlign: 'center', marginTop: 6 },
  elGirButonu: { marginTop: 10 },
  geriAlTusu: { minWidth: 48, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
