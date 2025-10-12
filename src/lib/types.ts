export type Device = {
  id: string; // UUID
  macAddress: string;
  deviceName: string;
  wifiSsid: string;
  email: string;
  mobileNumber: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  isActive: boolean;
};

export type Alert = {
  id: string; // UUID
  deviceId: string;
  alertType: 'gas_emergency' | 'gas_warning' | 'gas_normal';
  message: string;
  sensorData: string; // JSON string
  createdAt: string; // ISO date string
};
