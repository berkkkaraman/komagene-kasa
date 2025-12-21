const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function runFix() {
    console.log('🚀 God-Mode Fix Başlatılıyor...');

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Veritabanına bağlanıldı.');

        const sql = fs.readFileSync(path.join(__dirname, 'god_mode_fix.sql'), 'utf8');
        console.log('⚡ SQL Komutları çalıştırılıyor...');

        await client.query(sql);
        console.log('🎉 İŞLEM BAŞARILI! Tüm RLS döngüleri silindi ve ürünler tablosu onarıldı.');

    } catch (err) {
        console.error('❌ HATA:', err);
    } finally {
        await client.end();
        process.exit();
    }
}

runFix();
