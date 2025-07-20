/**
 * Doctor Schedule Service - Firestore Integration
 * Handles doctor's schedule management, availability, and appointments
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
    AvailabilitySchedule, 
    TimeSlot, 
    AvailabilityException, 
    Appointment,
    ApiResponse,
    QueryParams
} from '@/app/types';

export class DoctorScheduleService {
    private static readonly DOCTORS_COLLECTION = 'doctors';
    private static readonly APPOINTMENTS_COLLECTION = 'appointments';
    private static readonly SCHEDULE_COLLECTION = 'doctor_schedules';

    /**
     * Get doctor's availability schedule
     */
    static async getDoctorSchedule(doctorId: string): Promise<ApiResponse<AvailabilitySchedule>> {
        try {
            const docRef = doc(db, this.SCHEDULE_COLLECTION, doctorId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                
                // Convert Firestore timestamps to dates in exceptions
                const schedule: AvailabilitySchedule = {
                    ...data,
                    exceptions: (data.exceptions || []).map((exception: any) => ({
                        ...exception,
                        date: exception.date?.toDate ? exception.date.toDate() : new Date(exception.date)
                    }))
                };
                
                return { data: schedule };
            } else {
                // Return default schedule if none exists
                const defaultSchedule: AvailabilitySchedule = {
                    monday: [{ startTime: '09:00', endTime: '17:00' }],
                    tuesday: [{ startTime: '09:00', endTime: '17:00' }],
                    wednesday: [{ startTime: '09:00', endTime: '17:00' }],
                    thursday: [{ startTime: '09:00', endTime: '17:00' }],
                    friday: [{ startTime: '09:00', endTime: '17:00' }],
                    saturday: [],
                    sunday: [],
                    exceptions: []
                };
                
                return { data: defaultSchedule };
            }
        } catch (error) {
            console.error('Error fetching doctor schedule:', error);
            return {
                error: { status: 500, message: 'Failed to fetch doctor schedule' }
            };
        }
    }

    /**
     * Update doctor's availability schedule
     */
    static async updateDoctorSchedule(
        doctorId: string, 
        schedule: AvailabilitySchedule
    ): Promise<ApiResponse<AvailabilitySchedule>> {
        try {
            const docRef = doc(db, this.SCHEDULE_COLLECTION, doctorId);
            
            // Convert dates to Firestore timestamps in exceptions
            const sanitizedSchedule = {
                ...schedule,
                exceptions: (schedule.exceptions || []).map(exception => ({
                    ...exception,
                    date: Timestamp.fromDate(exception.date)
                })),
                updatedAt: Timestamp.now(),
                doctorId
            };
            
            await updateDoc(docRef, sanitizedSchedule);
            
            return { data: schedule };
        } catch (error) {
            console.error('Error updating doctor schedule:', error);
            return {
                error: { status: 500, message: 'Failed to update doctor schedule' }
            };
        }
    }

    /**
     * Create initial doctor schedule
     */
    static async createDoctorSchedule(
        doctorId: string, 
        schedule: AvailabilitySchedule
    ): Promise<ApiResponse<AvailabilitySchedule>> {
        try {
            const docRef = doc(db, this.SCHEDULE_COLLECTION, doctorId);
            
            // Convert dates to Firestore timestamps in exceptions
            const sanitizedSchedule = {
                ...schedule,
                exceptions: (schedule.exceptions || []).map(exception => ({
                    ...exception,
                    date: Timestamp.fromDate(exception.date)
                })),
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                doctorId
            };
            
            await updateDoc(docRef, sanitizedSchedule);
            
            return { data: schedule };
        } catch (error) {
            console.error('Error creating doctor schedule:', error);
            return {
                error: { status: 500, message: 'Failed to create doctor schedule' }
            };
        }
    }

    /**
     * Get doctor's appointments for a specific date range
     */
    static async getDoctorAppointments(
        doctorId: string,
        queryParams?: QueryParams
    ): Promise<ApiResponse<Appointment[]>> {
        try {
            let appointmentQuery = query(
                collection(db, this.APPOINTMENTS_COLLECTION),
                where('doctorId', '==', doctorId)
            );

            // Apply date range filter if provided
            if (queryParams?.filter?.dateRange) {
                const { startDate, endDate } = queryParams.filter.dateRange;
                if (startDate) {
                    appointmentQuery = query(
                        appointmentQuery, 
                        where('date', '>=', Timestamp.fromDate(startDate))
                    );
                }
                if (endDate) {
                    appointmentQuery = query(
                        appointmentQuery, 
                        where('date', '<=', Timestamp.fromDate(endDate))
                    );
                }
            }

            // Add ordering
            appointmentQuery = query(appointmentQuery, orderBy('date', 'asc'));

            // Apply pagination
            if (queryParams?.pagination?.limit) {
                appointmentQuery = query(appointmentQuery, limit(queryParams.pagination.limit));
            }

            const querySnapshot = await getDocs(appointmentQuery);
            const appointments = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date?.toDate(),
                followUpDate: doc.data().followUpDate?.toDate(),
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
     * Get available time slots for a specific date
     */
    static async getAvailableTimeSlots(
        doctorId: string,
        date: Date
    ): Promise<ApiResponse<TimeSlot[]>> {
        try {
            // Get doctor's schedule
            const scheduleResponse = await this.getDoctorSchedule(doctorId);
            if (scheduleResponse.error || !scheduleResponse.data) {
                return {
                    error: { status: 500, message: 'Failed to fetch doctor schedule' }
                };
            }

            const schedule = scheduleResponse.data;
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
            
            // Check for exceptions on this date
            const exception = schedule.exceptions?.find(exc => 
                exc.date.toDateString() === date.toDateString()
            );
            
            let availableSlots: TimeSlot[] = [];
            
            if (exception) {
                // Use exception slots if available
                availableSlots = exception.isAvailable ? (exception.timeSlots || []) : [];
            } else {
                // Use regular schedule
                availableSlots = schedule[dayName as keyof AvailabilitySchedule] as TimeSlot[] || [];
            }

            // Get booked appointments for this date
            const appointmentsResponse = await this.getDoctorAppointments(doctorId, {
                filter: {
                    dateRange: {
                        startDate: date,
                        endDate: date
                    }
                }
            });

            if (appointmentsResponse.data) {
                const bookedTimes = appointmentsResponse.data.map(apt => ({
                    startTime: apt.startTime,
                    endTime: apt.endTime
                }));

                // Filter out booked time slots
                availableSlots = availableSlots.filter(slot => 
                    !bookedTimes.some(booked => 
                        slot.startTime === booked.startTime && slot.endTime === booked.endTime
                    )
                );
            }

            return { data: availableSlots };
        } catch (error) {
            console.error('Error fetching available time slots:', error);
            return {
                error: { status: 500, message: 'Failed to fetch available time slots' }
            };
        }
    }

    /**
     * Add schedule exception
     */
    static async addScheduleException(
        doctorId: string,
        exception: AvailabilityException
    ): Promise<ApiResponse<AvailabilitySchedule>> {
        try {
            const scheduleResponse = await this.getDoctorSchedule(doctorId);
            if (scheduleResponse.error || !scheduleResponse.data) {
                return {
                    error: { status: 500, message: 'Failed to fetch doctor schedule' }
                };
            }

            const schedule = scheduleResponse.data;
            const updatedSchedule = {
                ...schedule,
                exceptions: [...(schedule.exceptions || []), exception]
            };

            return await this.updateDoctorSchedule(doctorId, updatedSchedule);
        } catch (error) {
            console.error('Error adding schedule exception:', error);
            return {
                error: { status: 500, message: 'Failed to add schedule exception' }
            };
        }
    }

    /**
     * Remove schedule exception
     */
    static async removeScheduleException(
        doctorId: string,
        exceptionDate: Date
    ): Promise<ApiResponse<AvailabilitySchedule>> {
        try {
            const scheduleResponse = await this.getDoctorSchedule(doctorId);
            if (scheduleResponse.error || !scheduleResponse.data) {
                return {
                    error: { status: 500, message: 'Failed to fetch doctor schedule' }
                };
            }

            const schedule = scheduleResponse.data;
            const updatedSchedule = {
                ...schedule,
                exceptions: (schedule.exceptions || []).filter(exc => 
                    exc.date.toDateString() !== exceptionDate.toDateString()
                )
            };

            return await this.updateDoctorSchedule(doctorId, updatedSchedule);
        } catch (error) {
            console.error('Error removing schedule exception:', error);
            return {
                error: { status: 500, message: 'Failed to remove schedule exception' }
            };
        }
    }

    /**
     * Get schedule statistics
     */
    static async getScheduleStats(
        doctorId: string,
        startDate: Date,
        endDate: Date
    ): Promise<ApiResponse<{
        totalWorkingHours: number;
        totalAppointments: number;
        busyDays: number;
        utilizationRate: number;
    }>> {
        try {
            // Get schedule and appointments
            const [scheduleResponse, appointmentsResponse] = await Promise.all([
                this.getDoctorSchedule(doctorId),
                this.getDoctorAppointments(doctorId, {
                    filter: {
                        dateRange: { startDate, endDate }
                    }
                })
            ]);

            if (scheduleResponse.error || !scheduleResponse.data) {
                return {
                    error: { status: 500, message: 'Failed to fetch schedule data' }
                };
            }

            const schedule = scheduleResponse.data;
            const appointments = appointmentsResponse.data || [];

            // Calculate statistics
            let totalWorkingHours = 0;
            let busyDays = 0;

            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            
            days.forEach(day => {
                const daySlots = schedule[day as keyof AvailabilitySchedule] as TimeSlot[] || [];
                if (daySlots.length > 0) {
                    busyDays++;
                    daySlots.forEach(slot => {
                        const start = new Date(`2000-01-01T${slot.startTime}:00`);
                        const end = new Date(`2000-01-01T${slot.endTime}:00`);
                        totalWorkingHours += (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                    });
                }
            });

            const totalAppointments = appointments.length;
            const totalAvailableSlots = totalWorkingHours * 2; // Assuming 30-minute slots
            const utilizationRate = totalAvailableSlots > 0 ? (totalAppointments / totalAvailableSlots) * 100 : 0;

            return {
                data: {
                    totalWorkingHours,
                    totalAppointments,
                    busyDays,
                    utilizationRate
                }
            };
        } catch (error) {
            console.error('Error calculating schedule stats:', error);
            return {
                error: { status: 500, message: 'Failed to calculate schedule statistics' }
            };
        }
    }

    /**
     * Real-time schedule updates subscription
     */
    static subscribeToScheduleUpdates(
        doctorId: string,
        onUpdate: (schedule: AvailabilitySchedule) => void,
        onError: (error: Error) => void
    ): () => void {
        const docRef = doc(db, this.SCHEDULE_COLLECTION, doctorId);
        
        return onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                const schedule: AvailabilitySchedule = {
                    ...data,
                    exceptions: (data.exceptions || []).map((exception: any) => ({
                        ...exception,
                        date: exception.date?.toDate ? exception.date.toDate() : new Date(exception.date)
                    }))
                };
                onUpdate(schedule);
            }
        }, onError);
    }
}

export default DoctorScheduleService;
