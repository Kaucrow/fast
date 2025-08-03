document.addEventListener('DOMContentLoaded', function() {
    const availableOptions = document.getElementById('available-options');
    const selectedOptions = document.getElementById('selected-options');
    const addBtn = document.getElementById('add-btn');
    const removeBtn = document.getElementById('remove-btn');
    const leftHeader = document.getElementById('left-header');
    const rightHeader = document.getElementById('right-header');
    const leftTitleInput = document.getElementById('left-title');
    const rightTitleInput = document.getElementById('right-title');
    const optionsTextarea = document.getElementById('options-list');
    const applyLeftTitleBtn = document.getElementById('apply-left-title');
    const applyRightTitleBtn = document.getElementById('apply-right-title');
    const applyOptionsBtn = document.getElementById('apply-options');
    const deleteOptionsBtn = document.getElementById('delete-options');
    
    initializeList();
    
    applyLeftTitleBtn.addEventListener('click', function() {
        leftHeader.textContent = leftTitleInput.value;
    });
    
    applyRightTitleBtn.addEventListener('click', function() {
        rightHeader.textContent = rightTitleInput.value;
    });
    
    applyOptionsBtn.addEventListener('click', function() {
        addOptionsToList();
    });
    
    deleteOptionsBtn.addEventListener('click', function() {
        deleteSelectedOptions();
    });
    
    // Funcion para agregar opciones sin borrar existentes
    function addOptionsToList() {
        const options = optionsTextarea.value.split('\n').filter(option => option.trim() !== '');
        
        options.forEach((optionText, index) => {
            // Verificar si opcion ya existe
            const existingOption = Array.from(availableOptions.children).find(item => 
                item.textContent.trim() === optionText.trim()) ||
                Array.from(selectedOptions.children).find(item => 
                item.textContent.trim() === optionText.trim());
            
            if (!existingOption) {
                const optionItem = document.createElement('li');
                optionItem.className = 'option-item';
                optionItem.dataset.value = `option-${Date.now()}-${index}`;
                
                optionItem.innerHTML = `
                    <span class="checkbox"></span>
                    <span>${optionText.trim()}</span>
                `;
                
                availableOptions.appendChild(optionItem);
            }
        });
        
        optionsTextarea.value = '';
        
        updateButtonsState();
    }
    
    // Funcion para eliminar opciones
    function deleteSelectedOptions() {
        const selectedAvailable = document.querySelectorAll('#available-options .option-item.selected');
        const selectedSelected = document.querySelectorAll('#selected-options .option-item.selected');
        
        selectedAvailable.forEach(item => item.remove());
        selectedSelected.forEach(item => item.remove());
        
        updateButtonsState();
    }
    
    function initializeList() {
        availableOptions.innerHTML = '';
        selectedOptions.innerHTML = '';
        
        
        availableOptions.addEventListener('click', handleItemClick);
        selectedOptions.addEventListener('click', handleItemClick);
        
        updateButtonsState();
    }
    
    // Manejador de elementos
    function handleItemClick(e) {
        const item = e.target.closest('.option-item');
        if (item) {
            item.classList.toggle('selected');
            updateButtonsState();
        }
    }
    
    // transferir elementos
    addBtn.addEventListener('click', function() {
        const items = document.querySelectorAll('#available-options .option-item.selected');
        items.forEach(item => {
            item.classList.remove('selected');                                                                                    
            selectedOptions.appendChild(item);
        });
        updateButtonsState();
    });
    
    removeBtn.addEventListener('click', function() {
        const items = document.querySelectorAll('#selected-options .option-item.selected');
        items.forEach(item => {
            item.classList.remove('selected');
            availableOptions.appendChild(item);
        });
        updateButtonsState();
    });
    
    // estado de los botones
    function updateButtonsState() {
        const selectedAvailable = document.querySelectorAll('#available-options .option-item.selected').length;
        const selectedSelected = document.querySelectorAll('#selected-options .option-item.selected').length;
        
        addBtn.disabled = selectedAvailable === 0;
        removeBtn.disabled = selectedSelected === 0;
        deleteOptionsBtn.disabled = (selectedAvailable + selectedSelected) === 0;
    }
});