export const FastButton = class extends Fast{
    static observedAttributes = ["caption"];

    constructor(props){
        super();  
        this.name = "FastButton";
        this.props = props;     
        if(props){if(props.id){this.id = props.id}} ;
        this.built = ()=>{}; 
        this.attachShadow({mode:'open'});
        this._isBuilt = false;
        this.objectProps = new Map();
    }

    #getTemplate(){ return `
            <button class='FastButton'></button>
        `    
    }

    async #getCss(){ 
        return await fast.getCssFile("FastButton");
    }

    #render(){
        return new Promise(async (resolve, reject)=>{
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

    #checkAttributes(){
        return new Promise(async (resolve, reject)=>{
            try {
                for(let attr of this.getAttributeNames()){          
                    if(attr.substring(0,2)!="on"){
                        this.mainElement.setAttribute(attr, this.getAttribute(attr));
                        this[attr] = this.getAttribute(attr);
                    }
                    switch(attr){
                        case 'id' : 
                            await fast.createInstance('FastButton', {'id': this[attr]});
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
                                for(let attrevent in this.props.events){this.mainElement.addEventListener(attrevent, this.props.events[attrevent])}
                                break;
                            default : 
                                this.setAttribute(attr, this.props[attr]);
                                this[attr] = this.props[attr];
                                if(attr==='id')await fast.createInstance('FastButton', {'id': this[attr]});
                        }
                    }
                    resolve(this);
                }
                else { resolve();}        
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
        await this.#applyProps();
        this.built();
    }

    #applyProps(){ 
        return new Promise((resolve, reject)=>{
            try{
                for (const [key, value] of this.objectProps.entries()) {
                    this.mainElement[key] = fast.parseBoolean(value);
                    this.objectProps.delete(key);
                }
                resolve(this)
            }
            catch(e){
                reject(e);
            }
        })
    }

    addToBody(){document.body.appendChild(this);}
    get caption (){return this.mainElement.innerText}
    set caption(val){
        this.setAttribute('caption', val);
        if(this.mainElement) this.mainElement.innerText = val;
        else this.objectProps.set('caption', val);
        this.dispatchEvent(new CustomEvent("changeCaption", {bubbles: true}));
    }
    get disabled (){return this.mainElement.disabled}
    set disabled(val){
        this.setAttribute('disabled', val);
        if(this.mainElement) this.mainElement.disabled = val;
        else this.objectProps.set('disabled', val);    
    }
}

if (!customElements.get ('fast-button')) {
    customElements.define ('fast-button', FastButton);
}