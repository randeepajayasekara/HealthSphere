/**
 * HealthSphere Lab Results Service
 * Firestore integration for laboratory test results management
 * Designed as modular service for easy integration with other healthcare components
 */

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
import { sanitizeMedicalData, logSecurityEvent } from '@/app/utils/security';
import type { 
  LabResult, 
  LabResultValue, 
  LabNormalRange,
  ImagingResult,
  MedicalRecord,
  UserRole,
  User,
  UploadedReport,
  ExtractedReportData,
  ReportAnalysisResult
} from '@/app/types';

// Types for real-time listeners
export type UnsubscribeFunction = () => void;

// Enhanced types for lab results management
export interface LabResultFilter {
  patientId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  testType?: string;
  abnormalOnly?: boolean;
  status?: 'pending' | 'completed' | 'reviewed' | 'archived';
  department?: string;
}

export interface LabResultSummary {
  totalTests: number;
  pendingResults: number;
  abnormalResults: number;
  criticalValues: number;
  lastTestDate?: Date;
  commonTests: string[];
}

export interface LabResultsTrend {
  testName: string;
  values: {
    date: Date;
    value: number;
    isAbnormal: boolean;
  }[];
  trend: 'improving' | 'stable' | 'concerning' | 'critical';
  unit: string;
}

// ============================================================================
// LAB RESULTS SERVICES
// ============================================================================

export const labResultsService = {
  /**
   * Get lab results for a patient with filtering and pagination
   */
  async getPatientLabResults(
    patientId: string, 
    filter?: LabResultFilter,
    lastDoc?: QueryDocumentSnapshot,
    limitCount: number = 20
  ): Promise<{ results: LabResult[], hasMore: boolean, lastDoc?: QueryDocumentSnapshot }> {
    try {
      let baseQuery = query(
        collection(db, 'lab_results'),
        where('patientId', '==', patientId),
        orderBy('testDate', 'desc')
      );

      // Apply filters
      if (filter?.dateRange) {
        baseQuery = query(
          baseQuery,
          where('testDate', '>=', Timestamp.fromDate(filter.dateRange.start)),
          where('testDate', '<=', Timestamp.fromDate(filter.dateRange.end))
        );
      }

      if (filter?.testType) {
        baseQuery = query(baseQuery, where('testName', '==', filter.testType));
      }

      if (filter?.status) {
        baseQuery = query(baseQuery, where('status', '==', filter.status));
      }

      // Apply pagination
      if (lastDoc) {
        baseQuery = query(baseQuery, startAfter(lastDoc));
      }

      baseQuery = query(baseQuery, limit(limitCount + 1));

      const querySnapshot = await getDocs(baseQuery);
      const docs = querySnapshot.docs;
      const hasMore = docs.length > limitCount;
      
      if (hasMore) {
        docs.pop(); // Remove the extra document
      }

      const results = docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        testDate: doc.data().testDate?.toDate(),
        resultDate: doc.data().resultDate?.toDate(),
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as LabResult[];

      // Apply client-side filters for complex conditions
      let filteredResults = results;
      if (filter?.abnormalOnly) {
        filteredResults = results.filter(result => 
          result.resultValues.some(value => value.isAbnormal)
        );
      }

      return {
        results: filteredResults,
        hasMore,
        lastDoc: hasMore ? docs[docs.length - 1] : undefined
      };
    } catch (error) {
      console.error('Error fetching lab results:', error);
      throw error;
    }
  },

  /**
   * Real-time lab results listener
   */
  subscribeToPatientLabResults(
    patientId: string,
    callback: (results: LabResult[]) => void,
    filter?: LabResultFilter
  ): UnsubscribeFunction {
    let baseQuery = query(
      collection(db, 'lab_results'),
      where('patientId', '==', patientId),
      orderBy('testDate', 'desc'),
      limit(50)
    );

    // Apply basic filters
    if (filter?.dateRange) {
      baseQuery = query(
        baseQuery,
        where('testDate', '>=', Timestamp.fromDate(filter.dateRange.start)),
        where('testDate', '<=', Timestamp.fromDate(filter.dateRange.end))
      );
    }

    return onSnapshot(baseQuery, (querySnapshot) => {
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        testDate: doc.data().testDate?.toDate(),
        resultDate: doc.data().resultDate?.toDate(),
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as LabResult[];
      
      callback(results);
    });
  },

  /**
   * Get a single lab result by ID
   */
  async getLabResultById(resultId: string): Promise<LabResult | null> {
    try {
      const docRef = doc(db, 'lab_results', resultId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          testDate: data.testDate?.toDate(),
          resultDate: data.resultDate?.toDate(),
          date: data.date?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as LabResult;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching lab result:', error);
      throw error;
    }
  },

  /**
   * Create new lab result
   */
  async createLabResult(
    labResultData: Omit<LabResult, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<string> {
    try {
      const sanitizedData = sanitizeMedicalData(labResultData);
      
      const docRef = await addDoc(collection(db, 'lab_results'), {
        ...sanitizedData,
        testDate: Timestamp.fromDate(labResultData.testDate),
        resultDate: Timestamp.fromDate(labResultData.resultDate),
        date: Timestamp.fromDate(labResultData.date),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userId,
        status: 'completed'
      });

      await logSecurityEvent(userId, 'CREATE', 'LAB_RESULT', true, {
        resultId: docRef.id,
        patientId: labResultData.patientId,
        testName: labResultData.testName
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating lab result:', error);
      await logSecurityEvent(userId, 'CREATE', 'LAB_RESULT', false, { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  },

  /**
   * Update lab result
   */
  async updateLabResult(
    resultId: string,
    updates: Partial<LabResult>,
    userId: string
  ): Promise<void> {
    try {
      const sanitizedUpdates = sanitizeMedicalData(updates);
      const docRef = doc(db, 'lab_results', resultId);
      
      const updateData: any = {
        ...sanitizedUpdates,
        updatedAt: serverTimestamp(),
        lastModifiedBy: userId
      };

      // Convert dates to Timestamps
      if (updates.testDate) {
        updateData.testDate = Timestamp.fromDate(updates.testDate);
      }
      if (updates.resultDate) {
        updateData.resultDate = Timestamp.fromDate(updates.resultDate);
      }
      if (updates.date) {
        updateData.date = Timestamp.fromDate(updates.date);
      }

      await updateDoc(docRef, updateData);

      await logSecurityEvent(userId, 'UPDATE', 'LAB_RESULT', true, {
        resultId,
        updatedFields: Object.keys(updates)
      });
    } catch (error) {
      console.error('Error updating lab result:', error);
      await logSecurityEvent(userId, 'UPDATE', 'LAB_RESULT', false, { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  },

  /**
   * Get lab results summary for dashboard
   */
  async getLabResultsSummary(patientId: string): Promise<LabResultSummary> {
    try {
      const recentQuery = query(
        collection(db, 'lab_results'),
        where('patientId', '==', patientId),
        orderBy('testDate', 'desc'),
        limit(100)
      );

      const querySnapshot = await getDocs(recentQuery);
      const results = querySnapshot.docs.map(doc => doc.data()) as LabResult[];

      const summary: LabResultSummary = {
        totalTests: results.length,
        pendingResults: results.filter(r => (r as any).status === 'pending').length,
        abnormalResults: results.filter(r => 
          r.resultValues?.some(value => value.isAbnormal)
        ).length,
        criticalValues: results.filter(r =>
          r.resultValues?.some(value => value.isAbnormal && value.value)
        ).length,
        lastTestDate: results[0]?.testDate instanceof Date ? results[0]?.testDate : new Date(),
        commonTests: [...new Set(results.map(r => r.testName))].slice(0, 5)
      };

      return summary;
    } catch (error) {
      console.error('Error getting lab results summary:', error);
      throw error;
    }
  },

  /**
   * Get trending data for a specific test
   */
  async getLabResultsTrend(
    patientId: string,
    testName: string,
    months: number = 12
  ): Promise<LabResultsTrend | null> {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const trendQuery = query(
        collection(db, 'lab_results'),
        where('patientId', '==', patientId),
        where('testName', '==', testName),
        where('testDate', '>=', Timestamp.fromDate(startDate)),
        orderBy('testDate', 'asc')
      );

      const querySnapshot = await getDocs(trendQuery);
      const results = querySnapshot.docs.map(doc => doc.data()) as LabResult[];

      if (results.length === 0) return null;

      // Extract trending values
      const values = results.flatMap(result => 
        result.resultValues
          ?.filter(value => value.parameter.toLowerCase().includes(testName.toLowerCase()))
          .map(value => ({
            date: result.testDate instanceof Date ? result.testDate : new Date(),
            value: typeof value.value === 'number' ? value.value : parseFloat(value.value as string) || 0,
            isAbnormal: value.isAbnormal
          })) || []
      );

      if (values.length === 0) return null;

      // Determine trend
      const recent = values.slice(-3);
      const earlier = values.slice(0, -3);
      let trend: 'improving' | 'stable' | 'concerning' | 'critical' = 'stable';

      if (recent.length >= 2) {
        const recentAvg = recent.reduce((sum, v) => sum + v.value, 0) / recent.length;
        const earlierAvg = earlier.length > 0 
          ? earlier.reduce((sum, v) => sum + v.value, 0) / earlier.length 
          : recentAvg;

        const abnormalCount = recent.filter(v => v.isAbnormal).length;
        
        if (abnormalCount >= 2) {
          trend = 'critical';
        } else if (abnormalCount >= 1) {
          trend = 'concerning';
        } else if (Math.abs(recentAvg - earlierAvg) / earlierAvg > 0.1) {
          trend = recentAvg > earlierAvg ? 'concerning' : 'improving';
        }
      }

      return {
        testName,
        values,
        trend,
        unit: results[0]?.resultValues?.[0]?.unit || ''
      };
    } catch (error) {
      console.error('Error getting lab results trend:', error);
      throw error;
    }
  },

  /**
   * Search lab results across multiple criteria
   */
  async searchLabResults(
    searchCriteria: {
      patientId?: string;
      testName?: string;
      dateRange?: { start: Date; end: Date };
      abnormalOnly?: boolean;
      department?: string;
    },
    userRole: UserRole,
    limitCount: number = 50
  ): Promise<LabResult[]> {
    try {
      let baseQuery = collection(db, 'lab_results');
      let constraints = [];

      // Role-based access control
      if (userRole === 'patient' && searchCriteria.patientId) {
        constraints.push(where('patientId', '==', searchCriteria.patientId));
      } else if (['doctor', 'nurse', 'lab_technician'].includes(userRole)) {
        // Healthcare providers can search across patients
        if (searchCriteria.patientId) {
          constraints.push(where('patientId', '==', searchCriteria.patientId));
        }
      }

      if (searchCriteria.testName) {
        constraints.push(where('testName', '==', searchCriteria.testName));
      }

      if (searchCriteria.dateRange) {
        constraints.push(
          where('testDate', '>=', Timestamp.fromDate(searchCriteria.dateRange.start)),
          where('testDate', '<=', Timestamp.fromDate(searchCriteria.dateRange.end))
        );
      }

      constraints.push(orderBy('testDate', 'desc'));
      constraints.push(limit(limitCount));

      const searchQuery = query(baseQuery, ...constraints);
      const querySnapshot = await getDocs(searchQuery);
      
      let results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        testDate: doc.data().testDate?.toDate(),
        resultDate: doc.data().resultDate?.toDate(),
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as LabResult[];

      // Apply client-side filters
      if (searchCriteria.abnormalOnly) {
        results = results.filter(result => 
          result.resultValues?.some(value => value.isAbnormal)
        );
      }

      return results;
    } catch (error) {
      console.error('Error searching lab results:', error);
      throw error;
    }
  }
};

// ============================================================================
// IMAGING RESULTS SERVICES
// ============================================================================

export const imagingResultsService = {
  /**
   * Get imaging results for a patient
   */
  async getPatientImagingResults(patientId: string): Promise<ImagingResult[]> {
    try {
      const q = query(
        collection(db, 'imaging_results'),
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
      })) as ImagingResult[];
    } catch (error) {
      console.error('Error fetching imaging results:', error);
      throw error;
    }
  },

  /**
   * Create new imaging result
   */
  async createImagingResult(
    imagingData: Omit<ImagingResult, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<string> {
    try {
      const sanitizedData = sanitizeMedicalData(imagingData);
      
      const docRef = await addDoc(collection(db, 'imaging_results'), {
        ...sanitizedData,
        date: Timestamp.fromDate(imagingData.date),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userId
      });

      await logSecurityEvent(userId, 'CREATE', 'IMAGING_RESULT', true, {
        resultId: docRef.id,
        patientId: imagingData.patientId,
        procedureName: imagingData.procedureName
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating imaging result:', error);
      throw error;
    }
  }
};

// ============================================================================
// MEDICAL RECORDS INTEGRATION
// ============================================================================

export const medicalRecordsService = {
  /**
   * Link lab result to medical record
   */
  async linkLabResultToRecord(
    labResultId: string,
    medicalRecordId: string,
    userId: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Update lab result with medical record reference
      const labResultRef = doc(db, 'lab_results', labResultId);
      batch.update(labResultRef, {
        linkedMedicalRecordId: medicalRecordId,
        updatedAt: serverTimestamp()
      });

      // Update medical record with lab result reference
      const medicalRecordRef = doc(db, 'medical_records', medicalRecordId);
      batch.update(medicalRecordRef, {
        linkedLabResults: labResultId,
        updatedAt: serverTimestamp()
      });

      await batch.commit();

      await logSecurityEvent(userId, 'LINK', 'LAB_RESULT_MEDICAL_RECORD', true, {
        labResultId,
        medicalRecordId
      });
    } catch (error) {
      console.error('Error linking lab result to medical record:', error);
      throw error;
    }
  }
};

export default {
  labResultsService,
  imagingResultsService,
  medicalRecordsService
};
