'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Book, History, Languages, Smile } from 'lucide-react';

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

// NOTE: The authentication guard has been temporarily removed from this layout
// to allow for easier UI previewing. You will be able to see the dashboard,
// but features requiring a user (like profile editing) will be disabled until
// you provide your Firebase credentials in the .env file and sign in.

export default function DashboardLayout({ children }: { children: ReactNode }) {
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
                    children: 'Translate',
                    className: 'bg-primary text-primary-foreground',
                  }}
                >
                  <Link href="/dashboard">
                    <Languages />
                    <span>Translate</span>
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
                    children: 'Emotion Tool',
                    className: 'bg-primary text-primary-foreground',
                  }}
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
                    children: 'History',
                    className: 'bg-primary text-primary-foreground',
                  }}
                >
                  <Link href="/dashboard/history">
                    <History />
                    <span>History</span>
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
                {/* Page titles will be rendered by each page */}
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
