// RevenueCat entegrasyonu (sunucusuz lisans yönetimi). İki ürün:
// yıllık abonelik + ömür boyu (non-consumable); ikisi de aynı entitlement'ı açar.
// Native modül yoksa (Expo Go) uygulama çalışmaya devam eder, satın alma kapalı olur.
// Offline'da MMKV'deki son bilinen Premium durumu geçerlidir.

import { Platform } from 'react-native';
import Purchases, {
  type CustomerInfo,
  type PurchasesPackage,
} from 'react-native-purchases';
import { useProStore } from '@/store/proStore';

// RevenueCat panosundan alınacak genel (public) SDK anahtarları.
// Bunlar gizli değildir, uygulamaya gömülmesi RevenueCat'in önerdiği yöntemdir.
const REVENUECAT_APPLE_KEY = 'appl_XXXXXXXXXXXXXXXX';
const REVENUECAT_GOOGLE_KEY = 'goog_XXXXXXXXXXXXXXXX';

export const ENTITLEMENT_ADI = 'pro';
export const URUN_PRO = 'king_pro_lifetime'; // non-consumable, tek seferlik
export const URUN_YILLIK = 'king_premium_yillik'; // otomatik yenilenen yıllık abonelik

let baslatildi = false;

function entitlementIsle(bilgi: CustomerInfo) {
  const aktifMi = bilgi.entitlements.active[ENTITLEMENT_ADI] !== undefined;
  useProStore.getState().proAyarla(aktifMi);
}

/** Uygulama açılışında bir kez çağrılır. Hata olursa sessizce geçer (offline öncelik). */
export async function satinAlmayiBaslat(): Promise<void> {
  if (baslatildi) return;
  try {
    const apiKey = Platform.OS === 'ios' ? REVENUECAT_APPLE_KEY : REVENUECAT_GOOGLE_KEY;
    Purchases.configure({ apiKey });
    Purchases.addCustomerInfoUpdateListener(entitlementIsle);
    baslatildi = true;
    const bilgi = await Purchases.getCustomerInfo();
    entitlementIsle(bilgi);
  } catch {
    // İnternet yok ya da native modül yok: MMKV'deki son bilinen durum geçerli kalır
  }
}

export interface ProPaketi {
  paket: PurchasesPackage;
  fiyatMetni: string; // mağazadan dinamik gelir, koda sabit yazılmaz
}

export interface PremiumPaketleri {
  omurBoyu: ProPaketi | null;
  yillik: ProPaketi | null;
}

/** Paywall için mağazadaki yıllık + ömür boyu paketleri getirir. */
export async function premiumPaketleriGetir(): Promise<PremiumPaketleri> {
  try {
    const teklifler = await Purchases.getOfferings();
    const paketler = teklifler.current?.availablePackages ?? [];
    const bul = (urunId: string) =>
      paketler.find((p) => p.product.identifier.includes(urunId)) ?? null;
    const sar = (paket: PurchasesPackage | null): ProPaketi | null =>
      paket ? { paket, fiyatMetni: paket.product.priceString } : null;
    return { omurBoyu: sar(bul(URUN_PRO)), yillik: sar(bul(URUN_YILLIK)) };
  } catch {
    return { omurBoyu: null, yillik: null };
  }
}

/** Satın alma akışı. Başarılıysa Pro durumu günceller. */
export async function satinAl(paket: PurchasesPackage): Promise<boolean> {
  try {
    const sonuc = await Purchases.purchasePackage(paket);
    entitlementIsle(sonuc.customerInfo);
    return sonuc.customerInfo.entitlements.active[ENTITLEMENT_ADI] !== undefined;
  } catch {
    return false;
  }
}

/** Apple'ın zorunlu kıldığı "Satın Alımları Geri Yükle". */
export async function geriYukle(): Promise<boolean> {
  try {
    const bilgi = await Purchases.restorePurchases();
    entitlementIsle(bilgi);
    return bilgi.entitlements.active[ENTITLEMENT_ADI] !== undefined;
  } catch {
    return false;
  }
}
