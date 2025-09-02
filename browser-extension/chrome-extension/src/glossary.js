// glossary.js
export function setupGlossaryButtons(panel, getCurrentShot, updateStatus) {
  const labelDiv = panel.querySelector('#label-buttons');
  const dimensionDiv = panel.querySelector('#dimension-controls');
  labelDiv.innerHTML = "";  // Clear old buttons
  dimensionDiv.innerHTML = "";  // Clear old dimension controls

  fetch(chrome.runtime.getURL('badminton_shots_glossary.json'))
    .then(r => r.json())
    .then(glossaryData => {
      // Setup shot buttons from the shots array
      if (glossaryData.shots) {
        const shotSection = document.createElement('div');
        shotSection.className = "yt-shot-labeler-category-section";
        const shotHeader = document.createElement('div');
        shotHeader.textContent = "Shots";
        shotHeader.className = "yt-shot-labeler-category-title";
        shotSection.appendChild(shotHeader);

        glossaryData.shots.forEach(shot => {
          const btn = document.createElement('button');
          btn.textContent = shot.term;
          btn.className = "yt-shot-labeler-label-btn";
          btn.title = shot.definition;

          btn.onclick = () => {
            const currentShot = getCurrentShot();
            currentShot.label = shot.term;
            labelDiv.querySelectorAll('button').forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");
            updateStatus();
          };

          shotSection.appendChild(btn);
        });

        labelDiv.appendChild(shotSection);
      }

      // Setup dimension controls (new functionality)
      if (glossaryData.dimensions) {
        const dimensionSection = document.createElement('div');
        dimensionSection.className = "yt-shot-labeler-category-section";

        const dimensionHeader = document.createElement('div');
        dimensionHeader.textContent = 'Shot Dimensions';
        dimensionHeader.className = "yt-shot-labeler-category-title";
        dimensionHeader.style.marginTop = "10px";
        dimensionSection.appendChild(dimensionHeader);

        glossaryData.dimensions.forEach(dimension => {
          const dimSection = document.createElement('div');
          dimSection.className = "yt-shot-labeler-dimension-section";
          dimSection.style.marginBottom = "8px";

          const dimLabel = document.createElement('div');
          dimLabel.textContent = dimension.term + ':';
          dimLabel.style.fontSize = "12px";
          dimLabel.style.fontWeight = "bold";
          dimLabel.style.marginBottom = "4px";
          dimLabel.title = dimension.description;
          dimSection.appendChild(dimLabel);

          const dimButtonGroup = document.createElement('div');
          dimButtonGroup.className = "yt-shot-labeler-dimension-buttons";
          dimButtonGroup.style.display = "flex";
          dimButtonGroup.style.gap = "4px";
          dimButtonGroup.style.flexWrap = "wrap";

          dimension.values.forEach(value => {
            const btn = document.createElement('button');
            btn.textContent = value.term;
            btn.className = "yt-shot-labeler-dimension-btn";
            btn.title = value.description;
            btn.style.fontSize = "11px";
            btn.style.padding = "2px 6px";
            btn.style.border = "1px solid #ccc";
            btn.style.borderRadius = "3px";
            btn.style.background = "#f9f9f9";
            btn.style.cursor = "pointer";

            btn.onclick = () => {
              const currentShot = getCurrentShot();
              const dimensionKey = getDimensionKey(dimension.term);
              currentShot[dimensionKey] = value.term;
              // Update button states for this dimension
              dimButtonGroup.querySelectorAll('button').forEach(b => {
                b.style.background = "#f9f9f9";
                b.style.color = "#333";
              });
              btn.style.background = "#007cba";
              btn.style.color = "white";
              updateStatus();
            };

            dimButtonGroup.appendChild(btn);
          });

          dimSection.appendChild(dimButtonGroup);
          dimensionSection.appendChild(dimSection);
        });

        dimensionDiv.appendChild(dimensionSection);
      }
    });
}

// Helper function to map dimension names to object keys
function getDimensionKey(dimensionTerm) {
  const mapping = {
    'Longitudinal Position': 'longitudinalPosition',
    'Lateral Position': 'lateralPosition',
    'Timing': 'timing',
    'Intention': 'intention',
  // 'Stroke': 'stroke', // removed
    'Impact': 'impact',
    'Direction': 'direction'
  };
  return mapping[dimensionTerm] || dimensionTerm.toLowerCase().replace(/\s+/g, '');
}