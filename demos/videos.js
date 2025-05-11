import {startup, VideoPlayer} from '../js/mediaviewer.js';
startup();
const tracks = [{
    src:'tracks/chapters.vtt',
    kind: 'chapters',
    srclang: 'en',
    label: 'English'
},{
    src: 'tracks/en-US.vtt',
    kind: 'subtitles',
    srclang: 'en',
    label: 'English'
},{
    src: 'tracks/de-DE.vtt',
    kind: 'subtitles',
    srclang: 'de',
    label: 'German'
}],
src = [{
    quality: 'auto',
    path: 'videos/demo.mp4'
},{
    quality: 144,
    path: 'videos/demo_144p.mp4'
},{
    quality: 1080,
    path: 'videos/demo_1080p.mp4'
}];
new VideoPlayer('.video',{
    controls: true,
    loop: true,
    tracks: tracks,
    playlists: [{
        poster: '',
        title: 'Big Bunny',
        src: src,
        tracks: tracks,
    }
    // Add more here
    ]
});