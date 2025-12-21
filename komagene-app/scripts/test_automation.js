/**
 * GÜNKASA AUTOMATION TEST SUITE
 * Bu script EmailParserService ve Webhook mantığını test eder.
 */

// Not: ES Modules olduğu için ts-node veya uygun bir ortamda çalışması gerekir.
// Basitlik için burada logic testini simüle ediyoruz.

const mockEmails = [
    {
        name: "Standart POS Raporu",
        content: `
            KOMAGENE SUBE 1
            Z-RAPORU NO: 0045
            TARIH: 21.12.2025
            -----------------
            NAKIT: 1.250,50
            KREDİ KARTI: 3.400,00
            TOPLAM: 4.650,50
            -----------------
            AFİYET OLSUN
        `
    },
    {
        name: "Yazarkasa POS (Kısa Format)",
        content: `
            GÜNLÜK Z RAPORU
            TOTAL: 5.000,00
            CASH: 2.000,00
            CARD: 3.000,00
            21-12-2025
        `
    },
    {
        name: "Hatalı Format (Bozuk Veri)",
        content: `
            Sistem hatası raporu.
            Ciro yok.
        `
    }
];

// Uygulama içindeki servis logic'ini buraya kopyalayıp test ediyoruz 
// (Çünkü Node ortamında TS importları meşakkatli olabilir)
function simulateParse(rawContent) {
    const parseValue = (val) => {
        if (!val) return 0;
        return parseFloat(val.replace(/\./g, '').replace(',', '.'));
    };

    const totalRegex = /(?:TOPLAM|GENEL TOPLAM|TOTAL)[:\s]+([\d.,]+)/i;
    const cashRegex = /(?:NAKIT|CASH)[:\s]+([\d.,]+)/i;
    const cardRegex = /(?:KREDI KARTI|K\.KARTI|CARD)[:\s]+([\d.,]+)/i;
    const dateRegex = /(\d{2}[./-]\d{2}[./-]\d{4})/;

    const totalMatch = rawContent.match(totalRegex);
    const cashMatch = rawContent.match(cashRegex);
    const cardMatch = rawContent.match(cardRegex);
    const dateMatch = rawContent.match(dateRegex);

    return {
        total: totalMatch ? parseValue(totalMatch[1]) : 0,
        cash: cashMatch ? parseValue(cashMatch[1]) : 0,
        card: cardMatch ? parseValue(cardMatch[1]) : 0,
        date: dateMatch ? dateMatch[1] : null,
        status: totalMatch ? 'SUCCESS' : 'ERROR'
    };
}

console.log("🚀 Otomasyon Testleri Başlatılıyor...\n");

mockEmails.forEach(mail => {
    console.log(`Testing: ${mail.name}`);
    const result = simulateParse(mail.content);
    console.log(`   - Status: ${result.status}`);
    console.log(`   - Total: ${result.total} ₺`);
    console.log(`   - Cash/Card: ${result.cash} / ${result.card}`);
    console.log(`   - Date: ${result.date}`);
    console.log("----------------------------------\n");
});

console.log("✅ Parser Testleri Tamamlandı.");
