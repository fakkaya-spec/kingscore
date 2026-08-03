// Gizlilik politikası (basit, Türkçe). Uygulama hiçbir kişisel veri toplamaz.

import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRenkler } from '@/tema/renkler';

export default function GizlilikEkrani() {
  const r = useRenkler();
  return (
    <ScrollView style={{ backgroundColor: r.zemin }} contentContainerStyle={stiller.icerik}>
      <Text style={[stiller.baslik, { color: r.altin }]}>Gizlilik Politikası</Text>
      <Text style={[stiller.metin, { color: r.metin }]}>
        King Skor, hiçbir kişisel veri toplamaz.{'\n\n'}
        • Girdiğiniz oyuncu adları, skorlar ve ayarlar yalnızca cihazınızda saklanır;
        hiçbir sunucuya gönderilmez.{'\n\n'}
        • Uygulama internet bağlantısı olmadan da tam olarak çalışır.{'\n\n'}
        • Uygulamada reklam, analitik veya izleme aracı yoktur.{'\n\n'}
        • Tek istisna satın alma işlemleridir: King Skor Pro satın aldığınızda işlem,
        App Store / Google Play ve satın alma altyapımız (RevenueCat) üzerinden doğrulanır.
        Bu doğrulama sırasında yalnızca mağazanın sağladığı anonim işlem bilgisi kullanılır;
        adınız, e-postanız veya rehberiniz gibi veriler bize ulaşmaz.{'\n\n'}
        • Yedekleme özelliği ile verilerinizi JSON dosyası olarak dışa aktarabilirsiniz;
        bu dosya da yalnızca sizin seçtiğiniz yere kaydedilir.{'\n\n'}
        Sorularınız için mağaza sayfasındaki iletişim adresini kullanabilirsiniz.
      </Text>
    </ScrollView>
  );
}

const stiller = StyleSheet.create({
  icerik: { padding: 20, paddingBottom: 40 },
  baslik: { fontSize: 24, fontWeight: '900', marginBottom: 12 },
  metin: { fontSize: 15, lineHeight: 23 },
});
