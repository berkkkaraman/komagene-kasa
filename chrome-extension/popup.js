// Popup yüklendiğinde mevcut ayarları getir
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['branchId', 'apiUrl'], (result) => {
        if (result.branchId) document.getElementById('branchId').value = result.branchId;
        if (result.apiUrl) document.getElementById('apiUrl').value = result.apiUrl;
    });
});

// Kaydet butonuna basıldığında ayarları sakla
document.getElementById('saveBtn').addEventListener('click', () => {
    const branchId = document.getElementById('branchId').value;
    const apiUrl = document.getElementById('apiUrl').value;

    chrome.storage.local.set({ branchId, apiUrl }, () => {
        const status = document.getElementById('status');
        status.style.display = 'block';
        setTimeout(() => {
            status.style.display = 'none';
        }, 2000);
    });
});
