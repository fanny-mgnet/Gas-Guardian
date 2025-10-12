import { getDeviceById, getAlertsByDeviceId } from '@/lib/data';
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

export default async function DeviceDetailPage({ params }: { params: { id: string } }) {
  const device = await getDeviceById(params.id);
  const alerts = await getAlertsByDeviceId(params.id);

  if (!device) {
    notFound();
  }

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

  const latestAlert = alerts[0];

  return (
    <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="font-headline text-2xl">{device.device_name}</CardTitle>
                            <CardDescription>{device.mac_address}</CardDescription>
                        </div>
                        <Badge variant={device.is_active ? 'default' : 'destructive'} className={cn(device.is_active ? 'bg-green-600 hover:bg-green-700 text-primary-foreground' : '')}>
                            {device.is_active ? 'Active' : 'Inactive'}
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
                        <span>{device.wifi_ssid}</span>
                    </div>
                     <div>
                        <span className="font-semibold">Registered: </span>
                        <span>{new Date(device.created_at).toLocaleDateString()}</span>
                    </div>
                     <div>
                        <span className="font-semibold">Last Update: </span>
                        <span>{new Date(device.updated_at).toLocaleString()}</span>
                    </div>
                </CardContent>
            </Card>
            <GasLevelChart alerts={alerts} />
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
                            <TableHead>Gas Level</TableHead>
                            <TableHead className="text-right">Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {alerts.map(alert => (
                      <TableRow key={alert.id}>
                        <TableCell>
                          <Badge variant={getAlertVariant(alert.alert_type)} className={cn(getAlertVariant(alert.alert_type) === 'default' && 'bg-accent text-accent-foreground hover:bg-accent/80')}>
                            {alert.alert_type.replace('gas_', '').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{alert.message}</TableCell>
                        <TableCell>{alert.sensor_data.gas_value}</TableCell>
                        <TableCell className="text-right">
                          {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Current Status</CardTitle>
                    <CardDescription>Latest reported status from the device.</CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-2">
                    {latestAlert.alert_type === 'gas_emergency' && <ShieldAlert className="h-16 w-16 text-destructive mx-auto" />}
                    {latestAlert.alert_type === 'gas_warning' && <ShieldAlert className="h-16 w-16 text-accent mx-auto" />}
                    {latestAlert.alert_type === 'gas_normal' && <ShieldCheck className="h-16 w-16 text-green-500 mx-auto" />}
                    <p className="text-2xl font-bold">{latestAlert.alert_type.replace('gas_', '').toUpperCase()}</p>
                    <p className="text-muted-foreground">{latestAlert.message}</p>
                    <p className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(latestAlert.created_at), { addSuffix: true })}</p>
                </CardContent>
            </Card>
            <PredictiveMaintenance deviceId={device.id} />
        </div>
    </div>
  );
}
