import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChevronRight,
  User,
  Mail,
  Phone,
  Calendar,
  Pencil,
  ArrowLeft,
  Camera,
  Info,
} from 'lucide-react';
import Link from 'next/link';

function ProfileInfoRow({
  icon: Icon,
  label,
  value,
  verified,
  editable = true,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  verified?: boolean;
  editable?: boolean;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 flex items-center">
        <div className="flex items-center gap-4">
          <div className="bg-primary text-primary-foreground h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <div className="flex items-center gap-2">
                <p className="font-semibold">{value}</p>
                {verified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-none text-xs font-medium">
                        <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1"><path d="M9.5 4.5L5.25 8.75L3.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                        Verified
                    </Badge>
                )}
            </div>
          </div>
        </div>
        {editable && (
          <Button variant="ghost" size="icon" className="ml-auto text-muted-foreground h-10 w-10 rounded-full">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
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
      <div className="bg-card p-4 flex items-center justify-between border-b">
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

      <div className="p-4 space-y-6">
        <div className="flex justify-center items-center py-4">
            <div className="relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full -m-2"></div>
                <Avatar className="w-24 h-24 border-4 border-background shadow-md">
                    <AvatarImage src="https://picsum.photos/seed/avatar2/100/100" />
                    <AvatarFallback>SJ</AvatarFallback>
                </Avatar>
                <Button
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-primary"
                >
                    <Camera className="h-4 w-4" />
                </Button>
            </div>
        </div>

        <div className="w-full space-y-3">
          <ProfileInfoRow
            icon={User}
            label="Full Name"
            value="Sarah Johnson"
          />
          <ProfileInfoRow
            icon={Mail}
            label="Email Address"
            value="sarah.johnson@email.com"
            verified
          />
          <ProfileInfoRow
            icon={Phone}
            label="Phone Number"
            value="+1 555-0123"
          />
          <ProfileInfoRow
            icon={Calendar}
            label="Account Created"
            value="January 15, 2024"
            editable={false}
          />
        </div>

        <div className="w-full space-y-2">
            <Card className="shadow-sm">
                <CardContent className="p-4 flex items-center gap-4">
                    <div className="text-primary">
                        <Info className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="font-semibold">Personal Information</p>
                        <p className="text-sm text-muted-foreground">Manage your personal details</p>
                    </div>
                </CardContent>
            </Card>

             <Card className="shadow-sm">
                <CardContent className="p-4 flex items-center gap-4">
                    <div className="text-primary">
                        <AsteriskIcon className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="font-semibold">Emergency Contact</p>
                    </div>
                    <ChevronRight className="ml-auto text-muted-foreground h-5 w-5" />
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
