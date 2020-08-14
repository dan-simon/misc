let e;
let b;

function updateDisplayPageLoadSetup() {
  e = [document.getElementById("e0"), document.getElementById("e1"), document.getElementById("e2"), document.getElementById("e3"), document.getElementById("e4"), document.getElementById("e5"), document.getElementById("e6"), document.getElementById("e7"), document.getElementById("e8"), document.getElementById("e9"), document.getElementById("e10"), document.getElementById("e11"), document.getElementById("e12"), document.getElementById("e13"), document.getElementById("e14"), document.getElementById("e15"), document.getElementById("e16"), document.getElementById("e17"), document.getElementById("e18"), document.getElementById("e19"), document.getElementById("e20"), document.getElementById("e21"), document.getElementById("e22"), document.getElementById("e23"), document.getElementById("e24"), document.getElementById("e25"), document.getElementById("e26"), document.getElementById("e27"), document.getElementById("e28"), document.getElementById("e29"), document.getElementById("e30"), document.getElementById("e31")];
  b = [];
}

function updateDisplaySaveLoadSetup() {

}

function updateDisplay() {
  e[0].textContent = getRandomMessage();
  e[1].textContent = formatInt(16);
  e[2].textContent = formatInt(2);
  e[3].textContent = format(Math.pow(2, 1 / 8));
  e[4].textContent = formatInt(16);
  e[5].textContent = formatInt(1);
  e[6].textContent = formatInt(1);
  e[7].textContent = formatInt(Math.pow(2, 64));
  e[8].textContent = formatInt(2);
  e[9].textContent = formatInt(4);
  e[10].textContent = formatInt(Math.pow(2, 64));
  e[11].textContent = formatInt(4);
  e[12].textContent = formatInt(Math.pow(2, 100));
  e[13].textContent = formatInt(2);
  e[14].textContent = formatInt(16);
  e[15].textContent = formatInt(Math.pow(2, 128));
  e[16].textContent = formatInt(Math.pow(2, 128));
  e[17].textContent = formatInt(4);
  e[18].textContent = formatInt(6);
  e[19].textContent = formatInt(4);
  e[20].textContent = formatInt(4);
  e[21].textContent = formatInt(4);
  e[22].textContent = formatInt(Math.pow(2, 160));
  e[23].textContent = formatInt(Math.pow(2, 162));
  e[24].textContent = format(1 / 16);
  e[25].textContent = formatInt(64);
  e[26].textContent = formatInt(4);
  e[27].textContent = formatInt(2);
  e[28].textContent = formatInt(5);
  e[29].textContent = formatInt(Math.pow(2, 256));
  e[30].textContent = formatInt(Math.pow(2, 248));
  e[31].textContent = formatInt(Math.pow(2, 256));

}