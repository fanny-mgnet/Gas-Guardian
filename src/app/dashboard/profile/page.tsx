import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
    ArrowLeft,
    Pencil,
    User,
    Mail,
    Phone,
    Calendar,
    Camera,
    CheckCircle2,
    ShieldCheck,
    Settings,
    ChevronRight,
    Star,
    Bell,
    FileText,
    LogOut
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

function InfoCard({
    icon: Icon,
    label,
    value,
    action,
    isVerified,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    action?: React.ReactNode;
    isVerified?: boolean;
}) {
    return (
        <Card className="shadow-sm bg-card">
            <CardContent className="p-4 flex items-center">
                <div className="bg-primary/10 text-primary h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-lg">
                    <Icon className="h-5 w-5" />
                </div>
                <div className="ml-4 flex-grow">
                    <p className="text-xs text-muted-foreground flex items-center">
                        {label}
                        {isVerified && (
                             <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 border-none text-xs font-medium">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Verified
                            </Badge>
                        )}
                    </p>
                    <p className="font-semibold">{value}</p>
                </div>
                {action && <div className="ml-auto pl-2">{action}</div>}
            </CardContent>
        </Card>
    );
}

export default function ProfilePage() {
    const userAvatarLg = PlaceHolderImages.find(p => p.id === 'user-avatar-lg');
    const user = {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1 555-0123',
        accountCreated: 'January 15, 2024',
        isEmailVerified: true,
    };

    const editButton = (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted/80">
            <Pencil className="h-4 w-4" />
        </Button>
    );

    return (
        <div className="bg-background min-h-screen pb-24">
            <header className="bg-card p-4 flex items-center justify-between border-b sticky top-0 z-10">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard">
                        <ArrowLeft />
                    </Link>
                </Button>
                <h1 className="text-lg font-semibold">Profile</h1>
                <Button variant="ghost" size="icon" className="text-primary">
                    <Pencil className="h-5 w-5" />
                </Button>
            </header>

            <div className="p-4">
                <div className="relative w-28 h-28 mx-auto my-4">
                    <div className="relative w-full h-full group">
                        <Image
                            src={userAvatarLg?.imageUrl || 'https://picsum.photos/seed/avatar-lg/96/96'}
                            width={112}
                            height={112}
                            alt="User avatar"
                            data-ai-hint="person picture"
                            className="rounded-full object-cover border-4 border-card"
                        />
                        <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="h-8 w-8 text-white" />
                        </div>
                    </div>
                </div>
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <p className="text-muted-foreground">{user.email}</p>
                </div>

                <div className="space-y-2">
                    <InfoCard icon={User} label="Full Name" value={user.name} action={editButton} />
                    <InfoCard icon={Mail} label="Email Address" value={user.email} action={editButton} isVerified={user.isEmailVerified} />
                    <InfoCard icon={Phone} label="Phone Number" value={user.phone} action={editButton} />
                    <InfoCard icon={Calendar} label="Account Created" value={user.accountCreated} />
                </div>
            </div>
        </div>
    );
}
