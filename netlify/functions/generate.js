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
        
        // MUDANÇA 1: Alterando o nome do modelo para o PaLM 2
        const model = genAI.getGenerativeModel({ model: 'text-bison-001' });
        
        // MUDANÇA 2: Alterando o método de chamada para .generateText()
        // O prompt também deve ser formatado de forma diferente para este modelo
        const result = await model.generateText(prompt);
        
        // O resultado do PaLM 2 é um texto simples, não um objeto complexo
        const text = result; 

        // Retorna o sucesso
        return {
            statusCode: 200,
            body: JSON.stringify({ text: text }),
        };

    } catch (error) {
        // Bloco catch original
        console.error('Erro na função:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Ocorreu um erro ao processar sua solicitação.' }),
        };
    }
};