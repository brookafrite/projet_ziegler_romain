"use strict";

document.addEventListener("DOMContentLoaded", function () {

    /* ============================================
       1. RÉCUPÉRATION DES ÉLÉMENTS DU DOM
       ============================================ */
    const form = document.getElementById("signup-form");
    const errorBox = document.getElementById("error-box");
    const errorList = document.getElementById("error-list");
    const formSection = document.getElementById("form-section");
    const summarySection = document.getElementById("summary-section");
    const btnBack = document.getElementById("btn-back");

    /* ============================================
       2. DÉFINITION DES CHAMPS À VALIDER
       ============================================ */
    const fields = [
        { id: "login",      label: "Login" },
        { id: "password",   label: "Mot de passe" },
        { id: "confirm",    label: "Confirmation du mot de passe" },
        { id: "lastname",   label: "Nom" },
        { id: "firstname",  label: "Prénom" },
        { id: "address",    label: "Adresse" },
        { id: "email",      label: "Email" },
        { id: "phone",      label: "Téléphone" },
        { id: "birthdate",  label: "Date de naissance" }
    ];

    /* ============================================
       3. FONCTIONS UTILITAIRES
       ============================================ */
    function getInput(id) {
        return document.getElementById(id);
    }

    function clearErrors() {
        errorBox.classList.add("hidden");
        errorList.innerHTML = "";

        fields.forEach(function (field) {
            getInput(field.id).classList.remove("invalid");
        });
    }

    function showErrors(messages) {
        errorList.innerHTML = "";

        messages.forEach(function (message) {
            const li = document.createElement("li");
            li.textContent = message;
            errorList.appendChild(li);
        });

        errorBox.classList.remove("hidden");
        errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function markInvalid(id) {
        getInput(id).classList.add("invalid");
    }

    /* ============================================
       4. VALIDATIONS SPÉCIFIQUES
       ============================================ */
    function isValidEmail(email) {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        return pattern.test(email);
    }

    /* ============================================
       5. VALIDATION DU FORMULAIRE
       ============================================ */
    function validateForm() {
        const errors = [];

        fields.forEach(function (field) {
            const value = getInput(field.id).value.trim();

            if (value === "") {
                errors.push("Le champ « " + field.label + " » est obligatoire.");
                markInvalid(field.id);
            }
        });

        const email = getInput("email").value.trim();

        if (email !== "" && !isValidEmail(email)) {
            errors.push("L'adresse email n'est pas valide.");
            markInvalid("email");
        }

        const password = getInput("password").value;
        const confirm = getInput("confirm").value;

        if (password !== "" && confirm !== "" && password !== confirm) {
            errors.push("Le mot de passe et sa confirmation ne correspondent pas.");
            markInvalid("password");
            markInvalid("confirm");
        }

        return errors;
    }

    /* ============================================
       6. AFFICHAGE DU RÉCAPITULATIF
       ============================================ */
    function formatDate(dateString) {
        if (!dateString) return "";

        const parts = dateString.split("-");
        return parts[2] + "/" + parts[1] + "/" + parts[0];
    }

    function showSummary() {
        document.getElementById("r-login").textContent     = getInput("login").value.trim();
        document.getElementById("r-lastname").textContent  = getInput("lastname").value.trim();
        document.getElementById("r-firstname").textContent = getInput("firstname").value.trim();
        document.getElementById("r-address").textContent   = getInput("address").value.trim();
        document.getElementById("r-email").textContent     = getInput("email").value.trim();
        document.getElementById("r-phone").textContent     = getInput("phone").value.trim();
        document.getElementById("r-birthdate").textContent = formatDate(getInput("birthdate").value);

        formSection.classList.add("hidden");
        summarySection.classList.remove("hidden");

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    /* ============================================
       7. GESTION DES ÉVÉNEMENTS
       ============================================ */
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        clearErrors();

        const errors = validateForm();

        if (errors.length > 0) {
            showErrors(errors);
        } else {
            showSummary();
        }
    });

    btnBack.addEventListener("click", function () {
        summarySection.classList.add("hidden");
        formSection.classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    fields.forEach(function (field) {
        getInput(field.id).addEventListener("input", function () {
            this.classList.remove("invalid");
        });
    });

});   // ← la fonction ne se ferme qu'ICI, tout à la fin