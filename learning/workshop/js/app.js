// ========================================
// Main Application Module
// Manages workshop state and core functionality
// ========================================

// Application state
let currentExercise = 0;
let completedExercises = new Set();

// Device detection
const deviceInfo = {
  isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  isTablet: /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent),
  isPortrait: () => window.innerHeight > window.innerWidth,
  isLandscape: () => window.innerWidth > window.innerHeight
};

// ========================================
// Core Functions
// ========================================

/**
 * Starts the workshop flow by showing the info modal
 */
function startWorkshop() {
  console.log('Starting workshop flow...');
  const modal = document.getElementById('workshopInfoModal');
  if (!modal) {
    console.error('Workshop info modal not found!');
    alert('Error: Workshop info modal not found. Please refresh.');
    return;
  }
  showModal('workshopInfoModal');

  // Play intro audio
  const audio = document.getElementById('workshopIntroAudio');
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(e => console.log('Audio autoplay blocked (user interaction needed):', e));
  }
}

/**
 * Actually starts the workshop after the info modal
 */
function proceedToWorkshop() {
  console.log('Proceeding to workshop...');

  // Stop audio
  stopAudio();

  try {
    closeModal('workshopInfoModal');
    hideWelcomeScreen();
    startTimer();

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      loadExercise(0);
    }, 10);
  } catch (error) {
    console.error('Error starting workshop:', error);
    alert('Error starting workshop. Please refresh the page and try again.');
  }
}

// ========================================
// Audio Control Functions
// ========================================

function toggleAudio() {
  const audio = document.getElementById('workshopIntroAudio');
  if (audio) {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }
}

function stopAudio() {
  const audio = document.getElementById('workshopIntroAudio');
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}

function toggleMute() {
  const audio = document.getElementById('workshopIntroAudio');
  const btn = document.getElementById('muteBtn');
  if (audio) {
    audio.muted = !audio.muted;
    if (btn) {
      btn.textContent = audio.muted ? '🔇' : '🔊';
    }
  }
}

/**
 * Loads an exercise by index
 * @param {number} index - Exercise index to load
 */
function loadExercise(index) {
  try {
    if (index < 0 || index >= exercises.length) {
      console.error('Invalid exercise index:', index);
      return;
    }

    currentExercise = index;
    const exercise = exercises[index];

    if (!exercise) {
      console.error('Exercise not found at index:', index);
      return;
    }

    // Update UI components
    updateSidebar(index, completedExercises);
    updateProgress((completedExercises.size / exercises.length) * 100);
    updateInstructions(exercise);

    // Scroll instructions to top
    const instructionsPanel = document.getElementById('instructions');
    if (instructionsPanel) {
      instructionsPanel.scrollTop = 0;
    }

    updateEditor(exercise.starterCode);

    // Run code automatically
    runCode();
  } catch (error) {
    console.error('Error loading exercise:', error);
  }
}

/**
 * Runs the code in the editor
 */
function runCode() {
  const editorElement = document.getElementById('editor');
  if (editorElement) {
    const code = editorElement.value;
    updatePreview(code);
  }
}

/**
 * Resets the current exercise to starter code
 */
function resetCode() {
  const exercise = exercises[currentExercise];
  if (exercise) {
    updateEditor(exercise.starterCode);
    runCode();
    showToast('Code reset to starter template', 'info');
  }
}

/**
 * Shows the hint for the current exercise
 */
function showHint() {
  const exercise = exercises[currentExercise];
  if (exercise) {
    showHintModal(exercise.hint);
  }
}

/**
 * Shows the solution for the current exercise
 */
function showSolution() {
  const exercise = exercises[currentExercise];
  if (exercise) {
    showSolutionModal(exercise.solution);
  }
}

/**
 * Copies the solution to the editor
 */
function copySolution() {
  const exercise = exercises[currentExercise];
  if (exercise) {
    updateEditor(exercise.solution);
    runCode();
    closeModal('solutionModal');
    showToast('Solution copied to editor!', 'info');
  }
}

/**
 * Checks if the current solution is valid
 */
function checkSolution() {
  const editorElement = document.getElementById('editor');
  if (!editorElement) return;

  const code = editorElement.value;
  const exercise = exercises[currentExercise];

  if (!exercise) return;

  if (exercise.validation(code)) {
    completedExercises.add(currentExercise);
    showToast('Exercise completed! 🎉', 'success');

    // Update UI
    updateProgress((completedExercises.size / exercises.length) * 100);
    updateSidebar(currentExercise, completedExercises);

    // Check if all exercises are completed
    if (completedExercises.size === exercises.length) {
      setTimeout(() => {
        showToast('🎉 Workshop Complete! You\'re amazing!', 'success');
        setTimeout(() => {
          showCompletionSummary(workshopSummary);
        }, 1500);
      }, 1000);
    }
  } else {
    showToast('Not quite there yet. Keep trying! 💪', 'error');
  }
}

/**
 * Loads the next exercise
 */
function nextExercise() {
  if (currentExercise < exercises.length - 1) {
    loadExercise(currentExercise + 1);
  } else {
    showToast('This is the last exercise!', 'info');
  }
}

/**
 * Loads the previous exercise
 */
function previousExercise() {
  if (currentExercise > 0) {
    loadExercise(currentExercise - 1);
  } else {
    showToast('This is the first exercise!', 'info');
  }
}

// ========================================
// Event Listeners
// ========================================

// ========================================
// Mobile-specific Functions
// ========================================

/**
 * Toggles sidebar on mobile devices
 */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.toggle('open');
  }
}

/**
 * Closes sidebar on mobile devices
 */
function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar && deviceInfo.isMobile) {
    sidebar.classList.remove('open');
  }
}

/**
 * Applies device-specific classes to body
 */
function applyDeviceClasses() {
  if (deviceInfo.isMobile) {
    document.body.classList.add('is-mobile');
  }
  if (deviceInfo.isTablet) {
    document.body.classList.add('is-tablet');
  }

  // Update orientation class
  if (deviceInfo.isPortrait()) {
    document.body.classList.add('is-portrait');
    document.body.classList.remove('is-landscape');
  } else {
    document.body.classList.add('is-landscape');
    document.body.classList.remove('is-portrait');
  }
}

/**
 * Toggles the instructions panel (minimize/maximize)
 */
function toggleInstructions() {
  const instructions = document.getElementById('instructions');
  const minimizeIcon = document.getElementById('minimizeIcon');

  if (instructions) {
    instructions.classList.toggle('minimized');
    if (minimizeIcon) {
      minimizeIcon.textContent = instructions.classList.contains('minimized') ? '+' : '−';
    }
  }
}

/**
 * Toggles fullscreen mode
 */
function toggleFullscreen() {
  if (!document.fullscreenElement && !document.webkitFullscreenElement &&
      !document.mozFullScreenElement && !document.msFullscreenElement) {
    // Enter fullscreen
    const elem = document.documentElement;

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { // Safari
      elem.webkitRequestFullscreen();
    } else if (elem.mozRequestFullScreen) { // Firefox
      elem.mozRequestFullScreen();
    } else if (elem.msRequestFullscreen) { // IE/Edge
      elem.msRequestFullscreen();
    }

    document.body.classList.add('fullscreen');

    // Update button icon
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
      fullscreenBtn.textContent = '⛶';
      fullscreenBtn.title = 'Exit Fullscreen';
    }
  } else {
    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { // Safari
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) { // Firefox
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) { // IE/Edge
      document.msExitFullscreen();
    }

    document.body.classList.remove('fullscreen');

    // Update button icon
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
      fullscreenBtn.textContent = '⛶';
      fullscreenBtn.title = 'Enter Fullscreen';
    }
  }
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Apply device-specific classes
  applyDeviceClasses();

  // Exercise navigation from sidebar
  document.querySelectorAll('.exercise-item').forEach((item, index) => {
    item.addEventListener('click', () => {
      loadExercise(index);
      closeSidebar(); // Close sidebar on mobile after selection
    });
  });

  // Auto-run code on changes (debounced)
  let runTimeout;
  const editorElement = document.getElementById('editor');
  if (editorElement) {
    editorElement.addEventListener('input', () => {
      clearTimeout(runTimeout);
      runTimeout = setTimeout(runCode, 1000);
    });
  }

  // Close modals on click outside
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });

  // Keyboard shortcuts (disabled on mobile for better UX)
  if (!deviceInfo.isMobile) {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'Enter') {
          e.preventDefault();
          runCode();
        }
        if (e.key === 'h') {
          e.preventDefault();
          showHint();
        }
      }
    });
  }

  // Handle orientation changes
  window.addEventListener('orientationchange', () => {
    setTimeout(applyDeviceClasses, 100);
  });

  // Handle resize events (for responsive updates)
  window.addEventListener('resize', () => {
    applyDeviceClasses();
  });

  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('mobileMenuBtn');

    if (deviceInfo.isMobile && sidebar && sidebar.classList.contains('open')) {
      // Check if click is outside sidebar and menu button
      if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
        closeSidebar();
      }
    }
  });

  // Handle fullscreen change events
  const fullscreenChangeHandler = () => {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (!document.fullscreenElement && !document.webkitFullscreenElement &&
        !document.mozFullScreenElement && !document.msFullscreenElement) {
      // Exited fullscreen
      document.body.classList.remove('fullscreen');
      if (fullscreenBtn) {
        fullscreenBtn.textContent = '⛶';
        fullscreenBtn.title = 'Enter Fullscreen';
      }
    } else {
      // Entered fullscreen
      document.body.classList.add('fullscreen');
      if (fullscreenBtn) {
        fullscreenBtn.textContent = '⛶';
        fullscreenBtn.title = 'Exit Fullscreen';
      }
    }
  };

  document.addEventListener('fullscreenchange', fullscreenChangeHandler);
  document.addEventListener('webkitfullscreenchange', fullscreenChangeHandler);
  document.addEventListener('mozfullscreenchange', fullscreenChangeHandler);
  document.addEventListener('MSFullscreenChange', fullscreenChangeHandler);
});

// ========================================
// Utility Functions
// ========================================

/**
 * Gets the current exercise data
 * @returns {Object} Current exercise object
 */
function getCurrentExercise() {
  return exercises[currentExercise];
}

/**
 * Gets workshop statistics
 * @returns {Object} Workshop statistics
 */
function getWorkshopStats() {
  return {
    currentExercise: currentExercise,
    completedCount: completedExercises.size,
    totalExercises: exercises.length,
    completionPercentage: (completedExercises.size / exercises.length) * 100,
    elapsedTime: getElapsedTime()
  };
}

/**
 * Exports workshop data (for debugging or saving progress)
 * @returns {Object} Workshop data
 */
function exportWorkshopData() {
  return {
    currentExercise,
    completedExercises: Array.from(completedExercises),
    elapsedTime: getElapsedTime(),
    timestamp: new Date().toISOString()
  };
}

/**
 * Imports workshop data (for restoring progress)
 * @param {Object} data - Workshop data to import
 */
function importWorkshopData(data) {
  if (data.currentExercise !== undefined) {
    currentExercise = data.currentExercise;
  }
  if (data.completedExercises) {
    completedExercises = new Set(data.completedExercises);
  }
  loadExercise(currentExercise);
}

// Log workshop loaded
console.log('🚀 Workshop loaded! Ready to build amazing things!');
console.log(`Total exercises: ${exercises.length}`);
console.log('Use Ctrl+Enter (Cmd+Enter on Mac) to run code');
console.log('Use Ctrl+H (Cmd+H on Mac) to show hints');
