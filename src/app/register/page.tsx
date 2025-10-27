'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User, Mail, Phone, Lock } from "lucide-react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { useUser } from '@/supabase/auth';
import { supabase } from '@/supabase/client';
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

function InputField({ icon: Icon, id, type, placeholder, value, onChange }: { icon: React.ElementType, id: string, type: string, placeholder: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
    return (
        <div className="relative flex items-center">
            <Icon className="absolute left-3 h-5 w-5 text-muted-foreground" />
            <Input id={id} type={type} placeholder={placeholder} className="pl-10 h-12" value={value} onChange={onChange} />
        </div>
    );
}

export default function RegisterPage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: 'Passwords do not match.',
      });
      return;
    }

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: phone,
          },
        },
      });

      if (signUpError) throw signUpError;
      
      if (!signUpData.user) {
        throw new Error("User not created after sign up.");
      }

      // After successful sign-up, create a profile entry
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ 
            id: signUpData.user.id, 
            full_name: fullName
        });

      if (profileError) {
        // Handle profile creation error, maybe delete the user or notify them
        console.error("Error creating profile:", profileError);
        // Attempt to delete the user to avoid orphaned auth users
        await supabase.auth.admin.deleteUser(signUpData.user.id);
        throw new Error(`Failed to create user profile: ${profileError.message}`);
      }

      toast({
        title: 'Registration Successful',
        description: 'Please check your email to verify your account.',
      });
      router.push('/login'); // Redirect to login after successful registration
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
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
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-white/80">Join SmartGas Guardian</p>
        </div>

        <Card className="bg-card/90 backdrop-blur-sm text-card-foreground border-white/20">
          <CardContent className="p-6 space-y-4">
            <InputField icon={User} id="fullname" type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <InputField icon={Mail} id="email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <InputField icon={Phone} id="phone" type="tel" placeholder="Mobile Number (Optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <InputField icon={Lock} id="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <InputField icon={Lock} id="confirm-password" type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
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
