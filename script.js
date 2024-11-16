// Constantes e configurações
const CONFIG = {
    WATER_FACTOR: 35,
    IMC_CATEGORIES: [
        { max: 18.5, label: 'Abaixo do peso (Magreza)', color: '#FFA07A' },
        { max: 24.9, label: 'Peso ideal', color: '#98FB98' },
        { max: 29.9, label: 'Sobrepeso', color: '#FFD700' },
        { max: 34.9, label: 'Obesidade grau I', color: '#FFA500' },
        { max: 39.9, label: 'Obesidade grau II', color: '#FF6347' },
        { max: Infinity, label: 'Obesidade grau III', color: '#FF4500' }
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
            element.textContent = current.toFixed(1);

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
        this.setupEventListeners();
    }

    setupEventListeners() {
        const weightInput = document.getElementById('weight-water');
        const calculateButton = document.getElementById('calculate-water-btn');    

        if (weightInput) {
            weightInput.addEventListener('input', () => {
                const isValid = utils.validateNumber(weightInput.value);
                utils.showFeedback(weightInput, isValid);
            });

            weightInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.calculate();
                }
            });
        }
            if (calculateButton) {
            calculateButton.addEventListener('click', () => this.calculate());
        }
    }

    calculate() {
        const weightInput = document.getElementById('weight-water');
        const resultElement = document.getElementById('water-result');
        const weight = parseFloat(weightInput.value);

        if (!utils.validateNumber(weight)) {
            utils.showFeedback(weightInput, false);
            return;
        }

        utils.showFeedback(weightInput, true);
        const waterInLiters = (weight * CONFIG.WATER_FACTOR) / 1000;
        const currentValue = parseFloat(resultElement.textContent) || 0;

        utils.animateValue(
            resultElement,
            currentValue,
            waterInLiters,
            CONFIG.ANIMATION_DURATION
        );
    }
}

// Calculadora de IMC
class IMCCalculator {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const inputs = ['weight-imc', 'height'].map(id => document.getElementById(id));
        const calculateButton = document.getElementById('calculate-imc-btn');

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
                if (calculateButton) {
                calculateButton.addEventListener('click', () => this.calculate());
    }

    calculate() {
        const weightInput = document.getElementById('weight-imc');
        const heightInput = document.getElementById('height');
        const resultElement = document.getElementById('imc-result');
        const categoryElement = document.getElementById('imc-category');

        const weight = parseFloat(weightInput.value);
        const height = parseFloat(heightInput.value);

        if (!utils.validateNumber(weight) || !utils.validateNumber(height)) {
            utils.showFeedback(weightInput, !utils.validateNumber(weight));
            utils.showFeedback(heightInput, !utils.validateNumber(height));
            return;
        }

        utils.showFeedback(weightInput, true);
        utils.showFeedback(heightInput, true);

        const heightInMeters = height / 100;
        const imc = weight / (heightInMeters * heightInMeters);

        const currentValue = parseFloat(resultElement.textContent) || 0;
        utils.animateValue(
            resultElement,
            currentValue,
            imc,
            CONFIG.ANIMATION_DURATION
        );

        const category = CONFIG.IMC_CATEGORIES.find(category => imc <= category.max);
        categoryElement.textContent = category.label;
        categoryElement.style.color = category.color;
    }
}

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
