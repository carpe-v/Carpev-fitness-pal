// ============================================
// GESTIONARE CLIENTI
// ============================================

class ClientiManager {

    constructor() {

        this.dbName = "carpevDB";
        this.tableName = "Clienti";

        this.db = null;

        this.packages = [];

        this.init();
    }

    async init() {

        try {

            await this.openDatabase();

            await this.ensureTableExists();

            await this.loadPackages();

            this.setupEventListeners();

            await this.loadClients();

            console.log(
                "✅ Clienti initializat"
            );

        } catch (error) {

            console.error(error);
        }
    }

    async openDatabase() {

        return new Promise((resolve, reject) => {

            const request =
                indexedDB.open(
                    this.dbName
                );

            request.onsuccess =
                (event) => {

                this.db =
                    event.target.result;

                resolve();
            };

            request.onerror =
                () => {

                reject(
                    request.error
                );
            };
        });
    }

    async ensureTableExists() {

        if (
            this.db.objectStoreNames.contains(
                this.tableName
            )
        ) {
            return;
        }

        this.db.close();

        return new Promise((resolve, reject) => {

            const request =
                indexedDB.open(
                    this.dbName,
                    this.db.version + 1
                );

            request.onupgradeneeded =
                (event) => {

                const db =
                    event.target.result;

                if (
                    !db.objectStoreNames.contains(
                        this.tableName
                    )
                ) {

                    db.createObjectStore(
                        this.tableName,
                        {
                            keyPath: "id",
                            autoIncrement: true
                        }
                    );
                }
            };

            request.onsuccess =
                (event) => {

                this.db =
                    event.target.result;

                resolve();
            };

            request.onerror =
                () => {

                reject(
                    request.error
                );
            };
        });
    }

    setupEventListeners() {

        document
            .getElementById(
                "clientForm"
            )
            ?.addEventListener(
                "submit",
                (e) => {

                    e.preventDefault();

                    this.saveClient();
                }
            );

        document
            .getElementById(
                "openModalBtn"
            )
            ?.addEventListener(
                "click",
                () => {

                    this.resetForm();

                    openClientModal();
                }
            );

        document
            .getElementById(
                "searchInput"
            )
            ?.addEventListener(
                "input",
                () => {

                    this.filterClients();
                }
            );
    }

    async getTableRecords(tableName) {

        if (
            !this.db.objectStoreNames.contains(
                tableName
            )
        ) {
            return [];
        }

        return new Promise((resolve, reject) => {

            const tx =
                this.db.transaction(
                    [tableName],
                    "readonly"
                );

            const request =
                tx.objectStore(
                    tableName
                ).getAll();

            request.onsuccess =
                () =>
                    resolve(
                        request.result
                    );

            request.onerror =
                () =>
                    reject(
                        request.error
                    );
        });
    }

    async loadPackages() {

        this.packages =
            await this.getTableRecords(
                "Pachete"
            );

        const select =
            document.getElementById(
                "clientPackage"
            );

        if (!select) return;

        select.innerHTML = `
            <option value="">
                Selectează pachetul
            </option>
        `;

        this.packages.forEach(pkg => {

            select.innerHTML += `
                <option value="${pkg.id}">
                    ${pkg.name}
                </option>
            `;
        });
    }

    getPackageName(id) {

        const pkg =
            this.packages.find(
                p =>
                    Number(p.id) ===
                    Number(id)
            );

        return pkg
            ? pkg.name
            : "-";
    }

    async saveClient() {

        const id =
            document.getElementById(
                "clientId"
            ).value;

        const first_name =
            document.getElementById(
                "clientFirstName"
            ).value.trim();

        const last_name =
            document.getElementById(
                "clientLastName"
            ).value.trim();

        if (
            !first_name ||
            !last_name
        ) {

            alert(
                "Introduceți numele clientului."
            );

            return;
        }

        const data = {

            first_name,

            last_name,

            phone:
                document.getElementById(
                    "clientPhone"
                ).value.trim(),

            email:
                document.getElementById(
                    "clientEmail"
                ).value.trim(),

            birth_date:
                document.getElementById(
                    "clientBirthDate"
                ).value,

            weight:
                parseFloat(
                    document.getElementById(
                        "clientWeight"
                    ).value
                ) || null,

            height:
                parseInt(
                    document.getElementById(
                        "clientHeight"
                    ).value
                ) || null,

            activity_level:
                document.getElementById(
                    "clientActivityLevel"
                ).value,

            experience_level:
                document.getElementById(
                    "clientExperienceLevel"
                ).value,

            package_id:
                Number(
                    document.getElementById(
                        "clientPackage"
                    ).value
                ) || null,

            notes:
                document.getElementById(
                    "clientNotes"
                ).value.trim()
        };

        try {

            if (id) {

                data.id =
                    Number(id);

                await this.updateRecord(
                    data
                );

            } else {

                await this.addRecord(
                    data
                );
            }

            await this.loadClients();

            this.resetForm();

            closeClientModal();

        } catch (error) {

            console.error(error);
        }
    }

    addRecord(data) {

        return new Promise((resolve, reject) => {

            const tx =
                this.db.transaction(
                    [this.tableName],
                    "readwrite"
                );

            const request =
                tx.objectStore(
                    this.tableName
                ).add(data);

            request.onsuccess =
                () => resolve();

            request.onerror =
                () =>
                    reject(
                        request.error
                    );
        });
    }

    updateRecord(data) {

        return new Promise((resolve, reject) => {

            const tx =
                this.db.transaction(
                    [this.tableName],
                    "readwrite"
                );

            const request =
                tx.objectStore(
                    this.tableName
                ).put(data);

            request.onsuccess =
                () => resolve();

            request.onerror =
                () =>
                    reject(
                        request.error
                    );
        });
    }

    getRecord(id) {

        return new Promise((resolve, reject) => {

            const tx =
                this.db.transaction(
                    [this.tableName],
                    "readonly"
                );

            const request =
                tx.objectStore(
                    this.tableName
                ).get(id);

            request.onsuccess =
                () =>
                    resolve(
                        request.result
                    );

            request.onerror =
                () =>
                    reject(
                        request.error
                    );
        });
    }

    getAllRecords() {

        return new Promise((resolve, reject) => {

            const tx =
                this.db.transaction(
                    [this.tableName],
                    "readonly"
                );

            const request =
                tx.objectStore(
                    this.tableName
                ).getAll();

            request.onsuccess =
                () =>
                    resolve(
                        request.result
                    );

            request.onerror =
                () =>
                    reject(
                        request.error
                    );
        });
    }

    async loadClients() {

        const clients =
            await this.getAllRecords();

        this.renderCards(
            clients
        );
    }

    renderCards(clients) {

        const container =
            document.getElementById(
                "clientList"
            );

        if (!container) return;

        if (!clients.length) {

            container.innerHTML = `
                <div class="empty-message">
                    📭 Nu există clienți.
                </div>
            `;

            return;
        }

        clients.sort((a, b) =>
            `${a.last_name} ${a.first_name}`
            .localeCompare(
                `${b.last_name} ${b.first_name}`,
                "ro"
            )
        );

        container.innerHTML =
            clients.map(client => `

            <div
                class="client-card"
                data-name="${(
                    client.first_name +
                    ' ' +
                    client.last_name
                ).toLowerCase()}">

                <div class="client-card-header">

                    <div class="client-info">

                        <div class="client-name">
                            ${client.first_name}
                            ${client.last_name}
                        </div>

                        <div class="client-data">

                            ${client.phone
                                ? `
                                <div class="client-item">
                                    📞 ${client.phone}
                                </div>
                                `
                                : ""
                            }

                            ${client.email
                                ? `
                                <div class="client-item">
                                    📧 ${client.email}
                                </div>
                                `
                                : ""
                            }

                            ${client.package_id
                                ? `
                                <div class="client-package">
                                    💎 ${this.getPackageName(
                                        client.package_id
                                    )}
                                </div>
                                `
                                : ""
                            }

                            <div class="client-meta">

                                ${client.activity_level
                                    ? `
                                    <span class="client-badge">
                                        ⚡ ${client.activity_level}
                                    </span>
                                    `
                                    : ""
                                }

                                ${client.experience_level
                                    ? `
                                    <span class="client-badge">
                                        🏋️ ${client.experience_level}
                                    </span>
                                    `
                                    : ""
                                }

                            </div>

                        </div>

                    </div>

                    <div
                        class="client-card-actions">


                                                <button
                            type="button"
                             class="btn-profile-card"
                             data-id="${client.id}">
                           📋
                        </button>
                        <button
                            type="button"
                            class="btn-edit-card"
                            data-id="${client.id}">
                            ✏️
                        </button>

                        <button
                            type="button"
                            class="btn-delete-card"
                            data-id="${client.id}">
                            🗑️
                        </button>

                    </div>

                </div>

            </div>

            `).join("");

        container
            .querySelectorAll(
                ".btn-edit-card"
            )
            .forEach(btn => {

                btn.addEventListener(
                    "click",
                    () => {

                        this.editClient(
                            Number(
                                btn.dataset.id
                            )
                        );
                    }
                );
            });
container
    .querySelectorAll(
        ".btn-profile-card"
    )
    .forEach(btn => {

        btn.addEventListener(
            "click",
            () => {

                window.location.href =
                    "clients/Profile/ProfilClient.html?id=" +
                    btn.dataset.id;
            }
        );
    });
        container
            .querySelectorAll(
                ".btn-delete-card"
            )
            .forEach(btn => {

                btn.addEventListener(
                    "click",
                    () => {

                        this.deleteClient(
                            Number(
                                btn.dataset.id
                            )
                        );
                    }
                );
            });
    }

    async editClient(id) {

        const client =
            await this.getRecord(id);

        if (!client) return;

        document.getElementById(
            "clientId"
        ).value =
            client.id;

        document.getElementById(
            "clientFirstName"
        ).value =
            client.first_name || "";

        document.getElementById(
            "clientLastName"
        ).value =
            client.last_name || "";

        document.getElementById(
            "clientPhone"
        ).value =
            client.phone || "";

        document.getElementById(
            "clientEmail"
        ).value =
            client.email || "";

        document.getElementById(
            "clientBirthDate"
        ).value =
            client.birth_date || "";

        document.getElementById(
            "clientWeight"
        ).value =
            client.weight || "";

        document.getElementById(
            "clientHeight"
        ).value =
            client.height || "";

        document.getElementById(
            "clientActivityLevel"
        ).value =
            client.activity_level ||
            "moderat";

        document.getElementById(
            "clientExperienceLevel"
        ).value =
            client.experience_level ||
            "incepator";

        document.getElementById(
            "clientPackage"
        ).value =
            client.package_id || "";

        document.getElementById(
            "clientNotes"
        ).value =
            client.notes || "";

        document.getElementById(
            "formTitle"
        ).textContent =
            "Editare Client";

        document.getElementById(
            "saveBtn"
        ).textContent =
            "Actualizează";

        openClientModal();
    }

    async deleteClient(id) {

        const tx =
            this.db.transaction(
                [this.tableName],
                "readwrite"
            );

        const request =
            tx.objectStore(
                this.tableName
            )
            .delete(id);

        await new Promise(
            (resolve, reject) => {

                request.onsuccess =
                    () => resolve();

                request.onerror =
                    () => reject();
            }
        );

        await this.loadClients();
    }

    resetForm() {

        document
            .getElementById(
                "clientForm"
            )
            ?.reset();

        document
            .getElementById(
                "clientId"
            )
            .value = "";

        document
            .getElementById(
                "formTitle"
            )
            .textContent =
            "Adaugă Client";

        document
            .getElementById(
                "saveBtn"
            )
            .textContent =
            "Salvează";
    }

    filterClients() {

        const search =
            document
                .getElementById(
                    "searchInput"
                )
                .value
                .toLowerCase();

        this.getAllRecords()
            .then(records => {

                const filtered =
                    records.filter(
                        client => {

                            const text =
                                (
                                    client.first_name +
                                    " " +
                                    client.last_name
                                )
                                .toLowerCase();

                            return text.includes(
                                search
                            );
                        }
                    );

                this.renderCards(
                    filtered
                );
            });
    }
}

function openClientModal() {

    document.getElementById(
        "clientModal"
    ).style.display =
        "flex";
}

function closeClientModal() {

    document.getElementById(
        "clientModal"
    ).style.display =
        "none";
}

let manager;

window.addEventListener(
    "DOMContentLoaded",
    () => {

        manager =
            new ClientiManager();

        window.closeClientModal =
            closeClientModal;
    }
);