// Oyuncular ekranı: 4 isim + emoji seçici, "Aynı ekiple başla" kısayolu.

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Buton } from '@/bilesenler/Buton';
import { OYUNCU_EMOJILERI } from '@/core/sabitler';
import type { Oyuncu } from '@/core/tipler';
import { kimlikUret } from '@/store/depo';
import { useMasaStore } from '@/store/masaStore';
import { useRenkler } from '@/tema/renkler';

export default function OyuncularEkrani() {
  const router = useRouter();
  const r = useRenkler();
  const { masaKur, sonOyuncular, aktifMasa } = useMasaStore();

  const [adlar, setAdlar] = useState<string[]>(['', '', '', '']);
  const [emojiler, setEmojiler] = useState<string[]>(
    OYUNCU_EMOJILERI.slice(0, 4),
  );
  const [masaAdi, setMasaAdi] = useState('');
  const [acikEmojiSecici, setAcikEmojiSecici] = useState<number | null>(null);

  const baslat = (oyuncular: [Oyuncu, Oyuncu, Oyuncu, Oyuncu], ad?: string) => {
    if (aktifMasa) {
      Alert.alert(
        'Devam eden masa var',
        'Yeni masa kurarsanız devam eden masa silinir. Emin misiniz?',
        [
          { text: 'Vazgeç', style: 'cancel' },
          {
            text: 'Yeni Masa Kur',
            style: 'destructive',
            onPress: () => {
              masaKur(oyuncular, ad);
              router.replace('/masa');
            },
          },
        ],
      );
      return;
    }
    masaKur(oyuncular, ad);
    router.replace('/masa');
  };

  const kurVeBaslat = () => {
    // Boş isimlere "Oyuncu N" ata
    const temizAdlar = adlar.map((a, i) => a.trim() || `Oyuncu ${i + 1}`);
    // Tekrarlayan isme izin verme
    const kucukler = temizAdlar.map((a) => a.toLocaleLowerCase('tr'));
    if (new Set(kucukler).size !== 4) {
      Alert.alert('İsimler çakışıyor', 'Her oyuncunun adı farklı olmalı.');
      return;
    }
    const oyuncular = temizAdlar.map((ad, i) => ({
      id: kimlikUret(),
      ad,
      emoji: emojiler[i],
    })) as [Oyuncu, Oyuncu, Oyuncu, Oyuncu];
    baslat(oyuncular, masaAdi);
  };

  const ayniEkip = () => {
    if (!sonOyuncular || sonOyuncular.length !== 4) return;
    const oyuncular = sonOyuncular.map((o) => ({ ...o, id: kimlikUret() })) as [
      Oyuncu,
      Oyuncu,
      Oyuncu,
      Oyuncu,
    ];
    baslat(oyuncular);
  };

  return (
    <ScrollView
      style={{ backgroundColor: r.zemin }}
      contentContainerStyle={stiller.icerik}
      keyboardShouldPersistTaps="handled"
    >
      {sonOyuncular && sonOyuncular.length === 4 && (
        <Buton
          baslik={`Aynı ekiple başla (${sonOyuncular.map((o) => o.ad).join(', ')})`}
          tur="ikincil"
          onPress={ayniEkip}
          stil={stiller.aralik}
        />
      )}

      {adlar.map((ad, i) => (
        <View key={i} style={stiller.oyuncuSatiri}>
          <Pressable
            accessibilityLabel={`${i + 1}. oyuncu için emoji seç`}
            onPress={() => setAcikEmojiSecici(acikEmojiSecici === i ? null : i)}
            style={[stiller.emojiKutusu, { backgroundColor: r.zeminKoyu, borderColor: r.cizgi }]}
          >
            <Text style={stiller.emoji}>{emojiler[i]}</Text>
          </Pressable>
          <TextInput
            value={ad}
            onChangeText={(yeni) => {
              const kopya = [...adlar];
              kopya[i] = yeni;
              setAdlar(kopya);
            }}
            placeholder={`Oyuncu ${i + 1}`}
            placeholderTextColor={r.soluk}
            maxLength={14}
            style={[
              stiller.girdi,
              { backgroundColor: r.zeminKoyu, color: r.metin, borderColor: r.cizgi },
            ]}
          />
        </View>
      ))}

      {acikEmojiSecici !== null && (
        <View style={[stiller.emojiPaleti, { backgroundColor: r.zeminKoyu, borderColor: r.altin }]}>
          {OYUNCU_EMOJILERI.map((e) => (
            <Pressable
              key={e}
              onPress={() => {
                const kopya = [...emojiler];
                kopya[acikEmojiSecici] = e;
                setEmojiler(kopya);
                setAcikEmojiSecici(null);
              }}
              style={stiller.emojiSecim}
            >
              <Text style={stiller.emoji}>{e}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <TextInput
        value={masaAdi}
        onChangeText={setMasaAdi}
        placeholder="Masa adı (opsiyonel) — ör. Cuma Akşamı"
        placeholderTextColor={r.soluk}
        maxLength={30}
        style={[
          stiller.girdi,
          stiller.masaAdiGirdisi,
          { backgroundColor: r.zeminKoyu, color: r.metin, borderColor: r.cizgi },
        ]}
      />

      <Buton baslik="MASAYI KUR" buyuk onPress={kurVeBaslat} />
    </ScrollView>
  );
}

const stiller = StyleSheet.create({
  icerik: { padding: 20, gap: 12 },
  aralik: { marginBottom: 8 },
  oyuncuSatiri: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  emojiKutusu: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 28 },
  girdi: {
    flex: 1,
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  masaAdiGirdisi: { marginTop: 4 },
  emojiPaleti: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 2,
    borderRadius: 14,
    padding: 8,
    gap: 4,
  },
  emojiSecim: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
