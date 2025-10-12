'use server';

import { predictFutureAlerts } from '@/ai/flows/predictive-maintenance-alerts';
import { getDeviceById, getAlertsByDeviceId } from '@/lib/data';

export async function getPrediction(deviceId: string) {
  try {
    const device = await getDeviceById(deviceId);
    const alerts = await getAlertsByDeviceId(deviceId);

    if (!device || alerts.length === 0) {
      return { error: 'Not enough data available for prediction.' };
    }

    // Sort alerts chronologically
    const sortedAlerts = alerts.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    const alertHistory = JSON.stringify(
      sortedAlerts.map(a => ({
        timestamp: a.created_at,
        gas_level: a.sensor_data.gas_value,
        alert_type: a.alert_type,
      }))
    );

    const deviceDetails = JSON.stringify({
      name: device.device_name,
      location: 'N/A', // from prompt
      model: 'MQ5-ESP32', // from prompt
      install_date: device.created_at,
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
