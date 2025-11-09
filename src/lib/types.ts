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

export type DeviceReading = {
  id: string; // Document ID
  device_id: string;
  temperature: number;
  humidity: number;
  pressure: number;
  gas_level: number;
  gas_value: number; // Added for real-time readings
  gas_percentage: number; // Added for real-time readings
  createdAt: string; // ISO date string
};

export type Profile = {
  id: string;
  updated_at: string;
  full_name: string;
  avatar_url: string;
  website: string;
};

// Statistics Types
export type StatChangeType = 'increase' | 'decrease' | 'neutral';

export type StatItem = {
  value: string;
  unit: string;
  change: string;
  type: StatChangeType;
};

export type SummaryStats = {
  average: StatItem;
  peak: StatItem;
  safe: StatItem;
  alerts: StatItem;
};

export type TrendDataPoint = {
  time: string;
  value: number;
};

export type DeviceComparisonDataPoint = {
  name: string;
  value: number;
};

export type DailyGasData = Record<string, number>; // 'yyyy-MM-dd': gas_value

export type StatisticsData = {
  trendData: TrendDataPoint[];
  summaryStats: SummaryStats;
  deviceComparisonData: DeviceComparisonDataPoint[];
  dailyGasData: DailyGasData;
};

export type FilterType = 'today' | 'week' | 'month' | 'year';
