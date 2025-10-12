import type { Device, Alert } from './types';

// Helper to generate dates
const getDate = (daysAgo: number, hoursAgo: number = 0, minutesAgo: number = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  date.setMinutes(date.getMinutes() - minutesAgo);
  return date.toISOString();
};

export const devices: Device[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    mac_address: 'AA:BB:CC:DD:EE:FF',
    device_name: 'Kitchen Gas Detector',
    wifi_ssid: 'HomeSweetHome-2.4',
    email: 'user-kitchen@example.com',
    mobile_number: '+1234567890',
    created_at: getDate(30),
    updated_at: getDate(0, 1),
    is_active: true,
  },
  {
    id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0',
    mac_address: '11:22:33:44:55:66',
    device_name: 'Garage Sensor',
    wifi_ssid: 'WorkshopNet',
    email: 'user-garage@example.com',
    mobile_number: '+1987654321',
    created_at: getDate(90),
    updated_at: getDate(2),
    is_active: true,
  },
  {
    id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01',
    mac_address: 'A1:B2:C3:D4:E5:F6',
    device_name: 'Basement Monitor',
    wifi_ssid: 'HomeSweetHome-5G',
    email: 'user-basement@example.com',
    mobile_number: '+1555555555',
    created_at: getDate(15),
    updated_at: getDate(5),
    is_active: false,
  },
];

export const alerts: Alert[] = [
  // Alerts for Kitchen Detector (Device 1) - showing a pattern of increasing frequency/severity
  { id: 'alert-k1', device_id: devices[0].id, alert_type: 'gas_normal', message: 'System check OK.', sensor_data: { gas_value: 55 }, created_at: getDate(10, 5) },
  { id: 'alert-k2', device_id: devices[0].id, alert_type: 'gas_warning', message: 'Slightly elevated gas levels.', sensor_data: { gas_value: 160, threshold: 150 }, created_at: getDate(7, 3) },
  { id: 'alert-k3', device_id: devices[0].id, alert_type: 'gas_normal', message: 'Levels returned to normal.', sensor_data: { gas_value: 60 }, created_at: getDate(7, 2) },
  { id: 'alert-k4', device_id: devices[0].id, alert_type: 'gas_warning', message: 'Slightly elevated gas levels.', sensor_data: { gas_value: 175, threshold: 150 }, created_at: getDate(4, 8) },
  { id: 'alert-k5', device_id: devices[0].id, alert_type: 'gas_warning', message: 'Gas levels remain elevated.', sensor_data: { gas_value: 180, threshold: 150 }, created_at: getDate(4, 7) },
  { id: 'alert-k6', device_id: devices[0].id, alert_type: 'gas_normal', message: 'Levels returned to normal.', sensor_data: { gas_value: 65 }, created_at: getDate(4, 5) },
  { id: 'alert-k7', device_id: devices[0].id, alert_type: 'gas_emergency', message: 'Dangerous gas levels detected!', sensor_data: { gas_value: 280, threshold: 250 }, created_at: getDate(1, 12) },
  { id: 'alert-k8', device_id: devices[0].id, alert_type: 'gas_warning', message: 'Gas levels reduced but still high.', sensor_data: { gas_value: 200, threshold: 150 }, created_at: getDate(1, 11) },
  { id: 'alert-k9', device_id: devices[0].id, alert_type: 'gas_normal', message: 'System nominal.', sensor_data: { gas_value: 70 }, created_at: getDate(0, 2) },

  // Alerts for Garage Sensor (Device 2) - random, less frequent
  { id: 'alert-g1', device_id: devices[1].id, alert_type: 'gas_normal', message: 'System check OK.', sensor_data: { gas_value: 45 }, created_at: getDate(25) },
  { id: 'alert-g2', device_id: devices[1].id, alert_type: 'gas_warning', message: 'Elevated gas levels detected.', sensor_data: { gas_value: 155, threshold: 150 }, created_at: getDate(12) },
  { id: 'alert-g3', device_id: devices[1].id, alert_type: 'gas_normal', message: 'Levels returned to normal.', sensor_data: { gas_value: 50 }, created_at: getDate(11) },
  { id: 'alert-g4', device_id: devices[1].id, alert_type: 'gas_normal', message: 'System nominal.', sensor_data: { gas_value: 52 }, created_at: getDate(1, 5) },

  // Alerts for Basement Monitor (Device 3) - inactive, old data
  { id: 'alert-b1', device_id: devices[2].id, alert_type: 'gas_normal', message: 'System check OK.', sensor_data: { gas_value: 50 }, created_at: getDate(14) },
  { id: 'alert-b2', device_id: devices[2].id, alert_type: 'gas_normal', message: 'System check OK.', sensor_data: { gas_value: 48 }, created_at: getDate(10) },
  { id: 'alert-b3', device_id: devices[2].id, alert_type: 'gas_normal', message: 'Device offline.', sensor_data: { gas_value: 0 }, created_at: getDate(5) },
];

// API-like functions to simulate fetching data
export const getDevices = async (): Promise<Device[]> => {
  return Promise.resolve(devices);
};

export const getDeviceById = async (id: string): Promise<Device | undefined> => {
  return Promise.resolve(devices.find(d => d.id === id));
};

export const getAlertsByDeviceId = async (deviceId: string): Promise<Alert[]> => {
  return Promise.resolve(alerts.filter(a => a.device_id === deviceId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
};

export const getAllAlerts = async (): Promise<Alert[]> => {
  return Promise.resolve(alerts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
};
