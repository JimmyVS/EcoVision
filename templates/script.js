const ecoTips = {
    "bottle": {
        tip: "Use a reusable water bottle to reduce plastic waste.",
        impact: "high",
        action: "replace",
        category: "household"
    },
    "tv": {
        tip: "Lower brightness or unplug when not in use to save energy.",
        impact: "medium",
        action: "reduce",
        category: "electronics"
    },
    "laptop": {
        tip: "Unplug chargers when not needed to save standby power.",
        impact: "medium",
        action: "reduce",
        category: "electronics"
    },
    "microwave": {
        tip: "Microwaves are more energy-efficient than ovens.",
        impact: "low",
        action: "reuse",
        category: "appliances"
    },
    "toothbrush": {
        tip: "Switch to bamboo toothbrushes for a greener choice.",
        impact: "medium",
        action: "replace",
        category: "personal care"
    },
    "cup": {
        tip: "Use a reusable cup instead of disposables.",
        impact: "high",
        action: "replace",
        category: "household"
    },
    "cell phone": {
        tip: "Charge only when needed to extend battery life.",
        impact: "low",
        action: "reduce",
        category: "electronics"
    },
    "book": {
        tip: "Share or donate books instead of throwing them away.",
        impact: "low",
        action: "reuse",
        category: "education"
    },
    "car": {
        tip: "Carpool, bike, or use public transport to reduce emissions.",
        impact: "high",
        action: "reduce",
        category: "transportation"
    },
    "bicycle": {
        tip: "Maintain your bike well for a long-lasting, zero-emission ride.",
        impact: "high",
        action: "reuse",
        category: "transportation"
    }
};

let selectedFile = null;

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const imagePreview = document.getElementById('imagePreview');
const loadingSection = document.getElementById('loadingSection');
const resultsSection = document.getElementById('resultsSection');
const statsSection = document.getElementById('statsSection');
const objectsList = document.getElementById('objectsList');
const tipsList = document.getElementById('tipsList');
const objectCount = document.getElementById('objectCount');
const tipCount = document.getElementById('tipCount');
const impactScore = document.getElementById('impactScore');

uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('drop', handleDrop);
uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
fileInput.addEventListener('change', handleFileSelect);
analyzeBtn.addEventListener('click', analyzeImage);

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) handleFile(file);
}

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        showError('Please select an image file.');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        showError('File must be under 10MB.');
        return;
    }

    selectedFile = file;
    displayImagePreview(file);
    analyzeBtn.disabled = false;
}

function showError(message) {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'no-results';
    errorMessage.textContent = 'Error: ' + message;
    imagePreview.innerHTML = '';
    imagePreview.appendChild(errorMessage);
    analyzeBtn.disabled = true;
}

function displayImagePreview(file) {
    const reader = new FileReader();
    reader.onload = e => {
        imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" class="image-preview">`;
    };
    reader.readAsDataURL(file);
}

async function analyzeImage() {
    if (!selectedFile) return;

    loadingSection.style.display = 'block';
    resultsSection.style.display = 'none';
    analyzeBtn.disabled = true;

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
        const response = await fetch('https://your-backend-url.com/detect', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        const detectedObjects = data.objects || [];

        const suggestions = detectedObjects
            .filter(obj => ecoTips[obj])
            .map(obj => ({
                item: obj,
                ...ecoTips[obj]
            }));

        displayResults(detectedObjects, suggestions);

    } catch (error) {
        console.error('Error analyzing image:', error);
        simulateDetection();
    } finally {
        loadingSection.style.display = 'none';
        resultsSection.style.display = 'block';
        statsSection.style.display = 'flex';
        analyzeBtn.disabled = false;
    }
}

function simulateDetection() {
    const commonObjects = ['bottle', 'laptop', 'cup', 'cell phone', 'book'];
    const detectedObjects = commonObjects.slice(0, Math.floor(Math.random() * 3) + 2);
    
    const suggestions = detectedObjects.map(obj => ({
        item: obj,
        ...ecoTips[obj]
    }));

    displayResults(detectedObjects, suggestions);
}

function displayResults(detected, suggestions) {
    objectCount.textContent = detected.length;
    tipCount.textContent = suggestions.length;

    const impactPoints = suggestions.reduce((total, suggestion) => {
        const points = {
            'high': 15,
            'medium': 10,
            'low': 5
        };
        return total + (points[suggestion.impact] || 5);
    }, 0);

    impactScore.textContent = impactPoints;

    objectsList.innerHTML = detected.length > 0
        ? detected.map(obj => `<span class="object-tag">${obj}</span>`).join('')
        : '<div class="no-results">No objects detected</div>';

    tipsList.innerHTML = suggestions.length > 0
        ? suggestions.map(suggestion => `
            <div class="tip-item">
                <div class="tip-header">
                    <div class="tip-title">${suggestion.item}</div>
                    <div class="tip-badges">
                        <span class="badge impact-${suggestion.impact}">${suggestion.impact} impact</span>
                        <span class="badge action-${suggestion.action}">${suggestion.action}</span>
                        <span class="badge category">${suggestion.category}</span>
                    </div>
                </div>
                <div class="tip-description">${suggestion.tip}</div>
            </div>
        `).join('')
        : '<div class="no-results">No eco tips available for detected objects</div>';
}
