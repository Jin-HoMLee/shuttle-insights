// YouTube Shot Labeler injected panel

if (window.top === window && !document.getElementById('yt-shot-labeler-panel')) {
  const SHOT_LABELS = ["net shot", "lift", "clear", "smash", "drop", "drive", "block"];
  let shots = [];
  let currentShot = {start: null, end: null, label: null};

  // Create panel
  const panel = document.createElement('div');
  panel.id = 'yt-shot-labeler-panel';
  panel.innerHTML = `
    <strong style="font-size:16px;">YouTube Shot Labeler</strong>
    <div style="margin:8px 0;">
      <button id="mark-start">Mark Start</button>
      <button id="mark-end">Mark End</button>
      <span id="shot-status" style="margin-left:10px;"></span>
    </div>
    <div id="label-buttons" style="margin-bottom:10px;"></div>
    <button id="save-labels" style="margin-bottom:10px;">Download CSV</button>
    <div id="label-list" style="max-height:120px;overflow:auto;font-size:13px;"></div>
    <button id="yt-shot-labeler-close" title="Close" style="position:absolute;top:4px;right:8px;background:transparent;border:none;font-size:16px;cursor:pointer;">×</button>
  `;

  // Style
  panel.style.position = "fixed";
  panel.style.top = "80px";
  panel.style.right = "40px";
  panel.style.zIndex = 99999;
  panel.style.background = "#fff";
  panel.style.border = "1px solid #222";
  panel.style.padding = "10px 16px 10px 10px";
  panel.style.borderRadius = "8px";
  panel.style.boxShadow = "0 4px 16px #0002";
  panel.style.width = "340px";
  panel.style.fontSize = "14px";
  panel.style.fontFamily = "Arial, sans-serif";
  panel.style.lineHeight = "1.5";
  panel.style.minHeight = "140px";

  document.body.appendChild(panel);

  // Insert label buttons
  const labelDiv = panel.querySelector('#label-buttons');
  SHOT_LABELS.forEach(label => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.className = "yt-shot-labeler-label-btn";
    btn.onclick = () => {
      currentShot.label = label;
      updateStatus();
    };
    labelDiv.appendChild(btn);
  });

  function updateStatus() {
    const status = panel.querySelector('#shot-status');
    status.textContent = `Start: ${currentShot.start !== null ? currentShot.start.toFixed(2)+'s' : "-"} | End: ${currentShot.end !== null ? currentShot.end.toFixed(2)+'s' : "-"} | Label: ${currentShot.label ?? "-"}`;
  }

  // Get YouTube video element
  function getVideo() {
    return document.querySelector("video");
  }

  // Mark start
  panel.querySelector('#mark-start').onclick = () => {
    const video = getVideo();
    if (!video) return;
    currentShot.start = video.currentTime;
    updateStatus();
  };

  // Mark end and save
  panel.querySelector('#mark-end').onclick = () => {
    const video = getVideo();
    if (!video) return;
    if (currentShot.start === null) {
      alert("Please mark the start first!");
      return;
    }
    if (!currentShot.label) {
      alert("Please select a shot label!");
      return;
    }
    currentShot.end = video.currentTime;
    if (currentShot.end <= currentShot.start) {
      alert("End time must be after start time!");
      return;
    }
    shots.push({...currentShot});
    updateShotList();
    currentShot = {start: null, end: null, label: null};
    updateStatus();
  };

  function updateShotList() {
    const listDiv = panel.querySelector('#label-list');
    listDiv.innerHTML = shots.map((shot, i) =>
      `<div>#${i+1}: <b>${shot.label}</b> [${shot.start.toFixed(2)}s - ${shot.end.toFixed(2)}s]</div>`
    ).join("");
  }

  // Export labels as CSV
  panel.querySelector('#save-labels').onclick = () => {
    if (!shots.length) {
      alert("No labels to save!");
      return;
    }
    let csv = 'shot_id,start_sec,end_sec,label\n';
    shots.forEach((shot, idx) => {
      csv += `${idx+1},${shot.start},${shot.end},${shot.label}\n`;
    });
    // Download
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `youtube_labels_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Close panel
  panel.querySelector('#yt-shot-labeler-close').onclick = () => {
    panel.remove();
  };

  updateStatus();
}