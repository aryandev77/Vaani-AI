'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { useAuth, useUser } from '@/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FullScreenLoader } from '@/components/full-screen-loader';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const SuccessAnimation = () => (
  <div className="flex flex-col items-center justify-center text-center">
    <div className="relative my-6 flex h-32 w-32 items-center justify-center">
      {/* Particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-green-400"
          initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
          animate={{
            scale: [0, 1, 0],
            x: (Math.random() - 0.5) * 150,
            y: (Math.random() - 0.5) * 150,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.2,
            ease: 'easeOut',
            delay: 0.5 + Math.random() * 0.3,
          }}
        />
      ))}
      {/* Circle */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="h-24 w-24 rounded-full border-4 border-green-500" />
      </motion.div>
      {/* Checkmark */}
      <motion.svg className="h-24 w-24" viewBox="0 0 52 52">
        <motion.path
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          className="text-green-500"
          stroke="currentColor"
          d="M14 27l5.917 5.917L38 18"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        />
      </motion.svg>
    </div>
    <h2 className="text-2xl font-bold text-white">Successfully</h2>
    <p className="mt-2 text-gray-400">
      Yahoo! You have successfully created the account.
    </p>
  </div>
);

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const user = useUser();

  useEffect(() => {
    // If a user is already logged in and somehow lands here, redirect them.
    if (user && !isSuccess) {
      router.push('/dashboard');
    }
  }, [user, router, isSuccess]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!auth) {
      setError(
        'Authentication service is not available. Please try again later.'
      );
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCredential.user, {
        displayName: fullName,
      });
      setIsSuccess(true);
    } catch (error: any) {
      console.error('Full Signup Error Object:', error);
      let errorMessage = 'An unexpected error occurred.';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email address is already in use.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage =
            'The password is too weak. Please choose a stronger password.';
          break;
        default:
          errorMessage =
            "Sign-up failed. This can happen if the 'Email/Password' sign-in method is not enabled in your Firebase project. Please check your Firebase Console > Authentication > Sign-in method.";
          break;
      }
      setError(errorMessage);
    }
  };

  if (user === undefined) {
    return <FullScreenLoader />;
  }

  const handleDone = () => {
    router.push('/dashboard/profile-setup');
  };

  // Do not show login page if a user is already logged in
  if (user && !isSuccess) {
    return <FullScreenLoader />;
  }

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="mx-auto w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <Logo />
            </div>
            <CardTitle className="text-2xl font-headline">
              Create an Account
            </CardTitle>
            <CardDescription>
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Sign-up Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSignUp}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="full-name">Full name</Label>
                  <Input
                    id="full-name"
                    placeholder="John Doe"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Create an account
                </Button>
              </div>
            </form>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/phone-auth">Continue with Phone</Link>
            </Button>
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/" className="underline">
                Login
              </Link>
            </div>
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Made with 🧡
        </p>
      </div>

      <Dialog open={isSuccess} onOpenChange={open => !open && handleDone()}>
        <DialogContent className="max-w-sm border-0 bg-[#121212] p-8 text-white shadow-2xl">
          <SuccessAnimation />
          <Button
            onClick={handleDone}
            className="mt-6 w-full rounded-full bg-green-600 text-base font-bold text-white hover:bg-green-700"
            size="lg"
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
