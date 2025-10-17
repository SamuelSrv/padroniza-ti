// A lógica principal é a mesma, mas não usamos Express.js

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Inicializa o cliente fora do handler para ser reutilizado entre as invocações
// A chave de API será configurada no painel do Netlify, não em um arquivo .env
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Esta é a função principal que o Netlify irá executar
exports.handler = async function(event, context) {
    // Funções do Netlify só aceitam o método POST para segurança
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // O corpo da requisição vem como uma string, então precisamos convertê-lo para JSON
        const { prompt } = JSON.parse(event.body);

        if (!prompt) {
            return { statusCode: 400, body: JSON.stringify({ error: 'O prompt é obrigatório.' }) };
        }
        
        // MODIFICAÇÃO AQUI: Corrigimos o nome do modelo
        // Saí: 'gemini-1.5-flash-latest'
        // Entra: 'gemini-1.5-flash'
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        // Gera o conteúdo usando o prompt
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // A resposta deve ser um objeto com statusCode e um body em formato de string
        return {
            statusCode: 200,
            body: JSON.stringify({ text: text }),
        };

    } catch (error) {
        console.error('Erro na função:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Ocorreu um erro ao processar sua solicitação.' }),
        };
    }
};