const { GoogleGenerativeAI } = require('@google/generative-ai');

// Inicializa o cliente fora do handler
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Esta é a função principal que o Netlify irá executar
exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { prompt } = JSON.parse(event.body);

        if (!prompt) {
            return { statusCode: 400, body: JSON.stringify({ error: 'O prompt é obrigatório.' }) };
        }
        
        // Vamos usar o modelo mais moderno e rápido
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        // E o método .generateContent()
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

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