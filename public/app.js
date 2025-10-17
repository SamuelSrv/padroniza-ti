document.addEventListener('DOMContentLoaded', function () {

    // --- OBJETOS E VARIÁVEIS ---
    const mainActionInput = document.getElementById('mainActionInput');
    const templateSelector = document.getElementById('templateSelector');
    const dynamicInputsContainer = document.getElementById('dynamic-inputs-container');
    const toggleAdvancedBtn = document.getElementById('toggleAdvancedBtn');
    const advancedOptionsContainer = document.getElementById('advanced-options-container');
    const ticketNumberInput = document.getElementById('ticketNumberInput');
    const requesterInput = document.getElementById('requesterInput');
    const departmentInput = document.getElementById('departmentInput');
    const generateBtn = document.getElementById('generateBtn');
    const outputScript = document.getElementById('outputScript');
    const copyBtn = document.getElementById('copyBtn');

    let templates;

    // --- FUNÇÕES ---

    function carregarTemplates() {
        const templatesSalvos = localStorage.getItem('meusTemplates');
        if (!templatesSalvos || Object.keys(JSON.parse(templatesSalvos)).length === 0) {
            templates = {
                resetDeSenha: `Prezado(a) _START_NOME_USUARIO_,\n\nConforme solicitado, realizamos o procedimento a seguir.\n\nAção Principal: Reset da sua senha de rede.\n\nSua nova senha temporária é: *********\n\nAtenciosamente,\nEquipe de Suporte TI`
            };
            localStorage.setItem('meusTemplates', JSON.stringify(templates));
        } else {
            templates = JSON.parse(templatesSalvos);
        }
    }

    function popularSelecaoDeTemplates() {
        templateSelector.innerHTML = '';
        if (!templates || Object.keys(templates).length === 0) {
            const option = document.createElement('option');
            option.textContent = 'Nenhum padrão encontrado';
            templateSelector.appendChild(option);
            return;
        }

        const initialOption = document.createElement('option');
        initialOption.value = "";
        initialOption.textContent = "Nenhum (usar apenas a descrição acima)";
        templateSelector.appendChild(initialOption);

        for (const key in templates) {
            const option = document.createElement('option');
            option.value = key;
            const nomeAmigavel = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
            option.textContent = `Padrão de ${nomeAmigavel}`;
            templateSelector.appendChild(option);
        }
    }
    
    function encontrarVariaveis(texto) {
        const regex = /_START_([a-zA-Z0-9_]+)_/g;
        const matches = [...texto.matchAll(regex)];
        const variaveisUnicas = new Set(matches.map(match => match[1]));
        return Array.from(variaveisUnicas);
    }

    function renderizarInputsDinamicos(keyDoTemplate) {
        dynamicInputsContainer.innerHTML = '';
        if (!keyDoTemplate || !templates[keyDoTemplate]) {
            return;
        }
        
        const textoDoTemplate = templates[keyDoTemplate];
        const variaveis = encontrarVariaveis(textoDoTemplate);

        variaveis.forEach(variavel => {
            const label = document.createElement('label');
            const labelText = variavel.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
            label.textContent = labelText;
            label.htmlFor = `input-${variavel}`;
            
            const isLargeInput = variavel.toLowerCase().includes('acao') || variavel.toLowerCase().includes('descricao');
            const input = document.createElement(isLargeInput ? 'textarea' : 'input');
            
            if (!isLargeInput) {
                input.type = 'text';
            } else {
                input.rows = 4;
            }

            input.className = 'dynamic-input';
            input.id = `input-${variavel}`;
            input.placeholder = `Digite o valor para ${labelText}...`;
            
            dynamicInputsContainer.appendChild(label);
            dynamicInputsContainer.appendChild(input);
        });
    }

    async function handleGerarScript() {
        const mainAction = mainActionInput.value;
        if (mainAction.trim() === '') {
            alert('Por favor, descreva a ação principal realizada.');
            mainActionInput.focus();
            return;
        }

        const templateKey = templateSelector.value;
        let filledTemplate = "";

        if (templateKey && templates[templateKey]) {
            filledTemplate = templates[templateKey];
            const variaveis = encontrarVariaveis(filledTemplate);
            variaveis.forEach(variavel => {
                const input = document.getElementById(`input-${variavel}`);
                const valor = input ? input.value : '';
                const regex = new RegExp(`_START_${variavel}_`, 'g');
                filledTemplate = filledTemplate.replace(regex, valor);
            });
        }

        const advancedData = {
            ticketNumber: ticketNumberInput.value,
            requester: requesterInput.value,
            department: departmentInput.value
        };
        
        gerarScriptComIA(mainAction, filledTemplate, advancedData);
    }

    async function gerarScriptComIA(mainAction, filledTemplate, advancedData) {
        generateBtn.disabled = true;
        generateBtn.textContent = 'Gerando com IA...';
        outputScript.value = 'Aguarde, a Inteligência Artificial está pensando...';

        const prompt = `
            Você é um especialista em Suporte Técnico (TI) sênior, redigindo o registro de um chamado para um sistema de tickets.
            Sua tarefa é criar um registro profissional e completo usando as seguintes informações:

            **INFORMAÇÕES DO CHAMADO (se fornecidas):**
            - Número do Chamado: ${advancedData.ticketNumber || 'Não informado'}
            - Solicitante: ${advancedData.requester || 'Não informado'}
            - Departamento: ${advancedData.department || 'Não informado'}

            **DESCRIÇÃO PRINCIPAL DA AÇÃO REALIZADA (informação mais importante):**
            ---
            ${mainAction}
            ---

            **ESTRUTURA E CONTEXTO DO TEMPLATE (se um padrão foi usado):**
            ---
            ${filledTemplate || 'Nenhum padrão utilizado'}
            ---

            **SUAS INSTRUÇÕES:**
            1.  Baseie o corpo principal do seu texto na "DESCRIÇÃO PRINCIPAL DA AÇÃO REALIZADA". Esta é a fonte da verdade sobre o que foi feito.
            2.  Incorpore as "INFORMAÇÕES DO CHAMADO" de forma natural no registro. Por exemplo, comece com uma saudação ao solicitante.
            3.  Use a "ESTRUTURA E CONTEXTO DO TEMPLATE" principalmente para guiar a saudação inicial e a frase de encerramento, mas a descrição do serviço deve vir da "DESCRIÇÃO PRINCIPAL".
            4.  Enriqueça o texto com detalhes técnicos plausíveis que um analista de TI teria executado.
            5.  O resultado final deve ser apenas o texto do registro, claro, profissional e conclusivo.
        `;

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro no servidor: ${response.statusText}`);
            }

            const data = await response.json();
            outputScript.value = data.text;

        } catch (error) {
            console.error('Erro ao chamar a API:', error);
            outputScript.value = `Ocorreu um erro ao tentar gerar o script.\n\nDetalhes do erro: ${error.message}`;
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Gerar Script de Encerramento';
        }
    }

    // --- EVENTOS E INICIALIZAÇÃO ---
    templateSelector.addEventListener('change', (event) => {
        renderizarInputsDinamicos(event.target.value);
    });

    toggleAdvancedBtn.addEventListener('click', () => {
        const isHidden = advancedOptionsContainer.classList.contains('hidden');
        if (isHidden) {
            advancedOptionsContainer.classList.remove('hidden');
            toggleAdvancedBtn.textContent = 'Opções Avançadas ▲';
        } else {
            advancedOptionsContainer.classList.add('hidden');
            toggleAdvancedBtn.textContent = 'Opções Avançadas ▼';
        }
    });

    generateBtn.addEventListener('click', handleGerarScript);

    copyBtn.addEventListener('click', () => {
        if (outputScript.value) {
            navigator.clipboard.writeText(outputScript.value).then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copiado!';
                setTimeout(() => { copyBtn.textContent = originalText; }, 2000);
            }).catch(err => {
                console.error('Falha ao copiar o texto: ', err);
            });
        }
    });

    function init() {
        carregarTemplates();
        popularSelecaoDeTemplates();
    }

    init();
});