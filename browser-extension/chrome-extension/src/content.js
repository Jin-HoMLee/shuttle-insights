import { createLabelerPanel } from './panel.js';

// === Vertex AI Pose Overlay Logic ===
// Vertex AI endpoint configuration
const PROJECT_ID = '495366704424';
const LOCATION = 'us-central1';
const ENDPOINT_ID = '912861832379629568'; // <-- Change this value only
const VERTEX_AI_ENDPOINT = `https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/endpoints/${ENDPOINT_ID}:predict`;

// Create overlay canvas
function createOverlayCanvas(video) {
  let canvas = document.getElementById('pose-overlay-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'pose-overlay-canvas';
    canvas.style.position = 'absolute';
    canvas.style.left = video.offsetLeft + 'px';
    canvas.style.top = video.offsetTop + 'px';
    canvas.style.pointerEvents = 'none';
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    video.parentElement.appendChild(canvas);
  }
  return canvas;
}

// Capture current video frame as a 384x640 RGB int32 array
function getFrameData(video) {
  // Resize to 128x224 for MoveNet (multiples of 32, preserves aspect ratio)
  const targetWidth = 224;
  const targetHeight = 128;
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
  // Get image data as Uint8ClampedArray
  const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight).data;
  // Convert to nested array [384][640][3] and int32
  const arr = [];
  for (let y = 0; y < targetHeight; y++) {
    const row = [];
    for (let x = 0; x < targetWidth; x++) {
      const idx = (y * targetWidth + x) * 4;
      // [R, G, B] only, ignore alpha
      row.push([
        imageData[idx],
        imageData[idx + 1],
        imageData[idx + 2]
      ]);
    }
    arr.push(row);
  }
  return arr;
}

// Send frame to Vertex AI endpoint
async function predictPose(frameData, accessToken) {
  const payload = {
    instances: [frameData] // Now a [384,640,3] int32 array
  };
  // Debug: log payload shape and type
  console.log('Vertex AI payload:', {
    shape: [frameData.length, frameData[0]?.length, frameData[0]?.[0]?.length],
    sample: frameData[0]?.[0],
    type: typeof frameData[0]?.[0]?.[0],
    payload: payload
  });
  const response = await fetch(VERTEX_AI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Vertex AI error:', response.status, errorText);
    throw new Error(`Vertex AI error: ${response.status} ${errorText}`);
  }
  return response.json();
}

// Draw keypoints on overlay canvas
function drawKeypoints(canvas, predictions) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!predictions || !predictions.length) return;
  predictions.forEach(person => {
    if (!person.keypoints) return;
    person.keypoints.forEach(kp => {
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'red';
      ctx.fill();
    });
    // Optionally draw skeleton lines here
  });
}

// Get OAuth token from background script
function getAccessToken() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: 'get-oauth-token' }, (response) => {
      if (response && response.token) {
        resolve(response.token);
      } else {
        reject(response && response.error ? response.error : 'No token received');
      }
    });
  });
}

// Main polling loop with authentication
let overlayInterval = null;

// Main polling loop with authentication
async function startPoseOverlay() {
  const video = document.querySelector('video');
  if (!video || video.videoWidth === 0) return;
  const overlay = createOverlayCanvas(video);
  try {
    const accessToken = await getAccessToken();
    overlayInterval = setInterval(async () => {
      const frameData = getFrameData(video);
      try {
        const result = await predictPose(frameData, accessToken);
        drawKeypoints(overlay, result.predictions);
      } catch (e) {
        // Optionally log errors
      }
    }, 1000); // 1 FPS
  } catch (err) {
    console.error('Failed to get OAuth token:', err);
  }
}

function stopPoseOverlay() {
  if (overlayInterval) {
    clearInterval(overlayInterval);
    overlayInterval = null;
    const canvas = document.getElementById('pose-overlay-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
}

// Listen for start/stop overlay events from panel button
window.addEventListener('pose-overlay-control', (e) => {
  if (e.detail.action === 'start') {
    startPoseOverlay();
  } else if (e.detail.action === 'stop') {
    stopPoseOverlay();
  }
});

// Overlay is now controlled only by the panel button

const PANEL_ID = 'yt-shot-labeler-panel';

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "toggle-panel") {
    const panel = document.getElementById(PANEL_ID);
    if (panel) {
      panel.remove();
    } else {
      createLabelerPanel();
    }
  }
});