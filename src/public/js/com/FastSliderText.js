export const FastSliderText = class extends Fast {
    constructor(props) {
        super();
        this.name = "FastSliderText";
        this.props = props;
        if(props && props.id) this.id = props.id;
        this.built = () => {};
        this.attachShadow({mode: 'open'});
        this.currentIndex = 0;
        this.slides = [];
        this.interval = null;
        this._isBuilt = false;
        this.objectProps = new Map();
    }

    // Método privado para obtener el template HTML
    #getTemplate() {
        const leftArrowUrl = new URL('../../images/icons/leftArrow.svg', import.meta.url).href;
        const rightArrowUrl = new URL('../../images/icons/rightArrow.svg', import.meta.url).href;

        return `
                <div class="main-content">
                    <button id="prevBtn" class="arrow-btn"><img src="${leftArrowUrl}" alt="Previous"></button>
                    <div class="slides-list">
                        <div class="slides">
                            ${this.slides.map((text) =>
                                `<div class="slide"><div class="slide-content">${text}</div></div>`
                            ).join('')}
                        </div>
                    </div>
                    <button id="nextBtn" class="arrow-btn"><img src="${rightArrowUrl}" alt="Next"></button>
                </div>
            </div>
        `;
    }

    async #getCss() {
        let baseCss = await fast.getCssFile("FastSliderText");
        return baseCss;
    }

    // Renderiza el slider en el Shadow DOM
    async #render() {
        // Carga y aplica el CSS una sola vez
        if (!this.shadowRoot.querySelector('style')) {
            const css = await this.#getCss();
            const style = document.createElement('style');
            style.textContent = css;
            this.shadowRoot.appendChild(style);
        }

        // Crea el contenedor principal si no existe
        let container = this.shadowRoot.querySelector('.slider-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'slider-container';
            this.shadowRoot.appendChild(container);
        }
        
        // Renderiza el contenido interno del slider
        container.innerHTML = this.#getTemplate();

        // Asigna eventos a los controles
        this.shadowRoot.querySelector('#prevBtn').onclick = () => this.prevSlide();
        this.shadowRoot.querySelector('#nextBtn').onclick = () => this.nextSlide();

        this.#updateView();
    }

    // Actualiza la vista (transform e indicadores)
    #updateView() {
        const slidesDiv = this.shadowRoot.querySelector('.slides');
        if (slidesDiv) {
            slidesDiv.style.transform = `translateX(-${this.currentIndex * 100}%)`;
        }

        // Disparar evento cuando cambia el slide
        this.dispatchEvent(new CustomEvent('slide-changed', {
            detail: this.getActiveValue()
        }));
    }

    // Obtiene el valor activo (para el calendario)
    getActiveValue() {
        return {
            nombre: this.slides[this.currentIndex] || '',
            numero: this.currentIndex + 1 // 1=Enero, 2=Febrero...
        };
    }

    // Verificar y aplicar props
    #checkProps() {
        return new Promise(async (resolve, reject) => {
            try {
                if(this.props) {
                    for(let attr in this.props) {
                        switch(attr) {
                            case 'slidesData':
                                this.slidesData = this.props[attr];
                                break;
                            case 'style':
                                for(let attrcss in this.props.style) this.style[attrcss] = this.props.style[attrcss];
                                break;
                            case 'events':
                                for(let attrevent in this.props.events) {
                                    this.addEventListener(attrevent, this.props.events[attrevent]);
                                }
                                break;
                            default:
                                this.setAttribute(attr, this.props[attr]);
                                this[attr] = this.props[attr];
                        }
                    }
                }
                resolve(this);
            } catch (error) {
                reject(error);
            }
        });
    }

    // Aplicar props diferidas
    #applyProps() {
        return new Promise((resolve, reject) => {
            try {
                for (const [key, value] of this.objectProps.entries()) {
                    this[key] = value;
                    this.objectProps.delete(key);
                }
                resolve(this);
            } catch(e) {
                reject(e);
            }
        });
    }

    // Ciclo de vida: cuando el componente se agrega al DOM
    async connectedCallback() {
        await this.#checkProps(); 
        await this.#render();     
        this._isBuilt = true;
        await this.#applyProps();
        this.built();
    }

    // Permite establecer las diapositivas desde fuera del componente
    set slidesData(data) {
        this.slides = data;
        this.currentIndex = 0;
        if (this._isBuilt) { 
            this.#render();
        }
    }

    // Muestra la siguiente diapositiva
    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
        this.#updateView();
    }

    // Muestra la diapositiva anterior
    prevSlide() {
        this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.#updateView();
    }

    // Añadida funcion para ir a una diapositiva específica
    goToSlide(index) {
        this.currentIndex = index;
        this.#updateView();
    }

    // Devuelve el valor del texto activo
    goToSlide(index) {
        if (index >= 0 && index < this.slides.length) {
            this.currentIndex = index;
            this.#updateView();
        }
    }

    // Método para agregar el componente al body
    addToBody() {
        document.body.appendChild(this);
    }
}

customElements.define('fast-slider-text', FastSliderText);