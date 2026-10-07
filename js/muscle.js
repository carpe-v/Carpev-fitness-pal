/* ==================================================
   PAGE
================================================== */

function renderMuscleGroupsPage() {

    const adminContent =
        document.getElementById(
            "adminContent"
        );

    adminContent.innerHTML = `

        <div class="muscle-page">

            <div class="muscle-page-header">

                <h1 class="muscle-page-title">

                    Grupe Musculare

                </h1>

                <button
                    id="muscleAddBtn"
                    class="muscle-add-btn">

                    + Adaugă Grupă

                </button>

            </div>

            <div
                id="muscleGrid"
                class="muscle-grid">

            </div>

        </div>

        <div
            id="muscleModal"
            class="muscle-modal">

            <div class="muscle-modal-content">

                <div class="muscle-modal-header">

                    <h2>

                        Grupă Musculară Nouă

                    </h2>

                    <button
                        id="muscleCloseBtn"
                        class="muscle-close-btn">

                        ×

                    </button>

                </div>

                <div class="muscle-modal-body">

                    <input
                        id="muscleNameInput"
                        class="muscle-input"
                        type="text"
                        placeholder="Nume grupă musculară">

                    <button
                        id="muscleSaveBtn"
                        class="muscle-save-btn">

                        Salvează

                    </button>

                </div>

            </div>

        </div>

    `;

    renderMuscleGroups();

    document
        .getElementById(
            "muscleAddBtn"
        )
        ?.addEventListener(
            "click",
            openMuscleModal
        );

    document
        .getElementById(
            "muscleCloseBtn"
        )
        ?.addEventListener(
            "click",
            closeMuscleModal
        );

    document
        .getElementById(
            "muscleSaveBtn"
        )
        ?.addEventListener(
            "click",
            saveMuscleGroup
        );

}

/* ==================================================
   RENDER
================================================== */

function renderMuscleGroups() {

    const db =
        getDB();

    const muscleGrid =
        document.getElementById(
            "muscleGrid"
        );

    if (!muscleGrid)
        return;

    const muscleGroups =
        db.grupeMusculare || [];

    muscleGrid.innerHTML =
        muscleGroups
            .map(
                muscle => `

                    <div class="muscle-card">

                        <div class="muscle-card-name">

                            ${muscle.nume}

                        </div>

                        <div class="muscle-card-actions">

                            <button
                                class="muscle-delete-btn"
                                onclick="deleteMuscleGroup(${muscle.id})">

                                Șterge

                            </button>

                        </div>

                    </div>

                `
            )
            .join("");

}

/* ==================================================
   MODAL
================================================== */

function openMuscleModal() {

    document
        .getElementById(
            "muscleModal"
        )
        ?.classList
        .add(
            "show"
        );

}

function closeMuscleModal() {

    document
        .getElementById(
            "muscleModal"
        )
        ?.classList
        .remove(
            "show"
        );

}

/* ==================================================
   SAVE
================================================== */

function saveMuscleGroup() {

    const nume =
        document
            .getElementById(
                "muscleNameInput"
            )
            .value
            .trim();

    if (!nume) {

        alert(
            "Introduceți numele grupei musculare."
        );

        return;

    }

    const db =
        getDB();

    if (!db.grupeMusculare) {

        db.grupeMusculare = [];

    }

    db.grupeMusculare.push({

        id:
            generateId(),

        nume

    });

    saveDB(
        db
    );

    renderMuscleGroups();

    document
        .getElementById(
            "muscleNameInput"
        )
        .value = "";

    closeMuscleModal();

}

/* ==================================================
   DELETE
================================================== */

function deleteMuscleGroup(id) {

    if (
        !confirm(
            "Ștergi această grupă musculară?"
        )
    ) {
        return;
    }

    const db =
        getDB();

    db.grupeMusculare =
        (db.grupeMusculare || [])
            .filter(

                muscle =>

                    muscle.id !== id

            );

    saveDB(
        db
    );

    renderMuscleGroups();

}