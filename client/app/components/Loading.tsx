'use client';

import { motion } from 'framer-motion';
import Logo from './Logo';

interface LoadingProps {
  size?: number;
  message?: string;
}

const Loading = ({ size = 60, message = 'Loading...' }: LoadingProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
      <motion.div
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <Logo size={size} />
      </motion.div>
      <motion.p
        className="text-gray-400 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {message}
      </motion.p>
    </div>
  );
};

export default Loading; 