let token = null;

/* ============================
   AUTH: LOGIN
   ============================ */
async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (data.token) {
        token = data.token;
        alert("Logged in successfully!");
    } else {
        alert("Login failed.");
    }
}

/* ============================
   GITHUB REPOS
   ============================ */
async function loadRepos() {
    if (!token) {
        alert("Please login first.");
        return;
    }

    const githubUser = document.getElementById("githubUsername").value;

    const response = await fetch(`/weather/repos/${githubUser}`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    const repos = await response.json();

    $("#repoGrid").kendoGrid({
        dataSource: { data: repos },
        sortable: true,
        pageable: true,
        filterable: true,
        columns: [
            { field: "name", title: "Repository Name" },
            {
                field: "html_Url",
                title: "URL",
                template: "<a href='#=html_Url#' target='_blank'>#=html_Url#</a>"
            }
        ]
    });
}

/* ============================
   ACCOUNT CREATION
   ============================ */
async function createAccount() {
    const username = document.getElementById("ca-username").value.trim();
    const password = document.getElementById("ca-password").value;
    const confirm = document.getElementById("ca-confirm").value;

    if (!username || !password || !confirm) {
        alert("Please fill out all fields.");
        return;
    }

    if (password !== confirm) {
        alert("Passwords do not match.");
        return;
    }

    try {
        const response = await fetch("/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const errorText = await response.text();
            alert("Registration failed: " + errorText);
            return;
        }

        alert("Account created! You may now login.");
        window.location.href = "index.html";

    } catch (err) {
        alert("Error connecting to server: " + err);
    }
}

/* ============================
   XML REPOS (KENDO CARDS)
   ============================ */
async function loadXmlRepos() {
    const output = document.getElementById("xmlOutput");
    output.textContent = "Loading XML...";

    try {
        const response = await fetch("repos.xml");
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);

        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");

        const parseError = xmlDoc.getElementsByTagName("parsererror")[0];
        if (parseError) {
            output.textContent = "Error parsing XML.";
            return;
        }

        const repoNodes = Array.from(xmlDoc.getElementsByTagName("repo"));

        if (repoNodes.length === 0) {
            output.textContent = "No <repo> elements found in XML.";
            return;
        }

        output.innerHTML = "";

        repoNodes.forEach(repoNode => {
            const name = repoNode.getElementsByTagName("name")[0]?.textContent ?? "";
            const description = repoNode.getElementsByTagName("description")[0]?.textContent ?? "";
            const stars = repoNode.getElementsByTagName("stars")[0]?.textContent ?? "";
            const url = repoNode.getElementsByTagName("url")[0]?.textContent ?? "";

            const card = document.createElement("div");
            card.className = "k-card k-card-type-rich";
            card.style.marginBottom = "1rem";

            card.innerHTML = `
                <div class="k-card-header">
                    <h3 class="k-card-title">${name}</h3>
                    <p class="k-card-subtitle">${stars} &#11088;</p>
                </div>

                <div class="k-card-body">
                    <p>${description}</p>
                </div>

                <div class="k-card-actions k-card-actions-stretched">
                    <a href="${url}" target="_blank" class="k-button k-button-solid-base">
                        View Repo
                    </a>
                </div>
            `;

            output.appendChild(card);
        });

    } catch (err) {
        console.error(err);
        output.textContent = "Failed to load XML data.";
    }
}

/* ============================
   KENDO UI INITIALIZATION
   ============================ */
$(document).ready(function () {

    // Login
    $("#username").kendoTextBox();
    $("#password").kendoTextBox();
    $("#loginButton").kendoButton();

    // GitHub section
    $("#githubUsername").kendoTextBox();
    $("#loadRepos").kendoButton();

    // Repo Grid
    $("#repoGrid").kendoGrid();

    // Create Account
    $("#ca-username").kendoTextBox();
    $("#ca-password").kendoTextBox();
    $("#ca-confirm").kendoTextBox();
    $("#createAccountButton").kendoButton();

    // XML Loader
    $("#loadXmlBtn").kendoButton();
});
