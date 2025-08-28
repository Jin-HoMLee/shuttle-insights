// MoveNet keypoint connections map (for skeleton lines)
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

// Draw pose keypoints on canvas 
// The canvas element is for display and layout.
// The context (ctx) is for drawing and rendering graphics.
// All drawing operations are performed on the context (ctx), not the canvas element itself.
export function drawKeypoints(ctx, poses, threshold = 0.2) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
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
// The bounding box coordinates (xMin, xMax, yMin, yMax) are expected to be normalized (0-1).
if (pose.box) {
  const { xMin, xMax, yMin, yMax } = pose.box;
  if (
    xMin >= 0 && xMin <= 1 &&
    xMax >= 0 && xMax <= 1 &&
    yMin >= 0 && yMin <= 1 &&
    yMax >= 0 && yMax <= 1
  ) {
    const x = xMin * ctx.canvas.width;
    const y = yMin * ctx.canvas.height;
    const width = (xMax - xMin) * ctx.canvas.width;
    const height = (yMax - yMin) * ctx.canvas.height;
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
  } else {
    console.warn('Bounding box coordinates are not normalized (0-1):', pose.box);
  }
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