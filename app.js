// GPU data and precision mappings
const GPU_CARDS = {
    "L4": 24.0,
    "L40S": 48.0,
    "H100 NVL (EOS)": 94.0,
    "H200 NVL": 141.0,
    "A40": 48.0,
    "RTX PRO 6000": 96.0
};

const PRECISION_BITS = {
    "FP32 (Default)": 32,
    "FP16": 16,
    "INT8": 8,
    "INT4": 4
};

const TOOLTIPS = {
    "model_name": "Optional identifier for your model. Use descriptive names like 'GPT-4', 'Llama-70B', or 'Custom Fine-tuned Model' for easy reference.",
    "parameters": "The total number of learnable parameters in your model. Larger models generally perform better but require more memory. Examples: GPT-3 (175B), GPT-4 (estimated 1.7T), Llama-70B (70B), Mixtral-8x7B (47B active).",
    "precision": "The numerical precision used to store model weights. Lower precision reduces memory usage but may impact model quality. FP32 offers highest quality, FP16 balances quality/efficiency, INT8/INT4 maximize efficiency.",
    "bits_per_parameter": "Number of bits used to represent each model parameter. This is automatically set based on your precision selection but can be manually adjusted for custom quantization schemes.",
    "overhead": "Additional memory overhead for KV cache, activations, and inference optimizations. Typically 20-30% for standard inference, up to 50% for high-throughput scenarios with large batch sizes."
};

class GPUCalculator {
    constructor() {
        this.initializeElements();
        this.initializeDefaults();
        this.initializeTooltips();
        this.bindEvents();
    }

    initializeElements() {
        this.form = document.getElementById('calculatorForm');
        this.modelNameInput = document.getElementById('modelName');
        this.parametersInput = document.getElementById('parameters');
        this.precisionSelect = document.getElementById('precision');
        this.bitsPerParamInput = document.getElementById('bitsPerParam');
        this.overheadInput = document.getElementById('overhead');
        this.calculateBtn = document.getElementById('calculateBtn');
        this.resultsSection = document.getElementById('resultsSection');
        this.totalMemoryDisplay = document.getElementById('totalMemory');
        this.gpuTableBody = document.getElementById('gpuTableBody');
        this.tooltip = document.getElementById('tooltip');
        this.tooltipContent = this.tooltip.querySelector('.tooltip-content');
    }

    initializeDefaults() {
        // Set default precision and bits per parameter
        this.precisionSelect.value = "FP32 (Default)";
        this.bitsPerParamInput.value = "32";
        this.overheadInput.value = "20";
    }

    initializeTooltips() {
        const tooltipTriggers = document.querySelectorAll('.tooltip-trigger');
        
        tooltipTriggers.forEach(trigger => {
            trigger.addEventListener('mouseenter', (e) => {
                this.showTooltip(e);
            });
            
            trigger.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
            
            trigger.addEventListener('mousemove', (e) => {
                this.updateTooltipPosition(e);
            });
        });

        // Hide tooltip when scrolling or clicking elsewhere
        document.addEventListener('scroll', () => this.hideTooltip());
        document.addEventListener('click', () => this.hideTooltip());
    }

    showTooltip(e) {
        const tooltipKey = e.target.dataset.tooltip;
        const tooltipText = TOOLTIPS[tooltipKey];
        
        if (tooltipText) {
            this.tooltipContent.textContent = tooltipText;
            this.tooltip.classList.add('show');
            this.updateTooltipPosition(e);
        }
    }

    hideTooltip() {
        this.tooltip.classList.remove('show');
    }

    updateTooltipPosition(e) {
        const tooltipWidth = 300; // Fixed width from CSS
        const tooltipHeight = 80; // Approximate height
        
        let left = e.pageX - tooltipWidth / 2;
        let top = e.pageY - tooltipHeight - 15;
        
        // Adjust for screen boundaries
        const padding = 20;
        if (left < padding) {
            left = padding;
        } else if (left + tooltipWidth > window.innerWidth - padding) {
            left = window.innerWidth - tooltipWidth - padding;
        }
        
        if (top < padding) {
            top = e.pageY + 15;
        }
        
        this.tooltip.style.left = left + 'px';
        this.tooltip.style.top = top + 'px';
    }

    bindEvents() {
        // Debounced real-time calculation
        let calculationTimeout;
        const debouncedCalculate = () => {
            clearTimeout(calculationTimeout);
            calculationTimeout = setTimeout(() => {
                this.calculateIfValid();
            }, 300);
        };

        // Input event listeners
        if (this.parametersInput) {
            this.parametersInput.addEventListener('input', debouncedCalculate);
            this.parametersInput.addEventListener('keypress', (e) => this.validateNumericInput(e));
            this.parametersInput.addEventListener('paste', (e) => this.handlePaste(e));
        }

        if (this.bitsPerParamInput) {
            this.bitsPerParamInput.addEventListener('input', debouncedCalculate);
            this.bitsPerParamInput.addEventListener('keypress', (e) => this.validateNumericInput(e));
            this.bitsPerParamInput.addEventListener('paste', (e) => this.handlePaste(e));
        }

        if (this.overheadInput) {
            this.overheadInput.addEventListener('input', debouncedCalculate);
            this.overheadInput.addEventListener('keypress', (e) => this.validateNumericInput(e));
            this.overheadInput.addEventListener('paste', (e) => this.handlePaste(e));
        }
        
        // Precision change updates bits per parameter
        if (this.precisionSelect) {
            this.precisionSelect.addEventListener('change', () => {
                this.updateBitsPerParameter();
                this.calculateIfValid();
            });
        }

        // Calculate button click
        if (this.calculateBtn) {
            this.calculateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.calculate();
            });
        }

        // Form submission
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.calculate();
            });
        }
    }

    validateNumericInput(e) {
        const char = String.fromCharCode(e.which);
        const input = e.target;
        const currentValue = input.value;
        
        // Allow: backspace, delete, tab, escape, enter, decimal point
        if ([8, 9, 27, 13, 46, 110, 190].indexOf(e.keyCode) !== -1 ||
            // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            (e.keyCode === 65 && e.ctrlKey === true) ||
            (e.keyCode === 67 && e.ctrlKey === true) ||
            (e.keyCode === 86 && e.ctrlKey === true) ||
            (e.keyCode === 88 && e.ctrlKey === true)) {
            return;
        }
        
        // Ensure that it's a number and prevent multiple decimal points
        if ((char < '0' || char > '9') && char !== '.') {
            e.preventDefault();
            return;
        }
        
        // Prevent multiple decimal points
        if (char === '.' && currentValue.indexOf('.') !== -1) {
            e.preventDefault();
            return;
        }
    }

    handlePaste(e) {
        e.preventDefault();
        const paste = (e.clipboardData || window.clipboardData).getData('text');
        const numericValue = parseFloat(paste);
        
        if (!isNaN(numericValue) && numericValue >= 0) {
            e.target.value = numericValue.toString();
            e.target.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    updateBitsPerParameter() {
        const selectedPrecision = this.precisionSelect.value;
        if (selectedPrecision && PRECISION_BITS[selectedPrecision]) {
            this.bitsPerParamInput.value = PRECISION_BITS[selectedPrecision].toString();
            
            // Add visual feedback
            this.bitsPerParamInput.style.borderColor = 'rgba(147, 51, 234, 0.6)';
            this.bitsPerParamInput.style.boxShadow = '0 0 20px rgba(147, 51, 234, 0.2)';
            
            setTimeout(() => {
                this.bitsPerParamInput.style.borderColor = '';
                this.bitsPerParamInput.style.boxShadow = '';
            }, 1000);
        }
    }

    calculateIfValid() {
        // Only calculate if we have the minimum required inputs
        const parameters = parseFloat(this.parametersInput.value);
        const bitsPerParam = parseFloat(this.bitsPerParamInput.value);
        const overhead = parseFloat(this.overheadInput.value);

        if (!isNaN(parameters) && parameters > 0 && 
            !isNaN(bitsPerParam) && bitsPerParam > 0 && 
            !isNaN(overhead) && overhead >= 0) {
            this.calculate();
        }
    }

    calculate() {
        try {
            // Get and validate input values
            const parametersValue = this.parametersInput.value.trim();
            const bitsPerParamValue = this.bitsPerParamInput.value.trim();
            const overheadValue = this.overheadInput.value.trim();

            const parameters = parseFloat(parametersValue);
            const bitsPerParam = parseFloat(bitsPerParamValue);
            const overheadPercent = parseFloat(overheadValue);

            // Validate inputs
            if (!parametersValue || isNaN(parameters) || parameters <= 0) {
                this.showError('Please enter a valid number of parameters (greater than 0)');
                return;
            }

            if (!bitsPerParamValue || isNaN(bitsPerParam) || bitsPerParam <= 0) {
                this.showError('Please enter valid bits per parameter (greater than 0)');
                return;
            }

            if (!overheadValue || isNaN(overheadPercent) || overheadPercent < 0) {
                this.showError('Please enter a valid overhead percentage (0 or greater)');
                return;
            }

            // Convert percentage to decimal
            const overhead = overheadPercent / 100;

            // Calculate GPU memory required
            // Updated Formula: GPU Memory (GB) = (Parameters_in_Billions × (Bits_per_Parameter/8)) × (1 + overhead)
            const bytesPerParam = bitsPerParam / 8; // Convert bits to bytes
            const baseMemory = parameters * bytesPerParam;
            const totalMemoryRequired = baseMemory * (1 + overhead);

            // Validate result
            if (totalMemoryRequired <= 0 || !isFinite(totalMemoryRequired)) {
                this.showError('Invalid calculation result. Please check your inputs.');
                return;
            }

            // Update UI with calculated results
            this.displayResults(totalMemoryRequired);

            // Add success visual feedback to calculate button
            this.showCalculationSuccess();

        } catch (error) {
            console.error('Calculation error:', error);
            this.showError('An error occurred during calculation. Please check your inputs.');
        }
    }

    displayResults(totalMemoryRequired) {
        // Display total memory with animation
        this.animateNumberChange(this.totalMemoryDisplay, totalMemoryRequired);

        // Calculate GPU requirements for each card type
        const gpuResults = this.calculateGPURequirements(totalMemoryRequired);

        // Update GPU table
        this.updateGPUTable(gpuResults);

        // Show results section with animation
        this.resultsSection.style.display = 'block';
        this.resultsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        });
    }

    calculateGPURequirements(memoryRequired) {
        const results = [];

        for (const [gpuName, memoryPerCard] of Object.entries(GPU_CARDS)) {
            // Calculate quantity needed using ceiling function
            const quantityNeeded = Math.ceil(memoryRequired / memoryPerCard);

            results.push({
                name: gpuName,
                memoryPerCard: memoryPerCard,
                quantityNeeded: quantityNeeded,
                totalMemory: quantityNeeded * memoryPerCard
            });
        }

        // Sort by quantity needed (ascending)
        results.sort((a, b) => a.quantityNeeded - b.quantityNeeded);

        return results;
    }

    updateGPUTable(results) {
        this.gpuTableBody.innerHTML = '';

        results.forEach((gpu, index) => {
            const row = document.createElement('div');
            row.className = 'table-row';
            row.style.opacity = '0';
            row.style.transform = 'translateY(20px)';
            
            row.innerHTML = `
                <div class="table-cell" data-label="GPU Card">${gpu.name}</div>
                <div class="table-cell" data-label="Memory per Card">${gpu.memoryPerCard} GB</div>
                <div class="table-cell" data-label="Quantity Needed">
                    <span class="quantity-badge">${gpu.quantityNeeded}</span>
                </div>
            `;

            this.gpuTableBody.appendChild(row);

            // Add staggered animation
            setTimeout(() => {
                row.style.transition = 'all 0.5s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    animateNumberChange(element, newValue) {
        const currentValue = parseFloat(element.textContent) || 0;
        const increment = (newValue - currentValue) / 30;
        let current = currentValue;
        let steps = 0;

        const animate = () => {
            if (steps < 30 && Math.abs(current - newValue) > 0.1) {
                current += increment;
                element.textContent = current.toFixed(1);
                steps++;
                requestAnimationFrame(animate);
            } else {
                element.textContent = newValue.toFixed(1);
            }
        };

        animate();
    }

    showCalculationSuccess() {
        const btnText = this.calculateBtn.querySelector('.btn-text');
        const originalText = btnText.textContent;

        // Temporarily change button text and style
        btnText.textContent = '✓ Calculated';
        this.calculateBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        
        setTimeout(() => {
            btnText.textContent = originalText;
            this.calculateBtn.style.background = '';
        }, 1500);
    }

    showError(message) {
        // Remove any existing error messages
        const existingErrors = document.querySelectorAll('.error-message');
        existingErrors.forEach(error => error.remove());

        // Create temporary error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
            z-index: 1000;
            font-weight: 500;
            max-width: 300px;
            font-family: var(--font-family-base);
            font-size: var(--font-size-sm);
            line-height: 1.4;
            animation: slideInRight 0.3s ease;
        `;
        errorDiv.textContent = message;

        document.body.appendChild(errorDiv);

        // Remove error after 4 seconds
        setTimeout(() => {
            if (document.body.contains(errorDiv)) {
                errorDiv.style.animation = 'slideInRight 0.3s ease reverse';
                setTimeout(() => {
                    if (document.body.contains(errorDiv)) {
                        document.body.removeChild(errorDiv);
                    }
                }, 300);
            }
        }, 4000);
    }
}

// Initialize the calculator when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add error slide animation style
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    // Initialize calculator
    const calculator = new GPUCalculator();

    // Add hover effects to form inputs
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('mouseenter', () => {
            if (!input.matches(':focus')) {
                input.style.borderColor = 'rgba(147, 51, 234, 0.3)';
                input.style.background = 'rgba(255, 255, 255, 0.1)';
            }
        });

        input.addEventListener('mouseleave', () => {
            if (!input.matches(':focus')) {
                input.style.borderColor = '';
                input.style.background = '';
            }
        });
    });

    // Add floating label effect
    inputs.forEach(input => {
        const updateLabel = () => {
            const label = input.previousElementSibling;
            if (label && label.classList.contains('form-label')) {
                if (input.value || input.matches(':focus')) {
                    label.style.transform = 'translateY(-8px) scale(0.9)';
                    label.style.color = 'rgba(147, 51, 234, 0.8)';
                } else {
                    label.style.transform = '';
                    label.style.color = '';
                }
            }
        };

        input.addEventListener('focus', updateLabel);
        input.addEventListener('blur', updateLabel);
        input.addEventListener('input', updateLabel);
        
        // Initialize on page load
        updateLabel();
    });

    // Add gradient animation to the title
    const title = document.querySelector('.title');
    if (title) {
        let gradientPosition = 0;
        
        setInterval(() => {
            gradientPosition = (gradientPosition + 1) % 360;
            title.style.backgroundImage = `linear-gradient(${gradientPosition}deg, #9333ea, #ec4899, #a855f7)`;
        }, 50);
    }
});