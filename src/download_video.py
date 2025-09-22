"""
YouTube Video Downloader Module

This module provides functionality to download YouTube videos for badminton analysis.
It uses yt-dlp to download videos in MP4 format and organizes them in structured directories.

Key Features:
- Downloads YouTube videos using yt-dlp
- Creates unique directories based on URL hash to avoid conflicts
- Ensures consistent MP4 output format
- Provides error handling for missing dependencies and failed downloads

Usage Example:
    from src.download_video import download_video
    
    video_dir = download_video("https://youtube.com/watch?v=VIDEO_ID")
    video_path = f"{video_dir}/video.mp4"

Dependencies:
    - yt-dlp: For YouTube video downloading
    - hashlib: For creating unique directory names
    - os: For directory management

Author: Jin-HoMLee
Last Updated: September 2024
"""

import os
import hashlib


def download_video(url, output_dir="../data/videos"):
    """
    Download a YouTube video for badminton analysis.
    
    Downloads a video from the given URL and saves it as MP4 format in a 
    uniquely named directory based on the URL hash. This prevents filename
    conflicts when downloading multiple videos.
    
    Args:
        url (str): YouTube video URL to download
        output_dir (str, optional): Base directory for video storage. 
                                  Defaults to "../data/videos".
    
    Returns:
        str: Path to the directory containing the downloaded video.mp4 file
    
    Raises:
        RuntimeError: If yt-dlp package is not installed
        FileNotFoundError: If the download fails and no video file is created
    
    Example:
        >>> video_dir = download_video("https://youtube.com/watch?v=dQw4w9WgXcQ")
        >>> print(f"Video saved to: {video_dir}/video.mp4")
    """
    os.makedirs(output_dir, exist_ok=True)
    try:
        from yt_dlp import YoutubeDL
    except ImportError:
        raise RuntimeError("yt-dlp Python package is not installed. Run `pip install yt-dlp`.")

    # Create a safe, unique url_hash from the URL
    url_hash = hashlib.sha256(url.encode("utf-8")).hexdigest()
    ydl_opts = {
        'format': 'mp4',
        'outtmpl': f'{output_dir}/{url_hash}/video.mp4',
    }
    with YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

    # Return the expected mp4 file path
    video_dir = os.path.join(output_dir, url_hash)
    if os.path.exists(video_dir):
        return video_dir
    raise FileNotFoundError(f"No video.mp4 file found in {video_dir}")