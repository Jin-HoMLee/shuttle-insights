"""
Video Frame Extraction Module

This module provides functionality to extract frames from video files for pose analysis.
It uses OpenCV to read video files and extract frames at specified intervals.

Key Features:
- Extracts frames from video files at configurable intervals
- Saves frames as JPEG images with sequential naming
- Creates output directories automatically
- Provides progress feedback during extraction

Usage Example:
    from src.extract_frames import extract_frames
    
    extract_frames("path/to/video.mp4", output_dir="data/frames", every_nth=5)

Dependencies:
    - opencv-python (cv2): For video processing and frame extraction
    - os: For directory management

Author: Jin-HoMLee
Last Updated: September 2024
"""

import cv2
import os


def extract_frames(video_path, output_dir='../data/output/frames', every_nth=5):
    """
    Extract frames from a video file at specified intervals.
    
    Reads a video file and extracts frames at regular intervals, saving them
    as JPEG images. This is useful for creating training data for pose analysis
    or reducing video data to manageable frame sequences.
    
    Args:
        video_path (str): Path to the input video file
        output_dir (str, optional): Directory to save extracted frames. 
                                  Defaults to '../data/output/frames'.
        every_nth (int, optional): Extract every nth frame (1=every frame, 5=every 5th frame).
                                 Defaults to 5.
    
    Returns:
        None: Function prints completion message and saves frames to disk
    
    Example:
        >>> extract_frames("video.mp4", "frames/", every_nth=10)
        Frames saved to frames/
        
    Note:
        - Creates output directory if it doesn't exist
        - Frame files are named as "frame_{frame_id}.jpg"
        - Higher every_nth values reduce output size but may miss important poses
    """
    os.makedirs(output_dir, exist_ok=True)
    cap = cv2.VideoCapture(video_path)
    frame_id = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if frame_id % every_nth == 0:
            filename = os.path.join(output_dir, f"frame_{frame_id}.jpg")
            cv2.imwrite(filename, frame)
        frame_id += 1
    cap.release()
    print(f"Frames saved to {output_dir}")
