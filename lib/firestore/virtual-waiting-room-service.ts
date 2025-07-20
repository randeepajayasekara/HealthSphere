/**
 * Virtual Waiting Room Service - Firestore Integration
 * Provides real-time virtual waiting room functionality for doctors
 * with comprehensive patient queue management and telemedicine integration.
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
import { 
    TelemedicineSession,
    TelemedicineSessionStatus,
    PatientProfile,
    DoctorProfile,
    ApiResponse,
    PaginationParams,
    FilterParams
} from '@/app/types';

export interface VirtualWaitingRoomPatient {
    id: string;
    patientId: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    patientAvatar?: string;
    sessionId: string;
    doctorId: string;
    joinedAt: Date;
    estimatedWaitTime: number; // in minutes
    actualWaitTime?: number; // in minutes
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'waiting' | 'ready' | 'in_consultation' | 'completed' | 'cancelled';
    consultationType: 'general' | 'follow_up' | 'emergency' | 'specialist';
    symptoms?: string;
    notes?: string;
    patientDeviceInfo?: {
        hasCamera: boolean;
        hasMicrophone: boolean;
        browserInfo: string;
        connectionQuality: 'good' | 'fair' | 'poor';
    };
    meetingRoomId?: string;
    jitsiRoomName?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface VirtualWaitingRoomStats {
    totalPatientsWaiting: number;
    averageWaitTime: number;
    longestWaitTime: number;
    patientsServedToday: number;
    consultationsCompleted: number;
    averageConsultationDuration: number;
}

export class VirtualWaitingRoomService {
    private static readonly WAITING_ROOM_COLLECTION = 'virtual_waiting_room';
    private static readonly TELEMEDICINE_SESSIONS_COLLECTION = 'telemedicine_sessions';
    private static readonly PATIENTS_COLLECTION = 'patients';
    private static readonly DOCTORS_COLLECTION = 'doctors';

    /**
     * Get all patients in virtual waiting room for a doctor
     */
    static async getWaitingRoomPatients(
        doctorId: string,
        filters?: FilterParams
    ): Promise<ApiResponse<VirtualWaitingRoomPatient[]>> {
        try {
            let q = query(
                collection(db, this.WAITING_ROOM_COLLECTION),
                where('doctorId', '==', doctorId),
                where('status', 'in', ['waiting', 'ready']),
                orderBy('joinedAt', 'asc')
            );

            if (filters?.priority) {
                q = query(q, where('priority', '==', filters.priority));
            }

            const querySnapshot = await getDocs(q);
            const patients: VirtualWaitingRoomPatient[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                patients.push({
                    id: doc.id,
                    ...data,
                    joinedAt: data.joinedAt?.toDate() || new Date(),
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date()
                } as VirtualWaitingRoomPatient);
            });

            return { data: patients };
        } catch (error) {
            console.error('Error fetching waiting room patients:', error);
            return {
                error: { status: 500, message: 'Failed to fetch waiting room patients' }
            };
        }
    }

    /**
     * Real-time subscription to waiting room updates
     */
    static subscribeToWaitingRoom(
        doctorId: string,
        callback: (patients: VirtualWaitingRoomPatient[]) => void,
        errorCallback?: (error: Error) => void
    ): () => void {
        const q = query(
            collection(db, this.WAITING_ROOM_COLLECTION),
            where('doctorId', '==', doctorId),
            where('status', 'in', ['waiting', 'ready']),
            orderBy('joinedAt', 'asc')
        );

        return onSnapshot(q, (snapshot) => {
            const patients: VirtualWaitingRoomPatient[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                patients.push({
                    id: doc.id,
                    ...data,
                    joinedAt: data.joinedAt?.toDate() || new Date(),
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date()
                } as VirtualWaitingRoomPatient);
            });
            callback(patients);
        }, (error) => {
            console.error('Error in waiting room subscription:', error);
            if (errorCallback) errorCallback(error);
        });
    }

    /**
     * Add patient to virtual waiting room
     */
    static async addPatientToWaitingRoom(
        patientData: Omit<VirtualWaitingRoomPatient, 'id' | 'createdAt' | 'updatedAt' | 'joinedAt'>
    ): Promise<ApiResponse<VirtualWaitingRoomPatient>> {
        try {
            const docRef = await addDoc(collection(db, this.WAITING_ROOM_COLLECTION), {
                ...patientData,
                joinedAt: serverTimestamp(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            const createdPatient = await this.getWaitingRoomPatientById(docRef.id);
            return createdPatient;
        } catch (error) {
            console.error('Error adding patient to waiting room:', error);
            return {
                error: { status: 500, message: 'Failed to add patient to waiting room' }
            };
        }
    }

    /**
     * Get waiting room patient by ID
     */
    static async getWaitingRoomPatientById(
        patientId: string
    ): Promise<ApiResponse<VirtualWaitingRoomPatient>> {
        try {
            const docRef = doc(db, this.WAITING_ROOM_COLLECTION, patientId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                return {
                    data: {
                        id: docSnap.id,
                        ...data,
                        joinedAt: data.joinedAt?.toDate() || new Date(),
                        createdAt: data.createdAt?.toDate() || new Date(),
                        updatedAt: data.updatedAt?.toDate() || new Date()
                    } as VirtualWaitingRoomPatient
                };
            } else {
                return {
                    error: { status: 404, message: 'Patient not found in waiting room' }
                };
            }
        } catch (error) {
            console.error('Error fetching waiting room patient:', error);
            return {
                error: { status: 500, message: 'Failed to fetch waiting room patient' }
            };
        }
    }

    /**
     * Update patient status in waiting room
     */
    static async updatePatientStatus(
        patientId: string,
        status: VirtualWaitingRoomPatient['status'],
        additionalData?: Partial<VirtualWaitingRoomPatient>
    ): Promise<ApiResponse<VirtualWaitingRoomPatient>> {
        try {
            const docRef = doc(db, this.WAITING_ROOM_COLLECTION, patientId);
            const updateData = {
                status,
                ...additionalData,
                updatedAt: serverTimestamp()
            };

            if (status === 'in_consultation') {
                updateData.actualWaitTime = Date.now() - (additionalData?.joinedAt?.getTime() || 0);
            }

            await updateDoc(docRef, updateData);
            
            return await this.getWaitingRoomPatientById(patientId);
        } catch (error) {
            console.error('Error updating patient status:', error);
            return {
                error: { status: 500, message: 'Failed to update patient status' }
            };
        }
    }

    /**
     * Remove patient from waiting room
     */
    static async removePatientFromWaitingRoom(patientId: string): Promise<ApiResponse<void>> {
        try {
            const docRef = doc(db, this.WAITING_ROOM_COLLECTION, patientId);
            await deleteDoc(docRef);
            return { data: undefined };
        } catch (error) {
            console.error('Error removing patient from waiting room:', error);
            return {
                error: { status: 500, message: 'Failed to remove patient from waiting room' }
            };
        }
    }

    /**
     * Update patient priority in waiting room
     */
    static async updatePatientPriority(
        patientId: string,
        priority: VirtualWaitingRoomPatient['priority']
    ): Promise<ApiResponse<VirtualWaitingRoomPatient>> {
        try {
            const docRef = doc(db, this.WAITING_ROOM_COLLECTION, patientId);
            await updateDoc(docRef, {
                priority,
                updatedAt: serverTimestamp()
            });
            
            return await this.getWaitingRoomPatientById(patientId);
        } catch (error) {
            console.error('Error updating patient priority:', error);
            return {
                error: { status: 500, message: 'Failed to update patient priority' }
            };
        }
    }

    /**
     * Create Jitsi meeting room for patient
     */
    static async createMeetingRoom(
        patientId: string,
        doctorId: string
    ): Promise<ApiResponse<{ roomName: string; meetingUrl: string }>> {
        try {
            const roomName = `healthsphere-${doctorId}-${patientId}-${Date.now()}`;
            const meetingUrl = `https://meet.jit.si/${roomName}`;

            // Update patient record with meeting details
            await this.updatePatientStatus(patientId, 'ready', {
                meetingRoomId: roomName,
                jitsiRoomName: roomName
            });

            return {
                data: {
                    roomName,
                    meetingUrl
                }
            };
        } catch (error) {
            console.error('Error creating meeting room:', error);
            return {
                error: { status: 500, message: 'Failed to create meeting room' }
            };
        }
    }

    /**
     * Get waiting room statistics
     */
    static async getWaitingRoomStats(doctorId: string): Promise<ApiResponse<VirtualWaitingRoomStats>> {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Get current waiting patients
            const waitingQuery = query(
                collection(db, this.WAITING_ROOM_COLLECTION),
                where('doctorId', '==', doctorId),
                where('status', 'in', ['waiting', 'ready'])
            );

            // Get today's completed consultations
            const completedQuery = query(
                collection(db, this.WAITING_ROOM_COLLECTION),
                where('doctorId', '==', doctorId),
                where('status', '==', 'completed'),
                where('createdAt', '>=', Timestamp.fromDate(today))
            );

            const [waitingSnapshot, completedSnapshot] = await Promise.all([
                getDocs(waitingQuery),
                getDocs(completedQuery)
            ]);

            const waitingPatients = waitingSnapshot.docs.map(doc => ({
                ...doc.data(),
                joinedAt: doc.data().joinedAt?.toDate() || new Date()
            }));

            const completedPatients = completedSnapshot.docs.map(doc => ({
                ...doc.data(),
                joinedAt: doc.data().joinedAt?.toDate() || new Date(),
                actualWaitTime: doc.data().actualWaitTime || 0
            }));

            const now = new Date();
            const waitTimes = waitingPatients.map(p => 
                Math.floor((now.getTime() - p.joinedAt.getTime()) / (1000 * 60))
            );

            const completedWaitTimes = completedPatients.map(p => 
                Math.floor(p.actualWaitTime / (1000 * 60))
            );

            const allWaitTimes = [...waitTimes, ...completedWaitTimes];

            const stats: VirtualWaitingRoomStats = {
                totalPatientsWaiting: waitingPatients.length,
                averageWaitTime: allWaitTimes.length > 0 ? 
                    Math.round(allWaitTimes.reduce((sum, time) => sum + time, 0) / allWaitTimes.length) : 0,
                longestWaitTime: waitTimes.length > 0 ? Math.max(...waitTimes) : 0,
                patientsServedToday: completedPatients.length,
                consultationsCompleted: completedPatients.length,
                averageConsultationDuration: 25 // This would be calculated from actual session data
            };

            return { data: stats };
        } catch (error) {
            console.error('Error fetching waiting room stats:', error);
            return {
                error: { status: 500, message: 'Failed to fetch waiting room statistics' }
            };
        }
    }

    /**
     * Seed dummy data for testing
     */
    static async seedDummyData(doctorId: string): Promise<ApiResponse<void>> {
        try {
            const dummyPatients = [
                {
                    patientId: 'patient1',
                    patientName: 'John Doe',
                    patientEmail: 'john.doe@example.com',
                    patientPhone: '+1234567890',
                    sessionId: 'session1',
                    doctorId,
                    estimatedWaitTime: 15,
                    priority: 'medium' as const,
                    status: 'waiting' as const,
                    consultationType: 'general' as const,
                    symptoms: 'Regular checkup and health screening',
                    patientDeviceInfo: {
                        hasCamera: true,
                        hasMicrophone: true,
                        browserInfo: 'Chrome 91.0',
                        connectionQuality: 'good' as const
                    }
                },
                {
                    patientId: 'patient2',
                    patientName: 'Jane Smith',
                    patientEmail: 'jane.smith@example.com',
                    patientPhone: '+1234567891',
                    sessionId: 'session2',
                    doctorId,
                    estimatedWaitTime: 10,
                    priority: 'high' as const,
                    status: 'waiting' as const,
                    consultationType: 'follow_up' as const,
                    symptoms: 'Follow-up on recent lab results',
                    patientDeviceInfo: {
                        hasCamera: true,
                        hasMicrophone: false,
                        browserInfo: 'Firefox 89.0',
                        connectionQuality: 'fair' as const
                    }
                },
                {
                    patientId: 'patient3',
                    patientName: 'Robert Johnson',
                    patientEmail: 'robert.johnson@example.com',
                    patientPhone: '+1234567892',
                    sessionId: 'session3',
                    doctorId,
                    estimatedWaitTime: 5,
                    priority: 'urgent' as const,
                    status: 'waiting' as const,
                    consultationType: 'emergency' as const,
                    symptoms: 'Chest pain and shortness of breath',
                    patientDeviceInfo: {
                        hasCamera: true,
                        hasMicrophone: true,
                        browserInfo: 'Safari 14.1',
                        connectionQuality: 'good' as const
                    }
                }
            ];

            const batch = writeBatch(db);

            dummyPatients.forEach(patient => {
                const docRef = doc(collection(db, this.WAITING_ROOM_COLLECTION));
                batch.set(docRef, {
                    ...patient,
                    joinedAt: serverTimestamp(),
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
            });

            await batch.commit();

            return { data: undefined };
        } catch (error) {
            console.error('Error seeding dummy data:', error);
            return {
                error: { status: 500, message: 'Failed to seed dummy data' }
            };
        }
    }
}
