'use client';

import type { IconType } from 'react-icons';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Link from 'next/link';

function AnimatedCounter({ target, duration = 1000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }
    const step = Math.ceil(target / (duration / 16));
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(current);
      if (current >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{count}</span>;
}

interface StatsCardProps {
  title: string;
  value: number;
  icon: IconType;
  gradient: string;
  description: string;
  percentage?: number;
  delay?: number;
  /** If provided, the card becomes a clickable link */
  href?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  gradient,
  description,
  percentage,
  delay = 0,
  href,
}: StatsCardProps) {
  const cardContent = (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
        >
          <Icon size={22} className="text-white" />
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
            <AnimatedCounter target={value} />
          </p>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>

        {percentage !== undefined && (
          <div
            className={`text-sm font-semibold px-2.5 py-1 rounded-full ${
              percentage >= 75
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                : percentage >= 50
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            {percentage}%
          </div>
        )}
      </div>

      {percentage !== undefined && (
        <div className="mt-3 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ delay: delay + 0.4, duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
          />
        </div>
      )}

      {href && (
        <p className="mt-3 text-xs font-medium text-indigo-500 dark:text-indigo-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          View tasks →
        </p>
      )}
    </>
  );

  const sharedClasses =
    `group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm transition-all duration-300 ` +
    (href
      ? 'hover:shadow-lg hover:shadow-gray-200/60 dark:hover:shadow-gray-900/60 hover:-translate-y-0.5 hover:border-indigo-300 dark:hover:border-indigo-600 cursor-pointer'
      : 'hover:shadow-lg hover:shadow-gray-200/60 dark:hover:shadow-gray-900/60 cursor-default');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      {href ? (
        <Link href={href} className={`block ${sharedClasses}`}>
          {cardContent}
        </Link>
      ) : (
        <div className={sharedClasses}>{cardContent}</div>
      )}
    </motion.div>
  );
}
