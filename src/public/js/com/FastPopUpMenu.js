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
        this.iconResolver = props?.iconResolver || null;

        this.headerConfig = props?.header || { 
            text: "Menu", 
            icon: "world" 
        };

        this._toggleButton = null;

        document.addEventListener('click', this.handleOutsideClick.bind(this));
    }

    handleOutsideClick(e) {
        if (!this.menuContainer) return;
        
        const path = e.composedPath();
        const isClickInsideMenu = path.includes(this.menuContainer);
        const isClickOnToggle = this._toggleButton && path.includes(this._toggleButton);
        
        if (!isClickInsideMenu && !isClickOnToggle) {
            this.hide();
        }
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

        this.menuContainer = this.shadowRoot.querySelector('#fast-popup-menu');
        this.headerContainer = this.shadowRoot.querySelector('.header');
        this.itemsContainer = this.shadowRoot.querySelector('.items');
        this.footerContainer = this.shadowRoot.querySelector('.footer');

        if (this.props?.style) {
            Object.assign(this.menuContainer.style, this.props.style);
        }
        
        if (this.props?.toggleButtonId) {
            this._toggleButton = document.getElementById(this.props.toggleButtonId);
            if (this._toggleButton) {
                this._toggleButton.addEventListener('click', this.toggleMenu.bind(this));
            }
        }

        this.hasBuilt = true;
        if (this.mainMenu.length) {
            this._renderMenu(this.mainMenu);
        } else {
            this._renderHeader(this.headerConfig.text);
            this._renderFixed();
        }
    }

    toggleMenu() {
        if (this.menuContainer.classList.contains('visible')) {
            this.hide();
        } else {
            this.show();
        }
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

        const iconContainer = document.createElement('div');
        iconContainer.className = 'menu-icon';
        
        if (this.iconResolver) {
            const icon = this.iconResolver(showBack ? 'leftArrow' : this.headerConfig.icon);
            if (icon) {
                if (typeof icon === 'string') {
                    iconContainer.innerHTML = icon;
                } else {
                    iconContainer.appendChild(icon);
                }
            }
        } else {
            iconContainer.textContent = showBack ? '←' : '☰';
        }
        
        row.appendChild(iconContainer);

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
        const headerTitle = parent?.text || this.headerConfig.text;
        this._renderHeader(headerTitle, !!parent);

        menuData.forEach(item => {
            const row = document.createElement('div');
            row.className = 'menu-item';

            // Ícono del item
            const iconContainer = document.createElement('div');
            iconContainer.className = 'menu-icon';
            
            if (this.iconResolver) {
                const icon = this.iconResolver(item.iconName);
                if (icon) {
                    if (typeof icon === 'string') {
                        iconContainer.innerHTML = icon;
                    } else {
                        iconContainer.appendChild(icon);
                    }
                }
            } else {
                iconContainer.textContent = '•';
            }
            
            row.appendChild(iconContainer);

            const txt = document.createElement('span');
            txt.textContent = item.text;
            row.appendChild(txt);

            if (item.subItems) {
                const arrowContainer = document.createElement('div');
                arrowContainer.className = 'menu-icon arrow-right';
                
                if (this.iconResolver) {
                    const arrow = this.iconResolver('arrowRight');
                    if (arrow) {
                        if (typeof arrow === 'string') {
                            arrowContainer.innerHTML = arrow;
                        } else {
                            arrowContainer.appendChild(arrow);
                        }
                    }
                } else {
                    arrowContainer.textContent = '→';
                }
                
                row.appendChild(arrowContainer);

                row.addEventListener('click', e => {
                    e.stopPropagation();
                    this.menuStack.push({
                        menuData: menuData,
                        parent: parent
                    });
                    this._renderMenu(item.subItems, item);
                });
            } else {
                row.addEventListener('click', e => {
                    e.stopPropagation();
                    if (item.callback) item.callback();
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

            const iconContainer = document.createElement('div');
            iconContainer.className = 'menu-icon';
            
            if (this.iconResolver) {
                const icon = this.iconResolver(item.iconName);
                if (icon) {
                    if (typeof icon === 'string') {
                        iconContainer.innerHTML = icon;
                    } else {
                        iconContainer.appendChild(icon);
                    }
                }
            } else {
                iconContainer.textContent = '★';
            }
            
            row.appendChild(iconContainer);

            const txt = document.createElement('span');
            txt.textContent = item.text;
            row.appendChild(txt);

            row.addEventListener('click', e => {
                e.stopPropagation();
                if (item.callback) item.callback();
                this.hide();
            });

            this.footerContainer.appendChild(row);
        });
    }

    _navigateBack() {
        if (this.menuStack.length > 0) {
            const saved = this.menuStack.pop();
            this._renderMenu(saved.menuData, saved.parent);
        } else {
            this._renderMenu(this.mainMenu);
        }
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