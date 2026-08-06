// Sonuç sahnesi maskotları: tek başına çıkana taçlı horoz, tek başına
// batana süklüm püklüm tavuk. Uygulama ikonundaki silüetle aynı çizgidedir.

import React, { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import { useRenkler } from '@/tema/renkler';

interface CizimProps {
  boyut?: number;
}

/** Taçlı horoz silüeti (uygulama ikonuyla aynı çizim). */
export function Horoz({ boyut = 132 }: CizimProps) {
  const r = useRenkler();
  const govde = r.metin;
  return (
    <Svg width={boyut} height={boyut} viewBox="0 0 1024 1024">
      <G>
        {/* Orak biçimli kuyruk telekleri */}
        <Path
          fill={govde}
          d="M480 545 C 350 500, 260 410, 245 285 C 240 210, 285 150, 365 135 C 320 165, 295 210, 300 265 C 315 380, 390 470, 505 515 Z"
        />
        <Path
          fill={govde}
          d="M485 585 C 330 560, 205 480, 155 355 C 130 290, 155 220, 225 190 C 185 235, 175 290, 200 345 C 245 445, 360 520, 505 550 Z"
        />
        <Path
          fill={govde}
          d="M480 630 C 320 650, 180 620, 95 530 C 65 495, 55 450, 70 410 C 160 520, 320 580, 500 585 Z"
        />
        <Ellipse fill={govde} cx={530} cy={655} rx={195} ry={150} />
        {/* Boyun ve baş */}
        <Path
          fill={govde}
          d="M610 770 C 705 705, 700 540, 690 430 C 685 365, 705 315, 750 298 C 805 282, 845 322, 840 368 C 837 425, 815 480, 795 545 C 778 620, 765 700, 700 770 Z"
        />
        <Circle fill={govde} cx={770} cy={350} r={60} />
        {/* Gaga */}
        <Path fill={govde} d="M824 330 L 892 352 L 824 374 Z" />
        {/* Sakal */}
        <Path
          fill={r.kirmizi}
          d="M812 385 C 838 395, 848 432, 830 458 C 812 482, 778 476, 772 450 C 767 425, 785 392, 812 385 Z"
        />
        {/* Göz */}
        <Circle fill={r.zemin} cx={782} cy={336} r={11} />
        {/* Bacaklar */}
        <Path
          stroke={govde}
          strokeWidth={20}
          strokeLinecap="round"
          fill="none"
          d="M485 795 L 473 900 M473 900 L 438 925 M473 900 L 503 928 M473 900 L 473 932"
        />
        <Path
          stroke={govde}
          strokeWidth={20}
          strokeLinecap="round"
          fill="none"
          d="M580 800 L 590 900 M590 900 L 555 925 M590 900 L 620 928 M590 900 L 590 932"
        />
      </G>
      {/* Altın taç */}
      <G>
        <Path
          fill="#D4AF37"
          d="M706 268 L 694 180 L 739 233 L 768 165 L 797 233 L 842 180 L 830 268 C 791 288, 745 288, 706 268 Z"
        />
        <Circle fill="#D4AF37" cx={694} cy={170} r={12} />
        <Circle fill="#D4AF37" cx={768} cy={153} r={12} />
        <Circle fill="#D4AF37" cx={842} cy={170} r={12} />
      </G>
    </Svg>
  );
}

/** Süklüm püklüm tavuk silüeti: kısa kuyruk, öne eğik baş, küçük ibik. */
export function Tavuk({ boyut = 132 }: CizimProps) {
  const r = useRenkler();
  const govde = r.metin;
  return (
    <Svg width={boyut} height={boyut} viewBox="0 0 1024 1024">
      <G>
        {/* Kısa, yelpaze kuyruk */}
        <Path
          fill={govde}
          d="M330 560 C 250 500, 225 420, 260 340 C 268 405, 300 465, 365 510 Z"
        />
        <Path
          fill={govde}
          d="M320 610 C 220 580, 165 510, 165 425 C 195 490, 250 545, 350 570 Z"
        />
        {/* Tombul gövde */}
        <Ellipse fill={govde} cx={500} cy={650} rx={215} ry={165} />
        {/* Öne eğik boyun ve baş: yenilmiş, süklüm püklüm */}
        <Path
          fill={govde}
          d="M600 760 C 690 720, 720 630, 735 560 C 748 505, 775 480, 815 482 C 862 486, 885 525, 875 565 C 862 615, 820 650, 780 690 C 740 730, 700 765, 650 785 Z"
        />
        <Circle fill={govde} cx={822} cy={540} r={54} />
        {/* Küçük ibik: geriye yatık */}
        <Path
          fill={r.kirmizi}
          d="M790 495 C 782 468, 796 448, 818 445 C 810 458, 810 470, 816 480 C 824 464, 840 456, 856 460 C 844 470, 840 482, 843 494 Z"
        />
        {/* Gaga: hafif aşağı bakar */}
        <Path fill={govde} d="M870 545 L 930 575 L 862 588 Z" />
        {/* Sakal */}
        <Path
          fill={r.kirmizi}
          d="M850 590 C 872 600, 878 630, 862 650 C 846 668, 818 662, 814 640 C 811 620, 828 594, 850 590 Z"
        />
        {/* Göz: yarı kapalı çizgi gibi basık */}
        <Ellipse fill={r.zemin} cx={832} cy={532} rx={11} ry={8} />
        {/* Bacaklar */}
        <Path
          stroke={govde}
          strokeWidth={20}
          strokeLinecap="round"
          fill="none"
          d="M455 800 L 447 905 M447 905 L 412 930 M447 905 L 477 933 M447 905 L 447 937"
        />
        <Path
          stroke={govde}
          strokeWidth={20}
          strokeLinecap="round"
          fill="none"
          d="M550 805 L 558 905 M558 905 L 523 930 M558 905 L 588 933 M558 905 L 558 937"
        />
      </G>
    </Svg>
  );
}

interface SahneProps {
  animasyonlu: boolean;
  boyut?: number;
}

/** Kazanan horoz: yaylanarak gelir, göğsünü kabartıp kasıla kasıla sallanır. */
export function HorozSahnesi({ animasyonlu, boyut = 132 }: SahneProps) {
  const olcek = useSharedValue(animasyonlu ? 0.2 : 1);
  const donus = useSharedValue(0);
  const kabarma = useSharedValue(1);

  useEffect(() => {
    if (!animasyonlu) return;
    olcek.value = withSpring(1, { damping: 8, stiffness: 150 });
    // Kasıla kasıla yürür gibi iki yana salınım
    donus.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 260, easing: Easing.inOut(Easing.sin) }),
        withTiming(8, { duration: 260, easing: Easing.inOut(Easing.sin) }),
      ),
      6,
      true,
    );
    // Göğüs kabartma: nefes gibi hafif büyüyüp küçülür
    kabarma.value = withRepeat(
      withSequence(
        withTiming(1.07, { duration: 420, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 420, easing: Easing.inOut(Easing.quad) }),
      ),
      4,
      true,
    );
  }, [animasyonlu, olcek, donus, kabarma]);

  const stil = useAnimatedStyle(() => ({
    transform: [
      { scale: olcek.value * kabarma.value },
      { rotate: `${donus.value}deg` },
    ],
  }));

  return (
    <Animated.View style={stil}>
      <Horoz boyut={boyut} />
    </Animated.View>
  );
}

/** Batan tavuk: tepeden düşer, toparlanamayıp iki yana bocalar. */
export function TavukSahnesi({ animasyonlu, boyut = 132 }: SahneProps) {
  const dusme = useSharedValue(animasyonlu ? -180 : 0);
  const donus = useSharedValue(0);
  const ezilme = useSharedValue(1);

  useEffect(() => {
    if (!animasyonlu) return;
    // Gümbür gümbür değil, pat diye düşer
    dusme.value = withSpring(0, { damping: 11, stiffness: 160, mass: 1.05 });
    // Yere inince hafif yassılaşıp toparlanır
    ezilme.value = withSequence(
      withTiming(1, { duration: 260 }),
      withTiming(0.9, { duration: 110, easing: Easing.out(Easing.quad) }),
      withSpring(1, { damping: 7, stiffness: 220 }),
    );
    // Şaşkın şaşkın iki yana bocalama
    donus.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 300, easing: Easing.inOut(Easing.sin) }),
        withTiming(10, { duration: 300, easing: Easing.inOut(Easing.sin) }),
      ),
      5,
      true,
    );
  }, [animasyonlu, dusme, donus, ezilme]);

  const stil = useAnimatedStyle(() => ({
    transform: [
      { translateY: dusme.value },
      { rotate: `${donus.value}deg` },
      { scaleY: ezilme.value },
    ],
  }));

  return (
    <Animated.View style={stil}>
      <Tavuk boyut={boyut} />
    </Animated.View>
  );
}
