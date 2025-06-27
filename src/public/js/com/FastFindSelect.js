/**
 * Creates an instance of a searchable select (combobox) component.
 * @class FastFindSelect
 * @extends Fast
 */
export const FastFindSelect = class extends Fast{
    constructor(props){
        super();
        this.name = "FastFindSelect";
        this.props = props || {};
        if(props && props.id) this.id = props.id;
        
        this.built = ()=>{};   
        this.attachShadow({mode:'open'});   
        this.isShow = false;     
        this._options = [];
        this._caption = "";
        this._enabled = true;
        this._selectedValue = null;
    }

    static observedAttributes = ["caption", "value"];

    #getTemplate(){ return `
        <div class='FastFindSelect'>
            <div class = 'FastFindSelectInputContainer'>
                <div class = 'FastFindSelectButtonDown'></div>
            </div>
            <div class = 'FastFindSelectPanel'></div>
        </div>
        `    
    }

    async #getCss(){ 
        return await fast.getCssFile("FastFindSelect"); 
    }

    #checkProps(){
        return new Promise(async (resolve) => {
            if(!this.props) resolve(this);
            for(let attr in this.props){
                switch(attr){
                    case 'style' :
                        for(let attrcss in this.props.style) this.mainElement.style[attrcss] = this.props.style[attrcss];
                        break;
                    case 'events' : 
                        for(let attrevent in this.props.events) this.mainElement.addEventListener(attrevent, this.props.events[attrevent]);
                        break;
                    case 'id' : 
                        this.id = this.props[attr];
                        break;
                    default : 
                        this[attr] = this.props[attr];                                
                }
            }
            resolve(this);
        })
    }
    
    #render(css){   
        return new Promise(async (resolve) => {
            this.template = document.createElement('template');
            this.template.innerHTML = this.#getTemplate();
            let sheet = new CSSStyleSheet();
            sheet.replaceSync(css);
            this.shadowRoot.adoptedStyleSheets = [sheet];
            
            let tpc = this.template.content.cloneNode(true);  
            this.shadowRoot.appendChild(tpc);

            this.mainElement = this.shadowRoot.querySelector('.FastFindSelect');
            this.inputContainer = this.shadowRoot.querySelector('.FastFindSelectInputContainer');
            this.buttonComboCheck = this.shadowRoot.querySelector('.FastFindSelectButtonDown');                
            this.panel = this.shadowRoot.querySelector('.FastFindSelectPanel');

            this.fastEdit = await fast.createInstance('FastEdit', {
                id: this.id + '_edit',
                caption: this._caption,
            })

            this.inputContainer.insertBefore(this.fastEdit, this.inputContainer.firstChild);
            await new Promise((resolveFastEdit) => {
                this.fastEdit.built = resolveFastEdit; 
            })
                

            this.inputElement = this.fastEdit.getEdit() //getEdit() returns the input element
            this.inputElement.style.paddingRight = '30px'; // Space for the button


            //this.labelElement = tpc.querySelector('.FastLabel');                                          
            //this.shadowRoot.appendChild(this.mainElement);  
            this.mainElement.id = this.id;
            resolve(this);
        })        
    }

    get caption (){ return this.fastEdit.caption; }
    set caption (val) {
        this._caption = val;
        if (this.fastEdit) {
            this.fastEdit.caption = val;
        }
    }


    /**
     * Adds a selectable option to the list.
     * @param {object} option - An object like {'text': 'Display Text', 'value': 'someValue'}
     */
    addOption(option){
        const optionEl = document.createElement('div');
        optionEl.className = 'FastFindSelectOption'; 
        optionEl.textContent = option.text;
        optionEl.dataset.value = option.value;

        // Store the element with the option data
        const optionData = { ...option, element: optionEl };
        this._options.push(optionData);
        
        optionEl.addEventListener('click', (e) => {
            e.stopPropagation();
            this.fastEdit.value = optionData.text; // Set input text
            this._selectedValue = optionData.value;   // Internally store the selected value
            this.hideOptions();
            // Dispatch a change event for external listeners
            this.dispatchEvent(new CustomEvent('change', { detail: { value: this._selectedValue, text: optionData.text } }));
        });

        this.panel.appendChild(optionEl);
    }
    
    #filterOptions() {
        const filterText = this.inputElement.value.toLowerCase();
        this._options.forEach(opt => {
            const isMatch = opt.text.toLowerCase().includes(filterText);
            opt.element.style.display = isMatch ? '' : 'none';
        });
        this.showOptions();
    }

    showOptions(){
        const visibleOptions = this._options.filter(opt => opt.element.style.display !== 'none');
        if (visibleOptions.length > 0) {
            // Adjust height based on visible items
            const itemHeight = parseInt(window.getComputedStyle(visibleOptions[0].element).height, 25);
            const calculatedHeight = itemHeight * visibleOptions.length;
            this.panel.animate([{ visibility: 'visible', height: calculatedHeight + 'px' }], { duration: 300, fill: 'both' });
        } else {
            this.panel.animate([{ visibility: 'hidden', height: '0px' }], { duration: 300, fill: 'both' });
        }
        this.isShow = true;
    }    

    hideOptions(){
        //if(this.inputElement.value.trim()==='') this.labelElement.style.animationName = 'labelDown';
        this.panel.animate([{ visibility: 'hidden', height:'0px' }],{duration:300, fill:'both'});
        this.isShow = false;
    };

    #events(){
        // Typing in the input filters the list
        this.inputElement.addEventListener('keyup', () => {
            this.#filterOptions();
        });
        
        // Show list on focus
        this.inputElement.addEventListener('focus', () => {
            this.showOptions();
        });

        //Toggle with button
        if (this.buttonComboCheck) {
            this.buttonComboCheck.addEventListener('click', (e) => {
            e.stopPropagation();
            if(!this.isShow) { this.showOptions(); this.inputElement.focus()} else { this.hideOptions(); } 
        });
        }
        

        // Hide list when clicking elsewhere
        document.body.addEventListener('click', (e) => {
            if (this.isShow && !this.contains(e.target)) {
                this.hideOptions();
            } 
        });

        this.inputElement.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isShow) {
                this.hideOptions();
                this.inputElement.blur(); 
            }
        })

        this.mainElement.addEventListener('focusout', (e) => {
            if (!this.mainElement.contains(e.relatedTarget)) {
                this.hideOptions();
            }
        })
        

    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'caption') {
            this.caption = newValue;
        } else if (name === 'value') {
            this.value = newValue;
        }
    }

    async connectedCallback(){
        await this.#render(await this.#getCss());
        await this.#checkProps();     
        this.#events();
        
        const options = this.querySelectorAll('option');
        options.forEach(opt => {
            this.addOption({ 
                text: opt.textContent, 
                value: opt.value || opt.textContent
            });
        });

        if (this.hasAttribute('value')) {
            this.value = this.getAttribute('value'); 
        }

        this.built(this);
    }

    addToBody(){document.body.appendChild(this); return this;}
    
    
    get value() { return this._selectedValue; }
    set value(val) {
    this._selectedValue = val;
    if (this.fastEdit) {
      const opt = this._options.find(o => o.value == val);
      if (opt) this.fastEdit.value = opt.text;
    }
  }
}

if (!customElements.get ('fast-findselect')) { customElements.define ('fast-findselect', FastFindSelect); }