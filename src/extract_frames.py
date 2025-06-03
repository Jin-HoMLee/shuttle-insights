import cv2
import os

def extract_frames(video_path, output_dir='../data/output/frames', every_nth=5):
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
