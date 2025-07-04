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
        if (this.props && this.props.style) {
            const popupMenu = this.shadowRoot.querySelector('#fast-popup-menu');
            for (let key in this.props.style) {
                popupMenu.style[key] = this.props.style[key];
            }
        }
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

    addItem(text, imgSrc, callback, subItems) {
        const ul = this.shadowRoot.querySelector('ul');
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.style.justifyContent = 'space-between';
        li.style.position = 'relative';

        const span = document.createElement('span');
        span.textContent = text;
        li.appendChild(span);

        if (imgSrc) {
            const img = document.createElement('img');
            img.src = imgSrc;
            img.style.height = '16px';
            img.style.width = '16px';
            img.style.marginLeft = '10px';
            img.style.marginRight = '0';
            li.appendChild(img);
        }

        if (Array.isArray(subItems) && subItems.length > 0) {
            const arrow = document.createElement('span');
            arrow.innerHTML = `<img src="../images/icons/arrowRight.svg" style="height: 16px; width: 16px; margin-left: 8px;">`;
            li.appendChild(arrow);

            const subMenu = document.createElement('ul');
            subMenu.style.position = 'absolute';
            subMenu.style.top = '0';
            subMenu.style.left = '100%';
            subMenu.style.minWidth = '100px';
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
                    subImg.style.height = '16px';
                    subImg.style.width = '16px';
                    subImg.style.marginLeft = '10px';
                    subImg.style.marginRight = '0';
                    subLi.appendChild(subImg);
                }

                if (Array.isArray(sub.subItems) && sub.subItems.length > 0) {
                    const subArrow = document.createElement('span');
                    subArrow.innerHTML = `<img src="../images/icons/arrowRight.svg" style="height: 16px; width: 16px; margin-left: 8px;">`;
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

            li.appendChild(subMenu);

            li.addEventListener('mouseenter', () => {
                subMenu.style.display = 'block';
            });
            li.addEventListener('mouseleave', () => {
                subMenu.style.display = 'none';
            });
        } else {
            li.addEventListener('click', (e) => {
                e.stopPropagation();
                if (typeof callback === 'function') callback();
                this.hide();
            });
        }

        ul.appendChild(li);
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
                subImg.style.height = '16px';
                subImg.style.width = '16px';
                subImg.style.marginLeft = '10px';
                subImg.style.marginRight = '0';
                subLi.appendChild(subImg);
            }

            if (Array.isArray(sub.subItems) && sub.subItems.length > 0) {
                const subArrow = document.createElement('span');
                subArrow.innerHTML = `<img src="../images/icons/arrowRight.svg" 
                    style="
                        height: 16px; 
                        width: 16px; 
                        margin-left: 8px;
                    ">
                `;
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