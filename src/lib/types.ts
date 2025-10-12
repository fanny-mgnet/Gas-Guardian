export type Device = {
  id: string; // UUID
  mac_address: string;
  device_name: string;
  wifi_ssid: string;
  email: string;
  mobile_number: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  is_active: boolean;
};

export type Alert = {
  id: string; // UUID
  device_id: string;
  alert_type: 'gas_emergency' | 'gas_warning' | 'gas_normal';
  message: string;
  sensor_data: {
    gas_value: number;
    threshold?: number;
  };
  created_at: string; // ISO date string
};
