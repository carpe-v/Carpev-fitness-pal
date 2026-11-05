// ============================================
// DASHBOARD
// ============================================

class DashboardManager {

    constructor() {

        this.dbName = "carpevDB";

        this.db = null;

        this.init();
    }

    async init() {

        try {

            await this.openDatabase();

            await this.loadCounters();

            await this.loadCalendar();

            await this.loadUpcomingSessions();

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
                event => {

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

    async getAllRecords(
        tableName
    ) {

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

    async loadCounters() {

        const clients =
            await this.getAllRecords(
                "Clienti"
            );

        const exercises =
            await this.getAllRecords(
                "Exercitii"
            );

        const workouts =
            await this.getAllRecords(
                "Workouts"
            );

        const clientPackages =
            await this.getAllRecords(
                "ClientPackages"
            );

        document.getElementById(
            "clientsCount"
        ).textContent =
            clients.length;

        document.getElementById(
            "packagesCount"
        ).textContent =
            clientPackages.length;

        document.getElementById(
            "exercisesCount"
        ).textContent =
            exercises.length;

        document.getElementById(
            "workoutsCount"
        ).textContent =
            workouts.length;
    }

    async loadCalendar() {

        const clients =
            await this.getAllRecords(
                "Clienti"
            );

        const packages =
            await this.getAllRecords(
                "ClientPackages"
            );

        const events = [];

        packages.forEach(pkg => {

            (pkg.sessions || [])
            .forEach(session => {

                if (
                    !session.scheduled_date
                ) {
                    return;
                }

                const client =
                    clients.find(
                        x =>
                            Number(
                                x.id
                            )
                            ===
                            Number(
                                pkg.client_id
                            )
                    );

                const eventDate =
                    session.scheduled_time
                    ? `${session.scheduled_date}T${session.scheduled_time}`
                    : session.scheduled_date;

                events.push({

                    title:
                        `${client?.first_name || ""} ${client?.last_name || ""} (S${session.number})`,

                    start:
                        eventDate,

                    extendedProps: {

                        clientId:
                            pkg.client_id,

                        packageId:
                            pkg.id,

                        sessionNumber:
                            session.number
                    }
                });
            });
        });

        const el =
            document.getElementById(
                "calendar"
            );

        if (!el) return;

        const calendar =
            new FullCalendar.Calendar(
                el,
                {

                initialView:
                    "dayGridMonth",

                locale:
                    "ro",

                firstDay:
                    1,

                height:
                    "auto",

                events,

                eventClick:
                    info => {

                    const event =
                        info.event;

                    const clientId =
                        event.extendedProps
                            .clientId;

                    const packageId =
                        event.extendedProps
                            .packageId;

                    const sessionNumber =
                        event.extendedProps
                            .sessionNumber;

                    window.location.href =
                        "clients/Sedinta/Sedinta.html" +
                        "?client=" +
                        clientId +
                        "&package=" +
                        packageId +
                        "&session=" +
                        sessionNumber;
                }
            });

        calendar.render();
    }

    async loadUpcomingSessions() {

        const container =
            document.getElementById(
                "upcomingSessions"
            );

        if (!container)
            return;

        const clients =
            await this.getAllRecords(
                "Clienti"
            );

        const packages =
            await this.getAllRecords(
                "ClientPackages"
            );

        const sessions = [];

        packages.forEach(pkg => {

            (pkg.sessions || [])
            .forEach(session => {

                if (
                    !session.scheduled_date
                ) {
                    return;
                }

                const client =
                    clients.find(
                        x =>
                            Number(
                                x.id
                            )
                            ===
                            Number(
                                pkg.client_id
                            )
                    );

                sessions.push({

                    client:

                        `${client?.first_name || ""} ${client?.last_name || ""}`,

                    sessionNumber:
                        session.number,

                    packageId:
                        pkg.id,

                    clientId:
                        pkg.client_id,

                    date:
                        session.scheduled_date,

                    time:
                        session.scheduled_time || ""
                });
            });
        });

        sessions.sort(
            (a, b) =>
                new Date(
                    `${a.date} ${a.time}`
                )
                -
                new Date(
                    `${b.date} ${b.time}`
                )
        );

        const nextTen =
            sessions.slice(
                0,
                10
            );

        if (
            nextTen.length === 0
        ) {

            container.innerHTML = `
                <div class="empty-message">
                    Nu există ședințe programate.
                </div>
            `;

            return;
        }

        container.innerHTML =
            nextTen.map(
                item => `

                <div
                    class="upcoming-session">

                    <div
                        class="upcoming-session-left">

                        <div
                            class="upcoming-client">

                            ${item.client}

                        </div>

                        <div
                            class="upcoming-date">

                            ${item.date}
                            ${item.time}

                        </div>

                    </div>

                    <div
                        class="upcoming-session-number">

                        Ședința
                        ${item.sessionNumber}

                    </div>

                </div>

            `
            ).join("");

        container
            .querySelectorAll(
                ".upcoming-session"
            )
            .forEach(
                (
                    element,
                    index
                ) => {

                const item =
                    nextTen[index];

                element.addEventListener(
                    "click",
                    () => {

                        window.location.href =
                            "clients/Sedinta/Sedinta.html" +
                            "?client=" +
                            item.clientId +
                            "&package=" +
                            item.packageId +
                            "&session=" +
                            item.sessionNumber;
                    }
                );
            });
    }
}

window.addEventListener(
    "DOMContentLoaded",
    () => {

        new DashboardManager();
    }
);