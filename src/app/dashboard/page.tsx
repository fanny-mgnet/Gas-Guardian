import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GasLevelKnob } from '@/components/gas-level-knob';
import { DeviceCard } from '@/components/device-card';
import { DashboardHeader } from '@/components/dashboard-header';
import { getAllAlerts, getDevices } from '@/lib/data';
import type { Alert } from '@/lib/types';

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
      <main className="flex flex-1 flex-col gap-4 md:gap-8 relative">
        <DashboardHeader />
        <GasLevelKnob gasLevel={gasLevel} lastUpdated={lastUpdated} />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="grid gap-2">
              <h2 className="text-xl font-bold tracking-tight">
                Connected Devices
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {devices.length} devices
            </p>
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

        <Button
          asChild
          className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg"
          size="icon"
        >
          <Link href="/dashboard/devices/new">
            <Plus className="h-8 w-8" />
            <span className="sr-only">Add Device</span>
          </Link>
        </Button>
      </main>
    </div>
  );
}
