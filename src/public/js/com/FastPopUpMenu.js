class FastPopUpMenu extends HTMLElement {
    constructor(){
        super();
        this.attachShadow({mode: "open"});

        const linkElem = document.createElement('link');
        linkElem.setAttribute('rel', 'stylesheet');
        linkElem.setAttribute('href', '../js/css/FastPopUpMenu.css');
        this.shadowRoot.appendChild(linkElem);

        const menuDiv = document.createElement('div');
        menuDiv.id = 'fast-popup-menu';
        const ul = document.createElement('ul');
        menuDiv.appendChild(ul);
        this.shadowRoot.appendChild(menuDiv);
    }

    addItem(text, callback){
        const ul = this.shadowRoot.querySelector('ul');
        const li = document.createElement('li');
        li.textContent = text;
        li.addEventListener('click', callback);
        ul.appendChild(li);
    }

    show(event){
        const popupMenu = this.shadowRoot.querySelector('#fast-popup-menu');
        popupMenu.style.top = `${event.clientY}px`;
        popupMenu.style.left = `${event.clientX}px`;
        popupMenu.style.display = 'block';
    }

    hide(){
        const popupMenu = this.shadowRoot.querySelector('#fast-popup-menu');
        popupMenu.style.display = 'none';
    }
}

customElements.define('fast-popup-menu', FastPopUpMenu);
