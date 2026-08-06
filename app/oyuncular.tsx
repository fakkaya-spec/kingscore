// Oyuncular ekranı: kayıtlı oyuncu havuzundan 1-2-3-4 sırayla seçim.
// Havuz 4 kişiden azsa (ör. ilk açılış) hızlı isim girişi de çalışır.

import { useRouter } from 'expo-router';
import { Pencil, Plus, Trash2 } from 'lucide-react-native';
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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Avatar } from '@/bilesenler/Avatar';
import { Buton } from '@/bilesenler/Buton';
import type { Oyuncu } from '@/core/tipler';
import { fotoSec, fotoSil } from '@/servisler/foto';
import { davetPaylas } from '@/servisler/paylas';
import { hafifTitret } from '@/servisler/titresim';
import { kimlikUret } from '@/store/depo';
import { useAyarStore } from '@/store/ayarStore';
import { useMasaStore, yeniMasaHakkiVarMi } from '@/store/masaStore';
import { useOyuncuHavuzuStore, type HavuzOyuncusu } from '@/store/oyuncuHavuzuStore';
import { usePro } from '@/store/proStore';
import { useRenkler } from '@/tema/renkler';

export default function OyuncularEkrani() {
  const router = useRouter();
  const r = useRenkler();
  const { masaKur, aktifMasa } = useMasaStore();
  const { havuz, havuzaEkle, havuzdaGuncelle, havuzdanSil } = useOyuncuHavuzuStore();
  const proMu = usePro();
  const animasyonlar = useAyarStore((d) => d.animasyonlar);

  // Havuzdan seçim: dizideki sıra masadaki oturma sırasıdır
  const [seciliIdler, setSeciliIdler] = useState<string[]>([]);
  const [masaAdi, setMasaAdi] = useState('');

  // Havuza ekleme / düzenleme formu
  const [formAcik, setFormAcik] = useState(false);
  const [duzenlenenId, setDuzenlenenId] = useState<string | null>(null);
  const [formAd, setFormAd] = useState('');
  const [formFoto, setFormFoto] = useState<string | undefined>(undefined);
  // Düzenlenen oyuncunun kayıtlı fotoğrafı: vazgeçilirse dosyası korunmalı
  const [eskiFoto, setEskiFoto] = useState<string | undefined>(undefined);

  // Hızlı giriş (havuz 4 kişiden azken eski yol)
  const [adlar, setAdlar] = useState<string[]>(['', '', '', '']);

  const baslat = (oyuncular: [Oyuncu, Oyuncu, Oyuncu, Oyuncu], ad?: string) => {
    if (!yeniMasaHakkiVarMi(proMu)) {
      // Ücretsiz deneme hakkı dolmuş; nazikçe paywall'a yönlendir
      router.push('/paywall');
      return;
    }
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

  const secimiDegistir = (id: string) => {
    hafifTitret();
    setSeciliIdler((mevcut) =>
      mevcut.includes(id)
        ? mevcut.filter((s) => s !== id)
        : mevcut.length >= 4
          ? mevcut
          : [...mevcut, id],
    );
  };

  const havuzdanBaslat = () => {
    if (seciliIdler.length !== 4) return;
    const secililer = seciliIdler.map((id) => havuz.find((o) => o.id === id)!);
    const oyuncular = secililer.map((o) => ({
      id: kimlikUret(),
      ad: o.ad,
      foto: o.foto,
    })) as [Oyuncu, Oyuncu, Oyuncu, Oyuncu];
    baslat(oyuncular, masaAdi);
  };

  const formuAc = (oyuncu?: HavuzOyuncusu) => {
    setDuzenlenenId(oyuncu?.id ?? null);
    setFormAd(oyuncu?.ad ?? '');
    setFormFoto(oyuncu?.foto);
    setEskiFoto(oyuncu?.foto);
    setFormAcik(true);
  };

  const formFotoSec = async () => {
    const uri = await fotoSec();
    if (!uri) return;
    // Bu oturumda seçilmiş ama kaydedilmemiş fotoğraf varsa dosyası artık gereksiz
    if (formFoto && formFoto !== eskiFoto) fotoSil(formFoto);
    setFormFoto(uri);
  };

  const formuKapat = (kaydedildi: boolean) => {
    if (!kaydedildi && formFoto && formFoto !== eskiFoto) fotoSil(formFoto); // vazgeçildi: yeni seçim çöpe
    if (kaydedildi && eskiFoto && eskiFoto !== formFoto) fotoSil(eskiFoto); // kaydedildi: eski dosya çöpe
    setFormAcik(false);
    setDuzenlenenId(null);
    setFormAd('');
    setFormFoto(undefined);
    setEskiFoto(undefined);
  };

  const formuKaydet = () => {
    const ad = formAd.trim();
    if (!ad) return;
    const cakisiyor = havuz.some(
      (o) =>
        o.id !== duzenlenenId &&
        o.ad.toLocaleLowerCase('tr') === ad.toLocaleLowerCase('tr'),
    );
    if (cakisiyor) {
      Alert.alert('İsim zaten var', 'Havuzdaki her oyuncunun adı farklı olmalı.');
      return;
    }
    if (duzenlenenId) havuzdaGuncelle(duzenlenenId, ad, formFoto);
    else havuzaEkle(ad, formFoto);
    formuKapat(true);
  };

  const uzunBas = (oyuncu: HavuzOyuncusu) => {
    Alert.alert(oyuncu.ad, undefined, [
      { text: 'Düzenle', onPress: () => formuAc(oyuncu) },
      {
        text: 'Havuzdan Sil',
        style: 'destructive',
        onPress: () => {
          setSeciliIdler((s) => s.filter((id) => id !== oyuncu.id));
          fotoSil(oyuncu.foto);
          havuzdanSil(oyuncu.id);
        },
      },
      { text: 'Vazgeç', style: 'cancel' },
    ]);
  };

  const hizliBaslat = () => {
    // Boş isimlere "Oyuncu N" ata
    const temizAdlar = adlar.map((a, i) => a.trim() || `Oyuncu ${i + 1}`);
    // Tekrarlayan isme izin verme
    const kucukler = temizAdlar.map((a) => a.toLocaleLowerCase('tr'));
    if (new Set(kucukler).size !== 4) {
      Alert.alert('İsimler çakışıyor', 'Her oyuncunun adı farklı olmalı.');
      return;
    }
    // Girilen isimler havuza da eklenir; bir dahaki sefere kartlardan seçilir
    for (let i = 0; i < 4; i += 1) {
      const varMi = havuz.some(
        (o) => o.ad.toLocaleLowerCase('tr') === kucukler[i],
      );
      if (!varMi) havuzaEkle(temizAdlar[i]);
    }
    const oyuncular = temizAdlar.map((ad) => ({
      id: kimlikUret(),
      ad,
    })) as [Oyuncu, Oyuncu, Oyuncu, Oyuncu];
    baslat(oyuncular, masaAdi);
  };

  const havuzVar = havuz.length > 0;
  const hizliGiris = havuz.length < 4;

  return (
    <ScrollView
      style={{ backgroundColor: r.zemin }}
      contentContainerStyle={stiller.icerik}
      keyboardShouldPersistTaps="handled"
    >
      {havuzVar && (
        <>
          <Text style={[stiller.baslik, { color: r.altin }]}>OYUNCULAR</Text>
          <Text style={[stiller.ipucu, { color: r.soluk }]}>
            Masaya oturacak 4 kişiye sırayla dokun. Uzun basınca düzenlersin.
          </Text>
          <View style={stiller.havuzAlani}>
            {havuz.map((oyuncu, i) => {
              const siraNo = seciliIdler.indexOf(oyuncu.id);
              const secili = siraNo >= 0;
              return (
                <Animated.View
                  key={oyuncu.id}
                  entering={
                    animasyonlar ? FadeInDown.delay(i * 45).springify().damping(15) : undefined
                  }
                  style={stiller.kartSarici}
                >
                <Pressable
                  accessibilityLabel={
                    secili
                      ? `${oyuncu.ad} seçili, sıra ${siraNo + 1}. Kaldırmak için dokun`
                      : `${oyuncu.ad} seç`
                  }
                  onPress={() => secimiDegistir(oyuncu.id)}
                  onLongPress={() => uzunBas(oyuncu)}
                  delayLongPress={350}
                  style={[
                    stiller.oyuncuKarti,
                    {
                      backgroundColor: secili ? r.kart : r.zeminKoyu,
                      borderColor: secili ? r.altin : r.cizgi,
                    },
                  ]}
                >
                  <Avatar ad={oyuncu.ad} foto={oyuncu.foto} boyut={34} />
                  <Text
                    numberOfLines={1}
                    style={[stiller.kartAd, { color: secili ? r.kartUstu : r.metin }]}
                  >
                    {oyuncu.ad}
                  </Text>
                  {secili && (
                    <Animated.View
                      entering={animasyonlar ? FadeInDown.springify().damping(12) : undefined}
                      style={[stiller.siraRozeti, { backgroundColor: r.altin }]}
                    >
                      <Text style={stiller.siraRozetMetni}>{siraNo + 1}</Text>
                    </Animated.View>
                  )}
                </Pressable>
                </Animated.View>
              );
            })}

            <Animated.View
              entering={
                animasyonlar
                  ? FadeInDown.delay(havuz.length * 45).springify().damping(15)
                  : undefined
              }
              style={stiller.kartSarici}
            >
              <Pressable
                accessibilityLabel="Havuza yeni oyuncu ekle"
                onPress={() => formuAc()}
                style={[stiller.oyuncuKarti, stiller.yeniKarti, { borderColor: r.altin }]}
              >
                <Plus color={r.altin} size={26} strokeWidth={2.5} />
                <Text style={[stiller.kartAd, { color: r.altin }]}>Yeni oyuncu</Text>
              </Pressable>
            </Animated.View>
          </View>
        </>
      )}

      {formAcik && (
        <View style={[stiller.form, { backgroundColor: r.zeminKoyu, borderColor: r.altin }]}>
          <View style={stiller.formSatiri}>
            <Avatar ad={formAd} foto={formFoto} boyut={40} />
            <TextInput
              value={formAd}
              onChangeText={setFormAd}
              placeholder="Oyuncu adı"
              placeholderTextColor={r.soluk}
              maxLength={14}
              autoFocus
              style={[
                stiller.girdi,
                { backgroundColor: r.zemin, color: r.metin, borderColor: r.cizgi },
              ]}
            />
          </View>
          <View style={stiller.formSatiri}>
            <Buton
              baslik={formFoto ? 'Fotoğrafı Değiştir' : 'Fotoğraf Ekle'}
              tur="ikincil"
              onPress={() => formFotoSec()}
              stil={stiller.esit}
            />
            {formFoto && (
              <Buton
                baslik="Fotoğrafı Kaldır"
                tur="ikincil"
                onPress={() => {
                  if (formFoto !== eskiFoto) fotoSil(formFoto);
                  setFormFoto(undefined);
                }}
                stil={stiller.esit}
              />
            )}
          </View>
          <View style={stiller.formSatiri}>
            <Buton
              baslik="Vazgeç"
              tur="ikincil"
              onPress={() => formuKapat(false)}
              stil={stiller.esit}
            />
            <Buton
              baslik={duzenlenenId ? 'Kaydet' : 'Havuza Ekle'}
              onPress={formuKaydet}
              pasif={!formAd.trim()}
              stil={stiller.esit}
            />
          </View>
        </View>
      )}

      {hizliGiris && (
        <>
          <Text style={[stiller.baslik, { color: r.altin }]}>
            {havuzVar ? 'HIZLI GİRİŞ' : 'OYUNCULARI YAZ'}
          </Text>
          <Text style={[stiller.ipucu, { color: r.soluk }]}>
            4 ismi yaz, masayı kur. İsimler oyuncu havuzuna da kaydedilir.
          </Text>
          {adlar.map((ad, i) => (
            <View key={i} style={stiller.oyuncuSatiri}>
              <Avatar ad={ad.trim() || `${i + 1}`} boyut={40} />
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
        </>
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

      {havuzVar && (
        <Buton
          baslik={
            seciliIdler.length === 4 ? 'BAŞLAT' : `BAŞLAT (${seciliIdler.length}/4 seçildi)`
          }
          buyuk
          pasif={seciliIdler.length !== 4}
          onPress={havuzdanBaslat}
        />
      )}
      {hizliGiris && (
        <Buton
          baslik="MASAYI KUR"
          buyuk
          tur={havuzVar ? 'ikincil' : 'birincil'}
          onPress={hizliBaslat}
        />
      )}

      <Buton baslik="Arkadaşını Davet Et" tur="ikincil" onPress={() => davetPaylas()} />

      {/* İpucu yalnız havuz kartları görünürken anlamlı */}
      {havuzVar && (
        <View style={stiller.altNot}>
          <Pencil color={r.soluk} size={12} strokeWidth={2} />
          <Text style={[stiller.altNotMetni, { color: r.soluk }]}>
            Bir oyuncunun adını değiştirmek ya da onu havuzdan silmek için kartına uzun bas
          </Text>
          <Trash2 color={r.soluk} size={12} strokeWidth={2} />
        </View>
      )}
    </ScrollView>
  );
}

const stiller = StyleSheet.create({
  icerik: { padding: 20, gap: 12 },
  baslik: { fontSize: 15, fontWeight: '900', letterSpacing: 2, marginTop: 4 },
  ipucu: { fontSize: 13, marginTop: -6 },
  havuzAlani: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kartSarici: { width: '30.5%' },
  oyuncuKarti: {
    width: '100%',
    minHeight: 84,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    gap: 4,
  },
  yeniKarti: { borderStyle: 'dashed', backgroundColor: 'transparent' },
  kartAd: { fontSize: 14, fontWeight: '700', maxWidth: '100%' },
  siraRozeti: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  siraRozetMetni: { fontSize: 15, fontWeight: '900', color: '#1A1A1A' },
  form: { borderWidth: 2, borderRadius: 14, padding: 12, gap: 10 },
  formSatiri: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  esit: { flex: 1 },
  oyuncuSatiri: { flexDirection: 'row', gap: 10, alignItems: 'center' },
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
  altNot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  altNotMetni: { fontSize: 12, flexShrink: 1, textAlign: 'center' },
});
