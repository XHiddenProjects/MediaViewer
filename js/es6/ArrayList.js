export const ArrayList = class{
    #arr;
    /**
     * Creates an ArrayList
     * @returns {ArrayList}
     */
    constructor(){
        this.#arr = [];
        return this;
    }
    /**
     * Inserts item off the list
     * @param {*} v Value
     * @param {Number} [i=null] Index
     * @returns {ArrayList} Updated list
     */
    add(v,i=null){
        if(i!==null){
            if(i<0) throw new RangeError('Index cannot be < 0');
            
            for(let x=0;x<this.#arr.length;x++){
                
                if(x==i) {
                    
                    const j = this.#arr.splice(x);
                    this.#arr[x] = v;
                    this.#arr.push(...j);
                }
                else this.#arr[x] = this.#arr[x];
            }
        }else
            this.#arr[this.#arr.length] = v;
        return this;
    }
    addAll(...v){
        v.forEach(item => {
            if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
                if ('index' in item && 'value' in item && typeof item.index === 'number') {
                    this.add(item.value, item.index);
                } else if ('value' in item) {
                    this.add(item.value);
                }
            } else this.add(item);
        });
        return this;
    }
    /**
     * Pops an index
     * @param {Number} [i=-1] Index to remove. **null**=last index
     * @returns {ArrayList}
     */
    remove(i=this.#arr.length-1){
        if (i >= 0 && i < this.#arr.length) {
            this.#arr.splice(i, 1);
        }
        return this;
    }
    /**
     * Removes all items in the list
     * @returns {ArrayList} ArrayList
     */
    removeAll(){
        this.#arr = [];
        return this;
    }
    /**
     * Removes certain index based on condition
     * @param {Function} c Condition to remove
     * @returns {ArrayList} ArrayList
     */
    removeIf(c){
        if(typeof c === "function")
            this.#arr = this.#arr.filter((item, idx, arr) => !c(item, idx, arr));
        return this.#arr;
    }
    /**
     * Array size
     * @returns {Number} ArrayList size
     */
    size(){
        return this.#arr.length;
    }
    /**
     * Returns the array list
     * @returns {Array<*>} ArrayList
     */
    toArray(){
        return this.#arr;
    }
    /**
     * Clears out the array list
     * @returns {ArrayList}
     */
    clear(){
        this.#arr = [];
        return this;
    }
    /**
     * Returns value from index position
     * @param {Number} i Index
     */
    get(i){
        return this.#arr[i]??null;
    }
    /**
     * Sets an index with updated value
     * @param {*} v Value 
     * @param {Number} [i=0] Index
     * @returns 
     */
    set(v,i=0){
        this.#arr[i] = v;
        return this;
    }
    /**
     * Checks if the array list is empty
     * @returns {Boolean} True if it is, else False
     */
    isEmpty(){
        return this.#arr.length==0;
    }
    /**
     * Returns the index of the first occurrence of a value in an array, or -1 if it is not present.
     * @param {*} v Element to search
     * @param {number} [f=0] From index position
     * @returns {Number} Index where the element is located at 
     */
    indexOf(v,f=0){
        return this.#arr.indexOf(v,f);
    }
    /**
     * Returns the index of the last occurrence of a specified value in an array, or -1 if it is not present.
     * @param {*} v Element to search
     * @param {number} [f=0] From index position
     * @returns {Number} Last index
     */
    lastIndexOf(v,f=this.#arr.length-1){
        return this.#arr.lastIndexOf(v,f);
    }
    /**
     * Replaces all the values in the list
     * @param {Function} c Replace function
     * @returns {ArrayList} updated list
     */
    replaceAll(c){
        if(typeof c === 'function')
            this.#arr = this.#arr.map((v,i,a)=>c(v,i,a));
        return this.#arr;
    }
    /**
     * Removes all elements from the list that are not in the specified collection.
     * @param {ArrayList} list ArrayList
     * @returns {ArrayList} updated list
     */
    retainAll(list){
        if (list && typeof list.toArray === 'function') {
            const values = list.toArray();
            this.#arr = this.#arr.filter(item => values.includes(item));
        }
        return this;
    }

    sort(c=(a,b)=>a-b){
        if(typeof c === 'function')
            this.#arr.sort((a,b)=>c(a,b));
        return this;
    }
    /**
     *  Reduce the capacity of an ArrayList to match its current size.
     *  In JavaScript, arrays are dynamic, but we can force the internal array to its current length.
     */
    trimToSize(){
        this.#arr = this.#arr.slice(0, this.#arr.length);
        return this;
    }
    /**
     * Return each index
     * @param {Function} f Function
     */
    forEach(f){
        if(typeof f === 'function') 
            for (let i = 0; i < this.#arr.length; i++) f(this.#arr[i], i, this.#arr);
        return this;
    }
    /**
     * Clones the objects here
     * @returns {ArrayList}
    /**
     * Clones the objects here
     * @returns {ArrayList}
     */
    clone(){
        const cloned = new ArrayList();
        cloned.addAll(...JSON.parse(JSON.stringify(this.#arr)));
        return cloned;
    }
}
