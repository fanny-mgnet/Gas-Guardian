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
        <SectionHeader icon={UserIcon} title="Personal Information" />
        <div className="space-y-3">
            <InfoCard icon={UserIcon} title="Full Name" subtitle="Jane Doe" action={<Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>} />
            <InfoCard icon={Mail} title="Email Address" subtitle="jane.doe@example.com" action={<Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>} verified />
            <InfoCard icon={Phone} title="Phone Number" subtitle="+1 555-1234" action={<Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>} />
            <InfoCard icon={Calendar} title="Joined" subtitle="October 2023" />
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
