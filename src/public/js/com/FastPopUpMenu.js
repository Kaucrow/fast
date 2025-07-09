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
                let sheet = new CSSStyleSheet();
                let css = await this.#getCss();
                sheet.replaceSync(css);
                this.shadowRoot.adoptedStyleSheets = [sheet];
                this.template = document.createElement('template');
                this.template.innerHTML = this.#getTemplate();
                let tpc = this.template.content.cloneNode(true);
                this.mainElement = tpc.firstChild.nextSibling;
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
        
        if (this.props && this.props.style) {
            for (let key in this.props.style) {
                this.menuContainer.style[key] = this.props.style[key];
            }
        }

        await this.built();
        this.hasBuilt = true;

        if (this.mainMenu.length > 0) {
            const menuElement = await this.#renderMenu(this.mainMenu);
            this.currentMenu = this.mainMenu;
            this.currentMenuElement = menuElement;
        }
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

    addItem(text, imgSrc, callback, subItems) {
        const menuItem = {
            text,
            imgSrc,
            callback,
            subItems,
            subMenuElement: null
        };
        
        if (!this.mainMenu) this.mainMenu = [];
        this.mainMenu.push(menuItem);

        if (this.hasBuilt && this.currentMenu === this.mainMenu) {
            this.#cleanupMenus();
            this.#renderMenu(this.mainMenu).then((menuElement) => {
                this.currentMenuElement = menuElement;
                if (this.menuContainer.style.display === 'block') {
                    menuElement.style.display = 'block';
                }
            });
        }
        
        return menuItem;
    }

    #renderMenu(menuData, parentItem = null) {
        return new Promise((resolve) => {
            const menuDiv = document.createElement('div');
            menuDiv.className = 'menu-level';
            menuDiv.style.display = 'none';
            
            const ul = document.createElement('ul');
            menuDiv.appendChild(ul);

            if (parentItem) {
                const backItem = document.createElement('li');
                backItem.style.display = 'flex';
                backItem.style.alignItems = 'center';
                backItem.style.padding = '8px 12px';
                backItem.style.cursor = 'pointer';
                backItem.style.fontWeight = 'bold';
                backItem.innerHTML = `
                    <span style="display: flex; align-items: center;">
                        <img src="../images/icons/leftArrow.svg" style= "margin-left 8px; margin-right: 2px;">
                    </span>
                `;
                backItem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.#navigateBack();
                });
                ul.appendChild(backItem);
            }

            menuData.forEach(item => {
                const li = document.createElement('li');
                li.style.display = 'flex';
                li.style.alignItems = 'center';
                li.style.justifyContent = 'space-between';
                li.style.padding = '8px 12px';
                li.style.cursor = 'pointer';
                
                const itemContent = document.createElement('div');
                itemContent.style.display = 'flex';
                itemContent.style.alignItems = 'center';
                itemContent.style.flexGrow = '1';
                
                if (item.imgSrc) {
                    const img = document.createElement('img');
                    img.src = item.imgSrc;
                    itemContent.appendChild(img);
                }
                
                const textSpan = document.createElement('span');
                textSpan.textContent = item.text;
                itemContent.appendChild(textSpan);
                
                li.appendChild(itemContent);

                if (item.subItems && item.subItems.length > 0) {
                    const arrow = document.createElement('img');
                    arrow.src = '../images/icons/arrowRight.svg';
                    arrow.style.marginLeft = '8px';
                    arrow.style.marginRight = '2px';
                    li.appendChild(arrow);
                    
                    li.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.#navigateToSubmenu(item);
                    });
                } else {
                    li.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (typeof item.callback === 'function') item.callback();
                        this.hide();
                    });
                }
                
                ul.appendChild(li);
            });
            
            this.menuContainer.appendChild(menuDiv);
            resolve(menuDiv);
        });
    }

    #navigateToSubmenu(menuItem) {
        if (this.currentMenuElement) {
            this.currentMenuElement.style.display = 'none';
        }
        
        this.menuStack.push({
            menu: this.currentMenu,
            element: this.currentMenuElement
        });

        if (!menuItem.subMenuElement) {
            this.#renderMenu(menuItem.subItems, menuItem).then((newMenu) => {
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
        if (this.menuStack.length > 0) {
            this.currentMenuElement.style.display = 'none';

            const prevMenu = this.menuStack.pop();
            this.currentMenu = prevMenu.menu;
            this.currentMenuElement = prevMenu.element;
            this.currentMenuElement.style.display = 'block';
        }
    }

    #appendSubMenu(parentLi, subItems) {
        const subMenu = document.createElement('ul');
        subMenu.style.position = 'absolute';
        subMenu.style.top = '0';
        subMenu.style.left = '100%';
        subMenu.style.minWidth = '160px';
        subMenu.style.background = 'inherit';
        subMenu.style.border = '1px solid #ccc';
        subMenu.style.display = 'none';
        subMenu.style.zIndex = '9999';
        subMenu.style.padding = '0';
        subMenu.style.margin = '0';

        subItems.forEach(sub => {
            const subLi = document.createElement('li');
            subLi.style.display = 'flex';
            subLi.style.alignItems = 'center';
            subLi.style.justifyContent = 'space-between';
            subLi.style.position = 'relative';

            const subSpan = document.createElement('span');
            subSpan.textContent = sub.text;
            subLi.appendChild(subSpan);

            if (sub.imgSrc) {
                const subImg = document.createElement('img');
                subImg.src = sub.imgSrc;
                subLi.appendChild(subImg);
            }

            if (Array.isArray(sub.subItems) && sub.subItems.length > 0) {
                const subArrow = document.createElement('span');
                subArrow.innerHTML = `<img src="../images/icons/arrowRight.svg"> style="margin-left: 8px; margin-right: 2px;">`;
                subLi.appendChild(subArrow);
                this.#appendSubMenu(subLi, sub.subItems);
            }

            if (typeof sub.callback === 'function') {
                subLi.addEventListener('click', (e) => {
                    e.stopPropagation();
                    sub.callback();
                    this.hide();
                });
            }
            subMenu.appendChild(subLi);
        });

        parentLi.appendChild(subMenu);
        parentLi.addEventListener('mouseenter', () => {
            subMenu.style.display = 'block';
        });
        parentLi.addEventListener('mouseleave', () => {
            subMenu.style.display = 'none';
        });
    }

    #cleanupMenus() {
        while (this.menuContainer.firstChild) {
            this.menuContainer.removeChild(this.menuContainer.firstChild);
        }
        this.currentMenuElement = null;
        this.menuStack = [];
    }

    show(event) {
        this.menuContainer.style.display = 'block';
        this.menuContainer.style.zIndex = fast.getMaxZIndex();
        
        this.#positionMenu(event);

        if (this.currentMenuElement) {
            this.currentMenuElement.style.display = 'block';
        }
    }

      #positionMenu(event) {
        const menuRect = this.menuContainer.getBoundingClientRect();
        const menuWidth = menuRect.width;
        const menuHeight = menuRect.height;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let left = event.clientX;
        let top = event.clientY;

        if (left + menuWidth > viewportWidth) {
            left = viewportWidth - menuWidth;
        }
        if (top + menuHeight > viewportHeight) {
            top = viewportHeight - menuHeight;
        }

        this.menuContainer.style.left = `${Math.max(0, left)}px`;
        this.menuContainer.style.top = `${Math.max(0, top)}px`;
    }

    hide() {
        this.menuContainer.style.display = 'none';

        if (this.currentMenuElement && this.currentMenu !== this.mainMenu) {
            this.currentMenuElement.style.display = 'none';
            this.currentMenu = this.mainMenu;
            this.currentMenuElement = this.menuContainer.querySelector('.menu-level');
            this.menuStack = [];
        }
    }

    addToBody() { document.body.appendChild(this); }
}

if (!customElements.get('fast-popup-menu')) {
    customElements.define('fast-popup-menu', FastPopUpMenu);
}