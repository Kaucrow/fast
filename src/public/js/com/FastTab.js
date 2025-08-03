
export const FastTab = class extends Fast{
    constructor(props){
        super();  
        this.name = "FastTab";
        this.props = props;
        this._sts = false;
        this.built = ()=>{}; 
        this._coloricon = 'rgba(8, 143, 136, 0.5)'; 
        this._colorln = 'white';
        this._iconsize = 24;
        this.shadowroot = this.attachShadow({mode:'open'});
        this.tabElements = new Map();
        this.tabSelected=null;
        this._maxshow = 1;
        this.tabsGroup = document.createElement("div");
        this.iconLeft = null;
        this.iconRight = null;
        this.actPage = 0;
        this.page = 0;
        this.delayAnimationTabOption = 300;
        this._heighttaboption = '20px';
        this.tabOrderSelected = 0;
        this._paddingTab = 20;
        this._disabledTab = [];
    }

    #getTemplate(){ return `
            <div class ='FastTabContainer'>
                <div class = "FastTabHead">
                    <div class = "FastTabIcon"></div>
                    <div class = "FastTabOptionContainer">
                       
                    </div>
                    <div class = "FastTabIcon"></div>
                </div>
                <div class = "FastTabContent"></div>
            </div>
        `    
    }

    #renderIcon(iconName){
        return new Promise(async (resolve, reject) => {
            try {  
                let key = this.id+'_'+iconName+'_fast_tab';                
                let i = await fast.createInstance("FastIcon", {
                    'id': key,
                    'iconname' : iconName,
                    'style' : {
                        'position'          : 'relative',
                        'box-shadow'        : 'none', 
                        'border-style'      : 'none',
                        'width'             : this._iconsize + 'px',
                        'height'            : this._iconsize + 'px',
                        'fill'              : this._coloricon,
                        'stroke'            : this._colorln,
                    }
                });
                resolve(i);      
            } 
            catch (error) { reject(error); }
        })
    }

    async #getCss(){ return await fast.getCssFile("FastTab"); }

    allDiselected(tab){    
        for(let obj of this.tabElements)  {
            if(obj[1].enable) 
                if(obj[1]!==tab) obj[1].tabElement.style.animationName = "diselected"; 
        };
        return this;
    }

    selected(tabOpt){
        this.tabSelected = tabOpt.tabElement;
        tabOpt.tabElement.style.animationName = "selected";  
        this.divContent.animate([{left:'-110%'}],{duration:150, fill:'both'});
        setTimeout(()=>{this.#addRowElements(tabOpt);}, 150);
        setTimeout(()=>{this.divContent.animate([{left:'110%'}],{duration:1, fill:'both'})},150);
        setTimeout(()=>{this.divContent.animate([{left:'0%'}],{duration:500, fill:'both'})},300);
        return this;
    }
    diselected(tab){ tab.style.animationName = "diselected"; return this; }  
    enableAllTabs(){ for(let t of this.tabElements){ t[1].enable = true;} }
    
    setDisableTabs(){
        for(let idx of this._disabledTab){
            if(this.tabElements.has(idx)){
                let tabOpt = this.tabElements.get(idx);
                tabOpt.tabElement.style.animationName = "disabled";  
                this.tabElements.get(idx).enable = false;
            }
        }
    }

    showTabs(pag){
        this._maxshow = parseInt(this._maxshow);
        if(pag) this.page = pag;
        let side = -1;
        if(this.page < this.actPage)  side = -1; else side = 1;
        let totalPage = this.tabElements.size/this._maxshow;
        let tp = parseInt(totalPage, 10);
        if(totalPage > tp) totalPage = tp+1;        
        if(this.page===0){
            this.iconLeft.disabled = true;
            this.iconRight.disabled = false;
        }
        else this.iconLeft.disabled = false;

        if(this.page >= totalPage-1){
            this.iconLeft.disabled = false;
            this.iconRight.disabled = true;
        }
        else{
            this.iconRight.disabled = false;
        }
        let setTabs = ()=>{
            this.enableAllTabs();
            this.setDisableTabs();
            this.tabsGroup.innerHTML = '';
            this.tabsGroup.className = "FastTabGroup";
            let w = parseInt(getComputedStyle(this.mainElement,'').width, 10);
            this.divTabHead.style.width = w+'px';
            this.divTabOptionContainer.style.width = w+'px';
            this.tabsGroup.style.width = w+'px';
            let initCounter = this.page*this._maxshow;
            let endCounter = initCounter + this._maxshow;
            let counter = 0;
            this.actPage = this.page;
            this.divTabHead.style.opacity = 1;
            this.divTabHead.style.height = parseInt(this._heighttaboption, 10) + this._paddingTab + 'px';
            for(let obj of this.tabElements){
                obj[1].tabElement.style.height = this._heighttaboption;                   
                if(counter < endCounter && counter >= initCounter) this.tabsGroup.appendChild(obj[1].tabElement);
                counter++;
            }
            this.divTabOptionContainer.appendChild(this.tabsGroup);
        }                
        if(side===1){
            this.tabsGroup.style.animationName = "hideTabOptionLeft"; 
            setTimeout(()=>{
                setTabs();
                this.tabsGroup.style.animationName = "showTabOptionRight";
            }, this.delayAnimationTabOption);     
        } 
        else {
            this.tabsGroup.style.animationName = "hideTabOptionRight";
            setTimeout(()=>{
                setTabs();
                this.tabsGroup.style.animationName = "showTabOptionLeft";
            },this.delayAnimationTabOption);
        }
        return this;
    }
    
    #events(){
        this.iconLeft.addEventListener("click",(e)=>{
            e.preventDefault();
            e.stopImmediatePropagation();
            this.page--;
            if(this.page < 0) {this.page = 0;}
            else {this.showTabs(); };
        }, false);
        this.iconRight.addEventListener("click",(e)=>{
            e.preventDefault();
            e.stopImmediatePropagation();
            this.page++;
            if(this.page*this._maxshow >= this.tabElements.size) {this.page--;}
            else this.showTabs();
        }, false);
    }

    async #render(){
        let sheet = new CSSStyleSheet();
        let css = await this.#getCss();
        sheet.replaceSync(css);
        this.shadowRoot.adoptedStyleSheets = [sheet];
        this.template = document.createElement('template');
        this.template.innerHTML = this.#getTemplate();
        let tpc = this.template.content.cloneNode(true);  
        this.mainElement = tpc.firstChild.nextSibling;
        this.divIconLeft = this.mainElement.firstChild.nextSibling.firstChild.nextSibling;
        this.divTabHead = this.mainElement.firstChild.nextSibling; 
        this.divTabOptionContainer = this.divIconLeft.nextSibling.nextSibling;
        this.divSlot = this.divIconLeft.nextSibling.nextSibling.firstChild.nextSibling;
        this.divIconRight = this.divIconLeft.nextSibling.nextSibling.nextSibling.nextSibling;
        this.divContent = this.mainElement.firstChild.nextSibling.nextSibling.nextSibling;
        this.shadowRoot.appendChild(this.mainElement);
        this.iconLeft = await this.#renderIcon('leftArrow')
        this.iconRight = await this.#renderIcon('rightArrow');
        this.divIconLeft.appendChild(this.iconLeft);
        this.divIconRight.appendChild(this.iconRight);
    }

    #checkAttributes(){
        return new Promise(async (resolve, reject) => {
            try {
                for(let attr of this.getAttributeNames()){   
                    if(attr.substring(0,2)!="on"){
                        this.mainElement.setAttribute(attr, this.getAttribute(attr)); 
                        this[attr] = this.getAttribute(attr);
                    }
                    else{
                        let f = this[attr];                
                        this[attr] = ()=>{ if(!this.disabled) f(); };
                    }
                    switch(attr){
                        case 'id' : {
                            fast.createInstance('FastTab', {'id': this[attr]});
                            break;
                        }
                    }
                }
                if(this.getAttributeNames().length > 0){
                    this.style.left ="-8px";
                    this.style.top ="-8px";
                    this.divTabOptionContainer.style.width = this.style.width;
                    this.divTabHead.style.width = this.style.width;
                    let ele = this.firstChild.nextSibling;
                    while(ele){
                        switch(ele.tagName.toUpperCase()){
                            case "TABS" :{
                                let tabOpt = ele.firstChild.nextSibling;
                                while(tabOpt){
                                    let jsonOpt ={};
                                    for(let attr of tabOpt.getAttributeNames()){
                                        jsonOpt[attr] = tabOpt.getAttribute(attr);    
                                    };
                                    jsonOpt["elements"] = tabOpt.firstChild;
                                    this.addTab(jsonOpt);
                                    tabOpt = tabOpt.nextSibling.nextSibling;
                                }
                                break;
                            }
                            case "ROWTAB" : {
                                let jsonRow = {tabId:null,elements:[], style:{}};
                                for(let attr of ele.getAttributeNames()){
                                    switch(attr){
                                        case "tabid" :{
                                            jsonRow.tabId = ele.getAttribute(attr); 
                                            break;
                                        }
                                        case "style" : {
                                            let sty = ""; 
                                            for(let i=0; i<ele.style.length; i++){
                                                if(ele.style[i]!==null){
                                                    sty+= `"${ele.style[i]}":"${ele.style[ele.style[i]]}",`
                                                }
                                            }
                                            sty= `{${sty.substring(0,sty.length-1)}}`;
                                            jsonRow.style = JSON.parse(sty);                                            
                                            break;
                                        }
                                    }    
                                };
                                let elem = ele.firstChild.nextSibling;
                                while(elem){
                                    jsonRow.elements.push(elem);
                                    elem = elem.nextSibling.nextSibling;
                                }
                                this.addRow(jsonRow)
                                break;
                            } 
                        }
                        ele=ele.nextSibling.nextSibling;
                    }
                    this.showTabs();
                }
                resolve(this);
            }
            catch(e){
                reject(e);
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
                                if(this.props.style.width){
                                    this.divTabOptionContainer.style.width = this.props.style.width;
                                }
                                for(let attrcss in this.props.style) this.mainElement.style[attrcss] = this.props.style[attrcss];
                                break;
                            case 'events' : 
                                for(let attrevent in this.props.events){this.mainElement.addEventListener(attrevent, ()=>{if(!this.disabled){this.props.events[attrevent]}})}
                                break;
                            default : 
                                this.setAttribute(attr, this.props[attr]);
                                this[attr] = this.props[attr];
                                if(attr==='id')fast.createInstance('FastTab', {'id': this[attr]});
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

    async connectedCallback(){
        await this.#render();
        await this.#checkAttributes();
        await this.#checkProps();
        this.#events();        
        this.built();
        
    }
    addToBody(){document.body.appendChild(this);};
    addTab(option){
        let tab = document.createElement("div");
        tab.innerText = option.tabname;
        tab.className = "FastTabOption";
        tab.id = option.id;        
        option.tabElement = tab;
        option.tabRow = [];
        option.enable = true;
        option.tabOrder = this.tabElements.size;
        this.tabElements.set(option.id,option);
        this.diselected(tab);
        tab.addEventListener("click", (e)=>{
            if(option.enable){
                this.allDiselected(tab); 
                this.tabSelected = tab;
                this.selected(option);
            }
        });        
        return this;
    }

    #addRowElements(tabOpt){
        this.divContent.innerHTML = '';
        for(let row of tabOpt.tabRow){
            let divRow = document.createElement("div");
            divRow.className ="FastTabRowContent";
            for(let attrRow in row){
                switch(attrRow){
                    case 'elements': {                                     
                        for(let e of row.elements){ divRow.appendChild(e); }
                        this.divContent.appendChild(divRow);
                        break;                    
                    }
                    case 'style' : {
                        for(let attrcss in row.style){ divRow.style[attrcss] = row.style[attrcss]; }
                        break;
                    }
                }
            }
        }
        this.divContent.className = "FastTabContent";        
        return this;
    }

    addRow(objData){
        if(this.tabElements.has(objData.tabId)){
            let tabOpt = this.tabElements.get(objData.tabId);
            tabOpt.tabRow.push(objData);
        }
        return this;
    }

    get coloricon (){ return this._coloricon; };
    set coloricon (val){ this._coloricon = val; }; 
    get colorln(){ return this._colorln; };
    set colorln(val){ this.this._colorln = val; };
    get iconsize (){ return this._iconsize; };
    set iconsize (val) { this._iconsize = val; };
    get maxshow(){return this._maxshow};
    set maxshow(val){ this._maxshow = val};
    get heighttaboption(){ return this._heighttaboption }
    set heighttaboption(val){ this._heighttaboption = val; }
    get pageselected(){ return this.page }
    set pageselected(val){ this.page = val; }
    get disabledtab(){return this._disabledTab;}
    set disabledtab(objDisabled){ 
        if(typeof objDisabled==='string'){
            let p = objDisabled.split(",");
            objDisabled = [];
            for(let i=0; i<p.length; i++){
                objDisabled.push(p[i]);
            }
        }
        this._disabledTab = objDisabled;
        this.setDisableTabs();
    }
}

if (!customElements.get ('fast-tab')) {
    customElements.define ('fast-tab', FastTab);
}
