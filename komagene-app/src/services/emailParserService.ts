import { ZReport } from "../types";

export class EmailParserService {
    /**
     * Ham e-posta metninden Z-Raporu verilerini ayıklar.
     * Örnek POS mail formatına göre Regex kuralları içerir.
     */
    static parseZReport(rawContent: string): Partial<ZReport> {
        const result: Partial<ZReport> = {
            raw_email_content: rawContent,
            status: 'pending'
        };

        // RegEx Gücü: Farklı POS cihazları için genişletilebilir
        const totalRegex = /(?:TOPLAM|GENEL TOPLAM|TOTAL)[:\s]+([\d.,]+)/i;
        const cashRegex = /(?:NAKIT|NAKİT|CASH)[:\s]+([\d.,]+)/i;
        const cardRegex = /(?:KREDİ KARTI|KREDI KARTI|K\.KARTI|CARD)[:\s]+([\d.,]+)/i;
        const dateRegex = /(\d{2}[./-]\d{2}[./-]\d{4})/;

        // Temizleme fonksiyonu: "1.250,50" -> 1250.50
        const parseValue = (val: string | undefined): number => {
            if (!val) return 0;
            return parseFloat(val.replace(/\./g, '').replace(',', '.'));
        };

        const totalMatch = rawContent.match(totalRegex);
        const cashMatch = rawContent.match(cashRegex);
        const cardMatch = rawContent.match(cardRegex);
        const dateMatch = rawContent.match(dateRegex);

        if (totalMatch) result.total_amount = parseValue(totalMatch[1]);
        if (cashMatch) result.cash_total = parseValue(cashMatch[1]);
        if (cardMatch) result.credit_card_total = parseValue(cardMatch[1]);
        if (dateMatch) result.date = dateMatch[1];

        // Basit Doğrulama: Nakit + Kart = Toplam mı?
        if (result.total_amount && result.total_amount > 0) {
            result.status = 'processed';
        } else {
            result.status = 'error';
        }

        return result;
    }
}
