// Günlük ücretsiz masa sınırı — saf tarih mantığı.
// Sınır cihazın YEREL gün başlangıcına göre sıfırlanır (00:00).

/**
 * Kayıtlı gün bugünden en fazla bu kadar gün ilerideyse "saat oynama" sayılır ve
 * sınır korunur; daha fazlası cihaz saatinin yanlışlıkla ileri gitmesi (ör. 2 yıl)
 * olarak kabul edilir, kayıt bozuk sayılıp gerçek tarihe göre sıfırlanır.
 */
export const ILERI_SAPMA_ESIGI_GUN = 2;

/** Zaman damgasının yerel gün anahtarı: "2026-08-03". Sözlük sırası = kronolojik sıra. */
export function gunAnahtari(ts: number): string {
  const tarih = new Date(ts);
  const yil = tarih.getFullYear();
  const ay = String(tarih.getMonth() + 1).padStart(2, '0');
  const gun = String(tarih.getDate()).padStart(2, '0');
  return `${yil}-${ay}-${gun}`;
}

/** İki gün anahtarı arasındaki fark (a - b, gün olarak). Bozuk girdi için NaN döner. */
function gunFarki(a: string, b: string): number {
  const coz = (anahtar: string) => {
    const [yil, ay, gun] = anahtar.split('-').map(Number);
    return new Date(yil, (ay || 1) - 1, gun || 1).getTime();
  };
  return Math.round((coz(a) - coz(b)) / 86_400_000);
}

/** Kayıtlı gün, makul eşiğin ötesinde gelecekteyse bozuktur (saat yanlışlıkla ileri gitmiş). */
function kayitBozukMu(sonMasaGunu: string, simdi: number): boolean {
  return gunFarki(sonMasaGunu, gunAnahtari(simdi)) > ILERI_SAPMA_ESIGI_GUN;
}

/**
 * Ücretsiz kullanıcı yeni masa başlatabilir mi?
 *
 * - Hiç masa başlatmamışsa: evet.
 * - Bugün zaten başlatmışsa: hayır.
 * - Kayıtlı gün YAKIN gelecekteyse (kullanıcı saati geri almış, sapma ≤ eşik):
 *   sınır sıfırlanmaz, en son görülen gün baz alınır → hayır. Gerçek zaman o günü
 *   geçince kendiliğinden açılır; kimse kalıcı kilitlenmez.
 * - Kayıtlı gün eşiğin ÖTESİNDE gelecekteyse (cihaz saati yanlışlıkla yıllarca ileri
 *   gitmiş ve düzelmiş): kayıt bozuk sayılır, gerçek tarihe göre sıfırlanır → evet.
 *
 * Not: bu kontrol yalnız YENİ masa başlatırken yapılır; başlamış masa her koşulda
 * bitirilebilir, düzenlenebilir, geri alınabilir.
 */
export function masaBaslatabilirMi(sonMasaGunu: string | null, simdi: number): boolean {
  if (!sonMasaGunu) return true;
  if (kayitBozukMu(sonMasaGunu, simdi)) return true;
  return gunAnahtari(simdi) > sonMasaGunu;
}

/**
 * Masa kurulurken saklanacak yeni sınır günü.
 * Normalde bugünü yazar; saat geri alınmışsa (yakın gelecekteki kayıt) en son görülen
 * günü korur; bozuk (aşırı gelecekteki) kaydı gerçek tarihe göre sıfırlar.
 */
export function yeniSinirGunu(oncekiGun: string | null, simdi: number): string {
  const bugun = gunAnahtari(simdi);
  if (!oncekiGun) return bugun;
  if (kayitBozukMu(oncekiGun, simdi)) return bugun;
  return oncekiGun > bugun ? oncekiGun : bugun;
}
