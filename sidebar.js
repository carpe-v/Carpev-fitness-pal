class SidebarComponent {
    constructor() {
        this.container = document.getElementById('sidebar-container');
        if (this.container) {
            this.loadSidebar();
            this.setupDevCornerShortcut();
        }
    }

    async loadSidebar() {
        try {
            const response = await fetch('sidebar.html');
            if (!response.ok) throw new Error('sidebar.html nu a fost găsit');
            this.container.innerHTML = await response.text();
            this.highlightActiveLink();
            this.setupToggle();
            this.restoreDevCornerState();
        } catch (error) {
            console.error('Eroare:', error);
        }
    }

    highlightActiveLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        setTimeout(() => {
            document.querySelectorAll('.nav-link, .bottom-link').forEach(link => {
                link.classList.remove('active');
                const href = link.getAttribute('href');
                if (href && currentPage.includes(href.split('/').pop())) {
                    link.classList.add('active');
                }
            });
        }, 100);
    }

    setupToggle() {
        setTimeout(() => {
            const toggleBtn = document.getElementById('toggleBtn');
            const sidebar = document.getElementById('sidebar');
            if (toggleBtn && sidebar) {
                if (localStorage.getItem('sidebarCollapsed') === 'true') sidebar.classList.add('collapsed');
                toggleBtn.addEventListener('click', () => {
                    sidebar.classList.toggle('collapsed');
                    localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
                });
            }
        }, 100);
    }

    setupDevCornerShortcut() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                const section = document.getElementById('devCornerSection');
                if (section) {
                    section.classList.toggle('hidden');
                    localStorage.setItem('devCornerHidden', section.classList.contains('hidden'));
                }
            }
        });
    }

    restoreDevCornerState() {
        setTimeout(() => {
            if (localStorage.getItem('devCornerHidden') === 'true') {
                const section = document.getElementById('devCornerSection');
                if (section) section.classList.add('hidden');
            }
        }, 200);
    }
}

document.addEventListener('DOMContentLoaded', () => new SidebarComponent());