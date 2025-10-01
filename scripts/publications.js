/**
 * Publications Module
 * Handles fetching, rendering, sorting, and filtering of publications
 * 
 * PRIVACY NOTE: This uses localStorage (NOT cookies) to remember your view preference.
 * localStorage stays on YOUR device only - it's never sent to any server and can't track you.
 * You can clear it anytime in your browser settings under "Site Data" or "Cookies and Site Data".
 * 
 * What we store: Just one preference - "publications-view": "list" or "grid" (~24 bytes)
 */

// Configuration
const ENABLE_VIEW_TRANSITION_ANIMATION = true; // Set to false for instant switching

// Global state
let allPublications = [];
let currentSort = 'year-desc';
let currentFilters = {
  type: 'all',
  author: 'all',
  year: 'all'
};

/**
 * Fetch publications from JSON file
 * @returns {Promise<Array>} Array of publication objects
 */
async function fetchPublications() {
  try {
    const response = await fetch('/data/publications.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // The JSON has a "publications" array wrapper
    return data.publications || data;
  } catch (error) {
    console.error('Error fetching publications:', error);
    return [];
  }
}

/**
 * Render a single author
 * @param {Object} author - Author object with name, website, isPrimaryUser
 * @returns {string} HTML string
 */
function renderAuthor(author) {
  const className = author.isPrimaryUser ? 'author-primary' : '';
  
  if (author.website) {
    return `<a href="${author.website}" target="_blank" rel="noopener noreferrer" class="${className}">${author.name}</a>`;
  }
  
  return `<span class="${className}">${author.name}</span>`;
}

/**
 * Render authors list
 * @param {Array} authors - Array of author objects
 * @returns {string} HTML string
 */
function renderAuthors(authors) {
  return authors.map(renderAuthor).join(', ');
}

/**
 * Render publication links
 * @param {Object} links - Links object with preprint, publication, code, project, etc.
 * @returns {string} HTML string
 */
function renderLinks(links) {
  const linkButtons = [];
  
  if (links.publication) {
    linkButtons.push(`
      <a href="${links.publication}" class="publication-link" target="_blank" rel="noopener noreferrer">
        📄 Paper
      </a>
    `);
  } else if (links.preprint) {
    linkButtons.push(`
      <a href="${links.preprint}" class="publication-link" target="_blank" rel="noopener noreferrer">
        📄 Preprint
      </a>
    `);
  }
  
  if (links.code) {
    linkButtons.push(`
      <a href="${links.code}" class="publication-link" target="_blank" rel="noopener noreferrer">
        💻 Code
      </a>
    `);
  }
  
  if (links.codeROS) {
    linkButtons.push(`
      <a href="${links.codeROS}" class="publication-link" target="_blank" rel="noopener noreferrer">
        🤖 ROS Package
      </a>
    `);
  }
  
  if (links.video) {
    linkButtons.push(`
      <a href="${links.video}" class="publication-link" target="_blank" rel="noopener noreferrer">
        🎥 Video
      </a>
    `);
  }
  
  if (links.project) {
    linkButtons.push(`
      <a href="${links.project}" class="publication-link" target="_blank" rel="noopener noreferrer">
        🌐 Project Site
      </a>
    `);
  }
  
  if (links.dataset) {
    linkButtons.push(`
      <a href="${links.dataset}" class="publication-link" target="_blank" rel="noopener noreferrer">
        📊 Dataset
      </a>
    `);
  }
  
  if (links.bibtex) {
    linkButtons.push(`
      <a href="${links.bibtex}" class="publication-link" target="_blank" rel="noopener noreferrer">
        📋 BibTeX
      </a>
    `);
  }
  
  return linkButtons.join('\n');
}

/**
 * Render a single publication card
 * @param {Object} pub - Publication object
 * @returns {string} HTML string
 */
function renderPublication(pub) {
  // Handle awards array - show first award if exists
  const awardBadge = pub.awards && pub.awards.length > 0 
    ? `<div class="publication-award">${pub.awards[0]}</div>` 
    : '';
  
  // Handle thumbnail - use thumbnail.static, fallback to placeholder
  const thumbnailStatic = pub.thumbnail?.static || '/assets/images/publication-placeholder.svg';
  const thumbnailAnimated = pub.thumbnail?.animated;
  
  return `
    <article class="publication-card" id="pub-${pub.id}">
      <div class="publication-thumbnail">
        <img src="${thumbnailStatic}" alt="${pub.thumbnail?.alt || 'Publication thumbnail'}" loading="lazy">
        ${thumbnailAnimated ? `<img src="${thumbnailAnimated}" alt="" class="thumbnail-animated" loading="lazy" aria-hidden="true">` : ''}
      </div>
      
      <div class="publication-content">
        <h3 class="publication-title">${pub.title}</h3>
        
        <div class="publication-authors">
          ${renderAuthors(pub.authors)}
        </div>
        
        <div class="publication-venue">
          <strong>${pub.venue.acronym || pub.venue.fullName}</strong>
          <span>${pub.year}</span>
        </div>
        
        ${awardBadge}
        
        <div class="publication-links">
          ${renderLinks(pub.links)}
        </div>
      </div>
    </article>
  `;
}

/**
 * Sort publications
 * @param {Array} publications - Array of publication objects
 * @param {string} sortBy - Sort option ('year-desc', 'year-asc', 'title-asc', 'venue-asc')
 * @returns {Array} Sorted array
 */
function sortPublications(publications, sortBy) {
  const sorted = [...publications];
  
  switch (sortBy) {
    case 'year-desc':
      return sorted.sort((a, b) => b.year - a.year);
    case 'year-asc':
      return sorted.sort((a, b) => a.year - b.year);
    case 'title-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'venue-asc':
      return sorted.sort((a, b) => {
        const aVenue = a.venue.fullName || a.venue.acronym;
        const bVenue = b.venue.fullName || b.venue.acronym;
        return aVenue.localeCompare(bVenue);
      });
    default:
      return sorted;
  }
}

/**
 * Filter publications
 * @param {Array} publications - Array of publication objects
 * @param {Object} filters - Object with filter criteria
 * @returns {Array} Filtered array
 */
function filterPublications(publications, filters) {
  let filtered = [...publications];
  
  // Filter by type
  if (filters.type && filters.type !== 'all') {
    if (filters.type === 'award') {
      filtered = filtered.filter(pub => pub.awards && pub.awards.length > 0);
    } else if (filters.type === 'conference') {
      filtered = filtered.filter(pub => 
        pub.venue.type === 'conference' ||
        pub.venue.fullName.toLowerCase().includes('conference') ||
        (pub.venue.acronym && ['IROS', 'ICRA', 'RSS', 'HRI', 'CVPR'].includes(pub.venue.acronym))
      );
    } else if (filters.type === 'journal') {
      filtered = filtered.filter(pub => 
        pub.venue.type === 'journal' ||
        pub.venue.fullName.toLowerCase().includes('journal')
      );
    } else if (filters.type === 'workshop') {
      filtered = filtered.filter(pub => 
        pub.venue.type === 'workshop' ||
        pub.venue.fullName.toLowerCase().includes('workshop')
      );
    }
  }
  
  // Filter by author (extensible for future use)
  if (filters.author && filters.author !== 'all') {
    filtered = filtered.filter(pub =>
      pub.authors.some(author => author.name === filters.author)
    );
  }
  
  // Filter by year (extensible for future use)
  if (filters.year && filters.year !== 'all') {
    filtered = filtered.filter(pub => pub.year === parseInt(filters.year));
  }
  
  return filtered;
}

/**
 * Update publication count display
 * @param {number} count - Number of publications
 */
function updateCount(count) {
  const countElement = document.getElementById('publication-count');
  if (countElement) {
    countElement.textContent = count;
  }
  
  // Update stats if on publications page
  const statTotal = document.getElementById('stat-total');
  if (statTotal) {
    statTotal.textContent = count;
  }
}

/**
 * Render publications to container
 * @param {Array} publications - Array of publication objects
 * @param {string} containerId - ID of container element
 */
function renderPublications(publications, containerId = 'publications-container') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (publications.length === 0) {
    container.innerHTML = '<div class="no-results">No publications found</div>';
    updateCount(0);
    return;
  }
  
  const html = publications.map(renderPublication).join('\n');
  container.innerHTML = html;
  updateCount(publications.length);
  
  // Announce to screen readers
  const announcement = document.getElementById('filter-announcement');
  if (announcement) {
    announcement.textContent = `Showing ${publications.length} publications`;
  }
}

/**
 * Update publications display based on current sort and filter
 */
function updatePublications() {
  let publications = [...allPublications];
  publications = filterPublications(publications, currentFilters);
  publications = sortPublications(publications, currentSort);
  renderPublications(publications);
}

/**
 * Initialize publications on page load
 */
async function initPublications() {
  // Fetch publications
  allPublications = await fetchPublications();
  
  if (allPublications.length === 0) {
    console.error('No publications loaded');
    const container = document.getElementById('publications-container') || 
                     document.getElementById('featured-publications');
    if (container) {
      container.innerHTML = '<div class="no-results">Failed to load publications</div>';
    }
    return;
  }
  
  // Check if we're on the publications page (has filters) or home page (featured only)
  const sortSelect = document.getElementById('sort-select');
  const filterSelect = document.getElementById('filter-select');
  
  if (sortSelect && filterSelect) {
    // Publications page - full functionality
    
    // Sort handler
    sortSelect.addEventListener('change', (event) => {
      currentSort = event.target.value;
      updatePublications();
    });
    
    // Filter handler
    filterSelect.addEventListener('change', (event) => {
      currentFilters.type = event.target.value;
      updatePublications();
    });
    
    // View toggle handlers
    const viewListBtn = document.getElementById('view-list');
    const viewGridBtn = document.getElementById('view-grid');
    const publicationsGrid = document.getElementById('publications-container');
    
    if (viewListBtn && viewGridBtn && publicationsGrid) {
      // Set initial view (list view by default)
      const savedView = localStorage.getItem('publications-view') || 'list';
      setView(savedView);
      
      viewListBtn.addEventListener('click', () => {
        setView('list');
      });
      
      viewGridBtn.addEventListener('click', () => {
        setView('grid');
      });
      
      function setView(view) {
        // Apply the view change
        if (view === 'grid') {
          publicationsGrid.classList.add('view-grid');
          viewGridBtn.classList.add('active');
          viewListBtn.classList.remove('active');
          viewGridBtn.setAttribute('aria-pressed', 'true');
          viewListBtn.setAttribute('aria-pressed', 'false');
        } else {
          publicationsGrid.classList.remove('view-grid');
          viewListBtn.classList.add('active');
          viewGridBtn.classList.remove('active');
          viewListBtn.setAttribute('aria-pressed', 'true');
          viewGridBtn.setAttribute('aria-pressed', 'false');
        }
        
        // Animate transition if enabled
        if (ENABLE_VIEW_TRANSITION_ANIMATION) {
          // Get visible cards for animation (limit to first 12 for performance)
          const cards = Array.from(publicationsGrid.querySelectorAll('.publication-card')).slice(0, 12);
          
          // FLIP: First - Record initial positions and sizes (already captured before view change)
          // We need to capture BEFORE the view change, so let's restructure
          
          // Actually, we need to move the class toggle. Let me refactor:
          // Remove the view we just applied temporarily
          const isGrid = view === 'grid';
          if (isGrid) {
            publicationsGrid.classList.remove('view-grid');
          } else {
            publicationsGrid.classList.add('view-grid');
          }
          
          // FLIP: First - Record initial positions and sizes
          const firstPositions = cards.map(card => {
            const rect = card.getBoundingClientRect();
            return {
              element: card,
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height
            };
          });
          
          // Now apply the actual view change
          if (isGrid) {
            publicationsGrid.classList.add('view-grid');
          } else {
            publicationsGrid.classList.remove('view-grid');
          }
          
          // FLIP: Last - Record final positions and sizes
          const lastPositions = cards.map((card, index) => {
            const rect = card.getBoundingClientRect();
            return {
              element: card,
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
              first: firstPositions[index]
            };
          });
          
          // FLIP: Invert - Calculate deltas and apply initial transform
          lastPositions.forEach(({ element, left, top, width, height, first }) => {
            const deltaX = first.left - left;
            const deltaY = first.top - top;
            const scaleX = first.width / width;
            const scaleY = first.height / height;
            
            // Apply the inverted transform immediately (no transition)
            element.style.transition = 'none';
            element.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`;
            element.style.transformOrigin = 'top left';
            element.style.position = 'relative';
            element.style.zIndex = '10';
          });
          
          // Force a reflow to ensure the transform is applied
          publicationsGrid.offsetHeight;
          
          // FLIP: Play - Animate to natural position
          requestAnimationFrame(() => {
            lastPositions.forEach(({ element }) => {
              element.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)';
              element.style.transform = 'translate(0, 0) scale(1, 1)';
            });
            
            // Clean up after animation completes
            setTimeout(() => {
              cards.forEach(card => {
                card.style.transition = '';
                card.style.transform = '';
                card.style.transformOrigin = '';
                card.style.position = '';
                card.style.zIndex = '';
              });
            }, 420);
          });
        }
        
        // Save preference
        localStorage.setItem('publications-view', view);
        
        // Announce to screen readers
        const announcement = document.getElementById('filter-announcement');
        if (announcement) {
          announcement.textContent = `Switched to ${view} view`;
        }
      }
    }
    
    // Future: Add more filter event listeners here
    // Example for author filter:
    // const authorSelect = document.getElementById('author-select');
    // if (authorSelect) {
    //   authorSelect.addEventListener('change', (event) => {
    //     currentFilters.author = event.target.value;
    //     updatePublications();
    //   });
    // }
    
    updatePublications();
  } else {
    // Home page - show featured publications
    // Filter publications with featured: true, otherwise fallback to newest 3
    let featured = allPublications.filter(pub => pub.featured === true);
    
    if (featured.length === 0) {
      // Fallback: show newest 3 publications if no featured flag set
      featured = sortPublications(allPublications, 'year-desc').slice(0, 3);
    } else {
      // Sort featured publications by year (newest first)
      featured = sortPublications(featured, 'year-desc');
    }
    
    renderPublications(featured, 'featured-publications');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPublications);
} else {
  initPublications();
}

// Export functions for testing
if (typeof window !== 'undefined') {
  window.publicationsModule = {
    fetchPublications,
    sortPublications,
    filterPublications,
    renderPublication,
  };
}
