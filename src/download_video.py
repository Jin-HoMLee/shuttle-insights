import os
import subprocess

def download_video(url, output_dir="../data/raw"):
    os.makedirs(output_dir, exist_ok=True)
    try:
        cmd = [
            "yt-dlp",
            "-f", "mp4",
            "-o", f"{output_dir}/%(title).50s.%(ext)s",
            url
        ]
        subprocess.run(cmd, check=True)
        print("✅ Video downloaded successfully.")
        
        # Return the first mp4 file in the folder
        for f in os.listdir(output_dir):
            if f.endswith(".mp4"):
                return os.path.join(output_dir, f)

        raise FileNotFoundError("No MP4 file found after download.")

    except subprocess.CalledProcessError as e:
        print(f"❌ Download failed: {e}")
        raise
