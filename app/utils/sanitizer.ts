/**
 * Security sanitization utilities
 */

// Sanitize user input to prevent XSS attacks
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/['"]/g, '') // Remove quotes to prevent injection
    .substring(0, 100); // Limit length
}

// Sanitize HTML content
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') return '';
  
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');
}

// Validate and sanitize URL
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') return '';
  
  // Allow only http, https, and relative URLs
  const allowedProtocols = /^(https?:\/\/|\/)/;
  
  if (!allowedProtocols.test(url)) {
    return '';
  }
  
  return url.replace(/javascript:/gi, '').replace(/data:/gi, '');
}

// Sanitize file names
export function sanitizeFileName(fileName: string): string {
  if (typeof fileName !== 'string') return '';
  
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 100);
}

// Rate limiting helper
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }
}
