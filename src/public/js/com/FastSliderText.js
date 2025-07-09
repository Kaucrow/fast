export const FastSliderText = class extends Fast {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.currentIndex = 0;
        this.slides = [];
        this.interval = null;
        this._isBuilt = false;
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
                <div class="indicators">
                    ${this.slides.map((_, i) =>
                        `<span class="${i === this.currentIndex ? 'active' : ''}"></span>`
                    ).join('')}
                </div>
            </div>
        `;
    }

    // Método privado para obtener el CSS
    async #getCss() {
        // Ruta relativa desde el JS hacia la carpeta css
        const cssURL = new URL('../css/FastSliderText.css', import.meta.url);
        const response = await fetch(cssURL);
        return await response.text();
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
        this.shadowRoot.querySelectorAll('.indicators span').forEach((el, i) => {
            el.onclick = () => this.goToSlide(i);
        });

        this.#updateView();
    }

    // Actualiza la vista (transform e indicadores)
    #updateView() {
        const slidesDiv = this.shadowRoot.querySelector('.slides');
        if (slidesDiv) {
            slidesDiv.style.transform = `translateX(-${this.currentIndex * 100}%)`;
        }
        this.shadowRoot.querySelectorAll('.indicators span').forEach((el, i) => {
            el.className = (i === this.currentIndex) ? 'active' : '';
        });
    }

    // Ciclo de vida: cuando el componente se agrega al DOM
    async connectedCallback() {
        await this.#render();
        this.startAutoSlide();
        this._isBuilt = true;
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

}

customElements.define('fast-slider-text', FastSliderText);