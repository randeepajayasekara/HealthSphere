/**
 * Doctor UMID Service - Firestore Integration
 * Handles UMID scanning and patient medical data access for doctors
 */

import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    addDoc, 
    updateDoc, 
    query, 
    where, 
    orderBy, 
    limit,
    Timestamp,
    serverTimestamp,
    writeBatch
} from 'firebase/firestore';
import { db } from '@/backend/config';
import { 
    UniversalMedicalID, 
    PatientProfile, 
    MedicalRecord,
    ApiResponse
} from '@/app/types';

export interface UMIDScanResult {
    umid: UniversalMedicalID;
    patient: PatientProfile;
    medicalRecords: MedicalRecord[];
    lastAccessed: Date;
    accessAuthorized: boolean;
    emergencyAccess: boolean;
}

export interface ScanHistory {
    id: string;
    umidId: string;
    patientId: string;
    patientName: string;
    scannedAt: Date;
    scanMethod: 'qr' | 'manual' | 'nfc';
    accessType: 'authorized' | 'emergency' | 'denied';
    doctorId: string;
    notes?: string;
}

export interface DeviceInfo {
    id: string;
    type: 'mobile' | 'tablet' | 'desktop';
    name: string;
    isOnline: boolean;
    lastSeen: Date;
    capabilities: string[];
}

export interface ScanOptions {
    scanMethod: 'qr' | 'manual' | 'nfc';
    emergencyAccess?: boolean;
}

export interface EmergencyAccessRequest {
    reason: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface AuditLogEntry {
    id: string;
    umidId: string;
    doctorId: string;
    doctorName: string;
    action: 'scan' | 'access' | 'emergency' | 'deny';
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
    details?: Record<string, any>;
}

export class DoctorUMIDService {
    private static readonly UMID_COLLECTION = 'umids';
    private static readonly PATIENTS_COLLECTION = 'patients';
    private static readonly MEDICAL_RECORDS_COLLECTION = 'medical_records';
    private static readonly SCAN_HISTORY_COLLECTION = 'umid_scan_history';
    private static readonly DEVICES_COLLECTION = 'doctor_devices';
    private static readonly AUDIT_LOG_COLLECTION = 'umid_audit_log';

    /**
     * Scan UMID and retrieve patient data
     */
    static async scanUMID(
        umidCode: string,
        doctorId: string,
        options: ScanOptions
    ): Promise<ApiResponse<UMIDScanResult>> {
        try {
            // Find UMID document
            const umidQuery = query(
                collection(db, this.UMID_COLLECTION),
                where('id', '==', umidCode),
                limit(1)
            );
            
            const umidSnapshot = await getDocs(umidQuery);
            
            if (umidSnapshot.empty) {
                await this.logScanAttempt(umidCode, doctorId, 'denied', options.scanMethod, 'UMID not found');
                return {
                    error: { status: 404, message: 'UMID not found' }
                };
            }

            const umidDoc = umidSnapshot.docs[0];
            const umidData = umidDoc.data() as UniversalMedicalID;

            // Get patient data
            const patientDoc = await getDoc(doc(db, this.PATIENTS_COLLECTION, umidData.patientId));
            if (!patientDoc.exists()) {
                return {
                    error: { status: 404, message: 'Patient not found' }
                };
            }

            const patientData = patientDoc.data() as PatientProfile;

            // Check access authorization
            const accessAuthorized = await this.checkAccess(doctorId, umidData.patientId, options.emergencyAccess);
            
            if (!accessAuthorized && !options.emergencyAccess) {
                await this.logScanAttempt(umidCode, doctorId, 'denied', options.scanMethod, 'Access denied');
                return {
                    error: { status: 403, message: 'Access denied' }
                };
            }

            // Get medical records
            const medicalRecordsQuery = query(
                collection(db, this.MEDICAL_RECORDS_COLLECTION),
                where('patientId', '==', umidData.patientId),
                orderBy('date', 'desc'),
                limit(10)
            );
            
            const medicalRecordsSnapshot = await getDocs(medicalRecordsQuery);
            const medicalRecords = medicalRecordsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date?.toDate() || new Date(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate() || new Date()
            })) as MedicalRecord[];

            // Log successful scan
            await this.logScanAttempt(
                umidCode, 
                doctorId, 
                options.emergencyAccess ? 'emergency' : 'authorized', 
                options.scanMethod
            );

            // Update last accessed
            await updateDoc(doc(db, this.UMID_COLLECTION, umidDoc.id), {
                lastAccessed: serverTimestamp(),
                lastAccessedBy: doctorId
            });

            const result: UMIDScanResult = {
                umid: umidData,
                patient: patientData,
                medicalRecords,
                lastAccessed: new Date(),
                accessAuthorized,
                emergencyAccess: options.emergencyAccess || false
            };

            return { data: result };
        } catch (error) {
            console.error('Error scanning UMID:', error);
            return {
                error: { status: 500, message: 'Failed to scan UMID' }
            };
        }
    }

    /**
     * Check if doctor has access to patient
     */
    private static async checkAccess(
        doctorId: string,
        patientId: string,
        emergencyAccess?: boolean
    ): Promise<boolean> {
        if (emergencyAccess) {
            return true; // Emergency access bypasses normal checks
        }

        try {
            // Check if patient is assigned to this doctor
            const patientDoc = await getDoc(doc(db, this.PATIENTS_COLLECTION, patientId));
            if (patientDoc.exists()) {
                const patientData = patientDoc.data();
                return patientData.primaryDoctorId === doctorId || 
                       patientData.assignedDoctors?.includes(doctorId);
            }
            return false;
        } catch (error) {
            console.error('Error checking access:', error);
            return false;
        }
    }

    /**
     * Log scan attempt
     */
    private static async logScanAttempt(
        umidCode: string,
        doctorId: string,
        accessType: 'authorized' | 'emergency' | 'denied',
        scanMethod: 'qr' | 'manual' | 'nfc',
        notes?: string
    ): Promise<void> {
        try {
            const scanRecord = {
                umidId: umidCode,
                doctorId,
                accessType,
                scanMethod,
                scannedAt: serverTimestamp(),
                notes
            };

            await addDoc(collection(db, this.SCAN_HISTORY_COLLECTION), scanRecord);
            
            // Also log to audit trail
            await this.logAuditEntry(umidCode, doctorId, 'scan', {
                accessType,
                scanMethod,
                notes
            });
        } catch (error) {
            console.error('Error logging scan attempt:', error);
        }
    }

    /**
     * Get scan history for a doctor
     */
    static async getScanHistory(doctorId: string): Promise<ApiResponse<ScanHistory[]>> {
        try {
            const historyQuery = query(
                collection(db, this.SCAN_HISTORY_COLLECTION),
                where('doctorId', '==', doctorId),
                orderBy('scannedAt', 'desc'),
                limit(50)
            );
            
            const snapshot = await getDocs(historyQuery);
            const history: ScanHistory[] = [];
            
            for (const docSnapshot of snapshot.docs) {
                const data = docSnapshot.data();
                
                // Get patient name
                let patientName = 'Unknown Patient';
                if (data.umidId) {
                    const umidQuery = query(
                        collection(db, this.UMID_COLLECTION),
                        where('id', '==', data.umidId),
                        limit(1)
                    );
                    
                    const umidSnapshot = await getDocs(umidQuery);
                    if (!umidSnapshot.empty) {
                        const umidData = umidSnapshot.docs[0].data();
                        const patientDocRef = doc(db, this.PATIENTS_COLLECTION, umidData.patientId);
                        const patientDoc = await getDoc(patientDocRef);
                        if (patientDoc.exists()) {
                            const patientData = patientDoc.data() as PatientProfile;
                            patientName = `${patientData.firstName} ${patientData.lastName}`;
                        }
                    }
                }
                
                history.push({
                    id: docSnapshot.id,
                    umidId: data.umidId,
                    patientId: data.patientId || '',
                    patientName,
                    scannedAt: data.scannedAt?.toDate() || new Date(),
                    scanMethod: data.scanMethod,
                    accessType: data.accessType,
                    doctorId: data.doctorId,
                    notes: data.notes
                });
            }
            
            return { data: history };
        } catch (error) {
            console.error('Error fetching scan history:', error);
            return {
                error: { status: 500, message: 'Failed to fetch scan history' }
            };
        }
    }

    /**
     * Request emergency access
     */
    static async requestEmergencyAccess(
        umidCode: string,
        doctorId: string,
        request: EmergencyAccessRequest
    ): Promise<ApiResponse<UMIDScanResult>> {
        try {
            // Log emergency access request
            await this.logAuditEntry(umidCode, doctorId, 'emergency', {
                reason: request.reason,
                urgency: request.urgency
            });

            // Grant emergency access
            return await this.scanUMID(umidCode, doctorId, {
                scanMethod: 'manual',
                emergencyAccess: true
            });
        } catch (error) {
            console.error('Error requesting emergency access:', error);
            return {
                error: { status: 500, message: 'Failed to request emergency access' }
            };
        }
    }

    /**
     * Get connected devices for a doctor
     */
    static async getConnectedDevices(doctorId: string): Promise<ApiResponse<DeviceInfo[]>> {
        try {
            const devicesQuery = query(
                collection(db, this.DEVICES_COLLECTION),
                where('doctorId', '==', doctorId),
                orderBy('lastSeen', 'desc')
            );
            
            const snapshot = await getDocs(devicesQuery);
            const devices = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                lastSeen: doc.data().lastSeen?.toDate() || new Date()
            })) as DeviceInfo[];

            return { data: devices };
        } catch (error) {
            console.error('Error fetching connected devices:', error);
            return {
                error: { status: 500, message: 'Failed to fetch connected devices' }
            };
        }
    }

    /**
     * Get audit log for a UMID
     */
    static async getAuditLog(umidId: string): Promise<ApiResponse<AuditLogEntry[]>> {
        try {
            const auditQuery = query(
                collection(db, this.AUDIT_LOG_COLLECTION),
                where('umidId', '==', umidId),
                orderBy('timestamp', 'desc'),
                limit(100)
            );
            
            const snapshot = await getDocs(auditQuery);
            const auditLog = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate() || new Date()
            })) as AuditLogEntry[];

            return { data: auditLog };
        } catch (error) {
            console.error('Error fetching audit log:', error);
            return {
                error: { status: 500, message: 'Failed to fetch audit log' }
            };
        }
    }

    /**
     * Log audit entry
     */
    private static async logAuditEntry(
        umidId: string,
        doctorId: string,
        action: 'scan' | 'access' | 'emergency' | 'deny',
        details?: Record<string, any>
    ): Promise<void> {
        try {
            const auditEntry = {
                umidId,
                doctorId,
                action,
                timestamp: serverTimestamp(),
                details: details || {}
            };

            await addDoc(collection(db, this.AUDIT_LOG_COLLECTION), auditEntry);
        } catch (error) {
            console.error('Error logging audit entry:', error);
        }
    }

    /**
     * Generate demo data for testing
     */
    static async generateDemoData(): Promise<ApiResponse<void>> {
        try {
            const batch = writeBatch(db);

            // Demo UMID
            const demoUMID = {
                id: 'UMID-12345-67890',
                patientId: 'demo-patient-123',
                qrCode: 'demo-qr-code-data',
                isActive: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                lastAccessed: serverTimestamp(),
                accessLevel: 'standard'
            };

            const umidRef = doc(collection(db, this.UMID_COLLECTION));
            batch.set(umidRef, demoUMID);

            // Demo patient
            const demoPatient = {
                id: 'demo-patient-123',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@demo.com',
                phone: '555-0123',
                dateOfBirth: new Date('1985-06-15'),
                gender: 'male',
                bloodType: 'A+',
                allergies: ['Penicillin', 'Shellfish'],
                emergencyContact: {
                    name: 'Jane Doe',
                    relationship: 'Spouse',
                    phone: '555-0124'
                },
                primaryDoctorId: 'demo-doctor-456',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                isActive: true,
                role: 'patient'
            };

            const patientRef = doc(collection(db, this.PATIENTS_COLLECTION), 'demo-patient-123');
            batch.set(patientRef, demoPatient);

            // Demo devices
            const demoDevices = [
                {
                    doctorId: 'demo-doctor-456',
                    type: 'mobile',
                    name: 'iPhone 14 Pro',
                    isOnline: true,
                    lastSeen: serverTimestamp(),
                    capabilities: ['QR Scanner', 'NFC', 'Biometric Auth']
                },
                {
                    doctorId: 'demo-doctor-456',
                    type: 'tablet',
                    name: 'iPad Pro',
                    isOnline: false,
                    lastSeen: Timestamp.fromDate(new Date(Date.now() - 3600000)), // 1 hour ago
                    capabilities: ['QR Scanner', 'Large Display']
                }
            ];

            demoDevices.forEach(device => {
                const deviceRef = doc(collection(db, this.DEVICES_COLLECTION));
                batch.set(deviceRef, device);
            });

            await batch.commit();

            return { data: undefined };
        } catch (error) {
            console.error('Error generating demo data:', error);
            return {
                error: { status: 500, message: 'Failed to generate demo data' }
            };
        }
    }
}
