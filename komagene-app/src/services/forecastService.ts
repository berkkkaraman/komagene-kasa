import { DailyRecord } from "@/types";
import { linearRegression, linearRegressionLine } from "simple-statistics";
import { parseISO, differenceInDays, addDays, format } from "date-fns";
import { tr } from "date-fns/locale";

interface ForecastData {
    predictedRevenue: number;
    trend: 'up' | 'down' | 'stable';
    confidence: number;
    nextWeekData: { date: string; amount: number }[];
}

export function generateForecast(records: DailyRecord[]): ForecastData | null {
    if (records.length < 5) return null; // Need at least 5 days of data

    // Sort records by date
    const sortedRecords = [...records].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Filter last 30 days
    const today = new Date();
    const recentRecords = sortedRecords.filter(r =>
        differenceInDays(today, parseISO(r.date)) <= 30
    );

    if (recentRecords.length < 5) return null;

    // Prepare data points [day_index, total_income]
    const firstDate = parseISO(recentRecords[0].date);
    const dataPoints = recentRecords.map(r => {
        const daysDiff = differenceInDays(parseISO(r.date), firstDate);
        const totalIncome = r.income.cash + r.income.creditCard +
            Object.values(r.income.online).reduce((a, b) => a + b, 0);
        return [daysDiff, totalIncome] as [number, number];
    });

    // Handle anomaly filtering (optional: replace outliers with median)
    // For now, raw linear regression

    // Calculate regression
    const regression = linearRegression(dataPoints);
    const predict = linearRegressionLine(regression);

    // Predict next 7 days
    const lastDayIndex = differenceInDays(parseISO(recentRecords[recentRecords.length - 1].date), firstDate);
    const nextWeekData = [];
    let totalPredicted = 0;

    for (let i = 1; i <= 7; i++) {
        const futureIndex = lastDayIndex + i;
        const predictedAmount = Math.max(0, predict(futureIndex)); // No negative sales
        const futureDate = addDays(parseISO(recentRecords[recentRecords.length - 1].date), i);

        nextWeekData.push({
            date: format(futureDate, "dd MMM", { locale: tr }),
            amount: Math.round(predictedAmount)
        });
        totalPredicted += predictedAmount;
    }

    // Determine Trend
    const trend = regression.m > 50 ? 'up' : regression.m < -50 ? 'down' : 'stable';

    // Simple confidence score based on R-squared approximation (not supported directly in simple-statistics linearRegression, assuming heuristic)
    // We will just use sample size as confidence proxy for v1
    const confidence = Math.min(recentRecords.length * 3, 95); // Max 95% if >30 records

    return {
        predictedRevenue: Math.round(totalPredicted),
        trend,
        confidence,
        nextWeekData
    };
}
