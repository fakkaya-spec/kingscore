import React, { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const RENKLER = ['#D4AF37', '#E4574F', '#6FCF97', '#F5EFE0', '#6EA8FE'];
const PARCA_SAYISI = 26;

interface ParcaProps {
  gecikme: number;
  x: number;
  renk: string;
  donus: number;
  sure: number;
}

function Parca({ gecikme, x, renk, donus, sure }: ParcaProps) {
  const ilerleme = useSharedValue(0);

  useEffect(() => {
    ilerleme.value = withDelay(
      gecikme,
      withTiming(1, { duration: sure, easing: Easing.in(Easing.quad) }),
    );
  }, [ilerleme, gecikme, sure]);

  const yukseklik = Dimensions.get('window').height;
  const stil = useAnimatedStyle(() => ({
    transform: [
      { translateY: ilerleme.value * yukseklik },
      { rotate: `${ilerleme.value * donus}deg` },
    ],
    opacity: 1 - ilerleme.value * 0.6,
  }));

  return (
    <Animated.View
      style={[
        stiller.parca,
        stil,
        { left: x, backgroundColor: renk },
      ]}
    />
  );
}

/** İndekse bağlı deterministik "rasgele" değer (0..1). Render saf kalır. */
function sacilim(i: number, tuz: number): number {
  const deger = Math.sin(i * 12.9898 + tuz * 78.233) * 43758.5453;
  return deger - Math.floor(deger);
}

/** Ekranın üstünden yağan konfeti. Yaklaşık 1.5 saniyede tamamlanır. */
export function Konfeti() {
  const genislik = Dimensions.get('window').width;
  const parcalar = useMemo(
    () =>
      Array.from({ length: PARCA_SAYISI }, (_, i) => ({
        id: i,
        x: sacilim(i, 1) * genislik,
        renk: RENKLER[i % RENKLER.length],
        gecikme: sacilim(i, 2) * 300,
        donus: 360 + sacilim(i, 3) * 720,
        sure: 900 + sacilim(i, 4) * 500,
      })),
    [genislik],
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {parcalar.map((p) => (
        <Parca key={p.id} gecikme={p.gecikme} x={p.x} renk={p.renk} donus={p.donus} sure={p.sure} />
      ))}
    </View>
  );
}

const stiller = StyleSheet.create({
  parca: {
    position: 'absolute',
    top: -20,
    width: 10,
    height: 14,
    borderRadius: 3,
  },
});
