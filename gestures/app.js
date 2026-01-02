// Get DOM elements
const videoElement = document.getElementById('videoElement');
const canvasElement = document.getElementById('canvasElement');
const canvasCtx = canvasElement.getContext('2d');
const detectedGestureElement = document.getElementById('detectedGesture');
const statusElement = document.getElementById('status');

let currentGesture = null;
let gestureConfidence = 0;
const CONFIDENCE_THRESHOLD = 5; // Number of consecutive frames needed to confirm gesture

// Initialize MediaPipe Hands
const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
});

hands.onResults(onResults);

// Setup camera
const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: 640,
    height: 480
});

camera.start();

// Update status
statusElement.textContent = 'Camera and AI model ready! Show a gesture to the camera.';
statusElement.classList.remove('loading');

// Process hand detection results
function onResults(results) {
    // Set canvas size to match video
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    // Clear canvas
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];

        // Draw hand landmarks
        drawHandLandmarks(landmarks);

        // Detect gesture
        const detectedGesture = detectGesture(landmarks);
        updateGestureDisplay(detectedGesture);
    } else {
        // No hand detected
        updateGestureDisplay(null);
    }

    canvasCtx.restore();
}

// Draw hand landmarks on canvas
function drawHandLandmarks(landmarks) {
    // Draw connections
    const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
        [0, 5], [5, 6], [6, 7], [7, 8], // Index
        [0, 9], [9, 10], [10, 11], [11, 12], // Middle
        [0, 13], [13, 14], [14, 15], [15, 16], // Ring
        [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
        [5, 9], [9, 13], [13, 17] // Palm
    ];

    canvasCtx.strokeStyle = '#667eea';
    canvasCtx.lineWidth = 3;

    connections.forEach(([start, end]) => {
        const startPoint = landmarks[start];
        const endPoint = landmarks[end];

        canvasCtx.beginPath();
        canvasCtx.moveTo(startPoint.x * canvasElement.width, startPoint.y * canvasElement.height);
        canvasCtx.lineTo(endPoint.x * canvasElement.width, endPoint.y * canvasElement.height);
        canvasCtx.stroke();
    });

    // Draw landmarks
    landmarks.forEach((landmark, index) => {
        const x = landmark.x * canvasElement.width;
        const y = landmark.y * canvasElement.height;

        canvasCtx.beginPath();
        canvasCtx.arc(x, y, 5, 0, 2 * Math.PI);
        canvasCtx.fillStyle = index === 0 ? '#764ba2' : '#667eea';
        canvasCtx.fill();
        canvasCtx.strokeStyle = 'white';
        canvasCtx.lineWidth = 2;
        canvasCtx.stroke();
    });
}

// Detect which gesture is being shown
function detectGesture(landmarks) {
    const fingers = getFingersExtended(landmarks);

    // Thumbs Up: Only thumb extended
    if (fingers.thumb && !fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky) {
        return 'THUMBS UP';
    }

    // Peace Sign: Index and middle fingers extended
    if (!fingers.thumb && fingers.index && fingers.middle && !fingers.ring && !fingers.pinky) {
        return 'PEACE SIGN';
    }

    // Open Palm: All fingers extended
    if (fingers.thumb && fingers.index && fingers.middle && fingers.ring && fingers.pinky) {
        return 'OPEN PALM';
    }

    return null;
}

// Determine which fingers are extended
function getFingersExtended(landmarks) {
    // Finger tip and base indices
    const fingerTips = {
        thumb: 4,
        index: 8,
        middle: 12,
        ring: 16,
        pinky: 20
    };

    const fingerBases = {
        thumb: 2,
        index: 6,
        middle: 10,
        ring: 14,
        pinky: 18
    };

    const fingers = {};

    // Check thumb (horizontal comparison for thumb)
    const thumbTip = landmarks[fingerTips.thumb];
    const thumbBase = landmarks[fingerBases.thumb];
    const wrist = landmarks[0];

    // For thumb, check if tip is further from wrist than base
    const thumbTipDist = Math.sqrt(
        Math.pow(thumbTip.x - wrist.x, 2) +
        Math.pow(thumbTip.y - wrist.y, 2)
    );
    const thumbBaseDist = Math.sqrt(
        Math.pow(thumbBase.x - wrist.x, 2) +
        Math.pow(thumbBase.y - wrist.y, 2)
    );
    fingers.thumb = thumbTipDist > thumbBaseDist * 1.2;

    // Check other fingers (vertical comparison)
    ['index', 'middle', 'ring', 'pinky'].forEach(finger => {
        const tipY = landmarks[fingerTips[finger]].y;
        const baseY = landmarks[fingerBases[finger]].y;

        // Finger is extended if tip is above base (lower y value)
        fingers[finger] = tipY < baseY - 0.05;
    });

    return fingers;
}

// Update the gesture display with confidence tracking
function updateGestureDisplay(detectedGesture) {
    if (detectedGesture === currentGesture) {
        gestureConfidence++;
    } else {
        currentGesture = detectedGesture;
        gestureConfidence = 0;
    }

    // Only update display if gesture is held for enough frames
    if (gestureConfidence >= CONFIDENCE_THRESHOLD) {
        if (currentGesture) {
            detectedGestureElement.textContent = currentGesture;
            detectedGestureElement.classList.add('active');
        } else {
            detectedGestureElement.textContent = 'No gesture detected';
            detectedGestureElement.classList.remove('active');
        }
    } else if (gestureConfidence === 0 && !currentGesture) {
        detectedGestureElement.textContent = 'Show a gesture...';
        detectedGestureElement.classList.remove('active');
    }
}
