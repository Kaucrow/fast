export class FastCalendar extends Fast {
    constructor(props) {
        super();
        this.name  = 'FastCalendar';
        this.props = props;
        this.built = ()=> {};
        this.attachShadow({mode: 'open'});

        this.dateOrder = 'dd-mm-yyyy';
        this._coloricon = '#FFF';
        this.widthCharMenu = 7;
        this.sizeIconMenu = 14;
        this.currentDate = true;
        this.bodyVisible = false;
        this._isBuilt = false;
    }

    #getTemplate() {
        return `
      <div class="FastCalendar">
        <div class="FastCalendarHeader">
          <div class="container-inputs-date"></div>
          <!--<select class="header-select">
            <option>dd/mm/yyyy</option>
            <option>mm/dd/yyyy</option>
            <option>yyyy/mm/dd</option>
            <option>yyyy/dd/mm</option>
          </select>-->
          <button class="FastCalendarHeader-Button-Update">Seleccionar</button>
        </div>
        <div class="FastCalendarBody">
          <div class="FastCalendarSelect">
            <select class="container-select-month">
                <option value="1">Enero</option>
                <option value="2">Febrero</option>
                <option value="3">Marzo</option>
                <option value="4">Abril</option>
                <option value="5">Mayo</option>
                <option value="6">Junio</option>
                <option value="7">Julio</option>
                <option value="8">Agosto</option>
                <option value="9">Septiembre</option>
                <option value="10">Octubre</option>
                <option value="11">Noviembre</option>
                <option value="12">Diciembre</option>
            </select>
            <select class="container-select-year">
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
            </select>
          </div>
          <div class="container-header-days">
            <p>Dom</p>
            <p>Lun</p>
            <p>Mar</p>
            <p>Mié</p>
            <p>Jue</p>
            <p>Vie</p>
            <p>Sáb</p>
          </div>
          <div class="container-body-days">
            <div class="container-days"></div>
            <div class="container-days"></div>
            <div class="container-days"></div>
            <div class="container-days"></div>
            <div class="container-days"></div>
            <div class="container-days"></div>
            <div class="container-days"></div>
          </div>
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
                            default:
                                this.setAttribute(attr, this.props[attr]);
                                this[attr] = this.props[attr];
                                if (attr === 'id') {
                                    fast.createInstance('FastCalendar', { 'id': this[attr] });
                                    this.mainElement.id = this[attr];
                                } else if(attr === 'date-order') {
                                    this.dateOrder = this[attr].toLowerCase();
                                } else if(attr === 'current-date') {
                                    if (this[attr] === "false") this.currentDate = false;
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
        const divInput = this.shadowRoot.querySelector('.container-inputs-date');
        if (!divInput) return;

        divInput.innerHTML = '';

        const dayInput = document.createElement('input');
        dayInput.className = 'input-day input';
        dayInput.type = 'number';
        dayInput.placeholder = 'DD';
        dayInput.min = 1;
        dayInput.max = 31;
        dayInput.disabled = true
        const barLeft = document.createElement('p');
        barLeft.classList.add('label-input');
        barLeft.innerHTML = '/';

        const monthInput = document.createElement('input');
        monthInput.className = 'input-month input';
        monthInput.type = 'number';
        monthInput.placeholder = 'MM';
        monthInput.min = 1;
        monthInput.max = 12;
        monthInput.disabled = true;
        const barCenter = document.createElement('p');
        barCenter.classList.add('label-input');
        barCenter.innerHTML = '/'

        const yearInput = document.createElement('input');
        yearInput.className = 'input-year input';
        yearInput.type = 'number';
        yearInput.placeholder = 'YYYY';
        yearInput.min = 1900;
        yearInput.max = 2100;
        yearInput.disabled = true;

        const inputs = {
            'dd': dayInput,
            'mm': monthInput,
            'yyyy': yearInput
        };

        let countBar = 0;
        this.dateOrder.split('-').forEach(part => {
            if (inputs[part]) {
                if (countBar === 0) {
                    barLeft.classList.add('label-left');
                    divInput.appendChild(barLeft);
                    inputs[part].classList.add('firts-input');
                };
                
                if (countBar === 1) {
                    barCenter.classList.add('label-center')
                    divInput.appendChild(barCenter);
                }

                if (countBar === 2){
                    inputs[part].classList.add('last-input')
                }
                divInput.appendChild(inputs[part]);
            }
            countBar++;
        });
    }
    
    #getCurrentDay() {
        const dayInput = this.shadowRoot.querySelector('.input-day');
        const monthInput = this.shadowRoot.querySelector('.input-month');
        const yearInput = this.shadowRoot.querySelector('.input-year');
        if (!dayInput || !monthInput || !yearInput) return;

        const date = new Date();
        const day   = date.getDate();
        const month = date.getMonth() + 1;
        const year  = date.getFullYear();

        dayInput.value   = day;
        monthInput.value = month;
        yearInput.value  = year;
    }

    #isLeapYear(year) {
        if ((year % 4) === 0) {
            if ((year % 100) === 0) {
                if (year % 400 === 0) {
                    return 29;
                } else {
                    return 28;
                }
            }
            return 29;
        }
        return 28;
    }

    #getDayOfWeek(day, month, year) {
        if (month < 3) {
            month += 12;
            year -= 1;
        }

        let K = year % 100;
        let J = Math.floor(year / 100);

        let h = (day + Math.floor((month + 1) * 26 / 10) + K + Math.floor(K / 4) + Math.floor(J / 4) - 2 * J) % 7;

        const weekDays = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

        h = (h + 7) % 7;

        return weekDays[h];
    }

    #getCalendar(month, year) {
        const m = Number(month);
        const y = Number(year);

        const calendarDays = this.shadowRoot.querySelector('.container-body-days').children;
        if (!calendarDays) return;

        for (let days of calendarDays) days.textContent = "";

        let numberOfDaysPerMonth;
        if ( [1,3,5,7,8,10,12].includes(m) ) {
            numberOfDaysPerMonth = 31;
        } else if ( [4,6,9,11].includes(m) ) {
            numberOfDaysPerMonth = 30;
        } else if ( m === 2 ) {
            numberOfDaysPerMonth = this.#isLeapYear(y);
        }

        for (let i = 1; i <= numberOfDaysPerMonth; i++) {
            const currentDay = this.#getDayOfWeek(i, m, y);
            const date = document.createElement('p');
            date.textContent = i.toString();

            switch (currentDay) {
                case "Sunday": {
                    calendarDays[0].appendChild(date);
                    break;
                }
                case "Monday": {
                    calendarDays[1].appendChild(date);
                    break;
                }
                case "Tuesday": {
                    calendarDays[2].appendChild(date);
                    break;
                }
                case "Wednesday": {
                    calendarDays[3].appendChild(date);
                    break;
                }
                case "Thursday": {
                    calendarDays[4].appendChild(date);
                    break;
                }
                case "Friday": {
                    calendarDays[5].appendChild(date);
                    break;
                }
                case "Saturday": {
                    calendarDays[6].appendChild(date);
                    break;
                }
            }
        }
    }

    #UpdateCalendar() {
        const button = this.shadowRoot.querySelector('.FastCalendarHeader-Button-Update');
        const monthInput = this.shadowRoot.querySelector('.input-month');
        const yearInput  = this.shadowRoot.querySelector('.input-year');
        const selectMonth = this.shadowRoot.querySelector('.container-select-month');
        const selectYear  = this.shadowRoot.querySelector('.container-select-year');

        if (monthInput && selectMonth) {
            if (this.currentDate) {
                selectMonth.value = monthInput.value;
            }
        } else return;
        if (yearInput && selectYear) {
            if (this.currentDate) {
                selectYear.value = yearInput.value;
            }
        } else return;

        const updateCalendar = () => this.#getCalendar(selectMonth.value, selectYear.value);
        const updateSelector = () => {
            selectYear.value = yearInput.value;
            selectMonth.value = monthInput.value;
            updateCalendar();
        }

        button.addEventListener('click', updateSelector);
        selectMonth.addEventListener('change', updateCalendar);
        selectYear.addEventListener('change', updateCalendar);

        updateCalendar();
    }

    async #hideCalendar() {
        const containerHeader = this.shadowRoot.querySelector('.FastCalendarHeader');
        const containerBody = this.shadowRoot.querySelector('.FastCalendarBody');

        if (!this.props.iconname) return;

        const icon = await this.#renderIcon(this.props);
        icon.classList.add('toggle-button');

        this.bodyVisible = this.bodyVisible ?? true;
        this.#changeIcon(icon, containerBody, this.bodyVisible);

        icon.addEventListener('click', () => {
            this.bodyVisible = !this.bodyVisible;
            this.#changeIcon(icon, containerBody, this.bodyVisible);
        });

        containerHeader.appendChild(icon);
    }

    #changeIcon(icon, containerBody, isVisible) {
        if (isVisible) {
            containerBody.style.display = 'flex';
            containerBody.style.animation = 'show .4s ease-out forwards';
            icon.classList.remove('arrow-up');
            icon.classList.add('arrow-down');
        }
        else {  
            containerBody.style.animation = 'hidden 0.6s ease-in forwards';
            icon.classList.remove('arrow-down');
            icon.classList.add('arrow-up');
            containerBody.style.display = 'none';
        }
    }


    #renderIcon(objOption){
        return new Promise(async (resolve, reject) => {
            try {
                let key = this.id+'_'+objOption.iconname+'_'+objOption.order;
                if(objOption.coloricon){this.coloricon = objOption.coloricon}
                let i = await fast.createInstance("FastIcon", {
                    'id': key,
                    'iconname' : objOption.iconname,
                    'style' : {
                        'position'          : 'relative',
                        'box-shadow'        : 'none', 
                        'border-style'      : 'none',
                        'width'             : this.sizeIconMenu+'px',
                        'height'            : this.sizeIconMenu+'px',
                        'fill'              : this._coloricon,
                        'background-color'  : 'rgba(0,0,0,0)',
                    }
                });
                resolve(i);      
            } 
            catch (error) { reject(error); }
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
        this.#UpdateCalendar();

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