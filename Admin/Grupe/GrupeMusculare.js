// ============================================
// GESTIONARE GRUPE MUSCULARE
// ============================================

class GrupeMusculareManager {

    constructor() {

        this.dbName = "carpevDB";
        this.tableName = "GrupeMusculare";

        this.db = null;

        this.init();
    }

    async init() {

        try {

            await this.openDatabase();
            await this.ensureTableExists();

            this.setupEventListeners();

            await this.loadMuscles();

            console.log("✅ Grupe Musculare inițializat");

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
            .getElementById("muscleForm")
            ?.addEventListener(
                "submit",
                (e) => {

                    e.preventDefault();

                    this.saveMuscle();
                }
            );

        document
            .getElementById("searchInput")
            ?.addEventListener(
                "input",
                () => {

                    this.filterMuscles();
                }
            );

        document
            .getElementById("openModalBtn")
            ?.addEventListener(
                "click",
                () => {

                    this.resetForm();

                    openMuscleModal();
                }
            );
    }

    async saveMuscle() {

        const id =
            document.getElementById(
                "muscleId"
            ).value;

        const name =
            document.getElementById(
                "muscleName"
            ).value.trim();

        if (!name) {

            alert(
                "Introduceți numele grupei musculare."
            );

            return;
        }

        const data = {
            name
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

            await this.loadMuscles();

            this.resetForm();

            closeMuscleModal();

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

    async loadMuscles() {

        const records =
            await this.getAllRecords();

        this.renderCards(records);
    }

    renderCards(records) {

        const container =
            document.getElementById(
                "muscleList"
            );

        if (!container) return;

        if (records.length === 0) {

            container.innerHTML = `
                <div class="empty-message">
                    📭 Nu există grupe musculare.
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
                class="muscle-card"
                data-id="${record.id}"
                data-name="${record.name.toLowerCase()}">

                <div class="muscle-card-header">

                    <div class="muscle-info">

                        <div class="muscle-name">
                            ${record.name}
                        </div>

                    </div>

                    <div class="muscle-card-actions">

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

                        this.editMuscle(
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

                        this.deleteMuscle(
                            Number(
                                btn.dataset.id
                            )
                        );
                    }
                );
            });
    }

    async editMuscle(id) {

        const record =
            await this.getRecord(id);

        if (!record) return;

        document.getElementById(
            "muscleId"
        ).value =
            record.id;

        document.getElementById(
            "muscleName"
        ).value =
            record.name;

        document.getElementById(
            "formTitle"
        ).textContent =
            "Editare Grupă Musculară";

        document.getElementById(
            "saveBtn"
        ).textContent =
            "Actualizează";

        openMuscleModal();
    }

    async deleteMuscle(id) {

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

            await this.loadMuscles();

        } catch (error) {

            console.error(error);
        }
    }

    resetForm() {

        document
            .getElementById(
                "muscleForm"
            )
            .reset();

        document
            .getElementById(
                "muscleId"
            )
            .value = "";

        document
            .getElementById(
                "formTitle"
            )
            .textContent =
            "Adaugă Grupă Musculară";

        document
            .getElementById(
                "saveBtn"
            )
            .textContent =
            "Salvează";
    }

    filterMuscles() {

        const search =
            document
                .getElementById(
                    "searchInput"
                )
                .value
                .toLowerCase();

        const cards =
            document.querySelectorAll(
                ".muscle-card"
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

function openMuscleModal() {

    document.getElementById(
        "muscleModal"
    ).style.display =
        "flex";
}

function closeMuscleModal() {

    document.getElementById(
        "muscleModal"
    ).style.display =
        "none";
}

let manager;

window.addEventListener(
    "DOMContentLoaded",
    () => {

        manager =
            new GrupeMusculareManager();

        window.closeMuscleModal =
            closeMuscleModal;
    }
);