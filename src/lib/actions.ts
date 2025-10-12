'use server';

import { predictFutureAlerts } from '@/ai/flows/predictive-maintenance-alerts';
import { collection, getDocs, query, where, getDoc, doc, collectionGroup } from 'firebase/firestore';
import { getSdks } from '@/firebase';
import type { Alert, Device } from './types';


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
        gasLevel: JSON.parse(a.sensorData).gas_value,
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
}
