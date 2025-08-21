document.addEventListener('DOMContentLoaded', function () {

    // --- OBJETOS E VARIÁVEIS ---
    const templateSelector = document.getElementById('templateSelector');
    const dynamicInputsContainer = document.getElementById('dynamic-inputs-container');
    const generateBtn = document.getElementById('generateBtn');
    const outputScript = document.getElementById('outputScript');
    const copyBtn = document.getElementById('copyBtn');

    let templates;

    // --- FUNÇÕES ---

    function carregarTemplates() {
        const templatesSalvos = localStorage.getItem('meusTemplates');
        if (!templatesSalvos || Object.keys(JSON.parse(templatesSalvos)).length === 0) {
            templates = {
                resetDeSenha: `Prezado(a) _START_NOME_USUARIO_,\n\nConforme solicitado no chamado _START_NUMERO_CHAMADO_, realizamos o procedimento a seguir.\n\nAção Principal: Reset da sua senha de rede.\n\nSua nova senha temporária é: *********\n\nAtenciosamente,\nEquipe de Suporte TI`
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
            generateBtn.disabled = true;
            generateBtn.textContent = 'Adicione padrões na página de edição';
            return;
        }

        const initialOption = document.createElement('option');
        initialOption.value = "";
        initialOption.textContent = "Selecione um padrão...";
        templateSelector.appendChild(initialOption);

        generateBtn.disabled = false;
        generateBtn.textContent = 'Gerar Script de Encerramento';

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
        const templateKey = templateSelector.value;
        if (!templateKey) {
            alert('Por favor, selecione um padrão.');
            return;
        }

        let rascunho = templates[templateKey];
        const variaveis = encontrarVariaveis(rascunho);
        let todosPreenchidos = true;

        variaveis.forEach(variavel => {
            const input = document.getElementById(`input-${variavel}`);
            const valor = input.value;
            if (valor.trim() === '') {
                todosPreenchidos = false;
            }
            const regex = new RegExp(`_START_${variavel}_`, 'g');
            rascunho = rascunho.replace(regex, valor);
        });

        if (!todosPreenchidos) {
            if (!confirm('Atenção: um ou mais campos estão vazios. Deseja continuar mesmo assim?')) {
                return;
            }
        }
        
        gerarScriptComIA(rascunho);
    }

    async function gerarScriptComIA(rascunho) {
        generateBtn.disabled = true;
        generateBtn.textContent = 'Gerando com IA...';
        outputScript.value = 'Aguarde, a Inteligência Artificial está pensando...';

        const prompt = `
            Você é um especialista em Suporte Técnico (TI) sênior, redigindo o registro de um chamado para um sistema de tickets.
            Sua tarefa é aprimorar o seguinte rascunho, tornando-o mais completo, profissional e detalhado, mas sem ser excessivamente longo.
            Adicione detalhes técnicos plausíveis que um analista de suporte teria realizado, com base nas informações fornecidas.

            RASCUNHO BASE (use como contexto):
            ---
            ${rascunho}
            ---

            Aprimore o rascunho acima. Mantenha a estrutura principal. Foque em detalhar melhor o corpo do texto sobre o que foi feito.
            Seja claro, profissional e conclusivo. Gere apenas o texto final do registro.
        `;

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt })
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