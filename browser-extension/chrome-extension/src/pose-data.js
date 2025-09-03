/**
 * Pose Data Collection and Management
 * 
 * This module handles the collection, storage, and export of pose data during
 * video labeling sessions. It collects pose keypoints when the overlay is active
 * and associates them with labeled shots for export and analysis.
 * 
 * Data Format:
 * - Frame-level pose data with timestamps
 * - Keypoint coordinates (x, y) and confidence scores
 * - Compatible with ASL signs dataset format for ML training
 */

import { POSE_DATA_CONFIG, POSE_CONFIG } from './constants.js';
import { getVideo } from './video-utils.js';

// Global pose data storage
let poseDataCollection = [];
let currentSessionId = null;
let lastCollectionTime = 0;

/**
 * Initializes pose data collection for a new session
 * @param {string} videoUrl - URL of the current video
 * @param {string} videoTitle - Title of the current video
 */
export function initPoseDataCollection(videoUrl, videoTitle) {
  currentSessionId = generateSessionId(videoUrl);
  poseDataCollection = [];
  lastCollectionTime = 0;
  console.log('Pose data collection initialized for session:', currentSessionId);
}

/**
 * Collects pose data from the current frame if overlay is active
 * @param {Array} poses - Array of detected poses from pose estimation
 * @param {number} videoCurrentTime - Current video playback time in seconds
 */
export function collectPoseData(poses, videoCurrentTime) {
  if (!currentSessionId || !poses || poses.length === 0) {
    return;
  }
  
  const currentTime = Date.now();
  
  // Throttle collection to avoid excessive data
  if (currentTime - lastCollectionTime < POSE_DATA_CONFIG.COLLECTION_INTERVAL_MS) {
    return;
  }
  
  const frameData = {
    session_id: currentSessionId,
    frame_timestamp: videoCurrentTime,
    collection_timestamp: currentTime,
    poses: poses.map(pose => processPoseForStorage(pose))
  };
  
  poseDataCollection.push(frameData);
  lastCollectionTime = currentTime;
}

/**
 * Processes a pose object for storage, extracting keypoints and metadata
 * @param {Object} pose - Raw pose object from pose detection
 * @returns {Object} Processed pose data
 */
function processPoseForStorage(pose) {
  if (!pose || !pose.keypoints) {
    return null;
  }
  
  const processedPose = {
    score: pose.score || 0,
    keypoints: []
  };
  
  // Process each keypoint
  pose.keypoints.forEach((keypoint, index) => {
    const keypointName = POSE_DATA_CONFIG.KEYPOINT_NAMES[index] || `keypoint_${index}`;
    processedPose.keypoints.push({
      name: keypointName,
      x: keypoint.x || 0,
      y: keypoint.y || 0,
      score: keypoint.score || 0
    });
  });
  
  // Add bounding box if available
  if (pose.box) {
    processedPose.box = {
      xMin: pose.box.xMin,
      xMax: pose.box.xMax,
      yMin: pose.box.yMin,
      yMax: pose.box.yMax
    };
  }
  
  return processedPose;
}

/**
 * Gets pose data for a specific time range (for associating with shots)
 * @param {number} startTime - Start time in seconds
 * @param {number} endTime - End time in seconds
 * @returns {Array} Array of pose data frames within the time range
 */
export function getPoseDataForTimeRange(startTime, endTime) {
  if (!poseDataCollection.length) {
    return [];
  }
  
  return poseDataCollection.filter(frame => 
    frame.frame_timestamp >= startTime && frame.frame_timestamp <= endTime
  );
}

/**
 * Associates pose data with a shot and returns a unique identifier
 * @param {Object} shot - Shot object with start and end times
 * @returns {string} Pose data identifier for the shot
 */
export function associatePoseDataWithShot(shot) {
  if (!shot.start || !shot.end || !currentSessionId) {
    return null;
  }
  
  const poseData = getPoseDataForTimeRange(shot.start, shot.end);
  const poseDataId = `${currentSessionId}_shot_${Date.now()}`;
  
  // Store the association (in a real implementation, this might go to a database)
  const shotPoseData = {
    id: poseDataId,
    shot_start: shot.start,
    shot_end: shot.end,
    shot_label: shot.label,
    frames: poseData,
    created_at: new Date().toISOString()
  };
  
  // Store in session storage for export
  storePoseDataForShot(poseDataId, shotPoseData);
  
  return poseDataId;
}

/**
 * Stores pose data for a specific shot in browser storage
 * @param {string} poseDataId - Unique identifier for the pose data
 * @param {Object} shotPoseData - Complete pose data for the shot
 */
function storePoseDataForShot(poseDataId, shotPoseData) {
  try {
    const storageKey = `poseData_${poseDataId}`;
    localStorage.setItem(storageKey, JSON.stringify(shotPoseData));
  } catch (error) {
    console.warn('Failed to store pose data:', error);
  }
}

/**
 * Retrieves all stored pose data for export
 * @returns {Array} Array of all shot pose data
 */
export function getAllStoredPoseData() {
  const poseDataKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('poseData_')) {
      poseDataKeys.push(key);
    }
  }
  
  return poseDataKeys.map(key => {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (error) {
      console.warn('Failed to parse pose data:', key, error);
      return null;
    }
  }).filter(data => data !== null);
}

/**
 * Exports pose data for a specific shot in the specified format
 * @param {string} poseDataId - Identifier for the pose data to export
 * @param {string} format - Export format ('json', 'csv', 'parquet')
 * @returns {Blob|null} Exportable data blob or null if not found
 */
export function exportPoseDataForShot(poseDataId, format = 'json') {
  const storageKey = `poseData_${poseDataId}`;
  const shotPoseData = localStorage.getItem(storageKey);
  
  if (!shotPoseData) {
    console.warn('Pose data not found for ID:', poseDataId);
    return null;
  }
  
  const data = JSON.parse(shotPoseData);
  
  switch (format.toLowerCase()) {
    case 'json':
      return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    
    case 'csv':
      return exportPoseDataAsCSV(data);
    
    case 'parquet':
      // For now, export as JSON with parquet-compatible structure
      // In a full implementation, you'd use a parquet library
      return exportPoseDataAsParquet(data);
    
    default:
      console.warn('Unsupported export format:', format);
      return null;
  }
}

/**
 * Exports all pose data in batch
 * @param {string} format - Export format
 * @param {string} baseFilename - Base filename for the export
 */
export function exportAllPoseData(format = 'json', baseFilename = 'pose_data') {
  const allPoseData = getAllStoredPoseData();
  
  if (allPoseData.length === 0) {
    alert('No pose data available for export.');
    return;
  }
  
  allPoseData.forEach((shotData, index) => {
    const blob = exportPoseDataForShot(shotData.id, format);
    if (blob) {
      const filename = `${baseFilename}_shot_${index + 1}_${shotData.shot_label || 'unlabeled'}.${format}`;
      downloadBlob(blob, filename);
    }
  });
}

/**
 * Converts pose data to CSV format
 * @param {Object} shotPoseData - Pose data for a shot
 * @returns {Blob} CSV data blob
 */
function exportPoseDataAsCSV(shotPoseData) {
  const headers = ['frame_timestamp', 'pose_id', 'pose_score'];
  
  // Add keypoint headers (x, y, score for each keypoint)
  POSE_DATA_CONFIG.KEYPOINT_NAMES.forEach(name => {
    headers.push(`${name}_x`, `${name}_y`, `${name}_score`);
  });
  
  let csvContent = headers.join(',') + '\n';
  
  shotPoseData.frames.forEach(frame => {
    frame.poses.forEach((pose, poseIndex) => {
      if (!pose) return;
      
      const row = [
        frame.frame_timestamp,
        poseIndex,
        pose.score || 0
      ];
      
      // Add keypoint data
      pose.keypoints.forEach(kp => {
        row.push(kp.x || 0, kp.y || 0, kp.score || 0);
      });
      
      csvContent += row.join(',') + '\n';
    });
  });
  
  return new Blob([csvContent], { type: 'text/csv' });
}

/**
 * Exports pose data in parquet-compatible JSON format
 * @param {Object} shotPoseData - Pose data for a shot
 * @returns {Blob} Parquet-compatible JSON data blob
 */
function exportPoseDataAsParquet(shotPoseData) {
  // Structure data similar to ASL signs dataset format
  const parquetCompatibleData = {
    metadata: {
      shot_id: shotPoseData.id,
      shot_label: shotPoseData.shot_label,
      shot_start: shotPoseData.shot_start,
      shot_end: shotPoseData.shot_end,
      created_at: shotPoseData.created_at,
      total_frames: shotPoseData.frames.length
    },
    frames: shotPoseData.frames.map(frame => ({
      frame_timestamp: frame.frame_timestamp,
      poses: frame.poses.map(pose => {
        if (!pose) return null;
        
        const poseRecord = { score: pose.score };
        
        // Flatten keypoints into individual columns
        pose.keypoints.forEach(kp => {
          poseRecord[`${kp.name}_x`] = kp.x;
          poseRecord[`${kp.name}_y`] = kp.y;
          poseRecord[`${kp.name}_score`] = kp.score;
        });
        
        return poseRecord;
      }).filter(pose => pose !== null)
    }))
  };
  
  return new Blob([JSON.stringify(parquetCompatibleData, null, 2)], { 
    type: 'application/json',
    // Add a custom property to indicate this is parquet-compatible
    filename: 'parquet-compatible.json'
  });
}

/**
 * Downloads a blob as a file
 * @param {Blob} blob - Data to download
 * @param {string} filename - Name of the file
 */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates a unique session ID based on video URL
 * @param {string} videoUrl - Current video URL
 * @returns {string} Session identifier
 */
function generateSessionId(videoUrl) {
  // Create a simple hash of the video URL + timestamp
  const timestamp = Date.now();
  const urlHash = btoa(videoUrl).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  return `session_${urlHash}_${timestamp}`;
}

/**
 * Cleans up pose data collection (useful when switching videos)
 */
export function cleanupPoseDataCollection() {
  poseDataCollection = [];
  currentSessionId = null;
  lastCollectionTime = 0;
  console.log('Pose data collection cleaned up');
}

/**
 * Gets current pose data collection statistics
 * @returns {Object} Statistics about current collection
 */
export function getPoseDataStats() {
  return {
    sessionId: currentSessionId,
    totalFrames: poseDataCollection.length,
    collectionActive: currentSessionId !== null,
    lastCollectionTime: lastCollectionTime,
    storedShots: getAllStoredPoseData().length
  };
}