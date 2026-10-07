/* ==================================================
   PAGE
================================================== */

function renderOffersPage() {

    const adminContent =
        document.getElementById(
            "adminContent"
        );

    adminContent.innerHTML = `

        <div class="offers-page">

            <div class="offers-page-header">

                <h1 class="offers-page-title">

                    Oferte

                </h1>

                <button
                    id="offersAddBtn"
                    class="offers-add-btn">

                    + Adaugă Ofertă

                </button>

            </div>

            <div
                id="offersGrid"
                class="offers-grid">

            </div>

        </div>

        <div
            id="offersModal"
            class="offers-modal">

            <div class="offers-modal-content">

                <div class="offers-modal-header">

                    <h2>

                        Ofertă Nouă

                    </h2>

                    <button
                        id="offersCloseBtn"
                        class="offers-close-btn">

                        ×

                    </button>

                </div>

                <div class="offers-modal-body">

                    <input
                        id="offersNameInput"
                        class="offers-input"
                        type="text"
                        placeholder="Nume ofertă">

                    <input
                        id="offersSessionsInput"
                        class="offers-input"
                        type="number"
                        min="1"
                        placeholder="Număr ședințe">

                    <button
                        id="offersSaveBtn"
                        class="offers-save-btn">

                        Salvează

                    </button>

                </div>

            </div>

        </div>

    `;

    renderOffers();

    document
        .getElementById(
            "offersAddBtn"
        )
        ?.addEventListener(
            "click",
            openOffersModal
        );

    document
        .getElementById(
            "offersCloseBtn"
        )
        ?.addEventListener(
            "click",
            closeOffersModal
        );

    document
        .getElementById(
            "offersSaveBtn"
        )
        ?.addEventListener(
            "click",
            saveOffer
        );

}

/* ==================================================
   RENDER
================================================== */

function renderOffers() {

    const db =
        getDB();

    const offersGrid =
        document.getElementById(
            "offersGrid"
        );

    if (!offersGrid)
        return;

    offersGrid.innerHTML =
        db.oferte
            .map(
                offer => `

                    <div class="offers-card">

                        <div class="offers-card-name">

                            ${offer.nume}

                        </div>

                        <div class="offers-card-sessions">

                            ${offer.sedinte} ședințe

                        </div>

                        <div class="offers-card-actions">

                 

                            <button
                                class="offers-delete-btn"
                                onclick="deleteOffer(${offer.id})">

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

function openOffersModal() {

    document
        .getElementById(
            "offersModal"
        )
        ?.classList
        .add(
            "show"
        );

}

function closeOffersModal() {

    document
        .getElementById(
            "offersModal"
        )
        ?.classList
        .remove(
            "show"
        );

}

/* ==================================================
   SAVE
================================================== */

function saveOffer() {

    const nume =
        document
            .getElementById(
                "offersNameInput"
            )
            .value
            .trim();

    const sedinte =
        Number(
            document
                .getElementById(
                    "offersSessionsInput"
                )
                .value
        );

    if (!nume) {

        alert(
            "Introduceți numele ofertei."
        );

        return;

    }

    if (
        !sedinte ||
        sedinte < 1
    ) {

        alert(
            "Introduceți un număr valid de ședințe."
        );

        return;

    }

    const db =
        getDB();

    db.oferte.push({

        id:
            generateId(),

        nume,

        sedinte

    });

    saveDB(
        db
    );

    renderOffers();

    document
        .getElementById(
            "offersNameInput"
        )
        .value = "";

    document
        .getElementById(
            "offersSessionsInput"
        )
        .value = "";

    closeOffersModal();

}

/* ==================================================
   DELETE
================================================== */

function deleteOffer(id) {

    if (
        !confirm(
            "Ștergi această ofertă?"
        )
    ) {
        return;
    }

    const db =
        getDB();

    db.oferte =
        db.oferte.filter(

            offer =>

                offer.id !== id

        );

    saveDB(
        db
    );

    renderOffers();

}