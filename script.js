// Constantes e configurações
const CONFIG = {
    WATER_FACTOR: 35,
    IMC_CATEGORIES: [
        { max: 18.5, label: 'Abaixo do peso (Magreza)' },
        { max: 24.9, label: 'Peso ideal' },
        { max: 29.9, label: 'Sobrepeso' },
        { max: 34.9, label: 'Obesidade grau I'},
        { max: 39.9, label: 'Obesidade grau II' },
        { max: Infinity, label: 'Obesidade grau III'}
    ],
    ANIMATION_DURATION: 500
};

// Funções Utilitárias
const utils = {
    validateNumber: (value, min = 0) => {
        const num = parseFloat(value);
        return !isNaN(num) && num > min;
    },

    animateValue: (element, start, end, duration) => {
        const startTime = performance.now();
        const updateValue = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const current = start + (end - start) * progress;
            element.textContent = current.toFixed(1) + (element.id === 'water-result' ? ' L' : '');

            if (progress < 1) {
                requestAnimationFrame(updateValue);
            }
        };
        requestAnimationFrame(updateValue);
    },

    showFeedback: (element, isValid) => {
        element.style.borderColor = isValid ? '#4C5939' : '#FF6B6B';
        element.style.transition = 'border-color 0.3s ease';
    }
};

// Calculadora de Água
class WaterCalculator {
    constructor() {
        this.weightInput = document.getElementById('weight-water');
        this.calculateButton = document.getElementById('calculate-water-btn');
        this.resultElement = document.getElementById('water-result');
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.weightInput && this.calculateButton) {
            this.weightInput.addEventListener('input', () => {
                const isValid = utils.validateNumber(this.weightInput.value);
                utils.showFeedback(this.weightInput, isValid);
            });

            this.weightInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.calculate();
                }
            });

            this.calculateButton.addEventListener('click', () => this.calculate());
        }
    }

    calculate() {
        if (!this.weightInput || !this.resultElement) return;

        const weight = parseFloat(this.weightInput.value);
        if (!utils.validateNumber(weight)) {
            utils.showFeedback(this.weightInput, false);
            return;
        }

        utils.showFeedback(this.weightInput, true);
        const waterInLiters = (weight * CONFIG.WATER_FACTOR) / 1000;
        const currentValue = parseFloat(this.resultElement.textContent) || 0;

        utils.animateValue(
            this.resultElement,
            currentValue,
            waterInLiters,
            CONFIG.ANIMATION_DURATION
        );
    }
}

// Calculadora de IMC
class IMCCalculator {
    constructor() {
        this.weightInput = document.getElementById('weight-imc');
        this.heightInput = document.getElementById('height');
        this.calculateButton = document.getElementById('calculate-imc-btn');
        this.resultElement = document.getElementById('imc-result');
        this.categoryElement = document.getElementById('imc-category');
        this.setupEventListeners();
    }

    setupEventListeners() {
        const inputs = [this.weightInput, this.heightInput];

        inputs.forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    const isValid = utils.validateNumber(input.value);
                    utils.showFeedback(input, isValid);
                });

                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.calculate();
                    }
                });
            }
        });

        if (this.calculateButton) {
            this.calculateButton.addEventListener('click', () => this.calculate());
        }
    }

    calculate() {
        if (!this.weightInput || !this.heightInput || !this.resultElement || !this.categoryElement) return;

        const weight = parseFloat(this.weightInput.value);
        const height = parseFloat(this.heightInput.value);

        if (!utils.validateNumber(weight) || !utils.validateNumber(height)) {
            utils.showFeedback(this.weightInput, utils.validateNumber(weight));
            utils.showFeedback(this.heightInput, utils.validateNumber(height));
            return;
        }

        utils.showFeedback(this.weightInput, true);
        utils.showFeedback(this.heightInput, true);

        const heightInMeters = height / 100;
        const imc = weight / (heightInMeters * heightInMeters);

        const currentValue = parseFloat(this.resultElement.textContent) || 0;
        utils.animateValue(
            this.resultElement,
            currentValue,
            imc,
            CONFIG.ANIMATION_DURATION
        );

        const category = CONFIG.IMC_CATEGORIES.find(category => imc <= category.max);
        this.categoryElement.textContent = category.label;
        this.categoryElement.style.color = category.color;
    }
}

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new WaterCalculator();
    new IMCCalculator();
});

// Classe para o Manipulador do Formulário de Contato
class ContactForm {
    constructor() {
        this.form = document.querySelector('.contact-form');
        this.successMessageElement = document.createElement('div');
        this.setupForm();
    }

    setupForm() {
        if (!this.form) return;

        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Desabilitar o botão de envio para evitar múltiplos envios
            const submitButton = this.form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
            }

            // Coletar dados do formulário
            const formData = {
                name: this.form.querySelector('#name').value,
                email: this.form.querySelector('#email').value,
                phone: this.form.querySelector('#phone').value,
                interest: this.form.querySelector('#interest').value,
                message: this.form.querySelector('#message').value
            };

            try {

                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok) {
                    this.showSuccessMessage(result.message);
                    this.form.reset();
                } else {
                    this.showErrorMessage(result.error || 'Erro ao enviar mensagem');
                }
            } catch (error) {
                console.error('Erro de comunicação com o servidor:', error);
                this.showErrorMessage('Erro ao enviar mensagem. Por favor, tente novamente.');
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                }
            }
        });

        // Adicionar animação aos campos do formulário
        this.form.querySelectorAll('input, textarea, select').forEach(field => {
            field.addEventListener('focus', () => {
                field.parentElement.classList.add('focused');
            });

            field.addEventListener('blur', () => {
                if (!field.value) {
                    field.parentElement.classList.remove('focused');
                }
            });
        });
    }

    showSuccessMessage(message) {
        this.successMessageElement.className = 'success-message';
        this.successMessageElement.textContent = message;
        this.successMessageElement.style.cssText = `
            background-color: #4CAF50;
            color: white;
            padding: 15px;
            margin: 10px 0;
            border-radius: 4px;
            text-align: center;
        `;
        this.form.appendChild(this.successMessageElement);

        setTimeout(() => {
            this.successMessageElement.remove();
        }, 5000);
    }

    showErrorMessage(message) {
        this.successMessageElement.className = 'error-message';
        this.successMessageElement.textContent = message;
        this.successMessageElement.style.cssText = `
            background-color: #f44336;
            color: white;
            padding: 15px;
            margin: 10px 0;
            border-radius: 4px;
            text-align: center;
        `;
        this.form.appendChild(this.successMessageElement);

        setTimeout(() => {
            this.successMessageElement.remove();
        }, 5000);
    }
}

// Mobile Menu 
class MobileMenu {
    constructor() {
        this.navToggle = document.querySelector('.nav-toggle');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (!this.navToggle || !this.navMenu) return;

        // Toggle menu
        this.navToggle.addEventListener('click', () => {
            const isExpanded = this.navToggle.getAttribute('aria-expanded') === 'true';
            this.toggleMenu(!isExpanded);
        });

        // Fechar menu ao clicar em um link
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Fechar menu ao clicar fora
        document.addEventListener('click', (event) => {
            const isClickInside = this.navMenu.contains(event.target) ||
                this.navToggle.contains(event.target);

            if (!isClickInside && this.navMenu.classList.contains('active')) {
                this.closeMenu();
            }
        });
    }

    toggleMenu(isOpen) {
        this.navToggle.setAttribute('aria-expanded', isOpen);
        this.navMenu.classList.toggle('active', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    }

    closeMenu() {
        this.toggleMenu(false);
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    new WaterCalculator();
    new IMCCalculator();
    new ContactForm();
    new MobileMenu();
});
