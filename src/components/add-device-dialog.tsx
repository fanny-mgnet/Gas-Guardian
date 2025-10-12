'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AddDeviceDialog({ children }: { children: React.ReactNode }) {
    const { toast } = useToast();

    const handleStartSetup = () => {
        toast({
            title: "Setup Started",
            description: "Please follow the instructions on your device.",
        });
    };

    return (
        <Dialog>
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
                    <DialogClose asChild>
                        <Button type="button" className="w-full" size="lg" onClick={handleStartSetup}>Start Setup</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
