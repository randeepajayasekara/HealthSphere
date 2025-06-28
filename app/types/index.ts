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
    type: 'appointment' | 'prescription' | 'bill' | 'result' | 'system' | 'message' | 'staffing' | 'chatbot' | 'telemedicine';
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
// Chatbot related types
// -----------------------------------------------------------------------------

export interface ChatbotConfiguration {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    version: string;
    lastUpdated: Date;
    updatedBy: string; // User ID
    settings: ChatbotSettings;
    knowledgeBase: ChatbotKnowledgeBase[];
    responses: ChatbotResponse[];
    analytics: ChatbotAnalytics;
    permissions: ChatbotPermission[];
}

export interface ChatbotSettings {
    language: string;
    responseTime: number; // in milliseconds
    fallbackEnabled: boolean;
    escalationEnabled: boolean;
    learningEnabled: boolean;
    contextRetention: number; // in minutes
    maxConversationLength: number;
    confidenceThreshold: number; // 0-1
}

export interface ChatbotKnowledgeBase {
    id: string;
    category: 'medical' | 'appointment' | 'medication' | 'faq' | 'nursing' | 'policy';
    topic: string;
    content: string;
    keywords: string[];
    lastUpdated: Date;
    updatedBy: string; // User ID
    isActive: boolean;
    priority: 'low' | 'medium' | 'high';
    tags: string[];
}

export interface ChatbotResponse {
    id: string;
    intent: string;
    response: string;
    alternatives?: string[];
    followUpQuestions?: string[];
    escalationTriggers?: string[];
    mediaAttachments?: string[];
    lastUpdated: Date;
    updatedBy: string; // User ID
    usageCount: number;
    successRate: number; // 0-1
}

export interface ChatbotAnalytics {
    totalInteractions: number;
    successfulResolutions: number;
    escalatedConversations: number;
    userSatisfactionRating: number; // 1-5
    topQueries: ChatbotQueryAnalytics[];
    responseTimeMetrics: {
        average: number;
        fastest: number;
        slowest: number;
    };
    usageByRole: {
        role: UserRole;
        interactionCount: number;
        satisfactionRating: number;
    }[];
    period: {
        startDate: Date;
        endDate: Date;
    };
}

export interface ChatbotQueryAnalytics {
    query: string;
    frequency: number;
    successRate: number;
    averageResolutionTime: number;
    userRoles: UserRole[];
}

export interface ChatbotPermission {
    role: UserRole;
    canView: boolean;
    canEdit: boolean;
    canManageKnowledgeBase: boolean;
    canViewAnalytics: boolean;
    canManageResponses: boolean;
    categories: string[]; // Categories they can manage
}

export interface ChatbotConversation {
    id: string;
    userId: string;
    userRole: UserRole;
    startTime: Date;
    endTime?: Date;
    messages: ChatbotMessage[];
    wasEscalated: boolean;
    escalatedTo?: string; // User ID
    satisfactionRating?: number; // 1-5
    resolvedSuccessfully: boolean;
    category: string;
    intent: string;
}

export interface ChatbotMessage {
    id: string;
    type: 'user' | 'bot';
    content: string;
    timestamp: Date;
    intent?: string;
    confidence?: number;
    attachments?: string[];
    metadata?: Record<string, any>;
}

// -----------------------------------------------------------------------------
// Telemedicine related types
// -----------------------------------------------------------------------------

export interface TelemedicineSession {
    id: string;
    appointmentId: string;
    patientId: string;
    doctorId: string;
    nurseId?: string; // For telemedicine support
    startTime: Date;
    endTime?: Date;
    status: 'scheduled' | 'waiting' | 'in_progress' | 'completed' | 'cancelled' | 'technical_issues';
    platform: 'zoom' | 'google_meet' | 'microsoft_teams' | 'custom';
    meetingDetails: VirtualMeetingInfo;
    technicalSupport?: TelemedicineTechnicalSupport;
    sessionNotes?: string;
    prescriptionsIssued?: string[]; // Prescription IDs
    followUpRequired?: boolean;
    recordingEnabled?: boolean;
    recordingUrl?: string;
}

export interface TelemedicineTechnicalSupport {
    supportStaffId: string;
    issuesReported: TechnicalIssue[];
    resolutionTime?: number; // in minutes
    satisfactionRating?: number; // 1-5
}

export interface TechnicalIssue {
    type: 'audio' | 'video' | 'connection' | 'platform' | 'other';
    description: string;
    timestamp: Date;
    resolved: boolean;
    resolutionTime?: number; // in minutes
}

export interface VirtualWaitingRoom {
    id: string;
    doctorId: string;
    currentPatients: VirtualWaitingPatient[];
    maxCapacity: number;
    averageWaitTime: number; // in minutes
    status: 'open' | 'closed' | 'full';
    settings: VirtualWaitingRoomSettings;
}

export interface VirtualWaitingPatient {
    patientId: string;
    appointmentId: string;
    joinTime: Date;
    estimatedWaitTime: number; // in minutes
    position: number;
    status: 'waiting' | 'called' | 'in_session' | 'left';
    technicalCheckCompleted: boolean;
    checkInCompleted: boolean;
}

export interface VirtualWaitingRoomSettings {
    enableTechnicalCheck: boolean;
    enablePreAppointmentForms: boolean;
    enableChatSupport: boolean;
    enableEstimatedWaitTime: boolean;
    enableQueuePosition: boolean;
    allowRescheduling: boolean;
    maxWaitTime: number; // in minutes
}

export interface TelemedicineAnalytics {
    totalSessions: number;
    completedSessions: number;
    cancelledSessions: number;
    technicalIssueRate: number; // percentage
    averageSessionDuration: number; // in minutes
    patientSatisfactionRating: number; // 1-5
    doctorSatisfactionRating: number; // 1-5
    platformUsage: {
        platform: string;
        usage: number;
        satisfactionRating: number;
    }[];
    period: {
        startDate: Date;
        endDate: Date;
    };
    departmentBreakdown: {
        departmentId: string;
        sessionsCount: number;
        successRate: number;
    }[];
}

export interface ElectronicPrescription extends Prescription {
    telemedicineSessionId: string;
    digitalSignature: string;
    verificationCode: string;
    deliveryMethod: 'pharmacy_pickup' | 'mail_delivery' | 'digital_only';
    pharmacyInstructions?: string;
    patientConsent: boolean;
    prescribedVirtually: boolean;
}