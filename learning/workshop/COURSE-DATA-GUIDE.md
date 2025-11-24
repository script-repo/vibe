# Course Data Structure Guide

This document explains how to create and customize courses using the JSON-based course data system.

## Overview

The workshop has been converted to use a **single JSON file** (`data/course-data.json`) that contains all course content. This makes it easy to:

- Create new courses with different content
- Maintain and update course content
- Translate courses to different languages
- Version control course content separately from code

## File Structure

```
workshop/
├── data/
│   ├── course-data.json      # Main course content file
│   ├── data-loader.js         # Loads and processes JSON data
│   └── exercises.js           # (DEPRECATED - kept for reference)
├── js/
│   ├── app.js                 # Main application logic
│   ├── ui.js                  # UI management functions
│   ├── ui-builder.js          # Dynamically builds UI from JSON
│   └── timer.js               # Timer functionality
├── media/
│   ├── *.mp4                  # Exercise videos
│   └── *.m4a                  # Audio files
└── index.html                 # Main HTML file
```

## JSON Schema

### Top-Level Structure

```json
{
  "courseInfo": { ... },
  "welcomeScreen": { ... },
  "introPopup": { ... },
  "sidebar": { ... },
  "exercises": [ ... ],
  "completionSummary": { ... }
}
```

### Course Info

Basic information about the course:

```json
"courseInfo": {
  "title": "Build Your First Modern Web App",
  "duration": "4 hours",
  "exerciseCount": 8,
  "version": "1.0.0"
}
```

### Welcome Screen

The initial landing page content:

```json
"welcomeScreen": {
  "title": "🚀 Build Your First Modern Web App",
  "subtitle": "A hands-on 4-hour workshop...",
  "features": [
    {
      "icon": "⚡",
      "title": "8 Exercises",
      "description": "Progressive learning with real-time coding"
    }
  ],
  "buttonText": "Start Workshop 🎯"
}
```

### Intro Popup

The popup that appears after clicking "Start Workshop":

```json
"introPopup": {
  "title": "📘 Workshop Overview",
  "audioFile": "media/Workshop-intro.m4a",
  "audioLabel": "🎧 Intro Audio",
  "proceedButtonText": "Let's Start! 🚀",
  "sections": [
    {
      "title": "👥 Target Persona",
      "content": "This workshop is designed for:",
      "items": [
        "<strong>Aspiring Frontend Developers</strong>...",
        "<strong>Designers</strong>..."
      ]
    }
  ]
}
```

**Audio File Placeholder**: The `audioFile` field is where you specify the path to your intro audio. If you don't have audio, you can set it to an empty string `""`.

### Sidebar

Navigation structure for exercises:

```json
"sidebar": {
  "hours": [
    {
      "title": "⚡ Hour 1: Foundations",
      "exercises": [
        {
          "title": "1.1 Hello Beautiful World",
          "duration": "30 minutes"
        }
      ]
    }
  ]
}
```

### Exercises

The core content - each exercise includes:

```json
{
  "id": "1.1",
  "title": "Hello Beautiful World",
  "videoFile": "media/Excercise-1.1-Hello_Beautiful_World.mp4",
  "preambleTitle": "Welcome to Modern Web Development!",
  "preambleIntro": "In this first exercise...",
  "keyConcepts": [
    "<strong>CSS Box Model</strong>: Understanding...",
    "<strong>Flexbox Layout</strong>: Creating..."
  ],
  "commonPitfalls": [
    "Forgetting to set a semi-transparent background...",
    "Not including vendor prefixes..."
  ],
  "prerequisites": "Basic understanding of HTML and CSS selectors.",
  "description": "Create a beautiful, centered card...",
  "objectives": [
    "Create a centered card layout using Flexbox",
    "Apply glassmorphism effect with backdrop-filter"
  ],
  "starterCode": "<!DOCTYPE html>...",
  "solution": "<!DOCTYPE html>...",
  "hint": "Use `backdrop-filter: blur(10px)`...",
  "validationRules": ["backdrop-filter", "linear-gradient", "rgba"]
}
```

**Video File Placeholder**: The `videoFile` field specifies the path to the instruction video for each exercise. If you don't have a video, use an empty string `""`.

**Validation Rules**: Array of strings that must appear in the student's code for the exercise to be marked as complete. Can use arrays for OR conditions:
- Simple string: `"backdrop-filter"` - must contain this string
- Array: `["let", "var"]` - must contain at least one of these
- Special: `"length>1000"` - code must be longer than 1000 characters

### Completion Summary

Shown when all exercises are complete:

```json
"completionSummary": {
  "title": "Congratulations! You've Completed the Workshop!",
  "message": "You've just built your first modern web application...",
  "skillsLearned": [
    "HTML5 & Semantic Markup",
    "Modern CSS (Glassmorphism, Gradients, Flexbox, Grid)"
  ],
  "achievements": [
    {
      "icon": "🎨",
      "title": "Design Master",
      "description": "Created beautiful UIs with glassmorphism"
    }
  ],
  "nextSteps": [
    "Build your own projects using these techniques",
    "Learn React, Vue, or Angular for component frameworks"
  ],
  "resources": [
    {
      "name": "MDN Web Docs",
      "url": "https://developer.mozilla.org"
    }
  ]
}
```

## Creating a New Course

### Step 1: Duplicate the JSON File

```bash
cp data/course-data.json data/my-new-course.json
```

### Step 2: Update Course Info

Change the basic course information:

```json
"courseInfo": {
  "title": "Your Course Title",
  "duration": "2 hours",
  "exerciseCount": 4,
  "version": "1.0.0"
}
```

### Step 3: Customize Welcome Screen

Update the welcome screen content with your course's value proposition.

### Step 4: Update Intro Popup

- Change the `audioFile` path to your intro audio file (or "" if none)
- Modify the sections to explain your course's goals and target audience

### Step 5: Modify Sidebar Structure

Organize your course into hours/modules:

```json
"sidebar": {
  "hours": [
    {
      "title": "🎯 Module 1: Basics",
      "exercises": [
        { "title": "1.1 Getting Started", "duration": "15 minutes" }
      ]
    }
  ]
}
```

### Step 6: Create Exercises

For each exercise:

1. **Video**: Add your instructional video to `media/` folder and set `videoFile`
2. **Preamble**: Write the introduction, key concepts, common pitfalls
3. **Code**: Provide starter code and solution
4. **Validation**: Define validation rules based on what students should learn

### Step 7: Update Completion Summary

Customize the end-of-course congratulations, skills learned, and next steps.

### Step 8: Load Your Course

To use your custom course, update `data-loader.js`:

```javascript
const response = await fetch('data/my-new-course.json');
```

## Media File Guidelines

### Videos

- **Format**: MP4 (H.264 codec recommended)
- **Resolution**: 1280x720 (720p) or 1920x1080 (1080p)
- **Length**: 3-10 minutes per exercise
- **Content**: Should show the concept being taught, not just code typing

### Audio

- **Format**: M4A, MP3, or OGG
- **Bitrate**: 128kbps minimum
- **Length**: 2-5 minutes for intro
- **Content**: Welcome message, course overview, instructor introduction

### Placeholders

If you don't have media files ready:
- Set `videoFile` to `""` - the video container will be hidden
- Set `audioFile` to `""` - the audio controls will be hidden

## Validation Rules

Validation rules determine when an exercise is marked as complete. They check if certain patterns exist in the student's code.

### Rule Types

1. **Simple String Match**
   ```json
   "validationRules": ["backdrop-filter", "linear-gradient"]
   ```
   Code must contain both "backdrop-filter" AND "linear-gradient"

2. **OR Conditions** (array within array)
   ```json
   "validationRules": [["let", "var", "const"]]
   ```
   Code must contain at least ONE of: "let", "var", or "const"

3. **Length Check**
   ```json
   "validationRules": ["length>1000"]
   ```
   Code must be longer than 1000 characters

4. **Combined Rules**
   ```json
   "validationRules": [
     "addEventListener",
     ["let", "const"],
     "textContent"
   ]
   ```
   Code must have "addEventListener" AND ("let" OR "const") AND "textContent"

### Creating Effective Validation Rules

✅ **Good**: Check for key concepts
```json
["class", "constructor", "method"]
```

✅ **Good**: Use OR for alternatives
```json
[["fetch", "XMLHttpRequest"], ["async", "await"]]
```

❌ **Bad**: Too strict
```json
["const myFunction = () => {"]  // Exact match required
```

❌ **Bad**: Too lenient
```json
["div"]  // Almost any HTML will pass
```

## Localization

To create a course in another language:

1. Duplicate the JSON file
2. Translate all text content
3. Keep field names in English (e.g., "title", "description")
4. Update media files with localized videos/audio
5. Save as `course-data-{language}.json` (e.g., `course-data-es.json`)

## Tips & Best Practices

### Content Writing

- **Preambles**: Should be comprehensive but scannable
- **Instructions**: Use clear, action-oriented language
- **Hints**: Give just enough guidance, not the full solution
- **Solutions**: Should be production-quality code with best practices

### Media Production

- **Videos**: Show, don't just tell. Demonstrate the concepts visually
- **Audio**: Use a good microphone. Background noise is distracting
- **Editing**: Cut silences and mistakes. Respect students' time

### Exercise Design

- **Progressive**: Each exercise should build on previous ones
- **Focused**: One main concept per exercise
- **Achievable**: Should be completable in the stated duration
- **Rewarding**: Students should see immediate results

### Validation Rules

- **Essential Only**: Only check for the core concepts being taught
- **Flexible**: Allow different valid approaches
- **Clear**: If validation fails, the hint should explain what's missing

## Troubleshooting

### Videos Don't Play

- Check file format (MP4 with H.264)
- Verify path in JSON matches actual file location
- Ensure file is not corrupted

### Validation Not Working

- Check that validationRules array is properly formatted
- Test rules manually in browser console
- Use browser DevTools to inspect the code being validated

### UI Not Updating

- Check browser console for JavaScript errors
- Verify JSON is valid (use JSONLint)
- Clear browser cache and reload

## Example: Minimal Course

Here's a minimal viable course with 2 exercises:

```json
{
  "courseInfo": {
    "title": "HTML Basics",
    "duration": "1 hour",
    "exerciseCount": 2,
    "version": "1.0.0"
  },
  "welcomeScreen": {
    "title": "Learn HTML Basics",
    "subtitle": "A quick introduction to HTML",
    "features": [
      {"icon": "📝", "title": "2 Exercises", "description": "Hands-on practice"}
    ],
    "buttonText": "Start Learning"
  },
  "introPopup": {
    "title": "Course Overview",
    "audioFile": "",
    "audioLabel": "",
    "proceedButtonText": "Let's Go!",
    "sections": [
      {
        "title": "What You'll Learn",
        "content": "Basic HTML structure and elements",
        "items": []
      }
    ]
  },
  "sidebar": {
    "hours": [
      {
        "title": "HTML Basics",
        "exercises": [
          {"title": "1. First Page", "duration": "30 min"},
          {"title": "2. Add Links", "duration": "30 min"}
        ]
      }
    ]
  },
  "exercises": [
    {
      "id": "1",
      "title": "First HTML Page",
      "videoFile": "",
      "preambleTitle": "Creating Your First Page",
      "preambleIntro": "Learn HTML structure",
      "keyConcepts": ["DOCTYPE", "html tag", "head and body"],
      "commonPitfalls": ["Forgetting closing tags"],
      "prerequisites": "None",
      "description": "Create a basic HTML page",
      "objectives": ["Write DOCTYPE", "Create html, head, body tags"],
      "starterCode": "<!-- TODO: Add HTML here -->",
      "solution": "<!DOCTYPE html>\n<html>\n<head><title>My Page</title></head>\n<body><h1>Hello</h1></body>\n</html>",
      "hint": "Start with <!DOCTYPE html>",
      "validationRules": ["DOCTYPE", "html", "body"]
    },
    {
      "id": "2",
      "title": "Add Links",
      "videoFile": "",
      "preambleTitle": "Linking Pages",
      "preambleIntro": "Learn the <a> tag",
      "keyConcepts": ["anchor tag", "href attribute"],
      "commonPitfalls": ["Forgetting quotes around href"],
      "prerequisites": "Exercise 1",
      "description": "Add a link to your page",
      "objectives": ["Use the <a> tag", "Set href attribute"],
      "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n<!-- TODO: Add link here -->\n</body>\n</html>",
      "solution": "<!DOCTYPE html>\n<html>\n<body>\n<a href=\"https://example.com\">Click me</a>\n</body>\n</html>",
      "hint": "Use <a href=\"url\">text</a>",
      "validationRules": ["<a", "href"]
    }
  ],
  "completionSummary": {
    "title": "Congratulations!",
    "message": "You've completed HTML Basics!",
    "skillsLearned": ["HTML Structure", "Creating Links"],
    "achievements": [
      {"icon": "🎯", "title": "HTML Novice", "description": "Completed basics"}
    ],
    "nextSteps": ["Learn CSS", "Learn JavaScript"],
    "resources": [
      {"name": "MDN", "url": "https://developer.mozilla.org"}
    ]
  }
}
```

## Support

For questions or issues with the course data system:

1. Check this guide first
2. Inspect browser console for errors
3. Validate your JSON using [JSONLint](https://jsonlint.com/)
4. Review the example course data file

---

**Happy Course Creating! 📚**
