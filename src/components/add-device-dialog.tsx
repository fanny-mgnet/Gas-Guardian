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

export function AddDeviceDialog({ children }: { children: React.ReactNode }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-lg bottom-0 translate-y-0 sm:bottom-auto sm:translate-y-[-50%]">
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
                        <Button type="button" className="w-full" size="lg">Start Setup</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
