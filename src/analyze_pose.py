import cv2
import mediapipe as mp
import os
import pandas as pd

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=True)

def analyze_poses(frame_dir='../data/output/frames', output_csv='../data/output/pose_data.csv'):
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
