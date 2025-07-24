import { FastColumn } from "./FastColumn.js";
import { FastNavigator } from "./FastNavigator.js";

export const FastGrid = class extends Fast {
    constructor(props) {
        super();
        this.name = "FastGrid";
        this.props = props;
        this.built = () => {};
        this.attachShadow({ mode: 'open' });
        
        // Estado del componente
        this._data = [];
        this._columnsConfig = [];
        this._pageSize = 10;
        this._currentPage = 0;
        this._totalPages = 0;
        this._selectedRow = -1;
        this._selectedColumn = -1;
        this._showCrudToolbar = true;
        this._sortState = { column: null, asc: true };
        
        // Elementos DOM
        this.navigator = null;
        this.columns = new Map();
        this.columnOrder = [];
    }

    #getTemplate() {
        return `
            <div class="FastGrid">
                <div class="FastGridToolbarToggle" title="Mostrar/Ocultar herramientas">⚙</div>
                <div class="FastGridToolbar ${this._showCrudToolbar ? '' : 'hidden'}"></div>
                <div class="FastGridHeader"></div>
                <div class="FastGridBody"></div>
                <div class="FastGridFooter"></div>
            </div>
        `;
    }

    async #getCss() {
        return await fast.getCssFile("FastGrid");
    }

    // Configuración inicial consolidada
    async #initialize() {
        await this.#render();
        await this.#processAttributes();
        await this.#processProps();
        this.#createCrudToolbar();
        this.built();
    }

    // Procesamiento de atributos y propiedades simplificado
    async #processAttributes() {
        for (let attr of this.getAttributeNames()) {
            if (attr.startsWith("on")) {
                let f = this[attr];
                this[attr] = () => { if (!this._disabled) f() };
            } else {
                this[attr] = this.getAttribute(attr);
                this.mainElement.setAttribute(attr, this[attr]);
            }
            
            if (attr === 'id') {
                await fast.createInstance('FastGrid', { 'id': this[attr] });
            } else if (attr === 'pagesize') {
                this.pageSize = this.getAttribute(attr);
            }
        }
    }

    async #processProps() {
        if (!this.props) return;
        
        for (let attr in this.props) {
            if (attr === 'style') {
                Object.assign(this.mainElement.style, this.props.style);
            } else if (attr === 'events') {
                for (let event in this.props.events) {
                    this.mainElement.addEventListener(event, (e) => {
                        if (!this._disabled) this.props.events[event](e);
                    });
                }
            } else {
                this.setAttribute(attr, this.props[attr]);
                this[attr] = this.props[attr];
                if (attr === 'id') {
                    this.id = this[attr];
                    await fast.createInstance('FastGrid', { 'id': this[attr] });
                }
            }
        }
    }

    async #render() {
        this.sheet = new CSSStyleSheet();
        const css = await this.#getCss();
        this.sheet.replaceSync(css);
        this.shadowRoot.adoptedStyleSheets = [this.sheet];
        
        this.template = document.createElement('template');
        this.template.innerHTML = this.#getTemplate();
        const content = this.template.content.cloneNode(true);
        this.mainElement = content.firstElementChild;
        this.shadowRoot.appendChild(this.mainElement);
        
        // Referencias a elementos
        this.toggleButton = this.mainElement.querySelector('.FastGridToolbarToggle');
        this.toolbarElement = this.mainElement.querySelector('.FastGridToolbar');
        this.headerElement = this.mainElement.querySelector('.FastGridHeader');
        this.bodyElement = this.mainElement.querySelector('.FastGridBody');
        this.footerElement = this.mainElement.querySelector('.FastGridFooter');
        
        // Configurar toggle toolbar
        this.toggleButton.addEventListener('click', () => {
            this._showCrudToolbar = !this._showCrudToolbar;
            this.showCrudToolbar(this._showCrudToolbar);
        });
    }

    // Navegación simplificada
    async #createNavigator() {
        if (this.navigator && this.footerElement.contains(this.navigator)) {
            this.footerElement.removeChild(this.navigator);
        }
        
        this.navigator = await fast.createInstance("FastNavigator", {
            'id': this.id + '_navigator',
            'totalpage': this._totalPages,
            'itempage': this._currentPage + 1,
            'style': { 'width': '100%' }
        });
        
        this.navigator.built = () => {
            this.navigator._totalpage = this._totalPages;
            this.navigator._itemPage = this._currentPage;
            this.navigator.setPagination();
            this.#setupNavigatorEvents();
        };
        
        this.footerElement.appendChild(this.navigator);
        return this.navigator;
    }

    #setupNavigatorEvents() {
        const navigateTo = (page) => {
            this._currentPage = Math.max(0, Math.min(page, this._totalPages - 1));
            this.navigator._itemPage = this._currentPage;
            this.navigator.setPagination();
            this.#updateColumnsPage();
            this.#dispatchCustomEvent('pagechange', {
                currentPage: this._currentPage,
                totalPages: this._totalPages,
                pageSize: this._pageSize
            });
            this.renderRows();
        };

        // Sobrescribir métodos de navegación
        this.navigator.nextPage = () => {
            if (this._currentPage < this._totalPages - 1) {
                navigateTo(this._currentPage + 1);
            }
            return this.navigator;
        };
        
        this.navigator.priorPage = () => {
            if (this._currentPage > 0) {
                navigateTo(this._currentPage - 1);
            }
            return this.navigator;
        };

        // Eventos de navegación
        const navigationEvents = [
            { element: 'arrowFirst', action: () => navigateTo(0) },
            { element: 'arrowLast', action: () => navigateTo(this._totalPages - 1) },
            { element: 'arrowLeft', action: () => this.navigator.priorPage() },
            { element: 'arrowRight', action: () => this.navigator.nextPage() }
        ];

        navigationEvents.forEach(({ element, action }) => {
            this.navigator[element]?.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                action();
            }, true);
        });

        // Input directo de página
        this.navigator.fastInput?.addEventListener('blur', (e) => {
            const pageValue = parseInt(this.navigator.fastInput.value, 10);
            if (!isNaN(pageValue) && pageValue >= 1 && pageValue <= this._totalPages) {
                navigateTo(pageValue - 1);
            }
            this.navigator.setPagination();
        }, true);
    }

    // Métodos utilitarios
    #dispatchCustomEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        this.mainElement.dispatchEvent(event);
    }

    #updateColumnsPage() {
        for (let [colName, column] of this.columns) {
            column._itemPage = this._currentPage;
            column._offsetPage = 0;
            column.showPage();
            setTimeout(() => this.#fixColumnStyling(column), 100);
        }
    }

    #calculateTotalPages() {
        this._totalPages = this._data.length === 0 ? 1 : Math.ceil(this._data.length / this._pageSize);
        this._currentPage = Math.min(this._currentPage, Math.max(0, this._totalPages - 1));
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
                    'cellfocus': this.#createCellEventHandler('cellfocus', colConfig.name),
                    'cellblur': this.#createCellEventHandler('cellblur', colConfig.name),
                    'cellclick': this.#createCellEventHandler('cellclick', colConfig.name),
                    'cellkeydown': this.#createCellEventHandler('cellkeydown', colConfig.name),
                    'cellkeyup': this.#createCellEventHandler('cellkeyup', colConfig.name)
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

    // Eventos de celda consolidados
    #createCellEventHandler(eventName, columnName) {
        return (e) => {
            const detail = {
                row: e.detail.pos,
                column: columnName,
                columnIndex: this.columnOrder.indexOf(columnName),
                value: e.detail.value,
                originalEvent: e.detail
            };

            // Lógica específica por evento
            if (eventName === 'cellfocus') {
                this._selectedRow = e.detail.pos;
                this._selectedColumn = detail.columnIndex;
            } else if (eventName === 'cellblur' && e.detail.value !== undefined && this._data[e.detail.pos]) {
                this._data[e.detail.pos][columnName] = e.detail.value;
            } else if (eventName === 'cellkeydown' && e.detail.key === 'Tab') {
                this.#handleTabNavigation();
            }

            // Agregar información específica para eventos de teclado
            if (eventName.includes('key')) {
                detail.key = e.detail.key;
            }

            this.#dispatchCustomEvent(eventName, detail);
        };
    }

    #handleTabNavigation() {
        const nextColumnIndex = this._selectedColumn + 1;
        if (nextColumnIndex < this.columnOrder.length) {
            const nextColumn = this.columns.get(this.columnOrder[nextColumnIndex]);
            if (nextColumn?.dataList?.has(this._selectedRow)) {
                nextColumn.dataList.get(this._selectedRow).dataContainerInternal.focus();
            }
        }
    }

    async connectedCallback() {
        await this.#initialize();
    }


    addToBody() {
        document.body.appendChild(this);
    }

    async setColumns(columnsConfig) {
        this._columnsConfig = columnsConfig;
        this.columnOrder = columnsConfig.map(col => col.name);

        // Estado de ordenamiento
        if (!this._sortState) {
            this._sortState = { column: null, asc: true };
        }

        // Renderiza encabezados con flechita y acciones
        this.headerElement.innerHTML = '';
        
        for (let col of columnsConfig) {
            const th = document.createElement('div');
            th.className = 'FastGridHeaderCell';
            th.style.width = col.width || '150px';
            th.style.minWidth = col.width || '150px';
            th.style.maxWidth = col.width || '150px'; // Evitar expansión
            th.style.flexShrink = '0'; // No permitir que se encoja
            
            let arrow = '';
            if (this._sortState.column === col.name) {
                arrow = this._sortState.asc ? ' ▲' : ' ▼';
            }
            
            th.innerHTML = `
                <span>${(col.title || col.name) + arrow}</span>
                <div class="column-actions">
                    <button class="column-action-btn" title="Eliminar columna">×</button>
                </div>
            `;
            
            th.style.cursor = 'pointer';
            
            // Click en encabezado para ordenar
            th.querySelector('span').addEventListener('click', () => {
                if (this._sortState.column === col.name) {
                    this._sortState.asc = !this._sortState.asc;
                } else {
                    this._sortState.column = col.name;
                    this._sortState.asc = true;
                }
                this.sortByColumn(this._sortState.column, this._sortState.asc);
                this.setColumns(this._columnsConfig);
            });
            
            // Click en botón eliminar columna
            th.querySelector('.column-action-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this._selectedColumn = this.columnOrder.indexOf(col.name);
                this.deleteSelectedColumn();
            });
            
            this.headerElement.appendChild(th);
        }

        // Limpiar el contenedor de columnas FastColumn (ya no las usamos)
        this.columns.clear();
        
        // Solo crear navegador si no existe
        if (!this.navigator || !this.footerElement.contains(this.navigator)) {
            await this.#createNavigator();
        } else {
            // Actualizar navegador existente
            this.navigator._totalpage = this._totalPages;
            this.navigator._itemPage = this._currentPage;
            this.navigator.setPagination();
        }
        
        // Solo renderizar si ya hay datos
        if (this._data && this._data.length > 0) {
            this.renderRows();
        }
        
        return this;
    }

    sortByColumn(column, asc) {
        if (!column) return;
        this._data.sort((a, b) => {
            if (a[column] < b[column]) return asc ? -1 : 1;
            if (a[column] > b[column]) return asc ? 1 : -1;
            return 0;
        });
        this._currentPage = 0;
        this.renderRows();
        this.adjustGridHeight();
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
            this.#dispatchCustomEvent('pagechange', {
                currentPage: this._currentPage,
                totalPages: this._totalPages,
                pageSize: this._pageSize
            });
        }
        return this;
    }

    renderRows() {
        this.bodyElement.innerHTML = '';
        
        // Calcular el ancho total de todas las columnas
        let totalWidth = 0;
        this._columnsConfig.forEach(col => {
            totalWidth += parseInt(col.width) || 150;
        });
        
        // Solo mostrar las filas de la página actual
        const start = this._currentPage * this._pageSize;
        const end = Math.min(start + this._pageSize, this._data.length);
        
        for (let i = start; i < end; i++) {
            const row = document.createElement('div');
            row.className = 'FastGridRow';
            row.dataset.rowIndex = i;
            
            // Click en fila para seleccionar
            row.addEventListener('click', (e) => {
                // Remover selección anterior
                this.bodyElement.querySelectorAll('.FastGridRow').forEach(r => r.classList.remove('selected'));
                row.classList.add('selected');
                
                this._selectedRow = i;
                this.#dispatchCustomEvent('rowSelected', { 
                    row: i, 
                    data: this._data[i] 
                });
            });
            
            for (let colIndex = 0; colIndex < this._columnsConfig.length; colIndex++) {
                const col = this._columnsConfig[colIndex];
                const cell = document.createElement('div');
                cell.className = 'FastGridCell';
                cell.style.width = col.width || '150px';
                cell.style.minWidth = col.width || '150px';
                cell.style.maxWidth = col.width || '150px'; // Evitar expansión
                cell.style.flexShrink = '0'; // No permitir encogimiento
                cell.textContent = this._data[i][col.name] || '';
                cell.dataset.columnIndex = colIndex;
                
                // Doble click para editar celda
                cell.addEventListener('dblclick', () => {
                    this.#editCell(i, col.name, cell);
                });
                
                row.appendChild(cell);
            }
            this.bodyElement.appendChild(row);
        }
        
        // Sincronizar scroll horizontal entre header y body
        this.#syncHorizontalScroll();
        
        // Ajusta la altura del grid después de renderizar filas
        setTimeout(() => this.adjustGridHeight(), 10); // Timeout reducido
    }

    #syncHorizontalScroll() {
        // Sincronizar scroll horizontal entre header y body
        this.bodyElement.addEventListener('scroll', () => {
            this.headerElement.scrollLeft = this.bodyElement.scrollLeft;
        });
        
        this.headerElement.addEventListener('scroll', () => {
            this.bodyElement.scrollLeft = this.headerElement.scrollLeft;
        });
    }

    #editCell(rowIndex, columnName, cellElement) {
        const currentValue = this._data[rowIndex][columnName] || '';
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentValue;
        input.style.width = '100%';
        input.style.border = 'none';
        input.style.padding = '4px';
        input.style.fontSize = 'inherit';
        input.style.fontFamily = 'inherit';
        
        cellElement.innerHTML = '';
        cellElement.appendChild(input);
        input.focus();
        input.select();
        
        const saveValue = () => {
            const newValue = input.value;
            this._data[rowIndex][columnName] = newValue;
            cellElement.textContent = newValue;
            this.#dispatchCustomEvent('cellEdited', {
                row: rowIndex,
                column: columnName,
                oldValue: currentValue,
                newValue: newValue
            });
        };
        
        input.addEventListener('blur', saveValue);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveValue();
            }
        });
    }

    adjustGridHeight() {
        // Calcular el ancho total necesario para todas las columnas
        let totalWidth = 0;
        this._columnsConfig.forEach(col => {
            totalWidth += parseInt(col.width) || 150;
        });
        
        // Establecer el ancho del grid basado en el contenido
        this.mainElement.style.width = Math.min(totalWidth + 2, window.innerWidth - 100) + 'px'; // +2 para bordes, -100 para márgenes
        
        // No establecer altura fija - dejar que CSS maneje con fit-content
        this.mainElement.style.height = ''; // Limpiar altura fija
        
        // Calcular altura basada en el número de filas visibles para el body solamente
        const visibleRows = Math.min(this._data.length - (this._currentPage * this._pageSize), this._pageSize);
        const contentHeight = Math.max(visibleRows * 32, 32); // Mínimo 1 fila (32px)
        
        // Solo ajustar el body para scroll si hay muchas filas
        if (contentHeight > 400) {
            this.bodyElement.style.maxHeight = '400px';
            this.bodyElement.style.overflowY = 'auto';
        } else {
            this.bodyElement.style.maxHeight = contentHeight + 'px';
            this.bodyElement.style.overflowY = 'hidden';
        }
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

    // CRUD simplificado
    #createCrudToolbar() {
        if (!this.toolbarElement) return;
        
        const buttons = [
            { id: 'addRowBtn', text: '+ Agregar Fila', action: () => this.addNewRow() },
            { id: 'deleteRowBtn', text: '🗑 Eliminar Fila', action: () => this.deleteSelectedRow() },
            { id: 'addColumnBtn', text: '+ Agregar Columna', action: () => this.addNewColumn() }
        ];
        
        this.toolbarElement.innerHTML = `
            ${buttons.map(btn => `<button class="FastGridToolbarButton" id="${btn.id}">${btn.text}</button>`).join('')}
            <div class="FastGridToolbarSeparator"></div>
        `;

        buttons.forEach(btn => {
            this.toolbarElement.querySelector(`#${btn.id}`)?.addEventListener('click', btn.action);
        });
    }

    addNewRow() {
        const newRow = Object.fromEntries(this._columnsConfig.map(col => [col.name, '']));
        this._data.push(newRow);
        this.#calculateTotalPages();
        this.#updateNavigator();
        this.renderRows();
        this.#dispatchCustomEvent('rowAdded', { row: this._data.length - 1, data: newRow });
        return this;
    }

    deleteSelectedRow() {
        if (this._selectedRow >= 0 && this._selectedRow < this._data.length) {
            const deletedData = { ...this._data[this._selectedRow] };
            this._data.splice(this._selectedRow, 1);
            this.#calculateTotalPages();
            this.#updateNavigator();
            this.renderRows();
            this._selectedRow = -1;
            this.#dispatchCustomEvent('rowDeleted', { data: deletedData });
        }
        return this;
    }

    addNewColumn() {
        const columnName = prompt('Nombre de la nueva columna:');
        if (columnName && !this._columnsConfig.find(col => col.name === columnName)) {
            const newColumn = { name: columnName, title: columnName, width: '150px' };
            this._columnsConfig.push(newColumn);
            this._data.forEach(row => row[columnName] = '');
            this.setColumns(this._columnsConfig);
            this.#dispatchCustomEvent('columnAdded', { column: newColumn });
        }
        return this;
    }

    deleteSelectedColumn() {
        if (this._selectedColumn >= 0 && this._selectedColumn < this._columnsConfig.length) {
            const columnToDelete = this._columnsConfig[this._selectedColumn];
            const columnName = columnToDelete.name;
            
            // Confirmar eliminación
            if (confirm(`¿Estás seguro de que quieres eliminar la columna "${columnToDelete.title || columnName}"?`)) {
                // Remover la columna de la configuración
                this._columnsConfig.splice(this._selectedColumn, 1);
                
                // Remover la columna de todos los datos
                this._data.forEach(row => {
                    delete row[columnName];
                });
                
                // Actualizar el orden de columnas
                this.columnOrder = this._columnsConfig.map(col => col.name);
                
                // Re-renderizar las columnas
                this.setColumns(this._columnsConfig);
                
                // Reset selección
                this._selectedColumn = -1;
                
                // Disparar evento
                this.#dispatchCustomEvent('columnDeleted', { 
                    column: columnToDelete 
                });
            }
        }
        return this;
    }

    showCrudToolbar(show = true) {
        this._showCrudToolbar = show;
        if (this.toolbarElement) {
            this.toolbarElement.className = `FastGridToolbar ${show ? '' : 'hidden'}`;
        }
        this.adjustGridHeight();
        return this;
    }

    hideCrudToolbar() {
        return this.showCrudToolbar(false);
    }

    #updateNavigator() {
        if (this.navigator) {
            this.navigator._totalpage = this._totalPages;
            this.navigator.setPagination();
        }
    }

    // Métodos públicos simplificados
    addToBody() {
        document.body.appendChild(this);
    }

    // Método para actualizar una fila específica
    updateRow(rowIndex, newData) {
        if (rowIndex >= 0 && rowIndex < this._data.length) {
            this._data[rowIndex] = { ...this._data[rowIndex], ...newData };
            this.renderRows();
            this.#dispatchCustomEvent('rowUpdated', { 
                row: rowIndex, 
                data: this._data[rowIndex] 
            });
        }
        return this;
    }

    // Método para obtener fila seleccionada
    getSelectedRowData() {
        if (this._selectedRow >= 0 && this._selectedRow < this._data.length) {
            return { ...this._data[this._selectedRow] };
        }
        return null;
    }
}

if (!customElements.get('fast-grid')) {
    customElements.define('fast-grid', FastGrid);
}