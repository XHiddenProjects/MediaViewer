import { Extension, Config, Styles } from "./js/mediaviewer-extension.js";
import {startup, VideoPlayer, AudioPlayer, Gallery, Carousel} from "./js/mediaviewer.js";
import { uniqueid, parseBoolean } from "./js/mediaviewer-tools.js";
startup();
export const autoloader = class extends Extension{
    constructor(container,config,styles){
        super(container,new Config().parse(config), new Styles().parse(styles));
    }
}


window.addEventListener('load',()=>{

    let gallery, carousel, video_player, audio_player;
    document.querySelectorAll('[media-video-player], [media-audio-player], [media-gallery], [media-carousel]')
    .forEach(e=>{
        if(!e.id) e.id = uniqueid();
        if(e.hasAttribute('media-carousel')){
            carousel = new autoloader(`[id="${e.id}"]`,{
                Carousel:{
                    slides: Array.from(e.querySelectorAll('img')).map(i => i.src),
                    captions: Array.from(e.querySelectorAll('img')).map(i => i.getAttribute('data-caption')||i.alt) ?? [],
                    controls: (e.hasAttribute('controls') ? parseBoolean(e.getAttribute('controls'),true) : false),
                    transition: (e.hasAttribute('data-transition') ? e.getAttribute('data-transition') : 'none'),
                    indicator: (e.hasAttribute('data-indicator') ? parseBoolean(e.getAttribute('data-indicator'),true) : false),
                    speed: (e.hasAttribute('data-speed') ? parseInt(e.getAttribute('data-speed')) : 5),
                    interval: (e.hasAttribute('data-interval') ? parseInt(e.getAttribute('data-interval')) : 3000),
                    autoplay: (e.hasAttribute('autoplay') ? parseBoolean(e.getAttribute('autoplay'),true) : true),
                    loop: (e.hasAttribute('loop') ? parseBoolean(e.getAttribute('loop'),true) : true),
                }
            },{
                Carousel: (
                    e.hasAttribute('data-styles')
                        ? Object.fromEntries(
                            e.getAttribute('data-styles')
                                .split(';')
                                .map(s => s.trim())
                                .filter(Boolean)
                                .map(pair => {
                                    const [key, value] = pair.split(':').map(x => x.trim());
                                    return [key, value];
                                })
                        )
                        : {}
                )
            });
            e.querySelectorAll('img:not([class="image"])').forEach(i=>i.remove());
            carousel.include(Carousel);
            carousel.use(Carousel).apply();
            e.removeAttribute('data-slides');
            e.removeAttribute('data-captions');
            e.removeAttribute('data-transition');
            e.removeAttribute('data-speed');
            e.removeAttribute('data-interval');
            e.removeAttribute('data-indicator');
            e.removeAttribute('data-styles');
            
        }else if(e.hasAttribute('media-gallery')){
            gallery = new autoloader(`[id="${e.id}"]`,{
                Gallery:{
                    images: Array.from(e.querySelectorAll('img')).map(i => i.src),
                    captions: Array.from(e.querySelectorAll('img')).map(i => i.getAttribute('data-caption')||i.alt) ?? [],
                    static: (e.hasAttribute('data-static') ? parseBoolean(e.getAttribute('data-static')) : false),
                    zoom: (e.hasAttribute('data-zoom') ? parseBoolean(e.getAttribute('data-zoom')) : false),
                    autoResize: (e.hasAttribute('data-autoResize') ? parseBoolean(e.getAttribute('data-autoResize')) : true)
                }
            },{
                Gallery: (
                    e.hasAttribute('data-styles')
                        ? Object.fromEntries(
                            e.getAttribute('data-styles')
                                .split(';')
                                .map(s => s.trim())
                                .filter(Boolean)
                                .map(pair => {
                                    const [key, value] = pair.split(':').map(x => x.trim());
                                    return [key, value];
                                })
                        )
                        : {}
                )
            });
            e.querySelectorAll('img:not([class="image"])').forEach(i=>i.remove());
            gallery.include(Gallery);
            gallery.use(Gallery).apply();
            e.removeAttribute('data-images');
            e.removeAttribute('data-zoom');
            e.removeAttribute('data-static');
            e.removeAttribute('data-captions');
            e.removeAttribute('data-autoResize');
            e.removeAttribute('data-styles');
        }else if(e.hasAttribute('media-video-player')){
            video_player = new autoloader(`[id="${e.id}"]`,{
                VideoPlayer:{
                    controls: (e.hasAttribute('controls') ? parseBoolean(e.getAttribute('controls'),true) : false),
                    loop: (e.hasAttribute('loop') ? parseBoolean(e.getAttribute('loop'),true) : false),
                    autoplay: (e.hasAttribute('autoplay') ? parseBoolean(e.getAttribute('autoplay'),true) : false),
                    muted: (e.hasAttribute('muted') ? parseBoolean(e.getAttribute('muted'),true) : false),
                    playlists: (() => {
                        // Collect all <videoplayer> elements, or fallback to the current element if none found
                        const videoplayerEls = e.querySelectorAll('videoplayer');
                        let playlists = [];
                        
                        if (videoplayerEls.length > 0) {
                            videoplayerEls.forEach(vpEl => {
                                const videoEl = vpEl.querySelector('video');
                                if (videoEl) {
                                    const tracks = Array.from(vpEl.querySelectorAll('track')).map(trackEl => ({
                                        src: trackEl.getAttribute('src') ? trackEl.getAttribute('src').replace(/^\.\//, '') : '',
                                        kind: trackEl.getAttribute('kind') || '',
                                        srclang: trackEl.getAttribute('srclang') || '',
                                        label: trackEl.getAttribute('label') || ''
                                    }));
                                    playlists.push({
                                        poster: videoEl.getAttribute('poster') || '',
                                        title: vpEl.getAttribute('title') || '',
                                        author: vpEl.getAttribute('data-author') || '',
                                        src: Array.from(vpEl.querySelectorAll('video')).map(sourceEl => ({
                                            quality: sourceEl.getAttribute('data-quality') || 'auto',
                                            path: sourceEl.getAttribute('src') ? sourceEl.getAttribute('src').replace(/^\.\//, '') : ''
                                        })),
                                        tracks: Array.isArray(tracks) ? tracks : []
                                    });
                                }
                            });
                        }
                        return playlists;
                    })()
                }
            },{
                VideoPlayer: (
                    e.hasAttribute('data-styles')
                        ? Object.fromEntries(
                            e.getAttribute('data-styles')
                                .split(';')
                                .map(s => s.trim())
                                .filter(Boolean)
                                .map(pair => {
                                    const [key, value] = pair.split(':').map(x => x.trim());
                                    return [key, value];
                                })
                        )
                        : {}
                )
            });
            e.querySelectorAll('playlists').forEach(i=>i.remove());
            video_player.include(VideoPlayer);
            video_player.use(VideoPlayer).apply();
            e.removeAttribute('data-tracks');
            e.removeAttribute('data-styles');
        }else if(e.hasAttribute('media-audio-player')){
            audio_player = new autoloader(`[id="${e.id}"]`,{
                AudioPlayer:{
                    controls: (e.hasAttribute('controls') ? parseBoolean(e.getAttribute('controls'),true) : false),
                    loop: (e.hasAttribute('loop') ? parseBoolean(e.getAttribute('loop'),true) : false),
                    autoplay: (e.hasAttribute('autoplay') ? parseBoolean(e.getAttribute('autoplay'),true) : false),
                    muted: (e.hasAttribute('muted') ? parseBoolean(e.getAttribute('muted'),true) : false),
                    playlists: (() => {
                        const audioplayerEls = e.querySelectorAll('audioplayer');
                        let playlists = [];
                        
                        if (audioplayerEls.length > 0) {
                            audioplayerEls.forEach(apEl => {
                                const audioEl = apEl.querySelector('audio');
                                if (audioEl) {
                                    const tracks = Array.from(apEl.querySelectorAll('track')).map(trackEl => ({
                                        src: trackEl.getAttribute('src') ? trackEl.getAttribute('src').replace(/^\.\//, '') : '',
                                        kind: trackEl.getAttribute('kind') || '',
                                        srclang: trackEl.getAttribute('srclang') || '',
                                        label: trackEl.getAttribute('label') || ''
                                    }));
                                    playlists.push({
                                        src: Array.from(apEl.querySelectorAll('audio')).map(sourceEl => ({
                                            path: sourceEl.getAttribute('src') ? sourceEl.getAttribute('src').replace(/^\.\//, '') : '',
                                            album: sourceEl.getAttribute('data-album') || apEl.getAttribute('data-album') || '',
                                            artist: sourceEl.getAttribute('data-artist') || apEl.getAttribute('data-artist') || '',
                                            img: sourceEl.getAttribute('data-img') || apEl.getAttribute('data-img') || '',
                                            title: sourceEl.getAttribute('data-title') || sourceEl.getAttribute('title') || apEl.getAttribute('data-title') || apEl.getAttribute('title') || ''
                                        })),
                                        tracks: Array.isArray(tracks) ? tracks : []
                                    });
                                }
                            });
                        }
                        return playlists;
                    })()
                }
            },{
                AudioPlayer: (
                    e.hasAttribute('data-styles')
                        ? Object.fromEntries(
                            e.getAttribute('data-styles')
                                .split(';')
                                .map(s => s.trim())
                                .filter(Boolean)
                                .map(pair => {
                                    const [key, value] = pair.split(':').map(x => x.trim());
                                    return [key, value];
                                })
                        )
                        : {}
                )
            });
            e.querySelectorAll('playlists').forEach(i=>i.remove());
            audio_player.include(AudioPlayer);
            audio_player.use(AudioPlayer).apply();
            e.removeAttribute('data-tracks');
            e.removeAttribute('data-styles');
        }
    });

    

});
