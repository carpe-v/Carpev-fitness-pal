// ============================================
// DIGITAL REPORT
// ============================================

// ============================================
// DIGITAL REPORT
// ============================================

class DigitalReport {

    static build(
        client,
        sessions,
        exercises,
        logo
    ) {

        const sorted =
            [...sessions]
            .sort(
                (a, b) =>
                    a.session_number -
                    b.session_number
            );

        const totalExercises =
            sorted.reduce(
                (sum, session) =>
                    sum +
                    (
                        session.exercises
                        ?.length || 0
                    ),
                0
            );

        const totalSets =
            sorted.reduce(
                (sum, session) =>
                    sum +
                    (
                        session.exercises || []
                    )
                    .reduce(
                        (exerciseSum, exercise) =>
                            exerciseSum +
                            (
                                exercise.executed
                                ?.length || 0
                            ),
                        0
                    ),
                0
            );



        return `

        <div class="raport-digital">

            <div class="raport-header">

                <div class="raport-header-left">

                    <h2>
                        Raport Client
                    </h2>

                    <div class="client-name">

                        ${client.first_name}
                        ${client.last_name}

                    </div>

                    <div class="raport-date">

                        Generat:
                        ${new Date()
                            .toLocaleDateString(
                                "ro-RO"
                            )}

                    </div>

                </div>

                <div class="raport-header-right">

                    ${
                        logo
                        ? `
                        <img
                            src="${logo}"
                            alt="Logo"
                            class="raport-logo">
                        `
                        : ""
                    }

                </div>

            </div>

            <div class="summary-grid">

                <div class="summary-card">

                    <div class="summary-value">
                        ${sorted.length}
                    </div>

                    <div class="summary-label">
                        Ședințe
                    </div>

                </div>

                <div class="summary-card">

                    <div class="summary-value">
                        ${totalExercises}
                    </div>

                    <div class="summary-label">
                        Exerciții
                    </div>

                </div>

                <div class="summary-card">

                    <div class="summary-value">
                        ${totalSets}
                    </div>

                    <div class="summary-label">
                        Seturi
                    </div>

                </div>

            </div>

            ${sorted
                .map(
                    session =>
                        this.buildSession(
                            session,
                            exercises
                        )
                )
                .join("")}

        </div>

        `;
    }

    static buildSession(
        session,
        exercises
    ) {

        return `

        <div class="raport-session">

            <div class="session-title">

                Ședința
                ${session.session_number}

            </div>

            ${(session.exercises || [])
                .map(
                    exercise =>
                        this.buildExercise(
                            exercise,
                            exercises
                        )
                )
                .join("")}

        </div>

        `;
    }

    static buildExercise(
        exercise,
        exercises
    ) {

        const planned =
            exercise.planned || [];

        const executed =
            exercise.executed || [];

        const exerciseInfo =
            exercises.find(
                x =>
                    Number(x.id)
                    ===
                    Number(
                        exercise.exercise_id
                    )
            );

        const exerciseName =
            exerciseInfo?.name ||
            `#${exercise.exercise_id}`;

        return `

        <div class="exercise-block-raport">

            <div class="exercise-title">

                ${exerciseName}

            </div>

            <div class="exercise-columns">

                <!-- PLANIFICAT -->

                <div class="exercise-column">

                    <div class="column-title">

                        PLANIFICAT

                    </div>

                    <table class="exercise-table">

                        <thead>

                            <tr>

                                <th>Set</th>
                                <th>Rep</th>
                                <th>Kg</th>

                            </tr>

                        </thead>

                        <tbody>

                            ${planned
                                .map(
                                    (
                                        set,
                                        index
                                    ) => `

                                <tr>

                                    <td>
                                        ${index + 1}
                                    </td>

                                    <td>
                                        ${set.reps || "-"}
                                    </td>

                                    <td>
                                        ${set.weight || "-"}
                                    </td>

                                </tr>

                            `
                                )
                                .join("")}

                        </tbody>

                    </table>

                </div>

                <!-- EXECUTAT -->

                <div class="exercise-column">

                    <div class="column-title">

                        EXECUTAT

                    </div>

                    <table class="exercise-table">

                        <thead>

                            <tr>

                                <th>Set</th>
                                <th>Rep</th>
                                <th>Kg</th>

                            </tr>

                        </thead>

                        <tbody>

                            ${executed
                                .map(
                                    (
                                        set,
                                        index
                                    ) => `

                                <tr>

                                    <td>
                                        ${index + 1}
                                    </td>

                                    <td>
                                        ${set.reps || "-"}
                                    </td>

                                    <td>
                                        ${set.weight || "-"}
                                    </td>

                                </tr>

                            `
                                )
                                .join("")}

                        </tbody>

                    </table>

                </div>

            </div>

            ${
                exercise.trainer_notes &&
                exercise.trainer_notes.trim()
                ? `

                <div class="trainer-note">

                    <strong>
                        Notițe Antrenor
                    </strong>

                    <div>

                        ${exercise.trainer_notes}

                    </div>

                </div>

                `
                : ""
            }

        </div>

        `;
    }

    static async downloadPDF(
        client,
        sessions,
        exercises
    ) {

        const source =
            document.querySelector(
                "#previewDigital .raport-digital"
            );

        if (!source) {

            alert(
                "Raportul nu este disponibil."
            );

            return;
        }

        const wrapper =
            document.createElement(
                "div"
            );

        wrapper.style.position =
            "fixed";

        wrapper.style.left =
            "-99999px";

        wrapper.style.top =
            "0";

        wrapper.style.zIndex =
            "-1";

        const clone =
            source.cloneNode(true);

        clone.style.width =
            source.offsetWidth + "px";

        clone.style.height =
            "auto";

        clone.style.margin =
            "0";

        clone.style.paddingBottom =
            "0";

        wrapper.appendChild(
            clone
        );

        document.body.appendChild(
            wrapper
        );

        const canvas =
            await html2canvas(
                clone,
                {
                    scale: 2,
                    useCORS: true,
                    backgroundColor:
                        "#111827"
                }
            );

        wrapper.remove();

        const imgData =
            canvas.toDataURL(
                "image/png"
            );

        const {
            jsPDF
        } = window.jspdf;

        const pdf =
            new jsPDF(
                "p",
                "mm",
                "a4"
            );

        const pageWidth =
            pdf.internal
                .pageSize
                .getWidth();

        const pageHeight =
            pdf.internal
                .pageSize
                .getHeight();

        const imgWidth =
            pageWidth;

        const imgHeight =
            (
                canvas.height *
                imgWidth
            ) /
            canvas.width;

        let remainingHeight =
            imgHeight;

        let position = 0;

        pdf.addImage(
            imgData,
            "PNG",
            0,
            position,
            imgWidth,
            imgHeight
        );

        remainingHeight -=
            pageHeight;

        while (
            remainingHeight > 0
        ) {

            position =
                remainingHeight -
                imgHeight;

            pdf.addPage();

            pdf.addImage(
                imgData,
                "PNG",
                0,
                position,
                imgWidth,
                imgHeight
            );

            remainingHeight -=
                pageHeight;
        }

        pdf.save(
            `Raport_${client.first_name}_${client.last_name}.pdf`
        );
    }
}