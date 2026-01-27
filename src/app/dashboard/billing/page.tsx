'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Crown, Lock, ArrowRight, X, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

type Plan = 'monthly' | 'yearly';

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan>('yearly');
  const bgImage = getPlaceholderImage('billing-dark-background');

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: '$9.99',
      pricePer: '/ month',
      saveBadge: null,
      popular: false,
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: '$69.99',
      pricePer: '/ year',
      saveBadge: 'Save 40%',
      popular: true,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-black text-white shadow-2xl">
      <div className="relative h-full">
        {bgImage && (
          <Image
            src={bgImage.imageUrl}
            alt={bgImage.description}
            data-ai-hint={bgImage.imageHint}
            layout="fill"
            objectFit="cover"
            className="absolute inset-0 z-0 opacity-40"
          />
        )}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/80 to-transparent" />

        <div className="relative z-20 flex h-full min-h-[85vh] flex-col p-6">
          <header className="flex items-center justify-between">
            <Link href="/dashboard">
              <X className="h-6 w-6 cursor-pointer" />
            </Link>
            <Button variant="link" className="text-white">
              Restore Purchases
            </Button>
          </header>

          <div className="my-8">
            <Logo className="justify-center" />
          </div>

          <div className="relative mb-8 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <div className="absolute -top-3 right-4 rounded-full bg-yellow-500 p-1.5 text-black">
              <Crown className="h-4 w-4" />
            </div>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-400" />
                <span>Live Call & Video Translation</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-400" />
                <span>Unlimited Translations</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-400" />
                <span>Unlimited Streak Restores</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-400" />
                <span>Exclusive AI Models</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-400" />
                <span>Ad-Free Experience</span>
              </li>
            </ul>
          </div>

          <div className="mb-8 grid grid-cols-2 gap-4">
            {plans.map(plan => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id as Plan)}
                className={cn(
                  'relative cursor-pointer rounded-xl border-2 p-4 text-center transition-all',
                  selectedPlan === plan.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-white/20 bg-white/10'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-2 py-0.5 text-xs font-bold">
                    Most Popular
                  </div>
                )}
                {plan.saveBadge && !plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-semibold text-green-300">
                    {plan.saveBadge}
                  </div>
                )}
                <p className="font-bold">{plan.name}</p>
                <p className="mt-1 text-2xl font-bold">{plan.price}</p>
                <p className="text-xs text-zinc-400">{plan.pricePer}</p>
              </div>
            ))}
          </div>

          <div className="mt-auto space-y-4 text-center">
            <Button
              size="lg"
              className="w-full bg-red-600 text-white hover:bg-red-700"
            >
              Continue <ArrowRight className="ml-2" />
            </Button>
            <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
              <Lock className="h-3 w-3" />
              <span>Secured with Stripe. Cancel anytime.</span>
            </div>
            <div className="text-xs text-zinc-500">
              <Link href="#" className="underline">
                Terms of Service
              </Link>{' '}
              &bull;{' '}
              <Link href="#" className="underline">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
