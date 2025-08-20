document.addEventListener('DOMContentLoaded', function () {
    const formContainer = document.getElementById('form-container');
    const addBtn = document.getElementById('addBtn');
    const saveBtn = document.getElementById('saveBtn');
    let templates;

    function carregarTemplates() {
        const templatesSalvos = localStorage.getItem('meusTemplates');
        templates = templatesSalvos ? JSON.parse(templatesSalvos) : {};
        renderizarTemplates();
    }

    function renderizarTemplates() {
        formContainer.innerHTML = ''; // Limpa a lista antes de renderizar
        for (const key in templates) {
            const templateElement = criarElementoDeTemplate(key, templates[key], false); // isNew = false
            formContainer.appendChild(templateElement);
        }
    }

    function criarElementoDeTemplate(key, value, isNew) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'template-item';

        // Label e Input para a Chave (Nome do Padrão)
        const keyLabel = document.createElement('label');
        keyLabel.textContent = 'Nome do Padrão (sem espaços ou acentos, ex: "novaInstalacao")';
        const keyInput = document.createElement('input');
        keyInput.type = 'text';
        keyInput.value = key;
        keyInput.className = 'template-key-input';
        keyInput.placeholder = 'ex: novoPadrao';
        if (!isNew) {
            keyInput.readOnly = true; // Chaves existentes não podem ser editadas para evitar quebrar a lógica
        }

        // Label e Textarea para o Conteúdo do Padrão
        const valueLabel = document.createElement('label');
        valueLabel.textContent = 'Conteúdo do Padrão (use ${acao} onde a ação principal deve entrar)';
        const valueTextarea = document.createElement('textarea');
        valueTextarea.value = value;
        valueTextarea.className = 'template-value-textarea';
        valueTextarea.placeholder = 'Prezado(a) usuário(a),\n\nRealizamos a seguinte ação: ${acao}.\n\nAtenciosamente,\nEquipe TI';

        // Botão para Deletar
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Excluir';
        deleteBtn.className = 'btn-delete';
        deleteBtn.addEventListener('click', () => {
            if (confirm(`Tem certeza que deseja excluir o padrão "${keyInput.value}"?`)) {
                itemDiv.remove(); // Remove o elemento da tela
            }
        });

        itemDiv.appendChild(keyLabel);
        itemDiv.appendChild(keyInput);
        itemDiv.appendChild(valueLabel);
        itemDiv.appendChild(valueTextarea);
        itemDiv.appendChild(deleteBtn);

        return itemDiv;
    }

    addBtn.addEventListener('click', () => {
        const novoTemplate = criarElementoDeTemplate('', '', true); // isNew = true
        formContainer.appendChild(novoTemplate);
    });

    saveBtn.addEventListener('click', () => {
        const novosTemplates = {};
        const items = formContainer.querySelectorAll('.template-item');
        let hasError = false;

        items.forEach(item => {
            const key = item.querySelector('.template-key-input').value.trim();
            const value = item.querySelector('.template-value-textarea').value.trim();

            if (!key) {
                alert('Erro: Todos os padrões precisam de um "Nome do Padrão".');
                hasError = true;
                return;
            }
            if (novosTemplates[key]) {
                 alert(`Erro: O nome de padrão "${key}" está duplicado.`);
                 hasError = true;
                 return;
            }
            if (!value.includes('${acao}')) {
                if(!confirm(`Atenção: O padrão "${key}" não contém a variável \${acao}. Deseja continuar mesmo assim?`)){
                    hasError = true;
                    return;
                }
            }
            
            novosTemplates[key] = value;
        });

        if (!hasError) {
            localStorage.setItem('meusTemplates', JSON.stringify(novosTemplates));
            alert('Padrões salvos com sucesso!');
            // Recarrega para definir os inputs de chave como 'readonly'
            templates = novosTemplates;
            renderizarTemplates();
        }
    });

    carregarTemplates();
});