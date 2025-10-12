import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Package2 } from 'lucide-react';

export function Header() {
    const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');
    return (
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
            <div className="flex items-center gap-2 font-bold">
                <Package2 className="h-6 w-6" />
                <span>SmartGas</span>
            </div>
            <div className="w-full flex-1">
                {/* Optional: Add Breadcrumbs or Search */}
            </div>
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
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
