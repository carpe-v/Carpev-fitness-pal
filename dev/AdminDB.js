// ============================================
// ADMIN DB CORE
// Carpev Fitness
// ============================================

class AdminDBManager {

    constructor() {

        this.dbName = "carpevDB";
        this.dbVersion = 1;

        this.db = null;
    }

    // =========================================
    // INIT
    // =========================================

    async init() {

        await this.openDatabase();

        return this.db;
    }

    async openDatabase() {

        return new Promise(
            (resolve, reject) => {

const request =
    indexedDB.open(
        this.dbName
    );

            request.onupgradeneeded =
                event => {

                const db =
                    event.target.result;

                this.createStores(
                    db
                );
            };

            request.onsuccess =
                event => {

                this.db =
                    event.target.result;

                console.log(
                    "✅ carpevDB deschisă"
                );

                resolve(
                    this.db
                );
            };

            request.onerror =
                () => {

                reject(
                    request.error
                );
            };
        });
    }

    // =========================================
    // STORES
    // =========================================

    createStores(db) {

        const createStore =
            name => {

            if (
                !db.objectStoreNames.contains(
                    name
                )
            ) {

                db.createObjectStore(
                    name,
                    {
                        keyPath: "id",
                        autoIncrement: true
                    }
                );

                console.log(
                    `✅ Store creat: ${name}`
                );
            }
        };

        // LOOKUPS

        createStore(
            "GrupeMusculare"
        );

        createStore(
            "CategoriiExercitii"
        );

        createStore(
            "Echipamente"
        );

        createStore(
            "Pachete"
        );

        // GYM

        createStore(
            "Exercitii"
        );

        createStore(
            "Workouts"
        );

        // CLIENTS

        createStore(
            "Clienti"
        );

        createStore(
            "ClientPackages"
        );

        createStore(
            "Sedinte"
        );
createStore(
    "Settings"
);
        // META

        createStore(
            "_metadata"
        );
    }

    // =========================================
    // GENERIC GET
    // =========================================

    async getAll(
        tableName
    ) {

        return new Promise(
            (resolve, reject) => {

            if (
                !this.db.objectStoreNames.contains(
                    tableName
                )
            ) {

                resolve([]);

                return;
            }

            const tx =
                this.db.transaction(
                    [tableName],
                    "readonly"
                );

            const request =
                tx.objectStore(
                    tableName
                )
                .getAll();

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

    async getById(
        tableName,
        id
    ) {

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
                )
                .get(id);

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

    async getCount(
        tableName
    ) {

        return new Promise(
            (resolve, reject) => {

            if (
                !this.db.objectStoreNames.contains(
                    tableName
                )
            ) {

                resolve(0);

                return;
            }

            const tx =
                this.db.transaction(
                    [tableName],
                    "readonly"
                );

            const request =
                tx.objectStore(
                    tableName
                )
                .count();

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

    // =========================================
    // CREATE
    // =========================================

    async add(
        tableName,
        data
    ) {

        return new Promise(
            (resolve, reject) => {

            const tx =
                this.db.transaction(
                    [tableName],
                    "readwrite"
                );

            const request =
                tx.objectStore(
                    tableName
                )
                .add(data);

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

    // =========================================
    // UPDATE
    // =========================================

    async update(
        tableName,
        data
    ) {

        return new Promise(
            (resolve, reject) => {

            const tx =
                this.db.transaction(
                    [tableName],
                    "readwrite"
                );

            const request =
                tx.objectStore(
                    tableName
                )
                .put(data);

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

    // =========================================
    // DELETE RECORD
    // =========================================

    async delete(
        tableName,
        id
    ) {

        return new Promise(
            (resolve, reject) => {

            const tx =
                this.db.transaction(
                    [tableName],
                    "readwrite"
                );

            const request =
                tx.objectStore(
                    tableName
                )
                .delete(id);

            request.onsuccess =
                () => resolve();

            request.onerror =
                () =>
                    reject(
                        request.error
                    );
        });
    }

    // =========================================
    // CLEAR STORE
    // =========================================

    async clear(
        tableName
    ) {

        return new Promise(
            (resolve, reject) => {

            if (
                !this.db.objectStoreNames.contains(
                    tableName
                )
            ) {

                resolve();

                return;
            }

            const tx =
                this.db.transaction(
                    [tableName],
                    "readwrite"
                );

            const request =
                tx.objectStore(
                    tableName
                )
                .clear();

            request.onsuccess =
                () => resolve();

            request.onerror =
                () =>
                    reject(
                        request.error
                    );
        });
    }

    // =========================================
    // CLEAR ALL
    // =========================================

    async clearAllTables() {

        const tables = [

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
            const table
            of tables
        ) {

            await this.clear(
                table
            );
        }
    }

    // =========================================
    // STATS
    // =========================================

    async getDatabaseStats() {

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

        const stats = {};

        for (
            const store
            of stores
        ) {

            stats[store] =
                await this.getCount(
                    store
                );
        }

        return stats;
    }

    // =========================================
    // EXPORT
    // =========================================

    async exportDatabase() {

        const tables = [

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

        const result = {};

        for (
            const table
            of tables
        ) {

            result[table] =
                await this.getAll(
                    table
                );
        }

        return result;
    }

    // =========================================
    // IMPORT
    // =========================================

    async importDatabase(
        payload
    ) {

        const tables =
            Object.keys(
                payload
            );

        for (
            const table
            of tables
        ) {

            if (
                !this.db.objectStoreNames.contains(
                    table
                )
            ) {

                continue;
            }

            await this.clear(
                table
            );

            for (
                const row
                of payload[
                    table
                ]
            ) {

                await this.add(
                    table,
                    row
                );
            }
        }
    }
}

// ============================================
// GLOBAL
// ============================================

window.AdminDB =
    new AdminDBManager();