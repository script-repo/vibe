# AI Integration Workshop - Streamlit Agents Edition

A focused 4-hour workshop (Workshop 5) for the AI Integration learning path. You'll build a Streamlit-inspired chat experience with memory, tools, retrieval, Model Context Protocol (MCP) servers, and production-grade observability.

## 🎯 Workshop Overview

This workshop teaches applied AI integration through hands-on practice:

- **8 Progressive Exercises** across 4 hours
- **Full Agent Lifecycle**: prompts, memory, retrieval, tools, MCP servers, and multi-agent flows
- **Operations Ready**: RLHF hooks, latency metrics, tokens-per-second, TTFT, and safety scaffolding
- **Real-time Coding**: Live preview as you code
- **Guided Learning**: Hints, solutions, and detailed explanations

## 📁 Project Structure

```
workshop-5/
├── index.html              # Main entry point
├── css/
│   ├── styles.css          # Base styles, layout, typography
│   └── components.css      # UI components (buttons, modals, toasts)
├── js/
│   ├── app.js             # Main application logic
│   ├── ui.js              # UI management functions
│   └── timer.js           # Timer functionality
├── data/
│   └── exercises.js       # Exercise data with comprehensive content
└── README.md              # This file
```

## 🚀 Getting Started

1. Open `index.html` in a modern web browser
2. Click "Start Workshop" on the welcome screen
3. Follow the exercises in order
4. Use hints and solutions when needed

## 📚 What You'll Learn

### Hour 1: Streamlit Foundations
- Build a Streamlit-style chat UI with sidebar controls
- Add conversational memory and a prompt library

### Hour 2: Reasoning Tools
- Implement tool calling with a registry and safe execution
- Build retrieval with in-memory context caching and RAG scoring

### Hour 3: Connected Agents
- Configure vector RAG backed by Milvus
- Wire MCP servers for filesystem, database, web search, and team accelerators

### Hour 4: Orchestration & Safety
- Create reusable agents and orchestrate multi-agent handoffs
- Add RLHF signal capture plus latency, TTFT, and tokens-per-second analysis

## 🎨 Features

- **AI-First Exercises**: Every task targets agentic patterns and retrieval
- **Infrastructure Awareness**: Milvus vector search and MCP servers are modeled in the exercises
- **Observability Hooks**: Capture feedback, tokens-per-second, and TTFT
- **Progress Tracking**: Visual progress bar and exercise completion
- **Timer**: Track your learning time
- **Summary & Recap**: Comprehensive debrief after completion

## 🛠️ Modular Architecture

The workshop reuses the modular structure of the core workshop:

### CSS Modules
- `styles.css`: Core styling, layout, responsiveness
- `components.css`: Reusable UI components

### JavaScript Modules
- `exercises.js`: Exercise data (can be replaced with JSON)
- `timer.js`: Timer management
- `ui.js`: UI updates and rendering
- `app.js`: Application state and logic

### Benefits
- **Easy to Maintain**: Each module has a single responsibility
- **Performance**: Separate files can be cached by browsers
- **Scalability**: Easy to add new exercises or features
- **Readability**: Clean separation of concerns

## 🔧 Customization

### Adding New Exercises

Edit `data/exercises.js` and add a new exercise object:

```javascript
{
  title: "Your Exercise Title",
  preamble: `<div class="preamble">Your detailed introduction</div>`,
  description: "Brief description",
  objectives: ["Objective 1", "Objective 2"],
  starterCode: "...",
  solution: "...",
  hint: "Helpful hint",
  validation: (code) => { /* validation logic */ }
}
```

### Styling Customization

Modify CSS variables in `css/styles.css`:

```css
:root {
  --primary: #8b5cf6;
  --secondary: #3b82f6;
  /* ... more variables */
}
```

## 💡 Keyboard Shortcuts

- `Ctrl/Cmd + Enter`: Run code
- `Ctrl/Cmd + H`: Show hint
- Click outside modals to close them

## 📊 Progress Tracking

The workshop automatically tracks:
- Current exercise
- Completed exercises
- Elapsed time
- Completion percentage

## 🎓 Completion Summary

Upon completing all exercises, you'll receive:
- List of all skills mastered
- Achievement badges
- Recommended next steps
- Learning resources
- Total time spent

## 🔄 Future Enhancements

Potential additions:
- LocalStorage progress saving
- Multiple difficulty levels
- Milvus sandbox credentials helper
- MCP server marketplace presets
- Safety evaluation harness templates

## 📝 License

This workshop is open for educational use.

## 🤝 Contributing

Suggestions for improvements:
1. Expand Milvus and MCP coverage with real endpoints
2. Improve preamble content and add diagrams
3. Add additional hints and multi-step validations
4. Enhance UI/UX for RAG visualizations

---

**Happy Building! 🤖**

Design safe, observable AI agents with powerful retrieval.
