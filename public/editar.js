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

        const keyLabel = document.createElement('label');
        keyLabel.textContent = 'Nome do Padrão (sem espaços ou acentos, ex: "novaInstalacao")';
        const keyInput = document.createElement('input');
        keyInput.type = 'text';
        keyInput.value = key;
        keyInput.className = 'template-key-input';
        keyInput.placeholder = 'ex: novoPadrao';
        if (!isNew) {
            keyInput.readOnly = true;
        }

        const valueLabel = document.createElement('label');
        valueLabel.textContent = 'Conteúdo do Padrão';
        const valueTextarea = document.createElement('textarea');
        valueTextarea.value = value;
        valueTextarea.className = 'template-value-textarea';
        // MODIFICADO: Placeholder atualizado para ensinar o novo formato de variáveis
        valueTextarea.placeholder = 'Use variáveis como _START_NOME_USUARIO_, _START_TICKET_ e _START_ACAO_ para criar campos dinâmicos.';

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Excluir';
        deleteBtn.className = 'btn-delete';
        deleteBtn.addEventListener('click', () => {
            if (confirm(`Tem certeza que deseja excluir o padrão "${keyInput.value}"?`)) {
                itemDiv.remove();
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
        const novoTemplate = criarElementoDeTemplate('', '', true);
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
            
            novosTemplates[key] = value;
        });

        if (!hasError) {
            localStorage.setItem('meusTemplates', JSON.stringify(novosTemplates));
            alert('Padrões salvos com sucesso!');
            templates = novosTemplates;
            renderizarTemplates();
        }
    });

    carregarTemplates();
});