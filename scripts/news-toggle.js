/**
 * News Toggle Module
 * Handles expanding/collapsing news items
 */

function initNewsToggle() {
  const toggleBtn = document.querySelector('.news-toggle-btn');
  const newsSection = document.querySelector('.news-section');
  const toggleText = toggleBtn?.querySelector('.news-toggle-text');
  
  if (!toggleBtn || !newsSection) {
    return;
  }
  
  toggleBtn.addEventListener('click', () => {
    const isExpanded = newsSection.classList.contains('expanded');
    
    if (isExpanded) {
      // Collapse
      newsSection.classList.remove('expanded');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleText.textContent = 'Show more news';
      
      // Scroll back to news section heading smoothly
      const newsHeading = document.getElementById('news-heading');
      if (newsHeading) {
        newsHeading.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } else {
      // Expand
      newsSection.classList.add('expanded');
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleText.textContent = 'Show less news';
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNewsToggle);
} else {
  initNewsToggle();
}

// Export for testing
if (typeof window !== 'undefined') {
  window.newsToggle = {
    initNewsToggle,
  };
}
