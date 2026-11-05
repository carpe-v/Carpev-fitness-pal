// ============================================
// GESTIONARE PACHETE
// ============================================

class PacheteManager {

    constructor() {

        this.dbName = "carpevDB";
        this.tableName = "Pachete";

        this.db = null;

        this.init();
    }

    async init() {

        try {

            await this.openDatabase();
            await this.ensureTableExists();

            this.setupEventListeners();

            await this.loadPackages();

            console.log("✅ Pachete inițializat");

        } catch (error) {

            console.error(error);
        }
    }

    async openDatabase() {

        return new Promise((resolve, reject) => {

            const request =
                indexedDB.open(this.dbName);

            request.onsuccess = (event) => {

                this.db = event.target.result;

                resolve();
            };

            request.onerror = () => {

                reject(request.error);
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

                    const store =
                        db.createObjectStore(
                            this.tableName,
                            {
                                keyPath: "id",
                                autoIncrement: true
                            }
                        );

                    store.createIndex(
                        "name_index",
                        "name",
                        {
                            unique: false
                        }
                    );
                }
            };

            request.onsuccess = (event) => {

                this.db =
                    event.target.result;

                resolve();
            };

            request.onerror = () => {

                reject(request.error);
            };
        });
    }

    setupEventListeners() {

        document
            .getElementById("packageForm")
            ?.addEventListener(
                "submit",
                (e) => {

                    e.preventDefault();

                    this.savePackage();
                }
            );

        document
            .getElementById("searchInput")
            ?.addEventListener(
                "input",
                () => {

                    this.filterPackages();
                }
            );

        document
            .getElementById("openModalBtn")
            ?.addEventListener(
                "click",
                () => {

                    this.resetForm();

                    openPackageModal();
                }
            );
    }

    async savePackage() {

        const id =
            document.getElementById(
                "packageId"
            ).value;

        const name =
            document.getElementById(
                "packageName"
            ).value.trim();

        const sessions =
            parseInt(
                document.getElementById(
                    "packageSessions"
                ).value
            );

        const price =
            parseFloat(
                document.getElementById(
                    "packagePrice"
                ).value
            );

        const demo =
            document.getElementById(
                "packageDemo"
            ).checked;

        if (!name) {
            alert("Introduceți numele pachetului.");
            return;
        }

        const data = {

            name,
            sessions,
            price,
            demo
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

            await this.loadPackages();

            this.resetForm();

            closePackageModal();

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

            const store =
                tx.objectStore(
                    this.tableName
                );

            const request =
                store.add(data);

            request.onsuccess =
                () => resolve();

            request.onerror =
                () => reject(request.error);
        });
    }

    updateRecord(data) {

        return new Promise((resolve, reject) => {

            const tx =
                this.db.transaction(
                    [this.tableName],
                    "readwrite"
                );

            const store =
                tx.objectStore(
                    this.tableName
                );

            const request =
                store.put(data);

            request.onsuccess =
                () => resolve();

            request.onerror =
                () => reject(request.error);
        });
    }

    getAllRecords() {

        return new Promise((resolve, reject) => {

            const tx =
                this.db.transaction(
                    [this.tableName],
                    "readonly"
                );

            const store =
                tx.objectStore(
                    this.tableName
                );

            const request =
                store.getAll();

            request.onsuccess =
                () => resolve(request.result);

            request.onerror =
                () => reject(request.error);
        });
    }

    getRecord(id) {

        return new Promise((resolve, reject) => {

            const tx =
                this.db.transaction(
                    [this.tableName],
                    "readonly"
                );

            const store =
                tx.objectStore(
                    this.tableName
                );

            const request =
                store.get(id);

            request.onsuccess =
                () => resolve(request.result);

            request.onerror =
                () => reject(request.error);
        });
    }

    async loadPackages() {

        const records =
            await this.getAllRecords();

        this.renderCards(records);
    }

renderCards(records) {

    const container =
        document.getElementById(
            "packageList"
        );

    if (!container) return;

    if (records.length === 0) {

        container.innerHTML = `
            <div class="empty-message">
                📭 Nu există pachete.
            </div>
        `;

        return;
    }

    records.sort((a, b) =>
        a.name.localeCompare(
            b.name,
            "ro"
        )
    );

    container.innerHTML =
        records.map(record => `

        <div
            class="package-card"
            data-id="${record.id}"
            data-name="${record.name.toLowerCase()}">

            <div class="package-card-header">

                <div class="package-info">

                    <div class="package-name">
                        ${record.name}
                    </div>

                    <div class="package-details">

                        <span class="package-badge">
                            ${record.sessions} ședințe
                        </span>

                        <span class="package-badge">
                            ${Number(record.price).toFixed(0)} RON
                        </span>

                        ${record.demo ? `
                            <span class="package-demo">
                                🎁 Include demo
                            </span>
                        ` : ""}

                    </div>

                </div>

                <div class="package-card-actions">

                    <button
                        type="button"
                        class="btn-edit-card"
                        data-id="${record.id}">
                        ✏️
                    </button>

                    <button
                        type="button"
                        class="btn-delete-card"
                        data-id="${record.id}">
                        🗑️
                    </button>

                </div>

            </div>

        </div>

        `).join("");

    container
        .querySelectorAll(".btn-edit-card")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => {

                    this.editPackage(
                        Number(
                            btn.dataset.id
                        )
                    );
                }
            );

        });

    container
        .querySelectorAll(".btn-delete-card")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => {

                    this.deletePackage(
                        Number(
                            btn.dataset.id
                        )
                    );
                }
            );

        });
}

    async editPackage(id) {

        const record =
            await this.getRecord(id);

        if (!record) return;

        document.getElementById(
            "packageId"
        ).value =
            record.id;

        document.getElementById(
            "packageName"
        ).value =
            record.name;

        document.getElementById(
            "packageSessions"
        ).value =
            record.sessions;

        document.getElementById(
            "packagePrice"
        ).value =
            record.price;

        document.getElementById(
            "packageDemo"
        ).checked =
            record.demo;

        document.getElementById(
            "formTitle"
        ).textContent =
            "Editare Pachet";

        document.getElementById(
            "saveBtn"
        ).textContent =
            "Actualizează";

        openPackageModal();
    }

    async deletePackage(id) {

        try {

            const tx =
                this.db.transaction(
                    [this.tableName],
                    "readwrite"
                );

            const store =
                tx.objectStore(
                    this.tableName
                );

            const request =
                store.delete(id);

            await new Promise(
                (resolve, reject) => {

                    request.onsuccess =
                        () => resolve();

                    request.onerror =
                        () => reject();
                }
            );

            await this.loadPackages();

        } catch (error) {

            console.error(error);
        }
    }

    resetForm() {

        document
            .getElementById(
                "packageForm"
            )
            .reset();

        document
            .getElementById(
                "packageId"
            )
            .value = "";

        document
            .getElementById(
                "formTitle"
            )
            .textContent =
            "Adaugă Pachet";

        document
            .getElementById(
                "saveBtn"
            )
            .textContent =
            "Salvează";
    }

    filterPackages() {

        const search =
            document
                .getElementById(
                    "searchInput"
                )
                .value
                .toLowerCase();

        const cards =
            document.querySelectorAll(
                ".package-card"
            );

        cards.forEach(card => {

            const name =
                card.dataset.name;

            card.style.display =
                name.includes(search)
                    ? ""
                    : "none";
        });
    }
}

function openPackageModal() {

    document.getElementById(
        "packageModal"
    ).style.display = "flex";
}

function closePackageModal() {

    document.getElementById(
        "packageModal"
    ).style.display = "none";
}

let manager;

window.addEventListener(
    "DOMContentLoaded",
    () => {

        manager =
            new PacheteManager();

        window.closePackageModal =
            closePackageModal;
    }
);