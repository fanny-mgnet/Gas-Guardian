'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useCollection } from '@/supabase/use-collection';
import { useUser } from '@/supabase/auth';
import type { Device } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';

function DevicesLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device Name</TableHead>
              <TableHead>MAC Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Registered</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}


export default function DevicesPage() {
  const { user, isLoading: isUserLoading } = useUser();

  const collectionQuery = useMemo(() => {
    if (isUserLoading || !user?.id) {
      return null;
    }
    return {
      from: 'devices',
      params: { user_id: user.id },
    };
  }, [user?.id, isUserLoading]);

  const { data: devices, isLoading } = useCollection<Device>(collectionQuery);

  // No need for manual filtering as useCollection will handle it with params
  const userDevices = devices;

  if (isLoading || isUserLoading) {
    return <DevicesLoading />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Devices</CardTitle>
        <CardDescription>
          A list of all registered gas monitoring devices in your system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device Name</TableHead>
              <TableHead>MAC Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Registered</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userDevices && userDevices.map(device => (
              <TableRow key={device.id}>
                <TableCell className="font-medium">
                    <Link href={`/dashboard/devices/${device.id}`} className="hover:underline">
                        {device.deviceName}
                    </Link>
                </TableCell>
                <TableCell>{device.macAddress}</TableCell>
                <TableCell>
                  <Badge variant={device.isActive ? 'default' : 'destructive'} className={cn(device.isActive ? 'bg-green-500 hover:bg-green-600 text-primary-foreground' : '')}>
                    {device.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(device.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
