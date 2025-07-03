"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  QrCode, 
  Lock, 
  Globe, 
  Clock, 
  X,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

interface UMIDPromptProps {
  onCreateUMID: () => void;
  onDismiss: () => void;
}

export function UMIDPrompt({ onCreateUMID, onDismiss }: UMIDPromptProps) {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateUMID = async () => {
    setIsCreating(true);
    try {
      await onCreateUMID();
    } catch (error) {
      console.error('Failed to create UMID:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const features = [
    {
      icon: QrCode,
      title: "QR Code Access",
      description: "Quick access to your medical information via secure QR code",
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: Lock,
      title: "TOTP Security",
      description: "Two-factor authentication with time-based one-time passwords",
      color: "text-green-600 dark:text-green-400"
    },
    {
      icon: Globe,
      title: "Universal Access",
      description: "Access your medical data anywhere, anytime securely",
      color: "text-purple-600 dark:text-purple-400"
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Your medical information is always up-to-date",
      color: "text-orange-600 dark:text-orange-400"
    }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-full max-w-2xl my-8 min-h-0"
        >
          <Card className="relative border-red-200 dark:border-red-800 shadow-2xl mx-4 my-4">
            <div className="absolute top-4 right-4 z-10">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onDismiss}
                className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <CardHeader className="text-center pb-4 px-4 sm:px-6">
              <div className="mx-auto mb-4 p-3 bg-red-50 dark:bg-red-950/30 rounded-full w-fit">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold">
                Create Your Universal Medical ID
              </CardTitle>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                Secure your medical information with a digital identity that you control
              </p>
            </CardHeader>

            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-6">
              {/* Alert about importance */}
              <div className="flex items-start space-x-3 p-3 sm:p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-amber-800 dark:text-amber-200 text-sm sm:text-base">
                    Important: Create Your UMID
                  </h4>
                  <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 mt-1 leading-relaxed">
                    Your UMID is essential for secure access to medical services and emergency situations. 
                    It provides healthcare providers with instant access to your critical medical information.
                  </p>
                </div>
              </div>

              {/* Features grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3 p-3 sm:p-4 rounded-lg border bg-white dark:bg-zinc-900/50"
                  >
                    <div className={`p-1.5 sm:p-2 rounded-md bg-gray-50 dark:bg-zinc-800 flex-shrink-0`}>
                      <feature.icon className={`w-3 h-3 sm:w-4 sm:h-4 ${feature.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm sm:text-base">
                        {feature.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Security notice */}
              <div className="flex items-start space-x-3 p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 text-sm sm:text-base">
                    Your Privacy is Protected
                  </h4>
                  <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mt-1 leading-relaxed">
                    All medical data is encrypted and only accessible with your authentication. 
                    You maintain full control over who can access your information.
                  </p>
                </div>
              </div>

              {/* Benefits */}
              <div className="pt-2 sm:pt-4 border-t">
                <h5 className="font-medium text-sm mb-3">What you get with UMID:</h5>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Emergency Access
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Secure QR Codes
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Multi-factor Auth
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Global Recognition
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Real-time Sync
                  </Badge>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  onClick={handleCreateUMID}
                  disabled={isCreating}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white h-11"
                >
                  {isCreating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2"
                      >
                        <Shield className="w-4 h-4" />
                      </motion.div>
                      Creating Your UMID...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Create My UMID
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onDismiss}
                  className="sm:w-auto h-11"
                  disabled={isCreating}
                >
                  Maybe Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
