const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const executeMigration = async () => {
    console.log('\x1b[36m%s\x1b[0m', '🚀 Günkasa Migration Runner Başlatılıyor...');

    if (!process.env.DATABASE_URL) {
        console.error('\x1b[31m%s\x1b[0m', '❌ HATA: .env.local dosyasında DATABASE_URL bulunamadı!');
        console.log('\x1b[33m%s\x1b[0m', '👉 Lütfen Supabase > Project Settings > Database > Connection String > URI kısmından kopyalayıp .env.local dosyasına ekleyin.');
        console.log('Örnek: DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"');
        process.exit(1);
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Supabase için gerekli
    });

    try {
        await client.connect();
        console.log('\x1b[32m%s\x1b[0m', '✅ Veritabanına bağlanıldı.');

        // Çalıştırılacak dosyalar
        const files = [
            'orders_schema.sql',
            'security_hardening.sql',
            'automation_schema.sql'
        ];

        for (const file of files) {
            const filePath = path.join(__dirname, '..', file);
            if (fs.existsSync(filePath)) {
                console.log(`\n📂 Dosya okunuyor: ${file}`);
                const sql = fs.readFileSync(filePath, 'utf8');

                console.log(`⚡ SQL Çalıştırılıyor...`);
                await client.query(sql);
                console.log('\x1b[32m%s\x1b[0m', `✅ ${file} başarıyla işlendi.`);
            } else {
                console.warn(`⚠️ Uyarı: ${file} bulunamadı, atlanıyor.`);
            }
        }

        console.log('\n\x1b[36m%s\x1b[0m', '🎉 Tüm işlemler tamamlandı! "Iron Dome" ve "Sipariş Sistemi" aktif.');

    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', '\n❌ KRİTİK HATA:');
        console.error(err);
    } finally {
        await client.end();
    }
};

executeMigration();
