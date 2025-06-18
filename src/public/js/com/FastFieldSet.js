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
                this.props = this.props || {};
                for (let attr of this.getAttributeNames()) {
                    if (!attr.startsWith('on')) {
                        let val = this.getAttribute(attr);
                        try {
                            this.props[attr] = JSON.parse(val);
                        } catch {
                            this.props[attr] = val;
                        }
                        this[attr] = this.props[attr];
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

                            case 'title':
                                const titleDiv = this.shadowRoot.querySelector('.Title');
                                if (titleDiv) titleDiv.textContent = this.props.title;
                                break;

                            case 'data':
                                let localData = localStorage.getItem(this.id || 'FastFieldSetData');
                                let dataObj = localData ? JSON.parse(localData) : this.props.data;

                                for (let key in dataObj) {
                                    let label = document.createElement('label');
                                    label.textContent = key;

                                    let input = document.createElement('input');
                                    input.name = key;
                                    input.value = dataObj[key];

                                    this.addRow({
                                        elements: [label, input],
                                        styleRow: { 'gap': '10px', 'margin-bottom': '8px' }
                                    });
                                }
                                break;

                            default:
                                this[prop] = this.props[prop];
                                this.setAttribute(prop, this.props[prop]);
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

    addRow({ elements = [], styleRow = {} }, index = null) {
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

        Object.assign(row.style, styleRow);

        if (index === null || index >= this.rowsContainer.children.length) {
            this.rowsContainer.appendChild(row);
        } else {
            this.rowsContainer.insertBefore(row, this.rowsContainer.children[index]);
        }

        return this;
    }

    getData() {
        const data = {};
        const inputs = this.shadowRoot.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            if (input.name) {
                data[input.name] = input.value;
            }
        });
        return data;
    }

    saveData() {
        const data = this.getData();
        localStorage.setItem(this.id || 'FastFieldSetData', JSON.stringify(data));
        this.showStatus("✅ Datos guardados");
    }

    resetData() {
        localStorage.removeItem(this.id || 'FastFieldSetData');
        this.rowsContainer.innerHTML = '';
        this.#checkProps();

        // Restaurar los botones si se definió la función
        if (typeof this.agregarBotones === 'function') {
            this.agregarBotones();
        }

        this.showStatus("🔄 Datos restablecidos");
    }

    showStatus(message) {
        this.dispatchEvent(new CustomEvent('status', {
            bubbles: true,
            composed: true,
            detail: message
        }));
    }
};

if (!customElements.get('fast-fieldset')) {
    customElements.define('fast-fieldset', FastFieldSet);
}
