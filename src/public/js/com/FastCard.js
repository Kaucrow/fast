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
    }

    #getTemplate() {
        return `
            <div class="FastCard">
                <img class="card-img" style="display: none;" />
                <h3 class="card-title"></h3>
                <div class="card-content"></div>
            </div>
        `;
    }

    async #getCss() {
        let baseCss = await fast.getCssFile("FastCard");
        const additionalCss = `
            .card-img[hidden] {
                display: none !important;
            }
            .card-img:not([src]), .card-img[src=""] {
                display: none !important;
            }
        `;
        return baseCss + additionalCss;
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

    #checkAttributes() {
        return new Promise(async (resolve, reject) => {
            try {
                for (let attr of this.getAttributeNames()) {
                    if (attr.substring(0, 2) !== "on") {
                        this[attr] = this.getAttribute(attr);
                        this.setAttribute(attr, this.getAttribute(attr));
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
                        switch (attr) {
                            case 'style':
                                for (let k in this.props.style)
                                    this.mainElement.style[k] = this.props.style[k];
                                break;
                            case 'events':
                                for (let e in this.props.events)
                                    this.mainElement.addEventListener(e, this.props.events[e]);
                                break;
                            case 'title': 
                            case 'content':
                                this.setAttribute(attr, this.props[attr]);
                                this[attr] = this.props[attr];
                                break;
                            case 'img':
                                this.setAttribute(attr, this.props[attr]);
                                this[attr] = this.props[attr];
                                this.#updateImageVisibility(this.props[attr]);
                                break;
                            default:
                                this.setAttribute(attr, this.props[attr]);
                                this[attr] = this.props[attr];
                                if (attr === 'id')
                                    await fast.createInstance('FastCard', { id: this[attr] });
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
        await this.#applyProps();
        this.built();
    }

    #applyProps() {
        return new Promise((resolve, reject) => {
            try {
                for (const [key, value] of this.objectProps.entries()) {
                    if (key === 'img') {
                        this.#updateImageVisibility(value);
                    } else {
                        this[key] = value;
                    }
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

    get title() {
        return this.titleElement?.innerText || "";
    }
    set title(val) {
        this.setAttribute("title", val);
        if (this.titleElement) this.titleElement.innerText = val;
        else this.objectProps.set("title", val);
    }

    get content() {
        return this.contentElement?.innerText || "";
    }
    set content(val) {
        this.setAttribute("content", val);
        if (this.contentElement) this.contentElement.innerText = val;
        else this.objectProps.set("content", val);
    }

    get img() {
        return this.imgElement?.src || "";
    }
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