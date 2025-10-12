import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Pencil,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
  Camera,
  UserCog,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function InfoCard({
  icon: Icon,
  title,
  subtitle,
  action,
  verified = false,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  verified?: boolean;
}) {
  return (
    <Card className="shadow-sm bg-card">
      <CardContent className="p-4 flex items-center">
        <div className="bg-primary h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-lg">
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="ml-4 flex-grow">
          <p className="text-xs text-muted-foreground">{title}</p>
          <div className="flex items-center gap-2">
            <p className="font-semibold">{subtitle}</p>
            {verified && <Badge className="bg-green-100 text-green-800 border-none text-xs">Verified</Badge>}
          </div>
        </div>
        {action && <div className="ml-auto pl-2">{action}</div>}
      </CardContent>
    </Card>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType, title: string }) {
    return (
        <div className="flex items-center gap-3 pt-6 pb-2">
            <Icon className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">{title}</h2>
        </div>
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
            <Card className="shadow-sm hover:bg-muted/50 transition-colors">
                <CardContent className="p-4 flex items-center">
                    <div className="bg-primary/10 text-primary h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg">
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className="ml-4 flex-grow">
                        <p className="font-semibold text-sm">{title}</p>
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
    const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar-lg');
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
        <Button variant="ghost" size="icon">
          <Pencil className="h-5 w-5" />
          <span className="sr-only">Edit Profile</span>
        </Button>
      </div>

      <div className="p-4">

        {/* User Avatar Section */}
        <div className="flex flex-col items-center py-6">
            <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    {userAvatar && <Image
                        src={userAvatar.imageUrl}
                        width={96}
                        height={96}
                        alt={userAvatar.description}
                        data-ai-hint={userAvatar.imageHint}
                        className="rounded-full border-4 border-background shadow-md p-2 bg-card"
                    />}
                </div>
                <Button variant="outline" size="icon" className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-card shadow">
                    <Camera className="h-4 w-4"/>
                    <span className="sr-only">Upload new photo</span>
                </Button>
            </div>
        </div>

        {/* Personal Information Section */}
        <div className="space-y-3">
            <InfoCard icon={UserIcon} title="Full Name" subtitle="Sarah Johnson" action={<Button variant="ghost" size="icon" className="h-8 w-8 bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary"><Pencil className="h-4 w-4" /></Button>} />
            <InfoCard icon={Mail} title="Email Address" subtitle="sarah.johnson@email.com" action={<Button variant="ghost" size="icon" className="h-8 w-8 bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary"><Pencil className="h-4 w-4" /></Button>} verified />
            <InfoCard icon={Phone} title="Phone Number" subtitle="+1 555-0123" action={<Button variant="ghost" size="icon" className="h-8 w-8 bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary"><Pencil className="h-4 w-4" /></Button>} />
            <InfoCard icon={Calendar} title="Account Created" subtitle="January 15, 2024" />
        </div>

        <div className="space-y-3 mt-6">
            <LinkCard 
                icon={UserCog}
                title="Personal Information"
                subtitle="Manage your personal details"
                href="#"
            />
             <LinkCard 
                icon={AsteriskIcon}
                title="Emergency Contact"
                subtitle="Manage your emergency contacts"
                href="#"
            />
        </div>
      </div>
    </div>
  );
}
