"use client";

import React, { useState } from "react";
import { User } from "@/app/types";
import { useProfile } from "@/app/contexts/profile-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Bell, 
  Mail, 
  MessageSquare, 
  Moon, 
  Sun, 
  Monitor,
  Globe,
  Clock,
  Palette,
  Volume2,
  VolumeOff,
  Smartphone,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface PreferencesSectionProps {
  user: User;
}

export function PreferencesSection({ user }: PreferencesSectionProps) {
  const { updatePreferences, isLoading, profileData } = useProfile();
  const [preferences, setPreferences] = useState({
    theme: profileData?.preferences?.theme || "system",
    language: profileData?.preferences?.language || "en",
    notifications: profileData?.preferences?.notifications ?? true,
    emailNotifications: profileData?.preferences?.emailNotifications ?? true,
    smsNotifications: profileData?.preferences?.smsNotifications ?? false,
    pushNotifications: true,
    marketingEmails: false,
    appointmentReminders: true,
    labResultsNotification: true,
    medicationReminders: true,
    systemUpdates: false,
    soundEnabled: true,
    autoSave: true,
    compactView: false,
    showProfilePictures: true,
    defaultCalendarView: "month",
    startOfWeek: "monday",
    timeFormat: "12h",
    dateFormat: "MM/dd/yyyy",
    timezone: "America/New_York",
  });

  const handlePreferenceChange = async (key: string, value: any) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    
    try {
      await updatePreferences({ [key]: value });
      toast.success("Preference updated successfully");
    } catch (error) {
      // Revert on error
      setPreferences(preferences);
      toast.error("Failed to update preference");
    }
  };

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
    { value: "fr", label: "Français" },
    { value: "de", label: "Deutsch" },
    { value: "it", label: "Italiano" },
    { value: "pt", label: "Português" },
    { value: "zh", label: "中文" },
    { value: "ja", label: "日本語" },
    { value: "ko", label: "한국어" },
  ];

  const timezoneOptions = [
    { value: "America/New_York", label: "Eastern Time (US)" },
    { value: "America/Chicago", label: "Central Time (US)" },
    { value: "America/Denver", label: "Mountain Time (US)" },
    { value: "America/Los_Angeles", label: "Pacific Time (US)" },
    { value: "Europe/London", label: "GMT (London)" },
    { value: "Europe/Paris", label: "CET (Paris)" },
    { value: "Asia/Tokyo", label: "JST (Tokyo)" },
    { value: "Asia/Shanghai", label: "CST (Shanghai)" },
  ];

  return (
    <div className="space-y-6">
      {/* Appearance */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-lg">Appearance</CardTitle>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Customize how HealthSphere looks and feels
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Theme Selection */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Theme
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = preferences.theme === option.value;
                
                return (
                  <Button
                    key={option.value}
                    variant="outline"
                    onClick={() => handlePreferenceChange("theme", option.value)}
                    className={cn(
                      "h-auto p-4 flex flex-col items-center space-y-2",
                      isSelected && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{option.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <Separator className="bg-zinc-200 dark:bg-zinc-800" />

          {/* Interface Options */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Interface
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Compact View
                  </span>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Use less spacing between elements
                  </p>
                </div>
                <Switch
                  checked={preferences.compactView}
                  onCheckedChange={(checked) => handlePreferenceChange("compactView", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Show Profile Pictures
                  </span>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Display profile pictures throughout the interface
                  </p>
                </div>
                <Switch
                  checked={preferences.showProfilePictures}
                  onCheckedChange={(checked) => handlePreferenceChange("showProfilePictures", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Sound Effects
                  </span>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Play sounds for notifications and interactions
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {preferences.soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <VolumeOff className="w-4 h-4 text-zinc-400" />
                  )}
                  <Switch
                    checked={preferences.soundEnabled}
                    onCheckedChange={(checked) => handlePreferenceChange("soundEnabled", checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language & Region */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-lg">Language & Region</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Language */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Language
              </label>
              <Select
                value={preferences.language}
                onValueChange={(value) => handlePreferenceChange("language", value)}
              >
                <SelectTrigger className="border-zinc-200 dark:border-zinc-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Timezone */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Timezone
              </label>
              <Select
                value={preferences.timezone}
                onValueChange={(value) => handlePreferenceChange("timezone", value)}
              >
                <SelectTrigger className="border-zinc-200 dark:border-zinc-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezoneOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Format */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Time Format
              </label>
              <Select
                value={preferences.timeFormat}
                onValueChange={(value) => handlePreferenceChange("timeFormat", value)}
              >
                <SelectTrigger className="border-zinc-200 dark:border-zinc-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12 Hour (2:30 PM)</SelectItem>
                  <SelectItem value="24h">24 Hour (14:30)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Format */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Date Format
              </label>
              <Select
                value={preferences.dateFormat}
                onValueChange={(value) => handlePreferenceChange("dateFormat", value)}
              >
                <SelectTrigger className="border-zinc-200 dark:border-zinc-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                  <SelectItem value="MMM d, yyyy">MMM D, YYYY</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-lg">Notifications</CardTitle>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Choose how you want to be notified about important updates
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Global Notification Toggle */}
          <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-lg">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="font-medium text-emerald-900 dark:text-emerald-100">
                  Enable Notifications
                </span>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  Master control for all notifications
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.notifications}
              onCheckedChange={(checked) => handlePreferenceChange("notifications", checked)}
            />
          </div>

          {/* Notification Channels */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Notification Channels
            </h4>
            
            <div className="space-y-3">
              {/* Email Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  <div>
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      Email Notifications
                    </span>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Receive notifications via email
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => handlePreferenceChange("emailNotifications", checked)}
                  disabled={!preferences.notifications}
                />
              </div>

              {/* SMS Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  <div>
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      SMS Notifications
                    </span>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Receive important alerts via SMS
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.smsNotifications}
                  onCheckedChange={(checked) => handlePreferenceChange("smsNotifications", checked)}
                  disabled={!preferences.notifications}
                />
              </div>

              {/* Push Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  <div>
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      Push Notifications
                    </span>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Real-time notifications in your browser
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.pushNotifications}
                  onCheckedChange={(checked) => handlePreferenceChange("pushNotifications", checked)}
                  disabled={!preferences.notifications}
                />
              </div>
            </div>
          </div>

          <Separator className="bg-zinc-200 dark:bg-zinc-800" />

          {/* Notification Types */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Notification Types
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-900 dark:text-zinc-100">
                  Appointment Reminders
                </span>
                <Switch
                  checked={preferences.appointmentReminders}
                  onCheckedChange={(checked) => handlePreferenceChange("appointmentReminders", checked)}
                  disabled={!preferences.notifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-900 dark:text-zinc-100">
                  Lab Results Available
                </span>
                <Switch
                  checked={preferences.labResultsNotification}
                  onCheckedChange={(checked) => handlePreferenceChange("labResultsNotification", checked)}
                  disabled={!preferences.notifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-900 dark:text-zinc-100">
                  Medication Reminders
                </span>
                <Switch
                  checked={preferences.medicationReminders}
                  onCheckedChange={(checked) => handlePreferenceChange("medicationReminders", checked)}
                  disabled={!preferences.notifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-900 dark:text-zinc-100">
                  Marketing Emails
                </span>
                <Switch
                  checked={preferences.marketingEmails}
                  onCheckedChange={(checked) => handlePreferenceChange("marketingEmails", checked)}
                  disabled={!preferences.notifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-900 dark:text-zinc-100">
                  System Updates
                </span>
                <Switch
                  checked={preferences.systemUpdates}
                  onCheckedChange={(checked) => handlePreferenceChange("systemUpdates", checked)}
                  disabled={!preferences.notifications}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar & Scheduling */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-lg">Calendar & Scheduling</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Default Calendar View */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Default Calendar View
              </label>
              <Select
                value={preferences.defaultCalendarView}
                onValueChange={(value) => handlePreferenceChange("defaultCalendarView", value)}
              >
                <SelectTrigger className="border-zinc-200 dark:border-zinc-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day View</SelectItem>
                  <SelectItem value="week">Week View</SelectItem>
                  <SelectItem value="month">Month View</SelectItem>
                  <SelectItem value="agenda">Agenda View</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start of Week */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Start of Week
              </label>
              <Select
                value={preferences.startOfWeek}
                onValueChange={(value) => handlePreferenceChange("startOfWeek", value)}
              >
                <SelectTrigger className="border-zinc-200 dark:border-zinc-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sunday">Sunday</SelectItem>
                  <SelectItem value="monday">Monday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Preferences */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-lg">System</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Auto-save
              </span>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Automatically save your work as you type
              </p>
            </div>
            <Switch
              checked={preferences.autoSave}
              onCheckedChange={(checked) => handlePreferenceChange("autoSave", checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
