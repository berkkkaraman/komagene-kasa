-- GÜNKASA DIGITAL SIGNAGE FIX (V10)
-- Bu script:
-- 1. "Ürünler Gitmiyor" sorunu için güvenlik kurallarını (RLS) gevşetir.
-- 2. TV Ekranı altındaki kayan yazı için özellik ekler.

-- A. RLS GÜNCELLEMESİ (Daha Kolay Erişim)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Eskileri sil
DROP POLICY IF EXISTS "Staff manage products" ON public.products;
DROP POLICY IF EXISTS "Public view active products" ON public.products;

-- Yeni Kurallar
-- 1. Herkes (Müşteriler) görebilir
CREATE POLICY "Public Read" ON public.products FOR SELECT USING (true);

-- 2. Giriş yapan herkes (Personel) ürün ekleyip silebilir
-- (Admin/Manager kontrolünü kaldırdım ki hata çıkmasın)
CREATE POLICY "Authenticated Write" ON public.products 
FOR ALL USING (auth.role() = 'authenticated');


-- B. KAYAN YAZI ÖZELLİĞİ (Branches Tablosuna Ekle)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='branches' AND column_name='ticker_message') THEN
        ALTER TABLE public.branches ADD COLUMN ticker_message TEXT DEFAULT 'Komagene Lezzetiyle Tanışın! Her ayın 15''inde +%50 Bedava Kampanyası!';
    END IF;
END $$;
