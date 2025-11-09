'use server';

import { createClient } from './supabase-server';
import { revalidatePath } from 'next/cache';

export type NotificationSettings = {
  email_alerts_enabled: boolean;
  in_app_alerts_enabled: boolean;
  maintenance_reminders_enabled: boolean;
};

export async function getNotificationSettings(): Promise<NotificationSettings | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('email_alerts_enabled, in_app_alerts_enabled, maintenance_reminders_enabled')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching notification settings:', error);
    return null;
  }

  return data as NotificationSettings;
}

export async function updateNotificationSettings(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'User not authenticated.' };
  }

  const updates: Partial<NotificationSettings> = {
    email_alerts_enabled: formData.get('email_alerts_enabled') === 'on',
    in_app_alerts_enabled: formData.get('in_app_alerts_enabled') === 'on',
    maintenance_reminders_enabled: formData.get('maintenance_reminders_enabled') === 'on',
  };

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id);

  if (error) {
    console.error('Error updating notification settings:', error);
    return { success: false, message: error.message };
  }

  revalidatePath('/dashboard/settings');
  return { success: true, message: 'Notification settings updated successfully.' };
}