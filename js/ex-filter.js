/* ==================================================
   FILTER STATE
================================================== */

let exerciseSearch = "";

let selectedCategories = {};

let selectedMuscles = {};

let selectedEquipment = {};

function getFilteredExercises() {

    const db =
        getDB();

    let exercises =
        db.exercitii || [];

    if (exerciseSearch) {

        exercises =
            exercises.filter(
                exercise =>
                    exercise.nume
                        .toLowerCase()
                        .includes(
                            exerciseSearch
                        )
            );

    }

    const includeCategories =
        Object.keys(
            selectedCategories
        )
        .filter(
            id =>
                selectedCategories[id] ===
                "include"
        )
        .map(Number);

    const excludeCategories =
        Object.keys(
            selectedCategories
        )
        .filter(
            id =>
                selectedCategories[id] ===
                "exclude"
        )
        .map(Number);

    const includeMuscles =
        Object.keys(
            selectedMuscles
        )
        .filter(
            id =>
                selectedMuscles[id] ===
                "include"
        )
        .map(Number);

    const excludeMuscles =
        Object.keys(
            selectedMuscles
        )
        .filter(
            id =>
                selectedMuscles[id] ===
                "exclude"
        )
        .map(Number);

    const includeEquipment =
        Object.keys(
            selectedEquipment
        )
        .filter(
            id =>
                selectedEquipment[id] ===
                "include"
        )
        .map(Number);

    const excludeEquipment =
        Object.keys(
            selectedEquipment
        )
        .filter(
            id =>
                selectedEquipment[id] ===
                "exclude"
        )
        .map(Number);

    exercises =
        exercises.filter(
            exercise => {

                /* APARATE */

                if (
                    includeEquipment.length &&
                    !includeEquipment.includes(
                        exercise.aparatId
                    )
                ) {

                    return false;

                }

                if (
                    excludeEquipment.includes(
                        exercise.aparatId
                    )
                ) {

                    return false;

                }

                /* GRUPE MUSCULARE */

                const exerciseMuscles =
                    exercise.grupeMusculare || [];

                const hasAllIncludedMuscles =
                    includeMuscles.every(
                        id =>
                            exerciseMuscles.includes(
                                id
                            )
                    );

                if (
                    !hasAllIncludedMuscles
                ) {

                    return false;

                }

                const hasExcludedMuscle =
                    excludeMuscles.some(
                        id =>
                            exerciseMuscles.includes(
                                id
                            )
                    );

                if (
                    hasExcludedMuscle
                ) {

                    return false;

                }

                /* CATEGORII */

                const exerciseCategories =
                    exercise.categories || [];

                const hasAllIncludedCategories =
                    includeCategories.every(
                        id =>
                            exerciseCategories.includes(
                                id
                            )
                    );

                if (
                    !hasAllIncludedCategories
                ) {

                    return false;

                }

                const hasExcludedCategory =
                    excludeCategories.some(
                        id =>
                            exerciseCategories.includes(
                                id
                            )
                    );

                if (
                    hasExcludedCategory
                ) {

                    return false;

                }

                return true;

            }
        );

    return exercises;

}

function renderExerciseFilters() {

    const db =
        getDB();

    document.getElementById(
        "exerciseCategoriesFilters"
    ).innerHTML =

        db.categories
            .map(
                item => `

                    <button
                        class="exercise-filter-chip"
                        data-type="category"
                        data-id="${item.id}">

                        ${item.nume}

                    </button>

                `
            )
            .join("");

    document.getElementById(
        "exerciseEquipmentFilters"
    ).innerHTML =

        db.aparate
            .map(
                item => `

                    <button
                        class="exercise-filter-chip"
                        data-type="equipment"
                        data-id="${item.id}">

                        ${item.nume}

                    </button>

                `
            )
            .join("");

    document.getElementById(
        "exerciseMusclesFilters"
    ).innerHTML =

        db.grupeMusculare
            .map(
                item => `

                    <button
                        class="exercise-filter-chip"
                        data-type="muscle"
                        data-id="${item.id}">

                        ${item.nume}

                    </button>

                `
            )
            .join("");

    bindFilterEvents();

}
function bindFilterEvents() {

    document
        .querySelectorAll(
            ".exercise-filter-chip"
        )
        .forEach(
            chip => {

                chip.addEventListener(
                    "click",
                    () => {

                        cycleFilterState(
                            chip
                        );

                        renderExercises();

                    }
                );

            }
        );

}

function cycleFilterState(
    chip
) {

    const type =
        chip.dataset.type;

    const id =
        Number(
            chip.dataset.id
        );

    let state = "none";

    if (
        chip.classList.contains(
            "include"
        )
    ) {

        chip.classList.remove(
            "include"
        );

        chip.classList.add(
            "exclude"
        );

        state = "exclude";

    }
    else if (
        chip.classList.contains(
            "exclude"
        )
    ) {

        chip.classList.remove(
            "exclude"
        );

        state = "none";

    }
    else {

        chip.classList.add(
            "include"
        );

        state = "include";

    }

    saveFilterState(
        type,
        id,
        state
    );

}


function saveFilterState(
    type,
    id,
    state
) {

    let target;

    if (
        type === "category"
    ) {

        target =
            selectedCategories;

    }
    else if (
        type === "equipment"
    ) {

        target =
            selectedEquipment;

    }
    else {

        target =
            selectedMuscles;

    }

    if (
        state === "none"
    ) {

        delete target[id];

    }
    else {

        target[id] = state;

    }

}
function toggleExerciseFilter(
    type,
    id,
    selected
) {

    let target;

    if (type === "category") {

        target =
            selectedCategories;

    }
    else if (type === "equipment") {

        target =
            selectedEquipment;

    }
    else {

        target =
            selectedMuscles;

    }

    if (selected) {

        if (!target.includes(id)) {

            target.push(id);

        }

    }
    else {

        const index =
            target.indexOf(id);

        if (index !== -1) {

            target.splice(
                index,
                1
            );

        }

    }

}
function resetExerciseFilters() {

    exerciseSearch = "";

    selectedCategories = [];

    selectedMuscles = [];

    selectedEquipment = [];

    renderExercisesPage();

}