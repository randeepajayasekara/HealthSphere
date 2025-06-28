"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  HomeIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
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

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden
        ${isDark ? "bg-black" : "bg-white"}`}
    >
      {/* Background gradient */}
      <div
        className={`absolute inset-0 ${
          isDark
            ? "bg-gradient-to-br from-black via-zinc-900 to-black"
            : "bg-gradient-to-br from-white via-red-50 to-rose-50"
        }`}
      />

      {/* Floating orbs */}
      <div className={`absolute top-20 left-20 w-32 h-32 rounded-full blur-xl animate-pulse ${
        isDark ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20" : "bg-gradient-to-r from-red-400/20 to-rose-500/20"
      }`} />
      <div className={`absolute bottom-20 right-20 w-40 h-40 rounded-full blur-xl animate-pulse delay-1000 ${
        isDark ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20" : "bg-gradient-to-r from-rose-500/20 to-pink-500/20"
      }`} />
      <div className={`absolute top-1/2 left-10 w-24 h-24 rounded-full blur-xl animate-pulse delay-500 ${
        isDark ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20" : "bg-gradient-to-r from-red-500/20 to-rose-400/20"
      }`} />

      {/* Theme toggle - top right */}
      <div className="absolute top-6 right-6 z-20">
        <ModeToggle />
      </div>

      {/* Web app icon - top left */}
      <div className="absolute top-6 left-6 z-20">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isDark ? "bg-zinc-800 border border-zinc-700" : "bg-white border border-red-200"
          } shadow-lg`}
        >
          <ExclamationTriangleIcon className={`w-6 h-6 ${isDark ? "text-zinc-300" : "text-red-600"}`} />
        </div>
      </div>

      {/* Main content */}
      <div className="z-10 text-center max-w-4xl mx-auto">
        {/* Large 404 with frosted glass effect */}
        <motion.div
          className="relative mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 blur-3xl opacity-30">
            <div
              className={`text-[12rem] md:text-[16rem] font-black ${
                isDark ? "text-blue-400" : "text-red-500"
              }`}
            >
              404
            </div>
          </div>

          {/* Main 404 text with frosted glass */}
          <div
            className={`relative backdrop-blur-md rounded-3xl p-8 ${
              isDark
                ? "bg-transparent"
                : "bg-transparent"
            }`}
          >
            <motion.h1
              className={`text-[8rem] md:text-[12rem] font-black leading-none ${
                isDark ? "text-white" : "text-gray-900"
              }`}
              animate={{
                textShadow: isDark ? [
                  "0 0 20px rgba(59, 130, 246, 0.5)",
                  "0 0 40px rgba(59, 130, 246, 0.3)",
                  "0 0 20px rgba(59, 130, 246, 0.5)",
                ] : [
                  "0 0 20px rgba(239, 68, 68, 0.5)",
                  "0 0 40px rgba(239, 68, 68, 0.3)",
                  "0 0 20px rgba(239, 68, 68, 0.5)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              404
            </motion.h1>
          </div>
        </motion.div>

        {/* Error message */}
        <motion.div
          className={`backdrop-blur-md rounded-2xl p-6 mb-8 ${
            isDark
              ? "bg-zinc-900/30 border border-zinc-700/30"
              : "bg-white/30 border border-red-200/30"
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h2
            className={`text-2xl md:text-3xl font-bold mb-3 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Page Not Found
          </h2>
          <p
            className={`text-base md:text-lg ${
              isDark ? "text-zinc-300" : "text-gray-600"
            }`}
          >
            The page you're looking for doesn't exist or has been moved to another location.
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/"
              className={`px-8 py-4 rounded-xl flex items-center justify-center space-x-3 font-semibold text-white
                shadow-lg hover:shadow-xl transition-all duration-300 min-w-[180px] ${
                isDark 
                  ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                  : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
              }`}
            >
              <HomeIcon className="w-5 h-5" />
              <span>Go Home</span>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button
              onClick={() => window.history.back()}
              className={`px-8 py-4 rounded-xl flex items-center justify-center space-x-3 font-semibold
                shadow-lg hover:shadow-xl transition-all duration-300 min-w-[180px] ${
                isDark
                  ? "bg-transparent hover:bg-zinc-700 text-white border border-red-900"
                  : "bg-red-50 hover:bg-red-100 text-red-800 border border-red-300"
                }`}
            >
              <ArrowPathIcon className="w-5 h-5" />
              <span>Go Back</span>
            </button>
          </motion.div>
        </motion.div>

        {/* Additional help text */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <p className={`text-sm ${isDark ? "text-zinc-400" : "text-gray-500"}`}>
            If you think this is a mistake, please contact support or try refreshing the page.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
