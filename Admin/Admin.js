// ============================================
// PAGINA ADMIN - Încarcă statistici
// ============================================

class AdminPage {
    constructor() {
        this.dbName = 'carpevdb';
        this.db = null;
        
        setTimeout(() => this.init(), 100);
    }

    async init() {
        try {
            await this.openDatabase();
            await this.loadCounts();
        } catch (error) {
            console.error('Eroare:', error);
        }
    }

    async openDatabase() {
        return new Promise((resolve) => {
            const request = indexedDB.open(this.dbName);
            request.onsuccess = (event) => { this.db = event.target.result; resolve(); };
            request.onerror = () => resolve();
        });
    }

    async getTableCount(tableName) {
        if (!this.db || !this.db.objectStoreNames.contains(tableName)) return 0;
        
        return new Promise((resolve) => {
            const tx = this.db.transaction([tableName], 'readonly');
            const req = tx.objectStore(tableName).count();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(0);
        });
    }

    async loadCounts() {
        const counts = {
            'countGrupe': 'GrupeMusculare',
            'countCategorii': 'CategoriiExercitii',
            'countEchipamente': 'Echipamente',
            'countPachete': 'Pachete',
        };

        for (const [elementId, tableName] of Object.entries(counts)) {
            const count = await this.getTableCount(tableName);
            const el = document.getElementById(elementId);
            if (el) {
                el.textContent = count;
                el.style.display = count > 0 ? 'inline-block' : 'none';
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AdminPage();
});