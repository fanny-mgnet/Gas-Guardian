'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GasLevelDisplayCard } from '@/components/gas-level-display-card';
import { DeviceCard } from '@/components/device-card';
import { DashboardHeader } from '@/components/dashboard-header';
import type { Alert, Device, DeviceReading } from '@/lib/types';
import { AddDeviceDialog } from '@/components/add-device-dialog';
import Link from 'next/link';
import { Header } from '@/components/header';
import { useCollection } from '@/supabase/use-collection';
import { useUser } from '@/supabase/auth';
import { supabase } from '@/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useMemo, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

function DashboardLoading() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8">
        <DashboardHeader />
        <Card>
          <CardHeader className="items-center pb-2">
            <CardTitle>Gas Level</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Skeleton className="h-40 w-40 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </CardContent>
        </Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Connected Devices</h2>
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="relative">
            <div className="flex w-full space-x-4 pb-4 overflow-x-auto">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="min-w-[240px] flex-shrink-0">
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-lg" />
                          <div>
                            <Skeleton className="h-5 w-24 mb-1" />
                            <Skeleton className="h-3 w-8" />
                          </div>
                        </div>
                        <Skeleton className="h-5 w-12" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <Skeleton className="h-4 w-20 mb-1" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                      <Skeleton className="h-6 w-28 rounded-full" />
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Dashboard() {
  const { user, isLoading: isUserLoading } = useUser();
  const { toast } = useToast();

  const devicesRef = useMemo(() => {
    if (isUserLoading || !user?.id) {
      return null;
    }
    return {
      from: 'devices',
      params: { user_id: user.id },
    };
  }, [user?.id, isUserLoading]);
  const { data: devices, isLoading: devicesLoading, error: devicesError } = useCollection<Device>(devicesRef);

  const alertsRef = useMemo(() => {
    if (isUserLoading || !user?.id) {
      return null;
    }
    return {
      from: 'alerts',
      params: {},
    };
  }, [user?.id, isUserLoading]);

  const { data: allAlerts, isLoading: alertsLoading, error: alertsError } = useCollection<Alert>(alertsRef);

  const latestReadingRef = useMemo(() => {
    if (isUserLoading || !user?.id) {
      return null;
    }
    return {
      from: 'device_readings',
      orderBy: { column: 'created_at', ascending: false },
      limit: 1,
      pollingInterval: 5000, // Poll every 5 seconds for real-time feel
    };
  }, [user?.id, isUserLoading]);

  const { data: latestReadingArray, isLoading: latestReadingLoading } = useCollection<DeviceReading>(latestReadingRef);
  const latestReading = latestReadingArray?.[0] ?? null;
  
  if (devicesError) {
    console.error("Dashboard: Devices loading error:", devicesError);
  }

  if (alertsError) {
    console.error("Dashboard: Alerts loading error:", alertsError);
  }

  let gasPercentage = 0;
  const MAX_GAS_LEVEL = 4095; // Define MAX_GAS_LEVEL here for calculation (based on 12-bit ADC max value)

  if (latestReading) {
    try {
      if (typeof latestReading.gas_percentage === 'number') {
        gasPercentage = latestReading.gas_percentage;
      } else if (typeof latestReading.gas_level === 'number') {
        gasPercentage = Math.min((latestReading.gas_level / MAX_GAS_LEVEL) * 100, 100);
      }
    } catch (e) {
      console.error("Dashboard: Error accessing latestReading:", e);
    }
  }
  const lastUpdated = latestReading?.createdAt;

  console.log("Dashboard: Calculated gasPercentage:", gasPercentage);
  console.log("Dashboard: lastUpdated:", lastUpdated);

  useEffect(() => {
    // Trigger alert/toaster when gas percentage is between 50% and 100%
    if (gasPercentage >= 50) {
      toast({
        title: "⚠️ High Gas Level Warning",
        description: `Gas level is at ${Math.round(gasPercentage)}%. Immediate attention required.`,
        variant: gasPercentage >= 75 ? "destructive" : "default",
        duration: 120000, // 2 minutes
      });
    }
  }, [gasPercentage, toast]);

  if (devicesLoading || alertsLoading || isUserLoading || latestReadingLoading) {
    return <DashboardLoading />;
  }

  const getLatestAlert = () => {
    if (!allAlerts || allAlerts.length === 0) return null;
    // Sort to find the most recent alert
    const sortedAlerts = [...allAlerts].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sortedAlerts[0];
  }

  const latestAlert = getLatestAlert();

  const getLatestAlertForDevice = (deviceId: string): Alert | undefined => {
    if (!allAlerts) return undefined;
    const deviceAlerts = allAlerts.filter(alert => alert.deviceId === deviceId);
    if (deviceAlerts.length === 0) return undefined;
    return deviceAlerts.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8">
            <DashboardHeader />
            <GasLevelDisplayCard gasPercentage={gasPercentage} lastUpdated={lastUpdated} />

            <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">
                Connected Devices
                </h2>
                <Link href="/dashboard/devices" className="text-sm font-medium text-primary hover:underline">
                {devices?.length ?? 0} devices
                </Link>
            </div>

            <div className="relative">
                <div className="flex w-full space-x-4 pb-4 overflow-x-auto">
                {devices && devices.map(device => {
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
