// Kurallar & puan tablosu ekranı (o anki ayarlardaki puanlarla).

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { HEDEF_BIRIM, OYUN_ADI, PUAN_ALANI } from '@/core/sabitler';
import type { OyunTuru } from '@/core/tipler';
import { useAyarStore } from '@/store/ayarStore';
import { useRenkler } from '@/tema/renkler';

const SIRA: OyunTuru[] = [
  'KOZ',
  'EL_ALMAZ',
  'KUPA_ALMAZ',
  'KIZ_ALMAZ',
  'ERKEK_ALMAZ',
  'SON_IKI',
  'RIFKI',
];

export default function KurallarEkrani() {
  const r = useRenkler();
  const tablo = useAyarStore((d) => d.puanTablosu);

  return (
    <ScrollView style={{ backgroundColor: r.zemin }} contentContainerStyle={stiller.icerik}>
      <Text style={[stiller.baslik, { color: r.altin }]}>Oyunun Özeti</Text>
      <Text style={[stiller.metin, { color: r.metin }]}>
        4 oyuncu, 52 kart, herkese 13 kart. Toplam 20 el oynanır.{'\n\n'}
        Her oyuncunun 2 koz + 3 ceza söyleme hakkı vardır (4 × 5 = 20 el).{'\n'}
        Her ceza türü masada en fazla 2 kez oynanabilir (6 × 2 = 12 ceza eli).{'\n'}
        Koz elleri: 4 × 2 = 8. Toplam 12 + 8 = 20 el.{'\n\n'}
        Bir koz elinde 11 veya daha fazla el alan oyuncu King yapmış sayılır. 👑
      </Text>

      <Text style={[stiller.baslik, { color: r.altin }]}>Puan Tablosu</Text>
      <View style={[stiller.tablo, { borderColor: r.altin, backgroundColor: r.zeminKoyu }]}>
        {SIRA.map((tur) => {
          const birim = tablo[PUAN_ALANI[tur]];
          const toplam = birim * HEDEF_BIRIM[tur];
          return (
            <View key={tur} style={[stiller.satir, { borderBottomColor: r.cizgi }]}>
              <Text style={[stiller.oyun, { color: r.metin }]}>{OYUN_ADI[tur]}</Text>
              <Text style={[stiller.birim, { color: birim > 0 ? r.yesil : r.kirmizi }]}>
                {birim > 0 ? `+${birim}` : birim}
              </Text>
              <Text style={[stiller.toplam, { color: r.soluk }]}>
                {toplam > 0 ? `+${toplam}` : toplam}
              </Text>
            </View>
          );
        })}
        <View style={stiller.satir}>
          <Text style={[stiller.oyun, { color: r.soluk, fontSize: 12 }]}>
            (oyun · birim puan · toplam dağıtılan)
          </Text>
        </View>
      </View>

      <Text style={[stiller.baslik, { color: r.altin }]}>Altın Kural</Text>
      <Text style={[stiller.metin, { color: r.metin }]}>
        Bir ceza turu setinin (6 tür) toplamı −2600’dür; iki kez oynanınca −5200 eder.{'\n'}
        8 koz eli × +650 = +5200.{'\n\n'}
        Bu yüzden oyun bitiminde 4 oyuncunun puan toplamı MUTLAKA 0 olmalıdır. Uygulama bunu
        her el girişinde denetler; tutmayan giriş kaydedilemez.
      </Text>

      <Text style={[stiller.notMetni, { color: r.soluk }]}>
        Yörenize göre puanları Ayarlar → Puan Tablosu’ndan değiştirebilirsiniz. Masa
        kurulurken o anki puanlar masaya kopyalanır ve oyun boyunca kilitli kalır.
      </Text>
    </ScrollView>
  );
}

const stiller = StyleSheet.create({
  icerik: { padding: 20, paddingBottom: 40 },
  baslik: { fontSize: 20, fontWeight: '900', marginTop: 16, marginBottom: 8 },
  metin: { fontSize: 15, lineHeight: 22 },
  tablo: { borderWidth: 2, borderRadius: 14, padding: 12 },
  satir: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  oyun: { flex: 1, fontSize: 16, fontWeight: '700' },
  birim: { width: 70, textAlign: 'right', fontSize: 16, fontWeight: '800', fontVariant: ['tabular-nums'] },
  toplam: { width: 70, textAlign: 'right', fontSize: 14, fontVariant: ['tabular-nums'] },
  notMetni: { fontSize: 13, marginTop: 16, fontStyle: 'italic', lineHeight: 19 },
});
