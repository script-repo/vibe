/**
 * Ralph Wiggum Loop Framework
 * "Me fail English? That's unpossible!" - Ralph Wiggum
 *
 * A whimsical loop framework inspired by Springfield's most lovable oddball.
 * For when your code needs to loop, but also needs to pick its nose.
 */

const RalphWiggumLoop = (() => {
  // Ralph's wisdom collection
  const ralphQuotes = [
    "I'm learnding!",
    "Me fail English? That's unpossible!",
    "I bent my Wookiee.",
    "My cat's breath smells like cat food.",
    "I'm Idaho!",
    "The doctor said I wouldn't have so many nosebleeds if I kept my finger outta there.",
    "I found a moon rock in my nose!",
    "I heard your dad went into a restaurant and ate everything in the restaurant and they had to close the restaurant.",
    "When I grow up, I'm going to Bovine University!",
    "That's where I saw the leprechaun. He tells me to burn things.",
    "Hi, Super Nintendo Chalmers!",
    "I'm a brick!",
    "Slow down, brain, or I'll stab you with a Q-Tip!",
    "It tastes like burning.",
    "My parents won't let me use scissors."
  ];

  // Get random Ralph quote
  const getWisdom = () => {
    return ralphQuotes[Math.floor(Math.random() * ralphQuotes.length)];
  };

  /**
   * Standard Ralph Loop - "I'm looping!"
   * Executes callback for each item with Ralph's encouragement
   */
  const chooChooLoop = (items, callback) => {
    console.log("🚂 Ralph says: 'I choo-choo-choose to loop!'");
    items.forEach((item, index) => {
      if (index === Math.floor(items.length / 2)) {
        console.log(`💭 Ralph's thought: "${getWisdom()}"`);
      }
      callback(item, index);
    });
    console.log("🎉 Ralph says: 'I'm a looping star!'");
  };

  /**
   * Learnding Loop - "I'm learnding!"
   * Like map(), but with educational commentary
   */
  const learnding = (items, callback) => {
    console.log("📚 Ralph says: 'I'm learnding loops!'");
    const results = [];
    for (let i = 0; i < items.length; i++) {
      results.push(callback(items[i], i));
      if (Math.random() > 0.7) {
        console.log(`📝 Lesson ${i + 1}: "${getWisdom()}"`);
      }
    }
    return results;
  };

  /**
   * Unpossible Loop - handles errors Ralph-style
   * Wraps async operations with optimistic error handling
   */
  const unpossibleLoop = async (items, asyncCallback) => {
    console.log("🌟 Ralph says: 'Errors? That's unpossible!'");
    const results = [];

    for (const item of items) {
      try {
        const result = await asyncCallback(item);
        results.push({ success: true, value: result });
      } catch (error) {
        console.log(`🔥 Ralph says: "It tastes like burning!" (Error: ${error.message})`);
        results.push({ success: false, error: error.message, ralphAdvice: getWisdom() });
      }
    }

    return results;
  };

  /**
   * Nose Picker Loop - randomly skips items
   * Because Ralph doesn't always pay attention
   */
  const nosePickerLoop = (items, callback, attentionSpan = 0.7) => {
    console.log("👃 Ralph says: 'I found a moon rock in my nose!'");
    const processed = [];

    items.forEach((item, index) => {
      if (Math.random() < attentionSpan) {
        callback(item, index);
        processed.push(item);
      } else {
        console.log(`😴 Ralph got distracted at index ${index}...`);
      }
    });

    console.log(`✅ Ralph processed ${processed.length}/${items.length} items!`);
    return processed;
  };

  /**
   * Super Nintendo Chalmers Loop - authority figure approved
   * Validates items before processing
   */
  const superNintendoLoop = (items, validator, callback) => {
    console.log("👨‍💼 Ralph says: 'Hi, Super Nintendo Chalmers!'");
    const approved = [];
    const rejected = [];

    items.forEach((item, index) => {
      if (validator(item)) {
        callback(item, index);
        approved.push(item);
      } else {
        rejected.push(item);
        console.log(`❌ Super Nintendo Chalmers rejected item ${index}`);
      }
    });

    return { approved, rejected };
  };

  /**
   * Leprechaun Loop - the dangerous one
   * Executes callback with increasing intensity
   */
  const leprechaunLoop = (items, callback, maxIntensity = 10) => {
    console.log("🍀 Ralph says: 'The leprechaun tells me to loop things!'");

    items.forEach((item, index) => {
      const intensity = Math.min(index + 1, maxIntensity);
      console.log(`🔥 Intensity level: ${intensity}`);

      for (let i = 0; i < intensity; i++) {
        callback(item, index, i);
      }
    });

    console.log("🧯 Leprechaun loop complete. Please extinguish any fires.");
  };

  /**
   * Idaho Loop - transforms items into something else entirely
   * Like reduce, but more confused about identity
   */
  const idahoLoop = (items, transformer, initialState = "I'm Idaho!") => {
    console.log("🥔 Ralph says: 'I'm Idaho!'");

    let state = initialState;
    items.forEach((item, index) => {
      const previousState = state;
      state = transformer(state, item, index);
      console.log(`🔄 Was: "${previousState}" → Now: "${state}"`);
    });

    console.log(`🎭 Final identity: "${state}"`);
    return state;
  };

  /**
   * Wookiee Loop - bent iteration
   * Processes items in a non-linear order
   */
  const bentWookieeLoop = (items, callback) => {
    console.log("🐻 Ralph says: 'I bent my Wookiee!'");

    // Create a "bent" order - middle first, then alternating ends
    const bentOrder = [];
    const mid = Math.floor(items.length / 2);
    bentOrder.push(mid);

    for (let i = 1; i <= mid; i++) {
      if (mid + i < items.length) bentOrder.push(mid + i);
      if (mid - i >= 0) bentOrder.push(mid - i);
    }

    bentOrder.forEach((originalIndex, bentIndex) => {
      console.log(`📍 Bent position ${bentIndex} → Original index ${originalIndex}`);
      callback(items[originalIndex], originalIndex, bentIndex);
    });
  };

  /**
   * Cat Food Loop - processes until a condition smells right
   * Like a while loop with aromatic callbacks
   */
  const catFoodLoop = (condition, callback, maxIterations = 100) => {
    console.log("🐱 Ralph says: 'My cat's breath smells like cat food.'");

    let iterations = 0;
    let smellLevel = 0;

    while (condition(iterations, smellLevel) && iterations < maxIterations) {
      smellLevel = callback(iterations);
      iterations++;

      if (iterations % 10 === 0) {
        console.log(`👃 Smell check at iteration ${iterations}: Level ${smellLevel}`);
      }
    }

    console.log(`🏁 Loop ended after ${iterations} iterations. Final smell level: ${smellLevel}`);
    return { iterations, smellLevel };
  };

  // Export Ralph's wisdom
  return {
    chooChooLoop,
    learnding,
    unpossibleLoop,
    nosePickerLoop,
    superNintendoLoop,
    leprechaunLoop,
    idahoLoop,
    bentWookieeLoop,
    catFoodLoop,
    getWisdom,
    quotes: ralphQuotes
  };
})();

// Example usage and demo
const runDemo = () => {
  console.log("\n" + "=".repeat(60));
  console.log("🎬 RALPH WIGGUM LOOP FRAMEWORK DEMO");
  console.log("=".repeat(60) + "\n");

  const testItems = ["apple", "banana", "cherry", "donut", "eclair"];

  // Demo: Choo-Choo Loop
  console.log("\n--- Choo-Choo Loop Demo ---");
  RalphWiggumLoop.chooChooLoop(testItems, (item, i) => {
    console.log(`  Processing: ${item}`);
  });

  // Demo: Learnding
  console.log("\n--- Learnding Demo ---");
  const learned = RalphWiggumLoop.learnding([1, 2, 3, 4, 5], (n) => n * n);
  console.log("  Learned results:", learned);

  // Demo: Nose Picker
  console.log("\n--- Nose Picker Loop Demo ---");
  RalphWiggumLoop.nosePickerLoop(testItems, (item) => {
    console.log(`  Picked: ${item}`);
  }, 0.6);

  // Demo: Idaho (Reduce)
  console.log("\n--- Idaho Loop Demo ---");
  RalphWiggumLoop.idahoLoop(
    ["a", "b", "c"],
    (state, item) => state + item,
    ""
  );

  // Demo: Bent Wookiee
  console.log("\n--- Bent Wookiee Loop Demo ---");
  RalphWiggumLoop.bentWookieeLoop([1, 2, 3, 4, 5], (item, origIdx, bentIdx) => {
    console.log(`  Item ${item} (original: ${origIdx}, bent: ${bentIdx})`);
  });

  console.log("\n" + "=".repeat(60));
  console.log(`🌟 Random Ralph Wisdom: "${RalphWiggumLoop.getWisdom()}"`);
  console.log("=".repeat(60) + "\n");
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RalphWiggumLoop, runDemo };
}

// Run demo if executed directly
if (typeof window === 'undefined' && require.main === module) {
  runDemo();
}
