export const FastSlider = class extends Fast{
  static observedAttributes = ["value", "min", "max", "step"];

  constructor(props) {
    super();
    this.name = "FastSlider";
    this.props = props;
    if (props && props.id) { this.id = props.id };
    this.built = () => {};
    this.attachShadow({ mode: 'open' });
    this._value = 50;
    this._min = 0;
    this._max = 100;
    this._step = 1;
    this._isBuilt = false;
    this.objectProps = new Map();
    this._readyPromise = new Promise(resolve => {
      this._resolveReady = resolve;
    });
  }

  #getTemplate() {
    return `
      <div class="slider-container">
        <div class="slider-track">
          <div class="slider-thumb"></div>
        </div>
        <div class="slider-value"></div>
      </div>
    `;
  }

  async #getCss() {
    return await fast.getCssFile("FastSlider");
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
        this.mainElement = tpc.firstElementChild;
        this.shadowRoot.appendChild(this.mainElement);
        resolve(this);
      } catch (err) {
        reject(err);
      }
    })
  }

  async #checkAttributes() {
    return new Promise(async (resolve, reject) => {
      try {
        for (let attr of this.getAttributeNames()) {
          if (attr.substring(0,2) != "on") {
            this.mainElement.setAttribute(attr, this.getAttribute(attr));
            this[attr] = this.getAttribute(attr);
          }
          switch(attr) {
            case 'id': 
              await fast.createInstance('FastSlider', { 'id': this[attr] });
              break;
            case 'value':
              this.value = Number(this.getAttribute('value'));
              break;
            case 'min':
              this.min = Number(this.getAttribute('min'));
              break;
            case 'max':
              this.max = Number(this.getAttribute('max'));
              break;
            case 'step':
              this.step = Number(this.getAttribute('step'));
              break;
          }
        }
        resolve(this);
      } catch (error) {
        reject(error);
      }
    })
  }

  async #checkProps() {
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
                if (attr === 'id') await fast.createInstance('FastSlider', { 'id': this[attr] });
                if (attr === 'value') { this.value = Number(this.props[attr]); }
                if (attr === 'min') { this.min = Number(this.props[attr]); }
                if (attr === 'max') { this.max = Number(this.props[attr]); }
                if (attr === 'step') { this.step = Number(this.props[attr]); }
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
    this._setupSlider();
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

  set value(val) {
    this._value = Math.max(this.min, Math.min(this.max, Number(val)));
    this._readyPromise.then(() => this._updateSlider());
  }
  get value() { return this._value; }

  set min(val) { this._min = Number(val); }
  get min() { return this._min; }

  set max(val) { this._max = Number(val); }
  get max() { return this._max; }

  set step(val) { this._step = Number(val); }
  get step() { return this._step; }

  _setupSlider() {
    const track = this.shadowRoot.querySelector('.slider-track');
    const thumb = this.shadowRoot.querySelector('.slider-thumb');
    const valueDisplay = this.shadowRoot.querySelector('.slider-value');
    let dragging = false;

    const setThumbPosition = (value) => {
      const percent = (value - this.min) / (this.max - this.min);
      const trackWidth = track.offsetWidth;
      thumb.style.left = `${percent * trackWidth}px`;
      valueDisplay.textContent = `Value: ${Math.round(value)}`;
    };

    const getValueFromPosition = (x) => {
      const rect = track.getBoundingClientRect();
      let percent = (x - rect.left) / rect.width;
      percent = Math.max(0, Math.min(1, percent));
      let val = this.min + percent * (this.max - this.min);
      // Snap to step
      val = Math.round(val / this.step) * this.step;
      return Math.max(this.min, Math.min(this.max, val));
    };

    thumb.addEventListener('mousedown', (e) => {
      dragging = true;
      thumb.classList.add('active');
    });

    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const value = getValueFromPosition(e.clientX);
      this.value = value;
      setThumbPosition(this.value);
      this.dispatchEvent(new CustomEvent('slider-change', { detail: { value: this.value } }));
    });

    document.addEventListener('mouseup', () => {
      dragging = false;
      thumb.classList.remove('active');
    });

    // Click on track to move thumb
    track.addEventListener('click', (e) => {
      const value = getValueFromPosition(e.clientX);
      this.value = value;
      setThumbPosition(this.value);
      this.dispatchEvent(new CustomEvent('slider-change', { detail: { value: this.value } }));
    });

    // Initialize
    setThumbPosition(this.value);
  }

  _updateSlider() {
    const track = this.shadowRoot.querySelector('.slider-track');
    const thumb = this.shadowRoot.querySelector('.slider-thumb');
    const valueDisplay = this.shadowRoot.querySelector('.slider-value');
    if (!track || !thumb || !valueDisplay) return;
    const percent = (this.value - this.min) / (this.max - this.min);
    const trackWidth = track.offsetWidth;
    thumb.style.left = `${percent * trackWidth}px`;
    valueDisplay.textContent = `Value: ${Math.round(this.value)}`;
  }
}

if (!customElements.get('fast-slider')) {
  customElements.define('fast-slider', FastSlider);
}


