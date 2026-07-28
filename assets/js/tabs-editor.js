/* ---------------- TABS ---------------- */
document.getElementById("tabMain").onclick = ()=>switchTab("main");
document.getElementById("tabEditor").onclick = ()=>switchTab("editor");
function switchTab(t){
  document.getElementById("mainView").style.display = t==="main" ? "" : "none";
  document.getElementById("editorView").style.display = t==="editor" ? "" : "none";
  document.getElementById("tabMain").classList.toggle("active", t==="main");
  document.getElementById("tabEditor").classList.toggle("active", t==="editor");
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
  HEROES.filter(h=>h.n.toLowerCase().includes(q) && (!editorRoleFilter || heroHasRole(h,editorRoleFilter))).forEach(h=>{
    const item = document.createElement("div");
    item.className = "hero-grid-item";
    const img = getHeroImage(h.n);
    const thumb = img ? `<img src="${img}" class="grid-thumb" alt="${h.n}">` : "";
    item.innerHTML = `${thumb}<span class="n">${heroLabel(h.n)}</span>${roleTagsHtml(h)}`;
    item.onclick = ()=>renderEditorDetail(h.n);
    list.appendChild(item);
  });
  if(list.children.length===0){
    list.innerHTML = `<p class="empty-hint" style="grid-column:1/-1;">${t("editor.noResults")}</p>`;
  }
}

let editorPreviewTimer = null;
// separa a todos los demas heroes segun como le va a "name" contra cada uno, segun la matriz
function matchupBreakdown(name){
  const countersAgainst = [], competitive = [], beatsEasily = [];
  HEROES.forEach(h=>{
    if(h.n===name) return;
    const code = getMatchupCode(name, h.n);
    if(code===1) countersAgainst.push(h.n);
    else if(code===2) competitive.push(h.n);
    else if(code===4) beatsEasily.push(h.n);
  });
  return {countersAgainst, competitive, beatsEasily, mirror: getMatchupCode(name,name)===3};
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

  let html = `<div class="counter-card">
    <div class="editor-image-row">
      <div class="editor-image-preview" id="editorImagePreview">${Object.values(variantImages).some(Boolean) ? "" : `<span class="no-img">${t("editor.noImage")}</span>`}</div>
      <div class="editor-image-actions">
        <span class="enemy-name">${heroLabel(name)}</span>${hero ? roleIconHtml(hero.r,16) : ''}
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
        <div class="matchup-col-title">🔴 ${t("editor.beatThem", {hero: heroLabel(name)})}</div>
        ${breakdown.countersAgainst.length===0 ? `<span class="empty-hint" style="font-size:11.5px;">${t("editor.noStrongCounters")}</span>` : breakdown.countersAgainst.map(n=>`<span class="matchup-pill">${heroIconHtml(n,18)}${heroLabel(n)}</span>`).join("")}
      </div>
      <div class="matchup-col tier-gold">
        <div class="matchup-col-title">🟡 ${t("editor.evenFights")}</div>
        ${breakdown.competitive.length===0 ? `<span class="empty-hint" style="font-size:11.5px;">${t("editor.noDataCataloged")}</span>` : breakdown.competitive.map(n=>`<span class="matchup-pill">${heroIconHtml(n,18)}${heroLabel(n)}</span>`).join("")}
      </div>
      <div class="matchup-col tier-blue">
        <div class="matchup-col-title">🔵 ${t("editor.beatsThemEasily", {hero: heroLabel(name)})}</div>
        ${breakdown.beatsEasily.length===0 ? `<span class="empty-hint" style="font-size:11.5px;">${t("editor.noDataCataloged")}</span>` : breakdown.beatsEasily.map(n=>`<span class="matchup-pill">${heroIconHtml(n,18)}${heroLabel(n)}</span>`).join("")}
      </div>
    </div>
  </div>`;

  const el = document.getElementById("editorDetail");
  el.innerHTML = html;

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

