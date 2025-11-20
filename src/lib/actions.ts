"use server";

import { supabase } from '@/supabase/client';
import type { Alert, Device } from './types';
import { sendGasHighEmail } from './email';

async function getDeviceById(deviceId: string, userId: string): Promise<Device | null> {
    const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('id', deviceId)
        .eq('user_id', userId)
        .single();

    if (error) {
        console.error('Error fetching device:', error);
        return null;
    }

    return data as Device | null;
}

async function getAlertsByDeviceId(deviceId: string, userId: string): Promise<Alert[]> {
    const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('device_id', deviceId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching alerts:', error);
        return [];
    }

    return data as Alert[];
}

export async function checkGasLevelAndNotify(deviceId: string, userId: string) {
  const device = await getDeviceById(deviceId, userId);
  if (!device) {
    throw new Error('Device not found');
  }

  // For demonstration, we'll use a static high gas value.
  // In a real application, you would fetch the latest reading from the database.
  const highGasLevel = 75;
  const ALERT_THRESHOLD = 50;

  if (highGasLevel > ALERT_THRESHOLD) {
    await sendGasHighEmail(device.email, device.deviceName, highGasLevel);
    return { message: 'Email notification sent.' };
  }

  return { message: 'Gas level is normal.' };
}

