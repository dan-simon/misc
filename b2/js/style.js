let themes = ['default', 'dark', 'cook1ee'];

function nextTheme() {
    setTheme(getNextTheme());
}


function getNextTheme() {
    return themes[(themes.indexOf(player.currentTheme) + 1) % themes.length];
}

function setTheme(name) {
    document.querySelectorAll("link").forEach(function(e) {
        if (e.href.includes("theme")) e.remove();
    });
    player.currentTheme = name;

    var head = document.head;
    var link = document.createElement('link');

    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = "css/theme-" + name + ".css";

    head.appendChild(link);
}
