const PANEL_ID = 'yt-shot-labeler-panel';

import { formatDateTime, sanitize, getVideoTitle, getVideo } from './utils.js';
import { addResizeHandles } from './resize.js';
import { addDragBehavior } from './drag.js';
import { setupCSV } from './csv.js';
import { setupGlossaryButtons } from './glossary.js';

export function createLabelerPanel() {
  if (document.getElementById(PANEL_ID)) return;

  let shots = [];
  let currentShot = { 
    start: null, 
    end: null, 
    label: null,
    longitudinalPosition: null,
    lateralPosition: null,
    timing: null,
    intention: null,
    impact: null,
    direction: null
  };

  const now = new Date();
  const dateTimeStr = formatDateTime(now);
  const videoTitle = getVideoTitle();
  const sanitizedTitle = sanitize(videoTitle) || "video";
  const videoUrl = window.location.href;

  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.innerHTML = `
    <div id="yt-shot-labeler-header" class="yt-shot-labeler-section-title">
      <button id="yt-shot-labeler-close" title="Close" style="float:right;background:transparent;border:none;font-size:18px;cursor:pointer;">×</button>
      <strong style="font-size:16px;">YouTube Badminton Shot Labeler</strong>
    </div>
    <div id="yt-shot-labeler-content">
      <div class="yt-shot-labeler-section">
        <div class="yt-shot-labeler-section-title">Video Details</div>
        <div class="yt-shot-labeler-info">
          <div><b>Date/Time:</b> <span id="yt-shot-labeler-datetime">${dateTimeStr}</span></div>
          <div><b>Video Title:</b> <span id="yt-shot-labeler-videotitle">${videoTitle}</span></div>
          <div style="max-width:310px;word-break:break-all;"><b>URL:</b> <span id="yt-shot-labeler-url">${videoUrl}</span></div>
        </div>
      </div>
      <div class="yt-shot-labeler-section">
        <div class="yt-shot-labeler-section-title">Overlay Poses</div>
        <button id="custom-action-btn" style="margin-bottom:10px;">Custom Action</button>
      </div>
      <hr>
      <div class="yt-shot-labeler-section">
        <div class="yt-shot-labeler-section-title">Load Existing Labels</div>
        <button id="load-csv" style="margin-bottom:10px;">Load existing CSV</button>
        <input type="file" id="csv-file-input" accept=".csv" style="display:none;">
      </div>
      <hr>
      <div class="yt-shot-labeler-section">
        <div class="yt-shot-labeler-section-title">Label a Shot</div>
        <div style="margin:8px 0;">
          <button id="mark-start">Mark Start</button>
          <span id="shot-status" style="margin-left:10px;"></span>
        </div>
        <div id="label-buttons" style="margin-bottom:10px;"></div>
        <div id="dimension-controls" style="margin-bottom:10px;"></div>
        <button id="mark-end" style="margin-bottom:10px;">Mark End</button>
      </div>
      <hr>
      <div class="yt-shot-labeler-section">
        <div class="yt-shot-labeler-section-title">Labeled Shots</div>
        <div id="label-list" style="max-height:120px;overflow:auto;font-size:13px;margin-bottom:10px;"></div>
      </div>
      <hr>
      <div class="yt-shot-labeler-section">
        <div class="yt-shot-labeler-section-title">Export Labels</div>
        <button id="save-labels" style="margin-bottom:2px;">Download CSV</button>
      </div>
    </div>
  `;

  // Panel style
  Object.assign(panel.style, {
    position: "fixed", top: "80px", right: "40px", zIndex: 99999,
    background: "#fff", border: "1px solid #222", padding: "0",
    borderRadius: "8px", boxShadow: "0 4px 16px #0002", width: "360px",
    fontSize: "14px", fontFamily: "Arial, sans-serif", lineHeight: "1.5",
    userSelect: "none", transition: "box-shadow 0.2s", overflow: "hidden",
    backgroundClip: "padding-box", display: "flex", flexDirection: "column",
    maxHeight: "90vh", minWidth: "320px", minHeight: "200px", resize: "none"
  });

  addResizeHandles(panel);
  document.body.appendChild(panel);

  // Add event listener for custom action button
  const customBtn = panel.querySelector('#custom-action-btn');
  if (customBtn) {
    customBtn.textContent = 'Start Overlay';
    customBtn.dataset.state = 'stopped';
    customBtn.onclick = () => {
      if (customBtn.dataset.state === 'stopped') {
        window.dispatchEvent(new CustomEvent('pose-overlay-control', { detail: { action: 'start' } }));
        customBtn.textContent = 'Stop Overlay';
        customBtn.dataset.state = 'started';
      } else {
        window.dispatchEvent(new CustomEvent('pose-overlay-control', { detail: { action: 'stop' } }));
        customBtn.textContent = 'Start Overlay';
        customBtn.dataset.state = 'stopped';
      }
    };
  }

  // Make scrollable
  const observer = new MutationObserver(() => {
    const content = panel.querySelector('#yt-shot-labeler-content');
    if (content) {
      content.style.flex = "1 1 auto";
      content.style.overflowY = "auto";
      content.style.overflowX = "hidden";
      observer.disconnect();
    }
  });
  observer.observe(panel, { childList: true, subtree: true });

  addDragBehavior(panel);

  function updateStatus() {
    const status = panel.querySelector('#shot-status');
    const dimensions = [];
    if (currentShot.longitudinalPosition) dimensions.push(`Pos: ${currentShot.longitudinalPosition}`);
    if (currentShot.timing) dimensions.push(`Time: ${currentShot.timing}`);
    if (currentShot.intention) dimensions.push(`Intent: ${currentShot.intention}`);
    
    const dimensionText = dimensions.length > 0 ? ` | ${dimensions.join(' | ')}` : '';
    status.textContent = `Start: ${currentShot.start !== null ? currentShot.start.toFixed(2) + 's' : "-"} | End: ${currentShot.end !== null ? currentShot.end.toFixed(2) + 's' : "-"} | Label: ${currentShot.label ?? '-'}${dimensionText}`;
  }

  function updateShotList() {
    const listDiv = panel.querySelector('#label-list');
    listDiv.innerHTML = shots.length === 0
      ? `<div style="color:#999;">No shots labeled yet.</div>`
      : shots.map((shot, i) => {
          const dimensions = [];
          if (shot.intention) dimensions.push(shot.intention);
          if (shot.longitudinalPosition) dimensions.push(shot.longitudinalPosition);
          
          const dimensionText = dimensions.length > 0 ? ` (${dimensions.join(', ')})` : '';
          
          return `<div style="display:flex;align-items:center;gap:6px;">
            <div style="flex:1;">#${i + 1}: <b>${shot.label}</b>${dimensionText} [${shot.start.toFixed(2)}s - ${shot.end.toFixed(2)}s]</div>
            <button title="Delete" class="yt-shot-labeler-delete" data-index="${i}" style="background:transparent;border:none;cursor:pointer;font-size:15px;">🗑️</button>
          </div>`;
        }).join("");
    listDiv.querySelectorAll('.yt-shot-labeler-delete').forEach(btn => {
      btn.onclick = function () {
        const idx = parseInt(btn.getAttribute('data-index'));
        shots.splice(idx, 1);
        updateShotList();
      };
    });
  }

  // Initial rendering of label buttons
  setupGlossaryButtons(panel, () => currentShot, updateStatus);

  panel.querySelector('#mark-start').onclick = () => {
    const video = getVideo();
    if (!video) return;
    currentShot.start = video.currentTime;
    updateStatus();
  };

  panel.querySelector('#mark-end').onclick = () => {
    const video = getVideo();
    if (!video) return;
    if (currentShot.start === null) {
      alert("Please mark the start first!"); return;
    }
    if (!currentShot.label) {
      alert("Please select a shot label!"); return;
    }
    currentShot.end = video.currentTime;
    if (currentShot.end <= currentShot.start) {
      alert("End time must be after start time!"); return;
    }
    shots.push({ ...currentShot });
    updateShotList();
    currentShot = { 
      start: null, 
      end: null, 
      label: null,
      longitudinalPosition: null,
      lateralPosition: null,
      timing: null,
      intention: null,
      impact: null,
      direction: null
    };
    updateStatus();
    // --- Re-render label buttons for the new shot object so handlers are fresh ---
    setupGlossaryButtons(panel, () => currentShot, updateStatus);
  };

  setupCSV(panel, shots, updateShotList, videoUrl, sanitizedTitle);

  panel.querySelector('#yt-shot-labeler-close').onclick = () => {
    window.dispatchEvent(new CustomEvent('pose-overlay-control', { detail: { action: 'stop' } }));
    panel.remove();
  };

  updateStatus();
}

export function togglePanel() {
  const panel = document.getElementById(PANEL_ID);
  if (panel) {
    window.dispatchEvent(new CustomEvent('pose-overlay-control', { detail: { action: 'stop' } }));
    panel.remove();
  } else {
    createLabelerPanel();
  }
}
