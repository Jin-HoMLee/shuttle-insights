// CSV import/export logic

export function setupCSV(panel, shots, updateShotList, videoUrl, sanitizedTitle) {
  // Import
  const loadBtn = panel.querySelector('#load-csv');
  const fileInput = panel.querySelector('#csv-file-input');
  loadBtn.onclick = () => fileInput.click();
  fileInput.onchange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.trim().split('\n');
      if (lines.length < 2) return;
      const header = lines[0].split(',').map(s => s.trim());
      
      // Find column indices
      const idxStart = header.indexOf('start_sec');
      const idxEnd = header.indexOf('end_sec');
      const idxLabel = header.indexOf('label');
      const idxLongPos = header.indexOf('longitudinal_position');
      const idxLatPos = header.indexOf('lateral_position');
      const idxTiming = header.indexOf('timing');
      const idxIntention = header.indexOf('intention');
      const idxImpact = header.indexOf('impact');
      const idxDirection = header.indexOf('direction');
      
      shots.length = 0;
      lines.slice(1).forEach(line => {
        const parts = [];
        let part = '', inQuotes = false;
        for (let c of line) {
          if (c === '"') inQuotes = !inQuotes;
          else if (c === ',' && !inQuotes) { parts.push(part); part = ''; }
          else part += c;
        }
        parts.push(part);
        
        if (!isNaN(parts[idxStart]) && !isNaN(parts[idxEnd]) && parts[idxLabel]) {
          const shot = {
            start: parseFloat(parts[idxStart]),
            end: parseFloat(parts[idxEnd]),
            label: parts[idxLabel]?.replace(/^"|"$/g, '') ?? ''
          };
          
          // Add dimension fields if they exist in CSV
          if (idxLongPos >= 0) shot.longitudinalPosition = parts[idxLongPos]?.replace(/^"|"$/g, '') || null;
          if (idxLatPos >= 0) shot.lateralPosition = parts[idxLatPos]?.replace(/^"|"$/g, '') || null;
          if (idxTiming >= 0) shot.timing = parts[idxTiming]?.replace(/^"|"$/g, '') || null;
          if (idxIntention >= 0) shot.intention = parts[idxIntention]?.replace(/^"|"$/g, '') || null;
          if (idxImpact >= 0) shot.impact = parts[idxImpact]?.replace(/^"|"$/g, '') || null;
          if (idxDirection >= 0) shot.direction = parts[idxDirection]?.replace(/^"|"$/g, '') || null;
          
          shots.push(shot);
        }
      });
      updateShotList();
    };
    reader.readAsText(file);
  };

  // Export
  panel.querySelector('#save-labels').onclick = () => {
    if (!shots.length) {
      alert("No labels to save!");
      return;
    }
  let csv = 'video_url,shot_id,start_sec,end_sec,label,longitudinal_position,lateral_position,timing,intention,impact,direction\n';
    shots.forEach((shot, idx) => {
      const safeLabel = `"${(shot.label ?? '').replace(/"/g, '""')}"`;
      const safeUrl = `"${videoUrl.replace(/"/g, '""')}"`;
      const safeLongPos = `"${(shot.longitudinalPosition ?? '').replace(/"/g, '""')}"`;
      const safeLatPos = `"${(shot.lateralPosition ?? '').replace(/"/g, '""')}"`;
      const safeTiming = `"${(shot.timing ?? '').replace(/"/g, '""')}"`;
      const safeIntention = `"${(shot.intention ?? '').replace(/"/g, '""')}"`;
      const safeImpact = `"${(shot.impact ?? '').replace(/"/g, '""')}"`;
      const safeDirection = `"${(shot.direction ?? '').replace(/"/g, '""')}"`;
      
  csv += `${safeUrl},${idx + 1},${shot.start},${shot.end},${safeLabel},${safeLongPos},${safeLatPos},${safeTiming},${safeIntention},${safeImpact},${safeDirection}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const reader = new FileReader();
    reader.onload = () => {
      chrome.runtime.sendMessage({
        action: "download-csv",
        filename: `YouTube Shot Labeler/${sanitizedTitle}/labeled_shots.csv`,
        dataUrl: reader.result
      });
    };
    reader.readAsDataURL(blob);
  };
}
