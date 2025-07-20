/**
 * Consultation Service - Firestore Integration
 * Provides comprehensive consultation management functionality
 * with real-time updates and analytics for the doctor role.
 */

import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    limit as firestoreLimit,
    startAfter,
    onSnapshot,
    Timestamp,
    writeBatch,
    runTransaction,
    serverTimestamp,
    DocumentSnapshot,
    QuerySnapshot
} from 'firebase/firestore';
import { db } from '@/backend/config';
import { safeTimestampToDate } from '../utils/date-utils';
import { 
    Consultation,
    ConsultationTemplate,
    ConsultationQueue,
    ConsultationAnalytics,
    ConsultationStatus,
    ConsultationType,
    ConsultationPriority,
    PatientProfile,
    ApiResponse,
    PaginationParams,
    FilterParams
} from '@/app/types';

export class ConsultationService {
    private static readonly CONSULTATIONS_COLLECTION = 'consultations';
    private static readonly TEMPLATES_COLLECTION = 'consultation_templates';
    private static readonly QUEUES_COLLECTION = 'consultation_queues';
    private static readonly PATIENTS_COLLECTION = 'patients';

    /**
     * Create a new consultation
     */
    static async createConsultation(
        consultationData: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<ApiResponse<Consultation>> {
        try {
            const docRef = await addDoc(collection(db, this.CONSULTATIONS_COLLECTION), {
                ...consultationData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            const createdConsultation = await this.getConsultationById(docRef.id);
            return createdConsultation;
        } catch (error) {
            console.error('Error creating consultation:', error);
            return {
                error: { status: 500, message: 'Failed to create consultation' }
            };
        }
    }

    /**
     * Get consultation by ID
     */
    static async getConsultationById(consultationId: string): Promise<ApiResponse<Consultation>> {
        try {
            const docRef = doc(db, this.CONSULTATIONS_COLLECTION, consultationId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                return {
                    data: {
                        id: docSnap.id,
                        ...data,
                        // Convert Firestore timestamps to Date objects
                        date: data.date?.toDate() || new Date(),
                        actualStartTime: data.actualStartTime?.toDate(),
                        actualEndTime: data.actualEndTime?.toDate(),
                        followUpDate: data.followUpDate?.toDate(),
                        createdAt: data.createdAt?.toDate() || new Date(),
                        updatedAt: data.updatedAt?.toDate() || new Date(),
                        patientSatisfaction: data.patientSatisfaction ? {
                            ...data.patientSatisfaction,
                            submittedAt: data.patientSatisfaction.submittedAt?.toDate()
                        } : undefined
                    } as Consultation
                };
            } else {
                return {
                    error: { status: 404, message: 'Consultation not found' }
                };
            }
        } catch (error) {
            console.error('Error fetching consultation:', error);
            return {
                error: { status: 500, message: 'Failed to fetch consultation' }
            };
        }
    }

    /**
     * Get consultations for a doctor with filtering and pagination
     */
    static async getDoctorConsultations(
        doctorId: string,
        params?: {
            pagination?: PaginationParams;
            filters?: FilterParams;
            dateRange?: {
                startDate: Date;
                endDate: Date;
            };
        }
    ): Promise<ApiResponse<{ consultations: Consultation[]; total: number }>> {
        try {
            const consultationsRef = collection(db, this.CONSULTATIONS_COLLECTION);
            let q = query(consultationsRef, where('doctorId', '==', doctorId));

            // Apply date range filter
            if (params?.dateRange) {
                q = query(q, 
                    where('date', '>=', Timestamp.fromDate(params.dateRange.startDate)),
                    where('date', '<=', Timestamp.fromDate(params.dateRange.endDate))
                );
            }

            // Apply status filter
            if (params?.filters?.status) {
                q = query(q, where('status', '==', params.filters.status));
            }

            // Apply type filter
            if (params?.filters?.type) {
                q = query(q, where('type', '==', params.filters.type));
            }

            // Apply priority filter
            if (params?.filters?.priority) {
                q = query(q, where('priority', '==', params.filters.priority));
            }

            // Apply ordering
            const orderField = params?.filters?.sortBy || 'date';
            const orderDirection = params?.filters?.sortOrder || 'desc';
            q = query(q, orderBy(orderField, orderDirection as 'asc' | 'desc'));

            // Apply pagination
            if (params?.pagination?.limit) {
                q = query(q, firestoreLimit(params.pagination.limit));
            }

            const querySnapshot = await getDocs(q);
            const consultations: Consultation[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                consultations.push({
                    id: doc.id,
                    ...data,
                    // Convert Firestore timestamps to Date objects
                    date: data.date?.toDate() || new Date(),
                    actualStartTime: data.actualStartTime?.toDate(),
                    actualEndTime: data.actualEndTime?.toDate(),
                    followUpDate: data.followUpDate?.toDate(),
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                    patientSatisfaction: data.patientSatisfaction ? {
                        ...data.patientSatisfaction,
                        submittedAt: data.patientSatisfaction.submittedAt?.toDate()
                    } : undefined
                } as Consultation);
            });

            return {
                data: {
                    consultations,
                    total: querySnapshot.size
                }
            };
        } catch (error) {
            console.error('Error fetching doctor consultations:', error);
            return {
                error: { status: 500, message: 'Failed to fetch consultations' }
            };
        }
    }

    /**
     * Get today's consultations for a doctor
     */
    static async getTodayConsultations(doctorId: string): Promise<ApiResponse<Consultation[]>> {
        try {
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

            const result = await this.getDoctorConsultations(doctorId, {
                dateRange: { startDate: startOfDay, endDate: endOfDay },
                filters: { sortBy: 'startTime', sortOrder: 'asc' }
            });

            if (result.error) {
                return { error: result.error };
            }

            return { data: result.data?.consultations || [] };
        } catch (error) {
            console.error('Error fetching today consultations:', error);
            return {
                error: { status: 500, message: 'Failed to fetch today\'s consultations' }
            };
        }
    }

    /**
     * Update consultation status
     */
    static async updateConsultationStatus(
        consultationId: string,
        status: ConsultationStatus,
        updatedBy: string,
        additionalData?: {
            actualStartTime?: Date;
            actualEndTime?: Date;
            notes?: string;
        }
    ): Promise<ApiResponse<Consultation>> {
        try {
            const docRef = doc(db, this.CONSULTATIONS_COLLECTION, consultationId);
            
            const updateData: any = {
                status,
                updatedBy,
                updatedAt: serverTimestamp()
            };

            if (additionalData?.actualStartTime) {
                updateData.actualStartTime = Timestamp.fromDate(additionalData.actualStartTime);
            }

            if (additionalData?.actualEndTime) {
                updateData.actualEndTime = Timestamp.fromDate(additionalData.actualEndTime);
                
                // Calculate duration if both start and end times are available
                if (additionalData.actualStartTime) {
                    const duration = Math.round(
                        (additionalData.actualEndTime.getTime() - additionalData.actualStartTime.getTime()) / (1000 * 60)
                    );
                    updateData.duration = duration;
                }
            }

            if (additionalData?.notes) {
                updateData.notes = additionalData.notes;
            }

            await updateDoc(docRef, updateData);
            
            return await this.getConsultationById(consultationId);
        } catch (error) {
            console.error('Error updating consultation status:', error);
            return {
                error: { status: 500, message: 'Failed to update consultation status' }
            };
        }
    }

    /**
     * Update consultation details
     */
    static async updateConsultation(
        consultationId: string,
        updateData: Partial<Consultation>,
        updatedBy: string
    ): Promise<ApiResponse<Consultation>> {
        try {
            const docRef = doc(db, this.CONSULTATIONS_COLLECTION, consultationId);
            
            const sanitizedData: any = {
                ...updateData,
                updatedBy,
                updatedAt: serverTimestamp()
            };

            // Convert Date objects to Firestore Timestamps
            if (sanitizedData.date) {
                sanitizedData.date = Timestamp.fromDate(sanitizedData.date);
            }
            if (sanitizedData.actualStartTime) {
                sanitizedData.actualStartTime = Timestamp.fromDate(sanitizedData.actualStartTime);
            }
            if (sanitizedData.actualEndTime) {
                sanitizedData.actualEndTime = Timestamp.fromDate(sanitizedData.actualEndTime);
            }
            if (sanitizedData.followUpDate) {
                sanitizedData.followUpDate = Timestamp.fromDate(sanitizedData.followUpDate);
            }

            await updateDoc(docRef, sanitizedData);
            
            return await this.getConsultationById(consultationId);
        } catch (error) {
            console.error('Error updating consultation:', error);
            return {
                error: { status: 500, message: 'Failed to update consultation' }
            };
        }
    }

    /**
     * Get consultation with patient details
     */
    static async getConsultationWithPatient(
        consultationId: string
    ): Promise<ApiResponse<Consultation & { patient: PatientProfile }>> {
        try {
            const consultationResult = await this.getConsultationById(consultationId);
            
            if (consultationResult.error || !consultationResult.data) {
                return { error: consultationResult.error || { status: 404, message: 'Consultation not found' } };
            }

            const consultation = consultationResult.data;

            // Get patient details
            const patientDoc = await getDoc(doc(db, this.PATIENTS_COLLECTION, consultation.patientId));
            
            if (!patientDoc.exists()) {
                return {
                    error: { status: 404, message: 'Patient not found' }
                };
            }

            const patientData = patientDoc.data();
            const patient = {
                id: patientDoc.id,
                ...patientData,
                dateOfBirth: safeTimestampToDate(patientData.dateOfBirth, null),
                lastLogin: safeTimestampToDate(patientData.lastLogin, null),
                createdAt: safeTimestampToDate(patientData.createdAt, new Date()) as Date,
                updatedAt: safeTimestampToDate(patientData.updatedAt, new Date()) as Date
            } as PatientProfile;

            return {
                data: {
                    ...consultation,
                    patient
                }
            };
        } catch (error) {
            console.error('Error fetching consultation with patient:', error);
            return {
                error: { status: 500, message: 'Failed to fetch consultation with patient details' }
            };
        }
    }

    /**
     * Get upcoming consultations for a doctor
     */
    static async getUpcomingConsultations(
        doctorId: string,
        limit: number = 5
    ): Promise<ApiResponse<Consultation[]>> {
        try {
            const now = new Date();
            const consultationsRef = collection(db, this.CONSULTATIONS_COLLECTION);
            
            const q = query(
                consultationsRef,
                where('doctorId', '==', doctorId),
                where('date', '>=', Timestamp.fromDate(now)),
                where('status', 'in', ['scheduled', 'waiting']),
                orderBy('date', 'asc'),
                orderBy('startTime', 'asc'),
                firestoreLimit(limit)
            );

            const querySnapshot = await getDocs(q);
            const consultations: Consultation[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                consultations.push({
                    id: doc.id,
                    ...data,
                    date: data.date?.toDate() || new Date(),
                    actualStartTime: data.actualStartTime?.toDate(),
                    actualEndTime: data.actualEndTime?.toDate(),
                    followUpDate: data.followUpDate?.toDate(),
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                    patientSatisfaction: data.patientSatisfaction ? {
                        ...data.patientSatisfaction,
                        submittedAt: data.patientSatisfaction.submittedAt?.toDate()
                    } : undefined
                } as Consultation);
            });

            return { data: consultations };
        } catch (error) {
            console.error('Error fetching upcoming consultations:', error);
            return {
                error: { status: 500, message: 'Failed to fetch upcoming consultations' }
            };
        }
    }

    /**
     * Get consultation queue for a doctor
     */
    static async getConsultationQueue(
        doctorId: string,
        date?: Date
    ): Promise<ApiResponse<ConsultationQueue>> {
        try {
            const targetDate = date || new Date();
            const queueRef = collection(db, this.QUEUES_COLLECTION);
            
            const q = query(
                queueRef,
                where('doctorId', '==', doctorId),
                where('date', '==', Timestamp.fromDate(targetDate)),
                firestoreLimit(1)
            );

            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                // Create a new queue for the day
                return await this.createConsultationQueue(doctorId, targetDate);
            }

            const doc = querySnapshot.docs[0];
            const data = doc.data();
            
            return {
                data: {
                    id: doc.id,
                    ...data,
                    date: data.date?.toDate() || new Date(),
                    lastUpdated: data.lastUpdated?.toDate() || new Date(),
                    consultations: data.consultations?.map((c: any) => ({
                        ...c,
                        estimatedStartTime: c.estimatedStartTime?.toDate(),
                        checkedInAt: c.checkedInAt?.toDate()
                    })) || []
                } as ConsultationQueue
            };
        } catch (error) {
            console.error('Error fetching consultation queue:', error);
            return {
                error: { status: 500, message: 'Failed to fetch consultation queue' }
            };
        }
    }

    /**
     * Create consultation queue for a doctor
     */
    private static async createConsultationQueue(
        doctorId: string,
        date: Date
    ): Promise<ApiResponse<ConsultationQueue>> {
        try {
            const queueData = {
                doctorId,
                date: Timestamp.fromDate(date),
                consultations: [],
                totalEstimatedTime: 0,
                lastUpdated: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, this.QUEUES_COLLECTION), queueData);
            
            return {
                data: {
                    id: docRef.id,
                    doctorId,
                    date,
                    consultations: [],
                    totalEstimatedTime: 0,
                    lastUpdated: new Date()
                } as ConsultationQueue
            };
        } catch (error) {
            console.error('Error creating consultation queue:', error);
            return {
                error: { status: 500, message: 'Failed to create consultation queue' }
            };
        }
    }

    /**
     * Real-time listener for doctor's consultations
     */
    static subscribeToConsultations(
        doctorId: string,
        filters: {
            date?: Date;
            status?: ConsultationStatus[];
        },
        callback: (consultations: Consultation[]) => void
    ): () => void {
        try {
            const consultationsRef = collection(db, this.CONSULTATIONS_COLLECTION);
            let q = query(consultationsRef, where('doctorId', '==', doctorId));

            if (filters.date) {
                const startOfDay = new Date(filters.date.getFullYear(), filters.date.getMonth(), filters.date.getDate());
                const endOfDay = new Date(filters.date.getFullYear(), filters.date.getMonth(), filters.date.getDate(), 23, 59, 59);
                
                q = query(q, 
                    where('date', '>=', Timestamp.fromDate(startOfDay)),
                    where('date', '<=', Timestamp.fromDate(endOfDay))
                );
            }

            if (filters.status && filters.status.length > 0) {
                q = query(q, where('status', 'in', filters.status));
            }

            q = query(q, orderBy('date', 'asc'), orderBy('startTime', 'asc'));

            return onSnapshot(q, (querySnapshot) => {
                const consultations: Consultation[] = [];
                
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    consultations.push({
                        id: doc.id,
                        ...data,
                        date: data.date?.toDate() || new Date(),
                        actualStartTime: data.actualStartTime?.toDate(),
                        actualEndTime: data.actualEndTime?.toDate(),
                        followUpDate: data.followUpDate?.toDate(),
                        createdAt: data.createdAt?.toDate() || new Date(),
                        updatedAt: data.updatedAt?.toDate() || new Date(),
                        patientSatisfaction: data.patientSatisfaction ? {
                            ...data.patientSatisfaction,
                            submittedAt: data.patientSatisfaction.submittedAt?.toDate()
                        } : undefined
                    } as Consultation);
                });

                callback(consultations);
            });
        } catch (error) {
            console.error('Error setting up consultation subscription:', error);
            callback([]);
            return () => {};
        }
    }

    /**
     * Get consultation analytics for a doctor
     */
    static async getConsultationAnalytics(
        doctorId: string,
        dateRange: {
            startDate: Date;
            endDate: Date;
        }
    ): Promise<ApiResponse<ConsultationAnalytics>> {
        try {
            const consultationsRef = collection(db, this.CONSULTATIONS_COLLECTION);
            const q = query(
                consultationsRef,
                where('doctorId', '==', doctorId),
                where('date', '>=', Timestamp.fromDate(dateRange.startDate)),
                where('date', '<=', Timestamp.fromDate(dateRange.endDate))
            );

            const querySnapshot = await getDocs(q);
            const consultations: Consultation[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                consultations.push({
                    id: doc.id,
                    ...data,
                    date: data.date?.toDate() || new Date(),
                    actualStartTime: data.actualStartTime?.toDate(),
                    actualEndTime: data.actualEndTime?.toDate(),
                    followUpDate: data.followUpDate?.toDate(),
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                    patientSatisfaction: data.patientSatisfaction ? {
                        ...data.patientSatisfaction,
                        submittedAt: data.patientSatisfaction.submittedAt?.toDate()
                    } : undefined
                } as Consultation);
            });

            // Calculate analytics
            const analytics = this.calculateConsultationAnalytics(consultations, dateRange);

            return { data: analytics };
        } catch (error) {
            console.error('Error fetching consultation analytics:', error);
            return {
                error: { status: 500, message: 'Failed to fetch consultation analytics' }
            };
        }
    }

    /**
     * Calculate consultation analytics
     */
    private static calculateConsultationAnalytics(
        consultations: Consultation[],
        dateRange: { startDate: Date; endDate: Date }
    ): ConsultationAnalytics {
        const total = consultations.length;
        const completed = consultations.filter(c => c.status === 'completed').length;
        const cancelled = consultations.filter(c => c.status === 'cancelled').length;
        const noShow = consultations.filter(c => c.status === 'no_show').length;

        // Calculate average duration
        const completedWithDuration = consultations.filter(c => c.status === 'completed' && c.duration);
        const averageDuration = completedWithDuration.length > 0 
            ? completedWithDuration.reduce((sum, c) => sum + (c.duration || 0), 0) / completedWithDuration.length
            : 0;

        // Calculate average wait time (placeholder - would need more data)
        const averageWaitTime = 0;

        // Group by type
        const typeMap = new Map<ConsultationType, { count: number; totalDuration: number }>();
        consultations.forEach(c => {
            const existing = typeMap.get(c.type) || { count: 0, totalDuration: 0 };
            typeMap.set(c.type, {
                count: existing.count + 1,
                totalDuration: existing.totalDuration + (c.duration || 0)
            });
        });

        const consultationsByType = Array.from(typeMap.entries()).map(([type, data]) => ({
            type,
            count: data.count,
            averageDuration: data.count > 0 ? data.totalDuration / data.count : 0
        }));

        // Group by priority
        const priorityMap = new Map<ConsultationPriority, { count: number; totalDuration: number }>();
        consultations.forEach(c => {
            const existing = priorityMap.get(c.priority) || { count: 0, totalDuration: 0 };
            priorityMap.set(c.priority, {
                count: existing.count + 1,
                totalDuration: existing.totalDuration + (c.duration || 0)
            });
        });

        const consultationsByPriority = Array.from(priorityMap.entries()).map(([priority, data]) => ({
            priority,
            count: data.count,
            averageDuration: data.count > 0 ? data.totalDuration / data.count : 0
        }));

        // Calculate patient satisfaction average
        const withSatisfaction = consultations.filter(c => c.patientSatisfaction?.rating);
        const patientSatisfactionAverage = withSatisfaction.length > 0
            ? withSatisfaction.reduce((sum, c) => sum + (c.patientSatisfaction?.rating || 0), 0) / withSatisfaction.length
            : 0;

        // Calculate follow-up rate
        const followUpRate = total > 0 ? (consultations.filter(c => c.followUpNeeded).length / total) * 100 : 0;

        // Calculate prescription rate
        const prescriptionRate = total > 0 ? (consultations.filter(c => c.prescriptions && c.prescriptions.length > 0).length / total) * 100 : 0;

        // Calculate referral rate
        const referralRate = total > 0 ? (consultations.filter(c => c.referrals && c.referrals.length > 0).length / total) * 100 : 0;

        return {
            period: dateRange,
            totalConsultations: total,
            completedConsultations: completed,
            cancelledConsultations: cancelled,
            noShowConsultations: noShow,
            averageDuration,
            averageWaitTime,
            consultationsByType,
            consultationsByPriority,
            patientSatisfactionAverage,
            peakHours: [], // Would need more analysis
            diagnoses: [], // Would need more analysis
            followUpRate,
            prescriptionRate,
            referralRate
        };
    }

    /**
     * Search consultations by patient name or consultation details
     */
    static async searchConsultations(
        doctorId: string,
        searchTerm: string,
        limit: number = 20
    ): Promise<ApiResponse<Consultation[]>> {
        try {
            // Note: This is a simplified search. In a production environment,
            // you might want to use a search service like Algolia or Elasticsearch
            const consultationsRef = collection(db, this.CONSULTATIONS_COLLECTION);
            const q = query(
                consultationsRef,
                where('doctorId', '==', doctorId),
                orderBy('date', 'desc'),
                firestoreLimit(limit)
            );

            const querySnapshot = await getDocs(q);
            const consultations: Consultation[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const consultation = {
                    id: doc.id,
                    ...data,
                    date: data.date?.toDate() || new Date(),
                    actualStartTime: data.actualStartTime?.toDate(),
                    actualEndTime: data.actualEndTime?.toDate(),
                    followUpDate: data.followUpDate?.toDate(),
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                    patientSatisfaction: data.patientSatisfaction ? {
                        ...data.patientSatisfaction,
                        submittedAt: data.patientSatisfaction.submittedAt?.toDate()
                    } : undefined
                } as Consultation;

                // Simple client-side filtering (in production, this should be server-side)
                if (
                    consultation.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    consultation.chiefComplaint?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    consultation.diagnosis?.some(d => d.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    consultation.notes?.toLowerCase().includes(searchTerm.toLowerCase())
                ) {
                    consultations.push(consultation);
                }
            });

            return { data: consultations };
        } catch (error) {
            console.error('Error searching consultations:', error);
            return {
                error: { status: 500, message: 'Failed to search consultations' }
            };
        }
    }
}

export default ConsultationService;
