// FastFieldSet.js
export const FastFieldSet = class extends Fast {
    constructor(props) {
        super();
        this.name = "FastFieldset";
        this.props = props || {};
        if (props && props.id) this.id = props.id;
        this.built = () => {};
        this.attachShadow({ mode: 'open' });
        this._isBuilt = false;
        this.isRoot = this.hasAttribute('is-root') || !!this.props?.isRoot;

    }

    #getTemplate() {
        return `
            <fieldset class="FieldSet">
                <legend class="Title"></legend>
                <div class="Row">
                    <slot></slot>
                </div>
                ${this.isRoot ? `
                    <div class="button-container">
                        <fast-button id = "Cancelar" caption="cancelar"></fast-button>
                        <fast-button id = "Enviar" caption="Enviar"></fast-button>
                    </div>
                ` : ''}
            </fieldset>
        `;
    }



    async #getCss() {
        const response = await fetch('../js/css/FastFieldSet.css');
        return await response.text();
    }

    #checkAttributes() {
        return new Promise((resolve) => {
            this.props = this.props || {};
            for (let attr of this.getAttributeNames()) {
                if (!attr.startsWith('on')) {
                    let val = this.getAttribute(attr);
                    try { this.props[attr] = JSON.parse(val); } catch { this.props[attr] = val; }
                    this[attr] = this.props[attr];
                }
            }
            resolve(this);
        });
    }

    #checkProps() {
        return new Promise((resolve) => {
            if (this.props) {
                for (let prop in this.props) {
                    if (prop === 'style') {
                        for (let cssProp in this.props.style) {
                            this.shadowRoot.querySelector('.FieldSet')
                                .style.setProperty(cssProp, this.props.style[cssProp]);
                        }
                    } else if (prop === 'title') {
                        const titleDiv = this.shadowRoot.querySelector('.Title');
                        if (titleDiv) titleDiv.textContent = this.props.title;
                    } else {
                        this.setAttribute(prop, this.props[prop]);
                    }
                }
            }
            resolve(this);
        });
    }

    #render(css) {
        return new Promise((resolve, reject) => {
            try {
                const tpl = document.createElement('template');
                tpl.innerHTML = this.#getTemplate();
                const sheet = new CSSStyleSheet();
                sheet.replaceSync(css);
                this.shadowRoot.adoptedStyleSheets = [sheet];
                this.shadowRoot.appendChild(tpl.content.cloneNode(true));
                this.mainElement = this.shadowRoot.querySelector('.FieldSet');
                this.rowsContainer = this.shadowRoot.querySelector('.Row');
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

        this._registerButtonEvents();
    }

    _registerButtonEvents() {
        const clearBtn = this.shadowRoot.querySelector('#Cancelar');
        const saveBtn = this.shadowRoot.querySelector('#Enviar');

        if (clearBtn) {
            clearBtn.addEventListener('click', () => this._clearAll());
        }

        if (saveBtn) {
            const patronesPorTipo = {
                tx: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/,    // texto
                nm: /^\d{7,15}$/,                   // número telefono o similar
                gm: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,  // gmail
            };
            saveBtn.addEventListener('click', () => this._validateAndSend(patronesPorTipo));
        }
    }

    

    _clearAll() {
        this.querySelectorAll('input').forEach(i => {
            i.value = '';
            i.classList.remove('invalid');
            const msg = i.nextElementSibling;
            if (msg && msg.classList.contains('error-message')) msg.remove();
        });
    }

    _validateAndSend(patronesPorTipo) {
        const inputs = Array.from(this.querySelectorAll('input'));
        let allValid = true;

        inputs.forEach(input => {
            input.classList.remove('invalid');
            const msg = input.nextElementSibling;
            if (msg && msg.classList.contains('error-message')) msg.remove();

            const val = input.value.trim();
            const tipo = input.dataset.valtype; // lee el atributo data-valtype

            if (!val) {
            allValid = false;
            this._markError(input, 'Este campo es obligatorio');
            } else if (tipo && patronesPorTipo[tipo] && !patronesPorTipo[tipo].test(val)) {
            allValid = false;
            this._markError(input, 'Formato inválido');
            }
        });

        if (!allValid) {
            const first = this.querySelector('input.invalid');
            if (first) first.focus();
            return;
        }
        this.sendData(this.getFields());
        }


    _markError(input, message) {
        input.classList.add('invalid');
        const err = document.createElement('div');
        err.classList.add('error-message');
        err.textContent = message;
        input.insertAdjacentElement('afterend', err);
    }

    addContent(element) {
        if (this.rowsContainer) this.rowsContainer.appendChild(element);
    }

    getFields() {
        const data = {};
        this.querySelectorAll('input').forEach(i => {
            data[i.name] = i.value;
        });
        return data;
    }


    async sendData(data) {
        try {
            const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            console.log('Datos enviados:', await res.json());
        } catch (e) {
            console.error('Error al enviar:', e);
        }
    }

    addToBody() {
        document.body.appendChild(this);
        return this;
    }
};

if (!customElements.get('fast-fieldset')) {
    customElements.define('fast-fieldset', FastFieldSet);
}
