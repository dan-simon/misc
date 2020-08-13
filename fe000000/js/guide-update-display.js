let e;
let b;

function updateDisplayPageLoadSetup() {
  e = [document.getElementById("e0"), document.getElementById("e1"), document.getElementById("e2"), document.getElementById("e3"), document.getElementById("e4"), document.getElementById("e5"), document.getElementById("e6"), document.getElementById("e7"), document.getElementById("e8"), document.getElementById("e9"), document.getElementById("e10"), document.getElementById("e11"), document.getElementById("e12"), document.getElementById("e13"), document.getElementById("e14"), document.getElementById("e15"), document.getElementById("e16"), document.getElementById("e17"), document.getElementById("e18"), document.getElementById("e19"), document.getElementById("e20"), document.getElementById("e21"), document.getElementById("e22"), document.getElementById("e23"), document.getElementById("e24")];
  b = [];
}

function updateDisplaySaveLoadSetup() {

}

function updateDisplay() {
  e[0].textContent = getRandomMessage();
  e[1].textContent = formatInt(16);
  e[2].textContent = formatInt(2);
  e[3].textContent = formatInt(16);
  e[4].textContent = formatInt(1);
  e[5].textContent = formatInt(1);
  e[6].textContent = formatInt(Math.pow(2, 64));
  e[7].textContent = formatInt(2);
  e[8].textContent = formatInt(4);
  e[9].textContent = formatInt(Math.pow(2, 64));
  e[10].textContent = formatInt(4);
  e[11].textContent = formatInt(Math.pow(2, 100));
  e[12].textContent = formatInt(Math.pow(2, 128));
  e[13].textContent = formatInt(Math.pow(2, 128));
  e[14].textContent = formatInt(4);
  e[15].textContent = formatInt(6);
  e[16].textContent = formatInt(4);
  e[17].textContent = formatInt(4);
  e[18].textContent = formatInt(4);
  e[19].textContent = formatInt(Math.pow(2, 160));
  e[20].textContent = formatInt(Math.pow(2, 162));
  e[21].textContent = formatInt(4);
  e[22].textContent = formatInt(Math.pow(2, 256));
  e[23].textContent = formatInt(Math.pow(2, 248));
  e[24].textContent = formatInt(Math.pow(2, 256));

}