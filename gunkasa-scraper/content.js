/**
 * GÜNKASA SCRAPER - CONTENT SCRIPT
 * Bu script Yemeksepeti/Getir panellerinde çalışır.
 */

console.log("🚀 Günkasa Scraper Aktif. Panel izleniyor...");

let branchId = "";
let apiUrl = "";

// Ayarları yükle
chrome.storage.local.get(['branchId', 'apiUrl'], (result) => {
    branchId = result.branchId;
    apiUrl = result.apiUrl || "http://localhost:3000";
});

// Siparişleri takip et
const processedOrders = new Set();

function scrapeAndSync() {
    if (!branchId) return;

    // 1. TESPİT: Hangi paneldeyiz?
    const isYemeksepeti = window.location.hostname.includes('yemeksepeti');
    const isGetir = window.location.hostname.includes('getir');

    if (isYemeksepeti) {
        // Yemeksepeti Mock Selector (Gerçek panelde güncellenmeli)
        // Genelde .order-card veya div[data-testid='order-card'] gibi olur.
        const orders = document.querySelectorAll('.order-card, [class*="OrderCard"]');

        orders.forEach(card => {
            const externalId = card.getAttribute('data-order-id') || card.innerText.match(/#(\d+)/)?.[1];
            if (!externalId || processedOrders.has(externalId)) return;

            // Verileri ayıkla (Basit Mock Logic)
            const totalText = card.querySelector('[class*="Total"], [class*="Price"]')?.innerText;
            const total = parseFloat(totalText?.replace(/[^0-9,.]/g, '').replace(',', '.')) || 0;

            syncOrder({
                branch_id: branchId,
                source: "yemeksepeti",
                external_id: externalId,
                total_amount: total,
                items: [{ name: "YS Siparişi", price: total, quantity: 1 }],
                table_no: "YS-ONLINE"
            });

            processedOrders.add(externalId);
        });
    }

    if (isGetir) {
        // Getir Mock Selector
        const orders = document.querySelectorAll('.getir-order, [class*="OrderContainer"]');
        orders.forEach(card => {
            const externalId = card.innerText.match(/GTR-(\d+)/)?.[1] || card.id;
            if (!externalId || processedOrders.has(externalId)) return;

            const total = 100; // Mock

            syncOrder({
                branch_id: branchId,
                source: "getir",
                external_id: externalId,
                total_amount: total,
                items: [{ name: "Getir Siparişi", price: total, quantity: 1 }],
                table_no: "GTR-ONLINE"
            });
            processedOrders.add(externalId);
        });
    }
}

async function syncOrder(payload) {
    try {
        console.log("📡 Sipariş Günkasa'ya Gönderiliyor:", payload.external_id);

        const response = await fetch(`${apiUrl}/api/webhooks/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (result.success) {
            console.log("✅ Başarıyla eşitlendi.");
            showToast(`Yeni Sipariş: ${payload.external_id}`);
        }
    } catch (err) {
        console.error("❌ Eşitleme Hatası:", err);
    }
}

function showToast(text) {
    const div = document.createElement('div');
    div.style.cssText = "fixed; bottom: 20px; right: 20px; background: #D71920; color: white; padding: 15px; border-radius: 10px; z-index: 99999; font-weight: bold; border: 2px solid white; box-shadow: 0 10px 30px rgba(0,0,0,0.5);";
    div.innerText = `GÜNKASA: ${text}`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 4000);
}

// Periyodik kontrol veya MutationObserver
setInterval(scrapeAndSync, 5000); // 5 saniyede bir tara
window.addEventListener('load', scrapeAndSync);
