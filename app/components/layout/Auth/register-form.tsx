"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/contexts/auth-context";
import { RegistrationData, RegistrationStep } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Shield, Mail, CheckCircle, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { uploadImageToFreeService } from "@/app/utils/image-upload";

const registrationSteps: RegistrationStep[] = [
  {
    step: 1,
    title: "Personal Information",
    description: "Tell us about yourself",
    isCompleted: false,
    isActive: true,
  },
  {
    step: 2,
    title: "Contact Details",
    description: "How can we reach you",
    isCompleted: false,
    isActive: false,
  },
  {
    step: 3,
    title: "Emergency Contact",
    description: "Someone we can contact in case of emergency",
    isCompleted: false,
    isActive: false,
  },
  {
    step: 4,
    title: "Profile Picture",
    description: "Upload your profile picture",
    isCompleted: false,
    isActive: false,
  },
  {
    step: 5,
    title: "Security Setup",
    description: "Secure your account",
    isCompleted: false,
    isActive: false,
  },
  {
    step: 6,
    title: "Verification",
    description: "Review and confirm your details",
    isCompleted: false,
    isActive: false,
  },
];

export function RegisterForm() {
  const { register, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState(registrationSteps);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState<RegistrationData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    role: "patient",
    phone: "",
    dateOfBirth: undefined,
    gender: undefined,
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Sri Lanka",
    },
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
      email: "",
    },
    termsAccepted: false,
    privacyPolicyAccepted: false,
  });

  const updateFormData = (updates: Partial<RegistrationData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const updateSteps = (stepNumber: number, isCompleted: boolean) => {
    setSteps((prev) =>
      prev.map((step) => ({
        ...step,
        isCompleted: step.step === stepNumber ? isCompleted : step.isCompleted,
        isActive: step.step === stepNumber,
      }))
    );
  };

  const nextStep = () => {
    if (currentStep < 6) {
      if (validateStep(currentStep)) {
        updateSteps(currentStep, true);
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      updateSteps(currentStep - 1, false);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }

      // Set loading state
      setProfileImage(file);

      // Create local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      try {
        // Upload image to hosting service
        toast.loading("Uploading image...", { id: "image-upload" });
        const uploadResult = await uploadImageToFreeService(file);

        if (uploadResult.success && uploadResult.url) {
          // Update form data with the hosted image URL
          updateFormData({
            profileImageUrl: uploadResult.url, // Add this to your RegistrationData type
          });
          toast.success("Image uploaded successfully!", { id: "image-upload" });
        } else {
          toast.error("Failed to upload image", { id: "image-upload" });
        }
      } catch (error) {
        console.error("Image upload error:", error);
        toast.error("Failed to upload image", { id: "image-upload" });
      }
    }
  };

  const validateStep = (step: number, showErrors: boolean = true): boolean => {
    switch (step) {
      case 1:
        if (!formData.firstName?.trim()) {
          if (showErrors) toast.error("First name is required");
          return false;
        }
        if (!formData.lastName?.trim()) {
          if (showErrors) toast.error("Last name is required");
          return false;
        }
        if (!formData.email?.trim()) {
          if (showErrors) toast.error("Email is required");
          return false;
        }
        if (!formData.password) {
          if (showErrors) toast.error("Password is required");
          return false;
        }
        if (formData.password.length < 6) {
          if (showErrors) toast.error("Password must be at least 6 characters");
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          if (showErrors) toast.error("Passwords do not match");
          return false;
        }
        return true;
      case 2:
        if (!formData.phone?.trim()) {
          if (showErrors) toast.error("Phone number is required");
          return false;
        }
        if (!formData.address?.street?.trim()) {
          if (showErrors) toast.error("Street address is required");
          return false;
        }
        if (!formData.address?.city?.trim()) {
          if (showErrors) toast.error("City is required");
          return false;
        }
        return true;
      case 3:
        if (!formData.emergencyContact?.name?.trim()) {
          if (showErrors) toast.error("Emergency contact name is required");
          return false;
        }
        if (!formData.emergencyContact?.phone?.trim()) {
          if (showErrors) toast.error("Emergency contact phone is required");
          return false;
        }
        if (!formData.emergencyContact?.relationship?.trim()) {
          if (showErrors)
            toast.error("Emergency contact relationship is required");
          return false;
        }
        return true;
      case 4:
        return true; // Profile picture is optional
      case 5:
        return true; // Security setup can be optional for now
      case 6:
        if (!formData.termsAccepted) {
          if (showErrors) toast.error("Please accept the Terms of Service");
          return false;
        }
        if (!formData.privacyPolicyAccepted) {
          if (showErrors) toast.error("Please accept the Privacy Policy");
          return false;
        }
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(6, true)) {
      return;
    }

    await register(formData);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    updateFormData({ firstName: e.target.value })
                  }
                  placeholder="Enter your first name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateFormData({ lastName: e.target.value })}
                  placeholder="Enter your last name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value })}
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => updateFormData({ password: e.target.value })}
                  placeholder="Create a strong password"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    updateFormData({ confirmPassword: e.target.value })
                  }
                  placeholder="Confirm your password"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={
                    formData.dateOfBirth
                      ? formData.dateOfBirth.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    updateFormData({
                      dateOfBirth: e.target.value
                        ? new Date(e.target.value)
                        : undefined,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  onValueChange={(value) =>
                    updateFormData({ gender: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData({ phone: e.target.value })}
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                value={formData.address?.street || ""}
                onChange={(e) =>
                  updateFormData({
                    address: { ...formData.address!, street: e.target.value },
                  })
                }
                placeholder="Enter your street address"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.address?.city || ""}
                  onChange={(e) =>
                    updateFormData({
                      address: { ...formData.address!, city: e.target.value },
                    })
                  }
                  placeholder="Enter your city"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province *</Label>
                <Input
                  id="state"
                  value={formData.address?.state || ""}
                  onChange={(e) =>
                    updateFormData({
                      address: { ...formData.address!, state: e.target.value },
                    })
                  }
                  placeholder="Enter your state/province"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={formData.address?.postalCode || ""}
                  onChange={(e) =>
                    updateFormData({
                      address: {
                        ...formData.address!,
                        postalCode: e.target.value,
                      },
                    })
                  }
                  placeholder="Enter postal code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.address?.country || "Sri Lanka"}
                  onChange={(e) =>
                    updateFormData({
                      address: {
                        ...formData.address!,
                        country: e.target.value,
                      },
                    })
                  }
                  placeholder="Enter your country"
                />
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="emergencyName">Emergency Contact Name *</Label>
              <Input
                id="emergencyName"
                value={formData.emergencyContact?.name || ""}
                onChange={(e) =>
                  updateFormData({
                    emergencyContact: {
                      ...formData.emergencyContact!,
                      name: e.target.value,
                    },
                  })
                }
                placeholder="Enter emergency contact name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship *</Label>
              <Input
                id="relationship"
                value={formData.emergencyContact?.relationship || ""}
                onChange={(e) =>
                  updateFormData({
                    emergencyContact: {
                      ...formData.emergencyContact!,
                      relationship: e.target.value,
                    },
                  })
                }
                placeholder="e.g., Spouse, Parent, Sibling"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Emergency Contact Phone *</Label>
              <Input
                id="emergencyPhone"
                type="tel"
                value={formData.emergencyContact?.phone || ""}
                onChange={(e) =>
                  updateFormData({
                    emergencyContact: {
                      ...formData.emergencyContact!,
                      phone: e.target.value,
                    },
                  })
                }
                placeholder="Enter emergency contact phone"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyEmail">Emergency Contact Email</Label>
              <Input
                id="emergencyEmail"
                type="email"
                value={formData.emergencyContact?.email || ""}
                onChange={(e) =>
                  updateFormData({
                    emergencyContact: {
                      ...formData.emergencyContact!,
                      email: e.target.value,
                    },
                  })
                }
                placeholder="Enter emergency contact email (optional)"
              />
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 text-center"
          >
            <div className="flex flex-col items-center space-y-6">
              <Avatar className="w-40 h-40 border-4 border-border">
                <AvatarImage
                  src={profileImagePreview || undefined}
                  className="object-cover"
                />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-400 to-purple-600 text-white">
                  {formData.firstName[0]?.toUpperCase()}
                  {formData.lastName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-4">
                <Label htmlFor="profileImage" className="cursor-pointer">
                  <div className="flex items-center space-x-2 bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors shadow-md">
                    <Upload className="w-5 h-5" />
                    <span className="font-medium">
                      {profileImage
                        ? "Change Picture"
                        : "Upload Profile Picture"}
                    </span>
                  </div>
                </Label>
                <Input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div className="bg-muted p-4 rounded-lg max-w-md">
                <p className="text-sm text-muted-foreground">
                  Upload a clear photo of yourself. This helps healthcare
                  providers identify you.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  <strong>Requirements:</strong> Maximum file size: 5MB.
                  Supported formats: JPG, PNG, GIF
                </p>
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Security Setup</h3>
                <p className="text-muted-foreground">
                  We'll send you a verification email to secure your account.
                  You can set up additional security features after
                  registration.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-muted p-6 rounded-lg">
                <h4 className="font-semibold mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  What we'll do for you:
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    Send email verification to confirm your identity
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    Encrypt and secure your personal data
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    Enable secure login tracking and monitoring
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    Provide secure access to your medical records
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Review Your Information
                </h3>
                <p className="text-muted-foreground">
                  Please review your details and accept our terms to complete
                  registration.
                </p>
              </div>
            </div>

            <div className="bg-muted p-6 rounded-lg space-y-3">
              <div className="flex justify-center mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={profileImagePreview || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-600 text-white">
                    {formData.firstName[0]?.toUpperCase()}
                    {formData.lastName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4 text-sm">
                <div>
                  <span className="font-medium text-amber-700">Name:</span>{" "}
                  {formData.firstName} {formData.lastName}
                </div>
                <div>
                  <span className="font-medium text-amber-700">Email:</span>{" "}
                  {formData.email}
                </div>
                <div>
                  <span className="font-medium text-amber-700">Phone:</span>{" "}
                  {formData.phone}
                </div>
                <div>
                  <span className="font-medium text-amber-700">
                    Emergency Contact:
                  </span>{" "}
                  <br />
                  {formData.emergencyContact?.name}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) =>
                    updateFormData({ termsAccepted: !!checked })
                  }
                  className="mt-1"
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed">
                  I accept the{" "}
                  <a
                    href="/terms"
                    className="text-primary underline hover:underline-offset-1 font-medium"
                  >
                    Terms of Service
                  </a>{" "}
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="privacy"
                  checked={formData.privacyPolicyAccepted}
                  onCheckedChange={(checked) =>
                    updateFormData({ privacyPolicyAccepted: !!checked })
                  }
                  className="mt-1"
                />
                <Label htmlFor="privacy" className="text-sm leading-relaxed">
                  I accept the{" "}
                  <a
                    href="/privacy"
                    className="text-primary underline hover:underline font-medium"
                  >
                    Privacy Policy
                  </a>{" "}
                </Label>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6 overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <div key={step.step} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 border-2",
                    step.isCompleted
                      ? "bg-green-500 text-white border-green-500 shadow-md"
                      : step.isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : "bg-background text-muted-foreground border-muted"
                  )}
                >
                  {step.isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.step
                  )}
                </div>
                <div className="hidden md:block text-xs text-center mt-2 max-w-[80px]">
                  <div
                    className={cn(
                      "font-medium",
                      step.isActive
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-12 md:w-20 h-0.5 mx-2 transition-colors duration-300",
                    step.isCompleted ? "bg-green-500" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <div className="text-center md:hidden">
          <h2 className="text-lg font-semibold">
            {steps[currentStep - 1].title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {steps[currentStep - 1].description}
          </p>
        </div>

        <div className="hidden md:block text-center">
          <h2 className="text-2xl font-semibold">
            {steps[currentStep - 1].title}
          </h2>
          <p className="text-muted-foreground">
            {steps[currentStep - 1].description}
          </p>
        </div>
      </div>

      {/* Form Content */}
      <Card className="shadow-lg m-2">
        <CardContent className="p-6 md:p-8">
          <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-8 space-y-4 md:space-y-0">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="w-full md:w-auto"
            >
              Previous
            </Button>
            {currentStep < 6 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="w-full md:w-auto"
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!validateStep(6, false) || isLoading}
                className="w-full md:w-auto"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
