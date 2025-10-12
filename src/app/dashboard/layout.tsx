import React from 'react';
import { Header } from '@/components/header';
import { BottomNav } from '@/components/bottom-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 sm:p-6">{children}</main>
      <BottomNav />
    </div>
  );
}
