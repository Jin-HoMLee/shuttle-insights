/**
 * Pose Data Collection Module
 * 
 * This module handles collection of pose keypoint data during video overlay sessions.
 * It collects pose data only when the overlay is active and associates it with labeled shots.
 * Data is structured according to the ASL Signs competition format for consistency.
 * 
 * Features:
 * - Frame-by-frame pose data collection
 * - Association with shot labels
 * - Export in parquet-compatible format
 * - Player and sequence ID management
 */

import { POSE_DATA_CONFIG, POSE_CONFIG } from './constants.js';
import { getVideo } from './video-utils.js';

// Global state for pose data collection
let isCollecting = false;
let collectedPoseData = []; // All collected pose data across sessions
let shotPoseData = new Map(); // Map of shot ID to pose data arrays
let currentFrameNumber = 0;
let currentRowId = 0;
let currentPlayerId = 1; // Default player ID, can be configurable

/**
 * Starts pose data collection
 * Called when pose overlay is activated
 */
export function startPoseDataCollection() {
  isCollecting = true;
  currentFrameNumber = 0;
  currentRowId = 0;
  console.log('Started pose data collection');
}

/**
 * Stops pose data collection
 * Called when pose overlay is deactivated
 */
export function stopPoseDataCollection() {
  isCollecting = false;
  console.log(`Stopped pose data collection. Collected ${collectedPoseData.length} pose data points`);
}

/**
 * Collects pose data for current frame
 * This is called from the pose overlay loop when poses are detected
 * 
 * @param {Array} poses - Array of detected poses from pose estimation
 */
export function collectPoseData(poses) {
  if (!isCollecting || !poses || poses.length === 0) {
    return;
  }

  const video = getVideo();
  if (!video) return;

  // Calculate frame number based on video current time and fps
  const currentTime = video.currentTime;
  const estimatedFps = 30; // Approximate fps, could be more precise
  const frameNumber = Math.round(currentTime * estimatedFps);
  
  // Process each detected pose
  poses.forEach((pose, poseIndex) => {
    if (!pose.keypoints) return;
    
    // Process each keypoint in the pose
    pose.keypoints.forEach((keypoint, keypointIndex) => {
      // Only collect keypoints above confidence threshold
      if (keypoint.score > POSE_CONFIG.CONFIDENCE_THRESHOLD) {
        const poseDataPoint = {
          frame: frameNumber,
          row_id: currentRowId++,
          type: POSE_DATA_CONFIG.KEYPOINT_NAMES[keypointIndex] || `keypoint_${keypointIndex}`,
          keypoint_index: keypointIndex,
          x: keypoint.x / video.videoWidth, // Normalize to 0-1 range
          y: keypoint.y / video.videoHeight, // Normalize to 0-1 range
          z: keypoint.z || 0, // MoveNet may not provide z coordinate
          confidence: keypoint.score,
          pose_index: poseIndex, // Track which pose this keypoint belongs to
          timestamp: currentTime
        };
        
        collectedPoseData.push(poseDataPoint);
      }
    });
  });
}

/**
 * Associates collected pose data with a shot
 * Called when a shot is saved/labeled
 * 
 * @param {Object} shot - Shot object with start, end, label, etc.
 * @param {number} shotId - Unique identifier for the shot
 */
export function associatePoseDataWithShot(shot, shotId) {
  if (!shot.start || !shot.end) {
    console.warn('Cannot associate pose data: shot missing start or end time');
    return;
  }

  // Filter pose data that falls within the shot timeframe
  const shotData = collectedPoseData.filter(dataPoint => {
    return dataPoint.timestamp >= shot.start && dataPoint.timestamp <= shot.end;
  });

  if (shotData.length > 0) {
    shotPoseData.set(shotId, shotData);
    console.log(`Associated ${shotData.length} pose data points with shot ${shotId}`);
  } else {
    console.warn(`No pose data found for shot ${shotId} (${shot.start}s - ${shot.end}s)`);
  }
}

/**
 * Gets collected pose data for a specific shot
 * 
 * @param {number} shotId - Shot identifier
 * @returns {Array} Array of pose data points for the shot
 */
export function getPoseDataForShot(shotId) {
  return shotPoseData.get(shotId) || [];
}

/**
 * Gets all collected pose data
 * 
 * @returns {Array} All collected pose data points
 */
export function getAllCollectedPoseData() {
  return [...collectedPoseData];
}

/**
 * Clears all collected pose data
 * Useful for starting a new session
 */
export function clearAllPoseData() {
  collectedPoseData = [];
  shotPoseData.clear();
  currentRowId = 0;
  console.log('Cleared all pose data');
}

/**
 * Gets pose data collection status
 * 
 * @returns {Object} Status information
 */
export function getPoseDataStatus() {
  return {
    isCollecting,
    totalDataPoints: collectedPoseData.length,
    shotsWithData: shotPoseData.size,
    currentRowId,
    currentPlayerId
  };
}

/**
 * Exports pose data for a shot in the required format
 * 
 * @param {number} shotId - Shot identifier
 * @param {number} sequenceId - Sequence identifier for filename
 * @returns {Object} Export data with filename and content
 */
export function exportShotPoseData(shotId, sequenceId) {
  const shotData = getPoseDataForShot(shotId);
  
  if (shotData.length === 0) {
    throw new Error(`No pose data available for shot ${shotId}`);
  }

  // Format data according to the specification
  const formattedData = shotData.map(point => ({
    frame: point.frame,
    row_id: point.row_id,
    type: point.type,
    keypoint_index: point.keypoint_index,
    x: point.x,
    y: point.y,
    z: point.z
  }));

  const filename = `${currentPlayerId}/${sequenceId}.parquet`;
  
  return {
    filename,
    data: formattedData,
    metadata: {
      shotId,
      sequenceId,
      playerId: currentPlayerId,
      totalFrames: Math.max(...formattedData.map(d => d.frame)) - Math.min(...formattedData.map(d => d.frame)) + 1,
      totalKeypoints: formattedData.length,
      startFrame: Math.min(...formattedData.map(d => d.frame)),
      endFrame: Math.max(...formattedData.map(d => d.frame))
    }
  };
}

/**
 * Sets the current player ID
 * 
 * @param {number} playerId - Player identifier
 */
export function setCurrentPlayerId(playerId) {
  currentPlayerId = playerId;
}

/**
 * Gets the current player ID
 * 
 * @returns {number} Current player identifier
 */
export function getCurrentPlayerId() {
  return currentPlayerId;
}