import { FastBadge } from "./FastBadge.js";

export const FastPageControl = class extends Fast{
    constructor(props){
        super();  
        this.name = "FastPageControl";
        this.props = props;
        this._sts = false;
        this.built = ()=>{}; 
        this.attachShadow({mode:'open'});
        this._isBuilt = false;
        this._itemPage = 0;
        this._totalpage = 1;
        this._totalItems = 0;
        this._callback = ()=>{};
    }

    #getTemplate(){ return `
            <div class='FastPageControl'>
                <fast-badge id='fastBadge1' disabled=true></fast-badge>
                <fast-badge id='fastBadge2' class = 'FastPrincipalBadge' caption="1"></fast-badge>
                <fast-badge id='fastBadge3' disabled=true></fast-badge>            
            </div>
        `    
    }

    async #getCss(){ 
        return await fast.getCssFile("FastPageControl");
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
                this.badge1 = this.mainElement.firstChild.nextSibling;
                this.badge2 = this.mainElement.firstChild.nextSibling.nextSibling.nextSibling;
                this.badge3 = this.mainElement.firstChild.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling;
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
                            await fast.createInstance('FastPageControl', {'id': this[attr]});
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
                                    await fast.createInstance('FastPageControl', {'id': this[attr]})
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

    #nextItem(){
        if(this._itemPage < this.totalpage){
            return this.itempage + 1;
        }
        else return this.itempage;
    }

    #priorItem(){
        if(this._itemPage > 0){
            return this.itempage - 1;
        }
        else return this.itempage;
    }

    setPagination(badgeNum){
        switch(badgeNum){
            case 1 :{
                if(!this.badge1.disabled){
                    this.itempage = this.badge1.caption;
                    this.badge2.caption  = this.itempage;
                    this.badge1.caption  = this.#priorItem();
                    this.badge3.caption  = this.#nextItem();
                    if(this.itempage > 1 ){ this.badge3.disabled = false; }
                    else{
                        this.badge1.caption  = "";
                        this.badge1.disabled = true;
                        if(this.totalpage >=2) this.badge3.disabled = false;
                    }
                    this.itempage = this.badge2.caption;
                    let itempage = this.itempage;
                    this.callback(itempage);
                }
                break;
            }
            case 2 : {
                if(!this.badge2.disabled){
                    this.itempage = this.badge2.caption;
                    let itempage = this.itempage;
                    this.callback(itempage);
                }
                break;
            }
            case 3 : {
                if(!this.badge3.disabled){
                    this.itempage = this.badge3.caption;
                    this.badge1.disabled = false;
                    this.badge2.caption = this.itempage;
                    this.badge1.caption = this.#priorItem();
                    this.badge3.caption = this.#nextItem();
                    if(this.badge3.caption === this.badge2.caption) {
                        this.badge3.caption = "";
                        this.badge3.disabled = true;
                    };
                    this.itempage = this.badge2.caption;
                    let itempage = this.itempage;
                    this.callback(itempage);
                }
                break;
            }
        }
    }

    #events(){
        this.badge1.addEventListener('click', (e)=>{
            e.preventDefault();
            e.stopPropagation();
            this.setPagination(1);
        })
        this.badge2.addEventListener('click', (e)=>{
            e.preventDefault();
            e.stopPropagation();
            this.setPagination(2);
            
        })
        this.badge3.addEventListener('click', (e)=>{
            e.preventDefault();
            e.stopPropagation();
            this.setPagination(3);            
        })
    }

    get itempage(){return parseInt(this._itemPage, 10);}
    set itempage(val){ this._itemPage = parseInt(val, 10);}
    get totalpage(){return parseInt(this._totalpage, 10);}
    set totalpage(val){ 
        this._totalpage = parseInt(val, 10); 
        this.badge2.caption = `${this.itempage+1}`;
        if(this._totalpage > 1){
            this.badge3.disabled=false;
            this.badge3.caption = this._itemPage + 2;
        } 
    }
    get callback () {return this._callback}
    set callback (val) { 
        this._callback = val;
        if(typeof this._callback==="string") { this._callback = new Function('itempage', this._callback) }
    }
    addToBody(){document.body.appendChild(this);}
}

if (!customElements.get ('fast-pagecontrol')) {
    customElements.define ('fast-pagecontrol', FastPageControl);
}
