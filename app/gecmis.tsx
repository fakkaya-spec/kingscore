// Geçmiş masalar + oyuncu istatistikleri (Pro). Ücretsiz kullanıcı ekranı görür
// ama içerik kilit rozetiyle kapalıdır — ne alacağını bilsin.

import { useRouter } from 'expo-router';
import { Crown, Lock } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Buton } from '@/bilesenler/Buton';
import { genelIstatistikler, toplamSkorlar } from '@/core/skor';
import { disaAktar, iceAktar } from '@/servisler/yedekleme';
import { useMasaStore } from '@/store/masaStore';
import { usePro } from '@/store/proStore';
import { useRenkler } from '@/tema/renkler';

export default function GecmisEkrani() {
  const router = useRouter();
  const r = useRenkler();
  const gecmis = useMasaStore((d) => d.gecmis);
  const gecmistenSil = useMasaStore((d) => d.gecmistenSil);
  const proMu = usePro();

  const istatistik = useMemo(
    () => (proMu && gecmis.length > 0 ? genelIstatistikler(gecmis) : null),
    [proMu, gecmis],
  );

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
        ListHeaderComponent={
          <>
            {!proMu && (
              <Pressable
                onPress={() => router.push('/paywall')}
                style={[stiller.kilitBandi, { backgroundColor: r.zeminKoyu, borderColor: r.altin }]}
              >
                <View style={stiller.kilitSatiri}>
                  <Lock color={r.altin} size={16} strokeWidth={2.25} />
                  <Text style={[stiller.kilitBaslik, { color: r.altin }]}>
                    Geçmiş masalar ve istatistikler Premium ile açılır
                  </Text>
                </View>
                <Text style={[stiller.kilitAlt, { color: r.soluk }]}>
                  En çok rıfkı yiyen · en çok King yapan · oyuncu ortalamaları
                </Text>
              </Pressable>
            )}
            {istatistik && (
              <View style={[stiller.istKutusu, { backgroundColor: r.zeminKoyu, borderColor: r.altin }]}>
                <Text style={[stiller.istBaslik, { color: r.altin }]}>
                  Genel İstatistikler ({istatistik.masaSayisi} masa)
                </Text>
                {istatistik.enCokRifkiYiyen && (
                  <Text style={[stiller.ist, { color: r.metin }]}>
                    ♥K En çok rıfkı yiyen: {istatistik.enCokRifkiYiyen.ad} (
                    {istatistik.enCokRifkiYiyen.adet} kez)
                  </Text>
                )}
                {istatistik.enCokKingYapan && (
                  <View style={stiller.kilitSatiri}>
                    <Crown color={r.altin} size={15} strokeWidth={2.25} />
                    <Text style={[stiller.ist, { color: r.metin }]}>
                      En çok King yapan: {istatistik.enCokKingYapan.ad} (
                      {istatistik.enCokKingYapan.adet} kez)
                    </Text>
                  </View>
                )}
                {istatistik.oyuncuOrtalamalari.slice(0, 6).map((o) => (
                  <Text key={o.ad} style={[stiller.ist, { color: r.soluk }]}>
                    {o.ad}: masa başına {o.ortalama > 0 ? '+' : ''}
                    {o.ortalama} puan ({o.masaSayisi} masa)
                  </Text>
                ))}
              </View>
            )}
          </>
        }
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
              onPress={() =>
                proMu
                  ? router.push({ pathname: '/gecmis-detay', params: { id: item.id } })
                  : router.push('/paywall')
              }
              onLongPress={() =>
                Alert.alert('Masayı sil', 'Bu masa geçmişten silinsin mi?', [
                  { text: 'Vazgeç', style: 'cancel' },
                  { text: 'Sil', style: 'destructive', onPress: () => gecmistenSil(item.id) },
                ])
              }
              style={[
                stiller.kart,
                { backgroundColor: r.zeminKoyu, borderColor: r.cizgi, opacity: proMu ? 1 : 0.6 },
              ]}
            >
              <View style={stiller.kilitSatiri}>
                {!proMu && <Lock color={r.soluk} size={15} strokeWidth={2.25} />}
                <Text style={[stiller.kartBaslik, { color: r.metin }]}>{item.ad || tarih}</Text>
              </View>
              {proMu ? (
                <View style={[stiller.kilitSatiri, stiller.kartAltSatiri]}>
                  <Crown color={r.altin} size={14} strokeWidth={2.25} />
                  <Text style={[stiller.kartAlt, { color: r.soluk }]} numberOfLines={1}>
                    {`${kazanan.ad} (${(toplamlar[kazanan.id] ?? 0) > 0 ? '+' : ''}${toplamlar[kazanan.id] ?? 0}) · ${item.eller.length} el · ${tarih}`}
                  </Text>
                </View>
              ) : (
                <Text style={[stiller.kartAlt, stiller.kartAltSatiri, { color: r.soluk }]}>
                  Detay için Premium gerekli
                </Text>
              )}
            </Pressable>
          );
        }}
      />
      <View style={stiller.altAlan}>
        <Buton baslik="Yedeği Dışa Aktar" tur="ikincil" onPress={() => disaAktar()} />
        <Buton baslik="Yedekten İçe Aktar" tur="ikincil" onPress={iceAl} stil={stiller.aralik} />
      </View>
    </View>
  );
}

const stiller = StyleSheet.create({
  govde: { flex: 1 },
  liste: { padding: 16 },
  kilitBandi: { borderWidth: 2, borderRadius: 14, padding: 14, marginBottom: 12 },
  kilitSatiri: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kilitBaslik: { fontSize: 15, fontWeight: '800', flex: 1 },
  kilitAlt: { fontSize: 13, marginTop: 4 },
  istKutusu: { borderWidth: 2, borderRadius: 14, padding: 14, marginBottom: 12, gap: 4 },
  istBaslik: { fontSize: 15, fontWeight: '900', marginBottom: 4 },
  ist: { fontSize: 14, fontWeight: '600' },
  bos: { textAlign: 'center', marginTop: 48, fontSize: 15 },
  kart: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  kartBaslik: { fontSize: 17, fontWeight: '800', flexShrink: 1 },
  kartAlt: { fontSize: 13, flexShrink: 1 },
  kartAltSatiri: { marginTop: 4 },
  altAlan: { padding: 16 },
  aralik: { marginTop: 8 },
});
