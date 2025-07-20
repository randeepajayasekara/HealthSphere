"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LogOut, 
  Shield, 
  QrCode, 
  Clock, 
  Settings,
  Bell,
  Activity,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/app/contexts/auth-context';
import { ModeToggle } from '@/app/components/features/toggles/theme-toggle';
import { generateTOTPCode, createUMIDVisibilityManager } from '@/app/utils/umid';
import { decryptData } from '@/app/utils/security';
import type { User, UniversalMedicalID } from '@/app/types';

interface DashboardHeaderProps {
  user: User | null;
  umid: UniversalMedicalID | null;
  isLoading: boolean;
}

export function DashboardHeader({ user, umid, isLoading }: DashboardHeaderProps) {
  const { logout } = useAuth();
  const [currentTOTP, setCurrentTOTP] = useState<string>('000000');
  const [totpTimeLeft, setTotpTimeLeft] = useState<number>(30);
  const [showUMIDDetails, setShowUMIDDetails] = useState(false);
  const [isUMIDVisible, setIsUMIDVisible] = useState(true);
  const [notifications] = useState(3); // Mock notification count

  // TOTP Generation and Timer
  useEffect(() => {
    if (!umid?.secretKey) return;

    const updateTOTP = () => {
      try {
        const decryptedSecret = decryptData(umid.secretKey);
        const totp = generateTOTPCode(decryptedSecret);
        setCurrentTOTP(totp);
        
        // Calculate time remaining in current 30-second window
        const now = Math.floor(Date.now() / 1000);
        const timeLeft = 30 - (now % 30);
        setTotpTimeLeft(timeLeft);
      } catch (error) {
        console.error('TOTP generation failed:', error);
      }
    };

    updateTOTP();
    const interval = setInterval(updateTOTP, 1000);

    return () => clearInterval(interval);
  }, [umid]);

  // UMID Visibility Management
  useEffect(() => {
    const visibilityManager = createUMIDVisibilityManager();
    
    const cleanup = visibilityManager.startMonitoring((isVisible) => {
      setIsUMIDVisible(isVisible);
    });

    return cleanup;
  }, []);

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getUMIDStatusColor = () => {
    if (!umid) return 'bg-gray-500';
    if (!umid.isActive) return 'bg-red-500';
    return 'bg-green-500';
  };

  const getUMIDStatusText = () => {
    if (!umid) return 'No UMID';
    if (!umid.isActive) return 'Inactive';
    return 'Active';
  };

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 w-full border-b bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - User Info */}
          <div className="flex items-center space-x-4">
            <Avatar className="w-10 h-10 ring-2 ring-red-200 dark:ring-red-800">
              <AvatarImage src={user?.profileImageUrl} />
              <AvatarFallback className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Welcome back, {user?.firstName}
              </h1>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{formatTime()}</span>
                <span>•</span>
                <span>Patient Dashboard</span>
              </div>
            </div>
          </div>

          {/* Center Section - UMID Status */}
          <AnimatePresence>
            {umid && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="hidden md:flex items-center space-x-4"
              >
                {/* UMID Status Indicator */}
                <motion.div
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setShowUMIDDetails(!showUMIDDetails)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getUMIDStatusColor()}`} />
                    <Shield className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium">UMID</span>
                    <Badge variant="secondary" className="text-xs">
                      {getUMIDStatusText()}
                    </Badge>
                  </div>
                </motion.div>

                {/* TOTP Display */}
                <motion.div
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border"
                  style={{ 
                    filter: isUMIDVisible ? 'none' : 'blur(4px)',
                    transition: 'filter 0.3s ease'
                  }}
                >
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-mono text-sm font-bold">
                    {currentTOTP}
                  </span>
                  <div className="w-8 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-600"
                      initial={{ width: '100%' }}
                      animate={{ width: `${(totpTimeLeft / 30) * 100}%` }}
                      transition={{ duration: 1, ease: "linear" }}
                    />
                  </div>
                </motion.div>

                {/* Quick Actions */}
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsUMIDVisible(!isUMIDVisible)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {isUMIDVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <QrCode className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-2">
            {/* Loading Indicator */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center space-x-2 text-muted-foreground"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Syncing...</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative text-muted-foreground hover:text-foreground"
            >
              <Bell className="w-4 h-4" />
              {notifications > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
                >
                  {notifications}
                </Badge>
              )}
            </Button>

            {/* Health Status */}
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <Activity className="w-4 h-4" />
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-4 h-4" />
            </Button>

            {/* Theme Toggle */}
            <ModeToggle />

            {/* Logout */}
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="bg-white dark:bg-zinc-900"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* UMID Details Dropdown */}
        <AnimatePresence>
          {showUMIDDetails && umid && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border"
              style={{ 
                filter: isUMIDVisible ? 'none' : 'blur(2px)',
                transition: 'filter 0.3s ease'
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">UMID Number:</span>
                  <p className="font-mono font-medium">{umid.umidNumber}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Issued:</span>
                  <p className="font-medium">{umid.issueDate ? umid.issueDate.toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Access:</span>
                  <p className="font-medium">
                    {umid.lastAccessDate ? umid.lastAccessDate.toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
