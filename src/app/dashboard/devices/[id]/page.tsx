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
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Device, Alert } from '@/lib/types';
import DeviceDetailLoading from './loading';
import { useMemo } from 'react';

export default function DeviceDetailPage({ params }: { params: { id: string } }) {
  const { user, isLoading: isUserLoading } = useUser();

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
    return { from: 'alerts', params: { device_id: device.id } };
  }, [isUserLoading, device?.id]);

  const { data: alerts, isLoading: isAlertsLoading } = useCollection<Alert>(alertsQueryConfig);

  // No need for manual filtering as useCollection will handle it with params
  const deviceAlerts = alerts;

  if (isDeviceLoading || isAlertsLoading || isUserLoading) {
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

  const sortedAlerts = deviceAlerts ? [...deviceAlerts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : [];
  const latestAlert = sortedAlerts[0];

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
            <GasLevelChart alerts={sortedAlerts} />
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
