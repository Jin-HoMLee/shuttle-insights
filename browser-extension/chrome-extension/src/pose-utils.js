/**
 * Pose Detection Utility Functions
 * Contains utilities for TensorFlow.js pose detection setup and management
 */

// Import TensorFlow.js modules
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

import { POSE_CONFIG } from './constants.js';

/**
 * Sets up and initializes the pose detector
 * Configures TensorFlow.js backend and creates MoveNet detector
 * @returns {Promise<Object>} Initialized pose detector instance
 * @throws {Error} If pose detector setup fails
 */
export async function setupDetector() {
  try {
    // Set up WebGL backend for better performance
    await tf.setBackend('webgl');
    await tf.ready();
    
    // Create MoveNet pose detector with multi-pose configuration
    const detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      { 
        modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
        enableSmoothing: true,
        enableSegmentation: false
      }
    );
    
    console.log('Pose detector initialized successfully');
    return detector;
    
  } catch (error) {
    console.error('Failed to setup pose detector:', error);
    throw new Error(`Pose detector initialization failed: ${error.message}`);
  }
}

/**
 * Estimates poses from a video element
 * @param {Object} detector - Initialized pose detector
 * @param {HTMLVideoElement} video - Video element to analyze
 * @param {Object} options - Detection options
 * @param {number} options.maxPoses - Maximum number of poses to detect
 * @param {number} options.scoreThreshold - Minimum confidence score
 * @returns {Promise<Array>} Array of detected poses
 */
export async function estimatePoses(detector, video, options = {}) {
  if (!detector || !video) {
    throw new Error('Detector and video element are required');
  }
  
  const config = {
    maxPoses: options.maxPoses || POSE_CONFIG.MAX_POSES,
    scoreThreshold: options.scoreThreshold || POSE_CONFIG.CONFIDENCE_THRESHOLD
  };
  
  try {
    const poses = await detector.estimatePoses(video, config);
    return poses || [];
  } catch (error) {
    console.warn('Pose estimation failed:', error);
    return [];
  }
}

/**
 * Validates if a pose object has the required structure
 * @param {Object} pose - Pose object to validate
 * @returns {boolean} True if pose is valid
 */
export function isValidPose(pose) {
  return !!(pose && 
           pose.keypoints && 
           Array.isArray(pose.keypoints) && 
           pose.keypoints.length > 0);
}

/**
 * Filters poses by confidence score
 * @param {Array} poses - Array of pose objects
 * @param {number} threshold - Minimum confidence threshold
 * @returns {Array} Filtered array of poses
 */
export function filterPosesByConfidence(poses, threshold = POSE_CONFIG.CONFIDENCE_THRESHOLD) {
  if (!Array.isArray(poses)) return [];
  
  return poses.filter(pose => {
    if (!isValidPose(pose)) return false;
    
    // Check if pose has sufficient confident keypoints
    const confidentKeypoints = pose.keypoints.filter(kp => kp.score > threshold);
    return confidentKeypoints.length >= 5; // Require at least 5 confident keypoints
  });
}

/**
 * Gets the bounding box for a pose
 * @param {Object} pose - Pose object
 * @returns {Object|null} Bounding box {xMin, xMax, yMin, yMax} or null
 */
export function getPoseBoundingBox(pose) {
  if (!isValidPose(pose)) return null;
  
  // If pose already has a box, return it
  if (pose.box) return pose.box;
  
  // Calculate bounding box from keypoints
  const validKeypoints = pose.keypoints.filter(kp => kp.score > POSE_CONFIG.CONFIDENCE_THRESHOLD);
  if (validKeypoints.length === 0) return null;
  
  const xs = validKeypoints.map(kp => kp.x);
  const ys = validKeypoints.map(kp => kp.y);
  
  return {
    xMin: Math.min(...xs),
    xMax: Math.max(...xs),
    yMin: Math.min(...ys),
    yMax: Math.max(...ys)
  };
}

/**
 * Checks if TensorFlow.js is properly initialized
 * @returns {Promise<boolean>} True if TensorFlow.js is ready
 */
export async function isTensorFlowReady() {
  try {
    await tf.ready();
    return tf.getBackend() !== null;
  } catch (error) {
    console.warn('TensorFlow.js not ready:', error);
    return false;
  }
}

/**
 * Gets TensorFlow.js backend information for debugging
 * @returns {Object} Backend information
 */
export function getTensorFlowInfo() {
  return {
    backend: tf.getBackend(),
    version: tf.version_core || 'unknown', // tf.version_core is undefined in some TensorFlow.js builds (e.g., custom or minified)
    environment: tf.env(),
    memory: tf.memory()
  };
}

/**
 * Cleans up TensorFlow.js resources
 * Disposes of tensors and clears backend
 */
export function cleanupTensorFlow() {
  try {
    // Dispose any remaining tensors
    tf.disposeVariables();
    
    // Note: Don't dispose the backend as it might be needed for other parts
    console.log('TensorFlow.js cleanup completed');
  } catch (error) {
    console.warn('TensorFlow.js cleanup warning:', error);
  }
}