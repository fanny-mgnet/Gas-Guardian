import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  ChevronRight,
  Shield,
  Lock,
  ShieldCheck,
  Laptop,
  SlidersHorizontal,
  Sun,
  Ruler,
  Languages,
  ArrowLeft,
  Pencil,
  User as UserIcon,
  Mail,
  Phone,
  Bell,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function ProfileSectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-4 px-2 pt-6 pb-2">
      <Icon className="h-5 w-5 text-primary" />
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function ProfileCard({
  icon: Icon,
  title,
  subtitle,
  action,
  href,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  href?: string;
}) {
    const content = (
        <Card className="shadow-sm hover:bg-muted/50 transition-colors">
            <CardContent className="p-4 flex items-center">
                {Icon && <div className="bg-primary/10 text-primary h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg">
                    <Icon className="h-5 w-5" />
                </div>}
                <div className="ml-4 flex-grow">
                    <p className="font-semibold">{title}</p>
                    {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                </div>
                {action && <div className="ml-auto pl-2">{action}</div>}
            </CardContent>
        </Card>
    );

    if (href) {
        return <Link href={href || '#'}>{content}</Link>;
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

      <div className="p-4 space-y-2">
        <div className="flex flex-col items-center py-4">
            {userAvatar && <Image
                src={userAvatar.imageUrl.replace('40/40', '80/80')}
                width={80}
                height={80}
                alt={userAvatar.description}
                data-ai-hint={userAvatar.imageHint}
                className="rounded-full"
            />}
            <h2 className="text-xl font-bold mt-3">John Doe</h2>
            <p className="text-sm text-muted-foreground">john.doe@example.com</p>
        </div>
        
        <ProfileSectionHeader 
            icon={UserIcon}
            title="Personal Information"
            subtitle="Manage your personal details"
        />
        <div className="space-y-2">
            <ProfileCard 
                icon={Mail}
                title="Email"
                subtitle="john.doe@example.com"
                action={<ChevronRight className="text-muted-foreground h-5 w-5" />}
                href="#"
            />
            <ProfileCard 
                icon={Phone}
                title="Phone Number"
                subtitle="+1 234 567 890"
                action={<ChevronRight className="text-muted-foreground h-5 w-5" />}
                href="#"
            />
        </div>

        <ProfileSectionHeader 
            icon={Shield}
            title="Security"
            subtitle="Protect your account"
        />
        <div className="space-y-2">
            <ProfileCard 
                icon={Lock}
                title="Change Password"
                subtitle="Update your account password"
                action={<ChevronRight className="text-muted-foreground h-5 w-5" />}
                href="#"
            />
            <ProfileCard 
                icon={ShieldCheck}
                title="Two-Factor Authentication"
                subtitle="Disabled"
                action={<Switch id="two-factor-auth" />}
            />
             <ProfileCard 
                icon={Laptop}
                title="Active Sessions"
                subtitle="3 active sessions"
                action={<ChevronRight className="text-muted-foreground h-5 w-5" />}
                href="#"
            />
        </div>

        <ProfileSectionHeader 
            icon={SlidersHorizontal}
            title="App Preferences"
            subtitle="Customize your experience"
        />
        <div className="space-y-2">
            <ProfileCard 
                icon={Bell}
                title="Notifications"
                subtitle="Manage your notifications"
                action={<Switch id="notifications" defaultChecked />}
            />
            <ProfileCard 
                icon={Sun}
                title="Theme"
                subtitle="Light Mode"
                action={<Switch id="theme-mode" />}
            />
            <ProfileCard 
                icon={Ruler}
                title="Measurement Units"
                subtitle="Metric"
                action={<ChevronRight className="text-muted-foreground h-5 w-5" />}
                href="#"
            />
            <ProfileCard 
                icon={Languages}
                title="Language"
                subtitle="English"
                action={<ChevronRight className="text-muted-foreground h-5 w-5" />}
                href="#"
            />
        </div>

        <div className="pt-6">
            <ProfileCard 
                icon={LogOut}
                title="Logout"
                href="#"
            />
        </div>

      </div>
    </div>
  );
}
