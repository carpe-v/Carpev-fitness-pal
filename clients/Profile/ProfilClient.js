// ============================================
// PROFIL CLIENT
// ============================================

class ProfilClientManager {

    constructor() {

        this.dbName = "carpevDB";

        this.clientsTable = "Clienti";
        this.packagesTable = "Pachete";
        this.clientPackagesTable =
            "ClientPackages";

        this.db = null;

        this.clientId = null;
        this.client = null;

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
                    params.get("id")
                );

            await this.openDatabase();

            await this.ensureTables();

            await this.loadClient();

            await this.loadPackages();

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
                () => {

                reject(
                    request.error
                );
            };
        });
    }

    async ensureTables() {

        if (
            this.db.objectStoreNames.contains(
                this.clientPackagesTable
            )
        ) {

            return;
        }

        this.db.close();

        return new Promise(
            (resolve, reject) => {

            const request =
                indexedDB.open(
                    this.dbName,
                    this.db.version + 1
                );

            request.onupgradeneeded =
                (event) => {

                const db =
                    event.target.result;

                if (
                    !db.objectStoreNames.contains(
                        this.clientPackagesTable
                    )
                ) {

                    db.createObjectStore(
                        this.clientPackagesTable,
                        {
                            keyPath: "id",
                            autoIncrement: true
                        }
                    );
                }
            };

            request.onsuccess =
                (event) => {

                this.db =
                    event.target.result;

                resolve();
            };

            request.onerror =
                () => {

                reject(
                    request.error
                );
            };
        });
    }

setupEventListeners() {

    document
        .getElementById(
            "openPackageModalBtn"
        )
        ?.addEventListener(
            "click",
            () => {

                this.resetPackageForm();

                openPackageModal();
            }
        );

    document
        .getElementById(
            "packageForm"
        )
        ?.addEventListener(
            "submit",
            (e) => {

                e.preventDefault();

                this.savePackage();
            }
        );

    document
        .getElementById(
            "saveScheduleBtn"
        )
        ?.addEventListener(
            "click",
            () => {

                this.saveSessionSchedule();
            }
        );
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

    async loadClient() {

        const clients =
            await this.getAllRecords(
                this.clientsTable
            );

        this.client =
            clients.find(
                x =>
                    Number(x.id) ===
                    Number(
                        this.clientId
                    )
            );

        if (!this.client) {

            alert(
                "Clientul nu a fost găsit."
            );

            return;
        }

        this.renderClientInfo();
    }

renderClientInfo() {

    const client =
        this.client;

    const fullName =
        `${client.first_name || ""} ${client.last_name || ""}`.trim();

    document.getElementById(
        "profilePageTitle"
    ).textContent =
        fullName;

    document.getElementById(
        "clientPhone"
    ).textContent =
        client.phone
            ? `📞 ${client.phone}`
            : "📞 -";

    document.getElementById(
        "clientEmail"
    ).textContent =
        client.email
            ? `📧 ${client.email}`
            : "📧 -";

    document.getElementById(
        "clientBirthDate"
    ).textContent =
        client.birth_date || "-";

    document.getElementById(
        "clientWeight"
    ).textContent =
        client.weight
            ? `${client.weight} kg`
            : "-";

    document.getElementById(
        "clientHeight"
    ).textContent =
        client.height
            ? `${client.height} cm`
            : "-";

    document.getElementById(
        "clientActivityLevel"
    ).textContent =
        client.activity_level || "-";

    document.getElementById(
        "clientExperienceLevel"
    ).textContent =
        client.experience_level || "-";

    document.getElementById(
        "clientNotes"
    ).textContent =
        client.notes || "-";

    document.getElementById(
        "clientBMI"
    ).textContent =
        this.calculateBMI(
            client.weight,
            client.height
        );
}

    calculateBMI(weight, height) {

        if (
            !weight ||
            !height
        ) {
            return "-";
        }

        const bmi =
            weight /
            Math.pow(
                height / 100,
                2
            );

        return bmi.toFixed(1);
    }

    async loadPackages() {

        const packages =
            await this.getAllRecords(
                this.packagesTable
            );

        const select =
            document.getElementById(
                "packageSelect"
            );

        select.innerHTML = `
            <option value="">
                Selectează Pachet
            </option>
        `;

        packages.forEach(pkg => {

            select.innerHTML += `
                <option value="${pkg.id}">
                    ${pkg.name}
                </option>
            `;
        });

        await this.renderClientPackages();
    }

async renderClientPackages() {

    const container =
        document.getElementById(
            "packagesContainer"
        );

    const packages =
        await this.getAllRecords(
            this.packagesTable
        );

    const clientPackages =
        await this.getAllRecords(
            this.clientPackagesTable
        );

    const clientData =
        clientPackages.filter(
            x =>
                Number(
                    x.client_id
                ) ===
                Number(
                    this.clientId
                )
        );

    if (
        clientData.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-message">
                📭 Clientul nu are pachete atribuite.
            </div>
        `;

        return;
    }

    container.innerHTML =
        clientData.map(pkg => {

            const packageInfo =
                packages.find(
                    p =>
                        Number(p.id) ===
                        Number(
                            pkg.package_id
                        )
                );

            const sessions =
                pkg.sessions || [];

            return `

            <div class="package-card">

                <div class="package-card-header">

                    <div>

                        <div class="package-title">
                            ${packageInfo?.name || "-"}
                        </div>

                        <div class="package-meta">

                            <span class="package-badge">
                                ${packageInfo?.sessions || 0}
                                ședințe
                            </span>

                            <span class="package-badge">
                                ${packageInfo?.price || 0}
                                RON
                            </span>

                        </div>

                    </div>

                    <button
                        class="btn-report-package"
                        data-package="${pkg.id}">
                        📊 Raport
                    </button>

                </div>

                <div class="package-details">

                    <div class="package-info-box">

                        <span class="package-info-label">
                            Activat la
                        </span>

                        <div class="package-info-value">
                            ${pkg.start_date}
                        </div>

                    </div>

                </div>

                <div class="sessions-grid">

                    ${sessions.map(
                        session => `

                        <div
    class="session-tile session-${session.status}"
    data-package="${pkg.id}"
    data-session="${session.number}">

    <button
        class="session-schedule-btn"
        data-package="${pkg.id}"
        data-session="${session.number}">
        📅
    </button>

                            <div class="session-number">
                                ${session.number}
                            </div>

                            <div class="session-date">
                                ${session.scheduled_date || "Neprogramată"}
                            </div>

                            <div class="session-time">
                                ${session.scheduled_time || ""}
                            </div>

                        </div>

                    `
                    ).join("")}

                </div>

            </div>

            `;

        }).join("");

    // RAPORT

    container
        .querySelectorAll(
            ".btn-report-package"
        )
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "../Reports/RaportClient.html" +
                        "?client=" +
                        this.clientId +
                        "&package=" +
                        btn.dataset.package;
                }
            );
        });

    // ȘEDINȚĂ

    container
        .querySelectorAll(
            ".session-tile"
        )
        .forEach(tile => {

            tile.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "../Sedinta/Sedinta.html" +
                        "?client=" +
                        this.clientId +
                        "&package=" +
                        tile.dataset.package +
                        "&session=" +
                        tile.dataset.session;
                }
            );

container
    .querySelectorAll(
        ".session-schedule-btn"
    )
    .forEach(btn => {

        btn.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                this.openScheduleModal(

                    btn.dataset.package,

                    btn.dataset.session
                );
            }
        );
    });
        });
}

    async savePackage() {

        const packageId =
            document.getElementById(
                "packageSelect"
            ).value;

        const startDate =
            document.getElementById(
                "packageStartDate"
            ).value;



        if (
            !packageId ||
            !startDate 
        ) {

            alert(
                "Completați toate câmpurile."
            );

            return;
        }

        const packages =
            await this.getAllRecords(
                this.packagesTable
            );

        const selectedPackage =
            packages.find(
                x =>
                    Number(x.id) ===
                    Number(packageId)
            );

        const nrSessions =
            Number(
                selectedPackage?.sessions || 0
            );

        const sessions = [];

        for (
            let i = 1;
            i <= nrSessions;
            i++
        ) {

sessions.push({

    number: i,

    status: "new",

    scheduled_date: "",

    scheduled_time: ""
});
        }

        const data = {

            client_id:
                this.clientId,

            package_id:
                Number(
                    packageId
                ),

            start_date:
                startDate,

            

            sessions
        };

        const tx =
            this.db.transaction(
                [this.clientPackagesTable],
                "readwrite"
            );

        const request =
            tx.objectStore(
                this.clientPackagesTable
            ).add(data);

        await new Promise(
            (resolve, reject) => {

            request.onsuccess =
                () => resolve();

            request.onerror =
                () => reject();
        });

        closePackageModal();

        await this.renderClientPackages();
    }
    async saveSessionSchedule() {

    const packageId =
        Number(
            document.getElementById(
                "schedulePackageId"
            ).value
        );

    const sessionNumber =
        Number(
            document.getElementById(
                "scheduleSessionNumber"
            ).value
        );

    const date =
        document.getElementById(
            "scheduledDate"
        ).value;

    const time =
        document.getElementById(
            "scheduledTime"
        ).value;

    const clientPackages =
        await this.getAllRecords(
            this.clientPackagesTable
        );

    const current =
        clientPackages.find(
            x =>
                Number(x.id)
                ===
                packageId
        );

    const session =
        current.sessions.find(
            s =>
                s.number ===
                sessionNumber
        );

    session.scheduled_date =
        date;

    session.scheduled_time =
        time;

    const tx =
        this.db.transaction(
            [this.clientPackagesTable],
            "readwrite"
        );

    tx.objectStore(
        this.clientPackagesTable
    ).put(current);

    await this.renderClientPackages();

    closeScheduleModal();
}
openScheduleModal(
    packageId,
    sessionNumber
) {

    document.getElementById(
        "schedulePackageId"
    ).value =
        packageId;

    document.getElementById(
        "scheduleSessionNumber"
    ).value =
        sessionNumber;

    document.getElementById(
        "scheduleSessionModal"
    ).style.display =
        "flex";
}

    resetPackageForm() {

        document
            .getElementById(
                "packageForm"
            )
            ?.reset();

        const today =
            new Date()
                .toISOString()
                .split("T")[0];

        document.getElementById(
            "packageStartDate"
        ).value = today;
    }
}

function openPackageModal() {

    document.getElementById(
        "packageModal"
    ).style.display =
        "flex";
}

function closePackageModal() {

    document.getElementById(
        "packageModal"
    ).style.display =
        "none";
}
function openScheduleModal() {

    document.getElementById(
        "scheduleSessionModal"
    ).style.display =
        "flex";
}

function closeScheduleModal() {

    document.getElementById(
        "scheduleSessionModal"
    ).style.display =
        "none";
}
let profileManager;

window.addEventListener(
    "DOMContentLoaded",
    () => {

        profileManager =
            new ProfilClientManager();

        window.closePackageModal =
            closePackageModal;

            window.openScheduleModal =
    openScheduleModal;

window.closeScheduleModal =
    closeScheduleModal;
    }
);