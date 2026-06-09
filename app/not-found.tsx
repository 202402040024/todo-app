import Link from 'next/link';
import { HiOutlineHome, HiOutlineExclamationCircle } from 'react-icons/hi2';

export const metadata = {
  title: '404 — Page Not Found',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-6 text-center">
      <div className="w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-6">
        <HiOutlineExclamationCircle
          size={44}
          className="text-indigo-400 dark:text-indigo-500"
        />
      </div>

      <h1 className="text-6xl font-extrabold text-gray-900 dark:text-white mb-2">
        404
      </h1>
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Page Not Found
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-md hover:shadow-indigo-500/30 transition-all"
      >
        <HiOutlineHome size={16} />
        Go to Dashboard
      </Link>
    </div>
  );
}
