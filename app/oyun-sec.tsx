// Oyun seçim ekranı (modal): sıradaki oyuncunun kalan haklarına göre filtrelenmiş kartlar.
// KOZ seçilirse ikinci adımda 4 koz simgesi gösterilir.

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  KOZLAR,
  KOZ_ADI,
  KOZ_SIMGESI,
  OYUN_ADI,
  oyunAciklamasi,
} from '@/core/sabitler';
import { secilebilirOyunlar, siradakiOyuncu } from '@/core/skor';
import type { Koz, OyunTuru } from '@/core/tipler';
import { hafifTitret } from '@/servisler/titresim';
import { useMasaStore } from '@/store/masaStore';
import { useRenkler } from '@/tema/renkler';

export default function OyunSecEkrani() {
  const router = useRouter();
  const r = useRenkler();
  const masa = useMasaStore((d) => d.aktifMasa);
  const [kozAdimi, setKozAdimi] = useState(false);

  if (!masa) return null;
  const oyuncu = siradakiOyuncu(masa);
  if (!oyuncu) return null;

  const secenekler = secilebilirOyunlar(masa, oyuncu.id);

  const oyunaGit = (tur: OyunTuru, koz?: Koz) => {
    hafifTitret();
    router.replace({
      pathname: '/el-giris',
      params: { tur, koz: koz ?? '', secen: oyuncu.id },
    });
  };

  if (kozAdimi) {
    return (
      <ScrollView style={{ backgroundColor: r.zemin }} contentContainerStyle={stiller.icerik}>
        <Text style={[stiller.baslik, { color: r.metin }]}>
          {oyuncu.emoji} {oyuncu.ad} — kozunu seç
        </Text>
        <View style={stiller.kozIzgara}>
          {KOZLAR.map((koz) => {
            const kirmizi = koz === 'KUPA' || koz === 'KARO';
            return (
              <Pressable
                key={koz}
                onPress={() => oyunaGit('KOZ', koz)}
                style={[stiller.kozKarti, { backgroundColor: r.kart }]}
              >
                <Text style={[stiller.kozSimge, { color: kirmizi ? '#C1272D' : '#1A1A1A' }]}>
                  {KOZ_SIMGESI[koz]}
                </Text>
                <Text style={[stiller.kozAdi, { color: r.kartUstu }]}>{KOZ_ADI[koz]}</Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable onPress={() => setKozAdimi(false)} style={stiller.geriTusu}>
          <Text style={{ color: r.soluk, fontSize: 16 }}>← Oyun seçimine dön</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: r.zemin }} contentContainerStyle={stiller.icerik}>
      <Text style={[stiller.baslik, { color: r.metin }]}>
        {oyuncu.emoji} {oyuncu.ad} — oyununu seç
      </Text>
      {secenekler.map(({ tur, secilebilir, neden }) => (
        <Pressable
          key={tur}
          disabled={!secilebilir}
          onPress={() => (tur === 'KOZ' ? setKozAdimi(true) : oyunaGit(tur))}
          style={[
            stiller.oyunKarti,
            { backgroundColor: secilebilir ? r.kart : r.pasif, opacity: secilebilir ? 1 : 0.6 },
          ]}
        >
          <View style={stiller.oyunSatiri}>
            <Text style={[stiller.oyunAdi, { color: secilebilir ? r.kartUstu : '#4a4a4a' }]}>
              {OYUN_ADI[tur]}
              {tur === 'KOZ' ? ' ♠♥♦♣' : ''}
            </Text>
            {!secilebilir && (
              <Text style={[stiller.neden, { color: '#4a4a4a' }]}>{neden}</Text>
            )}
          </View>
          <Text style={[stiller.aciklama, { color: secilebilir ? '#5a5142' : '#4a4a4a' }]}>
            {OYUN_ADI[tur]} — {oyunAciklamasi(tur, masa.puanTablosu)}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const stiller = StyleSheet.create({
  icerik: { padding: 16, gap: 10 },
  baslik: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  oyunKarti: {
    borderRadius: 16,
    padding: 16,
    minHeight: 64,
  },
  oyunSatiri: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  oyunAdi: { fontSize: 20, fontWeight: '800' },
  neden: { fontSize: 13, fontWeight: '700' },
  aciklama: { fontSize: 13, marginTop: 4 },
  kozIzgara: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  kozKarti: {
    width: '45%',
    aspectRatio: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kozSimge: { fontSize: 72 },
  kozAdi: { fontSize: 18, fontWeight: '700', marginTop: 4 },
  geriTusu: { alignItems: 'center', padding: 16, minHeight: 48 },
});
