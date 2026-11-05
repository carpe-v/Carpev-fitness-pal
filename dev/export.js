// ============================================
// BACKUP / RESTORE JSON
// ============================================

const BACKUP_TABLES = [

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

// ============================================
// OPEN DB
// ============================================

async function openBackupDatabase() {

    return new Promise(
        (resolve, reject) => {

        const request =
            indexedDB.open(
                "carpevDB"
            );

        request.onsuccess =
            event =>
                resolve(
                    event.target.result
                );

        request.onerror =
            () =>
                reject(
                    request.error
                );
        });
}

// ============================================
// GET STORE DATA
// ============================================

async function getStoreData(
    db,
    tableName
) {

    return new Promise(
        (resolve, reject) => {

        if (
            !db.objectStoreNames.contains(
                tableName
            )
        ) {

            resolve([]);

            return;
        }

        const tx =
            db.transaction(
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

// ============================================
// EXPORT JSON
// ============================================

async function exportBackup() {

    const db =
        await openBackupDatabase();

    const backup = {

        exported_at:
            new Date()
                .toISOString(),

        version: 1,

        data: {}
    };

    for (
        const table
        of BACKUP_TABLES
    ) {

        backup.data[
            table
        ] =
            await getStoreData(
                db,
                table
            );
    }

    const json =
        JSON.stringify(
            backup,
            null,
            2
        );

    const blob =
        new Blob(
            [json],
            {
                type:
                "application/json"
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const link =
        document.createElement(
            "a"
        );

    link.href =
        url;

    link.download =
        `carpevDB_backup_${new Date()
            .toISOString()
            .split("T")[0]}.json`;

    document.body.appendChild(
        link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
        url
    );

    return true;
}

// ============================================
// IMPORT JSON
// ============================================

async function importBackup(
    file
) {

    const text =
        await file.text();

    const backup =
        JSON.parse(
            text
        );

    if (
        !backup.data
    ) {

        throw new Error(
            "Format backup invalid."
        );
    }

    const db =
        await openBackupDatabase();

    for (
        const table
        of BACKUP_TABLES
    ) {

        if (
            !db.objectStoreNames.contains(
                table
            )
        ) {

            continue;
        }

        const tx =
            db.transaction(
                [table],
                "readwrite"
            );

        const store =
            tx.objectStore(
                table
            );

        await new Promise(
            (
                resolve,
                reject
            ) => {

            const clear =
                store.clear();

            clear.onsuccess =
                () =>
                    resolve();

            clear.onerror =
                () =>
                    reject();
        });

        for (
            const row
            of (
                backup.data[
                    table
                ] || []
            )
        ) {

            try {

                store.add(
                    row
                );

            } catch (
                error
            ) {

                console.error(
                    error
                );
            }
        }

        await new Promise(
            (
                resolve,
                reject
            ) => {

            tx.oncomplete =
                () =>
                    resolve();

            tx.onerror =
                () =>
                    reject(
                        tx.error
                    );
        });
    }

    return true;
}