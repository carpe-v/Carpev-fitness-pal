/* ==================================================
   SEED DB
================================================== */

function seedDB() {

    if (
        !confirm(
            "Se vor genera date demo. Continui?"
        )
    ) {
        return;
    }

  const db = {

    clienti: [],
    aparate: [],
    grupeMusculare: [],
    categories: [],
    exercitii: [],
    templateuri: [],
    sedinte: [],
    oferte: []



    };

    seedEquipment(db);

    seedMuscles(db);

    seedCategories(db);

    seedExercises(db);

    seedTemplates(db);

    seedClients(db);
seedOffers(db);
    saveDB(db);

    alert(
        "Seed DB generat cu succes."
    );

}

/* ==================================================
   EQUIPMENT
================================================== */

function seedEquipment(db) {

    db.aparate = [

        {
            id: 1,
            nume: "Liber"
        },

        {
            id: 2,
            nume: "Bară"
        },

        {
            id: 3,
            nume: "Gantere"
        },

        {
            id: 4,
            nume: "Smith Machine"
        },

        {
            id: 5,
            nume: "Cablu"
        }

    ];

}

/* ==================================================
   MUSCLES
================================================== */

function seedMuscles(db) {

    db.grupeMusculare = [

        {
            id: 1,
            nume: "Piept"
        },

        {
            id: 2,
            nume: "Spate"
        },

        {
            id: 3,
            nume: "Umeri"
        },

        {
            id: 4,
            nume: "Biceps"
        },

        {
            id: 5,
            nume: "Triceps"
        },

        {
            id: 6,
            nume: "Picioare"
        },

        {
            id: 7,
            nume: "Abdomen"
        }

    ];

}

/* ==================================================
   CATEGORIES
================================================== */

function seedCategories(db) {

    db.categories = [

        {
            id: 1,
            nume: "Forță"
        },

        {
            id: 2,
            nume: "Hipertrofie"
        },

        {
            id: 3,
            nume: "Cardio"
        },

        {
            id: 4,
            nume: "Mobilitate"
        }

    ];

}

/* ==================================================
   EXERCISES
================================================== */

function seedExercises(db) {

    db.exercitii = [

        {
            id: 1001,
            nume: "Bench Press",
            aparatId: 2,
            grupeMusculare: [1, 5],
            categories: [1]
        },

        {
            id: 1002,
            nume: "Incline Bench Press",
            aparatId: 2,
            grupeMusculare: [1, 5],
            categories: [2]
        },

        {
            id: 1003,
            nume: "Chest Fly",
            aparatId: 5,
            grupeMusculare: [1],
            categories: [2]
        },

        {
            id: 1004,
            nume: "Pull Up",
            aparatId: 1,
            grupeMusculare: [2, 4],
            categories: [1]
        },

        {
            id: 1005,
            nume: "Barbell Row",
            aparatId: 2,
            grupeMusculare: [2, 4],
            categories: [1]
        },

        {
            id: 1006,
            nume: "Shoulder Press",
            aparatId: 3,
            grupeMusculare: [3],
            categories: [2]
        },

        {
            id: 1007,
            nume: "Biceps Curl",
            aparatId: 3,
            grupeMusculare: [4],
            categories: [2]
        },

        {
            id: 1008,
            nume: "Triceps Pushdown",
            aparatId: 5,
            grupeMusculare: [5],
            categories: [2]
        },

        {
            id: 1009,
            nume: "Squat",
            aparatId: 2,
            grupeMusculare: [6],
            categories: [1]
        },

        {
            id: 1010,
            nume: "Leg Press",
            aparatId: 4,
            grupeMusculare: [6],
            categories: [2]
        }

    ];

}

/* ==================================================
   TEMPLATES
================================================== */

function seedTemplates(db) {

    db.templateuri = [

        {
            id: 5001,
            nume: "Push Day",
            exercitii: [
                1001,
                1002,
                1003,
                1006,
                1008
            ]
        },

        {
            id: 5002,
            nume: "Pull Day",
            exercitii: [
                1004,
                1005,
                1007
            ]
        },

        {
            id: 5003,
            nume: "Leg Day",
            exercitii: [
                1009,
                1010
            ]
        }

    ];

}

/* ==================================================
   CLIENTS
================================================== */

function seedClients(db) {

    db.clienti = [

        {
            id: 2001,
            activ: true,
            nume: "Andrei Popescu",
            telefon: "0711111111",
            email: "andrei@test.ro",
            numarSedinte: 12
        },

        {
            id: 2002,
            activ: true,
            nume: "Mihai Ionescu",
            telefon: "0722222222",
            email: "mihai@test.ro",
            numarSedinte: 8
        },

        {
            id: 2003,
            activ: true,
            nume: "Radu Georgescu",
            telefon: "0733333333",
            email: "radu@test.ro",
            numarSedinte: 16
        }

    ];

}

function seedOffers(db) {

    db.oferte = [

        {
            id: 3001,
            nume: "4 Ședințe",
           
            sedinte: 4
        },

        {
            id: 3002,
            nume: "8 Ședințe",
            
            sedinte: 8
        },

        {
            id: 3003,
            nume: "12 Ședințe",
            
            sedinte: 12
        }

    ];

}