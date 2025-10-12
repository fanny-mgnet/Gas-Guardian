'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GasLevelKnob } from '@/components/gas-level-knob';
import { DeviceCard } from '@/components/device-card';
import { DashboardHeader } from '@/components/dashboard-header';
import type { Alert, Device } from '@/lib/types';
import { AddDeviceDialog } from '@/components/add-device-dialog';
import Link from 'next/link';
import { Header } from '@/components/header';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy, limit, collectionGroup, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useMemo } from 'react';

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
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const devicesRef = useMemo(() => {
    if (firestore && user) {
      return collection(firestore, 'users', user.uid, 'devices');
    }
    return null;
  }, [firestore, user]);
  const { data: devices, isLoading: devicesLoading } = useCollection<Device>(devicesRef);

  const alertsQuery = useMemo(() => {
    if (!firestore || !user) {
      return null;
    }
    return query(
      collectionGroup(firestore, 'alerts'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
  }, [firestore, user]);
  const { data: allAlerts, isLoading: alertsLoading } = useCollection<Alert>(alertsQuery);


  if (devicesLoading || alertsLoading || isUserLoading) {
    return <DashboardLoading />;
  }

  const getLatestAlert = () => {
    if (!allAlerts || allAlerts.length === 0) return null;
    return allAlerts[0];
  }

  const latestAlert = getLatestAlert();
  const gasLevel = latestAlert && latestAlert.sensorData ? JSON.parse(latestAlert.sensorData).gas_value : 0;
  const lastUpdated = latestAlert?.createdAt;

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
            <GasLevelKnob gasLevel={gasLevel} lastUpdated={lastUpdated} />

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
