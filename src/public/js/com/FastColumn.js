
export const FastColumn = class extends Fast{
    constructor(props){
        super();  
        this.name = "FastColumn";
        this.props = props;
        this._sts = false;
        this.built = ()=>{}; 
        this.attachShadow({mode:'open'});
        this._isBuilt = false;
        this._columnTitle = "";
        this._contenteditable = false;
        this.isFoco = false;
        this.dataList = new Map();
        this._pageSize = 4;
        this._offsetPage = 0;
        this._itemPage = 0;
        this._totalPage = 1;
        this._columnName = null;
        this.actualOption = null;
    }

    #getTemplate(){ return `
            <div class="FastColumn">
                <div class="FastColumnTitle">
                </div>
                <div class="FastColumnBody">
                </div>
            </div>
        `    
    }

    async #getCss(){ 
        return await fast.getCssFile("FastColumn");
    }

    #checkAttributes(){
        return new Promise(async (resolve, reject) => {
            try {
                for(let attr of this.getAttributeNames()){          
                    if(attr.substring(0,2)!="on"){
                        this[attr] = this.getAttribute(attr);
                        this.mainElement.setAttribute(attr, this[attr]);
                    }
                    else{
                        let f = this[attr];
                        this[attr] = ()=>{ if(!this._disabled) f() };
                    }
                    switch(attr){
                        case 'id' : 
                            await fast.createInstance('FastColumn', {'id': this[attr]});
                            break;
                    }
                }
                resolve(this);        
            } catch (error) {
                reject(error);
            }
        })   
    }

    #checkProps(){
        return new Promise(async (resolve, reject) => {
            try {
                if(this.props){
                    for(let attr in this.props){
                        switch(attr){
                            case 'style' :
                                for(let attrcss in this.props.style) this.mainElement.style[attrcss] = this.props.style[attrcss];
                                break;
                            case 'events' : 
                                for(let attrevent in this.props.events){       
                                    this.mainElement.addEventListener(attrevent, (e)=>{
                                        if(!this._disabled)this.props.events[attrevent](e)})
                                }
                                break;
                            default : 
                                this.setAttribute(attr, this.props[attr]);
                                this[attr] = this.props[attr];
                                if(attr==='id'){
                                    this.id = this[attr];
                                    await fast.createInstance('FastColumn', {'id': this[attr]})
                                };
                        }
                    }
                }
                resolve(this);        
            } catch (error) {
                reject(error);
            }
        })   
    }

    #render(){
        return new Promise(async (resolve, reject) => {
            try {
                this.sheet = new CSSStyleSheet();
                let css = await this.#getCss();
                this.sheet.replaceSync(css);
                this.shadowRoot.adoptedStyleSheets = [this.sheet];
                this.template = document.createElement('template');
                this.template.innerHTML = this.#getTemplate();
                let tpc = this.template.content.cloneNode(true);  
                this.mainElement = tpc.firstChild.nextSibling;
                this.shadowRoot.appendChild(this.mainElement);
                this.titleElement = this.mainElement.firstChild.nextSibling;
                this.bodyElement = this.mainElement.firstChild.nextSibling.nextSibling.nextSibling;
                resolve(this);        
            } 
            catch (error) {
                reject(error);
            }
        })
    }

    #getLenText(data){
        let font = window.getComputedStyle(this.bodyElement,"").font;        
        return parseFloat(fast.getTextWidth(data, font));
    }

    #getDataStr(data){
        let lenText = this.#getLenText(data) 
        let lenComponent = parseFloat(this.mainElement.offsetWidth);
        let pixelCar = parseFloat(lenText/data.length);
        let totalCar = parseInt(lenComponent/pixelCar,10);
        let len = parseInt(totalCar - 7);
        return data.substring(0, len) + '...';
    }

    #reindex(){
        let idx = 0;
        let aux = new Map();
        for(let ele of this.dataList){
            ele[1].id = idx;
            ele[1].dataContainer.id = idx;
            ele[1].dataContainerInternal.id = idx;
            aux.set(idx, ele[1]);
            idx++;            
        }
        this.dataList = aux;
        aux.clear;
        return this;
    }

    #events(option){
        option.dataContainerInternal.addEventListener('keydown', (e)=>{
            e.stopPropagation();
            let d = this.getActValue();
            d['key'] = e.key;
            this.cellkeydown = new CustomEvent("cellkeydown", { detail : d });
            switch(e.key){
                case 'ArrowDown' :{
                    this.nextValue(option);
                    break;
                }
                case 'ArrowUp' :{
                    this.priorValue(option);
                    break;
                }
                case 'Enter' :{                    
                    e.target.innerText = e.target.innerText.replace(/\r?\n|\r/g, "");
                    this.dataList.get(option.id).dataContainerInternal.blur();
                    break;
                }
            }
            this.mainElement.dispatchEvent(this.cellkeydown);
        })
        option.dataContainerInternal.addEventListener('keyup', (e)=>{
            e.stopPropagation();
            let d = this.getActValue();
            d['key'] = e.key;
            this.cellkeyup = new CustomEvent("cellkeyup", { detail : d });
            this.mainElement.dispatchEvent(this.cellkeyup);
        })
        option.dataContainerInternal.addEventListener('focus', (e)=>{
            e.preventDefault();
            e.stopPropagation();            
            this.actualOption = option;
            this.cellfocus = new CustomEvent("cellfocus", { detail : this.getActValue() });
            this._offsetPage = option.id - this._itemPage*this.pagesize;
            if(this._offsetPage>=this.pagesize)this._offsetPage = 0;
            if(typeof option.element === 'string'){
                this.dataList.get(option.id).dataContainerInternal.innerText = option.element;
                this.dataList.set(option.id, option);
            }
            this.mainElement.dispatchEvent(this.cellfocus);
        }, true);
        option.dataContainerInternal.addEventListener('blur', (e)=>{
            e.preventDefault();
            e.stopPropagation();
            this.actualOption = option;
            this.cellblur = new CustomEvent("cellblur", { detail : this.getActValue() });
            if(option.dataContainerInternal.dataStr){
                option.element = e.target.innerText;
                option.dataContainerInternal.innerText = e.target.innerText;
                option.dataContainerInternal.dataStr = this.#getDataStr(e.target.innerText);        
                if(this.#getLenText(e.target.innerText) > this.mainElement.offsetWidth - 20){
                    e.target.innerText = option.dataContainerInternal.dataStr;
                }
                this.dataList.set(option.id, option);                
            }
            this.mainElement.dispatchEvent(this.cellblur);
        }, true);
        option.dataContainerInternal.addEventListener('click', (e)=>{
            e.preventDefault();
            e.stopPropagation();
            this.actualOption = option;
            this.cellclick = new CustomEvent("cellclick", { detail : this.getActValue() });
            this.mainElement.dispatchEvent(this.cellclick);
        });
        option.dataContainerInternal.addEventListener('pointerover', (e)=>{
            e.preventDefault();
            e.stopPropagation();
            this.actualOption = option;
            this.cellover = new CustomEvent("cellover", { detail : this.getActValue() });
            this.mainElement.dispatchEvent(this.cellover);
        });
        option.dataContainerInternal.addEventListener('pointerout', (e)=>{
            e.preventDefault();
            e.stopPropagation();
            this.actualOption = option;
            this.cellout = new CustomEvent("cellout", { detail : this.getActValue() });
            this.mainElement.dispatchEvent(this.cellout);
        });
        return this;
    }

    async connectedCallback(){
        await this.#render();
        await this.#checkAttributes();
        await this.#checkProps();
        this._isBuilt = true;  
        this.built();
    }

    addToBody(){document.body.appendChild(this);}

    getItemIndex(){ return this._offsetPage + this._itemPage*this._pageSize; }

    getTotalPages(){
        this._totalPage = parseInt(this.getTotalRows()/this._pageSize, 10);
        if((this.getTotalRows() % this._pageSize) > 0) {
            this._totalPage++;
            return  this._totalPage;
        }
        else return this._totalPage;
    }

    nextPage(){
        this._itemPage++;
        if(this._itemPage > this._totalPage){
            this._itemPage--;
            return false
        }
        else this._offsetPage = 0;
        return true;
    }

    priorPage(){
        this._itemPage--;
        if(this._itemPage < 0){
            this._itemPage++;
            return false;
        }
        return true;
    }

    nextIndex(){
        this._offsetPage++;
        if(this._offsetPage === this._pageSize){            
            if(this.nextPage()){ this._offsetPage=0;}
            else this._offsetPage--;
        }
        return this;
    }

    priorIndex(){
        this._offsetPage--;
        if(this._offsetPage < 0){
            if(this.priorPage()){ this._offsetPage = this.pagesize - 1;}
            else this._offsetPage = 0;
        }
        return this;
    }

    showPage(){
        this.getTotalPages();
        this.bodyElement.innerHTML="";
        for(let i=0; i<this.pagesize; i++){
            this._offsetPage = i;
            let idx = this.getItemIndex();    
                                
            if(idx < this.getTotalRows()){
                let option = this.dataList.get(idx);
                option.dataContainer.appendChild(option.dataContainerInternal);
                option.dataContainer.className = "FastColumnCell";
                option.dataContainerInternal.className = "FastColumnCellInternal";
                option.dataContainerInternal.id = option.id;
                option.dataContainerInternal.columnName = this.columnname;
                option.dataContainerInternal.contentEditable = this.contenteditable;
                option.dataContainerInternal.spellcheck=false;
                option.dataContainerInternal.style.width = this.mainElement.offsetWidth;
                if(typeof option.element==='string') {
                    option.dataContainerInternal.dataStr = option.element;
                    if(this.#getLenText(option.element) > this.mainElement.offsetWidth - 20){
                        option.dataContainerInternal.dataStr = this.#getDataStr(option.element);
                        option.dataContainerInternal.innerText = option.dataContainerInternal.dataStr;    
                    }
                    else option.dataContainerInternal.innerText = option.element; 
                }
                this.bodyElement.appendChild(option.dataContainer);
            }
        };        
        return this;
    }

    nextValue(){
        if(this.dataList.has(this.actualOption.id + 1)){
            let op = this.dataList.get(this.actualOption.id + 1);
            op.dataContainerInternal.focus();
            if((op.id === (this.pagesize + this._itemPage*this.pagesize))){
                this.nextPage();                            
                this.showPage();
                op.dataContainerInternal.focus();                            
            }
        }
    }

    priorValue(){
        if(this.dataList.has(this.actualOption.id - 1)){
            let op = this.dataList.get(this.actualOption.id - 1);
            op.dataContainerInternal.focus();
            if((op.id + 1 === this._itemPage*this.pagesize)){
                this.priorPage();
                this.showPage();
                op.dataContainerInternal.focus();                            
            }
        }
    }

    getActValue(){
        if(this.actualOption){
            if(this.actualOption.element){
                return {
                    'pos'   : this.actualOption.id,
                    'col'   : this._columnName,
                    'value' : this.actualOption.element,
                    'row'   :  this.actualOption.id - this._itemPage*this.pagesize,
                }
            }
            else{ return null}
        }
        else{ return null}
    }

    getColumnData(){
        if(this.getTotalRows() > 0){
            let arr = [];
            for(let data of this.dataList){ arr.push(data[1].element) }
            return arr;
        }
        else { return null }
    }

    getTotalRows(){ return this.dataList.size; }

    addData(element){
        let option = {
            'id' : this.getTotalRows(),
            'element' : element, 
            'dataContainer' : document.createElement('div'),
            'dataContainerInternal' : document.createElement('div'),
        }
        this.actualOption = option;
        option.dataContainerInternal.id = option.id;
        option.dataContainer.id = option.id;
        option.dataContainer.appendChild(option.dataContainerInternal);
        this.dataList.set(option.id, option);
        this.#events(option);
        return this;
    }

    clearData(){
        this.dataList.clear();
        this.bodyElement.innerHTML="";
        return this;
    }

    setValue(val, row){
        if(this.dataList.has(row)){
            let v = this.dataList.get(row);
            v.element = val;
            this.showPage();
        }
        return this;
    }

    deleteRow(row){
        if(this.dataList.has(row)){ 
            this.dataList.delete(row);
            this.#reindex();
            this.showPage();
        }
        return this;
    }

    
    getCellContainer(row){ if(this.dataList.has(row)) { return this.dataList.get(row).dataContainer; } }
    getCellInternalContainer(row){ if(this.dataList.has(row)) { return this.dataList.get(row).dataContainerInternal; } }
    getValue(pos){ if(this.dataList.has(pos)){ return this.dataList.get(pos).element; } else return null; }

    get columntitle(){return this._columnTitle}
    set columntitle(val){
        this._columnTitle = val;
        if(typeof val ==='string') this.titleElement.innerText = this._columnTitle;
        else{ this.titleElement.appendChild(val); }
    }
    get contenteditable(){ return this._contenteditable; }
    set contenteditable(val){ this._contenteditable = fast.parseBoolean(val) }
    get data(){return this._data}
    set data (val){
        for(let i=0; i<val.length; i++) this.addData(val[i]);
    }
    get pagesize(){return this._pageSize};
    set pagesize(val){ this._pageSize = val};
    get columnname(){return this._columnName};
    set columnname(val){this._columnName = val};
}

if (!customElements.get ('fast-column')) {
    customElements.define ('fast-column', FastColumn);
}
