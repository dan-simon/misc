let e;
let b;
let majorDivs;
let majorDivTable;
let tickMap;

let shouldUpdate = x => majorDivTable[x].every(y => {if (!(y in tickMap)) {tickMap[y] = document.getElementById(y).style.display !== "none"}; return tickMap[y]});

function updateDisplayPageLoadSetup() {
  e = [document.getElementById("e0"), document.getElementById("e1"), document.getElementById("e2")];
  b = [document.getElementById("b0"), document.getElementById("b1"), document.getElementById("b2"), document.getElementById("b3"), document.getElementById("b4"), document.getElementById("b5"), document.getElementById("b6"), document.getElementById("b7"), document.getElementById("b8"), document.getElementById("b9"), document.getElementById("b10"), document.getElementById("b11"), document.getElementById("b12"), document.getElementById("b13"), document.getElementById("b14"), document.getElementById("b15"), document.getElementById("b16"), document.getElementById("b17"), document.getElementById("b18"), document.getElementById("b19"), document.getElementById("b20"), document.getElementById("b21"), document.getElementById("b22"), document.getElementById("b23"), document.getElementById("b24"), document.getElementById("b25"), document.getElementById("b26"), document.getElementById("b27"), document.getElementById("b28")];
  let majorDivsOrig = [...document.getElementsByClassName("major-div")];
  majorDivs = majorDivsOrig.map(x => x.id);
  majorDivTable = {};
  for (let i of e.concat(b)) {majorDivTable[i.id] = majorDivsOrig.filter(j => j.contains(i) && !i.contains(j)).map(j => j.id)};
}

function updateDisplaySaveLoadSetup() {

}

function updateDisplay() {
  tickMap = {};
  if (shouldUpdate("e0")) {let v = Headers.levelString(); if (e[0].textContent !== v) {e[0].textContent = v};};
  if (shouldUpdate("e1")) {let v = Headers.progressInfo(); if (e[1].textContent !== v) {e[1].textContent = v};};
  if (shouldUpdate("e2")) {let v = Headers.time(); if (e[2].textContent !== v) {e[2].textContent = v};};
  if (shouldUpdate("b0")) {let v = Display.displayLevelSelect() ? '' : 'none'; if (b[0].style.display !== v) {b[0].style.display = v};};
  if (shouldUpdate("b28")) {let v = Display.displayGrid() ? '' : 'none'; if (b[28].style.display !== v) {b[28].style.display = v};};
  if (b[0].style.display !== "none") {
    if (shouldUpdate("b1")) {let v = State.backgroundColor(0, 0); if (b[1].style.backgroundColor !== v) {b[1].style.backgroundColor = v};};
    if (shouldUpdate("b1")) {let v = State.isUnlocked(0, 0) ? '' : 'none'; if (b[1].style.display !== v) {b[1].style.display = v};};
    if (shouldUpdate("b2")) {let v = State.backgroundColor(0, 1); if (b[2].style.backgroundColor !== v) {b[2].style.backgroundColor = v};};
    if (shouldUpdate("b2")) {let v = State.isUnlocked(0, 1) ? '' : 'none'; if (b[2].style.display !== v) {b[2].style.display = v};};
    if (shouldUpdate("b3")) {let v = State.backgroundColor(0, 2); if (b[3].style.backgroundColor !== v) {b[3].style.backgroundColor = v};};
    if (shouldUpdate("b3")) {let v = State.isUnlocked(0, 2) ? '' : 'none'; if (b[3].style.display !== v) {b[3].style.display = v};};
    if (shouldUpdate("b4")) {let v = State.backgroundColor(1, 0); if (b[4].style.backgroundColor !== v) {b[4].style.backgroundColor = v};};
    if (shouldUpdate("b4")) {let v = State.isUnlocked(1, 0) ? '' : 'none'; if (b[4].style.display !== v) {b[4].style.display = v};};
    if (shouldUpdate("b5")) {let v = State.backgroundColor(1, 1); if (b[5].style.backgroundColor !== v) {b[5].style.backgroundColor = v};};
    if (shouldUpdate("b5")) {let v = State.isUnlocked(1, 1) ? '' : 'none'; if (b[5].style.display !== v) {b[5].style.display = v};};
    if (shouldUpdate("b6")) {let v = State.backgroundColor(1, 2); if (b[6].style.backgroundColor !== v) {b[6].style.backgroundColor = v};};
    if (shouldUpdate("b6")) {let v = State.isUnlocked(1, 2) ? '' : 'none'; if (b[6].style.display !== v) {b[6].style.display = v};};
    if (shouldUpdate("b7")) {let v = State.backgroundColor(2, 0); if (b[7].style.backgroundColor !== v) {b[7].style.backgroundColor = v};};
    if (shouldUpdate("b7")) {let v = State.isUnlocked(2, 0) ? '' : 'none'; if (b[7].style.display !== v) {b[7].style.display = v};};
    if (shouldUpdate("b8")) {let v = State.backgroundColor(2, 1); if (b[8].style.backgroundColor !== v) {b[8].style.backgroundColor = v};};
    if (shouldUpdate("b8")) {let v = State.isUnlocked(2, 1) ? '' : 'none'; if (b[8].style.display !== v) {b[8].style.display = v};};
    if (shouldUpdate("b9")) {let v = State.backgroundColor(2, 2); if (b[9].style.backgroundColor !== v) {b[9].style.backgroundColor = v};};
    if (shouldUpdate("b9")) {let v = State.isUnlocked(2, 2) ? '' : 'none'; if (b[9].style.display !== v) {b[9].style.display = v};};
    if (shouldUpdate("b10")) {let v = State.backgroundColor(3, 0); if (b[10].style.backgroundColor !== v) {b[10].style.backgroundColor = v};};
    if (shouldUpdate("b10")) {let v = State.isUnlocked(3, 0) ? '' : 'none'; if (b[10].style.display !== v) {b[10].style.display = v};};
    if (shouldUpdate("b11")) {let v = State.backgroundColor(3, 1); if (b[11].style.backgroundColor !== v) {b[11].style.backgroundColor = v};};
    if (shouldUpdate("b11")) {let v = State.isUnlocked(3, 1) ? '' : 'none'; if (b[11].style.display !== v) {b[11].style.display = v};};
    if (shouldUpdate("b12")) {let v = State.backgroundColor(3, 2); if (b[12].style.backgroundColor !== v) {b[12].style.backgroundColor = v};};
    if (shouldUpdate("b12")) {let v = State.isUnlocked(3, 2) ? '' : 'none'; if (b[12].style.display !== v) {b[12].style.display = v};};
    if (shouldUpdate("b13")) {let v = State.backgroundColor(4, 0); if (b[13].style.backgroundColor !== v) {b[13].style.backgroundColor = v};};
    if (shouldUpdate("b13")) {let v = State.isUnlocked(4, 0) ? '' : 'none'; if (b[13].style.display !== v) {b[13].style.display = v};};
    if (shouldUpdate("b14")) {let v = State.backgroundColor(4, 1); if (b[14].style.backgroundColor !== v) {b[14].style.backgroundColor = v};};
    if (shouldUpdate("b14")) {let v = State.isUnlocked(4, 1) ? '' : 'none'; if (b[14].style.display !== v) {b[14].style.display = v};};
    if (shouldUpdate("b15")) {let v = State.backgroundColor(4, 2); if (b[15].style.backgroundColor !== v) {b[15].style.backgroundColor = v};};
    if (shouldUpdate("b15")) {let v = State.isUnlocked(4, 2) ? '' : 'none'; if (b[15].style.display !== v) {b[15].style.display = v};};
    if (shouldUpdate("b16")) {let v = State.backgroundColor(5, 0); if (b[16].style.backgroundColor !== v) {b[16].style.backgroundColor = v};};
    if (shouldUpdate("b16")) {let v = State.isUnlocked(5, 0) ? '' : 'none'; if (b[16].style.display !== v) {b[16].style.display = v};};
    if (shouldUpdate("b17")) {let v = State.backgroundColor(5, 1); if (b[17].style.backgroundColor !== v) {b[17].style.backgroundColor = v};};
    if (shouldUpdate("b17")) {let v = State.isUnlocked(5, 1) ? '' : 'none'; if (b[17].style.display !== v) {b[17].style.display = v};};
    if (shouldUpdate("b18")) {let v = State.backgroundColor(5, 2); if (b[18].style.backgroundColor !== v) {b[18].style.backgroundColor = v};};
    if (shouldUpdate("b18")) {let v = State.isUnlocked(5, 2) ? '' : 'none'; if (b[18].style.display !== v) {b[18].style.display = v};};
    if (shouldUpdate("b19")) {let v = State.backgroundColor(6, 0); if (b[19].style.backgroundColor !== v) {b[19].style.backgroundColor = v};};
    if (shouldUpdate("b19")) {let v = State.isUnlocked(6, 0) ? '' : 'none'; if (b[19].style.display !== v) {b[19].style.display = v};};
    if (shouldUpdate("b20")) {let v = State.backgroundColor(6, 1); if (b[20].style.backgroundColor !== v) {b[20].style.backgroundColor = v};};
    if (shouldUpdate("b20")) {let v = State.isUnlocked(6, 1) ? '' : 'none'; if (b[20].style.display !== v) {b[20].style.display = v};};
    if (shouldUpdate("b21")) {let v = State.backgroundColor(6, 2); if (b[21].style.backgroundColor !== v) {b[21].style.backgroundColor = v};};
    if (shouldUpdate("b21")) {let v = State.isUnlocked(6, 2) ? '' : 'none'; if (b[21].style.display !== v) {b[21].style.display = v};};
    if (shouldUpdate("b22")) {let v = State.backgroundColor(7, 0); if (b[22].style.backgroundColor !== v) {b[22].style.backgroundColor = v};};
    if (shouldUpdate("b22")) {let v = State.isUnlocked(7, 0) ? '' : 'none'; if (b[22].style.display !== v) {b[22].style.display = v};};
    if (shouldUpdate("b23")) {let v = State.backgroundColor(7, 1); if (b[23].style.backgroundColor !== v) {b[23].style.backgroundColor = v};};
    if (shouldUpdate("b23")) {let v = State.isUnlocked(7, 1) ? '' : 'none'; if (b[23].style.display !== v) {b[23].style.display = v};};
    if (shouldUpdate("b24")) {let v = State.backgroundColor(7, 2); if (b[24].style.backgroundColor !== v) {b[24].style.backgroundColor = v};};
    if (shouldUpdate("b24")) {let v = State.isUnlocked(7, 2) ? '' : 'none'; if (b[24].style.display !== v) {b[24].style.display = v};};
    if (shouldUpdate("b25")) {let v = State.backgroundColor(8, 0); if (b[25].style.backgroundColor !== v) {b[25].style.backgroundColor = v};};
    if (shouldUpdate("b25")) {let v = State.isUnlocked(8, 0) ? '' : 'none'; if (b[25].style.display !== v) {b[25].style.display = v};};
    if (shouldUpdate("b26")) {let v = State.backgroundColor(8, 1); if (b[26].style.backgroundColor !== v) {b[26].style.backgroundColor = v};};
    if (shouldUpdate("b26")) {let v = State.isUnlocked(8, 1) ? '' : 'none'; if (b[26].style.display !== v) {b[26].style.display = v};};
    if (shouldUpdate("b27")) {let v = State.backgroundColor(8, 2); if (b[27].style.backgroundColor !== v) {b[27].style.backgroundColor = v};};
    if (shouldUpdate("b27")) {let v = State.isUnlocked(8, 2) ? '' : 'none'; if (b[27].style.display !== v) {b[27].style.display = v};};
  }
  if (b[28].style.display !== "none") {

  }
}