// King Skor Pro paywall'u. Tek ürün: ömür boyu (non-consumable), abonelik YOK.
// Fiyat mağazadan dinamik okunur. Karanlık desen yok; X ile kapatınca hiçbir şey kaybolmaz.

import { Stack, useRouter } from 'expo-router';
import { Check, Crown, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Buton } from '@/bilesenler/Buton';
import { geriYukle, proPaketiGetir, satinAl, type ProPaketi } from '@/servisler/satinalma';
import { basariTitret } from '@/servisler/titresim';
import { usePro } from '@/store/proStore';
import { useRenkler } from '@/tema/renkler';

const OZELLIKLER = [
  'Sınırsız masa (günlük limit kalkar)',
  'Geçmiş masalar ve oyuncu istatistikleri',
  'Puan tablosunu özelleştirme',
  'Filigransız skor paylaşımı',
  'Ekstra masa temaları: ahşap & gece mavisi',
];

export default function PaywallEkrani() {
  const router = useRouter();
  const r = useRenkler();
  const proMu = usePro();
  const [paket, setPaket] = useState<ProPaketi | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [islemde, setIslemde] = useState(false);

  useEffect(() => {
    proPaketiGetir().then((gelen) => {
      setPaket(gelen);
      setYukleniyor(false);
    });
  }, []);

  const al = async () => {
    if (!paket || islemde) return;
    setIslemde(true);
    const basarili = await satinAl(paket.paket);
    setIslemde(false);
    if (basarili) {
      basariTitret();
      Alert.alert('Hoş geldin!', 'King Skor Pro aktif. İyi oyunlar!');
    }
  };

  const geriYukleBas = async () => {
    setIslemde(true);
    const bulundu = await geriYukle();
    setIslemde(false);
    Alert.alert(
      bulundu ? 'Geri yüklendi' : 'Satın alım bulunamadı',
      bulundu ? 'King Skor Pro aktif.' : 'Bu hesapla yapılmış bir satın alım bulunamadı.',
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
        <Text style={[stiller.tesekkur, { color: r.metin }]}>King Skor Pro aktif. İyi oyunlar!</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: r.zemin }} contentContainerStyle={stiller.icerik}>
      <Stack.Screen options={{ headerRight: () => kapatmaTusu }} />

      <Text style={[stiller.baslik, { color: r.altin }]}>King Skor Pro</Text>

      {/* Tek büyük kart: ömür boyu */}
      <Pressable
        onPress={al}
        disabled={islemde || !paket}
        style={[stiller.urunKarti, { backgroundColor: r.kart, borderColor: r.altin }]}
      >
        <Text style={[stiller.urunAdi, { color: r.kartUstu }]}>Ömür Boyu</Text>
        <Text style={[stiller.fiyat, { color: r.kartUstu }]}>
          {paket?.fiyatMetni ?? (yukleniyor ? '…' : '—')}
        </Text>
        <Text style={[stiller.urunAciklama, { color: '#5a5142' }]}>
          Bir kez öde, ömür boyu kullan. Abonelik yok, yenileme yok.
        </Text>
      </Pressable>

      <View style={stiller.ozellikler}>
        {OZELLIKLER.map((o) => (
          <View key={o} style={stiller.ozellikSatiri}>
            <Check color={r.altin} size={18} strokeWidth={3} />
            <Text style={[stiller.ozellik, { color: r.metin }]}>{o}</Text>
          </View>
        ))}
      </View>

      {!yukleniyor && !paket && (
        <Text style={[stiller.magazaUyari, { color: r.soluk }]}>
          Mağazaya şu anda ulaşılamıyor. İnternet bağlantınızı kontrol edip tekrar deneyin.
        </Text>
      )}

      <Buton
        baslik={islemde ? 'İşleniyor…' : 'Pro’ya Geç'}
        buyuk
        pasif={islemde || !paket}
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
  urunKarti: {
    borderRadius: 20,
    borderWidth: 3,
    padding: 22,
    alignItems: 'center',
  },
  urunAdi: { fontSize: 20, fontWeight: '800' },
  fiyat: { fontSize: 40, fontWeight: '900', marginVertical: 6, fontVariant: ['tabular-nums'] },
  urunAciklama: { fontSize: 14, textAlign: 'center', lineHeight: 20, fontWeight: '600' },
  ozellikler: { gap: 8, marginTop: 18, alignSelf: 'center' },
  ozellikSatiri: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ozellik: { fontSize: 16, fontWeight: '600' },
  magazaUyari: { textAlign: 'center', marginTop: 14, fontSize: 13 },
  aralik: { marginTop: 12 },
  baglantilar: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 14 },
  baglanti: { fontSize: 13, fontWeight: '700', textDecorationLine: 'underline', padding: 8 },
  kapatTusu: { minWidth: 48, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  merkez: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  tesekkur: { fontSize: 18, fontWeight: '700' },
});
