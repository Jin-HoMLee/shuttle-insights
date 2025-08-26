// MoveNet keypoint connections (for skeleton lines)
const MOVENET_CONNECTIONS = [
  [0, 1], [1, 3], [0, 2], [2, 4], // Head to shoulders
  [5, 7], [7, 9], // Left arm
  [6, 8], [8, 10], // Right arm
  [5, 6], // Shoulders
  [5, 11], [6, 12], // Torso
  [11, 12], // Hips
  [11, 13], [13, 15], // Left leg
  [12, 14], [14, 16]  // Right leg
];

// Draw pose keypoints on overlay canvas
export function drawKeypoints(canvas, poses, threshold = 0.2) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  poses.forEach(pose => {
    pose.keypoints.forEach(kp => {
      if (kp.score > threshold) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
      }
    });
  });
}

// Draw skeleton lines and bounding boxes
export function drawSkeletonAndBoxes(ctx, poses, threshold = 0.2) {
  poses.forEach(pose => {
// Draw bounding box if available
if (pose.box) {
  // Use normalized coordinates (0-1) if needed, or scale to canvas size
  const x = pose.box.xMin * ctx.canvas.width;
  const y = pose.box.yMin * ctx.canvas.height;
  const width = (pose.box.xMax - pose.box.xMin) * ctx.canvas.width;
  const height = (pose.box.yMax - pose.box.yMin) * ctx.canvas.height;
  ctx.strokeStyle = 'blue';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);
}

    // Draw skeleton lines
    ctx.strokeStyle = 'lime';
    ctx.lineWidth = 2;
    MOVENET_CONNECTIONS.forEach(([i, j]) => {
      const kp1 = pose.keypoints[i];
      const kp2 = pose.keypoints[j];
      if (kp1.score > threshold && kp2.score > threshold) {
        ctx.beginPath();
        ctx.moveTo(kp1.x, kp1.y);
        ctx.lineTo(kp2.x, kp2.y);
        ctx.stroke();
      }
    });
  });
}