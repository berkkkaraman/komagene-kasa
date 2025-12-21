-- 🚨 GÜNCEL KURTARMA SCRIPT'I (V2) 🚨

-- 1. 'Merkez' şubesini oluştur (Eğer yoksa)
INSERT INTO branches (name, slug) 
VALUES ('Merkez', 'merkez') 
ON CONFLICT (slug) DO NOTHING;

-- 2. Şube ID'sini al ve Berkay'a ata
UPDATE profiles 
SET branch_id = (SELECT id FROM branches WHERE name = 'Merkez' LIMIT 1)
WHERE email = 'berkaykrmn3@gmail.com';

-- 3. Sonucu Doğrula (Şimdi NULL gelmemeli)
SELECT p.email, b.name as sube_adi, p.branch_id 
FROM profiles p 
LEFT JOIN branches b ON p.branch_id = b.id
WHERE p.email = 'berkaykrmn3@gmail.com';
