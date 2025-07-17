"use client";

import React, { useState } from "react";
import { User, EmergencyContact } from "@/app/types";
import { useProfile } from "@/app/contexts/profile-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Phone, 
  Mail, 
  AlertTriangle, 
  Edit3, 
  X, 
  Check, 
  Plus,
  Trash2,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface ContactInfoSectionProps {
  user: User;
}

export function ContactInfoSection({ user }: ContactInfoSectionProps) {
  const { updatePersonalInfo, isLoading } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: user.email || "",
    phone: user.phone || "",
    emergencyContact: user.emergencyContact || {
      name: "",
      relationship: "",
      phone: "",
      email: "",
    },
  });

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("emergencyContact.")) {
      const contactField = field.split(".")[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [contactField]: value,
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
        phone: formData.phone,
        emergencyContact: formData.emergencyContact,
      };

      await updatePersonalInfo(updateData);
      setIsEditing(false);
      toast.success("Contact information updated successfully");
    } catch (error) {
      toast.error("Failed to update contact information");
    }
  };

  const handleCancel = () => {
    setFormData({
      email: user.email || "",
      phone: user.phone || "",
      emergencyContact: user.emergencyContact || {
        name: "",
        relationship: "",
        phone: "",
        email: "",
      },
    });
    setIsEditing(false);
  };

  const relationshipOptions = [
    "Spouse",
    "Parent",
    "Child",
    "Sibling",
    "Friend",
    "Relative",
    "Guardian",
    "Partner",
    "Other"
  ];

  return (
    <div className="space-y-6">
      {/* Primary Contact Information */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-lg">Primary Contact</CardTitle>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <div className="pl-10 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                  {user.email}
                </div>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Email cannot be changed here. Contact support if needed.
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Phone Number
              </Label>
              {isEditing ? (
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter phone number"
                    className="pl-10 border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-400"
                  />
                </div>
              ) : (
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <div className="pl-10 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                    {user.phone || "Not provided"}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <CardTitle className="text-lg">Emergency Contact</CardTitle>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            This person will be contacted in case of an emergency.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Emergency Contact Name */}
            <div className="space-y-2">
              <Label htmlFor="emergencyName" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Full Name
              </Label>
              {isEditing ? (
                <Input
                  id="emergencyName"
                  value={formData.emergencyContact.name}
                  onChange={(e) => handleInputChange("emergencyContact.name", e.target.value)}
                  placeholder="Enter emergency contact name"
                  className="border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-400"
                />
              ) : (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                  {user.emergencyContact?.name || "Not provided"}
                </div>
              )}
            </div>

            {/* Relationship */}
            <div className="space-y-2">
              <Label htmlFor="relationship" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Relationship
              </Label>
              {isEditing ? (
                <Select 
                  value={formData.emergencyContact.relationship} 
                  onValueChange={(value) => handleInputChange("emergencyContact.relationship", value)}
                >
                  <SelectTrigger className="border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-400">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationshipOptions.map((option) => (
                      <SelectItem key={option} value={option.toLowerCase()}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                  {user.emergencyContact?.relationship 
                    ? user.emergencyContact.relationship.charAt(0).toUpperCase() + user.emergencyContact.relationship.slice(1)
                    : "Not provided"
                  }
                </div>
              )}
            </div>

            {/* Emergency Contact Phone */}
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Phone Number
              </Label>
              {isEditing ? (
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    id="emergencyPhone"
                    type="tel"
                    value={formData.emergencyContact.phone}
                    onChange={(e) => handleInputChange("emergencyContact.phone", e.target.value)}
                    placeholder="Enter phone number"
                    className="pl-10 border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-400"
                  />
                </div>
              ) : (
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <div className="pl-10 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                    {user.emergencyContact?.phone || "Not provided"}
                  </div>
                </div>
              )}
            </div>

            {/* Emergency Contact Email */}
            <div className="space-y-2">
              <Label htmlFor="emergencyEmail" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Email (Optional)
              </Label>
              {isEditing ? (
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    id="emergencyEmail"
                    type="email"
                    value={formData.emergencyContact.email || ""}
                    onChange={(e) => handleInputChange("emergencyContact.email", e.target.value)}
                    placeholder="Enter email address"
                    className="pl-10 border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-400"
                  />
                </div>
              ) : (
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <div className="pl-10 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                    {user.emergencyContact?.email || "Not provided"}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contact Tips */}
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Emergency Contact Guidelines
                </h4>
                <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                  <li>• Choose someone who is easily reachable and available</li>
                  <li>• Inform them that they are your emergency contact</li>
                  <li>• Keep their information up to date</li>
                  <li>• Consider adding multiple contacts if possible</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Communication Preferences */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-lg">Communication Preferences</CardTitle>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            How would you like to be contacted for appointments and updates?
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Preferred Contact Method
              </h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="preferredContact"
                    value="email"
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-zinc-300 dark:border-zinc-600"
                  />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">Email</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="preferredContact"
                    value="phone"
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-zinc-300 dark:border-zinc-600"
                  />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">Phone</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="preferredContact"
                    value="sms"
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-zinc-300 dark:border-zinc-600"
                  />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">SMS</span>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Best Time to Contact
              </h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-zinc-300 dark:border-zinc-600 rounded"
                  />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">Morning (8AM - 12PM)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-zinc-300 dark:border-zinc-600 rounded"
                  />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">Afternoon (12PM - 5PM)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-zinc-300 dark:border-zinc-600 rounded"
                  />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">Evening (5PM - 8PM)</span>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
