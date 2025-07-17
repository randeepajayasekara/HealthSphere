"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  User, 
  PatientProfile, 
  DoctorProfile, 
  NurseProfile, 
  AdminProfile,
  HospitalManagementProfile,
  MedicalHistory,
  InsuranceInfo,
  Allergy,
  AccessibilitySettings
} from "@/app/types";
import { useAuth } from "@/app/contexts/auth-context";
import { 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc, 
  collection, 
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from "firebase/firestore";
import { db } from "@/backend/config";
import toast from "react-hot-toast";

interface ProfileData {
  personalInfo: Partial<User>;
  medicalInfo?: {
    medicalHistory?: MedicalHistory;
    insuranceInfo?: InsuranceInfo;
    allergies?: Allergy[];
    bloodType?: string;
    height?: number;
    weight?: number;
  };
  preferences: {
    theme: "light" | "dark" | "system";
    language: string;
    notifications: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
  };
  accessibility: AccessibilitySettings;
}

interface ProfileContextType {
  profileData: ProfileData | null;
  isLoading: boolean;
  error: string | null;
  updatePersonalInfo: (data: Partial<User>) => Promise<void>;
  updateMedicalInfo: (data: any) => Promise<void>;
  updatePreferences: (data: any) => Promise<void>;
  updateAccessibilitySettings: (settings: Partial<AccessibilitySettings>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  uploadProfileImage: (file: File) => Promise<string>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};

interface ProfileProviderProps {
  children: React.ReactNode;
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize default profile data
  const initializeDefaultProfile = (user: User): ProfileData => ({
    personalInfo: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      address: user.address,
      profileImageUrl: user.profileImageUrl,
    },
    medicalInfo: user.role === "patient" ? {
      medicalHistory: undefined,
      insuranceInfo: undefined,
      allergies: [],
      bloodType: undefined,
      height: undefined,
      weight: undefined,
    } : undefined,
    preferences: {
      theme: "system",
      language: "en",
      notifications: true,
      emailNotifications: true,
      smsNotifications: false,
    },
    accessibility: {
      oversizedWidget: false,
      screenReader: false,
      contrast: false,
      smartContrast: false,
      highlightLinks: false,
      biggerText: false,
      textSpacing: false,
      pauseAnimations: false,
      hideImages: false,
      dyslexiaFriendly: false,
      cursor: false,
      tooltips: false,
      pageStructure: false,
      lineHeight: 1.5,
      textAlign: "left",
      dictionary: false,
    },
  });

  // Load profile data
  const loadProfileData = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Load main user profile
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error("User profile not found");
      }

      const userData = userDoc.data() as User;
      
      // Initialize with default profile
      const profile = initializeDefaultProfile(userData);

      // Load role-specific data
      if (userData.role === "patient") {
        await loadPatientData(userId, profile);
      } else if (userData.role === "doctor") {
        await loadDoctorData(userId, profile);
      } else if (userData.role === "nurse") {
        await loadNurseData(userId, profile);
      }

      // Load preferences
      await loadUserPreferences(userId, profile);
      
      // Load accessibility settings
      await loadAccessibilitySettings(userId, profile);

      setProfileData(profile);
    } catch (err) {
      console.error("Error loading profile:", err);
      setError(err instanceof Error ? err.message : "Failed to load profile");
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  // Load patient-specific data
  const loadPatientData = async (userId: string, profile: ProfileData) => {
    try {
      const patientDocRef = doc(db, "patients", userId);
      const patientDoc = await getDoc(patientDocRef);
      
      if (patientDoc.exists()) {
        const patientData = patientDoc.data();
        profile.medicalInfo = {
          medicalHistory: patientData.medicalHistory,
          insuranceInfo: patientData.insuranceInfo,
          allergies: patientData.allergies || [],
          bloodType: patientData.bloodType,
          height: patientData.height,
          weight: patientData.weight,
        };
      }
    } catch (err) {
      console.error("Error loading patient data:", err);
    }
  };

  // Load doctor-specific data
  const loadDoctorData = async (userId: string, profile: ProfileData) => {
    try {
      const doctorDocRef = doc(db, "doctors", userId);
      const doctorDoc = await getDoc(doctorDocRef);
      
      if (doctorDoc.exists()) {
        const doctorData = doctorDoc.data();
        // Add doctor-specific fields to profile if needed
        profile.personalInfo = {
          ...profile.personalInfo,
          ...doctorData,
        };
      }
    } catch (err) {
      console.error("Error loading doctor data:", err);
    }
  };

  // Load nurse-specific data
  const loadNurseData = async (userId: string, profile: ProfileData) => {
    try {
      const nurseDocRef = doc(db, "nurses", userId);
      const nurseDoc = await getDoc(nurseDocRef);
      
      if (nurseDoc.exists()) {
        const nurseData = nurseDoc.data();
        profile.personalInfo = {
          ...profile.personalInfo,
          ...nurseData,
        };
      }
    } catch (err) {
      console.error("Error loading nurse data:", err);
    }
  };

  // Load user preferences
  const loadUserPreferences = async (userId: string, profile: ProfileData) => {
    try {
      const preferencesDocRef = doc(db, "userPreferences", userId);
      const preferencesDoc = await getDoc(preferencesDocRef);
      
      if (preferencesDoc.exists()) {
        const preferencesData = preferencesDoc.data();
        profile.preferences = {
          ...profile.preferences,
          ...preferencesData,
        };
      }
    } catch (err) {
      console.error("Error loading preferences:", err);
    }
  };

  // Load accessibility settings
  const loadAccessibilitySettings = async (userId: string, profile: ProfileData) => {
    try {
      const accessibilityDocRef = doc(db, "accessibilitySettings", userId);
      const accessibilityDoc = await getDoc(accessibilityDocRef);
      
      if (accessibilityDoc.exists()) {
        const accessibilityData = accessibilityDoc.data();
        profile.accessibility = {
          ...profile.accessibility,
          ...accessibilityData,
        };
      }
    } catch (err) {
      console.error("Error loading accessibility settings:", err);
    }
  };

  // Update personal information
  const updatePersonalInfo = async (data: Partial<User>) => {
    if (!user || !profileData) return;

    try {
      setIsLoading(true);
      
      // Update main user document
      const userDocRef = doc(db, "users", user.id);
      await updateDoc(userDocRef, data);

      // Update role-specific collection
      const roleCollectionMap = {
        patient: "patients",
        doctor: "doctors",
        nurse: "nurses",
        admin: "admins",
        receptionist: "receptionists",
        pharmacist: "pharmacists",
        lab_technician: "labTechnicians",
        hospital_management: "hospitalManagement",
      };

      const collectionName = roleCollectionMap[user.role];
      if (collectionName) {
        const roleDocRef = doc(db, collectionName, user.id);
        await updateDoc(roleDocRef, data);
      }

      // Update local state
      setProfileData(prev => prev ? {
        ...prev,
        personalInfo: { ...prev.personalInfo, ...data }
      } : null);

      toast.success("Personal information updated successfully");
    } catch (err) {
      console.error("Error updating personal info:", err);
      toast.error("Failed to update personal information");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update medical information
  const updateMedicalInfo = async (data: any) => {
    if (!user || !profileData || user.role !== "patient") return;

    try {
      setIsLoading(true);
      
      const patientDocRef = doc(db, "patients", user.id);
      await updateDoc(patientDocRef, data);

      setProfileData(prev => prev ? {
        ...prev,
        medicalInfo: { ...prev.medicalInfo, ...data }
      } : null);

      toast.success("Medical information updated successfully");
    } catch (err) {
      console.error("Error updating medical info:", err);
      toast.error("Failed to update medical information");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update preferences
  const updatePreferences = async (data: any) => {
    if (!user || !profileData) return;

    try {
      setIsLoading(true);
      
      const preferencesDocRef = doc(db, "userPreferences", user.id);
      await setDoc(preferencesDocRef, data, { merge: true });

      setProfileData(prev => prev ? {
        ...prev,
        preferences: { ...prev.preferences, ...data }
      } : null);

      toast.success("Preferences updated successfully");
    } catch (err) {
      console.error("Error updating preferences:", err);
      toast.error("Failed to update preferences");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update accessibility settings
  const updateAccessibilitySettings = async (settings: Partial<AccessibilitySettings>) => {
    if (!user || !profileData) return;

    try {
      setIsLoading(true);
      
      const accessibilityDocRef = doc(db, "accessibilitySettings", user.id);
      await setDoc(accessibilityDocRef, settings, { merge: true });

      setProfileData(prev => prev ? {
        ...prev,
        accessibility: { ...prev.accessibility, ...settings }
      } : null);

      toast.success("Accessibility settings updated successfully");
    } catch (err) {
      console.error("Error updating accessibility settings:", err);
      toast.error("Failed to update accessibility settings");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      await loadProfileData(user.id);
    }
  };

  // Upload profile image
  const uploadProfileImage = async (file: File): Promise<string> => {
    // This would typically upload to Firebase Storage
    // For now, return a placeholder
    return Promise.resolve("placeholder-url");
  };

  // Load profile data when user changes
  useEffect(() => {
    if (user) {
      loadProfileData(user.id);
    } else {
      setProfileData(null);
      setIsLoading(false);
    }
  }, [user]);

  const value: ProfileContextType = {
    profileData,
    isLoading,
    error,
    updatePersonalInfo,
    updateMedicalInfo,
    updatePreferences,
    updateAccessibilitySettings,
    refreshProfile,
    uploadProfileImage,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}
