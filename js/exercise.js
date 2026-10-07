/* ==================================================
   PAGE
================================================== */

function renderExercisesPage() {

    const adminContent =
        document.getElementById(
            "adminContent"
        );

    adminContent.innerHTML = `

        <div class="exercise-page">

            <div class="exercise-page-header">

                <h1 class="exercise-page-title">

                    Exerciții

                </h1>

            </div>
<div class="exercise-filters">

    <div class="exercise-search-row">

        <input
            id="exerciseSearchInput"
            class="exercise-search-input"
            type="text"
            placeholder="Caută exercițiu...">

        <button
            id="exerciseResetFiltersBtn"
            class="exercise-reset-btn">

            Reset filtre

        </button>

    </div>

    <div
        id="exerciseCategoriesFilters"
        class="exercise-filter-list">

    </div>

    <div
        id="exerciseEquipmentFilters"
        class="exercise-filter-list">

    </div>

    <div
        id="exerciseMusclesFilters"
        class="exercise-filter-list">

    </div>

</div>
            <div
                id="exerciseGrid"
                class="exercise-grid">

            </div>

        </div>

        <div
            id="exerciseModal"
            class="exercise-modal">

            <div class="exercise-modal-content">

                <div class="exercise-modal-header">

                    <h2>

                        Exercițiu Nou

                    </h2>

                    <button
                        id="exerciseCloseBtn"
                        class="exercise-close-btn">

                        ×

                    </button>

                </div>

                <div class="exercise-modal-body">

                    <input
                        id="exerciseNameInput"
                        class="exercise-input"
                        type="text"
                        placeholder="Nume exercițiu">

                    <select
                        id="exerciseEquipmentSelect"
                        class="exercise-select">

                    </select>

                    <h3 class="exercise-section-title">

                        Grupe Musculare

                    </h3>

                    <div
                        id="exerciseMuscleSelection"
                        class="exercise-selection-list">

                    </div>

                    <h3 class="exercise-section-title">

                        Categorii

                    </h3>

                    <div
                        id="exerciseCategorySelection"
                        class="exercise-selection-list">

                    </div>

                    <button
                        id="exerciseSaveBtn"
                        class="exercise-save-btn">

                        Salvează

                    </button>

                </div>

            </div>

        </div>

    `;

    renderExercises();

    loadExerciseOptions();
    renderExerciseFilters();


    document
    .getElementById(
        "exerciseSearchInput"
    )
    ?.addEventListener(
        "input",
        event => {

            exerciseSearch =
                event.target.value
                    .toLowerCase();

            renderExercises();

        }
    );
document
.getElementById(
"exerciseResetFiltersBtn"
)
?.addEventListener(
"click",
resetExerciseFilters
);
    document
        .getElementById(
            "exerciseCloseBtn"
        )
        ?.addEventListener(
            "click",
            closeExerciseModal
        );

    document
        .getElementById(
            "exerciseSaveBtn"
        )
        ?.addEventListener(
            "click",
            saveExercise
        );

}

/* ==================================================
   RENDER
================================================== */

function renderExercises() {

    const db =
        getDB();

    const grid =
        document.getElementById(
            "exerciseGrid"
        );

    if (!grid)
        return;

    const addCard = `

        <div
            id="exerciseAddCard"
            class="exercise-add-card">

            <div class="exercise-add-icon">

                +

            </div>

            <div class="exercise-add-text">

                Adaugă Exercițiu

            </div>

        </div>

    `;

    const exerciseCards =
        (getFilteredExercises())
            .map(exercise => {

                const equipment =
                    db.aparate.find(
                        item =>
                            item.id ===
                            exercise.aparatId
                    );

                const muscles =
                    (exercise.grupeMusculare || [])
                        .map(id => {

                            const muscle =
                                db.grupeMusculare.find(
                                    item =>
                                        item.id === id
                                );

                            return muscle
                                ? `
                                    <span class="exercise-tag">
                                        ${muscle.nume}
                                    </span>
                                `
                                : "";

                        })
                        .join("");

                const categories =
                    (exercise.categories || [])
                        .map(id => {

                            const category =
                                db.categories.find(
                                    item =>
                                        item.id === id
                                );

                            return category
                                ? `
                                    <span class="exercise-tag">
                                        ${category.nume}
                                    </span>
                                `
                                : "";

                        })
                        .join("");

                return `

                    <div class="exercise-card">

                        <div class="exercise-card-name">

                            ${exercise.nume}

                        </div>

                        <div>

                            <span class="exercise-tag">

                                ${equipment?.nume || "Liber"}

                            </span>

                        </div>

                        <div>

                            ${muscles}

                        </div>

                        <div>

                            ${categories}

                        </div>

                        <button
                            class="exercise-delete-btn"
                            onclick="deleteExercise(${exercise.id})">

                            Șterge

                        </button>

                    </div>

                `;

            })
            .join("");

    grid.innerHTML =
        addCard +
        exerciseCards;

    document
        .getElementById(
            "exerciseAddCard"
        )
        ?.addEventListener(
            "click",
            openExerciseModal
        );

}

/* ==================================================
   MODAL
================================================== */

function openExerciseModal() {

    document
        .getElementById(
            "exerciseModal"
        )
        ?.classList
        .add(
            "show"
        );

}

function closeExerciseModal() {

    document
        .getElementById(
            "exerciseModal"
        )
        ?.classList
        .remove(
            "show"
        );

}

/* ==================================================
   OPTIONS
================================================== */

function loadExerciseOptions() {

    const db =
        getDB();

    const equipmentSelect =
        document.getElementById(
            "exerciseEquipmentSelect"
        );

    equipmentSelect.innerHTML =

        '<option value="">Selectează aparat</option>' +

        db.aparate
            .map(item => `

                <option value="${item.id}">

                    ${item.nume}

                </option>

            `)
            .join("");

    document.getElementById(
        "exerciseMuscleSelection"
    ).innerHTML =

        db.grupeMusculare
            .map(item => `

                <button
                    type="button"
                    class="exercise-chip exercise-muscle-chip"
                    data-id="${item.id}">

                    ${item.nume}

                </button>

            `)
            .join("");

    document.getElementById(
        "exerciseCategorySelection"
    ).innerHTML =

        db.categories
            .map(item => `

                <button
                    type="button"
                    class="exercise-chip exercise-category-chip"
                    data-id="${item.id}">

                    ${item.nume}

                </button>

            `)
            .join("");

    document
        .querySelectorAll(
            ".exercise-chip"
        )
        .forEach(chip => {

            chip.addEventListener(
                "click",
                () => {

                    chip.classList.toggle(
                        "selected"
                    );

                }
            );

        });

}

/* ==================================================
   SAVE
================================================== */

function saveExercise() {

    const db =
        getDB();

    const nume =
        document
            .getElementById(
                "exerciseNameInput"
            )
            .value
            .trim();

    if (!nume)
        return;

    const aparatId =
        Number(
            document
                .getElementById(
                    "exerciseEquipmentSelect"
                )
                .value
        );

    const grupeMusculare =
        Array
            .from(
                document.querySelectorAll(
                    ".exercise-muscle-chip.selected"
                )
            )
            .map(
                item =>
                    Number(
                        item.dataset.id
                    )
            );

    const categories =
        Array
            .from(
                document.querySelectorAll(
                    ".exercise-category-chip.selected"
                )
            )
            .map(
                item =>
                    Number(
                        item.dataset.id
                    )
            );

    if (!db.exercitii)
        db.exercitii = [];

    db.exercitii.push({

        id:
            generateId(),

        nume,

        aparatId,

        grupeMusculare,

        categories

    });

    saveDB(db);
resetExerciseForm();
    closeExerciseModal();

    renderExercises();

}




/*** reset  */
function resetExerciseForm() {

    document.getElementById(
        "exerciseNameInput"
    ).value = "";

    document.getElementById(
        "exerciseEquipmentSelect"
    ).value = "";

    document
        .querySelectorAll(
            ".exercise-chip.selected"
        )
        .forEach(
            chip =>
                chip.classList.remove(
                    "selected"
                )
        );

}


/* ==================================================
   DELETE
================================================== */

function deleteExercise(id) {

    if (
        !confirm(
            "Ștergi exercițiul?"
        )
    ) {
        return;
    }

    const db =
        getDB();

    db.exercitii =
        (db.exercitii || [])
            .filter(
                exercise =>
                    exercise.id !== id
            );

    saveDB(db);

    renderExercises();

}