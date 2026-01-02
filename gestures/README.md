# Hand Gesture Recognition App

A simple web application that uses your webcam and AI to recognize hand gestures in real-time.

## Features

- Real-time hand tracking using MediaPipe Hands
- Recognition of three gestures:
  - 👍 **Thumbs Up**
  - ✌️ **Peace Sign** (V sign with index and middle fingers)
  - 🖐️ **Open Palm** (all fingers extended)
- Visual feedback with hand landmark visualization
- Responsive design with beautiful gradient UI

## How to Use

1. Open `index.html` in a modern web browser (Chrome, Edge, or Firefox recommended)
2. Allow camera access when prompted
3. Wait for the AI model to load (a few seconds)
4. Show one of the three gestures to your webcam
5. The detected gesture will appear as text on the screen

## Technical Details

- **Hand Detection**: MediaPipe Hands library
- **Gesture Recognition**: Custom algorithm analyzing finger positions
- **No Installation Required**: All dependencies loaded via CDN
- **Privacy**: All processing happens locally in your browser

## Requirements

- Modern web browser with webcam support
- Camera permissions enabled
- Internet connection (to load MediaPipe library from CDN)

## Gestures Guide

### Thumbs Up 👍
- Extend only your thumb
- Keep all other fingers closed

### Peace Sign ✌️
- Extend your index and middle fingers
- Keep thumb, ring, and pinky fingers closed

### Open Palm 🖐️
- Extend all five fingers
- Keep your hand flat and open

## Tips for Best Results

- Ensure good lighting
- Position your hand clearly in front of the camera
- Keep your hand steady for a moment to allow detection
- Try different distances from the camera if detection is inconsistent

## Browser Compatibility

Works best with:
- Google Chrome 90+
- Microsoft Edge 90+
- Firefox 88+
- Safari 14+

## Privacy Note

This application runs entirely in your browser. No video or images are sent to any server. All hand detection and gesture recognition happens locally on your device.
