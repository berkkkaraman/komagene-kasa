/**
 * KOMAGENE (Büyükdere) - Günlük Kasa Sistemi
 * Tüm özellikler dahil: Logo, Notlar, Filtreleme, Raporlar
 */

const STORAGE_KEY = 'komagene_ledger_data';

class KomagenoLedger {
    constructor() {
        this.data = [];
        this.filteredData = [];
        this.tabIndex = 1;
        this.sortField = 'date';
        this.sortDir = 'asc';
        this.searchQuery = '';
        this.filterStartDate = '';
        this.filterEndDate = '';
        this.init();
    }

    init() {
        this.loadData();
        this.applyFilters();
        this.renderTable();
        this.bindEvents();
        this.updateTotals();
        this.updateMiniStats();
        this.showSaveStatus('saved');
    }

    // ===== LOCAL STORAGE =====
    loadData() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) this.data = JSON.parse(stored);
            if (this.data.length === 0) this.addNewRow(this.getTodayDate());
        } catch (e) {
            console.error('Veri yükleme hatası:', e);
            this.data = [];
            this.addNewRow(this.getTodayDate());
        }
    }

    saveData() {
        try {
            this.showSaveStatus('saving');
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
            setTimeout(() => this.showSaveStatus('saved'), 300);
        } catch (e) {
            console.error('Veri kaydetme hatası:', e);
        }
    }

    showSaveStatus(status) {
        const el = document.getElementById('saveStatus');
        if (!el) return;
        if (status === 'saving') {
            el.classList.remove('saved');
            el.innerHTML = '<span class="save-status-dot"></span><span>Kaydediliyor...</span>';
        } else {
            el.classList.add('saved');
            el.innerHTML = '<span class="save-status-dot"></span><span>Kaydedildi ✓</span>';
        }
    }

    // ===== DATE HELPERS =====
    getTodayDate() { return new Date().toISOString().split('T')[0]; }

    getNextDate(dateStr) {
        const date = new Date(dateStr);
        date.setDate(date.getDate() + 1);
        return date.toISOString().split('T')[0];
    }

    getLastRowDate() {
        if (this.data.length === 0) return this.getTodayDate();
        return this.data[this.data.length - 1].date;
    }

    formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    // ===== DATA MANAGEMENT =====
    addNewRow(date) {
        const newRow = {
            id: Date.now().toString(),
            date: date,
            income: { pos: 0, cash: 0, online: 0 },
            expense: { staff: 0, rent: 0, supplies: 0, tax: 0, other: 0 },
            note: '',
            marked: false
        };
        this.data.push(newRow);
        this.saveData();
        return newRow;
    }

    deleteRow(id) {
        this.data = this.data.filter(row => row.id !== id);
        if (this.data.length === 0) this.addNewRow(this.getTodayDate());
        this.saveData();
        this.applyFilters();
        this.renderTable();
        this.updateTotals();
        this.updateMiniStats();
    }

    updateRowField(id, category, field, value) {
        const row = this.data.find(r => r.id === id);
        if (row) {
            if (category === 'date') row.date = value;
            else if (category === 'note') row.note = value;
            else if (category === 'marked') row.marked = value;
            else row[category][field] = parseFloat(value) || 0;
            this.saveData();
            this.updateRowCalculations(id);
            this.updateTotals();
            this.updateMiniStats();
        }
    }

    // ===== FILTERING & SORTING =====
    applyFilters() {
        let result = [...this.data];

        // Date filter
        if (this.filterStartDate) {
            result = result.filter(r => r.date >= this.filterStartDate);
        }
        if (this.filterEndDate) {
            result = result.filter(r => r.date <= this.filterEndDate);
        }

        // Search
        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            result = result.filter(r =>
                r.date.includes(q) ||
                (r.note && r.note.toLowerCase().includes(q))
            );
        }

        // Sort
        result.sort((a, b) => {
            let valA, valB;
            if (this.sortField === 'date') {
                valA = a.date; valB = b.date;
            } else if (this.sortField === 'income') {
                valA = this.getRowTotals(a).totalIncome;
                valB = this.getRowTotals(b).totalIncome;
            } else if (this.sortField === 'expense') {
                valA = this.getRowTotals(a).totalExpense;
                valB = this.getRowTotals(b).totalExpense;
            } else if (this.sortField === 'profit') {
                valA = this.getRowTotals(a).netProfit;
                valB = this.getRowTotals(b).netProfit;
            }
            if (this.sortDir === 'asc') return valA > valB ? 1 : -1;
            return valA < valB ? 1 : -1;
        });

        this.filteredData = result;
    }

    // ===== CALCULATIONS =====
    getRowTotals(row) {
        const totalIncome = Object.values(row.income).reduce((a, b) => a + b, 0);
        const totalExpense = Object.values(row.expense).reduce((a, b) => a + b, 0);
        return { totalIncome, totalExpense, netProfit: totalIncome - totalExpense };
    }

    getGrandTotals(useFiltered = false) {
        const source = useFiltered ? this.filteredData : this.data;
        let totalIncome = 0, totalExpense = 0;
        let incomeBreakdown = { pos: 0, cash: 0, online: 0 };
        let expenseBreakdown = { staff: 0, rent: 0, supplies: 0, tax: 0, other: 0 };

        source.forEach(row => {
            const t = this.getRowTotals(row);
            totalIncome += t.totalIncome;
            totalExpense += t.totalExpense;
            Object.keys(row.income).forEach(k => incomeBreakdown[k] += row.income[k]);
            Object.keys(row.expense).forEach(k => expenseBreakdown[k] += row.expense[k]);
        });

        return { totalIncome, totalExpense, netProfit: totalIncome - totalExpense, incomeBreakdown, expenseBreakdown };
    }

    updateRowCalculations(id) {
        const row = this.data.find(r => r.id === id);
        if (!row) return;
        const totals = this.getRowTotals(row);
        const tr = document.querySelector(`tr[data-id="${id}"]`);
        if (!tr) return;

        const incomeTotal = tr.querySelector('.income-total');
        const expenseTotal = tr.querySelector('.expense-total');
        const netProfit = tr.querySelector('.net-profit');

        if (incomeTotal) incomeTotal.textContent = this.formatCurrency(totals.totalIncome);
        if (expenseTotal) expenseTotal.textContent = this.formatCurrency(totals.totalExpense);
        if (netProfit) {
            netProfit.textContent = this.formatCurrency(totals.netProfit);
            netProfit.classList.remove('positive', 'negative');
            if (totals.netProfit > 0) netProfit.classList.add('positive');
            else if (totals.netProfit < 0) netProfit.classList.add('negative');
        }
    }

    updateTotals() {
        const totals = this.getGrandTotals();
        const incomeEl = document.getElementById('totalIncome');
        const expenseEl = document.getElementById('totalExpense');
        const profitEl = document.getElementById('totalProfit');
        const profitCard = document.getElementById('profitCard');
        const profitTrend = document.getElementById('profitTrend');

        if (incomeEl) incomeEl.textContent = this.formatCurrency(totals.totalIncome);
        if (expenseEl) expenseEl.textContent = this.formatCurrency(totals.totalExpense);
        if (profitEl) {
            profitEl.textContent = this.formatCurrency(totals.netProfit);
            if (profitCard) {
                profitCard.classList.remove('negative');
                if (totals.netProfit < 0) profitCard.classList.add('negative');
            }
            if (profitTrend) {
                profitTrend.innerHTML = totals.netProfit >= 0
                    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 15l-6-6-6 6"/></svg>'
                    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>';
            }
        }
    }

    updateMiniStats() {
        const totals = this.getGrandTotals();
        const dayCount = this.data.length || 1;

        // Best day
        let bestDay = null, worstDay = null, bestProfit = -Infinity, worstProfit = Infinity;
        this.data.forEach(row => {
            const t = this.getRowTotals(row);
            if (t.netProfit > bestProfit) { bestProfit = t.netProfit; bestDay = row.date; }
            if (t.netProfit < worstProfit) { worstProfit = t.netProfit; worstDay = row.date; }
        });

        const avgIncome = document.getElementById('avgDailyIncome');
        const avgExpense = document.getElementById('avgDailyExpense');
        const avgProfit = document.getElementById('avgDailyProfit');
        const bestDayEl = document.getElementById('bestDay');
        const worstDayEl = document.getElementById('worstDay');
        const markedCount = document.getElementById('markedCount');

        if (avgIncome) avgIncome.textContent = this.formatCurrency(totals.totalIncome / dayCount);
        if (avgExpense) avgExpense.textContent = this.formatCurrency(totals.totalExpense / dayCount);
        if (avgProfit) {
            const avg = totals.netProfit / dayCount;
            avgProfit.textContent = this.formatCurrency(avg);
            avgProfit.className = 'mini-stat-value ' + (avg >= 0 ? 'positive' : 'negative');
        }
        if (bestDayEl && bestDay) bestDayEl.textContent = this.formatDate(bestDay) + ' (' + this.formatCurrency(bestProfit) + ')';
        if (worstDayEl && worstDay) worstDayEl.textContent = this.formatDate(worstDay) + ' (' + this.formatCurrency(worstProfit) + ')';
        if (markedCount) markedCount.textContent = this.data.filter(r => r.marked).length + ' gün';
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 2 }).format(amount);
    }

    // ===== RENDER TABLE =====
    renderTable() {
        const tbody = document.getElementById('ledgerBody');
        if (!tbody) return;
        this.tabIndex = 1;

        if (this.filteredData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="16"><div class="empty-state"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg><p>Kayıt bulunamadı</p></div></td></tr>`;
            return;
        }

        tbody.innerHTML = this.filteredData.map(row => this.createRowHTML(row)).join('');
        this.bindRowEvents();
    }

    createRowHTML(row) {
        const totals = this.getRowTotals(row);
        const netClass = totals.netProfit > 0 ? 'positive' : totals.netProfit < 0 ? 'negative' : '';
        const markedClass = row.marked ? 'marked' : '';

        return `
            <tr data-id="${row.id}" class="${markedClass}">
                <td><input type="checkbox" class="mark-checkbox" ${row.marked ? 'checked' : ''} data-field="marked" title="İşaretle"></td>
                <td><input type="date" value="${row.date}" data-field="date" tabindex="${this.tabIndex++}"></td>
                <td class="income-cell"><input type="number" value="${row.income.pos || ''}" placeholder="0" data-category="income" data-field="pos" step="0.01" min="0" tabindex="${this.tabIndex++}"></td>
                <td class="income-cell"><input type="number" value="${row.income.cash || ''}" placeholder="0" data-category="income" data-field="cash" step="0.01" min="0" tabindex="${this.tabIndex++}"></td>
                <td class="income-cell"><input type="number" value="${row.income.online || ''}" placeholder="0" data-category="income" data-field="online" step="0.01" min="0" tabindex="${this.tabIndex++}"></td>
                <td class="income-total">${this.formatCurrency(totals.totalIncome)}</td>
                <td class="expense-cell"><input type="number" value="${row.expense.staff || ''}" placeholder="0" data-category="expense" data-field="staff" step="0.01" min="0" tabindex="${this.tabIndex++}"></td>
                <td class="expense-cell"><input type="number" value="${row.expense.rent || ''}" placeholder="0" data-category="expense" data-field="rent" step="0.01" min="0" tabindex="${this.tabIndex++}"></td>
                <td class="expense-cell"><input type="number" value="${row.expense.supplies || ''}" placeholder="0" data-category="expense" data-field="supplies" step="0.01" min="0" tabindex="${this.tabIndex++}"></td>
                <td class="expense-cell"><input type="number" value="${row.expense.tax || ''}" placeholder="0" data-category="expense" data-field="tax" step="0.01" min="0" tabindex="${this.tabIndex++}"></td>
                <td class="expense-cell"><input type="number" value="${row.expense.other || ''}" placeholder="0" data-category="expense" data-field="other" step="0.01" min="0" tabindex="${this.tabIndex++}"></td>
                <td class="expense-total">${this.formatCurrency(totals.totalExpense)}</td>
                <td class="net-profit ${netClass}">${this.formatCurrency(totals.netProfit)}</td>
                <td><input type="text" value="${row.note || ''}" placeholder="Not..." data-field="note" tabindex="${this.tabIndex++}"></td>
                <td><button class="btn-delete" data-delete="${row.id}" title="Sil"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button></td>
            </tr>`;
    }

    // ===== EVENTS =====
    bindEvents() {
        // Support multiple "addNewDay" buttons (header and footer)
        document.querySelectorAll('#addNewDay').forEach(btn => {
            btn.addEventListener('click', () => {
                const nextDate = this.getNextDate(this.getLastRowDate());
                this.addNewRow(nextDate);
                this.applyFilters();
                this.renderTable();
                this.updateTotals();
                this.updateMiniStats();
                const tbody = document.getElementById('ledgerBody');
                if (tbody?.lastElementChild) {
                    const firstInput = tbody.lastElementChild.querySelector('input[type="number"]');
                    if (firstInput) firstInput.focus();
                }
            });
        });

        document.getElementById('exportBtn')?.addEventListener('click', () => this.exportToCSV());
        document.getElementById('printBtn')?.addEventListener('click', () => window.print());
        document.getElementById('backupBtn')?.addEventListener('click', () => this.downloadBackup());
        document.getElementById('restoreBtn')?.addEventListener('click', () => document.getElementById('restoreInput')?.click());
        document.getElementById('restoreInput')?.addEventListener('change', (e) => this.restoreBackup(e));

        // Filters
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.applyFilters();
            this.renderTable();
        });
        document.getElementById('filterStartDate')?.addEventListener('change', (e) => {
            this.filterStartDate = e.target.value;
            this.applyFilters();
            this.renderTable();
        });
        document.getElementById('filterEndDate')?.addEventListener('change', (e) => {
            this.filterEndDate = e.target.value;
            this.applyFilters();
            this.renderTable();
        });
        document.getElementById('sortSelect')?.addEventListener('change', (e) => {
            const [field, dir] = e.target.value.split('-');
            this.sortField = field;
            this.sortDir = dir;
            this.applyFilters();
            this.renderTable();
        });
        document.getElementById('clearFilters')?.addEventListener('click', () => {
            this.searchQuery = '';
            this.filterStartDate = '';
            this.filterEndDate = '';
            this.sortField = 'date';
            this.sortDir = 'asc';
            document.getElementById('searchInput').value = '';
            document.getElementById('filterStartDate').value = '';
            document.getElementById('filterEndDate').value = '';
            document.getElementById('sortSelect').value = 'date-asc';
            this.applyFilters();
            this.renderTable();
        });

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                showPage(page);
                this.closeMobileMenu();
                if (page === 'reports') {
                    const period = document.getElementById('reportPeriod')?.value || 7;
                    this.renderReports(period);
                }
            });
        });

        // Report period selector
        document.getElementById('reportPeriod')?.addEventListener('change', (e) => {
            this.renderReports(e.target.value);
        });

        // Mobile Menu
        document.getElementById('mobileMenuBtn')?.addEventListener('click', () => this.toggleMobileMenu());
        document.getElementById('mobileOverlay')?.addEventListener('click', () => this.closeMobileMenu());

        // Day Picker
        document.getElementById('dayPicker')?.value || (document.getElementById('dayPicker').value = this.getTodayDate());
        document.getElementById('goToDay')?.addEventListener('click', () => {
            const date = document.getElementById('dayPicker')?.value;
            if (date) this.goToDay(date);
        });

        // Print Functions
        document.getElementById('printDaily')?.addEventListener('click', () => this.printReport('daily'));
        document.getElementById('printWeekly')?.addEventListener('click', () => this.printReport('weekly'));
        document.getElementById('printMonthly')?.addEventListener('click', () => this.printReport('monthly'));
    }

    // ===== MOBILE MENU =====
    toggleMobileMenu() {
        const btn = document.getElementById('mobileMenuBtn');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('mobileOverlay');
        btn?.classList.toggle('active');
        sidebar?.classList.toggle('open');
        overlay?.classList.toggle('active');
    }

    closeMobileMenu() {
        const btn = document.getElementById('mobileMenuBtn');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('mobileOverlay');
        btn?.classList.remove('active');
        sidebar?.classList.remove('open');
        overlay?.classList.remove('active');
    }

    // ===== DAY PICKER =====
    goToDay(date) {
        const row = this.data.find(r => r.date === date);
        if (row) {
            // Clear filters and scroll to row
            this.searchQuery = '';
            this.filterStartDate = '';
            this.filterEndDate = '';
            document.getElementById('searchInput').value = '';
            document.getElementById('filterStartDate').value = '';
            document.getElementById('filterEndDate').value = '';
            this.applyFilters();
            this.renderTable();

            setTimeout(() => {
                const tr = document.querySelector(`tr[data-id="${row.id}"]`);
                if (tr) {
                    tr.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    tr.style.animation = 'none';
                    tr.offsetHeight; // trigger reflow
                    tr.style.animation = 'fadeIn 0.5s ease 3';
                }
            }, 100);
        } else {
            if (confirm(`${this.formatDate(date)} için kayıt yok. Yeni kayıt oluşturulsun mu?`)) {
                this.addNewRow(date);
                this.applyFilters();
                this.renderTable();
                this.updateTotals();
                this.updateMiniStats();
            }
        }
    }

    // ===== PRINT FUNCTIONS =====

    printReport(type) {
        // Find the last (most recent) date in the data
        if (this.data.length === 0) {
            alert('Tabloda kayıt yok!');
            return;
        }

        // Sort data to find the latest date
        const sortedData = [...this.data].sort((a, b) => b.date.localeCompare(a.date));
        const lastDate = sortedData[0].date;
        const endDateObj = new Date(lastDate);
        let startDate, endDate, title;

        endDate = lastDate;

        if (type === 'daily') {
            startDate = lastDate;
            title = `Günlük Rapor - ${this.formatDate(lastDate)}`;
        } else if (type === 'weekly') {
            const start = new Date(endDateObj);
            start.setDate(endDateObj.getDate() - 7);
            startDate = start.toISOString().split('T')[0];
            title = `Haftalık Rapor (${this.formatDate(startDate)} - ${this.formatDate(endDate)})`;
        } else if (type === 'monthly') {
            const start = new Date(endDateObj);
            start.setDate(endDateObj.getDate() - 30);
            startDate = start.toISOString().split('T')[0];
            title = `Aylık Rapor (${this.formatDate(startDate)} - ${this.formatDate(endDate)})`;
        }

        const filteredData = this.data.filter(r => r.date >= startDate && r.date <= endDate);

        if (filteredData.length === 0) {
            alert('Seçili dönem için kayıt bulunamadı!');
            return;
        }

        // Calculate totals
        let totalIncome = 0, totalExpense = 0;
        let incomeB = { pos: 0, cash: 0, online: 0 };
        let expenseB = { staff: 0, rent: 0, supplies: 0, tax: 0, other: 0 };

        filteredData.forEach(row => {
            const t = this.getRowTotals(row);
            totalIncome += t.totalIncome;
            totalExpense += t.totalExpense;
            Object.keys(row.income).forEach(k => incomeB[k] += row.income[k]);
            Object.keys(row.expense).forEach(k => expenseB[k] += row.expense[k]);
        });

        const netProfit = totalIncome - totalExpense;

        const reportHTML = `
            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="margin: 0; color: #D71920;">KOMAGENE</h1>
                    <p style="margin: 5px 0; color: #666;">Büyükdere Şubesi</p>
                    <h2 style="margin: 20px 0 10px;">${title}</h2>
                    <p style="color: #666;">${filteredData.length} gün verisi</p>
                </div>
                
                <div style="display: flex; gap: 20px; margin-bottom: 30px;">
                    <div style="flex: 1; background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
                        <div style="font-size: 12px; color: #666;">TOPLAM GELİR</div>
                        <div style="font-size: 24px; font-weight: bold; color: #10b981;">${this.formatCurrency(totalIncome)}</div>
                    </div>
                    <div style="flex: 1; background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444;">
                        <div style="font-size: 12px; color: #666;">TOPLAM GİDER</div>
                        <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${this.formatCurrency(totalExpense)}</div>
                    </div>
                    <div style="flex: 1; background: ${netProfit >= 0 ? '#f0fdf4' : '#fef2f2'}; padding: 20px; border-radius: 8px; border-left: 4px solid ${netProfit >= 0 ? '#10b981' : '#ef4444'};">
                        <div style="font-size: 12px; color: #666;">NET ${netProfit >= 0 ? 'KAR' : 'ZARAR'}</div>
                        <div style="font-size: 24px; font-weight: bold; color: ${netProfit >= 0 ? '#10b981' : '#ef4444'};">${this.formatCurrency(netProfit)}</div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 30px; margin-bottom: 30px;">
                    <div style="flex: 1;">
                        <h3>Gelir Dağılımı</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;">POS</td><td style="text-align: right; color: #10b981;">${this.formatCurrency(incomeB.pos)}</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;">Nakit</td><td style="text-align: right; color: #10b981;">${this.formatCurrency(incomeB.cash)}</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;">Online</td><td style="text-align: right; color: #10b981;">${this.formatCurrency(incomeB.online)}</td></tr>
                        </table>
                    </div>
                    <div style="flex: 1;">
                        <h3>Gider Dağılımı</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;">Personel</td><td style="text-align: right; color: #ef4444;">${this.formatCurrency(expenseB.staff)}</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;">Kira/Fatura</td><td style="text-align: right; color: #ef4444;">${this.formatCurrency(expenseB.rent)}</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;">Malzeme</td><td style="text-align: right; color: #ef4444;">${this.formatCurrency(expenseB.supplies)}</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;">Vergi</td><td style="text-align: right; color: #ef4444;">${this.formatCurrency(expenseB.tax)}</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;">Diğer</td><td style="text-align: right; color: #ef4444;">${this.formatCurrency(expenseB.other)}</td></tr>
                        </table>
                    </div>
                </div>
                
                <h3>Günlük Detaylar</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <thead>
                        <tr style="background: #f3f4f6;">
                            <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Tarih</th>
                            <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">Gelir</th>
                            <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">Gider</th>
                            <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">Net Kar</th>
                            <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Not</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredData.map(row => {
            const t = this.getRowTotals(row);
            return `<tr>
                                <td style="padding: 8px; border: 1px solid #e5e7eb;">${this.formatDate(row.date)}</td>
                                <td style="padding: 8px; text-align: right; border: 1px solid #e5e7eb; color: #10b981;">${this.formatCurrency(t.totalIncome)}</td>
                                <td style="padding: 8px; text-align: right; border: 1px solid #e5e7eb; color: #ef4444;">${this.formatCurrency(t.totalExpense)}</td>
                                <td style="padding: 8px; text-align: right; border: 1px solid #e5e7eb; color: ${t.netProfit >= 0 ? '#10b981' : '#ef4444'};">${this.formatCurrency(t.netProfit)}</td>
                                <td style="padding: 8px; border: 1px solid #e5e7eb; color: #666;">${row.note || '-'}</td>
                            </tr>`;
        }).join('')}
                    </tbody>
                </table>
                
                <div style="text-align: center; margin-top: 30px; color: #999; font-size: 11px;">
                    <p>Bu rapor ${new Date().toLocaleString('tr-TR')} tarihinde oluşturulmuştur.</p>
                    <p>KOMAGENE © ${new Date().getFullYear()}</p>
                </div>
            </div>
        `;

        this.openPrintWindow(reportHTML, title);
    }

    openPrintWindow(content, title) {
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <style>
                    @media print {
                        body { margin: 0; padding: 10px; }
                        @page { margin: 1cm; }
                    }
                </style>
            </head>
            <body>
                ${content}
                <script>
                    window.onload = function() { 
                        window.print(); 
                        setTimeout(function() { window.close(); }, 100);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }

    bindRowEvents() {
        const tbody = document.getElementById('ledgerBody');
        if (!tbody) return;

        tbody.querySelectorAll('input').forEach(input => {
            const handler = (e) => {
                const tr = e.target.closest('tr');
                const id = tr.dataset.id;
                const field = e.target.dataset.field;
                const category = e.target.dataset.category;

                if (field === 'date') this.updateRowField(id, 'date', null, e.target.value);
                else if (field === 'note') this.updateRowField(id, 'note', null, e.target.value);
                else if (field === 'marked') this.updateRowField(id, 'marked', null, e.target.checked);
                else this.updateRowField(id, category, field, e.target.value);

                if (field === 'marked') {
                    tr.classList.toggle('marked', e.target.checked);
                    this.updateMiniStats();
                }
            };
            input.addEventListener('input', handler);
            input.addEventListener('change', handler);
        });

        tbody.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const button = e.target.closest('.btn-delete');
                if (button) {
                    const id = button.dataset.delete;
                    if (id && confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
                        this.deleteRow(id);
                    }
                }
            });
        });
    }

    // ===== REPORTS =====
    renderReports(period = 7) {
        // Get filtered data by period
        const today = new Date();
        let reportData = [...this.data];

        if (period !== 'all') {
            const cutoff = new Date();
            cutoff.setDate(today.getDate() - parseInt(period));
            reportData = reportData.filter(r => new Date(r.date) >= cutoff);
        }

        // Sort by date
        reportData.sort((a, b) => a.date.localeCompare(b.date));

        // Calculate totals
        let totalIncome = 0, totalExpense = 0;
        let incomeBreakdown = { pos: 0, cash: 0, online: 0 };
        let expenseBreakdown = { staff: 0, rent: 0, supplies: 0, tax: 0, other: 0 };

        let bestDay = null, worstDay = null, bestProfit = -Infinity, worstProfit = Infinity;
        let maxIncomeDay = null, maxExpenseDay = null, maxIncome = 0, maxExpense = 0;
        let profitDays = 0, markedDays = 0;

        reportData.forEach(row => {
            const t = this.getRowTotals(row);
            totalIncome += t.totalIncome;
            totalExpense += t.totalExpense;

            Object.keys(row.income).forEach(k => incomeBreakdown[k] += row.income[k]);
            Object.keys(row.expense).forEach(k => expenseBreakdown[k] += row.expense[k]);

            if (t.netProfit > bestProfit) { bestProfit = t.netProfit; bestDay = row; }
            if (t.netProfit < worstProfit) { worstProfit = t.netProfit; worstDay = row; }
            if (t.totalIncome > maxIncome) { maxIncome = t.totalIncome; maxIncomeDay = row; }
            if (t.totalExpense > maxExpense) { maxExpense = t.totalExpense; maxExpenseDay = row; }
            if (t.netProfit > 0) profitDays++;
            if (row.marked) markedDays++;
        });

        const netProfit = totalIncome - totalExpense;
        const dayCount = reportData.length || 1;
        const margin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

        // Update period info
        const periodText = period === 'all' ? 'Tüm Zamanlar' : `Son ${period} Gün`;
        this.setEl('periodText', periodText);
        this.setEl('periodDays', reportData.length.toString());

        // Update main stats
        this.setEl('reportIncome', this.formatCurrency(totalIncome));
        this.setEl('reportExpense', this.formatCurrency(totalExpense));
        this.setEl('reportProfit', this.formatCurrency(netProfit));
        this.setEl('reportIncomeAvg', `Günlük ort: ${this.formatCurrency(totalIncome / dayCount)}`);
        this.setEl('reportExpenseAvg', `Günlük ort: ${this.formatCurrency(totalExpense / dayCount)}`);
        this.setEl('reportProfitMargin', `Kar marjı: %${margin.toFixed(1)}`);
        this.setEl('reportMarginPercent', `%${margin.toFixed(1)}`);
        this.setEl('reportMarginTrend', margin >= 0 ? '📈 Kârlı' : '📉 Zararlı');

        // Update profit card color
        const profitCard = document.getElementById('reportProfitCard');
        if (profitCard) {
            profitCard.classList.remove('negative');
            if (netProfit < 0) profitCard.classList.add('negative');
        }

        // Update metrics
        if (bestDay) {
            this.setEl('reportBestDay', this.formatDate(bestDay.date));
            this.setEl('reportBestDayValue', this.formatCurrency(bestProfit));
        }
        if (worstDay) {
            this.setEl('reportWorstDay', this.formatDate(worstDay.date));
            this.setEl('reportWorstDayValue', this.formatCurrency(worstProfit));
        }
        if (maxIncomeDay) {
            this.setEl('reportMaxIncome', this.formatDate(maxIncomeDay.date));
            this.setEl('reportMaxIncomeValue', this.formatCurrency(maxIncome));
        }
        if (maxExpenseDay) {
            this.setEl('reportMaxExpense', this.formatDate(maxExpenseDay.date));
            this.setEl('reportMaxExpenseValue', this.formatCurrency(maxExpense));
        }
        this.setEl('reportProfitDays', profitDays.toString());
        this.setEl('reportProfitDaysPercent', `%${((profitDays / dayCount) * 100).toFixed(0)} başarı`);
        this.setEl('reportMarkedDays', markedDays.toString());

        // Render components
        this.renderBarChart(reportData);
        this.renderBreakdown(incomeBreakdown, expenseBreakdown, totalIncome, totalExpense);
        this.renderDetailsTable(reportData);
    }

    setEl(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    renderBarChart(data) {
        const container = document.getElementById('dailyChart');
        if (!container) return;

        if (data.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:40px;">Veri yok</p>';
            return;
        }

        const maxVal = Math.max(...data.map(r => {
            const t = this.getRowTotals(r);
            return Math.max(t.totalIncome, t.totalExpense, Math.abs(t.netProfit));
        }), 1);

        container.innerHTML = data.map(row => {
            const t = this.getRowTotals(row);
            const incomeH = (t.totalIncome / maxVal) * 200;
            const expenseH = (t.totalExpense / maxVal) * 200;
            const profitH = (Math.abs(t.netProfit) / maxVal) * 200;
            const d = new Date(row.date);
            const label = `${d.getDate()}/${d.getMonth() + 1}`;

            return `
                <div class="chart-bar" title="${this.formatDate(row.date)}">
                    <div style="display:flex;gap:2px;align-items:flex-end;height:220px;">
                        <div class="chart-bar-inner income" style="height:${incomeH}px;" title="Gelir: ${this.formatCurrency(t.totalIncome)}"></div>
                        <div class="chart-bar-inner expense" style="height:${expenseH}px;" title="Gider: ${this.formatCurrency(t.totalExpense)}"></div>
                        <div class="chart-bar-inner profit" style="height:${profitH}px;" title="Kar: ${this.formatCurrency(t.netProfit)}"></div>
                    </div>
                    <span class="chart-bar-label">${label}</span>
                </div>`;
        }).join('');
    }

    renderBreakdown(incomeB, expenseB, totalIncome, totalExpense) {
        const incomeList = document.getElementById('incomeBreakdown');
        const expenseList = document.getElementById('expenseBreakdown');
        const incomeChart = document.getElementById('incomeChart');
        const expenseChart = document.getElementById('expenseChart');

        const incomeLabels = { pos: 'POS Cihazı', cash: 'Nakit', online: 'Online Sipariş' };
        const expenseLabels = { staff: 'Personel Gideri', rent: 'Kira & Fatura', supplies: 'Malzeme', tax: 'Vergi', other: 'Diğer' };
        const colors = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
        const expenseColors = ['#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2'];

        // Income breakdown
        this.setEl('incomeTotalLabel', `Toplam: ${this.formatCurrency(totalIncome)}`);
        if (incomeList) {
            incomeList.innerHTML = Object.entries(incomeB).map(([k, v]) => {
                const pct = totalIncome > 0 ? ((v / totalIncome) * 100).toFixed(1) : 0;
                return `<div class="breakdown-item income-item">
                    <div class="breakdown-item-info">
                        <span class="breakdown-item-label">${incomeLabels[k]}</span>
                        <span class="breakdown-item-percent">%${pct}</span>
                    </div>
                    <span class="breakdown-item-value income">${this.formatCurrency(v)}</span>
                </div>`;
            }).join('');
        }
        if (incomeChart) {
            let i = 0;
            incomeChart.innerHTML = Object.entries(incomeB).map(([k, v]) => {
                const pct = totalIncome > 0 ? (v / totalIncome) * 100 : 0;
                return `<div class="breakdown-chart-segment" style="width:${pct}%;background:${colors[i++]};"></div>`;
            }).join('');
        }

        // Expense breakdown
        this.setEl('expenseTotalLabel', `Toplam: ${this.formatCurrency(totalExpense)}`);
        if (expenseList) {
            expenseList.innerHTML = Object.entries(expenseB).map(([k, v]) => {
                const pct = totalExpense > 0 ? ((v / totalExpense) * 100).toFixed(1) : 0;
                return `<div class="breakdown-item expense-item">
                    <div class="breakdown-item-info">
                        <span class="breakdown-item-label">${expenseLabels[k]}</span>
                        <span class="breakdown-item-percent">%${pct}</span>
                    </div>
                    <span class="breakdown-item-value expense">${this.formatCurrency(v)}</span>
                </div>`;
            }).join('');
        }
        if (expenseChart) {
            let i = 0;
            expenseChart.innerHTML = Object.entries(expenseB).map(([k, v]) => {
                const pct = totalExpense > 0 ? (v / totalExpense) * 100 : 0;
                return `<div class="breakdown-chart-segment" style="width:${pct}%;background:${expenseColors[i++]};"></div>`;
            }).join('');
        }
    }

    renderDetailsTable(data) {
        const tbody = document.getElementById('reportDetailsBody');
        const countEl = document.getElementById('detailsCount');
        if (!tbody) return;

        if (countEl) countEl.textContent = `${data.length} kayıt`;

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--text-muted);">Veri bulunamadı</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(row => {
            const t = this.getRowTotals(row);
            const margin = t.totalIncome > 0 ? ((t.netProfit / t.totalIncome) * 100).toFixed(1) : 0;
            const profitClass = t.netProfit >= 0 ? 'positive' : 'negative';
            return `<tr>
                <td>${this.formatDate(row.date)}</td>
                <td class="positive">${this.formatCurrency(t.totalIncome)}</td>
                <td class="negative">${this.formatCurrency(t.totalExpense)}</td>
                <td class="${profitClass}">${this.formatCurrency(t.netProfit)}</td>
                <td class="${profitClass}">%${margin}</td>
                <td class="note-cell">${row.note || '-'}</td>
            </tr>`;
        }).join('');
    }

    // ===== EXPORT/BACKUP =====
    exportToCSV() {
        const headers = ['Tarih', 'POS', 'Nakit', 'Online', 'Toplam Gelir', 'Personel', 'Kira/Fatura', 'Malzeme', 'Vergi', 'Diğer', 'Toplam Gider', 'Net Kar', 'Not', 'İşaretli'];
        const rows = this.data.map(row => {
            const t = this.getRowTotals(row);
            return [row.date, row.income.pos, row.income.cash, row.income.online, t.totalIncome, row.expense.staff, row.expense.rent, row.expense.supplies, row.expense.tax, row.expense.other, t.totalExpense, t.netProfit, row.note || '', row.marked ? 'Evet' : ''];
        });
        const grandTotals = this.getGrandTotals();
        rows.push(['TOPLAM', '', '', '', grandTotals.totalIncome, '', '', '', '', '', grandTotals.totalExpense, grandTotals.netProfit, '', '']);

        const BOM = '\uFEFF';
        const csv = BOM + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
        this.downloadFile(csv, `komagene_kasa_${this.getTodayDate()}.csv`, 'text/csv;charset=utf-8;');
    }

    downloadBackup() {
        const backup = JSON.stringify({ version: 2, date: new Date().toISOString(), data: this.data }, null, 2);
        this.downloadFile(backup, `komagene_yedek_${this.getTodayDate()}.json`, 'application/json');
    }

    restoreBackup(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const backup = JSON.parse(ev.target.result);
                if (backup.data && Array.isArray(backup.data)) {
                    if (confirm(`${backup.data.length} kayıt geri yüklenecek. Mevcut veriler silinecek. Devam?`)) {
                        this.data = backup.data;
                        this.saveData();
                        this.applyFilters();
                        this.renderTable();
                        this.updateTotals();
                        this.updateMiniStats();
                        alert('Yedek başarıyla geri yüklendi!');
                    }
                }
            } catch (err) {
                alert('Geçersiz yedek dosyası!');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    }

    downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Page Navigation
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${pageName}`)?.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`.nav-item[data-page="${pageName}"]`)?.classList.add('active');
}

// Init
let ledger;
document.addEventListener('DOMContentLoaded', () => {
    ledger = new KomagenoLedger();
});
