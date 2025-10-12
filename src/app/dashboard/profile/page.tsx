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
    UserCog,
    ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';


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
                <div className="bg-primary h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-lg">
                    <Icon className="h-5 w-5 text-primary-foreground" />
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

function LinkCard({
    icon: Icon,
    title,
    subtitle,
    href,
}: {
    icon: React.ElementType;
    title: string;
    subtitle: string;
    href: string;
}) {
    return (
        <Link href={href}>
            <Card className="shadow-sm hover:bg-muted/50 transition-colors bg-card">
                <CardContent className="p-4 flex items-center">
                    {Icon && (
                        <div className="bg-primary/10 text-primary h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-lg">
                            <Icon className="h-5 w-5" />
                        </div>
                    )}
                    <div className="ml-4 flex-grow">
                        <p className="font-semibold">{title}</p>
                        <p className="text-xs text-muted-foreground">{subtitle}</p>
                    </div>
                    <div className="ml-auto pl-2">
                        <ChevronRight className="text-muted-foreground h-5 w-5" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}


export default function ProfilePage() {
    const userAvatarLg = PlaceHolderImages.find(p => p.id === 'user-avatar-lg');
    const AsteriskIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M12 2.5L13.25 8.25L18.75 9.5L13.25 10.75L12 16.5L10.75 10.75L5.25 9.5L10.75 8.25L12 2.5Z" />
            <path d="M5.25 9.5L2 11L5.25 12.5" />
            <path d="M18.75 9.5L22 11L18.75 12.5" />
            <path d="M12 16.5L11 21L12 19" />
            <path d="M12 16.5L13 21L12 19" />
        </svg>
    );

    const editButton = (
        <Button variant="ghost" size="icon" className="h-9 w-9 bg-primary/10 hover:bg-primary/20 text-primary">
            <Pencil className="h-4 w-4" />
        </Button>
    );

    return (
        <div className="bg-muted/40 min-h-screen pb-24">
            <div className="bg-card p-4 flex items-center justify-between border-b sticky top-0 z-10">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard">
                        <ArrowLeft />
                    </Link>
                </Button>
                <h1 className="text-lg font-semibold">Profile</h1>
                <Button variant="ghost" size="icon">
                    <Pencil className="h-5 w-5" />
                </Button>
            </div>

            <div className="p-4">
                <div className="relative w-28 h-28 mx-auto my-6">
                    <div className="bg-card rounded-full w-full h-full flex items-center justify-center">
                         {userAvatarLg ? <Image
                            src={userAvatarLg.imageUrl}
                            width={96}
                            height={96}
                            alt={userAvatarLg.description}
                            data-ai-hint={userAvatarLg.imageHint}
                            className="rounded-full opacity-50"
                        /> : <User className="w-16 h-16 text-muted-foreground" />}
                    </div>
                    <Button variant="default" size="icon" className="absolute bottom-0 right-2 h-8 w-8 rounded-full border-2 border-card shadow-md">
                        <Camera className="h-4 w-4" />
                        <span className="sr-only">Upload new photo</span>
                    </Button>
                </div>
                
                <div className="space-y-3">
                    <InfoCard icon={User} label="Full Name" value="Sarah Johnson" action={editButton} />
                    <InfoCard icon={Mail} label="Email Address" value="sarah.johnson@email.com" action={editButton} isVerified />
                    <InfoCard icon={Phone} label="Phone Number" value="+1 555-0123" action={editButton} />
                    <InfoCard icon={Calendar} label="Account Created" value="January 15, 2024" />
                </div>

                <div className="space-y-3 mt-8">
                    <LinkCard
                        icon={UserCog}
                        title="Personal Information"
                        subtitle="Manage your personal details"
                        href="#"
                    />
                    <LinkCard 
                        icon={AsteriskIcon}
                        title="Emergency Contact"
                        subtitle="Not set"
                        href="#"
                    />
                </div>
            </div>
        </div>
    );
}