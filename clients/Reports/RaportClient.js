// ============================================
// RAPORT CLIENT
// ============================================

class RaportClientPage {

    constructor() {

        this.dbName = "carpevDB";

        this.db = null;

        this.clientId = null;
        this.packageId = null;

        this.currentClient = null;
        this.currentPackage = null;
this.digitalLogo = null;
        this.sessions = [];
        this.selectedSessions = [];
        this.allExercises = [];
        this.init();
    }

    async init() {

        try {

            const params =
                new URLSearchParams(
                    window.location.search
                );

            this.clientId =
                Number(
                    params.get("client")
                );

            this.packageId =
                Number(
                    params.get("package")
                );

            await this.openDatabase();
            this.allExercises =
             await this.getAllRecords(
                "Exercitii"
                );
this.digitalLogo =
    await this.getLogo(
        "digitalLogo"
    );
            await this.loadContext();

            await this.loadSessions();

            this.setupEventListeners();

        } catch (error) {

            console.error(error);
        }
    }

    async openDatabase() {

        return new Promise(
            (resolve, reject) => {

            const request =
                indexedDB.open(
                    this.dbName
                );

            request.onsuccess =
                (event) => {

                this.db =
                    event.target.result;

                resolve();
            };

            request.onerror =
                () =>
                    reject(
                        request.error
                    );
        });
    }

    async getAllRecords(tableName) {

        if (
            !this.db.objectStoreNames.contains(
                tableName
            )
        ) {

            return [];
        }

        return new Promise(
            (resolve, reject) => {

            const tx =
                this.db.transaction(
                    [tableName],
                    "readonly"
                );

            const request =
                tx.objectStore(
                    tableName
                ).getAll();

            request.onsuccess =
                () =>
                    resolve(
                        request.result
                    );

            request.onerror =
                () =>
                    reject(
                        request.error
                    );
        });
    }

    async loadContext() {

        const clients =
            await this.getAllRecords(
                "Clienti"
            );

        const clientPackages =
            await this.getAllRecords(
                "ClientPackages"
            );

        const packages =
            await this.getAllRecords(
                "Pachete"
            );

        this.currentClient =
            clients.find(
                client =>
                    Number(
                        client.id
                    ) ===
                    this.clientId
            );

        const clientPackage =
            clientPackages.find(
                item =>
                    Number(
                        item.id
                    ) ===
                    this.packageId
            );

        if (
            clientPackage
        ) {

            this.currentPackage =
                packages.find(
                    pkg =>
                        Number(
                            pkg.id
                        ) ===
                        Number(
                            clientPackage.package_id
                        )
                );
        }

        document.getElementById(
            "reportClientName"
        ).textContent =
            this.currentClient
                ? `${this.currentClient.first_name} ${this.currentClient.last_name}`
                : "-";

        document.getElementById(
            "reportPackageName"
        ).textContent =
            this.currentPackage?.name || "-";

        if (
            this.currentClient
        ) {

            document.getElementById(
                "reportTitle"
            ).textContent =
                `Raport ${this.currentClient.first_name} ${this.currentClient.last_name}`;
        }
    }
async getLogo(
    logoId
) {

    return new Promise(
        (resolve, reject) => {

        const tx =
            this.db.transaction(
                ["Settings"],
                "readonly"
            );

        const request =
            tx.objectStore(
                "Settings"
            )
            .get(
                logoId
            );

        request.onsuccess =
            () => {

            resolve(
                request.result?.value ||
                null
            );
        };

        request.onerror =
            () =>
                reject(
                    request.error
                );
        });
}
    async loadSessions() {

        const allSessions =
            await this.getAllRecords(
                "Sedinte"
            );

        this.sessions =
            allSessions
                .filter(
                    session =>
                        Number(
                            session.client_id
                        ) ===
                        this.clientId
                        &&
                        Number(
                            session.package_id
                        ) ===
                        this.packageId
                )
                .sort(
                    (a, b) =>
                        a.session_number -
                        b.session_number
                );

        this.renderSessions();
    }

    renderSessions() {

        const container =
            document.getElementById(
                "sessionsCheckboxList"
            );

        if (!container)
            return;

        if (
            !this.sessions.length
        ) {

            container.innerHTML = `
                <div class="empty-message">
                    Nu există ședințe.
                </div>
            `;

            return;
        }

        container.innerHTML =
            this.sessions.map(
                session => {

                const selected =
                    this.selectedSessions.includes(
                        session.id
                    );

                return `

                <label
                    class="
                    session-checkbox-item
                    ${selected ? "selected" : ""}
                    ">

                    <input
                        type="checkbox"
                        class="session-check"
                        data-id="${session.id}"
                        ${selected ? "checked" : ""}>

                    <div class="session-checkbox-info">

                        <div class="session-name">
                            Ședința ${session.session_number}
                        </div>

                        <div class="session-meta">
                            ${(session.exercises || []).length}
                            exerciții
                        </div>

                    </div>

                </label>

                `;
            })
            .join("");

        container
            .querySelectorAll(
                ".session-check"
            )
            .forEach(input => {

                input.addEventListener(
                    "change",
                    () => {

                        const id =
                            Number(
                                input.dataset.id
                            );

                        if (
                            input.checked
                        ) {

                            if (
                                !this.selectedSessions.includes(id)
                            ) {

                                this.selectedSessions.push(id);
                            }

                        } else {

                            this.selectedSessions =
                                this.selectedSessions
                                    .filter(
                                        x => x !== id
                                    );
                        }

                        input
                            .closest(
                                ".session-checkbox-item"
                            )
                            ?.classList.toggle(
                                "selected",
                                input.checked
                            );

                        this.updateSelection();
                    }
                );
            });

        this.updateSelection();
    }

    updateSelection() {

        const count =
            this.selectedSessions.length;

        document.getElementById(
            "confirmCount"
        ).textContent =
            `${count} selectate`;

        document.getElementById(
            "selectedSessionsCount"
        ).textContent =
            count;

        this.updatePreviews();
    }

updatePreviews() {

    const selectedSessions =
        this.sessions.filter(
            session =>
                this.selectedSessions.includes(
                    session.id
                )
        );

    this.renderDigitalPreview(
        selectedSessions
    );

    this.renderPrintPreview(
        selectedSessions
    );
}

renderDigitalPreview(
    sessions
) {

    const container =
        document.getElementById(
            "previewDigital"
        );

    if (!container)
        return;

    if (
        !sessions.length
    ) {

        container.innerHTML = `
            <div class="preview-empty">
                Selectează ședințele pentru raport.
            </div>
        `;

        return;
    }

    if (
        typeof DigitalReport !==
        "undefined"
    ) {

        container.innerHTML =
            DigitalReport.build(

                this.currentClient,

                sessions,

                this.allExercises, 
              
            );

        return;
    }

    container.innerHTML = `
        <div class="preview-empty">
            DigitalReport indisponibil
        </div>
    `;
}

renderPrintPreview(
    sessions
) {

    const container =
        document.getElementById(
            "previewPrint"
        );

    if (!container)
        return;

    if (
        !sessions.length
    ) {

        container.innerHTML = `
            <div class="preview-empty">
                Selectează ședințele pentru raport.
            </div>
        `;

        return;
    }

    if (
        typeof PrintReport !==
        "undefined"
    ) {

        container.innerHTML =
            PrintReport.build(

                this.currentClient,

                sessions,

                this.allExercises

            );

        return;
    }

    container.innerHTML = `
        <div class="preview-empty">
            PrintReport indisponibil.
        </div>
    `;
}

setupEventListeners() {

    // =========================================
    // TABS
    // =========================================

    document
        .querySelectorAll(
            ".preview-tab"
        )
        .forEach(tab => {

            tab.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".preview-tab"
                        )
                        .forEach(btn =>
                            btn.classList.remove(
                                "active"
                            )
                        );

                    tab.classList.add(
                        "active"
                    );

                    document
                        .querySelectorAll(
                            ".preview-tab-panel"
                        )
                        .forEach(panel =>
                            panel.classList.remove(
                                "active"
                            )
                        );

                    const target =
                        tab.dataset.tab;

                    if (
                        target ===
                        "digital"
                    ) {

                        document
                            .getElementById(
                                "tabDigital"
                            )
                            ?.classList.add(
                                "active"
                            );
                    }

                    if (
                        target ===
                        "print"
                    ) {

                        document
                            .getElementById(
                                "tabPrint"
                            )
                            ?.classList.add(
                                "active"
                            );
                    }
                }
            );
        });

    // =========================================
    // DOWNLOAD DIGITAL PDF
    // =========================================

    document
        .getElementById(
            "downloadDigitalBtn"
        )
        ?.addEventListener(
            "click",
            async () => {

                const selectedSessions =
                    this.sessions.filter(
                        session =>
                            this.selectedSessions.includes(
                                session.id
                            )
                    );

                if (
                    !selectedSessions.length
                ) {

                    alert(
                        "Selectează cel puțin o ședință."
                    );

                    return;
                }

                if (
                    typeof DigitalReport !==
                    "undefined"
                    &&
                    DigitalReport.downloadPDF
                ) {

                    await DigitalReport.downloadPDF(

                        this.currentClient,

                        selectedSessions,

                        this.allExercises

                    );
                }
            }
        );

    // =========================================
    // DOWNLOAD PRINT PDF
    // =========================================

    document
        .getElementById(
            "downloadPrintBtn"
        )
        ?.addEventListener(
            "click",
            async () => {

                const selectedSessions =
                    this.sessions.filter(
                        session =>
                            this.selectedSessions.includes(
                                session.id
                            )
                    );

                if (
                    !selectedSessions.length
                ) {

                    alert(
                        "Selectează cel puțin o ședință."
                    );

                    return;
                }

                if (
                    typeof PrintReport !==
                    "undefined"
                    &&
                    PrintReport.downloadPDF
                ) {

                    await PrintReport.downloadPDF(

                        this.currentClient,

                        selectedSessions,

                        this.allExercises

                    );
                }
            }
        );
}
}

let raportClientPage;

window.addEventListener(
    "DOMContentLoaded",
    () => {

        raportClientPage =
            new RaportClientPage();
    }
);