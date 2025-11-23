// ========================================
// Main Application Module
// Manages workshop state and core functionality
// ========================================

// Application state
let currentExercise = 0;
let completedExercises = new Set();

// ========================================
// Core Functions
// ========================================

/**
 * Starts the workshop
 */
function startWorkshop() {
  try {
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

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Exercise navigation from sidebar
  document.querySelectorAll('.exercise-item').forEach((item, index) => {
    item.addEventListener('click', () => {
      loadExercise(index);
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

  // Keyboard shortcuts
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
