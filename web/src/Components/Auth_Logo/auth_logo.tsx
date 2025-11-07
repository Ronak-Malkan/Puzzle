import { motion } from "framer-motion";
import Logo from "../../Utils/Puzzle_Logo.png";

const Auth_Logo = () => {
   return (
      <div className="flex flex-col items-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <motion.img
            src={Logo}
            alt="Puzzle Logo"
            className="w-16 h-16 mb-4"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ duration: 0.3 }}
          />
          <motion.h1
            className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Puzzle
          </motion.h1>
        </motion.div>
      </div>
   );
};

export default Auth_Logo;