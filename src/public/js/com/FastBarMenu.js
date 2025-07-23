export const FastBarMenu = class extends Fast{
    constructor(props){
        super();  
        this.name = "FastBarMenu";
        this.props = props;     
        if(props){if(props.id){this.id = props.id}} ;
        this.built = ()=>{}; 
        this.attachShadow({mode:'open'});
        this._isBuilt = false;
        this.objectProps = new Map();
        this.node = new Map();
        this._coloricon = 'rgb(8, 143, 136)';
        this.isShowPanel = false;
        this.node = new Map();
        this.actMenuId = null;
        this.widthCharMenu = 7;
        this.sizeIconMenu = 20;
        this.brothers = [];
    }

    #getTemplate(){ return `
            <div class='FastBarMenu'></div>
        `    
    }

    async #getCss(){  return await fast.getCssFile("FastBarMenu"); }

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
            } catch (error) { reject(error); }
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
                            await fast.createInstance('FastBarMenu', {'id': this[attr]});
                            break;
                    }
                }
                resolve(this);
            } catch (error) { reject(error); }
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
                                if(attr==='id')await fast.createInstance('FastBarMenu', {'id': this[attr]});
                        }
                    }
                    resolve(this);
                }
                else { resolve();}        
            } catch (error) { reject(error); }
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
            catch(e){ reject(e); }
        })
    }

    #renderIcon(objOption){
        return new Promise(async (resolve, reject) => {
            try {
                let key = this.id+'_'+objOption.iconname+'_'+objOption.order;
                if(objOption.coloricon){this.coloricon = objOption.coloricon}
                let i = await fast.createInstance("FastIcon", {
                    'id': key,
                    'iconname' : objOption.iconname,
                    'style' : {
                        'position'          : 'relative',
                        'box-shadow'        : 'none', 
                        'border-style'      : 'none',
                        'width'             : this.sizeIconMenu+'px',
                        'height'            : this.sizeIconMenu+'px',
                        'fill'              : this._coloricon,
                        'background-color'  : 'rgba(0,0,0,0)',
                    }
                });
                resolve(i);      
            } 
            catch (error) { reject(error); }
        })
    }

    #renderIconRight(objOption){
        return new Promise(async (resolve, reject) => {
            try {
                if(objOption.coloricon){this.coloricon = objOption.coloricon}
                let i = await fast.createInstance("FastIcon", {
                    'id': this.id+'_'+objOption.iconRight+'_'+objOption.order,
                    'iconname' : objOption.iconRight,
                    'style' : {
                        'position'          : 'relative',
                        'box-shadow'        : 'none', 
                        'border-style'      : 'none',
                        'width'             : this.sizeIconMenu+'px',
                        'height'            : this.sizeIconMenu+'px',
                        'fill'              : this._coloricon,
                        'background-color'  : 'rgba(0,0,0,0)',
                    }
                });
                resolve(i);      
            } 
            catch (error) {
                reject(error);
            }
        })
    }

    #createPanelSM(){
        let p = document.createElement('div');
        p.className = 'FastPanelSubMenu';
        p.style.display = 'none';
        return p;
    }

    hidePanel(opt){
        opt.panelSM.isShow = false;
        opt.panelSM.style.display = 'none';
        return this;
    }

    hideAllPanel(id){
        for(let opt of this.node.values()){
            if(opt.parentId!==undefined && opt.parentId!==null){
                if(opt.parentObj){
                    if(id){
                        if(opt.parentObj.panelSM){
                            if(id === opt.parentObj.id) {
                                this.hidePanel(opt.parentObj);
                            }
                        }
                    }
                    else{
                        if(opt.parentObj.panelSM){
                                this.hidePanel(opt.parentObj);
                        }
                    }
                }
            }
        }
        this.isShowPanel = false;
    }

    showPanel(objOption){
        if(objOption && objOption.panelSM){
            objOption.panelSM.style.display = 'grid';
            objOption.panelSM.isShow = true;
            objOption.panelSM.animate(
                [
                    { opacity : "0%" },
                    { opacity : "100%" }
                ],
                {
                    delay : 0,
                    duration : 700,
                    fill : "both",
                }
            )
            this.isShowPanel = true;
        }
        return this;
    }

    #createMenuOption(objOption){
        return new Promise(async (resolve, reject) => {
            try {
                let icon = null;
                objOption.panelSM = this.#createPanelSM();
                if(objOption.iconname) icon = await this.#renderIcon(objOption)
                objOption.containerOpt = document.createElement('div');
                let divIconLeft = document.createElement('div');
                let divOptText = document.createElement('div');
                divIconLeft.id = objOption.id;
                divOptText.id = objOption.id;
                divOptText.innerText = objOption.text;
                if(icon!==null) { if(!divIconLeft.firstChild) divIconLeft.appendChild(icon); }
                let opt = document.createElement('div');
                opt.id = objOption.id;
                objOption.optionMenu = opt;
                objOption.containerOpt.className = "FastContainerOption";
                opt.className = "FastOptionMenu";
                if(!opt.firstChild) opt.appendChild(divIconLeft);
                opt.appendChild(divOptText);
                objOption.containerOpt.appendChild(opt);
                objOption.containerOpt.appendChild(objOption.panelSM);
                objOption.containerOpt.id = objOption.id; 
                resolve(objOption.containerOpt);            
            } 
            catch (error) { reject(error) }
        })
    }

    #createSubMenuOption(objOption){
        return new Promise(async (resolve, reject) => {
            try {
                let icon = null;
                if(objOption.iconname) icon = await this.#renderIcon(objOption);
                let iconRight = null;
                let divIconLeft = document.createElement('div');
                let divOptText = document.createElement('div');
                let po = this.node.get(objOption.parentId);                        
                po.iconRight = 'arrowRight';
                iconRight = await this.#renderIconRight(po);
                divIconLeft.className = "FastIconMenu";               
                let containerOpt = document.createElement('div');
                divOptText.innerText = objOption.text;
                if(icon!==null) { if(!divIconLeft.firstChild){ divIconLeft.appendChild(icon); } } 
                let opt = document.createElement('div');
                containerOpt.className = "FastContainerOption";
                opt.className = "FastOptionSM";
                if(!opt.firstChild) opt.appendChild(divIconLeft);
                opt.appendChild(divOptText);
                containerOpt.appendChild(opt);      
                objOption.containerOpt = containerOpt;  
                if(objOption.parentObj.parentId!=='root'){
                    if(!objOption.parentObj.divIconRight){
                        po.divIconRight = document.createElement('div');
                        po.divIconRight.className = "FastIconMenu";
                        if(iconRight!==null) {
                            if(!po.divIconRight.firstChild) { po.panelOption.appendChild(iconRight); }
                        }
                        objOption.parentObj = po;
                    }
                }         
                resolve(containerOpt);            
            } 
            catch (error) { reject(error) }
        })
    }

    #eventsMenu(opt){
        opt.containerOpt.addEventListener('click', (e)=>{
            e.preventDefault();
            e.stopImmediatePropagation();
            if(this.isShowPanel){ this.hideAllPanel(); }
            else this.showPanel(opt);
        }, false)
        opt.containerOpt.addEventListener('pointerover', (e)=>{
            this.optionIn = opt.id;
            if(this.isShowPanel){                
                if(this.actMenuId!==opt.optionMenu.id ){
                    this.hideAllPanel();
                    this.showPanel(opt);
                }
            }
        }, false)
        opt.containerOpt.addEventListener('pointerout', (e)=>{ this.actMenuId = opt.optionMenu.id; }, false);
        document.body.addEventListener('click',(e)=>{
            e.preventDefault();
            this.hideAllPanel();
        }, false);
        document.body.addEventListener('keydown',(e)=>{
            e.preventDefault();
            e.stopImmediatePropagation();
            let opt = this.node.get(this.optionIn);
            switch(e.key){
                case 'Escape' : { this.hideAllPanel(); break; }
                case 'Enter' : {
                    this.hideAllPanel();
                    this.showPanel(opt);
                    break;
                };
            };
        }, false);
    }

    #eventsSubMenu(opt){
        let hideBrothers = (opt)=>{
            opt.brothers.forEach(id => {
                let ele = this.node.get(id); 
                if( ele.panelSM && id!==opt.id){        
                    if(this.oldOptionIn!==this.optionIn) this.hidePanel(ele);
                }
            });
        }
        
        if(opt.panelOption) {
            opt.panelOption.addEventListener('click',(e)=>{
                e.preventDefault();
                e.stopImmediatePropagation();
                if(opt.funct) opt.funct();
                this.hideAllPanel();
            },false);
            
            opt.panelOption.addEventListener('pointerover', (e)=>{
                if(opt.id!=='root'){
                    hideBrothers(opt);                         
                }
            }, false)

            opt.panelOption.addEventListener('pointerout', (e)=>{
                e.preventDefault();
                e.stopImmediatePropagation();
                if(opt.panelSM){
                    hideBrothers(opt)
                }
            }, false);
        }

        if(opt.parentObj){ 
            if(opt.parentObj.parentObj){
                opt.parentObj.panelOption.addEventListener('pointerover', (e)=>{
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    this.optionIn = opt.id;
                    if(opt.parentObj.parentObj.iconRight){
                        if(this.optionIn!==this.optionOut){
                            if(opt.parentObj.panelSM){
                                if(opt.parentObj.panelSM.style.display==='none'){
                                    opt.parentObj.panelSM.style.left = "100%";
                                    opt.parentObj.panelSM.style.top = "0px";    
                                    this.showPanel(opt.parentObj);
                                }
                            }
                        }
                    }
                }, false);
            }
        }
    }

    #renderMenu(){
        return new Promise(async (resolve, reject)=>{
            try {
                for(let opt of this.node.values()){
                    if(!opt.parentId || opt.parentId==='root'){
                        opt.containerOpt = await this.#createMenuOption(opt);
                        opt.parentId==='root';
                        this.mainElement.appendChild(opt.containerOpt);
                        this.#eventsMenu(opt);
                    }                    
                }
                resolve(false);
            } catch (error) { reject(error); }
        })
    }

    #renderSubMenu(){
        return new Promise(async (resolve, reject)=>{
            try {
                for(let opt of this.node.values()){
                    if(opt.parentId!==undefined && opt.parentId!==null){
                        if(opt.parentId!=="root") {
                            opt.parentObj = this.node.get(opt.parentId);
                            if(opt.panelOption===undefined) opt.panelOption = await this.#createSubMenuOption(opt);
                            if(opt.parentObj.panelSM===undefined){ opt.parentObj.panelSM = this.#createPanelSM(); } 
                            opt.parentObj.panelSM.appendChild(opt.panelOption);
                            opt.panelOption.SM = opt.parentObj.panelSM;
                            let tam = opt.text.length*this.widthCharMenu+this.sizeIconMenu*4;
                            if(opt.parentObj.panelSM.style.width.trim()==='') opt.parentObj.panelSM.style.width = tam + "px";
                            else if(parseInt(opt.parentObj.panelSM.style.width) < tam) opt.parentObj.panelSM.style.width = tam + "px";
                            if(opt.parentObj.panelOption){opt.parentObj.panelOption.appendChild(opt.parentObj.panelSM);}
                            this.#eventsSubMenu(opt);
                        }                        
                    }
                }
                resolve(true);
            } catch (error) { reject(error); }
        })
    }
    
    render(){        
        return new Promise(async (resolve, reject) => {
            try {
                this.mainElement.innerHTML = '';
                await this.#renderMenu();
                await this.#renderSubMenu();
                resolve(true);
            } catch (error) { reject(error); }
        })
    }
    
    addNode(objOption){
        if(objOption.parentId===undefined || objOption.parentId===null) objOption.parentId = 'root';
        objOption.order = this.node.size;
        if(!this.brothers[objOption.parentId]){ this.brothers[objOption.parentId] = []; }
        this.brothers[objOption.parentId].push(objOption.id);
        objOption.brothers = this.brothers[objOption.parentId];
        this.node.set(objOption.id, objOption);        
        return this;
    }
    addToBody(){document.body.appendChild(this);}
    get coloricon(){return this._coloricon}
    set coloricon(val){this._coloricon = val}
}

if (!customElements.get ('fast-barmenu')) { customElements.define ('fast-barmenu', FastBarMenu); }