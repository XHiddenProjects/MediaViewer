import { startup, Carousel} from "../js/es6/mediaviewer.js";
startup();
new Carousel('.demo',{
    slides: ['images/img1.jpg', 'images/img2.jpg','images/img3.jpg'],
    controls: true,
    transition: 'fade',
    indicator: true,
    speed: 5,
    interval: 3000,
    autoplay: true,
    loop: true
});
