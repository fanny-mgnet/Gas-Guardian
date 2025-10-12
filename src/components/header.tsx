'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Package2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import React from 'react';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

export function Header() {
    const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');
    const router = useRouter();
    const { toast } = useToast();
    const [open, setOpen] = React.useState(false);
    const auth = useAuth();


    const handleLogout = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
            toast({
                title: 'Logged Out',
                description: 'You have been successfully logged out.',
            });
            router.push('/login');
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Logout Failed',
                description: 'An error occurred while logging out. Please try again.',
            });
        }
    };

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
            <div className="flex items-center gap-2 font-bold">
                <Package2 className="h-6 w-6" />
                <span>SmartGas</span>
            </div>
            <div className="w-full flex-1">
                {/* Optional: Add Breadcrumbs or Search */}
            </div>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="rounded-full">
                            {userAvatar && <Image
                                src={userAvatar.imageUrl}
                                width={40}
                                height={40}
                                alt={userAvatar.description}
                                data-ai-hint={userAvatar.imageHint}
                                className="rounded-full"
                            />}
                            <span className="sr-only">Toggle user menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>
                            <Link href="/dashboard/profile">My Account</Link>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild><Link href="/dashboard/settings">Settings</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/dashboard/support">Support</Link></DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Logout</DropdownMenuItem>
                        </AlertDialogTrigger>
                    </DropdownMenuContent>
                </DropdownMenu>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Logout</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to logout from your account?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Logout</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </header>
    );
}
