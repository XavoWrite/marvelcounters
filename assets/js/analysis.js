/* ---------------- ANALYSIS ---------------- */
function roleCounts(team){
  const c = {Vanguard:0, Duelist:0, Strategist:0};
  team.forEach(h=>{ if(h && c[h.r]!==undefined) c[h.r]++; });
  return c;
}
function compArchetype(counts, filled){
  if(filled<6) return null;
  const {Vanguard:v, Duelist:d, Strategist:s} = counts;
  if(v>=3) return {label:t("analysis.archetype.tripleVanguard.label"), advice:t("analysis.archetype.tripleVanguard.advice")};
  if(s>=3) return {label:t("analysis.archetype.tripleStrategist.label"), advice:t("analysis.archetype.tripleStrategist.advice")};
  if(d>=4) return {label:t("analysis.archetype.quadDuelist.label"), advice:t("analysis.archetype.quadDuelist.advice")};
  if(v===1) return {label:t("analysis.archetype.soloVanguard.label"), advice:t("analysis.archetype.soloVanguard.advice")};
  if(s===1) return {label:t("analysis.archetype.soloStrategist.label"), advice:t("analysis.archetype.soloStrategist.advice")};
  return {label:t("analysis.archetype.balanced.label"), advice:t("analysis.archetype.balanced.advice")};
}

// Heroes con herramientas dedicadas a frenar el dive -- bloquean movilidad (The Thing), dan
// escudo/HP extra al backline contra burst (Mister Fantastic), niegan vision o dan un escape con
// inmunidad a CC (Cloak & Dagger), o cierran puntos de paso (Namor). Cuantos mas tenga el rival,
// menos rinde un duelist "dive" puro (Spider-Man, Daredevil, Iron Fist, Psylocke, Black Panther)
// aunque la matriz 1v1 lo marque como counter -- en la practica no llega a meter su combo.
function antiDiveCount(team){
  return team.filter(h=>h && h.t && (h.t.includes("anti_dive")||h.t.includes("peel"))).length;
}
function diveViability(hero, antiDive){
  if(!hero.t || !hero.t.includes("dive")) return 1;
  if(antiDive>=3) return 0.35;
  if(antiDive>=2) return 0.6;
  return 1;
}

// Heroes con escudo propio o que sostienen barreras (Doctor Strange, Groot, Magneto, Emma Frost,
// Deadpool Vanguard, Invisible Woman). Contra 2+ de estos, un shield-breaker (Namor, Punisher,
// Hela, Winter Soldier -- dano sostenido o movilidad para flanquear el escudo) rinde mas de lo que
// dice la matriz 1v1, porque el resto del equipo rival no puede sostener la formacion sin escudo.
function shieldHeavyCount(team){
  return team.filter(h=>h && h.t && h.t.includes("shield")).length;
}
function shieldBreakBonus(hero, shieldHeavy){
  if(shieldHeavy>=2 && hero.t && hero.t.includes("shield_breaker")) return 1.4;
  return 1;
}

// el "por que" de cada sanador recomendado esta en el diccionario (analysis.healerWhy.<tag>) para
// que salga en el idioma correcto -- HEALER_MAP solo guarda que heroes y que clave de texto usar
const HEALER_MAP = {
  "shield":{h:["Luna Snow","Adam Warlock","Invisible Woman"], whyKey:"shield"},
  "dive":{h:["Cloak & Dagger","Mantis"], whyKey:"dive"},
  "brawl":{h:["Mantis","Rocket Raccoon"], whyKey:"brawl"},
  "zone":{h:["Luna Snow","Adam Warlock"], whyKey:"zone"},
  "turret":{h:["Rocket Raccoon","Jeff the Land Shark"], whyKey:"turret"},
};
function suggestHealers(allyTeam){
  const vanguards = allyTeam.filter(h=>h && heroHasRole(h,"Vanguard"));
  if(vanguards.length===0) return null;
  const recs = {};
  vanguards.forEach(v=>{
    const hero = byName[v.n];
    if(!hero) return;
    for(const tag of hero.t){
      if(HEALER_MAP[tag]){
        HEALER_MAP[tag].h.forEach(hn=>{
          if(!recs[hn]) recs[hn] = {reasons:new Set()};
          recs[hn].reasons.add(t("analysis.healerReasonWith", {hero: heroLabel(v.n), why: t(`analysis.healerWhy.${HEALER_MAP[tag].whyKey}`)}));
        });
        break;
      }
    }
  });
  return recs;
}

// tabla coloreada: cada uno de tus heroes (filas) contra cada rival (columnas), segun la matriz
const TIER_CLASS = {1:"tier-red", 2:"tier-gold", 3:"tier-green", 4:"tier-blue"};
const TIER_SYMBOL = {1:"⚔️", 2:"🤝", 3:"🔁", 4:"🛡️"};
function tierLabel(code){ return t(`analysis.tier.${code}`); }
function renderMatchupGrid(allyList, enemyList){
  let html = `<div class="matchup-grid-wrap"><table class="matchup-grid"><thead><tr><th></th>`;
  enemyList.forEach(e=>{ html += `<th>${heroLabel(e.n)}</th>`; });
  html += `</tr></thead><tbody>`;
  // de paso, tallar quien tiene mas matchups favorables/desfavorables para el panel lateral
  // (la tabla sola queda chica y con mucho espacio vacio al lado en pantallas anchas)
  let goodTotal=0, badTotal=0;
  let bestAlly=null, bestAllyGood=-1;
  let worstAlly=null, worstAllyBad=-1;
  allyList.forEach(a=>{
    html += `<tr><th>${heroLabel(a.n)}</th>`;
    let good=0, bad=0;
    enemyList.forEach(e=>{
      const code = getMatchupCode(a.n, e.n);
      const cls = code ? TIER_CLASS[code] : "tier-none";
      const sym = code ? TIER_SYMBOL[code] : "–";
      const label = code
        ? t("analysis.matchupTitle", {a: heroLabel(a.n), b: heroLabel(e.n), label: tierLabel(code)})
        : t("analysis.matchupTitleNoData", {a: heroLabel(a.n), b: heroLabel(e.n)});
      html += `<td class="${cls}" title="${label}">${sym}</td>`;
      if(code===4) good++;
      else if(code===1) bad++;
    });
    goodTotal += good; badTotal += bad;
    if(good>bestAllyGood){ bestAllyGood=good; bestAlly=a; }
    if(bad>worstAllyBad){ worstAllyBad=bad; worstAlly=a; }
    html += `</tr>`;
  });
  html += `</tbody></table></div>`;

  let side = `<div class="matchup-side">
    <div class="matchup-legend">
      <span class="legend-item">⚔️ ${t("analysis.legend.counter")}</span>
      <span class="legend-item">🤝 ${t("analysis.legend.even")}</span>
      <span class="legend-item">🔁 ${t("analysis.legend.mirror")}</span>
      <span class="legend-item">🛡️ ${t("analysis.legend.easy")}</span>
    </div>
    <div class="matchup-stats">
      <div class="matchup-stat"><b>${goodTotal}</b> ${t("analysis.matchupsFavor")} 🛡️</div>
      <div class="matchup-stat"><b>${badTotal}</b> ${t("analysis.matchupsAgainst")} ⚔️</div>`;
  if(bestAlly && bestAllyGood>0){
    side += `<div class="matchup-stat">${tp("analysis.strongestCard", bestAllyGood, {hero: heroLabel(bestAlly.n), n: bestAllyGood})}</div>`;
  }
  if(worstAlly && worstAllyBad>0){
    side += `<div class="matchup-stat">${tp("analysis.weakestPoint", worstAllyBad, {hero: heroLabel(worstAlly.n), n: worstAllyBad})}</div>`;
  }
  side += `</div></div>`;

  return `<div class="matchup-flex">${html}${side}</div>`;
}

// recomienda que jugar en el casillero marcado como "tú" (myAllyIndex), asumiendo que los otros
// 5 companeros de tu equipo NO van a cambiar de heroe -- solo optimiza tu propio pick
function recommendMyPick(){
  const fixedAllies = allyTeam.filter((h,i)=> h && i!==myAllyIndex);
  const enemyList = enemyTeam.filter(Boolean);
  const fixedNames = new Set(fixedAllies.map(h=>h.n));
  const banned = bannedPool();
  const fixedCounts = {Vanguard:0, Duelist:0, Strategist:0};
  fixedAllies.forEach(h=>{ if(fixedCounts[h.r]!==undefined) fixedCounts[h.r]++; });
  const roleNeed = ["Vanguard","Duelist","Strategist"].sort((a,b)=>fixedCounts[a]-fixedCounts[b])[0];
  const candidates = HEROES.filter(h=> !banned.has(h.n) && !fixedNames.has(h.n));
  const antiDiveNow = antiDiveCount(enemyList);
  const shieldHeavyNow = shieldHeavyCount(enemyList);
  const scored = candidates.map(h=>{
    let goodAgainst = 0, badAgainst = 0;
    enemyList.forEach(e=>{
      const code = getMatchupCode(h.n, e.n);
      if(code===4) goodAgainst++;
      else if(code===1) badAgainst++;
    });
    // goodAgainst pesa por counterRelevance (un sanador que "le gana facil" a alguien en la matriz
    // casi siempre es por utilidad/anti-heal, no por pelea directa), por diveViability (si el rival
    // tiene varias herramientas anti-dive, un dive puro no rinde tanto como dice la matriz) y por
    // shieldBreakBonus (si el rival tiene varios escudos, un shield-breaker rinde mas de lo que dice)
    return {h, goodAgainst, badAgainst, score: goodAgainst*2*counterRelevance(h.n)*diveViability(h,antiDiveNow)*shieldBreakBonus(h,shieldHeavyNow) - badAgainst*2};
  }).sort((a,b)=>b.score-a.score);
  // primero los mejores DENTRO del rol que hace falta (para que la recomendacion de rol no
  // quede tapada por un pick de otro rol con mejor matchup pero que no soluciona el desbalance)
  const inRolePicks = scored.filter(p=>heroHasRole(p.h, roleNeed)).slice(0,4);
  // "si preferis no cambiar de rol" tiene que ser tu MEJOR MATCHUP EN TU ROL ACTUAL, no cualquier
  // top global -- si no, cuando tu rol actual ya es el que hace falta, esta lista sale identica a
  // inRolePicks (misma pregunta, mismo resultado) y confunde en vez de dar una alternativa real.
  // Cuando tu rol actual YA es el que hace falta, esa pregunta no aplica -- pero la columna no debe
  // quedar vacia/desaparecer (se ve como un bug), asi que se muestra la mejor alternativa FUERA de
  // tu rol actual: por si un matchup puntual es tan bueno que compensa romper el 2-2-2.
  const myCurrentHero = (myAllyIndex!==null) ? allyTeam[myAllyIndex] : null;
  const currentRole = myCurrentHero ? myCurrentHero.r : null;
  const sameRoleAsNeed = currentRole===roleNeed;
  const topOverallPicks = sameRoleAsNeed ?
    scored.filter(p=>!heroHasRole(p.h, roleNeed)).slice(0,3) :
    (currentRole ? scored.filter(p=>heroHasRole(p.h, currentRole)) : scored).slice(0,3);
  return {roleNeed, fixedCounts, inRolePicks, topOverallPicks, sameRoleAsNeed, currentRole};
}

let ghostFillEnabled = true;
// "relleno fantasma": para cada casillero vacio de Tu equipo sugiere un heroe (sin agregarlo todavia)
// -- primero cubre los roles que faltan para un 2-2-2, y dentro de cada rol elige el mejor matchup
// contra el rival actual. Sin rival cargado no hay señal real en la que basarse, asi que no sugiere
// nada (mejor no sugerir que sugerir al azar).
function suggestGhostFills(){
  const empty = Array(6).fill(null);
  if(!ghostFillEnabled) return empty;
  const enemyList = enemyTeam.filter(Boolean);
  if(enemyList.length===0) return empty;
  const emptyIdx = [];
  allyTeam.forEach((h,i)=>{ if(!h) emptyIdx.push(i); });
  if(emptyIdx.length===0) return empty;

  const banned = bannedPool();
  const used = new Set(allyTeam.filter(Boolean).map(h=>h.n));
  const counts = roleCounts(allyTeam);
  const antiDiveNow = antiDiveCount(enemyList);
  const shieldHeavyNow = shieldHeavyCount(enemyList);

  const target = {Vanguard:2, Duelist:2, Strategist:2};
  const roleQueue = [];
  ["Vanguard","Duelist","Strategist"].forEach(r=>{
    for(let k=0; k<Math.max(0, target[r]-counts[r]); k++) roleQueue.push(r);
  });
  let cyc = 0;
  while(roleQueue.length<emptyIdx.length){ roleQueue.push(["Vanguard","Duelist","Strategist"][cyc%3]); cyc++; }

  emptyIdx.forEach((slotI, k)=>{
    const role = roleQueue[k];
    const candidates = HEROES.filter(h=> !banned.has(h.n) && !used.has(h.n) && heroHasRole(h, role));
    const scored = candidates.map(h=>{
      let goodAgainst=0, badAgainst=0;
      enemyList.forEach(e=>{
        const code = getMatchupCode(h.n, e.n);
        if(code===4) goodAgainst++; else if(code===1) badAgainst++;
      });
      return {h, score: goodAgainst*2*counterRelevance(h.n)*diveViability(h,antiDiveNow)*shieldBreakBonus(h,shieldHeavyNow) - badAgainst*2};
    }).sort((a,b)=>b.score-a.score);
    if(scored.length){
      empty[slotI] = scored[0].h;
      used.add(scored[0].h.n);
    }
  });
  return empty;
}

function computeWinProbability(allyTeam, enemyTeam){
  const allyList = allyTeam.filter(Boolean);
  const enemyList = enemyTeam.filter(Boolean);
  const enemyNames = enemyList.map(h=>h.n);
  const allyNames = allyList.map(h=>h.n);
  let score = 50;
  const reasons = [];

  // mismo umbral que "Alineación en riesgo" (a la derecha) -- si un héroe aparece ahí marcado como
  // en riesgo (Vigílalo o Cambio muy recomendado), tiene que pesar en el score. Antes el umbral acá
  // era mucho mas alto (riskWeight>1) que el umbral visual (>=0.4), asi que una alineacion con 5 de
  // 6 héroes marcados en riesgo podia seguir mostrando 90%+ de probabilidad -- desalineado con lo
  // que la propia herramienta estaba advirtiendo.
  allyList.forEach(h=>{
    const risks = riskCountersFor(h.n, enemyNames);
    const riskWeight = risks.reduce((s,r)=>s+r.relevance,0);
    if(risks.length>=1 && riskWeight>=0.4){
      const severe = riskWeight>=1.7;
      const penalty = severe ? Math.round(10+riskWeight*6) : Math.round(riskWeight*8);
      score -= penalty;
      reasons.push(tp("analysis.winProb.reasonRisk", risks.length, {n:-penalty, hero: heroLabel(h.n), count: risks.length, severity: severe ? t("analysis.winProb.severityHigh") : t("analysis.winProb.severityNormal")}));
    }
  });
  enemyList.forEach(e=>{
    const haveCounters = getCounters(e.n, allyNames).filter(c=>c.have);
    const haveWeight = haveCounters.reduce((s,c)=>s+c.relevance,0);
    if(haveWeight>0){
      const bonus = Math.round(haveWeight*6);
      score += bonus;
      reasons.push(tp("analysis.winProb.reasonBonus", haveCounters.length, {n:bonus, count: haveCounters.length, hero: heroLabel(e.n)}));
    }
  });

  // un equipo incompleto juega con menos manos que el rival -- es una desventaja real, no solo
  // falta de datos, asi que penaliza fuerte por cada companero que todavia no eligio
  const allyMissing = 6 - allyList.length;
  if(allyMissing>0){
    const penalty = allyMissing*15;
    score -= penalty;
    reasons.push(tp("analysis.winProb.reasonMissing", allyMissing, {n:-penalty, missing: allyMissing}));
  }

  // el balance de roles pesa en el resultado real de la partida aunque gane la mayoria de los
  // matchups 1v1 (un solo vanguardia = backline expuesto a dive, un solo estratega = sin sanacion
  // sostenida) -- sin esto el score podia marcar 90%+ en comps de 1 tanque que en la practica se
  // pierden por el desbalance, no por perder matchups individuales
  if(allyList.length>=4){
    const rc = roleCounts(allyList);
    if(rc.Vanguard===0){
      score -= 25;
      reasons.push(t("analysis.winProb.noVanguard"));
    } else if(rc.Vanguard===1){
      score -= 15;
      reasons.push(t("analysis.winProb.oneVanguard"));
    }
    if(rc.Strategist===0){
      score -= 22;
      reasons.push(t("analysis.winProb.noStrategist"));
    } else if(rc.Strategist===1){
      score -= 12;
      reasons.push(t("analysis.winProb.oneStrategist"));
    }
    if(rc.Duelist===0){
      score -= 12;
      reasons.push(t("analysis.winProb.noDuelist"));
    } else if(rc.Duelist>=5){
      score -= 8;
      reasons.push(t("analysis.winProb.tooManyDuelist"));
    }
  }

  score = Math.max(5, Math.min(95, Math.round(score)));
  return {prob:score, reasons};
}

function renderAnalysis(){
  const el = document.getElementById("analysis");
  const enemyFilled = enemyTeam.filter(Boolean).length;
  const allyFilled = allyTeam.filter(Boolean).length;
  let left = "", right = "", bottom = "";

  // probabilidad de victoria (heurística orientativa, no un cálculo real de winrate) -- el detalle
  // de que te esta jugando en contra ya se explica en "Alineación en riesgo", no se repite aca
  left += `<div class="analysis-section"><div class="sec-title">${t("analysis.winProb.title")}</div>`;
  if(allyFilled===0 || enemyFilled===0){
    left += `<p class="empty-hint">${t("analysis.winProb.needBoth")}</p>`;
  } else {
    const {prob} = computeWinProbability(allyTeam, enemyTeam);
    const barColor = prob>=60 ? "var(--ally)" : prob>=40 ? "var(--gold)" : "var(--enemy)";
    left += `<div class="comp-banner">
      <div class="winprob-bar-outer"><div class="winprob-bar-inner" style="width:${prob}%;background:${barColor};"></div><div class="winprob-label">${t("analysis.winProb.estimated", {prob})}</div></div>
      <div style="font-size:11.5px;color:var(--muted);margin-top:8px;">${t("analysis.winProb.disclaimer")}</div>
    </div>`;
  }
  left += `</div>`;

  // Tu composición + Qué deberías jugar tú, lado a lado para ahorrar espacio vertical
  left += `<div class="comp-pick-row">`;
  left += `<div class="analysis-section"><div class="sec-title">${t("analysis.yourComp.title")}</div>`;
  if(allyFilled===0){
    left += `<p class="empty-hint">${t("analysis.yourComp.addYours")}</p>`;
  } else {
    const myCounts = roleCounts(allyTeam);
    left += `<div class="comp-banner">${t("analysis.yourComp.summary", {counts: roleCountsHtml(myCounts), n: allyFilled})}`;
    if(myCounts.Vanguard<=1 && allyFilled>=4){
      left += `<br>${myCounts.Vanguard===0 ? t("analysis.yourComp.vanguardWarnZero") : t("analysis.yourComp.vanguardWarnOne")}`;
    } else if(myCounts.Vanguard>=4){
      left += `<br>${t("analysis.yourComp.tooManyVanguard")}`;
    }
    if(myCounts.Strategist<=1 && allyFilled>=4){
      left += `<br>${myCounts.Strategist===0 ? t("analysis.yourComp.strategistWarnZero") : t("analysis.yourComp.strategistWarnOne")}`;
    } else if(myCounts.Strategist>=3){
      left += `<br>${t("analysis.yourComp.tooManyStrategist")}`;
    } else if(myCounts.Strategist===2 && myCounts.Vanguard===2){
      left += `<br>${t("analysis.yourComp.perfectBalance")}`;
    }
    if(allyFilled<6){
      const missing = 6-allyFilled;
      const target = {Vanguard:2, Duelist:2, Strategist:2};
      const needed = ["Vanguard","Duelist","Strategist"]
        .map(r=>({r, gap: target[r]-myCounts[r]}))
        .filter(x=>x.gap>0)
        .sort((a,b)=>b.gap-a.gap)
        .map(x=> `${roleIconHtml(x.r,16)}${x.gap>1 ? `${x.gap} ${t('role.'+x.r)}` : t('role.'+x.r)}`);
      const neededSuffix = needed.length ? t("analysis.yourComp.neededRoles", {roles: needed.join(", ")}) : "";
      left += `<br>${tp("analysis.yourComp.missingPlayers", missing, {missing})}${neededSuffix}`;
    }
    left += `</div>`;
  }
  left += `</div>`;

  // recomendacion para TU especificamente: asume que tus 5 companeros no van a cambiar de heroe.
  // Aca adentro (fila angosta) solo va el resumen -- las listas de picks van en su propia fila
  // mas abajo, a lo ancho completo del bloque, para que entren comodas en 2 columnas reales.
  left += `<div class="analysis-section"><div class="sec-title">${t("analysis.whatToPlay.title")}</div>`;
  let rec = null;
  if(myAllyIndex===null){
    left += `<p class="empty-hint">${t("analysis.whatToPlay.markYourself")}</p>`;
  } else if(enemyFilled===0){
    left += `<p class="empty-hint">${t("analysis.whatToPlay.addEnemy")}</p>`;
  } else {
    rec = recommendMyPick();
    left += `<div class="comp-banner">${t("analysis.whatToPlay.summary", {counts: roleCountsHtml(rec.fixedCounts), role: roleIconHtml(rec.roleNeed,16)+t('role.'+rec.roleNeed)})}</div>`;
  }
  left += `</div>`;
  left += `</div>`;

  // fila aparte (ancho completo del bloque, no anidada) con las listas de picks en 2 columnas reales
  // -- siempre 2 columnas, nunca 1 sola, para que la fila no se vea rota/asimetrica ni de la impresion
  // de que "desaparecio" una columna
  if(rec){
    const renderPickCard = p=>{
      const badSuffix = p.badAgainst>0 ? t("analysis.pickCard.badSuffix", {bad:p.badAgainst}) : "";
      return `<div class="healer-card role-${p.h.r}"><div class="h-name">${heroIconHtml(p.h.n,28)}${heroLabel(p.h.n)} ${roleIconHtml(p.h.r,15)}</div>
      <div class="h-reason">${t("analysis.pickCard.reason", {good:p.goodAgainst, total:enemyFilled, badSuffix})}</div></div>`;
    };
    const col2Title = rec.sameRoleAsNeed ? t("analysis.pickCard.col2TitleAlt") : t("analysis.pickCard.col2TitlePreferSame");
    const col2Sub = rec.sameRoleAsNeed
      ? t("analysis.pickCard.col2SubAlt")
      : t("analysis.pickCard.col2SubPreferSame", {role: rec.currentRole ? t('role.'+rec.currentRole) : t("analysis.pickCard.yourCurrentRole")});
    left += `<div class="two-col-fit">`;
    left += `<div class="role-rec-col"><div class="role-rec-title">${roleIconHtml(rec.roleNeed,16)}${t("analysis.pickCard.bestOptionsOf", {role: t('role.'+rec.roleNeed)})}</div>
      <p class="empty-hint" style="font-size:11px;margin:-4px 0 2px;">${rec.sameRoleAsNeed ? t("analysis.pickCard.alreadyPlayingRole", {role: t('role.'+rec.roleNeed)}) : t("analysis.pickCard.roleThatsMissing")}</p>`;
    if(rec.inRolePicks.length===0){
      left += `<p class="empty-hint" style="font-size:12px;">${t("analysis.pickCard.noCandidates")}</p>`;
    } else {
      left += rec.inRolePicks.map(renderPickCard).join("");
    }
    left += `</div>`;
    left += `<div class="role-rec-col"><div class="role-rec-title">${roleIconHtml(rec.currentRole||rec.roleNeed,16)}${col2Title}</div>
      <p class="empty-hint" style="font-size:11px;margin:-4px 0 2px;">${col2Sub}</p>`;
    if(rec.topOverallPicks.length===0){
      left += `<p class="empty-hint" style="font-size:12px;">${t("analysis.pickCard.noData")}</p>`;
    } else {
      left += rec.topOverallPicks.map(renderPickCard).join("");
    }
    left += `</div>`;
    left += `</div>`;
  }

  // matriz de matchups de la partida actual: tus 6 vs los 6 rivales -- va abajo de todo, a lo ancho,
  // porque es la parte mas dificil de leer de un vistazo y no conviene que compita por espacio arriba
  bottom += `<div class="analysis-section"><div class="sec-title">${t("analysis.matrix.title")}</div>`;
  if(allyFilled===0 || enemyFilled===0){
    bottom += `<p class="empty-hint">${t("analysis.matrix.needBoth")}</p>`;
  } else {
    bottom += renderMatchupGrid(allyTeam.filter(Boolean), enemyTeam.filter(Boolean));
  }
  bottom += `</div>`;

  // comp analysis (lado del rival)
  right += `<div class="analysis-section"><div class="sec-title">${t("analysis.rivalComp.title")}</div>`;
  if(enemyFilled===0){
    right += `<p class="empty-hint">${t("analysis.rivalComp.addSix")}</p>`;
  } else {
    const counts = roleCounts(enemyTeam);
    const arche = compArchetype(counts, enemyFilled);
    right += `<div class="comp-banner">${t("analysis.rivalComp.detected", {counts: roleCountsHtml(counts), n: enemyFilled})}`;
    if(arche){
      right += `<br><b>${arche.label}.</b> ${arche.advice}`;
    } else {
      right += `<br>${t("analysis.rivalComp.addRestForFull")}`;
    }
    right += `</div>`;
    const antiDive = antiDiveCount(enemyTeam.filter(Boolean));
    if(antiDive>=2){
      right += `<div class="comp-banner" style="margin-top:8px;border-color:var(--gold);">${t("analysis.rivalComp.antiDiveWarn", {n: antiDive})}</div>`;
    }
    const shieldHeavy = shieldHeavyCount(enemyTeam.filter(Boolean));
    if(shieldHeavy>=2){
      right += `<div class="comp-banner" style="margin-top:8px;border-color:var(--gold);">${t("analysis.rivalComp.shieldWarn", {n: shieldHeavy})}</div>`;
    }
  }

  right += `</div>`;

  // recomendaciones por rol para vencer la composición completa del rival
  left += `<div class="analysis-section"><div class="sec-title">${t("analysis.bestPicks.title")}</div>`;
  if(enemyFilled===0){
    left += `<p class="empty-hint">${t("analysis.bestPicks.addEnemies", {v: roleIconHtml("Vanguard",14)+t("role.Vanguard"), d: roleIconHtml("Duelist",14)+t("role.Duelist"), s: roleIconHtml("Strategist",14)+t("role.Strategist")})}</p>`;
  } else {
    const enemyListForRoles = enemyTeam.filter(Boolean);
    const banned = bannedPool();
    const allyNamesNow = allyTeam.filter(Boolean).map(h=>h.n);
    const antiDiveNow = antiDiveCount(enemyListForRoles);
    const shieldHeavyNow = shieldHeavyCount(enemyListForRoles);
    left += `<div class="role-rec-grid">`;
    ["Vanguard","Duelist","Strategist"].forEach(role=>{
      const scores = {};
      enemyListForRoles.forEach(e=>{
        getCounters(e.n, []).forEach(c=>{
          const ch = byName[c.c];
          if(!ch || !heroHasRole(ch, role)) return;
          if(banned.has(c.c)) return; // no tiene sentido recomendar algo baneado
          if(!scores[c.c]) scores[c.c] = {hits:0, relevance:c.relevance, dive:diveViability(ch, antiDiveNow), shield:shieldBreakBonus(ch, shieldHeavyNow)};
          scores[c.c].hits++;
        });
      });
      // se ordena por hits*relevancia*viabilidad de dive*bonus de shield-break (no solo hits) para
      // que un sanador que "contrarresta" por utilidad indirecta, o un dive que el rival tiene bien
      // frenado, no le gane el lugar a algo que de verdad rinde contra esta composición puntual
      // 4 en vez de 3 -- con retrato en vez de tarjeta de texto, 3 quedaba como una "L" (2 arriba +
      // 1 abajo suelto); 4 completa un cuadrado 2x2 parejo dentro de la columna angosta
      const ranked = Object.entries(scores)
        .sort((a,b)=> (b[1].hits*b[1].relevance*b[1].dive*b[1].shield) - (a[1].hits*a[1].relevance*a[1].dive*a[1].shield))
        .slice(0,4);
      left += `<div class="role-rec-col"><div class="role-rec-title">${roleIconHtml(role,16)}${t('role.'+role)}</div>`;
      if(ranked.length===0){
        left += `<p class="empty-hint" style="font-size:12px;">${t("analysis.bestPicks.noDataForRole")}</p>`;
      } else {
        // retrato tipo casillero (mismo lenguaje visual que "Tu equipo") en vez de tarjeta de texto --
        // se lee de un vistazo; el detalle completo queda en el tooltip (title)
        left += `<div class="pick-slot-row">`;
        ranked.forEach(([n, s])=>{
          const already = allyNamesNow.includes(n);
          const diveWarn = s.dive<1;
          const reason = t("analysis.bestPicks.counters", {hits: s.hits, total: enemyListForRoles.length}) + (diveWarn ? t("analysis.bestPicks.diveWarnSuffix") : "");
          const thumb = heroIconHtml(n,40);
          left += `<div class="pick-slot role-${role}${already?' already':''}" title="${reason.replace(/"/g,'&quot;')}">
            ${thumb}<div class="name">${heroLabel(n)}</div><div class="role">${roleIconHtml(role,12)}${s.hits}/${enemyListForRoles.length}</div>
            ${already?`<div class="already-tag">${t("analysis.bestPicks.alreadyInTeam")}</div>`:''}
            ${diveWarn?`<div class="dive-warn">${t("analysis.bestPicks.diveFrozen")}</div>`:''}
          </div>`;
        });
        left += `</div>`;
      }
      left += `</div>`;
    });
    left += `</div>
    <p class="empty-hint" style="margin-top:8px;">${t("analysis.bestPicks.noAdviceFooter")}</p>`;
  }

  left += `</div>`;
  // healer suggestions -- va abajo de "Mejores picks", del mismo lado (izquierda: son acciones tuyas)
  left += `<div class="analysis-section"><div class="sec-title">${t("analysis.healerSupport.title")}</div>`;
  const allyNames = allyTeam.filter(Boolean).map(h=>h.n);
  const enemyNamesNow = enemyTeam.filter(Boolean).map(h=>h.n);
  const recs = suggestHealers(allyTeam);
  if(!recs){
    left += `<p class="empty-hint">${t("analysis.healerSupport.needVanguard")}</p>`;
  } else {
    // siempre se muestran al menos MIN_HEALER_RECS -- si el rival ya tiene bien contrarrestados a
    // los sanadores con sinergia real, se completa con el resto de estrategas ordenados por menor
    // riesgo (del mejor al peor, pero siempre son las mejores opciones que hay disponibles)
    const MIN_HEALER_RECS = 3;
    const riskOf = hn => riskCountersFor(hn, enemyNamesNow).reduce((s,r)=>s+r.relevance,0);
    const allStrategists = HEROES.filter(h=>h.r==="Strategist").map(h=>h.n);
    const pool = Array.from(new Set([...Object.keys(recs), ...allStrategists])).map(hn=>({
      hn, risk: riskOf(hn), reasons: recs[hn] ? [...recs[hn].reasons] : []
    }));
    pool.sort((a,b)=>{
      const aRisky = a.risk>=0.4, bRisky = b.risk>=0.4;
      if(aRisky!==bRisky) return aRisky?1:-1; // los que no estan en riesgo van primero
      if((a.reasons.length>0)!==(b.reasons.length>0)) return a.reasons.length>0?-1:1; // con sinergia real primero
      return a.risk-b.risk; // entre iguales, el menos riesgoso
    });
    const nonRiskyCount = pool.filter(p=>p.risk<0.4).length;
    const keys = pool.slice(0, Math.max(MIN_HEALER_RECS, nonRiskyCount));
    if(keys.length===0){
      left += `<p class="empty-hint">${t("analysis.healerSupport.noSpecific")}</p>`;
    } else {
      left += `<div class="healer-grid">`;
      keys.forEach(({hn, risk, reasons})=>{
        const already = allyNames.includes(hn);
        const risky = risk>=0.4;
        const reasonText = reasons.length ? reasons.join("<br>") : t("analysis.healerSupport.noSynergyReason");
        const riskWarn = risky ? `<br>${t("analysis.healerSupport.riskWarn")}` : "";
        left += `<div class="healer-card role-Strategist${risky?' risky':''}"><div class="h-name">${heroIconHtml(hn,28)}${heroLabel(hn)}${already?` <span class="already-tag">${t("analysis.healerSupport.alreadyInTeam")}</span>`:''}</div>
          <div class="h-reason">${reasonText}${riskWarn}</div></div>`;
      });
      left += `</div>`;
    }
  }
  left += `</div>`;

  // risky ally picks -- lado del rival: es sobre que tanto te castiga la alineacion rival actual
  right += `<div class="analysis-section"><div class="sec-title">${t("analysis.riskAlignment.title")}</div>`;
  const enemyNamesForRisk = enemyTeam.filter(Boolean).map(h=>h.n);
  const allyNamesForRisk = allyTeam.filter(Boolean).map(h=>h.n);
  if(allyTeam.filter(Boolean).length===0){
    right += `<p class="empty-hint">${t("analysis.riskAlignment.addYours")}</p>`;
  } else {
    let anyRisk = false;
    allyTeam.forEach(h=>{
      if(!h) return;
      const risks = riskCountersFor(h.n, enemyNamesForRisk);
      const riskWeight = risks.reduce((s,r)=>s+r.relevance,0);
      // se ignoran los riesgos casi todo soporte (relevancia baja): un sanador que "cuenta" en la
      // matriz rara vez lo busca a pelear de frente, asi que no vale la pena alertar por eso solo
      if(risks.length>=1 && riskWeight>=0.4){
        anyRisk = true;
        const severe = riskWeight>=1.7;
        const rolesToMatch = h.roles && h.roles.length ? h.roles : [h.r];
        // no tiene sentido "recomendar" a alguien que ya esta en tu equipo (ya sea este mismo
        // casillero en riesgo, u otro companero) -- eso no es una alternativa real, es duplicar
        const sameRole = HEROES.filter(x=>x.n!==h.n && !allyNamesForRisk.includes(x.n) && rolesToMatch.some(r=>heroHasRole(x,r)));
        const scored = sameRole.map(x=>({n:x.n, score:riskCountersFor(x.n, enemyNamesForRisk).reduce((s,r)=>s+r.relevance,0)}))
          .sort((a,b)=>a.score-b.score).slice(0,2);
        const verdict = severe
          ? t("analysis.riskAlignment.severeVerdict", {n: risks.length})
          : t("analysis.riskAlignment.watchVerdict");
        const counteredList = risks.map(r=>heroIconHtml(r.c,18)+'<b>'+heroLabel(r.c)+'</b>').join(" ");
        const altList = scored.map(s=>heroIconHtml(s.n,18)+'<b>'+heroLabel(s.n)+'</b>'+t("analysis.riskAlignment.counterScoreSuffix",{score:s.score.toFixed(2)})).join(" ");
        right += `<div class="risk-card${severe?' severe':''}">
          <span class="r-name">${severe?'🚫':'⚠'} ${heroIconHtml(h.n,24)}${heroLabel(h.n)}</span>
          <div class="r-body">${verdict}<br>${t("analysis.riskAlignment.countered", {list: counteredList})}.<br>
          ${t("analysis.riskAlignment.alternatives", {list: altList})}</div>
        </div>`;
      }
    });
    if(!anyRisk) right += `<p class="empty-hint">${t("analysis.riskAlignment.allGood")}</p>`;
  }
  right += `</div>`;

  // per-hero counters -- lado del rival: es la lista de counters para cada heroe rival
  right += `<div class="analysis-section"><div class="sec-title">${t("analysis.countersPerHero.title")}</div>`;
  const enemyNames = enemyTeam.filter(Boolean).map(h=>h.n);
  if(enemyFilled===0){
    right += `<p class="empty-hint">${t("analysis.countersPerHero.noneAdded")}</p>`;
  } else {
    const pillHtml = c=>{
      const cls = `pill ${c.have?'have':''} ${c.banned?'hidden-pill':''}`;
      // el logo de clase (Vanguard/Duelist/Strategist) es lo unico que distingue, a simple vista,
      // entre los 3 Deadpool (mismo retrato, mismo nombre en pantalla) -- sin esto dos sugerencias
      // de "Deadpool" se ven identicas aunque sean roles totalmente distintos.
      const role = byName[c.c] && byName[c.c].r;
      return `<span class="${cls}">${heroIconHtml(c.c,20)}${role?roleIconHtml(role,13):''}${c.banned?t("analysis.countersPerHero.banned"):''}${c.have?`<span class="check">${t("analysis.countersPerHero.alreadyInTeam")}</span> · `:''}<b>${heroLabel(c.c)}</b></span>`;
    };
    const MAX_PRIMARY_COUNTERS = 6;
    enemyTeam.forEach(h=>{
      if(!h) return;
      // ya viene ordenado por counterRelevance: pelea directa primero, soporte que rara vez
      // duelea al final -- se muestran los mas utiles y el resto queda plegado para no saturar
      const counters = getCounters(h.n, allyNames);
      const shown = counters.slice(0, MAX_PRIMARY_COUNTERS);
      const rest = counters.slice(MAX_PRIMARY_COUNTERS);
      right += `<div class="counter-card">
        <span class="enemy-name">${heroIconHtml(h.n,26)}${heroLabel(h.n)}</span>${roleIconHtml(h.r,15)}
        <div class="counter-list">`;
      if(counters.length===0){
        right += `<span class="pill">${t("analysis.countersPerHero.noneCataloged")}</span>`;
      } else {
        shown.forEach(c=>{ right += pillHtml(c); });
      }
      right += `</div>`;
      if(rest.length>0){
        right += `<details class="counters-more"><summary>${tp("analysis.countersPerHero.more", rest.length, {n: rest.length})}</summary>
          <div class="counter-list" style="margin-top:8px;">${rest.map(pillHtml).join("")}</div></details>`;
      }
      right += `</div>`;
    });
  }
  right += `</div>`;

  el.innerHTML = `<div class="analysis-cols"><div class="analysis-col">${left}</div><div class="analysis-col">${right}</div></div>${bottom}`;
}

// igual que arriba, pero devuelve el data URL completo (con prefijo) para usar directo en un <img src="">
function fileToBase64ImageResized(file, maxDim){
  return new Promise((resolve,reject)=>{
    const img = new Image();
    const reader = new FileReader();
    reader.onload = ()=>{ img.src = reader.result; };
    reader.onerror = reject;
    img.onload = ()=>{
      let {width,height} = img;
      if(width>height && width>maxDim){ height*=maxDim/width; width=maxDim; }
      else if(height>maxDim){ width*=maxDim/height; height=maxDim; }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d").drawImage(img,0,0,width,height);
      resolve(canvas.toDataURL("image/jpeg",0.85));
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}
