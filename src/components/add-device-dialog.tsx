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
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useState } from 'react';

export function AddDeviceDialog({ children }: { children: React.ReactNode }) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user } = useUser();
    const [isOpen, setIsOpen] = useState(false);

    const handleStartSetup = async () => {
        if (!firestore || !user) {
            toast({
                variant: 'destructive',
                title: "Error",
                description: "You must be logged in to add a device.",
            });
            return;
        }

        const devicesCollection = collection(firestore, 'devices');
        
        // This is mock data - in a real app, you'd get this from a setup flow
        const newDevice = {
            macAddress: `DE:AD:BE:EF:${Math.floor(Math.random() * 256).toString(16).padStart(2, '0')}:${Math.floor(Math.random() * 256).toString(16).padStart(2, '0')}`,
            deviceName: "New SmartGas Hub",
            wifiSsid: "Not Connected",
            email: user.email || 'anonymous@example.com',
            mobileNumber: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: false,
            userId: user.uid,
        };

        try {
            await addDoc(devicesCollection, newDevice);
            toast({
                title: "Device Added",
                description: "New device has been registered to your account.",
            });
            setIsOpen(false);
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Failed to Add Device',
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
                <DialogFooter className="p-6 pt-4">
                    <Button type="button" className="w-full" size="lg" onClick={handleStartSetup}>Start Setup</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
