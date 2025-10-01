/**
 * Animations Module
 * Handles subtle entrance animations and scroll-based effects
 * Respects prefers-reduced-motion
 */

/**
 * Check if user prefers reduced motion
 * @returns {boolean} True if user prefers reduced motion
 */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Add fade-in animation to element when it enters viewport
 * @param {HTMLElement} element - Element to animate
 * @param {number} delay - Delay in milliseconds (default: 0)
 */
function addFadeInAnimation(element, delay = 0) {
  if (prefersReducedMotion()) {
    element.style.opacity = '1';
    return;
  }
  
  element.style.opacity = '0';
  element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
  element.style.transform = 'translateY(10px)';
  
  setTimeout(() => {
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
  }, delay);
}

/**
 * Intersection Observer callback for animating elements on scroll
 * @param {IntersectionObserverEntry[]} entries - Observer entries
 */
function handleIntersection(entries) {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      const delay = index * 100; // Stagger animations
      addFadeInAnimation(entry.target, delay);
      
      // Unobserve after animation
      observer.unobserve(entry.target);
    }
  });
}

// Create intersection observer
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px',
};

let observer;

/**
 * Initialize animations
 */
function initAnimations() {
  // Don't animate if user prefers reduced motion
  if (prefersReducedMotion()) {
    return;
  }
  
  // Create observer
  observer = new IntersectionObserver(handleIntersection, observerOptions);
  
  // Observe publication cards
  const publicationCards = document.querySelectorAll('.publication-card');
  publicationCards.forEach(card => {
    observer.observe(card);
  });
  
  // Observe other content sections
  const newsItems = document.querySelectorAll('.news-item');
  newsItems.forEach(item => {
    observer.observe(item);
  });
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (event) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      
      const target = document.querySelector(targetId);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        
        // Update focus for accessibility
        target.setAttribute('tabindex', '-1');
        target.focus();
      }
    });
  });
}

/**
 * Re-observe new elements (e.g., after publications load)
 */
function observeNewElements() {
  if (prefersReducedMotion() || !observer) {
    return;
  }
  
  const publicationCards = document.querySelectorAll('.publication-card');
  publicationCards.forEach(card => {
    observer.observe(card);
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnimations);
} else {
  initAnimations();
}

// Listen for publications load event to observe new cards
window.addEventListener('publicationsLoaded', observeNewElements);

// Export functions for testing
if (typeof window !== 'undefined') {
  window.animationsModule = {
    prefersReducedMotion,
    addFadeInAnimation,
    observeNewElements,
  };
}
