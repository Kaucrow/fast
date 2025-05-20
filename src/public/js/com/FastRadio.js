export const FastRadio = class extends Fast{
    constructor(props){
        super();
        this.name = "FastRadio";
        this.props = props;     
        this.built = ()=>{}; 
        this.attachShadow({mode:'open'});
        this._caption = "";
    }

    #getTemplate(){
        return `
        <div class="FastRadioPanel">
            <div class = "FastExtRadio">
                <div class = "FastIntRadio"></div>
            </div>
            <div class="FastRadioCaption"></div>
        </div>
        `        
    }

    async #getCss(){
        return await fast.getCssFile("FastRadio");
    }

    #render(){
        return new Promise(async(resolve, reject)=>{
            try{
                this.template = document.createElement('template');
                this.template.innerHTML = this.#getTemplate();
                let sheet = new CSSStyleSheet();
                sheet.replaceSync(await this.#getCss());
                this.shadowRoot.adoptedStyleSheets = [sheet];
                let tpc = this.template.content.cloneNode(true);  
                this.mainElement = tpc.firstChild.nextSibling;
                this.extRadio = this.mainElement.firstChild.nextSibling;
                this.intRadio = this.extRadio.firstChild.nextSibling;
                this.captionPanel = this.mainElement.firstChild.nextSibling.nextSibling.nextSibling;
                this.shadowRoot.appendChild(this.mainElement);  
                this.mainElement.id = this.id;
                this.mainElement.pointerEvents = 'none';
                resolve(this);
            }
            catch(e){
                reject(e);
            }
        })
    }

    #events(){
        this.mainElement.addEventListener('click', (e)=>{
            e.preventDefault();
            this.#selectRadio(true);
        }, false);  
    }

    #checkAttributes(){
        return new Promise((resolve, reject)=>{
            try{
                for(let attr of this.getAttributeNames()){          
                    if(attr.substring(0,2)!="on"){
                        this.mainElement.setAttribute(attr, this.getAttribute(attr));
                        this[attr] = this.getAttribute(attr);
                    }
                    switch(attr){
                        case 'id' : {
                            fast.createInstance('FastRadio', {'id': this[attr]});
                            break; 
                        }
                        case 'group' : {
                            this.setAttribute(attr, this[attr]);
                            if(fast.radioGroup[this[attr]]===undefined || fast.radioGroup[this[attr]]===null){
                                fast.radioGroup[this[attr]] = [];
                                fast.radioGroup[this[attr]].push(this);
                            }
                            else{
                                fast.radioGroup[this[attr]].push(this);
                            }
                            break;   
                        }
                    }
                }
                resolve(this);
            }
            catch(e){
                reject(e);
            }
        })
    }

    #checkProps(){
        return new Promise((resolve, reject)=>{
            try{
                if(this.props){
                    for(let attr in this.props){
                        switch(attr){
                            case 'style' :
                                for(let attrcss in this.props.style) {
                                    switch(attrcss){
                                        case "width" :
                                            this.mainElement.style.width = this.props.style[attrcss];
                                            break;
                                        case "height" :
                                            this.mainElement.style.height = this.props.style[attrcss];
                                            break;
                                    }
                                    this.mainElement.style[attrcss] = this.props.style[attrcss];
                                }
                                break;
                            case 'events' : 
                                for(let attrevent in this.props.events){this.mainElement.addEventListener(attrevent, this.props.events[attrevent])}
                                break;
                            case 'group' :
                                this.setAttribute(attr, this.props[attr]);
                                this[attr] = this.props[attr];
                                if(fast.radioGroup[this.props.group]===undefined || fast.radioGroup[this.props.group]===null){
                                    fast.radioGroup[this.props.group] = [];
                                    fast.radioGroup[this.props.group].push(this);
                                }
                                else{
                                    fast.radioGroup[this.props.group].push(this);
                                }
                                break;
                            default : 
                                this.setAttribute(attr, this.props[attr]);
                                this[attr] = this.props[attr];
                                if(attr==='id')fast.createInstance('FastDialog', {'id': this[attr]});
                        }
                    }
                };
                resolve(this);
            }
            catch(e){
                reject(false);
            }
        })
    }

    #selectRadio(val){
        if(val){
            this.captionPanel.className = "FastRadioCaptionSelected";
            this.intRadio.className = "FastIntRadioSelected";
        }
        else{
            this.captionPanel.className = "FastRadioCaption";
            this.intRadio.className = "FastIntRadio";
        }
        this._checked = val;
        for(let attr in fast.radioGroup){
            for(let attr2 in fast.radioGroup[attr]){
                if(fast.radioGroup[attr][attr2]!==this){
                    fast.radioGroup[attr][attr2].captionPanel.className = "FastRadioCaption";
                    fast.radioGroup[attr][attr2].intRadio.className = "FastIntRadio";
                    fast.radioGroup[attr][attr2]._checked=false;
                }
            }
        }
    }
    
    async connectedCallback(){
        await this.#render();
        await this.#checkAttributes();
        await this.#checkProps();
        this.#events();
        this.built(this);
    }

    get caption(){return this._caption}
    set caption(val){
        this._caption = val;
        this.captionPanel.innerText = val;
    }

    get checked(){return this._checked}
    set checked(val){ this.#selectRadio(val)}

    addToBody(){document.body.appendChild(this);}
}

if (!customElements.get ('fast-radio')) {
    customElements.define ('fast-radio', FastRadio);
}