"use client";

import React, { useState } from "react";
import { User } from "@/app/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Key, 
  Smartphone, 
  History, 
  AlertTriangle, 
  Check, 
  X,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Clock,
  MapPin
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface SecuritySectionProps {
  user: User;
}

export function SecuritySection({ user }: SecuritySectionProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: user.twoFactorEnabled || false,
    emailNotifications: true,
    loginAlerts: true,
    sessionTimeout: 60, // minutes
  });

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsChangingPassword(true);
    try {
      // Implement password change logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Password changed successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error("Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSecuritySettingChange = (setting: string, value: boolean) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: value,
    }));
    toast.success(`${setting} ${value ? "enabled" : "disabled"}`);
  };

  const mockLoginHistory = [
    {
      id: "1",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      location: "New York, NY",
      device: "Chrome on Windows",
      ipAddress: "192.168.1.1",
      success: true,
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      location: "New York, NY",
      device: "Mobile Safari on iPhone",
      ipAddress: "192.168.1.2",
      success: true,
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      location: "Unknown Location",
      device: "Chrome on Windows",
      ipAddress: "203.0.113.1",
      success: false,
    },
  ];

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength < 3) return { level: "weak", color: "text-red-500", bgColor: "bg-red-500" };
    if (strength < 4) return { level: "medium", color: "text-yellow-500", bgColor: "bg-yellow-500" };
    return { level: "strong", color: "text-green-500", bgColor: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  return (
    <div className="space-y-6">
      {/* Password Management */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-lg">Password</CardTitle>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Change your password to keep your account secure
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="pr-10 border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-400"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 text-zinc-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-zinc-400" />
                  )}
                </Button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="pr-10 border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-400"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-zinc-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-zinc-400" />
                  )}
                </Button>
              </div>
              
              {/* Password Strength Indicator */}
              {passwordForm.newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.bgColor}`}
                        style={{ width: `${(getPasswordStrength(passwordForm.newPassword).level === 'weak' ? 33 : getPasswordStrength(passwordForm.newPassword).level === 'medium' ? 66 : 100)}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${passwordStrength.color}`}>
                      {passwordStrength.level.charAt(0).toUpperCase() + passwordStrength.level.slice(1)}
                    </span>
                  </div>
                  
                  <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                    <div className="grid grid-cols-2 gap-2">
                      <div className={cn("flex items-center space-x-1", passwordForm.newPassword.length >= 8 ? "text-green-600 dark:text-green-400" : "text-zinc-400")}>
                        {passwordForm.newPassword.length >= 8 ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        <span>8+ characters</span>
                      </div>
                      <div className={cn("flex items-center space-x-1", /[A-Z]/.test(passwordForm.newPassword) ? "text-green-600 dark:text-green-400" : "text-zinc-400")}>
                        {/[A-Z]/.test(passwordForm.newPassword) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        <span>Uppercase</span>
                      </div>
                      <div className={cn("flex items-center space-x-1", /[a-z]/.test(passwordForm.newPassword) ? "text-green-600 dark:text-green-400" : "text-zinc-400")}>
                        {/[a-z]/.test(passwordForm.newPassword) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        <span>Lowercase</span>
                      </div>
                      <div className={cn("flex items-center space-x-1", /[0-9]/.test(passwordForm.newPassword) ? "text-green-600 dark:text-green-400" : "text-zinc-400")}>
                        {/[0-9]/.test(passwordForm.newPassword) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        <span>Number</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="pr-10 border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-400"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-zinc-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-zinc-400" />
                  )}
                </Button>
              </div>
              
              {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                <p className="text-xs text-red-600 dark:text-red-400 flex items-center space-x-1">
                  <X className="w-3 h-3" />
                  <span>Passwords do not match</span>
                </p>
              )}
            </div>

            <Button
              onClick={handlePasswordChange}
              disabled={
                !passwordForm.currentPassword || 
                !passwordForm.newPassword || 
                !passwordForm.confirmPassword ||
                passwordForm.newPassword !== passwordForm.confirmPassword ||
                isChangingPassword
              }
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600"
            >
              {isChangingPassword ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Key className="w-4 h-4 mr-2" />
              )}
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-lg">Two-Factor Authentication</CardTitle>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Add an extra layer of security to your account
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                securitySettings.twoFactorEnabled 
                  ? "bg-green-100 dark:bg-green-900/20" 
                  : "bg-zinc-100 dark:bg-zinc-800"
              )}>
                {securitySettings.twoFactorEnabled ? (
                  <Lock className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <Unlock className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                )}
              </div>
              
              <div>
                <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                  Authenticator App
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {securitySettings.twoFactorEnabled 
                    ? "Your account is protected with 2FA" 
                    : "Use an app like Google Authenticator"
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {securitySettings.twoFactorEnabled && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  Active
                </Badge>
              )}
              
              <Switch
                checked={securitySettings.twoFactorEnabled}
                onCheckedChange={(checked) => handleSecuritySettingChange("twoFactorEnabled", checked)}
              />
            </div>
          </div>

          {!securitySettings.twoFactorEnabled && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Enable Two-Factor Authentication
                  </h4>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    2FA significantly improves your account security by requiring a second form of verification.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300"
                    onClick={() => handleSecuritySettingChange("twoFactorEnabled", true)}
                  >
                    Set Up 2FA
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-lg">Security Preferences</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-zinc-900 dark:text-zinc-100">Email Notifications</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Receive security alerts via email
                </p>
              </div>
              <Switch
                checked={securitySettings.emailNotifications}
                onCheckedChange={(checked) => handleSecuritySettingChange("emailNotifications", checked)}
              />
            </div>
            
            <Separator className="bg-zinc-200 dark:bg-zinc-800" />
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-zinc-900 dark:text-zinc-100">Login Alerts</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Get notified of new sign-ins to your account
                </p>
              </div>
              <Switch
                checked={securitySettings.loginAlerts}
                onCheckedChange={(checked) => handleSecuritySettingChange("loginAlerts", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-lg">Recent Login Activity</CardTitle>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Monitor recent access to your account
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {mockLoginHistory.map((login, index) => (
              <div key={login.id} className="flex items-center justify-between p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    login.success 
                      ? "bg-green-100 dark:bg-green-900/20" 
                      : "bg-red-100 dark:bg-red-900/20"
                  )}>
                    {login.success ? (
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {login.device}
                      </span>
                      {!login.success && (
                        <Badge variant="destructive" className="text-xs">
                          Failed
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{format(login.timestamp, "MMM d, yyyy 'at' h:mm a")}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{login.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {login.ipAddress}
                </div>
              </div>
            ))}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-4 border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300"
          >
            View All Activity
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
