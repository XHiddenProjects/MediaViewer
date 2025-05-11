import { startup, Gallery } from "../js/mediaviewer.js";
startup();
new Gallery('.gallery',{
    images: ['images/img1.jpg', 'images/img2.jpg', 'images/img3.jpg'],
    captions: ['Rome', 'Jaguar', 'Boat'],
    zoom: true,
    autoResize: true,
    static: false
});