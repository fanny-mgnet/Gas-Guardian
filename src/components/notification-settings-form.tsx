'use client';

import { useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  NotificationSettings,
  updateNotificationSettings,
} from '@/lib/settings-actions';

interface NotificationSettingsFormProps {
  initialSettings: NotificationSettings;
}

export function NotificationSettingsForm({
  initialSettings,
}: NotificationSettingsFormProps) {
  const [settings, setSettings] =
    useState<NotificationSettings>(initialSettings);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleToggle = (key: keyof NotificationSettings, checked: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: checked }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      const formData = new FormData();
      formData.append(
        'email_alerts_enabled',
        settings.email_alerts_enabled ? 'on' : 'off'
      );
      formData.append(
        'in_app_alerts_enabled',
        settings.in_app_alerts_enabled ? 'on' : 'off'
      );
      formData.append(
        'maintenance_reminders_enabled',
        settings.maintenance_reminders_enabled ? 'on' : 'off'
      );

      const result = await updateNotificationSettings(formData);

      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    });
  };

  const settingItems: {
    key: keyof NotificationSettings;
    label: string;
    description: string;
  }[] = [
    {
      key: 'email_alerts_enabled',
      label: 'Email Alerts',
      description: 'Receive critical alerts and warnings via email.',
    },
    {
      key: 'in_app_alerts_enabled',
      label: 'In-App Notifications',
      description: 'Show alerts directly within the dashboard.',
    },
    {
      key: 'maintenance_reminders_enabled',
      label: 'Maintenance Reminders',
      description: 'Get reminders for scheduled device maintenance.',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Manage how you receive alerts and reminders.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {settingItems.map((item) => (
            <div
              key={item.key}
              className="flex flex-row items-center justify-between rounded-lg border p-4"
            >
              <div className="space-y-0.5">
                <Label htmlFor={item.key} className="text-base">
                  {item.label}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <Switch
                id={item.key}
                checked={settings[item.key]}
                onCheckedChange={(checked) => handleToggle(item.key, checked)}
              />
            </div>
          ))}
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}