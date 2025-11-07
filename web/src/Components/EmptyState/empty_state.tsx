import React from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-6"
    >
      {icon && (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="mb-6 text-gray-400 dark:text-gray-600"
        >
          {icon}
        </motion.div>
      )}

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2"
      >
        {title}
      </motion.h3>

      {description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="text-gray-600 dark:text-gray-400 max-w-md mb-6"
        >
          {description}
        </motion.p>
      )}

      {action && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyState;
