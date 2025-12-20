-- GÜNKASA GAMIFICATION (LEADERBOARD) - V11
-- Bu script "Şubeler Ligi" özelliği için güvenli veri çekme fonksiyonunu tanımlar.

-- 1. LEADERBOARD FONKSİYONU (Security Definer)
-- Bu fonksiyon, RLS kurallarını atlayarak (System yetkisiyle)
-- Sadece "Şube Adı" ve "Toplam Ciro" bilgisini döndürür.
-- Detaylı kayıtları GÖSTERMEZ. Güvenlidir.

CREATE OR REPLACE FUNCTION public.get_weekly_leaderboard()
RETURNS TABLE (
    branch_name TEXT,
    total_revenue NUMERIC,
    branch_slug TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER -- <--- Kritik: Admin yetkisiyle çalışır
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.name as branch_name,
        COALESCE(SUM((r.income->>'cash')::numeric + (r.income->>'creditCard')::numeric + (r.income->'online'->>'trendyol')::numeric + (r.income->'online'->>'yemeksepeti')::numeric + (r.income->'online'->>'getir')::numeric + (r.income->'online'->>'gelal')::numeric), 0) as total_revenue,
        b.slug as branch_slug
    FROM 
        public.branches b
    LEFT JOIN 
        public.records r ON b.id = r.branch_id
    WHERE 
        r.date >= (CURRENT_DATE - INTERVAL '7 days')::text -- Son 7 günün cirosu
    GROUP BY 
        b.id
    ORDER BY 
        total_revenue DESC
    LIMIT 10; -- İlk 10 şube
END;
$$;
