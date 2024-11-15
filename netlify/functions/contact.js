const nodemailer = require('nodemailer');

// Validação de dados
const validateData = (data) => {
    const { name, email, phone, interest, message } = data;
    
    if (!name || !email || !phone || !interest || !message) {
        return { isValid: false, error: 'Todos os campos são obrigatórios.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, error: 'Email inválido.' };
    }

    const phoneRegex = /^\(?([0-9]{2})\)?[-. ]?([0-9]{4,5})[-. ]?([0-9]{4})$/;
    if (!phoneRegex.test(phone)) {
        return { isValid: false, error: 'Telefone inválido. Use o formato: XX XXXXX-XXXX' };
    }

    return { isValid: true };
};

const handler = async (event) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle OPTIONS method
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Método não permitido' })
        };
    }

    try {
        // Verificar variáveis de ambiente
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error('Configurações de email não encontradas');
        }

        const data = JSON.parse(event.body);
        const validation = validateData(data);
        
        if (!validation.isValid) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: validation.error })
            };
        }

        const { name, email, phone, interest, message } = data;

        // Criar transportador
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Configurar email
        await transporter.sendMail({
            from: `"Formulário do Site" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `Novo contato - ${interest}`,
            html: `
                <h2>Novo contato recebido pelo site</h2>
                <p><strong>Nome:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>WhatsApp:</strong> ${phone}</p>
                <p><strong>Interesse:</strong> ${interest}</p>
                <p><strong>Mensagem:</strong> ${message}</p>
            `
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.' 
            })
        };

    } catch (error) {
        console.error('Erro:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Erro interno do servidor. Por favor, tente novamente mais tarde.' 
            })
        };
    }
};

module.exports = { handler };