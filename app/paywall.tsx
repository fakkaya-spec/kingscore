// King Skor Premium paywall'u. İki seçenek: yıllık abonelik + ömür boyu (tek ödeme).
// Fiyatlar mağazadan dinamik okunur. Karanlık desen yok; X ile kapatınca hiçbir şey kaybolmaz.

import { Stack, useRouter } from 'expo-router';
import { Check, Crown, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Buton } from '@/bilesenler/Buton';
import {
  geriYukle,
  premiumPaketleriGetir,
  satinAl,
  type PremiumPaketleri,
} from '@/servisler/satinalma';
import { basariTitret } from '@/servisler/titresim';
import { usePro } from '@/store/proStore';
import { useRenkler } from '@/tema/renkler';

const OZELLIKLER = [
  'Sınırsız masa (deneme sınırı kalkar)',
  'Geçmiş masalar ve oyuncu istatistikleri',
  'Puan tablosunu özelleştirme',
  'Filigransız skor paylaşımı',
  'Ekstra temalar: ahşap, gece mavisi, yazlık',
];

type PaketSecimi = 'yillik' | 'omurBoyu';

export default function PaywallEkrani() {
  const router = useRouter();
  const r = useRenkler();
  const proMu = usePro();
  const [paketler, setPaketler] = useState<PremiumPaketleri>({ omurBoyu: null, yillik: null });
  const [secim, setSecim] = useState<PaketSecimi>('omurBoyu');
  const [yukleniyor, setYukleniyor] = useState(true);
  const [islemde, setIslemde] = useState(false);

  useEffect(() => {
    premiumPaketleriGetir().then((gelen) => {
      setPaketler(gelen);
      // Yalnız biri mağazadan gelebildiyse seçimi ona çek
      if (!gelen.omurBoyu && gelen.yillik) setSecim('yillik');
      setYukleniyor(false);
    });
  }, []);

  const seciliPaket = paketler[secim];
  const hicPaketYok = !paketler.omurBoyu && !paketler.yillik;

  const al = async () => {
    if (!seciliPaket || islemde) return;
    setIslemde(true);
    const basarili = await satinAl(seciliPaket.paket);
    setIslemde(false);
    if (basarili) {
      basariTitret();
      Alert.alert('Hoş geldin!', 'King Skor Premium aktif. İyi oyunlar!');
    }
  };

  const geriYukleBas = async () => {
    setIslemde(true);
    const bulundu = await geriYukle();
    setIslemde(false);
    Alert.alert(
      bulundu ? 'Geri yüklendi' : 'Satın alım bulunamadı',
      bulundu ? 'King Skor Premium aktif.' : 'Bu hesapla yapılmış bir satın alım bulunamadı.',
    );
  };

  // Sağ üstte kolayca kapatılabilen X — kapatınca hiçbir şey kaybolmaz
  const kapatmaTusu = (
    <Pressable
      accessibilityLabel="Kapat"
      onPress={() => router.back()}
      style={stiller.kapatTusu}
    >
      <X color={r.altin} size={24} strokeWidth={2.5} />
    </Pressable>
  );

  if (proMu) {
    return (
      <View style={[stiller.merkez, { backgroundColor: r.zemin }]}>
        <Stack.Screen options={{ headerRight: () => kapatmaTusu }} />
        <Crown color={r.altin} size={72} strokeWidth={1.75} />
        <Text style={[stiller.tesekkur, { color: r.metin }]}>
          King Skor Premium aktif. İyi oyunlar!
        </Text>
      </View>
    );
  }

  const paketKarti = (
    tip: PaketSecimi,
    baslik: string,
    aciklama: string,
    rozet?: string,
  ) => {
    const paket = paketler[tip];
    const secili = secim === tip;
    return (
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ selected: secili }}
        onPress={() => setSecim(tip)}
        disabled={!paket}
        style={[
          stiller.urunKarti,
          {
            backgroundColor: secili ? r.kart : 'transparent',
            borderColor: secili ? r.altin : r.cizgi,
            opacity: paket ? 1 : 0.45,
          },
        ]}
      >
        {rozet && (
          <View style={[stiller.rozet, { backgroundColor: r.altin }]}>
            <Text style={stiller.rozetMetni}>{rozet}</Text>
          </View>
        )}
        <Text style={[stiller.urunAdi, { color: secili ? r.kartUstu : r.metin }]}>{baslik}</Text>
        <Text style={[stiller.fiyat, { color: secili ? r.kartUstu : r.metin }]}>
          {paket?.fiyatMetni ?? (yukleniyor ? '…' : '—')}
        </Text>
        <Text style={[stiller.urunAciklama, { color: secili ? '#5a5142' : r.soluk }]}>
          {aciklama}
        </Text>
      </Pressable>
    );
  };

  return (
    <ScrollView style={{ backgroundColor: r.zemin }} contentContainerStyle={stiller.icerik}>
      <Stack.Screen options={{ headerRight: () => kapatmaTusu }} />

      <Text style={[stiller.baslik, { color: r.altin }]}>King Skor Premium</Text>

      <View style={stiller.urunSatiri}>
        {paketKarti('yillik', 'Yıllık', 'Yılda bir yenilenir.\nİstediğin an iptal.')}
        {paketKarti('omurBoyu', 'Ömür Boyu', 'Bir kez öde,\nömür boyu kullan.', 'EN İYİ DEĞER')}
      </View>

      <View style={stiller.ozellikler}>
        {OZELLIKLER.map((o) => (
          <View key={o} style={stiller.ozellikSatiri}>
            <Check color={r.altin} size={18} strokeWidth={3} />
            <Text style={[stiller.ozellik, { color: r.metin }]}>{o}</Text>
          </View>
        ))}
      </View>

      {!yukleniyor && hicPaketYok && (
        <Text style={[stiller.magazaUyari, { color: r.soluk }]}>
          Mağazaya şu anda ulaşılamıyor. İnternet bağlantınızı kontrol edip tekrar deneyin.
        </Text>
      )}

      <Buton
        baslik={islemde ? 'İşleniyor…' : 'Premium’a Geç'}
        buyuk
        pasif={islemde || !seciliPaket}
        onPress={al}
        stil={stiller.aralik}
      />
      <Buton
        baslik="Satın Alımları Geri Yükle"
        tur="ikincil"
        onPress={geriYukleBas}
        pasif={islemde}
        stil={stiller.aralik}
      />
      <Text style={[stiller.notMetni, { color: r.soluk }]}>
        Premium&apos;u daha önce satın aldıysan (ör. telefon değiştirdin veya uygulamayı sildin)
        bu buton satın alımını mağazadan bulup Premium&apos;u ücretsiz yeniden açar.
      </Text>
      <Text style={[stiller.notMetni, { color: r.soluk }]}>
        Yıllık abonelik dönem sonunda otomatik yenilenir; mağaza hesabındaki abonelik
        ayarlarından istediğin an iptal edebilirsin. Ömür boyu seçenek aboneliğe dönüşmez.
      </Text>

      <View style={stiller.baglantilar}>
        <Text onPress={() => router.push('/gizlilik')} style={[stiller.baglanti, { color: r.altin }]}>
          Gizlilik Politikası
        </Text>
        <Text
          onPress={() =>
            Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')
          }
          style={[stiller.baglanti, { color: r.altin }]}
        >
          Kullanım Koşulları (EULA)
        </Text>
      </View>
    </ScrollView>
  );
}

const stiller = StyleSheet.create({
  icerik: { padding: 20, paddingBottom: 40 },
  baslik: { fontSize: 30, fontWeight: '900', textAlign: 'center', marginBottom: 16 },
  urunSatiri: { flexDirection: 'row', gap: 12 },
  urunKarti: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 2.5,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  rozet: {
    position: 'absolute',
    top: -12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  rozetMetni: { fontSize: 11, fontWeight: '900', color: '#1A1A1A', letterSpacing: 0.5 },
  urunAdi: { fontSize: 18, fontWeight: '800' },
  fiyat: { fontSize: 26, fontWeight: '900', marginVertical: 6, fontVariant: ['tabular-nums'] },
  urunAciklama: { fontSize: 13, textAlign: 'center', lineHeight: 18, fontWeight: '600' },
  ozellikler: { gap: 8, marginTop: 20, alignSelf: 'center' },
  ozellikSatiri: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ozellik: { fontSize: 16, fontWeight: '600' },
  magazaUyari: { textAlign: 'center', marginTop: 14, fontSize: 13 },
  notMetni: { textAlign: 'center', marginTop: 8, fontSize: 12, lineHeight: 17 },
  aralik: { marginTop: 12 },
  baglantilar: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 14 },
  baglanti: { fontSize: 13, fontWeight: '700', textDecorationLine: 'underline', padding: 8 },
  kapatTusu: { minWidth: 48, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  merkez: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  tesekkur: { fontSize: 18, fontWeight: '700' },
});
