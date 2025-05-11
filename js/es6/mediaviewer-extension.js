/**
 * @package MediaViewer
 * @version 1.0.0
 * @description A javascript library to create a media viewing experience
 * @license MIT
 * @author XHiddenProjects
 * @repository [XHiddenProjects/MediaViewer](https://github.com/XHiddenProjects/MediaViewer)
 */

/**
 * Creates a configuration class
 */
export class Config{
    constructor(){
        this.config = {};
    }
    /**
     * Gets the instance of the class
     * @returns {Config}
     */
    getInstance(){
        return this;
    }
    /**
     * Sets the value of the key
     * @param {String} key Key
     * @param {*} value Value to set
     * @returns {Config}
     */
    set(key, value) {
        this.config[key] = value;
        return this;
    }
    /**
     * Adds the value to the key
     * @param {String} key Key
     * @param {*} value Value to add
     * @returns {Config}
     */
    add(key, value) {
        if (Array.isArray(this.config[key])) {
            this.config[key].push(value);
        } else {
            this.config[key] = [value];
        }
        return this;
    }
    /**
     * Removes the key from the configuration
     * @param {String} key Key to remove
     */
    remove(key) {
        delete this.config[key];
        return this;
    }
    /**
     * Converts JSON object to style list
     * @param {Object|Array} json JSON object or array to parse
     */
    parse(json){
        if (Array.isArray(json)) {
            json.forEach(item => {
                if (typeof item === 'object' && item !== null) {
                    Object.keys(item).forEach(key => {
                        if (!this.config[key]) this.config[key] = {};
                        Object.assign(this.config[key], item[key]);
                    });
                } else {
                    console.warn('Invalid item in array:', item);
                }
            });
        } else if (typeof json === 'object' && json !== null) {
            Object.keys(json).forEach(key => {
                if (typeof json[key] === 'object' && json[key] !== null) {
                    if (!this.config[key]) this.config[key] = {};
                    Object.assign(this.config[key], json[key]);
                } else {
                    this.config[key] = json[key];
                }
            });
        } else {
            console.error('Invalid JSON input for config:', json);
        }
        return this;
    }
}
export class Styles{
    /**
     * Creates a style objects
     */
    constructor(){
        this.styles = {};
    }
    /**
     * Returns the instance of the class
     * @returns {Styles} Class Object
     */
    getInstance(){
        return this;
    }
    /**
     * Add css variable to the style
     * @param {String} CSSVar CSS Variable reference
     * @param {*} value Value
     * @returns {Styles}
     */
    addStyle(CSSVar, value){
        this.styles[`--${CSSVar}`] = value;
        return this;
    }
    /**
     * Removes style from list
     * @param {String} CSSVar CSS Variable reference 
     * @returns {Styles}
     */
    removeStyle(CSSVar){
        delete this.styles[CSSVar];
        return this;
    }
    /**
     * Converts JSON object to style list
     * @param {Object|Array} json JSON object or array to parse
     */
    parse(json){
        const processStyles = (obj) => {
            Object.keys(obj).forEach(key => {
                const value = obj[key];
                if (typeof value === 'object' && value !== null) {
                    this.styles[key] = { ...this.styles[key], ...value };
                } else {
                    this.styles[key] = value;
                }
            });
        };

        if (Array.isArray(json)) {
            json.forEach(item => {
                if (typeof item === 'object' && item !== null) {
                    processStyles(item);
                } else {
                    console.warn('Invalid item in array:', item);
                }
            });
        } else if (typeof json === 'object' && json !== null) {
            processStyles(json);
        } else {
            console.error('Invalid JSON input for styles:', json);
        }
        return this;
    }
}
export class Extension{
    #autoIncrement;
    #setIncrement;
    /**
     * Creates an extension methods
     * @param {String|String[]|{Media: String}} container Elements
     * @param {Config} config Configurations
     * @param {Styles} styles Styling
     */
    constructor(container, config, styles) {
        this.#autoIncrement = 0;
        this.#setIncrement = 0;
        if (typeof container === 'string') {
            if (!document.querySelector(container)) {
                console.error(`Element: ${container} not found`);
            } else {
                this.container = container;
            }
        } else if (Array.isArray(container)) {
            this.container = container.map((selector, index) => {
                const element = selector;
                if (!element) {
                    console.error(`Element at index ${index} with selector: ${selector} not found`);
                }
                return element;
            }).filter(Boolean);
        } else if (typeof container === 'object' && container !== null) {
            this.container = {};
            Object.keys(container).forEach((key) => {
                const selector = container[key];
                const element = selector;
                if (!element) {
                    console.error(`Element for key "${key}" with selector: ${selector} not found`);
                } else {
                    this.container[key] = element;
                }
            });
        } else {
            console.error('Invalid container type. Expected a string, array, or object:', container);
        }

        if (this.isInstanceof(this.getInstance(config), Config)) {
            this.config = config;
        } else {
            console.error(`Parameter 1 must be a %cConfig%c class`, 'font-style: italic;', 'font-style: normal;');
        }

        if (this.isInstanceof(this.getInstance(styles), Styles)) {
            this.styles = styles;
        } else {
            console.error(`Parameter 2 must be a %cStyles%c class`, 'font-style: italic;', 'font-style: normal;');
        }
    }
    /**
     * Get the instanceof 2 classes
     * @param {Object} classTarget Class target. If 1 parameter this will be your target class of what the current class is in.
     * @param {Object} classObj [Optional] - Class Object to compare
     * @returns {Boolean} True if the classes match, else false
     */
    isInstanceof(classTarget, classObj){
        if(arguments.length==1)
            return this instanceof classTarget;
        else
            return classTarget instanceof classObj;
    }
    /**
     * Returns the class object instance
     * @param {Object} obj Class object, leave empty to use current class 
     * @returns {Object} Returns the instance of the class
     */
    getInstance(obj){
        return obj ? obj.getInstance() : this;
    }
    /**
     * Use multiple medias for your extension
     * @param  {...Class} medias Medias to use
     * @returns 
     */
    include(...medias){
        this.medias = [];
        const processMedia = (media) => {
            if (typeof media === 'function') {
                return this.getInstance(new media(false));
            } else if (typeof media === 'object' && media !== null) {
                return this.getInstance(media);
            } else {
                console.error('Invalid media type. Expected a class or an object:', media);
                return null;
            }
        };

        if (Array.isArray(medias)) {
            this.medias = medias.map(processMedia).filter(item => item !== null);
        } else {
            const media = processMedia(medias);
            if (media) this.medias.push(media);
        }
    }
    /**
     * Use a certain media from the included list
     * @param {Media} media Media to select
     * @returns {Class} Class object to use
     */
    use(media){
        return {
            /**
             * Applies media to the page
             * @returns {Class} Executes the used media
             */
            apply: () => {
                
                const mediaInstance = this.medias.find((m) => this.isInstanceof(this.getInstance(m), media)).constructor;
                const mediaName = mediaInstance.name;
                let container;
                if (Array.isArray(this.container)) container = this.container[this.#setIncrement++];
                else if (typeof this.container === 'object') container = this.container[mediaName];
                else container = this.container;

                if (!container) {
                    console.error(`Container not found for media: ${mediaInstance.constructor.name}`);
                    return null;
                }
                
                return new mediaInstance(
                    container,
                    this.config.config[mediaName] ?? {},
                    this.styles.styles[mediaName] ?? {},
                    true
                );
            },
            /**
             * Attaches the methods to the current extension
             * @extends Extension.medias
             * @returns {Class}  
             */
            attach: () => {
                const mediaInstance = this.medias.find((m) => m.constructor === media || this.isInstanceof(this.getInstance(m), media));
                if (mediaInstance) {
                    const mediaName = mediaInstance.constructor.name;
                    let container;
                
                    if (Array.isArray(this.container)) {
                        container = this.container[this.#setIncrement++];
                    } else if (typeof this.container === 'object') {
                        container = this.container[mediaName];
                    } else {
                        container = this.container;
                    }
                    const instance = new mediaInstance.constructor(
                        container,
                        this.config.config[mediaName] ?? {},
                        this.styles.styles[mediaName] ?? {},
                        false
                    );

                    this[mediaName] = this[mediaName] || {};
                    Object.getOwnPropertyNames(mediaInstance.constructor.prototype).forEach((method) => {
                        if (method === 'constructor' && typeof mediaInstance.constructor.prototype[method] === 'function') {
                            this[mediaName][method] = mediaInstance.constructor.prototype[method].bind(instance);
                        }
                    });

                    return instance.constructor;
                } else {
                    console.error('The selected media is invalid or not found:', mediaInstance);
                    return null;
                }
            }
        }
    }
    /**
     * Set attributes to parameter
     * @returns {Array<Extension.container, Extension.config, Extension.styles, true>} Returns parameters for constructors
     */
    set(x){
        let container;
        if (Array.isArray(this.container)) {
            container = this.container[this.#autoIncrement++];
        } else if (typeof this.container === 'object') {
            container = this.container[x.name];
        } else {
            container = this.container;
        }
        return [container, this.config.config[x.name] ?? {}, this.styles.styles[x.name] ?? {}, true];
    }
}

