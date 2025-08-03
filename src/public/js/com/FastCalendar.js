export class FastCalendar extends Fast {
    constructor(props) {
        super();
        this.name = 'FastCalendar';
        this.props = props;
        this.built = () => {};
        this.attachShadow({ mode: 'open' });

        this.dateOrder = 'dd-mm-yyyy';
        this.currentDate = true;
        this.bodyVisible = true;

        this._coloricon = '#FFF';
        this.widthCharMenu = 7;
        this.sizeIconMenu = 14;

        this.day = 1;
        this.month = 1;
        this.year = new Date().getFullYear();

        this.currentDay = this.day;
        this.currentMonth = this.month;
        this.currentYear = this.year;

        this.monthSlider = null;
        this.yearSlider = null;
        this.decadesSlider = null;
        this.formatSelect = null;
        this.bindInputs = null;

        this.monthSelect = false;
        this.dayChange = false;

        this._isBuilt = false;
    }

    #getTemplate() {
        return `
      <div class="FastCalendar">
        <div class="FastCalendarHeader">
          <div class="container-inputs-date reveleaded"></div>
          <div class="header-select hidden"></div>
          <div class="container-options"></div>
        </div>
        
        <div class="FastCalendarBody">
          <div class="FastCalendarSelect">
            <div class="slider-month-container"></div>
            <div class="slider-year-container"></div>
          </div>

        <div class="container-month none">
            <div class="container-body-month">
                <div class="container-month-row"></div>
                <div class="container-month-row"></div>
                <div class="container-month-row"></div>
            </div>
        </div>
        <div class="container-decades none">
            <div class="slider-decades-container"></div>
            <div class="container-body-decades">
                <div class="container-year"></div>
                <div class="container-year"></div>
                <div class="container-year"></div>
            </div>
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

    async #getCss() { return fast.getCssFile('FastCalendar'); }

    #render() {
        return new Promise(async (resolve, reject) => {
            try {
                let sheet = new CSSStyleSheet();
                sheet.replaceSync(await this.#getCss());
                this.shadowRoot.adoptedStyleSheets = [sheet];

                this.template = document.createElement('template');
                this.template.innerHTML = this.#getTemplate();
                let tpc = this.template.content.cloneNode(true);

                this.mainElement = tpc.firstChild.nextSibling;
                this.shadowRoot.appendChild(this.mainElement);
                resolve(this);
            } catch (error) { reject(error); }
        });
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
        });
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
                                    this.mainElement.addEventListener(attrEvent, this.props.events[attrEvent], false);
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
            } catch (error) { reject(error); }
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
            } catch (e) { reject(e); }
        });
    }

    #formatDate() {
        const divInput = this.shadowRoot.querySelector('.container-inputs-date');
        const selectorFormat = this.formatSelect ? this.formatSelect.getSelect() : null;
        if (!divInput) return;

        divInput.innerHTML = '';
        if (selectorFormat) selectorFormat.value = this.dateOrder;

        const dayInput = document.createElement('input');
        dayInput.className = 'input-day input';
        dayInput.type = 'number';
        dayInput.placeholder = 'DD';
        dayInput.min = 1;
        dayInput.max = 31;
        dayInput.disabled = false;

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
        yearInput.max = 2099;
        yearInput.disabled = false;

        const inputs = { 'dd': dayInput, 'mm': monthInput, 'yyyy': yearInput };

        let countBar = 0;
        this.dateOrder.split('-').forEach(part => {
            if (inputs[part]) {
                if (countBar === 1) divInput.appendChild(barLeft);
                if (countBar === 2) divInput.appendChild(barCenter);
                divInput.appendChild(inputs[part]);
            }
            countBar++;
        });
    }

    #onFormatChange = () => {
        const prev = { day: this.day, month: this.month, year: this.year };
        const selectEl = this.formatSelect.getSelect();
        this.dateOrder = selectEl.value;

        this.#formatDate();

        const dayInput   = this.shadowRoot.querySelector('.input-day');
        const monthInput = this.shadowRoot.querySelector('.input-month');
        const yearInput  = this.shadowRoot.querySelector('.input-year');

        dayInput.value   = prev.day;
        monthInput.value = prev.month;
        yearInput.value  = prev.year;

        this.day   = prev.day;
        this.month = prev.month;
        this.year  = prev.year;

        if (this.bindInputs) {
            this.bindInputs();
        }

        this.#updateCalendar();
    };

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
                if (year % 400 === 0) return 29;
                else return 28;
            }
            return 29;
        }
        return 28;
    }

    #getDayOfWeek(day, month, year) {
        if (month < 3) { month += 12; year -= 1; }
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
        if ( [1,3,5,7,8,10,12].includes(month) ) return 31;
        if ( [4,6,9,11].includes(month) ) return 30;
        if ( month === 2 ) return this.#isLeapYear(year);
        return 30;
    }

    #fixDayForMonthYear() {
        const dayInput = this.shadowRoot.querySelector('.input-day');
        const max = this.#numberOfDaysPerMonth(Number(this.month), Number(this.year));
        if (Number(this.day) > max) {
            this.day = max;
            if (dayInput) dayInput.value = max;
        }
    }

    #renderCalendar(month, year) {
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
                if (i === this.currentDay) date.classList.add('current-day');
                else date.classList.add('day');
            } else {
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

                this.dayChange = true;
                this.dateChange();

                this.#updateCalendar();
            });

            switch (currentDay) {
                case "Sunday":    calendarDays[0].appendChild(date); break;
                case "Monday":    calendarDays[1].appendChild(date); break;
                case "Tuesday":   calendarDays[2].appendChild(date); break;
                case "Wednesday": calendarDays[3].appendChild(date); break;
                case "Thursday":  calendarDays[4].appendChild(date); break;
                case "Friday":    calendarDays[5].appendChild(date); break;
                case "Saturday":  calendarDays[6].appendChild(date); break;
            }
        }
    }

    #syncDecadeFromYear(year = this.year) {
        year = Number(year);
        const idx = Math.floor((year - 1900) / 10)
        if (this.decadesSlider) {
            this.decadesSlider.goToSlide(idx);
        }
    }

    #renderDecade(year = Math.floor(Number(this.year) / 10) * 10) {

        const cols = this.shadowRoot.querySelectorAll('.container-body-decades .container-year');
        if (!cols.length) return;

        cols.forEach(col => col.textContent = '');

        for (let i = 0; i < 10; i++) {
            const y = year + i;

            const p = document.createElement('p');
            p.textContent = String(y);
            p.classList.add('decade');

            p.addEventListener('click', () => {
                this.year = y;
                const yearInput = this.shadowRoot.querySelector('.input-year');
                if (yearInput) yearInput.value = y;
                this.monthSelect = true;
                this.dayChange = true;
                this.dateChange();
                this.#updateCalendar();
            });

            cols[i % cols.length].appendChild(p);
        }

        for (let j = 1; j <= 2; j++) {
            const p = document.createElement('p');
            p.textContent = '.';
            p.classList.add('empty-decade');
            cols[j].appendChild(p);
        }
    }

    #renderMonth() {

        const cols = this.shadowRoot.querySelectorAll('.container-body-month .container-month-row');
        if (!cols.length) return;

        cols.forEach(col => col.textContent = '');

        const arrayMonths = [
            'Enero','Febrero','Marzo','Abril','Mayo','Junio',
            'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
        ];

        for (let i = 1; i <= 12; i++) {
            const p = document.createElement('p');
            p.textContent = String(arrayMonths[i-1]);
            p.classList.add('month');

            p.addEventListener('click', () => {
                this.month = i;
                const monthInput = this.shadowRoot.querySelector('.input-month');
                if (monthInput) monthInput.value = i;
                this.monthSelect = true;
                this.dayChange = true;
                this.dateChange();
                this.#updateCalendar();
            });

            cols[(i - 1) % cols.length].appendChild(p);
        }
    }

    #updateCalendar() {
        const dayInput    = this.shadowRoot.querySelector('.input-day');
        const monthInput  = this.shadowRoot.querySelector('.input-month');
        const yearInput   = this.shadowRoot.querySelector('.input-year');
        const sliderTextMonth = this.shadowRoot.querySelector('.slider-month-container');
        const sliderTextYear  = this.shadowRoot.querySelector('.slider-year-container');
        if (!dayInput || !monthInput || !yearInput || !sliderTextMonth || !sliderTextYear) return;

        this.day   = Number(dayInput.value);
        this.month = Number(monthInput.value);
        this.year  = Number(yearInput.value);

        sliderTextMonth.children[0].goToSlide(this.month - 1);
        sliderTextYear.children[0].goToSlide(this.year - 1900);
        this.monthSelect = false;
        this.dayChange = false;

        this.#syncDecadeFromYear(this.year);
        this.#renderCalendar(this.month, this.year);
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
        } else {
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
        });
    }

    #toggleContainer(openEl, closeEl) {
        if (!openEl.classList.contains('open')) {
            closeEl.classList.remove('open');
            openEl.classList.add('open');
        } else {
            openEl.classList.remove('open');
        }
    }

    dateChange() {
        this.dispatchEvent(new CustomEvent('date-change', {
            bubbles: true,
            composed: true
        }));
    };

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
            console.warn('compareCalendars: el argumento debe ser un objeto de calendario');
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
            console.warn('compareCalendars: Ambos calendarios deben construirse antes de compararlos');
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

        const formatHost = this.shadowRoot.querySelector('.header-select');
        const formats = ['dd-mm-yyyy','mm-dd-yyyy','yyyy-mm-dd','yyyy-dd-mm'];

        this.formatSelect = await fast.createInstance('FastSelect', {
            id: `${this.id}_dateFormat`,
            style: { 'color':'white', 'width': '175px', 'border':'none'}
        });

        this.formatSelect.built = () => {
            formats.forEach(f => this.formatSelect.addOption({ text: f, value: f }));
            const idx = formats.indexOf(this.dateOrder);
            if (idx >= 0) this.formatSelect.selectedIndex = idx;
            this.formatSelect.getSelect().addEventListener('change', this.#onFormatChange);
        };

        formatHost.appendChild(this.formatSelect);

        const monthNames = [
            'Enero','Febrero','Marzo','Abril','Mayo','Junio',
            'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
        ];

        const sliderMonth = document.createElement('fast-slider-text');
        sliderMonth.slidesData = monthNames;
        sliderMonth.classList.add('slider-month');
        sliderMonth.style.cursor = 'pointer';
        this.monthSlider = sliderMonth;
        this.shadowRoot.querySelector('.slider-month-container').appendChild(sliderMonth);

        const arrayYear = [];
        for (let i = 1900; i <= 2099; i++) arrayYear.push(i);

        const sliderYear = document.createElement('fast-slider-text');
        sliderYear.slidesData = arrayYear;
        sliderYear.classList.add('slider-year');
        sliderYear.style.cursor = 'pointer';
        this.yearSlider = sliderYear;
        this.shadowRoot.querySelector('.slider-year-container').appendChild(sliderYear);

        const arrayDecades = [];
        for (let i = 1900; i <= 2090; i += 10) arrayDecades.push(i);

        const sliderDecades = document.createElement('fast-slider-text');
        sliderDecades.slidesData = arrayDecades;
        sliderDecades.classList.add('slider-decades');
        this.decadesSlider = sliderDecades;
        this.shadowRoot.querySelector('.slider-decades-container').appendChild(sliderDecades);

        const setRange = (input, min, max) => {
            let v = parseInt(input.value, 10);
            if (isNaN(v) || v < min) v = min;
            else if (v > max) v = max;
            input.value = v;
            return v;
        };

        const bindInputs = () => {
            const dayInput    = this.shadowRoot.querySelector('.input-day');
            const monthInput  = this.shadowRoot.querySelector('.input-month');
            const yearInput   = this.shadowRoot.querySelector('.input-year');

            dayInput.onchange = () => {
                this.day = setRange(dayInput, 1, this.#numberOfDaysPerMonth(this.month, this.year));

                this.monthSelect = true;
                this.dayChange = true;

                this.#updateCalendar();
                this.dateChange();
            };

            monthInput.onchange = () => {
                this.month = setRange(monthInput, 1, 12);
                this.#fixDayForMonthYear();

                this.monthSelect = true;
                this.dayChange = true;

                if (this.monthSlider) this.monthSlider.goToSlide(this.month - 1);

                this.#updateCalendar();
                this.dateChange();
            };

            yearInput.onchange = () => {
                this.year = setRange(yearInput, 1900, 2099);
                this.#fixDayForMonthYear();

                this.monthSelect = true;
                this.dayChange = true;

                if (this.yearSlider) this.yearSlider.goToSlide(this.year - 1900);

                this.#updateCalendar();
                this.dateChange();
            };
        };

        bindInputs();
        this.bindInputs = bindInputs;

        sliderMonth.addEventListener('slide-changed', ({ detail }) => {
            if (this.dayChange) return;

            const monthInput = this.shadowRoot.querySelector('.input-month');
            const yearInput = this.shadowRoot.querySelector('.input-year');
            const newMonth = detail.numero;
            const previousMonth = Number(monthInput.value);

            if (newMonth === 12 && previousMonth !== 11 && !this.monthSelect) {
                this.year--;
                yearInput.value = this.year;
                sliderYear.goToSlide(this.year - 1900);
                this.#syncDecadeFromYear(this.year);
            }

            if (previousMonth === 12 && newMonth === 1) {
                this.year++;
                yearInput.value = this.year;
                sliderYear.goToSlide(this.year - 1900);
                this.#syncDecadeFromYear(this.year);
            }

            monthInput.value = newMonth;
            this.month = monthInput.value;

            this.#fixDayForMonthYear();

            this.#renderCalendar(this.month, this.year);
            this.dateChange();
        });

        const sliderMonthContainer = this.shadowRoot.querySelector('.container-month');
        const sliderDecadesContainer = this.shadowRoot.querySelector('.container-decades');

        sliderMonth.addEventListener('slide-text-click', () => {
            this.#toggleContainer(sliderMonthContainer, sliderDecadesContainer);
        });

        sliderYear.addEventListener('slide-changed', ({ detail }) => {
            if (this.dayChange) return;

            const yearInput = this.shadowRoot.querySelector('.input-year');
            const monthInput = this.shadowRoot.querySelector('.input-month');

            yearInput.value = Number(detail.nombre);
            this.year = yearInput.value;

            this.#fixDayForMonthYear();
            this.#syncDecadeFromYear(this.year);
            this.#renderCalendar(monthInput.value, this.year);
            this.dateChange();
        });

        sliderYear.addEventListener('slide-text-click', () => {
            this.#toggleContainer(sliderDecadesContainer, sliderMonthContainer);
        });

        sliderDecades.addEventListener('slide-changed', ({ detail }) => {
            this.#renderDecade(detail.nombre);
        });

        this.#renderMonth()
        this.#renderDecade();
        this.#updateCalendar();
        this._isBuilt = true;
        this.built();
    }

    addBody() { document.body.appendChild(this); }
}

if (!customElements.get('fast-calendar')) {
    customElements.define('fast-calendar', FastCalendar);
}