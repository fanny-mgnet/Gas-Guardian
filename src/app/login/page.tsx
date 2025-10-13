'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, Lock } from "lucide-react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { useUser } from '@/supabase/auth';
import { supabase } from '@/supabase/client';
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

function InputField({ icon: Icon, id, type, placeholder, value, onChange }: { icon: React.ElementType, id: string, type: string, placeholder: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
    return (
        <div className="relative flex items-center">
            <Icon className="absolute left-3 h-5 w-5 text-muted-foreground" />
            <Input id={id} type={type} placeholder={placeholder} className="pl-10 h-12" value={value} onChange={onChange} />
        </div>
    );
}

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);


 const handleLogin = async () => {
   try {
     const { error } = await supabase.auth.signInWithPassword({
       email,
       password,
     });
     if (error) throw error;
     // Let the useEffect handle the redirect
   } catch (error: any) {
     toast({
       variant: 'destructive',
       title: 'Login Failed',
       description: error.message,
     });
   }
 };

  if (isUserLoading || (!isUserLoading && user)) {
    return (
      <div className="flex items-center justify-center min-h-screen auth-gradient text-white">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen auth-gradient text-white">
      <div className="w-full max-w-md p-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-white/80">Sign in to your SmartGas Guardian account</p>
        </div>

        <Card className="bg-card/90 backdrop-blur-sm text-card-foreground border-white/20">
          <CardContent className="p-6 space-y-4">
              <InputField icon={Mail} id="email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <div className="space-y-2">
                <InputField icon={Lock} id="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <div className="flex items-center">
                    <a href="#" className="ml-auto inline-block text-sm text-muted-foreground hover:text-primary">
                        Forgot your password?
                    </a>
                </div>
              </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 p-6 pt-0">
            <Button className="w-full h-12 text-base" onClick={handleLogin}>Sign In</Button>
            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                Sign Up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
