# King Skor

İskambil King oyunu için Türkçe, tamamen offline skor takip uygulaması
(Expo + TypeScript strict + expo-router + zustand/MMKV).

- Kod, yorumlar ve arayüz **Türkçe**dir; İngilizce string ekleme.
- Skor motoru `src/core/` altında **saf fonksiyonlardır**; React'e bağımlılık ekleme.
- Altın kural: oyun sonunda 4 oyuncunun puan toplamı 0 olmalıdır — motoru değiştirirken
  `npm test` geçmeden bırakma.
- Kontroller: `npm test`, `npm run typecheck`, `npm run lint`.
- Para kazanma (kullanıcıya görünen ad: **Premium**): iki ürün —
  `king_pro_lifetime` (non-consumable, 299,99 ₺) ve `king_premium_yillik`
  (otomatik yenilenen yıllık abonelik, 149,99 ₺); ikisi de `pro` entitlement'ını açar.
  Ücretsizde toplam 5 deneme masası (UCRETSIZ_MASA_HAKKI).
  Başlamış masa asla kilitlenmez; aylık/haftalık ürün ekleme.
- Yasaklar: backend/auth/analytics/reklam yok; yıllık dışında abonelik yok; i18n katmanı yok.
