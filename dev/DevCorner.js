// ============================================
// DEV CORNER
// ============================================

class DevCorner {

    constructor() {

        this.dbManager =
            new AdminDBManager();
    }

    async init() {

        try {

            await this.dbManager.init();

            this.setupEventListeners();

            await this.refreshStats();

this.setupTableView();

this.log(
    "Dev Corner inițializat.",
    "success"
);
            

        } catch (error) {

            console.error(error);

            this.log(
                "Eroare inițializare.",
                "error"
            );
        }
    }

    // =========================================
    // LOG
    // =========================================

    log(
        message,
        type = "info"
    ) {

        const container =
            document.getElementById(
                "logContainer"
            );

        if (!container) return;

        const row =
            document.createElement(
                "div"
            );

        row.className =
            `log-entry log-${type}`;

        row.textContent =
            `${new Date().toLocaleTimeString("ro-RO")} - ${message}`;

        container.prepend(
            row
        );
    }
setupTableView() {

    document
        .querySelectorAll(
            ".table-card"
        )
        .forEach(card => {

            card.addEventListener(
                "click",
                async () => {

                    const tableName =
                        card.dataset.table;

                    await this.showTableData(
                        tableName
                    );
                }
            );
        });
}
async showTableData(
    tableName
) {

    const title =
        document.getElementById(
            "tableModalTitle"
        );

    const container =
        document.getElementById(
            "tableDataContainer"
        );

    if (
        !title ||
        !container
    ) {

        return;
    }

    title.textContent =
        tableName;

    const records =
        await this.dbManager.getAll(
            tableName
        );

    if (
        !records.length
    ) {

        container.innerHTML = `
            <div class="empty-message">
                Nu există date în această tabelă.
            </div>
        `;

        openTableDataModal();

        return;
    }

    const columns =
        Object.keys(
            records[0]
        );

    const header =
        columns
            .map(
                column =>
                    `<th>${column}</th>`
            )
            .join("");

    const rows =
        records
            .map(
                record => `

                <tr>

                    ${columns.map(
                        column => {

                            let value =
                                record[column];

                            if (
                                typeof value ===
                                "object"
                            ) {

                                value =
                                    JSON.stringify(
                                        value,
                                        null,
                                        2
                                    );
                            }

                            if (
                                value === undefined ||
                                value === null
                            ) {

                                value = "";
                            }

                            return `
                                <td>
                                    ${value}
                                </td>
                            `;
                        }
                    ).join("")}

                </tr>

            `
            )
            .join("");

    container.innerHTML = `

        <table class="db-table">

            <thead>

                <tr>

                    ${header}

                </tr>

            </thead>

            <tbody>

                ${rows}

            </tbody>

        </table>

    `;

    openTableDataModal();
}
    // =========================================
    // STATS
    // =========================================

    async refreshStats() {

        const stats =
            await this.dbManager
                .getDatabaseStats();

        Object.entries(
            stats
        ).forEach(
            (
                [table, count]
            ) => {

                const element =
                    document.getElementById(
                        `${table}Count`
                    );

                if (element) {

                    element.textContent =
                        count;
                }
            }
        );
    }

    // =========================================
    // ACTIONS
    // =========================================

    async initializeDatabase() {

        try {

            await this.dbManager
                .init();

            await this.refreshStats();

            this.log(
                "Baza de date inițializată.",
                "success"
            );

        } catch (error) {

            console.error(error);

            this.log(
                "Inițializarea a eșuat.",
                "error"
            );
        }
    }

    async generateDemo() {

        try {

            await generateDemoData();

            await this.refreshStats();

            this.log(
                "Date demo generate.",
                "success"
            );

        } catch (error) {

            console.error(error);

            this.log(
                "Generarea datelor demo a eșuat.",
                "error"
            );
        }
    }

    async exportDatabase() {

        try {

            await exportBackup();

            this.log(
                "Export Excel realizat.",
                "success"
            );

        } catch (error) {

            console.error(error);

            this.log(
                "Export Excel eșuat.",
                "error"
            );
        }
    }

    async importDatabase(file) {

        try {

            await importBackup(
                file
            );

            await this.refreshStats();

            this.log(
                "Import realizat.",
                "success"
            );

        } catch (error) {

            console.error(error);

            this.log(
                "Import eșuat.",
                "error"
            );
        }
    }

    async resetDatabase() {

        const confirmed =
            confirm(
                "Ștergi complet baza de date?"
            );

        if (!confirmed)
            return;

        try {

            if (
                this.dbManager.db
            ) {

                this.dbManager.db.close();
            }

            indexedDB.deleteDatabase(
                this.dbManager.dbName
            );

            this.log(
                "Baza de date ștearsă.",
                "warning"
            );

            setTimeout(
                () => {

                    location.reload();

                },
                1000
            );

        } catch (error) {

            console.error(error);

            this.log(
                "Ștergerea a eșuat.",
                "error"
            );
        }
    }

    // =========================================
    // EVENTS
    // =========================================

    setupEventListeners() {

        document
            .getElementById(
                "createDBBtn"
            )
            ?.addEventListener(
                "click",
                () =>
                    this.initializeDatabase()
            );

        document
            .getElementById(
                "generateDemoBtn"
            )
            ?.addEventListener(
                "click",
                () =>
                    this.generateDemo()
            );

        document
            .getElementById(
                "exportExcelBtn"
            )
            ?.addEventListener(
                "click",
                () =>
                    this.exportDatabase()
            );

        document
            .getElementById(
                "importExcelBtn"
            )
            ?.addEventListener(
                "click",
                () => {

                    document
                        .getElementById(
                            "importFileInput"
                        )
                        ?.click();
                }
            );

        document
            .getElementById(
                "importFileInput"
            )
            ?.addEventListener(
                "change",
                event => {

                    const file =
                        event.target.files?.[0];

                    if (!file)
                        return;

                    this.importDatabase(
                        file
                    );
                }
            );

        document
            .getElementById(
                "deleteDBBtn"
            )
            ?.addEventListener(
                "click",
                () =>
                    this.resetDatabase()
            );
    }
}

// ============================================
// START
// ============================================

let devCorner;

window.addEventListener(
    "DOMContentLoaded",
    async () => {

        devCorner =
            new DevCorner();

        await devCorner.init();
    }
);
function openTableDataModal() {

    document.getElementById(
        "tableDataModal"
    ).style.display =
        "flex";
}

function closeTableDataModal() {

    document.getElementById(
        "tableDataModal"
    ).style.display =
        "none";
}

window.closeTableDataModal =
    closeTableDataModal;