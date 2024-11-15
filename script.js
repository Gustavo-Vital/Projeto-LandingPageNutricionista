// Constantes e configurações permanecem as mesmas
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

// Funções Utilitárias permanecem as mesmas
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

// Classe para o Calculador de Água
window.calculateWater = function() {
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
};

window.calculateIMC = function() {
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
};

document.addEventListener('DOMContentLoaded', () => {
    const inputs = ['weight-water', 'weight-imc', 'height'].map(id => 
        document.getElementById(id)
    );

    inputs.forEach(input => {
        if (input) {
            input.addEventListener('input', (e) => {
                const isValid = utils.validateNumber(e.target.value);
                utils.showFeedback(e.target, isValid);
            });

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const calculatorType = input.id.includes('water') ? 'Water' : 'IMC';
                    window[`calculate${calculatorType}`]();
                }
            });
        }
    });
});

// Mobile Menu 
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle menu
    navToggle.addEventListener('click', function() {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('active');
        
        // Impedir rolagem do corpo quando o menu estiver aberto
        document.body.style.overflow = isExpanded ? 'auto' : 'hidden';
    });

    // Fechar menu ao clicar em um link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // Fechar menu ao clicar fora
    document.addEventListener('click', function(event) {
        const isClickInside = navMenu.contains(event.target) || navToggle.contains(event.target);
        
        if (!isClickInside && navMenu.classList.contains('active')) {
            navToggle.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
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

            const data = {
                name: this.form.querySelector('#name').value,
                email: this.form.querySelector('#email').value,
                phone: this.form.querySelector('#phone').value,
                interest: this.form.querySelector('#interest').value,
                message: this.form.querySelector('#message').value
            };

            try {
                const response = await fetch('/.netlify/functions/contact', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                  });

                const result = await response.json();
                if (response.ok) {
                    this.showSuccessMessage(result.message);  // Exibir mensagem de sucesso
                } else {
                    this.showErrorMessage('Erro ao enviar mensagem');
                }
            } catch (error) {
                console.error('Erro de comunicação com o servidor:', error);
                this.showErrorMessage('Erro ao enviar mensagem');
            }
        });

        // Adicionar animação aos campos do formulário
        this.form.querySelectorAll('input, textarea, select').forEach(field => {
            field.addEventListener('focus', () => {
                field.parentElement.classList.add('focused');
            });

            field.addEventListener('blur', () => {
                field.parentElement.classList.remove('focused');
            });
        });
    }

    showSuccessMessage(message) {
        this.successMessageElement.className = 'success-message';
        this.successMessageElement.textContent = message;
        this.form.appendChild(this.successMessageElement);
    }

    showErrorMessage(message) {
        this.successMessageElement.className = 'error-message';
        this.successMessageElement.textContent = message;
        this.form.appendChild(this.successMessageElement);
    }
}

// Instanciando as classes
document.addEventListener('DOMContentLoaded', () => {
    new WaterCalculator();
    new IMCCalculator();
    new ContactForm();
});
