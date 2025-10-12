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
import { ArrowUpRight, HardHat, ShieldAlert, ShieldCheck, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default async function Dashboard() {
  const devices = await getDevices();
  const allAlerts = await getAllAlerts();

  const activeDevices = devices.filter(d => d.is_active).length;
  const criticalAlerts = allAlerts.filter(a => a.alert_type === 'gas_emergency' && new Date(a.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length;
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

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 md:gap-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Devices
              </CardTitle>
              <HardHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{devices.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeDevices} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Critical Alerts (24h)
              </CardTitle>
              <ShieldAlert className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{criticalAlerts}</div>
              <p className="text-xs text-muted-foreground">
                Immediate attention needed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              {criticalAlerts > 0 ? <ShieldAlert className="h-4 w-4 text-destructive" /> : <ShieldCheck className="h-4 w-4 text-green-500" />}
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold", criticalAlerts > 0 ? 'text-destructive' : 'text-green-500')}>
                {criticalAlerts > 0 ? 'Alert Active' : 'Nominal'}
              </div>
              <p className="text-xs text-muted-foreground">
                Real-time system health
              </p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activity</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{allAlerts.length}</div>
              <p className="text-xs text-muted-foreground">
                total alerts logged
              </p>
            </CardContent>
          </Card>
        </div>
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
