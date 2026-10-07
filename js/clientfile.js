/* ==================================================
   STATE
================================================== */

let currentClientId = null;

let currentSessionNr = null;

/* ==================================================
   OPEN CLIENT
================================================== */

function openClientFile(
    clientId
) {

    currentClientId =
        clientId;

    const db =
        getDB();

    const client =
        (db.clienti || [])
            .find(
                item =>
                    item.id ===
                    clientId
            );

    if (!client)
        return;

    document.getElementById(
        "clientFileName"
    ).textContent =
        client.nume;

    renderClientFile(
        client
    );

    document
        .getElementById(
            "clientFileModal"
        )
        ?.classList
        .add(
            "show"
        );

}

/* ==================================================
   CLOSE CLIENT
================================================== */

function closeClientFile() {

    currentClientId =
        null;

    currentSessionNr =
        null;

    document
        .getElementById(
            "clientFileModal"
        )
        ?.classList
        .remove(
            "show"
        );

}

/* ==================================================
   CLIENT VIEW
================================================== */

function renderClientFile(
    client
) {

    const body =
        document.getElementById(
            "clientFileBody"
        );

    if (!body)
        return;

    body.innerHTML = `

        <div
            class="client-info-card">

            <h3>

                Date Client

            </h3>

            <p>

                Telefon:
                ${client.telefon || "-"}

            </p>

            <p>

                Email:
                ${client.email || "-"}

            </p>

            <p>

                Obiectiv:
                ${client.obiectiv || "-"}

            </p>

            <p>

                Ofertă:
                ${client.ofertaNume || "-"}

            </p>

            <p>

                Ședințe:
                ${client.sedinteRamase || 0}
                /
                ${client.numarSedinte || 0}

            </p>

        </div>

        <div
            class="client-workouts-card">

            <h3>

                Ședințele Clientului

            </h3>

            <div
                class="client-sessions-grid">

                ${renderClientSessions(
                    client
                )}

            </div>

        </div>

    `;

}

/* ==================================================
   SESSION CARDS
================================================== */

function renderClientSessions(
    client
) {

    if (
        !client.sedinte ||
        !client.sedinte.length
    ) {

        return `

            <div
                class="empty-sessions">

                Nu există ședințe.

            </div>

        `;

    }

    return client.sedinte
        .map(
            session => `

                <div
                    class="client-session-card
                    ${
                        session.completata
                            ? "completed"
                            : ""
                    }">

                    <div
                        class="client-session-number">

                        Ședința
                        ${session.nr}

                    </div>

                    <div
                        class="client-session-status">

                        ${
                            session.completata
                                ? "✅ Finalizată"
                                : "⏳ Neefectuată"
                        }

                    </div>

                    <button
                        class="client-session-open-btn"
                        onclick="openSession(
                            ${client.id},
                            ${session.nr}
                        )">

                        Deschide

                    </button>

                </div>

            `
        )
        .join("");

}

/* ==================================================
   OPEN SESSION VIEW
================================================== */

function openSession(
    clientId,
    sessionNr
) {

    currentClientId =
        clientId;

    currentSessionNr =
        sessionNr;

    renderSessionView();

}

/* ==================================================
   SESSION VIEW
================================================== */

function renderSessionView() {

    const db =
        getDB();

    const client =
        (db.clienti || [])
            .find(
                item =>
                    item.id ===
                    currentClientId
            );

    if (!client)
        return;

    const session =
        (client.sedinte || [])
            .find(
                item =>
                    item.nr ===
                    currentSessionNr
            );

    if (!session)
        return;

    document.getElementById(
        "clientFileName"
    ).textContent =

        `Ședința ${session.nr}`;

    const body =
        document.getElementById(
            "clientFileBody"
        );

    body.innerHTML = `

        <div
            class="session-page">

            <div
                class="session-top-bar">

                <button
                    class="back-btn"
                    onclick="backToClientFile()">

                    ← Înapoi

                </button>

                <div>

                    <h2>

                        Ședința ${session.nr}

                    </h2>

                    <p>

                        ${client.nume}

                    </p>

                </div>

            </div>

            <div
                class="session-actions">

                <select
                    id="sessionTemplateSelect">

                </select>

                <button
                    id="applyTemplateBtn">

                    Aplică Template

                </button>

            </div>

            <div
                id="sessionExercises">

                ${
                    typeof renderSessionExercises ===
                    "function"

                        ? renderSessionExercises(
                            session
                        )

                        : ""

                }

            </div>

        </div>

    `;

    if (
        typeof loadSessionTemplates ===
        "function"
    ) {

        loadSessionTemplates();

    }

    document
        .getElementById(
            "applyTemplateBtn"
        )
        ?.addEventListener(
            "click",
            applyTemplateToSession
        );

}

/* ==================================================
   BACK
================================================== */

function backToClientFile() {

    const db =
        getDB();

    const client =
        (db.clienti || [])
            .find(
                item =>
                    item.id ===
                    currentClientId
            );

    if (!client)
        return;

    document.getElementById(
        "clientFileName"
    ).textContent =
        client.nume;

    renderClientFile(
        client
    );

}

/* ==================================================
   EVENTS
================================================== */

document
    .getElementById(
        "closeClientFile"
    )
    ?.addEventListener(
        "click",
        closeClientFile
    );