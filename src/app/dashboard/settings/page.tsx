import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { NotificationSettingsForm } from "@/components/notification-settings-form";
import { getNotificationSettings } from "@/lib/settings-actions";
import { Separator } from "@/components/ui/separator";

export default async function SettingsPage() {
    const initialSettings = await getNotificationSettings();

    if (!initialSettings) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>
                        Manage your application settings.
                    </CardDescription>
                </CardHeader>
                <div className="p-6">
                    <p className="text-red-500">Error: Could not load user settings. Please log in again.</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Settings</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your account and application preferences.
                </p>
            </div>
            <Separator />
            <NotificationSettingsForm initialSettings={initialSettings} />
        </div>
    )
}
