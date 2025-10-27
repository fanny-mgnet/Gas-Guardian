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
import React, { useState, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AddDeviceDialog({ children }: { children: React.ReactNode }) {
    const { toast } = useToast();
    const { user } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [wifiSsid, setWifiSsid] = useState('');
    const [wifiPassword, setWifiPassword] = useState('');
    const [notificationNumber, setNotificationNumber] = useState('');
    const [claimedDeviceId, setClaimedDeviceId] = useState('');

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
            // This part is now handled by the ESP32 itself registering the device.
            // The user will claim it later.
            
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

    const handleClaimDevice = async (e: FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast({
                variant: 'destructive',
                title: "Error",
                description: "You must be logged in to claim a device.",
            });
            return;
        }

        if (!claimedDeviceId) {
            toast({
                variant: 'destructive',
                title: "Missing Information",
                description: "Please enter a Device ID.",
            });
            return;
        }

        try {
            // Call a Supabase Edge Function to claim the device
            const { data, error } = await supabase.functions.invoke('claim-device', {
                body: { device_id: claimedDeviceId, user_id: user.id },
            });

            if (error) throw error;

            if (data.error) {
                throw new Error(data.error);
            }

            toast({
                title: "Device Claimed",
                description: "The device has been successfully linked to your account.",
            });
            setIsOpen(false);
            setClaimedDeviceId(''); // Clear the input field
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Device Claim Failed',
                description: error.message,
            });
        }
    };


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild onClick={(e) => {
                e.preventDefault(); // Prevent the dialog from opening
                window.open('http://192.168.4.1/', '_blank'); // Open in a new tab
            }}>
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

                <div className="p-6 pt-4 space-y-6">
                    {/* Section for configuring a new device */}
                    <div className="border-b pb-4">
                        <h3 className="text-lg font-semibold mb-2">Configure New Device</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Connect to your ESP32's Wi-Fi hotspot (e.g., "SmartGas-XXXX") and then click "Configure Device" to send Wi-Fi credentials.
                        </p>
                        <Button type="button" className="w-full" onClick={() => window.open('http://192.168.4.1/', '_blank')}>
                            Configure Device (Opens new tab)
                        </Button>
                    </div>

                    {/* Section for claiming an existing device */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Claim Existing Device</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Enter the Device ID (UUID) of an already configured ESP32 to link it to your account.
                        </p>
                        <form onSubmit={handleClaimDevice} className="space-y-4">
                            <div>
                                <Label htmlFor="device-id">Device ID (UUID)</Label>
                                <Input
                                    id="device-id"
                                    value={claimedDeviceId}
                                    onChange={(e) => setClaimedDeviceId(e.target.value)}
                                    placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
                                    required
                                />
                            </div>
                            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                                <Button type="submit" className="w-full sm:w-auto">Claim Device</Button>
                            </DialogFooter>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
