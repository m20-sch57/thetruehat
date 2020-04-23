activePage = "mainPage"

function showPage(pageName) {
    document.querySelector('#'+activePage).style.display = "none";
    activePage = pageName;
    document.querySelector('#'+activePage).style.display = "";

    switch(pageName) {
        case "createPage":
            fetch("/getFreeKey")
                .then(response => response.json())
                .then(result => document.querySelector("#createKey").innerHTML = result.key)
            break;
    }
}

function copyKey() {
    navigator.clipboard.writeText(document.querySelector("#createKey").innerText)
}

// window.onload = function() {}
