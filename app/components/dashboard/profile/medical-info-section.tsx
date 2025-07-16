"use client";

import React, { useState } from "react";
import { User, BloodType, Allergy } from "@/app/types";
import { useProfile } from "@/app/contexts/profile-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Activity, 
  AlertTriangle, 
  Plus, 
  X, 
  Edit3, 
  Check,
  Trash2,
  Shield,
  FileText,
  Droplets
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface MedicalInfoSectionProps {
  user: User;
}

export function MedicalInfoSection({ user }: MedicalInfoSectionProps) {
  const { updateMedicalInfo, isLoading, profileData } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    bloodType: profileData?.medicalInfo?.bloodType || "",
    height: profileData?.medicalInfo?.height || "",
    weight: profileData?.medicalInfo?.weight || "",
    allergies: profileData?.medicalInfo?.allergies || [],
    medicalNotes: "",
  });

  // Only show for patients and medical staff
  if (!["patient", "doctor", "nurse"].includes(user.role)) {
    return (
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardContent className="p-8 text-center">
          <Shield className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
            Medical Information Not Available
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            Medical information is only accessible to patients and medical staff.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddAllergy = () => {
    const newAllergy: Allergy = {
      id: Date.now().toString(),
      name: "",
      severity: "mild",
      symptoms: "",
      notes: "",
    };
    
    setFormData(prev => ({
      ...prev,
      allergies: [...prev.allergies, newAllergy],
    }));
  };

  const handleUpdateAllergy = (index: number, field: keyof Allergy, value: string) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.map((allergy, i) => 
        i === index ? { ...allergy, [field]: value } : allergy
      ),
    }));
  };

  const handleRemoveAllergy = (index: number) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
  try {
    const updateData = {
      bloodType: formData.bloodType,
      height: formData.height ? parseFloat(String(formData.height)) : undefined,
      weight: formData.weight ? parseFloat(String(formData.weight)) : undefined,
      allergies: formData.allergies.filter(allergy => allergy.name.trim() !== ""),
    };

      await updateMedicalInfo(updateData);
      setIsEditing(false);
      toast.success("Medical information updated successfully");
    } catch (error) {
      toast.error("Failed to update medical information");
    }
  };

  const handleCancel = () => {
    setFormData({
      bloodType: profileData?.medicalInfo?.bloodType || "",
      height: profileData?.medicalInfo?.height?.toString() || "",
      weight: profileData?.medicalInfo?.weight?.toString() || "",
      allergies: profileData?.medicalInfo?.allergies || [],
      medicalNotes: "",
    });
    setIsEditing(false);
  };

  const bloodTypes: BloodType[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const severityOptions: Array<{ value: Allergy["severity"]; label: string; color: string }> = [
    { value: "mild", label: "Mild", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
    { value: "moderate", label: "Moderate", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" },
    { value: "severe", label: "Severe", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Basic Medical Information */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-lg">Basic Medical Information</CardTitle>
          </div>
          
          {user.role === "patient" && (
            !isEditing ? (
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
            )
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Blood Type */}
            <div className="space-y-2">
              <Label htmlFor="bloodType" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Blood Type
              </Label>
              {isEditing && user.role === "patient" ? (
                <Select value={formData.bloodType} onValueChange={(value) => handleInputChange("bloodType", value)}>
                  <SelectTrigger className="border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-400">
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center space-x-2">
                          <Droplets className="w-4 h-4 text-red-500" />
                          <span>{type}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                  {profileData?.medicalInfo?.bloodType || "Not provided"}
                </div>
              )}
            </div>

            {/* Height */}
            <div className="space-y-2">
              <Label htmlFor="height" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Height (cm)
              </Label>
              {isEditing && user.role === "patient" ? (
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleInputChange("height", e.target.value)}
                  placeholder="Enter height in cm"
                  className="border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-400"
                />
              ) : (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                  {profileData?.medicalInfo?.height ? `${profileData.medicalInfo.height} cm` : "Not provided"}
                </div>
              )}
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Weight (kg)
              </Label>
              {isEditing && user.role === "patient" ? (
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                  placeholder="Enter weight in kg"
                  className="border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-400"
                />
              ) : (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                  {profileData?.medicalInfo?.weight ? `${profileData.medicalInfo.weight} kg` : "Not provided"}
                </div>
              )}
            </div>
          </div>

          {/* BMI Calculation (if height and weight available) */}
          {profileData?.medicalInfo?.height && profileData?.medicalInfo?.weight && (
            <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-lg">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                  BMI: {(profileData.medicalInfo.weight / Math.pow(profileData.medicalInfo.height / 100, 2)).toFixed(1)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allergies */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <div>
              <CardTitle className="text-lg">Allergies</CardTitle>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Important information for medical professionals
              </p>
            </div>
          </div>
          
          {isEditing && user.role === "patient" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddAllergy}
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Allergy
            </Button>
          )}
        </CardHeader>
        
        <CardContent>
          {formData.allergies.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-zinc-300 dark:text-zinc-600" />
              <p>No known allergies recorded</p>
              {isEditing && user.role === "patient" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddAllergy}
                  className="mt-3 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Allergy
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {formData.allergies.map((allergy, index) => (
                <div key={allergy.id || index} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      {!isEditing ? (
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {allergy.name}
                        </span>
                      ) : null}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!isEditing && (
                        <Badge className={
                          severityOptions.find(opt => opt.value === allergy.severity)?.color || 
                          "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                        }>
                          {allergy.severity.charAt(0).toUpperCase() + allergy.severity.slice(1)}
                        </Badge>
                      )}
                      
                      {isEditing && user.role === "patient" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAllergy(index)}
                          className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {isEditing && user.role === "patient" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs text-zinc-600 dark:text-zinc-400">Allergy Name</Label>
                        <Input
                          value={allergy.name}
                          onChange={(e) => handleUpdateAllergy(index, "name", e.target.value)}
                          placeholder="e.g., Peanuts, Penicillin"
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs text-zinc-600 dark:text-zinc-400">Severity</Label>
                        <Select
                          value={allergy.severity}
                          onValueChange={(value) => handleUpdateAllergy(index, "severity", value)}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {severityOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="md:col-span-2 space-y-2">
                        <Label className="text-xs text-zinc-600 dark:text-zinc-400">Symptoms</Label>
                        <Textarea
                          value={allergy.symptoms}
                          onChange={(e) => handleUpdateAllergy(index, "symptoms", e.target.value)}
                          placeholder="Describe symptoms experienced"
                          className="text-sm resize-none"
                          rows={2}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {allergy.symptoms && (
                        <div>
                          <Label className="text-xs text-zinc-600 dark:text-zinc-400">Symptoms:</Label>
                          <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1">
                            {allergy.symptoms}
                          </p>
                        </div>
                      )}
                      {allergy.notes && (
                        <div>
                          <Label className="text-xs text-zinc-600 dark:text-zinc-400">Notes:</Label>
                          <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1">
                            {allergy.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medical Records Access */}
      {user.role !== "patient" && (
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <CardTitle className="text-lg">Medical Records Access</CardTitle>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              As a {user.role}, you can view patient medical information with proper authorization.
            </p>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300"
              >
                <FileText className="w-6 h-6" />
                <span className="text-sm">View Patient Records</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300"
              >
                <Heart className="w-6 h-6" />
                <span className="text-sm">Medical History</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
