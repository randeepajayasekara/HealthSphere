/**
 * Security utilities for HealthSphere
 * Handles input sanitization, encryption, and security protocols
 */

import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

// Security constants
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'healthsphere-default-key-2025';
const QR_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const TOTP_REFRESH_INTERVAL = 30 * 1000; // 30 seconds

/**
 * Sanitize input to prevent XSS and injection attacks
 */
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/[<>\"']/g, '') // Remove potentially dangerous characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 1000); // Limit length
};

/**
 * Sanitize medical data with special healthcare considerations
 */
export const sanitizeMedicalData = (data: any): any => {
  if (typeof data === 'string') {
    return sanitizeInput(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeMedicalData);
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    Object.keys(data).forEach(key => {
      const sanitizedKey = sanitizeInput(key);
      sanitized[sanitizedKey] = sanitizeMedicalData(data[key]);
    });
    return sanitized;
  }
  
  return data;
};

/**
 * Encrypt sensitive data
 */
export const encryptData = (data: string): string => {
  try {
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Encryption failed:', error);
    return data;
  }
};

/**
 * Decrypt sensitive data
 */
export const decryptData = (encryptedData: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error);
    return encryptedData;
  }
};

/**
 * Generate secure random string for IDs
 */
export const generateSecureId = (): string => {
  return uuidv4();
};

/**
 * Generate UMID (Universal Medical ID)
 */
export const generateUMID = (userId: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const hash = CryptoJS.SHA256(`${userId}-${timestamp}-${random}`).toString();
  return `UMID-${hash.substring(0, 12).toUpperCase()}`;
};

/**
 * Validate UMID format
 */
export const validateUMID = (umid: string): boolean => {
  const umidPattern = /^UMID-[A-F0-9]{12}$/;
  return umidPattern.test(umid);
};

/**
 * Check if data should be refreshed based on timestamp
 */
export const shouldRefresh = (lastGenerated: Date, interval: number): boolean => {
  return Date.now() - lastGenerated.getTime() > interval;
};

/**
 * Generate secure session token
 */
export const generateSessionToken = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return CryptoJS.SHA256(`${timestamp}-${random}`).toString();
};

/**
 * Validate user permissions for medical data access
 */
export const validateMedicalDataAccess = (
  userRole: string,
  requestedData: string,
  patientId: string,
  requestingUserId: string
): boolean => {
  // Patient can access their own data
  if (userRole === 'patient' && patientId === requestingUserId) {
    return true;
  }
  
  // Healthcare providers can access patient data
  const allowedRoles = ['doctor', 'nurse', 'admin', 'lab_technician'];
  if (allowedRoles.includes(userRole)) {
    return true;
  }
  
  // Receptionist has limited access
  if (userRole === 'receptionist') {
    const allowedData = ['appointments', 'contact_info', 'basic_info'];
    return allowedData.includes(requestedData);
  }
  
  return false;
};

/**
 * Log security events for audit trail
 */
export const logSecurityEvent = async (
  userId: string,
  action: string,
  resource: string,
  success: boolean,
  details?: any
) => {
  const securityLog = {
    userId,
    action,
    resource,
    timestamp: new Date(),
    success,
    details: sanitizeMedicalData(details),
    sessionId: generateSessionToken(),
    ipAddress: 'client-side', // In production, get from server
    userAgent: navigator.userAgent
  };
  
  // In production, send to secure logging service
  console.log('Security Event:', securityLog);
};

export { QR_REFRESH_INTERVAL, TOTP_REFRESH_INTERVAL };
