// ============================================
// GESTIONARE EXERCITII
// ============================================

class ExercitiiManager {

    constructor() {

        this.dbName = "carpevDB";
        this.tableName = "Exercitii";

        this.db = null;

        this.init();
    }

    async init() {

        try {

            await this.openDatabase();

            await this.ensureTableExists();

            await this.loadLookups();

            this.setupEventListeners();

            await this.loadExercises();

            console.log(
                "✅ Exercitii initializat"
            );

        } catch (error) {

            console.error(error);
        }
    }

    async openDatabase() {

        return new Promise((resolve, reject) => {

            const request =
                indexedDB.open(this.dbName);

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
            .getElementById("exerciseForm")
            ?.addEventListener(
                "submit",
                (e) => {

                    e.preventDefault();

                    this.saveExercise();
                }
            );

        document
            .getElementById("openModalBtn")
            ?.addEventListener(
                "click",
                () => {

                    this.resetForm();

                    openExerciseModal();
                }
            );

        document
            .getElementById("searchInput")
            ?.addEventListener(
                "input",
                () => {

                    this.filterExercises();
                }
            );

        document
            .getElementById("filterCategory")
            ?.addEventListener(
                "change",
                () => {

                    this.filterExercises();
                }
            );

        document
            .getElementById("filterMuscle")
            ?.addEventListener(
                "change",
                () => {

                    this.filterExercises();
                }
            );

        document
            .getElementById("filterEquipment")
            ?.addEventListener(
                "change",
                () => {

                    this.filterExercises();
                }
            );
    }

    async loadLookups() {

        await this.loadCategories();
        await this.loadMuscles();
        await this.loadEquipment();
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

            const store =
                tx.objectStore(tableName);

            const request =
                store.getAll();

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

    async loadCategories() {

        const categories =
            await this.getTableRecords(
                "CategoriiExercitii"
            );

        const filter =
            document.getElementById(
                "filterCategory"
            );

        const checklist =
            document.getElementById(
                "categoryChecklist"
            );

        if (filter) {

            filter.innerHTML =
                `
            <option value="">
                Toate Categoriile
            </option>
            `;

            categories.forEach(item => {

                filter.innerHTML += `
                <option value="${item.name}">
                    ${item.name}
                </option>
                `;
            });
        }

        if (checklist) {

            checklist.innerHTML =
                categories.map(item => `
                <div class="checkbox-item">
                    <input
                        type="checkbox"
                        class="category-check"
                        value="${item.name}"
                        id="cat_${item.id}">
                    <label for="cat_${item.id}">
                        ${item.name}
                    </label>
                </div>
                `
                ).join("");
        }
    }

    async loadMuscles() {

        const muscles =
            await this.getTableRecords(
                "GrupeMusculare"
            );

        const filter =
            document.getElementById(
                "filterMuscle"
            );

        const checklist =
            document.getElementById(
                "muscleChecklist"
            );

        if (filter) {

            filter.innerHTML =
                `
            <option value="">
                Toate Grupele Musculare
            </option>
            `;

            muscles.forEach(item => {

                filter.innerHTML += `
                <option value="${item.name}">
                    ${item.name}
                </option>
                `;
            });
        }

        if (checklist) {

            checklist.innerHTML =
                muscles.map(item => `
                <div class="checkbox-item">
                    <input
                        type="checkbox"
                        class="muscle-check"
                        value="${item.name}"
                        id="muscle_${item.id}">
                    <label for="muscle_${item.id}">
                        ${item.name}
                    </label>
                </div>
                `
                ).join("");
        }
    }

    async loadEquipment() {

        const equipment =
            await this.getTableRecords(
                "Echipamente"
            );

        const filter =
            document.getElementById(
                "filterEquipment"
            );

        const checklist =
            document.getElementById(
                "equipmentChecklist"
            );

        if (filter) {

            filter.innerHTML =
                `
            <option value="">
                Toate Echipamentele
            </option>
            `;

            equipment.forEach(item => {

                filter.innerHTML += `
                <option value="${item.name}">
                    ${item.name}
                </option>
                `;
            });
        }

        if (checklist) {

            checklist.innerHTML =
                equipment.map(item => `
                <div class="checkbox-item">
                    <input
                        type="checkbox"
                        class="equipment-check"
                        value="${item.name}"
                        id="equipment_${item.id}">
                    <label for="equipment_${item.id}">
                        ${item.name}
                    </label>
                </div>
                `
                ).join("");
        }
    }

    getSelectedValues(selector) {

        return [
            ...document.querySelectorAll(
                selector
            )
        ]
        .filter(x => x.checked)
        .map(x => x.value);
    }

    async saveExercise() {

        const id =
            document.getElementById(
                "exerciseId"
            ).value;

        const name =
            document
                .getElementById(
                    "exerciseName"
                )
                .value
                .trim();

        if (!name) {

            alert(
                "Introduceți numele exercițiului."
            );

            return;
        }

        const data = {

            name,

            categories:
                this.getSelectedValues(
                    ".category-check"
                ),

            muscles:
                this.getSelectedValues(
                    ".muscle-check"
                ),

            equipment:
                this.getSelectedValues(
                    ".equipment-check"
                )
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

            await this.loadExercises();

            this.resetForm();

            closeExerciseModal();

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

    async loadExercises() {

        const records =
            await this.getAllRecords();

        this.renderCards(records);
    }

    renderCards(records) {

        const container =
            document.getElementById(
                "exerciseList"
            );

        if (!container) return;

        if (!records.length) {

            container.innerHTML = `
            <div class="empty-message">
                📭 Nu există exerciții.
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
                class="exercise-card"
                data-name="${record.name.toLowerCase()}">

                <div
                    class="exercise-card-header">

                    <div
                        class="exercise-info">

                        <div
                            class="exercise-name">
                            ${record.name}
                        </div>

                        <div
                            class="exercise-tags">

                            ${record.categories
                                .map(x => `
                                <span class="exercise-tag">
                                    ${x}
                                </span>
                                `)
                                .join("")}

                            ${record.muscles
                                .map(x => `
                                <span class="exercise-tag">
                                    ${x}
                                </span>
                                `)
                                .join("")}

                            ${record.equipment
                                .map(x => `
                                <span class="exercise-tag">
                                    ${x}
                                </span>
                                `)
                                .join("")}

                        </div>

                    </div>

                    <div
                        class="exercise-card-actions">

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

                        this.editExercise(
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

                        this.deleteExercise(
                            Number(
                                btn.dataset.id
                            )
                        );
                    }
                );
            });
    }

    async editExercise(id) {

        const record =
            await this.getRecord(id);

        if (!record) return;

        this.resetForm();

        document.getElementById(
            "exerciseId"
        ).value =
            record.id;

        document.getElementById(
            "exerciseName"
        ).value =
            record.name;

        document
            .querySelectorAll(
                ".category-check"
            )
            .forEach(item => {

                item.checked =
                    record.categories
                    ?.includes(
                        item.value
                    );
            });

        document
            .querySelectorAll(
                ".muscle-check"
            )
            .forEach(item => {

                item.checked =
                    record.muscles
                    ?.includes(
                        item.value
                    );
            });

        document
            .querySelectorAll(
                ".equipment-check"
            )
            .forEach(item => {

                item.checked =
                    record.equipment
                    ?.includes(
                        item.value
                    );
            });

        document.getElementById(
            "formTitle"
        ).textContent =
            "Editare Exercițiu";

        document.getElementById(
            "saveBtn"
        ).textContent =
            "Actualizează";

        openExerciseModal();
    }

    async deleteExercise(id) {

        const tx =
            this.db.transaction(
                [this.tableName],
                "readwrite"
            );

        const request =
            tx.objectStore(
                this.tableName
            ).delete(id);

        await new Promise(
            (resolve, reject) => {

            request.onsuccess =
                () => resolve();

            request.onerror =
                () => reject();
        });

        await this.loadExercises();
    }

    resetForm() {

        document
            .getElementById(
                "exerciseForm"
            )
            .reset();

        document
            .querySelectorAll(
                ".category-check,.muscle-check,.equipment-check"
            )
            .forEach(
                x => x.checked = false
            );

        document
            .getElementById(
                "exerciseId"
            )
            .value = "";

        document
            .getElementById(
                "formTitle"
            )
            .textContent =
                "Adaugă Exercițiu";

        document
            .getElementById(
                "saveBtn"
            )
            .textContent =
                "Salvează";
    }

    filterExercises() {

        const search =
            document.getElementById(
                "searchInput"
            ).value.toLowerCase();

        const category =
            document.getElementById(
                "filterCategory"
            ).value;

        const muscle =
            document.getElementById(
                "filterMuscle"
            ).value;

        const equipment =
            document.getElementById(
                "filterEquipment"
            ).value;

        this.getAllRecords()
            .then(records => {

                records =
                    records.filter(r => {

                        let ok = true;

                        if (
                            search &&
                            !r.name
                                .toLowerCase()
                                .includes(
                                    search
                                )
                        ) {
                            ok = false;
                        }

                        if (
                            category &&
                            !r.categories
                                ?.includes(
                                    category
                                )
                        ) {
                            ok = false;
                        }

                        if (
                            muscle &&
                            !r.muscles
                                ?.includes(
                                    muscle
                                )
                        ) {
                            ok = false;
                        }

                        if (
                            equipment &&
                            !r.equipment
                                ?.includes(
                                    equipment
                                )
                        ) {
                            ok = false;
                        }

                        return ok;
                    });

                this.renderCards(records);
            });
    }
}

function openExerciseModal() {

    document.getElementById(
        "exerciseModal"
    ).style.display =
        "flex";
}

function closeExerciseModal() {

    document.getElementById(
        "exerciseModal"
    ).style.display =
        "none";
}

let manager;

window.addEventListener(
    "DOMContentLoaded",
    () => {

        manager =
            new ExercitiiManager();

        window.closeExerciseModal =
            closeExerciseModal;
    }
);