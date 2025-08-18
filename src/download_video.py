import os

def download_video(url, output_dir="../data/raw"):
    os.makedirs(output_dir, exist_ok=True)
    try:
        from yt_dlp import YoutubeDL
    except ImportError:
        raise RuntimeError("yt-dlp Python package is not installed. Run `pip install yt-dlp`.")

    ydl_opts = {
        'format': 'mp4',
        'outtmpl': f'{output_dir}/%(title).50s.%(ext)s',
    }
    with YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

    # Return the first mp4 file in the folder
    for f in os.listdir(output_dir):
        if f.endswith(".mp4"):
            return os.path.join(output_dir, f)
    raise FileNotFoundError("No MP4 file found after download.")