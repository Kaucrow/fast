export const FastPopUpMenu = class extends Fast {
    constructor(props) {
        super();
        this.name = "FastPopUpMenu";
        this.props = props;
        if (props && props.id) this.id = props.id;
        this.built = () => {};
        this.attachShadow({ mode: "open" });
        this._isBuilt = false;
        this.objectProps = new Map();
    }

    #getTemplate() {
        return `
            <div id="fast-popup-menu">
                <ul></ul>
            </div>
        `;
    }

    async #getCss() {
        return await fast.getCssFile("FastPopUpMenu");
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
                this.mainElement = tpc.firstChild.nextSibling;
                this.shadowRoot.appendChild(this.template.content.cloneNode(true));
                resolve(this);
            } catch (error) {
                reject(error);
            }
        });
    }

    #checkAttributes() {
        return new Promise(async (resolve, reject) => {
            try {
                for (let attr of this.getAttributeNames()) {
                    if (attr.substring(0, 2) !== "on") {
                        this[attr] = this.getAttribute(attr);
                    }
                    switch (attr) {
                        case 'id':
                            await fast.createInstance('FastPopUpMenu', { 'id': this[attr] });
                            break;
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
                                for (let attrcss in this.props.style)
                                    this.mainElement.style[attrcss] = this.props.style[attrcss];
                                break;
                            case 'events':
                                for (let attrevent in this.props.events)
                                    this.mainElement.addEventListener(attrevent, this.props.events[attrevent]);
                                break;
                            default:
                                this.setAttribute(attr, this.props[attr]);
                                this[attr] = this.props[attr];
                                if (attr === 'id')
                                    await fast.createInstance('FastPopUpMenu', { 'id': this[attr] });
                        }
                    }
                    resolve(this);
                } else {
                    resolve();
                }
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
                    this[key] = value;
                    this.objectProps.delete(key);
                }
                resolve(this);
            } catch (e) {
                reject(e);
            }
        });
    }

    addItem(text, callback) {
        const ul = this.shadowRoot.querySelector('ul');
        const li = document.createElement('li');
        li.textContent = text;
        li.addEventListener('click', callback);
        ul.appendChild(li);
    }

    show(event) {
        const popupMenu = this.shadowRoot.querySelector('#fast-popup-menu');
        popupMenu.style.display = 'block';
        popupMenu.style.zIndex = fast.getMaxZIndex();

        const menuRect = popupMenu.getBoundingClientRect();
        const menuWidth = menuRect.width;
        const menuHeight = menuRect.height;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let left = event.clientX;
        let top = event.clientY;

        if (left + menuWidth > viewportWidth) {
            left = viewportWidth - menuWidth;
            if (left < 0) left = 0;
        }
  
        if (top + menuHeight > viewportHeight) {
            top = viewportHeight - menuHeight;
            if (top < 0) top = 0;
        }

        popupMenu.style.left = `${left}px`;
        popupMenu.style.top = `${top}px`;
    }

    hide() {
        const popupMenu = this.shadowRoot.querySelector('#fast-popup-menu');
        popupMenu.style.display = 'none';
    }

    addToBody() { document.body.appendChild(this); }
}

if (!customElements.get('fast-popup-menu')) {
    customElements.define('fast-popup-menu', FastPopUpMenu);
}
