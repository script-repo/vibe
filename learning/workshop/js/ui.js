// ========================================
// UI Management Module
// Handles all UI updates and interactions
// ========================================

/**
 * Shows a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (success, error, info)
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

/**
 * Updates the progress bar
 * @param {number} percentage - Progress percentage (0-100)
 */
function updateProgress(percentage) {
  const progressBar = document.getElementById('progressBar');
  if (progressBar) {
    progressBar.style.width = `${percentage}%`;
  }
}

/**
 * Updates the sidebar to show current exercise
 * @param {number} currentIndex - Index of current exercise
 * @param {Set} completedExercises - Set of completed exercise indices
 */
function updateSidebar(currentIndex, completedExercises) {
  document.querySelectorAll('.exercise-item').forEach((item, i) => {
    item.classList.remove('active');

    if (i === currentIndex) {
      item.classList.add('active');
      item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    if (completedExercises.has(i)) {
      item.classList.add('completed');
    }
  });
}

/**
 * Updates the instructions panel with exercise content
 * @param {Object} exercise - Exercise object containing instructions
 */
function updateInstructions(exercise) {
  const instructionsHTML = `
    ${exercise.preamble || ''}
    <h2>${exercise.title}</h2>
    <p>${exercise.description}</p>
    <h3>Objectives:</h3>
    <ul>
      ${exercise.objectives.map(obj => `<li>${obj}</li>`).join('')}
    </ul>
  `;

  const instructionsElement = document.getElementById('instructions');
  if (instructionsElement) {
    instructionsElement.innerHTML = instructionsHTML;
  }
}

/**
 * Updates the code editor with starter code
 * @param {string} code - The code to load into the editor
 */
function updateEditor(code) {
  const editorElement = document.getElementById('editor');
  if (editorElement) {
    editorElement.value = code;
  }
}

/**
 * Updates the preview iframe with code
 * @param {string} code - The HTML code to preview
 */
function updatePreview(code) {
  const preview = document.getElementById('preview');
  if (preview) {
    preview.srcdoc = code;
  }
}

/**
 * Shows a modal
 * @param {string} modalId - ID of the modal to show
 */
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

/**
 * Closes a modal
 * @param {string} modalId - ID of the modal to close
 */
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

/**
 * Shows the hint modal with hint text
 * @param {string} hintText - The hint text to display
 */
function showHintModal(hintText) {
  const hintElement = document.getElementById('hintText');
  if (hintElement) {
    hintElement.textContent = hintText;
  }
  showModal('hintModal');
}

/**
 * Shows the solution modal with solution code
 * @param {string} solutionCode - The solution code to display
 */
function showSolutionModal(solutionCode) {
  const solutionElement = document.getElementById('solutionCode');
  if (solutionElement) {
    solutionElement.textContent = solutionCode;
  }
  showModal('solutionModal');
}

/**
 * Shows the completion summary modal
 * @param {Object} summaryData - Summary data object
 */
function showCompletionSummary(summaryData) {
  const summaryContent = `
    <p><strong>${summaryData.message}</strong></p>

    <div class="summary-section">
      <h4>🎓 Skills You've Mastered</h4>
      <div class="skills-grid">
        ${summaryData.skillsLearned.map(skill =>
          `<div class="skill-badge">${skill}</div>`
        ).join('')}
      </div>
    </div>

    <div class="summary-section">
      <h4>🏆 Achievements Unlocked</h4>
      ${summaryData.achievements.map(achievement => `
        <div class="achievement">
          <div class="achievement-icon">${achievement.icon}</div>
          <div>
            <strong>${achievement.title}</strong>
            <p style="margin: 0; font-size: 0.875rem;">${achievement.description}</p>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="summary-section">
      <h4>🚀 What's Next?</h4>
      <ul class="next-steps">
        ${summaryData.nextSteps.map(step => `<li>${step}</li>`).join('')}
      </ul>
    </div>

    <div class="summary-section">
      <h4>📚 Recommended Resources</h4>
      <ul>
        ${summaryData.resources.map(resource =>
          `<li><strong>${resource.name}</strong>: ${resource.url}</li>`
        ).join('')}
      </ul>
    </div>

    <p style="margin-top: 2rem; font-size: 1.25rem; text-align: center;">
      <strong>Total Time: ${formatTime(getElapsedTime())}</strong>
    </p>

    <p style="margin-top: 1rem; text-align: center; color: var(--text-dim);">
      You've completed all 8 exercises and built a complete modern web application!<br>
      Take pride in your achievement and keep building amazing things! 💪
    </p>
  `;

  const summaryElement = document.getElementById('summaryContent');
  if (summaryElement) {
    summaryElement.innerHTML = summaryContent;
  }

  showModal('summaryModal');
}

/**
 * Hides the welcome screen and shows the main app
 */
function hideWelcomeScreen() {
  const welcomeScreen = document.getElementById('welcomeScreen');
  if (welcomeScreen) {
    welcomeScreen.style.display = 'none';
  }
}
