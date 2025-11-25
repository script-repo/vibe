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

  // Hide scroll indicator after first interaction
  setTimeout(() => {
    const indicator = document.querySelector('.scroll-indicator');
    if (indicator) {
      let hasInteracted = false;
      const hideIndicator = () => {
        if (!hasInteracted) {
          hasInteracted = true;
          indicator.style.opacity = '0';
          indicator.style.transition = 'opacity 0.5s ease';
          setTimeout(() => {
            indicator.style.display = 'none';
          }, 500);
        }
      };
      carousel.addEventListener('wheel', hideIndicator, { once: true });
      carousel.addEventListener('touchstart', hideIndicator, { once: true });
    }
  }, 1000);

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
  return selectedCourseId || allCourses[currentCourseIndex]?.id || 'course-1';
}

/**
 * Starts the workshop with the selected course
 */
async function startWorkshopWithSelectedCourse() {
  const courseId = getSelectedCourseId();

  // Save selection
  localStorage.setItem('selectedCourse', courseId);
  setCurrentCourseId(courseId);

  // Call the original startWorkshop function
  await startWorkshop();
}

// Initialize carousel when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCourseCarousel);
} else {
  // DOM already loaded
  initializeCourseCarousel();
}
