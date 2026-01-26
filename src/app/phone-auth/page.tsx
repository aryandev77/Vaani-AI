'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';
import { LoaderCircle, Phone } from 'lucide-react';

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

export default function PhoneAuthPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  const router = useRouter();
  const auth = useAuth();
  const user = useUser();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Set up reCAPTCHA verifier
  useEffect(() => {
    if (!auth) return;

    // This is to avoid creating multiple verifiers
    if ((window as any).recaptchaVerifier) return;

    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      },
    });
    (window as any).recaptchaVerifier = verifier;

    // Clean up the verifier on unmount
    return () => {
        verifier.clear();
    };

  }, [auth]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!auth) {
      setError('Authentication service not available.');
      setLoading(false);
      return;
    }

    try {
      const verifier = (window as any).recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      setConfirmationResult(result);
    } catch (error: any) {
      console.error('OTP Send Error:', error);
      let errorMessage = 'Failed to send OTP. Please try again.';
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number. Please include the country code (e.g., +1 for USA).';
      }
      setError(errorMessage);
      setConfirmationResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!confirmationResult) {
      setError('Please request an OTP first.');
      setLoading(false);
      return;
    }

    try {
      await confirmationResult.confirm(otp);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('OTP Verify Error:', error);
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (user === undefined) {
    return <FullScreenLoader />;
  }

  if (user) {
    return <FullScreenLoader />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-headline">
            Continue with Phone
          </CardTitle>
          <CardDescription>
            {confirmationResult
              ? 'Enter the OTP sent to your phone.'
              : 'Please enter your phone number to continue.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Authentication Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!confirmationResult ? (
            <form onSubmit={handleSendOtp}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone-number">Phone Number</Label>
                  <Input
                    id="phone-number"
                    type="tel"
                    placeholder="+1 555-555-5555"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="otp">One-Time Password</Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    'Verify OTP & Login'
                  )}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-4 text-center text-sm">
            <Link href="/" className="underline">
              Use email and password instead
            </Link>
          </div>
        </CardContent>
      </Card>
      {/* This container is used by Firebase for the reCAPTCHA verifier */}
      <div id="recaptcha-container"></div>
    </div>
  );
}
