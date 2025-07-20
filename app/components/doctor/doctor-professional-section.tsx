"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Stethoscope, 
  GraduationCap, 
  Award, 
  Building,
  DollarSign,
  Star,
  Edit,
  Save,
  X,
  Plus,
  AlertCircle
} from "lucide-react";
import { DoctorProfile, Education, Experience, User } from "@/app/types";
import { DoctorService } from "@/lib/firestore/doctor-service";
import { useAuth } from "@/app/contexts/auth-context";
import toast from "react-hot-toast";

interface DoctorProfessionalSectionProps {
  user: User;
}

export function DoctorProfessionalSection({ user }: DoctorProfessionalSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [formData, setFormData] = useState({
    specialization: "",
    licenseNumber: "",
    department: "",
    consultationFee: "",
    education: [] as Education[],
    experience: [] as Experience[],
  });

  useEffect(() => {
    loadDoctorProfile();
  }, [user.id]);

  const loadDoctorProfile = async () => {
    try {
      const response = await DoctorService.getDoctorProfile(user.id);
      if (response.data) {
        setDoctorProfile(response.data);
        setFormData({
          specialization: response.data.specialization || "",
          licenseNumber: response.data.licenseNumber || "",
          department: response.data.department || "",
          consultationFee: response.data.consultationFee?.toString() || "",
          education: response.data.education || [],
          experience: response.data.experience || [],
        });
      }
    } catch (error) {
      console.error("Error loading doctor profile:", error);
      toast.error("Failed to load professional details");
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updateData = {
        specialization: formData.specialization,
        licenseNumber: formData.licenseNumber,
        department: formData.department,
        consultationFee: formData.consultationFee ? parseFloat(formData.consultationFee) : undefined,
        education: formData.education,
        experience: formData.experience,
      };

      const response = await DoctorService.updateDoctorProfile(user.id, updateData);
      
      if (response.data) {
        setDoctorProfile(response.data);
        setIsEditing(false);
        toast.success("Professional details updated successfully");
      } else {
        toast.error(response.error?.message || "Failed to update professional details");
      }
    } catch (error) {
      console.error("Error updating doctor profile:", error);
      toast.error("Failed to update professional details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadDoctorProfile(); // Reset form data
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          degree: "",
          institution: "",
          year: new Date().getFullYear(),
          description: ""
        }
      ]
    }));
  };

  const updateEducation = (index: number, field: keyof Education, value: any) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          position: "",
          organization: "",
          startDate: new Date(),
          endDate: new Date(),
          description: ""
        }
      ]
    }));
  };

  const updateExperience = (index: number, field: keyof Experience, value: any) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const specializations = [
    "Cardiology", "Dermatology", "Emergency Medicine", "Endocrinology",
    "Family Medicine", "Gastroenterology", "General Surgery", "Hematology",
    "Infectious Disease", "Internal Medicine", "Neurology", "Obstetrics & Gynecology",
    "Oncology", "Ophthalmology", "Orthopedic Surgery", "Otolaryngology",
    "Pathology", "Pediatrics", "Psychiatry", "Pulmonology", "Radiology",
    "Rheumatology", "Urology", "Other"
  ];

  const departments = [
    "Emergency Department", "Intensive Care Unit", "Cardiology", "Neurology",
    "Orthopedics", "Pediatrics", "Obstetrics & Gynecology", "Surgery",
    "Internal Medicine", "Radiology", "Pathology", "Anesthesiology",
    "Psychiatry", "Dermatology", "Ophthalmology", "Outpatient Clinic"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Professional Details
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage your medical credentials and professional information
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Basic Professional Information */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Stethoscope className="h-5 w-5 mr-2 text-red-600" />
            Professional Credentials
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="specialization">Specialization</Label>
              {isEditing ? (
                <Select
                  value={formData.specialization}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, specialization: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations.map(spec => (
                      <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                  <Badge variant="outline" className="text-red-600 border-red-300 dark:text-red-400 dark:border-red-700">
                    {formData.specialization || "Not specified"}
                  </Badge>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="licenseNumber">Medical License Number</Label>
              {isEditing ? (
                <Input
                  id="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                  placeholder="Enter license number"
                />
              ) : (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                  <span className="text-zinc-900 dark:text-zinc-100 font-mono">
                    {formData.licenseNumber || "Not provided"}
                  </span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              {isEditing ? (
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-zinc-600 dark:text-zinc-400" />
                    <span className="text-zinc-900 dark:text-zinc-100">
                      {formData.department || "Not assigned"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="consultationFee">Consultation Fee (USD)</Label>
              {isEditing ? (
                <Input
                  id="consultationFee"
                  type="number"
                  value={formData.consultationFee}
                  onChange={(e) => setFormData(prev => ({ ...prev, consultationFee: e.target.value }))}
                  placeholder="Enter consultation fee"
                />
              ) : (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-zinc-900 dark:text-zinc-100 font-semibold">
                      {formData.consultationFee ? `$${formData.consultationFee}` : "Not set"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />
              Education
            </CardTitle>
            {isEditing && (
              <Button
                onClick={addEducation}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Education
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.education.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
              <GraduationCap className="h-12 w-12 mx-auto mb-2 text-zinc-300" />
              <p>No education records added yet</p>
            </div>
          ) : (
            formData.education.map((edu, index) => (
              <div key={index} className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                        Education #{index + 1}
                      </h4>
                      <Button
                        onClick={() => removeEducation(index)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Degree"
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      />
                      <Input
                        placeholder="Institution"
                        value={edu.institution}
                        onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                      />
                      <Input
                        placeholder="Year"
                        type="number"
                        value={edu.year}
                        onChange={(e) => updateEducation(index, 'year', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {edu.degree}
                      </h4>
                      <Badge variant="outline" className="text-blue-600 border-blue-300 dark:text-blue-400 dark:border-blue-700">
                        {edu.year}
                      </Badge>
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300">{edu.institution}</p>
                    {edu.description && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                        {edu.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Experience */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-green-600" />
              Experience
            </CardTitle>
            {isEditing && (
              <Button
                onClick={addExperience}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Experience
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.experience.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
              <Award className="h-12 w-12 mx-auto mb-2 text-zinc-300" />
              <p>No experience records added yet</p>
            </div>
          ) : (
            formData.experience.map((exp, index) => (
              <div key={index} className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                        Experience #{index + 1}
                      </h4>
                      <Button
                        onClick={() => removeExperience(index)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Position"
                        value={exp.position}
                        onChange={(e) => updateExperience(index, 'position', e.target.value)}
                      />
                      <Input
                        placeholder="Organization"
                        value={exp.organization}
                        onChange={(e) => updateExperience(index, 'organization', e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {exp.position}
                      </h4>
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300">{exp.organization}</p>
                    {exp.description && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                        {exp.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Performance Summary */}
      {doctorProfile && (
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-600" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {doctorProfile.rating?.toFixed(1) || "N/A"}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Average Rating
                </div>
                <div className="flex items-center justify-center mt-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= (doctorProfile.rating || 0)
                          ? "text-yellow-400 fill-current"
                          : "text-zinc-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {doctorProfile.patients?.length || 0}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Total Patients
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {doctorProfile.reviews?.length || 0}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Patient Reviews
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
