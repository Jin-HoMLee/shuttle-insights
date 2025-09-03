/**
 * Pose Drawing Utilities
 * 
 * This module handles the visualization of pose detection results on a canvas overlay.
 * It draws keypoints (joint positions) and skeleton connections for detected poses,
 * as well as bounding boxes around detected persons.
 * 
 * The drawing functions use the MoveNet pose model keypoint structure which includes
 * 17 keypoints for major body joints connected in a specific pattern.
 */

import { POSE_CONFIG } from './constants.js';

/**
 * MoveNet keypoint connections map for drawing skeleton lines
 * Each connection is represented as [startKeypointIndex, endKeypointIndex]
 * Based on the standard human body structure for pose visualization
 */
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

/**
 * Draws pose keypoints on the canvas overlay
 * 
 * Keypoints represent joint positions (e.g., wrists, elbows, knees) detected by
 * the pose estimation model. Only keypoints above the confidence threshold are drawn.
 * 
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context for drawing
 * @param {Array} poses - Array of pose objects from pose detection
 * @param {number} threshold - Minimum confidence score to draw a keypoint (default: 0.2)
 * @param {boolean} debug - Whether to draw debug information like canvas bounds
 */
export function drawKeypoints(ctx, poses, threshold = POSE_CONFIG.CONFIDENCE_THRESHOLD, debug = false) {
  // Clear the entire canvas before drawing new frame
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Draw debug border around canvas if requested
  if (debug) {
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
  
  // Draw keypoints for each detected pose
  poses.forEach(pose => {
    if (!pose.keypoints) return;
    
    pose.keypoints.forEach(keypoint => {
      // Only draw keypoints that meet the confidence threshold
      if (keypoint.score > threshold) {
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
      }
    });
  });
}

/**
 * Draws skeleton lines connecting keypoints and bounding boxes around detected poses
 * 
 * The skeleton provides a visual representation of the detected body structure by
 * connecting related keypoints (e.g., shoulder to elbow, elbow to wrist).
 * Bounding boxes show the overall area occupied by each detected person.
 * 
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context for drawing
 * @param {Array} poses - Array of pose objects from pose detection
 * @param {number} threshold - Minimum confidence score for keypoint connections
 */
export function drawSkeletonAndBoxes(ctx, poses, threshold = POSE_CONFIG.CONFIDENCE_THRESHOLD) {
  poses.forEach(pose => {
    // Draw bounding box if available
    if (pose.box) {
      drawBoundingBox(ctx, pose.box);
    }
    
    // Draw skeleton connections
    if (pose.keypoints) {
      drawSkeleton(ctx, pose.keypoints, threshold);
    }
  });
}

/**
 * Draws a bounding box around a detected pose
 * 
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context
 * @param {Object} box - Bounding box coordinates {xMin, xMax, yMin, yMax}
 */
function drawBoundingBox(ctx, box) {
  const { xMin, xMax, yMin, yMax } = box;
  
  // Validate bounding box coordinates are normalized (0-1 range)
  if (xMin >= 0 && xMin <= 1 && xMax >= 0 && xMax <= 1 &&
      yMin >= 0 && yMin <= 1 && yMax >= 0 && yMax <= 1) {
    
    // Convert normalized coordinates to canvas pixels
    const x = xMin * ctx.canvas.width;
    const y = yMin * ctx.canvas.height;
    const width = (xMax - xMin) * ctx.canvas.width;
    const height = (yMax - yMin) * ctx.canvas.height;
    
    // Draw the bounding box
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
  } else {
    console.warn('Bounding box coordinates are not normalized (0-1). Expected range [0,1], got:', box);
  }
}

/**
 * Draws skeleton connections between keypoints
 * 
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context
 * @param {Array} keypoints - Array of keypoint objects with x, y, score properties
 * @param {number} threshold - Minimum confidence score for drawing connections
 */
function drawSkeleton(ctx, keypoints, threshold) {
  ctx.strokeStyle = 'lime';
  ctx.lineWidth = 2;
  
  // Draw each connection defined in MOVENET_CONNECTIONS
  MOVENET_CONNECTIONS.forEach(([startIndex, endIndex]) => {
    const startKeypoint = keypoints[startIndex];
    const endKeypoint = keypoints[endIndex];
    
    // Only draw connection if both keypoints meet confidence threshold
    if (startKeypoint && endKeypoint && 
        startKeypoint.score > threshold && endKeypoint.score > threshold) {
      
      ctx.beginPath();
      ctx.moveTo(startKeypoint.x, startKeypoint.y);
      ctx.lineTo(endKeypoint.x, endKeypoint.y);
      ctx.stroke();
    }
  });
}