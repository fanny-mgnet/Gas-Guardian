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
  // This function is causing a crash because it's not authenticated on the server.
  // It is being temporarily disabled to prevent the app from crashing.
  return { error: 'Prediction feature is temporarily disabled.' };
}
