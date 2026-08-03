// King Skor Pro paywall'u. Fiyatlar mağazadan dinamik okunur, koda sabit yazılmaz.
// Yalnız yıllık abonelik ve ömür boyu (tek seferlik) ürünler vardır.

import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Buton } from '@/bilesenler/Buton';
import {
  geriYukle,
  paketleriGetir,
  satinAl,
  URUN_OMUR_BOYU,
  URUN_YILLIK,
  type SatisPaketi,
} from '@/servisler/satinalma';
import { basariTitret } from '@/servisler/titresim';
import { usePremium } from '@/store/premiumStore';
import { useRenkler } from '@/tema/renkler';

const AVANTAJLAR = [
  'Geçmiş masalar & istatistikler',
  'Puan tablosunu özelleştirme',
  'Filigransız skor paylaşımı',
  'Tema seçimi',
];

export default function PaywallEkrani() {
  const router = useRouter();
  const r = useRenkler();
  const premiumMu = usePremium();
  const [paketler, setPaketler] = useState<SatisPaketi[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [islemde, setIslemde] = useState(false);

  useEffect(() => {
    paketleriGetir().then((gelen) => {
      setPaketler(gelen);
      setYukleniyor(false);
    });
  }, []);

  useEffect(() => {
    if (premiumMu) {
      // Satın alma tamamlandıysa ekranı kapat
      const zamanlayici = setTimeout(() => router.back(), 600);
      return () => clearTimeout(zamanlayici);
    }
  }, [premiumMu, router]);

  const omurBoyu = paketler.find((p) => p.urunId.includes(URUN_OMUR_BOYU));
  const yillik = paketler.find((p) => p.urunId.includes(URUN_YILLIK));

  const al = async (paket?: SatisPaketi) => {
    if (!paket || islemde) return;
    setIslemde(true);
    const basarili = await satinAl(paket.paket);
    setIslemde(false);
    if (basarili) {
      basariTitret();
      Alert.alert('Hoş geldin! 👑', 'King Skor Pro aktif. İyi oyunlar!');
    }
  };

  const geriYukleBas = async () => {
    setIslemde(true);
    const bulundu = await geriYukle();
    setIslemde(false);
    Alert.alert(
      bulundu ? 'Geri yüklendi 👑' : 'Satın alım bulunamadı',
      bulundu
        ? 'King Skor Pro aktif.'
        : 'Bu hesapla yapılmış bir satın alım bulunamadı.',
    );
  };

  if (premiumMu) {
    return (
      <View style={[stiller.merkez, { backgroundColor: r.zemin }]}>
        <Text style={stiller.buyukEmoji}>👑</Text>
        <Text style={[stiller.tesekkur, { color: r.metin }]}>King Skor Pro aktif. İyi oyunlar!</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: r.zemin }} contentContainerStyle={stiller.icerik}>
      <Text style={[stiller.baslik, { color: r.altin }]}>King Skor Pro</Text>
      <View style={stiller.avantajlar}>
        {AVANTAJLAR.map((a) => (
          <Text key={a} style={[stiller.avantaj, { color: r.metin }]}>
            ✓ {a}
          </Text>
        ))}
      </View>

      {/* İki kart yan yana: Ömür Boyu (önerilen) + 1 Yıllık */}
      <View style={stiller.kartlar}>
        <Pressable
          onPress={() => al(omurBoyu)}
          style={[stiller.urunKarti, stiller.onerilen, { backgroundColor: r.kart, borderColor: r.altin }]}
        >
          <View style={[stiller.rozet, { backgroundColor: r.altin }]}>
            <Text style={stiller.rozetMetni}>EN ÇOK TERCİH EDİLEN</Text>
          </View>
          <Text style={[stiller.urunAdi, { color: r.kartUstu }]}>Ömür Boyu</Text>
          <Text style={[stiller.fiyat, { color: r.kartUstu }]}>
            {omurBoyu?.fiyatMetni ?? (yukleniyor ? '…' : '—')}
          </Text>
          <Text style={[stiller.urunAciklama, { color: '#5a5142' }]}>
            Bir kez öde, ömür boyu kullan. Yenileme yok.
          </Text>
        </Pressable>

        <Pressable
          onPress={() => al(yillik)}
          style={[stiller.urunKarti, { backgroundColor: r.kart, borderColor: r.cizgi }]}
        >
          <Text style={[stiller.urunAdi, { color: r.kartUstu }]}>1 Yıllık</Text>
          <Text style={[stiller.fiyat, { color: r.kartUstu }]}>
            {yillik?.fiyatMetni ?? (yukleniyor ? '…' : '—')}
          </Text>
          <Text style={[stiller.urunAciklama, { color: '#5a5142' }]}>
            Yıllık abonelik. İstediğin zaman iptal et.
          </Text>
        </Pressable>
      </View>

      {!yukleniyor && paketler.length === 0 && (
        <Text style={[stiller.magazaUyari, { color: r.soluk }]}>
          Mağazaya şu anda ulaşılamıyor. İnternet bağlantınızı kontrol edip tekrar deneyin.
        </Text>
      )}

      <Buton
        baslik="Satın Alımları Geri Yükle"
        tur="ikincil"
        onPress={geriYukleBas}
        pasif={islemde}
        stil={stiller.aralik}
      />
      <Buton baslik="Şimdi Değil" tur="ikincil" onPress={() => router.back()} stil={stiller.aralik} />

      <Text style={[stiller.kosullar, { color: r.soluk }]}>
        Yıllık abonelik, dönem sonunda mağaza hesabınızdan otomatik yenilenir. Yenilemeyi
        dilediğiniz an mağaza hesap ayarlarınızdan kapatabilirsiniz. Ödeme, satın almanın
        onaylanmasıyla mağaza hesabınıza yansıtılır.
      </Text>
      <View style={stiller.baglantilar}>
        <Text
          onPress={() => router.push('/gizlilik')}
          style={[stiller.baglanti, { color: r.altin }]}
        >
          Gizlilik Politikası
        </Text>
        <Text
          onPress={() =>
            Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')
          }
          style={[stiller.baglanti, { color: r.altin }]}
        >
          Kullanım Şartları (EULA)
        </Text>
      </View>
    </ScrollView>
  );
}

const stiller = StyleSheet.create({
  icerik: { padding: 20, paddingBottom: 40 },
  baslik: { fontSize: 30, fontWeight: '900', textAlign: 'center', marginBottom: 12 },
  avantajlar: { gap: 6, marginBottom: 20, alignSelf: 'center' },
  avantaj: { fontSize: 16, fontWeight: '600' },
  kartlar: { flexDirection: 'row', gap: 12 },
  urunKarti: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 2,
    padding: 16,
    paddingTop: 22,
    alignItems: 'center',
    minHeight: 160,
  },
  onerilen: { borderWidth: 3 },
  rozet: {
    position: 'absolute',
    top: -12,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  rozetMetni: { fontSize: 10, fontWeight: '900', color: '#1A1A1A' },
  urunAdi: { fontSize: 18, fontWeight: '800' },
  fiyat: { fontSize: 26, fontWeight: '900', marginVertical: 6, fontVariant: ['tabular-nums'] },
  urunAciklama: { fontSize: 12, textAlign: 'center', lineHeight: 17 },
  magazaUyari: { textAlign: 'center', marginTop: 14, fontSize: 13 },
  aralik: { marginTop: 12 },
  kosullar: { fontSize: 11, lineHeight: 16, marginTop: 16, textAlign: 'center' },
  baglantilar: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 10 },
  baglanti: { fontSize: 13, fontWeight: '700', textDecorationLine: 'underline', padding: 8 },
  merkez: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  buyukEmoji: { fontSize: 72 },
  tesekkur: { fontSize: 18, fontWeight: '700' },
});
