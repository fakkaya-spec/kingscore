// Sonuç ekranı: sıralama, duruma göre mizahi animasyon, istatistikler,
// rövanş ve skor paylaşma.

import { useRouter } from 'expo-router';
import {
  Bird,
  CloudRain,
  Crown,
  Layers,
  PartyPopper,
  Scale,
  Sparkles,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react-native';
import React, { useEffect, useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Buton } from '@/bilesenler/Buton';
import { Konfeti } from '@/bilesenler/Konfeti';
import { SkorTablosu } from '@/bilesenler/SkorTablosu';
import { sonucBelirle } from '@/core/skor';
import type { Oyuncu, SonucDurumu } from '@/core/tipler';
import { goruntuyuPaylas } from '@/servisler/paylas';
import { sesCal } from '@/servisler/ses';
import { kimlikUret } from '@/store/depo';
import { useMasaStore, yeniMasaHakkiVarMi } from '@/store/masaStore';
import { usePro } from '@/store/proStore';
import { useAyarStore } from '@/store/ayarStore';
import { useRenkler } from '@/tema/renkler';

const DURUM_SAHNELERI: Record<SonucDurumu, { Ikon: LucideIcon; baslik: string }> = {
  TEK_KRAL: { Ikon: Crown, baslik: 'TEK BAŞINA ÇIKTI! KRAL!' },
  IKILI_CIKIS: { Ikon: PartyPopper, baslik: 'İKİLİ ÇIKIŞ!' },
  TEK_TAVUK: { Ikon: Bird, baslik: 'TEK BAŞINA BATTI! Gıt gıt gıdak...' },
  UC_BATTI: { Ikon: CloudRain, baslik: 'ÜÇÜ BİRDEN BATTI!' },
  BERABERE: { Ikon: Scale, baslik: 'BERABERE!' },
};

function SahneIkonu({
  Ikon,
  durum,
  renk,
}: {
  Ikon: LucideIcon;
  durum: SonucDurumu;
  renk: string;
}) {
  const olcek = useSharedValue(0.2);
  const donus = useSharedValue(0);

  useEffect(() => {
    olcek.value = withSpring(1, { damping: 7 });
    if (durum === 'TEK_KRAL' || durum === 'TEK_TAVUK') {
      donus.value = withRepeat(
        withSequence(withTiming(-10, { duration: 250 }), withTiming(10, { duration: 250 })),
        6,
        true,
      );
    }
  }, [olcek, donus, durum]);

  const stil = useAnimatedStyle(() => ({
    transform: [{ scale: olcek.value }, { rotate: `${donus.value}deg` }],
  }));

  return (
    <Animated.View style={stil}>
      <Ikon color={renk} size={96} strokeWidth={1.75} />
    </Animated.View>
  );
}

function DonenTac({ renk }: { renk: string }) {
  const donus = useSharedValue(0);
  useEffect(() => {
    donus.value = withRepeat(withTiming(360, { duration: 2400, easing: Easing.linear }), -1);
  }, [donus]);
  const stil = useAnimatedStyle(() => ({ transform: [{ rotateY: `${donus.value}deg` }] }));
  return (
    <Animated.View style={stil}>
      <Crown color={renk} size={24} strokeWidth={2.25} />
    </Animated.View>
  );
}

export default function SonucEkrani() {
  const router = useRouter();
  const r = useRenkler();
  const masa = useMasaStore((d) => d.aktifMasa);
  const { masayiKapat, masaKur } = useMasaStore();
  const proMu = usePro();
  const animasyonlarAcik = useAyarStore((d) => d.animasyonlar);
  const paylasilanRef = useRef<View>(null);

  const sonuc = useMemo(() => (masa ? sonucBelirle(masa) : null), [masa]);
  const konfetiGoster =
    animasyonlarAcik &&
    (sonuc?.durum === 'TEK_KRAL' || sonuc?.durum === 'IKILI_CIKIS');

  useEffect(() => {
    if (!masa) {
      router.replace('/');
      return;
    }
    if (!sonuc) return;
    if (sonuc.durum === 'TEK_KRAL' || sonuc.durum === 'IKILI_CIKIS') {
      sesCal('zafer');
    } else if (sonuc.durum === 'TEK_TAVUK' || sonuc.durum === 'UC_BATTI') {
      sesCal('kayip');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!masa || !sonuc) return null;

  const sahne = DURUM_SAHNELERI[sonuc.durum];
  const sonSira = sonuc.siralama[sonuc.siralama.length - 1];
  const kaybedenler = sonuc.siralama.filter((s) => s.puan < 0);

  const kapatVeGit = (hedef: 'ana' | 'rovans') => {
    const oyuncular = masa.oyuncular;

    if (hedef === 'rovans') {
      // Rövanş da yeni bir masadır: günlük ücretsiz sınıra tabidir
      if (!yeniMasaHakkiVarMi(proMu)) {
        router.push('/paywall');
        return;
      }
      masayiKapat();
      const yeniOyuncular = oyuncular.map((o: Oyuncu) => ({ ...o, id: kimlikUret() })) as [
        Oyuncu,
        Oyuncu,
        Oyuncu,
        Oyuncu,
      ];
      masaKur(yeniOyuncular);
      router.replace('/masa');
      return;
    }

    masayiKapat();
    router.replace('/');
  };

  return (
    <View style={[stiller.govde, { backgroundColor: r.zemin }]}>
      <ScrollView contentContainerStyle={stiller.icerik}>
        {/* Sahne */}
        <View style={stiller.sahne}>
          {animasyonlarAcik ? (
            <SahneIkonu Ikon={sahne.Ikon} durum={sonuc.durum} renk={r.altin} />
          ) : (
            <sahne.Ikon color={r.altin} size={96} strokeWidth={1.75} />
          )}
          <Text style={[stiller.sahneBaslik, { color: r.altin }]}>{sahne.baslik}</Text>
          {sonuc.durum === 'UC_BATTI' && (
            <Text style={[stiller.sahneAlt, { color: r.soluk }]}>
              {kaybedenler.map((s) => s.oyuncu.ad).join(' · ')}
            </Text>
          )}
        </View>

        {!sonuc.toplamSifir && (
          <View style={[stiller.uyari, { backgroundColor: r.kirmizi }]}>
            <TriangleAlert color="#fff" size={18} strokeWidth={2.25} />
            <Text style={stiller.uyariMetni}>
              Puan toplamı 0 değil! Girilen ellerde hata olabilir, tabloyu kontrol edin.
            </Text>
          </View>
        )}

        {/* Paylaşılacak alan: sıralama + istatistikler */}
        <View
          ref={paylasilanRef}
          collapsable={false}
          style={[stiller.paylasilan, { backgroundColor: r.zemin }]}
        >
          <View style={[stiller.siralamaKutusu, { backgroundColor: r.zeminKoyu, borderColor: r.altin }]}>
            {sonuc.siralama.map((satir) => {
              const kazanan = satir.sira === 1 && satir.puan > 0;
              const sonuncu = satir.oyuncu.id === sonSira.oyuncu.id && satir.puan < 0;
              return (
                <View key={satir.oyuncu.id} style={stiller.siralamaSatiri}>
                  <View style={stiller.rozetAlani}>
                    {kazanan &&
                      (animasyonlarAcik ? (
                        <DonenTac renk={r.altin} />
                      ) : (
                        <Crown color={r.altin} size={24} strokeWidth={2.25} />
                      ))}
                    {sonuncu && <Bird color={r.kirmizi} size={24} strokeWidth={2.25} />}
                  </View>
                  <Text style={[stiller.siraNo, { color: r.soluk }]}>{satir.sira}.</Text>
                  <Text style={[stiller.siraAd, { color: r.metin }]} numberOfLines={1}>
                    {satir.oyuncu.emoji} {satir.oyuncu.ad}
                  </Text>
                  {satir.kingSayisi > 0 && (
                    <View style={stiller.kingRozetleri}>
                      {Array.from({ length: satir.kingSayisi }, (_, i) => (
                        <Crown key={i} color={r.altin} size={16} strokeWidth={2.25} />
                      ))}
                    </View>
                  )}
                  <Text
                    style={[
                      stiller.siraPuan,
                      { color: satir.puan > 0 ? r.yesil : satir.puan < 0 ? r.kirmizi : r.metin },
                    ]}
                  >
                    {satir.puan > 0 ? `+${satir.puan}` : satir.puan}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Eğlenceli istatistikler */}
          <View style={[stiller.istKutusu, { borderColor: r.cizgi }]}>
            {sonuc.istatistikler.kingSayisi > 0 && (
              <View style={stiller.istSatiri}>
                <Crown color={r.altin} size={16} strokeWidth={2.25} />
                <Text style={[stiller.ist, { color: r.soluk }]}>
                  Bu masada {sonuc.istatistikler.kingSayisi} kez King yapıldı
                </Text>
              </View>
            )}
            {sonuc.istatistikler.enCokRifkiYiyen && (
              <View style={stiller.istSatiri}>
                <Text style={[stiller.istGlif, { color: r.kirmizi }]}>♥K</Text>
                <Text style={[stiller.ist, { color: r.soluk }]}>
                  En çok rıfkı yiyen: {sonuc.istatistikler.enCokRifkiYiyen.oyuncu.ad} (
                  {sonuc.istatistikler.enCokRifkiYiyen.adet} kez)
                </Text>
              </View>
            )}
            {sonuc.istatistikler.enTemizOyuncu && (
              <View style={stiller.istSatiri}>
                <Sparkles color={r.altin} size={16} strokeWidth={2.25} />
                <Text style={[stiller.ist, { color: r.soluk }]}>
                  En temiz el: {sonuc.istatistikler.enTemizOyuncu.oyuncu.ad} (
                  {sonuc.istatistikler.enTemizOyuncu.temizElSayisi} ceza elini sıfırla atlattı)
                </Text>
              </View>
            )}
            {sonuc.istatistikler.enCokElAlan && (
              <View style={stiller.istSatiri}>
                <Layers color={r.soluk} size={16} strokeWidth={2.25} />
                <Text style={[stiller.ist, { color: r.soluk }]}>
                  En çok el toplayan: {sonuc.istatistikler.enCokElAlan.oyuncu.ad} (
                  {sonuc.istatistikler.enCokElAlan.elSayisi} el)
                </Text>
              </View>
            )}
          </View>

          {/* Skor tablosunun tamamı paylaşım görüntüsüne girer */}
          <View style={stiller.tabloAlani}>
            <SkorTablosu masa={masa} hakGoster={false} />
          </View>

          {!proMu && (
            <Text style={[stiller.filigran, { color: r.soluk }]}>King Skor ile tutuldu ♠</Text>
          )}
        </View>

        <Buton baslik="Rövanş" buyuk onPress={() => kapatVeGit('rovans')} stil={stiller.aralik} />
        <Buton
          baslik="Skoru Paylaş"
          tur="ikincil"
          onPress={() => goruntuyuPaylas(paylasilanRef)}
          stil={stiller.aralik}
        />
        <Buton baslik="Ana Ekran" tur="ikincil" onPress={() => kapatVeGit('ana')} stil={stiller.aralik} />
      </ScrollView>

      {konfetiGoster && <Konfeti />}
    </View>
  );
}

const stiller = StyleSheet.create({
  govde: { flex: 1 },
  icerik: { padding: 16, paddingBottom: 32 },
  sahne: { alignItems: 'center', paddingVertical: 16 },
  sahneBaslik: { fontSize: 24, fontWeight: '900', textAlign: 'center', marginTop: 8 },
  sahneAlt: { fontSize: 16, marginTop: 8 },
  uyari: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uyariMetni: { color: '#fff', fontWeight: '700', flex: 1 },
  paylasilan: { borderRadius: 16, paddingBottom: 8 },
  siralamaKutusu: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 12,
    gap: 10,
  },
  siralamaSatiri: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rozetAlani: { width: 34, alignItems: 'center' },
  kingRozetleri: { flexDirection: 'row', gap: 2 },
  siraNo: { fontSize: 18, fontWeight: '800', width: 26, fontVariant: ['tabular-nums'] },
  siraAd: { flex: 1, fontSize: 19, fontWeight: '800' },
  siraPuan: { fontSize: 24, fontWeight: '900', fontVariant: ['tabular-nums'] },
  istKutusu: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    gap: 6,
  },
  istSatiri: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  istGlif: { fontSize: 14, fontWeight: '900', width: 16, textAlign: 'center' },
  ist: { fontSize: 14, fontWeight: '600', flex: 1 },
  tabloAlani: { height: 320, marginTop: 12 },
  filigran: { textAlign: 'center', marginTop: 8, fontSize: 12, fontStyle: 'italic' },
  aralik: { marginTop: 10 },
});
