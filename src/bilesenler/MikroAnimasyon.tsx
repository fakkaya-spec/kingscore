// El kaydedilince oynayan kısa (≤1.5 sn) kutlama/uyarı animasyonları.
// Dokununca atlanabilir; ayarlardan animasyonlar kapatılabilir.

import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Konfeti } from './Konfeti';

export type MikroTur = 'rifki' | 'king' | 'temiz';

interface Props {
  tur: MikroTur;
  oyuncuAdi: string;
  puanMetni?: string; // ör. "-320"
  onBitti: () => void;
}

export function MikroAnimasyon({ tur, oyuncuAdi, puanMetni, onBitti }: Props) {
  const dusme = useSharedValue(-150);
  const buyume = useSharedValue(0.3);
  const flash = useSharedValue(tur === 'rifki' ? 0.55 : 0);
  const sallanma = useSharedValue(0);

  useEffect(() => {
    dusme.value = withTiming(0, { duration: 500, easing: Easing.bounce });
    buyume.value = withTiming(1.15, { duration: 700, easing: Easing.out(Easing.back(2)) });
    flash.value = withTiming(0, { duration: 700 });
    sallanma.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 150 }),
        withTiming(8, { duration: 150 }),
      ),
      4,
      true,
    );
    const zamanlayici = setTimeout(onBitti, 1500); // 1.5 saniyeyi geçmez
    return () => clearTimeout(zamanlayici);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const kartStili = useAnimatedStyle(() => ({
    transform: [{ translateY: dusme.value }, { rotate: `${sallanma.value}deg` }],
  }));
  const puanStili = useAnimatedStyle(() => ({
    transform: [{ scale: buyume.value }],
  }));
  const flashStili = useAnimatedStyle(() => ({ opacity: flash.value }));

  return (
    <Pressable style={stiller.katman} onPress={onBitti} accessibilityLabel="Animasyonu atla">
      {tur === 'rifki' && (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, stiller.kirmiziFlash, flashStili]} />
      )}
      {tur === 'king' && <Konfeti />}
      {tur === 'rifki' && (
        <Animated.Text style={[stiller.kart, kartStili]}>🂾</Animated.Text>
      )}
      {tur === 'king' && (
        <Animated.Text style={[stiller.kart, kartStili]}>👑</Animated.Text>
      )}
      {tur === 'temiz' && (
        <Animated.Text entering={FadeIn} style={stiller.kart}>
          👏
        </Animated.Text>
      )}
      <Animated.Text entering={FadeIn.delay(150)} style={stiller.ad}>
        {oyuncuAdi}
      </Animated.Text>
      {puanMetni !== undefined && (
        <Animated.Text style={[stiller.puan, puanStili, tur === 'temiz' && stiller.temizPuan]}>
          {puanMetni}
        </Animated.Text>
      )}
    </Pressable>
  );
}

const stiller = StyleSheet.create({
  katman: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 50,
  },
  kirmiziFlash: { backgroundColor: '#C1272D' },
  kart: { fontSize: 96 },
  ad: { fontSize: 24, fontWeight: '800', color: '#F5EFE0', marginTop: 8 },
  puan: { fontSize: 56, fontWeight: '900', color: '#E4574F', marginTop: 4 },
  temizPuan: { color: '#6FCF97' },
});
