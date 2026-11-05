// ============================================
// GESTIONARE CATEGORII EXERCIȚII
// ============================================

class CategoriiExercitiiManager {

    constructor() {
        this.dbName = "carpevDB";
        this.tableName = "CategoriiExercitii";
        this.db = null;

        this.init();
    }

    async init() {

        try {

            await this.openDatabase();
            await this.ensureTableExists();

            this.setupEventListeners();

            await this.loadCategories();

            console.log("✅ Categorii Exerciții inițializat");

        } catch (error) {

            console.error(error);
        }
    }

    async openDatabase() {

        return new Promise((resolve, reject) => {

            const request = indexedDB.open(this.dbName);

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

        if (this.db.objectStoreNames.contains(this.tableName)) {
            return;
        }

        this.db.close();

        return new Promise((resolve, reject) => {

            const request = indexedDB.open(
                this.dbName,
                this.db.version + 1
            );

            request.onupgradeneeded = (event) => {

                const db = event.target.result;

                if (!db.objectStoreNames.contains(this.tableName)) {

                    const store = db.createObjectStore(
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

                this.db = event.target.result;
                resolve();
            };

            request.onerror = () => {

                reject(request.error);
            };
        });
    }

    setupEventListeners() {

        const form =
            document.getElementById("categoryForm");

        if (form) {

            form.addEventListener(
                "submit",
                (e) => {

                    e.preventDefault();

                    this.saveCategory();
                }
            );
        }

        document
            .getElementById("searchInput")
            ?.addEventListener(
                "input",
                () => this.filterCategories()
            );

        document
            .getElementById("openModalBtn")
            ?.addEventListener(
                "click",
                () => {

                    this.resetForm();

                    openCategoryModal();
                }
            );
    }

    async saveCategory() {

        const id =
            document.getElementById(
                "categoryId"
            ).value;

        const name =
            document.getElementById(
                "categoryName"
            ).value.trim();

        if (!name) {

            alert(
                "Introduceți numele categoriei."
            );

            return;
        }

        const data = {
            name
        };

        try {

            if (id) {

                data.id = Number(id);

                await this.updateRecord(data);

            } else {

                await this.addRecord(data);
            }

            await this.loadCategories();

            this.resetForm();

            closeCategoryModal();

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
                tx.objectStore(this.tableName);

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
                tx.objectStore(this.tableName);

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
                tx.objectStore(this.tableName);

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
                tx.objectStore(this.tableName);

            const request =
                store.get(id);

            request.onsuccess =
                () => resolve(request.result);

            request.onerror =
                () => reject(request.error);
        });
    }

    async loadCategories() {

        const records =
            await this.getAllRecords();

        this.renderCards(records);
    }

    renderCards(records) {

        const container =
            document.getElementById(
                "categoryList"
            );

        if (!container) return;

        if (records.length === 0) {

            container.innerHTML = `
                <div class="empty-message">
                    📭 Nu există categorii.
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
                class="category-card"
                data-id="${record.id}"
                data-name="${record.name.toLowerCase()}">

                <div class="category-card-header">

                    <div class="category-name">
                        ${record.name}
                    </div>

                    <div class="category-card-actions">

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

                        this.editCategory(
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

                        this.deleteCategory(
                            Number(
                                btn.dataset.id
                            )
                        );
                    }
                );
            });
    }

    async editCategory(id) {

        const category =
            await this.getRecord(id);

        if (!category) return;

        document.getElementById(
            "categoryId"
        ).value =
            category.id;

        document.getElementById(
            "categoryName"
        ).value =
            category.name;

        document.getElementById(
            "formTitle"
        ).textContent =
            "Editare Categorie";

        document.getElementById(
            "saveBtn"
        ).textContent =
            "Actualizează";

        openCategoryModal();
    }

    async deleteCategory(id) {

        try {

            const tx =
                this.db.transaction(
                    [this.tableName],
                    "readwrite"
                );

            const store =
                tx.objectStore(this.tableName);

            const request =
                store.delete(id);

            await new Promise(
                (resolve, reject) => {

                request.onsuccess =
                    () => resolve();

                request.onerror =
                    () => reject();
            });

            await this.loadCategories();

        } catch (error) {

            console.error(error);
        }
    }

    resetForm() {

        document
            .getElementById(
                "categoryForm"
            )
            .reset();

        document
            .getElementById(
                "categoryId"
            )
            .value = "";

        document
            .getElementById(
                "formTitle"
            )
            .textContent =
            "Adaugă Categorie";

        document
            .getElementById(
                "saveBtn"
            )
            .textContent =
            "Salvează";
    }

    filterCategories() {

        const search =
            document
                .getElementById(
                    "searchInput"
                )
                .value
                .toLowerCase();

        const cards =
            document.querySelectorAll(
                ".category-card"
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

function openCategoryModal() {

    document.getElementById(
        "categoryModal"
    ).style.display = "flex";
}

function closeCategoryModal() {

    document.getElementById(
        "categoryModal"
    ).style.display = "none";
}

let manager;

window.addEventListener(
    "DOMContentLoaded",
    () => {

        manager =
            new CategoriiExercitiiManager();

        window.closeCategoryModal =
            closeCategoryModal;
    }
);