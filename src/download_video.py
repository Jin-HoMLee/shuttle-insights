import os
import hashlib

def download_video(url, output_dir="../data/videos"):
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