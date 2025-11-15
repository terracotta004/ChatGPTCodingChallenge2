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
