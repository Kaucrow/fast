export const FastSelect = class extends Fast{
    constructor(props){
        super(); this._reactive = false; this.name = "FastSelect"; this.props = props; 
        this.built = ()=>{}; 
        this.attachShadow({mode:'open'}); this._reactive = false;
    }

    #getTemplate(){
        return `
            <div class="FastSelectContainer">
                <select class="FastSelect"></select>
                <label class="FastSelectLabel"></label>
            </div>
        `
    }

    async #getCss(){ 
        return await fast.getCssFile("FastSelect");
    }

    #checkAttributtes(){
        return new Promise(async (resolve, reject) => {
            try {
                for(let attr of this.getAttributeNames()){ 
                    if(attr.substring(0,2)!="on"){ 
                        this[attr] = this.getAttribute(attr);
                    }
                    else{ 
                        switch(attr) {  
                            case 'onescape' : this.selectElement.addEventListener('escape', ()=>{eval(this.getAttribute(attr))}); break;
                            case 'onenter' : this.selectElement.addEventListener('enter', ()=>{eval(this.getAttribute(attr))}); break;
                        }
                    }
                }
                if(this.getAttribute('id')){ await fast.createInstance('FastSelect', {'id':this.getAttribute('id')}); this['id'] = this.getAttribute('id');}        
                resolve(this);
            } catch (error) {
                reject(this);
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
                                for(let attrevent in this.props.events){this.selectElement.addEventListener(attrevent, this.props.events[attrevent])}
                                break;
                            default : 
                                this.setAttribute(attr, this.props[attr]);
                                this[attr] = this.props[attr];
                                if(attr==='id')await fast.createInstance('FastSelect', {'id': this[attr]});
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
                this.selectElement = this.mainElement.firstChild.nextSibling;
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
        await this.#checkAttributtes();
        await this.#checkProps();
        this.builtEvents();
        this.built();
    }

    focus(){this.selectElement.focus(); return this;}
    addToBody(){document.body.appendChild(this); return this;}
    getSelect(){return this.selectElement}
    #animationUp(){this.labelElement.style.animation = "animationLabelUp .5s both"; return this;}
    #animationDown(){this.labelElement.style.animation = "animationLabelDown .5s both"; return this;}
    clean(){this.selectedIndex = -1; return this;}
    getOption(index){ return this.selectElement.options[index]; }

    builtEvents(){
        this.labelElement.addEventListener('click', (ev)=>{ev.preventDefault(); this.selectElement.focus();}, false);
        this.selectElement.addEventListener('focus', (ev)=>{ev.preventDefault(); this.#animationUp();}, false); 
        this.selectElement.addEventListener('change', (ev)=>{ev.preventDefault(); this.#animationUp(); if(this._reactive) fast.react();}, false); 
        this.selectElement.addEventListener('keyup', (ev)=>{
            ev.preventDefault(); 
            if(ev.key === 'Enter'){ this.selectElement.dispatchEvent(new CustomEvent("enter", {bubbles: true})); }
            else if(ev.key === 'Escape'){ this.selectElement.dispatchEvent(new CustomEvent("escape", {bubbles: true})); }
            else this.#animationUp();
        }, false);      
        this.selectElement.addEventListener('blur',(ev)=>{
            ev.preventDefault();
            if(this.selectElement.value.trim()==="") this.#animationDown();            
        }, false);
    }

    addOption(opt){
        var option = document.createElement("option");
        option.className = 'FastOption';
        if(typeof opt==='string' || typeof opt==='number') option.text = opt;
        else{ if(typeof opt==='object'){ for(let attr in opt){ option[attr] = opt[attr]; } } }
        this.selectElement.appendChild(option);
        this.selectedIndex = -1;
        return this;
    }

    setOption(opt){
        let option = this.getOption(opt.index);
        if(typeof opt==='string' || typeof opt==='number') option.text = opt.text;
        else{ if(typeof opt==='object'){ for(let attr in opt){ if(attr!=='index') option[attr] = opt[attr]; } } }
        return this;        
    }

    get options (){ return this.selectElement.options; }
    get caption (){return this.labelElement.innerText}
    set caption(val){this.setAttribute('caption', val); this.labelElement.innerText = val;}
    get reactive (){return this._reactive}
    set reactive(val){ this.setAttribute('reactive', val); this._reactive = val; }
    get disabled (){return this.selectElement.disabled}
    set disabled(val){ this.setAttribute('disabled', val); this.selectElement.disabled = val; }
    get selectedIndex(){ return this.selectElement.selectedIndex; }
    set selectedIndex(val){ this.selectElement.selectedIndex = val; if(val >=0) this.#animationUp(); else this.#animationDown(); }
    get value (){ return this.getOption(this.selectElement.selectedIndex).text; }
}

if (!customElements.get ('fast-select')) {
    customElements.define ('fast-select', FastSelect);
}