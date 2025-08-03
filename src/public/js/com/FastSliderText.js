import {FastIcon} from "./FastIcon.js"
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
        return `
                <div class="main-content">
                    <button id="prevBtn" class="arrow-btn">
                        <fast-icon iconname="leftArrow"></fast-icon>
                    </button>
                    <div class="slides-list">
                        <div class="slides">
                            ${this.slides.map((text) =>
                                `<div class="slide"><div class="slide-content">${text}</div></div>`
                            ).join('')}
                        </div>
                    </div>
                    <button id="nextBtn" class="arrow-btn">
                        <fast-icon iconname="rightArrow"></fast-icon>
                    </button>
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

        this.#setupIconHover(); // Configurar hover de iconos
        this.#removeIconBorders();

        this.#updateView();
    }

    // Método para eliminar bordes de los iconos
    #removeIconBorders() {
        // Esperar a que los fast-icon se rendericen completamente
        setTimeout(() => {
            const fastIcons = this.shadowRoot.querySelectorAll('fast-icon');
            fastIcons.forEach(icon => {
                // Acceder al shadow root del fast-icon
                if (icon.shadowRoot) {
                    const iconContainers = icon.shadowRoot.querySelectorAll('.FastIconContainer, .FastIconContainer:active, .FastIconContainer:focus');
                    iconContainers.forEach(container => {
                        container.style.border = 'none';
                        container.style.boxShadow = 'none';
                        container.style.outline = 'none';
                    });
                    
                    // También eliminar bordes del SVG
                    const svgElements = icon.shadowRoot.querySelectorAll('.FastIcon');
                    svgElements.forEach(svg => {
                        svg.style.outline = 'none';
                        svg.style.border = 'none';
                    });
                }
            });
        }, 100);
    }

    #smallIcon(){
        // Esperar a que los fast-icon se rendericen completamente
        setTimeout(() => {
            const fastIcons = this.shadowRoot.querySelectorAll('fast-icon');
            fastIcons.forEach(icon => {
                // Acceder al shadow root del fast-icon
                if (icon.shadowRoot) {
                    const iconContainers = icon.shadowRoot.querySelectorAll('.FastIcon');
                    iconContainers.forEach(container => {
                        container.style.width = '10px';
                        container.style.height = '10px';
                    });
                }
            });
        }, 100);
    }

    // Método para manejar el hover de los iconos
    #setupIconHover() {
        const arrowButtons = this.shadowRoot.querySelectorAll('.arrow-btn');
        
        arrowButtons.forEach(button => {
            const icon = button.querySelector('fast-icon');
            
            if (icon) {
                // Evento mouseenter
                button.addEventListener('mouseenter', () => {
                    if (icon.shadowRoot) {
                        // Cambiar el color del SVG directamente
                        /* const svgElement = icon.shadowRoot.querySelector('.FastIcon');
                        if (svgElement) {
                            svgElement.style.fill = '#007bff';
                            svgElement.style.transition = 'fill 0.3s ease';
                        } */
                        
                        // También cambiar el contenedor si es necesario
                        const iconContainers = icon.shadowRoot.querySelectorAll('.FastIconContainer');
                        iconContainers.forEach(container => {
                            container.style.transform = 'scale(1.1)';
                            container.style.transition = 'transform 0.3s ease';
                            container.style.padding = '0';
                        });
                    }
                });
                
                // Evento mouseleave
                button.addEventListener('mouseleave', () => {
                    if (icon.shadowRoot) {
                        // Restaurar el color original del SVG
                        const svgElement = icon.shadowRoot.querySelector('.FastIcon');
                        if (svgElement) {
                            svgElement.style.fill = 'rgb(10, 70, 62)';
                            svgElement.style.transition = '';
                        }
                        
                        // Restaurar el contenedor
                        const iconContainers = icon.shadowRoot.querySelectorAll('.FastIconContainer');
                        iconContainers.forEach(container => {
                            container.style.transform = '';
                            container.style.transition = '';
                        });
                    }
                });
            }
        });
    }

    // Actualiza la vista (transform e indicadores)
    #updateView(instant = false) {
        const slidesDiv = this.shadowRoot.querySelector('.slides');
        if (!slidesDiv) return;

        slidesDiv.style.transition = instant ? 'none' : 'transform 0.5s ease-in-out';
        slidesDiv.style.transform = `translateX(-${this.currentIndex * 100}%)`;
        
        if (instant) void slidesDiv.offsetWidth;

        this.dispatchEvent(new CustomEvent('slide-changed', {
            detail: this.getActiveValue()
        }));
        
        const slideContent = this.shadowRoot.querySelector('.slider-container');
        const arrows = this.shadowRoot.querySelector('.arrow-btn');
        if (slideContent && arrows) {
            const width = slideContent.offsetWidth;
            if (width < 100) {
                this.#smallIcon();
            }
        }
    }

    nextSlide() {
    const slidesDiv = this.shadowRoot.querySelector('.slides');
        if (!slidesDiv) return;

        const isLastSlide = this.currentIndex === this.slides.length - 1;
        
        if (isLastSlide) {
            // 1. Desactivar transición momentáneamente
            slidesDiv.style.transition = 'none';
            slidesDiv.style.transform = 'translateX(85%)'; // Mover fuera de pantalla
            void slidesDiv.offsetWidth; // Forzar reflow
            
            // 2. Animar hacia Enero (posición 0)
            slidesDiv.style.transition = 'transform 0.5s ease-in-out';
            this.currentIndex = 0;
            slidesDiv.style.transform = 'translateX(0%)';
        } else {
            // Movimiento normal
            this.currentIndex++;
            slidesDiv.style.transform = `translateX(-${this.currentIndex * 100}%)`;
        }
        
        this.dispatchEvent(new CustomEvent('slide-changed', {
            detail: this.getActiveValue()
        }));
    }

    prevSlide() {
        const isFirstSlide = this.currentIndex === 0;
        
        if (isFirstSlide) {
            // 1. Preparar posición inicial (invisible para el usuario)
            this.currentIndex = this.slides.length;
            this.#updateView(true); // Cambio instantáneo
            
            // 2. Mover a posición length-1 con animación
            setTimeout(() => {
                this.currentIndex = this.slides.length - 1;
                this.#updateView();
            }, 20);
        } else {
            // Movimiento normal
            this.currentIndex--;
            this.#updateView();
        }
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