"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { 
  LayoutDashboard, 
  Calendar, 
  Video, 
  FileText, 
  ClipboardList, 
  FlaskConical, 
  CreditCard, 
  MessageSquare, 
  User, 
  Users, 
  UsersRound, 
  Clock, 
  HeartPulse, 
  Pill, 
  Building, 
  Building2, 
  BarChart, 
  Settings, 
  History, 
  ClipboardCheck, 
  Laptop, 
  Box, 
  ShoppingCart, 
  TestTube, 
  Banknote, 
  LineChart, 
  File, 
  ListChecks,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { dashboardRoutes, RouteWithChildren, type UserRole } from '@/app/types/routes'
import { useAuth } from '@/app/contexts/auth-context'

// Icon mapping
const iconMap = {
  'layout-dashboard': LayoutDashboard,
  'calendar': Calendar,
  'video': Video,
  'file-text': FileText,
  'clipboard-list': ClipboardList,
  'flask-conical': FlaskConical,
  'credit-card': CreditCard,
  'message-square': MessageSquare,
  'user': User,
  'users': Users,
  'users-round': UsersRound,
  'clock': Clock,
  'heart-pulse': HeartPulse,
  'pill': Pill,
  'building': Building,
  'building-2': Building2,
  'bar-chart': BarChart,
  'settings': Settings,
  'history': History,
  'clipboard-check': ClipboardCheck,
  'laptop': Laptop,
  'box': Box,
  'shopping-cart': ShoppingCart,
  'test-tube': TestTube,
  'banknote': Banknote,
  'line-chart': LineChart,
  'file': File,
  'list-checks': ListChecks,
}

interface DashboardSidebarProps {
  className?: string
}

interface SidebarContentProps {
  isCollapsed?: boolean
  onNavigate?: () => void
}

function SidebarContent({ isCollapsed = false, onNavigate }: SidebarContentProps) {
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()

  // Don't render if user is not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const routes = dashboardRoutes[user.role] || []

  const isActiveRoute = (routePath: string) => {
    if (routePath === '/dashboard' && pathname === '/dashboard') return true
    if (routePath !== '/dashboard' && pathname.startsWith(routePath)) return true
    return false
  }

  const renderNavItem = (route: RouteWithChildren, level: number = 0) => {
    const Icon = route.icon ? iconMap[route.icon as keyof typeof iconMap] : LayoutDashboard
    const isActive = isActiveRoute(route.path)
    const hasChildren = route.children && route.children.length > 0

    return (
      <div key={route.path} className={cn("w-full", level > 0 && "ml-4")}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <Link
            href={route.path}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
              "hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50",
              "dark:hover:from-blue-950/30 dark:hover:to-purple-950/30",
              "group relative overflow-hidden",
              isActive && [
                "bg-gradient-to-r from-blue-500/10 to-purple-500/10",
                "dark:from-blue-400/10 dark:to-purple-400/10",
                "text-blue-600 dark:text-blue-400",
                "shadow-sm border border-blue-200/50 dark:border-blue-800/50"
              ],
              !isActive && "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100",
              isCollapsed && "justify-center px-2"
            )}
          >
            {/* Glow effect for active items */}
            {isActive && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
            
            <Icon className={cn(
              "shrink-0 transition-all duration-300",
              isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400",
              isCollapsed ? "w-5 h-5" : "w-4 h-4"
            )} />
            
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="truncate"
                >
                  {route.name}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Active indicator */}
            {isActive && !isCollapsed && (
              <motion.div
                className="absolute right-2 w-1.5 h-1.5 bg-blue-500 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
              />
            )}
          </Link>
        </motion.div>

        {/* Children routes */}
        <AnimatePresence>
          {hasChildren && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-1 space-y-1"
            >
              {route.children?.map((child) => renderNavItem(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-6 border-b border-gray-200 dark:border-gray-800",
        isCollapsed && "px-2 justify-center"
      )}>
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">H</span>
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HealthSphere
              </h1>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {routes.map((route) => renderNavItem(route))}
      </nav>

      {/* User section */}
      <div className={cn(
        "px-4 py-4 border-t border-gray-200 dark:border-gray-800",
        isCollapsed && "px-2"
      )}>
        <div className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer",
          isCollapsed && "justify-center px-2"
        )}>
          <Avatar className={cn(
            "transition-all duration-300",
            isCollapsed ? "w-8 h-8" : "w-8 h-8"
          )}>
            <AvatarImage 
              src={user.profileImageUrl} 
              alt={`${user.firstName} ${user.lastName}`}
            />
            <AvatarFallback className="bg-gradient-to-br from-green-400 to-emerald-500 text-white text-sm font-medium">
              {user.firstName[0]?.toUpperCase()}{user.lastName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col min-w-0 flex-1"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user.firstName} {user.lastName}
                  </span>
                  {user.isActive && (
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                  )}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// Desktop Sidebar Component
function DesktopSidebar() {
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  return (
    <motion.div
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "fixed left-4 top-4 bottom-4 z-40 transition-all duration-300",
        "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl",
        "border border-gray-200 dark:border-gray-800",
        "rounded-2xl shadow-xl",
        "before:absolute before:inset-0 before:rounded-2xl",
        "before:bg-gradient-to-br before:from-white/50 before:to-white/20",
        "before:dark:from-gray-800/50 before:dark:to-gray-900/20",
        "before:pointer-events-none before:z-[-1]",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "absolute -right-3 top-6 z-50 w-6 h-6 rounded-full",
          "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
          "shadow-lg hover:shadow-xl transition-all duration-200",
          "hover:scale-110"
        )}
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </Button>

      <SidebarContent isCollapsed={isCollapsed} />
    </motion.div>
  )
}

// Mobile Sidebar Component
function MobileSidebar() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <>
      {/* Mobile trigger button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed top-4 left-4 z-50 md:hidden",
          "w-10 h-10 rounded-xl",
          "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl",
          "border border-gray-200 dark:border-gray-800",
          "shadow-lg hover:shadow-xl transition-all duration-200"
        )}
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Mobile Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="left"
          className={cn(
            "p-0 w-72 border-none",
            "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl",
            "shadow-2xl"
          )}
        >
          <SidebarContent onNavigate={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}

// Main Dashboard Sidebar Component
export default function DashboardSidebar({ className }: DashboardSidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <DesktopSidebar />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar />
    </>
  )
}