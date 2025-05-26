import { clipboard, color, videoData, genID, fileName, GenerateQRCode, finalizeURL} from "./mediaviewer-tools.js";
/**
 * @package MediaViewer
 * @version 1.2.0
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
    icons.href = `//cdn.jsdelivr.net/gh/Orlinkzz/fontawesome-pro-v6.7.0@main/css/all.min.css`;
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
     * Creates a carousel
     * @param {String} container Container to create the carousel in
     * @param {{speed: number, interval:number, autoplay:boolean, loop:boolean, slides: string[], captions: [], start: number, controls: boolean, indicator: boolean, transition: 'slide'|'fade'|'none'}} config Carousel configuration
     * @param {{}} styles Carousel styles 
     * @param {boolean} [trigger=true] Active the event
     */
    constructor(container, config, styles,trigger=true){
        
        if(!isLoaded()) return;
        this.container = document.querySelector(container);
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
     * Initiate the configuration
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
          * Registers a callback to be called on slide change
          * @param {function} callback Callback function to be called on slide change
          * @param {boolean} [async=false] Trigger callback on load
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
     * Creates an image gallery
     * @param {String} container Container element
     * @param {{images: string[], captions: string[], zoom: boolean, gap: string, autoResize: boolean, static: boolean}} config 
     * @param {{}} styles Style configuration
     * @param {boolean} [trigger=true] Active the event
     */
    constructor(container, config, styles, trigger=true){
        if(!isLoaded()) return;
        this.container = document.querySelector(container);
        this.config = {
            images: [],
            captions: [],
            zoom: false,
            gap: '0px',
            autoResize: false,
            static: false
        };
        this.styles = {
            'max-cols': '1fr',
            'gap': this.config.gap
        };
        this.interval = null;
        Object.assign(this.config, config);
        Object.assign(this.styles, styles);
        this.loadImages().then(() => {
            if(this.container instanceof HTMLElement&&trigger) this.init();
        });
        if(this.config.autoResize) 
            window.addEventListener('resize',()=>{this.loadImages().then(() => {this.init();});});
    }

    async loadImages() {
        const promises = this.config.images.map(src => {
            return new Promise(resolve => {
                const img = new Image();
                img.src = src;
                img.onload = () => resolve(img);
            });
        });
        const images = await Promise.all(promises);
        const totalWidth = images.reduce((acc, img) => acc + img.naturalWidth, 0);
        const maxCols = Math.floor(document.documentElement.clientWidth / (totalWidth / images.length));
        this.styles['max-cols'] = `${maxCols}`;
    }
    init(){
        this.container.classList.add('gallery');
        if(this.config.images.length>this.config.rows*this.config.cols)  return;
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
     * Generate a new video element
     * @param {String} container 
     * @param {{autoplay: boolean, preloaded: 'auto'|'metadata'|'none', controls: boolean, playlists:[...{poster: string, title:string, author: string, src: [...{quality: string|number, path: string}], tracks:[...{src: string, kind: string, srclang: string, label: string}]}], start: number, skipRate: number, embed: boolean}} config Configurations
     * @param {{}} styles Style configuration
     * @returns {Video} return the video element
     * @param {boolean} [trigger=true] Active the event
     */
    constructor(container, config, styles, trigger=true){

        if(!isLoaded()) return;
        this.params = new URLSearchParams(window.location.search);
        this.container = document.querySelector(container);
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

        

        this.config.autoplay = JSON.parse(window.localStorage.getItem(`mediaViewer_video_config`))['autoplay']??this.config.autoplay;

        


        this.config.playlists.map((i)=>{
            let videoID='';
            genID(fileName(i.src[0].path)).then((id)=>{
                videoID = id;
            });
            
            setTimeout(()=>{

                if(!this.#videoList.some(item=>item.videoName===fileName(i.src[0].path))){
                    this.#videoList.push({
                        videoName: fileName(i.src[0].path),
                        videoID: videoID
                    });
                }
            },50);
        });



        
        // Generate poster screenshots for all playlists before calling init
        const posterPromises = this.config.playlists.map((e) => {
            return new Promise((resolve) => {
                if (typeof e.poster === 'string' && e.poster.trim() !== '') {
                    // Poster already set, skip screenshot generation
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

        Promise.all(posterPromises).then(() => {
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
                    return `<div class="playlist-item" tab-index="0" data-video="${this.#videoList.find(v => v.videoName === fileName(e.src[0].path))['videoID']}">
                        <div style="position: relative;">
                            <img src="${e.poster}" class="playlist-img"/>
                            <span data-video-src="${this.#videoList.find(v => v.videoName === fileName(e.src[0].path))['videoID']}" class="playlist-timeDur" data-video-duration="${this.#sec2time(e.duration)}">${this.#sec2time(e.duration)}</span>
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
            x.classList.add('toggled');
            setTimeout(()=>{
                x.classList.remove('toggled');
            },800);
        });

        video.addEventListener('pause',function(){
            const x = this.parentNode.parentNode.querySelector('.playpauseUI');
            x.setAttribute('data-status','isPaused');
            x.classList.add('toggled');
            setTimeout(()=>{
                x.classList.remove('toggled');
            },800);
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
                    playlistItems[nextIndex].querySelector('img').click();
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
                        const x = this.#videoList.find(v => v.videoID === vID)['videoName'];
                        window.localStorage.setItem(`embed_${vID}`,JSON.stringify({lists: this.#videoList, playlists: this.config.playlists.filter((i)=>i.src[0].path.match(x))}));
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
            const key = e.key||e.keyCode||e.which;
            if ((key === ' ' || key === 'k' || key === 32 || key === 75)) 
                this.container.querySelector('.play-pause').click();
            
            if(key==='ArrowLeft'||key==37)
                video.currentTime = Math.max(0, video.currentTime - this.config.skipRate);
            if(key==='ArrowRight'||key==39)
                video.currentTime = Math.min(video.duration, video.currentTime + this.config.skipRate);
            if(key === 'm' || key == 77){
                const video = this.container.querySelector('.video-frame');
                video.muted = !video.muted;
                const volumeBtn = this.container.querySelector('.volume'),
                volumeRange = this.container.querySelector('.volumeRange');
                const activeColor = this.styles['volume-track-before']??'#e7e7e7';
                const inactiveColor = this.styles['volume-track-after']??'#c8c8c8';

                if (video.muted) {
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
            }
            if(key==='i'||key==73){
                if(this.container.classList.contains('video-pip'))
                    this.container.querySelector('.pip-expand').click();
                else 
                    this.container.querySelector('.pip').click();
            }
            if(key==='c'||key==67){
                if(this.container.querySelector('.cc:not([disabled])'))
                    this.container.querySelector('.cc:not([disabled])').click();
            }
            if(key==='t'||key==84)
                this.container.querySelector('.theaterMode').click();
            if(key==='f'||key==70)
                this.container.querySelector('.fullscreen').click();
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
     * Generates event on 
     * @param {String} event Video Event
     * @param {Function} callback Function callback
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
     * Returns the video debug info
     * @returns {Promise.Object}
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

export class AudioPlayer{
    #playlistsDurations = {};
    /**
     * Creates an Audio player
     * @param {String} container Container to load the player
     * @param {{controls: Boolean, skipRate: Number, autoplay: Boolean, loop: Boolean, shuffle: Boolean, preloaded: 'auto'|'metadata'|'none', playlists:[...src:[{img: String, path: String, title: String, artist: String, album: String}], tracks: [...{src: string, kind: string, srclang: string, label: string}]]}} config 
     * @param {{}} styles Styles
     * @param {boolean} [trigger=true] Active the event
     */
    constructor(container, config, styles={}, trigger=true){
        if(!isLoaded()) return;
        this.params = new URLSearchParams(window.location.search);
        this.container = document.querySelector(container);
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

        this.config.autoplay = JSON.parse(window.localStorage.getItem(`mediaViewer_audio_config`))?.autoplay??this.config.autoplay;


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
        captionsElement.innerText = '';
        const tracks = Array.from(audioElement.querySelectorAll('track[kind="captions"]'));
        let selectedTrack = tracks.find(track => track.srclang === navigator.language.substring(0, 2)) || tracks[0];
        if (selectedTrack) {
            selectedTrack.track.mode = 'hidden';
            selectedTrack.track.addEventListener('cuechange', () => {
                const activeCues = selectedTrack.track.activeCues;
                if (activeCues && activeCues.length > 0) captionsElement.innerText = activeCues[0].text;
                else captionsElement.innerText = '';
            });
        }
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
            const key = e.key||e.keyCode||e.which,
            audio = this.container.querySelector('audio');
            if(key==='ArrowLeft'||key==37){
                e.preventDefault();
                audio.currentTime = Math.max(0, audio.currentTime - this.config.skipRate);
            }
            if(key==='ArrowRight'||key==39){
                e.preventDefault();
                audio.currentTime = Math.min(audio.duration, audio.currentTime + this.config.skipRate);
            }
            if(key === 'm' || key == 77){
                const audio = this.container.querySelector('audio');
                audio.muted = !audio.muted;
                const volumeBtn = this.container.querySelector('.volume'),
                volumeRange = this.container.querySelector('.volumeRange');
                const activeColor = this.styles['volume-track-before']??'#e7e7e7';
                const inactiveColor = this.styles['volume-track-after']??'#c8c8c8';

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
            }

            if(key===' '||key==39)
                this.container.querySelector('.play-pause').click();
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

        this.container.querySelector('audio').addEventListener('ended',()=>{
            this.container.querySelector('.audio-next').click();
        });

        this.container.querySelector('.audio-loop').addEventListener('click',(e)=>{
            e.target.parentNode.classList.toggle('active');
            if(e.target.parentNode.classList.contains('active')) this.container.querySelector('audio').loop = true;
            else this.container.querySelector('audio').loop = false;
        });

        this.container.querySelector('.audio-shuffle').addEventListener('click',(e)=>{
            e.target.parentNode.classList.toggle('active');
        });

        this.container.querySelector('.autoplay').addEventListener('input',function(){
            window.localStorage.setItem('mediaViewer_audio_config',JSON.stringify({
                'autoplay': this.checked
            }));
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


//Finalize the URL
finalizeURL();