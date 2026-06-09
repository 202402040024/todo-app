import Link from 'next/link';
import { MdTaskAlt } from 'react-icons/md';
import {
  HiOutlineShieldCheck,
  HiOutlineBolt,
  HiOutlineChartBarSquare,
  HiOutlineDevicePhoneMobile,
} from 'react-icons/hi2';

export const metadata = {
  title: 'TO_DO_LIST_APP — Modern Workflow OS',
  description: 'TO_DO_LIST_APP is a premium task management platform with smart reminders, analytics, and collaboration tools.',
};

const features = [
  {
    icon: HiOutlineShieldCheck,
    title: 'Secure Authentication',
    description: 'JWT-based auth with HTTP-only cookies and bcrypt password hashing.',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
  },
  {
    icon: HiOutlineBolt,
    title: 'Fast & Responsive',
    description: 'Built with Next.js App Router for lightning-fast performance.',
    color: 'text-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
  },
  {
    icon: HiOutlineChartBarSquare,
    title: 'Analytics Dashboard',
    description: 'Visual task distribution, completion stats, and upcoming deadlines.',
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
  },
  {
    icon: HiOutlineDevicePhoneMobile,
    title: 'Mobile Friendly',
    description: 'Fully responsive design that works beautifully on all devices.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col">
      {/* Navbar */}
      <nav className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <MdTaskAlt className="text-white" size={20} />
          </div>
          <span className="font-bold text-xl text-gray-900 dark:text-white">TO_DO_LIST_APP</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-md hover:shadow-indigo-500/30 transition-all"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-full text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Production-Ready Full-Stack App
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 dark:text-white mb-5 leading-tight">
          Manage Tasks{' '}
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Effortlessly
          </span>
        </h1>

        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mb-8 leading-relaxed">
          TaskFlow is a modern, full-featured task management app with authentication,
          analytics, filtering, and a beautiful UI — ready for production.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/register"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all text-sm"
          >
            Start for Free →
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold rounded-xl shadow-sm transition-all text-sm"
          >
            Sign In
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16 max-w-5xl w-full">
          {features.map(({ icon: Icon, title, description, color, bg }) => (
            <div
              key={title}
              className="bg-white/80 dark:bg-gray-800/60 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-2xl p-5 text-left hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={20} className={color} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                {title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-400 dark:text-gray-600 border-t border-gray-200 dark:border-gray-800">
        Built with Next.js 15, MongoDB Atlas &amp; Tailwind CSS
      </footer>
    </div>
  );
}
