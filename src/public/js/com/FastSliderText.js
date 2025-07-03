export class FastSliderText extends HTMLElement {
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
        return `
            <div class="slider-container">
                <div class="slides">
                    ${this.slides.map((text, i) =>
                        `<div class="slide${i === this.currentIndex ? ' active' : ''}">${text}</div>`
                    ).join('')}
                </div>
                <div class="controls">
                    <button id="prevBtn">Anterior</button>
                    <button id="nextBtn">Siguiente</button>
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
        // Carga y aplica el CSS
        const css = await this.#getCss();
        let style = this.shadowRoot.querySelector('style');
        if (!style) {
            style = document.createElement('style');
            this.shadowRoot.appendChild(style);
        }
        style.textContent = css;

        // Renderiza el template
        let container = this.shadowRoot.getElementById('slider-content');
        if (!container) {
            container = document.createElement('div');
            container.id = 'slider-content';
            this.shadowRoot.appendChild(container);
        }
        container.innerHTML = this.#getTemplate();

        // Asigna eventos a los botones
        container.querySelector('#prevBtn').onclick = () => this.prevSlide();
        container.querySelector('#nextBtn').onclick = () => this.nextSlide();
        // Asigna eventos a los indicadores
        container.querySelectorAll('.indicators span').forEach((el, i) => {
            el.onclick = () => { this.currentIndex = i; this.#render(); };
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
        if (this._isBuilt) this.#render();
    }

    // Muestra la siguiente diapositiva
    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
        this.#render();
    }

    // Muestra la diapositiva anterior
    prevSlide() {
        this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.#render();
    }

    // Inicia el auto-slide y pausa al pasar el mouse
    startAutoSlide() {
        if (this.interval) clearInterval(this.interval);
        this.interval = setInterval(() => this.nextSlide(), 3000);
        const container = this.shadowRoot.querySelector('.slider-container');
        if (container) {
            container.addEventListener('mouseenter', () => clearInterval(this.interval));
            container.addEventListener('mouseleave', () => this.startAutoSlide());
        }
    }
}

customElements.define('fast-slider-text', FastSliderText);