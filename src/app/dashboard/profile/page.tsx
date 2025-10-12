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
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
                <div className="bg-primary/10 text-primary h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg">
                    <Icon className="h-5 w-5" />
                </div>
                <div className="ml-4 flex-grow">
                    <p className="font-semibold">{title}</p>
                    {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                </div>
                {action && <div className="ml-auto pl-2">{action}</div>}
            </CardContent>
        </Card>
    );

    if (href) {
        return <Link href={href}>{content}</Link>;
    }

    return content;
}

export default function ProfilePage() {
  return (
    <div className="bg-muted/30 min-h-screen">
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

      <div className="p-4 space-y-2">
        
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
                icon={Sun}
                title="Theme"
                subtitle="Light Mode"
                action={<Switch id="theme-mode" />}
            />
            <ProfileCard 
                icon={Ruler}
                title="Measurement Units"
                subtitle="Metric (°C, kg)"
                action={<Switch id="measurement-units" defaultChecked />}
            />
            <ProfileCard 
                icon={Languages}
                title="Language"
                subtitle="English"
                action={<ChevronRight className="text-muted-foreground h-5 w-5" />}
                href="#"
            />
        </div>

      </div>
    </div>
  );
}
