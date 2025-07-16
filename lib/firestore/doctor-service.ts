/**
 * Doctor Service - Firestore Integration
 * Provides comprehensive doctor-specific functionality with modular design
 * for easy integration with other healthcare roles and features.
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
    limit,
    startAfter,
    onSnapshot,
    Timestamp,
    writeBatch,
    runTransaction
} from 'firebase/firestore';
import { db } from '@/backend/config';
import { 
    DoctorProfile, 
    PatientProfile,
    Appointment, 
    Prescription, 
    MedicalRecord, 
    LabResult,
    QueryParams,
    ApiResponse,
    PaginationParams,
    FilterParams
} from '@/app/types';

export class DoctorService {
    private static readonly COLLECTION = 'doctors';
    private static readonly PATIENTS_COLLECTION = 'patients';
    private static readonly APPOINTMENTS_COLLECTION = 'appointments';
    private static readonly PRESCRIPTIONS_COLLECTION = 'prescriptions';
    private static readonly MEDICAL_RECORDS_COLLECTION = 'medical_records';
    private static readonly LAB_RESULTS_COLLECTION = 'lab_results';

    /**
     * Get doctor profile by ID
     */
    static async getDoctorProfile(doctorId: string): Promise<ApiResponse<DoctorProfile>> {
        try {
            const docRef = doc(db, this.COLLECTION, doctorId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                return {
                    data: { id: docSnap.id, ...docSnap.data() } as DoctorProfile
                };
            } else {
                return {
                    error: { status: 404, message: 'Doctor not found' }
                };
            }
        } catch (error) {
            console.error('Error fetching doctor profile:', error);
            return {
                error: { status: 500, message: 'Failed to fetch doctor profile' }
            };
        }
    }

    /**
     * Update doctor profile
     */
    static async updateDoctorProfile(
        doctorId: string, 
        updateData: Partial<DoctorProfile>
    ): Promise<ApiResponse<DoctorProfile>> {
        try {
            const docRef = doc(db, this.COLLECTION, doctorId);
            const sanitizedData = {
                ...updateData,
                updatedAt: Timestamp.now(),
                lastModifiedBy: doctorId
            };
            
            await updateDoc(docRef, sanitizedData);
            
            return await this.getDoctorProfile(doctorId);
        } catch (error) {
            console.error('Error updating doctor profile:', error);
            return {
                error: { status: 500, message: 'Failed to update doctor profile' }
            };
        }
    }

    /**
     * Get doctor's patients with filtering and pagination
     */
    static async getDoctorPatients(
        doctorId: string,
        queryParams?: QueryParams
    ): Promise<ApiResponse<PatientProfile[]>> {
        try {
            let patientsQuery = query(
                collection(db, this.PATIENTS_COLLECTION),
                where('primaryDoctorId', '==', doctorId)
            );

            // Apply filters
            if (queryParams?.filter) {
                patientsQuery = this.applyPatientFilters(patientsQuery, queryParams.filter);
            }

            // Apply sorting
            if (queryParams?.sort) {
                patientsQuery = query(
                    patientsQuery,
                    orderBy(queryParams.sort.field, queryParams.sort.direction)
                );
            } else {
                patientsQuery = query(patientsQuery, orderBy('lastName', 'asc'));
            }

            // Apply pagination
            if (queryParams?.pagination?.limit) {
                patientsQuery = query(patientsQuery, limit(queryParams.pagination.limit));
            }

            const querySnapshot = await getDocs(patientsQuery);
            const patients = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as PatientProfile[];

            return {
                data: patients,
                meta: {
                    pagination: {
                        page: queryParams?.pagination?.page || 1,
                        limit: queryParams?.pagination?.limit || 10,
                        totalItems: patients.length
                    }
                }
            };
        } catch (error) {
            console.error('Error fetching doctor patients:', error);
            return {
                error: { status: 500, message: 'Failed to fetch patients' }
            };
        }
    }

    /**
     * Get doctor's appointments with filtering
     */
    static async getDoctorAppointments(
        doctorId: string,
        queryParams?: QueryParams
    ): Promise<ApiResponse<Appointment[]>> {
        try {
            let appointmentsQuery = query(
                collection(db, this.APPOINTMENTS_COLLECTION),
                where('doctorId', '==', doctorId)
            );

            // Apply date filtering for today's appointments by default
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            if (!queryParams?.filter?.dateRange) {
                appointmentsQuery = query(
                    appointmentsQuery,
                    where('date', '>=', Timestamp.fromDate(today)),
                    where('date', '<', Timestamp.fromDate(tomorrow))
                );
            }

            appointmentsQuery = query(appointmentsQuery, orderBy('date', 'asc'));

            const querySnapshot = await getDocs(appointmentsQuery);
            const appointments = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date?.toDate(),
                createdAt: doc.data().createdAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate()
            })) as Appointment[];

            return { data: appointments };
        } catch (error) {
            console.error('Error fetching doctor appointments:', error);
            return {
                error: { status: 500, message: 'Failed to fetch appointments' }
            };
        }
    }

    /**
     * Create new prescription
     */
    static async createPrescription(
        prescriptionData: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<ApiResponse<Prescription>> {
        try {
            const prescriptionWithTimestamps = {
                ...prescriptionData,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                status: 'active' as const
            };

            const docRef = await addDoc(
                collection(db, this.PRESCRIPTIONS_COLLECTION),
                prescriptionWithTimestamps
            );

            return {
                data: {
                    id: docRef.id,
                    ...prescriptionWithTimestamps,
                    createdAt: prescriptionWithTimestamps.createdAt.toDate(),
                    updatedAt: prescriptionWithTimestamps.updatedAt.toDate()
                } as Prescription
            };
        } catch (error) {
            console.error('Error creating prescription:', error);
            return {
                error: { status: 500, message: 'Failed to create prescription' }
            };
        }
    }

    /**
     * Create medical record
     */
    static async createMedicalRecord(
        recordData: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<ApiResponse<MedicalRecord>> {
        try {
            const recordWithTimestamps = {
                ...recordData,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            const docRef = await addDoc(
                collection(db, this.MEDICAL_RECORDS_COLLECTION),
                recordWithTimestamps
            );

            return {
                data: {
                    id: docRef.id,
                    ...recordWithTimestamps,
                    date: recordWithTimestamps.date || recordWithTimestamps.createdAt.toDate(),
                    createdAt: recordWithTimestamps.createdAt.toDate(),
                    updatedAt: recordWithTimestamps.updatedAt.toDate()
                } as MedicalRecord
            };
        } catch (error) {
            console.error('Error creating medical record:', error);
            return {
                error: { status: 500, message: 'Failed to create medical record' }
            };
        }
    }

    /**
     * Get patient lab results for doctor review
     */
    static async getPatientLabResults(
        patientId: string,
        doctorId: string,
        queryParams?: QueryParams
    ): Promise<ApiResponse<LabResult[]>> {
        try {
            let labQuery = query(
                collection(db, this.LAB_RESULTS_COLLECTION),
                where('patientId', '==', patientId)
            );

            // Add ordering by date (most recent first)
            labQuery = query(labQuery, orderBy('resultDate', 'desc'));

            // Apply pagination
            if (queryParams?.pagination?.limit) {
                labQuery = query(labQuery, limit(queryParams.pagination.limit));
            }

            const querySnapshot = await getDocs(labQuery);
            const labResults = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                testDate: doc.data().testDate?.toDate(),
                resultDate: doc.data().resultDate?.toDate(),
                date: doc.data().date?.toDate(),
                createdAt: doc.data().createdAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate()
            })) as LabResult[];

            return { data: labResults };
        } catch (error) {
            console.error('Error fetching lab results:', error);
            return {
                error: { status: 500, message: 'Failed to fetch lab results' }
            };
        }
    }

    /**
     * Update appointment status
     */
    static async updateAppointmentStatus(
        appointmentId: string,
        status: Appointment['status'],
        notes?: string
    ): Promise<ApiResponse<Appointment>> {
        try {
            const docRef = doc(db, this.APPOINTMENTS_COLLECTION, appointmentId);
            const updateData = {
                status,
                updatedAt: Timestamp.now(),
                ...(notes && { notes })
            };

            await updateDoc(docRef, updateData);

            const updatedDoc = await getDoc(docRef);
            const appointmentData = updatedDoc.data();

            return {
                data: {
                    id: updatedDoc.id,
                    ...appointmentData,
                    date: appointmentData?.date?.toDate(),
                    createdAt: appointmentData?.createdAt?.toDate(),
                    updatedAt: appointmentData?.updatedAt?.toDate()
                } as Appointment
            };
        } catch (error) {
            console.error('Error updating appointment status:', error);
            return {
                error: { status: 500, message: 'Failed to update appointment' }
            };
        }
    }

    /**
     * Get doctor analytics and statistics
     */
    static async getDoctorAnalytics(
        doctorId: string,
        dateRange?: { startDate: Date; endDate: Date }
    ): Promise<ApiResponse<DoctorAnalytics>> {
        try {
            const endDate = dateRange?.endDate || new Date();
            const startDate = dateRange?.startDate || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

            // Get appointments count
            const appointmentsQuery = query(
                collection(db, this.APPOINTMENTS_COLLECTION),
                where('doctorId', '==', doctorId),
                where('date', '>=', Timestamp.fromDate(startDate)),
                where('date', '<=', Timestamp.fromDate(endDate))
            );

            const appointmentsSnapshot = await getDocs(appointmentsQuery);
            const appointments = appointmentsSnapshot.docs.map(doc => doc.data()) as Appointment[];

            // Get patients count
            const patientsQuery = query(
                collection(db, this.PATIENTS_COLLECTION),
                where('primaryDoctorId', '==', doctorId)
            );
            const patientsSnapshot = await getDocs(patientsQuery);

            // Get prescriptions count
            const prescriptionsQuery = query(
                collection(db, this.PRESCRIPTIONS_COLLECTION),
                where('doctorId', '==', doctorId),
                where('date', '>=', Timestamp.fromDate(startDate)),
                where('date', '<=', Timestamp.fromDate(endDate))
            );
            const prescriptionsSnapshot = await getDocs(prescriptionsQuery);

            const analytics: DoctorAnalytics = {
                totalPatients: patientsSnapshot.size,
                totalAppointments: appointments.length,
                completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
                cancelledAppointments: appointments.filter(apt => apt.status === 'cancelled').length,
                totalPrescriptions: prescriptionsSnapshot.size,
                averageConsultationTime: this.calculateAverageConsultationTime(appointments),
                patientSatisfactionRating: 0, // TODO: Implement patient feedback system
                periodStart: startDate,
                periodEnd: endDate
            };

            return { data: analytics };
        } catch (error) {
            console.error('Error fetching doctor analytics:', error);
            return {
                error: { status: 500, message: 'Failed to fetch analytics' }
            };
        }
    }

    /**
     * Real-time subscription to doctor's appointments
     */
    static subscribeToTodayAppointments(
        doctorId: string,
        callback: (appointments: Appointment[]) => void
    ): () => void {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const appointmentsQuery = query(
            collection(db, this.APPOINTMENTS_COLLECTION),
            where('doctorId', '==', doctorId),
            where('date', '>=', Timestamp.fromDate(today)),
            where('date', '<', Timestamp.fromDate(tomorrow)),
            orderBy('date', 'asc')
        );

        return onSnapshot(appointmentsQuery, (snapshot) => {
            const appointments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date?.toDate(),
                createdAt: doc.data().createdAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate()
            })) as Appointment[];
            
            callback(appointments);
        });
    }

    /**
     * Private helper methods
     */
    private static applyPatientFilters(query: any, filters: FilterParams): any {
        // Add patient-specific filters as needed
        if (filters.bloodType) {
            query = query.where('bloodType', '==', filters.bloodType);
        }
        if (filters.ageRange) {
            // Implement age range filtering logic
        }
        return query;
    }

    private static calculateAverageConsultationTime(appointments: Appointment[]): number {
        const completedAppointments = appointments.filter(apt => apt.status === 'completed');
        if (completedAppointments.length === 0) return 0;

        // This would need actual start/end times in the appointment data
        // For now, return a placeholder
        return 30; // minutes
    }
}

/**
 * Doctor Analytics Interface
 */
export interface DoctorAnalytics {
    totalPatients: number;
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    totalPrescriptions: number;
    averageConsultationTime: number;
    patientSatisfactionRating: number;
    periodStart: Date;
    periodEnd: Date;
}

export default DoctorService;
