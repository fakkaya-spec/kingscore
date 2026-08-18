// Güncel skor şeridi: 4 oyuncunun anlık toplamlarını tek satırda gösterir.
// Oyun seçimi ve el girişi sırasında "kaçtayım?" sorusuna ekrandan bakılır.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { toplamSkorlar } from '@/core/skor';
import type { Masa } from '@/core/tipler';
import { useRenkler } from '@/tema/renkler';

export function SkorSeridi({ masa }: { masa: Masa }) {
  const r = useRenkler();
  const toplamlar = toplamSkorlar(masa);

  return (
    <View style={[stiller.serit, { backgroundColor: r.zeminKoyu, borderColor: r.cizgi }]}>
      {masa.oyuncular.map((o) => {
        const puan = toplamlar[o.id] ?? 0;
        return (
          <View key={o.id} style={stiller.hucre}>
            <Text numberOfLines={1} style={[stiller.ad, { color: r.soluk }]}>
              {o.ad}
            </Text>
            <Text
              allowFontScaling={false}
              adjustsFontSizeToFit
              numberOfLines={1}
              style={[
                stiller.puan,
                { color: puan > 0 ? r.yesil : puan < 0 ? r.kirmizi : r.soluk },
              ]}
            >
              {puan > 0 ? `+${puan}` : puan}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const stiller = StyleSheet.create({
  serit: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  hucre: { flex: 1, alignItems: 'center', gap: 1 },
  ad: { fontSize: 12, fontWeight: '700', maxWidth: '95%' },
  puan: { fontSize: 16, fontWeight: '900', fontVariant: ['tabular-nums'] },
});
