# 3D Capabilities for Single-File Web Apps Under 1MB

A comprehensive guide to implementing 3D graphics in single-file web applications while staying under 1MB. This guide covers everything from lightweight libraries to raw WebGL implementations, with practical examples and performance considerations.

## Table of Contents
1. [Three.js Basics](#threejs-basics)
2. [Lightweight 3D Alternatives](#lightweight-3d-alternatives)
3. [WebGL Fundamentals](#webgl-fundamentals)
4. [3D Model Formats](#3d-model-formats)
5. [Simple 3D Scenes and Geometries](#simple-3d-scenes-and-geometries)
6. [Camera Controls and Interactions](#camera-controls-and-interactions)
7. [Lighting and Materials](#lighting-and-materials)
8. [Performance Optimization](#performance-optimization)
9. [CSS 3D Transforms](#css-3d-transforms)
10. [Procedural 3D Generation](#procedural-3d-generation)

---

## Three.js Basics

### Can Three.js Fit in 1MB?

**Yes!** Three.js is surprisingly compact:
- **Minified + Gzipped: 182 KB** (as of 2025)
- **Minified only: ~658 KB**
- **With app code: Easily under 1MB**

This leaves approximately **342 KB** for your application code when using gzipped delivery (assuming 1MB uncompressed limit).

### Basic Three.js Setup

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Three.js Minimal Scene</title>
    <style>
        body { margin: 0; overflow: hidden; }
        canvas { display: block; }
    </style>
</head>
<body>
    <script type="module">
        import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // Create a cube
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        // Add light
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        scene.add(light);
        scene.add(new THREE.AmbientLight(0x404040));

        camera.position.z = 5;

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            renderer.render(scene, camera);
        }
        animate();

        // Handle window resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    </script>
</body>
</html>
```

### Tree-Shaking Considerations

Three.js supports ES6 modules, but tree-shaking can be challenging:
- Importing `WebGLRenderer` pulls in most of the library
- Use selective imports to minimize bundle size:

```javascript
// Instead of importing everything
import * as THREE from 'three';

// Import only what you need
import { Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, Mesh } from 'three';
```

### Advantages of Three.js
- Mature, well-documented API
- Large community and extensive examples
- Built-in geometries, materials, and loaders
- Cross-browser compatibility

### Disadvantages
- Can be overkill for simple 3D scenes
- Harder to tree-shake effectively
- Abstractions hide some WebGL details

---

## Lightweight 3D Alternatives

### 1. OGL (Minimal WebGL Library)

**Best for:** Developers comfortable with shaders and wanting minimal abstraction

**Size:** ~29KB minified + gzipped (core: 8KB, math: 6KB, extras: 15KB)

With tree-shaking, final bundle can be much smaller than 29KB.

```javascript
import { Renderer, Camera, Transform, Geometry, Program, Mesh } from 'ogl';

const renderer = new Renderer({ dpr: 2 });
const gl = renderer.gl;
document.body.appendChild(gl.canvas);

const camera = new Camera(gl, { fov: 35 });
camera.position.set(0, 0, 5);

const scene = new Transform();

// Create geometry
const geometry = new Geometry(gl, {
    position: { size: 3, data: new Float32Array([...]) },
    uv: { size: 2, data: new Float32Array([...]) },
});

// Create shader program
const program = new Program(gl, {
    vertex: `
        attribute vec3 position;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragment: `
        precision highp float;
        void main() {
            gl_FragColor = vec4(0.0, 1.0, 0.5, 1.0);
        }
    `
});

const mesh = new Mesh(gl, { geometry, program });
mesh.setParent(scene);

requestAnimationFrame(update);
function update(t) {
    requestAnimationFrame(update);
    mesh.rotation.y -= 0.04;
    renderer.render({ scene, camera });
}
```

**Pros:**
- Extremely lightweight
- Clean, intuitive API similar to Three.js
- Full control over shaders
- Zero dependencies

**Cons:**
- Less documentation than Three.js
- Smaller community
- Requires more WebGL knowledge

### 2. Babylon.js (Modular Approach)

**Best for:** Feature-rich applications with selective imports

**Size:** Full library is large (~500KB+), but modular imports can reduce this significantly

```javascript
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";

const canvas = document.getElementById("renderCanvas");
const engine = new Engine(canvas, true);
const scene = new Scene(engine);

const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
camera.setTarget(Vector3.Zero());
camera.attachControl(canvas, true);

const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
light.intensity = 0.7;

const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2 }, scene);

engine.runRenderLoop(() => {
    scene.render();
});
```

**Pros:**
- Feature-rich with physics, particles, post-processing
- Good performance
- Modular architecture

**Cons:**
- Steeper learning curve
- Harder to fit under 1MB with many features

### 3. Regl (Functional WebGL)

**Best for:** Functional programming enthusiasts, performance-critical apps

**Size:** ~25KB minified + gzipped

```javascript
const regl = require('regl')();

const drawCube = regl({
    frag: `
        precision mediump float;
        uniform vec4 color;
        void main() {
            gl_FragColor = color;
        }
    `,
    vert: `
        precision mediump float;
        attribute vec3 position;
        uniform mat4 projection, view;
        void main() {
            gl_Position = projection * view * vec4(position, 1);
        }
    `,
    attributes: {
        position: [
            // cube vertices
            [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
        ]
    },
    uniforms: {
        color: [1, 0, 0, 1],
        view: ({tick}) => {
            const t = 0.01 * tick;
            return mat4.lookAt([],
                [5 * Math.cos(t), 2.5, 5 * Math.sin(t)],
                [0, 0, 0],
                [0, 1, 0]
            );
        },
        projection: ({viewportWidth, viewportHeight}) =>
            mat4.perspective([],
                Math.PI / 4,
                viewportWidth / viewportHeight,
                0.01,
                1000
            )
    },
    count: 8,
    primitive: 'points'
});

regl.frame(() => {
    regl.clear({ color: [0, 0, 0, 1] });
    drawCube();
});
```

**Pros:**
- Very lightweight
- Functional, declarative API
- Excellent performance

**Cons:**
- Different paradigm from traditional OOP
- Requires good WebGL understanding

---

## WebGL Fundamentals

### Why Raw WebGL?

For the absolute smallest file size (0KB library overhead), raw WebGL gives you complete control. The trade-off is more code complexity.

### Minimal WebGL Rotating Cube

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { margin: 0; overflow: hidden; }
        canvas { display: block; width: 100vw; height: 100vh; }
    </style>
</head>
<body>
    <canvas id="canvas"></canvas>
    <script>
        const canvas = document.getElementById('canvas');
        const gl = canvas.getContext('webgl');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);

        // Vertex shader
        const vsSource = `
            attribute vec4 aVertexPosition;
            attribute vec4 aVertexColor;
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            varying lowp vec4 vColor;
            void main(void) {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
                vColor = aVertexColor;
            }
        `;

        // Fragment shader
        const fsSource = `
            varying lowp vec4 vColor;
            void main(void) {
                gl_FragColor = vColor;
            }
        `;

        // Initialize shader program
        function initShaderProgram(gl, vsSource, fsSource) {
            const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
            const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
            const shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);
            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                console.error('Unable to initialize shader program: ' + gl.getProgramInfoLog(shaderProgram));
                return null;
            }
            return shaderProgram;
        }

        function loadShader(gl, type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        }

        const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

        // Cube vertices (8 corners, 3 coords each)
        const positions = [
            // Front face
            -1.0, -1.0,  1.0,  1.0, -1.0,  1.0,  1.0,  1.0,  1.0, -1.0,  1.0,  1.0,
            // Back face
            -1.0, -1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,  1.0, -1.0, -1.0,
            // Top face
            -1.0,  1.0, -1.0, -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0,
            // Bottom face
            -1.0, -1.0, -1.0,  1.0, -1.0, -1.0,  1.0, -1.0,  1.0, -1.0, -1.0,  1.0,
            // Right face
             1.0, -1.0, -1.0,  1.0,  1.0, -1.0,  1.0,  1.0,  1.0,  1.0, -1.0,  1.0,
            // Left face
            -1.0, -1.0, -1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,  1.0, -1.0,
        ];

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        // Colors for each vertex
        const faceColors = [
            [1.0, 0.0, 0.0, 1.0],    // Front face: red
            [0.0, 1.0, 0.0, 1.0],    // Back face: green
            [0.0, 0.0, 1.0, 1.0],    // Top face: blue
            [1.0, 1.0, 0.0, 1.0],    // Bottom face: yellow
            [1.0, 0.0, 1.0, 1.0],    // Right face: purple
            [0.0, 1.0, 1.0, 1.0],    // Left face: cyan
        ];

        let colors = [];
        for (let i = 0; i < faceColors.length; ++i) {
            colors = colors.concat(faceColors[i], faceColors[i], faceColors[i], faceColors[i]);
        }

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        // Index buffer
        const indices = [
            0,  1,  2,    0,  2,  3,    // front
            4,  5,  6,    4,  6,  7,    // back
            8,  9,  10,   8,  10, 11,   // top
            12, 13, 14,   12, 14, 15,   // bottom
            16, 17, 18,   16, 18, 19,   // right
            20, 21, 22,   20, 22, 23,   // left
        ];

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        // Matrix math (simplified)
        function mat4Perspective(out, fovy, aspect, near, far) {
            const f = 1.0 / Math.tan(fovy / 2);
            out[0] = f / aspect;
            out[5] = f;
            out[10] = (far + near) / (near - far);
            out[11] = -1;
            out[14] = (2 * far * near) / (near - far);
            return out;
        }

        function mat4Identity(out) {
            out[0] = 1; out[1] = 0; out[2] = 0; out[3] = 0;
            out[4] = 0; out[5] = 1; out[6] = 0; out[7] = 0;
            out[8] = 0; out[9] = 0; out[10] = 1; out[11] = 0;
            out[12] = 0; out[13] = 0; out[14] = 0; out[15] = 1;
            return out;
        }

        function mat4Translate(out, a, v) {
            const x = v[0], y = v[1], z = v[2];
            out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
            out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
            out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
            out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
            return out;
        }

        function mat4RotateX(out, a, rad) {
            const s = Math.sin(rad), c = Math.cos(rad);
            const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
            const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
            out[4] = a10 * c + a20 * s;
            out[5] = a11 * c + a21 * s;
            out[6] = a12 * c + a22 * s;
            out[7] = a13 * c + a23 * s;
            out[8] = a20 * c - a10 * s;
            out[9] = a21 * c - a11 * s;
            out[10] = a22 * c - a12 * s;
            out[11] = a23 * c - a13 * s;
            return out;
        }

        function mat4RotateY(out, a, rad) {
            const s = Math.sin(rad), c = Math.cos(rad);
            const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
            const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
            out[0] = a00 * c - a20 * s;
            out[1] = a01 * c - a21 * s;
            out[2] = a02 * c - a22 * s;
            out[3] = a03 * c - a23 * s;
            out[8] = a00 * s + a20 * c;
            out[9] = a01 * s + a21 * c;
            out[10] = a02 * s + a22 * c;
            out[11] = a03 * s + a23 * c;
            return out;
        }

        let rotation = 0;
        const projectionMatrix = new Float32Array(16);
        const modelViewMatrix = new Float32Array(16);

        function render() {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clearDepth(1.0);
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // Set up projection
            mat4Perspective(projectionMatrix, 45 * Math.PI / 180,
                canvas.width / canvas.height, 0.1, 100.0);

            // Set up model view
            mat4Identity(modelViewMatrix);
            mat4Translate(modelViewMatrix, modelViewMatrix, [0, 0, -6]);
            mat4RotateX(modelViewMatrix, modelViewMatrix, rotation);
            mat4RotateY(modelViewMatrix, modelViewMatrix, rotation * 0.7);

            // Set vertex positions
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            const vertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
            gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vertexPosition);

            // Set vertex colors
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            const vertexColor = gl.getAttribLocation(shaderProgram, 'aVertexColor');
            gl.vertexAttribPointer(vertexColor, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vertexColor);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.useProgram(shaderProgram);

            // Set uniforms
            gl.uniformMatrix4fv(
                gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                false, projectionMatrix);
            gl.uniformMatrix4fv(
                gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
                false, modelViewMatrix);

            gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

            rotation += 0.01;
            requestAnimationFrame(render);
        }

        render();
    </script>
</body>
</html>
```

**File size:** ~7KB (no external dependencies!)

### Key WebGL Concepts

1. **Shaders:** Programs that run on the GPU
   - Vertex shader: Processes each vertex
   - Fragment shader: Processes each pixel

2. **Buffers:** Store vertex data on the GPU
   - Position buffer
   - Color buffer
   - Index buffer

3. **Uniforms:** Global variables shared across all vertices/fragments

4. **Attributes:** Per-vertex data

---

## 3D Model Formats

### glTF vs OBJ: The Clear Winner

**glTF (Graphics Library Transmission Format)** is the modern standard for web 3D:

| Feature | glTF | OBJ |
|---------|------|-----|
| **File Size** | 5x smaller | Baseline |
| **Load Speed** | 10x faster | Baseline |
| **Format** | Binary/JSON | Plain text |
| **Animations** | Yes | No |
| **Materials** | PBR materials | Basic |
| **Textures** | Embedded or external | External only |

### glTF Example with Three.js

```javascript
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

loader.load(
    'model.gltf',  // or .glb for binary
    (gltf) => {
        scene.add(gltf.scene);

        // Access animations
        if (gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(gltf.scene);
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();
        }
    },
    (progress) => {
        console.log((progress.loaded / progress.total * 100) + '% loaded');
    },
    (error) => {
        console.error('Error loading model:', error);
    }
);
```

### Minimal glTF Loader (No Three.js)

For the absolute smallest footprint, use `minimal-gltf-loader`:

```javascript
import { GLTFLoader } from 'minimal-gltf-loader';

const gl = canvas.getContext('webgl2');
const loader = new GLTFLoader(gl);

loader.loadGLTF('model.glb').then((gltf) => {
    // Access meshes, materials, animations
    console.log(gltf.json);
    console.log(gltf.buffers);

    // Manually create WebGL buffers from gltf data
    // This requires more work but gives complete control
}).catch((error) => {
    console.error('Failed to load:', error);
});
```

### Creating Tiny Models

For single-file apps, consider:

1. **Procedural generation** (see section below)
2. **Primitive shapes** (built-in geometries)
3. **Compressed glTF with Draco** (can reduce by 90%)
4. **Base64 embed tiny models** directly in HTML

```javascript
// Embed a tiny glTF model as base64
const tinyModelData = 'data:application/octet-stream;base64,Z2xURg...';

fetch(tinyModelData)
    .then(response => response.arrayBuffer())
    .then(buffer => loader.parse(buffer));
```

---

## Simple 3D Scenes and Geometries

### Built-in Primitives (Three.js)

Three.js provides common shapes without needing external models:

```javascript
// Box
const box = new THREE.BoxGeometry(1, 1, 1);

// Sphere
const sphere = new THREE.SphereGeometry(0.5, 32, 32);

// Cylinder
const cylinder = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);

// Cone
const cone = new THREE.ConeGeometry(0.5, 1, 32);

// Torus (donut)
const torus = new THREE.TorusGeometry(0.7, 0.2, 16, 100);

// Plane
const plane = new THREE.PlaneGeometry(5, 5);

// Custom geometry from vertices
const geometry = new THREE.BufferGeometry();
const vertices = new Float32Array([
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
]);
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
```

### Combining Primitives

Create complex shapes from simple ones:

```javascript
// Create a snowman
const snowman = new THREE.Group();

const bottom = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshPhongMaterial({ color: 0xffffff })
);

const middle = new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 32, 32),
    new THREE.MeshPhongMaterial({ color: 0xffffff })
);
middle.position.y = 1.5;

const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    new THREE.MeshPhongMaterial({ color: 0xffffff })
);
head.position.y = 2.5;

snowman.add(bottom, middle, head);
scene.add(snowman);
```

### Efficient Scene Organization

```javascript
// Group related objects
const forest = new THREE.Group();

for (let i = 0; i < 100; i++) {
    const tree = createTree();
    tree.position.set(
        Math.random() * 100 - 50,
        0,
        Math.random() * 100 - 50
    );
    forest.add(tree);
}

scene.add(forest);

// Later, manipulate entire forest
forest.rotation.y += 0.01; // Rotate all trees
```

---

## Camera Controls and Interactions

### Three.js OrbitControls

The standard for 3D camera control, but adds ~20KB:

```javascript
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth camera movement
controls.dampingFactor = 0.05;
controls.minDistance = 5;
controls.maxDistance = 50;
controls.maxPolarAngle = Math.PI / 2; // Prevent going below ground

function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Required if damping is enabled
    renderer.render(scene, camera);
}
```

### Lightweight Alternative: SimpleOrbitControls

~5KB implementation for size-conscious apps:

```javascript
// Simplified orbit controls
class SimpleOrbitControls {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        this.isMouseDown = false;
        this.prevMouse = { x: 0, y: 0 };
        this.rotation = { x: 0, y: 0 };
        this.distance = 10;

        this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.domElement.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.domElement.addEventListener('wheel', this.onWheel.bind(this));
    }

    onMouseDown(e) {
        this.isMouseDown = true;
        this.prevMouse = { x: e.clientX, y: e.clientY };
    }

    onMouseMove(e) {
        if (!this.isMouseDown) return;

        const deltaX = e.clientX - this.prevMouse.x;
        const deltaY = e.clientY - this.prevMouse.y;

        this.rotation.y += deltaX * 0.01;
        this.rotation.x += deltaY * 0.01;

        // Clamp vertical rotation
        this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));

        this.prevMouse = { x: e.clientX, y: e.clientY };
        this.update();
    }

    onMouseUp() {
        this.isMouseDown = false;
    }

    onWheel(e) {
        e.preventDefault();
        this.distance += e.deltaY * 0.01;
        this.distance = Math.max(2, Math.min(50, this.distance));
        this.update();
    }

    update() {
        const x = this.distance * Math.sin(this.rotation.y) * Math.cos(this.rotation.x);
        const y = this.distance * Math.sin(this.rotation.x);
        const z = this.distance * Math.cos(this.rotation.y) * Math.cos(this.rotation.x);

        this.camera.position.set(x, y, z);
        this.camera.lookAt(0, 0, 0);
    }
}

// Usage
const controls = new SimpleOrbitControls(camera, renderer.domElement);
```

### First-Person Controls

For games and immersive experiences:

```javascript
class FirstPersonControls {
    constructor(camera, domElement) {
        this.camera = camera;
        this.keys = {};
        this.velocity = new THREE.Vector3();
        this.yaw = 0;
        this.pitch = 0;

        document.addEventListener('keydown', (e) => this.keys[e.key] = true);
        document.addEventListener('keyup', (e) => this.keys[e.key] = false);

        domElement.addEventListener('click', () => {
            domElement.requestPointerLock();
        });

        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement === domElement) {
                this.yaw -= e.movementX * 0.002;
                this.pitch -= e.movementY * 0.002;
                this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
            }
        });
    }

    update(delta) {
        const speed = 5 * delta;

        // Forward/backward
        if (this.keys['w']) {
            this.velocity.z = -speed;
        } else if (this.keys['s']) {
            this.velocity.z = speed;
        } else {
            this.velocity.z = 0;
        }

        // Left/right
        if (this.keys['a']) {
            this.velocity.x = -speed;
        } else if (this.keys['d']) {
            this.velocity.x = speed;
        } else {
            this.velocity.x = 0;
        }

        // Apply rotation
        this.camera.rotation.set(this.pitch, this.yaw, 0);

        // Move camera
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);

        this.camera.position.addScaledVector(forward, this.velocity.z);
        this.camera.position.addScaledVector(right, this.velocity.x);
    }
}
```

---

## Lighting and Materials

### Material Performance Hierarchy

From fastest to slowest:

1. **MeshBasicMaterial** - No lighting calculations, flat color
2. **MeshLambertMaterial** - Per-vertex lighting, matte surfaces
3. **MeshPhongMaterial** - Per-pixel lighting, specular highlights
4. **MeshStandardMaterial** - PBR, realistic but expensive

### Material Comparison

```javascript
// 1. Basic Material - Fastest, no lighting
const basicMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff00
});
// Use for: UI elements, particles, backgrounds

// 2. Lambert Material - Good for matte objects
const lambertMaterial = new THREE.MeshLambertMaterial({
    color: 0x00ff00
});
// Use for: Terrain, matte objects, mobile optimization

// 3. Phong Material - Shiny surfaces
const phongMaterial = new THREE.MeshPhongMaterial({
    color: 0x00ff00,
    shininess: 100,
    specular: 0x444444
});
// Use for: Metals, plastics, shiny objects

// 4. Standard Material - PBR (Physically Based Rendering)
const standardMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ff00,
    roughness: 0.5,
    metalness: 0.5
});
// Use for: Realistic rendering, when performance allows
```

### Lighting Types

```javascript
// 1. Ambient Light - Uniform illumination, cheapest
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// 2. Directional Light - Simulates sun, parallel rays
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

// 3. Point Light - Omni-directional from a point
const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(0, 5, 0);
scene.add(pointLight);

// 4. Spot Light - Cone of light (most expensive)
const spotLight = new THREE.SpotLight(0xffffff, 1);
spotLight.position.set(10, 10, 10);
spotLight.angle = Math.PI / 6;
scene.add(spotLight);

// 5. Hemisphere Light - Sky + ground lighting
const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x545454, 0.6);
scene.add(hemiLight);
```

### Performance-Optimized Lighting Setup

```javascript
// Minimal, performant lighting for most scenes
const scene = new THREE.Scene();

// Ambient for base illumination
scene.add(new THREE.AmbientLight(0x404040, 0.4));

// Single directional light for definition
const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
sunLight.position.set(5, 10, 5);
scene.add(sunLight);

// Use Lambert materials for best performance
const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
```

### Baked Lighting Alternative

For static scenes, pre-calculate lighting in textures:

```javascript
// Instead of real-time lights, use lightmaps
const material = new THREE.MeshBasicMaterial({
    map: textureLoader.load('color.jpg'),
    lightMap: textureLoader.load('lightmap.jpg'),
    lightMapIntensity: 1
});

// No lights needed! Faster rendering
```

---

## Performance Optimization

### 1. Reduce Draw Calls

```javascript
// BAD: 100 draw calls
for (let i = 0; i < 100; i++) {
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(i, 0, 0);
    scene.add(cube);
}

// GOOD: 1 draw call using InstancedMesh
const count = 100;
const mesh = new THREE.InstancedMesh(geometry, material, count);

const matrix = new THREE.Matrix4();
for (let i = 0; i < count; i++) {
    matrix.setPosition(i, 0, 0);
    mesh.setMatrixAt(i, matrix);
}

mesh.instanceMatrix.needsUpdate = true;
scene.add(mesh);
```

### 2. Optimize Geometry

```javascript
// Reduce polygon count for distant objects
const highDetail = new THREE.SphereGeometry(1, 32, 32); // 1024 faces
const lowDetail = new THREE.SphereGeometry(1, 8, 8);    // 64 faces

// Use LOD (Level of Detail)
const lod = new THREE.LOD();
lod.addLevel(new THREE.Mesh(highDetail, material), 0);
lod.addLevel(new THREE.Mesh(lowDetail, material), 50);
scene.add(lod);
```

### 3. Texture Optimization

```javascript
// Use power-of-2 textures (512, 1024, 2048)
// Smaller textures for mobile
const isMobile = /Android|iPhone/i.test(navigator.userAgent);
const textureSize = isMobile ? 512 : 1024;

// Compress textures
const texture = textureLoader.load('texture.jpg');
texture.minFilter = THREE.LinearFilter; // Disable mipmaps if not needed
texture.generateMipmaps = false;

// GPU compression (if supported)
const compressedTexture = new THREE.CompressedTextureLoader()
    .load('texture.ktx');
```

### 4. Frustum Culling

Three.js does this automatically, but you can help:

```javascript
// Don't render objects outside camera view
object.frustumCulled = true; // Default, but explicit

// For large scenes, organize in spatial hierarchy
const octree = createOctree(scene);
```

### 5. Dispose Unused Resources

```javascript
// Prevent memory leaks
function removeObject(object) {
    if (object.geometry) object.geometry.dispose();
    if (object.material) {
        if (Array.isArray(object.material)) {
            object.material.forEach(mat => mat.dispose());
        } else {
            object.material.dispose();
        }
    }
    if (object.texture) object.texture.dispose();
    scene.remove(object);
}
```

### 6. Limit Render Calls

```javascript
// Don't render if nothing changed
let needsRender = true;

controls.addEventListener('change', () => {
    needsRender = true;
});

function animate() {
    requestAnimationFrame(animate);

    if (needsRender) {
        renderer.render(scene, camera);
        needsRender = false;
    }
}

// For animations, always render
function animateConstant() {
    requestAnimationFrame(animateConstant);
    controls.update();
    renderer.render(scene, camera);
}
```

### 7. Mobile-Specific Optimizations

```javascript
// Detect mobile and adjust
const isMobile = /Android|iPhone/i.test(navigator.userAgent);

const renderer = new THREE.WebGLRenderer({
    antialias: !isMobile, // Disable AA on mobile
    powerPreference: isMobile ? 'low-power' : 'high-performance'
});

// Lower pixel ratio on mobile
renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));

// Reduce shadow quality
if (isMobile) {
    renderer.shadowMap.enabled = false;
} else {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}
```

### Performance Monitoring

```javascript
// Track FPS
let lastTime = performance.now();
let frames = 0;
let fps = 60;

function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    frames++;

    if (now >= lastTime + 1000) {
        fps = Math.round((frames * 1000) / (now - lastTime));
        frames = 0;
        lastTime = now;
        console.log(`FPS: ${fps}`);
    }

    renderer.render(scene, camera);
}
```

---

## CSS 3D Transforms

### When to Use CSS Instead of WebGL

CSS 3D transforms are perfect for:
- Simple 3D UI elements
- Card flips, carousels
- Lightweight transitions
- No shader/lighting needed
- Accessibility requirements

**Advantages:**
- Zero JavaScript libraries needed
- Hardware accelerated
- Easy to learn
- Great browser support
- ~1-2KB of code

### Creating a 3D Cube with Pure CSS

```html
<!DOCTYPE html>
<html>
<head>
<style>
    body {
        margin: 0;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        perspective: 1000px;
    }

    .scene {
        width: 200px;
        height: 200px;
        perspective: 600px;
    }

    .cube {
        width: 200px;
        height: 200px;
        position: relative;
        transform-style: preserve-3d;
        animation: rotate 10s infinite linear;
    }

    .cube__face {
        position: absolute;
        width: 200px;
        height: 200px;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 40px;
        font-weight: bold;
        color: white;
        opacity: 0.8;
    }

    .cube__face--front  { background: hsla(0, 100%, 50%, 0.7);   transform: rotateY(0deg) translateZ(100px); }
    .cube__face--right  { background: hsla(60, 100%, 50%, 0.7);  transform: rotateY(90deg) translateZ(100px); }
    .cube__face--back   { background: hsla(120, 100%, 50%, 0.7); transform: rotateY(180deg) translateZ(100px); }
    .cube__face--left   { background: hsla(180, 100%, 50%, 0.7); transform: rotateY(-90deg) translateZ(100px); }
    .cube__face--top    { background: hsla(240, 100%, 50%, 0.7); transform: rotateX(90deg) translateZ(100px); }
    .cube__face--bottom { background: hsla(300, 100%, 50%, 0.7); transform: rotateX(-90deg) translateZ(100px); }

    @keyframes rotate {
        from { transform: rotateX(0deg) rotateY(0deg); }
        to { transform: rotateX(360deg) rotateY(360deg); }
    }
</style>
</head>
<body>
    <div class="scene">
        <div class="cube">
            <div class="cube__face cube__face--front">front</div>
            <div class="cube__face cube__face--back">back</div>
            <div class="cube__face cube__face--right">right</div>
            <div class="cube__face cube__face--left">left</div>
            <div class="cube__face cube__face--top">top</div>
            <div class="cube__face cube__face--bottom">bottom</div>
        </div>
    </div>
</body>
</html>
```

**File size:** ~2KB!

### Interactive CSS 3D Card

```html
<!DOCTYPE html>
<html>
<head>
<style>
    .card-container {
        width: 300px;
        height: 400px;
        perspective: 1000px;
        cursor: pointer;
    }

    .card {
        width: 100%;
        height: 100%;
        position: relative;
        transform-style: preserve-3d;
        transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
    }

    .card-container:hover .card {
        transform: rotateY(180deg);
    }

    .card__face {
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
    }

    .card__face--front {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }

    .card__face--back {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        transform: rotateY(180deg);
    }
</style>
</head>
<body>
    <div class="card-container">
        <div class="card">
            <div class="card__face card__face--front">
                <h2>Hover Me</h2>
            </div>
            <div class="card__face card__face--back">
                <h2>Back Side</h2>
            </div>
        </div>
    </div>
</body>
</html>
```

### 3D Carousel

```html
<!DOCTYPE html>
<html>
<head>
<style>
    .carousel {
        width: 210px;
        height: 140px;
        position: relative;
        perspective: 1000px;
        margin: 100px auto;
    }

    .carousel__container {
        width: 100%;
        height: 100%;
        position: absolute;
        transform-style: preserve-3d;
        animation: spin 20s infinite linear;
    }

    .carousel__item {
        position: absolute;
        width: 190px;
        height: 120px;
        left: 10px;
        top: 10px;
        border: 2px solid black;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30px;
    }

    .carousel__item:nth-child(1) { transform: rotateY(0deg) translateZ(288px); }
    .carousel__item:nth-child(2) { transform: rotateY(60deg) translateZ(288px); }
    .carousel__item:nth-child(3) { transform: rotateY(120deg) translateZ(288px); }
    .carousel__item:nth-child(4) { transform: rotateY(180deg) translateZ(288px); }
    .carousel__item:nth-child(5) { transform: rotateY(240deg) translateZ(288px); }
    .carousel__item:nth-child(6) { transform: rotateY(300deg) translateZ(288px); }

    @keyframes spin {
        from { transform: rotateY(0deg); }
        to { transform: rotateY(360deg); }
    }

    .carousel__container:hover {
        animation-play-state: paused;
    }
</style>
</head>
<body>
    <div class="carousel">
        <div class="carousel__container">
            <div class="carousel__item">1</div>
            <div class="carousel__item">2</div>
            <div class="carousel__item">3</div>
            <div class="carousel__item">4</div>
            <div class="carousel__item">5</div>
            <div class="carousel__item">6</div>
        </div>
    </div>
</body>
</html>
```

### Key CSS 3D Properties

```css
/* Enable 3D space */
perspective: 1000px;              /* Distance from viewer */
transform-style: preserve-3d;     /* Maintain 3D for children */
backface-visibility: hidden;      /* Hide back of elements */

/* 3D Transforms */
transform: translateZ(100px);     /* Move in/out */
transform: rotateX(45deg);        /* Rotate around X axis */
transform: rotateY(45deg);        /* Rotate around Y axis */
transform: rotateZ(45deg);        /* Rotate around Z axis */
transform: scale3d(1, 1, 1);      /* Scale in 3D */

/* Combine transforms */
transform: rotateY(45deg) translateZ(100px) rotateX(20deg);
```

---

## Procedural 3D Generation

### Why Procedural Generation?

**Advantages:**
- No model files needed
- Infinite variety
- Tiny file size
- Dynamic, responsive content

### Perlin Noise Implementation

```javascript
// Simplified Perlin noise (full implementation ~5KB)
class SimplexNoise {
    constructor(seed = Math.random()) {
        this.p = new Uint8Array(512);
        this.perm = new Uint8Array(512);

        for (let i = 0; i < 256; i++) {
            this.p[i] = i;
        }

        // Shuffle using seed
        let n, q;
        for (let i = 255; i > 0; i--) {
            seed = (seed * 16807) % 2147483647;
            n = seed % (i + 1);
            q = this.p[i];
            this.p[i] = this.p[n];
            this.p[n] = q;
        }

        for (let i = 0; i < 512; i++) {
            this.perm[i] = this.p[i & 255];
        }
    }

    noise(x, y, z) {
        // Simplified 3D noise function
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);

        const A = this.perm[X] + Y;
        const AA = this.perm[A] + Z;
        const AB = this.perm[A + 1] + Z;
        const B = this.perm[X + 1] + Y;
        const BA = this.perm[B] + Z;
        const BB = this.perm[B + 1] + Z;

        return this.lerp(w,
            this.lerp(v,
                this.lerp(u, this.grad(this.perm[AA], x, y, z),
                    this.grad(this.perm[BA], x - 1, y, z)),
                this.lerp(u, this.grad(this.perm[AB], x, y - 1, z),
                    this.grad(this.perm[BB], x - 1, y - 1, z))),
            this.lerp(v,
                this.lerp(u, this.grad(this.perm[AA + 1], x, y, z - 1),
                    this.grad(this.perm[BA + 1], x - 1, y, z - 1)),
                this.lerp(u, this.grad(this.perm[AB + 1], x, y - 1, z - 1),
                    this.grad(this.perm[BB + 1], x - 1, y - 1, z - 1)))
        );
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(t, a, b) {
        return a + t * (b - a);
    }

    grad(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
}
```

### Procedural Terrain

```javascript
// Generate terrain using noise
function createTerrain(width, depth, noise) {
    const geometry = new THREE.PlaneGeometry(width, depth, width - 1, depth - 1);
    geometry.rotateX(-Math.PI / 2);

    const vertices = geometry.attributes.position.array;

    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const z = vertices[i + 2];

        // Multi-octave noise for natural terrain
        let height = 0;
        let amplitude = 1;
        let frequency = 0.02;

        for (let octave = 0; octave < 4; octave++) {
            height += noise.noise(x * frequency, z * frequency, 0) * amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }

        vertices[i + 1] = height * 10; // Y coordinate
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    return geometry;
}

// Usage
const noise = new SimplexNoise();
const terrainGeometry = createTerrain(100, 100, noise);
const terrainMaterial = new THREE.MeshLambertMaterial({
    color: 0x3a7d44,
    wireframe: false
});
const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
scene.add(terrain);
```

### Procedural Trees

```javascript
function createTree(height = 5, trunkRadius = 0.3) {
    const tree = new THREE.Group();

    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(
        trunkRadius,
        trunkRadius * 1.2,
        height,
        8
    );
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = height / 2;
    tree.add(trunk);

    // Foliage (3 layers)
    const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });

    for (let i = 0; i < 3; i++) {
        const radius = (3 - i) * 0.8;
        const coneGeometry = new THREE.ConeGeometry(radius, height * 0.6, 8);
        const cone = new THREE.Mesh(coneGeometry, foliageMaterial);
        cone.position.y = height * 0.7 + i * height * 0.3;
        tree.add(cone);
    }

    return tree;
}

// Create random forest
for (let i = 0; i < 50; i++) {
    const tree = createTree(
        3 + Math.random() * 4,  // Random height
        0.2 + Math.random() * 0.3  // Random trunk size
    );
    tree.position.set(
        (Math.random() - 0.5) * 100,
        0,
        (Math.random() - 0.5) * 100
    );
    tree.rotation.y = Math.random() * Math.PI * 2;
    scene.add(tree);
}
```

### Procedural Geometry from Math Functions

```javascript
// Create custom geometry from parametric equations
function createParametricGeometry(func, uSegments, vSegments) {
    const vertices = [];
    const indices = [];

    for (let u = 0; u <= uSegments; u++) {
        for (let v = 0; v <= vSegments; v++) {
            const uNorm = u / uSegments;
            const vNorm = v / vSegments;
            const point = func(uNorm, vNorm);
            vertices.push(point.x, point.y, point.z);
        }
    }

    for (let u = 0; u < uSegments; u++) {
        for (let v = 0; v < vSegments; v++) {
            const a = u * (vSegments + 1) + v;
            const b = u * (vSegments + 1) + v + 1;
            const c = (u + 1) * (vSegments + 1) + v + 1;
            const d = (u + 1) * (vSegments + 1) + v;

            indices.push(a, b, d);
            indices.push(b, c, d);
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
}

// Torus knot from equations
function torusKnot(u, v) {
    const p = 2, q = 3;
    const angle = u * Math.PI * 2;
    const phi = v * Math.PI * 2;
    const r = 0.5 * Math.cos(q * angle) + 2;

    return {
        x: r * Math.cos(p * angle) * (1 + 0.3 * Math.cos(phi)),
        y: r * Math.sin(p * angle) * (1 + 0.3 * Math.cos(phi)),
        z: 0.5 * Math.sin(q * angle) + 0.3 * Math.sin(phi)
    };
}

const geometry = createParametricGeometry(torusKnot, 100, 50);
const material = new THREE.MeshPhongMaterial({ color: 0xff6347 });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
```

### Procedural Planets

```javascript
function createPlanet(radius, detail, noise) {
    const geometry = new THREE.IcosahedronGeometry(radius, detail);
    const vertices = geometry.attributes.position.array;

    // Deform sphere with noise for planet surface
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const y = vertices[i + 1];
        const z = vertices[i + 2];

        // Normalize to get direction
        const length = Math.sqrt(x * x + y * y + z * z);
        const nx = x / length;
        const ny = y / length;
        const nz = z / length;

        // Multi-octave noise for surface detail
        let displacement = 0;
        let amp = 0.2;
        let freq = 2;

        for (let oct = 0; oct < 3; oct++) {
            displacement += noise.noise(nx * freq, ny * freq, nz * freq) * amp;
            amp *= 0.5;
            freq *= 2;
        }

        // Apply displacement
        const newRadius = radius + displacement * radius * 0.3;
        vertices[i] = nx * newRadius;
        vertices[i + 1] = ny * newRadius;
        vertices[i + 2] = nz * newRadius;
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    return geometry;
}

// Create planet
const planetGeometry = createPlanet(3, 4, noise);
const planetMaterial = new THREE.MeshPhongMaterial({
    color: 0x4169E1,
    flatShading: true
});
const planet = new THREE.Mesh(planetGeometry, planetMaterial);
scene.add(planet);
```

---

## Complete Example: Single-File 3D App Under 1MB

Here's a complete example combining multiple techniques:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D World - Under 1MB</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { overflow: hidden; font-family: Arial, sans-serif; }
        canvas { display: block; }
        #info {
            position: absolute;
            top: 10px;
            left: 10px;
            color: white;
            background: rgba(0,0,0,0.7);
            padding: 10px;
            border-radius: 5px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div id="info">
        <strong>3D Procedural World</strong><br>
        Mouse: Rotate | Scroll: Zoom<br>
        FPS: <span id="fps">60</span>
    </div>

    <script type="module">
        import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87ceeb);
        scene.fog = new THREE.Fog(0x87ceeb, 50, 200);

        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(0, 15, 30);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        document.body.appendChild(renderer.domElement);

        // Lighting
        scene.add(new THREE.AmbientLight(0x404040, 0.5));
        const sun = new THREE.DirectionalLight(0xffffff, 0.8);
        sun.position.set(50, 50, 25);
        scene.add(sun);

        // Simple noise function
        class Noise {
            constructor(seed = 12345) {
                this.seed = seed;
            }
            noise(x, y) {
                const n = Math.sin(x * 12.9898 + y * 78.233 + this.seed) * 43758.5453;
                return n - Math.floor(n);
            }
        }

        const noise = new Noise();

        // Create terrain
        const terrainSize = 100;
        const terrainGeometry = new THREE.PlaneGeometry(terrainSize, terrainSize, 50, 50);
        terrainGeometry.rotateX(-Math.PI / 2);

        const vertices = terrainGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 2];
            vertices[i + 1] = noise.noise(x * 0.05, z * 0.05) * 5;
        }
        terrainGeometry.attributes.position.needsUpdate = true;
        terrainGeometry.computeVertexNormals();

        const terrainMaterial = new THREE.MeshLambertMaterial({
            color: 0x3a7d44,
            flatShading: true
        });
        const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
        scene.add(terrain);

        // Create simple trees
        function createTree() {
            const tree = new THREE.Group();
            const trunk = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.4, 4, 6),
                new THREE.MeshLambertMaterial({ color: 0x8B4513 })
            );
            trunk.position.y = 2;
            tree.add(trunk);

            const foliage = new THREE.Mesh(
                new THREE.ConeGeometry(2, 4, 6),
                new THREE.MeshLambertMaterial({ color: 0x228B22 })
            );
            foliage.position.y = 5;
            tree.add(foliage);

            return tree;
        }

        // Place trees
        for (let i = 0; i < 30; i++) {
            const tree = createTree();
            const x = (Math.random() - 0.5) * 80;
            const z = (Math.random() - 0.5) * 80;
            const y = noise.noise(x * 0.05, z * 0.05) * 5;
            tree.position.set(x, y, z);
            tree.rotation.y = Math.random() * Math.PI * 2;
            scene.add(tree);
        }

        // Simple camera controls
        let mouseDown = false;
        let mouseX = 0, mouseY = 0;
        let cameraAngle = 0;
        let cameraHeight = 15;
        let cameraDistance = 30;

        renderer.domElement.addEventListener('mousedown', (e) => {
            mouseDown = true;
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        renderer.domElement.addEventListener('mousemove', (e) => {
            if (!mouseDown) return;
            const deltaX = e.clientX - mouseX;
            const deltaY = e.clientY - mouseY;
            cameraAngle += deltaX * 0.01;
            cameraHeight = Math.max(5, Math.min(50, cameraHeight - deltaY * 0.1));
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        renderer.domElement.addEventListener('mouseup', () => {
            mouseDown = false;
        });

        renderer.domElement.addEventListener('wheel', (e) => {
            e.preventDefault();
            cameraDistance = Math.max(10, Math.min(100, cameraDistance + e.deltaY * 0.05));
        });

        // FPS counter
        let lastTime = performance.now();
        let frames = 0;

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);

            // Update camera position
            camera.position.x = Math.sin(cameraAngle) * cameraDistance;
            camera.position.y = cameraHeight;
            camera.position.z = Math.cos(cameraAngle) * cameraDistance;
            camera.lookAt(0, 0, 0);

            // FPS counter
            frames++;
            const now = performance.now();
            if (now >= lastTime + 1000) {
                document.getElementById('fps').textContent =
                    Math.round((frames * 1000) / (now - lastTime));
                frames = 0;
                lastTime = now;
            }

            renderer.render(scene, camera);
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        animate();
    </script>
</body>
</html>
```

**Estimated file size:** ~8-10KB (excluding Three.js CDN)

---

## Summary: What's Possible Under 1MB

### With Libraries

1. **Three.js (~182KB gzipped)**
   - Complete 3D scenes with lighting
   - Camera controls
   - Basic model loading
   - Procedural geometry
   - Animations
   - Leaves ~840KB for app code

2. **OGL (~29KB gzipped)**
   - Lightweight 3D with custom shaders
   - Better for advanced developers
   - Leaves ~970KB for app code

3. **Raw WebGL (0KB)**
   - Full control, smallest footprint
   - Requires more code
   - Best for simple scenes

### Without 3D Libraries (CSS)

- **CSS 3D Transforms (~1-2KB)**
  - Perfect for UI elements
  - Cards, carousels, simple 3D
  - No WebGL overhead
  - Leaves ~998KB for app code

### Recommended Approach by Use Case

| Use Case | Recommended Solution | Size Budget |
|----------|---------------------|-------------|
| Simple 3D UI | CSS 3D Transforms | <5KB |
| Basic 3D scene | Raw WebGL | 10-50KB |
| Medium complexity | OGL | 30-100KB |
| Full features | Three.js | 200-500KB |
| Maximum performance | Raw WebGL + Custom | 20-100KB |

### File Size Breakdown Example

```
Single-file app with Three.js:
- Three.js minified + gzip: 182KB
- App JavaScript: 100KB
- HTML structure: 5KB
- CSS styling: 10KB
- Embedded textures (base64): 200KB
- Total: ~497KB ✓ Under 1MB!
```

---

## Resources & Further Reading

### Official Documentation
- [Three.js Documentation](https://threejs.org/docs/)
- [WebGL Fundamentals](https://webglfundamentals.org/)
- [MDN WebGL Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial)
- [OGL Documentation](https://github.com/oframe/ogl)

### Performance Tools
- Chrome DevTools Performance Tab
- [Stats.js](https://github.com/mrdoob/stats.js/) - FPS monitor
- [Spector.js](https://spector.babylonjs.com/) - WebGL debugger

### Community
- [Three.js Forum](https://discourse.threejs.org/)
- [Stack Overflow WebGL](https://stackoverflow.com/questions/tagged/webgl)
- [Shadertoy](https://www.shadertoy.com/) - Shader examples

---

*Document created: 2025-11-09*
*Target: Single-file web apps under 1MB*
*Focus: Practical 3D capabilities with code examples*
