document.addEventListener('DOMContentLoaded', () => {
    console.log('Raphael Vitoi System: Online');

    // Responsividade dinâmica para tabelas
    document.querySelectorAll('table').forEach(table => {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-responsive-wrapper';
        wrapper.style.overflowX = 'auto';
        wrapper.style.marginBottom = '2rem';
        wrapper.style.border = '1px solid rgba(255, 255, 255, 0.06)';
        wrapper.style.borderRadius = '4px';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
        table.style.margin = '0';
        table.style.border = 'none';
    });

    // Smooth Scroll para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});