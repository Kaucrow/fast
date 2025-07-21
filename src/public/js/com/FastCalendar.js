export class FastCalendar extends Fast {
    constructor(props) {
        super();
        this.name = 'FastCalendar';
        this.props = props;
        this.built = () => {};
        this.attachShadow({ mode: 'open' });
        this.dateOrder = 'dd-mm-yyyy';
        this._coloricon = '#FFF';
        this.widthCharMenu = 7;
        this.sizeIconMenu = 14;
        this.currentDate = true;
        this.bodyVisible = true;
        this.day = 1;
        this.month = 1;
        this.year = new Date().getFullYear();
        this.currentDay = this.day;
        this.currentMonth = this.month;
        this.currentYear = this.year;
        this._isBuilt = false;
        this.monthSlider = null;
    }

    #getTemplate() {
        return `
      <div class="FastCalendar">
        <div class="FastCalendarHeader">
          <div class="container-inputs-date reveleaded"></div>
          <select class="header-select hidden">
            <option value="dd-mm-yyyy">dd/mm/yyyy</option>
            <option value="mm-dd-yyyy">mm/dd/yyyy</option>
            <option value="yyyy-mm-dd">yyyy/mm/dd</option>
            <option value="yyyy-dd-mm">yyyy/dd/mm</option>
          </select>
          <div class="container-options"></div>
        </div>
        <div class="FastCalendarBody">
          <div class="FastCalendarSelect">
            <div class="slider-month-container"></div>
            <select class="select-year"></select>
          </div>
          <div class="container-header-days">
            <p class="header-day">Dom</p>
            <p class="header-day">Lun</p>
            <p class="header-day">Mar</p>
            <p class="header-day">Mié</p>
            <p class="header-day">Jue</p>
            <p class="header-day">Vie</p>
            <p class="header-day">Sáb</p>
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
                        case 'body-visible':
                            if (this[attr] === "false") this.bodyVisible = false;
                            break;
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
                                } else if(attr === 'body-visible') {
                                    if (this[attr] === "false") this.bodyVisible = false;
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
        const selectorFormat = this.shadowRoot.querySelector('.header-select');
        if (!divInput) return;

        divInput.innerHTML = '';
        selectorFormat.value = this.dateOrder;

        const dayInput = document.createElement('input');
        dayInput.className = 'input-day input';
        dayInput.type = 'number';
        dayInput.placeholder = 'DD';
        dayInput.min = 1;
        dayInput.max = 31;
        dayInput.disabled = false
        const barLeft = document.createElement('p');
        barLeft.classList.add('label-input');
        barLeft.innerHTML = '/';

        const monthInput = document.createElement('input');
        monthInput.className = 'input-month input';
        monthInput.type = 'number';
        monthInput.placeholder = 'MM';
        monthInput.min = 1;
        monthInput.max = 12;
        monthInput.disabled = false;
        const barCenter = document.createElement('p');
        barCenter.classList.add('label-input');
        barCenter.innerHTML = '/';

        const yearInput = document.createElement('input');
        yearInput.className = 'input-year input';
        yearInput.type = 'number';
        yearInput.placeholder = 'YYYY';
        yearInput.min = 1900;
        yearInput.max = 2100;
        yearInput.disabled = false;

        const inputs = {
            'dd': dayInput,
            'mm': monthInput,
            'yyyy': yearInput
        };

        let countBar = 0;
        this.dateOrder.split('-').forEach(part => {
            if (inputs[part]) {
                if (countBar === 1) {
                    divInput.appendChild(barLeft);
                };

                if (countBar === 2) {
                    divInput.appendChild(barCenter);
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


        if (!this.currentDate) {
            dayInput.value = this.day;
            monthInput.value = this.month;
            yearInput.value = this.year;
        } else {
            dayInput.value = day;
            this.day = day;

            monthInput.value = month;
            this.month = month;

            yearInput.value  = year;
            this.year = year;
        }
        this.currentDay = day;
        this.currentMonth = month;
        this.currentYear = year;
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

    #fillLeadingEmptyDays(month, year) {
        const calendarDays = this.shadowRoot.querySelector('.container-body-days').children;
        if (!calendarDays) return;

        const firstDayOfWeek = this.#getDayOfWeek(1, month, year);
        const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const firstDayIndex = weekDays.indexOf(firstDayOfWeek);

        for (let i = 0; i <= firstDayIndex; i++) {
            const empty = document.createElement('p');
            empty.classList.add('empty-day');
            empty.textContent = '.';
            calendarDays[i].appendChild(empty);
        }
    }

    #numberOfDaysPerMonth (month, year) {
        let numberOfDays;
        if ( [1,3,5,7,8,10,12].includes(month) ) {
            numberOfDays = 31;
        } else if ( [4,6,9,11].includes(month) ) {
            numberOfDays = 30;
        } else if ( month === 2 ) {
            numberOfDays = this.#isLeapYear(year);
        }
        return numberOfDays;
    }

    #getCalendar(month, year) {
        const m = Number(month);
        const y = Number(year);

        const calendarDays = this.shadowRoot.querySelector('.container-body-days').children;
        if (!calendarDays) return;

        for (let days of calendarDays) days.textContent = "";

        let numberOfDaysPerMonth = this.#numberOfDaysPerMonth(m, y);

        for (let i = 1; i <= numberOfDaysPerMonth; i++) {
            const currentDay = this.#getDayOfWeek(i, m, y);
            const date = document.createElement('p');
            date.textContent = i.toString();

            if (i === 1 && currentDay !== "Sunday") {
                this.#fillLeadingEmptyDays(m, y);
            }

            if (m === this.currentMonth && y === this.currentYear) {
                if (i === this.currentDay) {
                    date.classList.add('current-day');
                }
                else{
                    date.classList.add('day');
                }
            }
            else{
                date.classList.add('day');
            }


            date.addEventListener('click', () => {
                this.day   = i;
                this.month = m;
                this.year  = y;

                const dayInput   = this.shadowRoot.querySelector('.input-day');
                const monthInput = this.shadowRoot.querySelector('.input-month');
                const yearInput  = this.shadowRoot.querySelector('.input-year');
                dayInput.value   = this.day;
                monthInput.value = this.month;
                yearInput.value  = this.year;

                this.#updateCalendar();
            });

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

    #updateCalendar() {
        const dayInput    = this.shadowRoot.querySelector('.input-day');
        const monthInput  = this.shadowRoot.querySelector('.input-month');
        const yearInput   = this.shadowRoot.querySelector('.input-year');
        const sliderTextMonth = this.shadowRoot.querySelector('.slider-month-container');
        if (!dayInput || !monthInput || !yearInput || !sliderTextMonth) return;

        this.day = dayInput.value;
        this.month = monthInput.value;
        this.year = yearInput.value;
        sliderTextMonth.children[0].goToSlide(monthInput.value - 1);

        this.#getCalendar(this.month, this.year);
    }

    async #hideCalendar() {
        const containerHeader = this.shadowRoot.querySelector('.FastCalendarHeader');
        const containerBody = this.shadowRoot.querySelector('.FastCalendarBody');
        const containerOptions = this.shadowRoot.querySelector('.container-options');

        const icon = {'iconname' : 'arrowRight'};
        const toggleButton = await this.#renderIcon(icon);
        toggleButton.classList.add('toggle-button');

        this.#changeIcon(toggleButton, containerBody, this.bodyVisible, containerHeader);

        toggleButton.addEventListener('click', () => {
            this.bodyVisible = !this.bodyVisible;
            this.#changeIcon(toggleButton, containerBody, this.bodyVisible, containerHeader);
        });

        containerOptions.append(toggleButton);
    }

    #changeIcon(icon, containerBody, isVisible, containerHeader) {
        if (isVisible) {
            containerBody.style.display = 'flex';
            containerBody.style.animation = 'slideDown .4s ease-out forwards';
            icon.classList.remove('arrow-up');
            icon.classList.add('arrow-down');
            containerHeader.style.borderRadius = '10px 10px 0 0';
        }
        else {
            containerBody.style.animation = 'slideUp .4s ease-in forwards';
            icon.classList.remove('arrow-down');
            icon.classList.add('arrow-up');
            setTimeout(()=>{
                containerHeader.style.borderRadius = '10px';
                containerBody.style.display = 'none';
            }, 399);
        }
    }

    async #alternateContainerHeader() {
        const containerHeader = this.shadowRoot.querySelector('.container-options');
        const containerHeaderInputs = this.shadowRoot.querySelector('.container-inputs-date');
        const containerHeaderSelect = this.shadowRoot.querySelector('.header-select');

        const icon = {'iconname': 'options'};
        const optionsButton = await this.#renderIcon(icon);
        optionsButton.classList.add('options-button');

        optionsButton.addEventListener('click', () => {
            if (containerHeaderInputs.classList.contains('reveleaded')) {
                containerHeaderInputs.classList.replace('reveleaded', 'hidden');
                containerHeaderSelect.classList.replace('hidden', 'reveleaded');
            } else {
                containerHeaderSelect.classList.replace('reveleaded', 'hidden');
                containerHeaderInputs.classList.replace('hidden', 'reveleaded');
            }
        });

        containerHeader.append(optionsButton);
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

    getDate() {
        const parts = {
            dd: String(this.day).padStart(2, '0'),
            mm: String(this.month).padStart(2, '0'),
            yyyy: String(this.year)
        };

        let result = '';

        const order = this.dateOrder.split('-');
        order.forEach((key, idx) => {
            if (parts[key]) {
                if (idx > 0) result += '/';
                result += parts[key];
            }
        });

        return result;
    }


    compareCalendars(calendar) {
        if (typeof calendar !== 'object') {
            console.warn('compareCalendars: the argument must be a calendar object');
            return undefined;
        }

        if (this._isBuilt && calendar._isBuilt) {
            if (this.year > calendar.year) return 1;
            if (this.year < calendar.year) return -1;

            if (this.month > calendar.month) return 1;
            if (this.month < calendar.month) return -1;

            if (this.day > calendar.day) return 1;
            if (this.day < calendar.day) return -1;

            return 0;
        } else {
            console.warn('compareCalendars: both calendars must be built before comparing');
            return undefined;
        }
    }

    async connectedCallback() {
        await this.#render();
        await this.#checkAttributes();
        await this.#checkProps();
        await this.#applyProps();

        this.#formatDate();
        await this.#hideCalendar();
        await this.#alternateContainerHeader();
        this.#getCurrentDay();

        const selectYear  = this.shadowRoot.querySelector('.select-year');

        for (let i = 1900; i <= 2100; i++) {
            let option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            selectYear.appendChild(option);
        }

        const monthNames = [
            'Enero','Febrero','Marzo','Abril','Mayo','Junio',
            'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
        ];
        const slider = document.createElement('fast-slider-text');
        slider.slidesData = monthNames;
        slider.classList.add('slider-month');
        this.monthSlider = slider;
        this.shadowRoot.querySelector('.slider-month-container').appendChild(slider);

        const setRange = (input, min, max) => {
            let v = parseInt(input.value, 10);
            if (isNaN(v) || v < min) v = min;
            else if (v > max) v = max;
            input.value = v;
            return v;
        };

        const dateChange = () => {
            this.dispatchEvent(new CustomEvent('date-change', {
                bubbles: true,
                composed: true
            }));
        };

        const bindInputs = () => {
            const dayInput    = this.shadowRoot.querySelector('.input-day');
            const monthInput  = this.shadowRoot.querySelector('.input-month');
            const yearInput   = this.shadowRoot.querySelector('.input-year');

            selectYear.value = yearInput.value;

            dayInput.onchange = () => {
                this.day = setRange(dayInput, 1, this.#numberOfDaysPerMonth(this.month, this.year));
                this.#updateCalendar();
                dateChange();
            };

            monthInput.onchange = () => {
                this.month = setRange(monthInput, 1, 12);
                if (this.monthSlider.goToSlide) this.monthSlider.goToSlide(this.month - 1);
                this.#updateCalendar();
                dateChange();
            };

            yearInput.onchange = () => {
                this.year = setRange(yearInput, 1900, 2100);
                selectYear.value = this.year;
                this.#updateCalendar();
                dateChange();
            };

            selectYear.onchange = () => {
                yearInput.value = selectYear.value;
                this.#updateCalendar();
                dateChange();
            };
        };

        bindInputs();

        slider.addEventListener('slide-changed', ({ detail }) => {
            const monthInput = this.shadowRoot.querySelector('.input-month');
            const yearInput = this.shadowRoot.querySelector('.input-year');
            const newMonth = detail.numero;
            const previousMonth = Number(monthInput.value);

            if (newMonth === 12 && previousMonth !== 11) {
                this.year--;
                yearInput.value = this.year;
            }

            if (previousMonth === 12 && newMonth === 1) {
                this.year++;
                yearInput.value = this.year;
            }

            monthInput.value = newMonth;
            this.#getCalendar(newMonth, this.year);
            dateChange();
        });

        const selectFormat = this.shadowRoot.querySelector('.header-select');
        selectFormat.onchange = () => {
            this.dateOrder = selectFormat.value;
            this.#formatDate();
            this.#getCurrentDay();
            bindInputs();
            this.#updateCalendar();
        };

        this.#updateCalendar();
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