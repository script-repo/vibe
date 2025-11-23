# 3D Graphics Learning Path

**Duration:** 3-4 weeks
**Difficulty:** Intermediate to Advanced
**Prerequisites:**
- Completed [Web Fundamentals Path](./web-fundamentals.md)
- Solid JavaScript and Canvas 2D knowledge
- Basic understanding of linear algebra (vectors, matrices)

---

## Overview

This path takes you from CSS 3D transforms to advanced WebGL shaders and Three.js applications. You'll learn how to create stunning 3D experiences that run entirely in the browser, all within single-file applications under 1MB.

---

## Learning Objectives

By the end of this path, you will:

- Master CSS 3D transforms for simple 3D effects
- Build complex 3D scenes with Three.js
- Write custom WebGL shaders (GLSL)
- Generate procedural 3D content (terrains, planets, trees)
- Optimize 3D performance for smooth 60fps
- Create interactive 3D experiences
- Understand when to use Three.js vs raw WebGL

---

## Week 1: CSS 3D & Three.js Basics

### Day 1-2: CSS 3D Transforms
**Focus:** Creating 3D effects with pure CSS

**Topics:**
- `transform: perspective()` and `transform-style: preserve-3d`
- rotateX, rotateY, rotateZ
- translate3d and scale3d
- Backface visibility
- 3D card flips and carousels

**Reference:** [../reference/3d-capabilities.md](../reference/3d-capabilities.md) (CSS 3D section)

**Practice:**
- Create a 3D rotating cube with CSS
- Build a card flip animation
- Implement a 3D carousel

**Key Insight:** CSS 3D is perfect for UI elements, but limited for complex scenes.

---

### Day 3-5: Three.js Fundamentals
**Focus:** Core concepts of 3D rendering

**Topics:**
- Scene, Camera, Renderer setup
- Geometries (Box, Sphere, Plane, Custom)
- Materials (Basic, Phong, Standard, Custom)
- Lighting (Ambient, Directional, Point, Spot)
- Animation loop with requestAnimationFrame
- OrbitControls for camera movement

**Reference:** [../reference/3d-capabilities.md](../reference/3d-capabilities.md) (Three.js section)

**Practice:**
- Set up basic Three.js scene
- Create a solar system with orbiting planets
- Add lighting and shadows
- Implement camera controls

**Code Structure:**
```javascript
// Essential Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  // Update objects
  renderer.render(scene, camera);
}
```

**Examples:**
- [../examples/11-3d-product-configurator.html](../examples/11-3d-product-configurator.html)
- [../examples/13-weather-globe.html](../examples/13-weather-globe.html)

---

### Day 6-7: Materials & Textures
**Focus:** Making objects look realistic

**Topics:**
- PBR (Physically Based Rendering) materials
- Texture mapping (color, normal, roughness, metalness)
- Environment maps for reflections
- Procedural textures vs image textures
- UV mapping basics

**Reference:** [../reference/3d-capabilities.md](../reference/3d-capabilities.md) (Materials section)

**Practice:**
- Create materials without texture files
- Use CanvasTexture for dynamic textures
- Implement environment reflections
- Build a material previewer

**Size Optimization:** Procedural textures = 0KB vs image textures = 50-500KB

---

## Week 2: Procedural Generation

### Day 8-10: Noise Functions & Terrain
**Focus:** Generating natural-looking randomness

**Topics:**
- Perlin noise algorithm
- Simplex noise (improved Perlin)
- Multi-octave noise (layering frequencies)
- Terrain generation from heightmaps
- Biome-based coloring

**Reference:** [../reference/3d-capabilities.md](../reference/3d-capabilities.md) (Procedural Generation section)

**Practice:**
- Implement Perlin noise from scratch
- Generate infinite terrain
- Create realistic mountain ranges
- Add texture based on height (snow, rock, grass)

**Key Algorithm:**
```javascript
// Multi-octave noise
function octaveNoise(x, y, octaves = 4) {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    value += noise(x * frequency, y * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= 0.5;  // Each octave has half the amplitude
    frequency *= 2;    // Each octave has double the frequency
  }

  return value / maxValue;
}
```

**Examples:**
- [../examples/26-procedural-3d-generation.html](../examples/26-procedural-3d-generation.html)

**Snippet:** See [../snippets/noise-functions.js](../snippets/noise-functions.js)

---

### Day 11-12: Procedural Models
**Focus:** Generating 3D objects from code

**Topics:**
- Tree generation (L-systems or parametric)
- Building generation (extrusion, randomization)
- Rock/asteroid generation (sphere deformation)
- Planet generation (icosahedron subdivision)
- Organic shapes with noise

**Practice:**
- Create a procedural tree generator
- Build a random city generator
- Generate realistic planets
- Create a procedural forest scene

**Benefits:**
- File size: ~5KB code generates unlimited content
- Variation: Every generation is unique
- Performance: Generate once, render many times

---

### Day 13-14: Advanced Geometries
**Focus:** Custom geometry creation

**Topics:**
- BufferGeometry for efficiency
- Vertex positions, normals, UVs
- Parametric surfaces
- Extrusion and lathe geometries
- Merging geometries for performance

**Practice:**
- Create custom geometry from equations
- Build a terrain mesh from heightmap
- Optimize geometry with BufferGeometry
- Implement level-of-detail (LOD)

---

## Week 3: WebGL & Shaders

### Day 15-17: WebGL Fundamentals
**Focus:** Understanding the graphics pipeline

**Topics:**
- WebGL context and setup
- Vertex shaders (transform vertices)
- Fragment shaders (color pixels)
- Shader uniforms and attributes
- Drawing with drawArrays/drawElements
- Buffer management

**Reference:** [../reference/graphics.md](../reference/graphics.md) (WebGL section)

**Practice:**
- Render a triangle with raw WebGL
- Create a simple particle system
- Implement mouse interaction
- Build a fullscreen shader effect

**Why Learn Raw WebGL:**
- Understanding how Three.js works under the hood
- Ultimate performance control
- Smallest possible file size for simple effects
- Custom rendering pipelines

**Examples:**
- [../examples/05-webgl-particle-universe.html](../examples/05-webgl-particle-universe.html) (35KB!)
- [../examples/25-webgl-particle-universe.html](../examples/25-webgl-particle-universe.html)

---

### Day 18-20: GLSL Shader Programming
**Focus:** Writing GPU programs for visual effects

**Topics:**
- GLSL syntax and types (vec2, vec3, vec4, mat4)
- Built-in functions (sin, cos, mix, smoothstep)
- UV coordinates and texture sampling
- Time-based animations
- Color manipulation
- Noise in shaders

**Reference:** [../reference/graphics.md](../reference/graphics.md) (Shaders section)

**Practice:**
- Write animated gradient shaders
- Create wave distortion effects
- Implement custom lighting models
- Build a shader toy effect

**Example Shader:**
```glsl
// Fragment shader for animated gradient
void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  vec3 color = 0.5 + 0.5 * cos(time + uv.xyx + vec3(0, 2, 4));
  gl_FragColor = vec4(color, 1.0);
}
```

**Examples:**
- [../examples/47-webgl-shader-effects.html](../examples/47-webgl-shader-effects.html)
- [../examples/12-image-filter-studio.html](../examples/12-image-filter-studio.html)

**Snippet:** See [../snippets/shader-library.glsl](../snippets/shader-library.glsl)

---

### Day 21: Custom Three.js Shaders
**Focus:** Integrating custom shaders with Three.js

**Topics:**
- ShaderMaterial in Three.js
- Passing uniforms from JavaScript
- Custom vertex and fragment shaders
- Post-processing effects
- Shader debugging techniques

**Practice:**
- Replace standard materials with custom shaders
- Create custom atmosphere shader
- Implement water with shader animation
- Build a hologram effect

---

## Week 4: Advanced 3D Applications

### Day 22-24: Interactive 3D Applications
**Focus:** User interaction with 3D scenes

**Topics:**
- Raycasting for object picking
- Mouse/touch input in 3D space
- Dragging 3D objects
- Camera controls (orbit, first-person, fly)
- 3D UI elements
- Performance optimization for interaction

**Practice:**
- Build a 3D product configurator
- Create an interactive globe
- Implement object manipulation (move, rotate, scale)
- Add tooltips to 3D objects

**Examples:**
- [../examples/11-3d-product-configurator.html](../examples/11-3d-product-configurator.html)
- [../examples/13-weather-globe.html](../examples/13-weather-globe.html)
- [../examples/42-weather-globe.html](../examples/42-weather-globe.html)

---

### Day 25-26: Particle Systems
**Focus:** Creating effects with thousands of particles

**Topics:**
- GPU particle systems
- Points and PointsMaterial
- Custom particle shaders
- Physics simulation (gravity, collision)
- Particle emitters and life cycles

**Reference:** [../reference/graphics.md](../reference/graphics.md) (Particle Systems)

**Practice:**
- Create a galaxy simulation
- Build a fireworks effect
- Implement particle trails
- Create smoke/fire effects

**Performance Target:** 10,000+ particles at 60fps

**Examples:**
- [../examples/05-webgl-particle-universe.html](../examples/05-webgl-particle-universe.html)
- [../examples/46-canvas-particle-systems.html](../examples/46-canvas-particle-systems.html)

---

### Day 27-28: Performance Optimization
**Focus:** Achieving 60fps on all devices

**Topics:**
- Draw call reduction (geometry merging)
- Frustum culling
- Level of Detail (LOD)
- Texture compression and mipmaps
- Instanced rendering
- GPU profiling and bottleneck identification
- Memory management

**Reference:** [../reference/3d-capabilities.md](../reference/3d-capabilities.md) (Performance section)

**Practice:**
- Profile a complex scene
- Reduce draw calls from 1000 to 10
- Implement LOD for distant objects
- Optimize shader complexity

**Performance Checklist:**
- [ ] < 100 draw calls
- [ ] Reuse geometries and materials
- [ ] Use BufferGeometry
- [ ] Implement frustum culling
- [ ] Add LOD for complex scenes
- [ ] Monitor FPS and memory

---

## Capstone Projects

Choose one advanced project:

### Option 1: Procedural Planet Explorer
Create an interactive space scene with:
- Multiple procedurally generated planets
- Realistic atmosphere shaders
- Orbital mechanics
- Camera fly-through
- Click to explore planets
- Starfield background

**Skills Used:** Procedural generation, shaders, interaction, particle systems

---

### Option 2: 3D Data Visualization
Build a dynamic 3D chart system:
- Multiple chart types (bars, lines, scatter)
- Real-time data updates
- Interactive tooltips
- Camera controls
- Export as image

**Skills Used:** Custom geometries, raycasting, animation, optimization

---

### Option 3: WebGL Art Gallery
Create a virtual gallery with:
- 3D space with walls and floor
- Framed artwork on walls
- First-person camera controls
- Lighting and shadows
- Reflection floor

**Skills Used:** Three.js, lighting, controls, materials, optimization

---

## Skills Assessment Checklist

After completing this path, you should be able to:

**CSS 3D:**
- [ ] Create 3D UI elements with transforms
- [ ] Implement 3D transitions and animations
- [ ] Understand perspective and transform-style

**Three.js:**
- [ ] Set up scenes, cameras, and renderers
- [ ] Create and manipulate 3D objects
- [ ] Apply materials and lighting
- [ ] Implement camera controls
- [ ] Handle user interaction with raycasting

**Procedural Generation:**
- [ ] Implement noise functions
- [ ] Generate terrains and landscapes
- [ ] Create procedural 3D models
- [ ] Optimize procedural content

**WebGL & Shaders:**
- [ ] Write vertex and fragment shaders
- [ ] Create custom visual effects
- [ ] Understand the graphics pipeline
- [ ] Integrate shaders with Three.js

**Performance:**
- [ ] Profile 3D applications
- [ ] Reduce draw calls
- [ ] Implement LOD systems
- [ ] Optimize for 60fps

---

## Next Steps

After mastering 3D graphics, continue to:

1. **[Architecture Path](./architecture-path.md)** - Build extensible 3D applications
2. **[AI Integration Path](./ai-integration-path.md)** - Add AI to generate 3D content
3. **Advanced Topics:** Physics engines, VR/AR with WebXR

---

## Resources

### Documentation
- [Three.js Documentation](https://threejs.org/docs/)
- [WebGL Fundamentals](https://webglfundamentals.org/)
- [The Book of Shaders](https://thebookofshaders.com/)
- [Shadertoy](https://www.shadertoy.com/) - Shader examples

### Tools
- [Three.js Editor](https://threejs.org/editor/)
- Chrome DevTools 3D View
- [Spector.js](https://spector.babylonjs.com/) - WebGL debugger

### Reference Files
- [3d-capabilities.md](../reference/3d-capabilities.md) - Complete 3D documentation
- [graphics.md](../reference/graphics.md) - Graphics techniques including WebGL

### Learning Resources
- [Discover Three.js](https://discoverthreejs.com/)
- [WebGL2 Fundamentals](https://webgl2fundamentals.org/)

---

## Tips for Success

1. **Start with Three.js** - Don't jump straight to raw WebGL
2. **Visualize math** - Use console.log and visual debugging
3. **Small steps** - One feature at a time
4. **Study examples** - Learn from working code
5. **Profile early** - Keep performance in mind from the start
6. **Procedural > Files** - Generate content instead of loading assets
7. **Understand shaders** - They're not as scary as they look
8. **Test on mobile** - 3D can be demanding

---

## Common Pitfalls

- **Over-engineering:** Don't use Three.js for simple 2D effects
- **Too many draw calls:** Merge geometries when possible
- **Large textures:** Use procedural generation or compress images
- **No error handling:** WebGL context can be lost
- **Ignoring mobile:** Test performance on low-end devices
- **Skipping basics:** Understand the fundamentals before advanced topics

---

**Remember:** 3D graphics is about balancing visual quality with performance. Always profile, always optimize, and always consider file size. The goal is stunning visuals in minimal bytes.

Happy rendering! 🎨
