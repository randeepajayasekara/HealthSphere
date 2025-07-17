"use client";

import React, { useState } from "react";
import { User } from "@/app/types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  MapPin, 
  Calendar, 
  Phone, 
  Mail, 
  Shield, 
  Heart, 
  Stethoscope,
  UserCheck,
  Settings,
  Building2,
  FlaskConical
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ProfileHeaderProps {
  user: User;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const [isImageLoading, setIsImageLoading] = useState(false);

  const handleImageUpload = async (file: File) => {
    setIsImageLoading(true);
    try {
      // Handle image upload logic here
      console.log("Uploading image:", file);
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setIsImageLoading(false);
    }
  };

  const getRoleInfo = (role: User["role"]) => {
    const roleConfig = {
      patient: {
        label: "Patient",
        icon: Heart,
        color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400",
        description: "Healthcare Consumer"
      },
      doctor: {
        label: "Doctor",
        icon: Stethoscope,
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
        description: "Medical Professional"
      },
      nurse: {
        label: "Nurse",
        icon: UserCheck,
        color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
        description: "Healthcare Professional"
      },
      admin: {
        label: "Administrator",
        icon: Settings,
        color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
        description: "System Administrator"
      },
      receptionist: {
        label: "Receptionist",
        icon: UserCheck,
        color: "bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400",
        description: "Front Desk Staff"
      },
      pharmacist: {
        label: "Pharmacist",
        icon: FlaskConical,
        color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400",
        description: "Medication Specialist"
      },
      lab_technician: {
        label: "Lab Technician",
        icon: FlaskConical,
        color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400",
        description: "Laboratory Professional"
      },
      hospital_management: {
        label: "Hospital Management",
        icon: Building2,
        color: "bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-400",
        description: "Healthcare Management"
      }
    };

    return roleConfig[role] || roleConfig.patient;
  };

  const roleInfo = getRoleInfo(user.role);
  const RoleIcon = roleInfo.icon;

  return (
    <Card className="bg-gradient-to-r from-white to-emerald-50/50 dark:from-zinc-900 dark:to-emerald-950/20 border-zinc-200/60 dark:border-zinc-800/60 shadow-lg">
      <CardContent className="p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Profile Image */}
          <div className="relative group">
            <Avatar className="w-24 h-24 sm:w-32 sm:h-32 ring-4 ring-emerald-100 dark:ring-emerald-900/30 shadow-lg">
              <AvatarImage 
                src={user.profileImageUrl} 
                alt={`${user.firstName} ${user.lastName}`}
                className="object-cover"
              />
              <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xl font-semibold">
                {user.firstName[0]}{user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            
            {/* Upload overlay */}
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer">
              <Camera className="w-6 h-6 text-white" />
            </div>
            
            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
            />
            
            {/* Loading overlay */}
            {isImageLoading && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                  {user.firstName} {user.lastName}
                </h1>
                <Badge className={cn("w-fit", roleInfo.color)}>
                  <RoleIcon className="w-3 h-3 mr-1" />
                  {roleInfo.label}
                </Badge>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 text-lg">
                {roleInfo.description}
              </p>
            </div>

            {/* Contact Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-sm font-medium">{user.email}</span>
              </div>

              {user.phone && (
                <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium">{user.phone}</span>
                </div>
              )}

              {user.dateOfBirth && (
                <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium">
                    {format(new Date(user.dateOfBirth), "MMMM d, yyyy")}
                  </span>
                </div>
              )}

              {user.address && (
                <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium">
                    {user.address.city}, {user.address.state}
                  </span>
                </div>
              )}
            </div>

            {/* Account Status */}
            <div className="flex flex-wrap gap-2 pt-2">
              {user.isEmailVerified && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  <Shield className="w-3 h-3 mr-1" />
                  Email Verified
                </Badge>
              )}
              
              {user.twoFactorEnabled && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                  <Shield className="w-3 h-3 mr-1" />
                  2FA Enabled
                </Badge>
              )}

              {user.isActive && (
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                  Active Account
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
