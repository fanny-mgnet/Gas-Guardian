'use server';

import { predictFutureAlerts } from '@/ai/flows/predictive-maintenance-alerts';
import { collection, getDocs, query, where, getDoc, doc, collectionGroup, Timestamp } from 'firebase/firestore';
import { getSdks } from '@/firebase';
import type { Alert, Device, StatisticsData, FilterType, DeviceReading, SummaryStats, TrendDataPoint, DeviceComparisonDataPoint, StatChangeType } from './types';
import { startOfDay, endOfDay, subDays, subWeeks, subMonths, subYears, format, getHours } from 'date-fns';


// This is a placeholder for a server-side getFirestore instance.
// In a real app, you would initialize Firebase Admin SDK here.
const { firestore } = getSdks();

async function getDeviceById(deviceId: string, userId: string): Promise<Device | null> {
    const deviceRef = doc(firestore, 'users', userId, 'devices', deviceId);
    const deviceSnap = await getDoc(deviceRef);
    if (deviceSnap.exists()) {
        return { id: deviceSnap.id, ...deviceSnap.data() } as Device;
    }
    return null;
}

async function getAlertsByDeviceId(deviceId: string, userId: string): Promise<Alert[]> {
    const alerts: Alert[] = [];
    const alertsRef = collection(firestore, 'users', userId, 'devices', deviceId, 'alerts');
    const q = query(alertsRef);
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        alerts.push({ id: doc.id, ...doc.data() } as Alert);
    });
    return alerts;
}


export async function getPrediction(deviceId: string, userId: string) {
  try {
    const device = await getDeviceById(deviceId, userId);
    if (!device) {
        return { error: 'Device not found.' };
    }

    const alerts = await getAlertsByDeviceId(deviceId, userId);
    if (alerts.length < 3) {
      return { error: 'Not enough alert history to make a prediction. At least 3 alerts are required.' };
    }

    const alertHistory = alerts.map(a => ({
        createdAt: a.createdAt,
        gasLevel: a.sensorData.gas_value, // Fixed: sensorData is already an object
        alertType: a.alertType,
    }));

    const input = {
      alertHistory: JSON.stringify(alertHistory, null, 2),
      deviceDetails: JSON.stringify({ deviceName: device.deviceName, macAddress: device.macAddress }, null, 2),
    };

    const prediction = await predictFutureAlerts(input);
    return { data: prediction };

  } catch (e: any) {
    console.error("Prediction error:", e);
    return { error: e.message || 'An unknown error occurred during prediction.' };
}

/**
 * Helper function to determine the start and end dates for a given filter type.
 * @param filter The time filter ('today', 'week', 'month', 'year').
 * @returns An object containing the start and end Date objects.
 */
function getDateRange(filter: FilterType): { startDate: Date; endDate: Date; previousStartDate: Date; previousEndDate: Date } {
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;
    let previousEndDate: Date;

    switch (filter) {
        case 'today':
            startDate = startOfDay(now);
            previousEndDate = subDays(startDate, 1);
            previousStartDate = startOfDay(previousEndDate);
            break;
        case 'week':
            // Start of the current week (Sunday)
            startDate = subDays(startOfDay(now), now.getDay());
            previousEndDate = subDays(startDate, 1);
            previousStartDate = subDays(previousEndDate, 6);
            break;
        case 'month':
            startDate = subMonths(startOfDay(now), 0); // Start of current month
            startDate.setDate(1);
            previousEndDate = subDays(startDate, 1);
            previousStartDate = subMonths(startDate, 1);
            break;
        case 'year':
            startDate = subYears(startOfDay(now), 0); // Start of current year
            startDate.setMonth(0, 1);
            previousEndDate = subDays(startDate, 1);
            previousStartDate = subYears(startDate, 1);
            break;
        default:
            throw new Error('Invalid filter type');
    }

    return {
        startDate,
        endDate: endOfDay(now),
        previousStartDate,
        previousEndDate,
    };
}

/**
 * Calculates statistics (average, peak, safe hours, alerts) for a given set of readings.
 * @param readings Current period readings.
 * @param previousReadings Previous period readings for comparison.
 * @param filter The time filter for context.
 * @returns SummaryStats object.
 */
function calculateStats(readings: DeviceReading[], previousReadings: DeviceReading[], filter: FilterType): SummaryStats {
    const currentGasValues = readings.map(r => r.gas_value).filter(v => v !== undefined) as number[];
    const previousGasValues = previousReadings.map(r => r.gas_value).filter(v => v !== undefined) as number[];

    // Helper to calculate percentage change
    const calculateChange = (current: number, previous: number): { change: string, type: StatChangeType } => {
        if (previous === 0) {
            return { change: 'N/A', type: 'neutral' };
        }
        const percentageChange = ((current - previous) / previous) * 100;
        const change = `${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(1)}%`;
        const type: StatChangeType = percentageChange > 0 ? 'increase' : percentageChange < 0 ? 'decrease' : 'neutral';
        return { change, type };
    };

    // 1. Average Level
    const currentAverage = currentGasValues.length > 0 ? currentGasValues.reduce((a, b) => a + b, 0) / currentGasValues.length : 0;
    const previousAverage = previousGasValues.length > 0 ? previousGasValues.reduce((a, b) => a + b, 0) / previousGasValues.length : 0;
    const avgChange = calculateChange(currentAverage, previousAverage);

    // 2. Peak Reading
    const currentPeak = currentGasValues.length > 0 ? Math.max(...currentGasValues) : 0;
    const previousPeak = previousGasValues.length > 0 ? Math.max(...previousGasValues) : 0;
    const peakChange = calculateChange(currentPeak, previousPeak);

    // 3. Safe Hours (Assuming 'safe' is gas_value <= 30)
    const SAFE_THRESHOLD = 30;
    const safeReadings = readings.filter(r => r.gas_value <= SAFE_THRESHOLD);
    const previousSafeReadings = previousReadings.filter(r => r.gas_value <= SAFE_THRESHOLD);

    // Assuming readings are roughly 1 per minute, so 60 readings per hour.
    // If readings are sparse, this calculation is an approximation based on count.
    const currentSafeHours = safeReadings.length / 60;
    const previousSafeHours = previousSafeReadings.length / 60;

    // Safe hours change is inverted: more safe hours is a 'decrease' in risk (good).
    const safeHoursChangeValue = currentSafeHours - previousSafeHours;
    const safeHoursChangePercentage = previousSafeHours > 0 ? (safeHoursChangeValue / previousSafeHours) * 100 : 0;
    const safeHoursChange = `${safeHoursChangePercentage > 0 ? '+' : ''}${safeHoursChangePercentage.toFixed(1)}%`;
    const safeHoursType: StatChangeType = safeHoursChangePercentage > 0 ? 'decrease' : safeHoursChangePercentage < 0 ? 'increase' : 'neutral'; // Decrease in risk is good

    // 4. Alerts (Assuming alerts are readings where gas_value > 50)
    const ALERT_THRESHOLD = 50;
    const currentAlerts = readings.filter(r => r.gas_value > ALERT_THRESHOLD).length;
    const previousAlerts = previousReadings.filter(r => r.gas_value > ALERT_THRESHOLD).length;
    const alertsChange = calculateChange(currentAlerts, previousAlerts);
    const alertsType: StatChangeType = alertsChange.type === 'increase' ? 'increase' : alertsChange.type === 'decrease' ? 'decrease' : 'neutral';

    return {
        average: {
            value: currentAverage.toFixed(1),
            unit: 'ppm',
            change: avgChange.change,
            type: avgChange.type,
        },
        peak: {
            value: currentPeak.toFixed(1),
            unit: 'ppm',
            change: peakChange.change,
            type: peakChange.type,
        },
        safe: {
            value: currentSafeHours.toFixed(1),
            unit: 'hrs',
            change: safeHoursChange,
            type: safeHoursType,
        },
        alerts: {
            value: currentAlerts.toString(),
            unit: currentAlerts === 1 ? 'time' : 'times',
            change: alertsChange.change,
            type: alertsType,
        },
    };
}

/**
 * Fetches and calculates all statistics data for a given time filter.
 * @param filter The time filter ('today', 'week', 'month', 'year').
 * @param userId The ID of the current user.
 * @returns StatisticsData object.
 */
export const getStatisticsData = async (filter: FilterType, userId: string): Promise<StatisticsData> => {
    const { startDate, endDate, previousStartDate, previousEndDate } = getDateRange(filter);

    // 1. Fetch current period readings
    const readingsRef = collectionGroup(firestore, 'readings');
    const currentQuery = query(
        readingsRef,
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(startDate).toDate().toISOString()),
        where('createdAt', '<=', Timestamp.fromDate(endDate).toDate().toISOString())
    );
    const currentSnapshot = await getDocs(currentQuery);
    const currentReadings: DeviceReading[] = currentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DeviceReading));

    // 2. Fetch previous period readings for comparison
    const previousQuery = query(
        readingsRef,
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(previousStartDate).toDate().toISOString()),
        where('createdAt', '<=', Timestamp.fromDate(previousEndDate).toDate().toISOString())
    );
    const previousSnapshot = await getDocs(previousQuery);
    const previousReadings: DeviceReading[] = previousSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DeviceReading));

    // 3. Calculate Summary Stats
    const summaryStats = calculateStats(currentReadings, previousReadings, filter);

    // 4. Calculate Trend Data (Gas Level Trend)
    let trendData: TrendDataPoint[] = [];
    let dailyGasData: Record<string, number> = {};

    if (filter === 'today') {
        // Group by hour
        const hourlyData: Record<number, { sum: number, count: number }> = {};
        currentReadings.forEach(r => {
            const hour = getHours(new Date(r.createdAt));
            if (!hourlyData[hour]) {
                hourlyData[hour] = { sum: 0, count: 0 };
            }
            hourlyData[hour].sum += r.gas_value;
            hourlyData[hour].count += 1;
        });

        trendData = Object.keys(hourlyData).sort().map(hourStr => {
            const hour = parseInt(hourStr);
            const avgValue = hourlyData[hour].sum / hourlyData[hour].count;
            const timeLabel = format(new Date().setHours(hour, 0, 0, 0), 'ha');
            return { time: timeLabel, value: parseFloat(avgValue.toFixed(1)) };
        });

    } else if (filter === 'week' || filter === 'month') {
        // Group by day
        const dailyAverages: Record<string, { sum: number, count: number }> = {};
        currentReadings.forEach(r => {
            const dateKey = format(new Date(r.createdAt), 'yyyy-MM-dd');
            if (!dailyAverages[dateKey]) {
                dailyAverages[dateKey] = { sum: 0, count: 0 };
            }
            dailyAverages[dateKey].sum += r.gas_value;
            dailyAverages[dateKey].count += 1;
        });

        trendData = Object.keys(dailyAverages).sort().map(dateKey => {
            const avgValue = dailyAverages[dateKey].sum / dailyAverages[dateKey].count;
            const timeLabel = filter === 'week' ? format(new Date(dateKey), 'EEE') : format(new Date(dateKey), 'MMM d');
            dailyGasData[dateKey] = parseFloat(avgValue.toFixed(1));
            return { time: timeLabel, value: parseFloat(avgValue.toFixed(1)) };
        });

    } else if (filter === 'year') {
        // Group by month
        const monthlyAverages: Record<string, { sum: number, count: number }> = {};
        currentReadings.forEach(r => {
            const monthKey = format(new Date(r.createdAt), 'yyyy-MM');
            if (!monthlyAverages[monthKey]) {
                monthlyAverages[monthKey] = { sum: 0, count: 0 };
            }
            monthlyAverages[monthKey].sum += r.gas_value;
            monthlyAverages[monthKey].count += 1;
        });

        trendData = Object.keys(monthlyAverages).sort().map(monthKey => {
            const avgValue = monthlyAverages[monthKey].sum / monthlyAverages[monthKey].count;
            const timeLabel = format(new Date(monthKey + '-01'), 'MMM');
            return { time: timeLabel, value: parseFloat(avgValue.toFixed(1)) };
        });
    }

    // 5. Calculate Device Comparison Data (Average gas level per device in the current period)
    const deviceAverages: Record<string, { sum: number, count: number, deviceName: string }> = {};
    currentReadings.forEach(r => {
        const deviceId = r.device_id;
        if (!deviceAverages[deviceId]) {
            // NOTE: We need to fetch device details to get the deviceName.
            // For simplicity and to avoid extra fetches, we'll use a placeholder or assume deviceName is available if we had joined data.
            // Since we don't have device names readily available in the reading, we'll use device_id as a temporary key and assume we can map it later.
            // For now, I will use a placeholder logic for device comparison data.

            // Placeholder logic: Group by device_id and use device_id as name.
            deviceAverages[deviceId] = { sum: 0, count: 0, deviceName: `Device ${deviceId.substring(0, 4)}` };
        }
        deviceAverages[deviceId].sum += r.gas_value;
        deviceAverages[deviceId].count += 1;
    });

    const deviceComparisonData: DeviceComparisonDataPoint[] = Object.keys(deviceAverages).map(deviceId => {
        const avgValue = deviceAverages[deviceId].sum / deviceAverages[deviceId].count;
        return {
            name: deviceAverages[deviceId].deviceName,
            value: parseFloat(avgValue.toFixed(1)),
        };
    });

    // If dailyGasData is empty (e.g., for 'today' or 'year' filters), we need to ensure it's populated for the calendar view if applicable.
    // However, the calendar view is only relevant for 'month' filter in the UI, which uses daily averages.
    // We will rely on the daily averages calculated above for 'week' and 'month' filters.

    return {
        trendData,
        summaryStats,
        deviceComparisonData,
        dailyGasData,
    };
}
