// main.js (ES module)
import { startup, Timeline } from '../js/mediaviewer.js';

// 1) Initialize the library (injects CSS, fonts, etc.)
startup();

// 2) Ensure there's a container in your HTML, e.g.:
//    <div id="timelineManual"></div>

// 3) Provide items via JS (you can omit `items` to parse child markup instead)
const items = [
  {
    date: '2019',
    title: 'Project Kickoff',
    badge: 'v0.1',
    icon: 'fa-solid fa-flag-checkered',
    html: 'Initial scope, team formation, and planning.'
  },
  {
    date: '2021',
    title: 'Private Beta',
    badge: 'beta',
    icon: 'fa-solid fa-flask',
    html: 'Invited users began testing core scenarios and integrations.'
  },
  {
    date: '2024',
    title: 'Public Launch',
    icon: 'fa-solid fa-rocket',
    html: 'GA release with docs, samples, and templates.'
  }
];

// 4) Optional style tokens (map directly to --timeline-*)
const styles = {
  'track-color': '#d9dde3',
  'node-border': '#4badde',
  'node-size': '14px',
  'card-bg': '#ffffff',
  'card-color': '#0b0f14',
  'spacing': '24px'
};

// 5) Create the timeline
new Timeline('.demo', {
  orientation: 'horizontal',  // or 'vertical'
  alternate: true,            // alternate left/right (vertical) or top/bottom (horizontal)
  invert: false,              // invert alternation side
  items
}, styles)