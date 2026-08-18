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
      d.innerHTML = h ? `${thumb}<div class="name">🚫 ${heroLabel(h.n)}</div><div class="role">${roleIconHtml(h.r,15)}</div>` : `<div class="plus">+</div><div class="role">${t("slot.ban")}</div>`;
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
  syncOverlayData();
}
// overlay para stream/OBS (overlay-ally.html) -- se lee via localStorage + evento "storage" desde
// otra pestaña con el mismo origen (o desde el Browser Source de OBS/TikTok LIVE Studio, si
// comparte perfil). Guarda solo lo minimo para dibujar las 4 grillas del overlay (tu equipo con
// aviso de riesgo, sugeridos, rival, counter principal por rival) -- nunca el objeto hero completo.
function syncOverlayData(){
  try{
    const enemyNames = enemyTeam.filter(Boolean).map(h=>h.n);
    const allyNamesNow = allyTeam.filter(Boolean).map(h=>h.n);
    const ally = allyTeam.map(h => h ? {n:h.n, warn: riskCountersFor(h.n, enemyNames).length>0} : null);
    const enemy = enemyTeam.map(h => h ? h.n : null);
    const counters = enemyTeam.map(h=>{
      if(!h) return null;
      const list = getCounters(h.n, allyNamesNow) || [];
      return list.length ? list[0].c : null;
    });
    const enemyFilledArr = enemyTeam.filter(Boolean);
    const suggestBanned = new Set([...bannedPool(), ...allyNamesNow]);
    // 2 por rol (Vanguardia/Duelista/Estratega) = 6 total, balanceado -- mismo criterio que
    // "Mejores picks contra esta composicion" (bestPicksByRole en analysis.js), asi nunca sugiere
    // algo que esa seccion no respaldaria (ej. un duelista sin ningun counter real solo por bonus
    // de arquetipo, o dejar afuera a los 3 estrategas por completo).
    let suggested = [];
    if(enemyFilledArr.length && typeof bestPicksByRole==="function"){
      const byRole = bestPicksByRole(enemyFilledArr, suggestBanned);
      ["Vanguard","Duelist","Strategist"].forEach(role=>{
        byRole[role].slice(0,2).forEach(([n])=> suggested.push(n));
      });
    }
    localStorage.setItem("overlayData", JSON.stringify({ally, enemy, counters, suggested}));
  }catch(e){}
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
// algunos heroes no tienen ninguna variante llamada literalmente "default" (ej. Hulk: sus claves son
// "hero-hulk"/"monster-hulk"/"bruce-banner", nunca "default") -- sin esto, el fallback de mas abajo
// caia en la PRIMERA clave del objeto (orden de inserción). Para Hulk se elige a proposito
// "bruce-banner" (su forma humana) como reposo: asi el hover se siente como una transformacion real
// (Bruce Banner -> Hulk), no solo una foto mas grande de lo mismo -- ver CUSTOM_DYNAMIC_OVERRIDE.
const CANONICAL_DEFAULT_VARIANT = { "Hulk": "bruce-banner" };
// casos donde el hover NO debe seguir la convencion normal "X" -> "X-dynamic" de la misma variante,
// sino saltar a otra variante distinta a proposito (el "efecto transformacion" de Hulk).
const CUSTOM_DYNAMIC_OVERRIDE = { "Hulk": "hero-hulk-dynamic" };

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
    const canon = CANONICAL_DEFAULT_VARIANT[name];
    if(canon && pre[canon]) return pre[canon].img;
    const firstKey = Object.keys(pre)[0];
    if(firstKey) return pre[firstKey].img;
  }
  return null;
}
// nombre de la variante "splash art" que corresponde a una variante base -- sigue la convencion
// "X" -> "X-dynamic" en todos los heroes, salvo el caso especial de "default" cuyo dynamic es
// literalmente "dynamic" (no "default-dynamic").
function dynamicVariantFor(baseVariant){
  return baseVariant==="default" ? "dynamic" : `${baseVariant}-dynamic`;
}
// a que variante REAL termina cayendo un pedido "default" para este heroe -- para Hulk eso es
// "hero-hulk", no la clave literal "default" (que no existe). Hace falta saberlo de antemano (no solo
// dentro de getHeroImage) para que el hover calcule el "-dynamic" que corresponde a esa variante real,
// no al pedido original.
function resolveBaseVariantName(name, requestedVariant){
  const pre = window.PRELOADED_IMAGES && window.PRELOADED_IMAGES[name];
  if(pre){
    if(requestedVariant && pre[requestedVariant]) return requestedVariant;
    if(pre.default) return "default";
    const canon = CANONICAL_DEFAULT_VARIANT[name];
    if(canon && pre[canon]) return canon;
  }
  return requestedVariant || "default";
}
// heroes con mas de una apariencia base "de fabrica" (no skins, sino formas distintas del mismo
// heroe) -- Loki cambia entre su forma masculina y femenina. Se elige al azar cual mostrar cada vez
// que se renderiza el icono, y el hover usa el dynamic que corresponda a la que se elegio (no siempre
// el mismo), para que combinen entre si.
const ALT_APPEARANCE_HEROES = { "Loki": ["default", "lady-loki"] };
// nombre para mostrar: sin el "(Vanguard)/(Duelist)/(Strategist)" en ingles del multi-rol de
// Deadpool -- el icono de clase que ya se muestra al lado (roleIconHtml/roleTagsHtml) alcanza para
// distinguir cual es cual, no hace falta repetirlo en ingles dentro del nombre.
// los 3 Deadpool mostraban el mismo nombre "Deadpool" en pantalla (solo el icono de rol los
// distinguia, facil de pasar por alto) -- pedido de Xavier, 2026-08-16: nombres de display
// distintos para cada uno, sin tocar la clave interna "Deadpool (Vanguard/Duelist/Strategist)"
// que sigue igual en hero-roster.js/la matriz/etc. Vanguard="Tankpool" (tanque), Duelist se queda
// "Deadpool" (es el DPS, el nombre "de base"), Strategist="Healpool" (sanador).
const DEADPOOL_DISPLAY_NAMES = {
  "Deadpool (Vanguard)": "Tankpool",
  "Deadpool (Duelist)": "Deadpool",
  "Deadpool (Strategist)": "Healpool",
};
function heroLabel(name){
  if(DEADPOOL_DISPLAY_NAMES[name]) return DEADPOOL_DISPLAY_NAMES[name];
  return name.replace(/ \((Vanguard|Duelist|Strategist)\)$/, "");
}
// puntaje de referencia externa (metodologia completa en data-sources-INTERNAL.txt, no se carga
// en la pagina) para heroA=el heroe "sujeto" y heroB=el otro heroe -- misma convencion de indexado
// que MATCHUP_MATRIX[H][X] (que tan bien le va a X CONTRA H). Ya se usa para calcular la propia
// matriz (ver matchups.js) y para afinar el orden/agrupado dentro de cada categoria -- si el par
// no tiene dato (ej. Jubilee) devuelve null, nunca se inventa un numero.
function externalMatchupScore(heroA, heroB){
  // ojo: REF_MATCHUP_SCORES es "const" de nivel superior en su propio <script> -- eso NO cuelga la
  // variable de "window" (a diferencia de "var"), pero sigue siendo un global real accesible por
  // nombre desde cualquier otro <script> cargado despues en la misma pagina.
  if(typeof REF_MATCHUP_SCORES==="undefined" || !REF_MATCHUP_SCORES[heroA]) return null;
  return REF_MATCHUP_SCORES[heroA][heroB] || null;
}
// fuerza general de "name" en el meta actual (no es sobre una pareja de heroes, es el heroe solo).
// Se muestra en texto plano en la ficha de Personajes -- metodologia completa en
// data-sources-INTERNAL.txt.
function heroMetaStats(name){
  if(typeof REF_HERO_META_STATS==="undefined") return null;
  return REF_HERO_META_STATS[name] || null;
}
// daño del ataque basico / curacion principal, sacado de las paginas oficiales de marvelrivals.com
// (numeros reales del juego, no estimados) -- ver data-sources-INTERNAL.txt para la metodologia y
// por que ~25 de 55 heroes solo tienen el texto crudo sin un DPS/HPS calculado (combos de varios
// golpes, cadencias compuestas, etc. que no se reducen a un solo numero de forma honesta).
function heroBasicStats(name){
  if(typeof HERO_BASIC_STATS==="undefined") return null;
  return HERO_BASIC_STATS[name] || null;
}
// la gente lee mejor una cara que un nombre: chip con el icono del heroe para mostrar en vez de solo texto.
// al pasar el mouse se cambia por la variante "dynamic" (el splash art) y se agranda -- ver heroIconPreview.
function heroIconHtml(name, size){
  const alts = ALT_APPEARANCE_HEROES[name];
  const requested = alts ? alts[Math.floor(Math.random()*alts.length)] : "default";
  const baseVariant = resolveBaseVariantName(name, requested);
  const img = getHeroImage(name, baseVariant);
  if(!img) return "";
  return `<img src="${img}" class="hero-icon" data-hero="${name}" data-base-variant="${baseVariant}" style="width:${size}px;height:${size}px;" alt="${name}" loading="lazy" onmouseenter="heroIconPreview(this,true)" onmouseleave="heroIconPreview(this,false)">`;
}
function heroIconPreview(el, hovering){
  const name = el.dataset.hero;
  if(!name) return;
  const baseVariant = el.dataset.baseVariant || "default";
  if(hovering){
    const dynamicVariant = CUSTOM_DYNAMIC_OVERRIDE[name] || dynamicVariantFor(baseVariant);
    const dynamicImg = getHeroImage(name, dynamicVariant);
    if(!dynamicImg) return;
    el.src = dynamicImg;
    el.classList.add("hero-icon-zoom");
  } else {
    el.src = getHeroImage(name, baseVariant) || el.src;
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
  return ["Vanguard","Duelist","Strategist"].map(r=>`${roleIconHtml(r,size||16)}${counts[r]} ${t('role.'+r)}`).join(" · ");
}
// version compacta: solo icono (mas grande) + numero, sin el nombre del rol en texto -- pedido de
// Xavier (2026-08-16), "solo necesitamos el icono un poquito mas grande". "highlightRole" resalta
// un rol puntual (el que conviene jugar) con un color distinto via la clase CSS "highlight".
function roleCountsIconsHtml(counts, size, highlightRole){
  return ["Vanguard","Duelist","Strategist"].map(r=>{
    const cls = r===highlightRole ? "role-count-chip highlight" : "role-count-chip";
    return `<span class="${cls}" title="${t('role.'+r)}">${roleIconHtml(r,size||22)}<b>${counts[r]}</b></span>`;
  }).join("");
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
      const meTag = isMe ? `<span class="me-badge">👤 ${jokeModeActive ? t("slot.youJoke") : t("slot.you")}</span>` : "";
      d.innerHTML = `${badge}${meTag}${thumb}<div class="name">${heroLabel(h.n)}</div><div class="role">${roleIconHtml(h.r,15)}</div>`;
    } else if(ghost){
      const img = getHeroImage(ghost.n, "default");
      const thumb = img ? `<img src="${img}" class="slot-thumb" alt="${ghost.n}">` : "";
      const meTag = isMe ? `<span class="me-badge">👤 ${jokeModeActive ? t("slot.youJoke") : t("slot.you")}</span>` : "";
      d.innerHTML = `${meTag}${thumb}<div class="name">${heroLabel(ghost.n)}</div><div class="role">${roleIconHtml(ghost.r,15)}</div>
        <div class="ghost-tag">👻 ${t("slot.suggested")}</div>
        <div class="ghost-actions"><span class="ghost-pick">${t("slot.use")}</span><span class="ghost-other">${t("slot.chooseOther")}</span></div>`;
    } else {
      const meTag = isMe ? `<span class="me-badge">👤 ${jokeModeActive ? t("slot.youJoke") : t("slot.you")}</span>` : "";
      d.innerHTML = `${meTag}<div class="plus">+</div><div class="role">${t("slot.add")}</div>`;
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
      d.title = ghost ? t("slot.ghostTitle") : t("slot.rightClickTitle");
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
  countEl.textContent = isTeamSide ? t("modal.selectedCount", {n: selectedSet.size}) : "";

  const buildItem = h=>{
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
    const statusLabel = isSelected ? `<span class="role-mini modal-selected-badge">${t("modal.inTeam")}</span>`
      : blockedAsBanned ? `<span class="role-mini">${t("modal.banned")}</span>`
      : blockedAsFull ? `<span class="role-mini">${t("modal.teamFull")}</span>`
      : blockedAsDpGroup ? `<span class="role-mini">${t("modal.deadpoolTaken")}</span>`
      : blockedAsBanDupe ? `<span class="role-mini">${t("modal.alreadyBanned")}</span>` : '';
    row.innerHTML = `${thumb}<span class="n">${heroLabel(h.n)}</span>${roleTagsHtml(h)}${statusLabel}`;
    if(isTeamSide){
      if(!blocked || isSelected) row.onclick = ()=>toggleTeamHero(h.n);
    } else if(!blocked){
      row.onclick = ()=>selectHero(h.n);
    }
    return row;
  };

  // agrupado por rol en columnas lado a lado (Vanguardia/Duelista/Estratega) en vez de una sola
  // lista larga -- asi se ve todo el roster de un vistazo, sin tener que scrollear una lista plana.
  // Cuando el filtro de rol (o una busqueda) deja solo 1 o 2 roles con resultados, la cantidad de
  // columnas de la grilla se ajusta a esa cantidad -- si no, la(s) columna(s) que sí tienen heroes
  // quedan encajonadas en 1 de 3 espacios fijos y el resto de la fila queda vacio (se veía como
  // una sola columna larga y angosta con espacio en blanco al lado).
  const rolesWithHeroes = ["Vanguard","Duelist","Strategist"].filter(role=>filtered.some(h=>heroHasRole(h,role)));
  // en mobile (media query de styles.css ya fuerza 1 columna) no tocamos el estilo inline -- un
  // inline style le gana a la media query igual, asi que ahi lo dejamos vacio para que mande la
  // regla CSS de siempre.
  list.style.gridTemplateColumns = window.matchMedia("(min-width:761px)").matches
    ? `repeat(${Math.max(1, rolesWithHeroes.length)}, 1fr)` : "";
  rolesWithHeroes.forEach(role=>{
    const heroesInRole = filtered.filter(h=>heroHasRole(h,role));
    const col = document.createElement("div");
    col.className = "hero-role-col";
    col.innerHTML = `<div class="hero-role-col-title">${roleIconHtml(role,15)}${t('role.'+role)} <span class="hero-role-count">${heroesInRole.length}</span></div><div class="hero-role-col-grid"></div>`;
    const grid = col.querySelector(".hero-role-col-grid");
    heroesInRole.forEach(h=>grid.appendChild(buildItem(h)));
    list.appendChild(col);
  });

  if(list.children.length===0){
    list.innerHTML = `<p class="empty-hint" style="grid-column:1/-1;">${t("editor.noResults")}</p>`;
  }
  if(q && !filtered.some(h=>h.n.toLowerCase()===q) && !isBanSide){
    const custom = document.createElement("div");
    custom.className = "modal-item custom-item";
    custom.innerHTML = `<span class="n">${t("modal.useCustom", {query})}</span>`;
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
    alert(t("alert.heroBanned", {hero: heroLabel(name)}));
    return;
  }
  const hero = isCustom ? {n:name, r:"?", t:[]} : {...byName[name]};
  if(hero.dpGroup){
    const already = arr.find(h=>h && h.dpGroup && h.n!==name);
    if(already){
      alert(t("alert.deadpoolDupe", {hero: heroLabel(already.n)}));
      return;
    }
  }
  const emptyIdx = arr.indexOf(null);
  if(emptyIdx===-1){
    alert(t("alert.teamFull"));
    return;
  }
  arr[emptyIdx] = hero;
  // si este casillero viene de una captura todavia cargada, aprende ese recorte con el nombre que
  // recien confirmaste a mano -- asi la deteccion automatica mejora con el uso real
  if((modalTarget.side==="ally" || modalTarget.side==="enemy") && !isCustom){
    learnHeroIconFromCurrentCapture(modalTarget.side, emptyIdx, name);
  }
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
    alert(t("alert.alreadyBannedSide", {hero: heroLabel(name)}));
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

