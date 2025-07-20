/**
 * HealthSphere - Core Type Definitions
 * This file contains type definitions used throughout the HealthSphere application.
 */

// -----------------------------------------------------------------------------
// User related types
// -----------------------------------------------------------------------------

export type UserRole = 'patient' | 'doctor' | 'nurse' | 'admin' | 'receptionist' | 'pharmacist' | 'lab_technician' | 'hospital_management';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phone?: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    address?: Address;
    profileImageUrl?: string; // Updated for profile picture
    createdAt: Date;
    updatedAt: Date;
    lastLogin?: Date;
    isActive: boolean;
    isEmailVerified: boolean; // Added for email verification
    emergencyContact?: EmergencyContact;
    twoFactorEnabled?: boolean; // Added for 2FA
    securityQuestions?: SecurityQuestion[]; // Added for account recovery
    accountLocked?: boolean; // Added for security
    failedLoginAttempts?: number; // Added for security tracking
    lastFailedLogin?: Date; // Added for security tracking
    passwordLastChanged?: Date; // Added for password policy
    sessionTokens?: string[]; // Added for session management
    accessibilitySettings?: AccessibilitySettings; // Added for accessibility features
}

// -----------------------------------------------------------------------------
// Accessibility related types
// -----------------------------------------------------------------------------

export interface AccessibilitySettings {
    oversizedWidget: boolean;
    screenReader: boolean;
    contrast: boolean;
    smartContrast: boolean;
    highlightLinks: boolean;
    biggerText: boolean;
    textSpacing: boolean;
    pauseAnimations: boolean;
    hideImages: boolean;
    dyslexiaFriendly: boolean;
    cursor: boolean;
    tooltips: boolean;
    pageStructure: boolean;
    lineHeight: number;
    textAlign: 'left' | 'center' | 'right';
    dictionary: boolean;
}

export interface AccessibilityContextType {
    settings: AccessibilitySettings;
    updateSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => Promise<void>;
    resetSettings: () => Promise<void>;
    applyQuickProfile: (profile: 'motor' | 'blind' | 'dyslexia' | 'cognitive') => Promise<void>;
}

export type AccessibilityProfile = 'motor' | 'blind' | 'dyslexia' | 'cognitive';

export interface AccessibilityProfileSettings {
    motor: Partial<AccessibilitySettings>;
    blind: Partial<AccessibilitySettings>;
    dyslexia: Partial<AccessibilitySettings>;
    cognitive: Partial<AccessibilitySettings>;
}

// -----------------------------------------------------------------------------
// Layout and Sidebar related types
// -----------------------------------------------------------------------------

export interface SidebarContextType {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

export interface DashboardLayoutProps {
    children: React.ReactNode;
}

export interface SidebarToggleEvent extends CustomEvent {
    detail: {
        isCollapsed: boolean;
    };
}

export interface SecurityQuestion {
    question: string;
    answerHash: string; // Hashed answer for security
}

export interface EmergencyContact {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
}

export interface Address {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export interface PatientProfile extends User {
    role: 'patient';
    medicalHistory?: MedicalHistory;
    insuranceInfo?: InsuranceInfo;
    appointments?: Appointment[];
    prescriptions?: Prescription[];
    medicalRecords?: MedicalRecord[];
    allergies?: Allergy[];
    bloodType?: BloodType;
    height?: number; // in cm
    weight?: number; // in kg
}

export interface DoctorProfile extends User {
    role: 'doctor';
    specialization: string;
    licenseNumber: string;
    education: Education[];
    experience: Experience[];
    department?: string;
    consultationFee?: number;
    availabilitySchedule?: AvailabilitySchedule;
    patients?: PatientProfile[];
    rating?: number;
    reviews?: Review[];
}

export interface NurseProfile extends User {
    role: 'nurse';
    licenseNumber: string;
    department: string;
    specialization?: string;
    shiftSchedule?: ShiftSchedule;
}

export interface AdminProfile extends User {
    role: 'admin';
    department?: string;
    permissions: Permission[];
}

export interface HospitalManagementProfile extends User {
    role: 'hospital_management';
    managedDepartments: string[]; // IDs of departments managed
    managementLevel: 'junior' | 'senior' | 'executive';
    staffResponsibilities: StaffResponsibility[];
    permissions: HospitalManagementPermission[];
    certifications?: Certification[];
    reportsTo?: string; // ID of supervisor (if applicable)
    performanceMetrics?: PerformanceMetric[];
    schedulingAuthority: boolean;
    budgetAuthority: boolean;
    hiringAuthority: boolean;
}

export interface StaffResponsibility {
    staffType: 'doctor' | 'nurse' | 'receptionist' | 'lab_technician' | 'pharmacist';
    departments: string[]; // Department IDs
    responsibilities: string[];
}

export interface HospitalManagementPermission extends Permission {
    staffManagement: StaffManagementPermission;
    departmentManagement: DepartmentManagementPermission;
    resourceAllocation: boolean;
    reportingAccess: ReportingAccessLevel;
}

export interface StaffManagementPermission {
    hiring: boolean;
    termination: boolean;
    performanceReview: boolean;
    scheduling: boolean;
    salaryManagement: boolean;
}

export interface DepartmentManagementPermission {
    budgetControl: boolean;
    resourceAllocation: boolean;
    policySettings: boolean;
    qualityControl: boolean;
}

export type ReportingAccessLevel = 'none' | 'basic' | 'intermediate' | 'advanced' | 'full';

export interface Certification {
    name: string;
    issuingBody: string;
    issueDate: Date;
    expiryDate?: Date;
    verificationId?: string;
    documentUrl?: string;
}

export interface PerformanceMetric {
    period: {
        startDate: Date;
        endDate: Date;
    };
    metrics: {
        category: string;
        score: number;
        target: number;
        notes?: string;
    }[];
    overallRating: number; // 1-5 scale
    reviewedBy: string; // User ID
    reviewDate: Date;
    acknowledgement?: {
        acknowledged: boolean;
        date?: Date;
        comments?: string;
    };
}

// -----------------------------------------------------------------------------
// Authentication related types
// -----------------------------------------------------------------------------

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error?: string;
    sessionExpiry?: Date;
}

export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
    twoFactorCode?: string; // Added for 2FA
}

export interface RegistrationData {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phone?: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    address?: Address;
    profileImageFile?: File; // for backup
    profileImageUrl?: string;
    emergencyContact?: EmergencyContact;
    termsAccepted: boolean;
    privacyPolicyAccepted: boolean;
}

// Multi-step registration steps
export interface RegistrationStep {
    step: number;
    title: string;
    description: string;
    isCompleted: boolean;
    isActive: boolean;
}

export type RegistrationStepType = 
    | 'personal_info'
    | 'contact_info'
    | 'emergency_contact'
    | 'profile_picture'
    | 'security_setup'
    | 'verification';

export interface PasswordResetRequest {
    email: string;
}

export interface PasswordResetConfirmation {
    token: string;
    newPassword: string;
    confirmPassword: string;
}

// Dashboard routes for different roles
export interface DashboardRoute {
    role: UserRole;
    path: string;
    name: string;
}

// Session management
export interface UserSession {
    userId: string;
    sessionId: string;
    createdAt: Date;
    expiresAt: Date;
    ipAddress: string;
    userAgent: string;
    isActive: boolean;
}

// Audit logging
export interface AuditLog {
    id: string;
    userId: string;
    action: string;
    resource: string;
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
    success: boolean;
    details?: Record<string, any>;
}

// -----------------------------------------------------------------------------
// Medical related types
// -----------------------------------------------------------------------------

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface MedicalHistory {
    conditions: MedicalCondition[];
    surgeries: Surgery[];
    familyHistory: FamilyMedicalHistory[];
}

export interface MedicalCondition {
    id: string;
    name: string;
    diagnosedDate: Date;
    treatment?: string;
    notes?: string;
    isCurrent: boolean;
    resolvedDate?: Date;
}

export interface Surgery {
    id: string;
    procedure: string;
    date: Date;
    hospital: string;
    surgeon: string;
    notes?: string;
    complications?: string;
}

export interface FamilyMedicalHistory {
    condition: string;
    relationship: string;
    notes?: string;
}

export interface Allergy {
    id: string;
    name: string;
    severity: 'mild' | 'moderate' | 'severe';
    symptoms: string;
    notes?: string;
}

export interface InsuranceInfo {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
    coverageStartDate: Date;
    coverageEndDate?: Date;
    primaryInsured: string;
    relationshipToPrimary: string;
    contactPhone: string;
}

export interface Education {
    degree: string;
    institution: string;
    year: number;
    description?: string;
}

export interface Experience {
    position: string;
    organization: string;
    startDate: Date;
    endDate?: Date;
    description?: string;
}

export interface AvailabilitySchedule {
    monday?: TimeSlot[];
    tuesday?: TimeSlot[];
    wednesday?: TimeSlot[];
    thursday?: TimeSlot[];
    friday?: TimeSlot[];
    saturday?: TimeSlot[];
    sunday?: TimeSlot[];
    exceptions?: AvailabilityException[];
}

export interface TimeSlot {
    startTime: string; // Format: "HH:MM"
    endTime: string; // Format: "HH:MM"
}

export interface AvailabilityException {
    date: Date;
    isAvailable: boolean;
    timeSlots?: TimeSlot[];
    reason?: string;
}

export interface ShiftSchedule {
    shifts: Shift[];
}

export interface Shift {
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    startTime: string; // Format: "HH:MM"
    endTime: string; // Format: "HH:MM"
    isNightShift: boolean;
}

export interface Review {
    id: string;
    patientId: string;
    patientName: string;
    rating: number; // 1-5
    comment?: string;
    createdAt: Date;
}

export interface Permission {
    resource: string;
    actions: ('create' | 'read' | 'update' | 'delete')[];
}

// -----------------------------------------------------------------------------
// Appointment related types
// -----------------------------------------------------------------------------

export type AppointmentStatus = 
    | 'scheduled' 
    | 'confirmed' 
    | 'checked_in' 
    | 'in_progress' 
    | 'completed' 
    | 'cancelled' 
    | 'no_show';

export type AppointmentType = 
    | 'regular_checkup' 
    | 'follow_up' 
    | 'specialist_consultation' 
    | 'emergency' 
    | 'vaccination' 
    | 'lab_test' 
    | 'imaging' 
    | 'surgery';

export interface Appointment {
    id: string;
    patientId: string;
    doctorId: string;
    date: Date;
    startTime: string; // Format: "HH:MM"
    endTime: string; // Format: "HH:MM"
    status: AppointmentStatus;
    type: AppointmentType;
    reason: string;
    notes?: string;
    followUpNeeded?: boolean;
    followUpDate?: Date;
    createdAt: Date;
    updatedAt: Date;
    virtualMeeting?: VirtualMeetingInfo;
}

export interface VirtualMeetingInfo {
    platform: 'zoom' | 'google_meet' | 'microsoft_teams' | 'custom';
    link: string;
    password?: string;
    instructions?: string;
}

export interface AppointmentRequest {
    patientId: string;
    doctorId: string;
    requestedDate: Date;
    requestedTimeRange: {
        earliest: string; // Format: "HH:MM"
        latest: string; // Format: "HH:MM"
    };
    type: AppointmentType;
    reason: string;
    notes?: string;
    isUrgent: boolean;
    createdAt: Date;
    status: 'pending' | 'approved' | 'rejected' | 'alternative_suggested';
    responseMessage?: string;
    suggestedAlternatives?: AppointmentAlternative[];
}

export interface AppointmentAlternative {
    date: Date;
    startTime: string; // Format: "HH:MM"
    endTime: string; // Format: "HH:MM"
    doctorId: string; // Might be different doctor if original is unavailable
}

// -----------------------------------------------------------------------------
// Consultation related types
// -----------------------------------------------------------------------------

export type ConsultationStatus = 
    | 'scheduled' 
    | 'waiting' 
    | 'in_progress' 
    | 'completed' 
    | 'cancelled' 
    | 'no_show' 
    | 'paused' 
    | 'follow_up_required';

export type ConsultationType = 
    | 'general_consultation' 
    | 'follow_up' 
    | 'emergency' 
    | 'specialist_consultation' 
    | 'second_opinion' 
    | 'telemedicine' 
    | 'pre_operative' 
    | 'post_operative' 
    | 'medication_review' 
    | 'lab_review' 
    | 'routine_checkup';

export type ConsultationPriority = 'low' | 'medium' | 'high' | 'urgent' | 'emergency';

export interface Consultation {
    id: string;
    patientId: string;
    doctorId: string;
    appointmentId?: string; // Optional link to appointment
    date: Date;
    startTime: string; // Format: "HH:MM"
    endTime?: string; // Format: "HH:MM" - set when consultation starts
    actualStartTime?: Date; // Actual start timestamp
    actualEndTime?: Date; // Actual end timestamp
    status: ConsultationStatus;
    type: ConsultationType;
    priority: ConsultationPriority;
    reason: string;
    symptoms?: string[];
    chiefComplaint?: string;
    
    // Consultation details
    presentingSymptoms?: string;
    historyOfPresentIllness?: string;
    physicalExamination?: string;
    assessment?: string;
    diagnosis?: string[];
    differentialDiagnosis?: string[];
    treatmentPlan?: string;
    followUpInstructions?: string;
    
    // Vitals and measurements
    vitals?: {
        temperature?: number; // Celsius
        bloodPressure?: {
            systolic: number;
            diastolic: number;
        };
        heartRate?: number; // BPM
        respiratoryRate?: number; // Per minute
        oxygenSaturation?: number; // Percentage
        weight?: number; // kg
        height?: number; // cm
        bmi?: number;
        notes?: string;
    };
    
    // Prescriptions and orders
    prescriptions?: {
        medicationId: string;
        medicationName: string;
        dosage: string;
        frequency: string;
        duration: string;
        instructions?: string;
    }[];
    
    labOrders?: {
        testId: string;
        testName: string;
        priority: 'routine' | 'urgent' | 'stat';
        instructions?: string;
    }[];
    
    imagingOrders?: {
        type: string;
        bodyPart: string;
        priority: 'routine' | 'urgent' | 'stat';
        instructions?: string;
    }[];
    
    // Referrals
    referrals?: {
        specialistId?: string;
        specialistName?: string;
        specialty: string;
        reason: string;
        priority: 'routine' | 'urgent';
        notes?: string;
    }[];
    
    // Follow-up
    followUpNeeded?: boolean;
    followUpDate?: Date;
    followUpReason?: string;
    
    // Notes and attachments
    notes?: string;
    doctorNotes?: string;
    attachments?: {
        id: string;
        name: string;
        type: string;
        url: string;
        uploadedAt: Date;
    }[];
    
    // Virtual consultation details
    virtualMeeting?: VirtualMeetingInfo;
    
    // Billing and insurance
    billable?: boolean;
    billingCode?: string;
    insuranceClaimId?: string;
    
    // Metadata
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    duration?: number; // Minutes
    
    // Quality metrics
    patientSatisfaction?: {
        rating: number; // 1-5 scale
        feedback?: string;
        submittedAt: Date;
    };
    
    // Emergency flags
    isEmergency?: boolean;
    emergencyLevel?: number; // 1-5 scale
    alertFlags?: string[];
}

export interface ConsultationTemplate {
    id: string;
    name: string;
    description: string;
    specialty: string;
    type: ConsultationType;
    sections: {
        name: string;
        fields: {
            name: string;
            type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'date';
            required: boolean;
            options?: string[];
            placeholder?: string;
        }[];
    }[];
    createdBy: string;
    createdAt: Date;
    isActive: boolean;
}

export interface ConsultationQueue {
    id: string;
    doctorId: string;
    date: Date;
    consultations: {
        consultationId: string;
        estimatedDuration: number; // Minutes
        priority: ConsultationPriority;
        status: ConsultationStatus;
        patientName: string;
        reason: string;
        queuePosition: number;
        estimatedStartTime: Date;
        checkedInAt?: Date;
        notes?: string;
    }[];
    totalEstimatedTime: number; // Minutes
    currentConsultation?: string; // Consultation ID
    lastUpdated: Date;
}

export interface ConsultationAnalytics {
    period: {
        startDate: Date;
        endDate: Date;
    };
    totalConsultations: number;
    completedConsultations: number;
    cancelledConsultations: number;
    noShowConsultations: number;
    averageDuration: number; // Minutes
    averageWaitTime: number; // Minutes
    consultationsByType: {
        type: ConsultationType;
        count: number;
        averageDuration: number;
    }[];
    consultationsByPriority: {
        priority: ConsultationPriority;
        count: number;
        averageDuration: number;
    }[];
    patientSatisfactionAverage: number;
    peakHours: {
        hour: number;
        count: number;
    }[];
    diagnoses: {
        diagnosis: string;
        count: number;
    }[];
    followUpRate: number; // Percentage
    prescriptionRate: number; // Percentage
    referralRate: number; // Percentage
}

// -----------------------------------------------------------------------------
// Prescription related types
// -----------------------------------------------------------------------------

export interface Prescription {
    id: string;
    patientId: string;
    doctorId: string;
    date: Date;
    medications: Medication[];
    diagnosis: string;
    instructions: string;
    isRefillable: boolean;
    refillsRemaining?: number;
    expiryDate: Date;
    status: 'active' | 'completed' | 'cancelled' | 'expired';
    createdAt: Date;
    updatedAt: Date;
}

export interface Medication {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
    notes?: string;
    sideEffects?: string;
    precautions?: string;
    interactions?: string;
}

// -----------------------------------------------------------------------------
// Medical records related types
// -----------------------------------------------------------------------------

export interface MedicalRecord {
    id: string;
    patientId: string;
    providerId: string; // Doctor or healthcare provider ID
    date: Date;
    type: MedicalRecordType;
    description: string;
    attachments?: Attachment[];
    notes?: string;
    diagnosis?: string;
    treatment?: string;
    followUpRecommendations?: string;
    createdAt: Date;
    updatedAt: Date;
}

export type MedicalRecordType = 
    | 'consultation' 
    | 'lab_result' 
    | 'imaging' 
    | 'procedure' 
    | 'hospitalization' 
    | 'vaccination' 
    | 'other';

export interface Attachment {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    url: string;
    uploadedAt: Date;
    description?: string;
}

export interface LabResult extends MedicalRecord {
    type: 'lab_result';
    testName: string;
    testDate: Date;
    resultDate: Date;
    resultValues: LabResultValue[];
    normalRanges?: LabNormalRange[];
    interpretation?: string;
    laboratoryName: string;
    technicianName?: string;
}

export interface LabResultValue {
    parameter: string;
    value: string | number;
    unit: string;
    isAbnormal: boolean;
}

export interface LabNormalRange {
    parameter: string;
    minValue?: number;
    maxValue?: number;
    unit: string;
    description?: string;
}

export interface ImagingResult extends MedicalRecord {
    type: 'imaging';
    procedureName: string;
    bodyPart: string;
    findings: string;
    impression: string;
    radiologistName: string;
    facilityName: string;
}

// -----------------------------------------------------------------------------
// Billing related types
// -----------------------------------------------------------------------------

export interface Bill {
    id: string;
    patientId: string;
    date: Date;
    dueDate: Date;
    items: BillItem[];
    subtotal: number;
    tax: number;
    discount?: number;
    total: number;
    status: 'draft' | 'issued' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
    paidAmount?: number;
    paidDate?: Date;
    paymentMethod?: PaymentMethod;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface BillItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    category: 'consultation' | 'procedure' | 'medication' | 'lab_test' | 'imaging' | 'supplies' | 'room_charges' | 'other';
    serviceDate: Date;
    insuranceCovered?: boolean;
    insuranceAmount?: number;
}

export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'check' | 'insurance' | 'online_payment';

export interface InsuranceClaim {
    id: string;
    billId: string;
    patientId: string;
    insuranceProvider: string;
    policyNumber: string;
    claimNumber: string;
    submissionDate: Date;
    status: 'submitted' | 'in_review' | 'approved' | 'partially_approved' | 'denied' | 'paid';
    approvedAmount?: number;
    denialReason?: string;
    paymentDate?: Date;
    notes?: string;
}

// -----------------------------------------------------------------------------
// Notification related types
// -----------------------------------------------------------------------------

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'appointment' | 'prescription' | 'bill' | 'result' | 'system' | 'message' | 'staffing' | 'chatbot' | 'telemedicine' | 'umid_access' | 'umid_expired' | 'umid_security_alert' | 'umid_verification_failed' | 'medication_reminder' | 'medication_missed' | 'medication_adherence_alert' | 'health_inquiry_response' | 'report_analysis_complete' | 'emergency_detected' | 'review_required' | 'prescription_analyzed' | 'interaction_warning' | 'stock_alert' | 'consultation_required';
    relatedEntityId?: string;
    isRead: boolean;
    createdAt: Date;
    expiresAt?: Date;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    actions?: NotificationAction[];
}

export interface NotificationAction {
    label: string;
    url: string;
    type: 'primary' | 'secondary' | 'danger';
}

export interface NotificationPreferences {
    userId: string;
    channels: {
        email: boolean;
        sms: boolean;
        push: boolean;
        inApp: boolean;
    };
    types: {
        appointment: boolean;
        prescription: boolean;
        bill: boolean;
        result: boolean;
        system: boolean;
        message: boolean;
        staffing: boolean;
        chatbot: boolean;
        telemedicine: boolean;
    };
    quietHours?: {
        enabled: boolean;
        start: string; // Format: "HH:MM"
        end: string; // Format: "HH:MM"
    };
}

export interface StaffingNotification extends Notification {
    type: 'staffing';
    staffingIssue: 'understaffed' | 'leave_request' | 'shift_change' | 'overtime_required';
    departmentId: string;
    requiredAction: boolean;
    deadline?: Date;
}

export interface ChatbotNotification extends Notification {
    type: 'chatbot';
    chatbotIssue: 'knowledge_gap' | 'escalation_needed' | 'policy_update_required' | 'performance_concern';
    conversationId?: string;
    requiredRole?: UserRole;
    autoEscalated: boolean;
}

export interface TelemedicineNotification extends Notification {
    type: 'telemedicine';
    sessionId?: string;
    issue: 'technical_support_needed' | 'session_ready' | 'waiting_room_full' | 'equipment_check';
    platform?: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
}

// -----------------------------------------------------------------------------
// Telemedicine Session types
// -----------------------------------------------------------------------------

export type TelemedicineSessionStatus = 
    | 'scheduled' 
    | 'waiting' 
    | 'in_progress' 
    | 'completed' 
    | 'cancelled' 
    | 'technical_issues' 
    | 'no_show';

export interface TelemedicineSession {
    id: string;
    doctorId: string;
    patientId: string;
    appointmentId?: string;
    title: string;
    description?: string;
    scheduledTime: Date;
    duration: number; // in minutes
    status: TelemedicineSessionStatus;
    virtualMeeting: VirtualMeetingInfo;
    startTime?: Date;
    endTime?: Date;
    sessionNotes?: string;
    prescriptionsIssued?: string[];
    followUpRequired?: boolean;
    followUpDate?: Date;
    technicalIssues?: string[];
    recordingEnabled?: boolean;
    recordingUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TelemedicineSessionRequest {
    doctorId: string;
    patientId: string;
    preferredDate: Date;
    preferredTime: string;
    duration: number;
    reason: string;
    urgency: 'low' | 'medium' | 'high' | 'urgent';
    notes?: string;
}

export interface TelemedicineWaitingRoom {
    sessionId: string;
    patientId: string;
    joinedAt: Date;
    position: number;
    estimatedWaitTime: number; // in minutes
    technicalCheckCompleted: boolean;
    connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface TelemedicineAnalytics {
    totalSessions: number;
    completedSessions: number;
    cancelledSessions: number;
    technicalIssues: number;
    averageSessionDuration: number;
    patientSatisfactionRating: number;
    connectionQualityStats: {
        excellent: number;
        good: number;
        fair: number;
        poor: number;
    };
    mostCommonIssues: string[];
    periodStart: Date;
    periodEnd: Date;
}

// -----------------------------------------------------------------------------
// Enhanced Notification types for new features
// -----------------------------------------------------------------------------

export interface UMIDNotification extends Notification {
    type: 'umid_access' | 'umid_expired' | 'umid_security_alert' | 'umid_verification_failed';
    umidId: string;
    staffId?: string;
    securityLevel: 'low' | 'medium' | 'high' | 'critical';
    accessDetails?: UMIDAccessLog;
}

export interface MedicationReminderNotification extends Notification {
    type: 'medication_reminder' | 'medication_missed' | 'medication_adherence_alert';
    scheduleId: string;
    medicationName: string;
    dosage: string;
    scheduledTime: Date;
    snoozeCount: number;
    adherencePercentage: number;
}

export interface HealthAssistantNotification extends Notification {
    type: 'health_inquiry_response' | 'report_analysis_complete' | 'emergency_detected' | 'review_required';
    inquiryId: string;
    urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
    requiresPhysician: boolean;
    emergencyFlags?: EmergencyFlag[];
}

export interface PrescriptionAnalyzerNotification extends Notification {
    type: 'prescription_analyzed' | 'interaction_warning' | 'stock_alert' | 'consultation_required';
    prescriptionId: string;
    analysisId: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    interactionCount: number;
    requiresAction: boolean;
}

// -----------------------------------------------------------------------------
// Message related types
// -----------------------------------------------------------------------------

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    attachments?: Attachment[];
    createdAt: Date;
    isRead: boolean;
    readAt?: Date;
    isDeleted: boolean;
}

export interface Conversation {
    id: string;
    participants: string[]; // User IDs
    title?: string;
    lastMessageAt: Date;
    createdAt: Date;
    isGroupConversation: boolean;
    metadata?: Record<string, any>;
}

// -----------------------------------------------------------------------------
// Department and facility related types
// -----------------------------------------------------------------------------

export interface Department {
    id: string;
    name: string;
    description?: string;
    headDoctorId?: string;
    location?: string;
    contactEmail?: string;
    contactPhone?: string;
    specialties?: string[];
    facilities?: Facility[];
    managedBy?: string; // ID of hospital manager
    budget?: DepartmentBudget;
    staffing?: DepartmentStaffing;
    performanceIndicators?: DepartmentPerformanceIndicator[];
}

export interface Facility {
    id: string;
    name: string;
    type: 'room' | 'equipment' | 'lab' | 'operation_theatre' | 'ward' | 'other';
    description?: string;
    location: string;
    capacity?: number;
    status: 'available' | 'occupied' | 'maintenance' | 'reserved';
    bookings?: FacilityBooking[];
    maintenanceSchedule?: MaintenanceSchedule[];
}

export interface FacilityBooking {
    id: string;
    facilityId: string;
    userId: string;
    purpose: string;
    startTime: Date;
    endTime: Date;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    patientId?: string;
    notes?: string;
}

export interface MaintenanceSchedule {
    id: string;
    facilityId: string;
    type: 'routine' | 'emergency' | 'preventive';
    description: string;
    scheduledDate: Date;
    estimatedDuration: number; // in hours
    assignedTechnician?: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    completionNotes?: string;
    nextMaintenanceDate?: Date;
}

export interface DepartmentBudget {
    fiscalYear: string;
    totalAmount: number;
    allocated: {
        category: string;
        amount: number;
        used: number;
        remaining: number;
    }[];
    approvedBy: string; // User ID
    lastUpdated: Date;
}

export interface DepartmentStaffing {
    requiredStaff: {
        role: UserRole;
        count: number;
        filled: number;
        vacancies: number;
    }[];
    shiftCoverage: {
        shift: 'morning' | 'afternoon' | 'night';
        minimumRequired: number;
        currentAverage: number;
    }[];
    leaveManagement: {
        approvedLeaves: number;
        pendingRequests: number;
    };
}

export interface DepartmentPerformanceIndicator {
    name: string;
    description: string;
    currentValue: number;
    targetValue: number;
    unit: string;
    lastUpdated: Date;
    trend: 'increasing' | 'decreasing' | 'stable';
    status: 'excellent' | 'good' | 'average' | 'concern' | 'critical';
}

// -----------------------------------------------------------------------------
// UI related types
// -----------------------------------------------------------------------------

export interface PaginationParams {
    page: number;
    limit: number;
    totalItems?: number;
    totalPages?: number;
}

export interface SortParams {
    field: string;
    direction: 'asc' | 'desc';
}

export interface FilterParams {
    [key: string]: any;
}

export interface TableColumn<T> {
    key: string;
    header: string;
    render?: (row: T) => React.ReactNode;
    sortable?: boolean;
    filterable?: boolean;
    width?: string | number;
}

export interface ThemeConfig {
    colorMode: 'light' | 'dark' | 'system';
    fontSize: 'sm' | 'md' | 'lg';
    reducedMotion: boolean;
    highContrast: boolean;
}

export interface ErrorResponse {
    status: number;
    message: string;
    errors?: Record<string, string[]>;
    timestamp?: string;
    path?: string;
}

// -----------------------------------------------------------------------------
// API related types
// -----------------------------------------------------------------------------

export interface ApiResponse<T> {
    data?: T;
    error?: ErrorResponse;
    meta?: {
        pagination?: PaginationParams;
        timestamp?: string;
    };
}

export interface QueryParams {
    pagination?: PaginationParams;
    sort?: SortParams;
    filter?: FilterParams;
    include?: string[]; // Related entities to include
    fields?: string[]; // Specific fields to return
}

export interface StaffManagementQueryParams extends QueryParams {
    departmentFilter?: string[];
    roleFilter?: UserRole[];
    performanceRating?: number;
    certificationFilter?: string[];
    availabilityFilter?: 'available' | 'on_leave' | 'all';
}

// -----------------------------------------------------------------------------
// Universal Medical ID (UMID) related types
// -----------------------------------------------------------------------------

export interface UniversalMedicalID {
    id: string;
    patientId: string;
    umidNumber: string; // Unique UMID identifier
    qrCodeData: string; // Encrypted QR code data
    secretKey: string; // Shared secret for TOTP generation (encrypted)
    isActive: boolean;
    issueDate: Date;
    lastAccessDate?: Date;
    accessHistory: UMIDAccessLog[];
    totpSettings: TOTPSettings;
    securitySettings: UMIDSecuritySettings;
    linkedMedicalData: LinkedMedicalData;
}

export interface TOTPSettings {
    digits: 6 | 8; // TOTP code length
    period: 30 | 60; // Refresh interval in seconds
    algorithm: 'SHA1' | 'SHA256' | 'SHA512';
    issuer: string; // Usually "HealthSphere"
    label: string; // Patient identifier
}

export interface UMIDSecuritySettings {
    maxFailedAttempts: number;
    lockoutDuration: number; // in minutes
    requireBiometric: boolean;
    allowOfflineAccess: boolean;
    encryptionLevel: 'standard' | 'high' | 'military';
    accessControlLevel: 'basic' | 'enhanced' | 'strict';
}

export interface LinkedMedicalData {
    basicInfo: {
        name: string;
        dateOfBirth: Date;
        bloodType?: BloodType;
        emergencyContact: EmergencyContact;
    };
    criticalAllergies: string[];
    chronicConditions: string[];
    currentMedications: string[];
    emergencyMedicalInfo: string[];
    dnrStatus?: boolean; // Do Not Resuscitate
    organDonorStatus?: boolean;
    medicalAlerts: MedicalAlert[];
}

export interface MedicalAlert {
    type: 'allergy' | 'condition' | 'medication' | 'warning' | 'emergency';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    dateAdded: Date;
    expiryDate?: Date;
    addedBy: string; // Healthcare provider ID
}

export interface UMIDAccessLog {
    id: string;
    accessedBy: string; // Staff member ID
    staffRole: UserRole;
    accessTime: Date;
    accessType: 'scan' | 'manual_entry' | 'emergency_override';
    location?: string; // Department or facility
    purpose: string;
    dataAccessed: string[]; // What information was viewed
    deviceInfo?: DeviceInfo;
    ipAddress?: string;
    wasSuccessful: boolean;
    failureReason?: string;
}

export interface DeviceInfo {
    deviceId: string;
    deviceType: 'mobile' | 'tablet' | 'desktop' | 'scanner';
    browserInfo?: string;
    osInfo?: string;
    appVersion?: string;
}

export interface UMIDAuthenticationRequest {
    totpCode: string;
    umidNumber: string;
    staffId: string;
    deviceInfo: DeviceInfo;
    accessPurpose: string;
    emergencyOverride?: boolean;
}

export interface UMIDAuthenticationResponse {
    success: boolean;
    accessToken?: string;
    medicalData?: LinkedMedicalData;
    accessLevel: 'basic' | 'full' | 'emergency';
    expiresAt: Date;
    errorMessage?: string;
    remainingAttempts?: number;
}

// -----------------------------------------------------------------------------
// AI Assistant and Health Inquiry related types
// -----------------------------------------------------------------------------

export interface HealthInquiryAssistant {
    id: string;
    name: string;
    version: string;
    isActive: boolean;
    settings: AIAssistantSettings;
    knowledgeBase: MedicalKnowledgeBase[];
    specializations: MedicalSpecialization[];
    supportedLanguages: string[];
    analytics: AIAssistantAnalytics;
    reportAnalysis: ReportAnalysisCapability;
}

export interface AIAssistantSettings {
    confidenceThreshold: number; // 0-1
    responseStyle: 'professional' | 'friendly' | 'technical';
    disclaimerRequired: boolean;
    emergencyDetection: boolean;
    symptomChecker: boolean;
    medicationInteractionCheck: boolean;
    reportAnalysisEnabled: boolean;
    maxReportSize: number; // in MB
    supportedReportFormats: string[]; // ['PDF', 'JPEG', 'PNG', 'DICOM']
}

export interface MedicalKnowledgeBase {
    id: string;
    category: 'symptoms' | 'conditions' | 'treatments' | 'medications' | 'procedures' | 'lab_values' | 'imaging';
    topic: string;
    content: string;
    medicalCodes: MedicalCode[];
    lastUpdated: Date;
    reviewedBy: string; // Medical professional ID
    evidenceLevel: 'A' | 'B' | 'C' | 'D'; // Evidence-based medicine levels
    sources: string[];
}

export interface MedicalCode {
    system: 'ICD-10' | 'CPT' | 'SNOMED' | 'LOINC' | 'RxNorm';
    code: string;
    description: string;
}

export interface MedicalSpecialization {
    specialty: string;
    subSpecialties: string[];
    commonConditions: string[];
    typicalProcedures: string[];
    requiredExpertise: string[];
}

export interface ReportAnalysisCapability {
    supportedTypes: ReportType[];
    ocrEnabled: boolean;
    imageAnalysis: boolean;
    structuredDataExtraction: boolean;
    abnormalityDetection: boolean;
    comparisonWithNormals: boolean;
}

export type ReportType = 'blood_test' | 'urine_test' | 'x_ray' | 'ct_scan' | 'mri' | 'ultrasound' | 'ecg' | 'pathology' | 'other';

export interface HealthInquiry {
    id: string;
    userId: string;
    userRole: UserRole;
    inquiryType: 'symptom_check' | 'medication_info' | 'report_analysis' | 'general_health' | 'emergency';
    query: string;
    attachedReports?: UploadedReport[];
    aiResponse: AIHealthResponse;
    humanReviewRequired: boolean;
    reviewedBy?: string; // Medical professional ID
    reviewNotes?: string;
    timestamp: Date;
    followUpRecommended: boolean;
    urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
}

export interface UploadedReport {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    uploadedAt: Date;
    processedAt?: Date;
    extractedData?: ExtractedReportData;
    analysisResults?: ReportAnalysisResult[];
}

export interface ExtractedReportData {
    reportType: ReportType;
    testDate?: Date;
    laboratoryName?: string;
    physicianName?: string;
    testResults: TestResult[];
    observations: string[];
    recommendations: string[];
    criticalValues: CriticalValue[];
}

export interface TestResult {
    testName: string;
    value: string;
    unit?: string;
    normalRange?: string;
    isAbnormal: boolean;
    severity?: 'mild' | 'moderate' | 'severe';
    medicalCode?: MedicalCode;
}

export interface CriticalValue {
    testName: string;
    value: string;
    criticalThreshold: string;
    immediateAction: string;
    notificationSent: boolean;
}

export interface ReportAnalysisResult {
    finding: string;
    confidence: number; // 0-1
    category: 'normal' | 'abnormal' | 'critical' | 'unclear';
    explanation: string;
    recommendations: string[];
    requiresPhysician: boolean;
}

export interface AIHealthResponse {
    response: string;
    confidence: number; // 0-1
    sources: string[];
    disclaimers: string[];
    recommendations: HealthRecommendation[];
    emergencyFlags: EmergencyFlag[];
    followUpSuggestions: string[];
    reportSummary?: ReportSummary;
}

export interface HealthRecommendation {
    type: 'lifestyle' | 'medical' | 'immediate_care' | 'follow_up' | 'medication';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    description: string;
    timeframe?: string;
    additionalInfo?: string;
}

export interface EmergencyFlag {
    type: 'symptom' | 'vital_sign' | 'medication' | 'condition';
    severity: 'moderate' | 'high' | 'critical';
    description: string;
    immediateAction: string;
    contactInfo?: string;
}

export interface ReportSummary {
    overallAssessment: 'normal' | 'abnormal' | 'critical' | 'requires_review';
    keyFindings: string[];
    abnormalValues: TestResult[];
    criticalValues: CriticalValue[];
    trendAnalysis?: TrendAnalysis[];
    comparisonWithPrevious?: ReportComparison[];
}

export interface TrendAnalysis {
    testName: string;
    trend: 'improving' | 'stable' | 'worsening' | 'fluctuating';
    timespan: string;
    significance: 'not_significant' | 'mild' | 'moderate' | 'significant';
}

export interface ReportComparison {
    testName: string;
    currentValue: string;
    previousValue: string;
    changePercentage: number;
    significance: 'improvement' | 'no_change' | 'deterioration';
}

export interface AIAssistantAnalytics {
    totalInquiries: number;
    accuracyRate: number; // Based on medical professional reviews
    responseTime: {
        average: number;
        fastest: number;
        slowest: number;
    };
    inquiryBreakdown: {
        type: string;
        count: number;
        accuracyRate: number;
    }[];
    emergencyDetections: number;
    humanReviewsRequired: number;
    userSatisfactionRating: number; // 1-5
    reportAnalysisStats: ReportAnalysisStats;
}

export interface ReportAnalysisStats {
    totalReportsAnalyzed: number;
    reportTypeBreakdown: {
        type: ReportType;
        count: number;
        accuracyRate: number;
    }[];
    criticalFindingsDetected: number;
    averageProcessingTime: number; // in seconds
    ocrAccuracyRate: number;
}

// -----------------------------------------------------------------------------
// Prescription Analyzer related types
// -----------------------------------------------------------------------------

export interface PrescriptionAnalyzer {
    id: string;
    pharmacyId: string;
    pharmacistId: string;
    version: string;
    isActive: boolean;
    settings: PrescriptionAnalyzerSettings;
    inventoryConnection: PharmacyInventoryConnection;
    analytics: PrescriptionAnalyzerAnalytics;
}

export interface PrescriptionAnalyzerSettings {
    autoInventoryCheck: boolean;
    interactionWarnings: boolean;
    dosageValidation: boolean;
    allergyChecking: boolean;
    priceComparison: boolean;
    genericSubstitution: boolean;
    stockAlerts: boolean;
    expirationWarnings: boolean;
    insuranceVerification: boolean;
}

export interface PharmacyInventoryConnection {
    pharmacyId: string;
    pharmacyName: string;
    connectionStatus: 'connected' | 'disconnected' | 'error';
    lastSyncTime: Date;
    syncInterval: number; // in minutes
    inventorySystem: 'internal' | 'external_api' | 'manual';
    apiEndpoint?: string;
    credentials?: EncryptedCredentials;
}

export interface EncryptedCredentials {
    encryptedData: string;
    keyId: string;
    algorithm: string;
}

export interface PrescriptionAnalysis {
    id: string;
    prescriptionId: string;
    patientId: string;
    pharmacistId: string;
    analysisTime: Date;
    status: 'pending' | 'analyzed' | 'dispensed' | 'rejected' | 'requires_consultation';
    availabilityCheck: MedicationAvailability[];
    interactionWarnings: DrugInteraction[];
    allergyWarnings: AllergyWarning[];
    dosageValidation: DosageValidation[];
    alternatives: MedicationAlternative[];
    costAnalysis: CostAnalysis;
    recommendations: PharmacistRecommendation[];
    patientConsultationRequired: boolean;
    physicianContactRequired: boolean;
}

export interface MedicationAvailability {
    medicationId: string;
    medicationName: string;
    brandName: string;
    genericName: string;
    strength: string;
    formulation: string;
    inStock: boolean;
    quantity: number;
    unit: string;
    expirationDate?: Date;
    batchNumber?: string;
    cost: number;
    supplierInfo?: SupplierInfo;
    estimatedRestockDate?: Date;
    alternativeLocations?: PharmacyLocation[];
}

export interface SupplierInfo {
    supplierId: string;
    supplierName: string;
    contactInfo: string;
    deliveryTime: number; // in days
    minimumOrderQuantity: number;
}

export interface PharmacyLocation {
    pharmacyId: string;
    pharmacyName: string;
    address: Address;
    phone: string;
    distance: number; // in km
    inStock: boolean;
    quantity: number;
    cost: number;
}

export interface DrugInteraction {
    type: 'drug_drug' | 'drug_food' | 'drug_condition' | 'drug_lab';
    severity: 'minor' | 'moderate' | 'major' | 'contraindicated';
    interactingMedications: string[];
    interactingSubstances?: string[];
    description: string;
    mechanism: string;
    clinicalSignificance: string;
    management: string;
    references: string[];
    requiresPhysicianConsult: boolean;
}

export interface AllergyWarning {
    allergen: string;
    allergyType: 'drug' | 'ingredient' | 'cross_reactivity';
    severity: 'mild' | 'moderate' | 'severe' | 'anaphylaxis';
    reaction: string;
    lastReactionDate?: Date;
    avoidanceRequired: boolean;
    alternativesAvailable: boolean;
    emergencyProtocol?: string;
}

export interface DosageValidation {
    medicationName: string;
    prescribedDose: string;
    recommendedDose: string;
    frequency: string;
    duration: string;
    isAppropriate: boolean;
    concerns: DosageConcern[];
    adjustmentRecommendations?: DosageAdjustment[];
}

export interface DosageConcern {
    type: 'overdose' | 'underdose' | 'frequency' | 'duration' | 'route';
    severity: 'low' | 'medium' | 'high';
    description: string;
    potentialEffects: string[];
    recommendation: string;
}

export interface DosageAdjustment {
    reason: string;
    recommendedDose: string;
    recommendedFrequency: string;
    duration?: string;
    specialInstructions: string;
    monitoringRequired: boolean;
}

export interface MedicationAlternative {
    type: 'generic' | 'therapeutic' | 'brand' | 'formulation';
    medicationName: string;
    reason: 'cost' | 'availability' | 'interaction' | 'allergy' | 'preference';
    costSaving: number;
    availability: 'in_stock' | 'available' | 'special_order';
    therapeuticEquivalence: boolean;
    bioequivalence: boolean;
    patientEducationRequired: boolean;
    physicianApprovalRequired: boolean;
}

export interface CostAnalysis {
    originalCost: number;
    insuranceCoverage: number;
    patientCost: number;
    genericSavings?: number;
    alternativeCosts: AlternativeCost[];
    insuranceStatus: 'covered' | 'partially_covered' | 'not_covered' | 'prior_auth_required';
    copayAmount?: number;
    deductibleApplied?: number;
}

export interface AlternativeCost {
    medicationName: string;
    totalCost: number;
    insuranceCoverage: number;
    patientCost: number;
    savings: number;
    savingsPercentage: number;
}

export interface PharmacistRecommendation {
    type: 'substitution' | 'counseling' | 'monitoring' | 'consultation' | 'education';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    description: string;
    actionRequired: string;
    timeframe: string;
    followUpRequired: boolean;
    documentation: string;
}

export interface PrescriptionAnalyzerAnalytics {
    totalAnalyses: number;
    averageAnalysisTime: number; // in seconds
    interactionsCaught: number;
    costSavingsGenerated: number;
    substitutionsRecommended: number;
    patientConsultations: number;
    accuracyRate: number; // Based on pharmacist feedback
    inventoryOptimization: InventoryOptimizationMetrics;
    period: {
        startDate: Date;
        endDate: Date;
    };
}

export interface InventoryOptimizationMetrics {
    stockOutsPrevented: number;
    overStockReduced: number;
    expirationWastePrevented: number;
    costOptimization: number;
    supplierPerformance: SupplierPerformanceMetric[];
}

export interface SupplierPerformanceMetric {
    supplierId: string;
    onTimeDelivery: number; // percentage
    qualityRating: number; // 1-5
    costCompetitiveness: number; // percentage
    orderAccuracy: number; // percentage
}

// -----------------------------------------------------------------------------
// Medication Scheduling and Reminder System
// -----------------------------------------------------------------------------

export interface MedicationSchedule {
    id: string;
    patientId: string;
    prescriptionId?: string; // For doctor-prescribed medications
    medicationName: string;
    brandName?: string;
    genericName?: string;
    strength: string;
    formulation: 'tablet' | 'capsule' | 'liquid' | 'injection' | 'topical' | 'inhaler' | 'drops' | 'patch';
    dosage: MedicationDosage;
    schedule: DosageSchedule;
    duration: MedicationDuration;
    instructions: MedicationInstructions;
    reminders: MedicationReminder[];
    adherence: MedicationAdherence;
    isActive: boolean;
    createdBy: 'patient' | 'doctor' | 'pharmacist';
    createdAt: Date;
    lastModified: Date;
    modifiedBy: string; // User ID
}

export interface MedicationDosage {
    amount: number;
    unit: 'mg' | 'ml' | 'tablets' | 'capsules' | 'drops' | 'puffs' | 'patches';
    route: 'oral' | 'topical' | 'injection' | 'inhalation' | 'sublingual' | 'rectal';
    specialInstructions?: string;
}

export interface DosageSchedule {
    frequency: MedicationFrequency;
    times: MedicationTime[];
    daysOfWeek?: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
    intervalDays?: number; // For every X days
    cyclical?: CyclicalSchedule;
}

export type MedicationFrequency = 
    | 'once_daily' 
    | 'twice_daily' 
    | 'three_times_daily' 
    | 'four_times_daily' 
    | 'every_x_hours' 
    | 'as_needed' 
    | 'weekly' 
    | 'monthly' 
    | 'custom';

export interface MedicationTime {
    time: string; // HH:MM format
    label?: string; // e.g., "Morning", "With breakfast", "Before bed"
    mealRelation?: 'before_meal' | 'with_meal' | 'after_meal' | 'empty_stomach';
    offsetMinutes?: number; // Minutes before/after meal
}

export interface CyclicalSchedule {
    onDays: number; // Take for X days
    offDays: number; // Skip for X days
    cycleRepeat: number; // How many cycles
    currentCycle: number;
    currentPhase: 'on' | 'off';
}

export interface MedicationDuration {
    type: 'indefinite' | 'until_date' | 'for_days' | 'until_finished';
    endDate?: Date;
    totalDays?: number;
    totalQuantity?: number;
    quantityRemaining?: number;
}

export interface MedicationInstructions {
    generalInstructions: string;
    specialInstructions?: string[];
    warnings?: string[];
    sideEffectsToWatch?: string[];
    foodInteractions?: string[];
    drugInteractions?: string[];
    storageInstructions?: string;
    missedDoseInstructions?: string;
}

export interface MedicationReminder {
    id: string;
    scheduleId: string;
    reminderType: 'push_notification' | 'sms' | 'email' | 'phone_call';
    scheduledTime: Date;
    actualTime?: Date;
    status: 'pending' | 'sent' | 'delivered' | 'failed' | 'dismissed' | 'snoozed';
    reminderText: string;
    isRecurring: boolean;
    snoozeCount: number;
    maxSnoozeCount: number;
    snoozeDuration: number; // in minutes
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
    deviceTokens?: string[]; // For push notifications
    deliveryAttempts: ReminderDeliveryAttempt[];
}

export interface ReminderDeliveryAttempt {
    attemptTime: Date;
    method: 'push_notification' | 'sms' | 'email' | 'phone_call';
    success: boolean;
    errorMessage?: string;
    deliveryTime?: Date;
    readTime?: Date;
    responseTime?: Date;
}

export interface MedicationAdherence {
    totalDoses: number;
    takenDoses: number;
    missedDoses: number;
    lateCount: number;
    adherencePercentage: number;
    adherenceHistory: AdherenceRecord[];
    adherenceGoal: number; // Target percentage
    streakDays: number; // Current streak of adherence
    longestStreak: number;
    lastMissedDate?: Date;
    improvementTrend: 'improving' | 'stable' | 'declining';
}

export interface AdherenceRecord {
    date: Date;
    scheduledTime: string;
    actualTime?: Date;
    status: 'taken' | 'missed' | 'late' | 'skipped';
    notes?: string;
    sideEffects?: string[];
    effectiveness?: number; // 1-5 scale
    mood?: 'very_poor' | 'poor' | 'neutral' | 'good' | 'very_good';
}

export interface MedicationReminderSettings {
    userId: string;
    enabled: boolean;
    preferredMethods: ('push_notification' | 'sms' | 'email')[];
    reminderAdvanceTime: number; // minutes before scheduled time
    maxSnoozeCount: number;
    snoozeDuration: number; // in minutes
    quietHours: {
        start: string; // HH:MM
        end: string; // HH:MM
    };
    weekendSettings: {
        enabled: boolean;
        differentTiming: boolean;
        weekendOffset: number; // minutes to adjust timing
    };
    emergencyContact?: EmergencyMedicationContact;
    adherenceReports: {
        enabled: boolean;
        frequency: 'daily' | 'weekly' | 'monthly';
        recipients: string[]; // Email addresses
    };
}

export interface EmergencyMedicationContact {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    alertThreshold: number; // consecutive missed doses
    alertMethods: ('sms' | 'email' | 'phone_call')[];
}

export interface MedicationScheduleAnalytics {
    patientId: string;
    period: {
        startDate: Date;
        endDate: Date;
    };
    overallAdherence: number;
    medicationBreakdown: MedicationAdherenceBreakdown[];
    reminderEffectiveness: ReminderEffectivenessMetrics;
    improvementAreas: ImprovementArea[];
    achievements: AdherenceAchievement[];
    healthOutcomes: HealthOutcomeCorrelation[];
}

export interface MedicationAdherenceBreakdown {
    medicationName: string;
    adherenceRate: number;
    totalDoses: number;
    missedDoses: number;
    commonMissedTimes: string[];
    sideEffectsReported: number;
    effectivenessRating: number;
}

export interface ReminderEffectivenessMetrics {
    totalReminders: number;
    successfulReminders: number;
    dismissedReminders: number;
    snoozedReminders: number;
    averageResponseTime: number; // in minutes
    preferredReminderMethod: string;
    optimalReminderTiming: string[];
}

export interface ImprovementArea {
    category: 'timing' | 'method' | 'frequency' | 'medication_specific';
    description: string;
    currentPerformance: number;
    targetPerformance: number;
    recommendations: string[];
    priority: 'low' | 'medium' | 'high';
}

export interface AdherenceAchievement {
    type: 'streak' | 'improvement' | 'consistency' | 'milestone';
    title: string;
    description: string;
    achievedDate: Date;
    value: number;
    badge?: string;
}

export interface HealthOutcomeCorrelation {
    outcome: 'blood_pressure' | 'blood_sugar' | 'symptom_severity' | 'quality_of_life' | 'lab_values';
    correlationStrength: number; // -1 to 1
    trendDirection: 'improving' | 'stable' | 'declining';
    confidenceLevel: number; // 0-1
    dataPoints: number;
    notes: string;
}

// -----------------------------------------------------------------------------
// System Integration types
// -----------------------------------------------------------------------------

export interface SystemIntegration {
    id: string;
    name: string;
    type: 'umid' | 'health_assistant' | 'prescription_analyzer' | 'medication_scheduler';
    version: string;
    status: 'active' | 'inactive' | 'maintenance' | 'error';
    lastHealthCheck: Date;
    configuration: IntegrationConfiguration;
    metrics: IntegrationMetrics;
    dependencies: SystemDependency[];
}

export interface IntegrationConfiguration {
    apiEndpoints: string[];
    authentication: AuthenticationConfig;
    rateLimits: RateLimitConfig;
    caching: CachingConfig;
    monitoring: MonitoringConfig;
    security: SecurityConfig;
}

export interface AuthenticationConfig {
    method: 'api_key' | 'oauth2' | 'jwt' | 'certificate';
    credentials: EncryptedCredentials;
    tokenExpiration: number; // in minutes
    refreshEnabled: boolean;
}

export interface RateLimitConfig {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
    burstLimit: number;
}

export interface CachingConfig {
    enabled: boolean;
    ttl: number; // in seconds
    strategy: 'lru' | 'fifo' | 'ttl';
    maxSize: number; // in MB
}

export interface MonitoringConfig {
    enabled: boolean;
    alertThresholds: AlertThreshold[];
    healthCheckInterval: number; // in minutes
    performanceMetrics: boolean;
    errorTracking: boolean;
}

export interface AlertThreshold {
    metric: string;
    operator: '>' | '<' | '=' | '!=' | '>=' | '<=';
    value: number;
    severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface SecurityConfig {
    encryptionLevel: 'standard' | 'high' | 'military';
    dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
    accessLogging: boolean;
    auditTrail: boolean;
    ipWhitelist?: string[];
    rateLimiting: boolean;
}

export interface IntegrationMetrics {
    uptime: number; // percentage
    responseTime: {
        average: number;
        p95: number;
        p99: number;
    };
    errorRate: number; // percentage
    throughput: number; // requests per second
    lastErrorTime?: Date;
    totalRequests: number;
    totalErrors: number;
}

export interface SystemDependency {
    name: string;
    type: 'database' | 'api' | 'service' | 'external';
    version: string;
    status: 'healthy' | 'degraded' | 'down';
    lastChecked: Date;
    endpoint?: string;
    criticality: 'low' | 'medium' | 'high' | 'critical';
}

// -----------------------------------------------------------------------------
// Blog related types
// -----------------------------------------------------------------------------

export type BlogCategory = 
    | 'healthcare_tips' 
    | 'medical_news' 
    | 'patient_stories' 
    | 'research_updates' 
    | 'health_awareness' 
    | 'technology' 
    | 'wellness' 
    | 'prevention'
    | 'mental_health'
    | 'nutrition'
    | 'exercise'
    | 'chronic_diseases'
    | 'pediatric_health'
    | 'senior_health';

export type BlogStatus = 'draft' | 'published' | 'archived' | 'scheduled';

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: BlogCategory;
    tags: string[];
    status: BlogStatus;
    featured: boolean;
    readingTime: number; // in minutes
    views: number;
    likes: number;
    authorId: string;
    authorName: string;
    authorRole: UserRole;
    authorAvatar?: string;
    featuredImage?: string;
    publishedAt?: Date;
    scheduledFor?: Date;
    createdAt: Date;
    updatedAt: Date;
    seoTitle?: string;
    seoDescription?: string;
    keywords?: string[];
    relatedPosts?: string[]; // Array of post IDs
}

export interface BlogComment {
    id: string;
    postId: string;
    userId: string;
    userName: string;
    userRole: UserRole;
    userAvatar?: string;
    content: string;
    parentCommentId?: string; // For nested comments
    approved: boolean;
    likes: number;
    replies?: BlogComment[];
    createdAt: Date;
    updatedAt: Date;
}

export interface BlogAnalytics {
    postId: string;
    views: number;
    uniqueViews: number;
    likes: number;
    shares: number;
    comments: number;
    averageReadTime: number;
    bounceRate: number;
    engagementRate: number;
    topReferrers: string[];
    deviceBreakdown: {
        mobile: number;
        tablet: number;
        desktop: number;
    };
    geographicData: {
        country: string;
        views: number;
    }[];
    createdAt: Date;
}

export interface BlogFilter {
    category?: BlogCategory;
    tags?: string[];
    author?: string;
    status?: BlogStatus;
    featured?: boolean;
    dateRange?: {
        start: Date;
        end: Date;
    };
    searchQuery?: string;
}

export interface BlogSearchResult {
    posts: BlogPost[];
    totalCount: number;
    hasMore: boolean;
    filters: BlogFilter;
    sortBy: 'newest' | 'oldest' | 'most_viewed' | 'most_liked' | 'relevance';
}