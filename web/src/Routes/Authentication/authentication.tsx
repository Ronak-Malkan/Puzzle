import React from "react";
import { motion } from "framer-motion";
import AuthLogo from "@components/Auth_Logo/auth_logo";
import AuthForm from "@components/Auth_Form/auth_form";

const Authentication: React.FC = () => {
   return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 backdrop-blur-lg bg-opacity-90 dark:bg-opacity-90 border border-gray-200 dark:border-gray-700">
            <AuthLogo />
            <AuthForm />
          </div>
        </motion.div>
      </div>
   );
};

export default Authentication;