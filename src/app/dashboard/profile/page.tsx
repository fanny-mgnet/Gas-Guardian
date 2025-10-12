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
    UserCog,
    Cog,
    Shield,
    Lock,
    ChevronRight,
    Tv,
    Database,
    Phone,
    Mail,
    User,
    Calendar,
    Contact,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';


function LinkCard({
    icon: Icon,
    title,
    subtitle,
    href,
    action,
}: {
    icon: React.ElementType;
    title: string;
    subtitle: string;
    href: string;
    action?: React.ReactNode;
}) {
    return (
        <Link href={href}>
            <Card className="shadow-sm hover:bg-muted/50 transition-colors">
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
                        {action ? action : <ChevronRight className="text-muted-foreground h-5 w-5" />}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

function InfoCard({
    icon: Icon,
    label,
    value,
  }: {
    icon: React.ElementType;
    label: string;
    value: string;
  }) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-4 flex items-center">
          <div className="bg-primary/10 text-primary h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-lg">
            <Icon className="h-5 w-5" />
          </div>
          <div className="ml-4 flex-grow">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-semibold">{value}</p>
          </div>
          <div className="ml-auto pl-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
                <Pencil className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType, title: string, subtitle: string }) {
    return (
        <div className="flex items-center gap-4 pt-6 pb-2">
            <div className="bg-primary/10 text-primary h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg">
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <h2 className="font-semibold text-lg">{title}</h2>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
        </div>
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
    
    return (
        <div className="bg-muted/30 min-h-screen pb-24">
            <div className="bg-card p-4 flex items-center justify-between border-b sticky top-0 z-10">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard">
                        <ArrowLeft />
                    </Link>
                </Button>
                <h1 className="text-lg font-semibold">Profile</h1>
                <div className="w-10"></div>
            </div>

            <div className="p-4">
                <div className="relative w-24 h-24 mx-auto mb-4">
                    {userAvatarLg && <Image
                        src={userAvatarLg.imageUrl}
                        width={96}
                        height={96}
                        alt={userAvatarLg.description}
                        data-ai-hint={userAvatarLg.imageHint}
                        className="rounded-full border-4 border-card"
                    />}
                    <Button variant="outline" size="icon" className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-card border-2">
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Upload new photo</span>
                    </Button>
                </div>
                
                {/* Personal Information Section */}
                <div className="space-y-3">
                    <SectionHeader icon={UserCog} title="Personal Information" subtitle="Manage your personal details" />
                    <InfoCard icon={User} label="Name" value="Alex" />
                    <InfoCard icon={Mail} label="Email" value="alex@example.com" />
                    <InfoCard icon={Phone} label="Phone Number" value="+1 555-1234" />
                    <InfoCard icon={Calendar} label="Member Since" value="July 2023" />
                    <LinkCard
                        icon={Contact}
                        title="Manage Personal Details"
                        subtitle="Update your name, email, etc."
                        href="#"
                    />
                    <LinkCard 
                        icon={AsteriskIcon}
                        title="Emergency Contact"
                        subtitle="+1 555-0456"
                        href="#"
                    />
                </div>

                {/* Account Settings Section */}
                <div className="space-y-3 mt-4">
                    <SectionHeader icon={Cog} title="Account Settings" subtitle="Subscription and device information" />
                    <LinkCard 
                        icon={Tv}
                        title="Subscription Status"
                        subtitle="Premium Plan"
                        href="#"
                        action={<Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">Active</Badge>}
                    />
                    <LinkCard 
                        icon={Tv}
                        title="Connected Devices"
                        subtitle="5 devices connected"
                        href="/dashboard/devices"
                    />
                    <LinkCard 
                        icon={Database}
                        title="Data Usage"
                        subtitle="Monthly usage: 2.3 GB"
                        href="#"
                        action={<></>}
                    />
                </div>

                {/* Security Section */}
                <div className="space-y-3 mt-4">
                    <SectionHeader icon={Shield} title="Security" subtitle="Protect your account" />
                    <LinkCard 
                        icon={Lock}
                        title="Change Password"
                        subtitle="Update your account password"
                        href="#"
                    />
                </div>
            </div>
        </div>
    );
}
