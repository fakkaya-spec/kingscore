# ♠ King Skor ♥

İskambil **King** oyunu için skor takip uygulaması. Kağıt kalem yok, hesap tartışması yok.

- **Sunucu yok** — tüm veri cihazda (MMKV), uçak modunda %100 çalışır
- **Reklam yok, analytics yok, izin istemez**
- Sadece Türkçe, para birimi ₺
- Premium: **yıllık (king_yillik)** ve **ömür boyu (king_omurboyu)** — aylık abonelik yok

## Teknoloji

| Katman | Paket |
|---|---|
| Çatı | Expo SDK 57 (managed), React Native, TypeScript strict |
| Navigasyon | expo-router |
| State | zustand + react-native-mmkv (persist) |
| Animasyon | react-native-reanimated v4 |
| Ses | expo-audio |
| Haptik | expo-haptics |
| Satın alma | react-native-purchases (RevenueCat) |
| Paylaşım | react-native-view-shot + expo-sharing |
| Test | jest (jest-expo preset) |

> **Şartnameden sapmalar (zorunlu):** `expo-av` SDK 54'te kullanımdan kaldırılıp SDK 57'de
> paketten çıkarıldığı için resmi halefi **expo-audio** kullanıldı. `lottie-react-native`
> yerine tüm animasyonlar **Reanimated** ile yazıldı; hazır Lottie varlığı gerekmedi ve
> "kullanılmayan bağımlılık ekleme" kuralı gereği paket eklenmedi. Reanimated v3 istendi
> ancak SDK 57 ile uyumlu sürüm v4'tür (API aynı, ek olarak `react-native-worklets` gerekir).

## Çalıştırma

```bash
npm install --legacy-peer-deps
npm start            # Expo dev server

# Kontroller
npm test             # 39 jest testi (skor motoru)
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
```

> **Not:** `react-native-mmkv` ve `react-native-purchases` native modüldür; **Expo Go ile
> çalışmaz**, development build gerekir:
>
> ```bash
> npx expo run:ios      # veya
> npx expo run:android
> # ya da EAS ile:
> npx eas build --profile development --platform ios
> ```

## Klasör yapısı

```
app/                     # expo-router ekranları
  _layout.tsx            # kök stack + tema + RevenueCat başlatma
  index.tsx              # ana ekran
  oyuncular.tsx          # 4 isim + emoji, "aynı ekiple başla"
  masa.tsx               # skor tablosu, sıra bandı, EL GİR, geri al
  oyun-sec.tsx           # modal: haklara göre filtrelenmiş oyun kartları
  el-giris.tsx           # stepper / dokunmatik seçim + canlı doğrulama
  sonuc.tsx              # horoz/tavuk sahnesi, istatistik, rövanş, paylaş
  gecmis.tsx             # premium: geçmiş masalar + JSON yedek
  gecmis-detay.tsx
  kurallar.tsx
  paywall.tsx            # King Skor Pro (fiyatlar mağazadan dinamik)
  gizlilik.tsx
  ayarlar/index.tsx      # sesler, animasyonlar, King kuralı, tema
  ayarlar/puan-tablosu.tsx  # premium: 7 birim puanı düzenle
src/
  core/                  # SAF skor motoru — React'ten bağımsız
    tipler.ts            # OyunTuru, El, Masa, PuanTablosu...
    sabitler.ts          # varsayılan puanlar, hedef birimler, adlar
    skor.ts              # puanHesapla, elDogrula, kalanHaklar,
                         # toplamSkorlar, sonucBelirle, secilebilirOyunlar
    __tests__/skor.test.ts
  store/                 # zustand + MMKV persist
    depo.ts              # MMKV örneği + StateStorage adaptörü
    masaStore.ts         # aktif masa, geçmiş, el CRUD, rövanş
    ayarStore.ts         # sesler/animasyonlar/King kuralı/puan taslağı/tema
    premiumStore.ts      # usePremium() — offline cache'li entitlement
  servisler/
    satinalma.ts         # RevenueCat sarmalayıcısı
    ses.ts, titresim.ts, paylas.ts, yedekleme.ts
  bilesenler/            # Buton, Stepper, SkorTablosu, Konfeti, MikroAnimasyon
  tema/renkler.ts        # koyu yeşil çuha + altın; açık tema (premium)
assets/sesler/           # sentezlenmiş telifsiz WAV efektleri
```

## Oyun kuralları (motorun uyguladığı)

- 4 oyuncu × (2 koz + 3 ceza) = 20 el; her ceza türü masada en fazla 2 kez.
- Varsayılan puanlar: Koz +50/el · El Almaz −50/el · Kupa Almaz −30/kupa ·
  Kız Almaz −100/kız · Erkek Almaz −60/kart · Son İki −180/el · Rıfkı −320.
- **Altın kural:** oyun sonunda 4 oyuncunun toplamı **0** olmalıdır
  (12 ceza eli = −5200, 8 koz eli = +5200). Motor her girişte doğrular;
  toplam tutmayan el kaydedilemez, uyuşmazlıkta kırmızı uyarı gösterilir.
- Koz elinde 11+ el alan **King** yapar (👑). "King'de oyun biter" ayarı varsayılan kapalıdır.
- Puan tablosu **Ayarlar → Puan Tablosu**'ndan düzenlenebilir; masa kurulurken
  o anki tablo masaya kopyalanıp kilitlenir.

## RevenueCat & mağaza kurulumu

Kod tarafında yapılacak tek şey: `src/servisler/satinalma.ts` içindeki
`REVENUECAT_APPLE_KEY` ve `REVENUECAT_GOOGLE_KEY` değerlerini RevenueCat panosundaki
**public SDK anahtarlarıyla** değiştirmek.

### 1. App Store Connect

1. **Ayarlar → Abonelikler**: yeni abonelik grubu "King Skor Pro" oluşturun.
2. Grup içinde ürün: **`king_yillik`** — Auto-Renewable Subscription, süre **1 yıl**,
   fiyat **99 ₺** (Türkiye vitrini). Aylık ürün OLUŞTURMAYIN.
3. **Uygulama İçi Satın Alımlar**: **`king_omurboyu`** — Non-Consumable, fiyat **199 ₺**.
4. Her iki ürüne Türkçe görünen ad/açıklama girin.

### 2. Google Play Console

1. **Para kazanma → Abonelikler**: `king_yillik`, temel plan 1 yıl, 99 ₺.
2. **Ürünler → Uygulama içi ürünler**: `king_omurboyu`, tek seferlik, 199 ₺.

### 3. RevenueCat panosu

1. Proje oluşturun, iOS ve Android uygulamalarını bağlayın
   (bundle id: `com.kingskor.app`).
2. **Entitlements**: `pro` adında entitlement oluşturun.
3. **Products**: mağazalardan `king_yillik` ve `king_omurboyu` ürünlerini içe aktarın,
   ikisini de `pro` entitlement'ına bağlayın.
4. **Offerings**: `default` offering'e iki paketi ekleyin
   (Annual → king_yillik, Lifetime → king_omurboyu).
5. **API Keys** sayfasındaki `appl_...` ve `goog_...` public anahtarlarını
   `satinalma.ts`'e yazın.

Fiyatlar uygulamada `product.priceString` ile **mağazadan dinamik** okunur;
kodda sabit fiyat yoktur. Offline durumda son bilinen premium durumu MMKV'den okunur,
premium kullanıcı internet yok diye kilitlenmez.

## Build alma

```bash
npm install -g eas-cli
eas login
eas build:configure

# Mağaza build'leri
eas build --platform ios --profile production
eas build --platform android --profile production

# Mağazaya gönderim
eas submit --platform ios
eas submit --platform android
```

Apple incelemesi için: paywall'da "Satın Alımları Geri Yükle" butonu, otomatik yenileme
açıklaması, Gizlilik Politikası ve EULA bağlantıları hazırdır. Gizlilik beyanında
"veri toplanmıyor" işaretleyebilirsiniz (tek istisna: mağaza satın alma doğrulaması).

## Yedekleme

Ayarlar (veya Geçmiş) ekranından tüm masalar tek JSON dosyası olarak dışa aktarılır;
aynı ekrandan içe aktarılabilir. Dosya cihaz dışına yalnızca kullanıcının seçtiği
paylaşım kanalıyla çıkar.
