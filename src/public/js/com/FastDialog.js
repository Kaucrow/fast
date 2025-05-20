/**
 * Crea una instancia del componente FastDialog de Fast.
 * @class FastDialog
 * @extends Fast
 * @param {Object} props - Objeto de propiedades. 
 * @param {string} props.id - Identidificador unico de la instancia del componente.
 * @param {Object} props.Style - Estilo visual del componente a renderizar.
 * @param {Object} props.events - objeto de eventos.
 * @param {string} props.modal - configura al dialogo como modal.
 * @param {boolean} props.centerscreen - Ubica al dialogo no modal en el centro de la pantalla. 
 * @param {boolean} props.draggable - configura la accion de arrastre del dialogo sobre la pantalla.
 * @param {string} props.showclosebutton - configura la visibilidad del botón de cerrar el dialogo.
 * @param {string} props.hidden - configura la visibilidad del dialog (true/false).
 */
export const FastDialog = class extends Fast{
    constructor(props){
        super();  
        this.name = "FastDialog";
        this._title = "";
        if(props){
            this.props = props;  
            if(props.id) this.id = props.id;
        }
        this._modal = false;
        this.built = ()=>{}; 
        this.closeButton = document.createElement('div');
        this.attachShadow({mode:'open'});
        this._showclosebutton = true;
        this._centerScreen = false;
        this.actualOpacity = 1;
        this.clickPressed = false;
        this._draggable = false;
        this.my = 0;
        this.mx = 0;        
        this.mxini = 0;
        this.myini = 0;
        this.px = 0;
        this.py = 0;
        this.actZIdx = 0;
        this.onCloseDialog = false;
    }

    #getTemplate(){
        return `
            <dialog class='FastDialog'>
                <div class = 'DivCloseButton'></div>
                <div class = 'Title'></div>
                <div class = 'BodyDialog'><slot name="bodyDialogSlot"></slot></div>
                <div class='Footer'><slot name="footerDialogSlot"></slot></div>
            </dialog>
        ` 
    }

    async #getCss(){ 
        return await fast.getCssFile("FastDialog");
    }
        
    #checkAttributes(){
        return new Promise((resolve, rejct)=>{
            try{
                for(let attr of this.getAttributeNames()){          
                    if(attr.substring(0,2)!="on"){
                        this.mainElement.setAttribute(attr, this.getAttribute(attr));
                        this[attr] = this.getAttribute(attr);
                    }
                    switch(attr){
                        case 'id' : 
                            fast.createInstance('FastDialog', {'id': this[attr]});
                            break;    
                    }
                }
                if(this.props===undefined){
                    this.mainElement.style.width = parseInt(window.getComputedStyle(this.mainElement).width, 10);
                    this.mainElement.style.height = parseInt(window.getComputedStyle(this.mainElement).height, 10);
                    let px = window.getComputedStyle(this).left;
                    let py = window.getComputedStyle(this).top;
                    this.setPosition(px,py);  
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
                reject(e);
            }
        })
    }

     #render(css){   
        return new Promise((resolve, reject)=>{
            try{
                this.template = document.createElement('template');
                this.template.innerHTML = this.#getTemplate();
                let sheet = new CSSStyleSheet();
                sheet.replaceSync(css);
                this.shadowRoot.adoptedStyleSheets = [sheet];
                let tpc = this.template.content.cloneNode(true);  
                this.mainElement = tpc.firstChild.nextSibling;
                this.divButtonClose = this.mainElement.firstChild.nextSibling;
                this.titleDialog = this.divButtonClose.nextSibling.nextSibling;
                this.bodyDialog = this.titleDialog.nextSibling.nextSibling;
                this.footerDialog = this.bodyDialog.nextSibling.nextSibling;
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
    
    async connectedCallback(){
        await this.#render(await this.#getCss());
        await this.#checkAttributes();
        await this.#checkProps();
        this.#events();
        this.style.width = "0px";
        this.style.height = "0px";
        this.built(this);
    }

    /**
     * Trae al frente el dialogo. Este diálogo tendrá preferencia visual sobre los demás que estén mostrados
	 */
    sendToFrom(){
        this.style.zIndex = this.actZIdx;
        this.style.opacity = this.actualOpacity;
        return this;
    }

    /**
     * Envia hacia atrás este diálogo, dando preferencia de visualización al penúltimo mostrado.  
	 */
    sendToBack(){
        this.actZIdx--;
        this.style.zIndex = this.actZIdx;
        this.style.opacity = this.actualOpacity;
        return this;
    }

    #events(){
        let setCursor = (element,typeCursor)=>{
            if (this._draggable && !this.clickPressed) {
                element.style.cursor = typeCursor;
            }
        }

        let pointerDown = (element, e)=>{
            if(!this.onCloseDialog){
                this.actZIdx = this.getMaxZIndex();
                element.style.zIndex = this.actZIdx;
                this.sendToFrom();
                if (this._draggable) {
                    element.style.cursor = "grabbing";
                    this.getMouseXY(e);
                    this.mxini = this.mx;
                    this.myini = this.my;
                    this.clickPressed = true;
                    this.actualOpacity = this.style.opacity;
                    this.style.opacity = 0.5;
                }
            }
        }

        this.ondragstart = ()=> {return false;};
        this.mainElement.ondragstart = ()=> {return false;};
        this.mainElement.ondragstart = ()=> {return false;};
        this.divButtonClose.ondragstart = ()=> {return false;};
        this.titleDialog.ondragstart = ()=> {return false;};
        this.divButtonClose.addEventListener("pointerover",(e) => {
            setCursor(this.divButtonClose,"move");
        },false);

        this.titleDialog.addEventListener('pointerover', (e)=>{
            setCursor(this.titleDialog,"move");
        }, false);
        
        this.divButtonClose.addEventListener("pointerdown",(e) => {
            e.preventDefault();
            pointerDown(this.divButtonClose, e);
        },false);        

        this.titleDialog.addEventListener("pointerdown",(e) => {
            e.preventDefault();
            pointerDown(this.titleDialog, e);
        },false);  

        this.closeButton.addEventListener("pointerdown",(e) => {  
            this.onCloseDialog = true; 
            e.preventDefault();       
            this.hide();
        },false); 
        
        document.addEventListener("pointerup",(e) => {
            this.clickPressed = false;
            this.style.opacity = this.actualOpacity;
            setCursor(this.divButtonClose,"default");
        },false);        
        
        document.addEventListener("pointermove",(e) => {
            if (this.clickPressed) {
                this.mainElement.style.zIndex = this.actZIdx;
                let dx = this.mx - this.mxini;
                let dy = this.my - this.myini;
                this.px = this.getBoundingClientRect().left;
                this.py = this.getBoundingClientRect().top;
                if (this._draggable) {
                    this.px = this.px + dx;
                    this.py = this.py + dy;
                    this.setPosition(this.px+'px', this.py+'px');
                    this.mxini = this.mx;
                    this.myini = this.my;
                    this.getMouseXY(e);
                }
            }
        },false);
    }

    /**
	 * Inserta al dialogo en el body para su visualizacion. 
	 */
    addToBody(){document.body.appendChild(this); return this;}

    /**
     * @description Este método ubica al dialogo en la posicion indicada por x e y
     * @param {string} x - es la coortdenada x que indica la posición horizontal (left)
     * @param {string} y - es la coortdenada y que indica la posición vertical (top)
     * @return {object} - retorna la instancia de este objeto
    */
    setPosition(x, y) {
        this.style.position = "absolute";
        this.style.left = x;
        this.style.top = y;
        return this;
    }

    /**
     * @description Este método obtiene las coordenadas actuales del raton y las graba eb mx y my
     * @param {object} e - es el objeto del evento
     * @return {object} - retorna este objeto.
    */
    getMouseXY(e) {
        this.mx = e.clientX;
        this.my = e.clientY;
        return this;
    }

    #add(target, objElement){
        let row = document.createElement('div');
        row.className = "row";
        for(let attr in objElement){
            switch(attr){
                case 'elements' : {
                    objElement.elements.forEach(element => {
                        element.style.transformStyle = "preserve-3d";
                        element.style.backfaceVisibility = "hidden";
                        row.appendChild(element);
                    });
                    break;
                }
                case 'style' : {
                    for(let attr in objElement.style){
                        row.style[attr] = objElement.style[attr];
                    }
                    break;
                }
            }
        }
        target.appendChild(row);
    }

    /**
	 * Inserta una nueva fila en el cuerpo del dialogo.
     * @param {object} objElement - define los atributos a manejar en la insercion de la nueva fila.
     * objElement.elements (Array) - Es un arreglo de ElementosHTML a insertar en la fila
     * objElements.style (Object) - Es un objeto Css que se aplica a la nueva fila, permite organizar los elementos en la fila
	 */
    addRowBody(objElement){
        this.#add(this.bodyDialog, objElement);
        return this;
    }
    /**
	 * Inserta una nueva fila en el pie de pagina del dialogo.
     * @param {object} objElement - define los atributos a manejar en la insercion.
     * objElement.elements (Array) - Es un arreglo de ElementosHTML a insertar
     * objElements.style (Object) - Es un objeto Css que se aplica al Footer, permite organizar los elementos en la fila
	 */
    addRowFooter(objElement){
        this.#add(this.footerDialog, objElement);
        return this;
    }

    /**
	 * Inserta un ElementoHTML en las coordenadas (x,y) del dialogo.
     * @param {string} x - define la coordenada x del elemento (px, %, em, etc).
     * @param {string} y - define la coordenada y del elemento (px, %, em, etc).
     * @param {string} element - Es el elementoHTML a insertar.
	 */
    addXY(x,y,element){
        element.style.position = 'absolute';
        element.style.left = x;
        element.style.top = y;
        this.mainElement.appendChild(element);
        return this;
    }

    /**
	 * Oculta el dialogo. 
	*/   
    hide(){
        this.mainElement.style.animationName = "hide";
        setTimeout(()=> {
            super.hide();
            this.mainElement.close();
            this.onCloseDialog = false;
        }, 500);
    }

    /**
	 * muestra el dialogo. 
	*/   
    show(){
        super.show();
        this.mainElement.style.animationName = "show";
    }

    /**
    * @property {boolean} modal - propiedad que define si el dialogo se mostrara o no en forma modal
    */
    get modal(){return this._modal}
    set modal(val){
        this._modal = val;
        if(val) {
            this.draggable = false;
            this.mainElement.showModal();
        }
        else {
            this.show();
        }
    }

    /**
    * @property {string} title - propiedad que define el titulo que mostrara el dialogo
    */
    get title(){return this._title}
    set title(val){
        this._title = val;
        this.titleDialog.innerText = val;
    }
    /**
    * @property {boolean} showclosebutton - propiedad que define si el close button se mostrara o no
    */
    get showclosebutton() { return this._showclosebutton;}
    set showclosebutton(val){
        this._showclosebutton=val;
        if(val){
            this.closeButton.innerText = "X";
            this.divButtonClose.appendChild(this.closeButton);
            this.divButtonClose.setAttribute('innerText', "X");
        }            
        else {
            this.divButtonClose.innerText = "";
            this.divButtonClose.setAttribute('innerText', "");
        }
        this.closeButton.className = "CloseButton";
    }

    /**
    * @property {boolean} centerscreen - propiedad que define si el dialogo se mostrara o no en el centro de la pantalla
    */
    get centerscreen(){return this._centerScreen}
    set centerscreen(val){
        this._centerScreen = val;
        if(val){
            this.mainElement.style.position = 'absolute';
            this.mainElement.style.left = "0px";
            this.mainElement.style.top = "0px";
            let cx = parseInt((window.innerWidth)/2,10);
            let cy = parseInt((window.innerHeight)/2,10);
            this.mainElement.style.width = parseInt(window.getComputedStyle(this.mainElement).width, 10);
            this.mainElement.style.height = parseInt(window.getComputedStyle(this.mainElement).height, 10);
            this.mainElement.style.left = cx+"px";
            this.mainElement.style.top = cy+"px";
            this.mainElement.style.transform = `translate(-50%,-50%)`;
            if(this.props){this.setPosition(0,0);}
            else{
                this.style.width = parseInt(window.getComputedStyle(this.mainElement).width, 10);
                this.style.height = parseInt(window.getComputedStyle(this.mainElement).height, 10);
                this.setPosition(cx/2,cy/2);  
                this.style.transform = `translate(-50%,-50%)`;
            }
        }
    }
    /**
    * @property {string} draggable Si es "true" permite arrastrar y soltar el diálogo, en "false" no lo permite, por defecto es "true"
    */
    get draggable(){return this._draggable;}
    set draggable(val){
        this._draggable = val;
        this.setAttribute('draggable', val);
    }
}

if (!customElements.get ('fast-dialog')) {
    customElements.define ('fast-dialog', FastDialog);
}

// customElements.define('fast-dialog', FastDialog);