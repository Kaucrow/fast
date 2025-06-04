export const FastFieldSet = class extends Fast {
    constructor(props) {
        super();
        this.name = "FastFieldset";
        this.props = props;
        if (props && props.id) this.id = props.id;
        this.built = () => {};
        this.attachShadow({ mode: 'open' });
        this._isBuilt = false;
        this.objectProps = new Map();
    }

    #getTemplate() {
        return `
            <div class="FieldSet">
                <div class="Title"></div>
                <div class="Row"></div>
            </div>
        `;
    }

    async #getCss() {
        return await fast.getCssFile("FastFieldSet");
    }

    #checkAttributes() {
        return new Promise((resolve, reject) => {
            try {
                for (let attr of this.getAttributeNames()) {
                    if (!attr.startsWith('on')) {
                        this[attr] = this.getAttribute(attr);
                    }
                    if (attr === 'id') {
                        fast.createInstance('FastFieldSet', { 'id': this[attr] });
                    }
                }
                resolve(this);
            } catch (e) {
                reject(e);
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
                                for (let cssProp in this.props.style) {
                                    this.shadowRoot.querySelector('.FieldSet').style[cssProp] = this.props.style[cssProp];
                                }
                                break;
                            case 'events':
                                for (let eventName in this.props.events) {
                                    this.shadowRoot.querySelector('.FieldSet').addEventListener(eventName, this.props.events[eventName]);
                                }
                                break;
                            case 'title':
                                this.shadowRoot.querySelector('.Title').textContent = this.props[prop];
                                break;
                            default:
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
                this.template = document.createElement('template');
                this.template.innerHTML = this.#getTemplate();

                let sheet = new CSSStyleSheet();
                sheet.replaceSync(css);
                this.shadowRoot.adoptedStyleSheets = [sheet];

                let clone = this.template.content.cloneNode(true);
                this.mainElement = clone.querySelector('.FieldSet');
                this.rowsContainer = this.mainElement.querySelector('.Row');
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
        this._isBuilt = true;
        this.built(this);
    }

    addToBody() {
        document.body.appendChild(this);
        return this;
    }

    addRowBody({ elements = [], style = {} }, index = null) {
        let row = document.createElement('div');
        row.classList.add('Row');

        if (!Array.isArray(elements)) {
            elements = [elements];
        }

        for (let e of elements) {
            let field = document.createElement('div');
            field.classList.add('Field');
            field.appendChild(e);
            row.appendChild(field);
        }

        Object.assign(row.style, style);

        if (index === null || index >= this.rowsContainer.children.length) {
            this.rowsContainer.appendChild(row);
        } else {
            this.rowsContainer.insertBefore(row, this.rowsContainer.children[index]);
        }

        return this;
    }
};

if (!customElements.get('fast-fieldset')) {
    customElements.define('fast-fieldset', FastFieldSet);
}
