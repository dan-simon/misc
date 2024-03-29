let e;
let b;
let majorDivs;
let majorDivTable;
let tickMap;

let shouldUpdate = x => majorDivTable[x].every(y => {if (!(y in tickMap)) {tickMap[y] = document.getElementById(y).style.display !== "none"}; return tickMap[y]});

function updateDisplayPageLoadSetup() {
  e = [document.getElementById("e0"), document.getElementById("e1"), document.getElementById("e2"), document.getElementById("e3"), document.getElementById("e4"), document.getElementById("e5"), document.getElementById("e6"), document.getElementById("e7"), document.getElementById("e8"), document.getElementById("e9"), document.getElementById("e10"), document.getElementById("e11"), document.getElementById("e12"), document.getElementById("e13"), document.getElementById("e14"), document.getElementById("e15"), document.getElementById("e16"), document.getElementById("e17"), document.getElementById("e18"), document.getElementById("e19"), document.getElementById("e20"), document.getElementById("e21"), document.getElementById("e22"), document.getElementById("e23"), document.getElementById("e24"), document.getElementById("e25"), document.getElementById("e26"), document.getElementById("e27"), document.getElementById("e28"), document.getElementById("e29"), document.getElementById("e30"), document.getElementById("e31"), document.getElementById("e32"), document.getElementById("e33"), document.getElementById("e34"), document.getElementById("e35"), document.getElementById("e36"), document.getElementById("e37"), document.getElementById("e38"), document.getElementById("e39"), document.getElementById("e40"), document.getElementById("e41"), document.getElementById("e42"), document.getElementById("e43"), document.getElementById("e44"), document.getElementById("e45"), document.getElementById("e46"), document.getElementById("e47"), document.getElementById("e48"), document.getElementById("e49"), document.getElementById("e50"), document.getElementById("e51"), document.getElementById("e52"), document.getElementById("e53"), document.getElementById("e54"), document.getElementById("e55"), document.getElementById("e56"), document.getElementById("e57"), document.getElementById("e58"), document.getElementById("e59"), document.getElementById("e60"), document.getElementById("e61"), document.getElementById("e62"), document.getElementById("e63"), document.getElementById("e64"), document.getElementById("e65"), document.getElementById("e66"), document.getElementById("e67"), document.getElementById("e68"), document.getElementById("e69"), document.getElementById("e70"), document.getElementById("e71"), document.getElementById("e72"), document.getElementById("e73"), document.getElementById("e74"), document.getElementById("e75"), document.getElementById("e76"), document.getElementById("e77"), document.getElementById("e78"), document.getElementById("e79"), document.getElementById("e80"), document.getElementById("e81"), document.getElementById("e82"), document.getElementById("e83"), document.getElementById("e84"), document.getElementById("e85"), document.getElementById("e86"), document.getElementById("e87"), document.getElementById("e88"), document.getElementById("e89"), document.getElementById("e90"), document.getElementById("e91"), document.getElementById("e92"), document.getElementById("e93"), document.getElementById("e94"), document.getElementById("e95")];
  b = [document.getElementById("b0"), document.getElementById("b1"), document.getElementById("b2"), document.getElementById("b3"), document.getElementById("b4"), document.getElementById("b5"), document.getElementById("b6"), document.getElementById("b7"), document.getElementById("b8"), document.getElementById("b9"), document.getElementById("b10"), document.getElementById("b11"), document.getElementById("b12"), document.getElementById("b13"), document.getElementById("b14"), document.getElementById("b15"), document.getElementById("b16"), document.getElementById("b17"), document.getElementById("b18"), document.getElementById("b19"), document.getElementById("b20"), document.getElementById("b21"), document.getElementById("b22"), document.getElementById("b23"), document.getElementById("b24"), document.getElementById("b25"), document.getElementById("b26"), document.getElementById("b27"), document.getElementById("b28"), document.getElementById("b29"), document.getElementById("b30"), document.getElementById("b31"), document.getElementById("b32"), document.getElementById("b33"), document.getElementById("b34"), document.getElementById("b35"), document.getElementById("b36"), document.getElementById("b37"), document.getElementById("b38"), document.getElementById("b39"), document.getElementById("b40"), document.getElementById("b41"), document.getElementById("b42"), document.getElementById("b43"), document.getElementById("b44"), document.getElementById("b45"), document.getElementById("b46"), document.getElementById("b47"), document.getElementById("b48"), document.getElementById("b49"), document.getElementById("b50"), document.getElementById("b51"), document.getElementById("b52"), document.getElementById("b53"), document.getElementById("b54"), document.getElementById("b55"), document.getElementById("b56"), document.getElementById("b57"), document.getElementById("b58"), document.getElementById("b59"), document.getElementById("b60"), document.getElementById("b61"), document.getElementById("b62"), document.getElementById("b63"), document.getElementById("b64"), document.getElementById("b65"), document.getElementById("b66"), document.getElementById("b67"), document.getElementById("b68"), document.getElementById("b69"), document.getElementById("b70"), document.getElementById("b71"), document.getElementById("b72"), document.getElementById("b73"), document.getElementById("b74"), document.getElementById("b75"), document.getElementById("b76"), document.getElementById("b77"), document.getElementById("b78"), document.getElementById("b79"), document.getElementById("b80"), document.getElementById("b81"), document.getElementById("b82"), document.getElementById("b83"), document.getElementById("b84"), document.getElementById("b85"), document.getElementById("b86"), document.getElementById("b87"), document.getElementById("b88"), document.getElementById("b89"), document.getElementById("b90"), document.getElementById("b91"), document.getElementById("b92"), document.getElementById("b93"), document.getElementById("b94"), document.getElementById("b95"), document.getElementById("b96"), document.getElementById("b97"), document.getElementById("b98"), document.getElementById("b99"), document.getElementById("b100"), document.getElementById("b101"), document.getElementById("b102"), document.getElementById("b103"), document.getElementById("b104"), document.getElementById("b105"), document.getElementById("b106"), document.getElementById("b107"), document.getElementById("b108"), document.getElementById("b109"), document.getElementById("b110"), document.getElementById("b111"), document.getElementById("b112"), document.getElementById("b113"), document.getElementById("b114"), document.getElementById("b115"), document.getElementById("b116"), document.getElementById("b117"), document.getElementById("b118"), document.getElementById("b119"), document.getElementById("b120"), document.getElementById("b121"), document.getElementById("b122"), document.getElementById("b123"), document.getElementById("b124"), document.getElementById("b125"), document.getElementById("b126")];
  let majorDivsOrig = [...document.getElementsByClassName("major-div")];
  majorDivs = majorDivsOrig.map(x => x.id);
  majorDivTable = {};
  for (let i of e.concat(b)) {majorDivTable[i.id] = majorDivsOrig.filter(j => j.contains(i)).map(j => j.id)};
}

function updateDisplaySaveLoadSetup() {
  if (shouldUpdate("b0")) {b[0].value = Options.notation()};
  if (shouldUpdate("b0")) {b[0].onchange = function() {Options.setNotation(this.value)}};
  if (shouldUpdate("b1")) {b[1].value = Metal.getImportance()};
  if (shouldUpdate("b1")) {b[1].onchange = function() {Metal.setImportance(+this.value)}};
  if (shouldUpdate("b2")) {b[2].value = Stone.getImportance()};
  if (shouldUpdate("b2")) {b[2].onchange = function() {Stone.setImportance(+this.value)}};
  if (shouldUpdate("b8")) {b[8].value = Wood.getImportance()};
  if (shouldUpdate("b8")) {b[8].onchange = function() {Wood.setImportance(+this.value)}};
  if (shouldUpdate("b10")) {b[10].value = Aether.getImportance()};
  if (shouldUpdate("b10")) {b[10].onchange = function() {Aether.setImportance(+this.value)}};
  if (shouldUpdate("b40")) {b[40].value = Map.getCreatedZone()};
  if (shouldUpdate("b40")) {b[40].onchange = function() {Map.setCreatedZone(+this.value)}};
}

function updateDisplay() {
  tickMap = {};
  if (shouldUpdate("e0")) {e[0].textContent = player.options.offlineProgress ? "On" : "Off"};
  if (shouldUpdate("e1")) {e[1].textContent = formatInt(Metal.amount())};
  if (shouldUpdate("e2")) {e[2].textContent = formatInt(Metal.perSecond())};
  if (shouldUpdate("e3")) {e[3].textContent = formatInt(Stone.amount())};
  if (shouldUpdate("e4")) {e[4].textContent = formatInt(Stone.perSecond())};
  if (shouldUpdate("e5")) {e[5].textContent = formatInt(Wood.amount())};
  if (shouldUpdate("e6")) {e[6].textContent = formatInt(Wood.perSecond())};
  if (shouldUpdate("e7")) {e[7].textContent = formatInt(Aether.amount())};
  if (shouldUpdate("e8")) {e[8].textContent = format(Aether.perSecond())};
  if (shouldUpdate("e9")) {e[9].textContent = formatInt(Upgrades.amount(0, 0))};
  if (shouldUpdate("e10")) {e[10].textContent = formatInt(Upgrades.cost(0, 0))};
  if (shouldUpdate("e11")) {e[11].textContent = Upgrades.resourceName(0)};
  if (shouldUpdate("e12")) {e[12].textContent = formatInt(Upgrades.amount(0, 1))};
  if (shouldUpdate("e13")) {e[13].textContent = formatInt(Upgrades.cost(0, 1))};
  if (shouldUpdate("e14")) {e[14].textContent = Upgrades.resourceName(1)};
  if (shouldUpdate("e15")) {e[15].textContent = formatInt(Upgrades.amount(0, 2))};
  if (shouldUpdate("e16")) {e[16].textContent = formatInt(Upgrades.cost(0, 2))};
  if (shouldUpdate("e17")) {e[17].textContent = Upgrades.resourceName(2)};
  if (shouldUpdate("e18")) {e[18].textContent = formatInt(Upgrades.attack(0))};
  if (shouldUpdate("e19")) {e[19].textContent = formatInt(Upgrades.amount(1, 0))};
  if (shouldUpdate("e20")) {e[20].textContent = formatInt(Upgrades.cost(1, 0))};
  if (shouldUpdate("e21")) {e[21].textContent = Upgrades.resourceName(0)};
  if (shouldUpdate("e22")) {e[22].textContent = formatInt(Upgrades.amount(1, 1))};
  if (shouldUpdate("e23")) {e[23].textContent = formatInt(Upgrades.cost(1, 1))};
  if (shouldUpdate("e24")) {e[24].textContent = Upgrades.resourceName(1)};
  if (shouldUpdate("e25")) {e[25].textContent = formatInt(Upgrades.amount(1, 2))};
  if (shouldUpdate("e26")) {e[26].textContent = formatInt(Upgrades.cost(1, 2))};
  if (shouldUpdate("e27")) {e[27].textContent = Upgrades.resourceName(2)};
  if (shouldUpdate("e28")) {e[28].textContent = formatInt(Upgrades.attack(1))};
  if (shouldUpdate("e29")) {e[29].textContent = formatInt(Upgrades.amount(2, 0))};
  if (shouldUpdate("e30")) {e[30].textContent = formatInt(Upgrades.cost(2, 0))};
  if (shouldUpdate("e31")) {e[31].textContent = Upgrades.resourceName(0)};
  if (shouldUpdate("e32")) {e[32].textContent = formatInt(Upgrades.amount(2, 1))};
  if (shouldUpdate("e33")) {e[33].textContent = formatInt(Upgrades.cost(2, 1))};
  if (shouldUpdate("e34")) {e[34].textContent = Upgrades.resourceName(1)};
  if (shouldUpdate("e35")) {e[35].textContent = formatInt(Upgrades.amount(2, 2))};
  if (shouldUpdate("e36")) {e[36].textContent = formatInt(Upgrades.cost(2, 2))};
  if (shouldUpdate("e37")) {e[37].textContent = Upgrades.resourceName(2)};
  if (shouldUpdate("e38")) {e[38].textContent = formatInt(Upgrades.attack(2))};
  if (shouldUpdate("e39")) {e[39].textContent = formatInt(Upgrades.amount(3, 0))};
  if (shouldUpdate("e40")) {e[40].textContent = formatInt(Upgrades.cost(3, 0))};
  if (shouldUpdate("e41")) {e[41].textContent = Upgrades.resourceName(0)};
  if (shouldUpdate("e42")) {e[42].textContent = formatInt(Upgrades.amount(3, 1))};
  if (shouldUpdate("e43")) {e[43].textContent = formatInt(Upgrades.cost(3, 1))};
  if (shouldUpdate("e44")) {e[44].textContent = Upgrades.resourceName(1)};
  if (shouldUpdate("e45")) {e[45].textContent = formatInt(Upgrades.amount(3, 2))};
  if (shouldUpdate("e46")) {e[46].textContent = formatInt(Upgrades.cost(3, 2))};
  if (shouldUpdate("e47")) {e[47].textContent = Upgrades.resourceName(2)};
  if (shouldUpdate("e48")) {e[48].textContent = formatInt(Upgrades.attack(3))};
  if (shouldUpdate("e49")) {e[49].textContent = formatInt(Map.cost())};
  if (shouldUpdate("e50")) {e[50].textContent = Map.resourceName()};
  if (shouldUpdate("e51")) {e[51].textContent = formatInt(Math.floor(Map.vmCurrent()))};
  if (shouldUpdate("e52")) {e[52].textContent = formatInt(Map.explorationAttack())};
  if (shouldUpdate("e53")) {e[53].textContent = formatInt(AetherUpgrade.amount())};
  if (shouldUpdate("e54")) {e[54].textContent = formatInt(AetherUpgrade.cost())};
  if (shouldUpdate("e55")) {e[55].textContent = AetherUpgrade.resourceName()};
  if (shouldUpdate("e56")) {e[56].textContent = formatInt(AetherUpgrade.attack())};
  if (shouldUpdate("e57")) {e[57].textContent = formatInt(Gold.amount())};
  if (shouldUpdate("e58")) {e[58].textContent = formatInt(Gold.total())};
  if (shouldUpdate("e59")) {e[59].textContent = Gold.canPortal() ? 'portal' : 'reset portal'};
  if (shouldUpdate("e60")) {e[60].textContent = formatInt(Perks.amount(0))};
  if (shouldUpdate("e61")) {e[61].textContent = formatInt(Perks.cost(0))};
  if (shouldUpdate("e62")) {e[62].textContent = Perks.resourceName()};
  if (shouldUpdate("e63")) {e[63].textContent = formatInt(Perks.amount(1))};
  if (shouldUpdate("e64")) {e[64].textContent = formatInt(Perks.cost(1))};
  if (shouldUpdate("e65")) {e[65].textContent = Perks.resourceName()};
  if (shouldUpdate("e66")) {e[66].textContent = formatInt(Perks.amount(2))};
  if (shouldUpdate("e67")) {e[67].textContent = formatInt(Perks.cost(2))};
  if (shouldUpdate("e68")) {e[68].textContent = Perks.resourceName()};
  if (shouldUpdate("e69")) {e[69].textContent = formatInt(Perks.amount(3))};
  if (shouldUpdate("e70")) {e[70].textContent = formatInt(Perks.cost(3))};
  if (shouldUpdate("e71")) {e[71].textContent = Perks.resourceName()};
  if (shouldUpdate("e72")) {e[72].textContent = formatInt(Perks.amount(4))};
  if (shouldUpdate("e73")) {e[73].textContent = formatInt(Perks.cost(4))};
  if (shouldUpdate("e74")) {e[74].textContent = Perks.resourceName()};
  if (shouldUpdate("e75")) {e[75].textContent = formatInt(Perks.amount(5))};
  if (shouldUpdate("e76")) {e[76].textContent = formatInt(Perks.cost(5))};
  if (shouldUpdate("e77")) {e[77].textContent = Perks.resourceName()};
  if (shouldUpdate("e78")) {e[78].textContent = Challenge.text(0)};
  if (shouldUpdate("e79")) {e[79].textContent = Challenge.nameOf(0)};
  if (shouldUpdate("e80")) {e[80].textContent = Challenge.text(1)};
  if (shouldUpdate("e81")) {e[81].textContent = Challenge.nameOf(1)};
  if (shouldUpdate("e82")) {e[82].textContent = Challenge.nextChallengeText()};
  if (shouldUpdate("e83")) {e[83].textContent = Challenge.name()};
  if (shouldUpdate("e84")) {e[84].textContent = formatInt(Zone.worldZone())};
  if (shouldUpdate("e85")) {e[85].textContent = formatInt(Challenge.goal())};
  if (shouldUpdate("e86")) {e[86].textContent = Zone.description()};
  if (shouldUpdate("e87")) {e[87].textContent = formatInt(Zone.cell())};
  if (shouldUpdate("e88")) {e[88].textContent = formatInt(Zone.attack())};
  if (shouldUpdate("e89")) {e[89].textContent = Zone.fighting() ? 'On' : 'Off'};
  if (shouldUpdate("e90")) {e[90].textContent = Zone.enemyName()};
  if (shouldUpdate("e91")) {e[91].textContent = formatInt(Zone.enemyHealth())};
  if (shouldUpdate("e92")) {e[92].textContent = formatInt(Zone.enemyMaxHealth())};
  if (shouldUpdate("e93")) {e[93].textContent = formatInt(Zone.enemyDefense())};
  if (shouldUpdate("e94")) {e[94].textContent = formatInt(Gold.gain())};
  if (shouldUpdate("e95")) {e[95].textContent = formatTime(player.stats.timeSincePortal, {seconds: {f: format, s: false}, larger: {f: format, s: false}})};
  if (shouldUpdate("b3")) {b[3].style.display = (Wood.isUnlocked() || Aether.isUnlocked()) ? "" : "none"};
  if (shouldUpdate("b4")) {b[4].style.display = Wood.isUnlocked() ? "" : "none"};
  if (shouldUpdate("b5")) {b[5].style.display = Aether.isUnlocked() ? "" : "none"};
  if (shouldUpdate("b6")) {b[6].style.display = Wood.isUnlocked() ? "" : "none"};
  if (shouldUpdate("b7")) {b[7].style.display = Wood.isUnlocked() ? "" : "none"};
  if (shouldUpdate("b9")) {b[9].style.display = Aether.isUnlocked() ? "" : "none"};
  if (shouldUpdate("b11")) {b[11].style.display = (Upgrades.isUnlocked(0, 0) || Upgrades.amount(0, 0)) ? "" : "none"};
  if (shouldUpdate("b12")) {b[12].style.display = Upgrades.isUnlocked(0, 0) ? "" : "none"};
  if (shouldUpdate("b12")) {b[12].className = Upgrades.isAffordable(0, 0) ? "" : "disabled"};
  if (shouldUpdate("b13")) {b[13].style.display = (Upgrades.amount(0, 0) > 1) ? "" : "none"};
  if (shouldUpdate("b14")) {b[14].style.display = Upgrades.isUnlocked(0, 1) ? "" : "none"};
  if (shouldUpdate("b14")) {b[14].className = Upgrades.isAffordable(0, 1) ? "" : "disabled"};
  if (shouldUpdate("b15")) {b[15].style.display = Upgrades.isUnlocked(0, 1) ? "" : "none"};
  if (shouldUpdate("b15")) {b[15].className = Upgrades.isAffordable(0, 1) ? "" : "disabled"};
  if (shouldUpdate("b16")) {b[16].style.display = Upgrades.isUnlocked(0, 2) ? "" : "none"};
  if (shouldUpdate("b16")) {b[16].className = Upgrades.isAffordable(0, 2) ? "" : "disabled"};
  if (shouldUpdate("b17")) {b[17].style.display = Upgrades.isUnlocked(0, 2) ? "" : "none"};
  if (shouldUpdate("b17")) {b[17].className = Upgrades.isAffordable(0, 2) ? "" : "disabled"};
  if (shouldUpdate("b18")) {b[18].style.display = (Upgrades.isUnlocked(1, 0) || Upgrades.amount(1, 0)) ? "" : "none"};
  if (shouldUpdate("b19")) {b[19].style.display = Upgrades.isUnlocked(1, 0) ? "" : "none"};
  if (shouldUpdate("b19")) {b[19].className = Upgrades.isAffordable(1, 0) ? "" : "disabled"};
  if (shouldUpdate("b20")) {b[20].style.display = (Upgrades.amount(1, 0) > 1) ? "" : "none"};
  if (shouldUpdate("b21")) {b[21].style.display = Upgrades.isUnlocked(1, 1) ? "" : "none"};
  if (shouldUpdate("b21")) {b[21].className = Upgrades.isAffordable(1, 1) ? "" : "disabled"};
  if (shouldUpdate("b22")) {b[22].style.display = Upgrades.isUnlocked(1, 1) ? "" : "none"};
  if (shouldUpdate("b22")) {b[22].className = Upgrades.isAffordable(1, 1) ? "" : "disabled"};
  if (shouldUpdate("b23")) {b[23].style.display = Upgrades.isUnlocked(1, 2) ? "" : "none"};
  if (shouldUpdate("b23")) {b[23].className = Upgrades.isAffordable(1, 2) ? "" : "disabled"};
  if (shouldUpdate("b24")) {b[24].style.display = Upgrades.isUnlocked(1, 2) ? "" : "none"};
  if (shouldUpdate("b24")) {b[24].className = Upgrades.isAffordable(1, 2) ? "" : "disabled"};
  if (shouldUpdate("b25")) {b[25].style.display = (Upgrades.isUnlocked(2, 0) || Upgrades.amount(2, 0)) ? "" : "none"};
  if (shouldUpdate("b26")) {b[26].style.display = Upgrades.isUnlocked(2, 0) ? "" : "none"};
  if (shouldUpdate("b26")) {b[26].className = Upgrades.isAffordable(2, 0) ? "" : "disabled"};
  if (shouldUpdate("b27")) {b[27].style.display = (Upgrades.amount(2, 0) > 1) ? "" : "none"};
  if (shouldUpdate("b28")) {b[28].style.display = Upgrades.isUnlocked(2, 1) ? "" : "none"};
  if (shouldUpdate("b28")) {b[28].className = Upgrades.isAffordable(2, 1) ? "" : "disabled"};
  if (shouldUpdate("b29")) {b[29].style.display = Upgrades.isUnlocked(2, 1) ? "" : "none"};
  if (shouldUpdate("b29")) {b[29].className = Upgrades.isAffordable(2, 1) ? "" : "disabled"};
  if (shouldUpdate("b30")) {b[30].style.display = Upgrades.isUnlocked(2, 2) ? "" : "none"};
  if (shouldUpdate("b30")) {b[30].className = Upgrades.isAffordable(2, 2) ? "" : "disabled"};
  if (shouldUpdate("b31")) {b[31].style.display = Upgrades.isUnlocked(2, 2) ? "" : "none"};
  if (shouldUpdate("b31")) {b[31].className = Upgrades.isAffordable(2, 2) ? "" : "disabled"};
  if (shouldUpdate("b32")) {b[32].style.display = (Upgrades.isUnlocked(3, 0) || Upgrades.amount(3, 0)) ? "" : "none"};
  if (shouldUpdate("b33")) {b[33].style.display = Upgrades.isUnlocked(3, 0) ? "" : "none"};
  if (shouldUpdate("b33")) {b[33].className = Upgrades.isAffordable(3, 0) ? "" : "disabled"};
  if (shouldUpdate("b34")) {b[34].style.display = (Upgrades.amount(3, 0) > 1) ? "" : "none"};
  if (shouldUpdate("b35")) {b[35].style.display = Upgrades.isUnlocked(3, 1) ? "" : "none"};
  if (shouldUpdate("b35")) {b[35].className = Upgrades.isAffordable(3, 1) ? "" : "disabled"};
  if (shouldUpdate("b36")) {b[36].style.display = Upgrades.isUnlocked(3, 1) ? "" : "none"};
  if (shouldUpdate("b36")) {b[36].className = Upgrades.isAffordable(3, 1) ? "" : "disabled"};
  if (shouldUpdate("b37")) {b[37].style.display = Upgrades.isUnlocked(3, 2) ? "" : "none"};
  if (shouldUpdate("b37")) {b[37].className = Upgrades.isAffordable(3, 2) ? "" : "disabled"};
  if (shouldUpdate("b38")) {b[38].style.display = Upgrades.isUnlocked(3, 2) ? "" : "none"};
  if (shouldUpdate("b38")) {b[38].className = Upgrades.isAffordable(3, 2) ? "" : "disabled"};
  if (shouldUpdate("b39")) {b[39].style.display = Map.isVisible() ? "" : "none"};
  if (shouldUpdate("b41")) {b[41].className = Map.canRun() ? "" : "disabled"};
  if (shouldUpdate("b42")) {b[42].style.display = Map.vmCurrent() >= 1 ? "" : "none"};
  if (shouldUpdate("b42")) {b[42].className = Map.canRun('void') ? "" : "disabled"};
  if (shouldUpdate("b43")) {b[43].style.display = Map.isRunning() ? "" : "none"};
  if (shouldUpdate("b44")) {b[44].style.display = Aether.isUnlocked() ? "" : "none"};
  if (shouldUpdate("b45")) {b[45].style.display = Aether.isUnlocked() ? "" : "none"};
  if (shouldUpdate("b46")) {b[46].className = AetherUpgrade.canBuy() ? "" : "disabled"};
  if (shouldUpdate("b47")) {b[47].style.display = Gold.hasPortaled() ? "" : "none"};
  if (shouldUpdate("b48")) {b[48].className = Perks.canBuy(0) ? "" : "disabled"};
  if (shouldUpdate("b49")) {b[49].className = Perks.canBuy(1) ? "" : "disabled"};
  if (shouldUpdate("b50")) {b[50].className = Perks.canBuy(2) ? "" : "disabled"};
  if (shouldUpdate("b51")) {b[51].className = Perks.canBuy(3) ? "" : "disabled"};
  if (shouldUpdate("b52")) {b[52].style.display = Perks.isUnlocked(4) ? "" : "none"};
  if (shouldUpdate("b52")) {b[52].className = Perks.canBuy(4) ? "" : "disabled"};
  if (shouldUpdate("b53")) {b[53].style.display = Perks.isUnlocked(5) ? "" : "none"};
  if (shouldUpdate("b53")) {b[53].className = Perks.canBuy(5) ? "" : "disabled"};
  if (shouldUpdate("b54")) {b[54].style.display = Gold.hasPortaled() ? "" : "none"};
  if (shouldUpdate("b55")) {b[55].style.display = Challenge.isUnlocked(0) ? "" : "none"};
  if (shouldUpdate("b56")) {b[56].style.display = Challenge.isCompleted(0) ? "" : "none"};
  if (shouldUpdate("b57")) {b[57].style.display = Challenge.isUnlocked(1) ? "" : "none"};
  if (shouldUpdate("b58")) {b[58].style.display = Challenge.isCompleted(1) ? "" : "none"};
  if (shouldUpdate("b59")) {b[59].style.display = Challenge.isSomeChallengeRunning() ? "" : "none"};
  if (shouldUpdate("b60")) {b[60].value = Zone.enemyHealthFraction()};
  if (shouldUpdate("b61")) {b[61].style.display = Gold.isVisible() ? "" : "none"};
  if (shouldUpdate("b62")) {b[62].className = Gold.canPortal() ? "" : "disabled"};
  if (shouldUpdate("b63")) {b[63].style.backgroundColor = Zone.getCellColor(8, 1)};
  if (shouldUpdate("b64")) {b[64].style.backgroundColor = Zone.getCellColor(8, 2)};
  if (shouldUpdate("b65")) {b[65].style.backgroundColor = Zone.getCellColor(8, 3)};
  if (shouldUpdate("b66")) {b[66].style.backgroundColor = Zone.getCellColor(8, 4)};
  if (shouldUpdate("b67")) {b[67].style.backgroundColor = Zone.getCellColor(8, 5)};
  if (shouldUpdate("b68")) {b[68].style.backgroundColor = Zone.getCellColor(8, 6)};
  if (shouldUpdate("b69")) {b[69].style.backgroundColor = Zone.getCellColor(8, 7)};
  if (shouldUpdate("b70")) {b[70].style.backgroundColor = Zone.getCellColor(8, 8)};
  if (shouldUpdate("b71")) {b[71].style.backgroundColor = Zone.getCellColor(7, 1)};
  if (shouldUpdate("b72")) {b[72].style.backgroundColor = Zone.getCellColor(7, 2)};
  if (shouldUpdate("b73")) {b[73].style.backgroundColor = Zone.getCellColor(7, 3)};
  if (shouldUpdate("b74")) {b[74].style.backgroundColor = Zone.getCellColor(7, 4)};
  if (shouldUpdate("b75")) {b[75].style.backgroundColor = Zone.getCellColor(7, 5)};
  if (shouldUpdate("b76")) {b[76].style.backgroundColor = Zone.getCellColor(7, 6)};
  if (shouldUpdate("b77")) {b[77].style.backgroundColor = Zone.getCellColor(7, 7)};
  if (shouldUpdate("b78")) {b[78].style.backgroundColor = Zone.getCellColor(7, 8)};
  if (shouldUpdate("b79")) {b[79].style.backgroundColor = Zone.getCellColor(6, 1)};
  if (shouldUpdate("b80")) {b[80].style.backgroundColor = Zone.getCellColor(6, 2)};
  if (shouldUpdate("b81")) {b[81].style.backgroundColor = Zone.getCellColor(6, 3)};
  if (shouldUpdate("b82")) {b[82].style.backgroundColor = Zone.getCellColor(6, 4)};
  if (shouldUpdate("b83")) {b[83].style.backgroundColor = Zone.getCellColor(6, 5)};
  if (shouldUpdate("b84")) {b[84].style.backgroundColor = Zone.getCellColor(6, 6)};
  if (shouldUpdate("b85")) {b[85].style.backgroundColor = Zone.getCellColor(6, 7)};
  if (shouldUpdate("b86")) {b[86].style.backgroundColor = Zone.getCellColor(6, 8)};
  if (shouldUpdate("b87")) {b[87].style.backgroundColor = Zone.getCellColor(5, 1)};
  if (shouldUpdate("b88")) {b[88].style.backgroundColor = Zone.getCellColor(5, 2)};
  if (shouldUpdate("b89")) {b[89].style.backgroundColor = Zone.getCellColor(5, 3)};
  if (shouldUpdate("b90")) {b[90].style.backgroundColor = Zone.getCellColor(5, 4)};
  if (shouldUpdate("b91")) {b[91].style.backgroundColor = Zone.getCellColor(5, 5)};
  if (shouldUpdate("b92")) {b[92].style.backgroundColor = Zone.getCellColor(5, 6)};
  if (shouldUpdate("b93")) {b[93].style.backgroundColor = Zone.getCellColor(5, 7)};
  if (shouldUpdate("b94")) {b[94].style.backgroundColor = Zone.getCellColor(5, 8)};
  if (shouldUpdate("b95")) {b[95].style.backgroundColor = Zone.getCellColor(4, 1)};
  if (shouldUpdate("b96")) {b[96].style.backgroundColor = Zone.getCellColor(4, 2)};
  if (shouldUpdate("b97")) {b[97].style.backgroundColor = Zone.getCellColor(4, 3)};
  if (shouldUpdate("b98")) {b[98].style.backgroundColor = Zone.getCellColor(4, 4)};
  if (shouldUpdate("b99")) {b[99].style.backgroundColor = Zone.getCellColor(4, 5)};
  if (shouldUpdate("b100")) {b[100].style.backgroundColor = Zone.getCellColor(4, 6)};
  if (shouldUpdate("b101")) {b[101].style.backgroundColor = Zone.getCellColor(4, 7)};
  if (shouldUpdate("b102")) {b[102].style.backgroundColor = Zone.getCellColor(4, 8)};
  if (shouldUpdate("b103")) {b[103].style.backgroundColor = Zone.getCellColor(3, 1)};
  if (shouldUpdate("b104")) {b[104].style.backgroundColor = Zone.getCellColor(3, 2)};
  if (shouldUpdate("b105")) {b[105].style.backgroundColor = Zone.getCellColor(3, 3)};
  if (shouldUpdate("b106")) {b[106].style.backgroundColor = Zone.getCellColor(3, 4)};
  if (shouldUpdate("b107")) {b[107].style.backgroundColor = Zone.getCellColor(3, 5)};
  if (shouldUpdate("b108")) {b[108].style.backgroundColor = Zone.getCellColor(3, 6)};
  if (shouldUpdate("b109")) {b[109].style.backgroundColor = Zone.getCellColor(3, 7)};
  if (shouldUpdate("b110")) {b[110].style.backgroundColor = Zone.getCellColor(3, 8)};
  if (shouldUpdate("b111")) {b[111].style.backgroundColor = Zone.getCellColor(2, 1)};
  if (shouldUpdate("b112")) {b[112].style.backgroundColor = Zone.getCellColor(2, 2)};
  if (shouldUpdate("b113")) {b[113].style.backgroundColor = Zone.getCellColor(2, 3)};
  if (shouldUpdate("b114")) {b[114].style.backgroundColor = Zone.getCellColor(2, 4)};
  if (shouldUpdate("b115")) {b[115].style.backgroundColor = Zone.getCellColor(2, 5)};
  if (shouldUpdate("b116")) {b[116].style.backgroundColor = Zone.getCellColor(2, 6)};
  if (shouldUpdate("b117")) {b[117].style.backgroundColor = Zone.getCellColor(2, 7)};
  if (shouldUpdate("b118")) {b[118].style.backgroundColor = Zone.getCellColor(2, 8)};
  if (shouldUpdate("b119")) {b[119].style.backgroundColor = Zone.getCellColor(1, 1)};
  if (shouldUpdate("b120")) {b[120].style.backgroundColor = Zone.getCellColor(1, 2)};
  if (shouldUpdate("b121")) {b[121].style.backgroundColor = Zone.getCellColor(1, 3)};
  if (shouldUpdate("b122")) {b[122].style.backgroundColor = Zone.getCellColor(1, 4)};
  if (shouldUpdate("b123")) {b[123].style.backgroundColor = Zone.getCellColor(1, 5)};
  if (shouldUpdate("b124")) {b[124].style.backgroundColor = Zone.getCellColor(1, 6)};
  if (shouldUpdate("b125")) {b[125].style.backgroundColor = Zone.getCellColor(1, 7)};
  if (shouldUpdate("b126")) {b[126].style.backgroundColor = Zone.getCellColor(1, 8)};

}