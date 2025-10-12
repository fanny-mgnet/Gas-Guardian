'use client';

import type { Device, Alert } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Cpu, BatteryFull } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DeviceCardProps {
  device: Device;
  latestAlert?: Alert;
}

export function DeviceCard({ device, latestAlert }: DeviceCardProps) {
  const isConnected = device.isActive;

  const gasValue = latestAlert?.sensorData ? JSON.parse(latestAlert.sensorData).gas_value : 'N/A';

  return (
    <Link href={`/dashboard/devices/${device.id}`} className="min-w-[240px] flex-shrink-0">
        <Card className="hover:border-primary transition-colors h-full bg-card shadow-sm border">
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                            <Cpu className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-medium">{device.deviceName}</CardTitle>
                            <CardDescription className="text-xs">GAS</CardDescription>
                        </div>
                    </div>
                     <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <BatteryFull className="h-4 w-4 text-green-500" />
                        <span>85%</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                <div>
                    <p className="text-sm text-muted-foreground">Current Reading</p>
                    <p className="text-2xl font-bold">
                        {gasValue} ppm
                    </p>
                </div>
                <Badge variant={isConnected ? 'default' : 'secondary'} className={cn('font-normal text-xs', isConnected ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-none' : 'bg-muted text-muted-foreground border-none')}>
                    <span className={cn('mr-1.5 h-2 w-2 rounded-full', isConnected ? 'bg-green-500' : 'bg-gray-400')}></span>
                    {isConnected ? 'Connected' : 'Disconnected'}
                    {latestAlert && isConnected && (
                        <span className="ml-1 opacity-80">
                            {formatDistanceToNow(new Date(latestAlert.createdAt), { addSuffix: true })}
                        </span>
                    )}
                </Badge>
            </CardContent>
        </Card>
    </Link>
  );
}
