/* ==================================================
   MODAL
================================================== */

function openClientModal() {

    loadOfferOptions();

    document
        .getElementById(
            "clientModal"
        )
        ?.classList
        .add(
            "show"
        );

}



function loadOfferOptions() {

    const db =
        getDB();

    const select =
        document.getElementById(
            "clientOffer"
        );

    if (!select)
        return;

    select.innerHTML = `

        <option value="">

            Selectează ofertă

        </option>

    `;

    (db.oferte || [])
        .forEach(
            offer => {

                select.innerHTML += `

                    <option
                        value="${offer.id}">

                        ${offer.nume}
                        (${offer.sedinte} ședințe)

                    </option>

                `;

            }
        );

}
/* ==================================================
   RESET
================================================== */

function resetClientForm() {

    document.getElementById(
        "clientName"
    ).value = "";

    document.getElementById(
        "clientPhone"
    ).value = "";

    document.getElementById(
        "clientEmail"
    ).value = "";

    document.getElementById(
        "clientObjective"
    ).value = "";

}

/* ==================================================
   SAVE
================================================== */

function saveClient() {

    const nume =
        document
            .getElementById(
                "clientName"
            )
            .value
            .trim();

    const telefon =
        document
            .getElementById(
                "clientPhone"
            )
            .value
            .trim();

    const email =
        document
            .getElementById(
                "clientEmail"
            )
            .value
            .trim();

    const obiectiv =
        document
            .getElementById(
                "clientObjective"
            )
            .value
            .trim();

    if (!nume) {

        alert(
            "Introduceți numele clientului."
        );

        return;

    }

    const offerId =
        Number(
            document
                .getElementById(
                    "clientOffer"
                )
                .value
        );

    const db =
        getDB();

    if (!db.clienti) {

        db.clienti = [];

    }

    const offer =
        (db.oferte || [])
            .find(
                item =>
                    item.id ===
                    offerId
            );

    const sedinte =

        Array.from(

            {
                length:
                    offer?.sedinte || 0
            },

            (_, index) => ({

                nr:
                    index + 1,

                data:
                    null,

                completata:
                    false,

                templateId:
                    null,

                exercitii: []

            })

        );

    db.clienti.push({

        id:
            generateId(),

        activ: true,

        nume,

        telefon,

        email,

        obiectiv,

        ofertaId:
            offer?.id || null,

        ofertaNume:
            offer?.nume || "",

        numarSedinte:
            offer?.sedinte || 0,

        sedinteRamase:
            offer?.sedinte || 0,

        sedinte,

        dataCreare:
            new Date()
                .toISOString()

    });

    saveDB(
        db
    );

    renderClients();

    closeClientModal();

}

function closeClientModal() {

    document
        .getElementById(
            "clientModal"
        )
        ?.classList
        .remove(
            "show"
        );

    resetClientForm();

}

function deleteClient(
    clientId
) {

    if (
        !confirm(
            "Ștergi clientul și toate ședințele asociate?"
        )
    ) {
        return;
    }

    const db =
        getDB();

    db.clienti =
        (db.clienti || [])
            .filter(
                client =>
                    client.id !==
                    clientId
            );

    db.sedinte =
        (db.sedinte || [])
            .filter(
                sedinta =>
                    sedinta.clientId !==
                    clientId
            );

    saveDB(db);

    renderClients();

}
