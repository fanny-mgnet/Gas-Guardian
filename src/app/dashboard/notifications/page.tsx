'use client';

import { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';

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
  onSettingChange,
}: {
  icon: React.ElementType;
  name: string;
  connected: boolean;
  status?: string;
  onSettingChange: () => void;
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
        <Switch checked={statusUpdates} onCheckedChange={(val) => { setStatusUpdates(val); onSettingChange(); }} />
      </SettingsItem>
      <SettingsItem title="Battery Warnings" description="Get alerts when device battery is low">
        <Switch checked={batteryWarnings} onCheckedChange={(val) => { setBatteryWarnings(val); onSettingChange(); }} />
      </SettingsItem>
      <SettingsItem title="Connectivity Alerts" description="Notifications for connection issues">
        <Switch checked={connectivityAlerts} onCheckedChange={(val) => { setConnectivityAlerts(val); onSettingChange(); }} />
      </SettingsItem>
    </div>
  );
}

const initialSettings = {
    criticalAlerts: true,
    criticalThreshold: 85,
    warningAlerts: true,
    warningThreshold: 50,
    maintenanceReminders: false,
    pushNotifications: true,
    smsAlerts: false,
    emailSummaries: true,
    quietHours: false,
    vibrationPattern: 'Default',
    ledColor: 'blue',
    notificationSound: 'default',
};

export default function NotificationsSettingsPage() {
  const { toast } = useToast();

  const [savedSettings, setSavedSettings] = useState(initialSettings);
  const [currentSettings, setCurrentSettings] = useState(initialSettings);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setIsDirty(JSON.stringify(currentSettings) !== JSON.stringify(savedSettings));
  }, [currentSettings, savedSettings]);

  const handleSettingChange = <K extends keyof typeof initialSettings>(key: K, value: typeof initialSettings[K]) => {
    setCurrentSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSliderChange = (key: 'criticalThreshold' | 'warningThreshold', value: number[]) => {
    setCurrentSettings(prev => ({ ...prev, [key]: value[0] }));
  };
  
  const handleSaveChanges = () => {
    setSavedSettings(currentSettings);
    setIsDirty(false);
    toast({
      title: 'Changes Saved',
      description: 'Your notification settings have been updated.',
    });
  };

  const handleCancelChanges = () => {
    setCurrentSettings(savedSettings);
    setIsDirty(false);
  };

  const handleReset = () => {
    setCurrentSettings(initialSettings);
    setSavedSettings(initialSettings);
    toast({
        title: 'Settings Reset',
        description: 'All settings have been reset to their default values.',
    });
  };

    const handleOpenSettings = () => {
        toast({
            title: "Opening Settings",
            description: "Redirecting to your device's notification settings...",
        });
    };

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
        <Button variant="ghost" className="text-sm text-primary" onClick={handleReset}>
          Reset
        </Button>
      </header>

      <div className="p-4 space-y-6 pb-40">
        <Card>
          <CardHeader>
            <CardTitle>Gas Alert Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <SettingsItem
                title="Critical Alerts"
                description={`Immediate notifications for dangerous gas levels above ${currentSettings.criticalThreshold}%`}
              >
                <Switch
                  checked={currentSettings.criticalAlerts}
                  onCheckedChange={(val) => handleSettingChange('criticalAlerts', val)}
                />
              </SettingsItem>
              {currentSettings.criticalAlerts && (
                <ThresholdSlider
                  label="Critical Threshold"
                  value={currentSettings.criticalThreshold}
                  onValueChange={(val) => handleSliderChange('criticalThreshold', val)}
                  variant="critical"
                />
              )}
            </div>

            <Separator />

            <div>
              <SettingsItem
                title="Warning Levels"
                description={`Moderate alerts for elevated gas levels above ${currentSettings.warningThreshold}%`}
              >
                <Switch
                  checked={currentSettings.warningAlerts}
                  onCheckedChange={(val) => handleSettingChange('warningAlerts', val)}
                />
              </SettingsItem>
              {currentSettings.warningAlerts && (
                <ThresholdSlider
                  label="Warning Threshold"
                  value={currentSettings.warningThreshold}
                  onValueChange={(val) => handleSliderChange('warningThreshold', val)}
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
                checked={currentSettings.maintenanceReminders}
                onCheckedChange={(val) => handleSettingChange('maintenanceReminders', val)}
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
                onSettingChange={() => setIsDirty(true)}
            />
            <Separator />
             <DeviceNotificationSettings
                icon={HardHat}
                name="Kitchen Gas Monitor"
                connected={true}
                onSettingChange={() => setIsDirty(true)}
            />
             <Separator />
             <DeviceNotificationSettings
                icon={Cpu}
                name="Basement Gas Sensor"
                connected={true}
                status="Warning"
                onSettingChange={() => setIsDirty(true)}
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
              checked={currentSettings.pushNotifications}
              onCheckedChange={(val) => handleSettingChange('pushNotifications', val)}
            />
            <Separator />
            <NotificationMethodItem
              icon={MessageSquare}
              iconBg="bg-green-100 dark:bg-green-900/50"
              title="SMS Alerts"
              description="Text messages for critical alerts"
              checked={currentSettings.smsAlerts}
              onCheckedChange={(val) => handleSettingChange('smsAlerts', val)}
            />
            <Separator />
            <NotificationMethodItem
              icon={Mail}
              iconBg="bg-orange-100 dark:bg-orange-900/50"
              title="Email Summaries"
              description="Daily and weekly reports via email"
              checked={currentSettings.emailSummaries}
              onCheckedChange={(val) => handleSettingChange('emailSummaries', val)}
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
                        <AlertDialogAction onClick={handleOpenSettings}>Open Settings</AlertDialogAction>
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
                checked={currentSettings.quietHours}
                onCheckedChange={(val) => handleSettingChange('quietHours', val)}
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
              <Select value={currentSettings.notificationSound} onValueChange={(val) => handleSettingChange('notificationSound', val)}>
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
                    variant={currentSettings.vibrationPattern === pattern ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSettingChange('vibrationPattern', pattern)}
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
                    onClick={() => handleSettingChange('ledColor', color.name)}
                    className={cn(
                      'h-8 w-8 rounded-full border-2 transition-all flex items-center justify-center',
                      currentSettings.ledColor === color.name
                        ? 'border-primary'
                        : 'border-transparent'
                    )}
                  >
                    <div className={cn('h-6 w-6 rounded-full', color.hex)}>
                      {currentSettings.ledColor === color.name && (
                        <Check className="h-4 w-4 text-white m-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button className="w-full" onClick={() => toast({ title: "Test notification sent!" })}>
              <Bell className="mr-2 h-4 w-4" />
              Test Notification
            </Button>
          </CardContent>
        </Card>
      </div>

       {isDirty && (
        <div className="fixed bottom-0 left-0 w-full bg-card border-t p-4 z-[60]">
          <div className="flex justify-end gap-4 max-w-lg mx-auto">
            <Button variant="ghost" onClick={handleCancelChanges}>Cancel</Button>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </div>
        </div>
      )}
    </div>
  );
}
