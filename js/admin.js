/* ==================================================
DASHBOARD
================================================== */

document
    .getElementById(
        "adminBackToDashboardBtn"
    )
    ?.addEventListener(
        "click",
        () => {

            window.location.href =
                "main.html";

        }
    );
/* ==================================================
OFFERS
================================================== */
document
    .querySelector(
        '[data-page="offers"]'
    )
    ?.addEventListener(
        "click",
        () => renderOffersPage()
    );

/* ==================================================
EQUIPMENT
================================================== */

    document
    .querySelector(
        '[data-page="equipment"]'
    )
    ?.addEventListener(
        "click",
       () => renderEquipmentPage()
    );

/* ==================================================
Grupe Musculare
================================================== */

    document
    .querySelector(
        '[data-page="muscles"]'
    )
    ?.addEventListener(
        "click",
        () => renderMuscleGroupsPage()
    );


   /* ==================================================
Grupe Musculare
================================================== */
 
    document
    .querySelector(
        '[data-page="categories"]'
    )
    ?.addEventListener(
        "click",
        () =>  renderCategoriesPage()
    );

   /* ==================================================
Exercitii
================================================== */

    document
    .querySelector(
        '[data-page="exercises"]'
    )
    ?.addEventListener(
        "click",
       () =>  renderExercisesPage()
    );

   /* ==================================================
template
================================================== */
    document
    .querySelector(
        '[data-page="templates"]'
    )
    ?.addEventListener(
        "click",
        () =>  renderTemplatesPage()
    );


   /* ==================================================
seed
================================================== */
    document
    .getElementById(
        "seedDbBtn"
    )
    ?.addEventListener(
        "click",
        () =>seedDB()
    
    );



   /* ==================================================
/Delete
================================================== */
function clearAllData() {

    if (
        !confirm(
            "Se vor șterge toate datele aplicației Carpev Fitness. Continui?"
        )
    ) {
        return;
    }

    localStorage.removeItem(
        "carpevFitnessV2"
    );

    alert(
        "Datele au fost șterse."
    );

    location.reload();

}
    document
    .getElementById(
        "clearDataBtn"
    )
    ?.addEventListener(
        "click",
        ()=>clearAllData()
    );
