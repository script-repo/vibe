// ========================================
// UI Builder Module
// Dynamically builds UI elements from course data
// ========================================

/**
 * Populates the welcome screen with data from JSON
 */
function populateWelcomeScreen() {
  const data = getWelcomeScreenData();
  if (!data) return;

  // Update title
  const titleElement = document.querySelector('.welcome-screen h1');
  if (titleElement && data.title) {
    titleElement.textContent = data.title;
  }

  // Update subtitle
  const subtitleElement = document.querySelector('.welcome-screen > .welcome-content > p');
  if (subtitleElement && data.subtitle) {
    subtitleElement.textContent = data.subtitle;
  }

  // Update features
  const featuresContainer = document.querySelector('.welcome-features');
  if (featuresContainer && data.features) {
    featuresContainer.innerHTML = data.features.map(feature => `
      <div class="feature">
        <div class="feature-icon">${feature.icon}</div>
        <h3>${feature.title}</h3>
        <p>${feature.description}</p>
      </div>
    `).join('');
  }

  // Update button text
  const buttonElement = document.querySelector('.welcome-screen button');
  if (buttonElement && data.buttonText) {
    buttonElement.textContent = data.buttonText;
  }
}

/**
 * Populates the intro popup with data from JSON
 */
function populateIntroPopup() {
  const data = getIntroPopupData();
  if (!data) return;

  // Update title
  const titleElement = document.querySelector('#workshopInfoModal h3');
  if (titleElement && data.title) {
    titleElement.textContent = data.title;
  }

  // Update audio source
  const audioElement = document.getElementById('workshopIntroAudio');
  if (audioElement && data.audioFile) {
    audioElement.src = data.audioFile;
  }

  // Update audio label
  const audioLabel = document.querySelector('.audio-controls span');
  if (audioLabel && data.audioLabel) {
    audioLabel.textContent = data.audioLabel;
  }

  // Update proceed button text
  const proceedButton = document.querySelector('#workshopInfoModal .btn-large');
  if (proceedButton && data.proceedButtonText) {
    proceedButton.textContent = data.proceedButtonText;
  }

  // Build sections dynamically
  if (data.sections) {
    const sectionsHTML = data.sections.map(section => {
      let sectionHTML = `<div class="summary-section"><h4>${section.title}</h4>`;

      if (section.content) {
        sectionHTML += `<p>${section.content}</p>`;
      }

      if (section.items && section.items.length > 0) {
        sectionHTML += '<ul>';
        section.items.forEach(item => {
          sectionHTML += `<li>${item}</li>`;
        });
        sectionHTML += '</ul>';
      }

      sectionHTML += '</div>';
      return sectionHTML;
    }).join('');

    // Find the container to insert sections
    const modalContent = document.querySelector('#workshopInfoModal .modal-content');
    if (modalContent) {
      // Remove old sections if they exist
      const oldSections = modalContent.querySelectorAll('.summary-section');
      oldSections.forEach(section => section.remove());

      // Insert new sections before the last element (if any)
      modalContent.insertAdjacentHTML('beforeend', sectionsHTML);
    }
  }
}

/**
 * Populates the sidebar with data from JSON
 */
function populateSidebar() {
  const data = getSidebarData();
  if (!data || !data.hours) return;

  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  // Clear existing hour sections
  const existingHours = sidebar.querySelectorAll('.hour-section');
  existingHours.forEach(hour => hour.remove());

  // Build sidebar HTML
  const sidebarHTML = data.hours.map((hour, hourIndex) => {
    let hourHTML = `<div class="hour-section"><div class="hour-title">${hour.title}</div>`;

    if (hour.exercises) {
      hour.exercises.forEach((exercise, exerciseIndex) => {
        const globalIndex = hourIndex * 2 + exerciseIndex; // Calculate global exercise index
        hourHTML += `
          <div class="exercise-item" data-exercise="${globalIndex}">
            <div class="exercise-title">${exercise.title}</div>
            <div class="exercise-duration">${exercise.duration}</div>
          </div>
        `;
      });
    }

    hourHTML += '</div>';
    return hourHTML;
  }).join('');

  // Insert before the toggle buttons
  const toggleButton = sidebar.querySelector('.sidebar-toggle');
  if (toggleButton) {
    toggleButton.insertAdjacentHTML('afterend', sidebarHTML);
  } else {
    sidebar.insertAdjacentHTML('afterbegin', sidebarHTML);
  }

  // Re-attach exercise click handlers
  attachExerciseClickHandlers();
}

/**
 * Attaches click handlers to exercise items in sidebar
 */
function attachExerciseClickHandlers() {
  document.querySelectorAll('.exercise-item').forEach((item, index) => {
    // Remove existing listeners by cloning
    const newItem = item.cloneNode(true);
    item.parentNode.replaceChild(newItem, item);

    // Add new listener
    newItem.addEventListener('click', () => {
      loadExercise(index);
      closeSidebar();
    });
  });
}

/**
 * Initializes all dynamic UI elements
 */
async function initializeDynamicUI() {
  // Wait for data to be loaded
  if (!dataLoaded) {
    console.log('Waiting for course data to load...');
    await initializeCourseData();
  }

  console.log('Building dynamic UI...');
  populateWelcomeScreen();
  populateIntroPopup();
  populateSidebar();
  console.log('Dynamic UI built successfully!');
}
