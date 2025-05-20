export const FastStatusBar = class extends Fast{
    constructor(props){
        super();  
        this.name = "FastStatusBar";
        this.props = props;
        if(props){ if(props.id) this.id = props.id; }      
        this.built = ()=>{}; 
        this._message = '';
        this._typeMessage = 'info';
        this.attachShadow({mode:'open'});
        this._bgstatusbar = 'rgba(0,0,0,1)';
        this.styleProps = new Map();
        this.objectProps = new Map();
        this._isBuilt = false;
        this.iconMessage = null;
        this._iconsize = 24;
        this.bgColor = 'rgb(37, 11, 88)';
        this._position = 'down-right';
        this._duration = 3;
    }
    #getTemplate(){ return `
            <div class='FastStatusBar'>
                <div class='FastStatusBarIcon'></div>
                <div class='FastStatusBarText'></div>
            </div>
        `    
    }
    async #getCss(){ 
        return await fast.getCssFile("FastStatusBar");
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
                            await fast.createInstance('FastStatusBar', {'id': this[attr]});
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
                                    await fast.createInstance('FastStatusBar', {'id': this[attr]})
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
    #renderIcon(iconName, coloricon, colorLn){
        return new Promise(async (resolve, reject) => {
            try {
                if(!colorLn) colorLn='white';                
                let key = this.id+'_'+iconName+'_sts_bar';
                if(!coloricon){coloricon = 'white'}
                let i = await fast.createInstance("FastIcon", {
                    'id': key,
                    'iconname' : iconName,
                    'style' : {
                        'position'          : 'relative',
                        'box-shadow'        : 'none', 
                        'border-style'      : 'none',
                        'width'             : this._iconsize + 'px',
                        'height'            : this._iconsize + 'px',
                        'fill'              : coloricon,
                        'stroke'            : colorLn,
                        'background-color'  : 'rgba(0,0,0,0)',
                    }
                });
                resolve(i);      
            } 
            catch (error) { reject(error); }
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
                this.divIcon = this.mainElement.firstChild.nextSibling;
                this.divText = this.divIcon.nextSibling.nextSibling;
                this.shadowRoot.appendChild(this.mainElement);
                this.iconError = await this.#renderIcon('error','rgb(255, 0, 0)');
                this.iconInfo = await this.#renderIcon('info','white');
                this.iconDebug = await this.#renderIcon('debug','rgb(0,50,0)','rgb(0,255,0)');
                this.iconWarning = await this.#renderIcon('warn','rgb(223, 223, 15)','rgb(170, 170, 17)');
                this.iconMessage = this.iconInfo;
                this.divIcon.appendChild(this.iconMessage);
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
        super.hide();
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
    get iconsize(){ return this._iconsize }
    set iconsize(val){         
        this._iconsize = val; 
        this.iconMessage.props.style.width = this._iconsize + 'px';
        this.iconMessage.props.style.height = this._iconsize + 'px';        
    }
    get message(){ return this._caption }
    set message(val){
        this._message = val;
        if(this.divText) this.divText.innerText = this._message;
        else this.objectProps.set('innerText', this._message);
    }
    get position(){ return this._position }
    set position(val){
        this.mainElement.style.position = 'absolute';        
        this._position = val;
        switch(this._position){
            case 'down-center' : {
                this.mainElement.style.top = '90%';
                this.mainElement.style.left = '50%';
                this.mainElement.style.transform = 'translate(-50%, -50%)';
                break;
            }
            case 'down-left' : {
                this.mainElement.style.top = '90%';
                this.mainElement.style.left = '10px';
                this.mainElement.style.transform = 'translate(0, -50%)';
                break;
            }
            case 'down-right' : {
                this.mainElement.style.top = '90%';
                let x = parseFloat(getComputedStyle(this.mainElement, '').width) + this._iconsize*4;
                this.mainElement.style.left = parseInt(window.screen.width, 10) - x + 'px';
                this.mainElement.style.transform = 'translate(0%, -50%)';
                break;
            }
            case 'up-left' : {
                this.mainElement.style.top = '10%';
                this.mainElement.style.left = '10px';
                this.mainElement.style.transform = 'translate(0, -50%)';
                break;
            }
            case 'up-center' : {
                this.mainElement.style.top = '10%';
                this.mainElement.style.left = '50%';
                this.mainElement.style.transform = 'translate(-50%, -50%)';
                break;
            }
            case 'up-right' : {
                this.mainElement.style.top = '10%';
                let w = parseInt(getComputedStyle(this.mainElement, '').width) + this._iconsize*4;
                if(!w){ w = parseInt(this.divText.innerText.length,10) }
                this.mainElement.style.left = parseInt(window.screen.width, 10) - w + 'px';
                this.mainElement.style.transform = 'translate(0%, -50%)';
                break;
            }
            case 'center' : {
                this.mainElement.style.top = '50%';
                this.mainElement.style.left = '50%';
                this.mainElement.style.transform = 'translate(-50%, -50%)';
                break;
            }
        }
    }
    show(m){
        if(m){
            let s = m.split(":");            
            if(s.length > 1){ this.typemessage = s[0].toLowerCase(); this.message = s[1].trim(); } else{ this.message = m.trim(); }
        }
        this.mainElement.style.animationName = 'showbar';
        super.show();
        setTimeout(()=>{ this.hide(); }, this._duration*1000);
    }
    hide(){
        this.mainElement.style.animationName = 'hidebar';
        setTimeout(()=>{super.hide;
        }, this._duration*1000);
    }
    get typemessage(){ return this._typeMessage; }
    set typemessage(val){
        this._typeMessage = val;
        this.divIcon.removeChild(this.iconMessage);
        switch(val){
            case 'info'   :  { this.iconMessage = this.iconInfo; this.bgColor = 'rgb(9, 92, 88)'; break;};
            case 'debug'  :  { this.iconMessage = this.iconDebug; this.bgColor = 'rgb(6, 46, 8)'; break;};
            case 'warn'   :  { this.iconMessage = this.iconWarning; this.bgColor = 'rgb(0, 0, 0)'; break;};
            case 'error'  :  { this.iconMessage = this.iconError; this.bgColor = 'rgb(75, 6, 6)'; break;};
            default :  this.iconMessage = this.iconInfo;
        }
        this.divIcon.appendChild(this.iconMessage);
        this.iconsize = this._iconsize;
        this.bgstatusbar = this.bgColor;
    }
    get bgstatusbar(){ return this._bgstatusbar} 
    set bgstatusbar(val){
        this._bgstatusbar = val;
        if(this.mainElement) this.mainElement.style.backgroundColor = this._bgstatusbar;
        else this.styleProps.set('backgroundColor', this.bgstatusbar);
    }
    get duration(){ return this._duration} 
    set duration(val){ this._duration = parseInt(val,10); }
}
if (!customElements.get ('fast-statusbar')) {
    customElements.define ('fast-statusbar', FastStatusBar);
}