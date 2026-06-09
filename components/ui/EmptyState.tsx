'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { IconType } from 'react-icons';
import { HiOutlineClipboardDocumentList } from 'react-icons/hi2';
import Button from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: IconType;
}

export default function EmptyState({
  title = 'No tasks yet',
  description = 'Get started by creating your first task.',
  actionLabel,
  onAction,
  icon: Icon = HiOutlineClipboardDocumentList,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-5 shadow-inner">
        <Icon size={40} className="text-indigo-400 dark:text-indigo-500" />
      </div>

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
        {title}
      </h3>

      <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mb-6">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction} size="md">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
