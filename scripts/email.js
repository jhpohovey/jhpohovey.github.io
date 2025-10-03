/**
 * Email Obfuscation Module
 * Handles XOR + Hex email obfuscation and client-side deobfuscation
 */

/**
 * XOR decrypt hex-encoded string with a key
 * @param {string} hexString - Hex-encoded encrypted string
 * @param {string} key - Decryption key
 * @returns {string} Decrypted string
 */
function xorDecrypt(hexString, key) {
  // Convert hex to bytes
  const bytes = [];
  for (let i = 0; i < hexString.length; i += 2) {
    bytes.push(parseInt(hexString.slice(i, i + 2), 16));
  }
  
  // XOR decrypt
  let decrypted = '';
  for (let i = 0; i < bytes.length; i++) {
    const keyChar = key[i % key.length];
    decrypted += String.fromCharCode(bytes[i] ^ keyChar.charCodeAt(0));
  }
  
  return decrypted;
}

/**
 * Animate unscrambling effect
 * @param {HTMLElement} textElement - Element to animate
 * @param {string} finalText - Final decoded text
 * @param {number} duration - Animation duration in ms
 */
function animateUnscramble(textElement, finalText, duration = 800) {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789@.';
  const steps = 20;
  const stepDuration = duration / steps;
  let currentStep = 0;
  
  const interval = setInterval(() => {
    if (currentStep >= steps) {
      textElement.textContent = finalText;
      clearInterval(interval);
      return;
    }
    
    // Gradually reveal more of the final text
    const revealedLength = Math.floor((currentStep / steps) * finalText.length);
    let scrambled = '';
    
    for (let i = 0; i < finalText.length; i++) {
      if (i < revealedLength) {
        scrambled += finalText[i];
      } else if (finalText[i] === ' ' || finalText[i] === '@' || finalText[i] === '.') {
        scrambled += finalText[i];
      } else {
        scrambled += characters[Math.floor(Math.random() * characters.length)];
      }
    }
    
    textElement.textContent = scrambled;
    currentStep++;
  }, stepDuration);
}

/**
 * Handle email reveal on click
 * @param {Event} event - Click event
 */
function handleEmailClick(event) {
  event.preventDefault();
  
  const element = event.currentTarget;
  const encryptedEmail = element.getAttribute('data-email');
  const key = element.getAttribute('data-key');
  
  if (!encryptedEmail || !key) {
    console.error('Email element missing data attributes');
    return;
  }
  
  // Check if already revealed
  if (element.classList.contains('email-revealed')) {
    return;
  }
  
  // Decrypt XOR + Hex
  const email = xorDecrypt(encryptedEmail, key);
  
  // Get the text element
  const textElement = element.querySelector('.email-text');
  if (!textElement) {
    console.error('Email text element not found');
    return;
  }
  
  // Mark as revealed
  element.classList.add('email-revealed');
  
  // Animate the unscrambling
  animateUnscramble(textElement, email);
  
  // After animation, replace the link with a plain span to make it fully selectable
  setTimeout(() => {
    // Create a new span element to replace the link
    const span = document.createElement('span');
    span.className = element.className;
    span.innerHTML = element.innerHTML;
    span.style.userSelect = 'text';
    span.style.cursor = 'text';
    
    // Replace the link with the span
    element.replaceWith(span);
  }, 850);
}

/**
 * Initialize email obfuscation on page load
 * Attaches click handlers to email links
 */
function initEmailObfuscation() {
  const emailElements = document.querySelectorAll('.email-link[data-email][data-key]');
  
  emailElements.forEach(element => {
    try {
      // Add click handler
      element.addEventListener('click', handleEmailClick);
      
      // Add hover effect to show it's interactive
      element.style.cursor = 'pointer';
      
      // Prevent text selection and dragging until revealed
      element.style.userSelect = 'none';
      element.setAttribute('draggable', 'false');
    } catch (error) {
      console.error('Error setting up email obfuscation:', error);
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
    xorDecrypt,
    handleEmailClick,
    animateUnscramble,
  };
  
  // Make xorDecrypt available globally for tests
  window.xorDecrypt = xorDecrypt;
}
