import type { ReactNode } from 'react';
import Navbar from '@/components/layout/Navbar';
import { DesktopSidebar } from '@/components/layout/Sidebar';

export const metadata = {
  title: 'Reminders',
  description: 'Manage your task reminders and stay on track',
};

export default function RemindersLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <DesktopSidebar />
      <main className="lg:pl-64 pt-16 min-h-screen">
        <div className="p-6 max-w-screen-xl mx-auto">{children}</div>
      </main>
    </>
  );
}
