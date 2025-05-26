/**
 * @package MediaViewer
 * @version 1.2.2
 * @description A javascript library to create a media viewing experience
 * @license MIT
 * @author XHiddenProjects
 * @repository [XHiddenProjects/MediaViewer](https://github.com/XHiddenProjects/MediaViewer)
 */

/**
 * File class
 */
export const File = class {
    /**
     * Creates a file object
     * @param {String} path File Path
     * @returns {File}
     */
    constructor(path){
        this.path = File.#normalizePath(path);
        return this;
    }
    /**
     * Normalizes a file path (removes duplicate slashes, resolves '.' and '..')
     * @param {String} path
     * @returns {String}
     */
    static #normalizePath(path) {
        let parts = path.split('/').filter(part => part && part !== '.');
        let stack = [];
        for (let part of parts) {
            if (part === '..') {
                stack.pop();
            } else {
                stack.push(part);
            }
        }
        return `${window.location.pathname}${stack.join('/')}`;
    }
}
/**
 * Checks for valid JSON
 * @param {String} json JSON String
 * @returns {JSON} Json object
 */
function validJSON(json){
    try{
        return JSON.parse(json);
    }catch(e){
        return null;
    }
}
/**
 * FileReader class
 */
export const FileReader = class {
    #responseHeaders;
    /**
     * Reads file from file path
     * @param {File} file File path using the FilePath object
     * @returns {FileReader}
     */
    constructor(file){
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = ()=>{
            this.responseText = xhr.responseText;
            this.response = xhr.response;
            this.responseType = xhr.responseType;
            this.responseURL = xhr.responseURL,
            this.responseXML = xhr.responseXML,
            this.responseJSON = validJSON(xhr.responseText),
            this.status = xhr.status;
            this.statusText = xhr.statusText;
            this.responseHeader = xhr.getResponseHeader("Content-type");
            this.#responseHeaders = xhr.getAllResponseHeaders();
        };
        xhr.open('GET',file.path,false);
        xhr.send();
        return this;
    }
    /**
     * Reads each individual lines
     * @param {Boolean} [sanitize=false] Sanitizes the strings 
     * @returns {String[]} Readable Lines
     */
    readLines(sanitize=false){
        return sanitize ? this.responseText.split('\n').map(i=>i.replace(/[\t\n\r]+/g,'').trim()) : this.responseText.split('\n');
    }
    /**
     * Reads full text
     * @param {Boolean} [sanitize=false] Sanitizes the strings 
     * @returns {String} Readable text
     */
    read(sanitize=false){
        return sanitize ? this.responseText.replace(/[\t\n\r]+/g,'').trim() : this.responseText;
    }
}
/**
 * FileWriter class
 */
export const FileWriter = class {
    /**
     * Writes a file to the base on the class name
     * @param {File} file Filepath
     * @param {String} content Content
     * @param {BlobPropertyBag} options Options to the file
     * @returns 
     */
    constructor(file,content,options={type: 'UTF-8'}){
        const a = document.createElement('a'),
        f = new Blob([content],options);
        a.href = URL.createObjectURL(f);
        this.url = a.href;
        a.download = FileWriter.#filename(file.path);
        a.click();
        URL.revokeObjectURL(a.href);
        return this;
    }
    /**
     * Returns the filename
     * @param {String} f Filepath
     * @returns {String} Filename
     */
    static #filename(f){
        const p = f.split('/');
        return p[p.length-1];
    }
}
/**
 * Checks if file exists
 * @param {File} file File to check 
 * @returns {Boolean} True if file exists, else False.
 */
export const FileExists = (file)=>{
    try {
        const xhr = new XMLHttpRequest();
        xhr.open('HEAD', file.path, false);
        xhr.send();
        return xhr.status === 200;
    } catch (e) {
        return false;
    }
}
/**
 * Converts size to readable size
 * @param {Number} size Size in bytes
 * @param {Number} [precision=2] Decimal placement
 * @returns {String} Human-readable size
 */
export const readableSize = (size,precision=2)=>{
    if (typeof size !== 'number' || isNaN(size)) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    let i = 0;
    while (size >= 1024 && i < units.length - 1) {
        size /= 1024;
        i++;
    }
    return `${size.toFixed(precision)} ${units[i]}`;
}

/**
 * Returns the file size
 * @param {File} file Filepath
 * @returns {Number} Size **in bytes**
 */
export const FileSize = (file)=>{
    try {
        const xhr = new XMLHttpRequest();
        xhr.open('HEAD', file.path, false);
        xhr.send();
        if (xhr.status === 200) {
            const size = xhr.getResponseHeader('Content-Length');
            return size ? parseInt(size, 10) : null;
        }
        return null;
    } catch (e) {
        return null;
    }
}