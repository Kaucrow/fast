export const FastCard = class extends Fast {
    static observedAttributes = ["title", "content", "img"];

    constructor(props) {
        super();
        this.name = "FastCard";
        this.props = props;
        if (props && props.id) this.id = props.id;
        this.built = () => {};
        this.attachShadow({ mode: "open" });
        this._isBuilt = false;
        this.objectProps = new Map();
        this._layoutDefined = false;
        this._deferredActions = [];
    }

    #getTemplate() {
        return `
            <template id="elements-template">
                <img class="card-img" style="display: none;" />
                <h3 class="card-title"></h3>
                <div class="card-content"></div>
            </template>
        `;
    }

    async #getCss() {
        let baseCss = await fast.getCssFile("FastCard");
        const additionalCss = `
            .card-img {
                width: 80px;
                height: 80px;
                object-fit: contain;
                flex-shrink: 0;
            }
            .card-row {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .card-column {
                display: flex;
                flex-direction: column;
                justify-content: center;
                flex: 1;
                min-width: 0;
                overflow: hidden;
            }
            .card-title {
                font-weight: bold;
                margin: 0;
            }
            .card-content {
                font-size: 14px;
                color: #333;
            }
        `;
        return baseCss + additionalCss;
    }

    #render() {
        return new Promise(async (resolve) => {
            let sheet = new CSSStyleSheet();
            sheet.replaceSync(await this.#getCss());
            this.shadowRoot.adoptedStyleSheets = [sheet];
            
            this.template = document.createElement('template');
            this.template.innerHTML = this.#getTemplate();
            this.shadowRoot.appendChild(this.template.content.cloneNode(true));
            
            this.mainElement = this.shadowRoot;
            
            const elementsTemplate = this.shadowRoot.querySelector('#elements-template');
            this.titleElement = elementsTemplate.content.querySelector('.card-title').cloneNode(true);
            this.contentElement = elementsTemplate.content.querySelector('.card-content').cloneNode(true);
            this.imgElement = elementsTemplate.content.querySelector('.card-img').cloneNode(true);

            resolve(this);
        });
    }

    #getElementByName(name) {
        switch (name) {
            case 'title': return this.titleElement;
            case 'content': return this.contentElement;
            case 'img': return this.imgElement;
            default:
                const custom = document.createElement('div');
                custom.className = 'card-extra';
                custom.textContent = name;
                return custom;
        }
    }

    
    addRow(config = { elements: [], style: {} }) {
        if (!this._isBuilt) {
            this._deferredActions.push(() => this.addRow(config));
            return this;
        }

        if (!this._layoutDefined) {
            while (this.mainElement.firstChild?.tagName !== 'TEMPLATE' && this.mainElement.firstChild?.tagName !== 'STYLE') {
                if (!this.mainElement.firstChild) break;
                this.mainElement.removeChild(this.mainElement.firstChild);
            }
            this._layoutDefined = true;
        }

        const row = document.createElement('div');
        row.className = 'card-row';
        if (config.style) Object.assign(row.style, config.style); 

        for (const item of config.elements) {
    if (Array.isArray(item)) {
        const column = document.createElement('div'); 
        column.className = 'card-column'; 

        for (const subItem of item) {
            let element, style = {};

            if (typeof subItem === 'object' && subItem.name) { 
                element = this.#getElementByName(subItem.name);
                style = subItem.style || {};
            } else {
                element = this.#getElementByName(subItem);
            }

            if (element) { 
                Object.assign(element.style, style); 
                column.appendChild(element);
            }
        }

        row.appendChild(column);
    } else {
        let element, style = {};

        if (typeof item === 'object' && item.name) {
            element = this.#getElementByName(item.name);
            style = item.style || {};
        } else {
            element = this.#getElementByName(item);
        }

        if (element) {
            Object.assign(element.style, style);
            row.appendChild(element);
        }
    }
}

        this.mainElement.appendChild(row);
        return this;
    }


    #applyDefaultLayout() {
        this.mainElement.appendChild(this.imgElement);
        this.mainElement.appendChild(this.titleElement);
        this.mainElement.appendChild(this.contentElement);
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
                        switch (attr) {
                            case 'style':
                                for (let k in this.props.style)
                                    this.style[k] = this.props.style[k];
                                break;
                            case 'events':
                                for (let e in this.props.events)
                                    this.addEventListener(e, this.props.events[e]);
                                break;
                            case 'title': 
                            case 'content':
                            case 'img':
                                this.setAttribute(attr, this.props[attr]);
                                this[attr] = this.props[attr];
                                if (attr === 'img') this.#updateImageVisibility(this.props[attr]);
                                break;
                            default:
                                this.setAttribute(attr, this.props[attr]);
                                this[attr] = this.props[attr];
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

        if (this._deferredActions.length > 0) { 
            this._deferredActions.forEach(action => action());
            this._deferredActions = [];
        }

        if (!this._layoutDefined) {
            this.#applyDefaultLayout();
        }

        await this.#applyProps();
        this.built();
    }

    #applyProps() {
        return new Promise((resolve, reject) => {
            try {
                for (const [key, value] of this.objectProps.entries()) {
                    this[key] = value;
                    this.objectProps.delete(key);
                }
                resolve(this);
            } catch (e) {
                reject(e);
            }
        });
    }

    addToBody() {
        document.body.appendChild(this);
    }
    
    get title() { return this.titleElement?.innerText || ""; }
    set title(val) {
        this.setAttribute("title", val);
        if (this.titleElement) this.titleElement.innerText = val;
        else this.objectProps.set("title", val);
    }

    get content() { return this.contentElement?.innerText || ""; }
    set content(val) {
        this.setAttribute("content", val);
        if (this.contentElement) this.contentElement.innerText = val;
        else this.objectProps.set("content", val);
    }

    get img() { return this.imgElement?.src || ""; }
    set img(val) {
        this.setAttribute("img", val);
        this.#updateImageVisibility(val);
        if (!this.imgElement) {
            this.objectProps.set("img", val);
        }
    }
};

if (!customElements.get('fast-card')) {
    customElements.define('fast-card', FastCard);
}