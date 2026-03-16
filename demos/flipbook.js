import { startup, Flipbook } from "../js/mediaviewer.js";
startup();
new Flipbook('.demo', {
  pages: ['<h2>Cover</h2>', '<h2>Page 2</h2>', '<h2>Page 3</h2>', '<h2>Page 4</h2>'],
  width: 900,
  height: 600,
  persistKey: 'demo-flipbook'
}, {
  'bg': '#f6f8fa',
  'page-bg': '#fff',
  'accent': '#4badde',
  'toolbar-bg': '#fff',
  'toolbar-color': '#0b0f14',
  'contrast-bg': '#0b0f14',
  'contrast-ink': '#fff'
});