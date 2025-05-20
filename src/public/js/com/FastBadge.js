export const FastBadge = class extends Fast{
    constructor(props){
        super();  
        this.name = "FastBadge";
        this.props = props;
        if(props){ if(props.id) this.id = props.id; }      
        this.built = ()=>{}; 
        this._caption = '';
        this.attachShadow({mode:'open'});
        this._bgbadge = 'black';
        this._fontcolor = 'white';
        this.styleProps = new Map();
        this.objectProps = new Map();
        this._isBuilt = false;
    }
    #getTemplate(){ return `
            <div class='FastBadge'></div>
        `    
    }
    async #getCss(){ 
        return await fast.getCssFile("FastBadge");
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
                            await fast.createInstance('FastBadge', {'id': this[attr]});
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
                                    await fast.createInstance('FastBadge', {'id': this[attr]})
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
                let sheet = new CSSStyleSheet();
                let css = await this.#getCss();
                sheet.replaceSync(css);
                this.shadowRoot.adoptedStyleSheets = [sheet];        
                this.template = document.createElement('template');
                this.template.innerHTML = this.#getTemplate();
                let tpc = this.template.content.cloneNode(true);  
                this.mainElement = tpc.firstChild.nextSibling;
                this.shadowRoot.appendChild(this.mainElement);
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
        this._isBuilt = true;
        await this.#applyStyleProps();
        await this.#applyProps();
        this.built();
    }
    addToBody(){document.body.appendChild(this);}
    #applyStyleProps(){ 
        return new Promise((resolve, reject)=>{
            try{
                for (const [key, value] of this.styleProps.entries()) {
                    this.mainElement.style[key] = value;
                    this.styleProps.delete(key);
                }
                resolve(this);
            }
            catch(error){
                reject(error);
            }
        }); 
    }
    #applyProps(){ 
        return new Promise((resolve, reject)=>{
            try{
                for (const [key, value] of this.objectProps.entries()) {
                    this.mainElement[key] = value;                    
                    this.objectProps.delete(key);
                }
                resolve(this)
            }
            catch(e){
                reject(e);
            }
        })
    }
    get disabled (){ return this.mainElement.disabled }
    set disabled(val){
        this._disabled = fast.parseBoolean(val);
        this.setAttribute('disabled', val);
        if(this.mainElement) this.mainElement.disabled = this._disabled;
        else this.objectProps.set('disabled', this._disabled);
        let value = 1;
        if(val) value = 0.3;
        if(this.mainElement) this.mainElement.style.opacity = value;
        else this.styleProps.set('opacity', value);
    }
    get caption(){ return this._caption }
    set caption(val){
        this._caption = val;
        if(this.mainElement) this.mainElement.innerText = this._caption
        else this.objectProps.set('innerText', this._caption);
    }
    get bgbadge(){ return this._bgbadge} 
    set bgbadge(val){
        this._bgbadge = val;
        if(this.mainElement) this.mainElement.style.backgroundColor = this._bgbadge;
        else this.styleProps.set('backgroundColor', this.bgbadge);
    }
}
if (!customElements.get ('fast-badge')) {
    customElements.define ('fast-badge', FastBadge);
}