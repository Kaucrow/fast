import { FastIcon } from "./FastIcon.js";
export const FastNavigator = class extends Fast{
    constructor(props){
        super();  
        this.name = "FastNavigator";
        this.props = props;
        this._sts = false;
        this.built = ()=>{}; 
        this.attachShadow({mode:'open'});
        this._isBuilt = false;
        this._itemPage = 0;
        this._totalPage = 0;
     }

    #getTemplate(){ return `
            <div class='FastNavigator'>
                <div class = "FastNavContainerElement">
                    <fast-icon id = "FastNavIconFirst" iconname="arrowFirst" class= "FastNavContainerIcon"></fast-icon>
                </div>
                <div class = "FastNavContainerElement">
                    <fast-icon id = "FastNavIconLeft" iconname="arrowLeft" class= "FastNavContainerIcon"></fast-icon>
                </div>
                <div class = "FastNavContainerElement">
                    <input type="text" class="FastNavInput" value="0/0">
                </div>
                <div class = "FastNavContainerElement">
                    <fast-icon id = "FastNavIconRight" iconname="arrowRight" class= "FastNavContainerIcon"></fast-icon>
                </div>
                <div class = "FastNavContainerElement">
                    <fast-icon id = "FastNavIconLast" iconname="arrowLast" class= "FastNavContainerIcon"></fast-icon>
                </div>
            </div>
        `
    }

    async #getCss(){ 
        return await fast.getCssFile("FastNavigator");
    }

    #render(){
        return new Promise(async (resolve, reject) => {
            try {
                let sheet = new CSSStyleSheet();
                let css = await this.#getCss();
                sheet.replaceSync(css);
                this.shadowRoot.adoptedStyleSheets = [sheet];
                this.template = document.createElement('template');
                this.template.innerHTML = this.#getTemplate();
                let tpc = this.template.content.cloneNode(true);  
                this.mainElement = tpc.firstChild.nextSibling;
                this.shadowRoot.appendChild(this.mainElement);
                this.arrowFirst =  this.mainElement.firstChild.nextSibling.firstChild.nextSibling;
                this.arrowLeft =  this.mainElement.firstChild.nextSibling.nextSibling.nextSibling.firstChild.nextSibling;
                this.fastInput =      this.mainElement.firstChild.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.firstChild.nextSibling;
                this.arrowRight = this.mainElement.firstChild.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.firstChild.nextSibling;
                this.arrowLast =  this.mainElement.firstChild.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.firstChild.nextSibling;
                resolve(this);        
            } 
            catch (error) {
                reject(error);
            }
        })
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
                            await fast.createInstance('FastNavigator', {'id': this[attr]});
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
                                    this.mainElement.addEventListener(attrevent, ()=>{
                                        if(!this._disabled)this.props.events[attrevent]()})}
                                break;
                            default : 
                                this.setAttribute(attr, this.props[attr]);
                                this[attr] = this.props[attr];
                                if(attr==='id'){
                                    this.id = this[attr];
                                    await fast.createInstance('FastNavigator', {'id': this[attr]})
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
    
    async connectedCallback(){
        await this.#render();
        await this.#checkAttributes();
        await this.#checkProps();    
        this.#events();  
        this._isBuilt = true;  
        this.built();
    }

    nextPage(){
        if(this._itemPage < this.totalpage){ this.itempage = this._itemPage + 2 ; }
        return this;
    }

    priorPage(){
        if(this.itempage > 0){ this.itempage = this._itemPage; }
        return this;
    }

    setPagination(){
        this.fastInput.value = (this._itemPage + 1) + "/" + this._totalpage;
        switch(this._itemPage){
            case 0 : {this.disableControl([true,true,false,false]); break}
            case this.totalpage - 1 : {this.disableControl([false,false,true,true]); break}
            default : {
                this.disableControl([false,false,false,false]);
            }
        }
        return this;
    }

    cleanPageControl(){
        this.fastInput.value = "";
        return this;
    }

    disableControl(arr){
        this.arrowFirst.disabled = arr[0];
        this.arrowLeft.disabled = arr[1];
        this.arrowRight.disabled = arr[2];
        this.arrowLast.disabled = arr[3];
    }

    #events(){
        this.arrowFirst.addEventListener('click', (e)=>{
            e.preventDefault();
            e.stopPropagation();
            this.itempage = 0;
            this.disableControl([true,true,false,false]);  
        })
        this.arrowLast.addEventListener('click', (e)=>{
            e.preventDefault();
            e.stopPropagation();    
            this.itempage = this.totalpage;
            this.disableControl([false,false,true,true]);
        })
        this.arrowLeft.addEventListener('click', (e)=>{
            e.preventDefault();
            e.stopPropagation();    
            this.priorPage();
            if(this.itempage===0) this.disableControl([true,true,false,false]);
            else{this.disableControl([false,false,false,false]);}
        })
        this.arrowRight.addEventListener('click', (e)=>{
            e.preventDefault();
            e.stopPropagation();    
            this.nextPage();
            if(this.itempage >= this.totalpage-1){this.disableControl([false,false,true,true]);}
            else{this.disableControl([false,false,false,false]);}
        })
        this.fastInput.addEventListener('focus',(e)=>{
            e.preventDefault();
            e.stopPropagation();
            this.itempage = this.fastInput.value;
            this.cleanPageControl();
        })
        this.fastInput.addEventListener('blur',(e)=>{
            e.preventDefault();
            e.stopPropagation();
            if(this.fastInput.value === "") this.setPagination();
            else this.itempage = this.fastInput.value;
        })
        this.fastInput.addEventListener('keyup', (e)=>{
            e.preventDefault();
            e.stopPropagation();
            if(isNaN(this.fastInput.value) || this.fastInput.value===""){ this.cleanPageControl(); }
            else{
                let v = parseInt(this.fastInput.value, 10);   
                if(v > 0 && v <= this.totalpage){ this._itemPage = v - 1; }
            }
            if(e.key==="Enter" || e.key==="Escape") { this.fastInput.blur(); }
        })
    }

    addToBody(){document.body.appendChild(this);}
    get itempage(){return parseInt(this._itemPage, 10);}
    set itempage(val){
        if( parseInt(val, 10) > 0 ){
            if(parseInt(val, 10) <= this._totalpage) this._itemPage = parseInt(val, 10) - 1;
            else this._itemPage = this.totalpage - 1;
        }
        else this._itemPage = 0;
        this.setPagination();
    }
    get totalpage(){return this._totalpage;}
    set totalpage(val){
        this._totalpage = val;
        this.setPagination();
    }
}

if (!customElements.get ('fast-navigator')) {
    customElements.define ('fast-navigator', FastNavigator);
}
