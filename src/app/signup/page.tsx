
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore, setDocumentNonBlocking, initiateGoogleSignIn, initiateEmailSignUp } from '@/firebase';
import { useUser } from '@/firebase/provider';
import { updateProfile } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.022,35.244,44,30.036,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
  );

export default function SignUpPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If the user is already logged in (and not a guest), redirect them away.
    if (!isUserLoading && user && !user.isAnonymous) {
      router.push('/my-profile');
    }
  }, [user, isUserLoading, router]);


  const handleSuccessfulSignUp = (userCredential: any) => {
    const firebaseUser = userCredential.user;
    let profileData: UserProfile;

    if (firebaseUser.providerData.some(p => p.providerId === 'google.com')) {
        // Handle Google Sign-Up
        const nameParts = firebaseUser.displayName?.split(' ') || [];
        profileData = {
            id: firebaseUser.uid,
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: firebaseUser.email!,
        };
    } else {
        // Handle Email Sign-Up
        updateProfile(firebaseUser, {
            displayName: `${firstName} ${lastName}`.trim(),
        });
        profileData = {
            id: firebaseUser.uid,
            firstName,
            lastName,
            email: firebaseUser.email!,
        };
    }
    
    const userDocRef = doc(firestore, 'users', firebaseUser.uid);
    setDocumentNonBlocking(userDocRef, profileData, { merge: false });
    // Redirection is handled by the useEffect hook, which will run after the user state updates.
};

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  const handleEmailSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({
        title: 'Password Too Short',
        description: 'Please use a password with at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);

    initiateEmailSignUp(auth, email, password)
      .then(handleSuccessfulSignUp)
      .catch((error: any) => {
        toast({
          title: 'Sign Up Failed',
          description: error.message,
          variant: 'destructive',
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleGoogleSignUp = () => {
    setIsLoading(true);
    initiateGoogleSignIn(auth)
      .then(handleSuccessfulSignUp)
      .catch((error: any) => {
        if (error.code !== 'auth/popup-closed-by-user') {
            toast({
              title: 'Google Sign-In Failed',
              description: error.message,
              variant: 'destructive',
            });
        }
      }).finally(() => {
          setIsLoading(false);
      });
  };


  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
          <CardDescription>Enter your details to get started.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button variant="outline" onClick={handleGoogleSignUp} disabled={isLoading}>
             {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" /> : <GoogleIcon />}
             <span className="ml-2">Sign up with Google</span>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                Or continue with
                </span>
            </div>
        </div>

        <form onSubmit={handleEmailSignUp} className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" placeholder="Max" required value={firstName} onChange={e => setFirstName(e.target.value)} />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" placeholder="Robinson" required value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
             <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
             <div className="text-center text-sm w-full">
              Already have an account?{' '}
              <Link href="/login" className="underline">
                Login
              </Link>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
