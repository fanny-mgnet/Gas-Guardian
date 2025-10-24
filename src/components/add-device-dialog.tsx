'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/supabase/auth';
import { supabase } from '@/supabase/client';
import { useState, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AddDeviceDialog({ children }: { children: React.ReactNode }) {
    const { toast } = useToast();
    const { user } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [wifiSsid, setWifiSsid] = useState('');
    const [wifiPassword, setWifiPassword] = useState('');
    const [notificationNumber, setNotificationNumber] = useState('');

    const handleAddDevice = async (e: FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast({
                variant: 'destructive',
                title: "Error",
                description: "You must be logged in to add a device.",
            });
            return;
        }

        if (!wifiSsid || !wifiPassword || !notificationNumber) {
            toast({
                variant: 'destructive',
                title: "Missing Information",
                description: "Please fill in all required fields.",
            });
            return;
        }

        // Step 1: Send Wi-Fi credentials and notification number to ESP32
        try {
            const esp32Config = {
                wifi_ssid: wifiSsid,
                wifi_password: wifiPassword,
                email: user.email || '', // Use user's email
                mobile_number: notificationNumber, // Map notificationNumber to mobile_number
            };

            // Assuming ESP32 is at 192.168.4.1 when in AP mode
            const response = await fetch('http://192.168.4.1/api/configure', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(esp32Config),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to configure ESP32.');
            }

            toast({
                title: "ESP32 Configured",
                description: "Wi-Fi credentials sent to ESP32. Device should now connect to your network.",
            });

            // Step 2: Save device details to Supabase after successful ESP32 configuration
            const newDevice = {
                mac_address: `DE:AD:BE:EF:${Math.floor(Math.random() * 256).toString(16).padStart(2, '0')}:${Math.floor(Math.random() * 256).toString(16).padStart(2, '0')}`,
                device_name: "SmartGas Hub", // Default name, user can change later
                wifi_ssid: wifiSsid,
                notification_number: notificationNumber,
                email: user.email || 'anonymous@example.com',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_active: true, // Mark as active since it should be connecting
                user_id: user.id,
            };

            const { error: supabaseError } = await supabase.from('devices').insert([newDevice]);
            if (supabaseError) throw supabaseError;

            toast({
                title: "Device Added to Account",
                description: "New device has been registered to your account in Supabase.",
            });
            setIsOpen(false);
            // Clear form fields
            setWifiSsid('');
            setWifiPassword('');
            setNotificationNumber('');

        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Device Setup Failed',
                description: error.message,
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-lg">
                <DialogHeader className="items-center text-center pt-8">
                    <div className="bg-primary rounded-full p-3 w-14 h-14 flex items-center justify-center mb-4">
                        <Plus className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <DialogTitle className="text-xl font-bold">Add New Device</DialogTitle>
                    <DialogDescription className="text-center px-4">
                        Follow the setup wizard to pair a new ESP32 device
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddDevice} className="p-6 pt-4 space-y-4">
                    <div>
                        <Label htmlFor="wifi-ssid">Wi-Fi Name (SSID)</Label>
                        <Input
                            id="wifi-ssid"
                            value={wifiSsid}
                            onChange={(e) => setWifiSsid(e.target.value)}
                            placeholder="Your Wi-Fi Network Name"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="wifi-password">Wi-Fi Password</Label>
                        <Input
                            id="wifi-password"
                            type="password"
                            value={wifiPassword}
                            onChange={(e) => setWifiPassword(e.target.value)}
                            placeholder="Your Wi-Fi Password"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="notification-number">Notification Mobile Number</Label>
                        <Input
                            id="notification-number"
                            type="tel"
                            value={notificationNumber}
                            onChange={(e) => setNotificationNumber(e.target.value)}
                            placeholder="e.g., +15551234567"
                            required
                        />
                    </div>
                    <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit" className="w-full sm:w-auto">Add Device</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
