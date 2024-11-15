const { handler } = require('./functions/contact'); 

// Simulação de dados de formulário
const event = {
  httpMethod: 'POST',
  body: JSON.stringify({
    name: 'Teste',
    email: 'teste@example.com',
    phone: '1234567890',
    interest: 'Consulta',
    message: 'Gostaria de mais informações sobre o serviço.',
  })
};

// Executar o teste
handler(event, {})
  .then(response => {
    console.log('Resposta:', JSON.parse(response.body));
  })
  .catch(error => {
    console.error('Erro:', error);
  });