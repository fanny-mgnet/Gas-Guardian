export type Device = {
  id: string; // Document ID
  macAddress: string;
  deviceName: string;
  wifiSsid: string;
  email: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  isActive: boolean;
  userId: string;
};

export type Alert = {
  id: string; // Document ID
  deviceId: string;
  alertType: 'gas_emergency' | 'gas_warning' | 'gas_normal' | 'system';
  message: string;
  sensorData: {
    gas_value?: number;
    gas_percentage?: number;
    threshold?: number;
    warning_level?: number;
    status?: string;
    device_id?: string;
    test?: string;
    gas?: number;
  };
  createdAt: string; // ISO date string
  userId: string; // Denormalized for collection group queries
};

export type Profile = {
  id: string;
  updated_at: string;
  full_name: string;
  avatar_url: string;
  website: string;
};
