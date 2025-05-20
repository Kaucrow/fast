export const FastIcon = class extends Fast{
    constructor(props){
        super();  
        this.name = "FastIcon";
        this.props = props;
        if(props){ if(props.id) this.id = props.id; }      
        this.built = ()=>{}; 
        this._caption = '';
        this.attachShadow({mode:'open'});
        this._fontcolor = 'white';
        this.styleProps = new Map();
        this.objectProps = new Map();
        this._isBuilt = false;
        this._iconName = '';
        this._hint = "";
        this.svg = null;
    }
    #getTemplate(){ return `
            <div class="FastIconContainer">
                <div class="FastContainerSVG">
                    <svg class="FastIcon"></svg>
                </div>
                <div class="FastIconCaption"></div>
                <div class="FastIconHint"></div>
            </div>
        `    
    }
    async #getCss(){ 
        return await fast.getCssFile("FastIcon");
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
                            await fast.createInstance('FastIcon', {'id': this[attr]});
                            break;
                        case 'style':
                            if(this[attr].fill){ this.svg.style['fill'] = this.props.style['fill'];}
                            if(this[attr].stroke){this.svg.style['stroke'] = this.props.style['stroke'];}
                            if(this[attr].width){
                                this.svg.style['width'] = this.props.style['width'];
                                this.containerSVG.style['width'] = this.props.style['width'];
                            }
                            if(this[attr].height){
                                this.svg.style['height'] = this.props.style['height'];
                                this.containerSVG.style['height'] = this.props.style['height'];
                            }
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
                                for(let attrcss in this.props.style){
                                        switch(attrcss){
                                            case 'fill' :  { this.svg.style[attrcss] = this.props.style[attrcss]; break;}
                                            case 'stroke': { this.svg.style[attrcss] = this.props.style[attrcss];break;}
                                            case 'width' : {
                                                this.svg.style[attrcss] = this.props.style[attrcss];
                                                this.containerSVG.style[attrcss] = this.props.style[attrcss];
                                                break;
                                            }
                                            case 'height' : {
                                                this.svg.style[attrcss] = this.props.style[attrcss];
                                                this.containerSVG.style[attrcss] = this.props.style[attrcss];
                                                break;
                                            }
                                            default : { this.mainElement.style[attrcss] = this.props.style[attrcss];}
                                    }                                    
                                } 
                                break;
                            case 'events' : 
                                for(let attrevent in this.props.events){
                                    this.mainElement.addEventListener(attrevent, ()=>{
                                        if(this._disabled===false)this.props.events[attrevent]()})}
                                break;
                            default : 
                                this.setAttribute(attr, this.props[attr]);
                                this[attr] = this.props[attr];
                                if(attr==='id'){
                                    this.id = this[attr];
                                    await fast.createInstance('FastIcon', {'id': this[attr]})
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
                this.containerSVG = this.mainElement.firstChild.nextSibling;
                this.svg = this.mainElement.firstChild.nextSibling.firstChild.nextSibling;
                this.captionElement = this.mainElement.firstChild.nextSibling.nextSibling.nextSibling;
                this.hintElement = this.captionElement.nextSibling.nextSibling;
                if(this.shadowRoot.firstChild){this.shadowRoot.removeChild(this.shadowRoot.firstChild)}
                this.shadowRoot.appendChild(this.mainElement);   
                resolve(this);        
            } catch (error) {
                reject(error);
            }
        })
        
    }

    #events(){        
        this.mainElement.addEventListener('pointerover',(e)=>{
            e.preventDefault();
            if(this._hint!=="" && this._disabled===false) {
                this.hintElement.style.visibility = 'visible';
                this.hintElement.style.animationName = 'showhint';
                this.hintElement.style.animationDuration= '0.5s'; 
                this.hintElement.style.animationDelay = '0s';
                this.hintElement.style.animationFillMode = 'both';
            }
        }, false);
        this.mainElement.addEventListener('pointerout',(e)=>{
            e.preventDefault();
            this.hintElement.style.animationName = 'hidehint';
            this.hintElement.style.animationDuration= '0.5s'; 
            this.hintElement.style.animationDelay = '0s';
            this.hintElement.style.animationFillMode = 'both';
        }, false);
        this.mainElement.addEventListener('click',(e)=>{
            e.preventDefault();
            this.hintElement.style.visibility = 'hidden';
        }, false);
    }

    async connectedCallback(){
        await this.#render();
        await this.#checkAttributes();        
        await this.#checkProps();
        this._isBuilt = true;
        await this.#applyStyleProps();
        await this.#applyProps();
        this.#events();
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
        if(this.svg){
            if(this._disabled)this.svg.style.opacity = 0.3;
            else this.svg.style.opacity = 1;
        }
    }
    get iconname (){return this._iconName}
    set iconname (val){
        this._iconName = val;
        fast.getSVG(val).then((r)=>{
            this.svg.innerHTML = r;
        })
    }
    get caption (){return this._caption}
    set caption (val){
        this._caption = val;
        this.captionElement.innerText = val;
    }
    get hint (){return this._hint}
    set hint (val){this._hint = val; this.hintElement.innerText=this._hint;}
}
if (!customElements.get ('fast-icon')) {
    customElements.define ('fast-icon', FastIcon);
}