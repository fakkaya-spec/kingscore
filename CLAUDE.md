# King Skor

İskambil King oyunu için Türkçe, tamamen offline skor takip uygulaması
(Expo + TypeScript strict + expo-router + zustand/MMKV).

- Kod, yorumlar ve arayüz **Türkçe**dir; İngilizce string ekleme.
- Skor motoru `src/core/` altında **saf fonksiyonlardır**; React'e bağımlılık ekleme.
- Altın kural: oyun sonunda 4 oyuncunun puan toplamı 0 olmalıdır — motoru değiştirirken
  `npm test` geçmeden bırakma.
- Kontroller: `npm test`, `npm run typecheck`, `npm run lint`.
- Para kazanma: tek ürün `king_pro_lifetime` (non-consumable); ücretsizde günde 1 masa.
  Başlamış masa asla kilitlenmez; abonelik ürünü ekleme.
- Yasaklar: backend/auth/analytics/reklam yok; abonelik yok; i18n katmanı yok.
