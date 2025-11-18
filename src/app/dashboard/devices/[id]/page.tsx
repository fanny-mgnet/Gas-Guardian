'use client';

import { useDoc } from '@/supabase/use-doc';
import { useCollection } from '@/supabase/use-collection';
import { useUser } from '@/supabase/auth';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
import { GasLevelChart } from '@/components/charts';
import { PredictiveMaintenance } from '@/components/predictive-maintenance';
import { GasLevelDisplayCard } from '@/components/gas-level-display-card';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Device, Alert, DeviceReading } from '@/lib/types';
import DeviceDetailLoading from './loading';
import { useMemo, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function DeviceDetailPage({ params }: { params: { id: string } }) {
  const { user, isLoading: isUserLoading } = useUser();
  const { toast } = useToast();

  const deviceQueryConfig = useMemo(() => {
    if (isUserLoading || !params.id) {
      return null;
    }
    return { from: 'devices', params: { id: params.id } };
  }, [isUserLoading, params.id]);

  const { data: device, isLoading: isDeviceLoading } = useDoc<Device>(deviceQueryConfig);

  const alertsQueryConfig = useMemo(() => {
    if (isUserLoading || !device?.id) {
      return null;
    }
    return {
      from: 'alerts',
      params: { device_id: device.id },
      pollingInterval: 5000,
    };
  }, [isUserLoading, device?.id, user?.id]);

  const { data: alerts, isLoading: isAlertsLoading } = useCollection<Alert>(alertsQueryConfig);

  // Query for historical readings (for the chart/table)
  const historicalReadingsQueryConfig = useMemo(() => {
    if (isUserLoading || !device?.id) {
      return null;
    }
    return {
      from: 'device_readings',
      params: { device_id: device.id },
      pollingInterval: 5000,
    };
  }, [isUserLoading, device?.id, user?.id]);

  const { data: readings, isLoading: isReadingsLoading } = useCollection<DeviceReading>(historicalReadingsQueryConfig);

  // Query for the single latest reading (for the knob)
  const latestReadingQueryConfig = useMemo(() => {
    if (isUserLoading || !device?.id) {
      return null;
    }
    return {
      from: 'device_readings',
      params: { device_id: device.id },
      orderBy: { column: 'created_at', ascending: false },
      limit: 1,
      pollingInterval: 5000, // Poll every 5 seconds for real-time feel
    };
  }, [isUserLoading, device?.id]);

  const { data: latestReadingArray, isLoading: isLatestReadingLoading } = useCollection<DeviceReading>(latestReadingQueryConfig);
  const latestReading = latestReadingArray?.[0] ?? null;

  // No need for manual filtering as useCollection will handle it with params
  const deviceAlerts = alerts;
  const deviceReadings = readings;

  const sortedAlerts = deviceAlerts ? [...deviceAlerts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : [];
  const latestAlert = sortedAlerts[0];

  const MAX_GAS_LEVEL = 4095; // Define MAX_GAS_LEVEL here for calculation (based on 12-bit ADC max value)

  let gasPercentage = 0;
  if (latestReading) {
    if (typeof latestReading.gas_percentage === 'number') {
      gasPercentage = latestReading.gas_percentage;
    } else if (typeof latestReading.gas_level === 'number') {
      gasPercentage = Math.min((latestReading.gas_level / MAX_GAS_LEVEL) * 100, 100);
    }
  }

  useEffect(() => {
    // Trigger alert/toaster when gas percentage is between 50% and 100%
    if (gasPercentage >= 50) {
      toast({
        title: "⚠️ High Gas Level Warning",
        description: `Gas level is at ${Math.round(gasPercentage)}%. Immediate attention required for device ${device?.deviceName}.`,
        variant: gasPercentage >= 75 ? "destructive" : "default",
        duration: 120000, // 2 minutes
      });
    }
  }, [gasPercentage, toast, device?.deviceName]);

  if (isDeviceLoading || isAlertsLoading || isReadingsLoading || isUserLoading || isLatestReadingLoading) {
    return <DeviceDetailLoading />;
  }
  
  if (!device) {
    // This could be because it's still loading or it doesn't exist.
    // If loading is finished and there's no device, then show not found.
    if (!isDeviceLoading && !isUserLoading) {
      return notFound();
    }
    return <DeviceDetailLoading />;
  }

  const getAlertVariant = (type: Alert['alertType']) => {
    switch (type) {
      case 'gas_emergency':
        return 'destructive';
      case 'gas_warning':
        return 'default';
      case 'system':
        return 'outline';
      default:
        return 'secondary';
    }
  };


  return (
    <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="font-headline text-2xl">{device.deviceName}</CardTitle>
                            <CardDescription>{device.macAddress}</CardDescription>
                        </div>
                        <Badge variant={device.isActive ? 'default' : 'destructive'} className={cn(device.isActive ? 'bg-green-600 hover:bg-green-700 text-primary-foreground' : '')}>
                            {device.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-semibold">Email: </span>
                        <span>{device.email}</span>
                    </div>
                     <div>
                        <span className="font-semibold">SSID: </span>
                        <span>{device.wifiSsid}</span>
                    </div>
                     <div>
                        <span className="font-semibold">Registered: </span>
                        <span>{new Date(device.createdAt).toLocaleDateString()}</span>
                    </div>
                     <div>
                        <span className="font-semibold">Last Update: </span>
                        <span>{new Date(device.updatedAt).toLocaleString()}</span>
                    </div>
                </CardContent>
            </Card>
            {user && device && (
                <Card>
                    <CardHeader>
                        <CardTitle>Debug Info</CardTitle>
                        <CardDescription>User and Device IDs for RLS verification.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm">
                        <p><span className="font-semibold">Frontend User ID:</span> {user.id}</p>
                        <p><span className="font-semibold">Device User ID (from DB):</span> {device.userId || 'N/A'}</p>
                    </CardContent>
                </Card>
            )}
            <GasLevelChart readings={deviceReadings || []} />
            <Card>
                <CardHeader>
                    <CardTitle>Device Readings</CardTitle>
                    <CardDescription>Latest sensor readings from the device.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>Gas Value</TableHead>
                                <TableHead>Gas %</TableHead>
                                <TableHead>Temperature</TableHead>
                                <TableHead>Humidity</TableHead>
                                <TableHead>Pressure</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {deviceReadings && deviceReadings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10).map((reading) => (
                                <TableRow key={reading.id}>
                                    <TableCell>{formatDistanceToNow(new Date(reading.createdAt), { addSuffix: true })}</TableCell>
                                    <TableCell>{reading.gas_value}</TableCell>
                                    <TableCell>{reading.gas_percentage}</TableCell>
                                    <TableCell>{reading.temperature}</TableCell>
                                    <TableCell>{reading.humidity}</TableCell>
                                    <TableCell>{reading.pressure}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Alert History</CardTitle>
                    <CardDescription>All alerts recorded for this device.</CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Gas Level (Raw)</TableHead>
                            <TableHead>Gas Level (%)</TableHead>
                            <TableHead className="text-right">Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {sortedAlerts.map(alert => (
                      <TableRow key={alert.id}>
                        <TableCell>
                          <Badge variant={getAlertVariant(alert.alertType)} className={cn(getAlertVariant(alert.alertType) === 'default' && 'bg-accent text-accent-foreground hover:bg-accent/80')}>
                            {alert.alertType.replace('gas_', '').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{alert.message}</TableCell>
                        <TableCell>{alert.sensorData.gas_value}</TableCell>
                        <TableCell>{alert.sensorData.gas_percentage}</TableCell>
                        <TableCell className="text-right">
                          {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-1 space-y-6">
            {/* Real-Time Gas Level Knob */}
            <GasLevelDisplayCard
                gasPercentage={gasPercentage}
                lastUpdated={latestReading?.createdAt}
            />

            {latestAlert && (
                <Card>
                    <CardHeader>
                        <CardTitle>Current Status</CardTitle>
                        <CardDescription>Latest reported status from the device.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-2">
                        {latestAlert.alertType === 'gas_emergency' && <ShieldAlert className="h-16 w-16 text-destructive mx-auto" />}
                        {latestAlert.alertType === 'gas_warning' && <ShieldAlert className="h-16 w-16 text-accent mx-auto" />}
                        {latestAlert.alertType === 'gas_normal' && <ShieldCheck className="h-16 w-16 text-green-500 mx-auto" />}
                        <p className="text-2xl font-bold">{latestAlert.alertType.replace('gas_', '').toUpperCase()}</p>
                        <p className="text-muted-foreground">{latestAlert.message}</p>
                        <p className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(latestAlert.createdAt), { addSuffix: true })}</p>
                    </CardContent>
                </Card>
            )}
            <PredictiveMaintenance deviceId={device.id} />
        </div>
    </div>
  );
}
