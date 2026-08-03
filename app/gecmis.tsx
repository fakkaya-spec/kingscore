// Geçmiş masalar (premium): liste + JSON dışa/içe aktarma.

import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Buton } from '@/bilesenler/Buton';
import { toplamSkorlar } from '@/core/skor';
import { disaAktar, iceAktar } from '@/servisler/yedekleme';
import { useMasaStore } from '@/store/masaStore';
import { usePremium } from '@/store/premiumStore';
import { useRenkler } from '@/tema/renkler';

export default function GecmisEkrani() {
  const router = useRouter();
  const r = useRenkler();
  const gecmis = useMasaStore((d) => d.gecmis);
  const gecmistenSil = useMasaStore((d) => d.gecmistenSil);
  const premiumMu = usePremium();

  if (!premiumMu) {
    // Premium değilse nazikçe paywall'a yönlendir
    return (
      <View style={[stiller.kilit, { backgroundColor: r.zemin }]}>
        <Text style={stiller.kilitEmoji}>🔒</Text>
        <Text style={[stiller.kilitMetin, { color: r.metin }]}>
          Geçmiş masalar ve istatistikler King Skor Pro ile açılır.
        </Text>
        <Buton baslik="Pro'yu İncele" onPress={() => router.push('/paywall')} />
      </View>
    );
  }

  const iceAl = async () => {
    const sonuc = await iceAktar();
    if (sonuc === -1) Alert.alert('İçe aktarılamadı', 'Dosya geçerli bir King Skor yedeği değil.');
    else if (sonuc >= 0) Alert.alert('İçe aktarıldı', `${sonuc} yeni masa eklendi.`);
  };

  return (
    <View style={[stiller.govde, { backgroundColor: r.zemin }]}>
      <FlatList
        data={gecmis}
        keyExtractor={(m) => m.id}
        contentContainerStyle={stiller.liste}
        ListEmptyComponent={
          <Text style={[stiller.bos, { color: r.soluk }]}>
            Henüz bitmiş masa yok. İlk masanızı oynayın!
          </Text>
        }
        renderItem={({ item }) => {
          const toplamlar = toplamSkorlar(item);
          const kazanan = [...item.oyuncular].sort(
            (a, b) => (toplamlar[b.id] ?? 0) - (toplamlar[a.id] ?? 0),
          )[0];
          const tarih = new Date(item.baslangic).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });
          return (
            <Pressable
              onPress={() => router.push({ pathname: '/gecmis-detay', params: { id: item.id } })}
              onLongPress={() =>
                Alert.alert('Masayı sil', 'Bu masa geçmişten silinsin mi?', [
                  { text: 'Vazgeç', style: 'cancel' },
                  { text: 'Sil', style: 'destructive', onPress: () => gecmistenSil(item.id) },
                ])
              }
              style={[stiller.kart, { backgroundColor: r.zeminKoyu, borderColor: r.cizgi }]}
            >
              <Text style={[stiller.kartBaslik, { color: r.metin }]}>
                {item.ad || tarih}
              </Text>
              <Text style={[stiller.kartAlt, { color: r.soluk }]} numberOfLines={1}>
                👑 {kazanan.ad} ({(toplamlar[kazanan.id] ?? 0) > 0 ? '+' : ''}
                {toplamlar[kazanan.id] ?? 0}) · {item.eller.length} el · {tarih}
              </Text>
            </Pressable>
          );
        }}
      />
      <View style={stiller.altAlan}>
        <Buton baslik="Yedeği Dışa Aktar (JSON)" tur="ikincil" onPress={() => disaAktar()} />
        <Buton baslik="Yedekten İçe Aktar" tur="ikincil" onPress={iceAl} stil={stiller.aralik} />
      </View>
    </View>
  );
}

const stiller = StyleSheet.create({
  govde: { flex: 1 },
  liste: { padding: 16, gap: 10 },
  bos: { textAlign: 'center', marginTop: 48, fontSize: 15 },
  kart: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  kartBaslik: { fontSize: 17, fontWeight: '800' },
  kartAlt: { fontSize: 13, marginTop: 4 },
  altAlan: { padding: 16 },
  aralik: { marginTop: 8 },
  kilit: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  kilitEmoji: { fontSize: 64 },
  kilitMetin: { fontSize: 16, textAlign: 'center' },
});
