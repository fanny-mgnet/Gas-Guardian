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
import { useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useUser } from '@/supabase/auth';
import { supabase } from '@/supabase/client';

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
    const { user, setUser } = useUser();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast({
                variant: 'destructive',
                title: 'Logout Failed',
                description: error.message,
            });
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'You must be logged in to upload an image.',
            });
            return;
        }

        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        setUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true,
            });

        if (uploadError) {
            toast({
                variant: 'destructive',
                title: 'Upload Failed',
                description: uploadError.message,
            });
            setUploading(false);
            return;
        }

        const { data: publicUrlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        if (!publicUrlData?.publicUrl) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not get public URL for the uploaded image.',
            });
            setUploading(false);
            return;
        }

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ photo_url: publicUrlData.publicUrl })
            .eq('id', user.id);

        if (updateError) {
            toast({
                variant: 'destructive',
                title: 'Profile Update Failed',
                description: updateError.message,
            });
        } else {
            // Manually update the user object in the context to reflect the new photoURL
            if (user) {
                setUser({
                    ...user,
                    user_metadata: {
                        ...user.user_metadata,
                        photoURL: publicUrlData.publicUrl,
                    },
                });
            }
            toast({
                title: 'Profile Picture Updated',
                description: 'Your profile picture has been successfully updated.',
            });
        }
        setUploading(false);
    };

    const userAvatarLg = PlaceHolderImages.find(p => p.id === 'user-avatar-lg');
    
    const profileData = {
        name: user?.user_metadata?.full_name || 'Sarah Johnson',
        email: user?.email || 'sarah.johnson@email.com',
        phone: user?.user_metadata?.phone_number || '+1 555-0123',
        emergencyContact: '+1 555-0456',
        accountCreated: user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'January 15, 2024',
        isEmailVerified: user?.email_confirmed_at ? true : false,
        subscription: 'Premium Plan',
        connectedDevices: 5,
        dataUsage: '2.3 GB',
        twoFactorEnabled: false,
        activeSessions: 3,
        isMetricUnits: true,
        language: 'English',
        theme: 'Light Mode',
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
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            className="hidden"
                            accept="image/*"
                            disabled={uploading}
                        />
                        <Image
                            src={user?.user_metadata?.photoURL || userAvatarLg?.imageUrl || 'https://picsum.photos/seed/avatar-lg/96/96'}
                            width={112}
                            height={112}
                            alt="User avatar"
                            data-ai-hint="person picture"
                            className="rounded-full object-cover border-4 border-card"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            disabled={uploading}
                        >
                            {uploading ? (
                                <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <Camera className="h-8 w-8 text-white" />
                            )}
                        </button>
                    </div>
                </div>
                
                <div className="space-y-2 mb-6">
                    <InfoCard icon={User} label="Full Name" value={profileData.name} action={editButton} />
                    <InfoCard icon={Mail} label="Email Address" value={profileData.email} action={editButton} isVerified={profileData.isEmailVerified} />
                    <InfoCard icon={Phone} label="Phone Number" value={profileData.phone} action={editButton} />
                    <InfoCard icon={Calendar} label="Account Created" value={profileData.accountCreated} />
                </div>

                <div className="space-y-4 mb-6">
                    <SectionHeader icon={User} title="Personal Information" subtitle="Manage your personal details" />
                    <div className="space-y-2">
                        <SettingsItem icon={Star} title="Emergency Contact" subtitle={profileData.emergencyContact} iconBg="bg-red-100" onTap={() => handleNotImplemented('Editing emergency contact')}/>
                    </div>
                </div>
                
                <div className="space-y-4 mb-6">
                    <SectionHeader icon={Settings} title="Account Settings" subtitle="Subscription and device information" />
                    <div className="space-y-2">
                        <SettingsItem 
                            icon={CreditCard} 
                            title="Subscription Status" 
                            subtitle={profileData.subscription}
                            trailing={<Badge variant="secondary" className="bg-blue-100 text-blue-800 border-none">Active</Badge>}
                        />
                        <SettingsItem 
                            icon={Smartphone} 
                            title="Connected Devices" 
                            subtitle={`${profileData.connectedDevices} devices connected`}
                            onTap={() => router.push('/dashboard/devices')}
                        />
                        <SettingsItem 
                            icon={Database} 
                            title="Data Usage" 
                            subtitle={`Monthly usage: ${profileData.dataUsage}`}
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
                            subtitle={profileData.twoFactorEnabled ? 'Enabled' : 'Disabled'} 
                            trailing={<Switch checked={profileData.twoFactorEnabled} onCheckedChange={() => handleNotImplemented('2FA')}/>}
                        />
                        <SettingsItem 
                            icon={MonitorSmartphone} 
                            title="Active Sessions" 
                            subtitle={`${profileData.activeSessions} active sessions`} 
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
                            subtitle={profileData.theme} 
                            trailing={<Switch onCheckedChange={() => handleNotImplemented('Theme switching')} />}
                        />
                        <SettingsItem 
                            icon={Scale} 
                            title="Measurement Units" 
                            subtitle="Metric (°C, kg)" 
                            trailing={<Switch defaultChecked={profileData.isMetricUnits} onCheckedChange={() => handleNotImplemented('Unit switching')} />}
                        />
                        <SettingsItem 
                            icon={Globe} 
                            title="Language" 
                            subtitle={profileData.language} 
                            onTap={() => handleNotImplemented('Language selection')}
                        />
                    </div>
                </div>

                <div className="mt-8">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="w-full justify-center text-base py-6">
                                <LogOut className="mr-2 h-5 w-5" />
                                Logout
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Logout</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to logout from your account?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Logout</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

            </div>
        </div>
    );
}
