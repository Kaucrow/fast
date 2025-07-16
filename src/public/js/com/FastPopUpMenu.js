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
        this.menuStack = [];
        this.currentMenu = null;
        this.mainMenu = [];
        this.currentMenuElement = null;
        this.menuContainer = null;
        this.hasBuilt = false;
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
                const sheet = new CSSStyleSheet();
                const css = await this.#getCss();
                sheet.replaceSync(css);
                this.shadowRoot.adoptedStyleSheets = [sheet];
                this.template = document.createElement('template');
                this.template.innerHTML = this.#getTemplate();
                this.shadowRoot.appendChild(this.template.content.cloneNode(true));
                this.menuContainer = this.shadowRoot.querySelector('#fast-popup-menu');
                resolve(this);
            } catch (error) {
                reject(error);
            }
        });
    }

    #checkAttributes() {
        return new Promise(async (resolve, reject) => {
            try {
                for (const attr of this.getAttributeNames()) {
                    if (!attr.startsWith("on")) {
                        this[attr] = this.getAttribute(attr);
                    }
                    if (attr === 'id') {
                        await fast.createInstance('FastPopUpMenu', { id: this[attr] });
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
                    for (const [attr, val] of Object.entries(this.props)) {
                        if (attr === 'style') {
                            Object.assign(this.menuContainer.style, val);
                        } else if (attr === 'events') {
                            for (const [evt, fn] of Object.entries(val)) {
                                this.menuContainer.addEventListener(evt, fn);
                            }
                        } else {
                            this.setAttribute(attr, val);
                            this[attr] = val;
                            if (attr === 'id') {
                                await fast.createInstance('FastPopUpMenu', { id: val });
                            }
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

        if (this.props?.style) {
            Object.assign(this.menuContainer.style, this.props.style);
        }

        await this.built();
        this.hasBuilt = true;

        if (this.mainMenu.length > 0) {
            const menuEl = await this.#renderMenu(this.mainMenu);
            this.currentMenu = this.mainMenu;
            this.currentMenuElement = menuEl;
        }
    }

    #applyProps() {
        return new Promise((resolve, reject) => {
            try {
                for (const [k, v] of this.objectProps.entries()) {
                    this[k] = v;
                    this.objectProps.delete(k);
                }
                resolve(this);
            } catch (e) {
                reject(e);
            }
        });
    }

    addItem(text, iconName, callback, subItems) {
        let name = iconName || '';
        const m = name.match(/([^\/]+?)(?:\.svg)?$/);
        if (m) name = m[1];

        const menuItem = { text, iconName: name, callback, subItems, subMenuElement: null };
        this.mainMenu.push(menuItem);

        if (this.hasBuilt && this.currentMenu === this.mainMenu) {
            this.#cleanupMenus();
            this.#renderMenu(this.mainMenu).then(el => {
                this.currentMenuElement = el;
                if (this.menuContainer.style.display === 'block') el.style.display = 'block';
            });
        }

        return menuItem;
    }

    #renderMenu(menuData, parentItem = null) {
        return new Promise(resolve => {
            const menuDiv = document.createElement('div');
            menuDiv.className = 'menu-level';
            menuDiv.style.display = 'none';

            const ul = document.createElement('ul');
            menuDiv.appendChild(ul);

            if (parentItem) {
                const backLi = document.createElement('li');
                backLi.className = 'menu-item back-item';
                backLi.innerHTML = `
                    <fast-icon iconname="arrowLeft"></fast-icon>
                    <span class="menu-text">Volver</span>
                `;
                backLi.addEventListener('click', e => { e.stopPropagation(); this.#navigateBack(); });
                ul.appendChild(backLi);
            }

            for (const item of menuData) {
                const li = document.createElement('li');
                li.className = 'menu-item';
                li.innerHTML = `
                    <fast-icon iconname="${item.iconName}"></fast-icon>
                    <span class="menu-text">${item.text}</span>
                    ${item.subItems ? '<fast-icon iconname="arrowRight"></fast-icon>' : ''}
                `;
                li.addEventListener('click', e => {
                    e.stopPropagation();
                    if (item.subItems) this.#navigateToSubmenu(item);
                    else { item.callback?.(); this.hide(); }
                });
                ul.appendChild(li);
            }

            this.menuContainer.appendChild(menuDiv);
            resolve(menuDiv);
        });
    }

    #navigateToSubmenu(menuItem) {
        if (this.currentMenuElement) this.currentMenuElement.style.display = 'none';
        this.menuStack.push({ menu: this.currentMenu, element: this.currentMenuElement });

        if (!menuItem.subMenuElement) {
            this.#renderMenu(menuItem.subItems, menuItem).then(newMenu => {
                menuItem.subMenuElement = newMenu;
                this.currentMenu = menuItem.subItems;
                this.currentMenuElement = newMenu;
                newMenu.style.display = 'block';
            });
        } else {
            this.currentMenu = menuItem.subItems;
            this.currentMenuElement = menuItem.subMenuElement;
            this.currentMenuElement.style.display = 'block';
        }
    }

    #navigateBack() {
        if (!this.menuStack.length) return;
        this.currentMenuElement.style.display = 'none';
        const prev = this.menuStack.pop();
        this.currentMenu = prev.menu;
        this.currentMenuElement = prev.element;
        this.currentMenuElement.style.display = 'block';
    }

    #cleanupMenus() {
        this.menuContainer.innerHTML = '';
        this.menuStack = [];
        this.currentMenuElement = null;
    }

    show(event) {
        this.menuContainer.style.display = 'block';
        this.menuContainer.style.zIndex = fast.getMaxZIndex();
        this.#positionMenu(event);
        if (this.currentMenuElement) this.currentMenuElement.style.display = 'block';
    }

    #positionMenu(event) {
        const rect = this.menuContainer.getBoundingClientRect();
        const vw = window.innerWidth, vh = window.innerHeight;
        let left = event.clientX, top = event.clientY;
        if (left + rect.width > vw) left = vw - rect.width;
        if (top + rect.height > vh) top = vh - rect.height;
        this.menuContainer.style.left = `${Math.max(0, left)}px`;
        this.menuContainer.style.top = `${Math.max(0, top)}px`;
    }

    hide() {
        this.menuContainer.style.display = 'none';
        if (this.currentMenu !== this.mainMenu) {
            this.currentMenuElement.style.display = 'none';
            this.currentMenu = this.mainMenu;
            this.currentMenuElement = this.menuContainer.querySelector('.menu-level');
            this.menuStack = [];
        }
    }

    addToBody() {
        document.body.appendChild(this);
    }
};

if (!customElements.get('fast-popup-menu')) {
    customElements.define('fast-popup-menu', FastPopUpMenu);
}