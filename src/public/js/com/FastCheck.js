export const FastCheck = class extends Fast{
    static observedAttributes = ["caption"];

    constructor(props){
        super();  
        this.name = "FastCheck";
        this.props = props;     
        this.built = ()=>{}; 
        this.attachShadow({mode:'open'});
        this._master = false;
        this._group = "";
        this._sts = null;
        this._isBuilt = false;
        this.objectProps = new Map();
    }

    #getTemplate(){
        return `
        <label class="FastCheck">
            <input type="checkbox">
            <span class="checkmark"></span>
            <label class="caption"></label>
        </label>
        `        
    }

    async #getCss(){ 
      return await fast.getCssFile("FastCheck");
    }

    #checkAttributes(){
        return new Promise((resolve, reject) => {
            try {
                for(let attr of this.getAttributeNames()){       
                    this.mainElement[attr] = null;
                    this.spanElement[attr]=null;
                    this.labelElement[attr]=null;      
                    if(attr.substring(0,2)!="on"){
                        this.setAttribute(attr, this.getAttribute(attr));
                        this[attr] = this.getAttribute(attr);
                    }
                    else{       
                        this.checkElement[attr] = this[attr];
                        this[attr]=null;
                    }
                    switch(attr){
                        case 'id' : 
                            fast.createInstance('FastCheck', {'id': this[attr]});
                            this.mainElement.id = this[attr];
                            break;
                    }
                }
                resolve(this);        
            } 
            catch (error) {
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
                                for(let attrcss in this.props.style) this.mainElement.style[attrcss] = this.props.style[attrcss];
                                break;
                            case 'events' : 
                                for(let attrevent in this.props.events){
                                    this.spanElement.addEventListener(attrevent, 
                                    (ev)=>{
                                        ev.preventDefault();
                                        ev.stopImmediatePropagation();
                                        if(!this.disabled) this.props.events[attrevent]();
                                    },false);
                                }
                                break;
                            default : 
                                this.setAttribute(attr, this.props[attr]);
                                this[attr] = this.props[attr];
                                if(attr==='id'){
                                    fast.createInstance('FastCheck', {'id': this[attr]});
                                    this.mainElement.id = this[attr];
                                    this.id = this[attr];
                                }
                        }
                    }
                }
                resolve(this);
            } 
            catch (error) {
                reject(error);
            }
        })
    }
    
    async connectedCallback(){
        let sheet = new CSSStyleSheet();
        sheet.replaceSync(await this.#getCss());
        this.shadowRoot.adoptedStyleSheets = [sheet];
        this.template = document.createElement('template');
        this.template.innerHTML = this.#getTemplate();
        let tpc = this.template.content.cloneNode(true);  
        this.mainElement = tpc.firstChild.nextSibling;
        this.checkElement = this.mainElement.firstChild.nextSibling;
        this.labelElement = this.mainElement.firstChild.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling;
        this.spanElement = this.mainElement.firstChild.nextSibling.nextSibling.nextSibling;
        this.shadowRoot.appendChild(this.mainElement);        
        await this.#checkAttributes();
        await this.#checkProps();
        this.builtEvents();
        this.#applyProps();
        this._isBuilt = true;
        this.built();
    }

    checking(){               
        if(this.master){            
            fast.checkGroup[this.group].forEach((item) =>{
                if(!item.master){
                    item.checked = this.checked;
                    if(item.checked) item.sts = 1;
                    else item.sts = 0;
                }
                else{ item.spanElement.className = 'checkMark'; }
            })
        }
        else{
            let allNot = true;
            let allTrue = true;
            let master = null;
            fast.checkGroup[this.group].forEach((item) =>{
                if(!item.master){
                    if(item.checked) allNot = false;
                    else allTrue = false;
                }
                else master = item;
            })
            if(allTrue){
                if(master){
                    master.sts = 1;
                    master.spanElement.className = 'checkMark';
                    master.checked = true;

                }
            }
            if(allNot){
                if(master){
                    master.sts = 0;
                    master.spanElement.className = 'checkMark';
                    master.checked = false;
                }
            }
            if(!allNot && !allTrue){
                if(master){
                    master.sts = -1;
                    master.spanElement.className = 'checkMarkInd'
                    master.checked = true;
                }
            }
        }
    }

    builtEvents(){
        this.checkElement.addEventListener('keyup', (ev)=>{
            ev.preventDefault(); 
            ev.stopImmediatePropagation();
            if(ev.key === 'Enter' && !this.disabled){
                if(this.checked)this.checked = false; else this.checked=true; 
                this.checking();
                this.dispatchEvent(new CustomEvent("enter", {bubbles: true})); 
            };
        }, false);  
        this.checkElement.addEventListener('change', (ev)=>{
            ev.preventDefault();
            ev.stopImmediatePropagation();if(!this.disabled){ this.checking(); }
        }, false);
    }

    addToBody(){document.body.appendChild(this);}
    #applyProps(){ 
        return new Promise((resolve, reject)=>{
            try{
                for (const [key, val] of this.objectProps.entries()) {
                    switch(val.obj){
                        case 'mainElement':{
                            this.mainElement[key] = val.value;                    
                            break;
                        }
                        case 'checkElement':{
                            this.checkElement[key] = val.value;                    
                            break;
                        }
                        case 'labelElement':{
                            this.labelElement[key] = val.value;                    
                            break;
                        }
                        case 'funct' : {
                            val.funct(val.value);
                            break;
                        }
                    }
                    this.objectProps.delete(key);
                }
                resolve(this)
            }
            catch(e){
                reject(e);
            }
        })
    }
    #checking(val){
        this.checkElement.checked = val;
        if(this.master && this.sts!==-1){
            if(this.group){
                fast.checkGroup[this.group].forEach((item) =>{
                    if(!item.master){
                        item.checkElement.checked = val;
                        if(val) item.sts = 1;
                        else item.sts = 0;
                    }
                })          
            }
        }
    }
    #checkDisable(val){if(val){this.style.opacity = 0.3} else {this.style.opacity = 1}}
    get caption (){return this.mainElement.innerText}
    set caption(val){
        this.setAttribute('caption', val);
        if(this.labelElement) this.labelElement.innerText = val;
        else {this.objectProps.set('innerText', {'obj' :'labelElement', 'value':val})}
        this.dispatchEvent(new CustomEvent("changeCaption", {bubbles: true}));        
    }
    get checked (){return this.checkElement.checked}
    set checked (val){        
        if(this.checkElement){
            this.checkElement.checked = val;
            this.#checking(val);
        }
        else{
            this.objectProps.set('checked', {'obj' :'checkElement', 'value':val, 'funct':this.#checking})
        }
    }
    get disabled (){return this.checkElement.disabled}
    set disabled(val){
        this.setAttribute('disabled', val);
        if(this.checkElement) {this.checkElement.disabled = val; this.#checkDisable(val)}
        else{ this.objectProps.set('disabled', {'obj' :'checkElement', 'value':val, 'funct':this.#checkDisable})}
    }
    get group (){return this._group}
    set group (val){
        if(fast.checkGroup[val]){
            fast.checkGroup[val].push(this);
        }
        else{
            fast.checkGroup[val] = [];
            fast.checkGroup[val].push(this);
        }
        this._group = val
    }
    get master (){return this._master}
    set master (val){this._master = val}
    get sts (){return this._sts}
    set sts (val){this._sts = val}
}
if (!customElements.get ('fast-check')) {
    customElements.define ('fast-check', FastCheck);
}