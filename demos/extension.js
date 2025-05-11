import { Extension, Config, Styles} from "../js/es6/mediaviewer-extension.js";
import {startup, VideoPlayer } from "../js/es6/mediaviewer.js";
startup();
export const Demo = class extends Extension{
    constructor(container,config,styles){
        super(container,new Config().parse(config), new Styles().parse(styles));
    }
}
const x = new Demo(['.test','.test1'],{
    VideoPlayer:{
        controls: true,
        loop: true,
        playlists: [{
            poster: '',
            title: 'Big Bunny',
            src: [{
                quality: 'auto',
                path: 'videos/demo.mp4'
            },{
                quality: 144,
                path: 'videos/demo_144p.mp4'
            },{
                quality: 1080,
                path: 'videos/demo_1080p.mp4'
            }]
        }]
    }
},{
    VideoPlayer:{}
});

x.include(VideoPlayer);

/**
 * There are two methods
 * apply() or attach()
 * ------------------------------------------------------
 * apply() is automatically adding the media to the page
 * attach() doesn't automatically add the media to the page 
 */

x.use(VideoPlayer).apply();

// Or use the attach method
// x.use(VideoPlayer).attach();
// new x.VideoPlayer.constructor(...x.set(VideoPlayer));



