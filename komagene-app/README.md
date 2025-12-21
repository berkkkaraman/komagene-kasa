# Günkasa - İşletme Yönetim Paneli 📊💼

Modern, güvenli ve akıllı işletme yönetim sistemi. Günlük ciro takibi, stok yönetimi, veresiye defteri ve detaylı raporlama özellikleriyle işletmenizi profesyonelce yönetin.

## ✨ Özellikler

- 📈 **Günlük Ciro Takibi** - Nakit, kredi kartı ve online platformlardan gelen gelirleri takip edin
- 💸 **Gider Yönetimi** - Tüm giderlerinizi kategorize edin ve analiz edin
- 📒 **Veresiye Defteri** - Müşteri borçlarını takip edin, vadesi gelenleri görün
- 📦 **Stok Takibi** - Kritik malzemelerin durumunu izleyin
- 🤖 **Zero-Touch Otomasyon** - POS Z-Raporları e-posta ile otomatik okunur, Yemeksepeti/Getir siparişleri anlık işlenir.
- 📊 **Detaylı Raporlar** - Haftalık/aylık kar-zarar analizleri
- 🌙 **Modern Arayüz** - Karanlık/aydınlık tema desteği
- ☁️ **Bulut Senkronizasyonu** - Verileriniz güvende, her yerden erişin

## 🚀 Hızlı Başlangıç

### Önkoşullar
- Node.js 18+
- Supabase projesi (ücretsiz)

### Kurulum

```bash
# Repoyu klonla
git clone https://github.com/berkkkaraman/komagene-kasa.git
cd komagene-kasa/komagene-app

# Bağımlılıkları yükle
npm install

# Ortam değişkenlerini ayarla
cp .env.example .env.local
# .env.local dosyasını Supabase bilgilerinle düzenle

# Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcıda `http://localhost:3000` adresini aç.

## 🛠️ Teknoloji Yığını

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS + Shadcn/UI
- **State:** Zustand
- **Backend:** Supabase (PostgreSQL + Auth)
- **Charts:** Recharts
- **Deploy:** Vercel

## 📱 PWA Desteği (Yakında)

Uygulama yakında telefona kurulabilir hale gelecek!

---

**Günkasa** - İşletmenizi bir üst seviyeye taşıyın. 🚀
