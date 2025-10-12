'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User, Mail, Phone, Lock } from "lucide-react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function InputField({ icon: Icon, id, type, placeholder }: { icon: React.ElementType, id: string, type: string, placeholder: string }) {
    return (
        <div className="relative flex items-center">
            <Icon className="absolute left-3 h-5 w-5 text-muted-foreground" />
            <Input id={id} type={type} placeholder={placeholder} className="pl-10 h-12" />
        </div>
    );
}

export default function RegisterPage() {
  const router = useRouter();

  const handleRegister = () => {
    // Implement registration logic here
    router.push('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen auth-gradient text-white">
      <div className="w-full max-w-md p-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-white/80">Join Gas Detector App</p>
        </div>

        <Card className="bg-card/90 backdrop-blur-sm text-card-foreground border-white/20">
          <CardContent className="p-6 space-y-4">
            <InputField icon={User} id="fullname" type="text" placeholder="Full Name" />
            <InputField icon={Mail} id="email" type="email" placeholder="Email" />
            <InputField icon={Phone} id="phone" type="tel" placeholder="Mobile Number (Optional)" />
            <InputField icon={Lock} id="password" type="password" placeholder="Password" />
            <InputField icon={Lock} id="confirm-password" type="password" placeholder="Confirm Password" />
          </CardContent>
          <CardFooter className="flex flex-col gap-4 p-6 pt-0">
            <Button className="w-full h-12 text-base" onClick={handleRegister}>Sign Up</Button>
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Sign In
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
