import { Crown } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Avatar } from './Avatar';
import { elBasligi, kalanHaklar, toplamSkorlar } from '@/core/skor';
import type { El, Masa } from '@/core/tipler';
import { useRenkler } from '@/tema/renkler';

interface Props {
  masa: Masa;
  onSatirUzunBas?: (el: El) => void;
  hakGoster?: boolean; // oyuncu adlarının altında kalan hak göstergesi
}

/** Klasik King tablosu: sütunlar oyuncular, satırlar eller, en altta KALAN. */
export function SkorTablosu({ masa, onSatirUzunBas, hakGoster = true }: Props) {
  const r = useRenkler();
  const toplamlar = toplamSkorlar(masa);
  const haklar = kalanHaklar(masa);

  return (
    <View style={[stiller.cerceve, { borderColor: r.altin, backgroundColor: r.zeminKoyu }]}>
      {/* Başlık satırı: oyuncular */}
      <View style={[stiller.satir, { borderBottomColor: r.altin, borderBottomWidth: 2 }]}>
        <View style={stiller.elSutunu}>
          <Text style={[stiller.elBaslik, { color: r.soluk }]}>EL</Text>
        </View>
        {masa.oyuncular.map((o) => (
          <View key={o.id} style={stiller.hucre}>
            <View style={stiller.oyuncuBasligi}>
              <Avatar emoji={o.emoji} foto={o.foto} boyut={18} />
              <Text style={[stiller.oyuncuAdi, { color: r.altin }]} numberOfLines={1}>
                {o.ad}
              </Text>
            </View>
            {hakGoster && (
              // Masadaki gelenek: koz hakkı YUVARLAK, ceza hakkı ÜÇGEN çizilir
              <View style={stiller.haklarSatiri}>
                <Text style={[stiller.haklar, { color: r.altin }]}>
                  {'●'.repeat(haklar[o.id]?.koz ?? 0)}
                </Text>
                <Text style={[stiller.haklar, { color: r.kirmizi }]}>
                  {'▲'.repeat(haklar[o.id]?.ceza ?? 0)}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* El satırları */}
      <ScrollView style={stiller.govde}>
        {masa.eller.length === 0 && (
          <Text style={[stiller.bosMetin, { color: r.soluk }]}>
            Henüz el girilmedi. Aşağıdan ilk eli girin.
          </Text>
        )}
        {masa.eller.map((el) => {
          const kingciId = el.kingMi
            ? Object.entries(el.adetler).find(([, a]) => a >= 11)?.[0]
            : undefined;
          return (
            <TouchableOpacity
              key={el.id}
              activeOpacity={onSatirUzunBas ? 0.6 : 1}
              onLongPress={() => onSatirUzunBas?.(el)}
              delayLongPress={350}
              style={[stiller.satir, { borderBottomColor: r.cizgi, borderBottomWidth: StyleSheet.hairlineWidth }]}
            >
              <View style={stiller.elSutunu}>
                <Text style={[stiller.elAdi, { color: el.tur === 'KOZ' ? r.altin : r.soluk }]} numberOfLines={1}>
                  {el.sira}. {elBasligi(el)}
                </Text>
              </View>
              {masa.oyuncular.map((o) => {
                const puan = el.puanlar[o.id] ?? 0;
                return (
                  <View key={o.id} style={[stiller.hucre, stiller.puanHucresi]}>
                    <Text
                      style={[
                        stiller.puan,
                        { color: puan > 0 ? r.yesil : puan < 0 ? r.kirmizi : r.soluk },
                      ]}
                    >
                      {puan > 0 ? `+${puan}` : puan}
                    </Text>
                    {kingciId === o.id && (
                      <Crown color={r.altin} size={14} strokeWidth={2.5} />
                    )}
                  </View>
                );
              })}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* KALAN toplam satırı */}
      <View style={[stiller.satir, stiller.kalanSatiri, { borderTopColor: r.altin }]}>
        <View style={stiller.elSutunu}>
          <Text style={[stiller.kalanBaslik, { color: r.altin }]}>KALAN</Text>
        </View>
        {masa.oyuncular.map((o) => {
          const t = toplamlar[o.id] ?? 0;
          return (
            <View key={o.id} style={stiller.hucre}>
              <Text style={[stiller.kalanPuan, { color: t > 0 ? r.yesil : t < 0 ? r.kirmizi : r.metin }]}>
                {t > 0 ? `+${t}` : t}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const stiller = StyleSheet.create({
  cerceve: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  govde: { flex: 1 },
  satir: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  elSutunu: { width: 102 },
  elBaslik: { fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  hucre: { flex: 1, alignItems: 'center' },
  puanHucresi: { flexDirection: 'row', justifyContent: 'center', gap: 3 },
  oyuncuBasligi: { flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: '100%' },
  oyuncuAdi: { fontSize: 14, fontWeight: '800', flexShrink: 1 },
  haklarSatiri: { flexDirection: 'row', gap: 6, marginTop: 3 },
  haklar: { fontSize: 13, fontWeight: '700', letterSpacing: 1.5 },
  elAdi: { fontSize: 14, fontWeight: '700' },
  puan: { fontSize: 19, fontWeight: '700', fontVariant: ['tabular-nums'] },
  bosMetin: { textAlign: 'center', padding: 24, fontSize: 15 },
  kalanSatiri: { borderTopWidth: 2, paddingVertical: 12 },
  kalanBaslik: { fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  kalanPuan: { fontSize: 22, fontWeight: '900', fontVariant: ['tabular-nums'] },
});
