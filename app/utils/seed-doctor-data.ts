import { collection, addDoc, writeBatch, doc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/backend/config';
import { MedicalRecord, MedicalRecordType, TelemedicineSession, TelemedicineSessionStatus } from '@/app/types';

// Sample medical records data
const sampleMedicalRecords: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
        patientId: 'patient1', // Will be replaced with actual patient ID
        providerId: 'doctor1', // Will be replaced with actual doctor ID
        date: new Date('2024-01-15'),
        type: 'consultation',
        description: 'Annual health checkup and general wellness assessment',
        diagnosis: 'Overall good health with minor vitamin D deficiency',
        treatment: 'Vitamin D supplementation prescribed',
        notes: 'Patient reports feeling generally well. Blood pressure normal. Recommended increased sun exposure.',
        followUpRecommendations: 'Follow-up in 3 months to check vitamin D levels',
        attachments: []
    },
    {
        patientId: 'patient1',
        providerId: 'doctor1',
        date: new Date('2024-01-20'),
        type: 'lab_result',
        description: 'Complete blood count and metabolic panel results',
        diagnosis: 'Mild anemia detected',
        treatment: 'Iron supplementation recommended',
        notes: 'Hemoglobin slightly below normal range. Other values within normal limits.',
        followUpRecommendations: 'Repeat CBC in 6 weeks',
        attachments: []
    },
    {
        patientId: 'patient2',
        providerId: 'doctor1',
        date: new Date('2024-01-25'),
        type: 'consultation',
        description: 'Cardiology consultation for chest pain evaluation',
        diagnosis: 'Atypical chest pain, likely musculoskeletal',
        treatment: 'NSAIDs and chest wall stretching exercises',
        notes: 'EKG normal. No signs of cardiac involvement. Patient reassured.',
        followUpRecommendations: 'Return if symptoms worsen or persist beyond 2 weeks',
        attachments: []
    },
    {
        patientId: 'patient2',
        providerId: 'doctor1',
        date: new Date('2024-02-01'),
        type: 'procedure',
        description: 'ECG and stress test performed',
        diagnosis: 'Normal cardiac function',
        treatment: 'No treatment required',
        notes: 'Stress test completed successfully. No abnormalities detected.',
        followUpRecommendations: 'Continue regular exercise routine',
        attachments: []
    },
    {
        patientId: 'patient3',
        providerId: 'doctor1',
        date: new Date('2024-02-05'),
        type: 'vaccination',
        description: 'Annual flu vaccination administered',
        diagnosis: 'Preventive care - flu vaccination',
        treatment: 'Influenza vaccine (2024 seasonal)',
        notes: 'No adverse reactions. Patient tolerated well.',
        followUpRecommendations: 'None required',
        attachments: []
    },
    {
        patientId: 'patient3',
        providerId: 'doctor1',
        date: new Date('2024-02-10'),
        type: 'imaging',
        description: 'Chest X-ray for persistent cough',
        diagnosis: 'Mild bronchitis',
        treatment: 'Antibiotics and bronchodilator inhaler',
        notes: 'Chest X-ray shows mild inflammation. No signs of pneumonia.',
        followUpRecommendations: 'Return if symptoms persist after 10 days',
        attachments: []
    }
];

// Sample telemedicine sessions data
const sampleTelemedicineSessions: Omit<TelemedicineSession, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
        doctorId: 'doctor1',
        patientId: 'patient1',
        appointmentId: 'appointment1',
        title: 'Follow-up Consultation',
        description: 'Follow-up discussion about vitamin D supplementation progress',
        scheduledTime: new Date('2024-02-15T10:00:00'),
        duration: 30,
        status: 'completed',
        virtualMeeting: {
            platform: 'zoom',
            link: 'https://zoom.us/j/1234567890',
            password: 'health123',
            instructions: 'Please join 5 minutes before the scheduled time'
        },
        startTime: new Date('2024-02-15T10:00:00'),
        endTime: new Date('2024-02-15T10:25:00'),
        sessionNotes: 'Patient reports feeling better. Vitamin D levels improving. Will continue supplementation.',
        prescriptionsIssued: ['prescription1'],
        followUpRequired: true,
        followUpDate: new Date('2024-03-15'),
        technicalIssues: [],
        recordingEnabled: false
    },
    {
        doctorId: 'doctor1',
        patientId: 'patient2',
        title: 'Chest Pain Follow-up',
        description: 'Check on chest pain symptoms and treatment effectiveness',
        scheduledTime: new Date('2024-02-20T14:00:00'),
        duration: 45,
        status: 'completed',
        virtualMeeting: {
            platform: 'google_meet',
            link: 'https://meet.google.com/abc-defg-hij',
            password: '',
            instructions: 'Please ensure you have a stable internet connection'
        },
        startTime: new Date('2024-02-20T14:00:00'),
        endTime: new Date('2024-02-20T14:40:00'),
        sessionNotes: 'Chest pain has resolved. Patient feels much better. NSAIDs effective.',
        prescriptionsIssued: [],
        followUpRequired: false,
        technicalIssues: [],
        recordingEnabled: false
    },
    {
        doctorId: 'doctor1',
        patientId: 'patient3',
        title: 'Cough Follow-up',
        description: 'Review progress of bronchitis treatment',
        scheduledTime: new Date('2024-02-25T11:00:00'),
        duration: 30,
        status: 'scheduled',
        virtualMeeting: {
            platform: 'microsoft_teams',
            link: 'https://teams.microsoft.com/l/meetup-join/19%3a...',
            password: 'Health2024',
            instructions: 'Please test your microphone and camera before joining'
        },
        sessionNotes: '',
        prescriptionsIssued: [],
        followUpRequired: false,
        technicalIssues: [],
        recordingEnabled: false
    },
    {
        doctorId: 'doctor1',
        patientId: 'patient1',
        title: 'Routine Health Check',
        description: 'Quarterly health assessment and wellness discussion',
        scheduledTime: new Date('2024-03-01T09:00:00'),
        duration: 60,
        status: 'scheduled',
        virtualMeeting: {
            platform: 'zoom',
            link: 'https://zoom.us/j/9876543210',
            password: 'routine123',
            instructions: 'Please have your blood pressure readings ready if you have a home monitor'
        },
        sessionNotes: '',
        prescriptionsIssued: [],
        followUpRequired: false,
        technicalIssues: [],
        recordingEnabled: false
    }
];

/**
 * Seed medical records for testing
 */
export async function seedMedicalRecords(doctorId: string): Promise<void> {
    console.log('🏥 Seeding medical records...');
    
    try {
        // Get existing patients for this doctor
        const patientsQuery = query(
            collection(db, 'patients'),
            where('primaryDoctorId', '==', doctorId)
        );
        const patientsSnapshot = await getDocs(patientsQuery);
        const patients = patientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (patients.length === 0) {
            console.log('⚠️  No patients found for doctor. Please seed users first.');
            return;
        }
        
        // Check if medical records already exist
        const recordsQuery = query(
            collection(db, 'medical_records'),
            where('providerId', '==', doctorId)
        );
        const existingRecords = await getDocs(recordsQuery);
        
        if (existingRecords.size > 0) {
            console.log('✅ Medical records already exist for this doctor');
            return;
        }
        
        // Create medical records
        const batch = writeBatch(db);
        let recordCount = 0;
        
        for (const recordTemplate of sampleMedicalRecords) {
            // Use cycling through available patients
            const patientIndex = recordCount % patients.length;
            const patient = patients[patientIndex];
            
            const medicalRecord = {
                ...recordTemplate,
                patientId: patient.id,
                providerId: doctorId,
                date: Timestamp.fromDate(recordTemplate.date),
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };
            
            const recordRef = doc(collection(db, 'medical_records'));
            batch.set(recordRef, medicalRecord);
            recordCount++;
        }
        
        await batch.commit();
        console.log(`✅ Created ${recordCount} medical records`);
        
    } catch (error) {
        console.error('❌ Error seeding medical records:', error);
        throw error;
    }
}

/**
 * Seed telemedicine sessions for testing
 */
export async function seedTelemedicineSessions(doctorId: string): Promise<void> {
    console.log('💻 Seeding telemedicine sessions...');
    
    try {
        // Get existing patients for this doctor
        const patientsQuery = query(
            collection(db, 'patients'),
            where('primaryDoctorId', '==', doctorId)
        );
        const patientsSnapshot = await getDocs(patientsQuery);
        const patients = patientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (patients.length === 0) {
            console.log('⚠️  No patients found for doctor. Please seed users first.');
            return;
        }
        
        // Check if telemedicine sessions already exist
        const sessionsQuery = query(
            collection(db, 'telemedicine_sessions'),
            where('doctorId', '==', doctorId)
        );
        const existingSessions = await getDocs(sessionsQuery);
        
        if (existingSessions.size > 0) {
            console.log('✅ Telemedicine sessions already exist for this doctor');
            return;
        }
        
        // Create telemedicine sessions
        const batch = writeBatch(db);
        let sessionCount = 0;
        
        for (const sessionTemplate of sampleTelemedicineSessions) {
            // Use cycling through available patients
            const patientIndex = sessionCount % patients.length;
            const patient = patients[patientIndex];
            
            const session = {
                ...sessionTemplate,
                doctorId: doctorId,
                patientId: patient.id,
                scheduledTime: Timestamp.fromDate(sessionTemplate.scheduledTime),
                startTime: sessionTemplate.startTime ? Timestamp.fromDate(sessionTemplate.startTime) : null,
                endTime: sessionTemplate.endTime ? Timestamp.fromDate(sessionTemplate.endTime) : null,
                followUpDate: sessionTemplate.followUpDate ? Timestamp.fromDate(sessionTemplate.followUpDate) : null,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };
            
            const sessionRef = doc(collection(db, 'telemedicine_sessions'));
            batch.set(sessionRef, session);
            sessionCount++;
        }
        
        await batch.commit();
        console.log(`✅ Created ${sessionCount} telemedicine sessions`);
        
    } catch (error) {
        console.error('❌ Error seeding telemedicine sessions:', error);
        throw error;
    }
}

/**
 * Seed all doctor-related data
 */
export async function seedDoctorData(doctorId: string): Promise<void> {
    console.log('👨‍⚕️ Seeding doctor data...');
    
    try {
        await seedMedicalRecords(doctorId);
        await seedTelemedicineSessions(doctorId);
        
        console.log('✅ Doctor data seeding completed successfully!');
    } catch (error) {
        console.error('❌ Error seeding doctor data:', error);
        throw error;
    }
}

/**
 * Clear all doctor-related data (for testing purposes)
 */
export async function clearDoctorData(doctorId: string): Promise<void> {
    console.log('🧹 Clearing doctor data...');
    
    try {
        // Clear medical records
        const recordsQuery = query(
            collection(db, 'medical_records'),
            where('providerId', '==', doctorId)
        );
        const recordsSnapshot = await getDocs(recordsQuery);
        
        const batch = writeBatch(db);
        recordsSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        // Clear telemedicine sessions
        const sessionsQuery = query(
            collection(db, 'telemedicine_sessions'),
            where('doctorId', '==', doctorId)
        );
        const sessionsSnapshot = await getDocs(sessionsQuery);
        
        sessionsSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        await batch.commit();
        console.log('✅ Doctor data cleared successfully!');
        
    } catch (error) {
        console.error('❌ Error clearing doctor data:', error);
        throw error;
    }
}

export default seedDoctorData;
