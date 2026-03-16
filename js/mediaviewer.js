// ===== MediaViewer FULL BUILD (with timeline fixes merged) =====
import { clipboard, color, videoData, genID, fileName, GenerateQRCode, finalizeURL} from "./mediaviewer-tools.js";
/**
 * @package MediaViewer
 * @version 1.4.0
 * @description A javascript library to create a media viewing experience
 * @license MIT
 * @author XHiddenProjects
 * @repository [XHiddenProjects/MediaViewer](https://github.com/XHiddenProjects/MediaViewer)
 */
/**
 * Starts up the media viewer
 */
export const startup = ()=>{
    const icons = document.createElement('link'),
    fonts = document.createElement('link'),
    main = document.createElement('link'),
    mobile = document.createElement('link'),
    qr = document.createElement('script');
    icons.href = `./css/all.min.css`;
    icons.rel = `stylesheet`;
    document.head.appendChild(icons);
    fonts.href = `//fonts.googleapis.com/css2?family=Cedarville+Cursive&family=Cutive+Mono&family=Dancing+Script:wght@400..700&family=Handlee&family=PT+Mono&family=PT+Sans+Caption:wght@400;700&family=PT+Serif+Caption:ital@0;1&display=swap`;
    fonts.rel = 'stylesheet';
    document.head.appendChild(fonts);
    main.href = `./css/mediaviewer.css`;
    main.rel = 'stylesheet';
    document.head.appendChild(main);
    mobile.rel = 'stylesheet';
    mobile.href = `./css/mediaviewer-mobile.css`;
    document.head.appendChild(mobile);
    qr.src = `https://cdn.jsdelivr.net/gh/ushelp/EasyQRCodeJS@master/src/easy.qrcode.js`;
    document.head.appendChild(qr);
    document.documentElement.setAttribute('media-viewer-enabled','');
}
/**
 * Checks if the startup has been triggered
 * @returns {boolean}
 */
const isLoaded = ()=>{return document.documentElement.hasAttribute('media-viewer-enabled')};
export class Carousel{
    #callback;
/**
 * Create a touch/keyboard‑friendly image carousel. Wires autoplay, indicators,
 * captions and optional controls; driven via API or CSS custom properties.
 *
 * @constructor
 * @param {string|HTMLElement} container - CSS selector or DOM element that will host the carousel root.
 * @param {{
 *   speed?: number,
 *   interval?: number,
 *   autoplay?: boolean,
 *   loop?: boolean,
 *   slides?: string[],
 *   captions?: string[],
 *   start?: number,
 *   controls?: boolean,
 *   indicator?: boolean,
 *   transition?: 'slide'|'fade'|'none'
 * }} [config] - Carousel configuration object.  Fields:
 *   • **speed** (ms): transition animation duration; affects CSS timing classes.
 *   • **interval** (ms): delay between automatic slide advances when `autoplay` is enabled.
 *   • **autoplay**: start advancing slides automatically after init.
 *   • **loop**: wrap from the last slide back to the first.
 *   • **slides**: array of image URLs to render as slides (order is preserved).
 *   • **captions**: per‑slide captions; index‑aligned with `slides`.
 *   • **start**: zero‑based initial slide index.
 *   • **controls**: render previous/next buttons and bind click handlers.
 *   • **indicator**: render dot indicators and bind click/wheel navigation.
 *   • **transition**: visual effect used between slides.
 * @param {{ 'control-color'?: string, 'indicator-color'?: string, 'captions-color'?: string, 'captions-bg'?: string }} [styles] - Style overrides mapped to CSS variables (e.g., `--carousel-control-color`). Use valid CSS color strings.
 * @param {boolean} [trigger=true] - When `true`, the carousel mounts immediately; pass `false` to call `init()` later.
 * @example
 * const carousel = new Carousel('#heroCarousel', {
 *   slides: ['/img/1.jpg','/img/2.jpg','/img/3.jpg'],
 *   captions: ['One','Two','Three'],
 *   autoplay: true, transition: 'fade', controls: true, indicator: true
 * }, { 'control-color': '#fff' }).getInstance();
 */
constructor(container, config, styles,trigger=true){
        if(!isLoaded()) return;
        this.container = (typeof container === 'string')
      ? document.querySelector(container)
      : container;
        this.config = {
            speed: 500,
            interval: 5000,
            autoplay: true,
            loop: true,
            slides: [],
            captions: [],
            start: 0,
            controls: false,
            indicator: false,
            transition: 'none' //slide, fade, none
        };
        this.styles = {};
        this.interval=null;
        this.#callback = null;
        this.lastSlide = 0;
        Object.assign(this.config, config);
        Object.assign(this.styles, styles);
        if (this.container instanceof HTMLElement&&trigger) this.init();
    }
    
/**
 * Render and attach the component’s DOM and listeners. Called automatically
 * when `trigger` is true; call manually to mount later.
 * @example
 * const g = new Gallery('#g', { images:['/1.jpg'] }, {}, false);
 * g.init();
 */
init(){
        this.currentSlide = this.config.start;
        this.container.classList.add(this.config.transition);
        this.container.classList.add('carousel');
        Object.keys(this.styles).forEach(i=>{
            this.container.style.setProperty(`--carousel-${i}`,this.styles[i]);
        });
        this.container.innerHTML += '<div class="carousel-inner">'+this.config.slides.map((slide, index) => `
            <div class="carousel-slide${index === this.currentSlide ? ' active' : ''}">
                <img class="image" src="${slide}" alt="${this.config.captions[index]??'img_'+(index+1)}"/>
            </div>
        `).join('')+"</div>";

            if (this.config.autoplay) {
                this.#startAutoplay();
            }

            if (this.config.controls) {
                this.#createControls();
            }
            if (this.config.indicator) {
                this.#createIndicators();
            }
            if(this.config.captions.length>0) this.#createCaptions();
        }
        getInstance(){
            return this;
        }
        
/**
 * Subscribe to slide changes—great for syncing captions, analytics, or custom UI.
 * @param {(info:{last:number,current:number,total:number,index:number,caption?:string})=>void} callback - Function invoked after each transition with metadata for the previous and current slide.
 * @param {boolean} [async=false] - When `true`, immediately invokes `callback` once with the current state after registration.
 * @example
 * const c = new Carousel('#c', { slides:['/a.jpg','/b.jpg'] });
 * c.onSlideChange(({ current, total }) => console.log(`Slide ${current}/${total}`));
 */
onSlideChange(callback,async=false) {
            this.#callback = callback;
            if(async)
                this.#callback({last: this.lastSlide, current: this.currentSlide+1, total: this.config.slides.length, index: this.currentSlide,caption: this.config.captions[this.currentSlide]});
        }
        /**
         * Starts the autoplay functionality
         */
        #startAutoplay() {
            this.interval = setInterval(() => {
                this.#nextSlide();
            }, this.config.interval);
        }

        /**
         * Moves to the next slide
         */
        #nextSlide() {
            this.lastSlide = this.currentSlide;
            if (this.currentSlide + 1 < this.config.slides.length) {
                this.currentSlide++;
            } else if (this.config.loop) {
                this.currentSlide = 0;
            }
            this.#updateSlides();
            this.#updateIndicators();
        }

        /**
         * Updates the slides display
         */
        #updateSlides() {
            const slides = this.container.querySelectorAll('.carousel-slide');
            slides.forEach((slide, index) => {
                if (index === this.currentSlide) {
                    slide.classList.add('active');
                    slide.classList.add('carousel-slide-next');
                    const prevSlideIndex = this.lastSlide;
                    slides[prevSlideIndex].classList.add('carousel-slide-prev');
                    setTimeout(() => {
                        slide.classList.remove('carousel-slide-next');
                        slides[prevSlideIndex].classList.remove('carousel-slide-prev');
                    }, this.config.speed);
                } else {
                    slide.classList.remove('active');
                }
            });

            if(this.#callback)
                this.#callback({last: this.lastSlide,current:this.currentSlide+1,total:this.config.slides.length, index: this.currentSlide, caption: this.config.captions[this.currentSlide]});
        }

        /**
         * Creates the carousel controls
         */
        #createControls() {
        const prevButton = document.createElement('button');
        prevButton.innerHTML = '<i class="fa-solid fa-caret-left"></i>';
        prevButton.classList.add('carousel-prev');
        prevButton.addEventListener('click', () => {
            this.#prevSlide();
        });

        const nextButton = document.createElement('button');
        nextButton.innerHTML = '<i class="fa-solid fa-caret-right"></i>';
        nextButton.classList.add('carousel-next');
        nextButton.addEventListener('click', () => {
            this.#nextSlide();
        });

        this.container.appendChild(prevButton);
        this.container.appendChild(nextButton);
    }
    /**
     * Creates the carousel captions
     */
    #createCaptions() {
        const slides = this.container.querySelectorAll('.carousel-slide');
        slides.forEach((slide, index) => {
            const caption = document.createElement('caption');
            caption.classList.add('carousel-caption');
            caption.innerText = this.config.captions[index] || '';
            slide.appendChild(caption);
        });
    }
    /**
     * Creates the carousel indicators
     */
    #createIndicators() {
        const indicatorContainer = document.createElement('div');
        indicatorContainer.classList.add('carousel-indicators');
        indicatorContainer.addEventListener('wheel',(event)=>{
            if(event.deltaY<0)this.#nextSlide();
            else this.#prevSlide();
        });
        this.config.slides.forEach((_, index) => {
            const indicator = document.createElement('span');
            indicator.classList.add('carousel-indicator');
            if (index === this.currentSlide) {
                indicator.classList.add('active');
            }
            indicator.addEventListener('click', () => {
                this.currentSlide = index;
                this.#updateSlides();
                this.#updateIndicators();
            });
            indicatorContainer.appendChild(indicator);
        });

        this.container.appendChild(indicatorContainer);
    }

    /**
     * Updates the indicators display
     */
    #updateIndicators() {
        const indicators = this.container.querySelectorAll('.carousel-indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });
    }
    #prevSlide() {
        this.lastSlide = this.currentSlide;
        if (this.currentSlide - 1 >= 0) {
            this.currentSlide--;
        } else if (this.config.loop) {
            this.currentSlide = this.config.slides.length - 1;
        }
        this.#updateSlides();
        this.#updateIndicators();
    }
};
export class Gallery{
  
/**
 * Build a responsive, Masonry‑like gallery grid with optional zoom overlay and captions.
 * Column count auto‑adapts based on container width and intrinsic image sizes unless overridden.
 *
 * @constructor
 * @param {string|HTMLElement} container - CSS selector or DOM element for the gallery root.
 * @param {{ images?: string[], captions?: string[], zoom?: boolean, gap?: string, autoResize?: boolean, static?: boolean, minColWidth?: number }} [config] - Gallery settings.  Fields:
 *   • **images**: array of image URLs to display in grid order.
 *   • **captions**: optional array of captions; index‑aligned with `images`.
 *   • **zoom**: enable click‑to‑zoom overlay with close affordances.
 *   • **gap**: CSS length for grid gaps (e.g., `12px`, `1rem`).
 *   • **autoResize**: recompute column count on container/viewport resize.
 *   • **static**: when `true`, disables overlay click‑to‑close (kiosk mode).
 *   • **minColWidth** (px): fallback width used to estimate columns when sizes are unknown.
 * @param {{ 'max-cols'?: string|number, 'gap'?: string, 'captions-bg'?: string, 'captions-color'?: string, 'backdrop'?: string, 'close-btn'?: string, 'box-shadow'?: string }} [styles] - CSS variable overrides for the gallery (e.g., `--gallery-gap`).
 * @param {boolean} [trigger=true] - Auto‑mount control; set `false` to call `init()` yourself after async work.
 * @example
 * new Gallery('#shots', { images:['/a.jpg','/b.jpg'], zoom:true }, { 'max-cols': 3 });
 */
constructor(container, config = {}, styles = {}, trigger = true) {
    if (!isLoaded()) return;
    this.container = (typeof container === 'string')
      ? document.querySelector(container)
      : container;

    // Defaults
    this.config = {
      images: [],
      captions: [],
      zoom: false,
      gap: '12px',           // sensible default (not 0)
      autoResize: true,      // enable unless explicitly disabled
      static: false,
      minColWidth: 240       // fallback min column width if we can't infer from images
    };

    // CSS var-backed styles (numbers/lengths, not '1fr')
    this.styles = {
      'max-cols': '1',       // must be an integer string
      'gap': this.config.gap
    };

    Object.assign(this.config, config);
    Object.assign(this.styles, styles);

    // ---- Priority fix: JS styles win; only fall back to element's INLINE CSS var ----
    const hasStyleCols =
      this.styles &&
      this.styles['max-cols'] != null &&
      String(this.styles['max-cols']).trim() !== '';

    // Only read the element's own inline style, not computed stylesheet defaults
    const inlineCols = (this.container instanceof HTMLElement)
      ? this.container.style.getPropertyValue('--gallery-max-cols')
      : '';

    this.userDefinedCols = hasStyleCols || (!!inlineCols && inlineCols.trim() !== '');

    // If the caller didn't supply JS styles but the element has an inline var, use it
    if (!hasStyleCols && inlineCols && inlineCols.trim()) {
      this.styles['max-cols'] = inlineCols.trim();
    }

    // Sanitize gap
    if (!/^\d+(\.\d+)?(px|rem|em|%)$/.test(String(this.styles['gap']))) {
      this.styles['gap'] = '12px';
    }

    // Load images, compute columns, then apply styles and init
    this.loadImages().then(() => {
      this.applyStyles();
      if (this.container instanceof HTMLElement && trigger) this.init?.();
    });

    // Auto-resize: recalc cols on container resize (preferred) or window resize
    if (this.config.autoResize && this.container instanceof HTMLElement) {
      const recalc = this._debounce(async () => {
        if (!this.userDefinedCols) {
          await this.loadImages();
        }
        this.applyStyles();
      }, 120);

      if ('ResizeObserver' in window) {
        this._ro = new ResizeObserver(() => recalc());
        this._ro.observe(this.container);
      } else {
        window.addEventListener('resize', recalc);
      }
    }
  }

  /**
   * Loads images (if provided) and computes a safe column count (>= 1).
   * Returns the computed column count.
   */
  async loadImages() {
    // Respect explicit user-defined column count and skip auto-compute
    if (this.userDefinedCols) {
      const n = parseInt(String(this.styles['max-cols'] ?? '1'), 10);
      const safe = Number.isFinite(n) && n > 0 ? n : 1;
      this.styles['max-cols'] = String(safe);
      return safe;
    }

    const urls = Array.isArray(this.config.images) ? this.config.images : [];

    const containerWidth =
      (this.container?.clientWidth) ||
      document.documentElement.clientWidth ||
      window.innerWidth ||
      1024; // robust fallback

    // No images provided -> derive cols from minColWidth
    if (urls.length === 0) {
      const cols = Math.max(1, Math.floor(containerWidth / Math.max(1, this.config.minColWidth)));
      this.styles['max-cols'] = String(cols);
      return cols;
    }

    // Load images safely
    const images = await Promise.all(
      urls.map(src => new Promise(resolve => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = () => resolve(img); // keep pipeline moving even if one fails
      }))
    );

    const widths = images.map(img => img.naturalWidth || 0);
    const count = Math.max(1, widths.length);
    const totalWidth = widths.reduce((a, b) => a + b, 0);

    // Average width fallback -> minColWidth if images lack sizes
    const avgWidth = totalWidth > 0 ? (totalWidth / count) : this.config.minColWidth;

    // Compute columns and clamp to >= 1
    const cols = Math.max(1, Math.floor(containerWidth / Math.max(1, avgWidth)));
    this.styles['max-cols'] = String(cols);
    return cols;
  }

  /** Applies CSS custom properties to the container */
  applyStyles() {
    if (!(this.container instanceof HTMLElement)) return;

    // Clamp to a safe integer >= 1
    const n = parseInt(String(this.styles['max-cols'] ?? '1'), 10);
    const safe = Number.isFinite(n) && n > 0 ? n : 1;

    this.container.style.setProperty('--gallery-max-cols', String(safe));
    this.container.style.setProperty('--gallery-gap', String(this.styles['gap']));
  }

  /** Small debounce helper */
  _debounce(fn, delay = 120) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  init(){
    this.container.classList.add('gallery');
    Object.keys(this.styles).forEach(i=>{
      this.container.style.setProperty(`--gallery-${i}`,this.styles[i]);
    });
    this.container.innerHTML += '<div class="gallery-grid">'+this.config.images.map((image, index) => `
      <div class="gallery-item">
        <img class="image" src="${image}" alt="${this.config.captions[index]??'img_'+(index+1)}"/>
      </div>
    `).join('')+"</div>";
    if(this.config.zoom) this.#createZoom();
    if(this.config.captions.length>0) this.#createCaptions();
  }

  getInstance(){
    return this;
  }

  #createZoom(){
    if(this.config.static) this.container.classList.add('static');
    this.container.classList.add('zoom');
    const overlay = document.createElement('div');
    overlay.classList.add('gallery-overlay');
    if(!this.config.static){
      overlay.addEventListener('click',()=>{
        overlay.classList.remove('opened');
        const caption = overlay.querySelector('.gallery-zoom-caption');
        if (caption) caption.remove();
      });
    }
    const closeButton = document.createElement('button');
    closeButton.innerText = 'x';
    closeButton.classList.add('gallery-close-button');
    closeButton.addEventListener('click', () => {
      overlay.classList.remove('opened');
      const caption = overlay.querySelector('.gallery-zoom-caption');
      if (caption) caption.remove();
    });
    overlay.appendChild(closeButton);
    const image = document.createElement('img');
    image.classList.add('gallery-zoom-image');
    overlay.appendChild(image);
    this.container.appendChild(overlay);

    const images = this.container.querySelectorAll('.gallery-item');
    images.forEach((img, index) => {
      img.addEventListener('click', () => {
        overlay.classList.add('opened');
        image.src = this.config.images[index];
        if (this.config.captions.length > 0) {
          const caption = document.createElement('div');
          caption.classList.add('gallery-zoom-caption');
          caption.innerText = this.config.captions[index] || '';
          overlay.appendChild(caption);
        }
      });
    });
  }

  #createCaptions() {
    const items = this.container.querySelectorAll('.gallery-item');
    items.forEach((item, index) => {
      const caption = document.createElement('caption');
      caption.classList.add('gallery-caption');
      caption.innerText = this.config.captions[index] || '';
      item.appendChild(caption);
    });
  }
};

export class VideoPlayer{
    #videoList;
    
/**
 * Feature‑rich HTML5 video player: playlists, quality selection, CC settings,
 * thumbnails, keyboard shortcuts, PiP/theater/fullscreen and share tools.
 *
 * @constructor
 * @param {string|HTMLElement} container - Player wrapper element or CSS selector.
 * @param {{
 *   autoplay?: boolean,
 *   preloaded?: 'auto'|'metadata'|'none',
 *   controls?: boolean,
 *   playlists?: Array<{ poster?: string, title: string, author?: string, src: Array<{ quality: string|number, path: string }>, tracks?: Array<{ src: string, kind: string, srclang: string, label: string }> }>,
 *   start?: number,
 *   skipRate?: number,
 *   embed?: boolean
 * }} [config] - Player configuration.  Highlights:
 *   • **autoplay**: attempt to start playback automatically (subject to browser policies).
 *   • **preloaded**: preload strategy for the `<video>` element.
 *   • **controls**: render the custom control bar (progress, CC, gear, etc.).
 *   • **playlists**: list of playable items; each has `src` sources by quality and optional `tracks`.
 *   • **start** (seconds): initial timestamp to seek after metadata is loaded.
 *   • **skipRate** (seconds): amount to seek with arrow keys.
 *   • **embed**: adjusts layout/menus for embedded usage.
 * @param {{
 *   'progress-background'?: string,
 *   'progress'?: string,
 *   'controls-color'?: string,
 *   'volume-thumb'?: string,
 *   'volume-border'?: string,
 *   'volume-track-before'?: string,
 *   'volume-track-after'?: string,
 *   'bg'?: string,
 *   'checkpoint'?: string,
 *   'buffer'?: string,
 *   'autoplay-checked'?: string,
 *   'autoplay-bg'?: string,
 *   'autoplay-thumb'?: string,
 *   'cc-active'?: string,
 *   'preview-timestamp'?: string,
 *   'settings-bg'?: string,
 *   'settings-color'?: string,
 *   'settings-hover'?: string,
 *   'pip-overlay'?: string,
 *   'pip-overlay-color'?: string,
 *   'playlist'?: string,
 *   'playlist-time'?: string,
 *   'playlist-time-bg'?: string,
 *   'error-bg'?: string,
 *   'error-color'?: string,
 *   'title-color'?: string,
 *   'playlist-title'?: string,
 *   'playlist-author'?: string,
 *   'cue-font'?: string,
 *   'cue-font-color'?: string|number,
 *   'cue-font-size'?: string,
 *   'cue-bg'?: string|number,
 *   'cue-bg-opacity'?: string|number,
 *   'cue-window-color'?: string|number,
 *   'cue-window-opacity'?: string|number,
 *   'cue-font-opacity'?: string|number
 * }} [styles] - Visual tokens mapped to video CSS variables (e.g., `--video-progress`). Use CSS colors/lengths or raw numbers where noted.
 * @param {boolean} [trigger=true] - Auto‑mount behavior; set `false` for manual `init()`.
 * @example
 * const vp = new VideoPlayer('#player', {
 *   playlists: [{ title:'Demo', poster:'/poster.jpg', src:[{ quality:'auto', path:'/video.mp4' }], tracks:[{ src:'/captions.vtt', kind:'subtitles', srclang:'en', label:'English' }] }],
 *   controls: true
 * }).getInstance();
 */
constructor(container, config, styles, trigger=true){

        if(!isLoaded()) return;
        this.params = new URLSearchParams(window.location.search);
        this.container = (typeof container === 'string')
      ? document.querySelector(container)
      : container;
        this.config = {
            embed: false,
            autoplay: false,
            controls: true,
            start:  (this.params.get('t') ? parseInt(this.params.get('t')) : 0),
            playlists: [],
            skipRate: 5,
            defaultLang: 'en',
            availableColors: ['white','yellow','green','cyan','blue','magenta','red','black'],
            availableSize: [50,75,100,150,200,300,400],
            availableOpacity: [0,25,50,75,100],
            availablePlayback: [0.25,0.5,0.75,1,1.25,1.5,1.75,2],
            preloaded: 'auto',
            embedURL: `${window.location.origin+window.location.pathname}embed.html`
        }
        this.styles={};
        this.debug ={};
        this.eventTracker = {};
        this.#videoList = [];

        Object.assign(this.config,config);
        Object.assign(this.styles,styles);

        

        // Safely parse the stored config (falls back to empty object)
        const storedConfig = JSON.parse(window.localStorage.getItem('mediaViewer_video_config') || '{}');

        // Use optional chaining + nullish coalescing to preserve the current default if missing
        this.config.autoplay = storedConfig?.autoplay ?? this.config.autoplay;

        
// Build video id list deterministically before init
const buildListPromises = this.config.playlists.map(async (i) => {
  const name = fileName(i.src[0].path);
  const id = await genID(name);
  return { videoName: name, videoID: id };
});
Promise.all(buildListPromises)
  .then((list) => {
    // de-duplicate by videoName while preserving order
    const seen = new Set();
    this.#videoList = list.filter((it) => {
      if (seen.has(it.videoName)) return false;
      seen.add(it.videoName);
      return true;
    });
    // Generate poster screenshots for all playlists before calling init
    const posterPromises = this.config.playlists.map((e) => {
      return new Promise((resolve) => {
        if (typeof e.poster === 'string' && e.poster.trim() !== '') {
          resolve();
        } else {
          videoData(e.src[0]['path'], 1, (p) => {
            if (p && p.poster && p.duration) {
              e.poster = p.poster;
              e.duration = p.duration;
            }
            resolve();
          });
        }
      });
    });
    return Promise.all(posterPromises);
  })
  .then(() => {
    if (this.container instanceof HTMLElement && trigger) this.init();
  });


        return this;
    }
    #getVideoType(src){
        const extension = src.split('.').pop().toLowerCase();
        switch (extension) {
            case 'mp4':
                return 'video/mp4';
            case 'webm':
                return 'video/webm';
            case 'ogg':
                return 'video/ogg';
            default:
                return 'video/mp4';
        }
    }
    init(){
        this.container.tabIndex = 0;
        this.container.classList.add('video');
        if(this.config.embed) this.container.classList.add('embed');
        Object.keys(this.styles).forEach(i=>{
            this.container.style.setProperty(`--video-${i}`,this.styles[i]);
        });
        if(this.container.hasAttribute('video')) return;
        this.container.innerHTML=`<div class="video-player"></div>`;
        this.container.querySelector('.video-player').innerHTML = `${window.QRCode ? `<div class="QRcode"><span class="close"><i class="fa-solid fa-x"></i> <i class="fa-solid fa-spinner-third qr-spinner"></i></span></div>` : ''}<div class="playpauseUI" data-status="isPaused">
            <span class="uiPlayPause"></span>
        </div>
        <div class="videoNotFound">
            <span class="videoNotFoundTxt">Video not found</span>
            </div><div class="overlay">
            <i class="fa-solid fa-arrow-up-right-from-square fa-rotate-270 pip-expand" title="Expand (i)"></i>
            <i class="fa-solid fa-play pip-play-pause"></i>
        </div>
        
        <div class="content-menu-controls">
            <ul class="controls-menu">
                <li class="controls-menu-item" data-action="loop"><i class="fa-solid fa-repeat"></i> Loop</li>
                <li class="controls-menu-item" data-action="copyURL"><i class="fa-solid fa-link"></i> Copy URL</li>
                <li class="controls-menu-item" data-action="copyTimeURL"><i class="fa-solid fa-link"></i> Copy URL at current time</li>
                <li class="controls-menu-item" data-action="copyEmbed"><i class="fa-solid fa-code-simple"></i> Copy Embed Code</li>
                ${window.QRCode ? `<li class="controls-menu-item" data-action="openQRCode"><i class="fa-solid fa-qrcode"></i> Generate QRCode</li>` : ``}
            </ul>
        </div>
        <div class="video-placeholder">
        <div class="closed-captions-bar">
            <span class="closed-captions-text"></span>
        </div>
        <i class="fa-solid fa-loader bufferLoader"></i>
        </div>`;
        this.container.innerHTML+=`<div class="playlists${this.config.playlists.length<2 ? ' noShow' : ''}">
            ${
                Array.from(this.config.playlists).map(e => {
                    return `<div class="playlist-item" tab-index="0" data-video="${this.#videoList.find(v => v.videoName === fileName(e.src[0].path))?.videoID}">
                        <div style="position: relative;">
                            <img src="${e.poster}" class="playlist-img"/>
                            <span data-video-src="${this.#videoList.find(v => v.videoName === fileName(e.src[0].path))?.videoID}" class="playlist-timeDur" data-video-duration="${this.#sec2time(e.duration)}">${this.#sec2time(e.duration)}</span>
                        </div>
                        <div>
                            <p class="playlist-title">${e.title}</p>
                            <p class="playlist-author">${e.author??''}</p>
                        </div>
                    </div>`;
                }).join('')
            }
        </div>`;
        let videoID = new URLSearchParams(window.location.search).get('v');
        if (!videoID && this.config.playlists.length > 0) {
            videoID = this.#videoList[0]?.videoID;
            const separator = window.location.href.includes('?') ? '&' : '?';
            const url = new URL(window.location.href);
            url.searchParams.set('v', videoID);
            const newUrl = url.pathname + url.search;
            window.history.pushState({}, '', newUrl);
        }
        


        const playlistItem = this.config.playlists.find(item => 
            this.#videoList.some(video => video.videoID === videoID && fileName(item.src[0].path) === video.videoName)
        );
        const title = playlistItem ? playlistItem.title : this.config.title;
        this.container.innerHTML+=`<div class="video-title"><h1>${title}</h1></div>`;
        this.#createVideoFrame();
        if(this.config.controls){
            this.#createControls();
            this.#createVolumeBtn();
            this.#createVolume();
            this.#pausePlay();
            this.#videoEvents();
            this.#triggerVideo();
            this.#triggerSettings();
        }
        this.#playlists();
    }
    getInstance(){
        return this;
    }
    #createControls(){
        this.container.querySelector('.video-player').innerHTML+=`<div class="controls">
            <div class="preview-container">
                <div class="preview-frame"></div>
                    <div class="information">
                        <span class="chapter"></span>
                        <span class="timestamp"></span>
                    </div>
            </div>
            <div class="section progress">
                
                    
                <div class="progress-buffer"></div>
                <div class="progress-checkpoint"></div>
                <div class="progress-bar"><span class="circle"></span></div>
            </div>
            <div class="section">
                <div class="controller-1">
                    <i class="fa-solid fa-play btn play-pause" title="Play (k)"></i>
                    <i class="fa-solid fa-forward-step btn next-video"></i>
                    <div class="container volume-container">
                        <div class="volume-holder">
                        </div>
                    </div>
                    <div class="container time-container">
                        <span class="current-time">00:00</span> / <span class="total-time">00:00</span>
                    </div>
                </div>
                <div class="controller-2">
                    <label class="toggle-switch" title="Autoplay is off">
                        <input type="checkbox" class="autoplay" ${this.config.autoplay ? ' checked="checked"' : ''}>
                        <span class="slider"></span>
                    </label>
                    <i class="fa-solid fa-closed-captioning btn cc" title="close captions (c)"></i>
                    <div class="setting-container btn">
                        <i class="fa-solid fa-gear settings" tabindex="0" title="Settings"></i>
                        <div class="settings-menu">
                            <ul class="settings-menu-list">
                                ${this.container.querySelector('track[kind="subtitles"]') ? '<li class="settings-menu-list-item" data-settings="option-cc"><span><i class="fa-regular fa-closed-captioning"></i> Closed Captions</span></li>' : ''}
                                <li class="settings-menu-list-item" data-settings="option-playback"><span><i class="fa-regular fa-circle-play"></i> Playback Speed</span></li>
                                <li class="settings-menu-list-item" data-settings="option-quality"><span><i class="fa-regular fa-sliders"></i> Quality</span></li>
                                <li class="settings-menu-list-item" data-settings="option-cc"><span><i class="fa-solid fa-closed-captioning"></i> Closed Captions</span></li>
                            </ul>
                            <div class="options option-cc">
                                <div class="options-header">
                                    <div>
                                        <span class="settings-back"></span>
                                        <span>Subtitles/CC</span>
                                    </div>
                                    <span class="cc-options">Options</span>
                                </div>
                                <ul class="settings-menu-list">
                                ${
                                    (() => {
                                        const generateSubtitleMenu = () => {
                                            const tracks = Array.from(this.container.querySelectorAll('track[kind="subtitles"]'));
                                            if (tracks.length === 0) return '<li class="settings-menu-list-item disabled"><span>No subtitles available</span></li>';
                                            return tracks.map((e) => {
                                                const isChecked = e.track && e.track.mode === 'hidden';
                                                return `<li class="settings-menu-list-item${isChecked ? ' checked' : ''}" data-subtitle="${e.getAttribute('srclang')}"><span>${e.getAttribute('label')}</span></li>`;
                                            }).join('');
                                        };
                                        setTimeout(() => {
                                            const x = this.container.querySelector('.option-cc .settings-menu-list');
                                            if (x) x.innerHTML = generateSubtitleMenu();
                                        }, 0);
                                        return generateSubtitleMenu();
                                    })()
                                }
                                </ul>
                            </div>
                            <div class="options option-playback">
                                <div class="options-header">
                                    <div>
                                        <span class="settings-back"></span>
                                        <span>Playback</span>
                                    </div>
                                </div>
                                <ul class="settings-menu-list">
                                ${
                                    Array.from(this.config.availablePlayback).map((e) => 
                                        `<li class="settings-menu-list-item${e==1 ? ' checked' : ''}" data-speed="${e}"><span>${e==1 ? 'Normal' : `${e}x`}</span></li>`
                                    ).join('')
                                }
                                </ul>
                            </div>
                            <div class="options option-quality">
                                <div class="options-header">
                                    <div>
                                        <span class="settings-back"></span>
                                        <span>Quality</span>
                                    </div>
                                </div>
                                <ul class="settings-menu-list">
                                ${
                                    (() => {
                                        const urlParams = new URLSearchParams(window.location.search);
                                        const videoID = urlParams.get('v');
                                        const playlist = this.config.playlists.find(item =>
                                            this.#videoList.some(video => video.videoID === videoID && fileName(item.src[0].path) === video.videoName)
                                        );
                                        if (!playlist) return '';
                                        // Remove duplicate qualities
                                        const uniqueSources = playlist.src.filter((src, idx, arr) =>
                                            arr.findIndex(s => s.quality === src.quality) === idx
                                        );
                                        return uniqueSources
                                            .sort((a, b) => {
                                                const qualityA = a.quality === 'auto' ? -1 : parseInt(a.quality || 0, 10);
                                                const qualityB = b.quality === 'auto' ? -1 : parseInt(b.quality || 0, 10);
                                                return qualityA - qualityB;
                                            })
                                            .map((src) =>
                                                `<li class="settings-menu-list-item${src.quality === 'auto' ? ' checked' : ''}" data-quality="${src.quality}"><span>${src.quality !== 'auto' ? `${src.quality.charAt(0).toUpperCase() + src.quality.slice(1)}p` : `${src.quality.charAt(0).toUpperCase() + src.quality.slice(1)}`}</span></li>`
                                            ).join('');
                                    })()
                                }
                                </ul>
                            </div>
                            <div class="options option-cc-more">
                                <div class="options-header">
                                    <div>
                                        <span class="settings-back-more"></span>
                                        <span>Options</span>
                                    </div>
                                </div>
                                <ul class="settings-menu-list">
                                    <li class="settings-menu-list-item">Font Family: 
                                        <select class="settings-menu-select font-family">
                                            <option value="--family-monospaced-serif">Monospaced Serif</option>
                                            <option value="--family-proportional-serif">Proportional Serif</option>
                                            <option value="--family-monospaced-sans-serif">Monospaced Sans Serif</option>
                                            <option value="--family-proportional-sans-serif" selected="selected">Proportional Sans Serif</option>
                                            <option value="--family-casual">Casual</option>
                                            <option value="--family-cursive">Cursive</option>
                                            <option value="--family-small-capitals">Small Capitals</option>
                                        </select>
                                    </li>
                                    <li class="settings-menu-list-item">Font Color: 
                                        <select class="settings-menu-select font-color">
                                            ${Array.from(this.config.availableColors).map((e) => 
                                                `<option value="${e}">${e.charAt(0).toUpperCase() + e.slice(1)}</option>`
                                            ).join('')}
                                        </select>
                                    </li>
                                    <li class="settings-menu-list-item">Font Size: 
                                        <select class="settings-menu-select font-size">
                                            ${Array.from(this.config.availableSize).map((e) =>{
                                                return `<option value="${e}"${e==100 ? ' selected="selected"' : ''}>${e}%</option>`;
                                            }).join('')}
                                        </select>
                                    </li>
                                    <li class="settings-menu-list-item">Background Color: 
                                        <select class="settings-menu-select bg-color">
                                            ${Array.from(this.config.availableColors).map((e) => 
                                                `<option value="${e}">${e.charAt(0).toUpperCase() + e.slice(1)}</option>`
                                            ).join('')}
                                        </select>
                                    </li>
                                    <li class="settings-menu-list-item">Background Opacity: 
                                        <select class="settings-menu-select bg-opacity">
                                            ${Array.from(this.config.availableOpacity).map((e) => 
                                                `<option value="${e/100}"${e==75 ? ' selected="selected"' : ''}>${e}%</option>`
                                            ).join('')}
                                        </select>
                                    </li>
                                    <li class="settings-menu-list-item">Window Color: 
                                        <select class="settings-menu-select window-color">
                                            ${Array.from(this.config.availableColors).map((e) => 
                                                `<option value="${e}">${e.charAt(0).toUpperCase() + e.slice(1)}</option>`
                                            ).join('')}
                                        </select>
                                    </li>
                                    <li class="settings-menu-list-item">Window Opacity: 
                                        <select class="settings-menu-select window-opacity">
                                            ${Array.from(this.config.availableOpacity).map((e) => 
                                                `<option value="${e/100}"${e==0 ? ' selected="selected"' : ''}>${e}%</option>`
                                            ).join('')}
                                        </select>
                                    </li>
                                    <li class="settings-menu-list-item">Font Opacity: 
                                        <select class="settings-menu-select font-opacity">
                                            ${Array.from(this.config.availableOpacity).map((e) => 
                                                `<option value="${e/100}"${e==100 ? ' selected="selected"' : ''}>${e}%</option>`
                                            ).join('')}
                                        </select>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <i class="fa-solid fa-arrow-up-right-from-square btn pip" title="Miniplayer (i)"></i>
                    <i class="fa-regular fa-expand-wide btn theaterMode" title="Theater Mode (t)"></i>
                    <i class="fa-solid fa-expand fullscreen btn" title="Fullscreen (f)"></i>
                </div>
            </div>
        </div>`;

        setTimeout(() => {
            const x = document.querySelector('.option-quality .settings-menu-list');
            if (x.innerText.trim() === '') {
                x.innerHTML = Array.from(this.container.querySelectorAll('.video-frame source[data-quality]'))
                    .sort((a, b) => {
                        const qualityA = a.getAttribute('data-quality') === 'auto' ? -1 : parseInt(a.getAttribute('data-quality') || 0, 10);
                        const qualityB = b.getAttribute('data-quality') === 'auto' ? -1 : parseInt(b.getAttribute('data-quality') || 0, 10);
                        return qualityA - qualityB;
                    })
                    .map((e) => 
                        `<li class="settings-menu-list-item${e.getAttribute('data-quality') === 'auto' ? ' checked' : ''}" data-quality="${e.getAttribute('data-quality')}"><span>${e.getAttribute('data-quality') !== 'auto' ? `${e.getAttribute('data-quality').charAt(0).toUpperCase() + e.getAttribute('data-quality').slice(1)}p` : `${e.getAttribute('data-quality').charAt(0).toUpperCase() + e.getAttribute('data-quality').slice(1)}`}</span></li>`
                    ).join('');
            }
        }, 100);
    }
    #createVideoFrame(){
        const video = document.createElement('video');
        video.setAttribute('preload', this.config.preloaded);
        video.classList.add('video-frame');
        video.tabIndex = 0;
        this.config.playlists.map((s)=>{
            s.src.map((src) =>{
                const source = document.createElement('source');
                source.src = src['path'];
                source.setAttribute('data-quality', src['quality']??'auto');
                source.type = this.#getVideoType(src['path']);
                const currentVideoID = new URLSearchParams(window.location.search).get('v');
                const currentPlaylist = this.config.playlists.find(playlist => 
                    this.#videoList.some(video => video.videoID === currentVideoID && fileName(playlist.src[0].path) === video.videoName)
                );
                video.poster = currentPlaylist ? currentPlaylist.poster : this.config.poster;
                if(src['quality']==='auto') video.src = src['path'];
                video.appendChild(source);
            });
        });

        

        this.config.tracks?.map((tracks)=>{
            const track = document.createElement('track');
            track.src = tracks['src'];
            track.kind = tracks['kind'];
            track.srclang = tracks['srclang'];
            track.label = tracks['label'];
            video.appendChild(track);
        });


        const preview = document.createElement('video');
        preview.classList.add('preview-video');
        this.config.playlists.map((s)=>{
            s.src.map((src) =>{
                const source = document.createElement('source');
                source.setAttribute('data-quality', src['quality']??'auto');
                source.src = src['path'];
                source.type = this.#getVideoType(src['path']);
                preview.appendChild(source);
            });
        })
        this.container.querySelector('.video-placeholder').appendChild(video);
        this.container.querySelector('.video-placeholder').appendChild(preview);

    }
    #createVolumeBtn(){
        const btn = document.createElement('i');
        btn.className = `fa-solid fa-volume btn volume`;
        btn.title = `Mute (m)`;
        const getFrame = this.container.querySelector('.video-frame');
        btn.addEventListener('click',function(){
            const range = this.parentNode.querySelector('input');
            const activeColor = this.styles&&this.styles['volume-track-before'] ?  this.styles['volume-track-before'] : '#e7e7e7';
            const inactiveColor = this.styles&&this.styles['volume-track-after'] ? this.styles['volume-track-after'] : '#c8c8c8';
            if(range.value==0){
                range.value = 100;
                this.className = `fa-solid fa-volume btn volume`;
                btn.title = `Mute (m)`;
                getFrame.volume = 1;
                range.style.background = `linear-gradient(90deg, ${activeColor} 100%, ${inactiveColor} 100%)`;
            }else{
                range.value = 0;
                this.className = `fa-solid fa-volume-slash btn volume`;
                btn.title = `Unmute (m)`;
                getFrame.volume = 0;
                range.style.background = `linear-gradient(90deg, ${activeColor} 0%, ${inactiveColor} 0%)`;
            }
        });
        this.container.querySelector('.volume-container .volume-holder').appendChild(btn);
    }
    #createVolume(){
        const inputRange = document.createElement('input');
        inputRange.type = 'range';
        inputRange.classList.add('volumeRange');
        inputRange.min = 0;
        inputRange.max = 100;
        inputRange.value = 100;
        const activeColor = this.styles['volume-track-before']??'#e7e7e7';
        const inactiveColor = this.styles['volume-track-after']??'#c8c8c8';
        const getFrame = this.container.querySelector('.video-frame');
        inputRange.addEventListener("input", function() {
            const ratio = (this.value - this.min) / (this.max - this.min) * 100;
            this.style.background = `linear-gradient(90deg, ${activeColor} ${ratio}%, ${inactiveColor} ${ratio}%)`;
            const btn = this.parentNode.querySelector('.btn');
            if(this.value==100) btn.className = `fa-solid fa-volume btn volume`;
            if(this.value<100&&this.value>0) btn.className = `fa-solid fa-volume-low btn volume`;
            if(this.value==0) btn.className = `fa-solid fa-volume-slash btn volume`;
            getFrame.volume = this.value/100;
        });
        this.container.querySelector('.volume-container .volume-holder').appendChild(inputRange);
    }
    #pausePlay(){
        this.container.querySelector('.play-pause').addEventListener('click',()=>{
            if(!this.container.querySelector('.video-frame').paused){
                this.container.querySelector('.video-frame').pause();
                this.container.querySelector('.play-pause').title = 'Play (k)';
            }
            else{
                this.container.querySelector('.video-frame').play();
                this.container.querySelector('.play-pause').title = 'Pause (k)';
            }
        });
        this.container.querySelector('.pip-play-pause').addEventListener('click',()=>{
            if(!this.container.querySelector('.video-frame').paused) this.container.querySelector('.video-frame').pause();
            else this.container.querySelector('.video-frame').play();
        });
    }
    #sec2time(seconds){
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return hours > 0 
            ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
            : `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    #videoEvents(){
        const video = this.container.querySelector('.video-frame');
        
        video.addEventListener('waiting', function() {
            this.parentNode.parentNode.querySelector('.bufferLoader').style.display = 'block';
            this.parentNode.parentNode.querySelector('.play-pause').setAttribute('disabled', true);
        });

        video.addEventListener('canplay', function() {
            this.parentNode.parentNode.querySelector('.bufferLoader').style.display = 'none';
            this.parentNode.parentNode.querySelector('.play-pause').removeAttribute('disabled');
        });

        video.addEventListener('playing', function() {
            
            this.parentNode.parentNode.querySelector('.play-pause').className = this.parentNode.parentNode.querySelector('.play-pause').className.replace('fa-play', 'fa-pause');
            this.parentNode.parentNode.querySelector('.pip-play-pause').className = this.parentNode.parentNode.querySelector('.pip-play-pause').className.replace('fa-play', 'fa-pause');
            const x = this.parentNode.parentNode.querySelector('.playpauseUI');
            x.setAttribute('data-status','isPlaying');
            // restart animation if it was already running
x.classList.remove('toggled');
void x.offsetWidth; // reflow to restart CSS animation
x.classList.add('toggled');
// Remove the class when animation completes (prevents flicker)
x.addEventListener('animationend', () => { x.classList.remove('toggled'); }, { once: true });

        });

        video.addEventListener('pause', function() {
            const x = this.parentNode.parentNode.querySelector('.playpauseUI');
            x.setAttribute('data-status','isPaused');
            // restart animation if it was already running
x.classList.remove('toggled');
void x.offsetWidth; // reflow to restart CSS animation
x.classList.add('toggled');
// Remove the class when animation completes (prevents flicker)
x.addEventListener('animationend', () => { x.classList.remove('toggled'); }, { once: true });

            this.parentNode.parentNode.querySelector('.play-pause').className = this.parentNode.parentNode.querySelector('.play-pause').className.replace('fa-pause', 'fa-play');
            this.parentNode.parentNode.querySelector('.pip-play-pause').className = this.parentNode.parentNode.querySelector('.pip-play-pause').className.replace('fa-pause', 'fa-play');
        });

        video.addEventListener('timeupdate', ()=>{
            const progressBar = this.container.querySelector('.progress-bar');
            const ratio = (video.currentTime / video.duration) * 100;
            progressBar.style.width = `${ratio}%`;
            this.container.querySelector('.current-time').innerText = this.#sec2time(video.currentTime);
        });
        
        // Check if video ended and autoplay is enabled
        video.addEventListener('ended', () => {
            if (this.config.autoplay) {
                const playlistItems = Array.from(this.container.querySelectorAll('.playlist-item'));
                const currentVideoID = new URLSearchParams(window.location.search).get('v');
                const currentIndex = playlistItems.findIndex(item => item.getAttribute('data-video') === currentVideoID);
                if (currentIndex !== -1) {
                    const nextIndex = (currentIndex + 1) % playlistItems.length;
                    const onCanPlay = () => {
                        video.removeEventListener('canplay', onCanPlay);
                        const p = video.play();
                        if (p && typeof p.catch === 'function') p.catch(() => {});
                    };
                    video.addEventListener('canplay', onCanPlay, { once: true });
                    playlistItems[nextIndex].click();
                }
            }
        });

        video.addEventListener('progress', () => {
            const bufferBar = this.container.querySelector('.progress-buffer');
            if (video.buffered.length > 0) {
            const bufferedEnd = video.buffered.end(video.buffered.length - 1);
            const ratio = (bufferedEnd / video.duration) * 100;
            bufferBar.style.width = `${ratio}%`;
            }
        });
        this.container.querySelector('.video-player').addEventListener('contextmenu', (event) => {
            event.preventDefault();
            const menu = this.container.querySelector('.content-menu-controls');
            menu.style.display = 'block';
            menu.style.left = `${Math.max(0, Math.min(event.clientX, this.container.querySelector('.video-player').clientWidth-menu.clientWidth))}px`;
            menu.style.top = `${Math.max(0, Math.min(event.clientY, this.container.querySelector('.video-player').clientHeight-menu.clientHeight))}px`;
            this.container.querySelector('.preview-frame').style.display = 'none';
            this.container.querySelector('.information').style.display = 'none';
        });
        window.addEventListener('click', (event) => {
            const menu = this.container.querySelector('.content-menu-controls');
            if (menu.style.display === 'block') {
                menu.style.display = 'none';
            }
        });

        this.container.querySelector('.autoplay').addEventListener('input',()=>{
            const x = this.container.querySelector('.autoplay');
            window.localStorage.setItem('mediaViewer_video_config',JSON.stringify({
                'autoplay': x.checked
            }));
            this.config.autoplay = x.checked;
            x.parentNode.title = `Autoplay is ${x.checked ? 'on' : 'off'}`;
        });

        this.container.querySelectorAll('.content-menu-controls li').forEach(l=>{
            l.addEventListener('click',(event)=>{
                const elm = event.target.tagName!=='I' ? event.target : event.target.parentNode;
                const src = video.currentSrc;
                let tempSrc;
                const getSrcID = (videoName)=>{
                    return this.#videoList.find(v => v.videoName === fileName(videoName))['videoID'];
                }
                switch(elm.getAttribute('data-action').toLocaleLowerCase()){
                    case 'loop':
                        elm.classList.toggle('checked');
                        video.loop = video.loop ? false : true;
                    break;
                    case 'copyurl':
                        this.container.querySelectorAll('source').forEach(e=>{
                            if(src.match(e.src)) tempSrc = getSrcID(e.getAttribute('src'));
                        });
                        clipboard.copy(`${window.location.href.replace(/\?(.*)$/,'')}?v=${tempSrc}`) ? alert('copied to clipboard') : alert('failed to copy');
                    break;
                    case 'copytimeurl':
                        this.container.querySelectorAll('source').forEach(e=>{
                            if(src.match(e.src)) tempSrc = getSrcID(e.getAttribute('src'));
                        });
                        clipboard.copy(`${window.location.href.replace(/\?(.*)$/,'')}?v=${tempSrc}&t=${Math.floor(video.currentTime)}`) ? alert('copied to clipboard') : alert('failed to copy');
                    break;
                    case 'copyembed':
                        const vID = (new URLSearchParams(window.location.search)).get('v');
                        const record = this.#videoList.find(v => v.videoID === vID);
                        if (!record) { alert('Unable to build embed code: unknown video ID'); break; }
                        const x = record['videoName'];
                        window.localStorage.setItem(`embed_${vID}`, JSON.stringify({ lists: this.#videoList, playlists: this.config.playlists.filter((i)=> i.src[0].path.match(x)) }));
                        clipboard.copy(`<iframe width="937" height="527" src="${this.config.embedURL}?v=${vID}" title="${this.container.querySelector('.video-title').innerText??''}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`) ? alert("Copied to clipboard") : alert("Failed to copy");
                    break;
                    case 'openqrcode':
                        this.container.querySelectorAll('source').forEach(e=>{
                            if(src.match(e.src)) tempSrc = getSrcID(e.getAttribute('src'));
                        });
                        GenerateQRCode(this.container.querySelector('.QRcode'),{
                            text: `${window.location.href.replace(/\?(.*)$/,'')}?v=${tempSrc}`,
                            width: 200,
                            height: 200,
                            crossOrigin: 'anonymous',
                            logo: (document.querySelector('link[rel*=icon]') ? new URL(document.querySelector('link[rel*=icon]').getAttribute('href'), location.origin) : '')
                        });
                        this.container.querySelector('.QRcode').classList.add('show');
                    break;
                    default:
                    break;
                }
            });
        });

        if(this.container.querySelector('.QRcode .close')){
            this.container.querySelector('.QRcode .close').addEventListener('click',function(){
                this.parentNode.querySelectorAll('canvas').forEach(e=>e.remove());
                this.parentNode.classList.remove('show');
            });
        }

        this.container.querySelector('.fullscreen').addEventListener('click',()=>{
            this.container.classList.toggle('video-fullscreen');
            if(this.container.classList.contains('video-fullscreen')){
                const screen =  this.container.querySelector('.fullscreen');
                screen.className = screen.className.replace('fa-expand','fa-compress');
                screen.title = 'Exit Fullscreen (f)';
                if (this.container.requestFullscreen) {
                    this.container.requestFullscreen();
                } else if (this.container.mozRequestFullScreen) { // Firefox
                    this.container.mozRequestFullScreen();
                } else if (this.container.webkitRequestFullscreen) { // Chrome, Safari, Opera
                    this.container.webkitRequestFullscreen();
                } else if (this.container.msRequestFullscreen) { // IE/Edge
                    this.container.msRequestFullscreen();
                }
                const subtitles = this.container.querySelectorAll('track[kind="subtitles"]');
                subtitles.forEach(track => {
                    track.track.mode = 'hidden';
                });
                this.container.querySelector('.cc').classList.remove('active');
                const preDisabled = !this.container.querySelector('.video-frame track[kind="subtitles"]') ? true : false;
                if(!preDisabled)
                    this.container.querySelector('.cc').setAttribute('disabled',true);
                this.container.querySelector('.pip').classList.add('hidden');
                this.container.querySelector('.theaterMode').classList.add('hidden');
                this.container.querySelector('.closed-captions-bar').classList.remove('active');
            }else{
                const screen =  this.container.querySelector('.fullscreen');
                screen.className = screen.className.replace('fa-compress','fa-expand');
                screen.title = 'Fullscreen (f)';
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.mozCancelFullScreen) { // Firefox
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) { // Chrome, Safari, Opera
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) { // IE/Edge
                    document.msExitFullscreen();
                }
                const preDisabled = !this.container.querySelector('.video-frame track[kind="subtitles"]') ? true : false;
                if(!preDisabled)
                    this.container.querySelector('.cc').removeAttribute('disabled');
                this.container.querySelector('.pip').classList.remove('hidden');
                this.container.querySelector('.theaterMode').classList.remove('hidden');
            }
            
        });

        

        this.container.querySelector('.playlists').addEventListener('mouseover',()=>{
            this.container.querySelector('.controls').setAttribute('style','transform:translateY(130%);opacity:0;');
        });



        this.container.querySelector('.playlists').addEventListener('mouseleave',()=>{
            this.container.querySelector('.controls').removeAttribute('style');
        });

        this.container.querySelector('.video-frame').addEventListener('dblclick',()=>{
            this.container.querySelector('.fullscreen').click();
        });


        document.addEventListener('fullscreenchange', () => {
            const screen =  this.container.querySelector('.fullscreen');
                
            if (!document.fullscreenElement && this.container.classList.contains('video-fullscreen')) {
                this.container.classList.remove('video-fullscreen');
                screen.className = screen.className.replace('fa-compress', 'fa-expand');
                screen.title = 'Fullscreen (f)';

                this.container.querySelector('.pip').classList.remove('hidden');
                this.container.querySelector('.theaterMode').classList.remove('hidden');
                const preDisabled = !this.container.querySelector('.video-frame track[kind="subtitles"]') ? true : false;
                if (!preDisabled) {
                    this.container.querySelector('.cc').setAttribute('disabled', false);
                }
            }
        });

  // Next-video button should advance to the next playlist item
  this.container.querySelector('.next-video')?.addEventListener('click', () => {
    const items = Array.from(this.container.querySelectorAll('.playlist-item'));
    if (items.length === 0) return;
    const currentVideoID = new URLSearchParams(window.location.search).get('v');
    const currentIndex = items.findIndex(el => el.getAttribute('data-video') === currentVideoID);
    const nextIndex = (currentIndex + 1) % items.length;
    items[nextIndex].click();
    if (this.config.autoplay) {
      const v = this.container.querySelector('.video-frame');
      const onCanPlay = () => {
        v.removeEventListener('canplay', onCanPlay);
        const p = v.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      };
      v.addEventListener('canplay', onCanPlay, { once: true });
    }
  });

        this.container.querySelector('.pip-expand').addEventListener('click',()=>{
            this.container.classList.remove('video-pip');
        });

        this.container.querySelector('.theaterMode').addEventListener('click',()=>{
            this.container.classList.toggle('video-theater');
            if(this.container.classList.contains('video-theater')){
                this.container.querySelector('.theaterMode').className = this.container.querySelector('.theaterMode').className.replace('fa-expand-wide','fa-compress-wide');
            }else{
                this.container.classList.add('video-theater-closing');
                setTimeout(()=>{
                    this.container.classList.remove('video-theater-closing');
                },350);
                this.container.querySelector('.theaterMode').className = this.container.querySelector('.theaterMode').className.replace('fa-compress-wide','fa-expand-wide');
            }
        })

    
        window.addEventListener('resize',()=>{
            this.container.querySelector('.closed-captions-bar').setAttribute('style',`top:${video.offsetHeight-20}px;`);
        });

        video.addEventListener('loadedmetadata', ()=>{
            video.querySelectorAll('source').forEach(e=>{
                const urlParams = new URLSearchParams(window.location.search);
                const x = this.#videoList.find(v => v.videoID === urlParams.get('v'))['videoName'];
                if(e.getAttribute('src').match(/([^/]+)(?=\.[^.]+$)/)[1]===x)
                    video.currentTime = this.config.start;
            });

            this.container.querySelectorAll('.playlists [data-video-src]').forEach(i=>{
                const checkID = (videoName)=>{
                    return this.#videoList.find(v => v.videoName === fileName(videoName))['videoID']
                }
                if(checkID(this.container.querySelector('.video-frame').src)===i.getAttribute('data-video-src'))
                    i.innerText = 'Now Playing';
                else
                    i.innerText = i.getAttribute('data-video-duration');
            });

            this.container.querySelector('.closed-captions-bar').setAttribute('style',`top:${video.offsetHeight-20}px;`);
            this.container.querySelector('.total-time').innerText = this.#sec2time(video.duration);
            const tracks = video.textTracks;
            const captionsText = this.container.querySelector('.closed-captions-text');
            for (let i = 0; i < tracks.length; i++) {
                if (tracks[i].mode === 'hidden') {
                    const activeCues = tracks[i].activeCues;
                    if (activeCues && activeCues.length > 0) {
                        captionsText.innerText = activeCues && activeCues.length > 0 ? activeCues[0].text : '';
                    } else {
                        const currentTime = video.currentTime;
                        const cues = tracks[i].cues;
                        if (cues) {
                            for (let j = 0; j < cues.length; j++) {
                                const cue = cues[j];
                                if (currentTime >= cue.startTime && currentTime <= cue.endTime) {
                                    captionsText.innerText = cue.text;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        });

        this.container.querySelector('.video-frame').addEventListener('click',(e)=>{
            if(!e.target.paused) e.target.pause();
            else e.target.play();
        });

        this.container.querySelector('.video-frame').addEventListener('keydown',(event) => shortcuts(event));

        const shortcuts = (e)=>{
  // Avoid interfering with typing in form fields/contenteditable
  if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return;

  const keyRaw = e.key ?? e.keyCode ?? e.which;
  const key = (typeof keyRaw === 'string') ? keyRaw.toLowerCase() : keyRaw;

  // Play/Pause: space or 'k'
  if (key === ' ' || key === 'k' || key === 32 || key === 75) {
    if (e.repeat) return;
    e.preventDefault();
    e.stopPropagation();
    this.container.querySelector('.play-pause').click();
    return;
  }

  // Seek left/right
  if (key === 'arrowleft' || key === 37) {
    e.preventDefault();
    video.currentTime = Math.max(0, video.currentTime - this.config.skipRate);
    return;
  }
  if (key === 'arrowright' || key === 39) {
    e.preventDefault();
    video.currentTime = Math.min(video.duration, video.currentTime + this.config.skipRate);
    return;
  }

  // Mute toggle ('m')
  if (key === 'm' || key === 77) {
    e.preventDefault();
    const videoEl = this.container.querySelector('.video-frame');
    videoEl.muted = !videoEl.muted;
    const volumeBtn = this.container.querySelector('.volume'),
          volumeRange = this.container.querySelector('.volumeRange');
    const activeColor = this.styles['volume-track-before']??'#e7e7e7';
    const inactiveColor = this.styles['volume-track-after']??'#c8c8c8';
    if (videoEl.muted) {
      volumeBtn.className = `fa-solid fa-volume-slash btn volume`;
      volumeRange.value = volumeRange.min;
      volumeBtn.title = 'Unmute (m)';
      volumeRange.style.background = `linear-gradient(90deg, ${activeColor} 0%, ${inactiveColor} 0%)`;
    } else {
      volumeBtn.className = `fa-solid fa-volume btn volume`;
      volumeRange.value = volumeRange.max;
      volumeBtn.title = 'Mute (m)';
      volumeRange.style.background = `linear-gradient(90deg, ${activeColor} 100%, ${inactiveColor} 100%)`;
    }
    return;
  }

  // PiP
  if (key === 'i' || key === 73){
    if(this.container.classList.contains('video-pip'))
      this.container.querySelector('.pip-expand').click();
    else
      this.container.querySelector('.pip').click();
    return;
  }

  // CC
  if (key === 'c' || key === 67){
    const cc = this.container.querySelector('.cc:not([disabled])');
    if (cc) cc.click();
    return;
  }

  // Theater
  if (key === 't' || key === 84){
    e.preventDefault();
    this.container.querySelector('.theaterMode').click();
    return;
  }

  // Fullscreen
  if (key === 'f' || key === 70){
    e.preventDefault();
    this.container.querySelector('.fullscreen').click();
    return;
  }
}
const progressContainer = this.container.querySelector('.progress');

        progressContainer.addEventListener('click', (event) => {
            const rect = progressContainer.getBoundingClientRect();
            const offsetX = event.clientX - rect.left;
            const ratio = offsetX / rect.width;
            const newTime = ratio * video.duration;
            if (isFinite(newTime) && !isNaN(newTime)) {
                video.currentTime = newTime;
            }
        });

    
        var mouseDown=false;
        progressContainer.querySelector('.progress-bar').addEventListener('mousedown', () => {
            mouseDown = true;
        });
        progressContainer.querySelector('.progress-bar').addEventListener('mouseup', () => {
            mouseDown = false;
        });
        progressContainer.addEventListener('mousemove', (event) => {
            if (mouseDown) {
            const rect = progressContainer.getBoundingClientRect();
            const offsetX = event.clientX - rect.left;
            const ratio = offsetX / rect.width;
            video.currentTime = ratio * video.duration;
            }
        });

        progressContainer.querySelector('.progress-bar').addEventListener('touchstart', () => {
            mouseDown = true;
        });
        progressContainer.querySelector('.progress-bar').addEventListener('touchend', () => {
            mouseDown = false;
        });
        progressContainer.addEventListener('touchmove', (event) => {
            if (mouseDown) {
            const rect = progressContainer.getBoundingClientRect();
            const touch = event.touches[0];
            const offsetX = touch.clientX - rect.left;
            const ratio = offsetX / rect.width;
            video.currentTime = ratio * video.duration;
            }
        });

        
    

        this.container.querySelector('.cc').addEventListener('click',()=>{
            this.container.querySelector('.cc').classList.toggle('active');
            this.container.querySelector('.closed-captions-bar').classList.toggle('active');
        });

        this.container.querySelector('.pip').addEventListener('click', () => {
            this.container.classList.add('video-pip')
        });

        video.load();
    }
    #triggerVideo(){
        let hasPlayed=0;
        window.addEventListener('click',()=>{
            if(this.config.autoplay){
                if(!hasPlayed){
                    this.container.querySelector('.video-frame').play();
                    hasPlayed = 1;
                }
            }
        });
        this.container.querySelector('.video-frame').addEventListener('loadedmetadata',()=>{
            const chaptersTrack = this.container.querySelector('track[kind="chapters"]');
            if (chaptersTrack) {
                chaptersTrack.addEventListener('load', (event) => {
                    const track = event.target.track;
                    track.mode = 'hidden';
                    const cues = track.cues;
                    const progressContainer = this.container.querySelector('.progress');
                    if (cues) {
                        Array.from(cues).forEach(cue => {
                            const chapterLine = document.createElement('span');
                            chapterLine.classList.add('chapter-line');
                            const ratio = cue.endTime / this.container.querySelector('.video-frame').duration;
                            chapterLine.style.left = `${Math.min(ratio * 100, 100)}%`;
                            chapterLine.dataset.startTime = cue.startTime;
                            chapterLine.dataset.endTime = cue.endTime;
                            chapterLine.dataset.text = cue.text;
                            progressContainer.appendChild(chapterLine);
                        });
                    }
                });
                chaptersTrack.dispatchEvent(new Event('load'));
            }
        });

        

        const progressContainer = this.container.querySelector('.progress'),
        progressCheckpoint = progressContainer.querySelector('.progress-checkpoint');

        
        progressContainer.addEventListener('mouseleave', () => {
            progressCheckpoint.style.width = '0%';
            this.container.querySelector('.preview-frame').style.display = 'none';
        });
        this.container.querySelectorAll('.preview-frame, .information, .section, .video-frame, .section.progress').forEach(i=>{
            i.addEventListener('mouseenter',(e)=>{
                progressCheckpoint.style.width = '0%';
                this.container.querySelector('.preview-frame').style.display = 'none';
            });
        });

        progressContainer.addEventListener('mousemove', (event) => {
            const rect = progressContainer.getBoundingClientRect();
            let offsetX = event.clientX - rect.left;
            offsetX = Math.max(0, Math.min(offsetX, rect.width));
            const ratio = offsetX / rect.width;
            progressCheckpoint.style.width = `${ratio * 100}%`;

            const previewFrame = this.container.querySelector('.preview-frame');

            const videoElement = this.container.querySelector('.preview-video');
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;

            const captureFrame = () => {
                context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                const previewImageUrl = canvas.toDataURL();
                previewFrame.style.left = `${Math.max(66, Math.min(offsetX, rect.width - previewFrame.offsetWidth/2))}px`;
                previewFrame.style.backgroundImage = `url(${previewImageUrl})`;
                previewFrame.style.display = 'block';
                this.container.querySelector('.timestamp').innerText = this.#sec2time(videoElement.currentTime);
                const chapterName = Array.from(progressContainer.querySelectorAll('.chapter-line')).find(line => {
                    const startTime = parseFloat(line.dataset.startTime);
                    const endTime = parseFloat(line.dataset.endTime);
                    return videoElement.currentTime >= startTime && videoElement.currentTime <= endTime;
                });
                this.container.querySelector('.chapter').innerText = chapterName ? chapterName.dataset.text : '';
                videoElement.removeEventListener('seeked', captureFrame);
            };
            if (isFinite(ratio * videoElement.duration)&&!isNaN(ratio * videoElement.duration)) {
                videoElement.currentTime = ratio * videoElement.duration;
            }
            videoElement.addEventListener('seeked', captureFrame);
            const information = this.container.querySelector('.information');
            information.style.display = 'flex';
            information.style.left = `${Math.max(66, Math.min(offsetX, rect.width - previewFrame.offsetWidth/2))}px`;
        });

        progressContainer.addEventListener('mouseleave',()=>{
            this.container.querySelector('.information').style.display = 'none';
        });
        this.container.addEventListener('mouseleave',function(){
            this.querySelector('.setting-container').classList.remove('active');
        });
        this.#triggerSubtitles();
        this.container.querySelector('.settings').addEventListener('click',function(){
            this.parentNode.classList.toggle('active');
        });

    }
    #triggerSubtitles(){
        if (this.container.querySelector('.closed-captions-bar')) {
            this.container.querySelector('.closed-captions-bar').addEventListener('mouseover',()=>{
                this.container.querySelector('.preview-frame').style.display = 'none';
                this.container.querySelector('.information').style.display = 'none';
            });
        }
        if(this.container.querySelector('track[kind="subtitles"]')){
            const tracks = this.container.querySelectorAll('track[kind="subtitles"]');
            let hasCheckedTrack = false;

            tracks.forEach(track => {
                if (track.srclang===navigator.language.substring(0,2)) {
                    track.setAttribute('checked', 'checked');
                    track.track.mode = 'hidden';
                    this.container.querySelector(`.settings-menu-list-item[data-subtitle="${track.srclang}"]`).classList.add('checked');
                    hasCheckedTrack = true;
                } else 
                    track.track.mode = 'disabled';
            });
            if (!hasCheckedTrack) {
                tracks.forEach(track => {
                    if (track.label === this.config.defaultLang || track.srclang === this.config.defaultLang) {
                        track.setAttribute('checked', 'checked');
                        track.track.mode = 'hidden';
                        this.container.querySelector(`.settings-menu-list-item[data-subtitle="${track.srclang}"]`).classList.add('checked');
                    } else {
                        track.track.mode = 'disabled';
                    }
                });
            }
            this.container.querySelector('.cc').removeAttribute('disabled');
            const selectedTrack = Array.from(tracks).find(track => track.getAttribute('kind') === 'subtitles' && track.hasAttribute('checked'));
            if (selectedTrack) {
                selectedTrack.track.addEventListener('cuechange', (event) => {
                    const captionsText = this.container.querySelector('.closed-captions-text');
                    if (activeCues && activeCues.length > 0) {
                        captionsText.innerText = activeCues[0].text;
                    }
                });
            }
        }else this.container.querySelector('.cc').setAttribute('disabled',true);
    }
    #triggerSettings(){
        this.container.querySelectorAll('[data-settings]').forEach(e=>{
            e.addEventListener('click',function(){
                if(this.parentNode.parentNode.querySelector(`.${this.getAttribute('data-settings')}`)){
                    this.parentNode.parentNode.querySelector(`.${this.getAttribute('data-settings')}`).classList.add('active');
                    this.parentNode.classList.add('hidden');
                }
            });
        });
        this.container.querySelectorAll('.settings-back').forEach(e=>{
            e.addEventListener('click',function(){
                this.parentNode.parentNode.parentNode.classList.remove('active');
                this.parentNode.parentNode.parentNode.parentNode.querySelector('.settings-menu-list').classList.remove('hidden');
            });
        });

        this.container.querySelector('.cc-options').addEventListener('click',()=>{
            this.container.querySelector('.option-cc').classList.remove('active');
            this.container.querySelector('.option-cc-more').classList.add('active');
        });

        this.container.querySelector('.settings-back-more').addEventListener('click',()=>{
            this.container.querySelector('.option-cc-more').classList.remove('active');
            this.container.querySelector('.option-cc').classList.add('active');
        });

        setTimeout(()=>{
            this.container.querySelectorAll(`.option-cc .settings-menu-list-item`).forEach(e=>{
                e.addEventListener('click',k=>{
                    k = k.target.tagName!=='SPAN' ? k.target : k.target.parentNode;
                    this.container.querySelectorAll(`.option-cc .settings-menu-list-item`).forEach(e=>{
                        if(e.getAttribute('data-subtitle')===k.getAttribute('data-subtitle')){
                            e.classList.add('checked');
                            this.container.querySelector(`.video-frame track[kind="subtitles"][srclang="${k.getAttribute('data-subtitle')}"]`).setAttribute('checked', 'checked');
                            this.container.querySelector(`.video-frame track[kind="subtitles"][srclang="${k.getAttribute('data-subtitle')}"]`).track.mode = 'hidden';
                        }else{
                            e.classList.remove('checked');
                            this.container.querySelector(`.video-frame track[kind="subtitles"][srclang="${e.getAttribute('data-subtitle')}"]`).removeAttribute('checked');
                            this.container.querySelector(`.video-frame track[kind="subtitles"][srclang="${e.getAttribute('data-subtitle')}"]`).track.mode = 'disabled';
                        }
                    });
                    const tracks = this.container.querySelectorAll(`.video-frame track[kind="subtitles"]`);
                    if (tracks.length === 0) return;
                    tracks.forEach(e=>{
                        setTimeout(()=>{
                            if (e.track.mode === 'hidden') {
                                const activeCues = e.track.activeCues;
                                const captionsText = this.container.querySelector('.closed-captions-text');
                                if (activeCues && activeCues.length > 0) {
                                    captionsText.innerText = activeCues[0].text;
                                } else {
                                    const currentTime = this.container.querySelector('.video-frame').currentTime;
                                    const cues = e.track.cues;
                                    if (cues && cues.length > 0) {
                                        Array.from(cues).forEach(cue => {
                                            if (currentTime >= cue.startTime && currentTime <= cue.endTime) {
                                                captionsText.innerText = cue.text;
                                            }
                                        });
                                    }
                                }
                            }
                            const selectedTrack = Array.from(this.container.querySelectorAll('track')).find(track => track.getAttribute('kind') === 'subtitles' && track.hasAttribute('checked'));
                            if (selectedTrack) {
                                selectedTrack.track.addEventListener('cuechange', (event) => {
                                    const activeCues = event.target.activeCues;
                                    const captionsText = this.container.querySelector('.closed-captions-text');
                                    if (activeCues && activeCues.length > 0) {
                                        captionsText.innerText = activeCues[0].text;
                                    }
                                });
                            }
                        },100);
                    });
                });
            });
        },0);

        this.container.querySelector('.font-family').addEventListener('input',(e)=>{
            if(e.target.value==='--family-small-capitals')
                this.container.querySelector('.closed-captions-text').classList.add('small-caps');
            else
                this.container.querySelector('.closed-captions-text').classList.remove('small-caps');
            this.container.style.setProperty('--video-cue-font', `var(${e.target.value})`);
        });
        this.container.querySelector('.font-color').addEventListener('input',(e)=>{
            const v = e.target.value;
            this.container.style.setProperty('--video-cue-font-color', `${color.parseRGB(color.name2rgb(v)).r}, ${color.parseRGB(color.name2rgb(v)).g}, ${color.parseRGB(color.name2rgb(v)).b}`);
        });
        this.container.querySelector('.font-size').addEventListener('input', (e) => {
            const v = e.target.value;
            this.container.style.setProperty('--video-cue-font-size', `${v}%`);
            const video = this.container.querySelector('.video-frame');
            const captionsBar = this.container.querySelector('.closed-captions-bar');
            captionsBar.style.top = `${video.offsetHeight - captionsBar.offsetHeight - 20}px`;
        });
        this.container.querySelector('.bg-color').addEventListener('input',(e)=>{
            const v = e.target.value;
            this.container.style.setProperty('--video-cue-bg', `${color.parseRGB(color.name2rgb(v)).r}, ${color.parseRGB(color.name2rgb(v)).g}, ${color.parseRGB(color.name2rgb(v)).b}`);
        });
        this.container.querySelector('.bg-opacity').addEventListener('input',(e)=>{
            const v = e.target.value;
            this.container.style.setProperty('--video-cue-bg-opacity', `${v}`);
        });
        this.container.querySelector('.window-color').addEventListener('input',(e)=>{
            const v = e.target.value;
            this.container.style.setProperty('--video-cue-window-color', `${color.parseRGB(color.name2rgb(v)).r}, ${color.parseRGB(color.name2rgb(v)).g}, ${color.parseRGB(color.name2rgb(v)).b}`);
        });
        this.container.querySelector('.window-opacity').addEventListener('input',(e)=>{
            const v = e.target.value;
            this.container.style.setProperty('--video-cue-window-opacity', `${v}`);
        });
        this.container.querySelector('.font-opacity').addEventListener('input',(e)=>{
            const v = e.target.value;
            this.container.style.setProperty('--video-cue-font-opacity', `${v}`);
        });


        this.container.querySelectorAll('li[data-speed]').forEach((e)=>{
            e.addEventListener('click',function(){
                this.parentNode.querySelectorAll('li[data-speed]').forEach(e=>{
                    e.classList.remove('checked');
                });
                this.classList.add('checked');
                const speed = parseFloat(this.getAttribute('data-speed'));
                const elem = this.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.querySelector('.video-frame');
                elem.playbackRate = speed;
            });
        });
        setTimeout(()=>{
            this.container.querySelectorAll('li[data-quality]').forEach((e)=>{
                e.addEventListener('click',function(){
                    this.parentNode.querySelectorAll('li[data-quality]').forEach(e=>{
                        e.classList.remove('checked');
                    });
                    this.classList.add('checked');
                    const quality = this.getAttribute('data-quality');
                    const video = this.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.querySelector('.video-frame');
                    const currentTime = video.currentTime;
                    const isPlaying = !video.paused;
            
                    const selectedSource = Array.from(video.querySelectorAll('source')).find(source => source.getAttribute('data-quality') === quality);
                    if (selectedSource) {
                        video.pause();
                        video.src = selectedSource.src;
                        video.load();
                        video.currentTime = currentTime;
                        if (isPlaying) {
                            video.play();
                        }
                    }
                });
            });
        },100);
    }
    #getLang(srclang, lang){
        if(srclang===lang) return true;
        else return false;
    }
    #playlists(){
        this.container.querySelectorAll('.playlist-item').forEach(i=>{
            i.addEventListener('click',(e)=>{
                setTimeout(()=>{
                    const optionCC = this.container.querySelector('[data-settings="option-cc"]');
                    if (optionCC) {
                        if (!this.container.querySelector('track[kind="subtitles"]'))
                            optionCC.style.display = 'none';
                        else
                            optionCC.style.display = 'block';
                    }
                    // Update quality menu after playlist change
                    const qualityMenu = this.container.querySelector('.option-quality .settings-menu-list');
                    if (qualityMenu) {
                        const videoFrame = this.container.querySelector('.video-frame');
                        const sources = Array.from(videoFrame.querySelectorAll('source[data-quality]'));
                        // Find the currently selected quality (the source with src matching videoFrame.src)
                        let checkedQuality = 'auto';
                        if (videoFrame.src) {
                            const currentSource = sources.find(s => s.src === videoFrame.src);
                            if (currentSource) {
                                checkedQuality = currentSource.getAttribute('data-quality');
                            }
                        }
                        qualityMenu.innerHTML = sources
                            .sort((a, b) => {
                                const qa = a.getAttribute('data-quality') === 'auto' ? -1 : parseInt(a.getAttribute('data-quality') || 0, 10);
                                const qb = b.getAttribute('data-quality') === 'auto' ? -1 : parseInt(b.getAttribute('data-quality') || 0, 10);
                                return qa - qb;
                            })
                            .map(source => {
                                const q = source.getAttribute('data-quality');
                                const checked = q === checkedQuality ? ' checked' : '';
                                const label = q !== 'auto' ? `${q.charAt(0).toUpperCase() + q.slice(1)}p` : `${q.charAt(0).toUpperCase() + q.slice(1)}`;
                                return `<li class="settings-menu-list-item${checked}" data-quality="${q}"><span>${label}</span></li>`;
                            }).join('');
                    }
                },100);
                
                const changeParams = (videoID)=>{
                    const urlParams = new URLSearchParams(window.location.search);
                    urlParams.set('v',videoID);
                    window.history.pushState({},'',`${window.location.pathname}?v=${urlParams.toString().replace(/v=/g,'')}`);
                }
                const t = e.target.closest('.playlist-item')?.getAttribute('data-video');
                if (t !== null && t !== undefined) {
                    this.container.querySelectorAll('.chapter-line').forEach(c => {
                        c.remove();
                    });
                    changeParams(t);
                    const frame = this.container.querySelector('.video-frame'),
                        preview = this.container.querySelector('.preview-video');
                    frame.innerHTML = ``;
                    preview.innerHTML = ``;
                    const videoObj = this.#videoList.find(v => v.videoID === t);
                    if (!videoObj) return;
                    const x = videoObj['videoName'];
                    Array.from(this.config.playlists)
                        .filter(e => Array.isArray(e.src) && e.src.some(item => item && item.path && x && item.path.match(x)))
                        .forEach(k => {
                            k.src.forEach(i => {
                                this.container.querySelector('.video-title h1').innerText = k.title ?? '';
                                const source = document.createElement('source');
                                source.src = i.path;
                                source.setAttribute('data-quality', i.quality);
                                if (i.quality === 'auto') {
                                    frame.src = i.path;
                                    frame.poster = k.poster;
                                }
                                source.type = this.#getVideoType(i.path);
                                frame.appendChild(source);
                                const presource = document.createElement('source');
                                presource.src = i.path;
                                presource.setAttribute('data-quality', i.quality);
                                if (i.quality === 'auto') {
                                    preview.src = i.path;
                                    preview.poster = k.poster;
                                }
                                presource.type = this.#getVideoType(i.path);
                                preview.appendChild(presource);
                            });
                            k.tracks?.forEach(i => {
                                const tracks = document.createElement('track');
                                tracks.src = i.src;
                                tracks.kind = i.kind;
                                tracks.srclang = i.srclang;
                                tracks.label = i.label;
                                tracks.track.mode = 'disabled';
                                frame.appendChild(tracks);
                            });
                        });

                    if(!frame.querySelector('track[kind="subtitles"]')){

                        if(this.container.querySelector('.closed-captions-bar.active'))
                            this.container.querySelector('.cc.active').click();
                        this.container.querySelector('.cc').setAttribute('disabled',true);
                    }else
                        this.container.querySelector('.cc').removeAttribute('disabled');

                    this.container.querySelector('.progress-bar').style.width = `0%`;
                    frame.load();
                    preview.load();
                }
            });
            const urlParams = new URLSearchParams(window.location.search);
            if(urlParams.get('v')!==null&&urlParams.get('v')!==''){
                this.container.querySelectorAll('.chapter-line').forEach(c=>{
                    c.remove();
                });
                const frame = this.container.querySelector('.video-frame'),
                preview = this.container.querySelector('.preview-video');
                frame.innerHTML = ``;
                preview.innerHTML = ``;
                let x;
                if(this.#videoList.find(v => v.videoID === urlParams.get('v'))){
                    x = this.#videoList.find(v => v.videoID === urlParams.get('v'))['videoName'];
                }else{
                    this.container.querySelector('.videoNotFound').style.display = 'block';
                    this.container.querySelector('.controls').classList.add('noShow');
                    return;
                }
                
                Array.from(this.config.playlists).filter(e => e.src.some(item => item.path.match(x))).map(k => {
                    k.src.forEach((i)=>{
                        this.container.querySelector('.video-title h1').innerText = k.title??'';
                        const source = document.createElement('source');
                        source.src = i.path;
                        source.setAttribute('data-quality',i.quality);
                        if(i.quality==='auto'){
                            frame.src = i.path;
                            frame.poster = k.poster;
                        }
                        source.type = this.#getVideoType(i.path);
                        frame.appendChild(source);
                        const presource = document.createElement('source');
                        presource.src = i.path;
                        presource.setAttribute('data-quality',i.quality);
                        if(i.quality==='auto'){
                            preview.src = i.path;
                            preview.poster = k.poster;
                        }
                        presource.type = this.#getVideoType(i.path);
                        preview.appendChild(presource);
                    });
                    k.tracks?.forEach((i)=>{
                        const tracks = document.createElement('track');
                        tracks.src = i.src;
                        tracks.kind = i.kind;
                        tracks.srclang = i.srclang;
                        tracks.label = i.label;
                        if(this.#getLang(i.srclang,navigator.language.substring(0,2))) tracks.track.mode = 'hidden';
                        else tracks.track.mode = 'disabled';
                        frame.appendChild(tracks);
                    });
                });

                if(!frame.querySelector('track[kind="subtitles"]')){
                    if(this.container.querySelector('.closed-captions-bar.active'))
                        this.container.querySelector('.cc.active').click();
                    this.container.querySelector('.cc').setAttribute('disabled',true);
                }else
                    this.container.querySelector('.cc').removeAttribute('disabled');
                frame.load();
                preview.load();
            }
        });
    }
    
/**
 * Register a media event listener on the underlying `<video>` element.
 * @param {keyof HTMLMediaElementEventMap|string} event - Media event name (e.g., `timeupdate`, `ended`, `seeking`).
 * @param {(e: Event) => void} callback - Handler invoked with the dispatched `Event` from the `<video>` element.
 * @example
 * const vp = new VideoPlayer('#vp', { playlists:[{ title:'Demo', src:[{ quality:'auto', path:'/v.mp4' }] }] });
 * vp.on('timeupdate', e => console.log(e.target.currentTime));
 */
on(event,callback){
        setTimeout(()=>{
            if(this.eventTracker[event]){
                this.eventTracker[event].push(callback);
            }else{
                this.eventTracker[event] = [callback];
            }
            this.container.querySelector('.video-frame').addEventListener(event,(capture)=>{
                this.eventTracker[event].forEach(e=>{
                    e(capture);
                });
            });
        },300);
    }
    
/**
 * Capture diagnostics of the current `<video>` element and event subscriptions.
 * @returns {Promise<Object>} Resolves with structured debug information (media state, buffered ranges, event counts, etc.).
 * @example
 * const info = await new VideoPlayer('#vp', { playlists:[{ title:'X', src:[{ quality:'auto', path:'/v.mp4' }] }] }).getDebug();
 * console.table(info.video);
 */
getDebug() {
        return new Promise((resolve) => {
            const video = this.container.querySelector('.video-frame');
            this.debug = {
                video:{
                    error: video.error,
                    src: video.currentSrc.replace(/https?:\/\//,'//'),
                    crossOrigin: video.crossOrigin,
                    networkState: video.networkState,
                    duration: video.duration,
                    videoWidth: video.videoWidth,
                    videoHeight: video.videoHeight,
                    preload: video.preload,
                    buffered: Array.from({length: video.buffered.length }, (_, i) => [video.buffered.start(i), video.buffered.end(i)]).flat(),
                    readyState: video.readyState,
                    seeking: video.seeking,
                    currentTime: video.currentTime,
                    duration: video.duration,
                    playbackRate: video.playbackRate,
                    paused: video.paused,
                    ended: video.ended,
                    volume: video.volume,
                    muted: video.muted,
                    defaultPlaybackRate: video.defaultPlaybackRate,
                    controls: this.config.controls,
                    autoplay: video.autoplay
                },
                info:{
                    loadstart: this.eventTracker.loadstart?.length??0,
                    suspend: this.eventTracker.suspend?.length??0,
                    abort: this.eventTracker.abort?.length??0,
                    error: this.eventTracker.error?.length??0,
                    emptied: this.eventTracker.emptied?.length??0,
                    stalled: this.eventTracker.stalled?.length??0,
                    loadmetadata: this.eventTracker.loadedmetadata?.length??0,
                    loadeddata: this.eventTracker.loadeddata?.length??0,
                    canplay: this.eventTracker.canplay?.length??0,
                    canplaythrough: this.eventTracker.canplaythrough?.length??0,
                    playing: this.eventTracker.playing?.length??0,
                    waiting: this.eventTracker.waiting?.length??0,
                    seeking: this.eventTracker.seeking?.length??0,
                    seeked: this.eventTracker.seeked?.length??0,
                    ended: this.eventTracker.ended?.length??0,
                    durationchange: this.eventTracker.durationchange?.length??0,
                    timeupdate: this.eventTracker.timeupdate?.length??0,
                    progress: this.eventTracker.progress?.length??0,
                    ratechange: this.eventTracker.ratechange?.length??0,
                    resize: this.eventTracker.resize?.length??0,
                    volumechange: this.eventTracker.volumechange?.length??0
                }
            };
            resolve(this.debug);
        });
    }
};

export 
/**
 * Register an event listener on the underlying `<audio>` element.
 * @param {keyof HTMLMediaElementEventMap|string} event - Media event name (e.g., `timeupdate`, `ended`).
 * @param {(e: Event) => void} callback - Handler invoked with the dispatched `Event` from the `<audio>` element.
 * @example
 * const ap = new AudioPlayer('#ap', { playlists:[{ src:[{ path:'/t.mp3', title:'T1' }] }] });
 * ap.on('ended', () => console.log('Track finished'));
 */
class AudioPlayer{
    #playlistsDurations = {};
    
/**
 * Accessible audio player with playlist table, keyboard shortcuts, loop/shuffle,
 * captions support and persisted autoplay preference.
 *
 * @constructor
 * @param {string|HTMLElement} container - Audio component host element or CSS selector.
 * @param {{ controls?: boolean, skipRate?: number, autoplay?: boolean, loop?: boolean, shuffle?: boolean, preloaded?: 'auto'|'metadata'|'none', playlists?: Array<{ src: Array<{ img?: string, path: string, title: string, artist?: string, album?: string }>, tracks?: Array<{ src: string, kind: string, srclang: string, label: string }> }> }} [config] - Player options.  Highlights:
 *   • **controls**: render transport controls (play/pause, prev/next, etc.).
 *   • **skipRate** (seconds): step when seeking via keyboard.
 *   • **autoplay**: attempt autoplay after a user gesture when allowed.
 *   • **loop**: repeat the current track.
 *   • **shuffle**: randomize next‑track selection.
 *   • **preloaded**: preload hint for the `<audio>` element.
 *   • **playlists**: array of playlist rows with `src` objects and optional `tracks` for captions.
 * @param {{ 'playlist-background'?: string, 'playlist-color'?: string, 'playlist-heading'?: string, 'playlist-hover'?: string, 'playlist-hover-color'?: string, 'player-container-bg'?: string, 'player-container-color'?: string|number, 'progress'?: string, 'progress-bar'?: string, 'progress-hover'?: string, 'progress-buffer'?: string, 'captions-bg'?: string, 'captions-color'?: string, 'loop-active'?: string }} [styles] - Visual tokens mapped to audio CSS variables (e.g., `--audio-progress-bar`).
 * @param {boolean} [trigger=true] - Auto‑mount behavior; set `false` to call `init()` later.
 * @example
 * new AudioPlayer('#audio', { playlists:[{ src:[{ path:'/track.mp3', title:'Track 1', artist:'You' }] }], controls:true });
 */
constructor(container, config, styles={}, trigger=true){
        if(!isLoaded()) return;
        this.params = new URLSearchParams(window.location.search);
        this.container = (typeof container === 'string')
      ? document.querySelector(container)
      : container;
        this.config = {
            autoplay: false,
            loop: false,
            shuffle: false,
            controls: true,
            preloaded: 'auto',
            playlists: [],
            tracks: [],
            availablePlayback: [0.25,0.5,0.75,1,1.25,1.5,1.75,2],
            skipRate: 5
        }
        this.styles = {};
        this.eventTracker = {};
        this.audioID = {};
        Object.assign(this.config, config);
        Object.assign(this.styles,styles);
        Array.from(this.config.playlists).map(e=>{
            const audio = new Audio();
            audio.src = e.src[0].path;
            genID(fileName(e.src[0].path)).then(id=>{
                this.audioID[e.src[0].title] = id;
            });
            
            audio.addEventListener('loadedmetadata',()=>{
                this.#playlistsDurations[e.src[0].title] = this.#sec2time(audio.duration);
            });
            audio.load();
        });

        const storedAudioCfg = JSON.parse(window.localStorage.getItem('mediaViewer_audio_config') || '{}');
        this.config.autoplay = storedAudioCfg?.autoplay ?? this.config.autoplay;


        setTimeout(()=>{
            if(Object.keys(this.audioID).length > 0){
                const urlParams = new URLSearchParams(window.location.search);
                if (!urlParams.has('a')) {
                    const separator = urlParams.toString() ? '&' : '?';
                    // Preserve all existing parameters, update/add 'a', and keep 'v' if present
                    urlParams.set('a', Object.values(this.audioID)[0]);
                    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
                    window.history.pushState({}, '', newUrl);
                }

                if(this.container instanceof HTMLElement&&trigger) this.init();
                if(this.config.controls){
                    this.#createVolumeBtn();
                    this.#createVolume();
                    this.#pausePlay();
                    this.#events();
                    this.#load();
                }
            }
        },200);
    }
    #getAudioType(src){
        const extension = src.split('.').pop().toLowerCase();
        switch (extension) {
            case 'mp3':
                return 'audio/mpeg';
            case 'wav':
                return 'audio/wav';
            case 'ogg':
                return 'audio/ogg';
            default:
                return 'audio/mpeg'; // Default to mp3 if the extension is unknown
        }
    }
    #sec2time(seconds){
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return hours > 0 
            ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
            : `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    #createVolumeBtn(){
        const btn = document.createElement('i');
        btn.className = `fa-solid fa-volume btn volume`;
        btn.title = `Mute (m)`;
        const getFrame = this.container.querySelector('.audio-player-obj');
        btn.addEventListener('click',function(){
            const range = this.parentNode.querySelector('input');
            const activeColor = this.styles&&this.styles['volume-track-before'] ?  this.styles['volume-track-before'] : '#e7e7e7';
            const inactiveColor = this.styles&&this.styles['volume-track-after'] ? this.styles['volume-track-after'] : '#c8c8c8';
            if(range.value==0){
                range.value = 100;
                this.className = `fa-solid fa-volume btn volume`;
                btn.title = `Mute (m)`;
                getFrame.volume = 1;
                range.style.background = `linear-gradient(90deg, ${activeColor} 100%, ${inactiveColor} 100%)`;
            }else{
                range.value = 0;
                this.className = `fa-solid fa-volume-slash btn volume`;
                btn.title = `Unmute (m)`;
                getFrame.volume = 0;
                range.style.background = `linear-gradient(90deg, ${activeColor} 0%, ${inactiveColor} 0%)`;
            }
        });
        this.container.querySelector('.player-container .volume-holder').appendChild(btn);
    }
    #createVolume(){
        const inputRange = document.createElement('input');
        inputRange.type = 'range';
        inputRange.classList.add('volumeRange');
        inputRange.min = 0;
        inputRange.max = 100;
        inputRange.value = 100;
        const activeColor = this.styles['volume-track-before']??'#e7e7e7';
        const inactiveColor = this.styles['volume-track-after']??'#c8c8c8';
        const getFrame = this.container.querySelector('.audio-player-obj');
        inputRange.addEventListener("input", function() {
            const ratio = (this.value - this.min) / (this.max - this.min) * 100;
            this.style.background = `linear-gradient(90deg, ${activeColor} ${ratio}%, ${inactiveColor} ${ratio}%)`;
            const btn = this.parentNode.querySelector('.btn');
            if(this.value==100) btn.className = `fa-solid fa-volume btn volume`;
            if(this.value<100&&this.value>0) btn.className = `fa-solid fa-volume-low btn volume`;
            if(this.value==0) btn.className = `fa-solid fa-volume-slash btn volume`;
            getFrame.volume = this.value/100;
        });
        this.container.querySelector('.player-container .volume-holder').appendChild(inputRange);
    }
    #pausePlay(){
        this.container.querySelector('.play-pause').addEventListener('click',()=>{
            if(!this.container.querySelector('.audio-player-obj').paused){
                this.container.querySelector('.audio-player-obj').pause();
                this.container.querySelector('.play-pause').title = 'Play';
            }
            else{
                this.container.querySelector('.audio-player-obj').play();
                this.container.querySelector('.play-pause').title = 'Pause';
            }
        });
    }
    init(){
        this.container.tabIndex = 0;
        this.container.classList.add('audio');
        Object.keys(this.styles).forEach(i=>{
            this.container.style.setProperty(`--audio-${i}`,this.styles[i]);
        });
        this.container.innerHTML += `<audio class="audio-player-obj"${this.config.loop ? ' loop' : ''}>
            ${Array.from(this.config.playlists)
                .filter(playlist => playlist.src.some(e => this.audioID[e.title] === this.params.get('a')))
                .flatMap(playlist => playlist.src.map(e => 
                    `<source src="${e.path}" type="${this.#getAudioType(e.path)}"/>`
                )).join('')}
            ${Array.isArray(this.config.playlists.find(playlist => this.audioID[playlist.src[0].title] === this.params.get('a'))?.tracks) ? 
                this.config.playlists.find(playlist => this.audioID[playlist.src[0].title] === this.params.get('a')).tracks.map(e => {
                    
                    return `<track src="${e.src}" kind="${e.kind}" srclang="${e.srclang}" label="${e.label}"/>`;
                }).join('') : ''}
        </audio>
        <div class="audio-player">
            <div class="player-container">
                <div class="player-img">${this.config.playlists
                    .filter(playlist => playlist.src.some(e => this.audioID[e.title] === this.params.get('a')))
                    .flatMap(playlist => playlist.src.map(e => 
                        `<img src="${e.img ? e.img : 'https://img.freepik.com/free-vector/music-notes-stave-staff_1284-44373.jpg?semt=ais_hybrid&w=740'}" alt="${e.title}"/>`
                    )).join('')}</div>
                    <p class="audio-captions"></p>
                <div class="audio-title"><h1>${this.config.playlists
                    .filter(playlist => playlist.src.some(e => this.audioID[e.title] === this.params.get('a')))
                    .flatMap(playlist => playlist.src.map(e => e.title))
                    .join('')}</h1></div>

                <div class="controls">
                    <div class="progress">
                        <div class="progress-buffer"></div>
                        <div class="progress-hover"></div>
                        <div class="progress-bar"></div>
                    </div>
                    <div class="audio-controls${this.config.controls ? '' : ' noControls'}">
                        <button class="btn audio-loop${this.config.loop ? ' active' : ''}"><i class="fa-solid fa-repeat"></i></button>
                        <div class="options option-playback dropup">
                            <button class="dropup-button"><i class="fa-solid fa-sliders-up"></i></button>
                            <ul class="settings-menu-list dropup-content">
                                ${
                                    Array.from(this.config.availablePlayback).map((e) => 
                                        `<li class="settings-menu-list-item${e==1 ? ' checked' : ''}" data-speed="${e}"><span>${e==1 ? 'Normal' : `${e}x`}</span></li>`
                                    ).join('')
                                }
                            </ul>
                        </div>
                        <button class="btn audio-prev"><i class="fa-solid fa-backward"></i></button>
                        <button class="btn audio-toggleStatus play-pause"><i class="fa-solid fa-play"></i></button>
                        <button class="btn audio-next"><i class="fa-solid fa-forward"></i></button>
                        <div class="container volume-container">
                            <div class="volume-holder">
                            </div>
                        </div>
                        <div class="timestamp">
                            <span class="current">00:00</span>/<span class="duration">0:00</span>
                        </div>
                        <button class="btn audio-shuffle${this.config.shuffle ? ' active' : ''}"><i class="fa-solid fa-shuffle"></i></button>
                        <label class="toggle-switch">
                            <input type="checkbox" class="autoplay" ${this.config.autoplay ? ' checked="checked"' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>

            </div>
            <div class="playlist">
                <table class="playlist-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Title</th>
                            <th>Artist</th>
                            <th>Album</th>
                            <th><i class="fa-regular fa-clock"></i></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(() => {
                            const playlists = Array.from(this.config.playlists);
                            if (this.config.shuffle) {
                                for (let i = playlists.length - 1; i > 0; i--) {
                                    const j = Math.floor(Math.random() * (i + 1));
                                    [playlists[i], playlists[j]] = [playlists[j], playlists[i]];
                                }
                            }
                            return playlists.map(e => {
                                return `<tr data-audio-id="${this.audioID[e.src[0].title]}">
                                <td></td>
                                <td>${e.src[0]?.img? `<img class="playlist-img" src="${e.src[0].img}" alt="${e.src[0].title}"/>` : ''}<span class="playlist-title">${e.src[0].title}</span></td>
                                <td>${e.src[0].artist}</td>
                                <td><span class="album-title">${e.src[0]?.album??''}</span></td>
                                <td>${this.#playlistsDurations[e.src[0].title]}</td>
                                </tr>`;
                            }).join('');
                        })()}
                    </tbody>
                </table>
            </div>
        </div>`;
    }
    getInstance(){
        return this;
    }
    #changeCue(){
        const audioElement = this.container.querySelector('audio');
        const captionsElement = this.container.querySelector('.audio-captions');
        if (!audioElement || !captionsElement) return;

        // Keep the bar visible; we toggle .reading separately
        captionsElement.classList.add('showing');

        const tracks = Array.from(audioElement.querySelectorAll('track[kind="captions"]'));
        let selectedTrack = tracks.find(t => t.srclang === navigator.language.substring(0,2)) || tracks[0];
        if (!selectedTrack) { captionsElement.innerText = ''; return; }
        selectedTrack.track.mode = 'hidden';

        // Clear old poller
        if (this._capPoll) clearInterval(this._capPoll);

        if (!this._capTimeout) this._capTimeout = null;
        if (!this._lastCueText) this._lastCueText = '';

        const updateNow = () => {
            const activeCues = selectedTrack.track.activeCues;
            if (activeCues && activeCues.length > 0) {
            const txt = activeCues[0].text || '';
            this._lastCueText = txt;
            captionsElement.innerText = txt;
            if (audioElement.paused) captionsElement.classList.remove('reading');
            else captionsElement.classList.add('reading');
            } else {
            // Grace period scaled by playback rate to avoid blinking between tightly spaced cues
            clearTimeout(this._capTimeout);
            const rate = Math.max(0.5, audioElement.playbackRate || 1);
            const waitMs = Math.round(180 / rate);
            this._capTimeout = setTimeout(() => {
                const ac = selectedTrack.track.activeCues;
                if (ac && ac.length > 0) return; // a new cue arrived
                if (!audioElement.paused && !audioElement.ended) {
                if (this._lastCueText) captionsElement.innerText = this._lastCueText;
                } else {
                captionsElement.innerText = '';
                captionsElement.classList.remove('reading');
                }
            }, waitMs);
            }
        };

        try { updateNow(); } catch {}

        // Event + lightweight polling fallback
        if (this._onAudioCueChange) selectedTrack.track.removeEventListener('cuechange', this._onAudioCueChange);
        this._onAudioCueChange = () => updateNow();
        selectedTrack.track.addEventListener('cuechange', this._onAudioCueChange);

        this._capPoll = setInterval(() => {
            if (!audioElement || audioElement.ended) return;
            if (!document.body.contains(this.container)) { clearInterval(this._capPoll); return; }
            updateNow();
        }, 75);
        };
    #events(){
        this.container.querySelector('audio').addEventListener('loadeddata',()=>{
            if(this.config.autoplay) {
                var hasAutoplay=false;
                window.addEventListener('click',()=>{
                    if(!hasAutoplay){
                        hasAutoplay=true;
                        this.container.querySelector('.play-pause').click();
                    }
                });
            }
            this.container.querySelector('.timestamp .duration').innerText = `${this.#sec2time(this.container.querySelector('audio').duration)}`;
        });
        this.container.querySelector('audio').addEventListener('pause',function(){
            this.parentNode.querySelector('.play-pause i').className = this.parentNode.querySelector('.play-pause i').className.replace('fa-pause', 'fa-play');
        });
        this.container.querySelector('audio').addEventListener('playing', function () {
    const captions = this.parentNode.querySelector('.audio-captions');
    if (captions) { captions.classList.add('showing'); captions.classList.add('reading'); }

            this.parentNode.querySelector('.play-pause i').className = this.parentNode.querySelector('.play-pause i').className.replace('fa-play', 'fa-pause');
        });

        this.container.querySelector('audio').addEventListener('timeupdate', (e)=>{
            const progressBar = this.container.querySelector('.progress-bar');
            const progress = (e.target.currentTime / e.target.duration) * 100;
            progressBar.style.width = `${progress}%`;
            this.container.querySelector('.timestamp .current').innerText = `${this.#sec2time(this.container.querySelector('audio').currentTime)}`;
        });
        this.container.querySelector('audio').addEventListener('progress', function () {
            const bufferBar = this.parentNode.querySelector('.progress-buffer');
            if (this.buffered.length > 0) {
                const bufferedEnd = this.buffered.end(this.buffered.length - 1);
                const ratio = (bufferedEnd / this.duration) * 100;
                bufferBar.style.width = `${ratio}%`;
            }
        });
        this.container.querySelector('.progress').addEventListener('mousemove', function(event) {
            const rect = this.getBoundingClientRect();
            const offsetX = event.clientX - rect.left;
            const widthPercentage = Math.max(0, Math.min((offsetX / rect.width) * 100, 100));
            this.querySelector('.progress-hover').style.width = `${widthPercentage}%`;
        });
        this.container.querySelector('.progress').addEventListener('mouseleave',function(){
            this.querySelector('.progress-hover').style.width = `0%`;
        });
        this.container.querySelector('.progress').addEventListener('click', function(event) {
            const audio = this.parentNode.parentNode.parentNode.parentNode.querySelector('audio');
            const rect = this.getBoundingClientRect();
            const offsetX = event.clientX - rect.left;
            const ratio = offsetX / rect.width;
            if (isFinite(ratio * audio.duration) && !isNaN(ratio * audio.duration)) {
                audio.currentTime = ratio * audio.duration;
            }
        });

        let isDragging = false;

        this.container.querySelector('.progress').addEventListener('mousedown', () => {
            isDragging = true;
        });

        this.container.querySelector('.progress').addEventListener('mouseup', () => {
            isDragging = false;
        });

        this.container.querySelector('.progress').addEventListener('mousemove', (event) => {
                if (isDragging) {
                const rect = event.currentTarget.getBoundingClientRect();
                const offsetX = event.clientX - rect.left;
                const ratio = offsetX / rect.width;
                const audio = this.container.querySelector('audio');
                if (isFinite(ratio * audio.duration) && !isNaN(ratio * audio.duration)) {
                    audio.currentTime = ratio * audio.duration;
                }
            }
        });

        this.container.querySelector('.progress').addEventListener('touchstart', () => {
            isDragging = true;
        });

        this.container.querySelector('.progress').addEventListener('touchend', () => {
            isDragging = false;
        });

        this.container.querySelector('.progress').addEventListener('touchmove', (event) => {
            if (isDragging) {
                const rect = event.currentTarget.getBoundingClientRect();
                const touch = event.touches[0];
                const offsetX = touch.clientX - rect.left;
                const ratio = offsetX / rect.width;
                const audio = this.container.querySelector('audio');
                if (isFinite(ratio * audio.duration) && !isNaN(ratio * audio.duration)) {
                    audio.currentTime = ratio * audio.duration;
                }
            }
        });


        this.container.addEventListener('keydown',(e)=>{
  const keyRaw = e.key ?? e.keyCode ?? e.which;
  const key = (typeof keyRaw === 'string') ? keyRaw.toLowerCase() : keyRaw;
  const audio = this.container.querySelector('audio');

  // Don't hijack typing in inputs/contenteditable
  if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return;

  // Seek left/right
  if (key === 'arrowleft' || key === 37) {
    e.preventDefault();
    audio.currentTime = Math.max(0, audio.currentTime - this.config.skipRate);
    return;
  }
  if (key === 'arrowright' || key === 39) {
    e.preventDefault();
    audio.currentTime = Math.min(audio.duration, audio.currentTime + this.config.skipRate);
    return;
  }

  // Mute toggle
  if (key === 'm' || key === 77) {
    e.preventDefault();
    const volumeBtn = this.container.querySelector('.volume'),
          volumeRange = this.container.querySelector('.volumeRange');
    const activeColor = this.styles['volume-track-before']??'#e7e7e7';
    const inactiveColor = this.styles['volume-track-after']??'#c8c8c8';
    audio.muted = !audio.muted;
    if (audio.muted) {
      volumeBtn.className = `fa-solid fa-volume-slash btn volume`;
      volumeRange.value = volumeRange.min;
      volumeBtn.title = 'Unmute (m)';
      volumeRange.style.background = `linear-gradient(90deg, ${activeColor} 0%, ${inactiveColor} 0%)`;
    } else {
      volumeBtn.className = `fa-solid fa-volume btn volume`;
      volumeRange.value = volumeRange.max;
      volumeBtn.title = 'Mute (m)';
      volumeRange.style.background = `linear-gradient(90deg, ${activeColor} 100%, ${inactiveColor} 100%)`;
    }
    return;
  }

  // Play/Pause on Space ONLY + de-dupe (repeat guard)
  if (key === ' ' || key === 32) {
    if (e.repeat) return;
    e.preventDefault();
    e.stopPropagation();
    this.container.querySelector('.play-pause').click();
    return;
  }
});

        this.container.querySelectorAll('[data-audio-id]').forEach(element => {
            element.addEventListener('click', () => {
                this.container.querySelector('.progress-buffer').style.width = `0%`;
                this.container.querySelector('.progress-bar').style.width = `0%`;
                this.container.querySelector('.play-pause i').className = 'fa-solid fa-play';
                const audioId = element.getAttribute('data-audio-id');
                const selectedPlaylist = this.config.playlists.find(playlist => this.audioID[playlist.src[0].title] === audioId);

                if (selectedPlaylist) {
                    const audioElement = this.container.querySelector('.audio-player-obj');
                    audioElement.innerHTML = selectedPlaylist.src.map(src => 
                    `<source src="${src.path}" type="${this.#getAudioType(src.path)}"/>`
                    ).join('');
                    if (selectedPlaylist.tracks && selectedPlaylist.tracks.length > 0) {
                        this.container.querySelector('.audio-captions').classList.add('showing');
                        selectedPlaylist.tracks.forEach(track => {
                            const trackElement = document.createElement('track');
                            trackElement.src = track.src;
                            trackElement.kind = track.kind;
                            trackElement.srclang = track.srclang;
                            trackElement.label = track.label;
                            audioElement.appendChild(trackElement);
                        });
                        this.#changeCue();
                    }else
                        this.container.querySelector('.audio-captions').classList.remove('showing');
                    this.container.querySelector('.player-img img').src = selectedPlaylist.src[0].img || 'https://img.freepik.com/free-vector/music-notes-stave-staff_1284-44373.jpg?semt=ais_hybrid&w=740';
                    this.container.querySelector('.player-container h1').innerText = selectedPlaylist.src[0].title;
                    this.container.querySelector('.timestamp .duration').innerText = this.#playlistsDurations[selectedPlaylist.src[0].title] || '0:00';
                    const urlParams = new URLSearchParams(window.location.search);
                    urlParams.set('a', audioId);
                    window.history.pushState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
                    audioElement.load();
                    this.container.querySelectorAll('[data-audio-id]').forEach(el => el.classList.remove('playing'));
                    element.classList.add('playing');
                }
            });
        });
        
        

        this.container.querySelectorAll('[data-speed]').forEach((element) => {
            element.addEventListener('click', () => {
                const speed = parseFloat(element.getAttribute('data-speed'));
                const audioElement = this.container.querySelector('.audio-player-obj');
                audioElement.playbackRate = speed;

                this.container.querySelectorAll('[data-speed]').forEach((el) => {
                    el.classList.remove('checked');
                });
                element.classList.add('checked');
            });
        });

        this.container.querySelector('.dropup').addEventListener('mouseover',()=>{
            this.container.querySelector('.dropup .dropup-content').style.display = 'block'
        });
        this.container.querySelector('.dropup').addEventListener('mouseleave',()=>{
            this.container.querySelector('.dropup .dropup-content').style.display = 'none'
        });

        this.container.querySelector('.audio-prev').addEventListener('click', () => {
            const rows = Array.from(this.container.querySelectorAll('[data-audio-id]'));
            const currentIndex = rows.findIndex(row => row.classList.contains('playing'));
            const prevIndex = (currentIndex - 1 + rows.length) % rows.length;
            rows[prevIndex].click();
            this.#changeCue();
            if(this.config.autoplay) this.container.querySelector('.play-pause').click();
        });

        this.container.querySelector('.audio-next').addEventListener('click', () => {
            const rows = Array.from(this.container.querySelectorAll('[data-audio-id]'));
            const currentIndex = rows.findIndex(row => row.classList.contains('playing'));
            let nextIndex;

            if (this.container.querySelector('.audio-shuffle').classList.contains('active')) {
                do {
                    nextIndex = Math.floor(Math.random() * rows.length);
                } while (nextIndex === currentIndex);
            } else {
                nextIndex = (currentIndex + 1) % rows.length;
            }

            rows[nextIndex].click();
            this.#changeCue();
            if(this.config.autoplay) this.container.querySelector('.play-pause').click();
        });

        this.container.querySelector('audio').addEventListener('ended', () => {
    try { const cap = this.container.querySelector('.audio-captions'); if (cap) cap.classList.remove('reading'); } catch(e){}

            if (this.config.autoplay) {
                this.container.querySelector('.audio-next').click();
            }
        });

        this.container.querySelector('.audio-loop').addEventListener('click',(e)=>{
            e.target.parentNode.classList.toggle('active');
            if(e.target.parentNode.classList.contains('active')) this.container.querySelector('audio').loop = true;
            else this.container.querySelector('audio').loop = false;
        });

        this.container.querySelector('.audio-shuffle').addEventListener('click',(e)=>{
            e.target.parentNode.classList.toggle('active');
        });

        this.container.querySelector('.autoplay').addEventListener('input', (e) => {
            this.config.autoplay = e.target.checked;
            window.localStorage.setItem('mediaViewer_audio_config', JSON.stringify({ autoplay: e.target.checked }));
            e.target.parentNode.title = `Autoplay is ${e.target.checked ? 'on' : 'off'}`;
        });

    }
    #load(){
        this.container.querySelectorAll('table tbody tr').forEach(e=>{
            if(e.getAttribute('data-audio-id').match(new RegExp(`^${this.params.get('a')}$`))) e.classList.add('playing');
        });
        if(this.container.querySelector('audio track')) this.container.querySelector('.audio-captions').classList.add('showing');
        this.#changeCue();
    }
    /**
     * Generates event on 
     * @param {String} event Audio Event
     * @param {Function} callback Function callback
     */
    on(event,callback){
        setTimeout(()=>{
            if(this.eventTracker[event]){
                this.eventTracker[event].push(callback);
            }else{
                this.eventTracker[event] = [callback];
            }
            this.container.querySelector('audio').addEventListener(event,(capture)=>{
                this.eventTracker[event].forEach(e=>{
                    e(capture);
                });
            });
        },300);
    }
}

// --- Before & After: fully functional, accessible, pointer + keyboard ---
export 

/**
 * Subscribe to edge and position changes.
 * @param {'before'|'after'|'position'} event - Event name: `'before'` fires once at 100, `'after'` at 0, `'position'` on every change.
 * @param {(pos:number)=>void} callback - Receives the current position percentage.
 * @example
 * const ba = new BeforeAndAfter('#cmp', { before:'/b.jpg', after:'/a.jpg' });
 * ba.on('position', p => console.log('pos', p));
 */
class BeforeAndAfter {
  
/**
 * Interactive before/after comparison component with pointer and keyboard support;
 * works horizontally or vertically.
 *
 * @constructor
 * @param {string|HTMLElement} container - Widget host element or CSS selector.
 * @param {{ before: string, after: string, orientation?: 'horizontal'|'vertical', start?: number, handle?: boolean, handleStyle?: { backgroundColor?: string, width?: string, knobSize?: string, iconColor?: string } }} [config] - Comparison settings. Fields:
 *   • **before** / **after**: image URLs.
 *   • **orientation**: axis along which the reveal handle moves.
 *   • **start** (percent): initial position of the handle (0..100).
 *   • **handle**: toggle the draggable handle UI.
 *   • **handleStyle**: per‑instance themed colors and sizes of the handle.
 * @param {{ 'bar-width'?: string, 'handle-bg'?: string, 'knob-size'?: string, 'handle-icon'?: string }} [styles] - CSS variable overrides (e.g., `--before-after-bar-width`).
 * @example
 * const ba = new BeforeAndAfter('#compare', { before:'/before.jpg', after:'/after.jpg', start: 40 });
 */
constructor(container, config = {}, styles = {}) {
    if (!isLoaded()) return;

    this.container = (typeof container === 'string')
      ? document.querySelector(container)
      : container;
    if (!(this.container instanceof HTMLElement)) return;

    // Defaults
    this.config = {
      before: '',
      after: '',
      orientation: 'horizontal',
      start: 50,
      handle: true,
      handleStyle: {
        backgroundColor: '#ffffff',
        width: '2px',
        knobSize: '28px',
        iconColor: '#333'
      }
    };

    this.styles = {};
    Object.assign(this.config, config);
    Object.assign(this.styles, styles);

    // Internal state
    this._dragging = false;
    this._pos = this._clampNumber(Number(this.config.start) || 50);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);

    // Init after a tiny delay to ensure stylesheets are present (keeps parity with your lib)
    setTimeout(() => {
      this.init();
    }, 0);
  }

  init() {
    
    // Apply handle style as CSS variables
    const hs = this.config.handleStyle || {};
    this.container.style.setProperty('--before-after-bar-width', hs.width || '2px');
    this.container.style.setProperty('--before-after-handle-bg', hs.backgroundColor || '#ffffff');
    this.container.style.setProperty('--before-after-knob-size', hs.knobSize || '28px');
    this.container.style.setProperty('--before-after-handle-icon', hs.iconColor || '#333');

    // Apply developer-provided CSS custom properties
    Object.keys(this.styles).forEach(k => {
      this.container.style.setProperty(`--before-after-${k}`, String(this.styles[k]));
    });

    // Orientation
    const isVertical = (this.config.orientation === 'vertical');
    this.container.classList.add('before-after', isVertical ? 'vertical' : 'horizontal');

    // DOM
    this.container.innerHTML = `
      <div class="before" aria-hidden="true">
        <img src="${this.config.before}" alt="Before"/>
      </div>
      <div class="after">
        <img src="${this.config.after}" alt="After"/>
      </div>
      ${this.config.handle ? `
        <div class="handle" role="separator" aria-orientation="${isVertical ? 'vertical' : 'horizontal'}" tabindex="0" aria-label="Drag to compare">
          <span class="handle-dot" aria-hidden="true"></span>
        </div>` : ''}
    `;

    // Cache elements
    this.$after = this.container.querySelector('.after');
    this.$handle = this.container.querySelector('.handle');

    // Initial position
    this.setPosition(this._pos, false);

    // Bind interactions
    this._bindEvents();
  }

  // --- Public API ---
  getInstance() { return this; }

  /**
   * Set the slider position (0..100)
   * @param {number} percent
   * @param {boolean} [announce] whether to set aria-valuenow on the handle
   */
  setPosition(percent, announce = true) {
    this._pos = this._clampNumber(percent);

    if (this._rafId) cancelAnimationFrame(this._rafId);
    this._rafId = requestAnimationFrame(() => {
        this.container.style.setProperty('--before-after-pos', `${this._pos}%`);
        if (announce && this.$handle) {
        this.$handle.setAttribute('aria-valuenow', String(Math.round(this._pos)));
        }
        this._rafId = null;   // (already added previously for rAF)
        this._supportsPointer = 'PointerEvent' in window;
    });
    }


  /**
   * Clean up listeners (optional)
   */
  destroy() {
    if (this.$handle) {
      this.$handle.removeEventListener('pointerdown', this._onPointerDown);
      this.$handle.removeEventListener('keydown', this._onKeyDown);
    }
    this.container.removeEventListener('pointerdown', this._onTrackPointerDown);
    window.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('pointerup', this._onPointerUp);
    window.removeEventListener('pointercancel', this._onPointerUp);
  }

  // --- Internals ---
  _bindEvents() {
    // Allow clicking anywhere on the component to reposition
    this._onTrackPointerDown = (ev) => {
      // Ignore when starting drag on the knob — that will be handled separately
      const isKnob = ev.target.closest('.handle');
      const rect = this.container.getBoundingClientRect();
      this._updateFromPoint(ev, rect);
      if (!isKnob && this.$handle) {
        // Also start dragging if the user pressed on the track
        this._dragging = true;
        this.$handle.setPointerCapture?.(ev.pointerId);
      }
    };

    this.container.addEventListener('pointerdown', this._onTrackPointerDown);

    if (this.$handle) {
      this._onPointerDown = (ev) => {
        this._dragging = true;
        this.$handle.setPointerCapture?.(ev.pointerId);
        ev.preventDefault();
      };

      this.$handle.addEventListener('pointerdown', this._onPointerDown);
      this.$handle.addEventListener('keydown', this._onKeyDown);
    }

    window.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerup', this._onPointerUp);
    window.addEventListener('pointercancel', this._onPointerUp);
    if (!this._supportsPointer) this._bindTouchFallback();
  }

  _onPointerMove(ev) {
    if (!this._dragging) return;
    const rect = this.container.getBoundingClientRect();
    this._updateFromPoint(ev, rect);
  }

  _onPointerUp() {
    this._dragging = false;
  }

  _onKeyDown(ev) {
    const key = (ev.key || '').toLowerCase();
    const step = 2; // percent per keypress
    const big = 10;

    // Keep focus behavior predictable
    if (['arrowleft','arrowright','arrowup','arrowdown','home','end','pageup','pagedown'].includes(key)) {
      ev.preventDefault();
      ev.stopPropagation();
    }

    const isVertical = this.container.classList.contains('vertical');
    const dirLeft  = (!isVertical && key === 'arrowleft') || (isVertical && key === 'arrowup');
    const dirRight = (!isVertical && key === 'arrowright') || (isVertical && key === 'arrowdown');

    if (dirLeft)  this.setPosition(this._pos - step);
    if (dirRight) this.setPosition(this._pos + step);
    if (key === 'home') this.setPosition(0);
    if (key === 'end')  this.setPosition(100);
    if (key === 'pageup')   this.setPosition(this._pos + big);
    if (key === 'pagedown') this.setPosition(this._pos - big);
  }

  _updateFromPoint(ev, rect) {
    const isVertical = this.container.classList.contains('vertical');
    let p;

    if (!isVertical) {
      const x = Math.max(rect.left, Math.min(ev.clientX, rect.right));
      p = ((x - rect.left) / rect.width) * 100;
    } else {
      const y = Math.max(rect.top, Math.min(ev.clientY, rect.bottom));
      p = ((y - rect.top) / rect.height) * 100;
    }

    this.setPosition(p);
  }

  _clampNumber(n) {
    n = Number.isFinite(n) ? n : 50;
    return Math.max(0, Math.min(100, n));
  }

  _bindTouchFallback() {
    const getPt = (ev) => {
        const t = ev.touches?.[0] || ev.changedTouches?.[0];
        return t ? { clientX: t.clientX, clientY: t.clientY } : { clientX: 0, clientY: 0 };
    };

    const onStart = (ev) => {
        this._dragging = true;
            const rect = this.container.getBoundingClientRect();
            this._updateFromPoint(getPt(ev), rect);
            // prevent scrolling while dragging
            ev.preventDefault();
        };

        const onMove = (ev) => {
            if (!this._dragging) return;
            const rect = this.container.getBoundingClientRect();
            this._updateFromPoint(getPt(ev), rect);
            ev.preventDefault();
        };

        const onEnd = () => { this._dragging = false; };

        // Use passive: false so preventDefault() is honored on touchmove in iOS
        this.container.addEventListener('touchstart', onStart, { passive: false });
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onEnd, { passive: true });
        window.addEventListener('touchcancel', onEnd, { passive: true });
    }
    /**
     * Generates event on Before & After viewer
     * @param {String} event  'before' | 'after' | 'position'
     * @param {Function} callback  Callback to invoke.
     *
     * Semantics:
     *  - 'after': Fires once when position === 0 (after image fully visible)
     *  - 'before': Fires once when position === 100 (before image fully visible)
     *  - 'position': Fires on every position change with current position (0..100)
     */
    on(event, callback) {
        // Register callback
        if (!this._eventTracker) this._eventTracker = {};
        if (!this._eventTracker[event]) this._eventTracker[event] = [];
        if (typeof callback === 'function') this._eventTracker[event].push(callback);

        // Hook into position changes once
        if (!this._positionHooked) {
            const originalSetPosition = this.setPosition?.bind(this) || ((percent) => { this._pos = percent; });

            // Fire-once flags for edges
            this._edgeFired = this._edgeFired || { after: false, before: false };

            this.setPosition = (percent, announce) => {
                // Let the original setter update/clamp this._pos
                originalSetPosition(percent, announce);

                const newPos = this._pos;

                // Always emit position updates
                if (this._eventTracker['position']) {
                    this._eventTracker['position'].forEach(cb => cb(newPos));
                }

                // AFTER: trigger once when we reach exactly 0
                if (newPos === 0 && !this._edgeFired.after) {
                    this._edgeFired.after = true;
                    this._edgeFired.before = false;
                    if (this._eventTracker['after']) {
                        this._eventTracker['after'].forEach(cb => cb(newPos));
                    }
                }

                // BEFORE: trigger once when we reach exactly 100
                if (newPos === 100 && !this._edgeFired.before) {
                    this._edgeFired.before = true;
                    this._edgeFired.after = false;
                    if (this._eventTracker['before']) {
                        this._eventTracker['before'].forEach(cb => cb(newPos));
                    }
                }
            };

            this._positionHooked = true;
        }
    }
}
export class Hero {   
/**
 * Responsive hero banner with alignment, button/link tabs and theming via CSS variables.
 *
 * @constructor
 * @param {string|HTMLElement} container - Hero block element or CSS selector.
 * @param {{ eyebrow?: string, title?: string, subtitle?: string, description?: string, src?: string, alt?: string, tabs?: Array<{ title?: string, label?: string, href?: string, url?: string, target?: '_self'|'_blank'|'_parent'|'_top', rel?: string, variant?: 'primary'|'ghost' }>, align?: 'left'|'center'|'right', tabsPlacement?: 'top'|'bottom', tabsVariant?: 'buttons'|'links' }} [config] - Content and behavior options for the banner, including call‑to‑action buttons/links (in `tabs`).
 * @param {{ 'bg'?: string, 'color'?: string, 'height'?: string, 'max-w'?: string|number, 'padding-y'?: string, 'padding-x'?: string, 'title-size'?: string, 'subtitle-size'?: string, 'eyebrow-size'?: string, 'scrim-from'?: string, 'scrim-to'?: string, 'btn-font-family'?: string, 'btn-font-size'?: string|number, 'btn-active-bg'?: string, 'btn-active-color'?: string, 'btn-active-border'?: string, 'btn-bg'?: string, 'btn-color'?: string, 'btn-border'?: string, 'btn-hover-bg'?: string, 'btn-hover-color'?: string, 'btn-hover-border'?: string, 'fade-duration'?: string, 'font-family'?: string, 'bg-hover'?: string, 'color-hover'?: string }} [styles] - Visual tokens mapped to hero CSS variables (e.g., `--hero-banner-height`).
 * @example
 * new Hero('#hero', { title:'Welcome', subtitle:'Build fast.', tabsVariant:'buttons', tabs:[{ title:'Docs', url:'#docs' }] }, { 'max-w': 1200 });
 */
constructor(container, config = {}, styles = {}) {
    if (!document.documentElement.hasAttribute('media-viewer-enabled')) return;
    this.container = (typeof container === 'string')
      ? document.querySelector(container)
      : container;
    if (!(this.container instanceof HTMLElement)) return;

    this.config = {
      eyebrow: '',
      title: '',
      subtitle: '',
      description: '',
      background: '',
      alt: '',
      tabs: [],
      // --- NEW ---
      align: 'left',                // 'left' | 'center' | 'right'
      tabsPlacement: 'bottom',      // 'top' | 'bottom'
      tabsVariant: 'buttons',       // 'buttons' (existing behavior) | 'links' (uses .hero-tabs)
      ...config
    };

    // Normalize props (subtitle/description)
    this.config.subtitle = this.config.subtitle ?? this.config.description ?? '';

    this.styles = { ...styles };
    setTimeout(() => this.init(), 0);
  }

  init() {
    // Map provided styles to --hero-banner-* custom properties (existing)
    Object.keys(this.styles).forEach(k => {
        if (k === 'theme') return; // special-case
        this.container.style.setProperty(`--hero-banner-${k}`, String(this.styles[k]));
    });
    if ((this.styles.theme ?? '').toLowerCase() === 'light') {
        this.container.classList.add('is-light');
    }
    this.container.classList.add('hero-banner');

    // --- NEW: alignment mapping ---
    const map = {
        left:   { text: 'left',   flex: 'flex-start' },
        center: { text: 'center', flex: 'center' },
        right:  { text: 'right',  flex: 'flex-end' }
    };
    const a = map[this.config.align] ?? map.left;
    this.container.style.setProperty('--hero-content-align', a.text);
    this.container.style.setProperty('--hero-actions-justify', a.flex);
    this.container.style.setProperty('--hero-tabs-justify', a.flex);

    // Build actions or tabs once (both read from config.tabs)
    const hasTabs = Array.isArray(this.config.tabs) && this.config.tabs.length > 0;

    // Buttons (current behavior)
    const buildButtons = () => !hasTabs ? '' : `
        <div class="hero__actions" role="group" aria-label="Hero actions">
        ${
            this.config.tabs.map(t => {
            const href   = t.href ?? t.url ?? '#';
            const target = t.target ?? '_self';
            const rel    = t.rel ?? (target === '_blank' ? 'noopener noreferrer' : '');
            const label  = (t.title ?? t.label ?? '').toString().trim();
            const variant = (t.variant === 'ghost' ? 'hero__btn--ghost' : 'hero__btn--primary');
            return `<a class="hero__btn ${variant}" href="${href}" target="${target}"${rel ? ` rel="${rel}"` : ''}>${label}</a>`;
            }).join('')
        }
        </div>
    `;

    // Links (uses your existing .hero-tabs styling)
    const buildLinks = () => !hasTabs ? '' : `
        <nav class="hero-tabs" aria-label="Hero tabs">
        ${
            this.config.tabs.map(t => {
            const href   = t.href ?? t.url ?? '#';
            const target = t.target ?? '_self';
            const rel    = t.rel ?? (target === '_blank' ? 'noopener noreferrer' : '');
            const label  = (t.title ?? t.label ?? '').toString().trim();
            return `<a class="hero-tab" href="${href}" target="${target}"${rel ? ` rel="${rel}"` : ''}>${label}</a>`;
            }).join('')
        }
        </nav>
    `;

    const renderTabs = this.config.tabsVariant === 'links' ? buildLinks : buildButtons;

    // Decide top vs bottom location for tabs/actions
    const topBlock    = (hasTabs && this.config.tabsPlacement === 'top')    ? renderTabs() : '';
    const bottomBlock = (hasTabs && this.config.tabsPlacement !== 'top')    ? renderTabs() : '';

    // Background image (existing)
    const bg = this.config.background
        ? `<img src="${this.config.background}" alt="${this.config.alt ?? ''}" class="background" />`
        : '';

    // Compose hero content
    this.container.innerHTML = `
        ${bg}
        <div class="hero__inner">
        ${topBlock}
        ${this.config.eyebrow ? `<p class="hero__eyebrow">${this.config.eyebrow}</p>` : ''}
        ${this.config.title   ? `<h1 class="hero__title">${this.config.title}</h1>`     : ''}
        ${this.config.subtitle? `<p class="hero__subtitle">${this.config.subtitle}</p>`  : ''}
        ${bottomBlock}
        </div>
    `;

    // Optional: mark current page anchors (existing utility)
    try {
        const anchors = this.container.querySelectorAll('.hero__actions a[href], .hero-tabs a[href]');
        anchors.forEach(a => {
        const aURL = new URL(a.href, location.href);
        if (aURL.origin === location.origin && aURL.pathname === location.pathname) {
            a.setAttribute('aria-current', 'page');
        }
        });
    } catch { /* no-op */ }

    // Trigger fade-in (existing)
    this._wireTabUnderline();

    // Reset all underline states when leaving the banner (prevents stray lines)
    const root = this.container;
    root.addEventListener('mouseleave', () => {
      const tabs = root.querySelectorAll('.hero-tabs .hero-tab');
      tabs.forEach(t => { t.classList.remove('u-enter','u-leave'); t.classList.add('u-reset'); });
    });
  this.container.classList.add('is-ready');
    }

  
  /** Drives the half-on-enter / full-on-leave underline timeline */
  _wireTabUnderline() {
    const tabs = this.container.querySelectorAll('.hero-tabs .hero-tab');
    tabs.forEach(tab => {
      // Do not animate the active tab
      if (tab.getAttribute('aria-selected') === 'true' || tab.getAttribute('aria-current') === 'page') {
        return;
      }
      const onEnter = () => {
        tab.classList.remove('u-leave', 'u-reset');
        tab.classList.add('u-enter');
      };
      const onLeave = () => {
        tab.classList.remove('u-enter');
        tab.classList.add('u-leave');
        const onEnd = (ev) => {
          if (ev.animationName === 'hero-u-out') {
            tab.classList.remove('u-leave');
            tab.classList.add('u-reset');
            tab.removeEventListener('animationend', onEnd);
          }
        };
        tab.addEventListener('animationend', onEnd);
      };
      tab.addEventListener('mouseenter', onEnter);
      tab.addEventListener('focus', onEnter);
      tab.addEventListener('mouseleave', onLeave);
      tab.addEventListener('blur', onLeave);
    });
  }

  getInstance() { return this; }
}
export class Timeline {
/**
 * Versatile timeline component (vertical or horizontal) with optional alternating layout
 * and theming via CSS variables.
 *
 * @constructor
 * @param {string|HTMLElement} container
 *        Root element or CSS selector that will host the timeline.
 * @param {{
 *   orientation?: 'vertical'|'horizontal',
 *   alternate?: boolean,
 *   invert?: boolean,
 *   items?: Array<{
 *     date?: string,
 *     title?: string,
 *     html?: string,
 *     icon?: string,
 *     badge?: string,
 *     href?: string
 *   }>
 * }} [config]
 *        Behavioral options. When `items` is omitted/empty, the component
 *        will parse child markup (`<timeline-item>`, `<li>`, or `.timeline-item`)
 *        to build entries.
 *
 * @param {{
 *   'track-color'?: string,
 *   'connector-width'?: string,
 *   'node-bg'?: string,
 *   'node-border'?: string,
 *   'node-size'?: string,
 *   'node-shadow'?: string,
 *   'gutter'?: string,
 *   'spacing'?: string,
 *   'max-w'?: string|number,
 *   'card-bg'?: string,
 *   'card-color'?: string,
 *   'card-radius'?: string,
 *   'card-shadow'?: string,
 *   'card-padding'?: string,
 *   'date-color'?: string,
 *   'title-color'?: string,
 *   'accent'?: string,
 *   'icon-color'?: string,
 *   'badge-bg'?: string,
 *   'badge-color'?: string,
 *   'inview-duration'?: string
 * }} [styles]
 *        **CSS mapping**; each key maps to a `--timeline-*` custom property
 *        (e.g., `{ 'track-color': '#d9dde3' }` → `--timeline-track-color: #d9dde3`).
 *
 *
 * @example
 * new Timelines('#history', {
 *   orientation: 'vertical',
 *   alternate: true,
 *   items: [
 *     { date: '2024', title: 'Launched', html: '<p>First release</p>', icon: 'fa-solid fa-rocket', badge: 'v1' },
 *     { date: '2025', title: 'Milestone', html: '<p>Shipped timelines</p>' }
 *   ]
 * }, {
 *   'track-color': '#d9dde3',
 *   'node-border': '#4badde',
 *   'card-bg': '#ffffff'
 * });
 */
  constructor(container, config = {}, styles = {}) {
    // Keep parity with your library's "media-viewer-enabled" startup gate
    if (!isLoaded()) return;

    this.container = (typeof container === 'string')
      ? document.querySelector(container)
      : container;

    if (!(this.container instanceof HTMLElement)) return;

    this.config = {
      orientation: 'vertical',
      alternate: true,
      invert: false,
      items: [],       // If empty, we will parse from child markup
      ...config
    };

    this.styles = { ...styles };
    setTimeout(() => this.init(), 0);
  }

  init() {
    // Apply CSS custom properties from styles (maps to --timeline-*)
    Object.keys(this.styles).forEach(k => {
      this.container.style.setProperty(`--timeline-${k}`, String(this.styles[k]));
    });

    this.container.classList.add('timeline');
    const o = (this.config.orientation || 'vertical').toLowerCase();
    this.container.classList.add(o === 'horizontal' ? 'horizontal' : 'vertical');
    if (this.config.alternate) this.container.classList.add('alternate');
    if (this.config.invert) this.container.classList.add('alt-invert');

    // Build items: prefer config.items; else parse child nodes
    const items = Array.isArray(this.config.items) && this.config.items.length
      ? this.config.items
      : this.#parseChildItems(this.container);

    // Render
   this.container.innerHTML = `
    <span class="timeline-track" aria-hidden="true"></span>
    <ol class="timeline-list" role="list">
        ${items.map(it => this.#renderItem(it)).join('')}
    </ol>
    `;

    
// Seed initial state: everything starts out of view
this.container.querySelectorAll('.timeline-item').forEach((el) => {
  el.classList.add('is-outview');
  el.classList.remove('is-inview');
});

// One observer that toggles is-inview / is-outview on both enter and exit
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    const el = e.target;
    if (e.isIntersecting && e.intersectionRatio > 0.08) {
      el.classList.add('is-inview');
      el.classList.remove('is-outview');
    } else {
      el.classList.remove('is-inview');
      el.classList.add('is-outview');
    }
  }
}, { root: null, rootMargin: '0px 0px -6% 0px', threshold: [0, 0.12, 0.35] });

this.container.querySelectorAll('.timeline-item').forEach((el) => io.observe(el));


    // Keyboard: make cards focusable if they act like links
    this.container.querySelectorAll('.timeline-card[href]').forEach(a => {
      a.setAttribute('role', 'article');
    });

    if (this.container.classList.contains('horizontal')) {
        const list  = this.container.querySelector('.timeline-list');
        const track = this.container.querySelector('.timeline-track');

        const setTrackWidth = () => {
            if (!list || !track) return;
            track.style.width = `${list.scrollWidth}px`; // match full content width
        };

        setTrackWidth();

        if ('ResizeObserver' in window) {
            const ro = new ResizeObserver(setTrackWidth);
            ro.observe(list);
        } else {
            window.addEventListener('resize', setTrackWidth);
        }
    }

  }

  getInstance(){ return this; }

  #renderItem(it = {}) {
    const date   = it.date   ?? '';
    const title  = it.title  ?? '';
    const badge  = it.badge  ?? '';
    const icon   = it.icon   ?? ''; // e.g. 'fa-solid fa-rocket'
    const href   = it.href   ?? '';
    const html   = it.html   ?? '';

    const nodeIcon = icon
      ? `<i class="${icon}" aria-hidden="true"></i>`
      : '';

    const CardTag = href ? 'a' : 'div';
    const hrefAttr = href ? ` href="${href}"` : '';

    return `
      <li class="timeline-item is-outview" role="listitem">
        <span class="timeline-node">${nodeIcon}</span>
        <${CardTag} class="timeline-card"${hrefAttr}>
          ${date ? `<p class="timeline-date">${date}</p>` : ''}
          ${title ? `<h4 class="timeline-title">${title}${badge ? `<span class="timeline-badge">${badge}</span>` : ''}</h4>` : ''}
          <div class="timeline-body">${html}</div>
        </${CardTag}>
      </li>
    `;
  }

  #parseChildItems(root) {
    // Accept <timeline-item>, <li>, or .timeline-item children and map their attributes
    const nodes = root.querySelectorAll('timeline-item, li, .timeline-item');
    return Array.from(nodes).map(n => ({
      date:  n.getAttribute?.('data-date')  ?? '',
      title: n.getAttribute?.('data-title') ?? n.querySelector('h4,h3,h2')?.textContent ?? '',
      badge: n.getAttribute?.('data-badge') ?? '',
      icon:  n.getAttribute?.('data-icon')  ?? '',
      href:  n.getAttribute?.('data-href')  ?? n.querySelector('a')?.getAttribute('href') ?? '',
      html:  n.innerHTML
    }));
  }
}


export class Flipbook { 
    /**
     * Interactive, accessible flipbook/reader with realistic page‑turn animation,
     * zoom, high‑contrast theme, text highlighting (with optional sticky notes),
     * and built‑in text‑to‑speech (TTS) controls with local persistence.
     *
     * Requires `startup()` to be called once before instantiation so the library
     * can inject CSS and set the "media-viewer-enabled" gate attribute.
     *
     * @constructor
     * @param {string|HTMLElement} container
     * Root element (or CSS selector) that will host the flipbook.
     *
     * @param {{
     *   pages?: string[],
     *   width?: number|string,
     *   height?: number|string,
     *   rtl?: boolean,
     *   highlightColors?: string[],
     *   voice?: string,
     *   rate?: number,
     *   pitch?: number,
     *   persistKey?: string
     * }} [config] Flipbook configurations
     *
     * @param {{
     *   'bg'?: string,
     *   'page-bg'?: string,
     *   'shadow'?: string,
     *   'accent'?: string,
     *   'ink'?: string,
     *   'toolbar-bg'?: string,
     *   'toolbar-color'?: string,
     *   'contrast-bg'?: string,
     *   'contrast-ink'?: string,
     *   'width'?: string|number,
     *   'height'?: string|number
     * }} [styles]
     * Visual tokens mapped to CSS custom properties on the container as
     * `--flipbook-<token>` (e.g., `{ 'accent': '#4badde' }` → `--flipbook-accent: #4badde`).
     * Advanced animation-tuning variables used by the page‑turn (e.g.,
     * `--flip-curl-color`, `--flip-shadow-color`, `--flip-shadow-color-min`,
     * `--flip-bulge-scale`, `--flip-bulge-skew`) are *not* wired to `styles`;
     * set them via CSS or `element.style.setProperty('--flip-…', value)` if needed.
     *
     * @example
     * startup();
     * const fb = new Flipbook('#book', {
     *   pages: ['<h2>Cover</h2>', '<h2>Page 2</h2>', '<h2>Page 3</h2>', '<h2>Page 4</h2>'],
     *   width: 900,
     *   height: 600,
     *   persistKey: 'demo-flipbook'
     * }, {
     *   'bg': '#f6f8fa',
     *   'page-bg': '#fff',
     *   'accent': '#4badde',
     *   'toolbar-bg': '#fff',
     *   'toolbar-color': '#0b0f14',
     *   'contrast-bg': '#0b0f14',
     *   'contrast-ink': '#fff'
     * }).getInstance();
     */
  constructor(container, config = {}, styles = {}){
    if (!document.documentElement.hasAttribute('media-viewer-enabled')) return; 
    this.container = (typeof container === 'string') ? document.querySelector(container) : container; 
    if (!(this.container instanceof HTMLElement)) return; 
    this.config = Object.assign({
      pages: [], width: 800, height: 520, rtl: false,
      highlightColors: ['yellow','#ffad0d','#7bd389','#63cdda','#a29bfe','#ff6b6b','#ffd93d'],
      voice: '', rate: 1.0, pitch: 1.0,
      persistKey: (this.container.id || 'flipbook')
    }, config);
    this.styles = Object.assign({}, styles);
    this._sheetIndex = 0; this._sheetCount = Math.ceil((this.config.pages?.length || 0)/2);
    this._isTurning = false; this._zoom = 1; this._userZoom = false;
    this._contrast = false; this._hlOn = false; this._hlColor = this.config.highlightColors[0] || 'yellow';
    this._persistNS = `mv_flipbook_${this.config.persistKey}`;
    this._tts = { id:0, utter:null, str:'', map:[], words:[], playing:false, paused:false, lastChar:0 };
    this._persisted = this._loadPersisted();
    Promise.resolve().then(()=>this.init());
  }
  getInstance(){ return this; }
  next(){ if(!this._isTurning) this._turn(1); }
  prev(){ if(!this._isTurning) this._turn(-1); }
  init(){
    this.container.classList.add('flipbook','fb-tooltip-js');
    this.container.style.setProperty('--fb-zoom', String(this._zoom));
    this.container.style.setProperty('--fb-w', typeof this.config.width === 'number' ? `${this.config.width}px` : `${String(this.config.width)}px`);
    this.container.style.setProperty('--fb-h', typeof this.config.height === 'number' ? `${this.config.height}px` : `${String(this.config.height)}px`);
    Object.keys(this.styles).forEach(k=>this.container.style.setProperty(`--flipbook-${k}`, String(this.styles[k])));
    const persistedTTS = this._ttsLoadPrefs();
    if (persistedTTS){
      if (persistedTTS.voice) this.config.voice = persistedTTS.voice;
      if (typeof persistedTTS.rate === 'number') this.config.rate = persistedTTS.rate;
      if (typeof persistedTTS.pitch === 'number') this.config.pitch = persistedTTS.pitch;
    }
    this.container.innerHTML = `
      <div class="fb-toolbar" role="toolbar" aria-label="Flipbook toolbar">
        <button class="fb-btn fb-prev" title="Previous (←)" aria-label="Previous page"><i class="fa-solid fa-angle-left"></i></button>
        <button class="fb-btn fb-next" title="Next (→)" aria-label="Next page"><i class="fa-solid fa-angle-right"></i></button>
        <div class="fb-progress" role="slider" aria-label="Pages progress" tabindex="0" aria-valuemin="1" aria-valuenow="1" aria-valuemax="1">
          <div class="fb-progress-bar"></div>
          <span class="fb-progress-thumb" aria-hidden="true"></span>
        </div>
        <span class="fb-progress-text" aria-live="polite"></span>
        <span class="fb-sep"></span>
        <button class="fb-btn fb-zoom-out" title="Zoom out (-)"><i class="fa-solid fa-magnifying-glass-minus"></i></button>
        <button class="fb-btn fb-zoom-in" title="Zoom in (+)"><i class="fa-solid fa-magnifying-glass-plus"></i></button>
        <span class="fb-sep"></span>
        <button class="fb-btn fb-contrast" title="High contrast">Aa</button>
        <span class="fb-sep"></span>
        <button class="fb-btn fb-hl-toggle" title="Highlight (H)" aria-pressed="false"><i class="fa-solid fa-highlighter"></i></button>
        <div class="fb-color-row" aria-label="Highlight colors">
          ${this.config.highlightColors.map(c => `<button class="fb-color" style="--fb-color:${c}" title="${c}" aria-label="${c}" data-color="${c}"></button>`).join('')}
        </div>
        <button class="fb-btn fb-hl-clear" title="Clear selected highlight" aria-label="Clear selected highlight"><i class="fa-solid fa-eraser"></i></button>
        <span class="fb-sep"></span>
        <button class="fb-btn fb-tts-play" title="Read to me (R)" aria-label="Read to me"><i class="fa-solid fa-volume-high"></i></button>
        <button class="fb-btn fb-tts-pause" title="Pause/Resume reading" aria-label="Pause or resume"><i class="fa-solid fa-pause"></i></button>
        <button class="fb-btn fb-tts-stop" title="Stop reading" aria-label="Stop reading"><i class="fa-solid fa-stop"></i></button>
        <div class="fb-tts">
          <button class="fb-btn fb-tts-more" title="More TTS options" aria-haspopup="dialog" aria-expanded="false" aria-controls="fb-tts-panel">
            <i class="fa-solid fa-ellipsis-vertical"></i>
          </button>
          <div class="fb-tts-panel" id="fb-tts-panel" role="dialog" aria-label="Text-to-speech options">
            <label class="fb-tts-field">
              <span class="fb-tts-field-label">Voice</span>
              <select class="fb-tts-voice"></select>
            </label>
            <label class="fb-tts-field fb-tts-lab">
              <span class="fb-tts-field-label">Rate</span>
              <input type="range" class="fb-tts-rate" min="0.5" max="2" step="0.1" value="${Number(this.config.rate ?? 1).toFixed(1)}">
              <span class="fb-tts-val fb-tts-rate-val"></span>
            </label>
            <label class="fb-tts-field fb-tts-lab">
              <span class="fb-tts-field-label">Pitch</span>
              <input type="range" class="fb-tts-pitch" min="0" max="2" step="0.1" value="${Number(this.config.pitch ?? 1).toFixed(1)}">
              <span class="fb-tts-val fb-tts-pitch-val"></span>
            </label>
          </div>
        </div>
        <div class="fb-stage" tabindex="0" aria-label="Flipbook pages">
          <div class="fb-stack" aria-hidden="false"></div>
        </div>`;
    this.$stage = this.container.querySelector('.fb-stage');
    this.$stack = this.container.querySelector('.fb-stack');
    this._installTooltip();
    this._buildSheets();
    this._wireToolbar();
    this._wireKeys();
    this._enableHighlighting();
    this._ttsBindControls();
    this._autofit = this._autofit.bind(this); this._autofit();
    window.addEventListener('resize', this._autofit);
    window.addEventListener('orientationchange', this._autofit);
    this._ttsUpdateButtons({ playing:false, paused:false });
  }
  /* Responsive autofit */
  _autofit(){ if (this._userZoom) return; try{ const cs = getComputedStyle(this.container); const baseW = parseFloat(cs.getPropertyValue('--fb-w'))||800; const avail = this.container.clientWidth - 16; const scale = Math.max(0.5, Math.min(1, avail / baseW)); this._zoom = scale; this.container.style.setProperty('--fb-zoom', String(this._zoom)); }catch{} }
  /* Build */
  _getPages() { const base = Array.isArray(this.config.pages) ? this.config.pages.slice() : []; const persisted = this._loadPersisted() || this._persisted || []; return base.map((html, i) => (persisted[i] != null ? persisted[i] : html)); }
  _sheetEl(sheetIndex, pages){ const leftIndex = sheetIndex*2; const rightIndex = leftIndex+1; const sheet = document.createElement('div'); sheet.className='fb-sheet'; sheet.dataset.sheetIndex = String(sheetIndex); const left = document.createElement('article'); left.className='fb-page fb-left'; left.innerHTML = pages[leftIndex] || ''; const right = document.createElement('article'); right.className='fb-page fb-right'; right.innerHTML = pages[rightIndex] || ''; sheet.addEventListener('focusin', (e)=>{ const mk = e.target.closest && e.target.closest('mark.fb-highlight'); if (mk) this._activeMark = mk; }); sheet.appendChild(left); sheet.appendChild(right); return sheet; }
  _buildSheets(){ const pages = this._getPages(); const total = pages.length; this._sheetCount = Math.ceil(total/2); this.$stack.querySelectorAll('.fb-sheet, .fb-flip').forEach(n=>n.remove()); const current = this._sheetEl(this._sheetIndex, pages); current.classList.add('is-current'); this.$stack.appendChild(current); for (let i=this._sheetIndex-1;i>=0;i--){ const s = this._sheetEl(i,pages); s.classList.add('is-past'); this.$stack.insertBefore(s, this.$stack.firstChild); } for(let i=this._sheetIndex+1;i<this._sheetCount;i++){ const s = this._sheetEl(i,pages); s.classList.add('is-future'); this.$stack.appendChild(s); }
    const leftIndex = this._sheetIndex*2; const rightIndex = leftIndex+1; this.$stage.setAttribute('aria-live','polite'); this.$stage.setAttribute('data-sheet', `${this._sheetIndex+1}/${this._sheetCount}`); this.$stage.setAttribute('data-pages', `${Math.min(total,leftIndex+1)}${rightIndex<total ? '–'+(rightIndex+1):''}/${total}`); this._updateProgressUI();
    try{ const totalP = this._getPages().length; this.$stack.querySelectorAll('.fb-sheet').forEach(sh=>{ const si = parseInt(sh.dataset.sheetIndex||'0',10); const left=sh.querySelector('.fb-left'); const right=sh.querySelector('.fb-right'); const lnum = si*2+1; const rnum = si*2+2; if (left) left.setAttribute('data-page-num', String(lnum)); if (right && rnum<=totalP) right.setAttribute('data-page-num', String(rnum)); }); }catch{}
  }
  /* Turning with two-faced overlay */
  _turn(dir){
    const target = this._sheetIndex + dir;
    if (target < 0 || target >= this._sheetCount) return Promise.resolve(false);
    this._isTurning = true; this._tooltipHide(); this._ttsStop();
    const pages = this._getPages();
    const leftIndex = this._sheetIndex * 2; const rightIndex = leftIndex + 1;
    const flip = document.createElement('div');
    flip.className = dir > 0 ? 'fb-flip fb-flip-right' : 'fb-flip fb-flip-left';
    const front = document.createElement('article'); front.className = 'fb-page fb-face front';
    front.innerHTML = dir > 0 ? (pages[rightIndex] || '') : (pages[leftIndex] || '');
    const back = document.createElement('article'); back.className = 'fb-page fb-face back';
    const nextSheet = this._sheetIndex + dir; const nextLeft = nextSheet * 2; const nextRight = nextLeft + 1;
    back.innerHTML = dir > 0 ? (pages[nextLeft] || '') : (pages[nextRight] || '');
    flip.appendChild(front); flip.appendChild(back);
    flip.style.zIndex = '7';
    this.$stack.appendChild(flip);
    flip.classList.add('is-turning', dir > 0 ? 'to-left' : 'to-right');
    return new Promise(resolve => {
      flip.addEventListener('animationend', () => {
        flip.remove();
        this._sheetIndex = target;
        this._buildSheets();
        this._isTurning = false;
        resolve(true);
      }, { once: true });
    });
  }
  _animateToSheet(target){ const goal = Math.max(0, Math.min(this._sheetCount - 1, target || 0)); if (goal === this._sheetIndex) return Promise.resolve(); const step = goal > this._sheetIndex ? 1 : -1; const run = async () => { while (this._sheetIndex !== goal) { if (this._isTurning) { await new Promise(r => setTimeout(r, 16)); continue; } await this._turn(step); } }; return run(); }
  /* Toolbar & keys */
  _wireToolbar(){ const q = (sel)=> this.container.querySelector(sel);
    q('.fb-prev').addEventListener('click', () => this.prev());
    q('.fb-next').addEventListener('click', () => this.next());
    q('.fb-zoom-in').addEventListener('click', () => { this._userZoom = true; this._setZoom(this._zoom + 0.1); });
    q('.fb-zoom-out').addEventListener('click', () => { this._userZoom = true; this._setZoom(this._zoom - 0.1); });
    q('.fb-contrast').addEventListener('click', () => this._toggleContrast());
    const setColor = (c)=>{ this._hlColor = c; Array.from(this.container.querySelectorAll('.fb-color')).forEach(btn => btn.classList.toggle('is-current', btn.getAttribute('data-color') === c)); };
    this.container.querySelectorAll('.fb-color').forEach(btn => btn.addEventListener('click', () => setColor(btn.getAttribute('data-color')))); setColor(this._hlColor);
    q('.fb-hl-toggle').addEventListener('click', () => { const b = q('.fb-hl-toggle'); this._hlOn = !this._hlOn; b.setAttribute('aria-pressed', String(this._hlOn)); this.$stage.classList.toggle('fb-mode-highlight', this._hlOn); });
    q('.fb-hl-clear').addEventListener('click', () => this._clearSelectedHighlight());
    q('.fb-tts-play').addEventListener('click', () => this._ttsPlay());
    q('.fb-tts-stop').addEventListener('click', () => this._ttsStop());
    q('.fb-tts-pause').addEventListener('click', () => this._ttsTogglePause());
    const ttsWrap = q('.fb-tts'); if (ttsWrap) { const moreBtn = ttsWrap.querySelector('.fb-tts-more'); const panel = ttsWrap.querySelector('.fb-tts-panel'); const closePanel = () => { ttsWrap.classList.remove('is-open'); moreBtn?.setAttribute('aria-expanded', 'false'); }; moreBtn?.addEventListener('click', (e) => { e.stopPropagation(); const open = ttsWrap.classList.toggle('is-open'); moreBtn.setAttribute('aria-expanded', open ? 'true' : 'false'); if (open) panel?.focus(); }); document.addEventListener('click', (e) => { if (!ttsWrap.contains(e.target)) closePanel(); }); ttsWrap.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); }); }
    const prog = q('.fb-progress'); if (prog){ const onJump = async (clientX, rect) => { const x = Math.max(rect.left, Math.min(clientX, rect.right)); const ratio = (x - rect.left) / rect.width; const targetSheet = Math.min(this._sheetCount - 1, Math.max(0, Math.round(ratio * (this._sheetCount - 1)))); await this._animateToSheet(targetSheet); }; prog.addEventListener('click', (e) => { const r = prog.getBoundingClientRect(); onJump(e.clientX, r); }); prog.addEventListener('keydown', (e) => { const k = (e.key || '').toLowerCase(); if (k === 'arrowright'){ e.preventDefault(); this.next(); } if (k === 'arrowleft' ){ e.preventDefault(); this.prev(); } if (k === 'home' ){ e.preventDefault(); this._animateToSheet(0); } if (k === 'end' ){ e.preventDefault(); this._animateToSheet(this._sheetCount - 1); } }); }
    this._updateProgressUI();
  }
  _wireKeys(){ this.$stage.addEventListener('keydown',(e)=>{ const k=(e.key||'').toLowerCase(); if(k==='arrowright'){ e.preventDefault(); this.next(); } if(k==='arrowleft'){ e.preventDefault(); this.prev(); } if(k==='+'){ e.preventDefault(); this._userZoom=true; this._setZoom(this._zoom+0.1);} if(k==='-'){ e.preventDefault(); this._userZoom=true; this._setZoom(this._zoom-0.1);} if(k==='h'){ e.preventDefault(); this.container.querySelector('.fb-hl-toggle').click(); } if(k==='r'){ e.preventDefault(); this._ttsPlay(); } if(k==='escape'){ this._ttsStop(); } }); }
  _setZoom(z){ this._zoom = Math.max(0.5, Math.min(2.0, z)); this.container.style.setProperty('--fb-zoom', String(this._zoom)); }
  _toggleContrast(){ this._contrast = !this._contrast; this.container.classList.toggle('fb-contrast', this._contrast); }
  _updateProgressUI(){ try{ const prog = this.container.querySelector('.fb-progress'); if(!prog) return; const bar = prog.querySelector('.fb-progress-bar'); const thumb = prog.querySelector('.fb-progress-thumb'); const txt = this.container.querySelector('.fb-progress-text'); const totalPages = this._getPages().length || 1; const currentPage = Math.min(totalPages, this._sheetIndex*2+1); const pct = totalPages>1 ? ((currentPage-1)/(totalPages-1))*100 : 0; bar.style.width=pct+'%'; thumb.style.left=pct+'%'; if(txt) txt.textContent = `${currentPage} / ${totalPages}`; prog.setAttribute('aria-valuemin','1'); prog.setAttribute('aria-valuemax', String(totalPages)); prog.setAttribute('aria-valuenow', String(currentPage)); }catch(e){} }
  _goToSheet(idx){ const target = Math.max(0, Math.min(this._sheetCount-1, idx||0)); if (target === this._sheetIndex) return; this._sheetIndex = target; this._buildSheets(); }
  /* Highlighting */
  _enableHighlighting(){ const saveIfUseful = () => { try { const sel = window.getSelection(); if (!sel) return; if (sel.rangeCount > 0 && !sel.isCollapsed) { const r = sel.getRangeAt(0); if (this.$stage && this.$stage.contains(r.commonAncestorContainer)) { this._lastRange = r.cloneRange(); } } } catch {} }; this._lastRange = null; this._onSelChange = saveIfUseful; document.addEventListener('selectionchange', this._onSelChange); const makeMarkFromRange = (range) => { if (!range) return null; if (!this.$stage.contains(range.commonAncestorContainer)) return null; const mark = document.createElement('mark'); mark.className='fb-highlight'; mark.setAttribute('tabindex','0'); mark.style.setProperty('--hl', this._hlColor); try { range.surroundContents(mark); } catch { const frag = range.extractContents(); mark.appendChild(frag); range.insertNode(mark); } return mark; }; const finalizeNote = (mk) => { try { const note = window.prompt('Add a note (optional):',''); if (mk && note && note.trim()) mk.setAttribute('data-note', note.trim()); } catch {} }; const commitHighlight = () => { let sel = window.getSelection && window.getSelection(); let range = (sel && sel.rangeCount>0 && !sel.isCollapsed) ? sel.getRangeAt(0).cloneRange() : (this._lastRange ? this._lastRange.cloneRange() : null); if (!range) return; const page = this._closest(range.commonAncestorContainer, el => el.classList && el.classList.contains('fb-page')); if (!page || !this.$stage.contains(page)) return; const mk = makeMarkFromRange(range); if (!mk) return; this._activeMark = mk; finalizeNote(mk); this._persistPage(page); try { sel && sel.removeAllRanges(); } catch {} this._lastRange = null; }; const onMouseUp = () => { if (!this._hlOn) return; commitHighlight(); }; this.$stage.addEventListener('mouseup', onMouseUp); this.$stage.addEventListener('touchend', () => { if (!this._hlOn) return; setTimeout(commitHighlight, 60); }, { passive: true }); const tryShow = (t) => { const mk = t && t.closest ? t.closest('mark.fb-highlight[data-note]') : null; if(mk){ this._activeMark=mk; this._tooltipShow(mk);} }; this.$stage.addEventListener('click', (e)=> tryShow(e.target)); this.$stage.addEventListener('touchstart', (e)=>{ const touch = e.targetTouches && e.targetTouches[0]; const tgt = touch ? document.elementFromPoint(touch.clientX, touch.clientY) : e.target; tryShow(tgt); }, { passive:true }); document.addEventListener('pointerdown', (e)=>{ if(!this.container.contains(e.target)) this._tooltipHide(); }, { capture:true }); }
  _clearSelectedHighlight(){ const sel = window.getSelection(); const current = this.$stack.querySelector('.fb-sheet.is-current'); if(!current) return; if (sel && !sel.isCollapsed){ const range = sel.getRangeAt(0); current.querySelectorAll('mark.fb-highlight').forEach(mk=>{ try{ if(range.intersectsNode(mk)){ const r2 = document.createRange(); r2.selectNode(mk); const containsWhole = (range.compareBoundaryPoints(Range.START_TO_START, r2) <= 0 && range.compareBoundaryPoints(Range.END_TO_END, r2) >= 0); if(containsWhole) this._unwrapMark(mk); } }catch{} }); this._persistCurrentSheet(); sel.removeAllRanges(); this._tooltipHide(); return; } const mk = this._activeMark && this.$stage.contains(this._activeMark) ? this._activeMark : null; if(mk){ const page = this._closest(mk, el=> el.classList && el.classList.contains('fb-page')); this._unwrapMark(mk); if(page) this._persistPage(page); this._tooltipHide(); } }
  _unwrapMark(mk){ const p = mk.parentNode; if(!p) return; while(mk.firstChild) p.insertBefore(mk.firstChild, mk); p.removeChild(mk); }
  /* Tooltip */
  _installTooltip(){ this._tooltip = document.createElement('div'); this._tooltip.className='fb-tooltip'; this._tooltip.setAttribute('role','tooltip'); this._tooltip.hidden = true; this._tooltip.style.left='0px'; this._tooltip.style.top='0px'; this.$stage.appendChild(this._tooltip); this.$stage.addEventListener('pointerenter',(e)=>{ const mk = e.target.closest && e.target.closest('mark.fb-highlight[data-note]'); if(mk) this._tooltipShow(mk); }, true); this.$stage.addEventListener('pointerleave',()=>{ this._tooltipHide(); }, true); this.$stage.addEventListener('focusin',(e)=>{ const mk = e.target.closest && e.target.closest('mark.fb-highlight[data-note]'); if(mk) this._tooltipShow(mk); }); this.$stage.addEventListener('focusout',()=>{ this._tooltipHide(); }); }
  _tooltipShow(mark){ const note = mark.getAttribute('data-note'); if(!note) return; this._tooltip.textContent = note; this._tooltip.hidden = false; this._tooltip.style.maxWidth = Math.floor(this.$stage.clientWidth * 0.9)+'px'; const stageRect = this.$stage.getBoundingClientRect(); const mr = mark.getBoundingClientRect(); const tr = this._tooltip.getBoundingClientRect(); const pad = 8; let x = mr.left - stageRect.left; let y = mr.top - stageRect.top - tr.height - 8; const maxX = stageRect.width - tr.width - pad; const maxY = stageRect.height - tr.height - pad; x = Math.max(pad, Math.min(x, maxX)); if (y < pad) { y = Math.min(mr.bottom - stageRect.top + 8, maxY); } this._tooltip.style.left = x+'px'; this._tooltip.style.top = y+'px'; }
  _tooltipHide(){ if(this._tooltip) this._tooltip.hidden = true; }
  /* Persistence */
  _persistPage(pageEl){ const leftIndex = this._sheetIndex*2; const rightIndex = leftIndex+1; const current = this.$stack.querySelector('.fb-sheet.is-current'); const map = new Map(); if(current){ const [L,R] = current.querySelectorAll('.fb-page'); map.set(L,leftIndex); map.set(R,rightIndex);} const idx = map.get(pageEl); if (idx==null) return; const persisted = this._loadPersisted() || []; persisted[idx] = pageEl.innerHTML; this._savePersisted(persisted); }
  _persistCurrentSheet(){ const current = this.$stack.querySelector('.fb-sheet.is-current'); if(!current) return; const [L,R] = current.querySelectorAll('.fb-page'); if(L) this._persistPage(L); if(R) this._persistPage(R); }
  _loadPersisted(){ try{ const s = localStorage.getItem(this._persistNS); if(!s) return null; const obj = JSON.parse(s); return Array.isArray(obj?.pages) ? obj.pages : null; }catch{ return null; } }
  _savePersisted(pages) {try {localStorage.setItem(this._persistNS, JSON.stringify({ pages }));this._persisted = pages;} catch {}}
  /* TTS */
  _ttsLoadPrefs(){ try{ const s = localStorage.getItem(this._persistNS+":tts"); return s ? JSON.parse(s) : null; }catch{ return null; } }
  _ttsSavePrefs(){ try{ const v = { voice: this.config.voice||'', rate: Number(this.config.rate||1), pitch: Number(this.config.pitch||1) }; localStorage.setItem(this._persistNS+":tts", JSON.stringify(v)); }catch{} }
  _ttsBindControls(){ const sel = this.container.querySelector('.fb-tts-voice'); const r = this.container.querySelector('.fb-tts-rate'); const p = this.container.querySelector('.fb-tts-pitch'); const rv = this.container.querySelector('.fb-tts-rate-val'); const pv = this.container.querySelector('.fb-tts-pitch-val'); const updateVals = ()=>{ if(rv) rv.textContent = Number(r.value).toFixed(1)+'x'; if(pv) pv.textContent = Number(p.value).toFixed(1); }; updateVals(); r.addEventListener('input', ()=>{ this.config.rate = Number(r.value); updateVals(); this._ttsSavePrefs(); }); p.addEventListener('input', ()=>{ this.config.pitch = Number(p.value); updateVals(); this._ttsSavePrefs(); }); const populate = ()=>{ try{ const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : []; const previous = sel.value; sel.innerHTML=''; voices.forEach(v=>{ const opt = document.createElement('option'); opt.value = v.name; opt.textContent = `${v.name} — ${v.lang}`; if((this.config.voice||'') === v.name) opt.selected = true; sel.appendChild(opt); }); if(!sel.value && previous) sel.value = previous; }catch{} }; sel.addEventListener('change', ()=>{ this.config.voice = sel.value; this._ttsSavePrefs(); }); try{ populate(); window.speechSynthesis && (window.speechSynthesis.onvoiceschanged = populate); }catch{} }
  _ttsBuild(){ const current = this.$stack.querySelector('.fb-sheet.is-current'); if(!current) return { str:'', map:[], words:[] }; const pages = Array.from(current.querySelectorAll('.fb-page')); const words=[]; const map=[]; let text=''; const wrapNode = (node)=>{ if (node.nodeType===3){ const raw=node.nodeValue||''; if(!raw.trim()){ text+=raw; return; } const parts = raw.split(/(\s+)/); const frag = document.createDocumentFragment(); for(const part of parts){ if(!part) continue; if(/^\s+$/.test(part)){ frag.appendChild(document.createTextNode(part)); text+=part; continue;} const span=document.createElement('span'); span.className='fb-word'; span.textContent=part; const start=text.length; const end=start+part.length; words.push(span); map.push({ start,end, el: span}); text+=part; frag.appendChild(span);} node.parentNode.replaceChild(frag,node); return; } if (node.nodeType===1){ const tag=node.tagName.toLowerCase(); if(tag==='script'|| tag==='style') return; const kids=Array.from(node.childNodes); for(const k of kids) wrapNode(k); } }; for(const page of pages){ if(page.hasAttribute('data-tts-wrapped')){ const visit = (node) => { if (!node) return; if (node.nodeType === 3) { text += node.nodeValue || ''; return; } if (node.nodeType === 1) { const el = node; if (el.classList && el.classList.contains('fb-word')) { const part = el.textContent || ''; const start = text.length; const end = start + part.length; words.push(el); map.push({ start, end, el }); text += part; return; } const tag = el.tagName ? el.tagName.toLowerCase() : ''; if (tag === 'script' || tag === 'style') return; Array.from(el.childNodes).forEach(visit); } }; visit(page); } else { wrapNode(page); page.setAttribute('data-tts-wrapped','true'); } } return { str: text, map, words }; }
  _ttsSetButtonsState(playing, paused){ const pauseBtn = this.container.querySelector('.fb-tts-pause'); const stopBtn = this.container.querySelector('.fb-tts-stop'); if (pauseBtn){ const icon = pauseBtn.querySelector('i'); if(paused || !playing){ icon.classList.remove('fa-pause'); icon.classList.add('fa-play'); pauseBtn.title='Resume reading'; pauseBtn.setAttribute('aria-label','Resume reading'); pauseBtn.disabled = !playing && !paused; } else { icon.classList.remove('fa-play'); icon.classList.add('fa-pause'); pauseBtn.title='Pause reading'; pauseBtn.setAttribute('aria-label','Pause reading'); pauseBtn.disabled = false; } } if (stopBtn){ stopBtn.disabled = !playing && !paused; } }
  _ttsUpdateButtons({playing=false, paused=false}={}){ this._ttsSetButtonsState(playing, paused); }
  _ttsSetReading(idx){ this._ttsClearReading(); const w = this._tts.words[idx]; if(!w) return; w.classList.add('is-reading'); try{ w.scrollIntoView({ block:'nearest', inline:'nearest' }); }catch{} }
  _ttsClearReading(){ this.$stack.querySelectorAll('.fb-word.is-reading').forEach(el=> el.classList.remove('is-reading')); }
  _ttsPlay(){ if (!('speechSynthesis' in window)) { alert('Text-to-speech not supported in this browser.'); return; } if (this._tts.playing && !this._tts.paused) return; const data = this._ttsBuild(); if(!data.str.trim()) return; this._tts.str = data.str; this._tts.map = data.map; this._tts.words = data.words; this._tts.lastChar = 0; const starts = this._tts.map.map(m=>m.start); const idxForChar = (i)=>{ let lo=0, hi=starts.length-1, ans=0; while(lo<=hi){ const mid=(lo+hi)>>1; if(starts[mid] <= i){ ans=mid; lo=mid+1;} else hi=mid-1; } while(ans+1 < this._tts.map.length && i >= this._tts.map[ans+1].start && i < this._tts.map[ans+1].end) ans++; return ans; }; const u = new SpeechSynthesisUtterance(data.str); try{ u.lang = document.documentElement.lang || navigator.language || 'en-US'; u.rate = Number(this.config.rate)||1.0; u.pitch = Number(this.config.pitch)||1.0; const wanted = (this.config.voice||'').trim(); if (wanted){ const applyVoice = ()=>{ const v = speechSynthesis.getVoices().find(v=> v.name === wanted); if (v) u.voice = v; }; applyVoice(); speechSynthesis.onvoiceschanged = applyVoice; } }catch{} const myId = ++this._tts.id; u.onstart = ()=>{ if (myId !== this._tts.id) return; this._tts.playing = true; this._tts.paused = false; this._ttsUpdateButtons({playing:true, paused:false}); }; u.onend = ()=>{ if (myId !== this._tts.id) return; this._tts.playing = false; this._tts.paused = false; this._ttsClearReading(); this._tts.lastChar = 0; this._ttsUpdateButtons({playing:false, paused:false}); }; u.onpause = ()=>{ if (myId !== this._tts.id) return; this._tts.playing = true; this._tts.paused = true; this._ttsUpdateButtons({playing:true, paused:true}); }; u.onresume = ()=>{ if (myId !== this._tts.id) return; this._tts.playing = true; this._tts.paused = false; this._ttsUpdateButtons({playing:true, paused:false}); }; u.onboundary = (ev)=>{ if (myId !== this._tts.id) return; const i = (typeof ev.charIndex === 'number' ? ev.charIndex : this._tts.lastChar); this._tts.lastChar = i; this._ttsSetReading(idxForChar(i)); }; try{ speechSynthesis.cancel(); this._ttsUpdateButtons({playing:true, paused:false}); speechSynthesis.speak(u); this._tts.utter = u; }catch{} }
  _ttsTogglePause(){ try{ if(!('speechSynthesis' in window)) return; if(!this._tts.utter) return; if (speechSynthesis.paused){ speechSynthesis.resume(); this._tts.paused = false; this._ttsUpdateButtons({playing:true, paused:false}); } else { speechSynthesis.pause(); this._tts.paused = true; this._ttsUpdateButtons({playing:true, paused:true}); } }catch{} }
  _ttsStop(){ try{ this._tts.id++; speechSynthesis.cancel(); }catch{} this._tts.playing=false; this._tts.paused=false; this._tts.utter=null; this._ttsClearReading(); this._tts.lastChar = 0; this._ttsUpdateButtons({playing:false, paused:false}); }
  /* Utils */
  _closest(node, predicate){ let n = (node && node.nodeType === 3) ? node.parentNode : node; while(n){ if(predicate(n)) return n; n = n.parentNode; } return null; }
}




//Finalize the URL
finalizeURL();