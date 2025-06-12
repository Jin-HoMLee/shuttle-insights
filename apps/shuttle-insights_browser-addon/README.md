# YouTube Shot Labeler Extension

This browser extension lets you label shots/events in any YouTube video and export the results as a CSV file.

## How to Use

1. **Download and Unzip:**
   - Download all files (`manifest.json`, `content.js`, `styles.css`, `README.md`) into a folder.
   - Zip the folder if you want to keep it as a package.

2. **Load as Unpacked Extension:**
   - Open `chrome://extensions` in Chrome (or your browser's extensions page).
   - Enable "Developer mode".
   - Click "Load unpacked" and select your folder.

3. **Go to YouTube:**
   - Open any YouTube video.
   - A panel will appear at the top right.

4. **Labeling:**
   - Play/pause the video. 
   - Click "Mark Start" at the start of an event, select a shot label, then "Mark End" at the end.
   - Repeat for as many shots as you want.
   - Click "Download CSV" to export the labels.

5. **Remove the Panel:**
   - Click the `×` button to close the panel.

## Features

- Works on any YouTube video page.
- Lets you label shots/events using customizable buttons.
- Download all labels as a CSV file.
- Non-destructive: no changes to the video or your YouTube account.

## Customization

- To add new labels, edit the `SHOT_LABELS` array in `content.js`.

---

**Enjoy!**