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
              <div className="flex-1">
                <h1 className="text-xl font-semibold font-headline">
                  {pageTitle}
                </h1>
              </div>
              <UserNav />
            </header>
            <main className="flex-1 overflow-auto p-4 sm:p-6">
              {children}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
