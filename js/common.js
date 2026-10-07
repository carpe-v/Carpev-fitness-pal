const DB_KEY = "carpevFitnessV2";

function createEmptyDB() {

    return {

        clienti: [],

        aparate: [],

        exercitii: [],
        grupeMusculare: [],
categories: [],
        oferte: [],

        templateuri: [],

        sedinte: []

    };

}

function getDB() {

    const db =
        JSON.parse(
            localStorage.getItem(
                DB_KEY
            )
        );

    return db || {

        clienti: [],
        aparate: [],
        exercitii: [],
        grupeMusculare: [],
        categories: [],
        oferte: [],
        templateuri: [],
        sedinte: []

    };

}
function saveDB(db) {

    localStorage.setItem(
        DB_KEY,
        JSON.stringify(db)
    );

}

function generateId() {

    return Date.now() +
        Math.floor(
            Math.random() * 1000
        );

}
function openModal(id) {

    document
        .getElementById(id)
        ?.classList
        .add("show");

}
function closeModal(id) {

    document
        .getElementById(id)
        ?.classList
        .remove("show");

}
function resetDB() {

    localStorage.removeItem(
        DB_KEY
    );

}

function showToast(message) {

    alert(message);

}