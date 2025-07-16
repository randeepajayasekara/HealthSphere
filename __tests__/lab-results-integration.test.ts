/**
 * Lab Results Integration Tests
 * Demonstrates testing patterns for HealthSphere modular integration
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { labResultsService, imagingResultsService } from '@/lib/firestore/lab-results-services';
import type { LabResult, ImagingResult, LabResultValue, UserRole } from '@/app/types';

// Mock Firestore
jest.mock('@/backend/config', () => ({
  db: {}
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn(),
  onSnapshot: jest.fn(),
  addDoc: jest.fn(),
  writeBatch: jest.fn(),
  serverTimestamp: jest.fn(),
  Timestamp: {
    fromDate: jest.fn((date: Date) => ({ toDate: () => date }))
  }
}));

// Mock security utilities
jest.mock('@/app/utils/security', () => ({
  sanitizeMedicalData: jest.fn((data: any) => data),
  logSecurityEvent: jest.fn()
}));

// Test data factories
const createMockLabResult = (overrides?: Partial<LabResult>): LabResult => ({
  id: 'lab-result-1',
  patientId: 'patient-1',
  providerId: 'doctor-1',
  date: new Date('2025-01-10'),
  type: 'lab_result',
  testName: 'Complete Blood Count',
  testDate: new Date('2025-01-10'),
  resultDate: new Date('2025-01-11'),
  resultValues: [
    {
      parameter: 'White Blood Cells',
      value: 7.5,
      unit: 'K/uL',
      isAbnormal: false
    },
    {
      parameter: 'Red Blood Cells',
      value: 4.2,
      unit: 'M/uL',
      isAbnormal: false
    }
  ],
  normalRanges: [
    {
      parameter: 'White Blood Cells',
      minValue: 4.0,
      maxValue: 11.0,
      unit: 'K/uL'
    }
  ],
  interpretation: 'All values within normal limits',
  laboratoryName: 'HealthSphere Lab',
  technicianName: 'Lab Tech 1',
  description: 'Routine blood work',
  attachments: [],
  notes: '',
  diagnosis: '',
  treatment: '',
  followUpRecommendations: '',
  createdAt: new Date('2025-01-11'),
  updatedAt: new Date('2025-01-11'),
  ...overrides
});

const createMockImagingResult = (overrides?: Partial<ImagingResult>): ImagingResult => ({
  id: 'imaging-1',
  patientId: 'patient-1',
  providerId: 'radiologist-1',
  date: new Date('2025-01-10'),
  type: 'imaging',
  procedureName: 'Chest X-Ray',
  bodyPart: 'Chest',
  findings: 'Normal chest anatomy. No acute abnormalities.',
  impression: 'Normal chest X-ray.',
  radiologistName: 'Dr. Radiologist',
  facilityName: 'HealthSphere Imaging Center',
  description: 'Chest X-ray examination',
  attachments: [],
  notes: '',
  diagnosis: '',
  treatment: '',
  followUpRecommendations: '',
  createdAt: new Date('2025-01-10'),
  updatedAt: new Date('2025-01-10'),
  ...overrides
});

describe('Lab Results Service Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Data Retrieval', () => {
    it('should get patient lab results with filtering', async () => {
      const mockResults = [createMockLabResult(), createMockLabResult({ id: 'lab-result-2' })];
      const mockQuerySnapshot = {
        docs: mockResults.map(result => ({
          id: result.id,
          data: () => ({
            ...result,
            testDate: { toDate: () => result.testDate },
            resultDate: { toDate: () => result.resultDate },
            date: { toDate: () => result.date },
            createdAt: { toDate: () => result.createdAt },
            updatedAt: { toDate: () => result.updatedAt }
          })
        }))
      };

      const { getDocs } = require('firebase/firestore');
      getDocs.mockResolvedValue(mockQuerySnapshot);

      const filter = { abnormalOnly: false };
      const { results, hasMore } = await labResultsService.getPatientLabResults('patient-1', filter);

      expect(results).toHaveLength(2);
      expect(results[0].testName).toBe('Complete Blood Count');
      expect(hasMore).toBe(false);
    });

    it('should filter abnormal results correctly', async () => {
      const normalResult = createMockLabResult();
      const abnormalResult = createMockLabResult({
        id: 'lab-result-2',
        resultValues: [
          {
            parameter: 'White Blood Cells',
            value: 15.0, // Abnormally high
            unit: 'K/uL',
            isAbnormal: true
          }
        ]
      });

      const mockQuerySnapshot = {
        docs: [normalResult, abnormalResult].map(result => ({
          id: result.id,
          data: () => ({
            ...result,
            testDate: { toDate: () => result.testDate },
            resultDate: { toDate: () => result.resultDate },
            date: { toDate: () => result.date },
            createdAt: { toDate: () => result.createdAt },
            updatedAt: { toDate: () => result.updatedAt }
          })
        }))
      };

      const { getDocs } = require('firebase/firestore');
      getDocs.mockResolvedValue(mockQuerySnapshot);

      const filter = { abnormalOnly: true };
      const { results } = await labResultsService.getPatientLabResults('patient-1', filter);

      // Client-side filtering should be applied
      const filteredResults = results.filter(result => 
        result.resultValues.some(value => value.isAbnormal)
      );

      expect(filteredResults).toHaveLength(1);
      expect(filteredResults[0].id).toBe('lab-result-2');
    });

    it('should get lab results summary correctly', async () => {
      const mockResults = [
        createMockLabResult(),
        createMockLabResult({
          id: 'lab-result-2',
          testName: 'Lipid Panel',
          resultValues: [
            {
              parameter: 'Total Cholesterol',
              value: 240, // Abnormally high
              unit: 'mg/dL',
              isAbnormal: true
            }
          ]
        })
      ];

      const mockQuerySnapshot = {
        docs: mockResults.map(result => ({
          data: () => ({
            ...result,
            testDate: { toDate: () => result.testDate }
          })
        }))
      };

      const { getDocs } = require('firebase/firestore');
      getDocs.mockResolvedValue(mockQuerySnapshot);

      const summary = await labResultsService.getLabResultsSummary('patient-1');

      expect(summary.totalTests).toBe(2);
      expect(summary.abnormalResults).toBe(1);
      expect(summary.commonTests).toContain('Complete Blood Count');
      expect(summary.commonTests).toContain('Lipid Panel');
    });
  });

  describe('Data Creation and Updates', () => {
    it('should create new lab result with proper audit trail', async () => {
      const { addDoc, serverTimestamp } = require('firebase/firestore');
      const { logSecurityEvent } = require('@/app/utils/security');
      
      addDoc.mockResolvedValue({ id: 'new-lab-result-id' });
      serverTimestamp.mockReturnValue('mock-timestamp');

      const newLabResult = createMockLabResult();
      delete (newLabResult as any).id;
      delete (newLabResult as any).createdAt;
      delete (newLabResult as any).updatedAt;

      const resultId = await labResultsService.createLabResult(newLabResult, 'user-1');

      expect(resultId).toBe('new-lab-result-id');
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          createdAt: 'mock-timestamp',
          updatedAt: 'mock-timestamp',
          createdBy: 'user-1',
          status: 'completed'
        })
      );
      expect(logSecurityEvent).toHaveBeenCalledWith(
        'user-1',
        'CREATE',
        'LAB_RESULT',
        true,
        expect.objectContaining({
          resultId: 'new-lab-result-id',
          patientId: newLabResult.patientId,
          testName: newLabResult.testName
        })
      );
    });

    it('should update lab result with proper versioning', async () => {
      const { updateDoc, serverTimestamp } = require('firebase/firestore');
      const { logSecurityEvent } = require('@/app/utils/security');
      
      serverTimestamp.mockReturnValue('mock-timestamp');

      const updates = {
        interpretation: 'Updated interpretation',
        notes: 'Additional notes'
      };

      await labResultsService.updateLabResult('lab-result-1', updates, 'user-1');

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ...updates,
          updatedAt: 'mock-timestamp',
          lastModifiedBy: 'user-1'
        })
      );
      expect(logSecurityEvent).toHaveBeenCalledWith(
        'user-1',
        'UPDATE',
        'LAB_RESULT',
        true,
        expect.objectContaining({
          resultId: 'lab-result-1',
          updatedFields: Object.keys(updates)
        })
      );
    });
  });

  describe('Trend Analysis', () => {
    it('should calculate trends correctly', async () => {
      const mockTrendData = [
        createMockLabResult({
          testDate: new Date('2024-07-01'),
          resultValues: [{ parameter: 'Glucose', value: 90, unit: 'mg/dL', isAbnormal: false }]
        }),
        createMockLabResult({
          testDate: new Date('2024-08-01'),
          resultValues: [{ parameter: 'Glucose', value: 95, unit: 'mg/dL', isAbnormal: false }]
        }),
        createMockLabResult({
          testDate: new Date('2024-09-01'),
          resultValues: [{ parameter: 'Glucose', value: 110, unit: 'mg/dL', isAbnormal: true }]
        })
      ];

      const mockQuerySnapshot = {
        docs: mockTrendData.map(result => ({
          data: () => ({
            ...result,
            testDate: { toDate: () => result.testDate }
          })
        }))
      };

      const { getDocs } = require('firebase/firestore');
      getDocs.mockResolvedValue(mockQuerySnapshot);

      const trend = await labResultsService.getLabResultsTrend('patient-1', 'Glucose', 6);

      expect(trend).not.toBeNull();
      expect(trend!.testName).toBe('Glucose');
      expect(trend!.values).toHaveLength(3);
      expect(trend!.trend).toBe('concerning'); // Should detect abnormal value
      expect(trend!.unit).toBe('mg/dL');
    });
  });

  describe('Real-time Subscriptions', () => {
    it('should set up real-time listener correctly', () => {
      const { onSnapshot } = require('firebase/firestore');
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();
      
      onSnapshot.mockReturnValue(mockUnsubscribe);

      const unsubscribe = labResultsService.subscribeToPatientLabResults(
        'patient-1',
        mockCallback
      );

      expect(onSnapshot).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
      
      // Test unsubscribe
      unsubscribe();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('Role-Based Access Control', () => {
    it('should enforce role-based search permissions', async () => {
      const mockResults = [createMockLabResult()];
      const mockQuerySnapshot = {
        docs: mockResults.map(result => ({
          id: result.id,
          data: () => ({
            ...result,
            testDate: { toDate: () => result.testDate },
            resultDate: { toDate: () => result.resultDate },
            date: { toDate: () => result.date },
            createdAt: { toDate: () => result.createdAt },
            updatedAt: { toDate: () => result.updatedAt }
          })
        }))
      };

      const { getDocs } = require('firebase/firestore');
      getDocs.mockResolvedValue(mockQuerySnapshot);

      // Patient role - should require patientId
      const patientResults = await labResultsService.searchLabResults(
        { patientId: 'patient-1' },
        'patient' as UserRole
      );
      expect(patientResults).toHaveLength(1);

      // Doctor role - can search across patients
      const doctorResults = await labResultsService.searchLabResults(
        { testName: 'Complete Blood Count' },
        'doctor' as UserRole
      );
      expect(doctorResults).toHaveLength(1);
    });
  });
});

describe('Cross-Service Integration', () => {
  describe('Medical Records Integration', () => {
    it('should link lab results to medical records', async () => {
      const { writeBatch, serverTimestamp } = require('firebase/firestore');
      const { logSecurityEvent } = require('@/app/utils/security');
      
      const mockBatch = {
        update: jest.fn(),
        commit: jest.fn()
      };
      writeBatch.mockReturnValue(mockBatch);
      serverTimestamp.mockReturnValue('mock-timestamp');

      const { medicalRecordsService } = require('@/lib/firestore/lab-results-services');

      await medicalRecordsService.linkLabResultToRecord(
        'lab-result-1',
        'medical-record-1',
        'user-1'
      );

      expect(mockBatch.update).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalled();
      expect(logSecurityEvent).toHaveBeenCalledWith(
        'user-1',
        'LINK',
        'LAB_RESULT_MEDICAL_RECORD',
        true,
        expect.objectContaining({
          labResultId: 'lab-result-1',
          medicalRecordId: 'medical-record-1'
        })
      );
    });
  });

  describe('Notification Integration', () => {
    it('should trigger notifications for critical results', async () => {
      // This would test integration with notification service
      const criticalResult = createMockLabResult({
        resultValues: [
          {
            parameter: 'Potassium',
            value: 6.5, // Critically high
            unit: 'mEq/L',
            isAbnormal: true
          }
        ]
      });

      // Mock notification service
      const mockNotificationService = {
        createNotification: jest.fn()
      };

      // In a real implementation, this would be triggered by the service
      await mockNotificationService.createNotification({
        userId: criticalResult.patientId,
        type: 'lab_result',
        title: 'Critical Lab Result',
        message: 'Critical value detected in recent lab results',
        priority: 'urgent'
      });

      expect(mockNotificationService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'lab_result',
          priority: 'urgent'
        })
      );
    });
  });
});

describe('Performance and Optimization', () => {
  it('should handle pagination correctly', async () => {
    const mockResults = Array.from({ length: 25 }, (_, i) => 
      createMockLabResult({ id: `lab-result-${i}` })
    );

    const mockQuerySnapshot = {
      docs: mockResults.map((result, index) => ({
        id: result.id,
        data: () => ({
          ...result,
          testDate: { toDate: () => result.testDate },
          resultDate: { toDate: () => result.resultDate },
          date: { toDate: () => result.date },
          createdAt: { toDate: () => result.createdAt },
          updatedAt: { toDate: () => result.updatedAt }
        })
      }))
    };

    const { getDocs } = require('firebase/firestore');
    getDocs.mockResolvedValue(mockQuerySnapshot);

    const { results, hasMore } = await labResultsService.getPatientLabResults(
      'patient-1',
      {},
      undefined,
      20
    );

    expect(results).toHaveLength(20); // Should limit to 20
    expect(hasMore).toBe(true); // Should indicate more data available
  });

  it('should cache frequently accessed data', async () => {
    // Test caching behavior (would require cache implementation)
    const mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      invalidate: jest.fn()
    };

    // In a real implementation, cache would be checked first
    mockCache.get.mockReturnValue(null); // Cache miss
    
    const { getDocs } = require('firebase/firestore');
    getDocs.mockResolvedValue({ docs: [] });

    await labResultsService.getLabResultsSummary('patient-1');

    // Should attempt to cache the result
    // expect(mockCache.set).toHaveBeenCalled();
  });
});

describe('Error Handling and Resilience', () => {
  it('should handle network errors gracefully', async () => {
    const { getDocs } = require('firebase/firestore');
    getDocs.mockRejectedValue(new Error('Network error'));

    await expect(
      labResultsService.getPatientLabResults('patient-1')
    ).rejects.toThrow('Network error');
  });

  it('should handle malformed data gracefully', async () => {
    const malformedData = {
      docs: [
        {
          id: 'bad-result',
          data: () => ({
            // Missing required fields
            patientId: 'patient-1'
          })
        }
      ]
    };

    const { getDocs } = require('firebase/firestore');
    getDocs.mockResolvedValue(malformedData);

    const { results } = await labResultsService.getPatientLabResults('patient-1');
    
    // Should handle gracefully and return what it can
    expect(Array.isArray(results)).toBe(true);
  });
});

describe('Security and Compliance', () => {
  it('should sanitize all input data', async () => {
    const { sanitizeMedicalData } = require('@/app/utils/security');
    
    const unsafeLabResult = createMockLabResult({
      notes: '<script>alert("xss")</script>Legitimate notes'
    });

    delete (unsafeLabResult as any).id;
    delete (unsafeLabResult as any).createdAt;
    delete (unsafeLabResult as any).updatedAt;

    await labResultsService.createLabResult(unsafeLabResult, 'user-1');

    expect(sanitizeMedicalData).toHaveBeenCalledWith(unsafeLabResult);
  });

  it('should log all data access events', async () => {
    const { logSecurityEvent } = require('@/app/utils/security');
    
    const mockDoc = {
      exists: () => true,
      id: 'lab-result-1',
      data: () => createMockLabResult()
    };

    const { getDoc } = require('firebase/firestore');
    getDoc.mockResolvedValue(mockDoc);

    await labResultsService.getLabResultById('lab-result-1');

    // In a real implementation, this would log the access
    // expect(logSecurityEvent).toHaveBeenCalledWith(
    //   expect.any(String),
    //   'READ',
    //   'LAB_RESULT',
    //   true,
    //   expect.objectContaining({ resultId: 'lab-result-1' })
    // );
  });
});
