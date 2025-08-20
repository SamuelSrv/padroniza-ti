document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    const lightIcon = 'img/modo-escuro.png'; // Ícone para mostrar no tema claro (para MUDAR para escuro)
    const darkIcon = 'img/modo-escuro.png';  // Ícone para mostrar no tema escuro (para MUDAR para claro)

    function applyTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);

        if (themeIcon) {
            themeIcon.src = savedTheme === 'dark' ? darkIcon : lightIcon;
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            themeIcon.classList.add('spin-animation');

            let currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);

            themeIcon.src = newTheme === 'dark' ? darkIcon : lightIcon;


            setTimeout(() => {
                themeIcon.classList.remove('spin-animation');
            }, 500);
        });
    }
    applyTheme();
});