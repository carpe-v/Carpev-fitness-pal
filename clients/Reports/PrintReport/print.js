// ============================================
// PRINT REPORT
// ============================================

class PrintReport {

    static build(
        client,
        sessions,
        exercises
    ) {

        const sorted =
            [...sessions]
            .sort(
                (a, b) =>
                    a.session_number -
                    b.session_number
            );

        return `

        <div class="print-report">

            <div class="print-header">

                <div class="print-header-top">

                    <div class="print-logo">
                        CARPEV FITNESS
                    </div>

                    <div class="print-date">
                        ${new Date().toLocaleDateString("ro-RO")}
                    </div>

                </div>

                <h1>
                    RAPORT ANTRENAMENT
                </h1>

                <div class="print-client">

                    ${client.first_name}
                    ${client.last_name}

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

        <div class="print-session">

            <div class="print-session-title">

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

        const planned =
            exercise.planned || [];

        const executed =
            exercise.executed || [];

        return `

        <div class="print-exercise">

            <div class="print-exercise-title">

                ${exerciseName}

            </div>

            <div class="print-columns">

                <!-- PLANIFICAT -->

                <div class="print-column">

                    <div class="print-column-title">
                        PLANIFICAT
                    </div>

                    <table class="print-table">

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
                                        ${set.reps || ""}
                                    </td>

                                    <td>
                                        ${set.weight || ""}
                                    </td>

                                </tr>

                            `
                                )
                                .join("")}

                        </tbody>

                    </table>

                </div>

                <!-- EXECUTAT -->

                <div class="print-column">

                    <div class="print-column-title">
                        EXECUTAT
                    </div>

                    <table class="print-table">

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
                                        ${set.reps || ""}
                                    </td>

                                    <td>
                                        ${set.weight || ""}
                                    </td>

                                </tr>

                            `
                                )
                                .join("")}

                        </tbody>

                    </table>

                </div>

            </div>

            ${exercise.trainer_notes
                ? `

                <div class="print-notes">

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
                "#previewPrint .print-report"
            );

        if (!source) {

            alert(
                "Raportul nu este disponibil."
            );

            return;
        }

        const canvas =
            await html2canvas(
                source,
                {
                    scale: 2,
                    backgroundColor:
                        "#ffffff"
                }
            );

        const image =
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
            pdf.internal.pageSize.getWidth();

        const pageHeight =
            pdf.internal.pageSize.getHeight();

        const imageWidth =
            pageWidth;

        const imageHeight =
            (
                canvas.height *
                imageWidth
            ) /
            canvas.width;

        let heightLeft =
            imageHeight;

        let position = 0;

        pdf.addImage(
            image,
            "PNG",
            0,
            position,
            imageWidth,
            imageHeight
        );

        heightLeft -= pageHeight;

        while (
            heightLeft > 0
        ) {

            position =
                heightLeft -
                imageHeight;

            pdf.addPage();

            pdf.addImage(
                image,
                "PNG",
                0,
                position,
                imageWidth,
                imageHeight
            );

            heightLeft -= pageHeight;
        }

        pdf.save(
            `Raport_Print_${client.first_name}_${client.last_name}.pdf`
        );
    }
}