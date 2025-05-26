import { startup, AudioPlayer} from "../js/mediaviewer.js";
startup();
new AudioPlayer('.demo',{
    autoplay: false,
    loop: false,
    shuffle: false,
    playlists: [{
            src:[{
                img: 'https://i.ytimg.com/vi/EcqO6XO5jA8/hqdefault.jpg?sqp=-oaymwEnCNACELwBSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLD_CDQlODWy6U-hQwVqPdnFszB5xQ',
                path: 'audios/music1.mp3',
                title: 'Scarlet Vow (Halloween Song  NEW EP!)',
                artist: 'Aviators',
                album: 'The Twist at The End'
            }]
        },
        {
            src: [{
                img: 'https://i.ytimg.com/vi/D1NdGBldg3w/hqdefault.jpg?sqp=-oaymwEmCKgBEF5IWvKriqkDGQgBFQAAiEIYAdgBAeIBCggYEAIYBjgBQAE=&rs=AOn4CLC2i0H1zkWZme9jl7nx56BSWAvJUQ',
                path: 'audios/music2.mp3',
                title: 'WE GOT THE MOVES',
                artist: 'Electric Callboy',
                album: 'TEKKNO'
            }],
            tracks: [{
                src: 'tracks/we_got_the_moves_de.vtt',
                kind: 'captions',
                srclang: 'de',
                label: 'German'
            },
            {
                src: 'tracks/we_got_the_moves_en.vtt',
                kind: 'captions',
                srclang: 'en',
                label: 'English'
            }]
        },
        {
            src:[{
                img: 'https://i.ytimg.com/vi/4G6QDNC4jPs/hqdefault.jpg?sqp=-oaymwEnCNACELwBSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLByLvBwmLBLIG6GokBzcC6q89fUtw',
                path: 'audios/music3.mp3',
                title: 'Everytime We Touch',
                artist: 'Cascada',
                album: 'Studio album'
            }],
            tracks:[{
                src: 'tracks/everytime_we_touch_lyrics.vtt',
                kind: 'captions',
                srclang: 'en',
                label: 'English'
            }]
            
        }]
});