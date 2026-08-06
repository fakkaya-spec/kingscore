// El girişi ekranı: oyun türüne göre stepper ya da dokunmatik seçim,
// canlı sayaç + canlı puan önizlemesi. Toplam tutmadan Kaydet pasiftir.

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Buton } from '@/bilesenler/Buton';
import { MikroAnimasyon, type MikroTur } from '@/bilesenler/MikroAnimasyon';
import { Stepper } from '@/bilesenler/Stepper';
import { HEDEF_BIRIM, KOZ_SIMGESI, OYUN_ADI } from '@/core/sabitler';
import { elDogrula, kingYapanOyuncu, puanHesapla } from '@/core/skor';
import type { Koz, OyunTuru } from '@/core/tipler';
import { sesCal } from '@/servisler/ses';
import { basariTitret } from '@/servisler/titresim';
import { useAyarStore } from '@/store/ayarStore';
import { useMasaStore } from '@/store/masaStore';
import { useRenkler } from '@/tema/renkler';

export default function ElGirisEkrani() {
  const router = useRouter();
  const r = useRenkler();
  const params = useLocalSearchParams<{
    tur: OyunTuru;
    koz?: string;
    secen: string;
    elId?: string;
  }>();
  const masa = useMasaStore((d) => d.aktifMasa);
  const { elKaydet, elGuncelle } = useMasaStore();
  const animasyonlarAcik = useAyarStore((d) => d.animasyonlar);

  const tur = params.tur;
  const koz = (params.koz || undefined) as Koz | undefined;
  const duzenlenenEl = masa?.eller.find((el) => el.id === params.elId);

  const [adetler, setAdetler] = useState<Record<string, number>>(() => {
    // Tür değişmeden düzenlemede eski adetler gelir; tür değiştiyse hedef
    // birim farklı olacağı için sıfırdan girilir
    if (duzenlenenEl && duzenlenenEl.tur === tur) return { ...duzenlenenEl.adetler };
    const bos: Record<string, number> = {};
    masa?.oyuncular.forEach((o) => {
      bos[o.id] = 0;
    });
    return bos;
  });
  const [kutlama, setKutlama] = useState<{ tur: MikroTur; ad: string; puan?: string } | null>(
    null,
  );

  const hedef = HEDEF_BIRIM[tur];
  const dogrulama = useMemo(
    () => (masa ? elDogrula(tur, adetler, masa.oyuncular.map((o) => o.id)) : null),
    [masa, tur, adetler],
  );
  const onizleme = useMemo(
    () => (masa ? puanHesapla({ tur, adetler }, masa.puanTablosu) : {}),
    [masa, tur, adetler],
  );

  if (!masa || !dogrulama) return null;

  const secenOyuncu = masa.oyuncular.find((o) => o.id === (duzenlenenEl?.secenOyuncuId ?? params.secen));
  const baslik = tur === 'KOZ' && koz ? `Koz ${KOZ_SIMGESI[koz]}` : OYUN_ADI[tur];
  const dokunmatikSecim = tur === 'RIFKI' || tur === 'SON_IKI';

  const oyuncuyaDokun = (oyuncuId: string) => {
    setAdetler((eski) => {
      const kopya = { ...eski };
      if (tur === 'RIFKI') {
        // Tek kişi seçilir: dokunulan işaretlenir, diğerleri sıfırlanır
        masa.oyuncular.forEach((o) => {
          kopya[o.id] = o.id === oyuncuId ? 1 : 0;
        });
        return kopya;
      }
      // SON_IKI: dokundukça 1 el eklenir, dolunca o oyuncu sıfırlanır
      const toplam = Object.values(kopya).reduce((a, b) => a + b, 0);
      const mevcut = kopya[oyuncuId] ?? 0;
      if (mevcut >= 2 || (toplam >= 2 && mevcut > 0)) kopya[oyuncuId] = 0;
      else if (toplam < 2) kopya[oyuncuId] = mevcut + 1;
      return kopya;
    });
  };

  const kaydet = () => {
    if (!dogrulama.gecerli) return;
    basariTitret();

    if (duzenlenenEl) {
      elGuncelle(duzenlenenEl.id, { tur, koz, adetler });
      router.back();
      return;
    }

    const el = elKaydet({ tur, koz, secenOyuncuId: params.secen, adetler });
    sesCal('kart');

    if (!animasyonlarAcik) {
      router.back();
      return;
    }

    // Mikro animasyon önceliği: King > Rıfkı > temiz el
    const kralId = kingYapanOyuncu(el);
    if (kralId) {
      const kral = masa.oyuncular.find((o) => o.id === kralId);
      sesCal('king');
      setKutlama({ tur: 'king', ad: `${kral?.ad} KING YAPTI!` });
      return;
    }
    if (tur === 'RIFKI') {
      const yiyenId = Object.entries(adetler).find(([, a]) => a > 0)?.[0];
      const yiyen = masa.oyuncular.find((o) => o.id === yiyenId);
      sesCal('rifki');
      setKutlama({ tur: 'rifki', ad: yiyen?.ad ?? '', puan: `${el.puanlar[yiyenId ?? ''] ?? 0}` });
      return;
    }
    // Cezadan sıfırla çıkan HERKES kutlanır (iki kişi temizse ikisi de yazılır)
    const temizler = masa.oyuncular.filter((o) => (adetler[o.id] ?? 0) === 0);
    if (tur !== 'KOZ' && temizler.length > 0) {
      setKutlama({
        tur: 'temiz',
        ad: `${temizler.map((o) => o.ad).join(' & ')} temiz atlattı!`,
        puan: '0',
      });
      return;
    }
    router.back();
  };

  return (
    <View style={[stiller.govde, { backgroundColor: r.zemin }]}>
      <Stack.Screen options={{ title: `${baslik} — ${secenOyuncu?.ad ?? ''}` }} />

      {/* Canlı sayaç */}
      <View
        style={[
          stiller.sayacBandi,
          { backgroundColor: dogrulama.gecerli ? r.yesil : r.zeminKoyu, borderColor: r.cizgi },
        ]}
      >
        <Text
          style={[
            stiller.sayacMetni,
            { color: dogrulama.gecerli ? '#0B3D2E' : r.metin },
          ]}
        >
          {dogrulama.mesaj}
        </Text>
      </View>

      <ScrollView contentContainerStyle={stiller.liste}>
        {masa.oyuncular.map((o) => {
          const puan = onizleme[o.id] ?? 0;
          const secili = (adetler[o.id] ?? 0) > 0;
          return (
            <View
              key={o.id}
              style={[stiller.oyuncuSatiri, { backgroundColor: r.zeminKoyu, borderColor: secili && dokunmatikSecim ? r.altin : 'transparent' }]}
            >
              <View style={stiller.oyuncuBilgi}>
                <Text style={[stiller.oyuncuAdi, { color: r.metin }]} numberOfLines={1}>
                  {o.ad}
                </Text>
                {/* Canlı puan önizlemesi */}
                <Text
                  style={[
                    stiller.puanOnizleme,
                    { color: puan > 0 ? r.yesil : puan < 0 ? r.kirmizi : r.soluk },
                  ]}
                >
                  {puan > 0 ? `+${puan}` : puan} puan
                </Text>
              </View>

              {dokunmatikSecim ? (
                <Pressable
                  accessibilityLabel={`${o.ad} seç`}
                  onPress={() => oyuncuyaDokun(o.id)}
                  style={[
                    stiller.secimKutusu,
                    { backgroundColor: secili ? r.altin : r.zemin, borderColor: r.cizgi },
                  ]}
                >
                  <Text style={[stiller.secimMetni, { color: secili ? '#1A1A1A' : r.soluk }]}>
                    {tur === 'RIFKI'
                      ? secili
                        ? '♥K'
                        : 'seç'
                      : `${adetler[o.id] ?? 0} el`}
                  </Text>
                </Pressable>
              ) : (
                <Stepper
                  deger={adetler[o.id] ?? 0}
                  // Masadaki toplam hedefi aşamaz: artı, kalan birim kadar çalışır
                  enCok={(adetler[o.id] ?? 0) + Math.max(0, hedef - dogrulama.toplam)}
                  onDegis={(yeni) => setAdetler((eski) => ({ ...eski, [o.id]: yeni }))}
                />
              )}
            </View>
          );
        })}
      </ScrollView>

      <Buton
        baslik={duzenlenenEl ? 'DEĞİŞİKLİĞİ KAYDET' : 'KAYDET'}
        buyuk
        pasif={!dogrulama.gecerli}
        onPress={kaydet}
        stil={stiller.kaydetButonu}
      />

      {kutlama && (
        <MikroAnimasyon
          tur={kutlama.tur}
          oyuncuAdi={kutlama.ad}
          puanMetni={kutlama.puan}
          onBitti={() => {
            setKutlama(null);
            router.back();
          }}
        />
      )}
    </View>
  );
}

const stiller = StyleSheet.create({
  govde: { flex: 1, padding: 16 },
  sayacBandi: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  sayacMetni: { fontSize: 20, fontWeight: '900', fontVariant: ['tabular-nums'] },
  liste: { gap: 10, paddingBottom: 12 },
  oyuncuSatiri: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 2,
    padding: 12,
    minHeight: 76,
  },
  oyuncuBilgi: { flex: 1, marginRight: 8 },
  oyuncuAdi: { fontSize: 18, fontWeight: '700' },
  puanOnizleme: { fontSize: 15, fontWeight: '700', marginTop: 2, fontVariant: ['tabular-nums'] },
  secimKutusu: {
    minWidth: 76,
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  secimMetni: { fontSize: 18, fontWeight: '800' },
  kaydetButonu: { marginTop: 4 },
});
