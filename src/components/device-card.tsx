'use client';

import type { Device, Alert } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DeviceCardProps {
  device: Device;
  latestAlert?: Alert;
}

export function DeviceCard({ device, latestAlert }: DeviceCardProps) {
  const isConnected = device.is_active;

  return (
    <Link href={`/dashboard/devices/${device.id}`} className="min-w-[280px] flex-shrink-0">
        <Card className="hover:border-primary transition-colors h-full">
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg">{device.device_name}</CardTitle>
                    {isConnected ? (
                        <Wifi className="h-5 w-5 text-green-500" />
                    ) : (
                        <WifiOff className="h-5 w-5 text-muted-foreground" />
                    )}
                </div>
                <CardDescription>GAS</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <p className="text-sm text-muted-foreground">Current Reading</p>
                    <p className="text-2xl font-bold text-primary">
                        {latestAlert ? `${latestAlert.sensor_data.gas_value} ppm` : 'N/A'}
                    </p>
                </div>
                <Badge variant={isConnected ? 'default' : 'secondary'} className={cn(isConnected ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : '')}>
                    <span className={cn('mr-2 h-2 w-2 rounded-full', isConnected ? 'bg-green-600' : 'bg-muted-foreground')}></span>
                    {isConnected ? 'Connected' : 'Disconnected'}
                    {latestAlert && isConnected && (
                        <span className="ml-1 text-muted-foreground/80">
                            {formatDistanceToNow(new Date(latestAlert.created_at), { addSuffix: true })}
                        </span>
                    )}
                </Badge>
            </CardContent>
        </Card>
    </Link>
  );
}
