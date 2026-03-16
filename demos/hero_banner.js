import { startup, Hero } from '../js/mediaviewer.js';

// 1) Load CSS/fonts and gate attribute for the components:
startup(); // must be called before using Hero, Gallery, etc. 

// 2) Instantiate the Hero banner:
new Hero('.demo',
  {
    eyebrow: 'New in 1.4',
    title: 'Build media experiences fast',
    subtitle: 'Create rich carousels, galleries, players, and hero banners in minutes.',
    // Background image for the hero:
    background: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1400',
    alt: 'Mountains at sunrise',

    // Layout/behavior:
    align: 'center',            // 'left' | 'center' | 'right'
    tabsPlacement: 'bottom',    // 'top' | 'bottom'
    tabsVariant: 'buttons',     // 'buttons' | 'links'
    tabs: [
      { label: 'Get started', href: '#get-started', target: '_self',  variant: 'primary' },
      { label: 'Docs',        href: '#docs',        target: '_blank', variant: 'ghost', rel: 'noopener' }
    ]
  },
  {
    // Style tokens map to CSS vars: --hero-banner-<token>
    'height': '70vh',
    'color': '#aeaeae',
    'scrim-from': 'rgba(0,0,0,.55)',
    'scrim-to': 'rgba(0,0,0,.10)',
    'btn-bg': '#ffffff',
    'btn-color': '#0b0f14',
    'btn-hover-bg': '#e5e7eb',
    'bg-hover': 'transparent',
    'color-hover': '#ffffff'
  }
);