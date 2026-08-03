// RevenueCat entegrasyonu (sunucusuz lisans yönetimi).
// Native modül yoksa (Expo Go) uygulama çalışmaya devam eder, satın alma kapalı olur.
// Offline'da MMKV'deki son bilinen premium durumu geçerlidir.

import { Platform } from 'react-native';
import Purchases, {
  type CustomerInfo,
  type PurchasesPackage,
} from 'react-native-purchases';
import { usePremiumStore } from '@/store/premiumStore';

// RevenueCat panosundan alınacak genel (public) SDK anahtarları.
// Bunlar gizli değildir, uygulamaya gömülmesi RevenueCat'in önerdiği yöntemdir.
const REVENUECAT_APPLE_KEY = 'appl_XXXXXXXXXXXXXXXX';
const REVENUECAT_GOOGLE_KEY = 'goog_XXXXXXXXXXXXXXXX';

export const ENTITLEMENT_ADI = 'pro';
export const URUN_YILLIK = 'king_yillik';
export const URUN_OMUR_BOYU = 'king_omurboyu';

let baslatildi = false;

function entitlementIsle(bilgi: CustomerInfo) {
  const aktifMi = bilgi.entitlements.active[ENTITLEMENT_ADI] !== undefined;
  usePremiumStore.getState().premiumAyarla(aktifMi);
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

export interface SatisPaketi {
  paket: PurchasesPackage;
  urunId: string;
  fiyatMetni: string; // mağazadan dinamik gelir, koda sabit yazılmaz
  baslik: string;
}

/** Paywall için mağazadaki paketleri getirir. */
export async function paketleriGetir(): Promise<SatisPaketi[]> {
  try {
    const teklifler = await Purchases.getOfferings();
    const paketler = teklifler.current?.availablePackages ?? [];
    return paketler.map((paket) => ({
      paket,
      urunId: paket.product.identifier,
      fiyatMetni: paket.product.priceString,
      baslik: paket.product.title,
    }));
  } catch {
    return [];
  }
}

/** Satın alma akışı. Başarılıysa premium durumu günceller. */
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
