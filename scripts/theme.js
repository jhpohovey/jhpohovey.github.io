/**
 * Theme Toggle Module
 * Handles light/dark mode with system preference detection and localStorage persistence
 * 
 * PRIVACY NOTE: This uses localStorage (NOT cookies) to remember your theme preference.
 * localStorage stays on YOUR device only - it's never sent to any server and can't track you.
 * It's the same as your browser remembering your zoom level or language preference.
 * You can clear it anytime in your browser settings under "Site Data" or "Cookies and Site Data".
 * 
 * What we store: Just one preference - "theme": "light" or "dark" (~11 bytes)
 */

// Theme constants
const THEME_KEY = 'theme';
const THEME_LIGHT = 'light';
const THEME_DARK = 'dark';

// Get DOM elements
const html = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const themeAnnouncement = document.getElementById('theme-announcement');

/**
 * Get the current theme from localStorage or system preference
 * @returns {string} 'light' or 'dark'
 */
function getPreferredTheme() {
  // Check localStorage first
  const storedTheme = localStorage.getItem(THEME_KEY);
  if (storedTheme) {
    return storedTheme;
  }
  
  // Fall back to system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? THEME_DARK : THEME_LIGHT;
}

/**
 * Set the theme on the HTML element
 * @param {string} theme - 'light' or 'dark'
 */
function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  
  // Announce theme change to screen readers
  if (themeAnnouncement) {
    themeAnnouncement.textContent = `Theme changed to ${theme} mode`;
  }
  
  // Update toggle button state
  if (themeToggle) {
    themeToggle.setAttribute('aria-label', `Switch to ${theme === THEME_LIGHT ? 'dark' : 'light'} mode`);
  }
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === THEME_LIGHT ? THEME_DARK : THEME_LIGHT;
  setTheme(newTheme);
}

/**
 * Initialize theme on page load
 */
function initTheme() {
  const preferredTheme = getPreferredTheme();
  setTheme(preferredTheme);
  
  // Add click event listener to toggle button
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
    
    // Also support keyboard activation
    themeToggle.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleTheme();
      }
    });
  }
  
  // Listen for system preference changes
  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  darkModeQuery.addEventListener('change', (event) => {
    // Only auto-switch if user hasn't manually set a preference
    if (!localStorage.getItem(THEME_KEY)) {
      setTheme(event.matches ? THEME_DARK : THEME_LIGHT);
    }
  });
}

// Initialize theme when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTheme);
} else {
  initTheme();
}

// Export functions for testing
if (typeof window !== 'undefined') {
  window.themeModule = {
    getPreferredTheme,
    setTheme,
    toggleTheme,
  };
}
