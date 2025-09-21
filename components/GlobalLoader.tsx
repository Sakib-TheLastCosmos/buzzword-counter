"use client";

import { motion } from "framer-motion";
import { useLoader } from "../context/LoaderContext";

export default function GlobalLoader() {
  const { isLoading } = useLoader();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
      {/* Animated Dots */}
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: "var(--color-primary)" }}
            animate={{ y: [0, -10, 0] }}
            transition={{
              repeat: Infinity,
              duration: 0.6,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
        className="mt-6 text-lg font-medium tracking-wide"
        style={{ color: "var(--color-foreground)" }}
      >
        Loading...
      </motion.p>
    </div>
  );
}
