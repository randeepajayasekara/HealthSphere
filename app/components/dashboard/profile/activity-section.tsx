"use client";

import React, { useState } from "react";
import { User } from "@/app/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Activity, 
  Clock, 
  MapPin, 
  Monitor, 
  Smartphone, 
  Calendar,
  Download,
  Trash2,
  Shield,
  Eye,
  EyeOff,
  AlertTriangle,
  Check,
  X,
  FileDown,
  Settings
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ActivitySectionProps {
  user: User;
}

interface ActivityLog {
  id: string;
  timestamp: Date;
  action: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  location: string;
  success: boolean;
  category: "login" | "profile" | "medical" | "security" | "system";
}

interface DeviceSession {
  id: string;
  deviceType: "desktop" | "mobile" | "tablet";
  browser: string;
  os: string;
  location: string;
  ipAddress: string;
  lastActive: Date;
  isCurrentSession: boolean;
}

export function ActivitySection({ user }: ActivitySectionProps) {
  const [timeFilter, setTimeFilter] = useState("7days");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showSensitiveActions, setShowSensitiveActions] = useState(false);

  // Mock activity data
  const mockActivities: ActivityLog[] = [
    {
      id: "1",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      action: "Profile Updated",
      details: "Updated personal information",
      ipAddress: "192.168.1.100",
      userAgent: "Chrome 120.0 on Windows",
      location: "New York, NY",
      success: true,
      category: "profile",
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      action: "Signed In",
      details: "Successful login from new device",
      ipAddress: "192.168.1.100",
      userAgent: "Safari on iPhone",
      location: "New York, NY",
      success: true,
      category: "login",
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      action: "Password Changed",
      details: "Account password was updated",
      ipAddress: "192.168.1.100",
      userAgent: "Chrome 120.0 on Windows",
      location: "New York, NY",
      success: true,
      category: "security",
    },
    {
      id: "4",
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      action: "Medical Info Updated",
      details: "Added new allergy information",
      ipAddress: "192.168.1.100",
      userAgent: "Chrome 120.0 on Windows",
      location: "New York, NY",
      success: true,
      category: "medical",
    },
    {
      id: "5",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      action: "Failed Login Attempt",
      details: "Incorrect password entered",
      ipAddress: "203.0.113.15",
      userAgent: "Chrome 119.0 on Windows",
      location: "Unknown Location",
      success: false,
      category: "login",
    },
  ];

  const mockSessions: DeviceSession[] = [
    {
      id: "1",
      deviceType: "desktop",
      browser: "Chrome 120.0",
      os: "Windows 11",
      location: "New York, NY",
      ipAddress: "192.168.1.100",
      lastActive: new Date(),
      isCurrentSession: true,
    },
    {
      id: "2",
      deviceType: "mobile",
      browser: "Safari",
      os: "iOS 17.2",
      location: "New York, NY",
      ipAddress: "192.168.1.101",
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isCurrentSession: false,
    },
    {
      id: "3",
      deviceType: "tablet",
      browser: "Chrome Mobile",
      os: "Android 14",
      location: "Boston, MA",
      ipAddress: "10.0.0.50",
      lastActive: new Date(Date.now() - 48 * 60 * 60 * 1000),
      isCurrentSession: false,
    },
  ];

  const getCategoryIcon = (category: ActivityLog["category"]) => {
    switch (category) {
      case "login":
        return Shield;
      case "profile":
        return Settings;
      case "medical":
        return Activity;
      case "security":
        return Shield;
      case "system":
        return Monitor;
      default:
        return Activity;
    }
  };

  const getCategoryColor = (category: ActivityLog["category"]) => {
    switch (category) {
      case "login":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "profile":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400";
      case "medical":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "security":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "system":
        return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300";
      default:
        return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300";
    }
  };

  const getDeviceIcon = (deviceType: DeviceSession["deviceType"]) => {
    switch (deviceType) {
      case "desktop":
        return Monitor;
      case "mobile":
        return Smartphone;
      case "tablet":
        return Monitor; // Could use a tablet icon if available
      default:
        return Monitor;
    }
  };

  const filteredActivities = mockActivities.filter((activity) => {
    if (categoryFilter !== "all" && activity.category !== categoryFilter) {
      return false;
    }
    
    if (!showSensitiveActions && activity.category === "security") {
      return false;
    }
    
    const now = new Date();
    const activityDate = activity.timestamp;
    
    switch (timeFilter) {
      case "24h":
        return now.getTime() - activityDate.getTime() <= 24 * 60 * 60 * 1000;
      case "7days":
        return now.getTime() - activityDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
      case "30days":
        return now.getTime() - activityDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
      default:
        return true;
    }
  });

  const handleTerminateSession = (sessionId: string) => {
    console.log("Terminating session:", sessionId);
    // Implement session termination logic
  };

  const handleDownloadData = () => {
    console.log("Downloading activity data");
    // Implement data download logic
  };

  return (
    <div className="space-y-6">
      {/* Account Overview */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-lg">Account Overview</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
              <Calendar className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                {user.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0}
              </div>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">Days Active</p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {mockSessions.length}
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">Active Sessions</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {user.lastLogin ? format(new Date(user.lastLogin), "MMM d") : "Never"}
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300">Last Login</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <CardTitle className="text-lg">Activity Log</CardTitle>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadData}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-zinc-600 dark:text-zinc-400">Time:</label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-32 h-8 border-zinc-200 dark:border-zinc-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm text-zinc-600 dark:text-zinc-400">Category:</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-32 h-8 border-zinc-200 dark:border-zinc-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="profile">Profile</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSensitiveActions(!showSensitiveActions)}
              className="text-xs"
            >
              {showSensitiveActions ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
              {showSensitiveActions ? "Hide" : "Show"} Sensitive
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                <Clock className="w-12 h-12 mx-auto mb-3 text-zinc-300 dark:text-zinc-600" />
                <p>No activity found for the selected filters</p>
              </div>
            ) : (
              filteredActivities.map((activity) => {
                const Icon = getCategoryIcon(activity.category);
                
                return (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      activity.success 
                        ? "bg-green-100 dark:bg-green-900/20" 
                        : "bg-red-100 dark:bg-red-900/20"
                    )}>
                      {activity.success ? (
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {activity.action}
                        </span>
                        <Badge className={cn("text-xs", getCategoryColor(activity.category))}>
                          {activity.category}
                        </Badge>
                        {!activity.success && (
                          <Badge variant="destructive" className="text-xs">
                            Failed
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {activity.details}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-zinc-500 dark:text-zinc-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{format(activity.timestamp, "MMM d, yyyy 'at' h:mm a")}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{activity.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Monitor className="w-3 h-3" />
                          <span>{activity.userAgent}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Monitor className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-lg">Active Sessions</CardTitle>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Manage devices that are currently signed in to your account
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {mockSessions.map((session) => {
              const DeviceIcon = getDeviceIcon(session.deviceType);
              
              return (
                <div key={session.id} className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                      <DeviceIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {session.browser} on {session.os}
                        </span>
                        {session.isCurrentSession && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            Current
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-zinc-600 dark:text-zinc-400">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{session.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Last active {format(session.lastActive, "MMM d 'at' h:mm a")}</span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        IP: {session.ipAddress}
                      </p>
                    </div>
                  </div>
                  
                  {!session.isCurrentSession && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTerminateSession(session.id)}
                      className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Terminate
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FileDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-lg">Data Export</CardTitle>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Download your account data and activity history
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={handleDownloadData}
              className="h-20 flex flex-col items-center justify-center space-y-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300"
            >
              <Download className="w-6 h-6" />
              <span className="text-sm">Activity Data</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={handleDownloadData}
              className="h-20 flex flex-col items-center justify-center space-y-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300"
            >
              <FileDown className="w-6 h-6" />
              <span className="text-sm">Profile Data</span>
            </Button>
          </div>
          
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Data Export Information
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Your data will be prepared and sent to your registered email address within 24 hours. 
                  The download link will be valid for 7 days.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
