// El kaydedilince oynayan kısa (≤1.5 sn) kutlama/uyarı animasyonları.
// Dokununca atlanabilir; ayarlardan animasyonlar kapatılabilir.

import { Crown, Sparkles } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
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

/** Rıfkı sahnesi için stilize kupa papazı kartı. */
function KupaPapazi() {
  return (
    <View style={stiller.oyunKarti}>
      <Text style={[stiller.kartKose, stiller.kartKoseUst]}>K{'\n'}♥</Text>
      <Text style={stiller.kartOrta}>♥</Text>
      <Text style={[stiller.kartKose, stiller.kartKoseAlt]}>K{'\n'}♥</Text>
    </View>
  );
}

export function MikroAnimasyon({ tur, oyuncuAdi, puanMetni, onBitti }: Props) {
  const dusme = useSharedValue(-220);
  const buyume = useSharedValue(0.3);
  const flash = useSharedValue(tur === 'rifki' ? 0.55 : 0);
  const sallanma = useSharedValue(0);
  const parlama = useSharedValue(1);

  useEffect(() => {
    // Yay fiziğiyle düşüş: sert iniş yerine hafif sekmeli, doğal duruş
    dusme.value = withSpring(0, { damping: 12, stiffness: 140, mass: 0.9 });
    buyume.value = withDelay(
      120,
      withSpring(1, { damping: 9, stiffness: 180, overshootClamping: false }),
    );
    flash.value = withTiming(0, { duration: 700, easing: Easing.out(Easing.quad) });
    sallanma.value = withRepeat(
      withSequence(
        withTiming(-7, { duration: 160, easing: Easing.inOut(Easing.sin) }),
        withTiming(7, { duration: 160, easing: Easing.inOut(Easing.sin) }),
      ),
      4,
      true,
    );
    // Taç/ikon nefes alır gibi hafifçe parlar
    parlama.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 320, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 320, easing: Easing.inOut(Easing.quad) }),
      ),
      2,
      true,
    );
    const zamanlayici = setTimeout(onBitti, 1500); // 1.5 saniyeyi geçmez
    return () => clearTimeout(zamanlayici);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const kartStili = useAnimatedStyle(() => ({
    transform: [
      { translateY: dusme.value },
      { rotate: `${sallanma.value}deg` },
      { scale: parlama.value },
    ],
  }));
  const puanStili = useAnimatedStyle(() => ({
    transform: [{ scale: buyume.value }],
  }));
  const flashStili = useAnimatedStyle(() => ({ opacity: flash.value }));

  return (
    <Pressable style={stiller.katman} onPress={onBitti} accessibilityLabel="Animasyonu atla">
      {tur === 'rifki' && (
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, stiller.kirmiziFlash, flashStili]}
        />
      )}
      {tur === 'king' && <Konfeti />}
      {tur === 'rifki' && (
        <Animated.View style={kartStili}>
          <KupaPapazi />
        </Animated.View>
      )}
      {tur === 'king' && (
        <Animated.View style={kartStili}>
          <Crown color="#D4AF37" size={104} strokeWidth={1.75} />
        </Animated.View>
      )}
      {tur === 'temiz' && (
        <Animated.View entering={FadeIn}>
          <Sparkles color="#6FCF97" size={96} strokeWidth={1.75} />
        </Animated.View>
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
  oyunKarti: {
    width: 96,
    height: 134,
    borderRadius: 12,
    backgroundColor: '#F5EFE0',
    borderWidth: 1,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kartKose: {
    position: 'absolute',
    fontSize: 16,
    lineHeight: 17,
    fontWeight: '900',
    color: '#C1272D',
    textAlign: 'center',
  },
  kartKoseUst: { top: 6, left: 8 },
  kartKoseAlt: { bottom: 6, right: 8, transform: [{ rotate: '180deg' }] },
  kartOrta: { fontSize: 44, color: '#C1272D' },
  ad: { fontSize: 24, fontWeight: '800', color: '#F5EFE0', marginTop: 12 },
  puan: { fontSize: 56, fontWeight: '900', color: '#C1272D', marginTop: 4 },
  temizPuan: { color: '#6FCF97' },
});
