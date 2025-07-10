document.addEventListener('DOMContentLoaded', function() {
    const availableOptions = document.getElementById('available-options');
    const selectedOptions = document.getElementById('selected-options');
    const addBtn = document.getElementById('add-btn');
    const removeBtn = document.getElementById('remove-btn');
    const availableCount = document.getElementById('available-count');
    const selectedCount = document.getElementById('selected-count');
    
    //opciones disponibles 
    const totalAvailable = document.querySelectorAll('#available-options .option-item').length;
    updateCounts();
    
    // Selección de elementos
    function handleItemClick(e) {
        const item = e.target.closest('.option-item');
        if (item) {
            item.classList.toggle('selected');
            updateButtonsState();
            updateCounts();
        }
    }
    
    availableOptions.addEventListener('click', handleItemClick);
    selectedOptions.addEventListener('click', handleItemClick);
    
    // transferir elementos
    addBtn.addEventListener('click', function() {
        const items = document.querySelectorAll('#available-options .option-item.selected');
        items.forEach(item => {
            item.classList.remove('selected');
            selectedOptions.appendChild(item);
        });
        updateButtonsState();
        updateCounts();
    });
    
    removeBtn.addEventListener('click', function() {
        const items = document.querySelectorAll('#selected-options .option-item.selected');
        items.forEach(item => {
            item.classList.remove('selected');
            availableOptions.appendChild(item);
        });
        updateButtonsState();
        updateCounts();
    });
    
    // estado de los botones
    function updateButtonsState() {
        const selectedAvailable = document.querySelectorAll('#available-options .option-item.selected').length;
        const selectedSelected = document.querySelectorAll('#selected-options .option-item.selected').length;
        
        addBtn.disabled = selectedAvailable === 0;
        removeBtn.disabled = selectedSelected === 0;
    }
    
    // contadores
    function updateCounts() {
        const currentAvailable = document.querySelectorAll('#available-options .option-item').length;
        const selectedAvailable = document.querySelectorAll('#available-options .option-item.selected').length;
        const currentSelected = document.querySelectorAll('#selected-options .option-item').length;
        const selectedSelected = document.querySelectorAll('#selected-options .option-item.selected').length;
        
        availableCount.textContent = `${selectedAvailable}/${currentAvailable} seleccionadas`;
        selectedCount.textContent = `${selectedSelected}/${currentSelected > 0 ? currentSelected : '0'} seleccionadas`;
    }
});