import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  variant?: 'page-item' | 'block' | 'card';
  count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ variant = 'page-item', count = 3 }) => {
  const renderPageItemSkeleton = () => (
    <div className="flex items-center gap-2 px-3 py-2 mx-2 rounded">
      <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
      <div className="flex-1 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
    </div>
  );

  const renderBlockSkeleton = () => (
    <div className="flex gap-2 py-2">
      <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
      </div>
    </div>
  );

  const renderCardSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6" />
      </div>
    </div>
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'page-item':
        return renderPageItemSkeleton();
      case 'block':
        return renderBlockSkeleton();
      case 'card':
        return renderCardSkeleton();
      default:
        return renderPageItemSkeleton();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </motion.div>
  );
};

export default LoadingSkeleton;
