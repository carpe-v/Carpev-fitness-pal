/* ==================================================
   TEMPLATES
================================================== */

function loadSessionTemplates() {

    const db =
        getDB();

    const select =
        document.getElementById(
            "sessionTemplateSelect"
        );

    if (!select)
        return;

    select.innerHTML = `

        <option value="">

            Selectează Template

        </option>

    `;

    (db.templateuri || [])
        .forEach(
            template => {

                select.innerHTML += `

                    <option
                        value="${template.id}">

                        ${template.nume}

                    </option>

                `;

            }
        );

}

/* ==================================================
   APPLY TEMPLATE
================================================== */

function applyTemplateToSession() {

    const templateId =
        Number(
            document
                .getElementById(
                    "sessionTemplateSelect"
                )
                .value
        );

    if (!templateId) {

        alert(
            "Selectează un template."
        );

        return;

    }

    const db =
        getDB();

    const template =
        (db.templateuri || [])
            .find(
                item =>
                    item.id ===
                    templateId
            );

    const client =
        (db.clienti || [])
            .find(
                item =>
                    item.id ===
                    currentClientId
            );

    if (
        !template ||
        !client
    ) {
        return;
    }

    const session =
        (client.sedinte || [])
            .find(
                item =>
                    item.nr ===
                    currentSessionNr
            );

    if (!session)
        return;

    session.templateId =
        template.id;

    session.templateNume =
        template.nume;

    session.exercitii =

        template.exercitii
            .map(
                exerciseId => ({

                    exerciseId,

                    serii: [

                        {
                            greutate: "",
                            repetari: ""
                        }

                    ]

                })
            );

    saveDB(
        db
    );

    renderSessionView();

}

/* ==================================================
   EXERCISES
================================================== */

function renderSessionExercises(
    session
) {

    const db =
        getDB();

    if (
        !session.exercitii ||
        !session.exercitii.length
    ) {

        return `

            <div
                class="session-empty">

                Nu există exerciții.

                <br>

                Aplică un template
                pentru a genera
                exercițiile.

            </div>

        `;

    }

    return session.exercitii
        .map(
            item => {

                const exercise =
                    (db.exercitii || [])
                        .find(
                            ex =>
                                ex.id ===
                                item.exerciseId
                        );

                return `

                    <div
                        class="session-exercise-card">

                        <div
                            class="session-exercise-header">

                          <div
    class="session-exercise-top">

    <div>

        <div
            class="exercise-title">

            ${exercise?.nume || "Exercițiu"}

        </div>

        <div
            class="exercise-meta">

            ${exercise?.grupa || "-"}
            •
            ${exercise?.aparat || "-"}

        </div>

    </div>

</div>

                        </div>

                        <div
                            class="session-sets">

                            ${renderSets(
                                item
                            )}

                        </div>

                    </div>

                `;

            }
        )
        .join("");

}

/* ==================================================
   SETS
================================================== */

function renderSets(
    exercise
) {

    return (
        exercise.serii || []
    )
        .map(
            (
                serie,
                index
            ) => `

                <div
                    class="session-set-row">

                    <div
                        class="session-set-index">

                        ${
                            index + 1
                        }

                    </div>

                    <input
                        type="number"
                        value="${
                            serie.greutate
                        }"
                        placeholder="Kg">

                    <input
                        type="text"
                        value="${
                            serie.repetari
                        }"
                        placeholder="Repetări">

                </div>

            `
        )
        .join("");

}