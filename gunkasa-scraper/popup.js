document.addEventListener('DOMContentLoaded', () => {
    const branchIdInput = document.getElementById('branchId');
    const apiUrlInput = document.getElementById('apiUrl');
    const saveBtn = document.getElementById('save');
    const statusDiv = document.getElementById('status');

    // Load existing settings
    chrome.storage.local.get(['branchId', 'apiUrl'], (result) => {
        if (result.branchId) branchIdInput.value = result.branchId;
        if (result.apiUrl) apiUrlInput.value = result.apiUrl;
    });

    // Save settings
    saveBtn.addEventListener('click', () => {
        const branchId = branchIdInput.value.trim();
        const apiUrl = apiUrlInput.value.trim();

        if (!branchId) {
            alert('Lütfen Branch ID giriniz!');
            return;
        }

        chrome.storage.local.set({ branchId, apiUrl }, () => {
            statusDiv.textContent = 'Ayarlar Kaydedildi! ✅';
            setTimeout(() => {
                statusDiv.textContent = '';
            }, 2000);
        });
    });
});
