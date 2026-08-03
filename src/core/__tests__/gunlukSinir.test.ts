// Günlük masa sınırı testleri: gün dönümü, ay/yıl sınırı, saat geri alma istismarı.

import { gunAnahtari, masaBaslatabilirMi } from '../gunlukSinir';

// Yerel saate göre zaman damgası üretir (test, çalıştığı saat diliminden bağımsızdır)
function ts(yil: number, ay: number, gun: number, saat = 12): number {
  return new Date(yil, ay - 1, gun, saat, 0, 0).getTime();
}

describe('gunAnahtari', () => {
  test('yerel tarihi YYYY-AA-GG üretir', () => {
    expect(gunAnahtari(ts(2026, 8, 3))).toBe('2026-08-03');
    expect(gunAnahtari(ts(2026, 1, 9))).toBe('2026-01-09');
  });

  test('gün 23:59 ile ertesi gün 00:00 farklı anahtardır', () => {
    const gece = new Date(2026, 7, 3, 23, 59).getTime();
    const sabah = new Date(2026, 7, 4, 0, 0).getTime();
    expect(gunAnahtari(gece)).toBe('2026-08-03');
    expect(gunAnahtari(sabah)).toBe('2026-08-04');
  });
});

describe('masaBaslatabilirMi', () => {
  test('hiç masa başlatılmamışsa izin verir', () => {
    expect(masaBaslatabilirMi(null, ts(2026, 8, 3))).toBe(true);
  });

  test('aynı gün ikinci masaya izin vermez', () => {
    expect(masaBaslatabilirMi('2026-08-03', ts(2026, 8, 3, 23))).toBe(false);
  });

  test('ertesi gün 00:00 itibarıyla izin verir', () => {
    expect(masaBaslatabilirMi('2026-08-03', new Date(2026, 7, 4, 0, 0).getTime())).toBe(true);
  });

  test('ay ve yıl sınırında doğru çalışır', () => {
    expect(masaBaslatabilirMi('2026-08-31', ts(2026, 9, 1))).toBe(true);
    expect(masaBaslatabilirMi('2026-12-31', ts(2027, 1, 1))).toBe(true);
  });

  test('saat geri alınmışsa (kayıtlı gün gelecekte) sınır sıfırlanmaz', () => {
    // Kullanıcı 5 Ağustos'ta masa açtı, sonra saati 3 Ağustos'a geri aldı
    expect(masaBaslatabilirMi('2026-08-05', ts(2026, 8, 3))).toBe(false);
    expect(masaBaslatabilirMi('2026-08-05', ts(2026, 8, 5))).toBe(false);
  });

  test('saat istismarı kalıcı kilit yaratmaz: gerçek zaman günü geçince açılır', () => {
    expect(masaBaslatabilirMi('2026-08-05', ts(2026, 8, 6))).toBe(true);
  });
});
