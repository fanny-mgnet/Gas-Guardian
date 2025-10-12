'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Cpu,
  HardHat,
  Bell,
  MessageSquare,
  Mail,
  Settings as SettingsIcon,
  ShieldAlert,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from '@/lib/utils';
import Link from 'next/link';

function SettingsItem({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-grow pr-4">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex-shrink-0 pt-1">{children}</div>
    </div>
  );
}

function NotificationMethodItem({
  icon: Icon,
  iconBg,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  icon: React.ElementType;
  iconBg: string;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start">
      <div className={`h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-lg ${iconBg}`}>
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="ml-4 flex-grow">
        <label htmlFor={title} className="font-semibold cursor-pointer">{title}</label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="ml-auto pl-2 flex items-center h-11">
        <Checkbox id={title} checked={checked} onCheckedChange={onCheckedChange} />
      </div>
    </div>
  );
}

function ThresholdSlider({
  label,
  value,
  onValueChange,
  variant,
}: {
  label: string;
  value: number;
  onValueChange: (value: number[]) => void;
  variant: 'critical' | 'warning';
}) {
  const borderColor =
    variant === 'critical'
      ? 'border-red-500/50 bg-red-500/10'
      : 'border-yellow-500/50 bg-yellow-500/10';
  const textColor =
    variant === 'critical' ? 'text-red-500' : 'text-yellow-500';
  const sliderColor =
    variant === 'critical'
      ? '[&_.rc-slider-track]:bg-red-500 [&_.rc-slider-handle]:border-red-500'
      : '[&_.rc-slider-track]:bg-yellow-500 [&_.rc-slider-handle]:border-yellow-500';

  return (
    <div className={`mt-4 rounded-lg border p-4 ${borderColor}`}>
      <div className="flex justify-between items-center mb-2">
        <span className={`text-sm font-medium ${textColor}`}>{label}</span>
        <span className={`text-sm font-bold ${textColor}`}>{value}%</span>
      </div>
      <Slider
        defaultValue={[value]}
        max={100}
        step={1}
        onValueChange={onValueChange}
        className={sliderColor}
      />
    </div>
  );
}

function DeviceNotificationSettings({
  icon: Icon,
  name,
  connected,
  status,
}: {
  icon: React.ElementType;
  name: string;
  connected: boolean;
  status?: string;
}) {
  const [statusUpdates, setStatusUpdates] = useState(true);
  const [batteryWarnings, setBatteryWarnings] = useState(false);
  const [connectivityAlerts, setConnectivityAlerts] = useState(true);

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="bg-primary/10 text-primary h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-lg">
          {name === "Basement Gas Sensor" && status === "Warning" ? <ShieldAlert className="h-5 w-5 text-accent"/> : <Icon className="h-5 w-5" />}
        </div>
        <div className="ml-4 flex-grow">
          <p className="font-semibold">{name}</p>
          <div className="text-sm text-muted-foreground flex items-center">
            { status ? (
                <>
                <span className={'h-2 w-2 rounded-full bg-yellow-500 mr-2'}></span>
                {status}
                </>
            ) : (
                <>
                <span className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-muted-foreground'} mr-2`}></span>
                {connected ? 'Connected' : 'Disconnected'}
                </>
            )}
            
          </div>
        </div>
      </div>
      <SettingsItem title="Status Updates" description="Receive notifications when device status changes">
        <Switch checked={statusUpdates} onCheckedChange={setStatusUpdates} />
      </SettingsItem>
      <SettingsItem title="Battery Warnings" description="Get alerts when device battery is low">
        <Switch checked={batteryWarnings} onCheckedChange={setBatteryWarnings} />
      </SettingsItem>
      <SettingsItem title="Connectivity Alerts" description="Notifications for connection issues">
        <Switch checked={connectivityAlerts} onCheckedChange={setConnectivityAlerts} />
      </SettingsItem>
    </div>
  );
}

export default function NotificationsSettingsPage() {
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [criticalThreshold, setCriticalThreshold] = useState(85);
  const [warningAlerts, setWarningAlerts] = useState(true);
  const [warningThreshold, setWarningThreshold] = useState(50);
  const [maintenanceReminders, setMaintenanceReminders] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [emailSummaries, setEmailSummaries] = useState(true);
  const [quietHours, setQuietHours] = useState(false);
  const [vibrationPattern, setVibrationPattern] = useState('Default');
  const [ledColor, setLedColor] = useState('blue');

  const vibrationPatterns = ['Default', 'Short', 'Long', 'Double', 'Triple'];
  const ledColors = [
    { name: 'blue', hex: 'bg-blue-500' },
    { name: 'red', hex: 'bg-red-500' },
    { name: 'green', hex: 'bg-green-500' },
    { name: 'yellow', hex: 'bg-yellow-500' },
    { name: 'purple', hex: 'bg-purple-500' },
  ];

  return (
    <div className="bg-background min-h-screen">
      <header className="bg-card p-4 flex items-center justify-between border-b sticky top-0 z-10">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">Notifications Settings</h1>
        <Button variant="ghost" className="text-sm text-primary">
          Reset
        </Button>
      </header>

      <div className="p-4 space-y-6 pb-24">
        <Card>
          <CardHeader>
            <CardTitle>Gas Alert Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <SettingsItem
                title="Critical Alerts"
                description={`Immediate notifications for dangerous gas levels above ${criticalThreshold}%`}
              >
                <Switch
                  checked={criticalAlerts}
                  onCheckedChange={setCriticalAlerts}
                />
              </SettingsItem>
              {criticalAlerts && (
                <ThresholdSlider
                  label="Critical Threshold"
                  value={criticalThreshold}
                  onValueChange={(val) => setCriticalThreshold(val[0])}
                  variant="critical"
                />
              )}
            </div>

            <Separator />

            <div>
              <SettingsItem
                title="Warning Levels"
                description={`Moderate alerts for elevated gas levels above ${warningThreshold}%`}
              >
                <Switch
                  checked={warningAlerts}
                  onCheckedChange={setWarningAlerts}
                />
              </SettingsItem>
              {warningAlerts && (
                <ThresholdSlider
                  label="Warning Threshold"
                  value={warningThreshold}
                  onValueChange={(val) => setWarningThreshold(val[0])}
                  variant="warning"
                />
              )}
            </div>

            <Separator />

            <SettingsItem
              title="Maintenance Reminders"
              description="Regular notifications for device maintenance and calibration"
            >
              <Switch
                checked={maintenanceReminders}
                onCheckedChange={setMaintenanceReminders}
              />
            </SettingsItem>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <DeviceNotificationSettings
                icon={Cpu}
                name="Living Room Gas Detector"
                connected={true}
            />
            <Separator />
             <DeviceNotificationSettings
                icon={HardHat}
                name="Kitchen Gas Monitor"
                connected={true}
            />
             <Separator />
             <DeviceNotificationSettings
                icon={Cpu}
                name="Basement Gas Sensor"
                connected={true}
                status="Warning"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Methods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <NotificationMethodItem
              icon={Bell}
              iconBg="bg-blue-100 dark:bg-blue-900/50"
              title="Push Notifications"
              description="Instant alerts on your device"
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
            <Separator />
            <NotificationMethodItem
              icon={MessageSquare}
              iconBg="bg-green-100 dark:bg-green-900/50"
              title="SMS Alerts"
              description="Text messages for critical alerts"
              checked={smsAlerts}
              onCheckedChange={setSmsAlerts}
            />
            <Separator />
            <NotificationMethodItem
              icon={Mail}
              iconBg="bg-orange-100 dark:bg-orange-900/50"
              title="Email Summaries"
              description="Daily and weekly reports via email"
              checked={emailSummaries}
              onCheckedChange={setEmailSummaries}
            />
            <div className="pt-2">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                            <SettingsIcon className="mr-2 h-4 w-4" />
                            Manage Permissions
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Notification Permissions</AlertDialogTitle>
                        <AlertDialogDescription>
                            To receive notifications, please enable permissions in your device settings. This will allow the app to send you important gas alerts and device status updates.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction>Open Settings</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <SettingsItem
              title="Quiet Hours"
              description="Disable non-critical notifications"
            >
              <Switch
                checked={quietHours}
                onCheckedChange={setQuietHours}
              />
            </SettingsItem>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Advanced Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Notification Sound</h3>
              <Select defaultValue="default">
                <SelectTrigger>
                  <SelectValue placeholder="Select a sound" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="chime">Chime</SelectItem>
                  <SelectItem value="alarm">Alarm</SelectItem>
                  <SelectItem value="beep">Beep</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Vibration Pattern</h3>
              <div className="flex flex-wrap gap-2">
                {vibrationPatterns.map((pattern) => (
                  <Button
                    key={pattern}
                    variant={vibrationPattern === pattern ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setVibrationPattern(pattern)}
                    className="rounded-full"
                  >
                    {pattern}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">LED Color (Android)</h3>
              <div className="flex items-center gap-3">
                {ledColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setLedColor(color.name)}
                    className={cn(
                      'h-8 w-8 rounded-full border-2 transition-all flex items-center justify-center',
                      ledColor === color.name
                        ? 'border-primary'
                        : 'border-transparent'
                    )}
                  >
                    <div className={cn('h-6 w-6 rounded-full', color.hex)}>
                      {ledColor === color.name && (
                        <Check className="h-4 w-4 text-white m-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button className="w-full">
              <Bell className="mr-2 h-4 w-4" />
              Test Notification
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
