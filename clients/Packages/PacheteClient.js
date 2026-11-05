// ============================================
// PACHETE CLIENT
// ============================================

class PacheteClientManager {
    constructor() {
        this.dbName = 'carpevdb';
        this.clientsTable = 'Clienti';
        this.offersTable = 'Oferte';
        this.packagesTable = 'PacheteClient';
        this.sessionsTable = 'Sedinte';
        this.db = null;
        this.currentClient = null;
        
        setTimeout(() => this.init(), 100);
    }

    async init() {
        await this.openDatabase();
        await this.ensurePackagesTable();
        await this.loadClients();
        this.setupEventListeners();
        
        const urlParams = new URLSearchParams(window.location.search);
        const clientId = urlParams.get('id');
        if (clientId) {
            document.querySelector('#pacheteClient').value = clientId;
            await this.loadClientPackages(parseInt(clientId));
        }
    }

    async openDatabase() {
        return new Promise((resolve) => {
            const request = indexedDB.open(this.dbName);
            request.onsuccess = (e) => { this.db = e.target.result; resolve(); };
            request.onerror = () => resolve();
        });
    }

    async ensurePackagesTable() {
        if (this.db.objectStoreNames.contains(this.packagesTable)) return;
        return new Promise((resolve) => {
            this.db.close();
            const request = indexedDB.open(this.dbName, this.db.version + 1);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.packagesTable)) {
                    const store = db.createObjectStore(this.packagesTable, { keyPath: 'id', autoIncrement: true });
                    store.createIndex('client_index', 'client_id', { unique: false });
                }
            };
            request.onsuccess = (e) => { this.db = e.target.result; resolve(); };
            request.onerror = () => resolve();
        });
    }

    async loadClients() {
        const select = document.querySelector('#pacheteClient');
        if (!select || !this.db?.objectStoreNames.contains(this.clientsTable)) return;
        const tx = this.db.transaction([this.clientsTable], 'readonly');
        const req = tx.objectStore(this.clientsTable).getAll();
        const clients = await new Promise(r => { req.onsuccess = () => r(req.result || []); req.onerror = () => r([]); });
        select.innerHTML = '<option value="">-- Selectează clientul --</option>';
        clients.sort((a, b) => (a.last_name || '').localeCompare(b.last_name || '', 'ro')).forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = `${c.first_name} ${c.last_name}`;
            select.appendChild(opt);
        });
    }

    setupEventListeners() {
        document.querySelector('#pacheteClient')?.addEventListener('change', (e) => {
            const id = parseInt(e.target.value);
            if (id) this.loadClientPackages(id);
            else { this.currentClient = null; document.querySelector('#pacheteContent').style.display = 'none'; }
        });
        document.querySelector('#addPackageBtn')?.addEventListener('click', () => this.openPackageModal());
        document.querySelector('#closePackageModal')?.addEventListener('click', () => this.closePackageModal());
        document.querySelector('#cancelPackageBtn')?.addEventListener('click', () => this.closePackageModal());
        document.querySelector('#savePackageBtn')?.addEventListener('click', () => this.savePackage());
    }

    async loadClientPackages(clientId) {
        const client = await this.getRecord(this.clientsTable, clientId);
        if (!client) return;
        this.currentClient = client;
        
        document.querySelector('#pacheteContent').style.display = '';
        document.querySelector('#pacheteName').textContent = `${client.first_name} ${client.last_name}`;
        document.querySelector('#pacheteInitials').textContent = this.getInitials(client.first_name, client.last_name);
        document.querySelector('#pacheteAvatar').style.background = this.getColor(`${client.first_name} ${client.last_name}`);
        
        const statusEl = document.querySelector('#pacheteStatus');
        statusEl.textContent = client.status === 'activ' ? '✅ Activ' : '⏸️ Inactiv';
        statusEl.className = `status-badge status-${client.status}`;

        await this.renderPackages(clientId);
    }

    async getClientPackages(clientId) {
        if (!this.db?.objectStoreNames.contains(this.packagesTable)) return [];
        const tx = this.db.transaction([this.packagesTable], 'readonly');
        const req = tx.objectStore(this.packagesTable).getAll();
        const all = await new Promise(r => { req.onsuccess = () => r(req.result || []); req.onerror = () => r([]); });
        return all.filter(p => p.client_id === clientId).sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
    }

    async renderPackages(clientId) {
        const packages = await this.getClientPackages(clientId);
        const container = document.querySelector('#packagesList');
        if (!container) return;

        if (packages.length === 0) {
            container.innerHTML = '<div class="empty-message">📭 Niciun pachet. Adaugă primul pachet!</div>';
            return;
        }

        const sessions = await this.getClientSessions(clientId);
        
        container.innerHTML = packages.map(pkg => {
            const pkgSessions = sessions.filter(s => s.package_id === pkg.id);
            const completed = pkgSessions.filter(s => s.status === 'completed').length;
            const total = pkg.total_sessions || 0;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
            
            let status = 'active';
            if (completed >= total && total > 0) status = 'completed';
            if (pkg.end_date && new Date(pkg.end_date) < new Date()) status = 'expired';
            
            const today = new Date().toISOString().split('T')[0];
            
            return `
                <div class="package-card ${status}">
                    <div class="package-header">
                        <div class="package-name">${pkg.offer_name || 'Pachet'}</div>
                        <div class="package-status status-${status}">${status === 'active' ? '🔄 Activ' : status === 'completed' ? '✅ Completat' : '⏰ Expirat'}</div>
                    </div>
                    <div class="package-info">
                        <div class="package-info-row">
                            <span class="info-icon">📅</span>
                            <span>${pkg.start_date ? new Date(pkg.start_date).toLocaleDateString('ro-RO') : '-'} → ${pkg.end_date ? new Date(pkg.end_date).toLocaleDateString('ro-RO') : '-'}</span>
                        </div>
                        <div class="package-info-row">
                            <span class="info-icon">📋</span>
                            <span>${completed}/${total} ședințe</span>
                        </div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="progress-text">${progress}% completat</div>
                    <div class="package-sessions">
                        ${Array.from({ length: total }, (_, i) => {
                            const sn = i + 1;
                            const session = pkgSessions.find(s => s.session_number === sn);
                            const isCompleted = session && session.status === 'completed';
                            const isToday = session && session.date === today;
                            return `<div class="session-dot ${isCompleted ? 'completed' : isToday ? 'current' : 'pending'}" 
                                         onclick="window.pacheteManager.openSedinta(${clientId}, ${pkg.id}, ${sn})"
                                         title="Ședința ${sn}">${sn}</div>`;
                        }).join('')}
                    </div>
                    <div class="package-actions">
                        <button class="btn-xs btn-edit" onclick="window.pacheteManager.editPackage(${pkg.id})">✏️</button>
                        <button class="btn-xs btn-delete" onclick="window.pacheteManager.deletePackage(${pkg.id})">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    openSedinta(clientId, packageId, sessionNumber) {
        window.location.href = `../Sedinta/Sedinta.html?client=${clientId}&package=${packageId}&session=${sessionNumber}`;
    }

    // ===== MODAL PACHET =====

    async openPackageModal(pkg = null) {
        const modal = document.querySelector('#packageModal');
        if (!modal) return;

        document.querySelector('#packageId').value = pkg ? pkg.id : '';
        document.querySelector('#packageStartDate').value = pkg ? (pkg.start_date || '') : new Date().toISOString().split('T')[0];
        document.querySelector('#packageEndDate').value = pkg ? (pkg.end_date || '') : '';
        document.querySelector('#packageNotes').value = pkg ? (pkg.notes || '') : '';
        document.querySelector('#modalTitle').textContent = pkg ? '✏️ Editează Pachet' : '➕ Pachet Nou';

        await this.loadOffersDropdown();
        document.querySelector('#packageOffer').value = pkg ? (pkg.offer_name || '') : '';

        modal.style.display = 'flex';
    }

    async loadOffersDropdown() {
        const select = document.querySelector('#packageOffer');
        if (!select || !this.db?.objectStoreNames.contains(this.offersTable)) return;
        select.innerHTML = '<option value="">-- Selectează pachetul --</option>';
        const tx = this.db.transaction([this.offersTable], 'readonly');
        const req = tx.objectStore(this.offersTable).getAll();
        const offers = await new Promise(r => { req.onsuccess = () => r(req.result || []); req.onerror = () => r([]); });
        offers.sort((a, b) => a.name.localeCompare(b.name, 'ro')).forEach(o => {
            const opt = document.createElement('option');
            opt.value = o.name;
            opt.textContent = `${o.name} (${o.sessions} șed. - ${o.price} RON)`;
            select.appendChild(opt);
        });
    }

    async savePackage() {
        const offerName = document.querySelector('#packageOffer')?.value;
        if (!offerName) { alert('Selectează un pachet!'); return; }

        const offer = await this.getOfferByName(offerName);
        if (!offer) { alert('Pachetul nu a fost găsit!'); return; }

        const totalSessions = offer.demo_session ? offer.sessions + 1 : offer.sessions;

        const data = {
            client_id: this.currentClient.id,
            offer_name: offerName,
            total_sessions: totalSessions,
            start_date: document.querySelector('#packageStartDate')?.value || '',
            end_date: document.querySelector('#packageEndDate')?.value || '',
            notes: document.querySelector('#packageNotes')?.value || '',
            updated_at: new Date().toISOString()
        };

        const id = document.querySelector('#packageId')?.value;
        if (id) {
            data.id = parseInt(id);
            await this.updateRecord(data);
        } else {
            await this.addRecord(data);
        }

        this.closePackageModal();
        await this.renderPackages(this.currentClient.id);
    }

    async editPackage(id) {
        const pkg = await this.getRecord(this.packagesTable, id);
        if (pkg) this.openPackageModal(pkg);
    }

    async deletePackage(id) {
        if (!confirm('Ștergi acest pachet?')) return;
        await new Promise((resolve) => {
            const tx = this.db.transaction([this.packagesTable], 'readwrite');
            tx.objectStore(this.packagesTable).delete(id);
            tx.oncomplete = () => resolve();
        });
        await this.renderPackages(this.currentClient.id);
    }

    closePackageModal() { document.querySelector('#packageModal').style.display = 'none'; }

    addRecord(data) {
        return new Promise((resolve) => {
            const tx = this.db.transaction([this.packagesTable], 'readwrite');
            const req = tx.objectStore(this.packagesTable).add({ ...data, created_at: new Date().toISOString() });
            req.onsuccess = () => resolve(req.result);
        });
    }

    updateRecord(data) {
        return new Promise((resolve) => {
            const tx = this.db.transaction([this.packagesTable], 'readwrite');
            tx.objectStore(this.packagesTable).put(data);
            tx.oncomplete = () => resolve();
        });
    }

    async getClientSessions(clientId) {
        if (!this.db?.objectStoreNames.contains(this.sessionsTable)) return [];
        const tx = this.db.transaction([this.sessionsTable], 'readonly');
        const req = tx.objectStore(this.sessionsTable).getAll();
        const all = await new Promise(r => { req.onsuccess = () => r(req.result || []); req.onerror = () => r([]); });
        return all.filter(s => s.client_id === clientId);
    }

    async getOfferByName(name) {
        if (!this.db?.objectStoreNames.contains(this.offersTable)) return null;
        const tx = this.db.transaction([this.offersTable], 'readonly');
        const req = tx.objectStore(this.offersTable).getAll();
        const offers = await new Promise(r => { req.onsuccess = () => r(req.result || []); req.onerror = () => r([]); });
        return offers.find(o => o.name === name) || null;
    }

    async getRecord(table, id) {
        if (!this.db?.objectStoreNames.contains(table)) return null;
        return new Promise(r => {
            const tx = this.db.transaction([table], 'readonly');
            const req = tx.objectStore(table).get(id);
            req.onsuccess = () => r(req.result || null);
            req.onerror = () => r(null);
        });
    }

    getInitials(f, l) { return ((f||'')[0] + (l||'')[0]).toUpperCase(); }
    getColor(name) {
        let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
        const colors = ['#667eea','#764ba2','#4caf50','#2196f3','#ff9800','#f44336','#9c27b0','#00bcd4'];
        return colors[Math.abs(h) % colors.length];
    }
}

let pacheteManager;
window.addEventListener('DOMContentLoaded', () => {
    pacheteManager = new PacheteClientManager();
    window.pacheteManager = pacheteManager;
});