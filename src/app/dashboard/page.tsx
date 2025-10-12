import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GasLevelKnob } from '@/components/gas-level-knob';
import { DeviceCard } from '@/components/device-card';
import { DashboardHeader } from '@/components/dashboard-header';
import { getAllAlerts, getDevices } from '@/lib/data';
import type { Alert } from '@/lib/types';
import { AddDeviceDialog } from '@/components/add-device-dialog';
import Link from 'next/link';
import { Header } from '@/components/header';

export default async function Dashboard() {
  const devices = await getDevices();
  const allAlerts = await getAllAlerts();

  const latestAlert = allAlerts[0];
  const gasLevel = latestAlert?.sensor_data.gas_value ?? 0;
  const lastUpdated = latestAlert?.created_at;

  const getLatestAlertForDevice = (deviceId: string): Alert | undefined => {
    return allAlerts.find(alert => alert.device_id === deviceId);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8">
            <DashboardHeader />
            <GasLevelKnob gasLevel={gasLevel} lastUpdated={lastUpdated} />

            <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">
                Connected Devices
                </h2>
                <Link href="/dashboard/devices" className="text-sm font-medium text-primary hover:underline">
                {devices.length} devices
                </Link>
            </div>

            <div className="relative">
                <div className="flex w-full space-x-4 pb-4 overflow-x-auto">
                {devices.map(device => {
                    const latestDeviceAlert = getLatestAlertForDevice(device.id);
                    return (
                    <DeviceCard
                        key={device.id}
                        device={device}
                        latestAlert={latestDeviceAlert}
                    />
                    );
                })}
                </div>
            </div>
            </div>

            <AddDeviceDialog>
                <Button
                className="fixed bottom-20 right-4 h-16 w-16 rounded-2xl shadow-lg z-40"
                size="icon"
                >
                <Plus className="h-8 w-8" />
                <span className="sr-only">Add Device</span>
                </Button>
            </AddDeviceDialog>
        </main>
    </div>
  );
}
