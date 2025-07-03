/**
 * UMID (Universal Medical ID) utilities
 * Handles QR code generation, TOTP authentication, and medical ID management
 */

import QRCode from 'qrcode';
import * as OTPAuth from 'otpauth';
import { generateSecureId, encryptData, decryptData, QR_REFRESH_INTERVAL, TOTP_REFRESH_INTERVAL } from './security';
import type { UniversalMedicalID, TOTPSettings, UMIDSecuritySettings } from '@/app/types';

/**
 * Generate TOTP secret for a user
 */
export const generateTOTPSecret = (userId: string, userEmail: string): string => {
  const totp = new OTPAuth.TOTP({
    issuer: 'HealthSphere',
    label: userEmail,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(generateSecureId().replace(/-/g, '').substring(0, 32).toUpperCase())
  });
  
  return totp.secret.base32;
};

/**
 * Generate current TOTP code
 */
export const generateTOTPCode = (secret: string): string => {
  try {
    const totp = new OTPAuth.TOTP({
      secret: OTPAuth.Secret.fromBase32(secret),
      algorithm: 'SHA1',
      digits: 6,
      period: 30
    });
    
    return totp.generate();
  } catch (error) {
    console.error('TOTP generation failed:', error);
    return '000000';
  }
};

/**
 * Verify TOTP code
 */
export const verifyTOTPCode = (secret: string, code: string): boolean => {
  try {
    const totp = new OTPAuth.TOTP({
      secret: OTPAuth.Secret.fromBase32(secret),
      algorithm: 'SHA1',
      digits: 6,
      period: 30
    });
    
    const delta = totp.validate({ token: code, timestamp: Date.now() });
    return delta !== null;
  } catch (error) {
    console.error('TOTP verification failed:', error);
    return false;
  }
};

/**
 * Generate QR code data for UMID
 */
export const generateUMIDQRData = async (umid: UniversalMedicalID): Promise<string> => {
  const qrData = {
    type: 'HEALTHSPHERE_UMID',
    version: '1.0',
    umidId: umid.id,
    patientId: umid.patientId,
    timestamp: Date.now(),
    expiresAt: Date.now() + QR_REFRESH_INTERVAL,
    checksum: generateSecureId()
  };
  
  // Encrypt the QR data for security
  const encryptedData = encryptData(JSON.stringify(qrData));
  
  try {
    return await QRCode.toDataURL(encryptedData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 1,
      color: {
        dark: '#DC2626', // Red-600 for healthcare theme
        light: '#FFFFFF'
      },
      width: 256
    });
  } catch (error) {
    console.error('QR code generation failed:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Validate QR code data
 */
export const validateUMIDQRData = (encryptedData: string): any | null => {
  try {
    const decryptedData = decryptData(encryptedData);
    const qrData = JSON.parse(decryptedData);
    
    // Check if QR code is expired
    if (Date.now() > qrData.expiresAt) {
      return null;
    }
    
    // Validate format
    if (qrData.type !== 'HEALTHSPHERE_UMID' || !qrData.umidId || !qrData.patientId) {
      return null;
    }
    
    return qrData;
  } catch (error) {
    console.error('QR validation failed:', error);
    return null;
  }
};

/**
 * Check if QR code needs refresh
 */
export const shouldRefreshQR = (lastGenerated: Date): boolean => {
  return Date.now() - lastGenerated.getTime() > QR_REFRESH_INTERVAL;
};

/**
 * Check if TOTP needs refresh
 */
export const shouldRefreshTOTP = (lastGenerated: Date): boolean => {
  return Date.now() - lastGenerated.getTime() > TOTP_REFRESH_INTERVAL;
};

/**
 * Create initial UMID for a patient
 */
export const createInitialUMID = (patientId: string, patientEmail: string, patientName: string): Partial<UniversalMedicalID> => {
  const secret = generateTOTPSecret(patientId, patientEmail);
  const umidNumber = `UMID-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  
  return {
    id: generateSecureId(),
    patientId,
    umidNumber,
    qrCodeData: '', // Will be generated when needed
    secretKey: encryptData(secret),
    isActive: true,
    issueDate: new Date(),
    lastAccessDate: undefined,
    accessHistory: [],
    totpSettings: {
      digits: 6,
      period: 30,
      algorithm: 'SHA1',
      issuer: 'HealthSphere',
      label: patientEmail
    },
    securitySettings: {
      maxFailedAttempts: 3,
      lockoutDuration: 15, // minutes
      requireBiometric: false,
      allowOfflineAccess: false,
      encryptionLevel: 'high' as const,
      accessControlLevel: 'enhanced' as const
    },
    linkedMedicalData: {
      basicInfo: {
        name: patientName,
        dateOfBirth: new Date(), // Should be filled from user data
        emergencyContact: {
          name: '',
          relationship: '',
          phone: '',
          email: ''
        }
      },
      criticalAllergies: [],
      chronicConditions: [],
      currentMedications: [],
      emergencyMedicalInfo: [],
      medicalAlerts: []
    }
  };
};

/**
 * Generate emergency backup codes
 */
export const generateBackupCodes = (count: number = 10): string[] => {
  const codes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  
  return codes;
};

/**
 * Blur/unblur UMID data based on user presence
 */
export const createUMIDVisibilityManager = () => {
  let isUserPresent = true;
  let visibilityTimeout: NodeJS.Timeout | null = null;
  
  const checkUserPresence = () => {
    return document.hasFocus() && document.visibilityState === 'visible';
  };
  
  const updateVisibility = (callback: (isVisible: boolean) => void) => {
    const newPresence = checkUserPresence();
    
    if (newPresence !== isUserPresent) {
      isUserPresent = newPresence;
      
      if (visibilityTimeout) {
        clearTimeout(visibilityTimeout);
      }
      
      if (!isUserPresent) {
        // Delay hiding for smooth UX
        visibilityTimeout = setTimeout(() => {
          callback(false);
        }, 2000);
      } else {
        callback(true);
      }
    }
  };
  
  return {
    startMonitoring: (callback: (isVisible: boolean) => void) => {
      const handleVisibilityChange = () => updateVisibility(callback);
      const handleFocus = () => updateVisibility(callback);
      const handleBlur = () => updateVisibility(callback);
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleFocus);
      window.addEventListener('blur', handleBlur);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('blur', handleBlur);
        if (visibilityTimeout) {
          clearTimeout(visibilityTimeout);
        }
      };
    },
    isUserPresent: () => isUserPresent
  };
};
