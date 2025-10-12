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
                        <p className="font-semibold">{title}</p>
                        <p className="text-sm text-muted-foreground">{subtitle}</p>
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

      <div className="p-4 space-y-4">
        <div className="flex flex-col items-center py-4">
            <div className="relative">
                {userAvatar && <Image
                    src={userAvatar.imageUrl.replace('40/40', '96/96')}
                    width={96}
                    height={96}
                    alt={userAvatar.description}
                    data-ai-hint={userAvatar.imageHint}
                    className="rounded-full"
                />}
                <Button size="icon" className="absolute bottom-0 right-0 h-8 w-8 rounded-full border-2 border-card">
                    <Camera className="h-4 w-4" />
                </Button>
            </div>
        </div>
        
        <div className="space-y-3">
            <InfoCard 
                icon={UserIcon}
                title="Full Name"
                subtitle="John Doe"
                action={
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                }
            />
            <InfoCard 
                icon={Mail}
                title="Email Address"
                subtitle="john.doe@example.com"
                verified
                action={
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                }
            />
            <InfoCard 
                icon={Phone}
                title="Phone Number"
                subtitle="+1 234 567 890"
                action={
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                }
            />
            <InfoCard 
                icon={Calendar}
                title="Account Created"
                subtitle="January 15, 2024"
            />
        </div>

        <div className="space-y-3 pt-4">
            <LinkCard 
                icon={UserIcon}
                title="Personal Information"
                subtitle="Manage your personal details"
                href="#"
            />
             <LinkCard 
                icon={Asterisk}
                title="Emergency Contact"
                subtitle="Manage your emergency contacts"
                href="#"
            />
        </div>
      </div>
    </div>
  );
}
