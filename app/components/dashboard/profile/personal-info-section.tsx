"use client";

import React, { useState } from "react";
import { User } from "@/app/types";
import { useProfile } from "@/app/contexts/profile-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Save, 
  User as UserIcon, 
  Calendar, 
  MapPin, 
  Edit3, 
  X,
  Check
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

/**
 * Safely format a date using date-fns format function
 * @param date - Date value to format
 * @param formatString - Date format string
 * @param fallback - Fallback string if date is invalid
 * @returns Formatted date string or fallback
 */
function safeFormat(
  date: Date | string | null | undefined,
  formatString: string,
  fallback: string = 'Not provided'
): string {
  try {
    if (!date) return fallback;
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return fallback;
    }
    
    return format(dateObj, formatString);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return fallback;
  }
}

interface PersonalInfoSectionProps {
  user: User;
}

export function PersonalInfoSection({ user }: PersonalInfoSectionProps) {
  const { updatePersonalInfo, isLoading } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    dateOfBirth: safeFormat(user.dateOfBirth, "yyyy-MM-dd", ""),
    gender: user.gender || "",
    phone: user.phone || "",
    address: {
      street: user.address?.street || "",
      city: user.address?.city || "",
      state: user.address?.state || "",
      postalCode: user.address?.postalCode || "",
      country: user.address?.country || "",
    },
  });

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("address.")) {
      const addressField = field.split(".")[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSave = async () => {
    try {
      const updateData: Partial<User> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        gender: formData.gender as User["gender"],
        address: formData.address,
      };

      if (formData.dateOfBirth) {
        updateData.dateOfBirth = new Date(formData.dateOfBirth);
      }

      await updatePersonalInfo(updateData);
      setIsEditing(false);
      toast.success("Personal information updated successfully");
    } catch (error) {
      toast.error("Failed to update personal information");
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      dateOfBirth: safeFormat(user.dateOfBirth, "yyyy-MM-dd", ""),
      gender: user.gender || "",
      phone: user.phone || "",
      address: {
        street: user.address?.street || "",
        city: user.address?.city || "",
        state: user.address?.state || "",
        postalCode: user.address?.postalCode || "",
        country: user.address?.country || "",
      },
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <UserIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </div>
          
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isLoading}
                className="border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Save
              </Button>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                First Name
              </Label>
              {isEditing ? (
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-400"
                />
              ) : (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 break-words">
                  {user.firstName || "Not provided"}
                </div>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Last Name
              </Label>
              {isEditing ? (
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className="border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-400"
                />
              ) : (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 break-words">
                  {user.lastName || "Not provided"}
                </div>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Date of Birth
              </Label>
              {isEditing ? (
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  className="border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-400"
                />
              ) : (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                  {safeFormat(user.dateOfBirth, "MMMM d, yyyy", "Not provided")}
                </div>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Gender
              </Label>
              {isEditing ? (
                <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                  <SelectTrigger className="border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-400">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                  {user.gender ? user.gender.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()) : "Not provided"}
                </div>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="phone" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Phone Number
              </Label>
              {isEditing ? (
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter phone number"
                  className="border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-400"
                />
              ) : (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 break-all">
                  {user.phone || "Not provided"}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-lg">Address</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Street Address */}
            <div className="space-y-2">
              <Label htmlFor="street" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Street Address
              </Label>
              {isEditing ? (
                <Input
                  id="street"
                  value={formData.address.street}
                  onChange={(e) => handleInputChange("address.street", e.target.value)}
                  placeholder="Enter street address"
                  className="border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-400"
                />
              ) : (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                  {user.address?.street || "Not provided"}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  City
                </Label>
                {isEditing ? (
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange("address.city", e.target.value)}
                    placeholder="Enter city"
                    className="border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-400"
                  />
                ) : (
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 break-words">
                    {user.address?.city || "Not provided"}
                  </div>
                )}
              </div>

              {/* State */}
              <div className="space-y-2">
                <Label htmlFor="state" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  State/Province
                </Label>
                {isEditing ? (
                  <Input
                    id="state"
                    value={formData.address.state}
                    onChange={(e) => handleInputChange("address.state", e.target.value)}
                    placeholder="Enter state"
                    className="border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-400"
                  />
                ) : (
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 break-words">
                    {user.address?.state || "Not provided"}
                  </div>
                )}
              </div>

              {/* Postal Code */}
              <div className="space-y-2">
                <Label htmlFor="postalCode" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Postal Code
                </Label>
                {isEditing ? (
                  <Input
                    id="postalCode"
                    value={formData.address.postalCode}
                    onChange={(e) => handleInputChange("address.postalCode", e.target.value)}
                    placeholder="Enter postal code"
                    className="border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-400"
                  />
                ) : (
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                    {user.address?.postalCode || "Not provided"}
                  </div>
                )}
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Country
                </Label>
                {isEditing ? (
                  <Input
                    id="country"
                    value={formData.address.country}
                    onChange={(e) => handleInputChange("address.country", e.target.value)}
                    placeholder="Enter country"
                    className="border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-400"
                  />
                ) : (
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 break-words">
                    {user.address?.country || "Not provided"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
