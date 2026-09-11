# App Store Yayın Kontrol Listesi

Her gönderimden ÖNCE bu listenin TAMAMI işaretlenmeden "Submit for Review"a
basılmaz. Liste, King Skor'un yediği üç redden ve Apple'ın sık ret
nedenlerinden damıtılmıştır. (Google Play bölümü en altta.)

## A) Satın alma zinciri — cihazda KANITLA (ret: 2.1b)

- [ ] RevenueCat **Products** sayfasında ürünler **App Store** başlığı altında
      (Test Store DEĞİL) ve ID'ler koddakiyle birebir aynı
- [ ] Her ürün **entitlement**'a bağlı (Entitlements → ilişkili ürünler listesi)
- [ ] **Offerings → default** paketlerinde App Store ürünleri ekli
- [ ] RevenueCat **In-App Purchase Key** yüklü ve "Valid credentials" ✓
- [ ] ASC'de ürünlerin fiyatı ve Türkçe localization'ı dolu
- [ ] Paid Apps sözleşmesi **Active** (Business sayfası)
- [ ] **TestFlight'ta paywall açıldı, fiyatlar GÖRÜNDÜ** (ekran görüntüsü al)
- [ ] Sandbox satın alma yapıldı, premium özellikler AÇILDI
- [ ] "Satın Alımları Geri Yükle" çalışıyor

## B) Mağaza metinleri (ret: 3.1.2 EULA, 2.3.2)

- [ ] Description'ın sonunda **Gizlilik Politikası linki** var
- [ ] Description'ın sonunda **Kullanım Koşulları (EULA) linki** var
      (abonelik varsa ZORUNLU): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
- [ ] Abonelik varsa açıklamada süre + fiyat + otomatik yenileme bilgisi geçiyor
- [ ] IAP **tanıtım görseli (Image/Optional)**: ya BOŞ ya da uygulama
      ikonundan BELİRGİN farklı, ürünü anlatan bir görsel — ikon kopyası ASLA
- [ ] Ekran görüntüleri gerçek arayüzü yansıtıyor, doğru boyutta
      (iPhone 6.5" 1284×2778 / 6.9" 1320×2868 + iPad 13" 2048×2732)
- [ ] Keywords, kategori, yaş anketi (4+), copyright dolu

## C) Destek ve gizlilik sayfaları (ret: 1.5)

- [ ] Support URL açılıyor ve içinde **doğrudan iletişim yolu var**
      (e-posta adresi — "App Store'daki linki kullanın" YETMEZ)
- [ ] Privacy Policy URL açılıyor, içerik güncel (satın alma, foto izni vb.)
- [ ] İki sayfa da telefonda denendi (GitHub Pages yayılımı kontrol edildi)

## D) İnceleme bilgileri

- [ ] App Review Notes dolu: uygulamanın çevrimdışı olduğu, test adımları,
      paywall'a giden yol yazılı
- [ ] "Sign-in required" işareti KAPALI (hesap sistemi yok)
- [ ] İletişim ad/telefon/e-posta dolu
- [ ] Abonelik ürünlerinin **Review Screenshot**'ı yüklü (1242×2208)
- [ ] **"Information Needed" hazırlığı BAŞTAN yapılmış** (King Skor'da 3 hafta
      kaybettiren tur): Review Notes'a şu 8 bilgi en baştan yazılır —
      test edilen cihaz/OS, uygulama tanımı + hedef kitle, kurulum adımları,
      kullanılan dış servisler (ör. RevenueCat/StoreKit), bölgesel fark
      olmadığı, regüle sektör olmadığı, IAP ile ne alınabildiği + paywall'a
      giden yol; ayrıca çekirdek akışı + satın almayı gösteren ekran videosu
      gönderimden ÖNCE çekilip hazır bekletilir

## E) Gönderim paketi

- [ ] Doğru build seçili (commit/sürüm numarası teyit edildi)
- [ ] Draft Submission listesinde OLMASI GEREKEN her kalem var:
      uygulama + abonelik + abonelik grubu (+ varsa IAP)
- [ ] İlk abonelik bir uygulama sürümüyle GÖNDERİLİYOR (tek başına gidemez)
- [ ] Ret sonrası yeniden gönderimde: reddedilen kalemde düzenleme yapıldı,
      Apple mesajına ne düzeltildiği yazıldı
- [ ] DSA/tacir durumu ile ülke listesi tutarlı (tacir değilse AB kapalı)

## F) Uygulama tarafı (her build öncesi)

- [ ] `npm test` + `npm run typecheck` + `npm run lint` temiz
- [ ] TestFlight'ta gerçek cihazda duman testi: masa kur → el gir →
      sonuç ekranı → paywall → geçmiş → ayarlar
- [ ] Yeni özellikler cihazda görüldü (animasyon/ses gibi şeyler simülatörde değil)

## G) Google Play (Android gönderimlerinde ek olarak)

- [ ] Kapalı test: 12 test kullanıcısı 14 gün şartı planlandı
- [ ] RevenueCat'te Google ürünleri (App Store'dan AYRI tanımlanır!)
- [ ] Feature graphic 1024×500 + telefon görselleri 1080×1920
- [ ] Veri güvenliği formu + içerik derecelendirme anketi
- [ ] play.google.com görünür geliştirici adı ayarlandı

## H) Gönderim SONRASI takip (sessizlik yönetimi)

- [ ] "Waiting for Review"a geçtiği gün not edildi; 3 iş günü sessizlikte
      mesaj dizisine nazik takip notu yazılır
- [ ] 5-7 gün sessizlikte resmi başvuru:
      developer.apple.com/contact/app-store → "request an expedited app review"
      (King Skor'da 11 günlük sessizliği bu form çözdü; kabul edilirse ret
      sonrası yeniden gönderimler de otomatik hızlı kuyruğa girer)
- [ ] "Information Needed" cevabı verildiyse: cevabın + video ekinin dizide
      GÖNDERİLMİŞ göründüğü teyit edildi (yükleme sessizce başarısız olabiliyor)
- [ ] Ret sonrası: reddedilen kalemde düzenleme + "Update Review" + App Review
      sayfasında "Resubmit" basıldı ve durumun "Waiting for Review"a
      döndüğü GÖZLE teyit edildi

---
Kural: Bu listede TEK madde bile boşsa gönderim YAPILMAZ. Liste her retten
sonra yeni öğrenilen maddeyle güncellenir.
