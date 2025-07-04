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
    }

    #getTemplate() {
        return `
            <div class="FieldSet">
                <div class="Title"></div>
                <div class="Row">
                    <slot></slot> <!-- Contenido sloteado aquí -->
                </div>
            </div>
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

        // Si no hay nodos sloteados, crear fieldsets por defecto
        const hasSlotContent = this.querySelector('fieldset, *:not(script)');
        if (!hasSlotContent) {
            this.createDefaultFieldsets();
        }
    }

    createDefaultFieldsets() {
        const patterns = {
            nombre: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/,
            cedula: /^\d+$/,
            representante: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/,
            telefono: /^\d{7,15}$/,
            calle: /^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\.\s]+$/,
            ciudad: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/,
            codigoPostal: /^\d+$/
        };

        // Fieldsets por defecto
        const estudiante = document.createElement('fieldset');
        estudiante.innerHTML = `
            <legend>Estudiante</legend>
            <div class="field-row">
                <label for="nombre">Nombre:</label>
                <input type="text" id="nombre" name="nombre" value="Juan Pérez" />
            </div>
            <div class="field-row">
                <label for="cedula">Cédula:</label>
                <input type="text" id="cedula" name="cedula" value="12345678" />
            </div>
        `;

        const rep = document.createElement('fieldset');
        rep.innerHTML = `
            <legend>Representante</legend>
            <div class="field-row">
                <label for="representante">Representante:</label>
                <input type="text" id="representante" name="representante" value="Ana López" />
            </div>
            <div class="field-row">
                <label for="telefono">Teléfono:</label>
                <input type="text" id="telefono" name="telefono" value="9876543210" />
            </div>
        `;

        const dir = document.createElement('fieldset');
        dir.innerHTML = `
            <legend>Dirección</legend>
            <div class="field-row">
                <label for="calle">Calle:</label>
                <input type="text" id="calle" name="calle" value="Av. Principal" />
            </div>
            <div class="field-row">
                <label for="ciudad">Ciudad:</label>
                <input type="text" id="ciudad" name="ciudad" value="Caracas" />
            </div>
            <div class="field-row">
                <label for="codigoPostal">Código Postal:</label>
                <input type="text" id="codigoPostal" name="codigoPostal" value="1010" />
            </div>
        `;

        this.rowsContainer.append(estudiante, rep, dir);

        const btnCont = document.createElement('div');
        btnCont.classList.add('button-container');
        const clearBtn = document.createElement('button');
        clearBtn.textContent = 'Limpiar';
        clearBtn.classList.add('clear');
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Enviar';
        saveBtn.classList.add('save');
        btnCont.append(clearBtn, saveBtn);
        this.rowsContainer.appendChild(btnCont);

        clearBtn.addEventListener('click', () => this._clearAll());
        saveBtn.addEventListener('click', () => this._validateAndSend(patterns));
    }

    _clearAll() {
        this.rowsContainer.querySelectorAll('input').forEach(i => {
            i.value = '';
            i.classList.remove('invalid');
            const msg = i.nextElementSibling;
            if (msg && msg.classList.contains('error-message')) msg.remove();
        });
    }

    _validateAndSend(patterns) {
        const inputs = Array.from(this.rowsContainer.querySelectorAll('input'));
        inputs.forEach(i => {
            i.classList.remove('invalid');
            const msg = i.nextElementSibling;
            if (msg && msg.classList.contains('error-message')) msg.remove();
        });

        let allValid = true;
        inputs.forEach(input => {
            const val = input.value.trim();
            const name = input.name;
            if (!val) {
                allValid = false;
                this._markError(input, 'Este campo es obligatorio');
            } else if (patterns[name] && !patterns[name].test(val)) {
                allValid = false;
                this._markError(input, 'Formato inválido');
            }
        });

        if (!allValid) {
            const first = this.rowsContainer.querySelector('input.invalid');
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
        this.rowsContainer.querySelectorAll('input').forEach(i => data[i.name] = i.value);
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
