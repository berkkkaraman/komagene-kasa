import { DailyRecord } from "@/types";
import { differenceInDays, parseISO, subDays } from "date-fns";

export interface AnomalyAlert {
    id: string;
    type: 'income_drop' | 'expense_spike' | 'shift_shortage' | 'consecutive_low';
    severity: 'medium' | 'high' | 'critical';
    message: string;
    date: string;
    value: number;
    expected: number;
}

// Calculate mean and standard deviation
function getStats(values: number[]) {
    if (values.length === 0) return { mean: 0, stdDev: 0 };
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    return { mean, stdDev: Math.sqrt(variance) };
}

export function detectAnomalies(records: DailyRecord[]): AnomalyAlert[] {
    const alerts: AnomalyAlert[] = [];
    if (records.length < 7) return alerts; // Need baseline data

    const sortedRecords = [...records].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const latestRecord = sortedRecords[0];
    const pastRecords = sortedRecords.slice(1, 31); // Last 30 days excluding today

    // 1. Income Anomaly (Z-Score)
    const pastIncomes = pastRecords.map(r =>
        r.income.cash + r.income.creditCard + Object.values(r.income.online).reduce((a, b) => a + b, 0)
    );
    const { mean: incomeMean, stdDev: incomeStd } = getStats(pastIncomes);

    const currentIncome = latestRecord.income.cash + latestRecord.income.creditCard +
        Object.values(latestRecord.income.online).reduce((a, b) => a + b, 0);

    // If current income is 2 std devs below mean (bottom 2.5%)
    if (currentIncome < incomeMean - (2 * incomeStd) && currentIncome > 0) {
        alerts.push({
            id: `income-${latestRecord.date}`,
            type: 'income_drop',
            severity: 'high',
            message: `Bugünkü ciro normalin çok altında! (Ort: ${Math.round(incomeMean)}₺)`,
            date: latestRecord.date,
            value: currentIncome,
            expected: incomeMean
        });
    }

    // 2. Expense Spike
    const pastExpenses = pastRecords.map(r => r.expenses.reduce((a, b) => a + b.amount, 0));
    const { mean: expMean, stdDev: expStd } = getStats(pastExpenses);
    const currentExpense = latestRecord.expenses.reduce((a, b) => a + b.amount, 0);

    if (currentExpense > expMean + (2.5 * expStd) && currentExpense > 500) {
        alerts.push({
            id: `expense-${latestRecord.date}`,
            type: 'expense_spike',
            severity: 'critical',
            message: `Giderlerde olağandışı artış tespit edildi.`,
            date: latestRecord.date,
            value: currentExpense,
            expected: expMean
        });
    }

    // 3. Shift Shortage Pattern
    const recentShortages = sortedRecords.slice(0, 5).filter(r =>
        (r.shift.cashOnEnd - r.shift.cashOnStart) < -50
    );

    if (recentShortages.length >= 3) {
        alerts.push({
            id: `shift-pattern-${latestRecord.date}`,
            type: 'shift_shortage',
            severity: 'medium',
            message: `Son 5 günün 3'ünde kasa açığı oluştu.`,
            date: latestRecord.date,
            value: recentShortages.length,
            expected: 0
        });
    }

    return alerts;
}
