/* ---------------- BANEOS (transitorio, se resetea cada partida) ---------------- */
let banAlly = Array(3).fill(null);   // héroes que baneó tu equipo
let banEnemy = Array(3).fill(null);  // héroes que baneó el equipo rival
function bannedPool(){
  // unión de ambos lados — un héroe baneado por cualquiera de los dos ya no está disponible para nadie
  const set = new Set();
  banAlly.forEach(h=>{ if(h) set.add(h.n); });
  banEnemy.forEach(h=>{ if(h) set.add(h.n); });
  return set;
}
function renderBanSlots(){
  const renderSide = (containerId, arr)=>{
    const el = document.getElementById(containerId);
    el.innerHTML = "";
    arr.forEach((h,i)=>{
      const d = document.createElement("div");
      d.className = "slot"+(h?" filled":"");
      const thumb = h ? (getHeroImage(h.n, h._matchedVariant) ? `<img src="${getHeroImage(h.n, h._matchedVariant)}" class="slot-thumb" alt="${h.n}">` : "") : "";
      d.innerHTML = h ? `${thumb}<div class="name">🚫 ${heroLabel(h.n)}</div><div class="role">${roleIconHtml(h.r,15)}</div>` : `<div class="plus">+</div><div class="role">banear</div>`;
      d.onclick = ()=>openModal(containerId==="banAllySlots" ? "banAlly" : "banEnemy", i);
      el.appendChild(d);
    });
  };
  renderSide("banAllySlots", banAlly);
  renderSide("banEnemySlots", banEnemy);
}
// quita de los equipos (arriba) cualquier héroe que haya quedado baneado
function purgeBannedFromTeams(){
  const pool = bannedPool();
  [allyTeam, enemyTeam].forEach(team=>{
    team.forEach((h,i)=>{ if(h && pool.has(h.n)) team[i] = null; });
  });
}
// counters de un heroe, tal como vienen de la matriz (sin edicion manual: ya es una lista completa)
function effectiveCounters(name){
  return countersFromMatrixFor(name);
}

function getCounters(enemyName, allyRoster){
  const eff = effectiveCounters(enemyName);
  const banned = bannedPool();
  return eff.map(x=>({...x, have:allyRoster.includes(x.c), banned:banned.has(x.c)}));
}

/* ---------------- STATE ---------------- */
let enemyTeam = Array(6).fill(null);
let allyTeam = Array(6).fill(null);
let modalTarget = null; // {side, idx}
let myAllyIndex = null; // que casillero de tu equipo eres tú (clic derecho para marcar/desmarcar)
let jokeModeActive = false; // easter egg oculto -- ver bootstrap.js (triggerMijinEasterEgg)

/* ---------------- RENDER SLOTS ---------------- */
function renderSlots(){
  renderSideSlots("enemySlots", enemyTeam, "enemy");
  renderSideSlots("allySlots", allyTeam, "ally");
  renderAnalysis();
}
function riskCountersFor(allyHeroName, enemyNames){
  const list = effectiveCounters(allyHeroName) || [];
  return list.filter(x=>enemyNames.includes(x.c));
}

function slugifyHeroName(n){
  return n.toLowerCase().replace(/&/g,'and').replace(/[()]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}
const SLUG_TO_HERO = {};
HEROES.forEach(h=>{ SLUG_TO_HERO[slugifyHeroName(h.n)] = h.n; });

function getHeroVariants(name){
  // combina las variantes que subiste tu (localStorage) con las que vienen precargadas de fabrica
  const set = new Set();
  try{
    const raw = localStorage.getItem(`heroImageVariants:${name}`);
    if(raw) JSON.parse(raw).forEach(v=>set.add(v));
  }catch(e){}
  if(window.PRELOADED_IMAGES && window.PRELOADED_IMAGES[name]){
    Object.keys(window.PRELOADED_IMAGES[name]).forEach(v=>set.add(v));
  }
  return Array.from(set);
}
function getHeroImage(name, variant){
  try{
    if(variant){
      const v = localStorage.getItem(`heroImage:${name}:${variant}`);
      if(v) return v;
    }
    // sin variante pedida, o esa variante no existe: intenta "default", luego la clave vieja (compatibilidad)
    const def = localStorage.getItem(`heroImage:${name}:default`);
    if(def) return def;
    const legacy = localStorage.getItem(`heroImage:${name}`);
    if(legacy) return legacy;
  }catch(e){}
  // nada guardado por el usuario todavia: usa la imagen precargada de fabrica (marvel-images-data.js)
  const pre = window.PRELOADED_IMAGES && window.PRELOADED_IMAGES[name];
  if(pre){
    if(variant && pre[variant]) return pre[variant].img;
    if(pre.default) return pre.default.img;
    const firstKey = Object.keys(pre)[0];
    if(firstKey) return pre[firstKey].img;
  }
  return null;
}
// nombre para mostrar: sin el "(Vanguard)/(Duelist)/(Strategist)" en ingles del multi-rol de
// Deadpool -- el icono de clase que ya se muestra al lado (roleIconHtml/roleTagsHtml) alcanza para
// distinguir cual es cual, no hace falta repetirlo en ingles dentro del nombre.
function heroLabel(name){
  return name.replace(/ \((Vanguard|Duelist|Strategist)\)$/, "");
}
// la gente lee mejor una cara que un nombre: chip con el icono del heroe para mostrar en vez de solo texto.
// al pasar el mouse se cambia por la variante "dynamic" (el splash art) y se agranda -- ver heroIconPreview.
function heroIconHtml(name, size){
  const img = getHeroImage(name, "default");
  if(!img) return "";
  return `<img src="${img}" class="hero-icon" data-hero="${name}" style="width:${size}px;height:${size}px;" alt="${name}" loading="lazy" onmouseenter="heroIconPreview(this,true)" onmouseleave="heroIconPreview(this,false)">`;
}
function heroIconPreview(el, hovering){
  const name = el.dataset.hero;
  if(!name) return;
  if(hovering){
    const dynamicImg = getHeroImage(name, "dynamic");
    if(!dynamicImg) return;
    el.src = dynamicImg;
    el.classList.add("hero-icon-zoom");
  } else {
    el.src = getHeroImage(name, "default") || el.src;
    el.classList.remove("hero-icon-zoom");
  }
}
// logo de la clase (Vanguard/Duelist/Strategist) para mostrar en vez de -- o junto a -- la palabra suelta
function roleIconHtml(role, size){
  const img = getRoleIconImage(role);
  return img ? `<img src="${img}" class="role-icon" style="width:${size}px;height:${size}px;" alt="${role}" loading="lazy">` : "";
}
// "N Vanguard · N Duelist · N Strategist" con el logo de cada clase junto al numero, no solo la palabra
function roleCountsHtml(counts, size){
  return ["Vanguard","Duelist","Strategist"].map(r=>`${roleIconHtml(r,size||16)}${counts[r]} ${r}`).join(" · ");
}
function renderSideSlots(containerId, arr, side){
  const el = document.getElementById(containerId);
  el.innerHTML = "";
  const enemyNames = enemyTeam.filter(Boolean).map(h=>h.n);
  // sugerencias fantasma solo tienen sentido del lado de Tu equipo (elegis vos, no al rival)
  const ghosts = side==="ally" ? suggestGhostFills() : null;
  arr.forEach((h,i)=>{
    const d = document.createElement("div");
    let severity = ""; // "" | "warn" | "danger"
    if(h && side==="ally"){
      const risks = riskCountersFor(h.n, enemyNames);
      const riskWeight = risks.reduce((s,r)=>s+r.relevance,0);
      if(riskWeight>=1.7) severity = "danger";
      else if(riskWeight>=0.8) severity = "warn";
    }
    const isMe = side==="ally" && myAllyIndex===i;
    const ghost = !h && ghosts ? ghosts[i] : null;
    d.className = "slot"+(h?" filled":"")+(h && h._auto?" auto":"")+(severity?" "+severity:"")+(isMe?" is-me":"")+(ghost?" ghost":"");
    if(h){
      const badge = severity==="danger" ? '<span class="risk-badge danger">🚫</span>'
        : severity==="warn" ? '<span class="risk-badge warn">⚠️</span>' : "";
      const img = getHeroImage(h.n, h._matchedVariant);
      const thumb = img ? `<img src="${img}" class="slot-thumb" alt="${h.n}">` : "";
      const meTag = isMe ? `<span class="me-badge">👤 ${jokeModeActive ? "TÚ, MIJÍN" : "TÚ"}</span>` : "";
      d.innerHTML = `${badge}${meTag}${thumb}<div class="name">${heroLabel(h.n)}</div><div class="role">${roleIconHtml(h.r,15)}</div>`;
    } else if(ghost){
      const img = getHeroImage(ghost.n, "default");
      const thumb = img ? `<img src="${img}" class="slot-thumb" alt="${ghost.n}">` : "";
      const meTag = isMe ? `<span class="me-badge">👤 ${jokeModeActive ? "TÚ, MIJÍN" : "TÚ"}</span>` : "";
      d.innerHTML = `${meTag}${thumb}<div class="name">${heroLabel(ghost.n)}</div><div class="role">${roleIconHtml(ghost.r,15)}</div>
        <div class="ghost-tag">👻 sugerido</div>
        <div class="ghost-actions"><span class="ghost-pick">usar</span><span class="ghost-other">elegir otro</span></div>`;
    } else {
      const meTag = isMe ? `<span class="me-badge">👤 ${jokeModeActive ? "TÚ, MIJÍN" : "TÚ"}</span>` : "";
      d.innerHTML = `${meTag}<div class="plus">+</div><div class="role">añadir</div>`;
    }
    d.onclick = (e)=>{
      if(ghost && e.target.classList.contains("ghost-other")){ openModal(side,i); return; }
      if(ghost){ allyTeam[i] = ghost; renderSlots(); return; }
      openModal(side,i);
    };
    if(side==="ally"){
      d.oncontextmenu = (e)=>{
        e.preventDefault();
        myAllyIndex = (myAllyIndex===i) ? null : i;
        renderSlots();
      };
      d.title = ghost ? "Sugerencia basada en el rival actual — clic para usarla, o 'elegir otro' para buscar manualmente." : "Clic derecho para marcar/desmarcar este casillero como tú";
    }
    el.appendChild(d);
  });
}

/* ---------------- MODAL ---------------- */
function teamArrFor(side){
  if(side==="enemy") return enemyTeam;
  if(side==="ally") return allyTeam;
  if(side==="banAlly") return banAlly;
  if(side==="banEnemy") return banEnemy;
}
let modalRoleFilter = "";
function openModal(side, idx){
  modalTarget = {side, idx};
  modalRoleFilter = "";
  document.querySelectorAll("#modalRoleFilter .role-filter-btn").forEach(b=>b.classList.toggle("active", b.dataset.role===""));
  document.getElementById("modalBg").classList.add("open");
  document.getElementById("modalSearch").value = "";
  renderModalList("");
  document.getElementById("modalSearch").focus();
}
function closeModal(){
  document.getElementById("modalBg").classList.remove("open");
  modalTarget = null;
}
document.querySelectorAll("#modalRoleFilter .role-filter-btn").forEach(btn=>{
  btn.onclick = ()=>{
    modalRoleFilter = btn.dataset.role;
    document.querySelectorAll("#modalRoleFilter .role-filter-btn").forEach(b=>b.classList.toggle("active", b===btn));
    renderModalList(document.getElementById("modalSearch").value);
  };
});
function renderModalList(query){
  const list = document.getElementById("modalList");
  list.innerHTML = "";
  const q = query.trim().toLowerCase();
  const filtered = HEROES.filter(h=>h.n.toLowerCase().includes(q) && (!modalRoleFilter || heroHasRole(h,modalRoleFilter)));
  const isTeamSide = modalTarget && (modalTarget.side==="ally" || modalTarget.side==="enemy");
  const isBanSide = modalTarget && (modalTarget.side==="banAlly" || modalTarget.side==="banEnemy");
  const banned = bannedPool();
  const sameSideBans = isBanSide ? new Set(teamArrFor(modalTarget.side).filter((h,i)=>h && i!==modalTarget.idx).map(h=>h.n)) : new Set();
  const teamArr = isTeamSide ? teamArrFor(modalTarget.side) : null;
  const selectedSet = isTeamSide ? new Set(teamArr.filter(Boolean).map(h=>h.n)) : new Set();
  const teamFull = isTeamSide && teamArr.filter(Boolean).length>=6;
  const dpGroupPick = isTeamSide ? teamArr.find(h=>h && h.dpGroup) : null;
  const countEl = document.getElementById("modalCount");
  countEl.textContent = isTeamSide ? `${selectedSet.size}/6 seleccionados — tocá un héroe para sumarlo o sacarlo` : "";

  filtered.forEach(h=>{
    const row = document.createElement("div");
    const isSelected = isTeamSide && selectedSet.has(h.n);
    const blockedAsBanned = isTeamSide && !isSelected && banned.has(h.n);
    const blockedAsFull = isTeamSide && !isSelected && teamFull;
    const blockedAsDpGroup = isTeamSide && !isSelected && dpGroupPick && h.dpGroup && dpGroupPick.n!==h.n;
    const blockedAsBanDupe = isBanSide && sameSideBans.has(h.n);
    const blocked = blockedAsBanned || blockedAsFull || blockedAsDpGroup || blockedAsBanDupe;
    row.className = "modal-item" + (blocked ? " modal-item-disabled" : "") + (isSelected ? " modal-item-selected" : "");
    const img = getHeroImage(h.n);
    const thumb = img ? `<img src="${img}" class="modal-thumb" alt="${h.n}">` : `<span class="modal-thumb-empty"></span>`;
    const statusLabel = isSelected ? '<span class="role-mini modal-selected-badge">✓ en el equipo</span>'
      : blockedAsBanned ? '<span class="role-mini">🚫 baneado</span>'
      : blockedAsFull ? '<span class="role-mini">equipo completo</span>'
      : blockedAsDpGroup ? '<span class="role-mini">Deadpool ya elegido</span>'
      : blockedAsBanDupe ? '<span class="role-mini">ya baneado</span>' : '';
    row.innerHTML = `${thumb}<span class="n">${heroLabel(h.n)}</span>${roleTagsHtml(h)}${statusLabel}`;
    if(isTeamSide){
      if(!blocked || isSelected) row.onclick = ()=>toggleTeamHero(h.n);
    } else if(!blocked){
      row.onclick = ()=>selectHero(h.n);
    }
    list.appendChild(row);
  });
  if(q && !filtered.some(h=>h.n.toLowerCase()===q) && !isBanSide){
    const custom = document.createElement("div");
    custom.className = "modal-item custom-item";
    custom.innerHTML = `<span class="n">Usar "${query}" (personalizado)</span>`;
    custom.onclick = isTeamSide ? (()=>toggleTeamHero(query, true)) : (()=>selectHero(query, true));
    list.appendChild(custom);
  }
}
// equipos (aliado/rival): selección múltiple directa desde la lista completa — tocar un héroe lo suma
// al primer casillero libre, y tocar un héroe que ya está en el equipo lo saca. El modal queda abierto
// para poder armar los 6 sin reabrir la búsqueda cada vez.
function toggleTeamHero(name, isCustom){
  if(!modalTarget) return;
  const arr = teamArrFor(modalTarget.side);
  const query = document.getElementById("modalSearch").value;

  const existingIdx = arr.findIndex(h=>h && h.n===name);
  if(existingIdx!==-1){
    arr[existingIdx] = null;
    renderSlots();
    renderModalList(query);
    return;
  }

  if(bannedPool().has(name)){
    alert(`${heroLabel(name)} está baneado esta partida y no se puede seleccionar.`);
    return;
  }
  const hero = isCustom ? {n:name, r:"?", t:[]} : {...byName[name]};
  if(hero.dpGroup){
    const already = arr.find(h=>h && h.dpGroup && h.n!==name);
    if(already){
      alert(`Ya tienes a ${heroLabel(already.n)} en este equipo. Solo puede haber un Deadpool a la vez (es el mismo héroe cambiando de rol) — sácalo primero si quieres cambiar de rol.`);
      return;
    }
  }
  const emptyIdx = arr.indexOf(null);
  if(emptyIdx===-1){
    alert("Ya elegiste 6/6 héroes en este equipo. Sacá alguno antes de sumar otro.");
    return;
  }
  arr[emptyIdx] = hero;
  renderSlots();
  renderModalList(query);
}
function selectHero(name, isCustom){
  // baneos únicamente (equipos usan toggleTeamHero, selección múltiple)
  if(!modalTarget) return;
  const hero = isCustom ? {n:name, r:"?", t:[]} : {...byName[name]};
  const arr = teamArrFor(modalTarget.side);

  const dupeIdx = arr.findIndex((h,i)=>i!==modalTarget.idx && h && h.n===name);
  if(dupeIdx!==-1){
    alert(`${heroLabel(name)} ya está baneado en este mismo lado.`);
    return;
  }
  arr[modalTarget.idx] = hero;
  purgeBannedFromTeams();
  closeModal();
  renderBanSlots();
  renderSlots();
}
document.getElementById("modalClose").onclick = closeModal;
document.getElementById("modalBg").onclick = (e)=>{ if(e.target.id==="modalBg") closeModal(); };
document.getElementById("modalSearch").oninput = (e)=>renderModalList(e.target.value);

