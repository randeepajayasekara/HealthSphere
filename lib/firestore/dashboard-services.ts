/**
 * Firestore services for dashboard and widget management
 * Handles real-time data synchronization and CRUD operations
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
  getDocs
} from 'firebase/firestore';
import { db } from '@/backend/config';
import { sanitizeMedicalData, logSecurityEvent } from '@/app/utils/security';
import type { DashboardLayout, WidgetConfig, WidgetData } from '@/app/utils/widgets';
import type { UniversalMedicalID, UMIDAccessLog } from '@/app/types';

/**
 * Dashboard Layout Services
 */
export class DashboardService {
  private static readonly COLLECTION = 'dashboard_layouts';

  /**
   * Save dashboard layout to Firestore
   */
  static async saveDashboardLayout(layout: DashboardLayout, userId: string): Promise<void> {
    try {
      const sanitizedLayout = sanitizeMedicalData(layout);
      const docRef = doc(db, this.COLLECTION, layout.id);
      
      await setDoc(docRef, {
        ...sanitizedLayout,
        updatedAt: serverTimestamp()
      });

      await logSecurityEvent(userId, 'DASHBOARD_SAVE', 'DASHBOARD_LAYOUT', true, {
        layoutId: layout.id,
        widgetCount: layout.widgets.length
      });
    } catch (error) {
      await logSecurityEvent(userId, 'DASHBOARD_SAVE', 'DASHBOARD_LAYOUT', false, { error });
      throw error;
    }
  }

  /**
   * Load dashboard layout from Firestore
   */
  static async loadDashboardLayout(layoutId: string, userId: string): Promise<DashboardLayout | null> {
    try {
      const docRef = doc(db, this.COLLECTION, layoutId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data() as DashboardLayout;
      
      await logSecurityEvent(userId, 'DASHBOARD_LOAD', 'DASHBOARD_LAYOUT', true, {
        layoutId
      });

      return {
        ...data,
        createdAt: data.createdAt instanceof Date ? data.createdAt : (data.createdAt as any).toDate(),
        updatedAt: data.updatedAt instanceof Date ? data.updatedAt : (data.updatedAt as any).toDate()
      };
    } catch (error) {
      await logSecurityEvent(userId, 'DASHBOARD_LOAD', 'DASHBOARD_LAYOUT', false, { error });
      throw error;
    }
  }

  /**
   * Get user's dashboard layouts
   */
  static async getUserDashboardLayouts(patientId: string): Promise<DashboardLayout[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('patientId', '==', patientId),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const layouts: DashboardLayout[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as DashboardLayout;
        layouts.push({
          ...data,
          createdAt: data.createdAt instanceof Date ? data.createdAt : (data.createdAt as any).toDate(),
          updatedAt: data.updatedAt instanceof Date ? data.updatedAt : (data.updatedAt as any).toDate()
        });
      });

      return layouts;
    } catch (error) {
      console.error('Error fetching dashboard layouts:', error);
      return [];
    }
  }

  /**
   * Update widget positions in dashboard
   */
  static async updateWidgetPositions(
    layoutId: string, 
    widgets: WidgetConfig[], 
    userId: string
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, layoutId);
      
      await updateDoc(docRef, {
        widgets: sanitizeMedicalData(widgets),
        updatedAt: serverTimestamp()
      });

      await logSecurityEvent(userId, 'WIDGET_UPDATE', 'DASHBOARD_LAYOUT', true, {
        layoutId,
        widgetCount: widgets.length
      });
    } catch (error) {
      await logSecurityEvent(userId, 'WIDGET_UPDATE', 'DASHBOARD_LAYOUT', false, { error });
      throw error;
    }
  }

  /**
   * Delete dashboard layout
   */
  static async deleteDashboardLayout(layoutId: string, userId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, layoutId);
      await deleteDoc(docRef);

      await logSecurityEvent(userId, 'DASHBOARD_DELETE', 'DASHBOARD_LAYOUT', true, {
        layoutId
      });
    } catch (error) {
      await logSecurityEvent(userId, 'DASHBOARD_DELETE', 'DASHBOARD_LAYOUT', false, { error });
      throw error;
    }
  }

  /**
   * Subscribe to dashboard layout changes
   */
  static subscribeToDashboardLayout(
    layoutId: string,
    callback: (layout: DashboardLayout | null) => void,
    errorCallback?: (error: Error) => void
  ): () => void {
    const docRef = doc(db, this.COLLECTION, layoutId);
    
    return onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data() as DashboardLayout;
          callback({
            ...data,
            createdAt: data.createdAt instanceof Date ? data.createdAt : (data.createdAt as any).toDate(),
            updatedAt: data.updatedAt instanceof Date ? data.updatedAt : (data.updatedAt as any).toDate()
          });
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Dashboard subscription error:', error);
        if (errorCallback) errorCallback(error);
      }
    );
  }
}

/**
 * UMID Services
 */
export class UMIDService {
  private static readonly COLLECTION = 'umids';

  /**
   * Create or update UMID
   */
  static async saveUMID(umid: UniversalMedicalID, userId: string): Promise<void> {
    try {
      const sanitizedUMID = sanitizeMedicalData(umid);
      const docRef = doc(db, this.COLLECTION, umid.id);
      
      await setDoc(docRef, {
        ...sanitizedUMID,
        lastAccessDate: serverTimestamp()
      });

      await logSecurityEvent(userId, 'UMID_SAVE', 'UMID', true, {
        umidId: umid.id
      });
    } catch (error) {
      await logSecurityEvent(userId, 'UMID_SAVE', 'UMID', false, { error });
      throw error;
    }
  }

  /**
   * Get UMID by patient ID
   */
  static async getUMIDByPatientId(patientId: string): Promise<UniversalMedicalID | null> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('patientId', '==', patientId),
        where('isActive', '==', true),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data() as UniversalMedicalID;
      
      return {
        ...data,
        issueDate: data.issueDate instanceof Date ? data.issueDate : (data.issueDate as any).toDate(),
        lastAccessDate: data.lastAccessDate ? 
          (data.lastAccessDate instanceof Date ? data.lastAccessDate : (data.lastAccessDate as any).toDate()) : 
          undefined
      };
    } catch (error) {
      console.error('Error fetching UMID:', error);
      return null;
    }
  }

  /**
   * Update UMID access log
   */
  static async logUMIDAccess(
    umidId: string,
    accessLog: UMIDAccessLog,
    userId: string
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, umidId);
      const umidDoc = await getDoc(docRef);
      
      if (!umidDoc.exists()) {
        throw new Error('UMID not found');
      }

      const umidData = umidDoc.data() as UniversalMedicalID;
      const updatedAccessHistory = [...umidData.accessHistory, accessLog];

      await updateDoc(docRef, {
        accessHistory: updatedAccessHistory,
        lastAccessDate: serverTimestamp()
      });

      await logSecurityEvent(userId, 'UMID_ACCESS', 'UMID', true, {
        umidId,
        accessType: accessLog.accessType
      });
    } catch (error) {
      await logSecurityEvent(userId, 'UMID_ACCESS', 'UMID', false, { error });
      throw error;
    }
  }

  /**
   * Update UMID QR code
   */
  static async updateUMIDQRCode(
    umidId: string,
    qrCodeData: string,
    userId: string
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, umidId);
      
      await updateDoc(docRef, {
        qrCodeData,
        lastAccessDate: serverTimestamp()
      });

      await logSecurityEvent(userId, 'UMID_QR_UPDATE', 'UMID', true, {
        umidId
      });
    } catch (error) {
      await logSecurityEvent(userId, 'UMID_QR_UPDATE', 'UMID', false, { error });
      throw error;
    }
  }

  /**
   * Subscribe to UMID changes
   */
  static subscribeToUMID(
    patientId: string,
    callback: (umid: UniversalMedicalID | null) => void,
    errorCallback?: (error: Error) => void
  ): () => void {
    const q = query(
      collection(db, this.COLLECTION),
      where('patientId', '==', patientId),
      where('isActive', '==', true),
      limit(1)
    );
    
    return onSnapshot(
      q,
      (querySnapshot) => {
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const data = doc.data() as UniversalMedicalID;
          callback({
            ...data,
            issueDate: data.issueDate instanceof Date ? data.issueDate : (data.issueDate as any).toDate(),
            lastAccessDate: data.lastAccessDate ? 
              (data.lastAccessDate instanceof Date ? data.lastAccessDate : (data.lastAccessDate as any).toDate()) : 
              undefined
          });
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('UMID subscription error:', error);
        if (errorCallback) errorCallback(error);
      }
    );
  }
}

/**
 * Widget Data Services
 */
export class WidgetDataService {
  private static readonly COLLECTION = 'widget_data';

  /**
   * Save widget-specific data
   */
  static async saveWidgetData(
    patientId: string,
    widgetId: string,
    widgetType: string,
    data: any,
    userId: string
  ): Promise<void> {
    try {
      const sanitizedData = sanitizeMedicalData(data);
      const docRef = doc(db, this.COLLECTION, `${patientId}_${widgetId}`);
      
      await setDoc(docRef, {
        patientId,
        widgetId,
        widgetType,
        data: sanitizedData,
        lastUpdated: serverTimestamp()
      });

      await logSecurityEvent(userId, 'WIDGET_DATA_SAVE', 'WIDGET_DATA', true, {
        widgetId,
        widgetType
      });
    } catch (error) {
      await logSecurityEvent(userId, 'WIDGET_DATA_SAVE', 'WIDGET_DATA', false, { error });
      throw error;
    }
  }

  /**
   * Get widget data
   */
  static async getWidgetData(
    patientId: string,
    widgetId: string
  ): Promise<WidgetData | null> {
    try {
      const docRef = doc(db, this.COLLECTION, `${patientId}_${widgetId}`);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return docSnap.data() as WidgetData;
    } catch (error) {
      console.error('Error fetching widget data:', error);
      return null;
    }
  }

  /**
   * Subscribe to widget data changes
   */
  static subscribeToWidgetData(
    patientId: string,
    widgetId: string,
    callback: (data: WidgetData | null) => void,
    errorCallback?: (error: Error) => void
  ): () => void {
    const docRef = doc(db, this.COLLECTION, `${patientId}_${widgetId}`);
    
    return onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          callback(doc.data() as WidgetData);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Widget data subscription error:', error);
        if (errorCallback) errorCallback(error);
      }
    );
  }

  /**
   * Delete widget data
   */
  static async deleteWidgetData(
    patientId: string,
    widgetId: string,
    userId: string
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, `${patientId}_${widgetId}`);
      await deleteDoc(docRef);

      await logSecurityEvent(userId, 'WIDGET_DATA_DELETE', 'WIDGET_DATA', true, {
        widgetId
      });
    } catch (error) {
      await logSecurityEvent(userId, 'WIDGET_DATA_DELETE', 'WIDGET_DATA', false, { error });
      throw error;
    }
  }
}
