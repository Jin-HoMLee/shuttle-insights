# YouTube Badminton Shot Labeler Extension

This browser extension lets you label shots/events in any YouTube video and export the results as a CSV file.

## How to Use

1. **Download Extensions Folder:**
   - Download `chrome-extension` folder.

2. **Load as Unpacked Extension:**
   - Open `chrome://extensions` in Chrome (or your browser's extensions page).
   - Enable "Developer mode".
   - Click "Load unpacked" and select your folder.

3. **Go to YouTube:**
   - Open any YouTube video.
   - Click the extension icon to show/hide the labeling panel.

4. **Labeling:**
   - Play/pause the video. 
   - Click "Mark Start" at the start of an event, select a shot label, then "Mark End" at the end.
   - Repeat for as many shots as you want.
   - Each shot can be deleted (🗑️) from the list.
   - Click "Download CSV" to export the labels (button is below the shot list).

5. **Move the Panel:**
   - Drag the panel by its title bar to reposition anywhere in the window.

6. **Close/Reopen the Panel:**
   - Click the `×` button to close the panel.
   - Click the extension icon again to bring it back.

## Features

- Show/hide panel with the extension icon.
- Movable (draggable) panel.
- Displays current date/time, video title, and URL at the top.
- Works on any YouTube video page.
- Lets you label shots/events using customizable buttons.
- Download all labels as a CSV file.
- Delete shots if mis-labeled.
- Non-destructive: no changes to the video or your YouTube account.

## Customization

- To add new labels, edit the `chrome-extension/badminton_shots_glossary.json` file.
- After making changes, rebuild the extension using `npm run build` (see Packaging section below).

## Packaging / Rebuilding
After changing code in browser-extension/chrome-extension/src the files should be packaged / rebuilt again via node: 

1. Move into the chrome extension folder, e.g.  
```
cd shuttle-insights/browser-extension/chrome-extension
``` 
2. Run packaging with
```
npm run build
```


---

**Enjoy!**

## Credits

The badminton shots glossary [badminton_shots_glossary.json](chrome-extension/badminton_shots_glossary.json) in this repository is adapted and modified from [WorldBadminton.com Glossary](https://www.worldbadminton.com/glossary.htm). 

Special thanks to GitHub Copilot Chat Assistant for guidance and coding help during development.

Developed by Jin-HoMLee. 