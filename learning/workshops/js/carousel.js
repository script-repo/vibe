// ========================================
// Course Carousel Module
// Handles slot machine-style course selection
// ========================================

let allCourses = [];
let currentCourseIndex = 0;
let carouselInitialized = false;
let isAnimating = false;
let selectedCourseId = null;

// Course icons mapping
const courseIcons = {
  'course-1': '💻',
  'course-2': '🎮',
  'course-3': '🤖',
  'course-4': '🔌',
  'course-5': '🚀'
};

/**
 * Loads all available courses from courses.json
 */
async function loadAllCourses() {
  try {
    const response = await fetch('data/courses.json');
    if (!response.ok) {
      throw new Error('Failed to load courses list');
    }
    const data = await response.json();
    allCourses = data.courses;
    return allCourses;
  } catch (error) {
    console.error('Error loading courses:', error);
    return [];
  }
}

/**
 * Initializes the course carousel on the welcome screen
 */
async function initializeCourseCarousel() {
  if (carouselInitialized) return;

  const carousel = document.getElementById('courseCarousel');
  if (!carousel) {
    console.error('Carousel element not found');
    return;
  }

  // Load courses
  await loadAllCourses();

  if (allCourses.length === 0) {
    console.error('No courses available');
    return;
  }

  // Get the previously selected course or default to first one
  const savedCourseId = localStorage.getItem('selectedCourse') || 'course-1';
  currentCourseIndex = allCourses.findIndex(c => c.id === savedCourseId);
  if (currentCourseIndex === -1) currentCourseIndex = 0;
  selectedCourseId = allCourses[currentCourseIndex].id;

  // Create carousel HTML
  renderCarousel();

  // Add event listeners
  setupCarouselListeners();

  carouselInitialized = true;
}

/**
 * Renders the carousel with all courses
 */
function renderCarousel() {
  const carousel = document.getElementById('courseCarousel');
  if (!carousel) return;

  // Create carousel HTML
  let html = '<div class="course-carousel-track">';

  allCourses.forEach((course, index) => {
    const isActive = index === currentCourseIndex;
    const icon = courseIcons[course.id] || '📚';

    // Calculate position offset
    const offset = (index - currentCourseIndex) * 100;

    html += `
      <div class="course-card ${isActive ? 'active' : ''}"
           data-index="${index}"
           data-course-id="${course.id}"
           style="transform: translateY(${offset}%);">
        <div class="course-card-icon">${icon}</div>
        <h2>${course.title}</h2>
        <p>${course.description}</p>
        <div class="course-card-meta">
          <div class="course-meta-item">
            <span class="course-meta-label">Duration</span>
            <span class="course-meta-value">4 hours</span>
          </div>
          <div class="course-meta-item">
            <span class="course-meta-label">Exercises</span>
            <span class="course-meta-value">8</span>
          </div>
        </div>
      </div>
    `;
  });

  html += '</div>';

  // Add position slider indicator
  const sliderPosition = (currentCourseIndex / (allCourses.length - 1)) * 80; // 80% to account for slider height
  html += `
    <div class="carousel-position-indicator">
      <div class="position-slider-track">
        <div class="position-slider-fill" id="positionSliderFill" style="top: ${sliderPosition}%;"></div>
      </div>
      <div class="position-slider-label">${currentCourseIndex + 1}/${allCourses.length}</div>
    </div>
  `;

  // Add navigation dots
  html += '<div class="carousel-dots">';
  allCourses.forEach((course, index) => {
    html += `<div class="carousel-dot ${index === currentCourseIndex ? 'active' : ''}"
                  data-index="${index}"
                  onclick="jumpToCourse(${index})"></div>`;
  });
  html += '</div>';

  carousel.innerHTML = html;
}

/**
 * Sets up event listeners for carousel interactions
 */
function setupCarouselListeners() {
  const carousel = document.getElementById('courseCarousel');
  if (!carousel) return;

  // Mouse wheel event
  carousel.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (isAnimating) return;

    if (e.deltaY > 0) {
      // Scroll down - next course
      nextCourse();
    } else if (e.deltaY < 0) {
      // Scroll up - previous course
      previousCourse();
    }
  }, { passive: false });

  // Touch events for mobile
  let touchStartY = 0;
  let touchEndY = 0;

  carousel.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  carousel.addEventListener('touchmove', (e) => {
    touchEndY = e.touches[0].clientY;
  }, { passive: true });

  carousel.addEventListener('touchend', (e) => {
    if (isAnimating) return;

    const deltaY = touchStartY - touchEndY;
    const threshold = 50; // minimum swipe distance

    if (Math.abs(deltaY) > threshold) {
      if (deltaY > 0) {
        // Swipe up - next course
        nextCourse();
      } else {
        // Swipe down - previous course
        previousCourse();
      }
    }
  }, { passive: true });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    const welcomeScreen = document.getElementById('welcomeScreen');
    if (!welcomeScreen || welcomeScreen.style.display === 'none') return;

    if (isAnimating) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      nextCourse();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      previousCourse();
    }
  });
}

/**
 * Moves to the next course in the carousel
 */
function nextCourse() {
  if (currentCourseIndex < allCourses.length - 1) {
    currentCourseIndex++;
    updateCarousel();
  }
}

/**
 * Moves to the previous course in the carousel
 */
function previousCourse() {
  if (currentCourseIndex > 0) {
    currentCourseIndex--;
    updateCarousel();
  }
}

/**
 * Jumps to a specific course by index
 * @param {number} index - Course index to jump to
 */
function jumpToCourse(index) {
  if (index >= 0 && index < allCourses.length && index !== currentCourseIndex) {
    currentCourseIndex = index;
    updateCarousel();
  }
}

/**
 * Updates the carousel display with animation
 */
function updateCarousel() {
  if (isAnimating) return;
  isAnimating = true;

  const cards = document.querySelectorAll('.course-card');
  const dots = document.querySelectorAll('.carousel-dot');
  const sliderFill = document.getElementById('positionSliderFill');
  const sliderLabel = document.querySelector('.position-slider-label');

  // Update selected course ID
  selectedCourseId = allCourses[currentCourseIndex].id;

  cards.forEach((card, index) => {
    const offset = (index - currentCourseIndex) * 100;

    // Remove active class from all
    card.classList.remove('active');

    // Add jiggle animation to the new active card
    if (index === currentCourseIndex) {
      card.classList.add('active');
      card.classList.add('jiggle');

      // Remove jiggle class after animation
      setTimeout(() => {
        card.classList.remove('jiggle');
      }, 500);
    }

    // Animate position
    card.style.transform = `translateY(${offset}%)`;
  });

  // Update dots
  dots.forEach((dot, index) => {
    if (index === currentCourseIndex) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });

  // Update position slider
  if (sliderFill) {
    const sliderPosition = (currentCourseIndex / (allCourses.length - 1)) * 80;
    sliderFill.style.top = `${sliderPosition}%`;
  }

  // Update slider label
  if (sliderLabel) {
    sliderLabel.textContent = `${currentCourseIndex + 1}/${allCourses.length}`;
  }

  // Reset animation lock
  setTimeout(() => {
    isAnimating = false;
  }, 600);
}

/**
 * Gets the currently selected course ID
 * @returns {string} Selected course ID
 */
function getSelectedCourseId() {
  const courseId = selectedCourseId || allCourses[currentCourseIndex]?.id || 'course-1';
  console.log('[getSelectedCourseId] Returning:', courseId);
  console.log('[getSelectedCourseId] selectedCourseId:', selectedCourseId);
  console.log('[getSelectedCourseId] currentCourseIndex:', currentCourseIndex);
  console.log('[getSelectedCourseId] allCourses:', allCourses);
  return courseId;
}

/**
 * Starts the workshop with the selected course
 */
async function startWorkshopWithSelectedCourse() {
  const courseId = getSelectedCourseId();

  console.log('========================================');
  console.log('[CAROUSEL] Starting workshop with selected course:', courseId);
  console.log('[CAROUSEL] Current localStorage selectedCourse:', localStorage.getItem('selectedCourse'));

  // Save selection to localStorage (this is what gets loaded on refresh)
  localStorage.setItem('selectedCourse', courseId);
  console.log('[CAROUSEL] Saved to localStorage:', courseId);

  // Set the current course ID in data loader
  setCurrentCourseId(courseId);
  console.log('[CAROUSEL] Set currentCourseId in data loader:', courseId);

  try {
    // Force reload of course data by resetting the dataLoaded flag
    console.log('[CAROUSEL] Current window.dataLoaded:', window.dataLoaded);
    console.log('[CAROUSEL] Forcing course data reload for:', courseId);

    // Access the global dataLoaded variable from app.js
    window.dataLoaded = false;
    console.log('[CAROUSEL] Set window.dataLoaded to false');

    // Load the selected course data directly
    console.log('[CAROUSEL] Calling loadCourseData with courseId:', courseId);
    const result = await loadCourseData(courseId);
    console.log('[CAROUSEL] loadCourseData returned:', result);

    // Mark data as loaded
    window.dataLoaded = true;
    console.log('[CAROUSEL] Set window.dataLoaded to true');

    console.log('[CAROUSEL] Course data loaded successfully');
    console.log('[CAROUSEL] Exercises loaded:', exercises ? exercises.length : 0);
    console.log('[CAROUSEL] First exercise title:', exercises && exercises[0] ? exercises[0].title : 'N/A');
    console.log('[CAROUSEL] Course info:', getCourseInfo());

    // Rebuild the UI with the new course data
    console.log('[CAROUSEL] Rebuilding UI with new course data...');
    await initializeDynamicUI();
    console.log('[CAROUSEL] UI rebuilt');

    console.log('[CAROUSEL] Proceeding to workshop modal...');

    // Now proceed with the workshop flow
    // The startWorkshop function will use the newly loaded course data
    await startWorkshop();
    console.log('========================================');
  } catch (error) {
    console.error('[CAROUSEL] Error loading selected course:', error);
    console.error('[CAROUSEL] Error stack:', error.stack);
    alert('Failed to load the selected course. Please try again.');
  }
}

// Initialize carousel when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCourseCarousel);
} else {
  // DOM already loaded
  initializeCourseCarousel();
}
