function setHatTitle(n, lang, word) {
    if (n > 999 || n < 0) {
        console.error("Invalid number");
        return;
    }
    if (n < 10) {
        document.querySelector("use#digitA").setAttribute("style", "display:none;");
        document.querySelector("use#digitB").setAttribute("style", "display:none;");
        document.querySelector("use#digitC").setAttribute("style", "display:;");
        document.querySelector("use#digitD").setAttribute("style", "display:none;");
        document.querySelector("use#digitE").setAttribute("style", "display:none;");
        document.querySelector("use#digitC").setAttribute("xlink:href", `#${n}c`);
    } else if (n < 100) {
        document.querySelector("use#digitA").setAttribute("style", "display:none;");
        document.querySelector("use#digitB").setAttribute("style", "display:;");
        document.querySelector("use#digitC").setAttribute("style", "display:none;");
        document.querySelector("use#digitD").setAttribute("style", "display:;");
        document.querySelector("use#digitE").setAttribute("style", "display:none;");
        document.querySelector("use#digitB").setAttribute("xlink:href", `#${(n - n % 10) / 10}b`);
        document.querySelector("use#digitD").setAttribute("xlink:href", `#${n % 10}d`);
    } else if (n < 1000) {
        document.querySelector("use#digitA").setAttribute("style", "display:;");
        document.querySelector("use#digitB").setAttribute("style", "display:none;");
        document.querySelector("use#digitC").setAttribute("style", "display:;");
        document.querySelector("use#digitD").setAttribute("style", "display:none;");
        document.querySelector("use#digitE").setAttribute("style", "display:;");
        document.querySelector("use#digitA").setAttribute("xlink:href", `#${(n - n % 100) / 100}a`);
        document.querySelector("use#digitC").setAttribute("xlink:href", `#${(n % 100 - n % 10) / 10}c`);
        document.querySelector("use#digitE").setAttribute("xlink:href", `#${n % 10}e`);
    }
    let fl = "2";
    let lng = {
        words: "w",
        rounds: "r"
    }[word]
    switch (lang) {
        case "ru":
            if (n % 10 == 1 && n % 100 != 11) {
                fl = "1";
            } else if (0 < n % 10 && n % 10 < 5 && n % 100 != 10 + n % 10) {
                fl = "2a";
            }
            lng += "RU";
            break;
        case "en":
            if (n == 1) {
                fl = "1"
            }
            lng += "EN";
            break;
    }
    if (n == 57) {
        lng = "forever";
        fl = "";
    }
    document.querySelector("use#bottom").setAttribute("xlink:href", `#${lng}${fl}`);
}
