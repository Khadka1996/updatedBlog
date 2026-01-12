// src/app/components/SessionLoader.js

"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function SessionLoader() {
  const [dots, setDots] = useState("");

  // Animated Loading Text
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">

      {/* Two Color Chasing Loader */}
      <div className="relative w-20 h-20">
        {/* Blue Circle */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full rounded-full border-[6px]"
          style={{
            borderColor: "#6A9B52",
            borderRightColor: "transparent",
            borderBottomColor: "transparent",
          }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />

        {/* Green Circle */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full rounded-full border-[6px]"
          style={{
            borderColor: "#50A84D",
            borderLeftColor: "transparent",
            borderTopColor: "transparent",
          }}
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      </div>

      {/* Loading Text */}
      <p
        className="mt-5 text-lg font-semibold"
        style={{ color: "#1B4EA3" }}
      >
        Loading{dots}
      </p>
    </div>
  );
}
