import os
import hashlib

def download_video(url, output_dir="../data/raw"):
    os.makedirs(output_dir, exist_ok=True)
    try:
        from yt_dlp import YoutubeDL
    except ImportError:
        raise RuntimeError("yt-dlp Python package is not installed. Run `pip install yt-dlp`.")

    # Create a safe, unique filename from the URL
    url_hash = hashlib.sha256(url.encode("utf-8")).hexdigest()
    filename = f"{url_hash}.mp4"
    ydl_opts = {
        'format': 'mp4',
        'outtmpl': f'{output_dir}/{filename}',
    }
    with YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

    # Return the expected mp4 file path
    mp4_path = os.path.join(output_dir, filename)
    if os.path.exists(mp4_path):
        return mp4_path
    raise FileNotFoundError(f"No MP4 file found after download: {mp4_path}")