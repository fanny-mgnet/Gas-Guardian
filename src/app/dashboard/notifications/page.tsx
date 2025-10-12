'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
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

export default function NotificationsSettingsPage() {
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [criticalThreshold, setCriticalThreshold] = useState(85);
  const [warningAlerts, setWarningAlerts] = useState(true);
  const [warningThreshold, setWarningThreshold] = useState(50);
  const [maintenanceReminders, setMaintenanceReminders] = useState(false);
  const [statusUpdates, setStatusUpdates] = useState(true);

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

      <div className="p-4 space-y-6">
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
            <div className="flex items-center">
              <div className="bg-primary/10 text-primary h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 lucide lucide-wifi"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" x2="12.01" y1="20" y2="20"/></svg>
              </div>
              <div className="ml-4 flex-grow">
                <p className="font-semibold">Living Room Gas Detector</p>
                <div className="text-sm text-muted-foreground flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                  Connected
                </div>
              </div>
            </div>
            <Separator />
            <SettingsItem
              title="Status Updates"
              description="Receive notifications when device status changes"
            >
              <Switch
                checked={statusUpdates}
                onCheckedChange={setStatusUpdates}
              />
            </SettingsItem>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}