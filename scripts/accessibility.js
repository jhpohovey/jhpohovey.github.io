/**
 * Accessibility Module
 * Provides accessibility enhancements beyond basic HTML/CSS
 */

/**
 * Manage focus for skip links
 */
function initSkipLinks() {
  const skipLinks = document.querySelectorAll('.skip-link');
  
  skipLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      const target = document.querySelector(targetId);
      
      if (target) {
        event.preventDefault();
        
        // Make target focusable if it isn't already
        if (!target.hasAttribute('tabindex')) {
          target.setAttribute('tabindex', '-1');
        }
        
        // Focus the target
        target.focus();
        
        // Scroll to target
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/**
 * Add keyboard navigation for custom components
 */
function initKeyboardNavigation() {
  // Handle escape key to close modals or reset focus
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      // Close any open modals/dropdowns
      const openDropdowns = document.querySelectorAll('[aria-expanded="true"]');
      openDropdowns.forEach(element => {
        element.setAttribute('aria-expanded', 'false');
      });
    }
  });
  
  // Trap focus in modals (if we add modals later)
  // This is a placeholder for future enhancement
}

/**
 * Announce dynamic content changes to screen readers
 * @param {string} message - Message to announce
 * @param {string} priority - 'polite' or 'assertive'
 */
function announceToScreenReader(message, priority = 'polite') {
  const liveRegion = document.querySelector(`[aria-live="${priority}"]`);
  
  if (liveRegion) {
    liveRegion.textContent = message;
    
    // Clear after a delay
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  }
}

/**
 * Add focus indicators for mouse users who click
 * Remove them if they start using keyboard
 */
function manageFocusIndicators() {
  let usingMouse = false;
  
  document.addEventListener('mousedown', () => {
    usingMouse = true;
    document.body.classList.add('using-mouse');
  });
  
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      usingMouse = false;
      document.body.classList.remove('using-mouse');
    }
  });
}

/**
 * Ensure all images have alt text (development check)
 */
function checkImageAltText() {
  if (process.env.NODE_ENV === 'development') {
    const images = document.querySelectorAll('img:not([alt])');
    if (images.length > 0) {
      console.warn(`Found ${images.length} images without alt text:`, images);
    }
  }
}

/**
 * Add ARIA labels to external links
 */
function enhanceExternalLinks() {
  const externalLinks = document.querySelectorAll('a[target="_blank"]');
  
  externalLinks.forEach(link => {
    // Check if link already has screen reader text
    if (!link.querySelector('.sr-only')) {
      const srText = document.createElement('span');
      srText.className = 'sr-only';
      srText.textContent = ' (opens in new tab)';
      link.appendChild(srText);
    }
    
    // Ensure rel="noopener noreferrer" for security
    if (!link.hasAttribute('rel') || !link.getAttribute('rel').includes('noopener')) {
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

/**
 * Make custom elements keyboard accessible
 */
function enhanceCustomElements() {
  // Make div/span "buttons" keyboard accessible
  const pseudoButtons = document.querySelectorAll('[role="button"]:not(button)');
  
  pseudoButtons.forEach(element => {
    // Make focusable
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '0');
    }
    
    // Add keyboard support
    element.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        element.click();
      }
    });
  });
}

/**
 * Monitor for accessibility issues (development mode)
 */
function monitorAccessibility() {
  // Check for missing form labels
  const inputs = document.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    const hasLabel = input.id && document.querySelector(`label[for="${input.id}"]`);
    const hasAriaLabel = input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby');
    
    if (!hasLabel && !hasAriaLabel && process.env.NODE_ENV === 'development') {
      console.warn('Input missing label:', input);
    }
  });
}

/**
 * Initialize all accessibility enhancements
 */
function initAccessibility() {
  initSkipLinks();
  initKeyboardNavigation();
  manageFocusIndicators();
  enhanceExternalLinks();
  enhanceCustomElements();
  
  // Development checks
  if (process.env.NODE_ENV === 'development') {
    checkImageAltText();
    monitorAccessibility();
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAccessibility);
} else {
  initAccessibility();
}

// Export functions for testing and external use
if (typeof window !== 'undefined') {
  window.accessibilityModule = {
    announceToScreenReader,
    enhanceExternalLinks,
    initSkipLinks,
  };
}
