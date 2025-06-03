# Shuttle Insights

A local pipeline to analyze badminton videos using pose estimation.

## Steps
1. Download video
2. Extract frames
3. Analyze poses
4. Visualize in Jupyter Notebook

## Directory Structure

```css
shuttle-insights/
├── data/
│   ├── raw/            # Original downloaded videos
│   └── processed/       # Cleaned or clipped videos
├── output/
│   ├── frames/         # Extracted frames
│   ├── pose_data.csv    # Landmarks from Mediapipe
│   └── visualizations/   # Charts or overlaid images
├── notebooks/
│   └── analysis.ipynb  # Exploration and visualization
├── src/
│   ├── __init__.py
│   ├── download_video.py
│   ├── extract_frames.py
│   ├── analyze_pose.py
│   └── utils.py
├── requirements.txt
└── README.md
```

## Setup

Use the requirements file in this repo to create a new environment.

```BASH
make setup

#or

pyenv local 3.11.3
python -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

The `requirements.txt` file contains the libraries needed for deployment.. of model or dashboard .. thus no jupyter or other libs used during development.

## Quick Start

```bash
python src/download_video.py <YouTube_URL>
python src/extract_frames.py
python src/analyze_pose.py
```
