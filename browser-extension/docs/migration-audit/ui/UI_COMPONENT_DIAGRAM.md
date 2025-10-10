# UI Component Structure Diagram

-> back to [README](../README.md)

## Visual Component Hierarchy

```
┌──────────────────────────────────────────────────────────────┐
│ YouTube Badminton Shot Labeler Panel (#yt-shot-labeler-panel)│
├──────────────────────────────────────────────────────────────┤
│ 🏸 YouTube Badminton Shot Labeler                      [×]   │ ← Header
├──────────────────────────────────────────────────────────────┤
│ 📹 Video Details                                             │
│   • 2024-09-24 10:47:32                                      │
│   • Video Title: [Dynamic YouTube Video Title]               │
│   • URL: https://www.youtube.com/watch?v=...                 │
├──────────────────────────────────────────────────────────────┤
│ 🎯 Pose Overlay                                              │
│   [🔴 Start Overlay] [⏹️ Stop Overlay] Status: Offline       │
├──────────────────────────────────────────────────────────────┤
│ 📂 Load Data                                                 │
│   [📁 Load Existing CSV]                                     │
├──────────────────────────────────────────────────────────────┤
│ 🎬 Label Shot                                                │
│   [▶️ Mark Start] [⏹️ Mark End]                              │
│   Status: Ready to mark shot start                           │
│                                                              │
│   Shot Types (Glossary Buttons):                             │
│   ┌──────────────────────────────────────────────────────┐   │
│   │ Shots                                                │   │
│   │ [Serve] [Clear] [Drop] [Smash] [Half Smash]          │   │
│   │ [Lift] [Net Shot] [(Net) Kill] [Push]                │   │
│   │ [Drive] [Block]                                      │   │
│   └──────────────────────────────────────────────────────┘   │
│                                                              │
│   Advanced Dimensions (Collapsible): ▼                       │
│   ┌──────────────────────────────────────────────────────┐   │
│   │ Longitudinal Position:                               │   │
│   │ [front] [middle] [rear]                              │   │
│   │                                                      │   │
│   │ Lateral Position:                                    │   │
│   │ [left] [middle] [right]                              │   │
│   │                                                      │   │
│   │ Timing:                                              │   │
│   │ [early] [normal] [late]                              │   │
│   │                                                      │   │
│   │ Intention:                                           │   │
│   │ [attacking] [neutral] [defending]                    │   │
│   │                                                      │   │
│   │ Impact Quality:                                      │   │
│   │ [perfect] [good] [poor]                              │   │
│   │                                                      │   │
│   │ Shot Direction:                                      │   │
│   │ [cross-court] [straight] [down-the-line]             │   │
│   └──────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────┤
│ 📋 Labeled Shots                                             │
│   ┌──────────────────────────────────────────────────────┐   │
│   │ Shot 1: Smash (0:15-0:17) [🗑️]                       │   │
│   │ Shot 2: Clear (0:32-0:34) [🗑️]                       │   │
│   │ Shot 3: Drop (1:05-1:07) [🗑️]                        │   │
│   │ ... (scrollable list)                                │   │
│   └──────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────┤
│ 💾 Export                                                    │
│   [⬇️ Download CSV]                                          │
├──────────────────────────────────────────────────────────────┤
│ ❓ Quick Help                                                │
│   • S - Mark shot start                                      │
│   • E - Mark shot end                                        │
│   • O - Toggle pose overlay                                  │
│   • Esc - Close panel                                        │
│ ↔️ Resize handles on all 8 directions                        │
│ 🖱️ Draggable via header                                      │
└──────────────────────────────────────────────────────────────┘
```

## Component State Visualization

### Button States
```
Default:     [Button Text]
Hover:       [Button Text] (elevated, blue background)
Selected:    [Button Text] (blue background, white text) 
Loading:     [🔄 Loading...] (spinner + disabled)
Disabled:    [Button Text] (grayed out)
```

### Panel States
```
Collapsed:   Advanced Dimensions ▼
Expanded:    Advanced Dimensions ▲
             [dimension controls visible]

Resizing:    Panel with resize handles active
Dragging:    Panel following mouse cursor
```

### Message Types
```
✅ Success:  Green border, checkmark icon
⚠️ Warning:  Orange border, warning icon  
❌ Error:    Red border, error icon
ℹ️ Info:     Blue border, info icon
```

## Interactive Elements Map

### Clickable Components
1. **Header Controls**
   - Close button (×) → Closes panel
   - Header area → Drag to move panel

2. **Action Buttons** 
   - Mark Start/End → Define shot boundaries
   - Start/Stop Overlay → Toggle pose detection
   - Load CSV → Import previous labels
   - Download CSV → Export current labels

3. **Selection Controls**
   - Shot type buttons → Select shot category
   - Dimension value buttons → Add shot details
   - Delete buttons (🗑️) → Remove individual shots

4. **Panel Controls**
   - 8 resize handles → Resize panel dimensions
   - Collapse/expand toggle → Show/hide dimensions

### Keyboard Shortcuts
- **S** → Mark shot start
- **E** → Mark shot end
- **O** → Toggle pose overlay
- **Esc** → Close panel

## Responsive Behavior

### Desktop (>480px)
- Full panel width (360px default)
- All sections visible
- Hover effects active

### Mobile (≤480px)
- Full width panel (calc(100vw - 20px))
- Smaller buttons and padding
- Touch-optimized interactions

## Accessibility Features

### ARIA Labels
- Panel: `role="dialog"` `aria-label="YouTube Badminton Shot Labeler"`
- Buttons: Descriptive `aria-label` attributes
- Lists: `role="list"` for shot collections

### Keyboard Navigation
- Tab order follows logical flow
- All interactive elements focusable
- Keyboard shortcuts for common actions

### Screen Reader Support
- Semantic HTML structure
- Descriptive text for dynamic content
- Status announcements for state changes