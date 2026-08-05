// Ayarlar: sesler, animasyonlar, King kuralı, masa teması, puan tablosu, yedekleme.

import { useRouter } from 'expo-router';
import { Check, Lock } from 'lucide-react-native';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Buton } from '@/bilesenler/Buton';
import { disaAktar, iceAktar } from '@/servisler/yedekleme';
import { useAyarStore, type Tema } from '@/store/ayarStore';
import { usePro } from '@/store/proStore';
import { TEMALAR, TEMA_ADLARI, useRenkler } from '@/tema/renkler';

const TEMA_SIRASI: Tema[] = ['cuha', 'ahsap', 'gece', 'yaz'];

export default function AyarlarEkrani() {
  const router = useRouter();
  const r = useRenkler();
  const ayarlar = useAyarStore();
  const proMu = usePro();

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
        'Bir oyuncu King yapınca masa erken biter',
        ayarlar.kingdeBiter,
        ayarlar.kingdeBiterAc,
      )}

      {/* Masa teması: yeşil çuha ücretsiz; diğerleri Premium */}
      <Text style={[stiller.bolum, { color: r.altin }]}>Masa Teması</Text>
      <View style={stiller.temalar}>
        {TEMA_SIRASI.map((tema) => {
          const kilitli = tema !== 'cuha' && !proMu;
          const secili = ayarlar.tema === tema;
          const onizleme = TEMALAR[tema];
          return (
            <Pressable
              key={tema}
              onPress={() => {
                if (kilitli) {
                  router.push('/paywall');
                  return;
                }
                ayarlar.temaSec(tema);
              }}
              style={[
                stiller.temaKarti,
                {
                  backgroundColor: onizleme.zemin,
                  borderColor: secili ? r.altin : r.cizgi,
                  borderWidth: secili ? 3 : 1,
                },
              ]}
            >
              <View style={stiller.temaAdiSatiri}>
                {kilitli && <Lock color={onizleme.metin} size={14} strokeWidth={2.25} />}
                {!kilitli && secili && (
                  <Check color={onizleme.metin} size={14} strokeWidth={3} />
                )}
                <Text style={[stiller.temaAdi, { color: onizleme.metin }]}>
                  {TEMA_ADLARI[tema]}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Buton
        baslik={proMu ? 'Puan Tablosunu Özelleştir' : 'Puan Tablosunu Özelleştir (Premium)'}
        tur="ikincil"
        onPress={() => router.push('/ayarlar/puan-tablosu')}
        stil={stiller.aralik}
      />
      <Buton baslik="King Skor Premium" onPress={() => router.push('/paywall')} stil={stiller.aralik} />

      <Text style={[stiller.bolum, { color: r.altin }]}>Yedekleme</Text>
      <Buton baslik="Masaları Dışa Aktar" tur="ikincil" onPress={() => disaAktar()} stil={stiller.aralik} />
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
  temalar: { flexDirection: 'row', gap: 10, marginTop: 12 },
  temaKarti: {
    flex: 1,
    minHeight: 72,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  temaAdiSatiri: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  temaAdi: { fontSize: 13, fontWeight: '800', textAlign: 'center' },
  surum: { textAlign: 'center', marginTop: 24, fontSize: 12 },
});
