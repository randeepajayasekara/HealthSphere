// Client-side security measures for HealthSphere homepage
// This script implements various anti-vandalism and security measures

export const initSecurityMeasures = () => {
  // Disable right-click context menu
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });

  // Disable F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S
  document.addEventListener('keydown', (e) => {
    // Disable F12
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }
    
    // Disable Ctrl+Shift+I (Developer Tools)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      return false;
    }
    
    // Disable Ctrl+U (View Source)
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      return false;
    }
    
    // Disable Ctrl+S (Save Page)
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      return false;
    }
    
    // Disable Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
      e.preventDefault();
      return false;
    }
    
    // Disable Ctrl+Shift+C (Element Inspector)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      return false;
    }
  });

  // Disable text selection on sensitive elements
  const disableSelection = (selector: string) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      element.addEventListener('selectstart', (e) => {
        e.preventDefault();
        return false;
      });
    });
  };

  // Apply to headers, badges, and other sensitive content
  disableSelection('h1, h2, h3, .badge, .stats');

  // Disable image dragging
  document.addEventListener('dragstart', (e) => {
    if (e.target instanceof HTMLImageElement) {
      e.preventDefault();
      return false;
    }
  });

  // Clear console periodically
  const clearConsole = () => {
    if (typeof console !== 'undefined' && console.clear) {
      console.clear();
    }
  };

  // Clear console every 5 seconds
  setInterval(clearConsole, 5000);

  // Detect developer tools (basic detection)
  let devtools = false;
  const detector = setInterval(() => {
    if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
      if (!devtools) {
        devtools = true;
        console.log('Developer tools detected');
        // You can add additional security measures here
      }
    } else {
      devtools = false;
    }
  }, 500);

  // Disable printing
  window.addEventListener('beforeprint', (e) => {
    e.preventDefault();
    return false;
  });

  // Obfuscate sensitive content
  const obfuscateContent = () => {
    const sensitiveElements = document.querySelectorAll('[data-sensitive]');
    sensitiveElements.forEach((element) => {
      const text = element.textContent;
      if (text && element instanceof HTMLElement) {
        // Simple obfuscation - can be enhanced
        element.textContent = text.split('').reverse().join('');
        element.style.direction = 'rtl';
        element.style.textAlign = 'left';
      }
    });
  };

  // Apply obfuscation after component mount
  setTimeout(obfuscateContent, 1000);

  // Protect against basic automation
  document.addEventListener('mousedown', (e) => {
    // Detect rapid clicking patterns
    const now = Date.now();
    const lastClick = parseInt(localStorage.getItem('lastClick') || '0');
    
    if (now - lastClick < 100) {
      e.preventDefault();
      return false;
    }
    
    localStorage.setItem('lastClick', now.toString());
  });

  

  // Cleanup function
  return () => {
    clearInterval(detector);
    document.removeEventListener('contextmenu', () => {});
    document.removeEventListener('keydown', () => {});
    document.removeEventListener('dragstart', () => {});
    document.removeEventListener('mousedown', () => {});
    window.removeEventListener('beforeprint', () => {});
  };
};

// Additional utility functions for security
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>\"']/g, '') // Remove potentially dangerous characters
    .trim()
    .slice(0, 1000); // Limit length
};

export const validateRedirect = (url: string): boolean => {
  // Only allow relative URLs or same-origin URLs
  try {
    const urlObj = new URL(url, window.location.origin);
    return urlObj.origin === window.location.origin;
  } catch {
    return false;
  }
};

export const logSecurityEvent = (event: string, details?: any) => {
  // Log security events (in production, send to monitoring service)
  console.log(`Security Event: ${event}`, details);
  
  // In production, you might want to send this to your backend
  // fetch('/api/security-log', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ event, details, timestamp: new Date().toISOString() })
  // });
};
