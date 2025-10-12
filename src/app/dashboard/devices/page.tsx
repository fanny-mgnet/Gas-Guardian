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
import { getDevices } from '@/lib/data';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default async function DevicesPage() {
  const devices = await getDevices();

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
            {devices.map(device => (
              <TableRow key={device.id}>
                <TableCell className="font-medium">
                    <Link href={`/dashboard/devices/${device.id}`} className="hover:underline">
                        {device.device_name}
                    </Link>
                </TableCell>
                <TableCell>{device.mac_address}</TableCell>
                <TableCell>
                  <Badge variant={device.is_active ? 'default' : 'destructive'} className={cn(device.is_active ? 'bg-green-500 hover:bg-green-600 text-primary-foreground' : '')}>
                    {device.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(device.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
