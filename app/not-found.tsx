"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaceFrownIcon,
  HomeIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { ModeToggle } from "./components/features/toggles/theme-toggle";

export default function NotFound() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  const particles = Array.from({ length: 20 }, (_, i) => i);

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-4 text-center relative overflow-hidden
            ${isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}
    >
      {/* Animated background particles */}
      {particles.map((i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${
            isDark ? "bg-blue-500" : "bg-indigo-400"
          } opacity-20`}
          initial={{
            x: Math.random() * 100 - 50 + "%",
            y: Math.random() * 100 - 50 + "%",
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            x: [
              Math.random() * 100 - 50 + "%",
              Math.random() * 100 - 50 + "%",
              Math.random() * 100 - 50 + "%",
            ],
            y: [
              Math.random() * 100 - 50 + "%",
              Math.random() * 100 - 50 + "%",
              Math.random() * 100 - 50 + "%",
            ],
          }}
          transition={{
            duration: 15 + Math.random() * 15,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            width: `${Math.random() * 10 + 5}px`,
            height: `${Math.random() * 10 + 5}px`,
          }}
        />
      ))}

      {/* Main content */}
      <motion.div
        className="z-10 backdrop-blur-sm bg-opacity-80 rounded-2xl p-10 shadow-xl max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          backgroundColor: isDark
            ? "rgba(17, 24, 39, 0.7)"
            : "rgba(255, 255, 255, 0.7)",
          borderColor: isDark
            ? "rgba(59, 130, 246, 0.2)"
            : "rgba(99, 102, 241, 0.2)",
          borderWidth: "1px",
        }}
      >
        <motion.div
          animate={{
            rotateZ: [0, 5, 0, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          <FaceFrownIcon
            className={`w-20 h-20 mx-auto mb-6 ${
              isDark ? "text-blue-400" : "text-indigo-500"
            }`}
          />
        </motion.div>

        <motion.h1
          className="text-4xl font-bold mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          404 - Page Not Found
        </motion.h1>

        <motion.p
          className={`text-lg mb-8 ${
            isDark ? "text-gray-300" : "text-gray-600"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          We're sorry, the page you are looking for does not exist or has been
          moved.
        </motion.p>

        <ModeToggle />

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Link
              href="/"
              className={`px-6 py-3 rounded-md flex items-center justify-center space-x-2
                                ${
                                  isDark
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : "bg-indigo-600 hover:bg-indigo-700"
                                }
                                text-white transition-colors w-full`}
            >
              <HomeIcon className="w-5 h-5" />
              <span>Return Home</span>
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <button
              onClick={() => window.history.back()}
              className={`px-6 py-3 rounded-md flex items-center justify-center space-x-2 w-full
                                ${
                                  isDark
                                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                                } transition-colors`}
            >
              <ArrowPathIcon className="w-5 h-5" />
              <span>Go Back</span>
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
