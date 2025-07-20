/**
 * Doctor Data Seeding Service
 * Generates dummy data for doctor schedule and analytics
 */

import { 
    collection, 
    doc, 
    setDoc, 
    getDocs, 
    Timestamp,
    writeBatch
} from 'firebase/firestore';
import { db } from '@/backend/config';
import { 
    AvailabilitySchedule, 
    Appointment, 
    PatientProfile 
} from '@/app/types';

// Local interface for analytics data
interface DoctorAnalytics {
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

export class DoctorDataSeedingService {
    
    /**
     * Seed doctor schedule data
     */
    static async seedDoctorSchedule(doctorId: string): Promise<void> {
        try {
            const defaultSchedule: AvailabilitySchedule = {
                monday: [
                    { startTime: '09:00', endTime: '12:00' },
                    { startTime: '14:00', endTime: '17:00' }
                ],
                tuesday: [
                    { startTime: '09:00', endTime: '12:00' },
                    { startTime: '14:00', endTime: '17:00' }
                ],
                wednesday: [
                    { startTime: '09:00', endTime: '12:00' },
                    { startTime: '14:00', endTime: '17:00' }
                ],
                thursday: [
                    { startTime: '09:00', endTime: '12:00' },
                    { startTime: '14:00', endTime: '17:00' }
                ],
                friday: [
                    { startTime: '09:00', endTime: '12:00' },
                    { startTime: '14:00', endTime: '16:00' }
                ],
                saturday: [
                    { startTime: '09:00', endTime: '12:00' }
                ],
                sunday: [],
                exceptions: [
                    {
                        date: new Date('2025-12-25'),
                        isAvailable: false,
                        reason: 'Christmas Day',
                        timeSlots: []
                    },
                    {
                        date: new Date('2025-01-01'),
                        isAvailable: false,
                        reason: 'New Year\'s Day',
                        timeSlots: []
                    }
                ]
            };

            await setDoc(doc(db, 'doctor_schedules', doctorId), {
                ...defaultSchedule,
                exceptions: defaultSchedule.exceptions?.map(exc => ({
                    ...exc,
                    date: Timestamp.fromDate(exc.date)
                })),
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                doctorId
            });

            console.log('Doctor schedule seeded successfully');
        } catch (error) {
            console.error('Error seeding doctor schedule:', error);
            throw error;
        }
    }

    /**
     * Seed dummy appointment data
     */
    static async seedAppointments(doctorId: string): Promise<void> {
        try {
            const batch = writeBatch(db);
            const appointmentsCollection = collection(db, 'appointments');

            // Generate appointments for the next 30 days
            const today = new Date();
            const appointments = [];

            for (let i = 0; i < 30; i++) {
                const appointmentDate = new Date(today);
                appointmentDate.setDate(today.getDate() + i);
                
                // Skip weekends for some variety
                if (appointmentDate.getDay() === 0) continue; // Skip Sunday
                
                const numAppointments = Math.floor(Math.random() * 8) + 2; // 2-9 appointments per day
                
                for (let j = 0; j < numAppointments; j++) {
                    const hour = 9 + Math.floor(Math.random() * 8); // 9 AM to 5 PM
                    const minute = Math.random() > 0.5 ? 0 : 30; // On the hour or half hour
                    
                    const appointment = {
                        id: `apt_${doctorId}_${i}_${j}`,
                        doctorId,
                        patientId: `patient_${Math.floor(Math.random() * 200) + 1}`,
                        date: Timestamp.fromDate(appointmentDate),
                        startTime: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
                        endTime: `${(hour + 1).toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
                        status: this.getRandomStatus(),
                        type: this.getRandomAppointmentType(),
                        reason: this.getRandomReason(),
                        notes: Math.random() > 0.7 ? 'Follow-up required' : undefined,
                        createdAt: Timestamp.now(),
                        updatedAt: Timestamp.now()
                    };

                    const docRef = doc(appointmentsCollection, appointment.id);
                    batch.set(docRef, appointment);
                    appointments.push(appointment);
                }
            }

            await batch.commit();
            console.log(`Seeded ${appointments.length} appointments successfully`);
        } catch (error) {
            console.error('Error seeding appointments:', error);
            throw error;
        }
    }

    /**
     * Seed dummy patient data
     */
    static async seedPatients(): Promise<void> {
        try {
            const batch = writeBatch(db);
            const patientsCollection = collection(db, 'patients');

            const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Maria'];
            const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
            const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
            const conditions = ['Hypertension', 'Diabetes', 'Asthma', 'Arthritis', 'Heart Disease', 'None'];

            for (let i = 1; i <= 200; i++) {
                const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
                const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
                const age = Math.floor(Math.random() * 70) + 18; // 18-88 years old
                
                const patient = {
                    id: `patient_${i}`,
                    firstName,
                    lastName,
                    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
                    phoneNumber: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
                    dateOfBirth: new Date(2025 - age, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                    gender: Math.random() > 0.5 ? 'male' : 'female',
                    bloodType: bloodTypes[Math.floor(Math.random() * bloodTypes.length)],
                    medicalHistory: {
                        conditions: [conditions[Math.floor(Math.random() * conditions.length)]],
                        allergies: Math.random() > 0.7 ? ['Penicillin'] : [],
                        medications: [],
                        surgeries: []
                    },
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                    role: 'patient'
                };

                const docRef = doc(patientsCollection, patient.id);
                batch.set(docRef, patient);
            }

            await batch.commit();
            console.log('Seeded 200 patients successfully');
        } catch (error) {
            console.error('Error seeding patients:', error);
            throw error;
        }
    }

    /**
     * Generate analytics data
     */
    static generateAnalytics(doctorId: string): DoctorAnalytics {
        return {
            totalPatients: 245,
            totalAppointments: 312,
            completedAppointments: 298,
            cancelledAppointments: 14,
            totalPrescriptions: 189,
            averageConsultationTime: 32,
            patientSatisfactionRating: 4.6,
            periodStart: new Date(2024, 11, 19), // 30 days ago
            periodEnd: new Date(2025, 0, 19) // today
        };
    }

    /**
     * Seed all doctor data
     */
    static async seedAllDoctorData(doctorId: string): Promise<void> {
        try {
            console.log('Starting doctor data seeding...');
            
            // Check if data already exists
            const existingSchedule = await getDocs(collection(db, 'doctor_schedules'));
            const existingAppointments = await getDocs(collection(db, 'appointments'));
            const existingPatients = await getDocs(collection(db, 'patients'));

            if (existingSchedule.empty) {
                await this.seedDoctorSchedule(doctorId);
            }

            if (existingPatients.empty) {
                await this.seedPatients();
            }

            if (existingAppointments.empty) {
                await this.seedAppointments(doctorId);
            }

            console.log('Doctor data seeding completed successfully');
        } catch (error) {
            console.error('Error seeding doctor data:', error);
            throw error;
        }
    }

    private static getRandomStatus(): 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' {
        const statuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'];
        const weights = [0.2, 0.3, 0.35, 0.1, 0.05]; // Probabilities
        
        const random = Math.random();
        let cumulativeWeight = 0;
        
        for (let i = 0; i < statuses.length; i++) {
            cumulativeWeight += weights[i];
            if (random < cumulativeWeight) {
                return statuses[i] as any;
            }
        }
        
        return 'scheduled';
    }

    private static getRandomAppointmentType(): 'regular_checkup' | 'follow_up' | 'specialist_consultation' | 'emergency' {
        const types = ['regular_checkup', 'follow_up', 'specialist_consultation', 'emergency'];
        const weights = [0.4, 0.3, 0.25, 0.05];
        
        const random = Math.random();
        let cumulativeWeight = 0;
        
        for (let i = 0; i < types.length; i++) {
            cumulativeWeight += weights[i];
            if (random < cumulativeWeight) {
                return types[i] as any;
            }
        }
        
        return 'regular_checkup';
    }

    private static getRandomReason(): string {
        const reasons = [
            'Annual checkup',
            'Follow-up consultation',
            'Chest pain evaluation',
            'Medication review',
            'Blood pressure check',
            'Diabetes management',
            'Headache evaluation',
            'Skin condition',
            'Joint pain assessment',
            'Routine examination'
        ];
        
        return reasons[Math.floor(Math.random() * reasons.length)];
    }
}

export default DoctorDataSeedingService;
