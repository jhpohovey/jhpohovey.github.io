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
  // Sanitize hex string: remove non-hex chars and normalize
  let hex = String(hexString).replace(/[^0-9a-fA-F]/g, '');
  // If odd length, pad with a leading zero
  if (hex.length % 2 === 1) {
    hex = '0' + hex;
  }

  // Convert hex to bytes
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.slice(i, i + 2), 16);
    bytes.push(Number.isNaN(byte) ? 0 : byte);
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
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789@._-+'; // include common email chars

  // Use requestAnimationFrame for smoother timing and reliability
  // Return a promise that resolves when the animation completes
  return new Promise((resolve) => {
    const start = performance.now();
    let rafId = null;

    function step(now) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);

      const revealedLength = Math.floor(t * finalText.length);

      // Build scrambled string based on revealedLength
      let scrambled = '';
      for (let i = 0; i < finalText.length; i++) {
        const ch = finalText[i];
        if (i < revealedLength) {
          scrambled += ch;
        } else if (ch === ' ' || ch === '@' || ch === '.' || ch === '-' || ch === '_') {
          // Keep some characters visible during animation
          scrambled += ch;
        } else {
          scrambled += characters[Math.floor(Math.random() * characters.length)];
        }
      }

      textElement.textContent = scrambled;

      if (t < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        // Ensure final text is shown
        textElement.textContent = finalText;
        if (rafId) cancelAnimationFrame(rafId);
        resolve();
      }
    }

    rafId = requestAnimationFrame(step);
  });
}

/**
 * Handle email reveal on click
 * @param {Event} event - Click event
 */
async function handleEmailClick(event) {
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
  
  // Animate the unscrambling and then replace the link with a plain span to make it fully selectable
  const animDuration = 800;
  try {
    await animateUnscramble(textElement, email, animDuration);
  } catch (e) {
    // If animation fails for any reason, fall back to immediately showing the email
    console.error('animateUnscramble failed', e);
    textElement.textContent = email;
  }

  // Replace the link with a span containing the final email text
  const span = document.createElement('span');
  // Keep the same classes so styling remains consistent
  span.className = element.className;
  // Put the final decoded email as plain text
  span.textContent = email;
  span.style.userSelect = 'text';
  span.style.cursor = 'text';

  // Replace the link with the span
  element.replaceWith(span);
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
