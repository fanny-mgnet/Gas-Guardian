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
import { getAllAlerts, getDevices } from '@/lib/data';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { GasLevelKnob } from '@/components/gas-level-knob';

export default async function Dashboard() {
  const devices = await getDevices();
  const allAlerts = await getAllAlerts();

  const recentAlerts = allAlerts.slice(0, 5);

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'gas_emergency':
        return 'destructive';
      case 'gas_warning':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const latestAlert = allAlerts[0]
  const gasLevel = latestAlert?.sensor_data.gas_value ?? 0;
  const lastUpdated = latestAlert?.created_at;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 md:gap-8">
        <GasLevelKnob gasLevel={gasLevel} lastUpdated={lastUpdated} />
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                    <CardTitle>Recent Alerts</CardTitle>
                    <CardDescription>
                        An overview of the latest system-wide alerts.
                    </CardDescription>
                </div>
                <Button asChild size="sm" className="ml-auto gap-1">
                    <Link href="/dashboard/devices">
                        View All
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Gas Level</TableHead>
                    <TableHead className="text-right">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAlerts.map(alert => {
                    const device = devices.find(d => d.id === alert.device_id);
                    return (
                      <TableRow key={alert.id}>
                        <TableCell>
                          <div className="font-medium">{device?.device_name}</div>
                          <div className="hidden text-sm text-muted-foreground md:inline">
                            {device?.mac_address}
                          </div>
                        </TableCell>
                        <TableCell>
                           <Badge variant={getAlertVariant(alert.alert_type)} className={cn(getAlertVariant(alert.alert_type) === 'default' && 'bg-accent text-accent-foreground hover:bg-accent/80')}>
                            {alert.alert_type.replace('gas_', '').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {alert.sensor_data.gas_value}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
