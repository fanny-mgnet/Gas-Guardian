import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChevronRight,
  User,
  Settings,
  Shield,
  CreditCard,
  Cpu,
  Database,
  Lock,
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
                {action}
            </CardContent>
        </Card>
    );

    if (href) {
        return <Link href={href}>{content}</Link>;
    }

    return content;
}

const AsteriskIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20"/>
        <path d="m4.93 4.93 14.14 14.14"/>
        <path d="m4.93 19.07 14.14-14.14"/>
    </svg>
);

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
        <ProfileCard 
            icon={User}
            title="Personal Information"
            subtitle="Manage your personal details"
            action={<ChevronRight className="ml-auto text-muted-foreground h-5 w-5" />}
            href="#"
        />
        <ProfileCard 
            icon={AsteriskIcon}
            title="Emergency Contact"
            subtitle="+1 555-0456"
            action={<ChevronRight className="ml-auto text-muted-foreground h-5 w-5" />}
            href="#"
        />
        
        <ProfileSectionHeader 
            icon={Settings}
            title="Account Settings"
            subtitle="Subscription and device information"
        />

        <div className="space-y-2">
            <ProfileCard 
                icon={CreditCard}
                title="Subscription Status"
                subtitle="Premium Plan"
                action={<Badge variant="secondary" className="bg-green-100 text-green-800 border-none text-xs font-medium">Active</Badge>}
            />
             <ProfileCard 
                icon={Cpu}
                title="Connected Devices"
                subtitle="5 devices connected"
                action={<ChevronRight className="ml-auto text-muted-foreground h-5 w-5" />}
                href="/dashboard/devices"
            />
             <ProfileCard 
                icon={Database}
                title="Data Usage"
                subtitle="Monthly usage: 2.3 GB"
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
                action={<ChevronRight className="ml-auto text-muted-foreground h-5 w-5" />}
                href="#"
            />
        </div>

      </div>
    </div>
  );
}
