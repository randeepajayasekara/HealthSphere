/**
 * HealthSphere - UMID Services
 * Firebase/Firestore services for Universal Medical ID management
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
    DocumentSnapshot,
    Timestamp,
    writeBatch
} from 'firebase/firestore';
import { db } from '../../backend/config';
import { 
    UniversalMedicalID, 
    UMIDAccessLog, 
    UMIDAuthenticationRequest, 
    UMIDAuthenticationResponse,
    LinkedMedicalData,
    DeviceInfo,
    TOTPSettings,
    UMIDSecuritySettings,
    MedicalAlert
} from '../../app/types';

// Collection references
const UMID_COLLECTION = 'universal_medical_ids';
const ACCESS_LOGS_COLLECTION = 'umid_access_logs';
const MEDICAL_ALERTS_COLLECTION = 'medical_alerts';

/**
 * UMID Generation and Management Services
 */
export class UMIDService {
    /**
     * Generate a new UMID for a patient
     */
    static async generateUMID(
        patientId: string, 
        linkedMedicalData: LinkedMedicalData,
        securitySettings?: Partial<UMIDSecuritySettings>
    ): Promise<UniversalMedicalID> {
        try {
            const umidNumber = this.generateUMIDNumber();
            const secretKey = this.generateSecretKey();
            const qrCodeData = this.generateQRCodeData(umidNumber, secretKey);
            
            const defaultSecuritySettings: UMIDSecuritySettings = {
                maxFailedAttempts: 3,
                lockoutDuration: 30,
                requireBiometric: false,
                allowOfflineAccess: false,
                encryptionLevel: 'high',
                accessControlLevel: 'enhanced',
                ...securitySettings
            };

            const totpSettings: TOTPSettings = {
                digits: 6,
                period: 30,
                algorithm: 'SHA256',
                issuer: 'HealthSphere',
                label: `Patient-${patientId}`
            };

            const umidData: Omit<UniversalMedicalID, 'id'> = {
                patientId,
                umidNumber,
                qrCodeData,
                secretKey: this.encryptSecretKey(secretKey),
                isActive: true,
                issueDate: new Date(),
                accessHistory: [],
                totpSettings,
                securitySettings: defaultSecuritySettings,
                linkedMedicalData
            };

            const docRef = await addDoc(collection(db, UMID_COLLECTION), {
                ...umidData,
                issueDate: Timestamp.fromDate(umidData.issueDate)
            });

            return {
                id: docRef.id,
                ...umidData
            };
        } catch (error) {
            console.error('Error generating UMID:', error);
            throw new Error('Failed to generate UMID');
        }
    }

    /**
     * Authenticate UMID access
     */
    static async authenticateUMID(
        request: UMIDAuthenticationRequest
    ): Promise<UMIDAuthenticationResponse> {
        try {
            const umidDoc = await this.getUMIDByNumber(request.umidNumber);
            
            if (!umidDoc) {
                await this.logFailedAccess(request, 'Invalid UMID number');
                return {
                    success: false,
                    accessLevel: 'basic',
                    expiresAt: new Date(),
                    errorMessage: 'Invalid UMID number'
                };
            }

            // Verify TOTP code
            const isValidTOTP = this.verifyTOTP(
                request.totpCode, 
                umidDoc.secretKey, 
                umidDoc.totpSettings
            );

            if (!isValidTOTP && !request.emergencyOverride) {
                await this.logFailedAccess(request, 'Invalid TOTP code');
                return {
                    success: false,
                    accessLevel: 'basic',
                    expiresAt: new Date(),
                    errorMessage: 'Invalid authentication code'
                };
            }

            // Log successful access
            await this.logSuccessfulAccess(request, umidDoc.id);

            // Determine access level
            const accessLevel = request.emergencyOverride ? 'emergency' : 'full';
            const expiresAt = new Date(Date.now() + (30 * 60 * 1000)); // 30 minutes

            return {
                success: true,
                accessToken: this.generateAccessToken(umidDoc.id, request.staffId),
                medicalData: umidDoc.linkedMedicalData,
                accessLevel,
                expiresAt
            };
        } catch (error) {
            console.error('Error authenticating UMID:', error);
            return {
                success: false,
                accessLevel: 'basic',
                expiresAt: new Date(),
                errorMessage: 'Authentication failed'
            };
        }
    }

    /**
     * Update linked medical data
     */
    static async updateLinkedMedicalData(
        umidId: string, 
        medicalData: Partial<LinkedMedicalData>
    ): Promise<void> {
        try {
            const umidRef = doc(db, UMID_COLLECTION, umidId);
            await updateDoc(umidRef, {
                linkedMedicalData: medicalData,
                lastUpdated: Timestamp.now()
            });
        } catch (error) {
            console.error('Error updating linked medical data:', error);
            throw new Error('Failed to update medical data');
        }
    }

    /**
     * Get UMID access logs with pagination
     */
    static async getAccessLogs(
        umidId: string,
        pageSize: number = 20,
        lastDoc?: DocumentSnapshot
    ): Promise<{ logs: UMIDAccessLog[], lastDoc?: DocumentSnapshot }> {
        try {
            let q = query(
                collection(db, ACCESS_LOGS_COLLECTION),
                where('umidId', '==', umidId),
                orderBy('accessTime', 'desc'),
                limit(pageSize)
            );

            if (lastDoc) {
                q = query(q, startAfter(lastDoc));
            }

            const snapshot = await getDocs(q);
            const logs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                accessTime: doc.data().accessTime.toDate()
            })) as UMIDAccessLog[];

            const lastDocument = snapshot.docs[snapshot.docs.length - 1];

            return { logs, lastDoc: lastDocument };
        } catch (error) {
            console.error('Error fetching access logs:', error);
            throw new Error('Failed to fetch access logs');
        }
    }

    /**
     * Deactivate UMID
     */
    static async deactivateUMID(umidId: string): Promise<void> {
        try {
            const umidRef = doc(db, UMID_COLLECTION, umidId);
            await updateDoc(umidRef, {
                isActive: false,
                deactivatedAt: Timestamp.now()
            });
        } catch (error) {
            console.error('Error deactivating UMID:', error);
            throw new Error('Failed to deactivate UMID');
        }
    }

    /**
     * Add medical alert to UMID
     */
    static async addMedicalAlert(
        umidId: string, 
        alert: Omit<MedicalAlert, 'dateAdded'>
    ): Promise<void> {
        try {
            const alertData = {
                ...alert,
                umidId,
                dateAdded: Timestamp.now(),
                expiryDate: alert.expiryDate ? Timestamp.fromDate(alert.expiryDate) : null
            };

            await addDoc(collection(db, MEDICAL_ALERTS_COLLECTION), alertData);

            // Update UMID with new alert
            const umidRef = doc(db, UMID_COLLECTION, umidId);
            const umidDoc = await getDoc(umidRef);
            
            if (umidDoc.exists()) {
                const currentData = umidDoc.data();
                const updatedAlerts = [
                    ...(currentData.linkedMedicalData?.medicalAlerts || []),
                    { ...alert, dateAdded: new Date() }
                ];

                await updateDoc(umidRef, {
                    'linkedMedicalData.medicalAlerts': updatedAlerts
                });
            }
        } catch (error) {
            console.error('Error adding medical alert:', error);
            throw new Error('Failed to add medical alert');
        }
    }

    // Private helper methods
    private static generateUMIDNumber(): string {
        const prefix = 'HS';
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `${prefix}${timestamp}${random}`;
    }

    private static generateSecretKey(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let secret = '';
        for (let i = 0; i < 32; i++) {
            secret += chars[Math.floor(Math.random() * chars.length)];
        }
        return secret;
    }

    private static generateQRCodeData(umidNumber: string, secretKey: string): string {
        const data = {
            umid: umidNumber,
            issuer: 'HealthSphere',
            timestamp: Date.now()
        };
        return btoa(JSON.stringify(data));
    }

    private static encryptSecretKey(secretKey: string): string {
        // In production, use proper encryption
        return btoa(secretKey);
    }

    private static verifyTOTP(
        code: string, 
        encryptedSecret: string, 
        settings: TOTPSettings
    ): boolean {
        // Simplified TOTP verification - implement proper TOTP in production
        const secret = atob(encryptedSecret);
        const currentTime = Math.floor(Date.now() / 1000 / settings.period);
        
        // Generate expected codes for current and previous/next time windows
        for (let i = -1; i <= 1; i++) {
            const timeWindow = currentTime + i;
            const expectedCode = this.generateTOTP(secret, timeWindow, settings);
            if (expectedCode === code) {
                return true;
            }
        }
        
        return false;
    }

    private static generateTOTP(
        secret: string, 
        timeWindow: number, 
        settings: TOTPSettings
    ): string {
        // Simplified TOTP generation - implement proper HMAC-based TOTP in production
        const hash = (secret + timeWindow).split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        
        return Math.abs(hash).toString().slice(-settings.digits).padStart(settings.digits, '0');
    }

    private static generateAccessToken(umidId: string, staffId: string): string {
        const payload = {
            umidId,
            staffId,
            timestamp: Date.now(),
            random: Math.random()
        };
        return btoa(JSON.stringify(payload));
    }

    private static async getUMIDByNumber(umidNumber: string): Promise<UniversalMedicalID | null> {
        try {
            const q = query(
                collection(db, UMID_COLLECTION),
                where('umidNumber', '==', umidNumber),
                where('isActive', '==', true),
                limit(1)
            );

            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                return null;
            }

            const doc = snapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data(),
                issueDate: doc.data().issueDate.toDate(),
                lastAccessDate: doc.data().lastAccessDate?.toDate()
            } as UniversalMedicalID;
        } catch (error) {
            console.error('Error fetching UMID by number:', error);
            return null;
        }
    }

    private static async logSuccessfulAccess(
        request: UMIDAuthenticationRequest, 
        umidId: string
    ): Promise<void> {
        const logData: Omit<UMIDAccessLog, 'id'> = {
            accessedBy: request.staffId,
            staffRole: 'doctor', // This should come from user data
            accessTime: new Date(),
            accessType: request.emergencyOverride ? 'emergency_override' : 'scan',
            purpose: request.accessPurpose,
            dataAccessed: ['basicInfo', 'criticalAllergies', 'currentMedications'],
            deviceInfo: request.deviceInfo,
            wasSuccessful: true
        };

        await addDoc(collection(db, ACCESS_LOGS_COLLECTION), {
            ...logData,
            umidId, // Add umidId as separate field for querying
            accessTime: Timestamp.fromDate(logData.accessTime)
        });
    }

    private static async logFailedAccess(
        request: UMIDAuthenticationRequest, 
        reason: string
    ): Promise<void> {
        const logData = {
            umidNumber: request.umidNumber,
            accessedBy: request.staffId,
            accessTime: Timestamp.now(),
            accessType: request.emergencyOverride ? 'emergency_override' : 'scan',
            purpose: request.accessPurpose,
            deviceInfo: request.deviceInfo,
            wasSuccessful: false,
            failureReason: reason
        };

        await addDoc(collection(db, ACCESS_LOGS_COLLECTION), logData);
    }
}

/**
 * UMID Query Services for different user roles
 */
export class UMIDQueryService {
    /**
     * Get UMIDs for a specific patient (patient role)
     */
    static async getPatientUMIDs(patientId: string): Promise<UniversalMedicalID[]> {
        try {
            const q = query(
                collection(db, UMID_COLLECTION),
                where('patientId', '==', patientId),
                orderBy('issueDate', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                issueDate: doc.data().issueDate.toDate(),
                lastAccessDate: doc.data().lastAccessDate?.toDate()
            })) as UniversalMedicalID[];
        } catch (error) {
            console.error('Error fetching patient UMIDs:', error);
            throw new Error('Failed to fetch patient UMIDs');
        }
    }

    /**
     * Get all UMIDs with filtering (admin/hospital_management roles)
     */
    static async getAllUMIDs(
        filters?: {
            isActive?: boolean;
            department?: string;
            dateRange?: { start: Date; end: Date };
        },
        pageSize: number = 50,
        lastDoc?: DocumentSnapshot
    ): Promise<{ umids: UniversalMedicalID[], lastDoc?: DocumentSnapshot }> {
        try {
            let q = query(collection(db, UMID_COLLECTION));

            if (filters?.isActive !== undefined) {
                q = query(q, where('isActive', '==', filters.isActive));
            }

            q = query(q, orderBy('issueDate', 'desc'), limit(pageSize));

            if (lastDoc) {
                q = query(q, startAfter(lastDoc));
            }

            const snapshot = await getDocs(q);
            const umids = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                issueDate: doc.data().issueDate.toDate(),
                lastAccessDate: doc.data().lastAccessDate?.toDate()
            })) as UniversalMedicalID[];

            const lastDocument = snapshot.docs[snapshot.docs.length - 1];

            return { umids, lastDoc: lastDocument };
        } catch (error) {
            console.error('Error fetching all UMIDs:', error);
            throw new Error('Failed to fetch UMIDs');
        }
    }

    /**
     * Search UMIDs by patient name or UMID number (healthcare provider roles)
     */
    static async searchUMIDs(searchTerm: string): Promise<UniversalMedicalID[]> {
        try {
            // Search by UMID number
            const umidQuery = query(
                collection(db, UMID_COLLECTION),
                where('umidNumber', '>=', searchTerm.toUpperCase()),
                where('umidNumber', '<=', searchTerm.toUpperCase() + '\uf8ff'),
                limit(10)
            );

            const snapshot = await getDocs(umidQuery);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                issueDate: doc.data().issueDate.toDate(),
                lastAccessDate: doc.data().lastAccessDate?.toDate()
            })) as UniversalMedicalID[];
        } catch (error) {
            console.error('Error searching UMIDs:', error);
            throw new Error('Failed to search UMIDs');
        }
    }
}

export default UMIDService;
