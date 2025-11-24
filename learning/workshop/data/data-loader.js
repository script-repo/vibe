// ========================================
// Data Loader Module
// Loads course data from JSON file and provides access to it
// ========================================

let courseData = null;
let exercises = [];
let workshopSummary = null;

/**
 * Loads course data from JSON file
 * @returns {Promise<Object>} The loaded course data
 */
async function loadCourseData() {
  try {
    const response = await fetch('data/course-data.json');
    if (!response.ok) {
      throw new Error(`Failed to load course data: ${response.status}`);
    }

    courseData = await response.json();

    // Process exercises and add validation functions
    exercises = courseData.exercises.map(exercise => {
      return {
        ...exercise,
        // Reconstruct the preamble HTML from JSON structure
        preamble: buildPreambleHTML(exercise),
        // Create validation function from validation rules
        validation: createValidationFunction(exercise.validationRules)
      };
    });

    // Set up workshop summary
    workshopSummary = courseData.completionSummary;

    return courseData;
  } catch (error) {
    console.error('Error loading course data:', error);
    alert('Failed to load course data. Please refresh the page.');
    throw error;
  }
}

/**
 * Builds the preamble HTML from exercise data
 * @param {Object} exercise - Exercise object from JSON
 * @returns {string} HTML string for the preamble
 */
function buildPreambleHTML(exercise) {
  let html = '<div class="preamble">';

  // Add video if available
  if (exercise.videoFile) {
    html += `
      <div class="video-container" style="margin-bottom: 1.5rem; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
        <video controls style="width: 100%; display: block;">
          <source src="${exercise.videoFile}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      </div>
    `;
  }

  // Add title and intro
  if (exercise.preambleTitle) {
    html += `<h3>${exercise.preambleTitle}</h3>`;
  }

  if (exercise.preambleIntro) {
    html += `<p>${exercise.preambleIntro}</p>`;
  }

  // Add key concepts
  if (exercise.keyConcepts && exercise.keyConcepts.length > 0) {
    html += `
      <div class="key-concepts">
        <h4>Key Concepts You'll Learn:</h4>
        <ul>
          ${exercise.keyConcepts.map(concept => `<li>${concept}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  // Add common pitfalls
  if (exercise.commonPitfalls && exercise.commonPitfalls.length > 0) {
    html += `
      <div class="common-pitfalls">
        <h4>Common Pitfalls to Avoid:</h4>
        <ul>
          ${exercise.commonPitfalls.map(pitfall => `<li>${pitfall}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  // Add prerequisites
  if (exercise.prerequisites) {
    html += `<p><em>Prerequisites:</em> ${exercise.prerequisites}</p>`;
  }

  html += '</div>';
  return html;
}

/**
 * Creates a validation function from validation rules
 * @param {Array} rules - Array of validation rules
 * @returns {Function} Validation function
 */
function createValidationFunction(rules) {
  return (code) => {
    if (!rules || rules.length === 0) {
      // If no rules, accept any code longer than 500 chars as valid attempt
      return code.length > 500;
    }

    // Check each rule
    for (const rule of rules) {
      if (Array.isArray(rule)) {
        // OR condition - at least one must match
        const hasMatch = rule.some(r => code.includes(r));
        if (!hasMatch) return false;
      } else if (rule === 'length>1000') {
        // Special rule for length
        if (code.length <= 1000) return false;
      } else {
        // Simple string match
        if (!code.includes(rule)) return false;
      }
    }

    return true;
  };
}

/**
 * Gets course information
 * @returns {Object} Course info
 */
function getCourseInfo() {
  return courseData?.courseInfo || {};
}

/**
 * Gets welcome screen data
 * @returns {Object} Welcome screen data
 */
function getWelcomeScreenData() {
  return courseData?.welcomeScreen || {};
}

/**
 * Gets intro popup data
 * @returns {Object} Intro popup data
 */
function getIntroPopupData() {
  return courseData?.introPopup || {};
}

/**
 * Gets sidebar data
 * @returns {Object} Sidebar data
 */
function getSidebarData() {
  return courseData?.sidebar || {};
}

/**
 * Gets all exercises
 * @returns {Array} Array of exercise objects
 */
function getExercises() {
  return exercises;
}

/**
 * Gets a specific exercise by index
 * @param {number} index - Exercise index
 * @returns {Object} Exercise object
 */
function getExercise(index) {
  return exercises[index];
}

/**
 * Gets workshop summary data
 * @returns {Object} Workshop summary
 */
function getWorkshopSummary() {
  return workshopSummary;
}
