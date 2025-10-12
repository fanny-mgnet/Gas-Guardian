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
  Asterisk,
  Settings,
  MonitorSmartphone,
  Database,
  Shield,
  KeyRound,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

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
      <CardContent className="p-3 flex items-center">
        <div className="bg-primary/10 text-primary h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg">
          <Icon className="h-5 w-5" />
        </div>
        <div className="ml-4 flex-grow">
          <p className="text-xs text-muted-foreground">{title}</p>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm">{subtitle}</p>
            {verified && <Badge className="bg-green-100 text-green-800 border-none text-xs">Verified</Badge>}
          </div>
        </div>
        {action && <div className="ml-auto pl-2">{action}</div>}
      </CardContent>
    </Card>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType, title: string, subtitle: string }) {
    return (
        <div className="flex items-center gap-3 pt-6 pb-2">
            <Icon className="h-5 w-5 text-primary" />
            <div>
                <h2 className="font-semibold">{title}</h2>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
        </div>
    );
}

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
    href?: string;
    action?: React.ReactNode;
  }) {
    const content = (
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
                    {action || <ChevronRight className="text-muted-foreground h-5 w-5" />}
                </div>
            </CardContent>
        </Card>
    );

    if (href) {
        return <Link href={href}>{content}</Link>;
    }

    return content;
  }

export default function ProfilePage() {
    const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');

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
        <div className="flex flex-col items-center pt-4 pb-6">
            <div className="relative mb-3">
                {userAvatar && <Image
                    src={userAvatar.imageUrl}
                    width={80}
                    height={80}
                    alt={userAvatar.description}
                    data-ai-hint={userAvatar.imageHint}
                    className="rounded-full border-4 border-background shadow-md"
                />}
                <Button variant="outline" size="icon" className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-card">
                    <Camera className="h-4 w-4"/>
                    <span className="sr-only">Upload new photo</span>
                </Button>
            </div>
            <h2 className="text-xl font-bold">Jane Doe</h2>
            <p className="text-sm text-muted-foreground">Premium Member</p>
        </div>

        {/* Personal Information Section */}
        <SectionHeader icon={UserIcon} title="Personal Information" subtitle="Manage your personal details" />
        <div className="space-y-3">
            <InfoCard icon={UserIcon} title="Full Name" subtitle="Jane Doe" action={<Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>} />
            <InfoCard icon={Mail} title="Email Address" subtitle="jane.doe@example.com" action={<Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>} verified />
            <InfoCard icon={Phone} title="Phone Number" subtitle="+1 555-1234" action={<Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>} />
            <InfoCard icon={Calendar} title="Joined" subtitle="October 2023" />
             <LinkCard 
                icon={Asterisk}
                title="Emergency Contact"
                subtitle="+1 555-0456"
                href="#"
            />
        </div>

        {/* Account Settings Section */}
        <SectionHeader icon={Settings} title="Account Settings" subtitle="Subscription and device information" />
        <div className="space-y-3">
            <LinkCard 
                icon={MonitorSmartphone}
                title="Subscription Status"
                subtitle="Premium Plan"
                action={<Badge className="bg-green-100 text-green-800 border-none text-xs px-2.5 py-1">Active</Badge>}
            />
            <LinkCard 
                icon={MonitorSmartphone}
                title="Connected Devices"
                subtitle="5 devices connected"
                href="/dashboard/devices"
            />
            <LinkCard 
                icon={Database}
                title="Data Usage"
                subtitle="Monthly usage: 2.3 GB"
                action={<span />} // To remove chevron
            />
        </div>

        {/* Security Section */}
        <SectionHeader icon={Shield} title="Security" subtitle="Protect your account" />
        <div className="space-y-3">
            <LinkCard 
                icon={KeyRound}
                title="Change Password"
                subtitle="Update your account password"
                href="#"
            />
        </div>
      </div>
    </div>
  );
}
