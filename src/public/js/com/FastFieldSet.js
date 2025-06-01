export const FastFieldSet = class extends Fast{
    constructor(props){
        super();  
        this.name = "FastFieldset";
        this.props = props;     
        if(props){if(props.id){this.id = props.id}} ;
        this.built = ()=>{}; 
        this.attachShadow({mode:'open'});
        this._isBuilt = false;
        this.objectProps = new Map();
    }

    #getTemplate(){ return `
            <div class = "FieldSet">
                <div class = "Row"></div>
            </div>
        `    
    }

    async #getCss(){ 
        return await fast.getCssFile("FastFieldSet");
    }

   #checkAttributes() {
        return new Promise((resolve, reject) => {
            try {
                for (let attr of this.getAttributeNames()) {
                    // Ignora atributos que empiecen con "on" (eventos en línea)
                    if (!attr.startsWith('on')) {
                        // Sincroniza el atributo con la propiedad
                        this[attr] = this.getAttribute(attr);
                    }
                    // Si es "id", registra el componente en fast
                    if (attr === 'id') {
                        fast.createInstance('FastFieldSet', { 'id': this[attr] });
                    }
                }
                resolve(this); // Todo correcto
            } catch (e) {
                reject(e); // Hubo un error
            }
        });
    }


    #checkProps() {
    return new Promise((resolve, reject) => {
            try {
                if (this.props) {
                    for (let prop in this.props) {
                        switch (prop) {
                            case 'style':
                                // Aplica los estilos a la clase principal
                                for (let cssProp in this.props.style) {
                                    this.shadowRoot.querySelector('.FieldSet').style[cssProp] = this.props.style[cssProp];
                                }
                                break;
                            case 'events':
                                // Añade los eventos declarados en props
                                for (let eventName in this.props.events) {
                                    this.shadowRoot.querySelector('.FieldSet').addEventListener(eventName, this.props.events[eventName]);
                                }
                                break;
                            default:
                                // Otras props las trata como atributos y propiedades
                                this[prop] = this.props[prop];
                                this.setAttribute(prop, this.props[prop]);
                                if (prop === 'id') {
                                    fast.createInstance('FastFieldSet', { 'id': this[prop] });
                                }
                        }
                    }
                }
                resolve(this);
            } catch (e) {
                reject(e);
            }
        });
    }

    #render(css) {
        return new Promise((resolve, reject) => {
            try {
                // Crea el template HTML
                this.template = document.createElement('template');
                this.template.innerHTML = this.#getTemplate();

                // Aplica el CSS como adoptedStyleSheet
                let sheet = new CSSStyleSheet();
                sheet.replaceSync(css);
                this.shadowRoot.adoptedStyleSheets = [sheet];

                // Clona el contenido del template
                let clone = this.template.content.cloneNode(true);

                // Guarda referencias a elementos importantes
                this.mainElement = clone.querySelector('.FieldSet');
                this.rowsContainer = this.mainElement.querySelector('.Rows');

                // Inserta en el shadowRoot
                this.shadowRoot.appendChild(this.mainElement);

                resolve(this);
            } catch (e) {
                reject(e);
            }
        });
    }

    

    async connectedCallback() {
        await this.#render(await this.#getCss());
        await this.#checkAttributes();
        await this.#checkProps();

        //this.#events();
        this._isBuilt = true;
        this.built(this);
    }

    addToBody() {
        document.body.appendChild(this);
        return this;
    }

    addRowBody({ elements = [], style = {} }, index = null) {
        let row = document.createElement('div');
        row.classList.add('Row'); // opcional

        for (let e of elements) {
            row.appendChild(e);
        }
        Object.assign(row.style, style);
        if (index === null || index >= this.rowsContainer.children.length) {
            this.rowsContainer.appendChild(row);
        } else {
            this.rowsContainer.insertBefore(row, this.rowsContainer.children[index]);
        }
        return this;
    }



}

if (!customElements.get ('fast-fieldset')) {
    customElements.define ('fast-fieldset', FastFieldSet);
}