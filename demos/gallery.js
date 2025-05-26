import { startup, Gallery } from "../../js/es6/mediaviewer.js";
startup();
new Gallery('.demo',{
    images: ['images/img1.jpg', 'images/img2.jpg', 'images/img3.jpg'],
    captions: ['Rome', 'Jaguar', 'Boat'],
    zoom: true,
    autoResize: true,
    static: false
});