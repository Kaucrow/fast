export const FastEdit = class extends Fast{
    static observedAttributes = ["caption"];

    constructor(props){
        super(); this.name = "FastEdit"; this.props = props; this._hiddenValue = ""; this.built = ()=>{}; 
        this.attachShadow({mode:'open'}); this._reactive = false; this._message = '';
    }
    #getTemplate(){
        return `
            <div class="FastEditContainer">
                <input class="FastEdit">
                <label class="FastEditLabel"></label>
            </div>
        `
    }
    async #getCss(){ 
        return await fast.getCssFile("FastEdit");
    }
    #checkAttributes(){
        return new Promise(async (resolve, reject) => {
            try {
                for(let attr of this.getAttributeNames()){ 
                    if(attr.substring(0,2)!="on"){ 
                        this[attr] = this.getAttribute(attr);
                    }
                    else{ 
                        switch(attr) {  
                            case 'onescape' : this.addEventListener('escape', ()=>{eval(this.getAttribute(attr))}); break;
                            case 'onenter' : this.addEventListener('enter', ()=>{eval(this.getAttribute(attr))}); break;
                        }
                    }
                }
                if(this.getAttribute('id')){ await fast.createInstance('FastEdit', {'id':this.getAttribute('id')}); this['id'] = this.getAttribute('id');}
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
                                if(attr==='id')await fast.createInstance('FastEdit', {'id': this[attr]});
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
                sheet.replaceSync(await this.#getCss());
                this.shadowRoot.adoptedStyleSheets = [sheet];
                this.template = document.createElement('template');
                this.template.innerHTML = this.#getTemplate();
                let tpc = this.template.content.cloneNode(true);  
                this.mainElement = tpc.firstChild.nextSibling;
                this.inputElement = this.mainElement.firstChild.nextSibling;
                this.labelElement = this.mainElement.firstChild.nextSibling.nextSibling.nextSibling;
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
        this.builtEvents();
        this.built();
    }
    builtEvents(){
        this.labelElement.addEventListener('click', (ev)=>{ev.preventDefault(); this.inputElement.focus();}, false);
        this.inputElement.addEventListener('focus', (ev)=>{ev.preventDefault(); this.#animationUp();}, false); 
        this.inputElement.addEventListener('change', (ev)=>{ev.preventDefault(); this.#animationUp(); this.valid();}, false); 
        this.inputElement.addEventListener('keyup', (ev)=>{
            ev.preventDefault(); if(ev.key === 'Enter'){ this.dispatchEvent(new CustomEvent("enter", {bubbles: true})); };
            if(ev.key === 'Escape'){ this.dispatchEvent(new CustomEvent("escape", {bubbles: true})); } ;
            this.#animationUp(); if(this._reactive) fast.react();
        }, false);      
        this.inputElement.addEventListener('blur',(ev)=>{
            ev.preventDefault();
            if(this.inputElement.value.trim()==="" && this.inputElement.type!=='date') 
            this.#animationDown();
            
        }, false);
    }
    valid(){
        if(this.inputElement.required){
            this.inputElement.setCustomValidity('');
            if(this.inputElement.checkValidity()===false){
                if(this._message!=='')this.inputElement.setCustomValidity(this._message);
                this.inputElement.reportValidity();
            }
        }
        return this;
    }
    focus(){this.inputElement.focus(); return this;}
    addToBody(){document.body.appendChild(this); return this;}
    getEdit(){return this.inputElement}
    clean(){this.inputElement.value = ''; return this;}
    #animationUp(){this.labelElement.style.animation = "animationLabelUp .5s both"; return this;}
    #animationDown(){this.labelElement.style.animation = "animationLabelDown .5s both"; return this;}
    getIntValue(){return parseInt(this.value, 10) }
    getFloatValue(dec){let v = parseFloat(this.value); if(dec){ return parseFloat(v.toFixed(dec)) } else { return v }}
    get caption (){return this.labelElement.innerText}
    set caption(val){
        this.setAttribute('caption', val); this.labelElement.innerText = val;
        this.dispatchEvent(new CustomEvent("changeCaption", {bubbles: true}));
    }
    get value (){ return this.inputElement.value; }
    set value(val){ this.setAttribute('value', val); this.inputElement.value = val; this.#animationUp(); }
    get hiddenValue (){return this._hiddenValue}
    set hiddenValue(val){ this.setAttribute('hiddenValue', val); this._hiddenValue = val; }
    get disabled (){return this.inputElement.disabled}
    set disabled(val){ this.setAttribute('disabled', val); this.inputElement.disabled = val; }
    get reactive (){return this._reactive}
    set reactive(val){ this.setAttribute('reactive', val); this._reactive = val; }
    get type (){return this.inputElement.type}
    set type(val){ this.setAttribute('type', val); this.inputElement.type = val; }
    get required (){ return this.inputElement.required }
    set required(val){ this.setAttribute('required', val); this.inputElement.required = val; }
    get message (){return this._message}
    set message(val){ this.setAttribute('message', val); this._message = val; }
    get max (){return this.inputElement.max}
    set max(val){ this.setAttribute('max', val); this.inputElement.max = val; }
    get min (){return this.inputElement.min}
    set min(val){ this.setAttribute('min', val); this.inputElement.min = val; }
    get maxlength (){return this.inputElement.maxlength}
    set maxlength(val){ this.setAttribute('maxlength', val); this.inputElement.maxLength = val; }
    get minlength (){return this.inputElement.minlength}
    set minlength(val){ this.setAttribute('minlength', val); this.inputElement.minLength = val; }
    get pattern (){return this.inputElement.pattern}
    set pattern(val){ this.setAttribute('pattern', val); this.inputElement.pattern = val; }
    get readonly (){return this.inputElement.readonly}
    set readonly(val){ if(val) this.style.opacity = 0.4; else this.style.opacity = 1;
        this.setAttribute('readonly', val); this.inputElement.readOnly = val;
    }
}
if (!customElements.get ('fast-edit')) {
    customElements.define ('fast-edit', FastEdit);
}
