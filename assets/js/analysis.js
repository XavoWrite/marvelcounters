/* ---------------- ANALYSIS ---------------- */
function roleCounts(team){
  const c = {Vanguard:0, Duelist:0, Strategist:0};
  team.forEach(h=>{ if(h && c[h.r]!==undefined) c[h.r]++; });
  return c;
}
function compArchetype(counts, filled){
  if(filled<6) return null;
  const {Vanguard:v, Duelist:d, Strategist:s} = counts;
  if(v>=3) return {label:"Triple tanque / línea reforzada", advice:"El rival prioriza escudos y peleo cuerpo a cuerpo. Cambia un duelista por uno con <b>rotura de escudo o burst</b> (Namor, Hela, Punisher) y valora un <b>3er estratega</b> para sostener la presión extra en el frente."};
  if(s>=3) return {label:"Triple soporte", advice:"El rival cura demasiado para trabajar de a poco. Necesitas <b>burst y dive</b> para matar antes de que las curas lleguen: prioriza Spider-Man, Black Panther o Hela sobre picks de poke lento."};
  if(d>=4) return {label:"Comp muy ofensiva, poco sostén", advice:"El rival es frágil detrás del daño. Un <b>vanguardia anti-dive</b> (Captain America, Venom) más presión agresiva puede colapsar su formación antes de que estabilicen."};
  if(v===1) return {label:"Solo un tanque", advice:"Backline expuesto. Presiona con dive directo al soporte: la falta de un segundo frontline los deja vulnerables a flanqueos."};
  if(s===1) return {label:"Un solo soporte", advice:"Poca sanación total. Cualquier pick de burst sostenido puede forzar picks rápidos antes de que el healer solitario reaccione."};
  return {label:"Composición equilibrada 2-2-2", advice:"Formación estándar. Ajusta counters individuales según los héroes específicos abajo, sin necesidad de romper tu propia estructura 2-2-2."};
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

const HEALER_MAP = {
  "shield":{h:["Luna Snow","Adam Warlock","Invisible Woman"], why:"Sanadores estáticos de área que sostienen bien detrás de un escudo fijo."},
  "dive":{h:["Cloak & Dagger","Mantis"], why:"Sanadores móviles que pueden seguir el ritmo de un tanque que se adelanta al frente enemigo."},
  "brawl":{h:["Mantis","Rocket Raccoon"], why:"Curación sostenida + utilidad para peleas prolongadas cuerpo a cuerpo."},
  "zone":{h:["Luna Snow","Adam Warlock"], why:"Sanación de área constante para un tanque que controla espacio."},
  "turret":{h:["Rocket Raccoon","Jeff the Land Shark"], why:"Buena sinergia con un tanque que también juega estático/posicional."},
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
          recs[hn].reasons.add(`Con ${heroLabel(v.n)}: ${HEALER_MAP[tag].why}`);
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
const TIER_LABEL = {1:"te contrarresta", 2:"pelea pareja", 3:"mirror", 4:"le ganas fácil"};
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
      const label = code ? `${heroLabel(a.n)} vs ${heroLabel(e.n)}: ${TIER_LABEL[code]}` : `${heroLabel(a.n)} vs ${heroLabel(e.n)}: sin datos`;
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
      <span class="legend-item">⚔️ te contrarrestan</span>
      <span class="legend-item">🤝 pelea pareja</span>
      <span class="legend-item">🔁 mirror</span>
      <span class="legend-item">🛡️ le ganas fácil</span>
    </div>
    <div class="matchup-stats">
      <div class="matchup-stat"><b>${goodTotal}</b> matchups a tu favor 🛡️</div>
      <div class="matchup-stat"><b>${badTotal}</b> matchups en tu contra ⚔️</div>`;
  if(bestAlly && bestAllyGood>0){
    side += `<div class="matchup-stat">Tu carta más fuerte: <b>${heroLabel(bestAlly.n)}</b> (le gana fácil a ${bestAllyGood} rival${bestAllyGood===1?'':'es'})</div>`;
  }
  if(worstAlly && worstAllyBad>0){
    side += `<div class="matchup-stat">Tu punto más débil: <b>${heroLabel(worstAlly.n)}</b> (${worstAllyBad} rival${worstAllyBad===1?'':'es'} lo contrarrestan)</div>`;
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
      reasons.push(`-${penalty}: ${heroLabel(h.n)} tiene ${risks.length} counter(s) ${severe?'muy fuertes':'relevantes'} en su contra`);
    }
  });
  enemyList.forEach(e=>{
    const haveCounters = getCounters(e.n, allyNames).filter(c=>c.have);
    const haveWeight = haveCounters.reduce((s,c)=>s+c.relevance,0);
    if(haveWeight>0){
      const bonus = Math.round(haveWeight*6);
      score += bonus;
      reasons.push(`+${bonus}: tienes ${haveCounters.length} counter(s) contra ${heroLabel(e.n)}`);
    }
  });

  // un equipo incompleto juega con menos manos que el rival -- es una desventaja real, no solo
  // falta de datos, asi que penaliza fuerte por cada companero que todavia no eligio
  const allyMissing = 6 - allyList.length;
  if(allyMissing>0){
    const penalty = allyMissing*15;
    score -= penalty;
    reasons.push(`-${penalty}: te faltan ${allyMissing} jugador(es) en tu equipo — estás en desventaja numérica`);
  }

  // el balance de roles pesa en el resultado real de la partida aunque gane la mayoria de los
  // matchups 1v1 (un solo vanguardia = backline expuesto a dive, un solo estratega = sin sanacion
  // sostenida) -- sin esto el score podia marcar 90%+ en comps de 1 tanque que en la practica se
  // pierden por el desbalance, no por perder matchups individuales
  if(allyList.length>=4){
    const rc = roleCounts(allyList);
    if(rc.Vanguard===0){
      score -= 25;
      reasons.push(`-25: sin vanguardia — tu backline queda totalmente expuesto a dive`);
    } else if(rc.Vanguard===1){
      score -= 15;
      reasons.push(`-15: un solo vanguardia — backline expuesto, alto riesgo de dive`);
    }
    if(rc.Strategist===0){
      score -= 22;
      reasons.push(`-22: sin estratega — no tienes sanación sostenida`);
    } else if(rc.Strategist===1){
      score -= 12;
      reasons.push(`-12: un solo estratega — sanación insuficiente para sostener peleas`);
    }
    if(rc.Duelist===0){
      score -= 12;
      reasons.push(`-12: sin duelista — te falta daño para cerrar peleas`);
    } else if(rc.Duelist>=5){
      score -= 8;
      reasons.push(`-8: casi todo el equipo es duelista — poco frente y poco sostén`);
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
  left += `<div class="analysis-section"><div class="sec-title">Probabilidad de victoria con esta composición</div>`;
  if(allyFilled===0 || enemyFilled===0){
    left += `<p class="empty-hint">Añade héroes en ambos equipos para ver una estimación.</p>`;
  } else {
    const {prob} = computeWinProbability(allyTeam, enemyTeam);
    const barColor = prob>=60 ? "var(--ally)" : prob>=40 ? "var(--gold)" : "var(--enemy)";
    left += `<div class="comp-banner">
      <div class="winprob-bar-outer"><div class="winprob-bar-inner" style="width:${prob}%;background:${barColor};"></div><div class="winprob-label">${prob}% estimado</div></div>
      <div style="font-size:11.5px;color:var(--muted);margin-top:8px;">Esto NO es un cálculo real de winrate — es una estimación relativa basada en la matriz de matchups y el balance de roles. <b>No mide habilidad, coordinación ni diferencia de rango entre los jugadores</b> — un equipo con la composición perfecta igual puede perder contra rivales de rango más alto o más coordinados. Úsalo como guía de composición, no como predicción del resultado. El detalle de qué te juega en contra está en "Alineación en riesgo", a la derecha.</div>
    </div>`;
  }
  left += `</div>`;

  // Tu composición + Qué deberías jugar tú, lado a lado para ahorrar espacio vertical
  left += `<div class="comp-pick-row">`;
  left += `<div class="analysis-section"><div class="sec-title">Tu composición</div>`;
  if(allyFilled===0){
    left += `<p class="empty-hint">Añade tu equipo para revisar el balance de roles.</p>`;
  } else {
    const myCounts = roleCounts(allyTeam);
    left += `<div class="comp-banner">Tu equipo: <b>${roleCountsHtml(myCounts)}</b> (${allyFilled}/6 añadidos).`;
    if(myCounts.Vanguard<=1 && allyFilled>=4){
      left += `<br>🚫 <b>Jugar con ${myCounts.Vanguard===0?'cero':'un solo'} vanguardia deja tu backline muy expuesto.</b> Sin un segundo frontline, cualquier dive al soporte cuesta muchísimo de frenar y sueles perder la pelea aunque gane la mayoría de tus matchups 1v1 — esto pesa fuerte en la probabilidad de victoria de abajo. Si puedes, suma un segundo vanguardia.`;
    } else if(myCounts.Vanguard>=4){
      left += `<br>⚠ 4+ vanguardias es poco daño para cerrar peleas — sostenés bien pero puede que no logres matar antes de que te curen. En la mayoría de los rangos, 2 vanguardias rinde mejor.`;
    }
    if(myCounts.Strategist<=1 && allyFilled>=4){
      left += `<br>🚫 <b>Jugar con ${myCounts.Strategist===0?'cero':'un solo'} estratega es de alto riesgo.</b> Según datos de la comunidad, el 2-2-2 ronda ~52-54% de winrate, mientras que las comps de 1 solo estratega caen a ~42-46% — se pierde la mayoría de las veces salvo compos muy puntuales y coordinadas. Si puedes, suma un segundo estratega.`;
    } else if(myCounts.Strategist>=3){
      left += `<br>⚠ Triple estratega ronda ~45% de winrate en la comunidad — viable, pero exige muy buena rotación de ultimates y coordinación. En la mayoría de los rangos, 2 estrategas rinde mejor.`;
    } else if(myCounts.Strategist===2 && myCounts.Vanguard===2){
      left += `<br>✅ 2-2-2 es el punto más confiable según la meta actual.`;
    }
    if(allyFilled<6){
      const missing = 6-allyFilled;
      const target = {Vanguard:2, Duelist:2, Strategist:2};
      const needed = ["Vanguard","Duelist","Strategist"]
        .map(r=>({r, gap: target[r]-myCounts[r]}))
        .filter(x=>x.gap>0)
        .sort((a,b)=>b.gap-a.gap)
        .map(x=> `${roleIconHtml(x.r,16)}${x.gap>1 ? `${x.gap} ${x.r}` : x.r}`);
      left += `<br>⚠ Te falta${missing===1?'':'n'} <b>${missing}</b> jugador${missing===1?'':'es'} — mientras no completes, jugás en desventaja numérica real.${needed.length ? ` Para acercarte a un 2-2-2, te conviene sumar: <b>${needed.join(", ")}</b>.` : ""}`;
    }
    left += `</div>`;
  }
  left += `</div>`;

  // recomendacion para TU especificamente: asume que tus 5 companeros no van a cambiar de heroe.
  // Aca adentro (fila angosta) solo va el resumen -- las listas de picks van en su propia fila
  // mas abajo, a lo ancho completo del bloque, para que entren comodas en 2 columnas reales.
  left += `<div class="analysis-section"><div class="sec-title">Qué deberías jugar tú</div>`;
  let rec = null;
  if(myAllyIndex===null){
    left += `<p class="empty-hint">Clic derecho en tu casillero (en "Tu equipo") para marcarte — así te recomiendo qué jugar específicamente a ti, asumiendo que tus compañeros no van a cambiar.</p>`;
  } else if(enemyFilled===0){
    left += `<p class="empty-hint">Añade el equipo rival para recibir una recomendación para tu pick.</p>`;
  } else {
    rec = recommendMyPick();
    left += `<div class="comp-banner">Tus compañeros fijos (sin contarte a ti): <b>${roleCountsHtml(rec.fixedCounts)}</b>. Rol que más te conviene cubrir: <b>${roleIconHtml(rec.roleNeed,16)}${rec.roleNeed}</b>.</div>`;
  }
  left += `</div>`;
  left += `</div>`;

  // fila aparte (ancho completo del bloque, no anidada) con las listas de picks en 2 columnas reales
  // -- siempre 2 columnas, nunca 1 sola, para que la fila no se vea rota/asimetrica ni de la impresion
  // de que "desaparecio" una columna
  if(rec){
    const renderPickCard = p=>`<div class="healer-card role-${p.h.r}"><div class="h-name">${heroIconHtml(p.h.n,28)}${heroLabel(p.h.n)} ${roleIconHtml(p.h.r,15)}</div>
      <div class="h-reason">Le gana fácil a ${p.goodAgainst} de ${enemyFilled} rivales${p.badAgainst>0 ? `, pero ${p.badAgainst} lo contrarrestan a él` : ''}.</div></div>`;
    const col2Title = rec.sameRoleAsNeed
      ? `Alternativa fuera de tu rol`
      : `Si prefieres no cambiar tu rol`;
    const col2Sub = rec.sameRoleAsNeed
      ? `por si un matchup puntual vale más que mantener el 2-2-2`
      : `jugando ${rec.currentRole || "tu rol actual"}`;
    left += `<div class="two-col-fit">`;
    left += `<div class="role-rec-col"><div class="role-rec-title">${roleIconHtml(rec.roleNeed,16)}Mejores opciones de ${rec.roleNeed}</div>
      <p class="empty-hint" style="font-size:11px;margin:-4px 0 2px;">${rec.sameRoleAsNeed ? `ya juegas ${rec.roleNeed}, justo el rol que le falta a tu equipo` : 'el rol que le falta a tu equipo'}</p>`;
    if(rec.inRolePicks.length===0){
      left += `<p class="empty-hint" style="font-size:12px;">No hay candidatos disponibles (¿todo baneado o ya elegido por tus compañeros?).</p>`;
    } else {
      left += rec.inRolePicks.map(renderPickCard).join("");
    }
    left += `</div>`;
    left += `<div class="role-rec-col"><div class="role-rec-title">${roleIconHtml(rec.currentRole||rec.roleNeed,16)}${col2Title}</div>
      <p class="empty-hint" style="font-size:11px;margin:-4px 0 2px;">${col2Sub}</p>`;
    if(rec.topOverallPicks.length===0){
      left += `<p class="empty-hint" style="font-size:12px;">Sin datos suficientes todavía.</p>`;
    } else {
      left += rec.topOverallPicks.map(renderPickCard).join("");
    }
    left += `</div>`;
    left += `</div>`;
  }

  // matriz de matchups de la partida actual: tus 6 vs los 6 rivales -- va abajo de todo, a lo ancho,
  // porque es la parte mas dificil de leer de un vistazo y no conviene que compita por espacio arriba
  bottom += `<div class="analysis-section"><div class="sec-title">Matriz de la partida (tu equipo vs el rival)</div>`;
  if(allyFilled===0 || enemyFilled===0){
    bottom += `<p class="empty-hint">Añade héroes en ambos equipos para ver la matriz completa.</p>`;
  } else {
    bottom += renderMatchupGrid(allyTeam.filter(Boolean), enemyTeam.filter(Boolean));
  }
  bottom += `</div>`;

  // comp analysis (lado del rival)
  right += `<div class="analysis-section"><div class="sec-title">Análisis de composición rival</div>`;
  if(enemyFilled===0){
    right += `<p class="empty-hint">Añade los 6 héroes enemigos (foto o manual) para ver el análisis de composición.</p>`;
  } else {
    const counts = roleCounts(enemyTeam);
    const arche = compArchetype(counts, enemyFilled);
    right += `<div class="comp-banner">Detectado: <b>${roleCountsHtml(counts)}</b> (${enemyFilled}/6 añadidos).`;
    if(arche){
      right += `<br><b>${arche.label}.</b> ${arche.advice}`;
    } else {
      right += `<br>Añade los héroes restantes para un diagnóstico completo del arquetipo de equipo.`;
    }
    right += `</div>`;
    const antiDive = antiDiveCount(enemyTeam.filter(Boolean));
    if(antiDive>=2){
      right += `<div class="comp-banner" style="margin-top:8px;border-color:var(--gold);">🛡️ Este rival tiene ${antiDive} herramientas anti-dive (bloquea movilidad, escuda al backline o te niega la visión) — un duelista de <b>buceo puro</b> (Spider-Man, Daredevil, Iron Fist, Psylocke, Black Panther) no va a poder rematar su combo. Priorizá poke/ranged (Hela, Punisher, Namor, Hawkeye) o presión sostenida en vez de dive.</div>`;
    }
    const shieldHeavy = shieldHeavyCount(enemyTeam.filter(Boolean));
    if(shieldHeavy>=2){
      right += `<div class="comp-banner" style="margin-top:8px;border-color:var(--gold);">🔰 Este rival tiene ${shieldHeavy} escudos (Doctor Strange, Groot, Magneto, Emma Frost, Deadpool Vanguard o Invisible Woman) — sin romperlos, el resto del equipo ni te va a sentir. Priorizá <b>shield-breakers</b> (Namor, Punisher, Hela, Winter Soldier) por encima de daño que el escudo simplemente absorbe.</div>`;
    }
  }

  right += `</div>`;

  // recomendaciones por rol para vencer la composición completa del rival
  left += `<div class="analysis-section"><div class="sec-title">Mejores picks contra esta composición</div>`;
  if(enemyFilled===0){
    left += `<p class="empty-hint">Añade héroes enemigos para ver qué ${roleIconHtml("Vanguard",14)}vanguardia, ${roleIconHtml("Duelist",14)}duelista y ${roleIconHtml("Strategist",14)}estratega les gana mejor en conjunto.</p>`;
  } else {
    const enemyListForRoles = enemyTeam.filter(Boolean);
    const banned = bannedPool();
    const allyNamesNow = allyTeam.filter(Boolean).map(h=>h.n);
    const roleLabels = {Vanguard:"Vanguardia", Duelist:"Duelista", Strategist:"Estratega"};
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
      left += `<div class="role-rec-col"><div class="role-rec-title">${roleIconHtml(role,16)}${roleLabels[role]}</div>`;
      if(ranked.length===0){
        left += `<p class="empty-hint" style="font-size:12px;">Sin datos suficientes todavía para este rol.</p>`;
      } else {
        // retrato tipo casillero (mismo lenguaje visual que "Tu equipo") en vez de tarjeta de texto --
        // se lee de un vistazo; el detalle completo queda en el tooltip (title)
        left += `<div class="pick-slot-row">`;
        ranked.forEach(([n, s])=>{
          const already = allyNamesNow.includes(n);
          const diveWarn = s.dive<1;
          const reason = `Contrarresta bien a ${s.hits} de los ${enemyListForRoles.length} héroes rivales.${diveWarn ? ' Es un dive puro y este rival tiene con qué frenarlo — no cuentes con que remate el combo.' : ''}`;
          const thumb = heroIconHtml(n,40);
          left += `<div class="pick-slot role-${role}${already?' already':''}" title="${reason.replace(/"/g,'&quot;')}">
            ${thumb}<div class="name">${heroLabel(n)}</div><div class="role">${roleIconHtml(role,12)}${s.hits}/${enemyListForRoles.length}</div>
            ${already?'<div class="already-tag">✓ ya en tu equipo</div>':''}
            ${diveWarn?'<div class="dive-warn">⚠ dive frenado</div>':''}
          </div>`;
        });
        left += `</div>`;
      }
      left += `</div>`;
    });
    left += `</div>
    <p class="empty-hint" style="margin-top:8px;">No te digo "usa a X sí o sí" — mira estas opciones contra la alineación en riesgo de abajo antes de decidir el cambio.</p>`;
  }

  left += `</div>`;
  // healer suggestions -- va abajo de "Mejores picks", del mismo lado (izquierda: son acciones tuyas)
  left += `<div class="analysis-section"><div class="sec-title">Soporte recomendado para tu línea</div>`;
  const allyNames = allyTeam.filter(Boolean).map(h=>h.n);
  const enemyNamesNow = enemyTeam.filter(Boolean).map(h=>h.n);
  const recs = suggestHealers(allyTeam);
  if(!recs){
    left += `<p class="empty-hint">Selecciona al menos un Vanguard en tu equipo para recibir sugerencias de soporte compatible.</p>`;
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
      left += `<p class="empty-hint">Sin recomendaciones específicas para esta combinación — cualquier soporte flexible (Mantis, Luna Snow) funciona bien.</p>`;
    } else {
      left += `<div class="healer-grid">`;
      keys.forEach(({hn, risk, reasons})=>{
        const already = allyNames.includes(hn);
        const risky = risk>=0.4;
        const reasonText = reasons.length ? reasons.join("<br>") : "Sin sinergia específica catalogada con tu vanguard, pero sigue siendo una opción sólida en general.";
        const riskWarn = risky ? `<br>⚠ El rival ya lo tiene bien contrarrestado — no es ideal, pero es de las mejores opciones disponibles.` : "";
        left += `<div class="healer-card role-Strategist${risky?' risky':''}"><div class="h-name">${heroIconHtml(hn,28)}${heroLabel(hn)}${already?' <span class="already-tag">· ✓ ya en tu equipo</span>':''}</div>
          <div class="h-reason">${reasonText}${riskWarn}</div></div>`;
      });
      left += `</div>`;
    }
  }
  left += `</div>`;

  // risky ally picks -- lado del rival: es sobre que tanto te castiga la alineacion rival actual
  right += `<div class="analysis-section"><div class="sec-title">Alineación en riesgo</div>`;
  const enemyNamesForRisk = enemyTeam.filter(Boolean).map(h=>h.n);
  const allyNamesForRisk = allyTeam.filter(Boolean).map(h=>h.n);
  if(allyTeam.filter(Boolean).length===0){
    right += `<p class="empty-hint">Añade tu equipo para detectar picks en riesgo.</p>`;
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
          ? `🚫 <b>Cambio muy recomendado</b> — ${risks.length} héroes distintos lo contrarrestan bien, se acumula demasiada desventaja.`
          : `⚠ <b>Vigílalo</b> — counter(s) normal(es) en su contra, tus healers deberían poder compensarlo, pero si el rival lo prioriza en la pelea, considera cambiar.`;
        right += `<div class="risk-card${severe?' severe':''}">
          <span class="r-name">${severe?'🚫':'⚠'} ${heroIconHtml(h.n,24)}${heroLabel(h.n)}</span>
          <div class="r-body">${verdict}<br>Lo contrarrestan: ${risks.map(r=>heroIconHtml(r.c,18)+'<b>'+heroLabel(r.c)+'</b>').join(" ")}.<br>
          Alternativas de su mismo rol: ${scored.map(s=>heroIconHtml(s.n,18)+'<b>'+heroLabel(s.n)+'</b>'+" ("+s.score.toFixed(2)+" counters en su contra)").join(" ")}</div>
        </div>`;
      }
    });
    if(!anyRisk) right += `<p class="empty-hint">Ningún héroe de tu equipo tiene counters fuertes en la alineación rival actual. Vas bien.</p>`;
  }
  right += `</div>`;

  // per-hero counters -- lado del rival: es la lista de counters para cada heroe rival
  right += `<div class="analysis-section"><div class="sec-title">Counters sugeridos por héroe</div>`;
  const enemyNames = enemyTeam.filter(Boolean).map(h=>h.n);
  if(enemyFilled===0){
    right += `<p class="empty-hint">Aún no hay héroes enemigos añadidos.</p>`;
  } else {
    const pillHtml = c=>{
      const cls = `pill ${c.have?'have':''} ${c.banned?'hidden-pill':''}`;
      return `<span class="${cls}">${heroIconHtml(c.c,20)}${c.banned?'🚫 baneado · ':''}${c.have?'<span class="check">✓ ya en tu equipo</span> · ':''}<b>${heroLabel(c.c)}</b></span>`;
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
        right += `<span class="pill">Sin counters fuertes catalogados en la matriz para este héroe.</span>`;
      } else {
        shown.forEach(c=>{ right += pillHtml(c); });
      }
      right += `</div>`;
      if(rest.length>0){
        right += `<details class="counters-more"><summary>+${rest.length} más (soporte y counters secundarios)</summary>
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

