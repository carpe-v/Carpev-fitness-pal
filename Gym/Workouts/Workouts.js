// ============================================
// GESTIONARE WORKOUTS
// ============================================

class WorkoutsManager {

    constructor() {

        this.dbName = "carpevDB";
        this.tableName = "Workouts";

        this.db = null;

        this.allExercises = [];
        this.selectedExercises = [];

        this.init();
    }

    async init() {

        try {

            await this.openDatabase();

            await this.ensureTableExists();

            await this.loadLookups();

            this.setupEventListeners();

            await this.loadWorkouts();

            console.log(
                "✅ Workouts inițializat"
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
            .getElementById("workoutForm")
            ?.addEventListener(
                "submit",
                (e) => {

                    e.preventDefault();

                    this.saveWorkout();
                }
            );

        document
            .getElementById("openModalBtn")
            ?.addEventListener(
                "click",
                () => {

                    this.resetForm();

                    openWorkoutModal();
                }
            );

        document
            .getElementById("searchInput")
            ?.addEventListener(
                "input",
                () => {

                    this.filterWorkouts();
                }
            );

        document
            .getElementById("filterCategory")
            ?.addEventListener(
                "change",
                () => {

                    this.filterWorkouts();
                }
            );

        document
            .getElementById("filterMuscle")
            ?.addEventListener(
                "change",
                () => {

                    this.filterWorkouts();
                }
            );

        document
            .getElementById("filterEquipment")
            ?.addEventListener(
                "change",
                () => {

                    this.filterWorkouts();
                }
            );

        document
            .getElementById("exerciseSearch")
            ?.addEventListener(
                "input",
                () => {

                    this.renderExerciseSelector();
                }
            );

        document
            .getElementById("exerciseFilterCategory")
            ?.addEventListener(
                "change",
                () => {

                    this.renderExerciseSelector();
                }
            );

        document
            .getElementById("exerciseFilterMuscle")
            ?.addEventListener(
                "change",
                () => {

                    this.renderExerciseSelector();
                }
            );

        document
            .getElementById("exerciseFilterEquipment")
            ?.addEventListener(
                "change",
                () => {

                    this.renderExerciseSelector();
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

    async loadLookups() {

        const categories =
            await this.getTableRecords(
                "CategoriiExercitii"
            );

        const muscles =
            await this.getTableRecords(
                "GrupeMusculare"
            );

        const equipment =
            await this.getTableRecords(
                "Echipamente"
            );

        this.allExercises =
            await this.getTableRecords(
                "Exercitii"
            );

        this.populateFilter(
            "filterCategory",
            categories
        );

        this.populateFilter(
            "filterMuscle",
            muscles
        );

        this.populateFilter(
            "filterEquipment",
            equipment
        );

        this.populateFilter(
            "exerciseFilterCategory",
            categories
        );

        this.populateFilter(
            "exerciseFilterMuscle",
            muscles
        );

        this.populateFilter(
            "exerciseFilterEquipment",
            equipment
        );

        this.renderExerciseSelector();
    }

    populateFilter(id, items) {

        const select =
            document.getElementById(id);

        if (!select) return;

        const firstOption =
            select.options[0]
            ?.outerHTML || "";

        select.innerHTML =
            firstOption;

        items.forEach(item => {

            select.innerHTML += `
                <option value="${item.name}">
                    ${item.name}
                </option>
            `;
        });
    }

renderExerciseSelector() {

    const container =
        document.getElementById(
            "exerciseSelector"
        );

    if (!container) return;

    const search =
        document
            .getElementById(
                "exerciseSearch"
            )
            ?.value
            .toLowerCase() || "";

    const category =
        document.getElementById(
            "exerciseFilterCategory"
        )?.value || "";

    const muscle =
        document.getElementById(
            "exerciseFilterMuscle"
        )?.value || "";

    const equipment =
        document.getElementById(
            "exerciseFilterEquipment"
        )?.value || "";

    const filtered =
        this.allExercises.filter(
            exercise => {

                let ok = true;

                if (
                    search &&
                    !exercise.name
                        .toLowerCase()
                        .includes(search)
                ) {
                    ok = false;
                }

                if (
                    category &&
                    !exercise.categories
                        ?.includes(category)
                ) {
                    ok = false;
                }

                if (
                    muscle &&
                    !exercise.muscles
                        ?.includes(muscle)
                ) {
                    ok = false;
                }

                if (
                    equipment &&
                    !exercise.equipment
                        ?.includes(
                            equipment
                        )
                ) {
                    ok = false;
                }

                return ok;
            });

    container.innerHTML =
       filtered.map(exercise => {

    const selected =
        this.selectedExercises
            .includes(
                exercise.id
            );

    return `

    <div class="exercise-checkbox-item">

        <div class="exercise-checkbox-info">

            <div class="exercise-checkbox-name">
                ${exercise.name}
            </div>

            <div class="exercise-checkbox-tags">

                ${(exercise.muscles || [])
                    .map(muscle => `
                        <span class="tag tag-muscle">
                            ${muscle}
                        </span>
                    `).join("")}

                ${(exercise.categories || [])
                    .map(category => `
                        <span class="tag tag-category">
                            ${category}
                        </span>
                    `).join("")}

                ${(exercise.equipment || [])
                    .map(item => `
                        <span class="tag tag-equipment">
                            ${item}
                        </span>
                    `).join("")}

            </div>

        </div>

        <button
            type="button"
            class="exercise-toggle-btn ${selected ? 'selected' : ''}"
            data-id="${exercise.id}">

            ${selected
                ? '✓ Adăugat'
                : '+ Adaugă'}

        </button>

    </div>

    `;
}).join("");

    container
        .querySelectorAll(
            ".exercise-toggle-btn"
        )
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => {

                    this.toggleExercise(
                        Number(
                            btn.dataset.id
                        )
                    );
                }
            );
        });

    this.updateSelectedCount();
}
 updateSelectedCount() {

    const el =
        document.getElementById(
            "selectedCount"
        );

    if (el) {

        el.textContent =
            `${this.selectedExercises.length} selectate`;
    }
}

toggleExercise(id) {

    id = Number(id);

    const exists =
        this.selectedExercises
            .includes(id);

    if (exists) {

        this.selectedExercises =
            this.selectedExercises
                .filter(x => x !== id);

    } else {

        this.selectedExercises
            .push(id);
    }

    this.updateSelectedCount();

    this.renderExerciseSelector();
}

    async saveWorkout() {

        const id =
            document.getElementById(
                "workoutId"
            ).value;

        const name =
            document
                .getElementById(
                    "workoutName"
                )
                .value
                .trim();

        if (!name) {

            alert(
                "Introduceți numele workout-ului."
            );

            return;
        }

        const data = {

            name,

            exercise_ids:
    [...this.selectedExercises]
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

            await this.loadWorkouts();

            this.resetForm();

            closeWorkoutModal();

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

    async loadWorkouts() {

        const workouts =
            await this.getAllRecords();

        this.renderCards(workouts);
    }

    renderCards(workouts) {

        const container =
            document.getElementById(
                "workoutList"
            );

        if (!container) return;

        if (!workouts.length) {

            container.innerHTML = `
                <div class="empty-message">
                    📭 Nu există workout-uri.
                </div>
            `;

            return;
        }

        container.innerHTML =
            workouts.map(workout => {

            const exercises =
                this.allExercises.filter(
                    exercise =>
                        workout.exercise_ids
                        ?.includes(
                            exercise.id
                        )
                );

            return `

            <div class="workout-card">

                <div class="workout-card-header">

                    <div class="workout-info">

                        <div class="workout-name">
                            ${workout.name}
                        </div>

                        <div class="workout-meta">

                            <span
                                class="workout-badge">
                                ${exercises.length}
                                exerciții
                            </span>

                        </div>

                        <div
                            class="workout-exercises">

                            ${exercises
                            .slice(0, 5)
                            .map(x => `
                                <span class="exercise-tag">
                                    ${x.name}
                                </span>
                            `).join("")}

                            ${exercises.length > 5
                                ? `
                                <span class="exercise-tag more">
                                    +${exercises.length - 5}
                                </span>
                                `
                                : ""}

                        </div>

                    </div>

                    <div
                        class="workout-card-actions">

                        <button
                            class="btn-edit-card"
                            data-id="${workout.id}">
                            ✏️
                        </button>

                        <button
                            class="btn-delete-card"
                            data-id="${workout.id}">
                            🗑️
                        </button>

                    </div>

                </div>

            </div>

            `;
        }).join("");

        container
            .querySelectorAll(
                ".btn-edit-card"
            )
            .forEach(btn => {

                btn.addEventListener(
                    "click",
                    () => {

                        this.editWorkout(
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

                        this.deleteWorkout(
                            Number(
                                btn.dataset.id
                            )
                        );
                    }
                );
            });
    }

async editWorkout(id) {

    const workout =
        await this.getRecord(id);

    if (!workout) return;

    this.resetForm();

    document.getElementById(
        "workoutId"
    ).value =
        workout.id;

    document.getElementById(
        "workoutName"
    ).value =
        workout.name;

    this.selectedExercises =
        [...(workout.exercise_ids || [])];

    document.getElementById(
        "formTitle"
    ).textContent =
        "Editare Workout";

    document.getElementById(
        "saveBtn"
    ).textContent =
        "Actualizează";

    this.updateSelectedCount();

    this.renderExerciseSelector();

    openWorkoutModal();
}

    async deleteWorkout(id) {

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

        await this.loadWorkouts();
    }

resetForm() {

    document
        .getElementById(
            "workoutForm"
        )
        .reset();

    this.selectedExercises = [];

    document
        .getElementById(
            "workoutId"
        )
        .value = "";

    document
        .getElementById(
            "formTitle"
        )
        .textContent =
        "Adaugă Workout";

    document
        .getElementById(
            "saveBtn"
        )
        .textContent =
        "Salvează";

    this.updateSelectedCount();

    this.renderExerciseSelector();
}

    filterWorkouts() {

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
                        workout =>
                            workout.name
                            .toLowerCase()
                            .includes(search)
                    );

                this.renderCards(
                    filtered
                );
            });
    }
}

function openWorkoutModal() {

    document.getElementById(
        "workoutModal"
    ).style.display =
        "flex";
}

function closeWorkoutModal() {

    document.getElementById(
        "workoutModal"
    ).style.display =
        "none";
}

let manager;

window.addEventListener(
    "DOMContentLoaded",
    () => {

        manager =
            new WorkoutsManager();

        window.closeWorkoutModal =
            closeWorkoutModal;
    }
);