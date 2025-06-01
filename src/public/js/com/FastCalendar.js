export class FastCalendar extends Fast {
    constructor(props) {
        super();
        this.name  = 'FastCalendar';
        this.props = props;
        this.built = ()=> {};
        this.attachShadow({mode: 'open'});
        this._isBuilt = false;
    }

    #getTemplate() {
        return `
      <div class="FastCalendar">
        <div class="FastCalendarHeader"></div>
        <div class="FastCalendarBody">
          <div class="FastCalendarOptions">
          </div>
          <div class="FastCalendarDays"></div>
        </div>
      </div>
    `;
    }

    async #getCss(){return fast.getCssFile('FastCalendar');}

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
            } catch(error){ reject(error);}
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
                            await fast.createInstance('FastCalendar', {'id': this[attr]});
                            break;
                    }
                }
                resolve(this);
            } catch (error) { reject(error); }
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
                                    fast.createInstance('FastCalendar', {'id': this[attr]});
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

    async connectedCallback() {
      await this.#render();
      await this.#checkAttributes();
      await this.#checkProps();
      await this.#applyProps();
      this._isBuilt = true;
      this.built();
    }

    addBody(){
        document.body.appendChild(this.mainElement);
    }
}

if (!customElements.get('fast-calendar')) {
    customElements.define('fast-calendar', FastCalendar);
}