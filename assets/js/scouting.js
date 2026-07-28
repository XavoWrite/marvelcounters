/* ---------------- SCOUTING (historial de jugadores, ambos equipos) ---------------- */
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
    `;
    el.appendChild(row);
    const nameInput = document.getElementById(`scoutName_${side}_${i}`);
    nameInput.addEventListener("input", ()=>renderScoutLinks(side,i));
    document.getElementById(`scoutClearBtn_${side}_${i}`).onclick = ()=>clearScoutRow(side,i);
  }
}
// borra un jugador puntual (por si se agrego mal o por error) sin tocar a los demas
function clearScoutRow(side, i){
  document.getElementById(`scoutName_${side}_${i}`).value = "";
  document.getElementById(`scoutPlatform_${side}_${i}`).value = "";
  renderScoutLinks(side, i);
}
function clearAllScoutRows(){
  ["ally","enemy"].forEach(side=>{
    for(let i=0;i<6;i++) clearScoutRow(side, i);
  });
}

buildScoutSide("ally");
buildScoutSide("enemy");

// muestra directo los enlaces para revisar el perfil a mano -- sin desplegable de por medio,
// y sin un "veredicto" propio: esa decision ya la toma el usuario al mirar el perfil en Tracker.gg
// o RivalsMeta, no hace falta que la app la registre por separado.
function renderScoutLinks(side, i){
  const name = document.getElementById(`scoutName_${side}_${i}`).value.trim();
  const linksEl = document.getElementById(`scoutLinks_${side}_${i}`);
  if(!name){
    linksEl.innerHTML = "";
    return;
  }
  linksEl.innerHTML = `
    <a href="https://tracker.gg/marvel-rivals/profile/ign/${encodeURIComponent(name)}/overview" target="_blank" rel="noopener">Ver en Tracker.gg ↗</a>
    <a href="https://rivalsmeta.com/search?q=${encodeURIComponent(name)}" target="_blank" rel="noopener">Buscar en RivalsMeta ↗</a>
  `;
}
