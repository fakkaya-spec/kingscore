# ♠ King Skor ♥

İskambil **King** oyunu için skor takip uygulaması. Kağıt kalem yok, hesap tartışması yok.

> **Resmi App Store adı:** "King Skor Cetele" (App Store Connect'te böyle kayıtlı).
> Cihazda ikon altındaki ad bilinçli olarak kısa tutulur: "King Skor"
> (iOS uzun adları kırptığı için).

- **Sunucu yok** — tüm veri cihazda (MMKV), uçak modunda %100 çalışır
- **Reklam yok, analytics yok, izin istemez**
- Sadece Türkçe, para birimi ₺
- İki ürün (kullanıcıya görünen ad: **King Skor Premium**):
  **`king_pro_lifetime`** (non-consumable, 299,99 ₺) ve
  **`king_premium_yillik`** (otomatik yenilenen yıllık abonelik, 149,99 ₺)
- Ücretsiz sınır: **toplam 5 deneme masası** (`UCRETSIZ_MASA_HAKKI`); masa ortasında asla kilit yok

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
npm test             # 45 jest testi (skor motoru)
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
  oyuncular.tsx          # kayıtlı oyuncu havuzundan 1-2-3-4 seçim + hızlı giriş
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
    skor.ts              # puanHesapla, elDogrula, kalanHaklar, toplamSkorlar,
                         # sonucBelirle, secilebilirOyunlar, genelIstatistikler
    kalanOyun.ts         # masada her oyunun kaç kez daha oynanabileceği
    __tests__/           # skor + kalanOyun testleri (45 test)
  store/                 # zustand + MMKV persist
    depo.ts              # MMKV örneği + StateStorage adaptörü
    masaStore.ts         # aktif masa, geçmiş, el CRUD, rövanş, günlük hak
    ayarStore.ts         # sesler/animasyonlar/King kuralı/puan taslağı/tema/görünüm
    oyuncuHavuzuStore.ts # kayıtlı oyuncu havuzu (ad + emoji), masalardan bağımsız
    proStore.ts          # usePro() — offline cache'li `pro` entitlement
  servisler/
    satinalma.ts         # RevenueCat sarmalayıcısı
    ses.ts, titresim.ts, paylas.ts, yedekleme.ts
  bilesenler/            # Buton, Stepper, SkorTablosu, Konfeti, MikroAnimasyon
  tema/renkler.ts        # varsayılan açık yazlık tema + yeşil çuha; ahşap/gece Premium
assets/sesler/           # sentezlenmiş telifsiz WAV efektleri
```

## Oyun kuralları (motorun uyguladığı)

- 4 oyuncu × (2 koz + 3 ceza) = 20 el; her ceza türü masada en fazla 2 kez.
- Varsayılan puanlar: Koz +50/el · El Almaz −50/el · Kupa Almaz −30/kupa ·
  Kız Almaz −100/kız · Erkek Almaz −60/kart · Son İki −180/el · Rıfkı −320.
- **Altın kural:** oyun sonunda 4 oyuncunun toplamı **0** olmalıdır
  (12 ceza eli = −5200, 8 koz eli = +5200). Motor her girişte doğrular;
  toplam tutmayan el kaydedilemez, uyuşmazlıkta kırmızı uyarı gösterilir.
- Koz elinde 11+ el alan **King** yapar. "King'de oyun biter" ayarı varsayılan açıktır.
- Puan tablosu **Ayarlar → Puan Tablosu**'ndan düzenlenebilir; masa kurulurken
  o anki tablo masaya kopyalanıp kilitlenir.

## Para kazanma modeli

- **İki ürün, tek entitlement (`pro`):**
  - `king_pro_lifetime` — non-consumable (kalıcı satın alım), **299,99 ₺**.
    Paywall'da "EN İYİ DEĞER" rozetiyle öne çıkar (yıllığın 2 katı = çapa).
  - `king_premium_yillik` — otomatik yenilenen **yıllık** abonelik, **149,99 ₺**.
  - Aylık/haftalık ürün YOK (skor defteri için abonelik baskısı algısı yaratır;
    rakip analizi 2026-08).
- **Ücretsiz sınır: toplam 5 deneme masası.** Kullanıcı uygulamanın tadına varsın
  diye ilk 5 masayı (20 elin tamamı, sonuç ekranı, tüm animasyonlar) kısıtsız oynar;
  6. masada paywall açılır. Sayaç `masaStore.kurulanMasaSayisi` ile tutulur, günlük
  yenilenmez. Başlamış masa **hiçbir koşulda** kilitlenmez.
- **Premium ile açılanlar:** sınırsız masa, geçmiş masalar + oyuncu istatistikleri
  (en çok rıfkı yiyen, en çok King yapan, ortalamalar), puan tablosu özelleştirme,
  filigransız paylaşım, ekstra masa temaları (ahşap / gece mavisi).
  Ücretsiz sürümde bu ekranlar görünür ama kilit rozetiyle kapalıdır.
- Paywall'da karanlık desen yok: sahte indirim/geri sayım yok, sağ üstte X ile kapatılır.

## RevenueCat & mağaza kurulumu

Kod tarafında yapılacak tek şey: `src/servisler/satinalma.ts` içindeki
`REVENUECAT_APPLE_KEY` ve `REVENUECAT_GOOGLE_KEY` değerlerini RevenueCat panosundaki
**public SDK anahtarlarıyla** değiştirmek.

### 1. App Store Connect

1. **Uygulama İçi Satın Alımlar → Oluştur**: **`king_pro_lifetime`** —
   tür **Non-Consumable**, fiyat **299,99 ₺** (Türkiye vitrini).
   Türkçe görünen ad: "King Skor Premium — Ömür Boyu".
2. **Abonelikler → Abonelik Grubu Oluştur** ("Premium" grubu) →
   içine **`king_premium_yillik`** — süre **1 yıl**, fiyat **149,99 ₺**.
   Türkçe görünen ad: "King Skor Premium — Yıllık". Başka süre (aylık/haftalık)
   EKLEMEYİN.
3. Uygulama açıklamasının **en altına** Apple'ın standart EULA linkini ekleyin:
   `Kullanım Koşulları: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/`
4. **Small Business Program**'a kayıt olun → komisyon %30 yerine **%15**.
   Net hesap (KDV %20 + komisyon %15 düştükten sonra): ömür boyu 299,99 ₺ →
   geliştiriciye ~212 ₺; yıllık 149,99 ₺ → ~106 ₺.
5. **Review notlarına** şunu yazın: "Uygulama tamamen çevrimdışıdır, hesap gerektirmez,
   veri toplamaz. Test için: ana ekran > Yeni Masa > 4 isim gir > El Gir."
6. Yaş sınırı **4+**; kumar/bahis içeriği YOK — bu bir skor defteridir, oyun oynatmaz.
   Bunu açıklama metninde de belirtin.

### 2. Google Play Console

- **Ürünler → Uygulama içi ürünler**: `king_pro_lifetime`, tek seferlik, 299,99 ₺.
- **Ürünler → Abonelikler**: `king_premium_yillik`, temel plan 1 yıl, 149,99 ₺.

### 3. RevenueCat panosu

1. Proje oluşturun, iOS ve Android uygulamalarını bağlayın
   (bundle id: `com.kosko.kingskor`).
2. **Entitlements**: `pro` adında entitlement oluşturun.
3. **Products**: mağazalardan `king_pro_lifetime` ve `king_premium_yillik`
   ürünlerini içe aktarın; İKİSİNİ DE `pro` entitlement'ına bağlayın.
4. **Offerings**: `default` offering'e **Annual** (yıllık) ve **Lifetime**
   paketlerini ekleyin.
5. **API Keys** sayfasındaki `appl_...` ve `goog_...` public anahtarlarını
   `satinalma.ts`'e yazın.

Fiyat uygulamada `product.priceString` ile **mağazadan dinamik** okunur; kodda sabit
fiyat yoktur. Offline durumda son bilinen Pro durumu MMKV'den okunur (`usePro()`);
Pro kullanıcı internet yok diye ASLA kilitlenmez.

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

Apple incelemesi için: paywall'da "Satın Alımları Geri Yükle" butonu, "abonelik yok,
yenileme yok" ifadesi, Gizlilik Politikası ve EULA bağlantıları ile kolay kapatılan X
hazırdır. Gizlilik beyanında "veri toplanmıyor" işaretleyebilirsiniz
(tek istisna: mağaza satın alma doğrulaması).

## Tarayıcıdan EAS build alma

Yerel kurulum gerektirmeden, build'leri tamamen tarayıcı üzerinden tetikleyebilirsiniz:

1. **Expo hesabı açın:** [expo.dev](https://expo.dev) → Sign Up. Ücretsiz plan
   aylık sınırlı build hakkı verir; başlamak için yeterlidir.
2. **Projeyi oluşturun:** expo.dev panosunda **Create a project** deyin, ad olarak
   `king-skor` girin (app.json'daki `slug` ile aynı olmalı).
3. **GitHub'ı bağlayın:** Proje sayfasında **Settings → GitHub** bölümünden
   **Connect GitHub** deyip Expo GitHub App'e bu depoya erişim izni verin ve
   depoyu projeyle eşleştirin.
4. **Build trigger oluşturun:** Proje sayfasında **Builds → Build from GitHub**
   (veya Settings → GitHub → **Build triggers**) altından yeni kural ekleyin:
   - Dal: `main` (veya build almak istediğiniz dal)
   - Platform: Android, iOS veya ikisi
   - Profil: `development` / `preview` / `production` (bu depodaki `eas.json`
     profilleri otomatik okunur)
5. **Build'i başlatın:** Dala push yaptığınızda trigger otomatik çalışır; ayrıca
   proje sayfasındaki **Build from GitHub** butonuyla istediğiniz commit'ten elle
   başlatabilirsiniz. Build bitince APK/IPA dosyasını panodan indirirsiniz.

Not: `development` profili `developmentClient: true` + `distribution: internal`
ayarlıdır — cihazınıza kurup `npx expo start` ile bağlanabileceğiniz geliştirme
istemcisi üretir. iOS build'leri için Apple Developer hesabı kimlik bilgilerini
ilk build sırasında Expo'ya tanıtmanız istenir.

## Yedekleme

Ayarlar (veya Geçmiş) ekranından tüm masalar tek JSON dosyası olarak dışa aktarılır;
aynı ekrandan içe aktarılabilir. Dosya cihaz dışına yalnızca kullanıcının seçtiği
paylaşım kanalıyla çıkar.
