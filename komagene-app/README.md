# Komagene Şube Yönetim Paneli

Komagene şubeleri için geliştirilmiş, günlük ciro, stok ve vardiya takibi yapmayı sağlayan modern yönetim paneli.

![Komagene Dashboard](https://komagene.com.tr/assets/img/logo.png)

## 🚀 Özellikler

- **Mali Takip:** Günlük Nakit, Kredi Kartı ve Online (Yemeksepeti, Trendyol, Getir, Gelal) ciro takibi
- **Veresiye Sistemi:** Global veresiye takibi, ödeme alma ve otomatik gelire işleme
- **Arşiv & Raporlama:** Günlük, Haftalık, Aylık ve Tüm Zamanlar raporları
- **Excel Dışa Aktarma:** Verileri filtreli olarak Excel/CSV formatında indirme
- **Kâr/Zarar Analizi:** Otomatik net kâr/zarar hesaplama ve görselleştirme
- **Stok & Vardiya:** Şube stok durumu ve vardiya devir işlemleri
- **PWA Desteği:** Mobil ve masaüstü uyumlu responsive tasarım

## 🛠 Kullanılan Teknolojiler

- Next.js 14
- Supabase (Veritabanı & Auth)
- Tailwind CSS & Shadcn/UI
- Zustand (State Management)
- Recharts (Grafikler)

## ☁️ Kurulum ve Yayına Alma (Deploy)

Bu projeyi kendi sunucunuzda veya Vercel üzerinde kolayca çalıştırabilirsiniz.

### 1. Supabase Kurulumu
1. [Supabase](https://supabase.com) üzerinde yeni bir proje oluşturun.
2. `Settings > API` bölümünden `Project URL` ve `anon public` key'i alın.
3. `Authentication` bölümünden Google girişi için sağlayıcıyı aktifleştirin (isteğe bağlı).

### 2. Vercel ile Yayına Alma (Önerilen)

Aşağıdaki butona tıklayarak projeyi tek tıkla Vercel hesabınıza kopyalayabilir ve yayına alabilirsiniz.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fberkkkaraman%2Fkomagene-kasa&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY)

**Kurulum sırasında sorulacak Çevre Değişkenleri (Environment Variables):**
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase Proje URL'niz
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase API Key'iniz

### 3. Yerel Çalıştırma

```bash
# Projeyi klonlayın
git clone https://github.com/berkkkaraman/komagene-kasa.git

# Bağımlılıkları yükleyin
npm install

# .env.local dosyasını oluşturun ve bilgilerinizi girin
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Sunucuyu başlatın
npm run dev
```
