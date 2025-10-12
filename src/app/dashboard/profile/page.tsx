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
  ShieldCheck,
  Info,
  Smartphone,
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
    <Card className="shadow-none">
      <CardContent className="p-4 flex items-center">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 text-primary p-3 rounded-full">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <div className="flex items-center gap-2">
                <p className="font-semibold">{value}</p>
                {verified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-none text-xs">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Verified
                    </Badge>
                )}
            </div>
          </div>
        </div>
        {editable && (
          <Button variant="ghost" size="icon" className="ml-auto text-muted-foreground">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProfilePage() {
  return (
    <div className="bg-background">
      <div className="p-4 flex items-center justify-between border-b">
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

      <div className="p-6 flex flex-col items-center space-y-6">
        <div className="relative">
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

        <div className="w-full space-y-4">
            <Card className="shadow-none">
                <CardContent className="p-4 flex items-center">
                    <div className="flex items-center gap-4">
                        <div className="text-primary">
                            <Info className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-semibold">Personal Information</p>
                            <p className="text-sm text-muted-foreground">Manage your personal details</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

             <Card className="shadow-none">
                <CardContent className="p-4 flex items-center">
                    <div className="flex items-center gap-4">
                         <div className="text-primary">
                            <Smartphone className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-semibold">Emergency Contact</p>
                        </div>
                    </div>
                    <ChevronRight className="ml-auto text-muted-foreground h-5 w-5" />
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
