console.log("🚀 Günkasa Bridge: Aktif");

// 1. Günkasa Butonunu Oluştur (Inject)
function injectGunkasaUI() {
    if (document.getElementById('gunkasa-bridge-panel')) return;

    const panel = document.createElement('div');
    panel.id = 'gunkasa-bridge-panel';
    panel.innerHTML = `
    <div style="position:fixed; bottom:20px; right:20px; z-index:9999; background:#D71920; color:white; padding:12px; border-radius:50px; cursor:pointer; box-shadow:0 10px 30px rgba(0,0,0,0.3); display:flex; align-items:center; gap:8px; font-family:sans-serif; font-weight:bold; border:2px solid white;">
      <span style="font-size:18px;">🦾</span>
      <span id="gunkasa-btn-text">GÜNKASA'YA AKTAR</span>
    </div>
  `;

    document.body.appendChild(panel);

    panel.onclick = async () => {
        const btnText = document.getElementById('gunkasa-btn-text');
        btnText.innerText = "BEKLEYİN...";

        try {
            const orderData = scrapeOrderData();
            if (!orderData) {
                alert("Sipariş verisi okunamadı. Lütfen açık bir sipariş olduğundan emin olun.");
                return;
            }

            const result = await sendToGunkasa(orderData);
            if (result.success) {
                alert("✅ Sipariş Günkasa'ya başarıyla aktarıldı!");
            } else {
                alert("❌ Hata: " + result.error);
            }
        } catch (e) {
            alert("❌ Kritik Hata: " + e.message);
        } finally {
            btnText.innerText = "GÜNKASA'YA AKTAR";
        }
    };
}

// 2. Yemeksepeti DOM'unu Oku (General Scraper)
function scrapeOrderData() {
    // NOT: Yemeksepeti'nin class isimleri değişkendir. 
    // Burada genel bir mantık yürütüyoruz. 
    // Gerçek kullanımda spesifik seçiciler (selectors) güncellenebilir.

    const orderDetails = {
        external_id: "YS-" + Date.now(), // Fallback ID
        source: "yemeksepeti",
        table_no: "ONLINE",
        items: [],
        total_amount: 0
    };

    // Örnek: Yemeksepeti Portal'da bilet/sipariş numarası araması
    const orderIdEl = document.querySelector('[class*="OrderNumber"], [class*="id"]');
    if (orderIdEl) orderDetails.external_id = orderIdEl.innerText.trim();

    // Ürünleri bul (Tablo veya Liste yapısı)
    const items = document.querySelectorAll('[class*="Item"], [class*="Row"]');
    items.forEach(el => {
        const nameEl = el.querySelector('[class*="Name"], [class*="title"]');
        const priceEl = el.querySelector('[class*="Price"], [class*="amount"]');
        const qtyEl = el.querySelector('[class*="Quantity"], [class*="count"]');

        if (nameEl && priceEl) {
            orderDetails.items.push({
                name: nameEl.innerText.trim(),
                price: parseFloat(priceEl.innerText.replace(/[^0-9,.]/g, '').replace(',', '.')) || 0,
                quantity: parseInt(qtyEl ? qtyEl.innerText : "1") || 1
            });
        }
    });

    // Toplam Tutar
    const totalEl = document.querySelector('[class*="Total"], [class*="grand"]');
    if (totalEl) {
        orderDetails.total_amount = parseFloat(totalEl.innerText.replace(/[^0-9,.]/g, '').replace(',', '.')) || 0;
    } else {
        // Toplamı ürünlerden hesapla
        orderDetails.total_amount = orderDetails.items.reduce((s, i) => s + (i.price * i.quantity), 0);
    }

    return orderDetails.items.length > 0 ? orderDetails : null;
}

// 3. Veriyi Günkasa API'sine Gönder
async function sendToGunkasa(data) {
    return new Promise((resolve) => {
        chrome.storage.local.get(['branchId', 'apiUrl'], async (settings) => {
            if (!settings.branchId) {
                resolve({ success: false, error: "Şube ID ayarlanmamış! Eklenti ikonuna sağ tıklayıp ayarlara gidin." });
                return;
            }

            const url = `${settings.apiUrl || 'http://localhost:3000'}/api/webhooks/orders`;

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...data,
                        branch_id: settings.branchId
                    })
                });

                const resData = await response.json();
                resolve(resData);
            } catch (e) {
                resolve({ success: false, error: "Bağlantı Hatası: Günkasa açık olmayabilir veya internet yok." });
            }
        });
    });
}

// Başlat
setTimeout(injectGunkasaUI, 3000);
