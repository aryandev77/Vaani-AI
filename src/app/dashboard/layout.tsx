'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import {
  Book,
  History,
  Info,
  Languages,
  MessageSquare,
  Smile,
  Swords,
  BookMarked,
  Settings,
  CreditCard,
  Phone,
  Quote,
  Voicemail,
  HelpCircle,
  Shield,
} from 'lucide-react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
import { Logo } from '@/components/logo';
import { useUser } from '@/firebase';
import { FullScreenLoader } from '@/components/full-screen-loader';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const phraseOfTheDay = {
  phrase: 'Bite the bullet',
  meaning:
    'To face a difficult or unpleasant situation with courage and determination.',
  story:
    'This idiom is believed to have originated in the 18th century, before the widespread use of anesthesia. During battlefield surgery, wounded soldiers were given a lead bullet to bite down on to cope with the excruciating pain.',
  translations: [
    {
      lang: 'Hindi',
      text: 'कठिनाई का हिम्मत से सामना करना',
      emotion: 'Determined',
    },
    {
      lang: 'Spanish',
      text: 'Hacer de tripas corazón',
      emotion: 'Resolute',
    },
    {
      lang: 'Japanese',
      text: '歯を食いしばる (Ha o kuishibaru)',
      emotion: 'Gritty',
    },
  ],
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const user = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user === null) {
      router.push('/');
    }
  }, [user, router]);

  const pageTitle = useMemo(() => {
    const pageTitles: { [key: string]: string } = {
      '/dashboard': 'AI Language Tutor',
      '/dashboard/chatbot': 'Real-Time Translation',
      '/dashboard/voice-memo': 'Voice Memo & Phrasebook',
      '/dashboard/live-call': 'Live Call Translation',
      '/dashboard/learning': 'Learning Mode',
      '/dashboard/emotion': 'Emotion & Tone Preservation',
      '/dashboard/history': 'Conversation History',
      '/dashboard/about': 'About Vaani AI',
      '/dashboard/profile': 'Your Profile',
      '/dashboard/settings': 'Settings',
      '/dashboard/game': 'Language Games',
      '/dashboard/spiritual-texts': 'Spiritual Texts',
      '/dashboard/billing': 'Billing & Subscriptions',
      '/dashboard/tutorial': 'App Tutorial',
      '/dashboard/privacy': 'Privacy Policy',
    };
    return pageTitles[pathname] || 'Dashboard';
  }, [pathname]);

  if (user === undefined) {
    return <FullScreenLoader />;
  }

  if (user === null) {
    return null; // or a redirect component
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <Sidebar>
          <SidebarHeader>
            <div className="p-2">
              <Logo />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={{
                    children: 'AI Tutor',
                    className: 'bg-primary text-primary-foreground',
                  }}
                  size="lg"
                  isActive={pathname === '/dashboard'}
                >
                  <Link href="/dashboard">
                    <MessageSquare />
                    <span>AI Tutor</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={{
                    children: 'Translate',
                    className: 'bg-primary text-primary-foreground',
                  }}
                  size="lg"
                  isActive={pathname === '/dashboard/chatbot'}
                >
                  <Link href="/dashboard/chatbot">
                    <Languages />
                    <span>Translate</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={{
                    children: 'Voice Memo',
                    className: 'bg-primary text-primary-foreground',
                  }}
                  size="lg"
                  isActive={pathname === '/dashboard/voice-memo'}
                >
                  <Link href="/dashboard/voice-memo">
                    <Voicemail />
                    <span>Voice Memo</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={{
                    children: 'Live Call',
                    className: 'bg-primary text-primary-foreground',
                  }}
                  size="lg"
                  isActive={pathname === '/dashboard/live-call'}
                >
                  <Link href="/dashboard/live-call">
                    <Phone />
                    <span>Live Call</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={{
                    children: 'Learning Mode',
                    className: 'bg-primary text-primary-foreground',
                  }}
                  size="lg"
                  isActive={pathname === '/dashboard/learning'}
                >
                  <Link href="/dashboard/learning">
                    <Book />
                    <span>Learning Mode</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={{
                    children: 'Spiritual Texts',
                    className: 'bg-primary text-primary-foreground',
                  }}
                  size="lg"
                  isActive={pathname === '/dashboard/spiritual-texts'}
                >
                  <Link href="/dashboard/spiritual-texts">
                    <BookMarked />
                    <span>Spiritual Texts</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={{
                    children: 'Emotion Tool',
                    className: 'bg-primary text-primary-foreground',
                  }}
                  size="lg"
                  isActive={pathname === '/dashboard/emotion'}
                >
                  <Link href="/dashboard/emotion">
                    <Smile />
                    <span>Emotion Tool</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={{
                    children: 'Games',
                    className: 'bg-primary text-primary-foreground',
                  }}
                  size="lg"
                  isActive={pathname === '/dashboard/game'}
                >
                  <Link href="/dashboard/game">
                    <Swords />
                    <span>Games</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={{
                    children: 'History',
                    className: 'bg-primary text-primary-foreground',
                  }}
                  size="lg"
                  isActive={pathname === '/dashboard/history'}
                >
                  <Link href="/dashboard/history">
                    <History />
                    <span>History</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={{
                    children: 'About',
                    className: 'bg-primary text-primary-foreground',
                  }}
                  size="lg"
                  isActive={pathname === '/dashboard/about'}
                >
                  <Link href="/dashboard/about">
                    <Info />
                    <span>About</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={{
                    children: 'Tutorial',
                    className: 'bg-primary text-primary-foreground',
                  }}
                  size="lg"
                  isActive={pathname === '/dashboard/tutorial'}
                >
                  <Link href="/dashboard/tutorial">
                    <HelpCircle />
                    <span>Tutorial</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={{
                    children: 'Privacy',
                    className: 'bg-primary text-primary-foreground',
                  }}
                  size="lg"
                  isActive={pathname === '/dashboard/privacy'}
                >
                  <Link href="/dashboard/privacy">
                    <Shield />
                    <span>Privacy</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={{
                    children: 'Settings',
                    className: 'bg-primary text-primary-foreground',
                  }}
                  size="lg"
                  isActive={pathname === '/dashboard/settings'}
                >
                  <Link href="/dashboard/settings">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={{
                    children: 'Billing',
                    className: 'bg-primary text-primary-foreground',
                  }}
                  size="lg"
                  isActive={pathname === '/dashboard/billing'}
                >
                  <Link href="/dashboard/billing">
                    <CreditCard />
                    <span>Billing</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <div className="flex h-full flex-col">
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
              <SidebarTrigger className="md:hidden" />
              <div className="flex flex-1 items-center gap-2">
                <h1 className="text-xl font-semibold font-headline">
                  {pageTitle}
                </h1>
                {pathname === '/dashboard' && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Show Phrase of the Day"
                      >
                        <Quote className="h-5 w-5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 font-headline text-2xl">
                          <Quote /> Phrase of the Day
                        </DialogTitle>
                      </DialogHeader>
                      <CardContent>
                        <Accordion type="single" collapsible>
                          <AccordionItem value="item-1">
                            <AccordionTrigger>
                              <div className="text-left">
                                <p className="text-xl font-semibold">
                                  {phraseOfTheDay.phrase}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {phraseOfTheDay.meaning}
                                </p>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-2">
                              <div>
                                <h4 className="font-semibold">
                                  Origin Story
                                </h4>
                                <p className="text-muted-foreground">
                                  {phraseOfTheDay.story}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold">
                                  Emotional Translations
                                </h4>
                                <div className="mt-2 space-y-2">
                                  {phraseOfTheDay.translations.map(t => (
                                    <div
                                      key={t.lang}
                                      className="flex items-center justify-between rounded-md bg-secondary p-2"
                                    >
                                      <div>
                                        <p className="font-medium">
                                          {t.lang}: "{t.text}"
                                        </p>
                                      </div>
                                      <Badge variant="outline">
                                        {t.emotion}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <UserNav />
            </header>
            <main
              className={cn(
                'flex-1',
                pathname === '/dashboard'
                  ? 'overflow-hidden'
                  : 'overflow-auto p-4 sm:p-6'
              )}
            >
              {children}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
