export const FastTreeview = class extends Fast {
  static observedAttributes = ["data"];

  constructor(props) {
    super();
    this.name = "FastTreeview";
    this.props = props;
    if (props && props.id) { this.id = props.id };
    this.built = () => {};
    this.attachShadow({ mode: 'open' });
    this._data = [];
    this._selectedNode = null;
    this._isBuilt = false;
    this.objectProps = new Map();
    this._readyPromise = new Promise(resolve => {
      this._resolveReady = resolve;
    });
  }

  #getTemplate() {
    return `
      <div class="tree-container"></div>
    `
  }

  async #getCss() {
    return await fast.getCssFile("FastTreeview");
  }

  async #render() {
    return new Promise(async(resolve, reject) => {
      try {
        let sheet = new CSSStyleSheet();
        let css = await this.#getCss();
        sheet.replaceSync(css);
        this.shadowRoot.adoptedStyleSheets = [sheet];
        this.template = document.createElement('template');
        this.template.innerHTML = this.#getTemplate();
        let tpc = this.template.content.cloneNode(true);
        this.mainElement = tpc.firstChild.nextSibling;
        this.shadowRoot.appendChild(this.mainElement);
        resolve(this);
      } catch (err) {
        reject(err);
      }
    })
  }

  async #checkAttributes(){
    return new Promise(async (resolve, reject) => {
      try {
        for (let attr of this.getAttributeNames()) {
          if (attr.substring(0,2) != "on") {
            this.mainElement.setAttribute(attr, this.getAttribute(attr));
            this[attr] = this.getAttribute(attr);
          }
          switch(attr) {
            case 'id': 
              await fast.createInstance('FastTreeview', { 'id': this[attr] });
              break;
            case 'data':
              this.data = JSON.parse(this.getAttribute('data'));
              break;
          }
        }
        resolve(this);
      } catch (error) {
        reject(error);
      }
    })
  }

  async #checkProps(){
    return new Promise(async (resolve, reject) => {
      try {
        if (this.props) {
          for (let attr in this.props) {
            switch(attr) {
              case 'style':
                for (let attrcss in this.props.style) this.mainElement.style[attrcss] = this.props.style[attrcss];
                break;
              case 'events': 
                for (let attrevent in this.props.events) {this.mainElement.addEventListener(attrevent, this.props.events[attrevent])}
                break;
              default: 
                this.setAttribute(attr, this.props[attr]);
                this[attr] = this.props[attr];
                if (attr === 'id') await fast.createInstance('FastTreeview', { 'id': this[attr] });
                if (attr === 'data') { this.data = this.props[attr] }
            }
          }
          resolve(this);
        }
        else { resolve(); }        
      } catch (error) {
        reject(error);
      }
    })
  }

  async connectedCallback() {
    await this.#render();
    await this.#checkAttributes();
    await this.#checkProps();
    this._isBuilt = true;
    await this.#applyProps();
    this._resolveReady(); // Mark as ready
    this.built();
  }

  async #applyProps() { 
    return new Promise((resolve, reject) => {
      try {
        for (const [key, value] of this.objectProps.entries()) {
          this.mainElement[key] = fast.parseBoolean(value);
          this.objectProps.delete(key);
        }
        resolve(this)
      }
      catch(e) {
        reject(e);
      }
    })
  }
  
  addToBody() { document.body.appendChild(this); }

  set data(value) {
    this._data = Array.isArray(value) ? value : [value];
    this._readyPromise.then(() => this.#renderTree());
  }

  get data() {
    return this._data;
  }

  get selectedNode() {
    return this._selectedNode;
  }

  #renderTree() {
    console.log(`CALLED RENDER TREE`);
    const container = this.shadowRoot.querySelector('.tree-container');
    container.innerHTML = '';

    if (this._data.length > 0) {
      const ul = document.createElement('ul');
      this._data.forEach(item => {
        ul.appendChild(this.#createTreeNode(item));
      });
      container.appendChild(ul);
    }
  }

  #createTreeNode(nodeData) {
    const li = document.createElement('li');
    const hasChildren = nodeData.children && nodeData.children.length > 0;
    li.className = hasChildren ? 'branch' : 'leaf';
    
    const nodeDiv = document.createElement('div');
    nodeDiv.className = 'node';
    
    const toggle = document.createElement('div');
    toggle.className = 'toggle';
    
    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = nodeData.label || nodeData.name || 'Unnamed';

    nodeDiv.appendChild(toggle);
    nodeDiv.appendChild(label);
    li.appendChild(nodeDiv);

    // Handle expand/collapse
    const toggleNode = () => {
      if (hasChildren) {
        li.classList.toggle('collapsed');
        toggle.classList.toggle('expanded');
      }
    };

    // Click handler for both toggle and label
    const clickHandler = (e) => {
      e.stopPropagation();
      toggleNode();
      
      // Handle selection
      if (this._selectedNode) {
        this._selectedNode.classList.remove('selected');
      }
      li.classList.add('selected');
      this._selectedNode = li;
      
      this.dispatchEvent(new CustomEvent('node-selected', {
        detail: { node: nodeData }
      }));
    };

    if (hasChildren) {
      toggle.addEventListener('click', clickHandler);
      label.addEventListener('click', clickHandler);

      const childUl = document.createElement('ul');
      nodeData.children.forEach(child => {
        childUl.appendChild(this.#createTreeNode(child));
      });
      li.appendChild(childUl);
      
      // Start expanded by default
      toggle.classList.add('expanded');
    } else {
      // Leaf node - only selection, no expand/collapse
      nodeDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this._selectedNode) {
          this._selectedNode.classList.remove('selected');
        }
        li.classList.add('selected');
        this._selectedNode = li;
        
        this.dispatchEvent(new CustomEvent('node-selected', {
          detail: { node: nodeData }
        }));
      });
    }
    
    return li;
  }
}

if (!customElements.get ('fast-treeview')) {
    customElements.define ('fast-treeview', FastTreeview);
}