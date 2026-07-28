/* ---------------- SCOUTING (historial de jugadores, ambos equipos) ---------------- */
const VERDICT_OPTIONS = [
  {v:"", label:"¿? Sin revisar"},
  {v:"smurf", label:"🚩 Es smurf"},
  {v:"private", label:"🔒 Cuenta privada / no encontrada"},
  {v:"legit", label:"✅ No es smurf"},
  {v:"pro", label:"⭐ Parece muy experimentado / pro"},
];

function buildScoutSide(side){
  const containerId = side==="ally" ? "scoutRowsAlly" : "scoutRowsEnemy";
  const el = document.getElementById(containerId);
  el.innerHTML = "";
  for(let i=0;i<6;i++){
    const row = document.createElement("div");
    row.className = "scout-row";
    row.innerHTML = `
      <div class="top-line">
        <input type="text" placeholder="Nombre jugador #${i+1} (opcional)" id="scoutName_${side}_${i}">
        <select id="scoutPlatform_${side}_${i}" class="platform-select">
          <option value="">Plataforma ¿?</option>
          <option value="PS5">🎮 PS5</option>
          <option value="Xbox">🎮 Xbox</option>
          <option value="PC">🖥️ PC</option>
        </select>
        <button class="scout-clear-btn" id="scoutClearBtn_${side}_${i}" title="Borrar este jugador">🗑</button>
      </div>
      <div class="scout-links" id="scoutLinks_${side}_${i}"></div>
      <select class="verdict-select" id="scoutVerdict_${side}_${i}">
        ${VERDICT_OPTIONS.map(o=>`<option value="${o.v}">${o.label}</option>`).join("")}
      </select>
      <div class="scout-result" id="scoutResult_${side}_${i}"></div>
    `;
    el.appendChild(row);
    const nameInput = document.getElementById(`scoutName_${side}_${i}`);
    const platformSelect = document.getElementById(`scoutPlatform_${side}_${i}`);
    const verdictSelect = document.getElementById(`scoutVerdict_${side}_${i}`);
    nameInput.addEventListener("input", ()=>renderScoutLinksAndVerdict(side,i));
    platformSelect.addEventListener("change", ()=>renderScoutLinksAndVerdict(side,i));
    verdictSelect.addEventListener("change", ()=>renderScoutLinksAndVerdict(side,i));
    document.getElementById(`scoutClearBtn_${side}_${i}`).onclick = ()=>clearScoutRow(side,i);
  }
}
// borra un jugador puntual (por si se agrego mal o por error) sin tocar a los demas
function clearScoutRow(side, i){
  document.getElementById(`scoutName_${side}_${i}`).value = "";
  document.getElementById(`scoutPlatform_${side}_${i}`).value = "";
  document.getElementById(`scoutVerdict_${side}_${i}`).value = "";
  renderScoutLinksAndVerdict(side, i);
}
function clearAllScoutRows(){
  ["ally","enemy"].forEach(side=>{
    for(let i=0;i<6;i++) clearScoutRow(side, i);
  });
}

buildScoutSide("ally");
buildScoutSide("enemy");

function renderScoutLinksAndVerdict(side, i){
  const name = document.getElementById(`scoutName_${side}_${i}`).value.trim();
  const linksEl = document.getElementById(`scoutLinks_${side}_${i}`);
  const resultEl = document.getElementById(`scoutResult_${side}_${i}`);

  if(!name){
    linksEl.innerHTML = "";
    resultEl.classList.remove("show","smurf");
    resultEl.innerHTML = "";
    return;
  }

  linksEl.innerHTML = `<details><summary>revisar manualmente ↗</summary>
    <a href="https://tracker.gg/marvel-rivals/profile/ign/${encodeURIComponent(name)}/overview" target="_blank" rel="noopener">Ver en Tracker.gg ↗</a>
    <a href="https://rivalsmeta.com/search?q=${encodeURIComponent(name)}" target="_blank" rel="noopener">Ver en RivalsMeta ↗</a>
  </details>`;

  const verdict = document.getElementById(`scoutVerdict_${side}_${i}`).value;
  const platform = document.getElementById(`scoutPlatform_${side}_${i}`).value;
  const platformTag = platform ? ` · plataforma: <b>${platform}</b>` : "";

  resultEl.classList.add("show");
  resultEl.classList.toggle("smurf", verdict==="smurf");

  if(verdict==="smurf"){
    resultEl.innerHTML = `<div class="smurf-box">
      <div class="title">🚩 Marcado como posible smurf${platformTag}</div>
      <div class="report-steps">Si quieres denunciarlo: en el marcador de la partida (Tab), clic sobre su nombre → <b>Bloquear y denunciar</b> → motivo "Smurfing / manipulación de rango". Esta app no envía la denuncia por ti, solo te ayuda a decidir.</div>
    </div>`;
  } else if(verdict==="private"){
    resultEl.innerHTML = `🔒 Cuenta privada o no encontrada — no se pudo revisar su historial.${platformTag}`;
  } else if(verdict==="legit"){
    resultEl.innerHTML = `✅ Marcado como jugador normal, sin indicios de smurf.${platformTag}`;
  } else if(verdict==="pro"){
    resultEl.innerHTML = `⭐ Marcado como posible jugador muy experimentado — cuidado en la partida, pero no es smurfing.${platformTag}`;
  } else {
    resultEl.innerHTML = `Abre el perfil de <b>${name}</b> arriba y elige un veredicto en el menú.${platformTag}`;
  }
}

