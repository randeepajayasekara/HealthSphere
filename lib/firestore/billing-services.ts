/**
 * Firestore services for billing and payment management
 * Handles billing data, insurance claims, and payment processing
 */

import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp,
  writeBatch,
  getDocs,
  startAfter,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/backend/config';
import { sanitizeMedicalData, logSecurityEvent } from '@/app/utils/security';
import type { 
  Bill, 
  BillItem, 
  InsuranceClaim, 
  PaymentMethod, 
  User,
  QueryParams,
  PaginationParams 
} from '@/app/types';

/**
 * Billing Services
 */
export class BillingService {
  private static readonly COLLECTION = 'bills';

  /**
   * Create a new bill
   */
  static async createBill(bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<string> {
    try {
      const billId = doc(collection(db, this.COLLECTION)).id;
      const sanitizedBill = sanitizeMedicalData(bill);
      const docRef = doc(db, this.COLLECTION, billId);
      
      const newBill: Bill = {
        ...sanitizedBill,
        id: billId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(docRef, {
        ...newBill,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      await logSecurityEvent(userId, 'BILL_CREATE', 'BILL', true, {
        billId,
        patientId: bill.patientId,
        total: bill.total
      });

      return billId;
    } catch (error) {
      await logSecurityEvent(userId, 'BILL_CREATE', 'BILL', false, { error });
      throw error;
    }
  }

  /**
   * Get bill by ID
   */
  static async getBillById(billId: string, userId: string): Promise<Bill | null> {
    try {
      const docRef = doc(db, this.COLLECTION, billId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      
      await logSecurityEvent(userId, 'BILL_READ', 'BILL', true, { billId });

      return {
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
        date: data.date instanceof Timestamp ? data.date.toDate() : data.date,
        dueDate: data.dueDate instanceof Timestamp ? data.dueDate.toDate() : data.dueDate,
        paidDate: data.paidDate ? (data.paidDate instanceof Timestamp ? data.paidDate.toDate() : data.paidDate) : undefined
      } as Bill;
    } catch (error) {
      await logSecurityEvent(userId, 'BILL_READ', 'BILL', false, { error, billId });
      throw error;
    }
  }

  /**
   * Get bills for a patient with pagination and filters
   */
  static async getPatientBills(
    patientId: string, 
    userId: string,
    params?: QueryParams
  ): Promise<{ bills: Bill[], totalCount: number, hasMore: boolean }> {
    try {
      const { pagination, filter, sort } = params || {};
      const pageSize = pagination?.limit || 10;
      const currentPage = pagination?.page || 1;

      let q = query(
        collection(db, this.COLLECTION),
        where('patientId', '==', patientId)
      );

      // Apply filters
      if (filter?.status) {
        q = query(q, where('status', '==', filter.status));
      }

      if (filter?.dateFrom) {
        q = query(q, where('date', '>=', filter.dateFrom));
      }

      if (filter?.dateTo) {
        q = query(q, where('date', '<=', filter.dateTo));
      }

      // Apply sorting
      const sortField = sort?.field || 'date';
      const sortDirection = sort?.direction || 'desc';
      q = query(q, orderBy(sortField, sortDirection));

      // Apply pagination
      q = query(q, limit(pageSize));

      if (currentPage > 1) {
        // Get the last document from the previous page
        const prevPageQuery = query(
          collection(db, this.COLLECTION),
          where('patientId', '==', patientId),
          orderBy(sortField, sortDirection),
          limit((currentPage - 1) * pageSize)
        );
        const prevPageSnapshot = await getDocs(prevPageQuery);
        const lastVisible = prevPageSnapshot.docs[prevPageSnapshot.docs.length - 1];
        if (lastVisible) {
          q = query(q, startAfter(lastVisible));
        }
      }

      const querySnapshot = await getDocs(q);
      const bills: Bill[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        bills.push({
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
          date: data.date instanceof Timestamp ? data.date.toDate() : data.date,
          dueDate: data.dueDate instanceof Timestamp ? data.dueDate.toDate() : data.dueDate,
          paidDate: data.paidDate ? (data.paidDate instanceof Timestamp ? data.paidDate.toDate() : data.paidDate) : undefined
        } as Bill);
      });

      // Get total count for pagination
      const countQuery = query(
        collection(db, this.COLLECTION),
        where('patientId', '==', patientId)
      );
      const countSnapshot = await getDocs(countQuery);
      const totalCount = countSnapshot.size;

      const hasMore = bills.length === pageSize;

      await logSecurityEvent(userId, 'BILLS_READ', 'BILL', true, {
        patientId,
        count: bills.length
      });

      return { bills, totalCount, hasMore };
    } catch (error) {
      await logSecurityEvent(userId, 'BILLS_READ', 'BILL', false, { error, patientId });
      throw error;
    }
  }

  /**
   * Update bill
   */
  static async updateBill(
    billId: string, 
    updates: Partial<Bill>, 
    userId: string
  ): Promise<void> {
    try {
      const sanitizedUpdates = sanitizeMedicalData(updates);
      const docRef = doc(db, this.COLLECTION, billId);
      
      await updateDoc(docRef, {
        ...sanitizedUpdates,
        updatedAt: serverTimestamp()
      });

      await logSecurityEvent(userId, 'BILL_UPDATE', 'BILL', true, {
        billId,
        updatedFields: Object.keys(updates)
      });
    } catch (error) {
      await logSecurityEvent(userId, 'BILL_UPDATE', 'BILL', false, { error, billId });
      throw error;
    }
  }

  /**
   * Process payment for a bill
   */
  static async processPayment(
    billId: string,
    paymentAmount: number,
    paymentMethod: PaymentMethod,
    userId: string,
    notes?: string
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, billId);
      const billDoc = await getDoc(docRef);
      
      if (!billDoc.exists()) {
        throw new Error('Bill not found');
      }

      const bill = billDoc.data() as Bill;
      const newPaidAmount = (bill.paidAmount || 0) + paymentAmount;
      const newStatus = newPaidAmount >= bill.total ? 'paid' : 'partially_paid';

      await updateDoc(docRef, {
        paidAmount: newPaidAmount,
        status: newStatus,
        paymentMethod,
        paidDate: newPaidAmount >= bill.total ? serverTimestamp() : bill.paidDate,
        notes: notes || bill.notes,
        updatedAt: serverTimestamp()
      });

      await logSecurityEvent(userId, 'PAYMENT_PROCESS', 'BILL', true, {
        billId,
        paymentAmount,
        paymentMethod,
        newStatus
      });
    } catch (error) {
      await logSecurityEvent(userId, 'PAYMENT_PROCESS', 'BILL', false, { error, billId });
      throw error;
    }
  }

  /**
   * Get billing summary for a patient
   */
  static async getBillingSummary(patientId: string, userId: string): Promise<{
    totalOutstanding: number;
    totalPaid: number;
    overdueCount: number;
    pendingCount: number;
    recentBills: Bill[];
  }> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('patientId', '==', patientId),
        orderBy('date', 'desc'),
        limit(50)
      );

      const querySnapshot = await getDocs(q);
      const bills: Bill[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        bills.push({
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
          date: data.date instanceof Timestamp ? data.date.toDate() : data.date,
          dueDate: data.dueDate instanceof Timestamp ? data.dueDate.toDate() : data.dueDate,
          paidDate: data.paidDate ? (data.paidDate instanceof Timestamp ? data.paidDate.toDate() : data.paidDate) : undefined
        } as Bill);
      });

      const totalOutstanding = bills
        .filter(b => b.status !== 'paid' && b.status !== 'cancelled')
        .reduce((sum, bill) => sum + (bill.total - (bill.paidAmount || 0)), 0);

      const totalPaid = bills
        .reduce((sum, bill) => sum + (bill.paidAmount || 0), 0);

      const overdueCount = bills
        .filter(b => b.status === 'overdue').length;

      const pendingCount = bills
        .filter(b => b.status === 'issued' || b.status === 'draft').length;

      const recentBills = bills.slice(0, 5);

      await logSecurityEvent(userId, 'BILLING_SUMMARY', 'BILL', true, { patientId });

      return {
        totalOutstanding,
        totalPaid,
        overdueCount,
        pendingCount,
        recentBills
      };
    } catch (error) {
      await logSecurityEvent(userId, 'BILLING_SUMMARY', 'BILL', false, { error, patientId });
      throw error;
    }
  }

  /**
   * Subscribe to patient bills
   */
  static subscribeToPatientBills(
    patientId: string,
    callback: (bills: Bill[]) => void,
    errorCallback?: (error: Error) => void
  ): () => void {
    const q = query(
      collection(db, this.COLLECTION),
      where('patientId', '==', patientId),
      orderBy('date', 'desc'),
      limit(20)
    );
    
    return onSnapshot(
      q,
      (querySnapshot) => {
        const bills: Bill[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          bills.push({
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
            date: data.date instanceof Timestamp ? data.date.toDate() : data.date,
            dueDate: data.dueDate instanceof Timestamp ? data.dueDate.toDate() : data.dueDate,
            paidDate: data.paidDate ? (data.paidDate instanceof Timestamp ? data.paidDate.toDate() : data.paidDate) : undefined
          } as Bill);
        });
        callback(bills);
      },
      (error) => {
        console.error('Bills subscription error:', error);
        if (errorCallback) errorCallback(error);
      }
    );
  }

  /**
   * Delete bill (soft delete by marking as cancelled)
   */
  static async deleteBill(billId: string, userId: string, reason?: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, billId);
      
      await updateDoc(docRef, {
        status: 'cancelled',
        notes: reason ? `Cancelled: ${reason}` : 'Cancelled',
        updatedAt: serverTimestamp()
      });

      await logSecurityEvent(userId, 'BILL_DELETE', 'BILL', true, {
        billId,
        reason
      });
    } catch (error) {
      await logSecurityEvent(userId, 'BILL_DELETE', 'BILL', false, { error, billId });
      throw error;
    }
  }
}

/**
 * Insurance Claims Services
 */
export class InsuranceClaimService {
  private static readonly COLLECTION = 'insurance_claims';

  /**
   * Create insurance claim
   */
  static async createClaim(
    claim: Omit<InsuranceClaim, 'id'>, 
    userId: string
  ): Promise<string> {
    try {
      const claimId = doc(collection(db, this.COLLECTION)).id;
      const sanitizedClaim = sanitizeMedicalData(claim);
      const docRef = doc(db, this.COLLECTION, claimId);
      
      const newClaim: InsuranceClaim = {
        ...sanitizedClaim,
        id: claimId
      };

      await setDoc(docRef, {
        ...newClaim,
        submissionDate: serverTimestamp(),
        paymentDate: claim.paymentDate ? Timestamp.fromDate(claim.paymentDate) : null
      });

      await logSecurityEvent(userId, 'INSURANCE_CLAIM_CREATE', 'INSURANCE_CLAIM', true, {
        claimId,
        billId: claim.billId
      });

      return claimId;
    } catch (error) {
      await logSecurityEvent(userId, 'INSURANCE_CLAIM_CREATE', 'INSURANCE_CLAIM', false, { error });
      throw error;
    }
  }

  /**
   * Update claim status
   */
  static async updateClaimStatus(
    claimId: string,
    status: InsuranceClaim['status'],
    userId: string,
    approvedAmount?: number,
    denialReason?: string,
    notes?: string
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, claimId);
      const updates: any = { status };
      
      if (approvedAmount !== undefined) {
        updates.approvedAmount = approvedAmount;
      }
      
      if (denialReason) {
        updates.denialReason = denialReason;
      }
      
      if (notes) {
        updates.notes = notes;
      }

      if (status === 'paid') {
        updates.paymentDate = serverTimestamp();
      }

      await updateDoc(docRef, updates);

      await logSecurityEvent(userId, 'INSURANCE_CLAIM_UPDATE', 'INSURANCE_CLAIM', true, {
        claimId,
        status,
        approvedAmount
      });
    } catch (error) {
      await logSecurityEvent(userId, 'INSURANCE_CLAIM_UPDATE', 'INSURANCE_CLAIM', false, { error, claimId });
      throw error;
    }
  }

  /**
   * Get claims for a patient
   */
  static async getPatientClaims(patientId: string, userId: string): Promise<InsuranceClaim[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('patientId', '==', patientId),
        orderBy('submissionDate', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const claims: InsuranceClaim[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        claims.push({
          ...data,
          submissionDate: data.submissionDate instanceof Timestamp ? data.submissionDate.toDate() : data.submissionDate,
          paymentDate: data.paymentDate ? (data.paymentDate instanceof Timestamp ? data.paymentDate.toDate() : data.paymentDate) : undefined
        } as InsuranceClaim);
      });

      await logSecurityEvent(userId, 'INSURANCE_CLAIMS_READ', 'INSURANCE_CLAIM', true, {
        patientId,
        count: claims.length
      });

      return claims;
    } catch (error) {
      await logSecurityEvent(userId, 'INSURANCE_CLAIMS_READ', 'INSURANCE_CLAIM', false, { error, patientId });
      throw error;
    }
  }
}

/**
 * Payment Methods Services (for managing saved payment methods)
 */
export class PaymentMethodService {
  private static readonly COLLECTION = 'payment_methods';

  /**
   * Save payment method (encrypted sensitive data)
   */
  static async savePaymentMethod(
    patientId: string,
    paymentMethodData: {
      type: PaymentMethod;
      displayName: string;
      isDefault: boolean;
      encryptedData?: string; // For card details, etc.
    },
    userId: string
  ): Promise<string> {
    try {
      const methodId = doc(collection(db, this.COLLECTION)).id;
      const docRef = doc(db, this.COLLECTION, methodId);
      
      await setDoc(docRef, {
        id: methodId,
        patientId,
        ...paymentMethodData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      await logSecurityEvent(userId, 'PAYMENT_METHOD_SAVE', 'PAYMENT_METHOD', true, {
        methodId,
        patientId,
        type: paymentMethodData.type
      });

      return methodId;
    } catch (error) {
      await logSecurityEvent(userId, 'PAYMENT_METHOD_SAVE', 'PAYMENT_METHOD', false, { error });
      throw error;
    }
  }

  /**
   * Get patient payment methods
   */
  static async getPatientPaymentMethods(patientId: string, userId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('patientId', '==', patientId),
        orderBy('isDefault', 'desc'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const methods: any[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Don't return encrypted data in the response
        methods.push({
          id: data.id,
          type: data.type,
          displayName: data.displayName,
          isDefault: data.isDefault,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt
        });
      });

      await logSecurityEvent(userId, 'PAYMENT_METHODS_READ', 'PAYMENT_METHOD', true, {
        patientId,
        count: methods.length
      });

      return methods;
    } catch (error) {
      await logSecurityEvent(userId, 'PAYMENT_METHODS_READ', 'PAYMENT_METHOD', false, { error, patientId });
      throw error;
    }
  }
}
