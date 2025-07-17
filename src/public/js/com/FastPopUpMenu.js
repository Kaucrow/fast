import './FastIcon.js';

export const FastPopUpMenu = class extends Fast {
    constructor(props) {
        super();
        this.name = "FastPopUpMenu";
        this.props = props;
        if (props?.id) this.id = props.id;
        this.attachShadow({ mode: "open" });
        this.menuStack = [];
        this.currentMenu = null;
        this.mainMenu = [];
        this.fixedItems = [];
        this.hasBuilt = false;

        document.addEventListener('click', e => {
            if (!this.menuContainer) return;
            const path = e.composedPath();
            if (!path.includes(this.menuContainer) &&
                !(this._toggleButton && path.includes(this._toggleButton))) {
                this.hide();
            }
        });
    }

    #getTemplate() {
        return `
            <div id="fast-popup-menu">
                <div class="header"></div>
                <div class="items"></div>
                <div class="footer"></div>
            </div>
        `;
    }

    async #getCss() {
        return await fast.getCssFile("FastPopUpMenu");
    }

    async connectedCallback() {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(await this.#getCss());
        this.shadowRoot.adoptedStyleSheets = [sheet];

        const tpl = document.createElement('template');
        tpl.innerHTML = this.#getTemplate();
        this.shadowRoot.appendChild(tpl.content.cloneNode(true));

        this.menuContainer   = this.shadowRoot.querySelector('#fast-popup-menu');
        this.headerContainer = this.shadowRoot.querySelector('.header');
        this.itemsContainer  = this.shadowRoot.querySelector('.items');
        this.footerContainer = this.shadowRoot.querySelector('.footer');

        if (this.props?.style) {
            Object.assign(this.menuContainer.style, this.props.style);
        }
        if (this.props?.toggleButtonId) {
            this._toggleButton = document.getElementById(this.props.toggleButtonId);
        }

        this.hasBuilt = true;
        await this.built();
        if (this.mainMenu.length) this._renderMenu(this.mainMenu);
    }

    addItem(text, iconName, callback, subItems) {
        this.mainMenu.push({ text, iconName, callback, subItems });
        if (this.hasBuilt) this._renderMenu(this.mainMenu);
        return this;
    }

    addFixedItem(text, iconName, callback) {
        this.fixedItems.push({ text, iconName, callback });
        if (this.hasBuilt) this._renderFixed();
        return this;
    }

    _renderHeader(title, showBack = false) {
        this.headerContainer.innerHTML = '';
        const row = document.createElement('div');
        row.className = 'menu-item header-content';

        const ic = document.createElement('fast-icon');
        ic.setAttribute('iconname', showBack ? 'leftArrow' : 'world');
        row.appendChild(ic);

        const span = document.createElement('span');
        span.textContent = title;
        row.appendChild(span);

        row.addEventListener('click', e => {
            e.stopPropagation();
            if (showBack) {
                this._navigateBack();
            } else {
                this.hide();
            }
        });

        this.headerContainer.appendChild(row);
    }

    _renderMenu(menuData, parent = null) {
        this.itemsContainer.innerHTML = '';
        this._renderHeader(parent?.text || 'Menu', !!parent);

        menuData.forEach(item => {
            const row = document.createElement('div');
            row.className = 'menu-item';

            const ic = document.createElement('fast-icon');
            ic.setAttribute('iconname', item.iconName);
            row.appendChild(ic);

            const txt = document.createElement('span');
            txt.textContent = item.text;
            row.appendChild(txt);

            if (item.subItems) {
                const arrow = document.createElement('fast-icon');
                arrow.setAttribute('iconname','arrowRight');
                arrow.className = 'arrow-right';
                row.appendChild(arrow);

                row.addEventListener('click', e => {
                    e.stopPropagation();
                    this.menuStack.push(menuData);
                    this._renderMenu(item.subItems, item);
                });
            } else {
                row.addEventListener('click', e => {
                    e.stopPropagation();
                    item.callback?.();
                    this.hide();
                });
            }

            this.itemsContainer.appendChild(row);
        });

        this._renderFixed();
        this.currentMenu = menuData;
    }

    _renderFixed() {
        this.footerContainer.innerHTML = '';
        this.fixedItems.forEach(item => {
            const row = document.createElement('div');
            row.className = 'fixed-item';

            const ic = document.createElement('fast-icon');
            ic.setAttribute('iconname', item.iconName);
            row.appendChild(ic);

            const txt = document.createElement('span');
            txt.textContent = item.text;
            row.appendChild(txt);

            row.addEventListener('click', e => {
                e.stopPropagation();
                item.callback?.();
                this.hide();
            });

            this.footerContainer.appendChild(row);
        });
    }

    _navigateBack() {
        const prev = this.menuStack.pop();
        this._renderMenu(prev);
    }

    show() {
        this.menuContainer.classList.add('visible');
    }

    hide() {
        this.menuContainer.classList.remove('visible');
    }

    addToBody() {
        document.body.appendChild(this);
    }
};

if (!customElements.get('fast-popup-menu')) {
    customElements.define('fast-popup-menu', FastPopUpMenu);
}