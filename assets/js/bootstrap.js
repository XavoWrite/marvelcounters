/* ---------------- ARRANQUE ---------------- */
// imagen del logo de rol: siempre el precargado de fabrica (marvel-images-data.js)
function getRoleIconImage(role){
  try{ const v = localStorage.getItem(`roleIcon:${role}`); if(v) return v; }catch(e){}
  const pre = window.PRELOADED_ROLE_ICONS && window.PRELOADED_ROLE_ICONS[role];
  return pre ? pre.img : null;
}
// firma de color del logo de rol, usada para desambiguar heroes con el mismo retrato (ej: Deadpool)
function getRoleIconSig(role){
  try{ const raw = localStorage.getItem(`roleIconSig:${role}`); if(raw) return JSON.parse(raw); }catch(e){}
  const pre = window.PRELOADED_ROLE_ICONS && window.PRELOADED_ROLE_ICONS[role];
  return pre ? pre.sig : null;
}
function applyRoleIconsToFilters(){
  ["Vanguard","Duelist","Strategist"].forEach(role=>{
    const icon = getRoleIconImage(role);
    if(!icon) return;
    document.querySelectorAll(`.role-filter-btn[data-role="${role}"]`).forEach(btn=>{
      if(!btn.querySelector("img")) btn.innerHTML = `<img src="${icon}" alt="">${btn.textContent}`;
    });
  });
}
applyRoleIconsToFilters();
document.getElementById("clearBansBtn").onclick = ()=>{
  banAlly = Array(3).fill(null);
  banEnemy = Array(3).fill(null);
  renderBanSlots();
  renderAnalysis();
};
document.getElementById("swapTeamsBtn").onclick = ()=>{
  const tmp = allyTeam;
  allyTeam = enemyTeam;
  enemyTeam = tmp;
  renderSlots();
};
document.getElementById("clearAllTeamsBtn").onclick = ()=>{
  if(!confirm("¿Vaciar los dos equipos por completo?")) return;
  allyTeam = Array(6).fill(null);
  enemyTeam = Array(6).fill(null);
  myAllyIndex = null;
  renderSlots();
};
document.getElementById("clearAllyBtn").onclick = ()=>{
  allyTeam = Array(6).fill(null);
  myAllyIndex = null;
  renderSlots();
};
document.getElementById("clearEnemyBtn").onclick = ()=>{
  enemyTeam = Array(6).fill(null);
  renderSlots();
};
document.getElementById("clearAllScoutBtn").onclick = ()=>{
  if(confirm("¿Borrar los nombres, plataformas y veredictos de los 12 jugadores?")) clearAllScoutRows();
};
const backToTopBtn = document.getElementById("backToTopBtn");
window.addEventListener("scroll", ()=>{
  backToTopBtn.classList.toggle("show", window.scrollY > 400);
});
backToTopBtn.onclick = ()=> window.scrollTo({top:0, behavior:"smooth"});

// mensajitos ocasionales abajo a la derecha (recordatorios cortos, no bloquean nada)
const TIPS = [
  "🚧 Página en proceso — la seguimos mejorando y puede cambiar de un día a otro.",
  "Datos de meta orientativos — el balance cambia con cada parche, usa esto como punto de partida, no como verdad absoluta.",
  "La identificación por captura es 100% offline — no depende de internet.",
];
let tipIndex = 0;
let tipDismissed = false;
const tipToast = document.getElementById("tipToast");
const tipToastText = document.getElementById("tipToastText");
function showNextTip(){
  if(tipDismissed) return;
  tipToastText.textContent = TIPS[tipIndex % TIPS.length];
  tipIndex++;
  tipToast.classList.add("show");
  setTimeout(()=> tipToast.classList.remove("show"), 8000);
}
document.getElementById("tipToastClose").onclick = ()=>{
  tipDismissed = true;
  tipToast.classList.remove("show");
};
setTimeout(showNextTip, 4000);
setInterval(showNextTip, 75000);

// mensaje corto puntual (reutiliza el mismo toast de tips, no hace falta un componente nuevo)
function showQuickToast(msg, ms){
  tipDismissed = false;
  tipToastText.textContent = msg;
  tipToast.classList.add("show");
  setTimeout(()=> tipToast.classList.remove("show"), ms||4000);
}

document.getElementById("autoPickMeBtn").onclick = ()=>{
  if(myAllyIndex===null){
    showQuickToast("Primero marca tu casillero: clic derecho en tu héroe (o en un casillero vacío) dentro de 'Tu equipo'.");
    return;
  }
  if(enemyTeam.filter(Boolean).length===0){
    showQuickToast("Añade al menos un héroe rival para calcular tu mejor pick.");
    return;
  }
  const rec = recommendMyPick();
  const best = rec.inRolePicks[0] || rec.topOverallPicks[0];
  if(!best){
    showQuickToast("No hay candidatos disponibles (¿todo baneado o ya elegido por tus compañeros?).");
    return;
  }
  allyTeam[myAllyIndex] = best.h;
  renderSlots();
};

const ghostToggleBtn = document.getElementById("ghostToggleBtn");
ghostToggleBtn.onclick = ()=>{
  ghostFillEnabled = !ghostFillEnabled;
  ghostToggleBtn.textContent = ghostFillEnabled ? "👻 fantasma: on" : "👻 fantasma: off";
  renderSlots();
};

// -------- easter egg oculto: 7 clics en tu propia etiqueta "TÚ", o 7 minutos en la pagina --------
// chiste ecuatoriano para XavoDraw. No es un logro ni se anuncia en ningun lado -- si lo encontras,
// lo encontraste.
let mijinClickCount = 0;
let mijinTriggered = false;
function triggerMijinEasterEgg(){
  if(mijinTriggered) return;
  mijinTriggered = true;
  jokeModeActive = true;
  renderSlots();
  tipDismissed = false;
  tipToastText.textContent = "🎉 Ya nos cachaste — Tú, mijín 😄";
  tipToast.classList.add("show");
  setTimeout(()=>{
    tipToast.classList.remove("show");
    jokeModeActive = false;
    renderSlots();
    mijinTriggered = false; // se puede volver a activar despues, no es de una sola vez
  }, 15000);
}
document.addEventListener("click", (e)=>{
  if(!e.target.closest(".me-badge")) return;
  mijinClickCount++;
  if(mijinClickCount>=7) triggerMijinEasterEgg();
});
setTimeout(triggerMijinEasterEgg, 7*60*1000);

renderBanSlots();
renderSlots();
