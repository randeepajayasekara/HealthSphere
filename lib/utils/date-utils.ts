/**
 * HealthSphere - Date Utilities
 * Safe date formatting utilities to prevent "Invalid time value" errors
 */

/**
 * Safely format a date to locale date string
 * @param date - Date object, string, or null/undefined
 * @param fallback - Fallback string if date is invalid (default: 'N/A')
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted date string or fallback
 */
export function safeToLocaleDateString(
  date: Date | string | null | undefined,
  fallback: string = 'N/A',
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    if (!date) return fallback;
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return fallback;
    }
    
    return dateObj.toLocaleDateString(undefined, options);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return fallback;
  }
}

/**
 * Safely format a date to locale time string
 * @param date - Date object, string, or null/undefined
 * @param fallback - Fallback string if date is invalid (default: 'N/A')
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted time string or fallback
 */
export function safeToLocaleTimeString(
  date: Date | string | null | undefined,
  fallback: string = 'N/A',
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    if (!date) return fallback;
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return fallback;
    }
    
    return dateObj.toLocaleTimeString(undefined, options);
  } catch (error) {
    console.warn('Time formatting error:', error);
    return fallback;
  }
}

/**
 * Safely format a date to locale date and time string
 * @param date - Date object, string, or null/undefined
 * @param fallback - Fallback string if date is invalid (default: 'N/A')
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted date-time string or fallback
 */
export function safeToLocaleString(
  date: Date | string | null | undefined,
  fallback: string = 'N/A',
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    if (!date) return fallback;
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return fallback;
    }
    
    return dateObj.toLocaleString(undefined, options);
  } catch (error) {
    console.warn('DateTime formatting error:', error);
    return fallback;
  }
}

/**
 * Safely convert Firestore Timestamp to Date
 * @param timestamp - Firestore Timestamp object or null/undefined
 * @param fallback - Fallback Date if timestamp is invalid (default: null)
 * @returns Date object or fallback
 */
export function safeTimestampToDate(
  timestamp: any,
  fallback: Date | null = null
): Date | null {
  try {
    if (!timestamp) return fallback;
    
    // Handle Firestore Timestamp
    if (timestamp && typeof timestamp.toDate === 'function') {
      const date = timestamp.toDate();
      return isNaN(date.getTime()) ? fallback : date;
    }
    
    // Handle Date object
    if (timestamp instanceof Date) {
      return isNaN(timestamp.getTime()) ? fallback : timestamp;
    }
    
    // Handle string
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? fallback : date;
    }
    
    return fallback;
  } catch (error) {
    console.warn('Timestamp conversion error:', error);
    return fallback;
  }
}

/**
 * Check if a date is valid
 * @param date - Date object, string, or null/undefined
 * @returns boolean indicating if date is valid
 */
export function isValidDate(date: Date | string | null | undefined): boolean {
  try {
    if (!date) return false;
    
    const dateObj = date instanceof Date ? date : new Date(date);
    return !isNaN(dateObj.getTime());
  } catch (error) {
    return false;
  }
}

/**
 * Format date for display with common patterns
 */
export const dateFormatters = {
  shortDate: (date: Date | string | null | undefined) => 
    safeToLocaleDateString(date, 'N/A', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }),
  
  longDate: (date: Date | string | null | undefined) => 
    safeToLocaleDateString(date, 'N/A', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
  
  shortTime: (date: Date | string | null | undefined) => 
    safeToLocaleTimeString(date, 'N/A', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
  
  fullDateTime: (date: Date | string | null | undefined) => 
    safeToLocaleString(date, 'N/A', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
  
  relativeTime: (date: Date | string | null | undefined) => {
    try {
      if (!date) return 'N/A';
      
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) return 'N/A';
      
      const now = new Date();
      const diffMs = now.getTime() - dateObj.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return safeToLocaleDateString(dateObj);
    } catch (error) {
      return 'N/A';
    }
  }
};
