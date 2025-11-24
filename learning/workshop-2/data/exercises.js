// ========================================
// 3D Graphics Workshop Exercises Data
// This module contains all exercise data for mastering 3D graphics on the web
// ========================================

const exercises = [
  // ========================================
  // Exercise 1.1: CSS 3D Card
  // ========================================
  {
    title: "CSS 3D Card",

    preamble: `
      <div class="preamble">
        <h3>Welcome to 3D Graphics on the Web!</h3>
        <p>In this first exercise, you'll learn how to create 3D transformations using pure CSS. No external libraries needed - just the power of CSS 3D transforms!</p>

        <div class="key-concepts">
          <h4>Key Concepts You'll Learn:</h4>
          <ul>
            <li><strong>perspective</strong>: Creates depth and 3D space for child elements</li>
            <li><strong>transform-style: preserve-3d</strong>: Maintains 3D positioning of nested elements</li>
            <li><strong>transform: rotateX/Y/Z</strong>: Rotates elements in 3D space</li>
            <li><strong>backface-visibility</strong>: Controls visibility of the back of an element</li>
            <li><strong>transition</strong>: Smoothly animates 3D transformations</li>
          </ul>
        </div>

        <div class="common-pitfalls">
          <h4>Common Pitfalls to Avoid:</h4>
          <ul>
            <li>Forgetting to set <code>perspective</code> on the parent container</li>
            <li>Not using <code>transform-style: preserve-3d</code> for nested 3D elements</li>
            <li>Mixing 2D and 3D transforms incorrectly</li>
            <li>Not considering the transform-origin when rotating</li>
          </ul>
        </div>

        <p><em>Prerequisites:</em> Basic CSS knowledge. We'll build up your 3D skills step by step!</p>
      </div>
    `,

    description: "Create a 3D flip card using CSS transforms. Learn perspective, 3D rotations, and how to create depth with pure CSS.",

    objectives: [
      "Understand and apply CSS perspective",
      "Use transform-style: preserve-3d for 3D contexts",
      "Create 3D rotations with rotateX, rotateY, rotateZ",
      "Build an interactive flip card with front and back faces",
      "Apply smooth transitions to 3D transforms"
    ],

    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3D Flip Card</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .card-container {
      /* TODO: Add perspective for 3D effect */
      /* Hint: perspective: 1000px; */
      width: 300px;
      height: 400px;
    }

    .card {
      width: 100%;
      height: 100%;
      position: relative;
      /* TODO: Add transform-style to preserve 3D */
      /* TODO: Add transition for smooth animation */
      cursor: pointer;
    }

    .card:hover {
      /* TODO: Add 3D rotation on hover */
      /* Hint: transform: rotateY(180deg); */
    }

    .card-face {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 700;
    }

    .card-front {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .card-back {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      /* TODO: Rotate back face 180deg initially */
      /* Hint: transform: rotateY(180deg); */
    }
  </style>
</head>
<body>
  <div class="card-container">
    <div class="card">
      <div class="card-face card-front">
        Front
      </div>
      <div class="card-face card-back">
        Back
      </div>
    </div>
  </div>
</body>
</html>`,

    solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3D Flip Card</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .card-container {
      perspective: 1000px;
      width: 300px;
      height: 400px;
    }

    .card {
      width: 100%;
      height: 100%;
      position: relative;
      transform-style: preserve-3d;
      transition: transform 0.8s;
      cursor: pointer;
    }

    .card:hover {
      transform: rotateY(180deg);
    }

    .card-face {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 700;
    }

    .card-front {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .card-back {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      transform: rotateY(180deg);
    }
  </style>
</head>
<body>
  <div class="card-container">
    <div class="card">
      <div class="card-face card-front">
        Front
      </div>
      <div class="card-face card-back">
        Back
      </div>
    </div>
  </div>
</body>
</html>`,

    hint: "Set perspective: 1000px on the container, transform-style: preserve-3d on the card, and rotate the card with transform: rotateY(180deg) on hover. Don't forget to rotate the back face 180deg initially!",

    validation: (code) => {
      return code.includes('perspective') &&
        code.includes('transform-style: preserve-3d') &&
        code.includes('rotateY');
    }
  },

  // ========================================
  // Exercise 1.2: 3D Cube Rotation
  // ========================================
  {
    title: "3D Cube Rotation",

    preamble: `
      <div class="preamble">
        <h3>Building a 3D Cube with CSS</h3>
        <p>Now let's level up by creating a full 3D cube that rotates continuously. This exercise teaches you how to position multiple faces in 3D space and create smooth animations.</p>

        <div class="key-concepts">
          <h4>Key Concepts You'll Learn:</h4>
          <ul>
            <li><strong>translateZ</strong>: Moves elements along the Z-axis (toward/away from viewer)</li>
            <li><strong>Multiple 3D Transforms</strong>: Combining rotations and translations</li>
            <li><strong>@keyframes</strong>: Creating CSS animations</li>
            <li><strong>animation</strong>: Applying and controlling animations</li>
            <li><strong>3D Positioning</strong>: Placing elements in 3D space</li>
          </ul>
        </div>

        <div class="common-pitfalls">
          <h4>Common Pitfalls to Avoid:</h4>
          <ul>
            <li>Incorrect translateZ distance (should be half the cube size)</li>
            <li>Forgetting to rotate faces before translating them</li>
            <li>Not centering the cube properly</li>
            <li>Animation running too fast or too slow</li>
          </ul>
        </div>

        <p><em>Tip:</em> Visualize each face of the cube and how it needs to be rotated and positioned!</p>
      </div>
    `,

    description: "Create a 3D cube with 6 faces that rotates continuously. Learn how to position elements in 3D space and create smooth animations.",

    objectives: [
      "Build a 3D cube with 6 faces",
      "Position faces using translateZ and rotate",
      "Create continuous rotation animation with @keyframes",
      "Combine multiple 3D transforms",
      "Apply smooth, infinite animations"
    ],

    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rotating 3D Cube</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1e3a8a 0%, #1e293b 100%);
    }

    .scene {
      perspective: 1000px;
    }

    .cube {
      width: 200px;
      height: 200px;
      position: relative;
      transform-style: preserve-3d;
      /* TODO: Add animation */
      /* Hint: animation: rotate 10s infinite linear; */
    }

    /* TODO: Create @keyframes for rotation */
    /* Hint: Rotate on X and Y axes */

    .cube-face {
      position: absolute;
      width: 200px;
      height: 200px;
      border: 2px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      font-weight: 700;
      color: white;
      opacity: 0.9;
    }

    .front  { background: rgba(255, 0, 0, 0.7); }
    .back   { background: rgba(0, 255, 0, 0.7); }
    .right  { background: rgba(0, 0, 255, 0.7); }
    .left   { background: rgba(255, 255, 0, 0.7); }
    .top    { background: rgba(255, 0, 255, 0.7); }
    .bottom { background: rgba(0, 255, 255, 0.7); }

    /* TODO: Position each face using rotateY/X and translateZ */
    /* Front face already positioned as example */
    .front  { transform: rotateY(0deg) translateZ(100px); }
    /* TODO: Position other 5 faces */
  </style>
</head>
<body>
  <div class="scene">
    <div class="cube">
      <div class="cube-face front">1</div>
      <div class="cube-face back">2</div>
      <div class="cube-face right">3</div>
      <div class="cube-face left">4</div>
      <div class="cube-face top">5</div>
      <div class="cube-face bottom">6</div>
    </div>
  </div>
</body>
</html>`,

    solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rotating 3D Cube</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1e3a8a 0%, #1e293b 100%);
    }

    .scene {
      perspective: 1000px;
    }

    .cube {
      width: 200px;
      height: 200px;
      position: relative;
      transform-style: preserve-3d;
      animation: rotate 10s infinite linear;
    }

    @keyframes rotate {
      from {
        transform: rotateX(0deg) rotateY(0deg);
      }
      to {
        transform: rotateX(360deg) rotateY(360deg);
      }
    }

    .cube-face {
      position: absolute;
      width: 200px;
      height: 200px;
      border: 2px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      font-weight: 700;
      color: white;
      opacity: 0.9;
    }

    .front  { background: rgba(255, 0, 0, 0.7); }
    .back   { background: rgba(0, 255, 0, 0.7); }
    .right  { background: rgba(0, 0, 255, 0.7); }
    .left   { background: rgba(255, 255, 0, 0.7); }
    .top    { background: rgba(255, 0, 255, 0.7); }
    .bottom { background: rgba(0, 255, 255, 0.7); }

    .front  { transform: rotateY(0deg) translateZ(100px); }
    .back   { transform: rotateY(180deg) translateZ(100px); }
    .right  { transform: rotateY(90deg) translateZ(100px); }
    .left   { transform: rotateY(-90deg) translateZ(100px); }
    .top    { transform: rotateX(90deg) translateZ(100px); }
    .bottom { transform: rotateX(-90deg) translateZ(100px); }
  </style>
</head>
<body>
  <div class="scene">
    <div class="cube">
      <div class="cube-face front">1</div>
      <div class="cube-face back">2</div>
      <div class="cube-face right">3</div>
      <div class="cube-face left">4</div>
      <div class="cube-face top">5</div>
      <div class="cube-face bottom">6</div>
    </div>
  </div>
</body>
</html>`,

    hint: "Each face needs to be rotated to face the right direction, then translated out by half the cube size (100px). Use rotateY for left/right faces, rotateX for top/bottom. Create a @keyframes animation that rotates on both X and Y axes.",

    validation: (code) => {
      return code.includes('@keyframes') &&
        code.includes('animation') &&
        code.includes('translateZ') &&
        code.includes('rotateX') &&
        code.includes('rotateY');
    }
  },

  // Exercise 2.1: Three.js Scene
  {
    title: "Three.js Scene Setup",

    preamble: `
      <div class="preamble">
        <h3>Introduction to Three.js</h3>
        <p>Three.js is the most popular 3D library for the web. It provides a powerful, easy-to-use API for creating and displaying 3D graphics. Let's set up your first scene!</p>

        <div class="key-concepts">
          <h4>Key Concepts You'll Learn:</h4>
          <ul>
            <li><strong>Scene</strong>: The container for all 3D objects</li>
            <li><strong>Camera</strong>: The viewpoint from which we see the scene</li>
            <li><strong>Renderer</strong>: Renders the scene to the canvas</li>
            <li><strong>Geometry</strong>: The shape of 3D objects</li>
            <li><strong>Material</strong>: The surface appearance of objects</li>
            <li><strong>Mesh</strong>: Combines geometry and material into a renderable object</li>
          </ul>
        </div>
      </div>
    `,

    description: "Set up a basic Three.js scene with a camera, renderer, and a rotating cube. This is the foundation for all Three.js projects.",

    objectives: [
      "Import and initialize Three.js",
      "Create a scene, camera, and renderer",
      "Add a basic cube geometry",
      "Implement an animation loop",
      "Render the scene continuously"
    ],

    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Three.js Scene</title>
  <style>
    body { margin: 0; overflow: hidden; }
    canvas { display: block; }
  </style>
</head>
<body>
  <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
  <script>
    // TODO: Create scene, camera, and renderer
    // Hint: const scene = new THREE.Scene();
    
    // TODO: Create a cube geometry and material
    // Hint: new THREE.BoxGeometry(1, 1, 1)
    
    // TODO: Create animation loop to rotate and render
    function animate() {
      requestAnimationFrame(animate);
      // TODO: Rotate cube
      // TODO: Render scene
    }
    
    // animate();
  </script>
</body>
</html>`,

    solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Three.js Scene</title>
  <style>
    body { margin: 0; overflow: hidden; }
    canvas { display: block; }
  </style>
</head>
<body>
  <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
  <script>
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    
    camera.position.z = 5;
    
    function animate() {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    }
    
    animate();
  </script>
</body>
</html>`,

    hint: "Create a scene, camera, and renderer. Add a BoxGeometry with a MeshBasicMaterial. In the animate function, rotate the cube and call renderer.render(scene, camera).",

    validation: (code) => {
      return code.includes('THREE.Scene') &&
        code.includes('THREE.PerspectiveCamera') &&
        code.includes('THREE.WebGLRenderer') &&
        code.includes('requestAnimationFrame');
    }
  },

  // Remaining exercises (simplified for brevity)
  {
    title: "3D Materials & Lighting",
    preamble: `<div class="preamble"><h3>Adding Lights and Materials</h3><p>Learn how to add realistic lighting and materials to your 3D scenes.</p></div>`,
    description: "Add lights and advanced materials to create realistic 3D objects.",
    objectives: ["Add directional and ambient lights", "Use MeshStandardMaterial", "Understand light and shadow"],
    starterCode: `<!DOCTYPE html>
<html><head><title>Lights</title><style>body{margin:0}</style></head><body>
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
<script>
// TODO: Add lights and better materials
</script></body></html>`,
    solution: `<!DOCTYPE html>
<html><head><title>Lights</title><style>body{margin:0}</style></head><body>
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
<script>
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const geometry = new THREE.SphereGeometry(1, 32, 32);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, metalness: 0.5, roughness: 0.5 });
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);
camera.position.z = 5;

function animate() {
  requestAnimationFrame(animate);
  sphere.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
</script></body></html>`,
    hint: "Add AmbientLight and DirectionalLight, then use MeshStandardMaterial for physically-based rendering.",
    validation: (code) => code.includes('Light') && code.includes('MeshStandardMaterial')
  },

  {
    title: "Complex Geometries",
    preamble: `<div class="preamble"><h3>Advanced Shapes</h3><p>Create complex 3D shapes using Three.js geometries.</p></div>`,
    description: "Work with various Three.js geometries like spheres, toruses, and custom shapes.",
    objectives: ["Create multiple geometries", "Group objects together", "Manipulate complex shapes"],
    starterCode: `<!DOCTYPE html>
<html><body><script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
<script>// TODO: Create multiple geometries</script></body></html>`,
    solution: `<!DOCTYPE html>
<html><body><script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
<script>
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

const group = new THREE.Group();
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), new THREE.MeshStandardMaterial({color: 0xff0000}));
const torus = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.2, 16, 100), new THREE.MeshStandardMaterial({color: 0x00ff00}));
torus.rotation.x = Math.PI / 2;
group.add(sphere, torus);
scene.add(group);
camera.position.z = 5;

function animate() {
  requestAnimationFrame(animate);
  group.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
</script></body></html>`,
    hint: "Use Group to combine multiple geometries. Try SphereGeometry, TorusGeometry, and others.",
    validation: (code) => code.includes('Group') && code.includes('Geometry')
  },

  {
    title: "Camera Controls",
    preamble: `<div class="preamble"><h3>Interactive Camera</h3><p>Add orbit controls for interactive 3D viewing.</p></div>`,
    description: "Implement OrbitControls to allow users to rotate, zoom, and pan the camera.",
    objectives: ["Add OrbitControls", "Enable mouse interaction", "Control camera movement"],
    starterCode: `<!DOCTYPE html>
<html><body><script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
<script type="module">
// TODO: Import and add OrbitControls
</script></body></html>`,
    solution: `<!DOCTYPE html>
<html><body><script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
<script type="module">
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const geometry = new THREE.BoxGeometry(2, 2, 2);
const material = new THREE.MeshNormalMaterial();
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
camera.position.z = 5;

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
</script></body></html>`,
    hint: "Import OrbitControls from the examples/jsm folder and pass the camera and renderer.domElement to it.",
    validation: (code) => code.includes('OrbitControls') && code.includes('import')
  },

  {
    title: "Procedural Terrain",
    preamble: `<div class="preamble"><h3>Generate 3D Terrain</h3><p>Create procedural terrain using PlaneGeometry and vertex manipulation.</p></div>`,
    description: "Generate a 3D terrain landscape using noise functions and vertex displacement.",
    objectives: ["Create a plane geometry", "Manipulate vertices", "Add height variation", "Apply materials"],
    starterCode: `<!DOCTYPE html>
<html><body><script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
<script>// TODO: Create terrain with vertex manipulation</script></body></html>`,
    solution: `<!DOCTYPE html>
<html><body><script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
<script>
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 10, 0);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

const geometry = new THREE.PlaneGeometry(20, 20, 50, 50);
const vertices = geometry.attributes.position;
for (let i = 0; i < vertices.count; i++) {
  const x = vertices.getX(i);
  const y = vertices.getY(i);
  vertices.setZ(i, Math.sin(x * 0.5) * Math.cos(y * 0.5) * 2);
}
geometry.computeVertexNormals();

const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, wireframe: false });
const terrain = new THREE.Mesh(geometry, material);
terrain.rotation.x = -Math.PI / 2;
scene.add(terrain);

camera.position.set(0, 10, 15);
camera.lookAt(0, 0, 0);

function animate() {
  requestAnimationFrame(animate);
  terrain.rotation.z += 0.001;
  renderer.render(scene, camera);
}
animate();
</script></body></html>`,
    hint: "Use PlaneGeometry with many segments, then modify the Z coordinates of vertices using Math.sin and Math.cos for wave patterns.",
    validation: (code) => code.includes('PlaneGeometry') && code.includes('vertices') && code.includes('setZ')
  },

  {
    title: "3D Particle Galaxy",
    preamble: `<div class="preamble"><h3>Create a Particle System</h3><p>Build a stunning 3D particle galaxy using Points and BufferGeometry.</p></div>`,
    description: "Create a beautiful rotating particle galaxy with thousands of stars.",
    objectives: ["Create particle system", "Use BufferGeometry", "Add colors to particles", "Animate particles"],
    starterCode: `<!DOCTYPE html>
<html><body><script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
<script>// TODO: Create particle galaxy</script></body></html>`,
    solution: `<!DOCTYPE html>
<html><body style="margin:0"><script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
<script>
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 5000;
const posArray = new Float32Array(particlesCount * 3);
const colorsArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
  posArray[i] = (Math.random() - 0.5) * 100;
  colorsArray[i] = Math.random();
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
  size: 0.3,
  vertexColors: true,
  transparent: true,
  opacity: 0.8
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

camera.position.z = 50;

function animate() {
  requestAnimationFrame(animate);
  particlesMesh.rotation.y += 0.001;
  particlesMesh.rotation.x += 0.0005;
  renderer.render(scene, camera);
}
animate();
</script></body></html>`,
    hint: "Create a BufferGeometry, populate it with random positions using Float32Array, and render with Points and PointsMaterial.",
    validation: (code) => code.includes('BufferGeometry') && code.includes('Points') && code.includes('Float32Array')
  }
];

// Workshop summary data
const workshopSummary = {
  message: "Congratulations! You've mastered 3D graphics on the web!",
  skillsLearned: [
    "CSS 3D Transforms",
    "Three.js Fundamentals",
    "3D Lighting & Materials",
    "Complex Geometries",
    "Camera Controls",
    "Procedural Generation",
    "Particle Systems",
    "WebGL Rendering"
  ],
  achievements: [
    { icon: "🎨", title: "3D Artist", description: "Created stunning 3D visualizations" },
    { icon: "🔮", title: "Three.js Master", description: "Mastered the Three.js library" },
    { icon: "⚡", title: "Performance Pro", description: "Optimized 3D scenes for 60fps" },
    { icon: "🌌", title: "Galaxy Creator", description: "Built a beautiful particle galaxy" }
  ],
  nextSteps: [
    "Explore advanced Three.js features like shaders and post-processing",
    "Build a 3D game or interactive experience",
    "Learn WebGL and GLSL for custom shaders",
    "Combine 3D graphics with other web technologies",
    "Study the AI Integration Path to add intelligence to your 3D apps"
  ],
  resources: [
    { name: "Three.js Documentation", url: "https://threejs.org/docs/" },
    { name: "Three.js Examples", url: "https://threejs.org/examples/" },
    { name: "WebGL Fundamentals", url: "https://webglfundamentals.org/" },
    { name: "Book of Shaders", url: "https://thebookofshaders.com/" }
  ]
};
