// Application State
const state = {
    originalImage: null,
    originalImageData: null, // Сохраняем оригинальные данные изображения
    imageData: null,
    startPoint: null,
    colorCount: 10,
    colorDiversity: 30,
    colorDiversityEnabled: true,
    limitColors: true, // Ограничивать количество цветов
    beadSize: 20,
    beadsHorizontal: 40,
    beadsVertical: 30,
    brightness: 0, // Яркость: -100 до 100
    contrast: 0, // Контрастность: -100 до 100
    beadMode: 'count', // 'count', 'size', 'both'
    fillMode: 'radial', // 'radial' - круговое, 'polar' - обычное (полярные логарифмические координаты)
    pattern: null,
    colorPalette: [],
    zoom: 1,
    showGrid: true,
    showLabels: true,
    showConnections: false,
    displayScaleMultiplier: 1.0,
    isGenerating: false, // Флаг для отслеживания процесса генерации
    generationCancelled: false // Флаг для отмены генерации
};

// DOM Elements
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const imageCanvas = document.getElementById('imageCanvas');
const canvasOverlay = document.getElementById('canvasOverlay');
const patternCanvas = document.getElementById('patternCanvas');
const patternCanvasWrapper = document.getElementById('patternCanvasWrapper');
const loadingOverlay = document.getElementById('loadingOverlay');

// Sections
const uploadSection = document.getElementById('uploadSection');
const selectPointSection = document.getElementById('selectPointSection');
const settingsSection = document.getElementById('settingsSection');
const patternSection = document.getElementById('patternSection');

// Inputs
const colorCountInput = document.getElementById('colorCountInput');
const colorDiversityInput = document.getElementById('colorDiversityInput');
const colorDiversityEnabled = document.getElementById('colorDiversityEnabled');
const limitColorsEnabled = document.getElementById('limitColorsEnabled');
const colorPaletteEditor = document.getElementById('colorPaletteEditor');
const beadSizeInput = document.getElementById('beadSizeInput');
const beadsHorizontalInput = document.getElementById('beadsHorizontalInput');
const beadsVerticalInput = document.getElementById('beadsVerticalInput');
const colorCountSlider = document.getElementById('colorCountSlider');
const colorDiversitySlider = document.getElementById('colorDiversitySlider');
const beadSizeSlider = document.getElementById('beadSizeSlider');
const beadsHorizontalSlider = document.getElementById('beadsHorizontalSlider');
const beadsVerticalSlider = document.getElementById('beadsVerticalSlider');
const displayScaleSlider = document.getElementById('displayScaleSlider');
const displayScaleValue = document.getElementById('displayScaleValue');
const displayScaleInput = document.getElementById('displayScaleInput');
const pickerDiversityEnabled = document.getElementById('pickerDiversityEnabled');
const brightnessInput = document.getElementById('brightnessInput');
const brightnessSlider = document.getElementById('brightnessSlider');
const contrastInput = document.getElementById('contrastInput');
const contrastSlider = document.getElementById('contrastSlider');
const resetBrightnessBtn = document.getElementById('resetBrightnessBtn');
const resetContrastBtn = document.getElementById('resetContrastBtn');
const beadModeRadios = document.querySelectorAll('input[name="beadMode"]');
const fillModeRadios = document.querySelectorAll('input[name="fillMode"]');
const beadSizeCard = document.getElementById('beadSizeCard');
const beadsHorizontalCard = document.getElementById('beadsHorizontalCard');
const beadsVerticalCard = document.getElementById('beadsVerticalCard');

// Buttons
const generateBtn = document.getElementById('generateBtn');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const toggleGridBtn = document.getElementById('toggleGridBtn');
const toggleLabelsBtn = document.getElementById('toggleLabelsBtn');
const toggleConnectionsBtn = document.getElementById('toggleConnectionsBtn');
const exportBtn = document.getElementById('exportBtn');
const addColorBtn = document.getElementById('addColorBtn');
const applyPaletteBtn = document.getElementById('applyPaletteBtn');
const cancelGenerationBtn = document.getElementById('cancelGenerationBtn');

// Initialize
init();

function init() {
    setupEventListeners();
    syncInputs();
}

function setupEventListeners() {
    // File upload
    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    // Canvas click for starting point
    imageCanvas.addEventListener('click', handleCanvasClick);

    // Input synchronization
    colorCountInput.addEventListener('input', (e) => syncValue('colorCount', e.target.value));
    colorCountSlider.addEventListener('input', (e) => syncValue('colorCount', e.target.value));
    colorDiversityInput.addEventListener('input', (e) => syncValue('colorDiversity', e.target.value));
    colorDiversitySlider.addEventListener('input', (e) => syncValue('colorDiversity', e.target.value));
    
    // Bead mode selector
    beadModeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.beadMode = e.target.value;
            updateBeadMode();
        });
    });
    
    // Fill mode selector
    fillModeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.fillMode = e.target.value;
            updateFillModeUI();
        });
    });
    
    // Bead size inputs - update scale hint or calculate count
    beadSizeInput.addEventListener('input', (e) => {
        state.beadSize = parseInt(e.target.value);
        beadSizeSlider.value = e.target.value;
        if (state.beadMode === 'size') {
            calculateBeadCountFromSize();
        }
        updateScaleHint();
    });
    beadSizeSlider.addEventListener('input', (e) => {
        state.beadSize = parseInt(e.target.value);
        beadSizeInput.value = e.target.value;
        if (state.beadMode === 'size') {
            calculateBeadCountFromSize();
        }
        updateScaleHint();
    });
    
    // Bead count inputs - update scale hint or calculate size
    beadsHorizontalInput.addEventListener('input', (e) => {
        state.beadsHorizontal = parseInt(e.target.value);
        beadsHorizontalSlider.value = e.target.value;
        if (state.beadMode === 'count') {
            calculateBeadSizeFromCount();
        }
        updateScaleHint();
    });
    beadsHorizontalSlider.addEventListener('input', (e) => {
        state.beadsHorizontal = parseInt(e.target.value);
        beadsHorizontalInput.value = e.target.value;
        if (state.beadMode === 'count') {
            calculateBeadSizeFromCount();
        }
        updateScaleHint();
    });
    beadsVerticalInput.addEventListener('input', (e) => {
        state.beadsVertical = parseInt(e.target.value);
        beadsVerticalSlider.value = e.target.value;
        if (state.beadMode === 'count') {
            calculateBeadSizeFromCount();
        }
        updateScaleHint();
    });
    beadsVerticalSlider.addEventListener('input', (e) => {
        state.beadsVertical = parseInt(e.target.value);
        beadsVerticalInput.value = e.target.value;
        if (state.beadMode === 'count') {
            calculateBeadSizeFromCount();
        }
        updateScaleHint();
    });
    
    // Brightness and contrast controls - only update state, don't apply filters yet
    brightnessInput.addEventListener('input', (e) => {
        state.brightness = parseInt(e.target.value);
        brightnessSlider.value = e.target.value;
    });
    brightnessSlider.addEventListener('input', (e) => {
        state.brightness = parseInt(e.target.value);
        brightnessInput.value = e.target.value;
    });
    contrastInput.addEventListener('input', (e) => {
        state.contrast = parseInt(e.target.value);
        contrastSlider.value = e.target.value;
    });
    contrastSlider.addEventListener('input', (e) => {
        state.contrast = parseInt(e.target.value);
        contrastInput.value = e.target.value;
    });
    
    // Reset buttons - only reset values, don't apply filters
    resetBrightnessBtn.addEventListener('click', () => {
        state.brightness = 0;
        brightnessInput.value = 0;
        brightnessSlider.value = 0;
    });
    resetContrastBtn.addEventListener('click', () => {
        state.contrast = 0;
        contrastInput.value = 0;
        contrastSlider.value = 0;
    });
    
    // Color diversity enabled checkbox
    if (colorDiversityEnabled) {
        colorDiversityEnabled.addEventListener('change', (e) => {
            state.colorDiversityEnabled = e.target.checked;
            updateDiversityInputsState();
        });
    }
    
    // Limit colors enabled checkbox
    if (limitColorsEnabled) {
        limitColorsEnabled.addEventListener('change', (e) => {
            state.limitColors = e.target.checked;
            updateLimitColorsState();
        });
    }
    
    if (pickerDiversityEnabled) {
        pickerDiversityEnabled.addEventListener('change', (e) => {
            updatePickerDiversityInputsState();
        });
    }

    // Display scale control
    if (displayScaleSlider) {
        displayScaleSlider.addEventListener('input', (e) => {
            state.displayScaleMultiplier = parseFloat(e.target.value);
            if (displayScaleInput) {
                displayScaleInput.value = state.displayScaleMultiplier;
            }
            if (displayScaleValue) {
                displayScaleValue.textContent = `${state.displayScaleMultiplier.toFixed(1)}x`;
            }
            if (state.pattern) {
                drawPattern(state.pattern);
            }
        });
    }
    
    if (displayScaleInput) {
        displayScaleInput.addEventListener('input', (e) => {
            let value = parseFloat(e.target.value);
            // Ограничиваем значение в допустимых пределах
            value = Math.max(0.1, Math.min(25, value));
            state.displayScaleMultiplier = value;
            if (displayScaleSlider) {
                displayScaleSlider.value = value;
            }
            if (displayScaleValue) {
                displayScaleValue.textContent = `${value.toFixed(1)}x`;
            }
            if (state.pattern) {
                drawPattern(state.pattern);
            }
        });
        
        // Обновляем значение при потере фокуса, если оно было некорректным
        displayScaleInput.addEventListener('blur', (e) => {
            let value = parseFloat(e.target.value);
            if (isNaN(value) || value < 0.1) {
                value = 0.1;
            } else if (value > 25) {
                value = 25;
            }
            state.displayScaleMultiplier = value;
            displayScaleInput.value = value;
            if (displayScaleSlider) {
                displayScaleSlider.value = value;
            }
            if (displayScaleValue) {
                displayScaleValue.textContent = `${value.toFixed(1)}x`;
            }
        });
    }

    // Buttons
    generateBtn.addEventListener('click', generatePattern);
    zoomInBtn.addEventListener('click', () => adjustZoom(1.2));
    zoomOutBtn.addEventListener('click', () => adjustZoom(0.8));
    toggleGridBtn.addEventListener('click', toggleGrid);
    toggleLabelsBtn.addEventListener('click', toggleLabels);
    if (toggleConnectionsBtn) {
        toggleConnectionsBtn.addEventListener('click', toggleConnections);
    }
    exportBtn.addEventListener('click', exportPattern);
    addColorBtn.addEventListener('click', addNewColor);
    applyPaletteBtn.addEventListener('click', applyPaletteChanges);
    if (cancelGenerationBtn) {
        cancelGenerationBtn.addEventListener('click', cancelGeneration);
    }
}

function syncInputs() {
    colorCountInput.value = colorCountSlider.value = state.colorCount;
    colorDiversityInput.value = colorDiversitySlider.value = state.colorDiversity;
    beadSizeInput.value = beadSizeSlider.value = state.beadSize;
    
    // Sync brightness and contrast
    if (brightnessInput) brightnessInput.value = state.brightness;
    if (brightnessSlider) brightnessSlider.value = state.brightness;
    if (contrastInput) contrastInput.value = state.contrast;
    if (contrastSlider) contrastSlider.value = state.contrast;
    
    // Sync bead count inputs
    if (beadsHorizontalInput) {
        beadsHorizontalInput.value = state.beadsHorizontal;
    }
    if (beadsHorizontalSlider) {
        beadsHorizontalSlider.value = state.beadsHorizontal;
    }
    if (beadsVerticalInput) {
        beadsVerticalInput.value = state.beadsVertical;
    }
    if (beadsVerticalSlider) {
        beadsVerticalSlider.value = state.beadsVertical;
    }
    
    // Sync color diversity enabled checkbox
    if (colorDiversityEnabled) {
        colorDiversityEnabled.checked = state.colorDiversityEnabled;
    }
    
    // Sync display scale slider and input
    if (displayScaleSlider) {
        displayScaleSlider.value = state.displayScaleMultiplier;
    }
    if (displayScaleInput) {
        displayScaleInput.value = state.displayScaleMultiplier;
    }
    if (displayScaleValue) {
        displayScaleValue.textContent = `${state.displayScaleMultiplier.toFixed(1)}x`;
    }
    
    // Update inputs state
    updateDiversityInputsState();
    updateLimitColorsState();
    
    // Sync limit colors checkbox
    if (limitColorsEnabled) {
        limitColorsEnabled.checked = state.limitColors;
    }
    
    // Sync bead mode
    if (beadModeRadios && beadModeRadios.length > 0) {
        const selectedRadio = Array.from(beadModeRadios).find(r => r.value === state.beadMode);
        if (selectedRadio) {
            selectedRadio.checked = true;
        }
        updateBeadMode();
    }
    
    // Sync fill mode
    if (fillModeRadios && fillModeRadios.length > 0) {
        const selectedFillRadio = Array.from(fillModeRadios).find(r => r.value === state.fillMode);
        if (selectedFillRadio) {
            selectedFillRadio.checked = true;
        }
        updateFillModeUI();
    }
}

function updateBeadMode() {
    // Показываем/скрываем поля в зависимости от режима
    if (state.beadMode === 'count') {
        // Только количество бусинок
        if (beadSizeCard) beadSizeCard.style.display = 'none';
        if (beadsHorizontalCard) beadsHorizontalCard.style.display = 'block';
        if (beadsVerticalCard) beadsVerticalCard.style.display = 'block';
        // Рассчитываем размер бусинки из количества
        calculateBeadSizeFromCount();
    } else if (state.beadMode === 'size') {
        // Только размер бусинки
        if (beadSizeCard) beadSizeCard.style.display = 'block';
        if (beadsHorizontalCard) beadsHorizontalCard.style.display = 'none';
        if (beadsVerticalCard) beadsVerticalCard.style.display = 'none';
        // Рассчитываем количество бусинок из размера
        calculateBeadCountFromSize();
    } else if (state.beadMode === 'both') {
        // Все опции вместе
        if (beadSizeCard) beadSizeCard.style.display = 'block';
        if (beadsHorizontalCard) beadsHorizontalCard.style.display = 'block';
        if (beadsVerticalCard) beadsVerticalCard.style.display = 'block';
    }
    updateScaleHint();
}

function calculateBeadSizeFromCount() {
    if (!state.imageData) return;
    
    const imgWidth = imageCanvas.width;
    const imgHeight = imageCanvas.height;
    
    // Рассчитываем размер бусинки на основе количества бусинок и размеров изображения
    // Берем минимальное значение из горизонтального и вертикального расчета,
    // чтобы бусинки поместились в оба направления
    const beadSizeHorizontal = imgWidth / state.beadsHorizontal;
    const beadSizeVertical = imgHeight / state.beadsVertical;
    
    // Используем минимальное значение, чтобы все бусинки поместились
    const calculatedBeadSize = Math.min(beadSizeHorizontal, beadSizeVertical);
    
    // Округляем до целого числа (минимальный размер 1 пиксель)
    state.beadSize = Math.max(1, Math.round(calculatedBeadSize));
    
    // Обновляем отображение
    if (beadSizeInput) {
        beadSizeInput.value = state.beadSize;
    }
    if (beadSizeSlider) {
        beadSizeSlider.value = Math.min(50, state.beadSize); // Для слайдера ограничиваем до 50
    }
}

function calculateBeadCountFromSize() {
    if (!state.imageData) return;
    
    const imgWidth = imageCanvas.width;
    const imgHeight = imageCanvas.height;
    
    // Рассчитываем количество бусинок на основе размера бусинки и размеров изображения
    if (state.beadSize > 0) {
        state.beadsHorizontal = Math.max(1, Math.round(imgWidth / state.beadSize));
        state.beadsVertical = Math.max(1, Math.round(imgHeight / state.beadSize));
    }
    
    // Обновляем отображение
    if (beadsHorizontalInput) {
        beadsHorizontalInput.value = state.beadsHorizontal;
    }
    if (beadsHorizontalSlider) {
        beadsHorizontalSlider.value = state.beadsHorizontal;
    }
    if (beadsVerticalInput) {
        beadsVerticalInput.value = state.beadsVertical;
    }
    if (beadsVerticalSlider) {
        beadsVerticalSlider.value = state.beadsVertical;
    }
}


function updateScaleHint() {
    if (!state.imageData) return;
    
    const imgWidth = imageCanvas.width;
    const imgHeight = imageCanvas.height;
    
    // Рассчитываем базовое масштабирование от количества бусинок
    // Базовое масштабирование = размер_изображения / количество_бусинок
    const baseScaleHorizontal = imgWidth / state.beadsHorizontal;
    const baseScaleVertical = imgHeight / state.beadsVertical;
    
    // Применяем дополнительное масштабирование через размер бусинки
    // Итоговое масштабирование = базовое_масштабирование / размер_бусинки
    const finalScaleHorizontal = baseScaleHorizontal / state.beadSize;
    const finalScaleVertical = baseScaleVertical / state.beadSize;
    
    // Обновляем подсказки
    const beadSizeHint = document.getElementById('beadSizeHint');
    if (beadSizeHint) {
        const avgScale = ((finalScaleHorizontal + finalScaleVertical) / 2).toFixed(2);
        beadSizeHint.textContent = `Дополнительное масштабирование. Итоговое масштабирование: ${avgScale}x`;
    }
    
    const beadsHorizontalHint = document.getElementById('beadsHorizontalHint');
    if (beadsHorizontalHint) {
        beadsHorizontalHint.textContent = `Количество бусинок по ширине изображения. Базовое масштабирование: ${baseScaleHorizontal.toFixed(2)}x, итоговое: ${finalScaleHorizontal.toFixed(2)}x`;
    }
    
    const beadsVerticalHint = document.getElementById('beadsVerticalHint');
    if (beadsVerticalHint) {
        beadsVerticalHint.textContent = `Количество бусинок по высоте изображения. Базовое масштабирование: ${baseScaleVertical.toFixed(2)}x, итоговое: ${finalScaleVertical.toFixed(2)}x`;
    }
}

function updateBeadCountLimits() {
    if (!state.imageData) return;
    
    const imgWidth = imageCanvas.width;
    const imgHeight = imageCanvas.height;
    
    // Максимальное количество бусинок = размер изображения × 8
    const maxHorizontal = imgWidth * 8;
    const maxVertical = imgHeight * 8;
    
    // Обновляем максимальные значения для полей ввода
    if (beadsHorizontalInput) {
        beadsHorizontalInput.max = maxHorizontal;
    }
    if (beadsHorizontalSlider) {
        beadsHorizontalSlider.max = maxHorizontal;
    }
    if (beadsVerticalInput) {
        beadsVerticalInput.max = maxVertical;
    }
    if (beadsVerticalSlider) {
        beadsVerticalSlider.max = maxVertical;
    }
    
    // Ограничиваем текущие значения, если они превышают новые максимумы
    if (state.beadsHorizontal > maxHorizontal) {
        state.beadsHorizontal = maxHorizontal;
    }
    if (state.beadsVertical > maxVertical) {
        state.beadsVertical = maxVertical;
    }
    
    syncInputs();
}

function updateDiversityInputsState() {
    const enabled = state.colorDiversityEnabled;
    if (colorDiversityInput) {
        colorDiversityInput.disabled = !enabled;
    }
    if (colorDiversitySlider) {
        colorDiversitySlider.disabled = !enabled;
    }
}

function updatePickerDiversityInputsState() {
    const enabled = pickerDiversityEnabled ? pickerDiversityEnabled.checked : true;
    const pickerDiversityInput = document.getElementById('pickerDiversityInput');
    if (pickerDiversityInput) {
        pickerDiversityInput.disabled = !enabled;
    }
}

function updateFillModeUI() {
    // Для обычного режима скрываем подсказку о выборе точки центра
    // Для кругового режима показываем
    const canvasHint = document.getElementById('canvasHint');
    if (canvasHint) {
        if (state.fillMode === 'polar') {
            // Для обычного режима точка не требуется
            canvasHint.style.display = 'none';
            // Автоматически устанавливаем центр изображения если он не установлен
            if (imageCanvas && imageCanvas.width && imageCanvas.height && !state.startPoint) {
                state.startPoint = {
                    x: imageCanvas.width / 2,
                    y: imageCanvas.height / 2
                };
            }
        } else {
            // Для кругового режима показываем подсказку
            canvasHint.style.display = 'block';
        }
    }
}

function updateLimitColorsState() {
    const enabled = state.limitColors;
    
    // Показываем/скрываем поля количества цветов
    if (colorCountInput) {
        colorCountInput.disabled = !enabled;
    }
    if (colorCountSlider) {
        colorCountSlider.disabled = !enabled;
    }
    
    // Когда ограничение выключено, выключаем разнообразие цветов
    if (!enabled) {
        state.colorDiversityEnabled = false;
        if (colorDiversityEnabled) {
            colorDiversityEnabled.checked = false;
        }
        updateDiversityInputsState();
    }
    
    // Отключаем поля разнообразия цветов когда ограничение выключено
    if (colorDiversityInput) {
        colorDiversityInput.disabled = !enabled;
    }
    if (colorDiversitySlider) {
        colorDiversitySlider.disabled = !enabled;
    }
    if (colorDiversityEnabled) {
        colorDiversityEnabled.disabled = !enabled;
    }
    
    // Редактор палитры всегда показывается
    if (colorPaletteEditor) {
        colorPaletteEditor.style.display = 'block';
    }
}

function syncValue(property, value) {
    state[property] = parseInt(value);
    if (property === 'colorCount') {
        colorCountInput.value = colorCountSlider.value = value;
    } else if (property === 'colorDiversity') {
        colorDiversityInput.value = colorDiversitySlider.value = value;
    } else if (property === 'beadSize') {
        beadSizeInput.value = beadSizeSlider.value = value;
    }
}

// File handling
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        loadImage(file);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        loadImage(file);
    }
}

function loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            state.originalImage = img;
            displayImage(img);
            selectPointSection.classList.remove('hidden');
            settingsSection.classList.remove('hidden');
            
            // Показать сообщение о загрузке
            const uploadMessage = document.getElementById('uploadMessage');
            if (uploadMessage) {
                uploadMessage.classList.remove('hidden');
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function displayImage(img) {
    const ctx = imageCanvas.getContext('2d');
    const maxWidth = 800;
    const maxHeight = 600;

    let width = img.width;
    let height = img.height;

    if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
    }

    if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
    }

    imageCanvas.width = width;
    imageCanvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    // Сохраняем оригинальные данные изображения
    state.originalImageData = ctx.getImageData(0, 0, width, height);
    
    // Используем оригинальные данные для imageData (без фильтров)
    state.imageData = state.originalImageData;
    
    // Сбрасываем яркость и контрастность при загрузке нового изображения
    state.brightness = 0;
    state.contrast = 0;
    
    // Не применяем фильтры сразу - только при создании схемы
    
    // Обновляем отображение разрешения изображения
    const resolutionText = document.getElementById('resolutionText');
    if (resolutionText) {
        resolutionText.textContent = `${width} × ${height} пикселей`;
    }
    const resolutionTextSettings = document.getElementById('resolutionTextSettings');
    if (resolutionTextSettings) {
        resolutionTextSettings.textContent = `${width} × ${height} пикселей`;
    }
    
    // Обновляем лимиты для количества бусинок на основе размеров изображения
    updateBeadCountLimits();
    
    // Изначально количество бусинок равно размеру изображения
    state.beadsHorizontal = width;
    state.beadsVertical = height;
    
    // Размер бусинки остается как есть (дополнительное масштабирование)
    // Не пересчитываем автоматически
    
    // Синхронизируем поля
    syncInputs();
    
    // Обновляем режим работы с бусинками
    updateBeadMode();
    
    // Обновляем подсказки с масштабированием
    updateScaleHint();
}

function applyImageFilters() {
    if (!state.originalImageData || !imageCanvas) return;
    
    const ctx = imageCanvas.getContext('2d');
    const width = imageCanvas.width;
    const height = imageCanvas.height;
    
    // Создаем копию оригинальных данных
    const imageData = new ImageData(
        new Uint8ClampedArray(state.originalImageData.data),
        width,
        height
    );
    const data = imageData.data;
    
    // Применяем яркость и контрастность
    const brightness = state.brightness; // -100 до 100
    const contrast = state.contrast; // -100 до 100
    
    // Конвертируем контрастность в множитель
    // contrast: -100 до 100, конвертируем в -1.0 до 1.0
    const contrastValue = Math.max(-99, Math.min(99, contrast)) / 100;
    const contrastFactor = (1.0 + contrastValue) / (1.0 - contrastValue);
    
    for (let i = 0; i < data.length; i += 4) {
        // Начинаем с оригинальных значений
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        
        // Применяем контрастность (сначала, чтобы не влиять на яркость)
        if (contrast !== 0) {
            r = contrastFactor * (r - 128) + 128;
            g = contrastFactor * (g - 128) + 128;
            b = contrastFactor * (b - 128) + 128;
        }
        
        // Применяем яркость
        r = r + brightness;
        g = g + brightness;
        b = b + brightness;
        
        // Ограничиваем значения в диапазоне 0-255
        data[i] = Math.max(0, Math.min(255, r));
        data[i + 1] = Math.max(0, Math.min(255, g));
        data[i + 2] = Math.max(0, Math.min(255, b));
        // alpha канал не трогаем
    }
    
    // Рисуем обработанное изображение на canvas
    ctx.putImageData(imageData, 0, 0);
    
    // Обновляем imageData для использования в схеме
    state.imageData = imageData;
    
    // Не вызываем generatePattern() здесь, чтобы избежать бесконечного цикла
    // generatePattern() сам вызывает applyImageFilters() когда нужно
}

function handleCanvasClick(e) {
    const rect = imageCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (imageCanvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (imageCanvas.height / rect.height));

    state.startPoint = { x, y };

    // Draw marker on canvas
    const ctx = imageCanvas.getContext('2d');
    ctx.putImageData(state.imageData, 0, 0);

    // Draw crosshair
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x - 15, y);
    ctx.lineTo(x + 15, y);
    ctx.moveTo(x, y - 15);
    ctx.lineTo(x, y + 15);
    ctx.stroke();
}

// Cancel generation
function cancelGeneration() {
    state.generationCancelled = true;
    state.isGenerating = false;
    loadingOverlay.classList.add('hidden');
}

// Pattern generation
async function generatePattern() {
    if (!state.originalImage) {
        alert('Пожалуйста, загрузите изображение');
        return;
    }
    
    // Для обычного режима не требуется выбор точки центра
    // Используем центр изображения по умолчанию
    if (state.fillMode === 'polar') {
        if (!state.startPoint) {
            state.startPoint = {
                x: imageCanvas.width / 2,
                y: imageCanvas.height / 2
            };
        }
    } else {
        // Для кругового режима точка центра обязательна
        if (!state.startPoint) {
            alert('Пожалуйста, выберите стартовую точку (центр разбиения)');
            return;
        }
    }

    // Сбрасываем флаги отображения при создании новой схемы
    state.showGrid = false;
    state.showLabels = false;
    state.showConnections = false;
    
    // Обновляем UI кнопок
    if (toggleGridBtn) toggleGridBtn.classList.remove('active');
    if (toggleLabelsBtn) toggleLabelsBtn.classList.remove('active');
    if (toggleConnectionsBtn) toggleConnectionsBtn.classList.remove('active');

    // Сбрасываем флаги генерации
    state.isGenerating = true;
    state.generationCancelled = false;

    loadingOverlay.classList.remove('hidden');

    // Use setTimeout to allow UI to update
    setTimeout(() => {
        try {
            // Проверяем отмену
            if (state.generationCancelled) {
                return;
            }

            // Применяем фильтры яркости и контрастности перед созданием схемы
            applyImageFilters();
            
            // Проверяем отмену после применения фильтров
            if (state.generationCancelled) {
                return;
            }
            
            // Create pattern based on selected fill mode
            let pattern;
            if (state.fillMode === 'radial') {
                pattern = createRadialPattern();
            } else {
                pattern = createPolarPattern();
            }
            
            // Проверяем отмену после создания паттерна
            if (state.generationCancelled || !pattern) {
                return;
            }
            
            state.pattern = pattern;

            // Draw pattern
            drawPattern(pattern);

            // Проверяем отмену перед показом секции
            if (state.generationCancelled) {
                return;
            }

            // Show pattern section
            patternSection.classList.remove('hidden');
            patternSection.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            if (!state.generationCancelled) {
                console.error('Error generating pattern:', error);
                alert('Ошибка при создании схемы');
            }
        } finally {
            state.isGenerating = false;
            loadingOverlay.classList.add('hidden');
        }
    }, 100);
}

function createRadialPattern() {
    const { colorCount, startPoint, beadSize } = state;
    const { data } = state.imageData;
    const imgWidth = imageCanvas.width;
    const imgHeight = imageCanvas.height;

    // Calculate maximum radius from start point to image edges
    const maxRadius = Math.max(
        Math.hypot(startPoint.x, startPoint.y),
        Math.hypot(imgWidth - startPoint.x, startPoint.y),
        Math.hypot(startPoint.x, imgHeight - startPoint.y),
        Math.hypot(imgWidth - startPoint.x, imgHeight - startPoint.y)
    );

    // Bead spacing is the bead size in pixels
    const beadSpacing = beadSize;

    // Generate bead positions in spiral/circular pattern
    const beadPositions = [];
    const colors = [];

    // Start from center
    beadPositions.push({
        x: startPoint.x,
        y: startPoint.y,
        radius: 0,
        angle: 0,
        ringIndex: 0,
        positionInRing: 0
    });

    // Generate positions in expanding circles
    let currentRadius = beadSpacing;
    let ringIndex = 1;

    while (currentRadius <= maxRadius) {
        // Проверяем отмену в цикле
        if (state.generationCancelled) {
            return null;
        }
        
        const circumference = 2 * Math.PI * currentRadius;
        // Calculate number of beads that fit in this circle with proper spacing
        const beadsInCircle = Math.max(6, Math.floor(circumference / beadSpacing));

        for (let i = 0; i < beadsInCircle; i++) {
            const angle = (i / beadsInCircle) * 2 * Math.PI;
            const x = startPoint.x + currentRadius * Math.cos(angle);
            const y = startPoint.y + currentRadius * Math.sin(angle);

            if (x >= 0 && x < imgWidth && y >= 0 && y < imgHeight) {
                beadPositions.push({
                    x,
                    y,
                    radius: currentRadius,
                    angle,
                    ringIndex,
                    positionInRing: i
                });
            }
        }

        currentRadius += beadSpacing;
        ringIndex++;
    }

    // Sample colors from image at each bead position
    for (const pos of beadPositions) {
        const imgX = Math.floor(pos.x);
        const imgY = Math.floor(pos.y);
        const idx = (imgY * imgWidth + imgX) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        colors.push({
            r, g, b,
            x: pos.x,
            y: pos.y,
            radius: pos.radius,
            angle: pos.angle,
            ringIndex: pos.ringIndex,
            positionInRing: pos.positionInRing
        });
    }

    // Quantize colors using k-means
    const palette = quantizeColors(colors, colorCount);
    state.colorPalette = palette;

    // Map each bead to nearest palette color
    const pattern = [];
    for (let i = 0; i < colors.length; i++) {
        const color = colors[i];
        const paletteIndex = findNearestColor(color, palette);
        pattern.push({
            x: color.x,
            y: color.y,
            radius: color.radius,
            angle: color.angle,
            ringIndex: color.ringIndex,
            positionInRing: color.positionInRing,
            beadNumber: i + 1,
            colorIndex: paletteIndex
        });
    }

    return pattern;
}

function createPolarPattern() {
    const { colorCount, beadsHorizontal, beadsVertical } = state;
    const { data } = state.imageData;
    const imgWidth = imageCanvas.width;
    const imgHeight = imageCanvas.height;

    // Create a regular rectangular grid - simple pixel-to-bead conversion
    const gridStepX = imgWidth / beadsHorizontal;
    const gridStepY = imgHeight / beadsVertical;

    const beadPositions = [];
    const colors = [];

    // Generate regular grid positions - simple rectangular grid
    for (let row = 0; row < beadsVertical; row++) {
        // Проверяем отмену в цикле
        if (state.generationCancelled) {
            return null;
        }
        
        for (let col = 0; col < beadsHorizontal; col++) {
            // Calculate center position of each grid cell
            const x = col * gridStepX + gridStepX / 2;
            const y = row * gridStepY + gridStepY / 2;

            // Sample color from image at this position
            const imgX = Math.floor(Math.max(0, Math.min(imgWidth - 1, x)));
            const imgY = Math.floor(Math.max(0, Math.min(imgHeight - 1, y)));
            const idx = (imgY * imgWidth + imgX) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            // For regular grid, we use row/col as ring/position for compatibility
            beadPositions.push({
                x,
                y,
                radius: 0, // Not used in regular grid
                angle: 0, // Not used in regular grid
                ringIndex: row,
                positionInRing: col,
                gridRow: row,
                gridCol: col
            });

            colors.push({
                r, g, b,
                x,
                y,
                radius: 0,
                angle: 0,
                ringIndex: row,
                positionInRing: col
            });
        }
    }

    // Quantize colors using k-means
    const palette = quantizeColors(colors, colorCount);
    state.colorPalette = palette;

    // Map each bead to nearest palette color
    const pattern = [];
    for (let i = 0; i < colors.length; i++) {
        const color = colors[i];
        const paletteIndex = findNearestColor(color, palette);
        pattern.push({
            x: color.x,
            y: color.y,
            radius: color.radius,
            angle: color.angle,
            ringIndex: color.ringIndex,
            positionInRing: color.positionInRing,
            beadNumber: i + 1,
            colorIndex: paletteIndex
        });
    }

    return pattern;
}

function generateSpiralGridPositions(gridWidth, gridHeight, centerX, centerY) {
    const positions = [];
    const visited = new Set();

    // Start from center
    positions.push({ x: centerX, y: centerY });
    visited.add(`${centerX},${centerY}`);

    // Calculate maximum radius needed to cover entire grid
    const maxRadius = Math.max(
        Math.hypot(centerX, centerY),
        Math.hypot(gridWidth - 1 - centerX, centerY),
        Math.hypot(centerX, gridHeight - 1 - centerY),
        Math.hypot(gridWidth - 1 - centerX, gridHeight - 1 - centerY)
    );

    // Spiral outward from center
    for (let radius = 1; radius <= Math.ceil(maxRadius); radius++) {
        // Calculate number of points for this radius (more points for larger circles)
        const circumference = 2 * Math.PI * radius;
        const numPoints = Math.max(8, Math.ceil(circumference * 2));

        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * 2 * Math.PI;
            const x = Math.round(centerX + radius * Math.cos(angle));
            const y = Math.round(centerY + radius * Math.sin(angle));

            // Check if within grid bounds
            if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
                const key = `${x},${y}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    positions.push({ x, y });
                }
            }
        }
    }

    return positions;
}

function quantizeColors(colors, k) {
    const { colorDiversity, colorDiversityEnabled, limitColors } = state;

    // Если ограничение цветов отключено, возвращаем все уникальные цвета
    if (!limitColors) {
        // Собираем все уникальные цвета
        const uniqueColors = new Map();
        for (const color of colors) {
            const key = `${color.r},${color.g},${color.b}`;
            if (!uniqueColors.has(key)) {
                uniqueColors.set(key, { r: color.r, g: color.g, b: color.b, count: 0 });
            }
            uniqueColors.get(key).count++;
        }
        // Возвращаем все уникальные цвета, отсортированные по частоте
        return Array.from(uniqueColors.values()).sort((a, b) => b.count - a.count);
    }

    // If diversity is enabled and requested, we generate more candidates first
    // then select the best k from them
    const candidateK = (colorDiversityEnabled && colorDiversity > 0) ? Math.min(k * 3, 50) : k;

    // Simple k-means clustering
    let centroids = [];

    // Initialize centroids randomly
    const shuffled = [...colors].sort(() => Math.random() - 0.5);
    for (let i = 0; i < candidateK; i++) {
        const color = shuffled[i % shuffled.length];
        centroids.push({ r: color.r, g: color.g, b: color.b, count: 0 });
    }

    // Iterate k-means
    for (let iter = 0; iter < 10; iter++) {
        // Reset centroids
        const newCentroids = centroids.map(() => ({ r: 0, g: 0, b: 0, count: 0 }));

        // Assign colors to nearest centroid
        for (const color of colors) {
            const nearest = findNearestColor(color, centroids);
            newCentroids[nearest].r += color.r;
            newCentroids[nearest].g += color.g;
            newCentroids[nearest].b += color.b;
            newCentroids[nearest].count++;
        }

        // Update centroids
        for (let i = 0; i < candidateK; i++) {
            if (newCentroids[i].count > 0) {
                centroids[i].r = Math.round(newCentroids[i].r / newCentroids[i].count);
                centroids[i].g = Math.round(newCentroids[i].g / newCentroids[i].count);
                centroids[i].b = Math.round(newCentroids[i].b / newCentroids[i].count);
                centroids[i].count = newCentroids[i].count;
            }
        }
    }

    // Filter out empty centroids
    centroids = centroids.filter(c => c.count > 0);

    // If diversity is disabled, or we have no diversity requirement, or not enough candidates, return top k
    if (!colorDiversityEnabled || colorDiversity === 0 || centroids.length <= k) {
        return centroids.sort((a, b) => b.count - a.count).slice(0, k);
    }

    // Apply soft diversity selection
    // Sort by count (importance)
    centroids.sort((a, b) => b.count - a.count);

    const selected = [];
    const minDistance = (colorDiversity / 100) * 441.67;

    // Pass 1: Select diverse colors
    for (const c of centroids) {
        if (selected.length >= k) break;

        let isDiverse = true;
        for (const existing of selected) {
            const dist = Math.sqrt(colorDistance(c, existing));
            if (dist < minDistance) {
                isDiverse = false;
                break;
            }
        }

        if (isDiverse) {
            selected.push(c);
        }
    }

    // Pass 2: Fill if needed
    if (selected.length < k) {
        for (const c of centroids) {
            if (selected.length >= k) break;
            if (!selected.includes(c)) {
                selected.push(c);
            }
        }
    }

    return selected;
}

function findNearestColor(color, palette) {
    let minDist = Infinity;
    let nearest = 0;

    for (let i = 0; i < palette.length; i++) {
        const dist = colorDistance(color, palette[i]);
        if (dist < minDist) {
            minDist = dist;
            nearest = i;
        }
    }

    return nearest;
}

function colorDistance(c1, c2) {
    const dr = c1.r - c2.r;
    const dg = c1.g - c2.g;
    const db = c1.b - c2.b;
    return dr * dr + dg * dg + db * db;
}

function drawPattern(pattern) {
    const { beadSize, colorPalette, displayScaleMultiplier, showLabels } = state;

    // Calculate display scale - apply user multiplier directly (no minimum size restriction)
    const displayScale = displayScaleMultiplier;
    const displayBeadSize = beadSize * displayScale;

    // Calculate canvas size based on bead positions
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const bead of pattern) {
        minX = Math.min(minX, bead.x);
        minY = Math.min(minY, bead.y);
        maxX = Math.max(maxX, bead.x);
        maxY = Math.max(maxY, bead.y);
    }

    const padding = displayBeadSize * 3;
    const canvasWidth = Math.ceil((maxX - minX) * displayScale) + padding * 2;
    const canvasHeight = Math.ceil((maxY - minY) * displayScale) + padding * 2;

    patternCanvas.width = canvasWidth;
    patternCanvas.height = canvasHeight;

    const ctx = patternCanvas.getContext('2d');

    // Fill background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Calculate offset to center the pattern
    const offsetX = padding - minX * displayScale;
    const offsetY = padding - minY * displayScale;

    // Center point in canvas coordinates
    const centerX = state.startPoint.x * displayScale + offsetX;
    const centerY = state.startPoint.y * displayScale + offsetY;

    // Draw beads at their circular positions FIRST
    for (const bead of pattern) {
        const color = colorPalette[bead.colorIndex];
        const px = bead.x * displayScale + offsetX;
        const py = bead.y * displayScale + offsetY;

        // Draw bead with gradient
        const gradient = ctx.createRadialGradient(
            px, py, displayBeadSize / 4,
            px, py, displayBeadSize / 2
        );
        gradient.addColorStop(0, `rgb(${Math.min(255, color.r + 40)}, ${Math.min(255, color.g + 40)}, ${Math.min(255, color.b + 40)})`);
        gradient.addColorStop(1, `rgb(${color.r}, ${color.g}, ${color.b})`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(px, py, displayBeadSize / 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw bead outline
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw bead number/label if enabled
        if (showLabels) {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
            ctx.lineWidth = Math.max(1, displayBeadSize / 10);

            // Scale font size based on display bead size
            const fontSize = Math.max(8, Math.floor(displayBeadSize * 0.35));
            ctx.font = `bold ${fontSize}px Inter`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Show ring and position: "3-5" means ring 3, position 5
            // For regular grid, ringIndex is row and positionInRing is col
            const label = state.fillMode === 'radial' 
                ? `${bead.ringIndex}-${bead.positionInRing}` 
                : `${bead.ringIndex}-${bead.positionInRing}`;
            ctx.strokeText(label, px, py);
            ctx.fillText(label, px, py);
            ctx.restore();
        }
    }

    // Draw connections between beads if enabled
    if (state.showConnections) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = Math.max(1, displayBeadSize / 15);
        
        if (state.fillMode === 'radial') {
            // Group beads by ring for radial mode
            const beadsByRing = {};
            for (const bead of pattern) {
                if (!beadsByRing[bead.ringIndex]) {
                    beadsByRing[bead.ringIndex] = [];
                }
                beadsByRing[bead.ringIndex].push(bead);
            }
            
            // Draw connections for each ring
            for (const ringIndex in beadsByRing) {
                const ringBeads = beadsByRing[ringIndex];
                
                // Sort by angle to connect in circular order
                ringBeads.sort((a, b) => a.angle - b.angle);
                
                // Maximum distance for connection (to avoid connecting far-apart beads)
                const maxConnectionDistance = displayBeadSize * 2.5;
                
                // Connect each bead to the next one by angle
                for (let i = 0; i < ringBeads.length; i++) {
                    const currentBead = ringBeads[i];
                    const nextBead = ringBeads[(i + 1) % ringBeads.length];
                    
                    const px1 = currentBead.x * displayScale + offsetX;
                    const py1 = currentBead.y * displayScale + offsetY;
                    const px2 = nextBead.x * displayScale + offsetX;
                    const py2 = nextBead.y * displayScale + offsetY;
                    
                    // Calculate distance between beads
                    const distance = Math.sqrt((px2 - px1) ** 2 + (py2 - py1) ** 2);
                    
                    // Only connect if beads are close enough (neighbors in the ring)
                    if (distance <= maxConnectionDistance) {
                        ctx.beginPath();
                        ctx.moveTo(px1, py1);
                        ctx.lineTo(px2, py2);
                        ctx.stroke();
                    }
                }
            }
        } else {
            // For regular grid, connect horizontally and vertically adjacent beads
            const maxConnectionDistance = displayBeadSize * 1.5;
            
            // Create a map for quick lookup
            const beadMap = new Map();
            for (const bead of pattern) {
                const key = `${bead.ringIndex}-${bead.positionInRing}`;
                beadMap.set(key, bead);
            }
            
            // Connect adjacent beads
            for (const bead of pattern) {
                const px1 = bead.x * displayScale + offsetX;
                const py1 = bead.y * displayScale + offsetY;
                
                // Check right neighbor
                const rightKey = `${bead.ringIndex}-${bead.positionInRing + 1}`;
                const rightBead = beadMap.get(rightKey);
                if (rightBead) {
                    const px2 = rightBead.x * displayScale + offsetX;
                    const py2 = rightBead.y * displayScale + offsetY;
                    const distance = Math.sqrt((px2 - px1) ** 2 + (py2 - py1) ** 2);
                    if (distance <= maxConnectionDistance) {
                        ctx.beginPath();
                        ctx.moveTo(px1, py1);
                        ctx.lineTo(px2, py2);
                        ctx.stroke();
                    }
                }
                
                // Check bottom neighbor
                const bottomKey = `${bead.ringIndex + 1}-${bead.positionInRing}`;
                const bottomBead = beadMap.get(bottomKey);
                if (bottomBead) {
                    const px2 = bottomBead.x * displayScale + offsetX;
                    const py2 = bottomBead.y * displayScale + offsetY;
                    const distance = Math.sqrt((px2 - px1) ** 2 + (py2 - py1) ** 2);
                    if (distance <= maxConnectionDistance) {
                        ctx.beginPath();
                        ctx.moveTo(px1, py1);
                        ctx.lineTo(px2, py2);
                        ctx.stroke();
                    }
                }
            }
        }
        
        ctx.restore();
    }

    // Draw guide lines ON TOP if grid is enabled
    if (state.showGrid) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;

        if (state.fillMode === 'radial') {
            // Draw radial lines for circular pattern
            const numLines = 24;
            for (let i = 0; i < numLines; i++) {
                const angle = (i / numLines) * 2 * Math.PI;
                const maxDist = Math.max(canvasWidth, canvasHeight);
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(
                    centerX + maxDist * Math.cos(angle),
                    centerY + maxDist * Math.sin(angle)
                );
                ctx.stroke();
            }

            // Draw concentric circles at each ring
            const rings = new Set(pattern.map(b => b.ringIndex));
            ctx.globalAlpha = 0.4;
            ctx.lineWidth = 2;
            for (const ringIndex of rings) {
                const beadsInRing = pattern.filter(b => b.ringIndex === ringIndex);
                if (beadsInRing.length > 0) {
                    const radius = beadsInRing[0].radius * displayScale;
                    if (radius > 0) {
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                }
            }
        } else {
            // Draw rectangular grid for regular pattern
            const rows = new Set(pattern.map(b => b.ringIndex));
            const cols = new Set(pattern.map(b => b.positionInRing));
            
            // Draw horizontal lines
            for (const row of rows) {
                const beadsInRow = pattern.filter(b => b.ringIndex === row);
                if (beadsInRow.length > 0) {
                    const minX = Math.min(...beadsInRow.map(b => b.x * displayScale + offsetX));
                    const maxX = Math.max(...beadsInRow.map(b => b.x * displayScale + offsetX));
                    const y = beadsInRow[0].y * displayScale + offsetY;
                    ctx.beginPath();
                    ctx.moveTo(minX, y);
                    ctx.lineTo(maxX, y);
                    ctx.stroke();
                }
            }
            
            // Draw vertical lines
            for (const col of cols) {
                const beadsInCol = pattern.filter(b => b.positionInRing === col);
                if (beadsInCol.length > 0) {
                    const minY = Math.min(...beadsInCol.map(b => b.y * displayScale + offsetY));
                    const maxY = Math.max(...beadsInCol.map(b => b.y * displayScale + offsetY));
                    const x = beadsInCol[0].x * displayScale + offsetX;
                    ctx.beginPath();
                    ctx.moveTo(x, minY);
                    ctx.lineTo(x, maxY);
                    ctx.stroke();
                }
            }
        }

        ctx.restore();
    }

    // Draw center point marker on top (only for radial mode)
    if (state.fillMode === 'radial') {
        ctx.save();
        ctx.strokeStyle = '#ffffff';
        ctx.fillStyle = '#ffffff';
        ctx.lineWidth = 3;

        // Draw crosshair at center
        ctx.beginPath();
        ctx.arc(centerX, centerY, displayBeadSize * 1.5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX - displayBeadSize * 2, centerY);
        ctx.lineTo(centerX + displayBeadSize * 2, centerY);
        ctx.moveTo(centerX, centerY - displayBeadSize * 2);
        ctx.lineTo(centerX, centerY + displayBeadSize * 2);
        ctx.stroke();

        // Draw center dot with label
        ctx.beginPath();
        ctx.arc(centerX, centerY, displayBeadSize / 2, 0, Math.PI * 2);
        ctx.fill();

        // Label center if labels are enabled
        if (showLabels) {
            ctx.fillStyle = 'white';
            ctx.font = `bold ${Math.floor(displayBeadSize / 2)}px Inter`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.strokeText('0-0', centerX, centerY);
            ctx.fillText('0-0', centerX, centerY);
        }

        ctx.restore();
    }

    // Update legend and palette editor visibility
    updateLegend();
    updateLimitColorsState();
}

function updateLegend() {
    const legendContent = document.getElementById('legendContent');
    if (!legendContent) {
        // If legendContent doesn't exist, just update palette editor
        updatePaletteEditor();
        return;
    }

    legendContent.innerHTML = '';

    const { colorPalette, pattern } = state;

    // Count beads per color
    const counts = new Array(colorPalette.length).fill(0);
    for (const bead of pattern) {
        counts[bead.colorIndex]++;
    }

    // Update total bead count
    const totalBeads = pattern.length;
    const totalBeadsCount = document.getElementById('totalBeadsCount');
    if (totalBeadsCount) {
        totalBeadsCount.textContent = totalBeads;
    }

    // Create legend items
    colorPalette.forEach((color, index) => {
        const item = document.createElement('div');
        item.className = 'legend-item';

        const colorDiv = document.createElement('div');
        colorDiv.className = 'legend-color';
        colorDiv.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;

        const info = document.createElement('div');
        info.className = 'legend-info';

        const number = document.createElement('div');
        number.className = 'legend-number';
        number.textContent = `#${index + 1}`;

        const hex = document.createElement('div');
        hex.className = 'legend-hex';
        hex.textContent = rgbToHex(color.r, color.g, color.b);

        const count = document.createElement('div');
        count.className = 'legend-count';
        count.textContent = `${counts[index]} бусинок`;

        info.appendChild(number);
        info.appendChild(hex);
        info.appendChild(count);

        item.appendChild(colorDiv);
        item.appendChild(info);

        legendContent.appendChild(item);
    });

    // Update palette editor
    updatePaletteEditor();
}

function updatePaletteEditor() {
    // Всегда показываем редактор
    if (colorPaletteEditor) {
        colorPaletteEditor.style.display = 'block';
    }
    
    const paletteEditor = document.getElementById('paletteEditor');
    if (!paletteEditor) return;

    paletteEditor.innerHTML = '';

    const { colorPalette, pattern } = state;
    if (!colorPalette || !pattern) return;

    // Update total bead count
    const totalBeads = pattern.length;
    const totalBeadsCount = document.getElementById('totalBeadsCount');
    if (totalBeadsCount) {
        totalBeadsCount.textContent = totalBeads;
    }

    // Count beads per color
    const counts = new Array(colorPalette.length).fill(0);
    for (const bead of pattern) {
        counts[bead.colorIndex]++;
    }

    colorPalette.forEach(async (color, index) => {
        const item = document.createElement('div');
        item.className = 'palette-item';

        const number = document.createElement('div');
        number.className = 'palette-item-number';
        number.textContent = `#${index + 1}`;

        const colorPicker = document.createElement('div');
        colorPicker.className = 'palette-item-color';
        colorPicker.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;

        const input = document.createElement('input');
        input.type = 'color';
        input.value = rgbToHex(color.r, color.g, color.b);
        input.addEventListener('change', (e) => {
            const hex = e.target.value;
            const rgb = hexToRgb(hex);
            state.colorPalette[index] = rgb;
            colorPicker.style.backgroundColor = hex;
            // Update the displayed info
            updatePaletteEditor();
        });
        colorPicker.appendChild(input);

        const info = document.createElement('div');
        info.className = 'palette-item-info';

        const colorName = document.createElement('div');
        colorName.className = 'palette-item-name';
        colorName.textContent = 'Цвет';

        const hex = document.createElement('div');
        hex.className = 'palette-item-hex';
        hex.textContent = rgbToHex(color.r, color.g, color.b);

        const count = document.createElement('div');
        count.className = 'palette-item-count';
        count.textContent = `${counts[index]} бусинок`;

        info.appendChild(colorName);
        info.appendChild(hex);
        info.appendChild(count);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'palette-item-delete';
        deleteBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        deleteBtn.addEventListener('click', () => deleteColor(index));

        const excludeBtn = document.createElement('button');
        excludeBtn.className = 'palette-item-exclude';
        excludeBtn.title = 'Исключить из области';
        excludeBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" stroke-width="2"/>
                <line x1="3" y1="3" x2="21" y2="21" stroke-width="2"/>
            </svg>
        `;
        excludeBtn.addEventListener('click', () => startExclusionMode(index));

        item.appendChild(number);
        item.appendChild(colorPicker);
        item.appendChild(info);
        item.appendChild(excludeBtn);
        item.appendChild(deleteBtn);

        paletteEditor.appendChild(item);
    });
}

// Color exclusion mode
let exclusionMode = {
    active: false,
    colorIndex: null,
    selection: { start: null, end: null, isSelecting: false }
};

function startExclusionMode(colorIndex) {
    exclusionMode.active = true;
    exclusionMode.colorIndex = colorIndex;
    exclusionMode.selection = { start: null, end: null, isSelecting: false };

    // Show instruction overlay
    const instruction = document.createElement('div');
    instruction.id = 'exclusionInstruction';
    instruction.className = 'exclusion-instruction';
    instruction.innerHTML = `
        <div class="exclusion-instruction-content">
            <p>Выделите область на схеме, откуда нужно удалить цвет #${colorIndex + 1}</p>
            <button class="btn btn-secondary" id="cancelExclusion">Отмена</button>
        </div>
    `;
    document.body.appendChild(instruction);

    document.getElementById('cancelExclusion').addEventListener('click', cancelExclusionMode);

    // Change canvas cursor
    patternCanvas.style.cursor = 'crosshair';
}

function cancelExclusionMode() {
    exclusionMode = {
        active: false,
        colorIndex: null,
        selection: { start: null, end: null, isSelecting: false }
    };

    const instruction = document.getElementById('exclusionInstruction');
    if (instruction) {
        instruction.remove();
    }

    patternCanvas.style.cursor = 'default';

    // Redraw pattern without selection rectangle
    if (state.pattern) {
        drawPattern(state.pattern);
    }
}

// Add event listeners to pattern canvas for exclusion
patternCanvas.addEventListener('mousedown', (e) => {
    if (!exclusionMode.active) return;

    // Use offsetX/offsetY for accurate canvas coordinates
    exclusionMode.selection.start = { x: e.offsetX, y: e.offsetY };
    exclusionMode.selection.isSelecting = true;
});

patternCanvas.addEventListener('mousemove', (e) => {
    if (!exclusionMode.active || !exclusionMode.selection.isSelecting) return;

    exclusionMode.selection.end = { x: e.offsetX, y: e.offsetY };
    drawExclusionSelection();
});

patternCanvas.addEventListener('mouseup', (e) => {
    if (!exclusionMode.active || !exclusionMode.selection.isSelecting) return;

    exclusionMode.selection.end = { x: e.offsetX, y: e.offsetY };
    exclusionMode.selection.isSelecting = false;

    applyExclusion();
});

function drawExclusionSelection() {
    if (!state.pattern) return;

    // Redraw pattern
    drawPattern(state.pattern);

    // Draw selection rectangle
    if (exclusionMode.selection.start && exclusionMode.selection.end) {
        const ctx = patternCanvas.getContext('2d');
        const x = Math.min(exclusionMode.selection.start.x, exclusionMode.selection.end.x);
        const y = Math.min(exclusionMode.selection.start.y, exclusionMode.selection.end.y);
        const w = Math.abs(exclusionMode.selection.end.x - exclusionMode.selection.start.x);
        const h = Math.abs(exclusionMode.selection.end.y - exclusionMode.selection.start.y);

        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.strokeRect(x, y, w, h);
        ctx.setLineDash([]);

        // Fill with semi-transparent overlay
        ctx.fillStyle = 'rgba(236, 72, 153, 0.1)';
        ctx.fillRect(x, y, w, h);
    }
}

function applyExclusion() {
    if (!exclusionMode.selection.start || !exclusionMode.selection.end) {
        cancelExclusionMode();
        return;
    }

    const { beadSize, displayScaleMultiplier, colorPalette } = state;
    const displayScale = displayScaleMultiplier;

    // Calculate pattern bounds
    let minX = Infinity, minY = Infinity;
    for (const bead of state.pattern) {
        minX = Math.min(minX, bead.x);
        minY = Math.min(minY, bead.y);
    }

    const displayBeadSize = beadSize * displayScale;
    const padding = displayBeadSize * 3;
    const offsetX = padding - minX * displayScale;
    const offsetY = padding - minY * displayScale;

    // Get selection bounds
    const selX = Math.min(exclusionMode.selection.start.x, exclusionMode.selection.end.x);
    const selY = Math.min(exclusionMode.selection.start.y, exclusionMode.selection.end.y);
    const selW = Math.abs(exclusionMode.selection.end.x - exclusionMode.selection.start.x);
    const selH = Math.abs(exclusionMode.selection.end.y - exclusionMode.selection.start.y);

    // Get available colors (excluding the one being replaced)
    const excludedColorIndex = exclusionMode.colorIndex;
    const availableColors = colorPalette
        .map((color, index) => ({ color, index }))
        .filter(item => item.index !== excludedColorIndex);

    if (availableColors.length === 0) {
        alert('Нет других цветов для замены');
        cancelExclusionMode();
        return;
    }

    // Replace beads of the selected color within the selection area
    let replacedCount = 0;
    state.pattern.forEach(bead => {
        if (bead.colorIndex !== excludedColorIndex) return;

        const px = bead.x * displayScale + offsetX;
        const py = bead.y * displayScale + offsetY;

        // Check if bead is within selection
        const inSelection = px >= selX && px <= selX + selW &&
            py >= selY && py <= selY + selH;

        if (inSelection) {
            // Get original color from image
            const imgX = Math.floor(bead.x);
            const imgY = Math.floor(bead.y);
            const idx = (imgY * imageCanvas.width + imgX) * 4;
            const data = state.imageData.data;
            const originalColor = {
                r: data[idx],
                g: data[idx + 1],
                b: data[idx + 2]
            };

            // Find nearest color from available colors
            let minDist = Infinity;
            let nearestIndex = availableColors[0].index;

            for (const item of availableColors) {
                const dist = colorDistance(originalColor, item.color);
                if (dist < minDist) {
                    minDist = dist;
                    nearestIndex = item.index;
                }
            }

            bead.colorIndex = nearestIndex;
            replacedCount++;
        }
    });

    if (replacedCount > 0) {
        drawPattern(state.pattern);
        alert(`Заменено ${replacedCount} бусинок`);
    } else {
        alert('В выделенной области нет бусинок этого цвета');
    }

    cancelExclusionMode();
}

function addNewColor() {
    openColorPickerModal();
}

// Color Picker Modal
const colorPickerModal = document.getElementById('colorPickerModal');
const pickerCanvas = document.getElementById('pickerCanvas');
const closeColorPickerBtn = document.getElementById('closeColorPicker');
const cancelColorPickerBtn = document.getElementById('cancelColorPicker');
const addSelectedColorsBtn = document.getElementById('addSelectedColors');
const eyedropperBtn = document.getElementById('eyedropperBtn');
const areaSelectBtn = document.getElementById('areaSelectBtn');
const clearSelectionBtn = document.getElementById('clearSelectionBtn');
const selectedColorsList = document.getElementById('selectedColorsList');
const selectedColorCount = document.getElementById('selectedColorCount');

let pickerMode = null; // 'eyedropper' or 'area'
let selectedColors = new Set();
let areaSelection = { start: null, end: null, isSelecting: false };

function openColorPickerModal() {
    if (!state.originalImage) {
        alert('Сначала загрузите изображение');
        return;
    }

    colorPickerModal.classList.remove('hidden');

    // Draw original image on picker canvas
    const ctx = pickerCanvas.getContext('2d');
    const maxWidth = 800;
    const maxHeight = 600;

    let width = state.originalImage.width;
    let height = state.originalImage.height;

    if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
    }

    if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
    }

    pickerCanvas.width = width;
    pickerCanvas.height = height;
    ctx.drawImage(state.originalImage, 0, 0, width, height);

    selectedColors.clear();
    updateSelectedColorsList();
    
    // Sync picker diversity enabled checkbox with main settings (optional - can be independent)
    if (pickerDiversityEnabled) {
        pickerDiversityEnabled.checked = state.colorDiversityEnabled;
    }
    
    // Update picker diversity inputs state
    updatePickerDiversityInputsState();
}

function closeColorPickerModal() {
    colorPickerModal.classList.add('hidden');
    pickerMode = null;
    areaSelection = { start: null, end: null, isSelecting: false };
}

closeColorPickerBtn.addEventListener('click', closeColorPickerModal);
cancelColorPickerBtn.addEventListener('click', closeColorPickerModal);

eyedropperBtn.addEventListener('click', () => {
    pickerMode = 'eyedropper';
    eyedropperBtn.classList.add('active');
    areaSelectBtn.classList.remove('active');
});

areaSelectBtn.addEventListener('click', () => {
    pickerMode = 'area';
    areaSelectBtn.classList.add('active');
    eyedropperBtn.classList.remove('active');
});

clearSelectionBtn.addEventListener('click', () => {
    selectedColors.clear();
    updateSelectedColorsList();
});

pickerCanvas.addEventListener('mousedown', (e) => {
    if (!pickerMode) return;

    const rect = pickerCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (pickerCanvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (pickerCanvas.height / rect.height));

    if (pickerMode === 'eyedropper') {
        pickColorAt(x, y);
    } else if (pickerMode === 'area') {
        areaSelection.start = { x, y };
        areaSelection.isSelecting = true;
    }
});

pickerCanvas.addEventListener('mousemove', (e) => {
    if (pickerMode === 'area' && areaSelection.isSelecting) {
        const rect = pickerCanvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) * (pickerCanvas.width / rect.width));
        const y = Math.floor((e.clientY - rect.top) * (pickerCanvas.height / rect.height));

        areaSelection.end = { x, y };
        drawSelectionRect();
    }
});

pickerCanvas.addEventListener('mouseup', (e) => {
    if (pickerMode === 'area' && areaSelection.isSelecting) {
        const rect = pickerCanvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) * (pickerCanvas.width / rect.width));
        const y = Math.floor((e.clientY - rect.top) * (pickerCanvas.height / rect.height));

        areaSelection.end = { x, y };
        areaSelection.isSelecting = false;
        extractColorsFromArea();
    }
});

function pickColorAt(x, y) {
    const ctx = pickerCanvas.getContext('2d');
    const imageData = ctx.getImageData(x, y, 1, 1);
    const [r, g, b] = imageData.data;

    const hex = rgbToHex(r, g, b);
    selectedColors.add(hex);
    updateSelectedColorsList();
}

function drawSelectionRect() {
    const ctx = pickerCanvas.getContext('2d');

    // Redraw image
    ctx.drawImage(state.originalImage, 0, 0, pickerCanvas.width, pickerCanvas.height);

    if (areaSelection.start && areaSelection.end) {
        const x = Math.min(areaSelection.start.x, areaSelection.end.x);
        const y = Math.min(areaSelection.start.y, areaSelection.end.y);
        const w = Math.abs(areaSelection.end.x - areaSelection.start.x);
        const h = Math.abs(areaSelection.end.y - areaSelection.start.y);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x, y, w, h);
        ctx.setLineDash([]);
    }
}

function extractColorsFromArea() {
    if (!areaSelection.start || !areaSelection.end) return;

    const ctx = pickerCanvas.getContext('2d');
    const x = Math.min(areaSelection.start.x, areaSelection.end.x);
    const y = Math.min(areaSelection.start.y, areaSelection.end.y);
    const w = Math.abs(areaSelection.end.x - areaSelection.start.x);
    const h = Math.abs(areaSelection.end.y - areaSelection.start.y);

    if (w === 0 || h === 0) return;

    const imageData = ctx.getImageData(x, y, w, h);
    const data = imageData.data;
    const colorFrequency = new Map();

    // Count frequency of each color
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const hex = rgbToHex(r, g, b);
        colorFrequency.set(hex, (colorFrequency.get(hex) || 0) + 1);
    }

    // Get color limit and diversity from inputs
    const colorLimitInput = document.getElementById('colorLimitInput');
    const pickerDiversityInput = document.getElementById('pickerDiversityInput');
    const colorLimit = parseInt(colorLimitInput.value) || 10;
    const diversityEnabled = pickerDiversityEnabled ? pickerDiversityEnabled.checked : true;
    const diversity = diversityEnabled ? (parseInt(pickerDiversityInput.value) || 30) : 0;

    // Convert frequency map to array of objects
    let uniqueColors = Array.from(colorFrequency.entries()).map(([hex, count]) => {
        const rgb = hexToRgb(hex);
        return { hex, r: rgb.r, g: rgb.g, b: rgb.b, count };
    });

    // Sort by count descending
    uniqueColors.sort((a, b) => b.count - a.count);

    // Apply diversity filter only if enabled
    const selectedHexes = [];
    
    if (!diversityEnabled || diversity === 0) {
        // If diversity is disabled, just take top N colors by frequency
        for (const color of uniqueColors) {
            if (selectedHexes.length >= colorLimit) break;
            selectedHexes.push(color.hex);
        }
    } else {
        // Apply diversity filter - select N colors maximizing diversity
        const minDistance = (diversity / 100) * 441.67;

        // Pass 1: Select colors that satisfy diversity threshold
        for (const color of uniqueColors) {
            if (selectedHexes.length >= colorLimit) break;

            let isDiverse = true;
            for (const existingHex of selectedHexes) {
                const existingRgb = hexToRgb(existingHex);
                const dist = Math.sqrt(colorDistance(color, existingRgb));
                if (dist < minDistance) {
                    isDiverse = false;
                    break;
                }
            }

            if (isDiverse) {
                selectedHexes.push(color.hex);
            }
        }

        // Pass 2: Fill if needed
        if (selectedHexes.length < colorLimit) {
            for (const color of uniqueColors) {
                if (selectedHexes.length >= colorLimit) break;
                if (!selectedHexes.includes(color.hex)) {
                    selectedHexes.push(color.hex);
                }
            }
        }
    }

    // Add selected colors to the set
    selectedHexes.forEach(hex => selectedColors.add(hex));
    updateSelectedColorsList();
}

function updateSelectedColorsList() {
    selectedColorsList.innerHTML = '';
    selectedColorCount.textContent = selectedColors.size;

    selectedColors.forEach(hex => {
        const item = document.createElement('div');
        item.className = 'selected-color-item';

        const swatch = document.createElement('div');
        swatch.className = 'selected-color-swatch';
        swatch.style.backgroundColor = hex;

        const hexText = document.createElement('div');
        hexText.className = 'selected-color-hex';
        hexText.textContent = hex;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'selected-color-remove';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', () => {
            selectedColors.delete(hex);
            updateSelectedColorsList();
        });

        item.appendChild(swatch);
        item.appendChild(hexText);
        item.appendChild(removeBtn);
        selectedColorsList.appendChild(item);
    });
}

addSelectedColorsBtn.addEventListener('click', () => {
    if (selectedColors.size === 0) {
        alert('Выберите хотя бы один цвет');
        return;
    }

    // Add selected colors to palette, avoiding duplicates
    let addedCount = 0;
    selectedColors.forEach(hex => {
        const rgb = hexToRgb(hex);
        if (rgb) {
            // Check if color already exists in palette
            const exists = state.colorPalette.some(existingColor =>
                existingColor.r === rgb.r &&
                existingColor.g === rgb.g &&
                existingColor.b === rgb.b
            );

            if (!exists) {
                state.colorPalette.push(rgb);
                addedCount++;
            }
        }
    });

    if (addedCount === 0) {
        alert('Все выбранные цвета уже есть в палитре');
    } else {
        updatePaletteEditor();
        closeColorPickerModal();
    }
});

function deleteColor(index) {
    if (!state.colorPalette || state.colorPalette.length <= 2) {
        alert('Должно быть минимум 2 цвета');
        return;
    }

    if (!state.pattern) {
        state.colorPalette.splice(index, 1);
        updatePaletteEditor();
        return;
    }

    loadingOverlay.classList.remove('hidden');

    setTimeout(() => {
        try {
            // Сохраняем удаляемый цвет для пересчета
            const deletedColorIndex = index;
            
            // Удаляем цвет из палитры
            state.colorPalette.splice(index, 1);

            // Пересчитываем паттерн: все бусинки с удаленным цветом заменяем на ближайший подходящий
            const newPattern = [];
            let replacedCount = 0;

            for (const bead of state.pattern) {
                let newColorIndex = bead.colorIndex;

                // Если бусинка использовала удаленный цвет
                if (bead.colorIndex === deletedColorIndex) {
                    // Получаем оригинальный цвет из изображения
                    const imgX = Math.floor(bead.x);
                    const imgY = Math.floor(bead.y);
                    const idx = (imgY * imageCanvas.width + imgX) * 4;
                    const data = state.imageData.data;
                    const originalColor = {
                        r: data[idx],
                        g: data[idx + 1],
                        b: data[idx + 2]
                    };

                    // Находим ближайший цвет из оставшейся палитры
                    newColorIndex = findNearestColor(originalColor, state.colorPalette);
                    replacedCount++;
                } else if (bead.colorIndex > deletedColorIndex) {
                    // Сдвигаем индексы для цветов, которые были после удаленного
                    newColorIndex = bead.colorIndex - 1;
                }

                newPattern.push({
                    ...bead,
                    colorIndex: newColorIndex
                });
            }

            state.pattern = newPattern;
            drawPattern(newPattern);
            
            if (replacedCount > 0) {
                console.log(`Заменено ${replacedCount} бусинок на ближайшие цвета`);
            }
        } catch (error) {
            console.error('Error deleting color:', error);
            alert('Ошибка при удалении цвета');
        } finally {
            loadingOverlay.classList.add('hidden');
        }
    }, 100);
}

function applyPaletteChanges() {
    if (!state.pattern) return;

    loadingOverlay.classList.remove('hidden');

    setTimeout(() => {
        try {
            // Remap all beads to new palette
            const newPattern = [];
            for (const bead of state.pattern) {
                // Get original color from image
                const imgX = Math.floor(bead.x);
                const imgY = Math.floor(bead.y);
                const idx = (imgY * imageCanvas.width + imgX) * 4;
                const data = state.imageData.data;
                const color = {
                    r: data[idx],
                    g: data[idx + 1],
                    b: data[idx + 2]
                };

                // Find nearest color in new palette
                const paletteIndex = findNearestColor(color, state.colorPalette);

                newPattern.push({
                    ...bead,
                    colorIndex: paletteIndex
                });
            }

            state.pattern = newPattern;
            drawPattern(newPattern);
        } catch (error) {
            console.error('Error applying palette:', error);
            alert('Ошибка при применении палитры');
        } finally {
            loadingOverlay.classList.add('hidden');
        }
    }, 100);
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        count: 0
    } : null;
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// API для получения названий цветов отключен
// Используем просто "Цвет" для всех цветов
function getColorName(color) {
    return 'Цвет';
}

function adjustZoom(factor) {
    state.zoom *= factor;
    state.zoom = Math.max(0.5, Math.min(5, state.zoom));
    patternCanvas.style.transform = `scale(${state.zoom})`;
    patternCanvas.style.transformOrigin = 'top left';
}

function toggleGrid() {
    state.showGrid = !state.showGrid;
    if (toggleGridBtn) {
        if (state.showGrid) {
            toggleGridBtn.classList.add('active');
        } else {
            toggleGridBtn.classList.remove('active');
        }
    }
    if (state.pattern) {
        drawPattern(state.pattern);
    }
}

function toggleLabels() {
    state.showLabels = !state.showLabels;
    if (toggleLabelsBtn) {
        if (state.showLabels) {
            toggleLabelsBtn.classList.add('active');
        } else {
            toggleLabelsBtn.classList.remove('active');
        }
    }
    if (state.pattern) {
        drawPattern(state.pattern);
    }
}

function toggleConnections() {
    state.showConnections = !state.showConnections;
    if (toggleConnectionsBtn) {
        if (state.showConnections) {
            toggleConnectionsBtn.classList.add('active');
        } else {
            toggleConnectionsBtn.classList.remove('active');
        }
    }
    if (state.pattern) {
        drawPattern(state.pattern);
    }
}

function exportPattern() {
    // Create a new canvas with legend
    const exportCanvas = document.createElement('canvas');
    const padding = 40;
    const legendItemHeight = 40;
    const legendItemWidth = 200;
    const legendSpacing = 20;

    // Count beads per color
    const counts = new Array(state.colorPalette.length).fill(0);
    for (const bead of state.pattern) {
        counts[bead.colorIndex]++;
    }

    // Calculate legend dimensions - arrange in multiple columns
    const itemsPerRow = Math.floor((patternCanvas.width - padding * 2) / legendItemWidth);
    const legendRows = Math.ceil(state.colorPalette.length / itemsPerRow);
    const legendHeight = legendRows * legendItemHeight + padding * 2 + 40; // 40 for title

    // Canvas dimensions
    exportCanvas.width = patternCanvas.width + padding * 2;
    exportCanvas.height = patternCanvas.height + padding * 2 + legendHeight;

    const ctx = exportCanvas.getContext('2d');

    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Title
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 24px Inter';
    ctx.fillText('Схема для вышивания бисером', padding, padding);

    // Pattern info
    ctx.font = '16px Inter';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(`Всего бусинок: ${state.pattern.length}`, padding, padding + 35);
    ctx.fillText(`Размер бусинки: ${state.beadSize}px`, padding, padding + 60);
    ctx.fillText(`Цветов: ${state.colorCount}`, padding, padding + 85);

    // Draw pattern
    const patternY = padding + 110;
    ctx.drawImage(patternCanvas, padding, patternY);

    // Draw legend below pattern
    const legendStartY = patternY + patternCanvas.height + padding;
    let legendX = padding;
    let legendY = legendStartY;

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 18px Inter';
    ctx.fillText('Легенда цветов', legendX, legendY);
    legendY += 40;

    // Draw legend items in grid
    state.colorPalette.forEach((color, index) => {
        const col = index % itemsPerRow;
        const row = Math.floor(index / itemsPerRow);
        const x = legendX + col * legendItemWidth;
        const y = legendY + row * legendItemHeight;

        // Color box
        ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
        ctx.fillRect(x, y, 30, 30);
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(x, y, 30, 30);

        // Text
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 14px Inter';
        ctx.fillText(`#${index + 1}`, x + 40, y + 15);

        ctx.font = '12px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(rgbToHex(color.r, color.g, color.b), x + 40, y + 28);

        // Count
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(`${counts[index]} шт`, x + 150, y + 20);
    });

    // Download
    exportCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `biser-pattern-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
    });
}
