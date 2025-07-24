import { FastColumn } from "./FastColumn.js";
import { FastNavigator } from "./FastNavigator.js";

export const FastGrid = class extends Fast {
    constructor(props) {
        super();
        this.name = "FastGrid";
        this.props = props;
        this._sts = false;
        this.built = () => {};
        this.attachShadow({ mode: 'open' });
        this._isBuilt = false;
        this.columns = new Map();
        this.columnOrder = [];
        this._data = [];
        this._pageSize = 10;
        this._currentPage = 0;
        this._totalPages = 0;
        this._columnsConfig = [];
        this.navigator = null;
        this._selectedRow = -1;
        this._selectedColumn = -1;
        this.gridContainer = null;
        this.navigatorContainer = null;
    }

    #getTemplate() {
        return `
            <div class="FastGrid">
                <div class="FastGridHeader">
                </div>
                <div class="FastGridBody">
                </div>
                <div class="FastGridFooter">
                </div>
            </div>
        `;
    }

    async #getCss() {
        return await fast.getCssFile("FastGrid");
    }

    #checkAttributes() {
        return new Promise(async (resolve, reject) => {
            try {
                for (let attr of this.getAttributeNames()) {
                    if (attr.substring(0, 2) != "on") {
                        this[attr] = this.getAttribute(attr);
                        this.mainElement.setAttribute(attr, this[attr]);
                    } else {
                        let f = this[attr];
                        this[attr] = () => { if (!this._disabled) f() };
                    }
                    switch (attr) {
                        case 'id':
                            await fast.createInstance('FastGrid', { 'id': this[attr] });
                            break;
                        case 'pagesize':
                            this.pageSize = this.getAttribute(attr);
                            break;
                    }
                }
                resolve(this);
            } catch (error) {
                reject(error);
            }
        });
    }

    #checkProps() {
        return new Promise(async (resolve, reject) => {
            try {
                if (this.props) {
                    for (let attr in this.props) {
                        switch (attr) {
                            case 'style':
                                for (let attrcss in this.props.style) 
                                    this.mainElement.style[attrcss] = this.props.style[attrcss];
                                break;
                            case 'events':
                                for (let attrevent in this.props.events) {
                                    this.mainElement.addEventListener(attrevent, (e) => {
                                        if (!this._disabled) this.props.events[attrevent](e)
                                    });
                                }
                                break;
                            default:
                                this.setAttribute(attr, this.props[attr]);
                                this[attr] = this.props[attr];
                                if (attr === 'id') {
                                    this.id = this[attr];
                                    await fast.createInstance('FastGrid', { 'id': this[attr] });
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

    #render() {
        return new Promise(async (resolve, reject) => {
            try {
                this.sheet = new CSSStyleSheet();
                let css = await this.#getCss();
                this.sheet.replaceSync(css);
                this.shadowRoot.adoptedStyleSheets = [this.sheet];
                this.template = document.createElement('template');
                this.template.innerHTML = this.#getTemplate();
                let tpc = this.template.content.cloneNode(true);
                this.mainElement = tpc.firstChild.nextSibling;
                this.shadowRoot.appendChild(this.mainElement);
                this.headerElement = this.mainElement.firstChild.nextSibling;
                this.bodyElement = this.mainElement.firstChild.nextSibling.nextSibling.nextSibling;
                this.footerElement = this.mainElement.firstChild.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling;
                resolve(this);
            } catch (error) {
                reject(error);
            }
        });
    }

    async #createNavigator() {
        this.navigator = await fast.createInstance("FastNavigator", {
            'id': this.id + '_navigator',
            'totalpage': this._totalPages,
            'itempage': this._currentPage + 1,
            'style': { 'width': '100%' }
        });
        
        this.navigator.built = () => {
            // Set initial values correctly
            this.navigator._totalpage = this._totalPages;
            this.navigator._itemPage = this._currentPage;
            this.navigator.setPagination();
            this.#setupNavigatorEvents();
        };
        
        this.footerElement.appendChild(this.navigator);
        return this.navigator;
    }

    #setupNavigatorEvents() {
        // Override navigator events to sync with grid
        let originalNextPage = this.navigator.nextPage.bind(this.navigator);
        let originalPriorPage = this.navigator.priorPage.bind(this.navigator);
        
        this.navigator.nextPage = () => {
            if (this._currentPage < this._totalPages - 1) {
                this._currentPage++;
                this.navigator._itemPage = this._currentPage;
                this.navigator.setPagination();
                this.#updateColumnsPage();
                this.#dispatchPageChangeEvent();
                this.renderRows(); // <-- Mostrar filas al cambiar de página
                return this.navigator;
            }
            return this.navigator;
        };
        
        this.navigator.priorPage = () => {
            if (this._currentPage > 0) {
                this._currentPage--;
                this.navigator._itemPage = this._currentPage;
                this.navigator.setPagination();
                this.#updateColumnsPage();
                this.#dispatchPageChangeEvent();
                this.renderRows(); // <-- Mostrar filas al cambiar de página
                return this.navigator;
            }
            return this.navigator;
        };

        // Override arrow click events
        this.navigator.arrowFirst.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this._currentPage = 0;
            this.navigator._itemPage = 0;
            this.navigator.setPagination();
            this.#updateColumnsPage();
            this.#dispatchPageChangeEvent();
            this.renderRows(); // <-- Mostrar filas al cambiar de página
        }, true);

        this.navigator.arrowLast.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this._currentPage = this._totalPages - 1;
            this.navigator._itemPage = this._currentPage;
            this.navigator.setPagination();
            this.#updateColumnsPage();
            this.#dispatchPageChangeEvent();
            this.renderRows(); // <-- Mostrar filas al cambiar de página
        }, true);

        this.navigator.arrowLeft.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.navigator.priorPage();
        }, true);

        this.navigator.arrowRight.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.navigator.nextPage();
        }, true);

        // Listen for direct page input changes
        this.navigator.fastInput.addEventListener('blur', (e) => {
            let pageValue = parseInt(this.navigator.fastInput.value, 10);
            if (!isNaN(pageValue) && pageValue >= 1 && pageValue <= this._totalPages) {
                this._currentPage = pageValue - 1;
                this.navigator._itemPage = this._currentPage;
                this.#updateColumnsPage();
                this.#dispatchPageChangeEvent();
                this.renderRows(); // <-- Mostrar filas al cambiar de página
            }
            this.navigator.setPagination();
        }, true);
    }

    #updateColumnsPage() {
        for (let [colName, column] of this.columns) {
            column._itemPage = this._currentPage;
            column._offsetPage = 0;  // Reset offset when changing pages
            column.showPage();
        
        // Apply styling fixes after data is populated
        setTimeout(() => {
            this.#fixColumnStyling(column);
        }, 100);
        }
    }

    #dispatchPageChangeEvent() {
        let pageChangeEvent = new CustomEvent("pagechange", {
            detail: {
                currentPage: this._currentPage,
                totalPages: this._totalPages,
                pageSize: this._pageSize
            }
        });
        this.mainElement.dispatchEvent(pageChangeEvent);
    }

    async #createColumns() {
        this.bodyElement.innerHTML = '';
        this.gridContainer = document.createElement('div');
        this.gridContainer.className = 'FastGridContainer';
        this.bodyElement.appendChild(this.gridContainer);

        for (let i = 0; i < this._columnsConfig.length; i++) {
            let colConfig = this._columnsConfig[i];
            let columnId = this.id + '_col_' + colConfig.name;
            
            let column = await fast.createInstance("FastColumn", {
                'id': columnId,
                'columntitle': colConfig.title || colConfig.name,
                'columnname': colConfig.name,
                'contenteditable': colConfig.editable || false,
                'pagesize': this._pageSize,
                'style': {
                    'width': colConfig.width || '150px',
                    'height': '100%',
                    'display': 'inline-block',
                    'vertical-align': 'top',
                    'margin-right': '1px',
                    'border-right': '1px solid #ddd'
                },
                'events': {
                    'cellfocus': (e) => this.#onCellFocus(e, colConfig.name),
                    'cellblur': (e) => this.#onCellBlur(e, colConfig.name),
                    'cellclick': (e) => this.#onCellClick(e, colConfig.name),
                    'cellkeydown': (e) => this.#onCellKeydown(e, colConfig.name),
                    'cellkeyup': (e) => this.#onCellKeyup(e, colConfig.name)
                }
            });

            column.built = () => {
                this.#populateColumnData(colConfig.name);
                // Force proper styling after column is built
                this.#fixColumnStyling(column);
            };

            this.columns.set(colConfig.name, column);
            this.columnOrder.push(colConfig.name);
            this.gridContainer.appendChild(column);
        }
    }

    #fixColumnStyling(column) {
        // Access the shadow DOM of the column to fix styling issues
        if (column.shadowRoot) {
            let bodyElement = column.shadowRoot.querySelector('.FastColumnBody');
            if (bodyElement) {
                bodyElement.style.overflow = 'hidden';
                bodyElement.style.position = 'relative';
            }
            
            // Fix all cell containers
            let cells = column.shadowRoot.querySelectorAll('.FastColumnCellInternal');
            cells.forEach(cell => {
                cell.style.whiteSpace = 'nowrap';
                cell.style.overflow = 'hidden';
                cell.style.textOverflow = 'ellipsis';
                cell.style.display = 'block';
                cell.style.width = '100%';
                cell.style.boxSizing = 'border-box';
                cell.style.padding = '4px 8px';
                cell.style.lineHeight = '1.4';
                cell.style.position = 'relative';
                cell.style.zIndex = '1';
            });
        }
    }

    #populateColumnData(columnName) {
        let column = this.columns.get(columnName);
        if (!column) return;

        column.clearData();
        
        for (let i = 0; i < this._data.length; i++) {
            let rowData = this._data[i];
            let cellValue = rowData[columnName] || '';
            column.addData(cellValue);
        }
        
        column.showPage();
    }

    #onCellFocus(e, columnName) {
        this._selectedRow = e.detail.pos;
        this._selectedColumn = this.columnOrder.indexOf(columnName);
        
        let cellFocusEvent = new CustomEvent("cellfocus", {
            detail: {
                row: this._selectedRow,
                column: columnName,
                columnIndex: this._selectedColumn,
                value: e.detail.value,
                originalEvent: e.detail
            }
        });
        this.mainElement.dispatchEvent(cellFocusEvent);
    }

    #onCellBlur(e, columnName) {
        // Update data if cell was edited
        if (e.detail.value !== undefined && this._data[e.detail.pos]) {
            this._data[e.detail.pos][columnName] = e.detail.value;
        }

        let cellBlurEvent = new CustomEvent("cellblur", {
            detail: {
                row: e.detail.pos,
                column: columnName,
                columnIndex: this._selectedColumn,
                value: e.detail.value,
                originalEvent: e.detail
            }
        });
        this.mainElement.dispatchEvent(cellBlurEvent);
    }

    #onCellClick(e, columnName) {
        let cellClickEvent = new CustomEvent("cellclick", {
            detail: {
                row: e.detail.pos,
                column: columnName,
                columnIndex: this.columnOrder.indexOf(columnName),
                value: e.detail.value,
                originalEvent: e.detail
            }
        });
        this.mainElement.dispatchEvent(cellClickEvent);
    }

    #onCellKeydown(e, columnName) {
        // Handle cross-column navigation
        if (e.detail.key === 'Tab') {
            let nextColumnIndex = this._selectedColumn + 1;
            if (nextColumnIndex < this.columnOrder.length) {
                let nextColumn = this.columns.get(this.columnOrder[nextColumnIndex]);
                if (nextColumn && nextColumn.dataList.has(this._selectedRow)) {
                    nextColumn.dataList.get(this._selectedRow).dataContainerInternal.focus();
                }
            }
        }

        let cellKeydownEvent = new CustomEvent("cellkeydown", {
            detail: {
                row: e.detail.pos,
                column: columnName,
                columnIndex: this._selectedColumn,
                key: e.detail.key,
                value: e.detail.value,
                originalEvent: e.detail
            }
        });
        this.mainElement.dispatchEvent(cellKeydownEvent);
    }

    #onCellKeyup(e, columnName) {
        let cellKeyupEvent = new CustomEvent("cellkeyup", {
            detail: {
                row: e.detail.pos,
                column: columnName,
                columnIndex: this._selectedColumn,
                key: e.detail.key,
                value: e.detail.value,
                originalEvent: e.detail
            }
        });
        this.mainElement.dispatchEvent(cellKeyupEvent);
    }

    #calculateTotalPages() {
        if (this._data.length === 0) {
            this._totalPages = 1;
        } else {
            this._totalPages = Math.ceil(this._data.length / this._pageSize);
        }
        
        // Ensure current page is within bounds
        if (this._currentPage >= this._totalPages) {
            this._currentPage = Math.max(0, this._totalPages - 1);
        }
    }

    async connectedCallback() {
        await this.#render();
        await this.#checkAttributes();
        await this.#checkProps();
        this._isBuilt = true;
        this.built();
    }


    addToBody() {
        document.body.appendChild(this);
    }

    async setColumns(columnsConfig) {
        this._columnsConfig = columnsConfig;

        this.headerElement.innerHTML = '';
        for (let col of columnsConfig) {
            const th = document.createElement('div');
            th.className = 'FastGridHeaderCell';
            th.style.width = col.width || '150px';
            th.textContent = col.title || col.name;
            this.headerElement.appendChild(th);
        }

        await this.#createNavigator();
        this.renderRows();
        this.adjustGridHeight();
        return this;
    }

    #forceAllColumnsStyling() {
        for (let [colName, column] of this.columns) {
            this.#fixColumnStyling(column);
        }
    }

    setData(data) {
        this._data = data;
        this.#calculateTotalPages();
        this._currentPage = 0;
        if (this.navigator) {
            this.navigator._totalpage = this._totalPages;
            this.navigator._itemPage = this._currentPage;
            if (this.navigator.fastInput) {
                this.navigator.setPagination();
            } else {
                setTimeout(() => {
                    if (this.navigator.fastInput) {
                        this.navigator.setPagination();
                    }
                }, 0);
            }
        }
        this.renderRows();
        this.adjustGridHeight();
        return this;
    }

    addRow(rowData) {
        this._data.push(rowData);
        this.#calculateTotalPages();
        
        if (this.navigator) {
            this.navigator.totalpage = this._totalPages;
        }
        
        // Add data to each column
        for (let columnName of this.columnOrder) {
            let column = this.columns.get(columnName);
            if (column) {
                let cellValue = rowData[columnName] || '';
                column.addData(cellValue);
            }
        }
        
        return this;
    }

    removeRow(rowIndex) {
        if (rowIndex >= 0 && rowIndex < this._data.length) {
            this._data.splice(rowIndex, 1);
            this.#calculateTotalPages();
            
            if (this.navigator) {
                this.navigator.totalpage = this._totalPages;
            }
            
            // Remove from all columns and refresh
            for (let columnName of this.columnOrder) {
                let column = this.columns.get(columnName);
                if (column) {
                    column.deleteRow(rowIndex);
                }
            }
        }
        return this;
    }

    getValue(row, column) {
        if (row >= 0 && row < this._data.length && this._data[row][column] !== undefined) {
            return this._data[row][column];
        }
        return null;
    }

    setValue(row, column, value) {
        if (row >= 0 && row < this._data.length) {
            this._data[row][column] = value;
            let col = this.columns.get(column);
            if (col) {
                col.setValue(value, row);
            }
        }
        return this;
    }

    getRowData(row) {
        if (row >= 0 && row < this._data.length) {
            return { ...this._data[row] };
        }
        return null;
    }

    clearData() {
        this._data = [];
        this._totalPages = 1;
        this._currentPage = 0;
        
        if (this.navigator) {
            this.navigator.totalpage = this._totalPages;
            this.navigator.itempage = 1;
        }
        
        for (let [colName, column] of this.columns) {
            column.clearData();
        }
        
        return this;
    }

    goToPage(page) {
        if (page >= 1 && page <= this._totalPages) {
            this._currentPage = page - 1;
            if (this.navigator) {
                this.navigator.itempage = page;
            }
            this.#updateColumnsPage();
            this.#dispatchPageChangeEvent();
        }
        return this;
    }

    renderRows() {
        this.bodyElement.innerHTML = '';
        // Solo mostrar las filas de la página actual
        const start = this._currentPage * this._pageSize;
        const end = Math.min(start + this._pageSize, this._data.length);
        for (let i = start; i < end; i++) {
            const row = document.createElement('div');
            row.className = 'FastGridRow';
            for (let col of this._columnsConfig) {
                const cell = document.createElement('div');
                cell.className = 'FastGridCell';
                cell.style.width = col.width || '150px';
                cell.textContent = this._data[i][col.name] || '';
                row.appendChild(cell);
            }
            this.bodyElement.appendChild(row);
        }
        // Ajusta la altura del grid después de renderizar filas
        this.adjustGridHeight();
    }

    adjustGridHeight() {
        // Ajusta estos valores si cambias el CSS
        const headerHeight = this.headerElement.offsetHeight || 32;
        const footerHeight = this.footerElement.offsetHeight || 48;
        // Calcula la altura real de una fila
        let rowHeight = 0;
        const tempRow = this.bodyElement.querySelector('.FastGridRow');
        if (tempRow) {
            rowHeight = tempRow.offsetHeight;
        } else {
            rowHeight = 32; // Valor por defecto si no hay filas
        }
        const totalRows = this._pageSize;
        const totalHeight = headerHeight + (rowHeight * totalRows) + footerHeight;
        this.mainElement.style.height = totalHeight + 'px';
    }

    // Getters and setters
    static get observedAttributes() {
        return ['pagesize'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'pagesize' && oldValue !== newValue) {
            this.pageSize = newValue;
            this.renderRows();
        }
    }

    get pageSize() { return this._pageSize; }
    set pageSize(val) {
        this._pageSize = parseInt(val, 10);
        this.#calculateTotalPages();
        
        // Update all columns
        for (let [colName, column] of this.columns) {
            column.pagesize = this._pageSize;
            column.showPage();
        }
        
        if (this.navigator) {
            this.navigator.totalpage = this._totalPages;
        }
        this.renderRows(); // <-- Asegúrate de llamar esto aquí
    }

    get currentPage() { return this._currentPage + 1; }
    get totalPages() { return this._totalPages; }
    get data() { return [...this._data]; }
    get selectedRow() { return this._selectedRow; }
    get selectedColumn() { return this._selectedColumn; }
    get columnsConfig() { return [...this._columnsConfig]; }
}

if (!customElements.get('fast-grid')) {
    customElements.define('fast-grid', FastGrid);
}