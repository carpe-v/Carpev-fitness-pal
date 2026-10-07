/* ==================================================
   PAGE
================================================== */

function renderEquipmentPage() {

    const adminContent =
        document.getElementById(
            "adminContent"
        );

    adminContent.innerHTML = `

        <div class="equipment-page">

            <div class="equipment-page-header">

                <h1 class="equipment-page-title">

                    Aparate

                </h1>

                <button
                    id="equipmentAddBtn"
                    class="equipment-add-btn">

                    + Adaugă Aparat

                </button>

            </div>

            <div
                id="equipmentGrid"
                class="equipment-grid">

            </div>

        </div>

        <div
            id="equipmentModal"
            class="equipment-modal">

            <div class="equipment-modal-content">

                <div class="equipment-modal-header">

                    <h2>

                        Aparat Nou

                    </h2>

                    <button
                        id="equipmentCloseBtn"
                        class="equipment-close-btn">

                        ×

                    </button>

                </div>

                <div class="equipment-modal-body">

                    <input
                        id="equipmentNameInput"
                        class="equipment-input"
                        type="text"
                        placeholder="Nume aparat">

                    <button
                        id="equipmentSaveBtn"
                        class="equipment-save-btn">

                        Salvează

                    </button>

                </div>

            </div>

        </div>

    `;

    renderEquipment();

    document
        .getElementById(
            "equipmentAddBtn"
        )
        ?.addEventListener(
            "click",
            openEquipmentModal
        );

    document
        .getElementById(
            "equipmentCloseBtn"
        )
        ?.addEventListener(
            "click",
            closeEquipmentModal
        );

    document
        .getElementById(
            "equipmentSaveBtn"
        )
        ?.addEventListener(
            "click",
            saveEquipment
        );

}

/* ==================================================
   RENDER
================================================== */

function renderEquipment() {

    const db =
        getDB();

    const equipmentGrid =
        document.getElementById(
            "equipmentGrid"
        );

    if (!equipmentGrid)
        return;

    equipmentGrid.innerHTML =
        db.aparate
            .map(
                equipment => `

                    <div class="equipment-card">

                        <div class="equipment-card-name">

                            ${equipment.nume}

                        </div>

                        <div
                            class="equipment-card-actions">

                            <button
                                class="equipment-delete-btn"
                                onclick="deleteEquipment(${equipment.id})">

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

function openEquipmentModal() {

    document
        .getElementById(
            "equipmentModal"
        )
        ?.classList
        .add(
            "show"
        );

}

function closeEquipmentModal() {

    document
        .getElementById(
            "equipmentModal"
        )
        ?.classList
        .remove(
            "show"
        );

}

/* ==================================================
   SAVE
================================================== */

function saveEquipment() {

    const nume =
        document
            .getElementById(
                "equipmentNameInput"
            )
            .value
            .trim();

    if (!nume) {

        alert(
            "Introduceți numele aparatului."
        );

        return;

    }

    const db =
        getDB();

    db.aparate.push({

        id:
            generateId(),

        nume

    });

    saveDB(
        db
    );

    renderEquipment();

    document
        .getElementById(
            "equipmentNameInput"
        )
        .value = "";

    closeEquipmentModal();

}

/* ==================================================
   DELETE
================================================== */

function deleteEquipment(id) {

    if (
        !confirm(
            "Ștergi acest aparat?"
        )
    ) {
        return;
    }

    const db =
        getDB();

    db.aparate =
        db.aparate.filter(

            equipment =>

                equipment.id !== id

        );

    saveDB(
        db
    );

    renderEquipment();

}