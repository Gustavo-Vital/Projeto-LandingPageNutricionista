const nodemailer = require('nodemailer');
require('dotenv').config();


// Validação de dados
const validateData = (data) => {
    const { name, email, phone, interest, message } = data;
    
    if (!name || !email || !phone || !interest || !message) {
        return { isValid: false, error: 'Todos os campos são obrigatórios.' };
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, error: 'Email inválido.' };
    }

    // Validação de telefone (aceita formatos: XX XXXXX-XXXX ou XX XXXX-XXXX)
    const phoneRegex = /^\(?([0-9]{2})\)?[-. ]?([0-9]{4,5})[-. ]?([0-9]{4})$/;
    if (!phoneRegex.test(phone)) {
        return { isValid: false, error: 'Telefone inválido. Use o formato: XX XXXXX-XXXX' };
    }

    return { isValid: true };
};

// Configuração do transportador de email
const createTransporter = () => {
    try {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    } catch (error) {
        console.error('Erro ao criar transportador:', error);
        throw new Error('Erro na configuração do email');
    }
};

exports.handler = async (event, context) => {
    // Configurar CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Lidar com requisições OPTIONS (preflight)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers
        };
    }

    // Verificar método
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Método não permitido' })
        };
    }

    try {
        const data = JSON.parse(event.body);

        // Validar dados
        const validation = validateData(data);
        if (!validation.isValid) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: validation.error })
            };
        }

        const { name, email, phone, interest, message } = data;

        // Configurar email
        const mailOptions = {
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
        };

        // Enviar email
        const transporter = createTransporter();
        await transporter.sendMail(mailOptions);

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