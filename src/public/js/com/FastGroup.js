export const FastGroup = class extends Fast{
    static observedAttributes = ["caption"];

    constructor(props){
        super();  
        this.name = "FastGroup";
        this.props = props;     
        this.built = ()=>{}; 
        this.attachShadow({mode:'open'});
    }

    #getTemplate(){
        return `
        <div class="FastGroupContainer">
            <div class = "ContainerHead">
                <div class = "HeadLineInit"></div>
                <div class = "captionPanel"></div>
                <div class = "HeadLineEnd"></div>
            </div>
            <div class = "ElementContainer"><slot name = "FastGroupSlot"></slot></div>
        </div>
        `        
    }

    async #getCss(){ 
        return await fast.getCssFile("FastGroup");
    }

    #render(){
        return new Promise(async (resolve, reject)=>{
            try {
                let sheet = new CSSStyleSheet();
                sheet.replaceSync(await this.#getCss());
                this.shadowRoot.adoptedStyleSheets = [sheet];
                this.template = document.createElement('template');
                this.template.innerHTML = this.#getTemplate();
                let tpc = this.template.content.cloneNode(true);  
                this.mainElement = tpc.firstChild.nextSibling;
                this.containerHead = this.mainElement.firstChild.nextSibling;
                this.shadowRoot.appendChild(this.mainElement);
                this.headLineInit = this.containerHead.firstChild.nextSibling;
                this.divCaption = this.headLineInit.nextSibling.nextSibling;
                this.headLineEnd = this.divCaption.nextSibling.nextSibling;   
                this.bodyContainer = this.mainElement.firstChild.nextSibling.nextSibling.nextSibling;
                resolve(this);        
            } catch (error) {
                reject(error);
            }
        });        
    }

    #checkAttributes(){
        return new Promise((resolve, reject)=>{
            try {
                for(let attr of this.getAttributeNames()){          
                    if(attr.substring(0,2)!="on"){
                        this.setAttribute(attr, this.getAttribute(attr));
                        this[attr] = this.getAttribute(attr);
                    }
                    switch(attr){
                        case 'id' : 
                            fast.createInstance('FastGroup', {'id': this[attr]});
                            this.mainElement.id = this['id'];
                            break;
                        case 'style': {
                            this.mainElement.style = this.getAttribute(attr);
                            this.style.width = '0px';
                            this.style.height = '0px';
                            this.style.left = '0px';
                            this.style.top = '0px';
                            break;
                        }
                    }
                }
                resolve(this);
            } catch (error) {
                reject(error);
            }
        })
    }

    #checkProps(){
        return new Promise((resolve, reject) => {
            try {
                if(this.props){
                    for(let attr in this.props){
                        switch(attr){
                            case 'style' :
                                for(let attrcss in this.props.style){
                                    this.mainElement.style[attrcss] = this.props.style[attrcss];
                                } 
                                break;
                            case 'events' : 
                                for(let attrevent in this.props.events){
                                    this.mainElement.addEventListener(attrevent, this.props.events[attrevent], false)
                                }
                                break;
                            default : 
                                this.setAttribute(attr, this.props[attr]);
                                this[attr] = this.props[attr];
                                if(attr==='id'){
                                    fast.createInstance('FastGroup', {'id': this[attr]});
                                    this.mainElement.id = this[attr];
                                }
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
        this.builtEvents(),     
        this.built();
    }

    builtEvents(){
        this.mainElement.addEventListener('keyup', (ev)=>{
            ev.preventDefault(); if(ev.key === 'Enter'){
                if(this.checked)this.checked = false; else this.checked=true; 
                this.dispatchEvent(new CustomEvent("enter", {bubbles: true})); 
            };
        }, false);  
    }

    addToBody(){document.body.appendChild(this);}

    addRow(props){
        let layer = document.createElement('div');
        layer.className = 'Row';
        if(props){
            if(props.styleRow){
                for(let attr in props.styleRow){
                    layer.style[attr] = props.styleRow[attr];
                }
            }
        }
        props.elements.forEach(element => {
            layer.appendChild(element);
        });
        if(this.bodyContainer) this.bodyContainer.appendChild(layer);
        return this;
    }
    get caption (){return this.radioElement.value}
    
    set caption(val){
        this.setAttribute('caption', val);
        this.divCaption.innerText = val;
        let fontSize = parseFloat(window.getComputedStyle(this.divCaption).fontSize);
        let t = val.length*fontSize - 4;
        this.divCaption.style.width = t+'px';
        this.dispatchEvent(new CustomEvent("changeCaption", {bubbles: true}));
    }
}

if (!customElements.get ('fast-group')) {
    customElements.define ('fast-group', FastGroup);
}