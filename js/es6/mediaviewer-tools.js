/**
 * @package MediaViewer
 * @version 1.0.0
 * @description A javascript library to create a media viewing experience
 * @license MIT
 * @author XHiddenProjects
 * @repository [XHiddenProjects/MediaViewer](https://github.com/XHiddenProjects/MediaViewer)
 */

/**
  * Generate captions text
  * @param {'vtt'|'srt'|'sbv'} type Caption type
  * @param {[{start: {hrs: number, min: number, sec: number, ms: number}, end: {hrs: number, min: number, sec: number, ms: number}, text: string|string[]}]} config Configurations
  */
export const captions = (type, config)=>{
        type = type??'vtt';
        const lead = (num)=>{
            if(num<10) return `0${num}`;
            else return num;
        };
        const isMs = (ms)=>{
            ms = ms.toString();
            if(ms.length>3) return ms.substring(3,-1);
            else if(ms.length<3) return ms.padStart(3, '0');
            else return ms;
        }
        const compareTimeStamp = (sh, sm, ss, sms, eh, em, es, ems)=>{
            if(sh>eh) return false;
            else if(sm>em) return false;
            else if(ss>es) return false;
            else if(sms>ems) return false;
            else return true;
        }
        let vtt = ``;
        if(type.toLocaleLowerCase()==='vtt'){
            vtt = `WEBVTT`;
            config.map((v,i)=>{
                if(v['start']&&v['end']){
                    if(!compareTimeStamp(
                        v['start']['hrs']??0,
                        v['start']['min'],
                        v['start']['sec'],
                        v['start']['ms'],
                        v['end']['hrs']??0,
                        v['end']['min'],
                        v['end']['sec'],
                        v['end']['ms']
                    )){
                        console.error(`The start time cannot be greater than the end time`);
                        vtt+=`
                        
    --Error: ${v['start']['hrs'] ? `${lead(v['start']['hrs'])}:` : ''}${lead(v['start']['min'])}:${lead(v['start']['sec'])}.${isMs(v['start']['ms'])} --> ${v['end']['hrs'] ? `${lead(v['end']['hrs'])}:` : ''}${lead(v['end']['min'])}:${lead(v['end']['sec'])}.${isMs(v['end']['ms'])}`;
                    }else{
                        vtt+=`\n\n${v['start']['hrs'] ? `${lead(v['start']['hrs'])}:` : ''}${lead(v['start']['min'])}:${lead(v['start']['sec'])}.${isMs(v['start']['ms'])} --> ${v['end']['hrs'] ? `${lead(v['end']['hrs'])}:` : ''}${lead(v['end']['min'])}:${lead(v['end']['sec'])}.${isMs(v['end']['ms'])}\n${v['text'] ? (Array.isArray(v['text']) ? `${v['text'].join('\n')}` : `${v['text']}`) : ''}`;
                    }
                }else{
                    console.error(`Missing start and end object`);
                    vtt = '';
                }
            });
        }else if(type.toLocaleLowerCase()==='srt'){
            config.map((v,i)=>{
                if(v['start']&&v['end']){
                    if(!compareTimeStamp(
                        v['start']['hrs']??0,
                        v['start']['min'],
                        v['start']['sec'],
                        v['start']['ms'],
                        v['end']['hrs']??0,
                        v['end']['min'],
                        v['end']['sec'],
                        v['end']['ms']
                    )){
                        console.error(`The start time cannot be greater than the end time`);
                        vtt+=`
                        
    --Error: ${v['start']['hrs'] ? `${lead(v['start']['hrs'])}:` : ''}${lead(v['start']['min'])}:${lead(v['start']['sec'])}.${isMs(v['start']['ms'])} --> ${v['end']['hrs'] ? `${lead(v['end']['hrs'])}:` : ''}${lead(v['end']['min'])}:${lead(v['end']['sec'])}.${isMs(v['end']['ms'])}`;
                    }else{
                        vtt+=`\n\n${i+1}\n${v['start']['hrs'] ? `${lead(v['start']['hrs'])}:` : `${lead(0)}:`}${lead(v['start']['min'])}:${lead(v['start']['sec'])},${isMs(v['start']['ms'])} --> ${v['end']['hrs'] ? `${lead(v['end']['hrs'])}:` : `${lead(0)}:`}${lead(v['end']['min'])}:${lead(v['end']['sec'])},${isMs(v['end']['ms'])}\n${v['text'] ? (Array.isArray(v['text']) ? `${v['text'].join('\n')}` : `${v['text']}`) : ''}`;
                    }
                }else{
                    console.error(`Missing start and end object`);
                    vtt = '';
                }
            });
            vtt = vtt.replace(/^\n\n/,'');
        }else if(type.toLocaleLowerCase()==='sbv'){
            config.map((v,i)=>{
                if(v['start']&&v['end']){
                    if(!compareTimeStamp(
                        v['start']['hrs']??0,
                        v['start']['min'],
                        v['start']['sec'],
                        v['start']['ms'],
                        v['end']['hrs']??0,
                        v['end']['min'],
                        v['end']['sec'],
                        v['end']['ms']
                    )){
                        console.error(`The start time cannot be greater than the end time`);
                        vtt+=`
                        
    --Error: ${v['start']['hrs'] ? `${lead(v['start']['hrs'])}:` : ''}${lead(v['start']['min'])}:${lead(v['start']['sec'])}.${isMs(v['start']['ms'])} --> ${v['end']['hrs'] ? `${lead(v['end']['hrs'])}:` : ''}${lead(v['end']['min'])}:${lead(v['end']['sec'])}.${isMs(v['end']['ms'])}`;
                    }else{
                        vtt+=`\n\n${v['start']['hrs'] ? `${lead(v['start']['hrs'])}:` : ``}${lead(v['start']['min'])}:${lead(v['start']['sec'])}.${isMs(v['start']['ms'])},${v['end']['hrs'] ? `${lead(v['end']['hrs'])}:` : ``}${lead(v['end']['min'])}:${lead(v['end']['sec'])}.${isMs(v['end']['ms'])}\n${v['text'] ? (Array.isArray(v['text']) ? `${v['text'].join('\n')}` : `${v['text']}`) : ''}`;
                    }
                }else{
                    console.error(`Missing start and end object`);
                    vtt = '';
                }
            });
            vtt = vtt.replace(/^\n\n/,'');
        }
        
        return vtt;
};
/**
 * Clipboard tool
 */
export const clipboard = {
    /**
     * Copy to clipboard
     * @param {String} txt Text to insert
     * @returns {Boolean}
     */
    copy: (txt) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(txt).then(() => {
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                return false;
            });
            return true;
        } else return false;
    },
    /**
     * Paste from clipboard
     * @param {Element} elem Element to paste the text
     * @returns {Boolean}
     */
    paste: (elem) => {
        if (navigator.clipboard && navigator.clipboard.readText) {
            navigator.clipboard.readText().then(text => {
                if (elem && 'value' in elem) {
                    elem.value = text;
                    return true;
                } else if (elem && 'innerText' in elem) {
                    elem.innerText = text;
                    return true;
                } else {
                    console.error('Provided element does not support text insertion');
                    return false;
                }
            }).catch(err => {
                console.error('Failed to paste text: ', err);
                return false;
            });
        } else {
            console.error('Clipboard API not supported');
            return false;
        }
    },
    /**
     * Paste from clipboard, sanitizes HTML elements
     * @param {Element} elem Element to paste
     * @returns {Boolean}
     */
    pasteRaw: (elem) => {
        if (navigator.clipboard && navigator.clipboard.readText) {
            navigator.clipboard.readText().then(text => {
                if (elem && 'textContent' in elem) {
                    elem.textContent = text;
                    return true;
                } else {
                    console.error('Provided element does not support raw text insertion');
                    return false;
                }
            }).catch(err => {
                console.error('Failed to paste raw text: ', err);
                return false;
            });
        } else {
            console.error('Clipboard API not supported');
            return false;
        }
    }
};
/**
 * Customize styles
 * @param {{property: string, values: any|any[]}} properties CSS property for the class
 * @returns {Object} Object with the styles
 */
export const customize = (properties = {}) => {
    const obj = {};
    if (properties && typeof properties === 'object') {
        for (const [key, value] of Object.entries(properties)) {
            if (Array.isArray(value)) {
                obj[key] = value.join(';');
            } else {
                obj[key] = value;
            }
        }
    } else return {}
    return obj;
};

/**
 * Calculate the contrast ratio between two colors
 * @param {[{color: string, bg: string, alpha: number}]} hexList Hex color code for the text/bg color (e.g., "#FFFFFF")
 * @returns {number} Contrast ratio
 */
export const contrastRatio = (hexList=[{}]) => {
    const order = {};
    const colorToHex = (color) => {
        const ctx = document.createElement('canvas').getContext('2d');
        ctx.fillStyle = color;
        return ctx.fillStyle.toUpperCase();
    };
    const rgbToHex = (rgb) => {
        const result = rgb.match(/\d+/g).map(num => parseInt(num).toString(16).padStart(2, '0'));
        return `#${result.join('').toUpperCase()}`;
    };
    const hexToLuminance = (color) => {
        if (!color || color === undefined) return 1; // Default luminance for #FF0000
        if (!/^#([0-9A-Fa-f]{6})$/.test(color)) {
            if (/^rgb\(/i.test(color)) {
                color = rgbToHex(color);
            } else {
                color = colorToHex(color);
            }
        }
        const rgb = color.replace('#', '').match(/.{2}/g).map(c => parseInt(c, 16) / 255);
        return rgb.map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
                  .reduce((lum, c, i) => lum + c * [0.2126, 0.7152, 0.0722][i], 0);
    };
    hexList.forEach(({ color, bg }) => {
        const luminance1 = hexToLuminance(color);
        const luminance2 = hexToLuminance(bg);
        const brightest = Math.max(luminance1, luminance2);
        const darkest = Math.min(luminance1, luminance2);
        const ratio = (brightest + 0.05) / (darkest + 0.05);
        order[ratio] = color;
    });

    const highestRatio = Math.max(...Object.keys(order).map(Number));
    return order[highestRatio] || '#FF0000'; // Return #FF0000 if no valid color is found
};
/**
 * Returns the properties of a class
 * @param {Object} cls Class object
 * @param {String} [path=''] Extra paths targeted in the container
 * @param {String} [output=''] Type to return
 * @returns 
 */
export const getProperties = (cls, path='', output='')=>{
    const obj = {};
    const styles = window.getComputedStyle(path ? cls.container.querySelector(path) : cls.container);
    for (const property of styles) {
        obj[property] = styles.getPropertyValue(property);
    }
    return output ? obj[output] : obj;
}

export const color = {
    /**
     * Color name to hex
     * @param {String} color Color name
     * @returns {String} hex color code
     */
    name2hex: (color) => {
        const ctx = document.createElement('canvas').getContext('2d');
        ctx.fillStyle = color;
        return ctx.fillStyle.toUpperCase();
    },
    /**
     * RGB to Hex
     * @param {string} rgb RGB color code (e.g., "rgb(255, 0, 0)")
     * @returns {string} hex color code
     */
    rgb2hex: (rgb) => {
        const result = rgb.match(/\d+/g).map(num => parseInt(num).toString(16).padStart(2, '0'));
        return `#${result.join('').toUpperCase()}`;
    },
    /**
     * Hex to RGB
     * @param {String} hex Hex color code (e.g., "#FF0000")
     * @returns {string} RGB color code
     */
    hex2rgb: (hex) => {
        if (!/^#([0-9A-Fa-f]{6})$/.test(hex)) {
            hex = color.colorToHex(hex);
        }
        const rgb = hex.replace('#', '').match(/.{2}/g).map(c => parseInt(c, 16));
        return `rgb(${rgb.join(',')})`;
    },
    /**
     * Color name to RGB
     * @param {String} color Color name
     * @returns {String} RGB color code
     */
    name2rgb: (color) => {
        const ctx = document.createElement('canvas').getContext('2d');
        ctx.fillStyle = color;
        const hex = ctx.fillStyle;
        const rgb = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i).slice(1).map(val => parseInt(val, 16));
        return `rgb(${rgb.join(',')})`;
    },
    /**
     * Parse RGB string to object
     * @param {String} rgb RGB color code (e.g., "rgb(255, 0, 0)")
     * @returns {Object} r, g, b properties
     */
    parseRGB: (rgb)=>{
        const result = rgb.match(/\d+/g);
        if (result) {
            return {
                r: parseInt(result[0]),
                g: parseInt(result[1]),
                b: parseInt(result[2])
            };
        } else {
            return null;
        }
    }
}

export const videoData = (videoUrl, timeInSeconds, callback) => {
    // Create a video element dynamically
    const video = document.createElement('video');
    video.src = videoUrl;
    video.currentTime = timeInSeconds;
    video.crossOrigin = 'anonymous'; // Handle CORS if required

    // Load the video metadata to get dimensions
    video.addEventListener('loadedmetadata', function() {
        // Set up the canvas
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Listen for when the video is ready to be drawn
        video.addEventListener('seeked', function() {
            // Draw the current frame to the canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Get the image data URL
            const imageUrl = canvas.toDataURL('image/png');

            // Call the callback with the image URL
            callback({poster: imageUrl, duration: video.duration});

            // Clean up - remove the video element
            video.remove();
            canvas.remove();
        });

        // Start playing the video briefly to trigger the seeked event
        //video.play();
    });

    // Load the video (this also begins the loading process)
    video.load();
};
/**
 * Generates a id based on file name
 * @param {String} filename Filename
 * @returns {String} file ID
 */
export async function genID(filename){
    // Helper function to encode the hash to a shortened base64
    const shortenBase64 = (base64) => {
        return base64.replace(/\+/g, '-').replace(/\//g, '_').substring(0, 10);
    };

    // Create a buffer from the filename
    const encoder = new TextEncoder();
    const data = encoder.encode(filename);

    // Hash the data
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // Convert the hash to an array of bytes
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    
    // Convert bytes to Base64
    const base64String = btoa(String.fromCharCode(...hashArray));

    // Shorten and replace Base64 characters to make it URL safe
    const uniqueId = shortenBase64(base64String);

    return uniqueId;
}
/**
 * Get filename
 * @param {String} file Filepath/name
 * @param {Boolean} [include_ext=false] include extension 
 * @returns {String} filename with(out) extension
 */
export const fileName = (file, include_ext=false)=>{
    if(include_ext) return file.match(/([^\/]+)(?=\.\w+$)/)[1].replace(/_\d+p$/, '');
    else return file.match(/([^\/]+)\.(\w+)$/)[1].replace(/_\d+p$/, '');
}
export const resizeEmbed = ()=>{
    window.parent.document.querySelectorAll('iframe').forEach(f=>{
        if(f.hasAttribute('width')||f.hasAttribute('height')){
            f.style.width = `${f.width}px`;
            f.style.height = `${f.height}px`;
            f.style.maxWidth = `${f.width}px`;
            f.onload = () => {
                setTimeout(()=>{
                    const videoTitle = f.contentDocument?.querySelector('.video-title');
                    if (videoTitle) {
                        videoTitle.style.width = `${f.contentDocument?.querySelector('.video-frame').clientWidth-10}px`;
                    } else {
                        console.log('Video title not found');
                    }
                },500);
            };
        }
    });
};
/**
 * Generates QRCode
 * @param {HTMLDivElement} element Element to render QRCode
 * @param {Object} options Options to the QRcode
 * @requires {@link https://github.com/ushelp/EasyQRCodeJS | ushelp/EasyQRCodeJS} Requires EasyQRCodeJS
 * @returns {void}
 */
export const GenerateQRCode = (element,options)=>{
    setTimeout(()=>{
        if(window.QRCode){
            new QRCode(element,options);
        }
    },500);
}
/**
 * Finalizes and sanitizes the URL in the browser.
 */
export const finalizeURL = () => {
    window.addEventListener('load',()=>{
        setTimeout(()=>{
            let currentURL = new URL(window.location.href);
            const requiredPattern = new RegExp(`${window.location.origin}${window.location.pathname}\\?.*`);
            if (!requiredPattern.test(currentURL.href)) {
                currentURL = new URL(window.location.href);
                if(currentURL.href.match(/\/(\?|\&).+/)){
                    const searchParams = currentURL.href.match(/\/(\?|\&).+/)[0].trim().replace(/^\//,'');
                    if (searchParams.startsWith('&')) currentURL.search = '?' + searchParams.slice(1);
                    const params = new URLSearchParams(currentURL.search);
                    params.set('a', params.get('a'));
                    params.set('v', params.get('v'));
                    const allParams = {};
                    for (const [key, value] of params.entries()) {
                        allParams[key] = value;
                    }
                    const paramsString = Object.entries(allParams)
                        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                        .join('&');
                    const correctedURL = `${currentURL.origin}${currentURL.pathname.replace(/\/&.*/,'')}?${paramsString}`;
                    history.pushState(null, '', correctedURL);
                    window.location.reload();
                }
            }
        },200);
    });
};
