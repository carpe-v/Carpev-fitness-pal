// ============================================
// DEMO DATA
// ============================================

class DemoDataManager {

    constructor() {

        this.dbName = "carpevDB";
        this.db = null;
    }

    async init() {

        await this.openDatabase();
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

async clearStore(
    storeName
) {

    if (
        !this.db.objectStoreNames.contains(
            storeName
        )
    ) {

        return;
    }

    return new Promise(
        (resolve, reject) => {

        const tx =
            this.db.transaction(
                [storeName],
                "readwrite"
            );

        const request =
            tx.objectStore(
                storeName
            ).clear();

        request.onerror =
            () =>
                reject(
                    request.error
                );

        tx.oncomplete =
            () => resolve();

        tx.onerror =
            () =>
                reject(
                    tx.error
                );
    });
}

    async addMany(
        storeName,
        records
    ) {

        return new Promise(
            (resolve, reject) => {

            const tx =
                this.db.transaction(
                    [storeName],
                    "readwrite"
                );

            const store =
                tx.objectStore(
                    storeName
                );

            const ids = [];

            records.forEach(
                item => {

                const request =
                    store.add(item);

                request.onsuccess =
                    () => {

                    ids.push(
                        request.result
                    );
                };
            });

            tx.oncomplete =
                () =>
                    resolve(
                        ids
                    );

            tx.onerror =
                () =>
                    reject(
                        tx.error
                    );
        });
    }

    async generate() {

        const stores = [

            "GrupeMusculare",
            "CategoriiExercitii",
            "Echipamente",
            "Exercitii",
            "Workouts",
            "Pachete",
            "Clienti",
            "ClientPackages",
            "Sedinte"
        ];

        for (
            const store
            of stores
        ) {

            await this.clearStore(
                store
            );
        }

        // =====================
        // GRUPE
        // =====================

        await this.addMany(
            "GrupeMusculare",
            [

                { name: "Piept" },
                { name: "Spate" },
                { name: "Umeri" },
                { name: "Biceps" },
                { name: "Triceps" },
                { name: "Cvadriceps" },
                { name: "Femurali" },
                { name: "Abdomen" }

            ]
        );

        // =====================
        // CATEGORII
        // =====================

        await this.addMany(
            "CategoriiExercitii",
            [

                { name: "Compuse" },
                { name: "Izolare" },
                { name: "Împins" },
                { name: "Tracțiuni" }

            ]
        );

        // =====================
        // ECHIPAMENTE
        // =====================

        await this.addMany(
            "Echipamente",
            [

                {
                    name: "Bară",
                    type: "liber"
                },

                {
                    name: "Gantere",
                    type: "liber"
                },

                {
                    name: "Cable Cross",
                    type: "aparat"
                }

            ]
        );

        // =====================
        // EXERCIȚII
        // =====================

        const exerciseIds =
            await this.addMany(
                "Exercitii",
                [

                    {
                        name: "Bench Press",

                        categories: [
                            "Compuse",
                            "Împins"
                        ],

                        muscles: [
                            "Piept",
                            "Triceps"
                        ],

                        equipment: [
                            "Bară"
                        ]
                    },

                    {
                        name: "Incline Press",

                        categories: [
                            "Compuse",
                            "Împins"
                        ],

                        muscles: [
                            "Piept"
                        ],

                        equipment: [
                            "Gantere"
                        ]
                    },

                    {
                        name: "Lat Pulldown",

                        categories: [
                            "Compuse",
                            "Tracțiuni"
                        ],

                        muscles: [
                            "Spate"
                        ],

                        equipment: [
                            "Cable Cross"
                        ]
                    }

                ]
            );

        // =====================
        // WORKOUTS
        // =====================

        await this.addMany(
            "Workouts",
            [

                {
                    name: "Push Day",

                    exercise_ids: [

                        exerciseIds[0],
                        exerciseIds[1]
                    ]
                },

                {
                    name: "Pull Day",

                    exercise_ids: [

                        exerciseIds[2]
                    ]
                }
            ]
        );

        // =====================
        // PACHETE
        // =====================

        await this.addMany(
            "Pachete",
            [

                {
                    name: "Basic",
                    sessions: 8,
                    price: 400,
                    demo: true
                },

                {
                    name: "Premium",
                    sessions: 12,
                    price: 700,
                    demo: true
                }
            ]
        );

       // =====================
// CLIENTI
// =====================

const clientIds =
    await this.addMany(
        "Clienti",
        [

            {
                first_name:
                    "Ion",

                last_name:
                    "Popescu",

                phone:
                    "0712345678",

                email:
                    "ion@test.ro",

                birth_date:
                    "1992-05-14",

                weight:
                    82,

                height:
                    180,

                activity_level:
                    "moderat",

                experience_level:
                    "intermediar",

                package_id:
                    null,

                notes:
                    "Client demo"
            },

            {
                first_name:
                    "Maria",

                last_name:
                    "Ionescu",

                phone:
                    "0723456789",

                email:
                    "maria@test.ro",

                birth_date:
                    "1995-03-10",

                weight:
                    58,

                height:
                    167,

                activity_level:
                    "usor",

                experience_level:
                    "incepator",

                package_id:
                    null,

                notes:
                    "Client demo"
            }

        ]
    );

// =====================
// CLIENT PACKAGES
// =====================

const today =
    new Date();

const packageStore =
    this.db.transaction(
        ["ClientPackages"],
        "readwrite"
    )
    .objectStore(
        "ClientPackages"
    );
const clientPackageIds = [];
for (
    let index = 0;
    index < clientIds.length;
    index++
) {

    const sessions = [];

    for (
        let s = 1;
        s <= 12;
        s++
    ) {

        const sessionDate =
            new Date(
                today
            );

        sessionDate.setDate(
            today.getDate() +
            (s * 2)
        );

        sessions.push({

            number: s,

            status:
                "scheduled",

            scheduled_date:
                sessionDate
                    .toISOString()
                    .split("T")[0],

            scheduled_time:
                "18:00"
        });
    }

const clientPackageId =
    await new Promise(
        (resolve, reject) => {

        const request =
            packageStore.add({

                client_id:
                    clientIds[index],

                package_id: 2,

                start_date:
                    today
                    .toISOString()
                    .split("T")[0],

                sessions
            });

        request.onsuccess =
            () =>
                resolve(
                    request.result
                );

        request.onerror =
            () =>
                reject();
    });

clientPackageIds.push(
    clientPackageId
);
}
// =====================
// SEDINTE
// =====================

const sessionStore =
    this.db.transaction(
        ["Sedinte"],
        "readwrite"
    )
    .objectStore(
        "Sedinte"
    );

for (
    let clientIndex = 0;
    clientIndex < clientIds.length;
    clientIndex++
) {

    for (
        let sessionNumber = 1;
        sessionNumber <= 12;
        sessionNumber++
    ) {

        const benchPressId =
            exerciseIds[0];

        const inclinePressId =
            exerciseIds[1];

        await new Promise(
            (resolve, reject) => {

            const request =
                sessionStore.add({

                    client_id:
                        clientIds[
                            clientIndex
                        ],

                    package_id:
                        clientPackageIds[
                            clientIndex
                        ],

                    session_number:
                        sessionNumber,

                    exercises: [

                        {

                            exercise_id:
                                benchPressId,

                            planned: [

                                {
                                    reps: 10,
                                    weight: 60
                                },

                                {
                                    reps: 10,
                                    weight: 60
                                },

                                {
                                    reps: 8,
                                    weight: 70
                                }

                            ],

                            executed: [

                                {
                                    reps: 10,
                                    weight: 60
                                },

                                {
                                    reps: 10,
                                    weight: 60
                                },

                                {
                                    reps: 7,
                                    weight: 70
                                }

                            ],

                            trainer_notes:
                                "Execuție bună."
                        },

                        {

                            exercise_id:
                                inclinePressId,

                            planned: [

                                {
                                    reps: 12,
                                    weight: 20
                                },

                                {
                                    reps: 12,
                                    weight: 20
                                }

                            ],

                            executed: [

                                {
                                    reps: 12,
                                    weight: 20
                                },

                                {
                                    reps: 10,
                                    weight: 20
                                }

                            ],

                            trainer_notes:
                                ""
                        }

                    ]
                });

            request.onsuccess =
                () => resolve();

            request.onerror =
                () => reject();
        });
    }
}
return true;
        
    }
}

async function generateDemoData() {

    const demo =
        new DemoDataManager();

    await demo.init();

    await demo.generate();

    alert(
        "✅ Date demo generate."
    );
}
