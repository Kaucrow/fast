/**
 * @description Componente FastWait. permite colocar una imágen a modo de indicar al usuario que espere por algún proceso (usa fondo modal)
 * @class FastWait
 * @property {object} props - Es el objeto de propiedades (opcional) que se pasa al componente para inicializar algunas de sus propiedades
 */
export let FastWait = class extends Fast {
    constructor(props) {
      super();  
      this.name = "FastWait";
      this.props = props;
      if(props){ if(props.id) this.id = props.id; }      
      this.built = ()=>{}; 
      this.attachShadow({mode:'open'});
      this.styleProps = new Map();
      this.objectProps = new Map();
      this._isBuilt = false;
      this._animateduration = 1;
    }  
    
    #getTemplate(){ return `
      <div class = "FastWaitModal">
      <div id="_Wait_Content" class="FastWaitContent">
        <span class="FastSpanWait"></span>
      </div> 
      </div>
      `    
    }

    async #getCss(){ 
      return await fast.getCssFile("FastWait");
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
                        await fast.createInstance('FastWait', {'id': this[attr]});
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
                                await fast.createInstance('FastWait', {'id': this[attr]})
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

  addToBody(){ document.body.appendChild(this) }

  show(){
    super.show(); 
    this.mainElement.style.opacity = '0%';
    this.mainElement.animate([{ opacity : '100%' }],{duration:this._animateduration*1000, fill:'both'});
  }

  hide(){
    this.mainElement.animate([{ opacity : '0%' }],{duration:this._animateduration*1000, fill:'both'});
    setTimeout(()=>{ super.hide(); }, this._animateduration*1000);
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
            this.shadowRoot.appendChild(this.mainElement);            
            resolve(this);        
        } catch (error) {
            reject(error);
        }
    })    
  }

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
  async connectedCallback(){
    await this.#render();
    await this.#checkAttributes();
    await this.#checkProps();
    this._isBuilt = true;
    await this.#applyStyleProps();
    await this.#applyProps();
    this.built();
  }

  get animateduration(){ return this._animateduration; }
  set animateduration(val){ this._animateduration = val;}
}

if (!customElements.get ('fast-wait')) {
    customElements.define ('fast-wait', FastWait);
}