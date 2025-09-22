"""
Pose Analysis Module

This module provides pose estimation functionality for badminton video analysis.
It uses MediaPipe to detect and analyze human poses in image frames, extracting
landmark coordinates for further analysis and machine learning.

Key Features:
- Pose detection using MediaPipe Pose solution
- Batch processing of image directories
- CSV export of pose landmark data
- 3D coordinate extraction (x, y, z) for each pose landmark

Usage Example:
    from src.analyze_pose import analyze_poses
    
    analyze_poses(frame_dir="data/frames", output_csv="data/pose_data.csv")

Dependencies:
    - mediapipe: For pose estimation and landmark detection
    - opencv-python (cv2): For image processing
    - pandas: For data organization and CSV export
    - os: For file system operations

Author: Jin-HoMLee
Last Updated: September 2024
"""

import cv2
import mediapipe as mp
import os
import pandas as pd

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=True)


def analyze_poses(frame_dir='../data/output/frames', output_csv='../data/output/pose_data.csv'):
    """
    Analyze poses in a directory of image frames and save results to CSV.
    
    Processes all JPEG images in the specified directory using MediaPipe pose estimation.
    Extracts 3D landmark coordinates for detected poses and saves them in a structured
    CSV format suitable for machine learning and analysis.
    
    Args:
        frame_dir (str, optional): Directory containing image frames to analyze.
                                 Defaults to '../data/output/frames'.
        output_csv (str, optional): Path for output CSV file.
                                  Defaults to '../data/output/pose_data.csv'.
    
    Returns:
        None: Function saves results to CSV and prints completion message
    
    Output Format:
        CSV with columns: frame, x_0, y_0, z_0, x_1, y_1, z_1, ...
        where numbers correspond to MediaPipe pose landmark indices
    
    Example:
        >>> analyze_poses("extracted_frames/", "badminton_poses.csv")
        Pose data saved to badminton_poses.csv
        
    Note:
        - Only processes .jpg files in the directory
        - Skips frames where no pose is detected
        - Coordinates are normalized (0-1 range for x,y; relative depth for z)
        - MediaPipe provides 33 pose landmarks per detected person
    """
    data = []
    for fname in sorted(os.listdir(frame_dir)):
        if not fname.endswith('.jpg'):
            continue
        img = cv2.imread(os.path.join(frame_dir, fname))
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = pose.process(img_rgb)
        if results.pose_landmarks:
            row = {"frame": fname}
            for i, lm in enumerate(results.pose_landmarks.landmark):
                row[f"x_{i}"] = lm.x
                row[f"y_{i}"] = lm.y
                row[f"z_{i}"] = lm.z
            data.append(row)
    df = pd.DataFrame(data)
    df.to_csv(output_csv, index=False)
    print(f"Pose data saved to {output_csv}")
