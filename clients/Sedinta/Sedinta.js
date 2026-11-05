// ============================================
// SEDINTA
// ============================================

class SedintaPage {

    constructor() {

        this.dbName = "carpevDB";

        this.sessionsTable = "Sedinte";
        this.exercisesTable = "Exercitii";

        this.db = null;

        this.clientId = null;
        this.packageId = null;
        this.sessionNumber = null;

        this.session = null;

        this.allExercises = [];
this.allWorkouts = [];
        this.init();
    }

    async init() {

        try {

            this.readUrlParams();

            await this.openDatabase();

            await this.ensureTables();

            await this.loadExercises();
await this.loadWorkouts();
            await this.loadSession();

            this.setupEventListeners();

            this.renderExerciseSelector();

        } catch (error) {

            console.error(error);
        }
    }

    readUrlParams() {

        const params =
            new URLSearchParams(
                window.location.search
            );

        this.clientId =
            Number(
                params.get("client")
            );

        this.packageId =
            Number(
                params.get("package")
            );

        this.sessionNumber =
            Number(
                params.get("session")
            );

        document.getElementById(
            "sessionTitle"
        ).textContent =
            `Ședința ${this.sessionNumber}`;
    }

    async openDatabase() {

        return new Promise(
            (resolve, reject) => {

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
                () =>
                    reject(
                        request.error
                    );
        });
    }

    async ensureTables() {

        if (
            this.db.objectStoreNames.contains(
                this.sessionsTable
            )
        ) {

            return;
        }

        this.db.close();

        return new Promise(
            (resolve, reject) => {

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
                        this.sessionsTable
                    )
                ) {

                    db.createObjectStore(
                        this.sessionsTable,
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
                () =>
                    reject(
                        request.error
                    );
        });
    }

    setupEventListeners() {

        document
            .getElementById(
                "openExerciseModalBtn"
            )
            ?.addEventListener(
                "click",
                () => {

                    openExerciseModal();
                }
            );

        document
            .getElementById(
                "exerciseSearch"
            )
            ?.addEventListener(
                "input",
                () => {

                    this.renderExerciseSelector();
                }
            );
document
    .getElementById(
        "openWorkoutModalBtn"
    )
    ?.addEventListener(
        "click",
        () => {

            openWorkoutModal();
        }
    );

document
    .getElementById(
        "importWorkoutBtn"
    )
    ?.addEventListener(
        "click",
        () => {

            this.importWorkout();
        }
    );
        document
            .getElementById(
                "filterCategory"
            )
            ?.addEventListener(
                "change",
                () => {

                    this.renderExerciseSelector();
                }
            );

        document
            .getElementById(
                "filterMuscle"
            )
            ?.addEventListener(
                "change",
                () => {

                    this.renderExerciseSelector();
                }
            );

        document
            .getElementById(
                "filterEquipment"
            )
            ?.addEventListener(
                "change",
                () => {

                    this.renderExerciseSelector();
                }
            );
    }

    async getAllRecords(tableName) {

        if (
            !this.db.objectStoreNames.contains(
                tableName
            )
        ) {

            return [];
        }

        return new Promise(
            (resolve, reject) => {

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

    async loadExercises() {

        this.allExercises =
            await this.getAllRecords(
                this.exercisesTable
            );

        const categories =
            await this.getAllRecords(
                "CategoriiExercitii"
            );

        const muscles =
            await this.getAllRecords(
                "GrupeMusculare"
            );

        const equipment =
            await this.getAllRecords(
                "Echipamente"
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
    }
    async importWorkout() {

    const workoutId =
        Number(
            document.getElementById(
                "workoutSelect"
            ).value
        );

    if (!workoutId) {

        alert(
            "Selectează un workout."
        );

        return;
    }

    const workout =
        this.allWorkouts.find(
            x =>
                Number(x.id)
                ===
                workoutId
        );

    if (!workout) {
        return;
    }

    (workout.exercise_ids || [])
        .forEach(
            exerciseId => {

                const exists =
                    this.session.exercises.find(
                        x =>
                            Number(
                                x.exercise_id
                            )
                            ===
                            Number(
                                exerciseId
                            )
                    );

                if (exists) {
                    return;
                }

                this.session.exercises.push({

                    exercise_id:
                        exerciseId,

                    planned: [
                        {
                            reps: "",
                            weight: ""
                        }
                    ],

                    executed: [
                        {
                            reps: "",
                            weight: ""
                        }
                    ],

                    trainer_notes: ""
                });
            }
        );

    await this.autoSave();

    this.renderExercises();

    closeWorkoutModal();
}
async loadWorkouts() {

    this.allWorkouts =
        await this.getAllRecords(
            "Workouts"
        );

    const select =
        document.getElementById(
            "workoutSelect"
        );

    if (!select) return;

    select.innerHTML = `
        <option value="">
            Selectează workout-ul
        </option>
    `;

    this.allWorkouts.forEach(
        workout => {

            select.innerHTML += `
                <option value="${workout.id}">
                    ${workout.name}
                </option>
            `;
        }
    );
}
    populateFilter(id, items) {

        const select =
            document.getElementById(
                id
            );

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

    async loadSession() {

        const sessions =
            await this.getAllRecords(
                this.sessionsTable
            );

        let session =
            sessions.find(
                x =>
                    Number(
                        x.client_id
                    ) ===
                    this.clientId &&
                    Number(
                        x.package_id
                    ) ===
                    this.packageId &&
                    Number(
                        x.session_number
                    ) ===
                    this.sessionNumber
            );

        if (!session) {

            session = {

                client_id:
                    this.clientId,

                package_id:
                    this.packageId,

                session_number:
                    this.sessionNumber,

                exercises: []
            };

            const tx =
                this.db.transaction(
                    [this.sessionsTable],
                    "readwrite"
                );

            const request =
                tx.objectStore(
                    this.sessionsTable
                )
                .add(session);

            await new Promise(
                (resolve, reject) => {

                request.onsuccess =
                    () => {

                    session.id =
                        request.result;

                    resolve();
                };

                request.onerror =
                    () => reject();
            });
        }

        this.session =
            session;
            this.session.exercises =
    (this.session.exercises || [])
    .map(exercise => {

        if (!exercise.planned) {

            exercise.planned =
                exercise.sets
                ? [...exercise.sets]
                : [
                    {
                        reps: "",
                        weight: ""
                    }
                ];
        }

        if (!exercise.executed) {

            exercise.executed =
                exercise.sets
                ? [...exercise.sets]
                : [
                    {
                        reps: "",
                        weight: ""
                    }
                ];
        }

        if (
            exercise.trainer_notes ===
            undefined
        ) {

            exercise.trainer_notes = "";
        }

        return exercise;
    });

        this.renderExercises();
    }

    async autoSave() {

        const tx =
            this.db.transaction(
                [this.sessionsTable],
                "readwrite"
            );

        const request =
            tx.objectStore(
                this.sessionsTable
            )
            .put(
                this.session
            );

        await new Promise(
            (resolve, reject) => {

            request.onsuccess =
                () => resolve();

            request.onerror =
                () => reject();
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
            document
                .getElementById(
                    "filterCategory"
                )
                ?.value || "";

        const muscle =
            document
                .getElementById(
                    "filterMuscle"
                )
                ?.value || "";

        const equipment =
            document
                .getElementById(
                    "filterEquipment"
                )
                ?.value || "";

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
            filtered.map(exercise => `

            <div class="selector-item">

                <div class="selector-info">

                    <div class="selector-name">
                        ${exercise.name}
                    </div>

                    <div class="selector-tags">

                        ${(exercise.categories || [])
                            .map(x => `
                                <span class="tag tag-category">
                                    ${x}
                                </span>
                            `).join("")}

                        ${(exercise.muscles || [])
                            .map(x => `
                                <span class="tag tag-muscle">
                                    ${x}
                                </span>
                            `).join("")}

                        ${(exercise.equipment || [])
                            .map(x => `
                                <span class="tag tag-equipment">
                                    ${x}
                                </span>
                            `).join("")}

                    </div>

                </div>

                <button
                    class="exercise-toggle-btn"
                    data-id="${exercise.id}">
                    + Adaugă
                </button>

            </div>

        `).join("");

        container
            .querySelectorAll(
                ".exercise-toggle-btn"
            )
            .forEach(btn => {

                btn.addEventListener(
                    "click",
                    () => {

                        this.addExercise(
                            Number(
                                btn.dataset.id
                            )
                        );
                    }
                );
            });
    }

async addExercise(exerciseId) {

    const exists =
        this.session.exercises.find(
            x =>
                Number(
                    x.exercise_id
                ) ===
                exerciseId
        );

    if (exists) return;

    this.session.exercises.push({

        exercise_id:
            exerciseId,

        planned: [
            {
                reps: "",
                weight: ""
            }
        ],

        executed: [
            {
                reps: "",
                weight: ""
            }
        ],

        trainer_notes: ""
    });

    await this.autoSave();

    this.renderExercises();

    closeExerciseModal();
}

renderExercises() {

    const container =
        document.getElementById(
            "exerciseList"
        );

    if (!container) return;

    if (
        !this.session.exercises.length
    ) {

        container.innerHTML = `
            <div class="empty-message">
                📭 Nu există exerciții în această ședință.
            </div>
        `;

        return;
    }

    container.innerHTML =
        this.session.exercises.map(
            (
                exerciseRecord,
                exerciseIndex
            ) => {

            const exercise =
                this.allExercises.find(
                    x =>
                        Number(x.id)
                        ===
                        Number(
                            exerciseRecord.exercise_id
                        )
                );

            return `

            <div class="exercise-card">

                <div class="exercise-card-header">

                    <div class="exercise-name">
                        ${exercise?.name || "-"}
                    </div>

                    <div class="exercise-card-actions">

                        <button
                            class="btn-delete-card remove-exercise-btn"
                            data-index="${exerciseIndex}">
                            🗑️
                        </button>

                    </div>

                </div>

                <div class="exercise-columns">

                    <!-- PLANNED -->

                    <div class="exercise-column">

                        <div class="column-title">
                            Planificat
                        </div>

                        <div class="sets-container">

                            ${(exerciseRecord.planned || [])
                                .map(
                                    (
                                        set,
                                        setIndex
                                    ) => `

                                <div class="set-row">

                                    <div class="set-index">
                                        ${setIndex + 1}
                                    </div>

                                    <input
                                        type="number"
                                        class="set-input planned-reps"
                                        data-exercise="${exerciseIndex}"
                                        data-set="${setIndex}"
                                        value="${set.reps}"
                                        placeholder="Rep">

                                    <input
                                        type="number"
                                        class="set-input planned-weight"
                                        data-exercise="${exerciseIndex}"
                                        data-set="${setIndex}"
                                        value="${set.weight}"
                                        placeholder="Kg">

                                    <button
                                        class="btn-delete-card remove-planned-set"
                                        data-exercise="${exerciseIndex}"
                                        data-set="${setIndex}">
                                        ✕
                                    </button>

                                </div>

                            `).join("")}

                            <button
                                class="btn-add-set add-planned-set"
                                data-exercise="${exerciseIndex}">
                                + Serie
                            </button>

                        </div>

                    </div>

                    <!-- EXECUTED -->

                    <div class="exercise-column">

                        <div class="column-title">
                            Executat
                        </div>

                        <div class="sets-container">

                            ${(exerciseRecord.executed || [])
                                .map(
                                    (
                                        set,
                                        setIndex
                                    ) => `

                                <div class="set-row">

                                    <div class="set-index">
                                        ${setIndex + 1}
                                    </div>

                                    <input
                                        type="number"
                                        class="set-input executed-reps"
                                        data-exercise="${exerciseIndex}"
                                        data-set="${setIndex}"
                                        value="${set.reps}"
                                        placeholder="Rep">

                                    <input
                                        type="number"
                                        class="set-input executed-weight"
                                        data-exercise="${exerciseIndex}"
                                        data-set="${setIndex}"
                                        value="${set.weight}"
                                        placeholder="Kg">

                                    <button
                                        class="btn-delete-card remove-executed-set"
                                        data-exercise="${exerciseIndex}"
                                        data-set="${setIndex}">
                                        ✕
                                    </button>

                                </div>

                            `).join("")}

                            <button
                                class="btn-add-set add-executed-set"
                                data-exercise="${exerciseIndex}">
                                + Serie
                            </button>

                        </div>

                    </div>

                </div>

                <div class="notes-section">

                    <label class="notes-title">
                        Notițe Antrenor
                    </label>

                    <textarea
                        class="notes-textarea"
                        data-exercise="${exerciseIndex}"
                    >${exerciseRecord.trainer_notes || ""}</textarea>

                </div>

            </div>

            `;
        })
        .join("");

    this.attachExerciseEvents();
}

attachExerciseEvents() {

    // =========================================
    // ADD PLANNED SET
    // =========================================

    document
        .querySelectorAll(
            ".add-planned-set"
        )
        .forEach(btn => {

            btn.addEventListener(
                "click",
                async () => {

                    const exerciseIndex =
                        Number(
                            btn.dataset.exercise
                        );

                    this.session
                        .exercises[
                            exerciseIndex
                        ]
                        .planned
                        .push({

                            reps: "",
                            weight: ""
                        });

                    await this.autoSave();

                    this.renderExercises();
                }
            );
        });

    // =========================================
    // ADD EXECUTED SET
    // =========================================

    document
        .querySelectorAll(
            ".add-executed-set"
        )
        .forEach(btn => {

            btn.addEventListener(
                "click",
                async () => {

                    const exerciseIndex =
                        Number(
                            btn.dataset.exercise
                        );

                    this.session
                        .exercises[
                            exerciseIndex
                        ]
                        .executed
                        .push({

                            reps: "",
                            weight: ""
                        });

                    await this.autoSave();

                    this.renderExercises();
                }
            );
        });

    // =========================================
    // REMOVE PLANNED SET
    // =========================================

    document
        .querySelectorAll(
            ".remove-planned-set"
        )
        .forEach(btn => {

            btn.addEventListener(
                "click",
                async () => {

                    const exerciseIndex =
                        Number(
                            btn.dataset.exercise
                        );

                    const setIndex =
                        Number(
                            btn.dataset.set
                        );

                    this.session
                        .exercises[
                            exerciseIndex
                        ]
                        .planned
                        .splice(
                            setIndex,
                            1
                        );

                    await this.autoSave();

                    this.renderExercises();
                }
            );
        });

    // =========================================
    // REMOVE EXECUTED SET
    // =========================================

    document
        .querySelectorAll(
            ".remove-executed-set"
        )
        .forEach(btn => {

            btn.addEventListener(
                "click",
                async () => {

                    const exerciseIndex =
                        Number(
                            btn.dataset.exercise
                        );

                    const setIndex =
                        Number(
                            btn.dataset.set
                        );

                    this.session
                        .exercises[
                            exerciseIndex
                        ]
                        .executed
                        .splice(
                            setIndex,
                            1
                        );

                    await this.autoSave();

                    this.renderExercises();
                }
            );
        });

    // =========================================
    // REMOVE EXERCISE
    // =========================================

    document
        .querySelectorAll(
            ".remove-exercise-btn"
        )
        .forEach(btn => {

            btn.addEventListener(
                "click",
                async () => {

                    const exerciseIndex =
                        Number(
                            btn.dataset.index
                        );

                    this.session
                        .exercises
                        .splice(
                            exerciseIndex,
                            1
                        );

                    await this.autoSave();

                    this.renderExercises();
                }
            );
        });

    // =========================================
    // PLANNED REPS
    // =========================================

    document
        .querySelectorAll(
            ".planned-reps"
        )
        .forEach(input => {

            input.addEventListener(
                "change",
                async () => {

                    const exerciseIndex =
                        Number(
                            input.dataset.exercise
                        );

                    const setIndex =
                        Number(
                            input.dataset.set
                        );

                    this.session
                        .exercises[
                            exerciseIndex
                        ]
                        .planned[
                            setIndex
                        ]
                        .reps =
                        Number(
                            input.value
                        ) || 0;

                    await this.autoSave();
                }
            );
        });

    // =========================================
    // PLANNED WEIGHT
    // =========================================

    document
        .querySelectorAll(
            ".planned-weight"
        )
        .forEach(input => {

            input.addEventListener(
                "change",
                async () => {

                    const exerciseIndex =
                        Number(
                            input.dataset.exercise
                        );

                    const setIndex =
                        Number(
                            input.dataset.set
                        );

                    this.session
                        .exercises[
                            exerciseIndex
                        ]
                        .planned[
                            setIndex
                        ]
                        .weight =
                        Number(
                            input.value
                        ) || 0;

                    await this.autoSave();
                }
            );
        });

    // =========================================
    // EXECUTED REPS
    // =========================================

    document
        .querySelectorAll(
            ".executed-reps"
        )
        .forEach(input => {

            input.addEventListener(
                "change",
                async () => {

                    const exerciseIndex =
                        Number(
                            input.dataset.exercise
                        );

                    const setIndex =
                        Number(
                            input.dataset.set
                        );

                    this.session
                        .exercises[
                            exerciseIndex
                        ]
                        .executed[
                            setIndex
                        ]
                        .reps =
                        Number(
                            input.value
                        ) || 0;

                    await this.autoSave();
                }
            );
        });

    // =========================================
    // EXECUTED WEIGHT
    // =========================================

    document
        .querySelectorAll(
            ".executed-weight"
        )
        .forEach(input => {

            input.addEventListener(
                "change",
                async () => {

                    const exerciseIndex =
                        Number(
                            input.dataset.exercise
                        );

                    const setIndex =
                        Number(
                            input.dataset.set
                        );

                    this.session
                        .exercises[
                            exerciseIndex
                        ]
                        .executed[
                            setIndex
                        ]
                        .weight =
                        Number(
                            input.value
                        ) || 0;

                    await this.autoSave();
                }
            );
        });

    // =========================================
    // TRAINER NOTES
    // =========================================

    document
        .querySelectorAll(
            ".notes-textarea"
        )
        .forEach(textarea => {

            textarea.addEventListener(
                "input",
                async () => {

                    const exerciseIndex =
                        Number(
                            textarea.dataset.exercise
                        );

                    this.session
                        .exercises[
                            exerciseIndex
                        ]
                        .trainer_notes =
                        textarea.value;

                    await this.autoSave();
                }
            );
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
let sessionPage;

window.addEventListener(
    "DOMContentLoaded",
    () => {

        sessionPage =
            new SedintaPage();

        window.closeExerciseModal =
            closeExerciseModal;
            window.closeWorkoutModal =
    closeWorkoutModal;
    }
);