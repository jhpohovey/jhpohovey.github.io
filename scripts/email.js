/**
 * Email Obfuscation Module
 * Handles ROT13 email obfuscation and client-side deobfuscation
 */

/**
 * ROT13 cipher - rotates each letter by 13 positions
 * @param {string} str - String to encode/decode
 * @returns {string} ROT13 encoded/decoded string
 */
function rot13(str) {
  return str.replace(/[a-zA-Z]/g, (char) => {
    const start = char <= 'Z' ? 65 : 97;
    return String.fromCharCode(start + (char.charCodeAt(0) - start + 13) % 26);
  });
}

/**
 * Deobfuscate and render email link
 * @param {HTMLElement} element - Element with data-user and data-domain attributes
 */
function deobfuscateEmail(element) {
  const obfuscatedUser = element.getAttribute('data-user');
  const obfuscatedDomain = element.getAttribute('data-domain');
  
  if (!obfuscatedUser || !obfuscatedDomain) {
    console.error('Email element missing data attributes');
    return;
  }
  
  // Decode ROT13
  const user = rot13(obfuscatedUser);
  const domain = rot13(obfuscatedDomain);
  const email = `${user}@${domain}`;
  
  // Create mailto link
  const link = document.createElement('a');
  link.href = `mailto:${email}`;
  link.textContent = email;
  link.className = 'profile-link';
  
  // Add icon if there's a nested email-text span
  const emailText = element.querySelector('.email-text');
  if (emailText) {
    // Keep the icon, replace the text
    emailText.textContent = email;
    
    // Convert the span to an anchor
    const icon = element.querySelector('.profile-link-icon');
    link.innerHTML = '';
    if (icon) {
      link.appendChild(icon.cloneNode(true));
    }
    link.appendChild(document.createTextNode(' ' + email));
    
    // Replace the entire element
    element.replaceWith(link);
  } else {
    // Simple text replacement
    element.replaceWith(link);
  }
}

/**
 * Initialize email obfuscation on page load
 * Finds all elements with .email-link class and deobfuscates them
 */
function initEmailObfuscation() {
  const emailElements = document.querySelectorAll('.email-link[data-user][data-domain]');
  
  emailElements.forEach(element => {
    try {
      deobfuscateEmail(element);
    } catch (error) {
      console.error('Error deobfuscating email:', error);
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEmailObfuscation);
} else {
  initEmailObfuscation();
}

// Export functions for testing
if (typeof window !== 'undefined') {
  window.emailModule = {
    rot13,
    deobfuscateEmail,
  };
  
  // Make rot13 available globally for tests
  window.rot13 = rot13;
}
