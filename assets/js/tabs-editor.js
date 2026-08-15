/* ---------------- TABS ---------------- */
document.getElementById("tabMain").onclick = ()=>switchTab("main");
document.getElementById("tabEditor").onclick = ()=>switchTab("editor");
document.getElementById("tabGlossary").onclick = ()=>switchTab("glossary");
function switchTab(t){
  document.getElementById("mainView").style.display = t==="main" ? "" : "none";
  document.getElementById("editorView").style.display = t==="editor" ? "" : "none";
  document.getElementById("glossaryView").style.display = t==="glossary" ? "" : "none";
  document.getElementById("tabMain").classList.toggle("active", t==="main");
  document.getElementById("tabEditor").classList.toggle("active", t==="editor");
  document.getElementById("tabGlossary").classList.toggle("active", t==="glossary");
  if(t==="editor") renderEditorHeroList("");
}

/* ---------------- EDITOR DE COUNTERS ---------------- */
let editorRoleFilter = "";
document.getElementById("editorHeroSearch").oninput = (e)=>renderEditorHeroList(e.target.value);
document.querySelectorAll("#editorRoleFilter .role-filter-btn").forEach(btn=>{
  btn.onclick = ()=>{
    editorRoleFilter = btn.dataset.role;
    document.querySelectorAll("#editorRoleFilter .role-filter-btn").forEach(b=>b.classList.toggle("active", b===btn));
    renderEditorHeroList(document.getElementById("editorHeroSearch").value);
  };
});

function renderEditorHeroList(query){
  const list = document.getElementById("editorHeroList");
  const q = query.trim().toLowerCase();
  list.innerHTML = "";
  const filtered = HEROES.filter(h=>h.n.toLowerCase().includes(q) && (!editorRoleFilter || heroHasRole(h,editorRoleFilter)));
  // agrupado por rol en columnas lado a lado, mismo criterio que el picker de equipos (renderModalList)
  // -- si el filtro/busqueda deja solo 1 o 2 roles con resultados, la grilla usa esa cantidad de
  // columnas en vez de quedar encajonada en 1 de 3 espacios fijos con el resto en blanco.
  const rolesWithHeroes = ["Vanguard","Duelist","Strategist"].filter(role=>filtered.some(h=>heroHasRole(h,role)));
  list.style.gridTemplateColumns = window.matchMedia("(min-width:761px)").matches
    ? `repeat(${Math.max(1, rolesWithHeroes.length)}, 1fr)` : "";
  rolesWithHeroes.forEach(role=>{
    const heroesInRole = filtered.filter(h=>heroHasRole(h,role));
    const col = document.createElement("div");
    col.className = "hero-role-col";
    col.innerHTML = `<div class="hero-role-col-title">${roleIconHtml(role,15)}${t('role.'+role)} <span class="hero-role-count">${heroesInRole.length}</span></div><div class="hero-role-col-grid"></div>`;
    const grid = col.querySelector(".hero-role-col-grid");
    heroesInRole.forEach(h=>{
      const item = document.createElement("div");
      item.className = "hero-grid-item";
      const img = getHeroImage(h.n);
      const thumb = img ? `<img src="${img}" class="grid-thumb" alt="${h.n}">` : "";
      const archTags = archTagsHtml(h);
      item.innerHTML = `${thumb}<span class="n">${heroLabel(h.n)}</span>${roleTagsHtml(h)}${archTags ? `<div class="arch-tags">${archTags}</div>` : ""}`;
      item.onclick = ()=>{
        renderEditorDetail(h.n);
        document.getElementById("editorDetail").scrollIntoView({behavior:"smooth", block:"start"});
      };
      grid.appendChild(item);
    });
    list.appendChild(col);
  });
  if(list.children.length===0){
    list.innerHTML = `<p class="empty-hint" style="grid-column:1/-1;">${t("editor.noResults")}</p>`;
  }
}

let editorPreviewTimer = null;
// separa a todos los demas heroes segun como le va a "name" contra cada uno, segun la matriz.
// La banda "pelea competitiva" (code 2) se sub-divide en 3 usando el puntaje de referencia externa
// (ver externalMatchupScore en team-state.js) cuando hay dato: favorable/parejo/desfavorable --
// asi la pagina distingue un +3 de un 0 de un -3 en vez de meter todo en una sola columna pareja.
// Si no hay dato de referencia para un par puntual (unicamente pasa con Jubilee), cae por defecto
// en "parejo" -- no se inventa un numero que no existe.
function matchupBreakdown(name){
  const favorable = [], even = [], unfavorable = [], beatsEasily = [];
  HEROES.forEach(h=>{
    if(h.n===name) return;
    const code = getMatchupCode(name, h.n);
    if(code===4){ beatsEasily.push(h.n); return; }
    if(code!==2) return; // code 1 lo maneja countersFromMatrixFor abajo, code 3 es mirror (aparte)
    const ref = (typeof externalMatchupScore==="function") ? externalMatchupScore(name, h.n) : null;
    const score = ref ? ref.score : 0;
    // externalMatchupScore(name, h.n) = que tan bien le va a h.n CONTRA name -- positivo es MALO
    // para "name" (h.n le da pelea/casi lo countera), negativo es BUENO para "name". Por eso
    // "a favor" usa score<=-1 y no score>=1 (bug real: estaba invertido hasta 2026-08-03).
    if(score<=-1) favorable.push(h.n);
    else if(score>=1) unfavorable.push(h.n);
    else even.push(h.n);
  });
  // countersFromMatrixFor ya separa por relevancia real de pelea (ver counterRelevance en
  // matchups.js): un sanador que "cuenta" como counter en la matriz casi nunca busca la pelea
  // directa, asi que va aparte como "counter de utilidad" en vez de mezclado con los que de
  // verdad ganan el 1v1. Dentro de los que SI ganan el 1v1 (misma relevancia, empatados), ahora
  // countersFromMatrixFor los ordena ademas por el puntaje de referencia externa si hay dato -- eso
  // es lo que permite marcar un "counter definitivo" real aca (antes no había señal para desempatar
  // sin un equipo rival completo cargado, ahora si).
  const counters = countersFromMatrixFor(name);
  const directCounters = counters.filter(c=>c.relevance>=1).map(c=>c.c);
  const utilityCounters = counters.filter(c=>c.relevance<1).map(c=>c.c);
  return {directCounters, utilityCounters, favorable, even, unfavorable, beatsEasily, definitiveCounter: directCounters[0] || null, mirror: getMatchupCode(name,name)===3};
}

async function renderEditorDetail(name){
  const hero = byName[name];
  const breakdown = matchupBreakdown(name);

  const STANDARD_LABELS = {default:t("editor.variantDefault"), deluxe:t("editor.variantDeluxe"), dynamic:t("editor.variantDynamic")};
  // insignias reales del juego: Lord para Deluxe, Champion para Dynamic Deluxe -- en vez de solo el texto
  const VARIANT_BADGE = {deluxe:"assets/img/badge-lord.webp", dynamic:"assets/img/badge-champion.webp"};
  // el orden mostrado respeta el orden real de los datos (precargados o subidos), no uno fijo:
  // asi cada heroe puede tener sus variantes alternativas (ej. Lady Loki, Kumiho) intercaladas
  // donde corresponda, en vez de forzar siempre Default/Deluxe/Dynamic primero.
  const existingVariants = getHeroVariants(name);
  const allVariantSlots = existingVariants.map(v=>({k:v, label: STANDARD_LABELS[v] || v}));
  const variantImages = {};
  allVariantSlots.forEach(v=>{ variantImages[v.k] = getHeroImage(name, v.k); });
  const presentVariants = allVariantSlots.filter(v=>variantImages[v.k]);

  // pill clickeable: te lleva directo a la ficha de matchups de ESE heroe (sin volver a buscarlo
  // arriba) -- el nombre va en data-hero-nav en vez de en un onclick inline para no tener que
  // escapar comillas/ampersands de nombres como "Cloak & Dagger" dentro de un atributo de JS.
  const pillHtml = (n, isDefinitive)=>{
    const cls = `matchup-pill${isDefinitive?' top-pill':''}`;
    const definitiveTag = isDefinitive ? `<span class="definitive-tag">🏆 ${t("analysis.countersPerHero.definitiveLabel")}</span> · ` : "";
    return `<span class="${cls}" data-hero-nav="${n.replace(/"/g,'&quot;')}">${heroIconHtml(n,18)}${definitiveTag}${heroLabel(n)}</span>`;
  };

  let html = `<div class="counter-card">
    <div class="editor-image-row">
      <div class="editor-image-preview" id="editorImagePreview">${Object.values(variantImages).some(Boolean) ? "" : `<span class="no-img">${t("editor.noImage")}</span>`}</div>
      <div class="editor-image-actions">
        <span class="enemy-name">${heroLabel(name)}</span>${hero ? roleIconHtml(hero.r,16) : ''}
        ${hero && archTagsHtml(hero) ? `<div class="arch-tags detail-arch-tags">${archTagsHtml(hero)}</div>` : ""}
        ${(()=>{ const s = heroMetaStats(name); if(!s) return ""; return `<div class="hq-stat-row" title="${t("editor.metaStatsTooltip",{hero:heroLabel(name)}).replace(/"/g,'&quot;')}">
          <span class="hq-stat"><b>${s.winRate.toFixed(1)}%</b> ${t("editor.metaWinRate")}</span>
          <span class="hq-stat"><b>${s.pickRate.toFixed(1)}%</b> ${t("editor.metaPickRate")}</span>
          <span class="hq-stat"><b>${s.banRate.toFixed(1)}%</b> ${t("editor.metaBanRate")}</span>
        </div>`; })()}
        ${(()=>{
          const bs = heroBasicStats(name);
          if(!bs) return "";
          const parts = [];
          if(bs.basicAttack){
            const ba = bs.basicAttack;
            const dpsText = (typeof ba.dps==="number") ? `≈${ba.dps} ${t("editor.dpsUnit")}` : (ba.dmgRaw||"");
            parts.push(`<span class="hq-stat basic-stat-dmg" title="${(ba.dmgRaw||"").replace(/"/g,'&quot;')}${ba.rateRaw?" · "+ba.rateRaw.replace(/"/g,'&quot;'):""}"><b>${dpsText}</b> ${t("editor.basicAttackLabel")}</span>`);
          }
          if(bs.primaryHeal){
            const ph = bs.primaryHeal;
            const hpsText = (typeof ph.hps==="number") ? `≈${ph.hps} ${t("editor.hpsUnit")}` : (ph.raw||"");
            parts.push(`<span class="hq-stat basic-stat-heal" title="${(ph.name||"").replace(/"/g,'&quot;')}${ph.raw?" · "+ph.raw.replace(/"/g,'&quot;'):""}"><b>${hpsText}</b> ${t("editor.primaryHealLabel")}</span>`);
          }
          return parts.length ? `<div class="hq-stat-row">${parts.join("")}</div>` : "";
        })()}
        <div class="variant-view-row">
          ${presentVariants.length===0 ? `<span class="variant-label">${t("editor.noPreloadedImages")}</span>` : presentVariants.map(v=>`
            <div class="variant-thumb">
              <img class="variant-img" src="${variantImages[v.k]}" alt="${v.label}">
              ${VARIANT_BADGE[v.k] ? `<img class="variant-badge" src="${VARIANT_BADGE[v.k]}" alt="">` : ""}
              <span class="variant-label">${v.label}</span>
            </div>`).join("")}
        </div>
      </div>
    </div>
    ${breakdown.mirror ? `<div class="mirror-note">${t("editor.mirrorViable", {hero: heroLabel(name)})}</div>` : ""}
    <div class="matchup-section">
      <div class="matchup-col tier-red">
        <div class="matchup-col-title">⚔️ ${t("editor.beatThem", {hero: heroLabel(name)})}</div>
        ${breakdown.directCounters.length===0 ? `<span class="empty-hint" style="font-size:11.5px;">${t("editor.noStrongCounters")}</span>` : breakdown.directCounters.map(n=>pillHtml(n, n===breakdown.definitiveCounter)).join("")}
        ${breakdown.utilityCounters.length>0 ? `<div class="matchup-col-subtitle">${t("editor.utilityCounters")}</div><div class="utility-counters-block">${breakdown.utilityCounters.map(n=>pillHtml(n, false)).join("")}</div>` : ""}
      </div>
      <div class="matchup-col tier-orange">
        <div class="matchup-col-title">🟠 ${t("editor.unfavorable")}</div>
        ${breakdown.unfavorable.length===0 ? `<span class="empty-hint" style="font-size:11.5px;">${t("editor.noDataCataloged")}</span>` : breakdown.unfavorable.map(n=>pillHtml(n, false)).join("")}
      </div>
      <div class="matchup-col tier-neutral">
        <div class="matchup-col-title">⚪ ${t("editor.even")}</div>
        ${breakdown.even.length===0 ? `<span class="empty-hint" style="font-size:11.5px;">${t("editor.noDataCataloged")}</span>` : breakdown.even.map(n=>pillHtml(n, false)).join("")}
      </div>
      <div class="matchup-col tier-favor">
        <div class="matchup-col-title">🟢 ${t("editor.favorable")}</div>
        ${breakdown.favorable.length===0 ? `<span class="empty-hint" style="font-size:11.5px;">${t("editor.noDataCataloged")}</span>` : breakdown.favorable.map(n=>pillHtml(n, false)).join("")}
      </div>
      <div class="matchup-col tier-blue">
        <div class="matchup-col-title">🛡️ ${t("editor.beatsThemEasily", {hero: heroLabel(name)})}</div>
        ${breakdown.beatsEasily.length===0 ? `<span class="empty-hint" style="font-size:11.5px;">${t("editor.noDataCataloged")}</span>` : breakdown.beatsEasily.map(n=>pillHtml(n, false)).join("")}
      </div>
    </div>
  </div>`;

  const el = document.getElementById("editorDetail");
  el.innerHTML = html;
  // click en cualquier pill de las 5 columnas -- va directo a la ficha de ESE heroe, sin tener
  // que volver a buscarlo arriba en la grilla
  el.querySelectorAll(".matchup-pill[data-hero-nav]").forEach(pill=>{
    pill.onclick = ()=>{
      renderEditorDetail(pill.dataset.heroNav);
      el.scrollIntoView({behavior:"smooth", block:"start"});
    };
  });

  // vista previa: si hay más de una variante subida, las va rotando cada 1.5 segundos
  const previewEl = document.getElementById("editorImagePreview");
  const availableImgs = allVariantSlots.map(v=>variantImages[v.k]).filter(Boolean);
  if(editorPreviewTimer) clearInterval(editorPreviewTimer);
  if(availableImgs.length>0){
    let idx = 0;
    const paint = ()=>{ previewEl.innerHTML = `<img src="${availableImgs[idx]}" alt="${name}">`; };
    paint();
    if(availableImgs.length>1){
      editorPreviewTimer = setInterval(()=>{ idx = (idx+1)%availableImgs.length; paint(); }, 1500);
    }
  }
}

// tabla de daño/curación de ataques básicos para la pestaña Glosario -- ver
// data-sources-INTERNAL.txt y assets/data/hero-basic-stats.js para de donde salen estos numeros
// (oficiales de marvelrivals.com, no estimados). Se renderiza una sola vez al arrancar y de nuevo
// si cambia el idioma (los headers de la tabla estan traducidos, los numeros no cambian).
function renderBasicStatsInfographic(){
  const container = document.getElementById("basicStatsInfographic");
  if(!container || typeof HERO_BASIC_STATS==="undefined") return;

  const dmgRows = HEROES.map(h=>{
    const bs = HERO_BASIC_STATS[h.n];
    const ba = bs && bs.basicAttack;
    return {h, ba};
  }).filter(r=>r.ba);
  dmgRows.sort((a,b)=>{
    const ad = typeof a.ba.dps==="number" ? a.ba.dps : -1;
    const bd = typeof b.ba.dps==="number" ? b.ba.dps : -1;
    if(bd!==ad) return bd-ad;
    return a.h.n.localeCompare(b.h.n);
  });

  const healRows = HEROES.filter(h=>heroHasRole(h,"Strategist")).map(h=>{
    const bs = HERO_BASIC_STATS[h.n];
    const ph = bs && bs.primaryHeal;
    return {h, ph};
  }).filter(r=>r.ph);
  healRows.sort((a,b)=>{
    const ah = typeof a.ph.hps==="number" ? a.ph.hps : -1;
    const bh = typeof b.ph.hps==="number" ? b.ph.hps : -1;
    if(bh!==ah) return bh-ah;
    return a.h.n.localeCompare(b.h.n);
  });

  const dmgTable = `<div class="basic-stats-table-title">${t("glossary.basicStats.dmgTableTitle")}</div>
    <div class="basic-stats-table-wrap"><table class="basic-stats-table"><thead><tr>
      <th>${t("glossary.basicStats.colHero")}</th><th>${t("glossary.basicStats.colAbility")}</th>
      <th>${t("glossary.basicStats.colValue")}</th><th>${t("glossary.basicStats.colDps")}</th>
    </tr></thead><tbody>${dmgRows.map(({h,ba})=>`<tr>
      <td class="bst-hero">${heroIconHtml(h.n,20)}${heroLabel(h.n)}</td>
      <td>${ba.name}</td>
      <td class="bst-raw">${[ba.dmgRaw,ba.rateRaw].filter(Boolean).join(" · ")}</td>
      <td class="bst-num">${typeof ba.dps==="number" ? ba.dps : `<span class="empty-hint">${t("glossary.basicStats.noEstimate")}</span>`}</td>
    </tr>`).join("")}</tbody></table></div>`;

  const healTable = `<div class="basic-stats-table-title">${t("glossary.basicStats.healTableTitle")}</div>
    <div class="basic-stats-table-wrap"><table class="basic-stats-table"><thead><tr>
      <th>${t("glossary.basicStats.colHero")}</th><th>${t("glossary.basicStats.colAbility")}</th>
      <th>${t("glossary.basicStats.colHealValue")}</th><th>${t("glossary.basicStats.colHps")}</th>
    </tr></thead><tbody>${healRows.map(({h,ph})=>`<tr>
      <td class="bst-hero">${heroIconHtml(h.n,20)}${heroLabel(h.n)}</td>
      <td>${ph.name}${ph.key?` <span class="empty-hint">(${ph.key})</span>`:""}</td>
      <td class="bst-raw">${ph.raw||""}</td>
      <td class="bst-num">${typeof ph.hps==="number" ? ph.hps : `<span class="empty-hint">${t("glossary.basicStats.noEstimate")}</span>`}</td>
    </tr>`).join("")}</tbody></table></div>`;

  container.innerHTML = dmgTable + healTable;
}

