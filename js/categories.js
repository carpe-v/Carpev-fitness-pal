/* ==================================================
   PAGE
================================================== */

function renderCategoriesPage() {

    const adminContent =
        document.getElementById(
            "adminContent"
        );

    adminContent.innerHTML = `

        <div class="category-page">

            <div class="category-page-header">

                <h1 class="category-page-title">

                    Categorii

                </h1>

                <button
                    id="categoryAddBtn"
                    class="category-add-btn">

                    + Adaugă Categorie

                </button>

            </div>

            <div
                id="categoryGrid"
                class="category-grid">

            </div>

        </div>

        <div
            id="categoryModal"
            class="category-modal">

            <div class="category-modal-content">

                <div class="category-modal-header">

                    <h2>

                        Categorie Nouă

                    </h2>

                    <button
                        id="categoryCloseBtn"
                        class="category-close-btn">

                        ×

                    </button>

                </div>

                <div class="category-modal-body">

                    <input
                        id="categoryNameInput"
                        class="category-input"
                        type="text"
                        placeholder="Nume categorie">

                    <button
                        id="categorySaveBtn"
                        class="category-save-btn">

                        Salvează

                    </button>

                </div>

            </div>

        </div>

    `;

    renderCategories();

    document
        .getElementById(
            "categoryAddBtn"
        )
        ?.addEventListener(
            "click",
            openCategoryModal
        );

    document
        .getElementById(
            "categoryCloseBtn"
        )
        ?.addEventListener(
            "click",
            closeCategoryModal
        );

    document
        .getElementById(
            "categorySaveBtn"
        )
        ?.addEventListener(
            "click",
            saveCategory
        );

}

/* ==================================================
   RENDER
================================================== */

function renderCategories() {

    const db =
        getDB();

    const categoryGrid =
        document.getElementById(
            "categoryGrid"
        );

    if (!categoryGrid)
        return;

    const categories =
        db.categories || [];

    categoryGrid.innerHTML =
        categories
            .map(
                category => `

                    <div class="category-card">

                        <div class="category-card-name">

                            ${category.nume}

                        </div>

                        <div class="category-card-actions">

                            <button
                                class="category-delete-btn"
                                onclick="deleteCategory(${category.id})">

                                Șterge

                            </button>

                        </div>

                    </div>

                `
            )
            .join("");

}

/* ==================================================
   MODAL
================================================== */

function openCategoryModal() {

    document
        .getElementById(
            "categoryModal"
        )
        ?.classList
        .add(
            "show"
        );

}

function closeCategoryModal() {

    document
        .getElementById(
            "categoryModal"
        )
        ?.classList
        .remove(
            "show"
        );

}

/* ==================================================
   SAVE
================================================== */

function saveCategory() {

    const nume =
        document
            .getElementById(
                "categoryNameInput"
            )
            .value
            .trim();

    if (!nume) {

        alert(
            "Introduceți numele categoriei."
        );

        return;

    }

    const db =
        getDB();

    if (!db.categories) {

        db.categories = [];

    }

    db.categories.push({

        id:
            generateId(),

        nume

    });

    saveDB(
        db
    );

    renderCategories();

    document
        .getElementById(
            "categoryNameInput"
        )
        .value = "";

    closeCategoryModal();

}

/* ==================================================
   DELETE
================================================== */

function deleteCategory(id) {

    if (
        !confirm(
            "Ștergi această categorie?"
        )
    ) {
        return;
    }

    const db =
        getDB();

    db.categories =
        (db.categories || [])
            .filter(

                category =>

                    category.id !== id

            );

    saveDB(
        db
    );

    renderCategories();

}