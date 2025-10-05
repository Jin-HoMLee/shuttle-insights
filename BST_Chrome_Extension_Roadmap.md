# Technical Roadmap: Real-Time Stroke Detection from YouTube using BST in a Chrome Browser Extension

## Overview
Build a Chrome extension that runs real-time racket sport stroke detection (badminton, tennis) on YouTube or other web video players, leveraging the BST (Badminton Stroke-type Transformer) model pipeline.

---

## 1. Feasibility Study & Requirements

- Assess the ability to access video frames from YouTube/HTML5 players using browser APIs.
- Estimate compute needs for pose estimation, object tracking, and BST inference.
- Decide local (in-browser) vs. backend inference (API server).

---

## 2. Browser Extension Bootstrapping

- Scaffold a Chrome extension with permissions to access video elements.
- Implement UI controls for enabling/disabling analytics overlay.

---

## 3. Video Frame Extraction

- Use JavaScript to grab frames from HTML5 video elements (canvas API).
- Handle frame rate, resolution, and edge cases (e.g., DRM, ads, restricted content).

---

## 4. Pose Estimation (Player Skeletons)

- Integrate browser-compatible pose estimation:
  - **TensorFlow.js PoseNet** ([GitHub](https://github.com/tensorflow/tfjs-models/tree/master/posenet))
  - **TensorFlow.js MoveNet** ([GitHub](https://github.com/tensorflow/tfjs-models/tree/master/movenet))
  - **MediaPipe Pose** ([Docs](https://developers.google.com/mediapipe/solutions/vision/pose))
- Extract 2D skeleton joints for all detected humans in the frame.

---

## 5. Shuttlecock/Ball Tracking

- Prototype with lightweight browser-based ball tracking:
  - **Custom lightweight CNN models** using TensorFlow.js ([Docs](https://www.tensorflow.org/js))
  - **MediaPipe Objectron** (for object tracking; may need adaptation)
  - **OpenCV.js** ([GitHub](https://github.com/opencv/opencv/tree/master/platforms/js)) for classical object detection/tracking
- If performance is insufficient, consider offloading tracking to a backend API.

---

## 6. Court Line Detection & Player Identification

- Use geometric heuristics and/or ML models to detect court lines (OpenCV.js, custom logic).
- Assign skeletons to players based on proximity to court lines and player movement.

---

## 7. Data Pipeline: Feature Extraction

- Gather per-frame:
  - Player pose (joints)
  - Player position (on court)
  - Shuttlecock/ball trajectory
- Cache or batch features for sequential analysis.

---

## 8. Stroke-Type Classification (BST Model)

- Convert a trained BST model to TensorFlow.js, ONNX.js, or WebAssembly for browser inference.
  - If infeasible, send feature batch to backend API for inference.
- Run stroke classification on extracted features.

---

## 9. UI Overlay & Analytics

- Overlay detected strokes, trajectories, and player stats on video using HTML5/canvas/SVG.
- Provide summary dashboards, download/export options.

---

## 10. Evaluation & Optimization

- Benchmark FPS, latency, and accuracy on test videos.
- Profile CPU/GPU usage and memory footprint.
- Optimize model size and quantization for browser deployment.
- Test cross-platform (Windows, Mac, Linux, Chromebook).

---

## 11. Documentation & User Guide

- Document setup, permissions, extension installation, and troubleshooting.
- Provide developer notes for ML pipeline and backend integration (if any).

---

## 12. Optional: Backend API for Heavy Models

- Host full BST pipeline on a server (Flask, FastAPI, Node.js).
- Chrome extension sends batched features/video snippets via REST API for inference.
- Return results for overlay.

---

# Recommended Browser-Based ML Libraries and APIs

- **TensorFlow.js** ([https://www.tensorflow.org/js](https://www.tensorflow.org/js))
  - Browser-based deep learning; supports pose estimation, object detection, custom models.
- **MediaPipe** ([https://developers.google.com/mediapipe](https://developers.google.com/mediapipe))
  - High-performance vision models for pose, face, hands. Can run in browser via WASM.
- **ONNX.js** ([https://github.com/microsoft/onnxjs](https://github.com/microsoft/onnxjs))
  - ONNX model runtime for JavaScript; supports various deep learning models.
- **OpenCV.js** ([https://docs.opencv.org/4.x/d5/d10/tutorial_js_root.html](https://docs.opencv.org/4.x/d5/d10/tutorial_js_root.html))
  - Classical computer vision in browser; good for geometric detection and simple tracking.
- **WebAssembly (WASM) ML Models**
  - Compile PyTorch/TensorFlow/ONNX models to WASM for browser use.

---

## Example APIs for Backend Inference

- **TensorFlow Serving** ([https://www.tensorflow.org/tfx/guide/serving](https://www.tensorflow.org/tfx/guide/serving))
- **FastAPI / Flask REST API**
- **Node.js Express API**

---

## Useful References & Demos

- [TensorFlow.js PoseNet Demo](https://storage.googleapis.com/tfjs-models/demos/posenet/camera.html)
- [MediaPipe Pose Demo](https://mediapipe.dev/demo/pose.html)
- [OpenCV.js Tutorials](https://docs.opencv.org/4.x/d5/d10/tutorial_js_root.html)

---

# Next Steps

1. Try integrating pose estimation (TensorFlow.js/MediaPipe) on a sample YouTube video in Chrome.
2. Prototype basic ball tracking with OpenCV.js or lightweight CNN.
3. Prepare BST model for browser inference, or set up backend API for classification.
4. Build UI overlay for results; benchmark performance.

---
