export function sanitizeErrorMessage(error: any): string {
  // If error is a string, check for common patterns
  const errorMessage = typeof error === 'string' ? error : error?.message || error?.toString() || 'An unexpected error occurred';
  
  // Firebase Auth error codes and their user-friendly messages
  const firebaseErrorMap: Record<string, string> = {
    'auth/user-not-found': 'Invalid email or password',
    'auth/wrong-password': 'Invalid email or password',
    'auth/invalid-email': 'Please enter a valid email address',
    'auth/email-already-in-use': 'An account with this email already exists',
    'auth/weak-password': 'Password must be at least 6 characters long',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later',
    'auth/network-request-failed': 'Network error. Please check your connection',
    'auth/invalid-credential': 'Invalid email or password',
    'auth/user-disabled': 'This account has been disabled',
    'auth/requires-recent-login': 'Please log in again to continue',
    'auth/email-already-verified': 'Email is already verified',
    'auth/invalid-action-code': 'The verification link is invalid or has expired',
    'auth/expired-action-code': 'The verification link has expired',
  };

  // Check for Firebase error codes
  for (const [code, message] of Object.entries(firebaseErrorMap)) {
    if (errorMessage.includes(code)) {
      return message;
    }
  }

  // Check for common error patterns
  if (errorMessage.toLowerCase().includes('password') && errorMessage.toLowerCase().includes('wrong')) {
    return 'Invalid email or password';
  }
  
  if (errorMessage.toLowerCase().includes('user not found')) {
    return 'Invalid email or password';
  }
  
  if (errorMessage.toLowerCase().includes('network')) {
    return 'Network error. Please check your connection';
  }
  
  if (errorMessage.toLowerCase().includes('timeout')) {
    return 'Request timed out. Please try again';
  }

  // Generic fallback for any other errors
  return 'Something went wrong. Please try again';
}

export function sanitizeToastError(error: any): string {
  return sanitizeErrorMessage(error);
}
