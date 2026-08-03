// Ayarlar: sesler, animasyonlar, King kuralı, tema (premium), puan tablosu, yedekleme.

import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Buton } from '@/bilesenler/Buton';
import { disaAktar, iceAktar } from '@/servisler/yedekleme';
import { useAyarStore } from '@/store/ayarStore';
import { usePremium } from '@/store/premiumStore';
import { useRenkler } from '@/tema/renkler';

export default function AyarlarEkrani() {
  const router = useRouter();
  const r = useRenkler();
  const ayarlar = useAyarStore();
  const premiumMu = usePremium();

  const satir = (baslik: string, aciklama: string, deger: boolean, degistir: (v: boolean) => void) => (
    <View style={[stiller.satir, { borderBottomColor: r.cizgi }]}>
      <View style={stiller.satirMetinleri}>
        <Text style={[stiller.satirBaslik, { color: r.metin }]}>{baslik}</Text>
        <Text style={[stiller.satirAciklama, { color: r.soluk }]}>{aciklama}</Text>
      </View>
      <Switch
        value={deger}
        onValueChange={degistir}
        trackColor={{ true: r.altin, false: r.pasif }}
        thumbColor="#F5EFE0"
      />
    </View>
  );

  const iceAl = async () => {
    const sonuc = await iceAktar();
    if (sonuc === -1) Alert.alert('İçe aktarılamadı', 'Dosya geçerli bir King Skor yedeği değil.');
    else if (sonuc >= 0) Alert.alert('İçe aktarıldı', `${sonuc} yeni masa eklendi.`);
  };

  return (
    <ScrollView style={{ backgroundColor: r.zemin }} contentContainerStyle={stiller.icerik}>
      {satir('Sesler', 'Horoz, tavuk ve kart sesleri', ayarlar.sesler, ayarlar.seslerAc)}
      {satir('Animasyonlar', 'Konfeti, taç ve mikro animasyonlar', ayarlar.animasyonlar, ayarlar.animasyonlarAc)}
      {satir(
        "King'de oyun biter",
        'Bir oyuncu King yapınca masa erken biter (varsayılan kapalı)',
        ayarlar.kingdeBiter,
        ayarlar.kingdeBiterAc,
      )}
      {satir(
        premiumMu ? 'Açık tema' : 'Açık tema 🔒',
        premiumMu ? 'Krem zeminli aydınlık görünüm' : 'Tema seçimi King Skor Pro ile açılır',
        ayarlar.tema === 'acik',
        (v) => {
          if (!premiumMu) {
            router.push('/paywall');
            return;
          }
          ayarlar.temaSec(v ? 'acik' : 'koyu');
        },
      )}

      <Buton
        baslik={premiumMu ? 'Puan Tablosunu Özelleştir' : 'Puan Tablosunu Özelleştir 🔒'}
        tur="ikincil"
        onPress={() => router.push(premiumMu ? '/ayarlar/puan-tablosu' : '/paywall')}
        stil={stiller.aralik}
      />
      <Buton baslik="King Skor Pro" onPress={() => router.push('/paywall')} stil={stiller.aralik} />

      <Text style={[stiller.bolum, { color: r.altin }]}>Yedekleme</Text>
      <Buton baslik="Masaları Dışa Aktar (JSON)" tur="ikincil" onPress={() => disaAktar()} stil={stiller.aralik} />
      <Buton baslik="Yedekten İçe Aktar" tur="ikincil" onPress={iceAl} stil={stiller.aralik} />

      <Text style={[stiller.bolum, { color: r.altin }]}>Hakkında</Text>
      <Buton baslik="Gizlilik Politikası" tur="ikincil" onPress={() => router.push('/gizlilik')} stil={stiller.aralik} />
      <Text style={[stiller.surum, { color: r.soluk }]}>
        King Skor 1.0 · Tüm veriler cihazınızda
      </Text>
    </ScrollView>
  );
}

const stiller = StyleSheet.create({
  icerik: { padding: 20, paddingBottom: 40 },
  satir: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  satirMetinleri: { flex: 1 },
  satirBaslik: { fontSize: 17, fontWeight: '700' },
  satirAciklama: { fontSize: 13, marginTop: 2 },
  aralik: { marginTop: 10 },
  bolum: { fontSize: 15, fontWeight: '900', marginTop: 24, letterSpacing: 1 },
  surum: { textAlign: 'center', marginTop: 24, fontSize: 12 },
});
