# Komagene Kasa Defteri - Akıllı İşletme Asistanı 🥙🚀

Bu proje, Komagene şubeleri için özel olarak geliştirilmiş, günlük ciro, gider, stok ve rapor takibi yapan profesyonel bir web uygulamasıdır.

## 🌟 Önemli Özellikler

- **🛡️ Profesyonel Güvenlik:** Admin paneli için PIN Pad girişi ve Route Guard (Yetkisiz sayfa erişimi engelleme).
- **📦 Stok Takibi:** Kritik malzemelerin (Lavaş, Sos vb.) durumunu "Var / Azaldı / Bitti" şeklinde takip edebilme ve otomatik alışveriş listesi.
- **⚖️ Kasa Sayımı (Blind Count):** Personelin fiziksel parayı sayıp girdiği, sistemin otomatik fark hesapladığı profesyonel mutabakat sistemi.
- **📸 Z-Raporu Arşivi:** Günlük Z-Raporu fişlerinin fotoğraflarını çekip sisteme (sıkıştırılmış şekilde) kaydedebilme.
- **📊 Gelişmiş Analiz:** Platform bazlı (Getir, Yemeksepeti vb.) performans grafikleri ve Net Kar/Zarar hesaplama.
- **📲 WhatsApp Raporlama:** Gün sonu özetini tek tıkla şık bir formatta patrona gönderme.

## 🛠️ Teknoloji Yığını

- **Framework:** Next.js 14+ (App Router)
- **Dil:** TypeScript
- **Styling:** Tailwind CSS & Shadcn/UI
- **Grafikler:** Recharts
- **İkonlar:** Lucide-React
- **Veri Depolama:** Tarayıcı Yerel Depolaması (LocalStorage)

## 🚀 Başlangıç ve Kurulum

Projeyi başka bir bilgisayara kurmak için aşağıdaki adımları takip edin:

### ⚙️ Ön Gereksinimler
- Bilgisayarınızda **Node.js** (v18 veya üzeri) kurulu olmalıdır.

### 📥 Kurulum Adımları
1. Projeyi bilgisayarınıza indirin veya klonlayın:
   ```bash
   git clone https://github.com/berkkkaraman/komagene-kasa.git
   ```
2. Proje klasörüne girin:
   ```bash
   cd komagene-kasa/komagene-app
   ```
3. Gerekli kütüphaneleri yükleyin:
   ```bash
   npm install
   ```

### 💻 Çalıştırma
Geliştirme sunucusunu başlatmak için:
```bash
npm run dev
```
Uygulama hazır! Tarayıcıda `http://localhost:3000` adresine giderek kullanmaya başlayabilirsiniz.

## 📂 Dosya Yapısı

- `/src/app`: Sayfa yapıları ve yönlendirme.
- `/src/components`: UI bileşenleri (Dashboard, Forms, Auth).
- `/src/services`: Veri yönetimi (LocalStorage).
- `/src/types`: TypeScript veri modelleri.

---
**Komagene Büyükdere Şubesi için özel olarak tasarlanmıştır. ✨**
