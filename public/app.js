document.addEventListener('DOMContentLoaded', function () {

    // --- CONFIGURAÇÃO ---
    const API_URL = '/api/generate';

    // --- OBJETOS E VARIÁVEIS ---
    const templateSelector = document.getElementById('templateSelector');
    const userInput = document.getElementById('userInput');
    const generateBtn = document.getElementById('generateBtn');
    const outputScript = document.getElementById('outputScript');
    const copyBtn = document.getElementById('copyBtn');

    let templates;

    // --- FUNÇÕES ---

    function carregarTemplates() {
        const templatesSalvos = localStorage.getItem('meusTemplates');
        if (!templatesSalvos || Object.keys(JSON.parse(templatesSalvos)).length === 0) {
            templates = {
                instalacao: `Prezado(a) usuário(a),\n\nO seu chamado foi atendido e a instalação solicitada foi concluída com sucesso.\n\nAção principal executada: \${'${acao}'}.\n\nO software foi testado e está funcionando conforme o esperado.\n\nO chamado está sendo encerrado.\n\nAtenciosamente,\nEquipe de Suporte TI`,
                resetSenha: `Prezado(a) usuário(a),\n\nConforme solicitado, sua senha foi redefinida.\n\nAção principal executada: \${'${acao}'}.\n\nPor favor, use a senha provisória e crie uma nova no primeiro login.\n\nO chamado está sendo encerrado.\n\nAtenciosamente,\nEquipe de Suporte TI`,
                problemaRede: `Prezado(a) usuário(a),\n\nO problema de conexão foi resolvido.\n\nAção principal executada: \${'${acao}'}.\n\nA conexão foi restabelecida e testada.\n\nO chamado está sendo encerrado.\n\nAtenciosamente,\nEquipe de Suporte TI`,
                encerramentoSimples: `Prezado(a) usuáriso(a),\n\nAção principal executada: \${'${acao}'}.\n\nO chamado está sendo encerrado.\n\nAtenciosamente,\nEquipe de Suporte TI`
            };
            localStorage.setItem('meusTemplates', JSON.stringify(templates));
        } else {
            templates = JSON.parse(templatesSalvos);
        }
    }

    function popularSelecaoDeTemplates() {
        templateSelector.innerHTML = '';
        if (!templates || Object.keys(templates).length === 0) {
            generateBtn.disabled = true;
            generateBtn.textContent = 'Adicione padrões na página de edição';
            return;
        }
        generateBtn.disabled = false;
        generateBtn.textContent = 'Gerar Script de Encerramento';

        for (const key in templates) {
            const option = document.createElement('option');
            option.value = key;
            // Transforma "resetSenha" em "Reset Senha"
            const nomeAmigavel = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
            option.textContent = `Padrão de ${nomeAmigavel}`;
            templateSelector.appendChild(option);
        }
    }

    async function gerarScriptComIA(acao, templateKey) {
        if (!templates[templateKey]) {
            alert('Erro: o padrão selecionado não foi encontrado.');
            return;
        }
        const rascunho = templates[templateKey].replace('${acao}', acao);

        generateBtn.disabled = true;
        generateBtn.textContent = 'Gerando com IA...';
        outputScript.value = 'Gerando Registro...';

        const prompt = `
            Você é um Tecnico em Suporte (TI), redigindo o registro de um chamado para um sistema de tickets.
            Sua tarefa é aprimorar um rascunho, tornando-o mais completo mas sem ser excessivamente longo.
            Adicione detalhes técnicos plausíveis que um analista de suporte teria realizado.
            Tambem deixe em Negrito Parte onde eu precisem ser completadas se houver

            RASCUNHO BASE (use como contexto):
            ---
            ${rascunho}
            ---

            AÇÃO PRINCIPAL REALIZADA (informação mais importante): "${acao}"

            Aprimore o rascunho acima. Mantenha a estrutura de saudação e encerramento. Foque em detalhar melhor o corpo do texto sobre o que foi feito.
            Seja claro, profissional e conclusivo. Gere apenas o texto final do registro.
        `;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: prompt })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro no servidor: ${response.statusText}`);
            }

            const data = await response.json();
            const textoGerado = data.text;
            outputScript.value = textoGerado;

        } catch (error) {
            console.error('Erro ao chamar a API:', error);
            outputScript.value = `Ocorreu um erro ao tentar gerar o script.\n\nDetalhes do erro: ${error.message}`;
        } finally {
            if (Object.keys(templates).length > 0) {
                generateBtn.disabled = false;
                generateBtn.textContent = 'Gerar Script de Encerramento';
            }
        }
    }

    // --- EVENTOS E INICIALIZAÇÃO ---
    generateBtn.addEventListener('click', () => {
        const acaoRealizada = userInput.value;
        const templateKey = templateSelector.value;
        if (!templateKey) {
            alert('Não há padrões selecionados. Adicione um na página de edição.');
            return;
        }
        if (acaoRealizada.trim() === '') {
            alert('Por favor, descreva a ação realizada.');
            userInput.focus();
            return;
        }
        gerarScriptComIA(acaoRealizada, templateKey);
    });

    copyBtn.addEventListener('click', () => {
        const textToCopy = outputScript.value;

        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copiado!';
                copyBtn.style.backgroundColor = '#28a745'; // Feedback visual
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.style.backgroundColor = ''; // Volta ao normal
                }, 2000);
            }).catch(err => {
                console.error('Falha ao copiar o texto: ', err);
                alert('Não foi possível copiar o texto para a área de transferência.');
            });
        }
    });

    function init() {
        carregarTemplates();
        popularSelecaoDeTemplates();
    }

    init();
});