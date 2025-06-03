export class FastCalendar extends Fast {
    constructor(props) {
        super();
        this.name  = 'FastCalendar';
        this.props = props;
        this.built = ()=> {};
        this.attachShadow({mode: 'open'});

        this.dateOrder = 'dd-mm-yyyy';
        this.currentDate = true;
        this.bodyVisible = true;
        this._isBuilt = false;
    }

    #getTemplate() {
        return `
      <div class="FastCalendar">
        <div class="FastCalendarHeader">
          <div class="FastCalendarHeader-DivInput"></div>
          <button class="FastCalendarHeader-Button">Ocultar</button>
        </div>
        <div class="FastCalendarBody">
          <div class="FastCalendarOptions">
          </div>
          <div class="FastCalendarDays"></div>
        </div>
      </div>
    `;
    }

    async #getCss() {return fast.getCssFile('FastCalendar');}

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
                this.shadowRoot.appendChild(this.mainElement);
                resolve(this);
            } catch(error){ reject(error);}
        })
    }

    #checkAttributes(){
        return new Promise(async (resolve, reject)=>{
            try {
                for (let attr of this.getAttributeNames()) {
                    if (attr.substring(0, 2) !== "on") {
                        this.mainElement.setAttribute(attr, this.getAttribute(attr));
                        this[attr] = this.getAttribute(attr);
                    }
                    switch(attr){
                        case 'date-order':
                            this.dateOrder = this[attr].toLowerCase();
                            break;
                        case 'current-date':
                            if (this[attr] === "false") this.currentDate = false;
                            break;
                        case 'id':
                            await fast.createInstance('FastCalendar', {'id': this[attr]});
                            break;
                    }
                }
                resolve(this);
            } catch (error) { reject(error); }
        })
    }

    #checkProps() {
        return new Promise((resolve, reject) => {
            try {
                if(this.props){
                    for(let attr in this.props){
                        switch(attr){
                            case 'style' :
                                for(let attrCSS in this.props.style){
                                    this.mainElement.style[attrCSS] = this.props.style[attrCSS];
                                }
                                break;
                            case 'events' :
                                for(let attrEvent in this.props.events){
                                    this.mainElement.addEventListener(attrEvent, this.props.events[attrEvent], false)
                                }
                                break;
                            case 'date-order':
                                this.dateOrder = this[attr].toLowerCase();
                                break;
                            case 'current-date':
                                if (this[attr] === "false") this.currentDate = false;
                                break;
                            default:
                                this.setAttribute(attr, this.props[attr]);
                                this[attr] = this.props[attr];
                                if (attr === 'id') {
                                    fast.createInstance('FastCalendar', { 'id': this[attr] });
                                    this.mainElement.id = this[attr];
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

    #applyProps() {
        return new Promise((resolve, reject) => {
            try {
                if (this.objectProps) {
                    for (const [key, value] of this.objectProps.entries()) {
                        this.mainElement[key] = fast.parseBoolean(value);
                        this.objectProps.delete(key);
                    }
                }
                resolve(this);
            } catch (e) {
                reject(e);
            }
        });
    }

    #formatDate() {
        const divInput = this.shadowRoot.querySelector('.FastCalendarHeader-DivInput');
        if (!divInput) return;

        divInput.innerHTML = '';

        const dayInput = document.createElement('input');
        dayInput.className = 'FastCalendarHeader-DayInput';
        dayInput.type = 'number';
        dayInput.placeholder = 'DD';
        dayInput.min = 1;
        dayInput.max = 31;

        const monthInput = document.createElement('input');
        monthInput.className = 'FastCalendarHeader-MonthInput';
        monthInput.type = 'number';
        monthInput.placeholder = 'MM';
        monthInput.min = 1;
        monthInput.max = 12;

        const yearInput = document.createElement('input');
        yearInput.className = 'FastCalendarHeader-YearInput';
        yearInput.type = 'number';
        yearInput.placeholder = 'YYYY';
        yearInput.min = 1900;
        yearInput.max = 2100;

        const inputsMap = {
            'dd': dayInput,
            'mm': monthInput,
            'yyyy': yearInput
        };

        this.dateOrder.split('-').forEach(part => {
            if (inputsMap[part]) {
                divInput.appendChild(inputsMap[part]);
            }
        });
    }

    #getCurrentDay() {
        const dayInput = this.shadowRoot.querySelector('.FastCalendarHeader-DayInput');
        const monthInput = this.shadowRoot.querySelector('.FastCalendarHeader-MonthInput');
        const yearInput = this.shadowRoot.querySelector('.FastCalendarHeader-YearInput');
        if (!dayInput || !monthInput || !yearInput) return;

        const date = new Date()

        dayInput.value = date.getDay();
        monthInput.value = date.getMonth() + 1;
        yearInput.value = date.getFullYear();
    }

    #hideCalendar() {
        const button = this.shadowRoot.querySelector('.FastCalendarHeader-Button');
        const body = this.shadowRoot.querySelector('.FastCalendarBody');

        button.addEventListener('click', () => {
            if(this.bodyVisible === true) {
                body.style.display = 'none';
                this.bodyVisible = false;
            } else {
                body.style.display = 'block';
                this.bodyVisible = true;
            }
        })
    }

    async connectedCallback() {
        await this.#render();
        await this.#checkAttributes();
        await this.#checkProps();
        await this.#applyProps();

        this.#formatDate();
        this.#hideCalendar();
        if (this.currentDate === true) this.#getCurrentDay();

        this._isBuilt = true;
        this.built();
    }

    addBody() {
        document.body.appendChild(this);
    }
}

if (!customElements.get('fast-calendar')) {
    customElements.define('fast-calendar', FastCalendar);
}