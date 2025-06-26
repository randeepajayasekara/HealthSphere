"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
} from "firebase/firestore";
import { auth, db } from "@/backend/config";
import {
  User,
  AuthState,
  LoginCredentials,
  RegistrationData,
  AuditLog,
} from "@/app/types";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  uploadProfileImage: (file: File) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DASHBOARD_ROUTES: Record<string, string> = {
  patient: "/dashboard",
  doctor: "/doctor",
  nurse: "/nurse",
  admin: "/admin",
  receptionist: "/receptionist",
  pharmacist: "/pharmacist",
  lab_technician: "/lab-technician",
  hospital_management: "/hospital-management",
};

// Free image hosting service API
const uploadImageToFreeHost = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("source", file);
  formData.append("type", "file");
  formData.append("action", "upload");

  try {
    // Using ImgBB as a free image hosting service
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      // Fallback to a simpler free service
      const fallbackFormData = new FormData();
      fallbackFormData.append("image", file);

      const fallbackResponse = await fetch(
        `https://freeimage.host/api/1/upload?key=${process.env.NEXT_PUBLIC_FREEIMAGE_API_KEY}`,
        {
          method: "POST",
          body: fallbackFormData,
        }
      );

      if (!fallbackResponse.ok) {
        // If both fail, use a placeholder service
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(
          file.name
        )}&size=200&background=random`;
      }

      const fallbackData = await fallbackResponse.json();
      return (
        fallbackData.image?.url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          file.name
        )}&size=200&background=random`
      );
    }

    const data = await response.json();
    return (
      data.data?.url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        file.name
      )}&size=200&background=random`
    );
  } catch (error) {
    console.error("Error uploading image:", error);
    // Return a default avatar URL based on the file name
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      file.name.slice(0, 2)
    )}&size=200&background=random`;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: undefined,
  });

  const router = useRouter();

  // Audit logging function
  const logAuditEvent = async (
    action: string,
    resource: string,
    success: boolean,
    details?: any
  ) => {
    try {
      if (authState.user) {
        const auditLog: Omit<AuditLog, "id"> = {
          userId: authState.user.id,
          action,
          resource,
          timestamp: new Date(),
          ipAddress: "client-side",
          userAgent: navigator.userAgent,
          success,
          details,
        };

        await addDoc(collection(db, "audit_logs"), auditLog);
      }
    } catch (error) {
      console.error("Failed to log audit event:", error);
    }
  };

  // Upload profile image function
  const uploadProfileImage = async (file: File): Promise<string> => {
    try {
      const imageUrl = await uploadImageToFreeHost(file);
      return imageUrl;
    } catch (error) {
      console.error("Error uploading profile image:", error);
      throw error;
    }
  };

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;

            // Update last login
            await updateDoc(doc(db, "users", firebaseUser.uid), {
              lastLogin: new Date(),
              isActive: true,
            });

            setAuthState({
              user: { ...userData, id: firebaseUser.uid },
              isAuthenticated: true,
              isLoading: false,
              error: undefined,
            });

            await logAuditEvent("LOGIN", "AUTH", true);
          } else {
            throw new Error("User data not found");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: "Failed to load user data",
          });
        }
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: undefined,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

      if (!userDoc.exists()) {
        throw new Error("User profile not found");
      }

      const userData = userDoc.data() as User;

      // Check if account is locked
      if (userData.accountLocked) {
        throw new Error("Account is locked. Please contact support.");
      }

      // Reset failed login attempts on successful login
      await updateDoc(doc(db, "users", userCredential.user.uid), {
        failedLoginAttempts: 0,
        lastFailedLogin: null,
        lastLogin: new Date(),
      });

      // Redirect based on role
      const dashboardPath = DASHBOARD_ROUTES[userData.role];
      if (dashboardPath) {
        router.push(dashboardPath);
      } else {
        router.push("/");
      }

      toast.success("Login successful!");
      await logAuditEvent("LOGIN", "AUTH", true, { email: credentials.email });
    } catch (error: any) {
      const errorMessage = error.message || "Login failed";

      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error(errorMessage);
      await logAuditEvent("LOGIN", "AUTH", false, {
        email: credentials.email,
        error: errorMessage,
      });
    }
  };

  const register = async (data: RegistrationData) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: undefined }));

    try {
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      let profileImageUrl = null;

      // Use the already uploaded URL if available
      if (data.profileImageUrl) {
        profileImageUrl = data.profileImageUrl;
      } else if (data.profileImageFile) {
        // Fallback: upload during registration
        try {
          const uploadResult = await uploadImageToFreeHost(
            data.profileImageFile
          );
          profileImageUrl = uploadResult;
        } catch (imageError) {
          console.warn("Failed to upload profile image:", imageError);
          // Generate default avatar as fallback
          profileImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
            data.firstName + " " + data.lastName
          )}&size=200&background=random`;
        }
      } else {
        // Generate default avatar
        profileImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
          data.firstName + " " + data.lastName
        )}&size=200&background=random`;
      }

      // Update Firebase auth profile
      await updateProfile(userCredential.user, {
        displayName: `${data.firstName} ${data.lastName}`,
        photoURL: profileImageUrl,
      });

      // Create user document in Firestore
      const userData: User = {
        id: userCredential.user.uid,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: "patient", // Only patients can register
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        address: data.address,
        profileImageUrl: profileImageUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
        isActive: true,
        isEmailVerified: false,
        emergencyContact: data.emergencyContact,
        twoFactorEnabled: false,
        accountLocked: false,
        failedLoginAttempts: 0,
        passwordLastChanged: new Date(),
      };

      await setDoc(doc(db, "users", userCredential.user.uid), userData);

      // Send email verification
      await sendEmailVerification(userCredential.user);

      toast.success(
        "Registration successful! Please check your email for verification."
      );
      await logAuditEvent("REGISTER", "AUTH", true, { email: data.email });

      // Redirect to patient dashboard
      router.push("/patient");
    } catch (error: any) {
      const errorMessage = error.message || "Registration failed";
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error(errorMessage);
      await logAuditEvent("REGISTER", "AUTH", false, {
        email: data.email,
        error: errorMessage,
      });
    }
  };

  const logout = async () => {
    try {
      await logAuditEvent("LOGOUT", "AUTH", true);
      await firebaseSignOut(auth);
      router.push("/");
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error("Logout failed");
      await logAuditEvent("LOGOUT", "AUTH", false, { error: error.message });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent!");
      await logAuditEvent("PASSWORD_RESET_REQUEST", "AUTH", true, { email });
    } catch (error: any) {
      toast.error("Failed to send password reset email");
      await logAuditEvent("PASSWORD_RESET_REQUEST", "AUTH", false, {
        email,
        error: error.message,
      });
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!authState.user) return;

    try {
      await updateDoc(doc(db, "users", authState.user.id), {
        ...updates,
        updatedAt: new Date(),
      });

      setAuthState((prev) => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...updates } : null,
      }));

      toast.success("Profile updated successfully");
      await logAuditEvent("PROFILE_UPDATE", "USER", true, updates);
    } catch (error: any) {
      toast.error("Failed to update profile");
      await logAuditEvent("PROFILE_UPDATE", "USER", false, {
        error: error.message,
      });
    }
  };

  const refreshUser = async () => {
    if (!auth.currentUser) return;

    try {
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setAuthState((prev) => ({
          ...prev,
          user: { ...userData, id: auth.currentUser!.uid },
        }));
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        resetPassword,
        updateUserProfile,
        refreshUser,
        uploadProfileImage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
