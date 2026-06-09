import { ImSpinner8 } from 'react-icons/im';

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-950 z-50">
      <div className="flex flex-col items-center gap-4">
        <ImSpinner8
          className="animate-spin text-indigo-600 dark:text-indigo-400"
          size={36}
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading...</p>
      </div>
    </div>
  );
}
