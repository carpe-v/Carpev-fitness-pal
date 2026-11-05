// ============================================
// GESTIONARE ECHIPAMENTE
// ============================================

class EchipamenteManager {

    constructor() {

        this.dbName = "carpevDB";
        this.tableName = "Echipamente";

        this.db = null;

        this.init();
    }

    async init() {

        try {

            await this.openDatabase();
            await this.ensureTableExists();

            this.setupEventListeners();

            await this.loadEquipment();

            console.log("✅ Echipamente inițializat");

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

                    store.createIndex(
                        "type_index",
                        "type",
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
            .getElementById("equipmentForm")
            ?.addEventListener(
                "submit",
                (e) => {

                    e.preventDefault();

                    this.saveEquipment();
                }
            );

        document
            .getElementById("searchInput")
            ?.addEventListener(
                "input",
                () => {

                    this.filterEquipment();
                }
            );

        document
            .getElementById("openModalBtn")
            ?.addEventListener(
                "click",
                () => {

                    this.resetForm();

                    openEquipmentModal();
                }
            );
    }

    async saveEquipment() {

        const id =
            document.getElementById(
                "equipmentId"
            ).value;

        const name =
            document.getElementById(
                "equipmentName"
            ).value.trim();

        const type =
            document.getElementById(
                "equipmentType"
            ).value;

        if (!name) {

            alert(
                "Introduceți numele echipamentului."
            );

            return;
        }

        if (!type) {

            alert(
                "Selectați tipul echipamentului."
            );

            return;
        }

        const data = {

            name,
            type
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

            await this.loadEquipment();

            this.resetForm();

            closeEquipmentModal();

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

    async loadEquipment() {

        const records =
            await this.getAllRecords();

        this.renderCards(records);
    }

    renderCards(records) {

        const container =
            document.getElementById(
                "equipmentList"
            );

        if (!container) return;

        if (records.length === 0) {

            container.innerHTML = `
                <div class="empty-message">
                    📭 Nu există echipamente.
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

        const typeLabels = {

            aparat: "Aparat",
            obiect: "Obiect",
            liber: "Liber"
        };

        container.innerHTML =
            records.map(record => `

            <div
                class="equipment-card"
                data-id="${record.id}"
                data-name="${record.name.toLowerCase()}">

                <div class="equipment-card-header">

                    <div class="equipment-info">

                        <div class="equipment-name">
                            ${record.name}
                        </div>

                        <div
                            class="equipment-type type-${record.type}">
                            ${typeLabels[record.type]}
                        </div>

                    </div>

                    <div class="equipment-card-actions">

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
            .querySelectorAll(
                ".btn-edit-card"
            )
            .forEach(btn => {

                btn.addEventListener(
                    "click",
                    () => {

                        this.editEquipment(
                            Number(
                                btn.dataset.id
                            )
                        );
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

                        this.deleteEquipment(
                            Number(
                                btn.dataset.id
                            )
                        );
                    }
                );
            });
    }

    async editEquipment(id) {

        const record =
            await this.getRecord(id);

        if (!record) return;

        document.getElementById(
            "equipmentId"
        ).value =
            record.id;

        document.getElementById(
            "equipmentName"
        ).value =
            record.name;

        document.getElementById(
            "equipmentType"
        ).value =
            record.type;

        document.getElementById(
            "formTitle"
        ).textContent =
            "Editare Echipament";

        document.getElementById(
            "saveBtn"
        ).textContent =
            "Actualizează";

        openEquipmentModal();
    }

    async deleteEquipment(id) {

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

            await this.loadEquipment();

        } catch (error) {

            console.error(error);
        }
    }

    resetForm() {

        document
            .getElementById(
                "equipmentForm"
            )
            .reset();

        document
            .getElementById(
                "equipmentId"
            )
            .value = "";

        document
            .getElementById(
                "formTitle"
            )
            .textContent =
            "Adaugă Echipament";

        document
            .getElementById(
                "saveBtn"
            )
            .textContent =
            "Salvează";
    }

    filterEquipment() {

        const search =
            document
                .getElementById(
                    "searchInput"
                )
                .value
                .toLowerCase();

        const cards =
            document.querySelectorAll(
                ".equipment-card"
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

function openEquipmentModal() {

    document.getElementById(
        "equipmentModal"
    ).style.display =
        "flex";
}

function closeEquipmentModal() {

    document.getElementById(
        "equipmentModal"
    ).style.display =
        "none";
}

let manager;

window.addEventListener(
    "DOMContentLoaded",
    () => {

        manager =
            new EchipamenteManager();

        window.closeEquipmentModal =
            closeEquipmentModal;
    }
);