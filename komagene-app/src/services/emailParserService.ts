import { ZReport } from "../types";

export class EmailParserService {
    /**
     * Extracts branch ID from the inbound email address.
     * Format: [branch_id]@inbound.bizimapp.com
     */
    static extractBranchId(toEmail: string): string | null {
        const match = toEmail.match(/^([^@]+)@/);
        return match ? match[1] : null;
    }

    /**
     * Ham e-posta metninden Z-Raporu verilerini ayıklar.
     * Desteklenen Formatlar: Beko 300TR, Profilo, Ingenico
     */
    static parseZReport(rawContent: string): Partial<ZReport> {
        const result: Partial<ZReport> = {
            raw_email_content: rawContent,
            status: 'pending',
            source: 'email_auto'
        };

        // Temizleme: Satır sonlarını normalize et
        const content = rawContent.replace(/\r\n/g, '\n');

        // Regex Tanımları
        // Tarih: 12.05.2024, 12/05/2024, 12-05-2024
        const dateRegex = /(\d{2}[./-]\d{2}[./-]\d{4})/;

        // Z No / Fiş No: "Z NO: 123", "FİS NO: 123", "Z RAPORU NO: 123"
        const zNoRegex = /(?:Z NO|FIS NO|FİŞ NO|RAPOR NO|Z SIRA NO)[:\s]+(\d+)/i;

        // Tutarlar: "TOPLAM: 1.250,50", "NAKİT: 1.250,50"
        // Türk Lirası sembolü veya TL ibaresini de tolere edebiliriz
        const totalRegex = /(?:TOPLAM|GENEL TOPLAM|TOTAL)[^\d]*([\d.,]+)/i;
        const cashRegex = /(?:NAKIT|NAKİT|CASH)[^\d]*([\d.,]+)/i;
        const cardRegex = /(?:KREDİ KARTI|KREDI KARTI|K\.KARTI|BANKA|CARD)[^\d]*([\d.,]+)/i;

        // Sayı Dönüştürücü: "1.250,50" -> 1250.50
        const parseValue = (val: string | undefined): number => {
            if (!val) return 0;
            // Tüm noktaları kaldır, virgülü noktaya çevir
            const clean = val.replace(/\./g, '').replace(',', '.');
            return parseFloat(clean) || 0;
        };

        const dateMatch = content.match(dateRegex);
        const zNoMatch = content.match(zNoRegex);
        const totalMatch = content.match(totalRegex);
        const cashMatch = content.match(cashRegex);
        const cardMatch = content.match(cardRegex);

        if (dateMatch) result.date = dateMatch[1];
        if (zNoMatch) result.receipt_no = zNoMatch[1];

        if (totalMatch) result.total_amount = parseValue(totalMatch[1]);
        if (cashMatch) result.cash_total = parseValue(cashMatch[1]);
        if (cardMatch) result.credit_card_total = parseValue(cardMatch[1]);

        // Doğrulama Mantığı
        // Eğer Toplam > 0 ise ve (Nakit veya Kart var ise) geçerli say
        if (result.total_amount && result.total_amount > 0) {
            // Nakit veya Kart toplamı eksikse, ana toplamdan tamamlamaya çalışabiliriz (Opsiyonel Logic)
            // Şimdilik sadece status'u güncelle
            result.status = 'processed';
        } else {
            result.status = 'error';
        }

        return result;
    }
}
