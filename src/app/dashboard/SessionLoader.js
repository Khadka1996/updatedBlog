'use client';

import { motion } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';

const SessionLoader = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-transparent">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center relative"
      >
        {/* Glow pulse background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-28 h-28 rounded-full bg-indigo-500 opacity-30 animate-ping" />
        </div>

        {/* Spinner */}
        <CircularProgress size={70} thickness={5} style={{ color: '#6366F1' }} />

        {/* Animated text */}
        <motion.p
          className="mt-5 text-gray-700 font-medium text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          Loading..
        </motion.p>
      </motion.div>
    </div>
  );
};

export default SessionLoader;
