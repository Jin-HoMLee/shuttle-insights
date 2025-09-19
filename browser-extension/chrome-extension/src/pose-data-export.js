/**
 * Pose Data Export Module
 * 
 * This module handles the export of collected pose data in various formats.
 * It supports CSV export (compatible with parquet conversion) and manages
 * the folder structure and file naming according to the specification.
 * 
 * Features:
 * - Export pose data as CSV (parquet-compatible format)
 * - Proper folder structure: train_keypoint_files/[player_id]/[sequence_id].csv
 * - Batch export of all shot pose data
 * - File download management
 */

import { POSE_DATA_CONFIG } from './constants.js';
import { exportShotPoseData, getAllCollectedPoseData, getPoseDataStatus } from './pose-data-collector.js';
import { showSuccess, showError } from './ui-utils.js';

/**
 * Converts pose data to CSV format
 * 
 * @param {Array} poseData - Array of pose data points
 * @returns {string} CSV formatted string
 */
function convertToCSV(poseData) {
  if (!poseData || poseData.length === 0) {
    return 'frame,row_id,type,keypoint_index,x,y,z\n';
  }

  const headers = ['frame', 'row_id', 'type', 'keypoint_index', 'x', 'y', 'z'];
  const csvRows = [headers.join(',')];

  poseData.forEach(dataPoint => {
    const row = [
      dataPoint.frame,
      dataPoint.row_id,
      `"${dataPoint.type}"`, // Quote the type field in case it contains spaces
      dataPoint.keypoint_index,
      dataPoint.x.toFixed(6), // High precision for coordinates
      dataPoint.y.toFixed(6),
      dataPoint.z.toFixed(6)
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}

/**
 * Downloads a file with the given content
 * 
 * @param {string} content - File content
 * @param {string} filename - Desired filename
 * @param {string} mimeType - MIME type for the file
 */
function downloadFile(content, filename, mimeType = 'text/csv') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Exports pose data for a single shot
 * 
 * @param {number} shotId - Shot identifier
 * @param {number} sequenceId - Sequence identifier
 * @param {Object} shot - Shot object for metadata
 * @returns {Promise<string>} Filename of exported file
 */
export async function exportSingleShotPoseData(shotId, sequenceId, shot) {
  try {
    const exportData = exportShotPoseData(shotId, sequenceId);
    const csvContent = convertToCSV(exportData.data);
    
    // Use CSV extension for now (can be converted to parquet later)
    const filename = exportData.filename.replace('.parquet', '.csv');
    
    downloadFile(csvContent, filename);
    
    return filename;
  } catch (error) {
    console.error('Failed to export shot pose data:', error);
    throw new Error(`Export failed: ${error.message}`);
  }
}

/**
 * Exports pose data for all shots in batch
 * Creates a zip-like structure with multiple files
 * 
 * @param {Array} shots - Array of shot objects
 * @returns {Promise<Object>} Export summary
 */
export async function exportAllShotsPoseData(shots) {
  const exportSummary = {
    successCount: 0,
    errorCount: 0,
    files: [],
    errors: []
  };

  for (let i = 0; i < shots.length; i++) {
    const shot = shots[i];
    const shotId = i + 1;
    const sequenceId = shotId; // Use shot ID as sequence ID for simplicity
    
    try {
      const filename = await exportSingleShotPoseData(shotId, sequenceId, shot);
      exportSummary.files.push(filename);
      exportSummary.successCount++;
    } catch (error) {
      console.error(`Failed to export shot ${shotId}:`, error);
      exportSummary.errors.push(`Shot ${shotId}: ${error.message}`);
      exportSummary.errorCount++;
    }
  }

  return exportSummary;
}

/**
 * Exports all collected pose data as a single comprehensive file
 * Useful for analysis and debugging
 * 
 * @param {string} videoTitle - Video title for filename
 * @returns {Promise<string>} Filename of exported file
 */
export async function exportAllPoseData(videoTitle = 'video') {
  try {
    const allPoseData = getAllCollectedPoseData();
    
    if (allPoseData.length === 0) {
      throw new Error('No pose data available to export');
    }

    const csvContent = convertToCSV(allPoseData);
    const sanitizedTitle = videoTitle.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const filename = `all_pose_data_${sanitizedTitle}_${timestamp}.csv`;
    
    downloadFile(csvContent, filename);
    
    return filename;
  } catch (error) {
    console.error('Failed to export all pose data:', error);
    throw new Error(`Export failed: ${error.message}`);
  }
}

/**
 * Creates a manifest file listing all exported pose data files
 * 
 * @param {Array} shots - Array of shot objects
 * @param {string} videoTitle - Video title for context
 * @returns {Promise<string>} Manifest filename
 */
export async function createPoseDataManifest(shots, videoTitle = 'video') {
  try {
    const status = getPoseDataStatus();
    const timestamp = new Date().toISOString();
    
    const manifest = {
      video_title: videoTitle,
      video_url: window.location.href,
      export_timestamp: timestamp,
      player_id: status.currentPlayerId,
      total_shots: shots.length,
      total_data_points: status.totalDataPoints,
      shots_with_data: status.shotsWithData,
      shots: shots.map((shot, index) => ({
        shot_id: index + 1,
        sequence_id: index + 1,
        label: shot.label,
        start_time: shot.start,
        end_time: shot.end,
        duration: shot.end - shot.start,
        filename: `${status.currentPlayerId}/${index + 1}.csv`,
        longitudinal_position: shot.longitudinalPosition,
        lateral_position: shot.lateralPosition,
        timing: shot.timing,
        intention: shot.intention
      }))
    };

    const manifestContent = JSON.stringify(manifest, null, 2);
    const sanitizedTitle = videoTitle.replace(/[^a-zA-Z0-9]/g, '_');
    const manifestFilename = `pose_data_manifest_${sanitizedTitle}.json`;
    
    downloadFile(manifestContent, manifestFilename, 'application/json');
    
    return manifestFilename;
  } catch (error) {
    console.error('Failed to create pose data manifest:', error);
    throw new Error(`Manifest creation failed: ${error.message}`);
  }
}

/**
 * Validates pose data before export
 * 
 * @param {Array} poseData - Pose data to validate
 * @returns {Object} Validation result
 */
export function validatePoseDataForExport(poseData) {
  const result = {
    isValid: true,
    warnings: [],
    errors: [],
    stats: {
      totalPoints: poseData.length,
      uniqueFrames: new Set(poseData.map(p => p.frame)).size,
      uniqueKeypoints: new Set(poseData.map(p => p.type)).size,
      frameRange: {
        min: Math.min(...poseData.map(p => p.frame)),
        max: Math.max(...poseData.map(p => p.frame))
      }
    }
  };

  if (poseData.length === 0) {
    result.isValid = false;
    result.errors.push('No pose data to export');
    return result;
  }

  // Check for missing required fields
  const requiredFields = ['frame', 'row_id', 'type', 'keypoint_index', 'x', 'y', 'z'];
  const missingFields = requiredFields.filter(field => 
    !poseData.every(point => point.hasOwnProperty(field))
  );

  if (missingFields.length > 0) {
    result.isValid = false;
    result.errors.push(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Check coordinate ranges (should be normalized 0-1)
  const invalidCoords = poseData.filter(point => 
    point.x < 0 || point.x > 1 || point.y < 0 || point.y > 1
  );

  if (invalidCoords.length > 0) {
    result.warnings.push(`${invalidCoords.length} data points have coordinates outside 0-1 range`);
  }

  return result;
}