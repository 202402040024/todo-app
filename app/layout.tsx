import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from '@/hooks/useAuth';
import { CategoryProvider } from '@/contexts/CategoryContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: {
    default: 'TO_DO_LIST_APP — Premium Workflow OS',
    template: '%s | TO_DO_LIST_APP',
  },
  description:
    'TO_DO_LIST_APP is an enterprise-grade task management platform with reminders, calendar, analytics, and team workflows.',
  keywords: ['TO_DO_LIST_APP', 'task management', 'productivity', 'nextjs', 'SaaS'],
  authors: [{ name: 'TO_DO_LIST_APP' }],
  openGraph: {
    title: 'TO_DO_LIST_APP — Premium Workflow OS',
    description: 'Manage work, reminders, and projects with TO_DO_LIST_APP.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <CategoryProvider>
              <NotificationProvider>
                {children}
                <ToastContainer
                  position="top-right"
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop
                  closeOnClick
                  pauseOnHover
                  draggable
                  theme="colored"
                  toastClassName="rounded-xl shadow-lg text-sm font-medium"
                />
              </NotificationProvider>
            </CategoryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
