// ============================================
// LOGO MANAGER
// ============================================

class LogoManager {

    constructor() {

        this.dbName = "carpevDB";

        this.db = null;

        this.init();
    }

    async init() {

        try {

            await this.openDatabase();

            await this.ensureSettingsTable();

            this.setupEventListeners();

            await this.loadLogos();

        } catch (error) {

            console.error(error);

            alert(
                "Eroare la inițializarea Logo Manager."
            );
        }
    }

    // =========================================
    // DATABASE
    // =========================================

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

    async ensureSettingsTable() {

        if (
            this.db.objectStoreNames.contains(
                "Settings"
            )
        ) {

            return;
        }

        const currentVersion =
            this.db.version;

        this.db.close();

        return new Promise(
            (resolve, reject) => {

            const request =
                indexedDB.open(
                    this.dbName,
                    currentVersion + 1
                );

            request.onupgradeneeded =
                event => {

                const db =
                    event.target.result;

                if (
                    !db.objectStoreNames.contains(
                        "Settings"
                    )
                ) {

                    db.createObjectStore(
                        "Settings",
                        {
                            keyPath: "id"
                        }
                    );
                }
            };

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

    // =========================================
    // SETTINGS
    // =========================================

    async getSetting(
        id
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
                ).get(id);

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

    async saveSetting(
        id,
        value
    ) {

        return new Promise(
            (resolve, reject) => {

            const tx =
                this.db.transaction(
                    ["Settings"],
                    "readwrite"
                );

            const request =
                tx.objectStore(
                    "Settings"
                )
                .put({

                    id,
                    value
                });

            request.onsuccess =
                () => resolve();

            request.onerror =
                () =>
                    reject(
                        request.error
                    );
        });
    }

    async deleteSetting(
        id
    ) {

        return new Promise(
            (resolve, reject) => {

            const tx =
                this.db.transaction(
                    ["Settings"],
                    "readwrite"
                );

            const request =
                tx.objectStore(
                    "Settings"
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
    // LOAD PREVIEW
    // =========================================

    async loadLogos() {

        const digital =
            await this.getSetting(
                "digitalLogo"
            );

        const print =
            await this.getSetting(
                "printLogo"
            );

        const digitalImg =
            document.getElementById(
                "digitalLogoPreview"
            );

        const printImg =
            document.getElementById(
                "printLogoPreview"
            );

        if (
            digital?.value
        ) {

            digitalImg.src =
                digital.value;

        } else {

            digitalImg.src = "";
        }

        if (
            print?.value
        ) {

            printImg.src =
                print.value;

        } else {

            printImg.src = "";
        }
    }

    // =========================================
    // FILE TO BASE64
    // =========================================

    async fileToBase64(
        file
    ) {

        return new Promise(
            (
                resolve,
                reject
            ) => {

            const reader =
                new FileReader();

            reader.onload =
                () =>
                    resolve(
                        reader.result
                    );

            reader.onerror =
                () =>
                    reject();

            reader.readAsDataURL(
                file
            );
        });
    }

    // =========================================
    // DIGITAL
    // =========================================

    async uploadDigitalLogo(
        file
    ) {

        const base64 =
            await this.fileToBase64(
                file
            );

        await this.saveSetting(

            "digitalLogo",

            base64
        );

        await this.loadLogos();

        alert(
            "✅ Logo Digital salvat."
        );
    }

    async removeDigitalLogo() {

        await this.deleteSetting(
            "digitalLogo"
        );

        await this.loadLogos();

        alert(
            "✅ Logo Digital șters."
        );
    }

    // =========================================
    // PRINT
    // =========================================

    async uploadPrintLogo(
        file
    ) {

        const base64 =
            await this.fileToBase64(
                file
            );

        await this.saveSetting(

            "printLogo",

            base64
        );

        await this.loadLogos();

        alert(
            "✅ Logo Print salvat."
        );
    }

    async removePrintLogo() {

        await this.deleteSetting(
            "printLogo"
        );

        await this.loadLogos();

        alert(
            "✅ Logo Print șters."
        );
    }

    // =========================================
    // EVENTS
    // =========================================

    setupEventListeners() {

        // =====================
        // DIGITAL
        // =====================

        document
            .getElementById(
                "uploadDigitalBtn"
            )
            ?.addEventListener(
                "click",
                () => {

                    document
                        .getElementById(
                            "digitalLogoInput"
                        )
                        ?.click();
                }
            );

        document
            .getElementById(
                "digitalLogoInput"
            )
            ?.addEventListener(
                "change",
                async event => {

                    const file =
                        event.target
                            .files?.[0];

                    if (!file)
                        return;

                    await this.uploadDigitalLogo(
                        file
                    );
                }
            );

        document
            .getElementById(
                "removeDigitalBtn"
            )
            ?.addEventListener(
                "click",
                () =>
                    this.removeDigitalLogo()
            );

        // =====================
        // PRINT
        // =====================

        document
            .getElementById(
                "uploadPrintBtn"
            )
            ?.addEventListener(
                "click",
                () => {

                    document
                        .getElementById(
                            "printLogoInput"
                        )
                        ?.click();
                }
            );

        document
            .getElementById(
                "printLogoInput"
            )
            ?.addEventListener(
                "change",
                async event => {

                    const file =
                        event.target
                            .files?.[0];

                    if (!file)
                        return;

                    await this.uploadPrintLogo(
                        file
                    );
                }
            );

        document
            .getElementById(
                "removePrintBtn"
            )
            ?.addEventListener(
                "click",
                () =>
                    this.removePrintLogo()
            );
    }

    static async getLogo(
    logoId
) {

    return new Promise(
        (resolve, reject) => {

        const request =
            indexedDB.open(
                "carpevDB"
            );

        request.onsuccess =
            event => {

            const db =
                event.target.result;

            if (
                !db.objectStoreNames.contains(
                    "Settings"
                )
            ) {

                resolve(null);

                return;
            }

            const tx =
                db.transaction(
                    ["Settings"],
                    "readonly"
                );

            const getRequest =
                tx.objectStore(
                    "Settings"
                )
                .get(
                    logoId
                );

            getRequest.onsuccess =
                () => {

                resolve(
                    getRequest.result
                        ?.value ||
                    null
                );
            };

            getRequest.onerror =
                () =>
                    reject(
                        getRequest.error
                    );
            };

        request.onerror =
            () =>
                reject(
                    request.error
                );
    });
}
}

// ============================================
// START
// ============================================

let logoManager;

window.addEventListener(
    "DOMContentLoaded",
    () => {

        logoManager =
            new LogoManager();
    }
);