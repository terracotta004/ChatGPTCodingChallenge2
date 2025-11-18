let token = null;

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

$(document).ready(function () {
    $("#username").kendoTextBox();
    $("#password").kendoTextBox();
    $("#loginButton").kendoButton();
});

$(document).ready(function () {
    $("#githubUsername").kendoTextBox();
    $("#loadRepos").kendoButton();
});

$(document).ready(function () {
    $("#repoGrid").kendoGrid();
});

$(document).ready(function () {
    $("#ca-username").kendoTextBox();
    $("#ca-password").kendoTextBox();
    $("#ca-confirm").kendoTextBox();
    $("#createAccountButton").kendoButton();
});

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
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
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
