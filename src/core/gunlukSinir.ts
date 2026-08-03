// Günlük ücretsiz masa sınırı — saf tarih mantığı.
// Sınır cihazın YEREL gün başlangıcına göre sıfırlanır (00:00).

/** Zaman damgasının yerel gün anahtarı: "2026-08-03". Sözlük sırası = kronolojik sıra. */
export function gunAnahtari(ts: number): string {
  const tarih = new Date(ts);
  const yil = tarih.getFullYear();
  const ay = String(tarih.getMonth() + 1).padStart(2, '0');
  const gun = String(tarih.getDate()).padStart(2, '0');
  return `${yil}-${ay}-${gun}`;
}

/**
 * Ücretsiz kullanıcı yeni masa başlatabilir mi?
 *
 * - Hiç masa başlatmamışsa: evet.
 * - Bugün zaten başlatmışsa: hayır.
 * - Kayıtlı gün GELECEKTEyse (kullanıcı saati geri almış): sınır sıfırlanmaz,
 *   en son görülen gün baz alınır → hayır. Gerçek zaman o günü geçince kendiliğinden
 *   açılır; kimse kalıcı kilitlenmez.
 *
 * Not: bu kontrol yalnız YENİ masa başlatırken yapılır; başlamış masa her koşulda
 * bitirilebilir, düzenlenebilir, geri alınabilir.
 */
export function masaBaslatabilirMi(sonMasaGunu: string | null, simdi: number): boolean {
  if (!sonMasaGunu) return true;
  return gunAnahtari(simdi) > sonMasaGunu;
}
