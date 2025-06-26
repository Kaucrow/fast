export const FastCard = class extends Fast {
    // 1. Añadimos 'layout' a los atributos observados
    static observedAttributes = ["title", "content", "img", "layout"];

    constructor(props) {
        super();
        this.name = "FastCard";
        this.props = props;
        if (props && props.id) this.id = props.id;
        this.built = () => {};
        this.attachShadow({ mode: "open" });
        this._isBuilt = false;
        this.objectProps = new Map();
    }

    #getTemplate() {
        return `
            <div class="FastCard">
                <img class="card-img" style="display: none;" />
                <div class="card-text-wrapper">
                    <h3 class="card-title"></h3>
                    <div class="card-content"></div>
                </div>
            </div>
        `;
    }

    async #getCss() {
        let baseCss = await fast.getCssFile("FastCard"); 
        const layoutCss = `
            .FastCard {
                display: flex;
                gap: 1em;
            }
            .card-text-wrapper {
                display: flex;
                flex-direction: column;
                gap: 0.5em;
            }
            /* Layout por defecto (imagen arriba) */
            .FastCard, .FastCard[layout="image-top"] {
                flex-direction: column;
            }
            /* Layout con imagen abajo */
            .FastCard[layout="image-bottom"] {
                flex-direction: column;
            }
            .FastCard[layout="image-bottom"] .card-img {
                order: 1; /* Mueve la imagen al final */
            }
            /* Layout con imagen a la izquierda */
            .FastCard[layout="image-left"] {
                flex-direction: row;
                align-items: center;
                text-align: left;
            }
            /* Layout con imagen a la derecha */
            .FastCard[layout="image-right"] {
                flex-direction: row-reverse;
                align-items: center;
                text-align: right;
            }
            .card-img[hidden], .card-img:not([src]), .card-img[src=""] {
                display: none !important;
            }
        `;
        return baseCss + layoutCss;
    }

    #render() {
        return new Promise(async (resolve, reject) => {
            try {
                let sheet = new CSSStyleSheet();
                let css = await this.#getCss();
                sheet.replaceSync(css);

                this.shadowRoot.adoptedStyleSheets = [sheet];
                this.template = document.createElement('template');
                this.template.innerHTML = this.#getTemplate();
                let tpc = this.template.content.cloneNode(true); 
                this.shadowRoot.appendChild(tpc);
                
                // Enlazamos los elementos internos
                this.mainElement = this.shadowRoot.querySelector('.FastCard');
                this.titleElement = this.shadowRoot.querySelector('.card-title');
                this.contentElement = this.shadowRoot.querySelector('.card-content');
                this.imgElement = this.shadowRoot.querySelector('.card-img');
                resolve(this);
            } catch (error) {
                reject(error);
            }
        });
    }

    #updateImageVisibility(imgSrc) {
        if (this.imgElement) {
            if (imgSrc && imgSrc.trim() !== "") {
                this.imgElement.src = imgSrc;
                this.imgElement.style.display = 'block';
                this.imgElement.removeAttribute("hidden");
            } else {
                this.imgElement.src = "";
                this.imgElement.style.display = 'none';
                this.imgElement.setAttribute("hidden", "");
            }
        }
    }

    // Actualizamos #checkAttributes para que maneje el atributo 'layout'
    #checkAttributes() {
        return new Promise(async (resolve, reject) => {
            try {
                for (let attr of this.getAttributeNames()) {
                    if (attr.substring(0, 2) !== "on") {
                        this[attr] = this.getAttribute(attr);
                        switch(attr){
                            case 'title':
                                if (this.titleElement) this.titleElement.innerText = this[attr];
                                break;
                            case 'content':
                                if (this.contentElement) this.contentElement.innerText = this[attr];
                                break;
                            case 'img':
                                this.#updateImageVisibility(this[attr]);
                                break;
                            case 'layout':
                                if (this.mainElement) this.mainElement.setAttribute('layout', this[attr]);
                                break;
                            case 'id':
                                await fast.createInstance('FastCard', { id: this[attr] });
                                break;
                        }
                    }
                }
                resolve(this);
            } catch (error) {
                reject(error);
            }
        });
    }

    #checkProps() {
        return new Promise(async (resolve, reject) => {
            try {
                if (this.props) {
                    for (let attr in this.props) {
                        this[attr] = this.props[attr]; 
                        switch (attr) {
                            case 'style':
                                for (let k in this.props.style) this.mainElement.style[k] = this.props.style[k];
                                break;
                            case 'events':
                                for (let e in this.props.events) this.mainElement.addEventListener(e, this.props.events[e]);
                                break;
                            case 'layout':
                                this.setAttribute(attr, this.props[attr]);
                                break;
                        }
                    }
                }
                resolve(this);
            } catch (error) {
                reject(error);
            }
        });
    }

    async connectedCallback() {
        await this.#render();
        await this.#checkAttributes();
        await this.#checkProps();
        this._isBuilt = true;
        this.built();
    }
    
    get layout() { return this.getAttribute('layout'); }
    set layout(val) {
        this.setAttribute('layout', val);
        if (this.mainElement) {
            this.mainElement.setAttribute('layout', val);
        }
    }

    get title() { return this.titleElement?.innerText || ""; }
    set title(val) {
        this.setAttribute("title", val);
        if (this.titleElement) this.titleElement.innerText = val;
    }
    get content() { return this.contentElement?.innerText || ""; }
    set content(val) {
        this.setAttribute("content", val);
        if (this.contentElement) this.contentElement.innerText = val;
    }
    get img() { return this.imgElement?.src || ""; }
    set img(val) {
        this.setAttribute("img", val);
        this.#updateImageVisibility(val);
    }
};

if (!customElements.get('fast-card')) {
    customElements.define('fast-card', FastCard);
}