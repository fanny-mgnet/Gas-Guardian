'use client';

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
    ChevronRight,
    Star,
    Settings,
    CreditCard,
    Smartphone,
    Database,
    Shield,
    Lock,
    KeyRound,
    MonitorSmartphone,
    SlidersHorizontal,
    Sun,
    Scale,
    Globe,
    LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

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
                    <div className="text-xs text-muted-foreground flex items-center">
                        <span>{label}</span>
                        {isVerified && (
                             <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 border-none text-xs font-medium">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Verified
                            </Badge>
                        )}
                    </div>
                    <p className="font-semibold">{value}</p>
                </div>
                {action && <div className="ml-auto pl-2">{action}</div>}
            </CardContent>
        </Card>
    );
}

function SectionHeader({
    icon: Icon,
    title,
    subtitle,
  }: {
    icon: React.ElementType;
    title: string;
    subtitle: string;
  }) {
    return (
      <div className="flex items-center gap-4 px-4 py-2">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    );
}

function SettingsItem({
    icon: Icon,
    iconBg,
    title,
    subtitle,
    trailing,
    onTap,
  }: {
    icon: React.ElementType;
    iconBg?: string;
    title: string;
    subtitle?: string;
    trailing?: React.ReactNode;
    onTap?: () => void;
  }) {
    const content = (
      <Card className="shadow-sm bg-card">
        <CardContent className="p-4 flex items-center">
            <div className={`h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-lg ${iconBg || 'bg-primary/10'}`}>
                <Icon className="h-5 w-5 text-primary" />
            </div>
          <div className="ml-4 flex-grow">
            <p className="font-semibold">{title}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="ml-auto pl-2 flex items-center gap-4">
            {trailing}
            {onTap && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
          </div>
        </CardContent>
      </Card>
    );
  
    if (onTap) {
      return <button onClick={onTap} className="w-full text-left">{content}</button>;
    }
    return content;
}

export default function ProfilePage() {
    const { toast } = useToast();
    const router = useRouter();
    const userAvatarLg = PlaceHolderImages.find(p => p.id === 'user-avatar-lg');
    const user = {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1 555-0123',
        emergencyContact: '+1 555-0456',
        accountCreated: 'January 15, 2024',
        isEmailVerified: true,
        subscription: 'Premium Plan',
        connectedDevices: 5,
        dataUsage: '2.3 GB',
        twoFactorEnabled: false,
        activeSessions: 3,
        isMetricUnits: true,
        language: 'English',
        theme: 'Light Mode',
    };

    const handleLogout = () => {
        toast({
            title: 'Logged Out',
            description: 'You have been successfully logged out.',
        });
        router.push('/login');
    };

    const handleNotImplemented = (feature: string) => {
        toast({
            title: 'Coming Soon!',
            description: `${feature} functionality is not yet implemented.`,
        });
    }

    const editButton = (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted/80" onClick={() => handleNotImplemented('Editing profile fields')}>
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
                <Button variant="ghost" size="icon" className="text-primary" onClick={() => handleNotImplemented('Editing profile')}>
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
                
                <div className="space-y-2 mb-6">
                    <InfoCard icon={User} label="Full Name" value={user.name} action={editButton} />
                    <InfoCard icon={Mail} label="Email Address" value={user.email} action={editButton} isVerified={user.isEmailVerified} />
                    <InfoCard icon={Phone} label="Phone Number" value={user.phone} action={editButton} />
                    <InfoCard icon={Calendar} label="Account Created" value={user.accountCreated} />
                </div>

                <div className="space-y-4 mb-6">
                    <SectionHeader icon={User} title="Personal Information" subtitle="Manage your personal details" />
                    <div className="space-y-2">
                        <SettingsItem icon={Star} title="Emergency Contact" subtitle={user.emergencyContact} iconBg="bg-red-100" onTap={() => handleNotImplemented('Editing emergency contact')}/>
                    </div>
                </div>
                
                <div className="space-y-4 mb-6">
                    <SectionHeader icon={Settings} title="Account Settings" subtitle="Subscription and device information" />
                    <div className="space-y-2">
                        <SettingsItem 
                            icon={CreditCard} 
                            title="Subscription Status" 
                            subtitle={user.subscription}
                            trailing={<Badge variant="secondary" className="bg-blue-100 text-blue-800 border-none">Active</Badge>}
                        />
                        <SettingsItem 
                            icon={Smartphone} 
                            title="Connected Devices" 
                            subtitle={`${user.connectedDevices} devices connected`}
                            onTap={() => {}}
                        />
                        <SettingsItem 
                            icon={Database} 
                            title="Data Usage" 
                            subtitle={`Monthly usage: ${user.dataUsage}`}
                        />
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    <SectionHeader icon={Shield} title="Security" subtitle="Protect your account" />
                    <div className="space-y-2">
                        <SettingsItem 
                            icon={Lock} 
                            title="Change Password" 
                            subtitle="Update your account password" 
                            onTap={() => handleNotImplemented('Changing password')} 
                        />
                        <SettingsItem 
                            icon={KeyRound} 
                            title="Two-Factor Authentication" 
                            subtitle={user.twoFactorEnabled ? 'Enabled' : 'Disabled'} 
                            trailing={<Switch checked={user.twoFactorEnabled} onCheckedChange={() => handleNotImplemented('2FA')}/>}
                        />
                        <SettingsItem 
                            icon={MonitorSmartphone} 
                            title="Active Sessions" 
                            subtitle={`${user.activeSessions} active sessions`} 
                            onTap={() => handleNotImplemented('Managing active sessions')}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <SectionHeader icon={SlidersHorizontal} title="App Preferences" subtitle="Customize your experience" />
                    <div className="space-y-2">
                        <SettingsItem 
                            icon={Sun} 
                            title="Theme" 
                            subtitle={user.theme} 
                            trailing={<Switch onCheckedChange={() => handleNotImplemented('Theme switching')} />}
                        />
                        <SettingsItem 
                            icon={Scale} 
                            title="Measurement Units" 
                            subtitle="Metric (°C, kg)" 
                            trailing={<Switch defaultChecked={user.isMetricUnits} onCheckedChange={() => handleNotImplemented('Unit switching')} />}
                        />
                        <SettingsItem 
                            icon={Globe} 
                            title="Language" 
                            subtitle={user.language} 
                            onTap={() => handleNotImplemented('Language selection')}
                        />
                    </div>
                </div>

                <div className="mt-8">
                    <Button variant="destructive" className="w-full justify-center text-base py-6" onClick={handleLogout}>
                        <LogOut className="mr-2 h-5 w-5" />
                        Logout
                    </Button>
                </div>

            </div>
        </div>
    );
}
