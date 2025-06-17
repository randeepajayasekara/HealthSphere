/**
 * HealthSphere - Core Type Definitions
 * This file contains type definitions used throughout the HealthSphere application.
 */

// -----------------------------------------------------------------------------
// User related types
// -----------------------------------------------------------------------------

export type UserRole = 'patient' | 'doctor' | 'nurse' | 'admin' | 'receptionist' | 'pharmacist' | 'lab_technician';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phone?: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other' | 'non-binary' | 'transgender' | 'prefer_not_to_say';
    address?: Address;
    profileImage?: string;
    createdAt: Date;
    updatedAt: Date;
    lastLogin?: Date;
    isActive: boolean;
    emergencyContact?: EmergencyContact;
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

// -----------------------------------------------------------------------------
// Authentication related types
// -----------------------------------------------------------------------------

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
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
}

export interface PasswordResetRequest {
    email: string;
}

export interface PasswordResetConfirmation {
    token: string;
    newPassword: string;
    confirmPassword: string;
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
    type: 'appointment' | 'prescription' | 'bill' | 'result' | 'system' | 'message';
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
    };
    quietHours?: {
        enabled: boolean;
        start: string; // Format: "HH:MM"
        end: string; // Format: "HH:MM"
    };
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