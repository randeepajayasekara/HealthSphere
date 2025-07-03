import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  onSnapshot,
  addDoc,
  writeBatch,
  serverTimestamp,
  Timestamp,
  DocumentSnapshot,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/backend/config';
import { 
  Appointment, 
  Prescription, 
  MedicalRecord,
  AppointmentRequest,
  VirtualMeetingInfo,
  User,
  AppointmentStatus,
  AppointmentType
} from '@/app/types';

// Types for real-time listeners
export type UnsubscribeFunction = () => void;

// ============================================================================
// APPOINTMENT SERVICES
// ============================================================================

export const appointmentService = {
  // Get all appointments for a patient
  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    try {
      const q = query(
        collection(db, 'appointments'),
        where('patientId', '==', patientId),
        orderBy('date', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        followUpDate: doc.data().followUpDate?.toDate()
      })) as Appointment[];
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  // Real-time appointments listener
  subscribeToPatientAppointments(
    patientId: string, 
    callback: (appointments: Appointment[]) => void
  ): UnsubscribeFunction {
    const q = query(
      collection(db, 'appointments'),
      where('patientId', '==', patientId),
      orderBy('date', 'asc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const appointments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        followUpDate: doc.data().followUpDate?.toDate()
      })) as Appointment[];
      
      callback(appointments);
    });
  },

  // Book new appointment
  async bookAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'appointments'), {
        ...appointmentData,
        date: Timestamp.fromDate(appointmentData.date),
        followUpDate: appointmentData.followUpDate ? Timestamp.fromDate(appointmentData.followUpDate) : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error booking appointment:', error);
      throw error;
    }
  },

  // Update appointment status
  async updateAppointmentStatus(appointmentId: string, status: AppointmentStatus): Promise<void> {
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  },

  // Cancel appointment
  async cancelAppointment(appointmentId: string, reason?: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'cancelled',
        notes: reason ? `Cancelled: ${reason}` : 'Cancelled by patient',
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  },

  // Get upcoming appointments
  async getUpcomingAppointments(patientId: string, limitCount: number = 5): Promise<Appointment[]> {
    try {
      const now = new Date();
      const q = query(
        collection(db, 'appointments'),
        where('patientId', '==', patientId),
        where('date', '>=', Timestamp.fromDate(now)),
        where('status', 'in', ['scheduled', 'confirmed']),
        orderBy('date', 'asc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        followUpDate: doc.data().followUpDate?.toDate()
      })) as Appointment[];
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      throw error;
    }
  }
};

// ============================================================================
// TELEMEDICINE SERVICES
// ============================================================================

export const telemedicineService = {
  // Create virtual meeting for appointment
  async createVirtualMeeting(
    appointmentId: string, 
    meetingInfo: VirtualMeetingInfo
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        virtualMeeting: meetingInfo,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating virtual meeting:', error);
      throw error;
    }
  },

  // Get virtual appointments for patient
  async getVirtualAppointments(patientId: string): Promise<Appointment[]> {
    try {
      const q = query(
        collection(db, 'appointments'),
        where('patientId', '==', patientId),
        where('virtualMeeting', '!=', null),
        orderBy('virtualMeeting'),
        orderBy('date', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        followUpDate: doc.data().followUpDate?.toDate()
      })) as Appointment[];
    } catch (error) {
      console.error('Error fetching virtual appointments:', error);
      throw error;
    }
  },

  // Join virtual appointment
  async joinVirtualAppointment(appointmentId: string): Promise<VirtualMeetingInfo | null> {
    try {
      const docRef = doc(db, 'appointments', appointmentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const appointment = docSnap.data() as Appointment;
        
        // Update appointment status to 'in_progress'
        await updateDoc(docRef, {
          status: 'in_progress',
          updatedAt: serverTimestamp()
        });
        
        return appointment.virtualMeeting || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error joining virtual appointment:', error);
      throw error;
    }
  }
};

// ============================================================================
// MEDICAL RECORDS SERVICES
// ============================================================================

export const medicalRecordsService = {
  // Get patient medical records
  async getPatientMedicalRecords(patientId: string): Promise<MedicalRecord[]> {
    try {
      const q = query(
        collection(db, 'medical_records'),
        where('patientId', '==', patientId),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as MedicalRecord[];
    } catch (error) {
      console.error('Error fetching medical records:', error);
      throw error;
    }
  },

  // Real-time medical records listener
  subscribeToMedicalRecords(
    patientId: string,
    callback: (records: MedicalRecord[]) => void
  ): UnsubscribeFunction {
    const q = query(
      collection(db, 'medical_records'),
      where('patientId', '==', patientId),
      orderBy('date', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const records = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as MedicalRecord[];
      
      callback(records);
    });
  },

  // Get medical record by ID
  async getMedicalRecord(recordId: string): Promise<MedicalRecord | null> {
    try {
      const docRef = doc(db, 'medical_records', recordId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          date: docSnap.data().date?.toDate(),
          createdAt: docSnap.data().createdAt?.toDate(),
          updatedAt: docSnap.data().updatedAt?.toDate()
        } as MedicalRecord;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching medical record:', error);
      throw error;
    }
  }
};

// ============================================================================
// PRESCRIPTION SERVICES
// ============================================================================

export const prescriptionService = {
  // Get patient prescriptions
  async getPatientPrescriptions(patientId: string): Promise<Prescription[]> {
    try {
      const q = query(
        collection(db, 'prescriptions'),
        where('patientId', '==', patientId),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        expiryDate: doc.data().expiryDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Prescription[];
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      throw error;
    }
  },

  // Real-time prescriptions listener
  subscribeToPrescriptions(
    patientId: string,
    callback: (prescriptions: Prescription[]) => void
  ): UnsubscribeFunction {
    const q = query(
      collection(db, 'prescriptions'),
      where('patientId', '==', patientId),
      orderBy('date', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const prescriptions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        expiryDate: doc.data().expiryDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Prescription[];
      
      callback(prescriptions);
    });
  },

  // Get active prescriptions
  async getActivePrescriptions(patientId: string): Promise<Prescription[]> {
    try {
      const q = query(
        collection(db, 'prescriptions'),
        where('patientId', '==', patientId),
        where('status', '==', 'active'),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        expiryDate: doc.data().expiryDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Prescription[];
    } catch (error) {
      console.error('Error fetching active prescriptions:', error);
      throw error;
    }
  },

  // Get prescription by ID
  async getPrescription(prescriptionId: string): Promise<Prescription | null> {
    try {
      const docRef = doc(db, 'prescriptions', prescriptionId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          date: docSnap.data().date?.toDate(),
          expiryDate: docSnap.data().expiryDate?.toDate(),
          createdAt: docSnap.data().createdAt?.toDate(),
          updatedAt: docSnap.data().updatedAt?.toDate()
        } as Prescription;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching prescription:', error);
      throw error;
    }
  }
};

// ============================================================================
// DOCTOR SERVICES
// ============================================================================

export const doctorService = {
  // Get doctor information
  async getDoctor(doctorId: string): Promise<User | null> {
    try {
      const docRef = doc(db, 'users', doctorId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate(),
          updatedAt: docSnap.data().updatedAt?.toDate(),
          lastLogin: docSnap.data().lastLogin?.toDate(),
          dateOfBirth: docSnap.data().dateOfBirth?.toDate(),
          passwordLastChanged: docSnap.data().passwordLastChanged?.toDate(),
          lastFailedLogin: docSnap.data().lastFailedLogin?.toDate()
        } as User;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching doctor information:', error);
      throw error;
    }
  },

  // Get available doctors
  async getAvailableDoctors(): Promise<User[]> {
    try {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'doctor'),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        lastLogin: doc.data().lastLogin?.toDate(),
        dateOfBirth: doc.data().dateOfBirth?.toDate(),
        passwordLastChanged: doc.data().passwordLastChanged?.toDate(),
        lastFailedLogin: doc.data().lastFailedLogin?.toDate()
      })) as User[];
    } catch (error) {
      console.error('Error fetching available doctors:', error);
      throw error;
    }
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const patientUtilities = {
  // Format date for display
  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Format time for display
  formatTime(time: string): string {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  },

  // Check if appointment is today
  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  },

  // Check if appointment is upcoming (within next 7 days)
  isUpcoming(date: Date): boolean {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return date >= now && date <= sevenDaysFromNow;
  },

  // Get status color for UI
  getStatusColor(status: AppointmentStatus): string {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'in_progress':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'no_show':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }
};
