"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import Image from "next/image";
import {
  Menu,
  X,
  Globe,
  ChevronDown,
  Home,
  MessageSquareQuote,
  MessageSquareShare,
  Compass,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function GlobalHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const isRootPage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        isScrolled
          ? "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative w-40 h-auto mr-2">
              <Image
                src="https://i.postimg.cc/DwF2fbHb/hashedlogo.png"
                alt="HealthSphere"
                width={500}
                height={250}
                priority
                className="object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {/* Back to home button - only shown when not on root page */}
            <AnimatePresence>
              {!isRootPage && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={variants}
                  transition={{ duration: 0.3 }}
                >
                  <Link
                    href="/"
                    className="flex items-center px-4 py-2 rounded-md text-sm font-medium text-red-200 dark:text-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Home className="w-4 h-4 mr-1" />
                    Home
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
            <Link
              href="/forum"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/services"
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800/60"
              }`}
            >
              Connect
            </Link>
            <Link
              href="/blog"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/about"
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800/60"
              }`}
            >
              Blog
            </Link>
            <Link
              href="/guide"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/about"
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800/60"
              }`}
            >
              Guide
            </Link>

            {/* Language Dropdown */}
            <div className="ml-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-1">
                    <Globe className="h-4 w-4" />
                    <span>EN</span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-40 animate-in fade-in-80 zoom-in-95"
                >
                  <DropdownMenuItem>English</DropdownMenuItem>
                  <DropdownMenuItem>සිංහල</DropdownMenuItem>
                  <DropdownMenuItem>தமிழ்</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Auth Buttons */}
            <Link href="/login">
              <Button variant="ghost" size="sm" className="ml-2">
                Log In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="ml-2">
                Register
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isMobileMenuOpen ? "close" : "menu"}
                  initial={{ opacity: 0, rotate: isMobileMenuOpen ? -90 : 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: isMobileMenuOpen ? 90 : -90 }}
                  transition={{ duration: 0.3 }}
                >
                  {isMobileMenuOpen ? <X /> : <Menu />}
                </motion.div>
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dialog */}
      <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <DialogContent
          className="sm:max-w-full h-[80vh] p-0 bg-white/90 dark:bg-zinc-900/80 backdrop-blur-lg border-none"
          showCloseButton={false}
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">Mobile Navigation Menu</DialogTitle>
          <div className="flex flex-col space-y-4 p-6">
            <div className="flex justify-between items-center mb-6">
              <Link
                href="/"
                className="flex items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="relative w-36 h-auto mr-2">
                  <Image
                    src="https://i.postimg.cc/DwF2fbHb/hashedlogo.png"
                    alt="HealthSphere"
                    width={192}
                    height={48}
                    priority
                    className="object-contain"
                  />
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X />
              </Button>
            </div>

            <nav className="flex flex-col space-y-2">
              <Link
                href="/"
                className={`flex items-center px-4 py-3 rounded-md text-base font-medium transition-colors ${
                  pathname === "/"
                    ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="w-5 h-5 mr-3" />
                Home
              </Link>
              <Link
                href="/forum"
                className={`flex items-center px-4 py-3 rounded-md text-base font-medium transition-colors ${
                  pathname === "/forum"
                    ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MessageSquareShare className="w-5 h-5 mr-3" />
                Connect
              </Link>
              <Link
                href="/blog"
                className={`flex items-center px-4 py-3 rounded-md text-base font-medium transition-colors ${
                  pathname === "/blog"
                    ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MessageSquareQuote className="w-5 h-5 mr-3" />
                Blog
              </Link>
              <Link
                href="/guide"
                className={`flex items-center px-4 py-3 rounded-md text-base font-medium transition-colors ${
                  pathname === "/guide"
                    ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Compass className="w-5 h-5 mr-3" />
                Guide
              </Link>
            </nav>

            {/* Language Selector in Mobile Menu */}
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Language
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="justify-start" size="sm">
                  <Globe className="w-4 h-4 mr-2" /> English
                </Button>
                <Button variant="ghost" className="justify-start" size="sm">
                  <Globe className="w-4 h-4 mr-2" /> සිංහල
                </Button>
                <Button variant="ghost" className="justify-start" size="sm">
                  <Globe className="w-4 h-4 mr-2" /> தமிழ்
                </Button>
              </div>
            </div>

            {/* Auth Buttons in Mobile Menu */}
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col space-y-3">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Log In
                </Button>
              </Link>
              <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full">Register</Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
