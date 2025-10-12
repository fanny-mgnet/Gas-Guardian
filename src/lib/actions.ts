'use server';

import { predictFutureAlerts } from '@/ai/flows/predictive-maintenance-alerts';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { getSdks } from '@/firebase'; // Assuming a server-side firebase init
import type { Alert, Device } from './types';


// This is a placeholder for a server-side getFirestore instance.
// In a real app, you would initialize Firebase Admin SDK here.
const { firestore } = getSdks();

async function getDeviceById(deviceId: string): Promise<Device | null> {
    const deviceRef = doc(firestore, 'devices', deviceId);
    const deviceSnap = await getDoc(deviceRef);
    if (deviceSnap.exists()) {
        return { id: deviceSnap.id, ...deviceSnap.data() } as Device;
    }
    return null;
}

async function getAlertsByDeviceId(deviceId: string): Promise<Alert[]> {
    const alerts: Alert[] = [];
    const alertsRef = collection(firestore, 'devices', deviceId, 'alerts');
    const q = query(alertsRef);
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        alerts.push({ id: doc.id, ...doc.data() } as Alert);
    });
    return alerts;
}


export async function getPrediction(deviceId: string) {
  try {
    const device = await getDeviceById(deviceId);
    const alerts = await getAlertsByDeviceId(deviceId);

    if (!device || alerts.length === 0) {
      return { error: 'Not enough data available for prediction.' };
    }

    // Sort alerts chronologically
    const sortedAlerts = alerts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    const alertHistory = JSON.stringify(
      sortedAlerts.map(a => {
        const sensorData = typeof a.sensorData === 'string' ? JSON.parse(a.sensorData) : a.sensorData;
        return {
            timestamp: a.createdAt,
            gas_level: sensorData.gas_value,
            alert_type: a.alertType,
        }
      })
    );

    const deviceDetails = JSON.stringify({
      name: device.deviceName,
      location: 'N/A', // from prompt
      model: 'MQ5-ESP32', // from prompt
      install_date: device.createdAt,
    });

    const prediction = await predictFutureAlerts({
      alertHistory,
      deviceDetails,
    });

    return { data: prediction };
  } catch (error) {
    console.error('Prediction failed:', error);
    return { error: 'An unexpected error occurred while generating the prediction.' };
  }
}
