/* ==================================================
   STATE
================================================== */

let currentTemplateId = null;
let templateSearch = "";

let templateCategories = [];

let templateMuscles = [];

let templateEquipment = [];

/* ==================================================
   PAGE
================================================== */
function renderTemplatesPage() {

    const adminContent =
        document.getElementById(
            "adminContent"
        );

    adminContent.innerHTML = `

        <div class="template-page">

            <div class="template-page-header">

                <h1 class="template-page-title">

                    Template-uri

                </h1>

            </div>

            <div
                id="templateGrid"
                class="template-grid">

            </div>

        </div>

        <div
            id="templateModal"
            class="template-modal">

            <div class="template-modal-content">

                <div class="template-modal-header">

                    <h2>

                        Template

                    </h2>

                    <button
                        id="closeTemplateBtn"
                        class="template-close-btn">

                        ×

                    </button>

                </div>

                <div class="template-modal-body">

                    <input
                        id="templateNameInput"
                        class="template-input"
                        type="text"
                        placeholder="Nume template">

                    <h3>

                        Exerciții

                    </h3>

                    <input
                        id="templateExerciseSearch"
                        class="template-input"
                        type="text"
                        placeholder="Caută exercițiu...">

                    <div
                        id="templateCategoriesFilters"
                        class="exercise-filter-list">

                    </div>

                    <div
                        id="templateEquipmentFilters"
                        class="exercise-filter-list">

                    </div>

                    <div
                        id="templateMusclesFilters"
                        class="exercise-filter-list">

                    </div>

                    <div
                        id="templateExerciseSelection"
                        class="template-selection-list">

                    </div>

                    <button
                        id="saveTemplateBtn"
                        class="template-save-btn">

                        Salvează

                    </button>

                </div>

            </div>

        </div>

    `;

    renderTemplates();

    renderTemplateFilters();

    loadTemplateExercises();

    document
        .getElementById(
            "templateExerciseSearch"
        )
        ?.addEventListener(
            "input",
            event => {

                templateSearch =
                    event.target.value
                        .toLowerCase();

                loadTemplateExercises();

            }
        );

    document
        .getElementById(
            "closeTemplateBtn"
        )
        ?.addEventListener(
            "click",
            closeTemplateModal
        );

    document
        .getElementById(
            "saveTemplateBtn"
        )
        ?.addEventListener(
            "click",
            saveTemplate
        );

}

/* ==================================================
   RENDER
================================================== */

function renderTemplates() {

    const db =
        getDB();

    const grid =
        document.getElementById(
            "templateGrid"
        );

    if (!grid)
        return;

    const addCard = `

        <div
            id="templateAddCard"
            class="template-add-card">

            <div class="template-add-icon">

                +

            </div>

            <div>

                Adaugă Template

            </div>

        </div>

    `;

    const templateCards =
        (db.templateuri || [])
            .map(
                template => {

                    const previewExercises =
                        (template.exercitii || [])
                            .slice(
                                0,
                                4
                            );

                    const remainingExercises =
                        (template.exercitii || [])
                            .length -
                        previewExercises.length;

                    const exercisesPreview =

                        previewExercises
                            .map(
                                exerciseId => {

                                    const exercise =
                                        (db.exercitii || [])
                                            .find(
                                                item =>
                                                    item.id ===
                                                    exerciseId
                                            );

                                    if (!exercise)
                                        return "";

                                    return `

                                        <div
                                            class="template-preview-item">

                                            ${exercise.nume}

                                        </div>

                                    `;

                                }
                            )
                            .join("") +

                        (
                            remainingExercises > 0

                                ? `

                                    <div
                                        class="template-preview-more">

                                        +${remainingExercises}
                                        exerciții

                                    </div>

                                `

                                : ""
                        );

                    return `

                        <div class="template-card">

                            <div class="template-card-name">

                                ${template.nume}

                            </div>

                            <div class="template-count">

                                ${(template.exercitii || []).length}
                                exerciții

                            </div>

                            ${exercisesPreview}

                            <button
                                class="template-edit-btn"
                                onclick="openTemplateModal(${template.id})">

                                Editează

                            </button>

                            <button
                                class="template-delete-btn"
                                onclick="deleteTemplate(${template.id})">

                                Șterge

                            </button>

                        </div>

                    `;

                }
            )
            .join("");

    grid.innerHTML =
        addCard +
        templateCards;

    document
        .getElementById(
            "templateAddCard"
        )
        ?.addEventListener(
            "click",
            () => {

                openTemplateModal();

            }
        );

}

/* ==================================================
   MODAL
================================================== */

function openTemplateModal(
    templateId = null
) {

    currentTemplateId =
        templateId;

    resetTemplateForm();

    loadTemplateExercises();

    if (
        templateId
    ) {

        loadTemplateForEdit(
            templateId
        );

    }

    document
        .getElementById(
            "templateModal"
        )
        ?.classList
        .add(
            "show"
        );

}

function closeTemplateModal() {

    currentTemplateId =
        null;

    resetTemplateForm();

    document
        .getElementById(
            "templateModal"
        )
        ?.classList
        .remove(
            "show"
        );

}

/* ==================================================
   LOAD EXERCISES
================================================== */

function loadTemplateExercises() {

    const db =
        getDB();

    const container =
        document.getElementById(
            "templateExerciseSelection"
        );

    if (!container)
        return;

    let exercises =
        db.exercitii || [];

    if (templateSearch) {

        exercises =
            exercises.filter(
                exercise =>
                    exercise.nume
                        .toLowerCase()
                        .includes(
                            templateSearch
                        )
            );

    }

    if (
        templateEquipment.length
    ) {

        exercises =
            exercises.filter(
                exercise =>

                    templateEquipment.includes(
                        exercise.aparatId
                    )
            );

    }

    if (
        templateMuscles.length
    ) {

        exercises =
            exercises.filter(
                exercise =>

                    templateMuscles.every(
                        id =>

                            exercise.grupeMusculare.includes(
                                id
                            )
                    )
            );

    }

    if (
        templateCategories.length
    ) {

        exercises =
            exercises.filter(
                exercise =>

                    templateCategories.every(
                        id =>

                            exercise.categories.includes(
                                id
                            )
                    )
            );

    }

    container.innerHTML =

        exercises
            .map(
                exercise => `

                    <button
                        type="button"
                        class="template-chip"
                        data-id="${exercise.id}">

                        ${exercise.nume}

                    </button>

                `
            )
            .join("");

    document
        .querySelectorAll(
            ".template-chip"
        )
        .forEach(
            chip => {

                chip.addEventListener(
                    "click",
                    () => {

                        chip.classList.toggle(
                            "selected"
                        );

                    }
                );

            }
        );

}

/* ==================================================
   EDIT
================================================== */

function loadTemplateForEdit(
    id
) {

    const db =
        getDB();

    const template =
        (db.templateuri || [])
            .find(
                item =>
                    item.id === id
            );

    if (!template)
        return;

    document.getElementById(
        "templateNameInput"
    ).value =
        template.nume;

    document
        .querySelectorAll(
            ".template-chip"
        )
        .forEach(
            chip => {

                const exerciseId =
                    Number(
                        chip.dataset.id
                    );

                if (
                    template.exercitii.includes(
                        exerciseId
                    )
                ) {

                    chip.classList.add(
                        "selected"
                    );

                }

            }
        );

}

/* ==================================================
   SAVE
================================================== */

function saveTemplate() {

    const db =
        getDB();

    const nume =
        document
            .getElementById(
                "templateNameInput"
            )
            .value
            .trim();

    if (!nume)
        return;

    const exercitii =
        Array
            .from(
                document.querySelectorAll(
                    ".template-chip.selected"
                )
            )
            .map(
                chip =>
                    Number(
                        chip.dataset.id
                    )
            );

    if (!db.templateuri) {

        db.templateuri = [];

    }

    if (
        currentTemplateId
    ) {

        const template =
            db.templateuri.find(
                item =>
                    item.id ===
                    currentTemplateId
            );

        if (template) {

            template.nume =
                nume;

            template.exercitii =
                exercitii;

        }

    }
    else {

        db.templateuri.push({

            id:
                generateId(),

            nume,

            exercitii

        });

    }

    saveDB(db);

    resetTemplateForm();

    closeTemplateModal();

    renderTemplates();

}

/* ==================================================
   DELETE
================================================== */

function deleteTemplate(
    id
) {

    if (
        !confirm(
            "Ștergi template-ul?"
        )
    ) {
        return;
    }

    const db =
        getDB();

    db.templateuri =
        (db.templateuri || [])
            .filter(
                template =>
                    template.id !== id
            );

    saveDB(db);

    renderTemplates();

}

/* ==================================================
   RESET
================================================== */

function resetTemplateForm() {

    const input =
        document.getElementById(
            "templateNameInput"
        );

    if (input) {

        input.value = "";

    }

    document
        .querySelectorAll(
            ".template-chip"
        )
        .forEach(
            chip => {

                chip.classList.remove(
                    "selected"
                );

            }
        );

}

function renderTemplateFilters() {

    const db =
        getDB();

    document.getElementById(
        "templateCategoriesFilters"
    ).innerHTML =

        db.categories
            .map(
                item => `

                    <button
                        class="template-filter-chip"
                        data-type="category"
                        data-id="${item.id}">

                        ${item.nume}

                    </button>

                `
            )
            .join("");

    document.getElementById(
        "templateEquipmentFilters"
    ).innerHTML =

        db.aparate
            .map(
                item => `

                    <button
                        class="template-filter-chip"
                        data-type="equipment"
                        data-id="${item.id}">

                        ${item.nume}

                    </button>

                `
            )
            .join("");

    document.getElementById(
        "templateMusclesFilters"
    ).innerHTML =

        db.grupeMusculare
            .map(
                item => `

                    <button
                        class="template-filter-chip"
                        data-type="muscle"
                        data-id="${item.id}">

                        ${item.nume}

                    </button>

                `
            )
            .join("");

    bindTemplateFilterEvents();

}
function bindTemplateFilterEvents() {

    document
        .querySelectorAll(
            ".template-filter-chip"
        )
        .forEach(
            chip => {

                chip.addEventListener(
                    "click",
                    () => {

                        chip.classList.toggle(
                            "selected"
                        );

                        const type =
                            chip.dataset.type;

                        const id =
                            Number(
                                chip.dataset.id
                            );

                        let target;

                        if (
                            type === "category"
                        ) {

                            target =
                                templateCategories;

                        }
                        else if (
                            type === "equipment"
                        ) {

                            target =
                                templateEquipment;

                        }
                        else {

                            target =
                                templateMuscles;

                        }

                        if (
                            chip.classList.contains(
                                "selected"
                            )
                        ) {

                            if (
                                !target.includes(
                                    id
                                )
                            ) {

                                target.push(
                                    id
                                );

                            }

                        }
                        else {

                            const index =
                                target.indexOf(
                                    id
                                );

                            if (
                                index !== -1
                            ) {

                                target.splice(
                                    index,
                                    1
                                );

                            }

                        }

                        loadTemplateExercises();

                    }
                );

            }
        );

}