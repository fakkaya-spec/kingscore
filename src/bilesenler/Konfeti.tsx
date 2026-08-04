// Ekranın üstünden yağan konfeti: yatay salınım + 3B çırpınma ile.
// Renkler marka paletinden; yaklaşık 2 saniyede tamamlanır.

import React, { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const RENKLER = ['#D4AF37', '#F5EFE0', '#C1272D', '#6FCF97', '#E8C766'];
const PARCA_SAYISI = 48;

interface ParcaProps {
  gecikme: number;
  x: number;
  renk: string;
  donus: number;
  sure: number;
  salinim: number; // yatay sürüklenme genliği (px, işaretli)
  boyut: number; // 0.7..1.3 ölçek
}

function Parca({ gecikme, x, renk, donus, sure, salinim, boyut }: ParcaProps) {
  const ilerleme = useSharedValue(0);

  useEffect(() => {
    ilerleme.value = withDelay(
      gecikme,
      withTiming(1, { duration: sure, easing: Easing.in(Easing.quad) }),
    );
  }, [ilerleme, gecikme, sure]);

  const yukseklik = Dimensions.get('window').height;
  const stil = useAnimatedStyle(() => {
    const t = ilerleme.value;
    return {
      transform: [
        { translateY: t * yukseklik },
        // Düşerken sağa-sola süzülme
        { translateX: Math.sin(t * Math.PI * 2.5) * salinim },
        { rotate: `${t * donus}deg` },
        // Kağıt çırpınması: yüzey periyodik olarak inceliyor
        { rotateX: `${Math.sin(t * Math.PI * 6) * 70}deg` },
        { scale: boyut },
      ],
      // Son çeyreğe kadar tam görünür, sonra yumuşakça kaybol
      opacity: interpolate(t, [0, 0.75, 1], [1, 1, 0]),
    };
  });

  return <Animated.View style={[stiller.parca, stil, { left: x, backgroundColor: renk }]} />;
}

/** İndekse bağlı deterministik "rasgele" değer (0..1). Render saf kalır. */
function sacilim(i: number, tuz: number): number {
  const deger = Math.sin(i * 12.9898 + tuz * 78.233) * 43758.5453;
  return deger - Math.floor(deger);
}

export function Konfeti() {
  const genislik = Dimensions.get('window').width;
  const parcalar = useMemo(
    () =>
      Array.from({ length: PARCA_SAYISI }, (_, i) => ({
        id: i,
        x: sacilim(i, 1) * genislik,
        renk: RENKLER[i % RENKLER.length],
        gecikme: sacilim(i, 2) * 450,
        donus: 240 + sacilim(i, 3) * 720,
        sure: 1300 + sacilim(i, 4) * 800,
        salinim: (sacilim(i, 5) - 0.5) * 120,
        boyut: 0.7 + sacilim(i, 6) * 0.6,
      })),
    [genislik],
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {parcalar.map((p) => (
        <Parca
          key={p.id}
          gecikme={p.gecikme}
          x={p.x}
          renk={p.renk}
          donus={p.donus}
          sure={p.sure}
          salinim={p.salinim}
          boyut={p.boyut}
        />
      ))}
    </View>
  );
}

const stiller = StyleSheet.create({
  parca: {
    position: 'absolute',
    top: -24,
    width: 10,
    height: 15,
    borderRadius: 3,
  },
});
