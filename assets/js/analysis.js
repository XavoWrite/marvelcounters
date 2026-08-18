/* ---------------- ANALYSIS ---------------- */
function roleCounts(team){
  const c = {Vanguard:0, Duelist:0, Strategist:0};
  team.forEach(h=>{ if(h && c[h.r]!==undefined) c[h.r]++; });
  return c;
}
// bug real corregido (2026-08-16, señalado por Xavier con una captura de 5 vanguardias): antes
// "v>=3" siempre mostraba el label fijo "Triple tanque" sin importar si eran 3, 4 o 5 -- ahora el
// label interpola el conteo real ({v}/{s}/{d}). Tambien se saco la sugerencia de heroe puntual de
// aca adentro (el "Con {hero} le ganas" que solo aparecia en el caso balanced) -- Xavier: "no
// comprendi que hace el personaje ahi, que tiene que ver la composicion equilibrada con el
// personaje". Ahora el pick sugerido (topCounterPick) es SIEMPRE un callout aparte, con su propio
// icono, para cualquier arquetipo -- ver bloque que llama a compArchetype en renderAnalysis.
function compArchetype(counts, filled){
  if(filled<6) return null;
  const {Vanguard:v, Duelist:d, Strategist:s} = counts;
  if(v>=3) return {label:t("analysis.archetype.tripleVanguard.label", {v}), advice:t("analysis.archetype.tripleVanguard.advice")};
  if(s>=3) return {label:t("analysis.archetype.tripleStrategist.label", {s}), advice:t("analysis.archetype.tripleStrategist.advice")};
  if(d>=4) return {label:t("analysis.archetype.quadDuelist.label", {d}), advice:t("analysis.archetype.quadDuelist.advice")};
  if(v===1) return {label:t("analysis.archetype.soloVanguard.label"), advice:t("analysis.archetype.soloVanguard.advice")};
  if(s===1) return {label:t("analysis.archetype.soloStrategist.label"), advice:t("analysis.archetype.soloStrategist.advice")};
  return {label:t("analysis.archetype.balanced.label"), advice:t("analysis.archetype.balanced.advice")};
}

// mejor heroe posible (cualquier rol, sin banear) contra el equipo rival COMPLETO -- reusa
// candidateScoreAgainst (misma formula que recommendMyPick/suggestGhostFills/Mejores picks por
// rol) para que la sugerencia de la comp "equilibrada" sea consistente con el resto de la app, no
// un criterio nuevo aparte.
function topCounterPick(enemyList, banned){
  if(!enemyList.length) return null;
  const antiDiveNow = antiDiveCount(enemyList);
  const shieldHeavyNow = shieldHeavyCount(enemyList);
  let best = null, bestScore = -Infinity;
  HEROES.forEach(h=>{
    if(banned.has(h.n)) return;
    const {score, goodAgainst, trouble} = candidateScoreAgainst(h, enemyList, antiDiveNow, shieldHeavyNow);
    if(trouble>goodAgainst) return; // mas counters/casi-counters en contra que a favor -- no sirve como "mejor pick"
    if(score>bestScore){ bestScore=score; best=h; }
  });
  return best;
}
// mismo scoring que "Mejores picks contra esta composicion" (por rol, basado en getCounters real
// -- SOLO entran heroes que la matriz ya marca como counter de al menos un rival puntual, a
// diferencia de topCounterPick/candidateScoreAgainst que puntuan a todo el roster con formula
// generica y pueden colar a alguien con varios counters reales EN SU CONTRA si sus bonus de
// arquetipo pesan mas que el descuento -- bug real reportado por Xavier, 2026-08-17: Iron Man
// salia sugerido contra un rival con Winter Soldier/Black Widow/Luna Snow, los 3 lo counterean).
// Extraida a funcion propia para que "Mejores picks" (el render de abajo) y el overlay de stream
// (syncOverlayData, "Sugeridos") usen exactamente el mismo criterio -- nunca deberian divergir.
function bestPicksByRole(enemyList, banned){
  const antiDiveNow = antiDiveCount(enemyList);
  const shieldHeavyNow = shieldHeavyCount(enemyList);
  const enemyDiveNow = enemyDiveCount(enemyList);
  const enemyPokeNow = enemyPokeCount(enemyList);
  const enemyVanguardNow = enemyVanguardCount(enemyList);
  const result = {};
  ["Vanguard","Duelist","Strategist"].forEach(role=>{
    const scores = {};
    enemyList.forEach(e=>{
      getCounters(e.n, []).forEach(c=>{
        const ch = byName[c.c];
        if(!ch || !heroHasRole(ch, role)) return;
        if(banned.has(c.c)) return;
        if(!scores[c.c]) scores[c.c] = {hits:0, relevance:c.relevance, dive:diveViability(ch, antiDiveNow), shield:shieldBreakBonus(ch, shieldHeavyNow), survival:diveSurvivorBonus(ch, enemyDiveNow, enemyVanguardNow)*pokeResistBonus(ch, enemyPokeNow), tank:antiTankBonus(ch, enemyVanguardNow), tankTypeBonus:meleeVsShieldTankBonus(ch, enemyList)+rangedVsBrawlTankBonus(ch, enemyList), refSum:0, archBonus:archCycleBonus(ch, enemyList)};
        scores[c.c].hits++;
        if(c.refScore) scores[c.c].refSum += c.refScore.score;
      });
    });
    // penaliza/excluye a quien el rival TAMBIEN le hace counter (o casi-counter) en la vuelta --
    // antes esto solo miraba "a cuantos rivales cuenta X" sin chequear "a cuantos rivales X les
    // pierde", asi que un duelista con 1 counter real pero varios counters/casi-counters reales EN
    // SU CONTRA podia seguir apareciendo si sus bonus de arquetipo pesaban lo suficiente. Version 1
    // de este fix (2026-08-17) solo miraba counters fuertes (categoria 1) -- Xavier: "me sigue
    // preocupando este equipo... tiene muchos counters y casi counters", asi que ahora tambien
    // cuenta los "casi-counter"/"con ventaja" (parejo con inclinacion real, ref-matchup-scores) a
    // mitad de peso -- un counter fuerte pesa el doble que un casi-counter, pero varios casi-counters
    // juntos siguen pudiendo descartar un pick.
    Object.keys(scores).forEach(n=>{
      let badAgainst = 0, nearBadAgainst = 0;
      enemyList.forEach(e=>{
        const code = getMatchupCode(n, e.n);
        if(code===1){ badAgainst++; return; }
        if(code!==2) return; // solo dentro de "parejo" puede haber casi-counter por score
        const ref = externalMatchupScore(n, e.n); // que tan bien le va a e.n CONTRA n -- positivo es malo para n
        if(ref && ref.score>=1) nearBadAgainst++;
      });
      scores[n].badAgainst = badAgainst;
      scores[n].nearBadAgainst = nearBadAgainst;
      scores[n].trouble = badAgainst + nearBadAgainst*0.5;
    });
    result[role] = Object.entries(scores)
      .filter(([,s])=> s.trouble<=s.hits) // mas problemas reales en contra que counters a favor = no sirve como sugerencia
      .sort((a,b)=> (b[1].hits*b[1].relevance*b[1].dive*b[1].shield*b[1].survival*b[1].tank + b[1].refSum*0.03 + b[1].archBonus + b[1].tankTypeBonus - b[1].trouble*2) - (a[1].hits*a[1].relevance*a[1].dive*a[1].shield*a[1].survival*a[1].tank + a[1].refSum*0.03 + a[1].archBonus + a[1].tankTypeBonus - a[1].trouble*2));
  });
  return result;
}

// simetrico a mostDangerousEnemyHtml (que nombra la amenaza real del rival): busca el heroe rival
// mas "explotable" -- el que tiene el counter de dive disponible mas fuerte, ej. Jeff o Mantis -- y
// sugiere ese dive puntual. Pedido de Xavier (2026-08-16): "si hay un jeff o una mantis, sugerir un
// dive, el dive mas fuerte por asi decirlo". No filtra por lo que el jugador ya tiene en su equipo
// (a diferencia de mostDangerousEnemyHtml) porque esto es una sugerencia de PICK, no un aviso sobre
// tu roster actual. Ocupa el lugar donde antes iba el "perfil de arquetipos" (lista de emojis) --
// mismo pedido, "recomendar otra cosa a nuestro beneficio" en vez de una lista de conteos.
// bug real corregido (2026-08-16, señalado por Xavier): esto llegaba a sugerir "divear" a un
// VANGUARDIA (le tocó Doctor Strange en un equipo de 5 tanques) porque el criterio viejo solo
// miraba cual par (rival, counter con tag dive) tenia mayor relevancia en la matriz, sin importar
// si el rival elegido era realmente fragil -- "divear a un tanque es muy dificil". Xavier: "el
// personaje mas debil del equipo de 5 tanques y un healer es el healer, sin el todos los tanques
// o escapan o son vencidos... contrarrestar a rocket con el mejor personaje posible". Dos cambios:
// 1) se excluyen los VANGUARDIA del pool de "rival debil" (un tanque nunca es el punto flaco de su
// propio equipo, por definicion), 2) el counter sugerido ya no se limita a heroes con tag "dive"
// -- se busca el mejor counter posible en general (misma matriz, ya viene ordenada por relevancia
// en getCounters), no necesariamente un diver.
// Xavier (2026-08-16): "aun asi habiendo counters en el equipo contrario... son los menos
// peores?" -- el counter sugerido puede a su vez estar countereado por OTRO rival del mismo
// equipo (ej. Hawkeye le gana a Loki, pero Magneto le gana a Hawkeye) y eso no se avisaba.
// Devuelve los nombres de rivales (fuera del objetivo original) que contrarrestan de verdad
// (categoria 1, no un desempate chico) al counter sugerido.
function counterRisks(counterName, enemyList, excludeName){
  return enemyList.filter(e=>e.n!==excludeName && getMatchupCode(counterName, e.n)===1).map(e=>e.n);
}
function weakestLinkHtml(enemyList, banned){
  let bestEnemy = null, bestCounter = null, bestScore = 0;
  enemyList.forEach(e=>{
    if(e.r==="Vanguard") return;
    getCounters(e.n, []).forEach(c=>{
      if(banned.has(c.c)) return;
      if(!byName[c.c]) return;
      if(c.relevance>bestScore){ bestScore=c.relevance; bestEnemy=e; bestCounter=c.c; }
    });
  });
  if(!bestEnemy || !bestCounter) return "";
  const risks = counterRisks(bestCounter, enemyList, bestEnemy.n);
  return dualHeroCardHtml("weak", "🎯", t("analysis.rivalComp.weakestLinkLabel"), bestEnemy.n, bestCounter, risks);
}
// tarjeta con 2 iconos grandes (retrato del heroe + el counter sugerido, con una flecha entre
// medio) para "Punto debil rival" y "Vigila a" -- reemplaza el texto viejo con nombres metidos en
// una oracion. "risks" (opcional) son rivales que a su vez le hacen counter al counter sugerido.
function dualHeroCardHtml(cls, emoji, label, primaryName, secondaryName, risks){
  const risk = (risks && risks.length)
    ? `<div class="h-caveat">${t("analysis.rivalComp.counterRisk", {names: risks.map(n=>heroLabel(n)).join(", ")})}</div>`
    : "";
  return `<div class="highlight-card ${cls}">
    <div class="dual-heroes">
      <div class="dh-item">${heroIconHtml(primaryName,40)}<span>${heroLabel(primaryName)}</span></div>
      <div class="dh-arrow">→</div>
      <div class="dh-item">${heroIconHtml(secondaryName,40)}<span>${heroLabel(secondaryName)}</span></div>
    </div>
    <div class="h-label">${emoji} ${label}</div>
    ${risk}
  </div>`;
}
// tarjeta con 1-2 iconos grandes lado a lado (sin flecha, son alternativas entre si, no un
// "objetivo -> counter") -- usada por "Anti-tanque".
function multiHeroCardHtml(cls, emoji, label, names, caveat){
  const heroes = names.map(n=>`<div class="dh-item">${heroIconHtml(n,40)}<span>${heroLabel(n)}</span></div>`).join("");
  return `<div class="highlight-card ${cls}">
    <div class="dual-heroes">${heroes}</div>
    <div class="h-label">${emoji} ${label}</div>
    ${caveat ? `<div class="h-caveat">${caveat}</div>` : ""}
  </div>`;
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

// cuenta cuantos duelistas/vanguardias "dive" tiene el EQUIPO RIVAL (a diferencia de
// antiDiveCount, que cuenta tus propias herramientas anti-dive) -- sirve para saber cuando
// priorizar sanadores que sobreviven bien a un dive directo.
function enemyDiveCount(enemyTeam){
  return enemyTeam.filter(h=>h && h.t && h.t.includes("dive")).length;
}
// cuenta cuantos duelistas "poke" (dano sostenido a distancia) tiene el rival -- sirve para
// saber cuando priorizar tanques de escudo que reducen ese dano.
function enemyPokeCount(enemyTeam){
  return enemyTeam.filter(h=>h && h.t && h.t.includes("poke")).length;
}

// sanadores con buena supervivencia personal contra un dive directo, segun el conocimiento de
// juego de Xavier (2026-08-16): Deadpool (Strategist) y Cloak & Dagger primero (mucha vida
// propia/curacion pasiva y fade+invulnerabilidad respectivamente), despues White Fox (puede
// noquear a quien le hace dive), Gambit (movilidad + corta cura), Jubilee (puede congelar),
// Loki ("a veces", tiene escape/clones pero es mas fragil), Rocket Raccoon y Ultron (pueden huir
// volando/rodando, pero son los mas debiles del grupo si los alcanzan). El resto de los
// sanadores (Luna Snow, Mantis, Invisible Woman, Adam Warlock) no entran en esta lista a
// proposito -- no significa que mueran siempre a un dive, es que no tienen una herramienta
// dedicada de supervivencia como estos. Documentado en data-sources-INTERNAL.txt.
const DIVE_SURVIVOR_TIER = {
  "Deadpool (Strategist)": 1.5, "Cloak & Dagger": 1.5,
  "White Fox": 1.35, "Gambit": 1.25, "Jubilee": 1.2,
  "Loki": 1.12, "Rocket Raccoon": 1.08, "Ultron": 1.08,
};
// enemyVanguard (2026-08-16): la misma lista de supervivencia aplica cuando el rival tiene 3+
// vanguardias -- pedido de Xavier: "se deben recomendar curadores que puedan escapar o curarse a
// si mismos de los tanques". Un tanque que te persigue cuerpo a cuerpo (Hulk, The Thing, Devil
// Dinosaur) le exige al sanador la misma herramienta de escape/autososten que un dive directo.
function diveSurvivorBonus(hero, enemyDive, enemyVanguard){
  if((enemyDive>=2 || enemyVanguard>=3) && DIVE_SURVIVOR_TIER[hero.n]) return DIVE_SURVIVOR_TIER[hero.n];
  return 1;
}

// cuenta cuantas vanguardias tiene el EQUIPO RIVAL -- sirve para priorizar anti-tanques (dano por
// % de vida maxima) y sanadores que se autosostienen contra presion sostenida de tanques.
function enemyVanguardCount(enemyTeam){
  return enemyTeam.filter(h=>h && h.r==="Vanguard").length;
}
// duelistas especializados en reventar tanques via dano por % de vida maxima + autocuracion --
// pedido de Xavier (2026-08-16): "cuando el equipo rival tenga 3 o mas tanques se debe recomendar
// usar Wolverine o Iron Fist, que son anti-tanques". Confirmado con busqueda de la comunidad
// (2026-08-16): Wolverine "hard counters heavy tank teams" (se autocura, aguanta pegado mas
// tiempo), Iron Fist "great against tanks" (mas dano cuanto mas baja la vida del objetivo).
// Punisher/Hela/Winter Soldier como alternativa de presion sostenida a distancia, un escalon mas
// abajo en el mismo consenso.
const ANTI_TANK_TIER = {
  "Wolverine": 1.5, "Iron Fist": 1.4,
  "Punisher": 1.15, "Hela": 1.15, "Winter Soldier": 1.15,
};
function antiTankBonus(hero, enemyVanguard){
  if(enemyVanguard>=3 && ANTI_TANK_TIER[hero.n]) return ANTI_TANK_TIER[hero.n];
  return 1;
}

// fila explicita para el caso 3+ vanguardias -- antes el bonus de ANTI_TANK_TIER solo influia el
// orden de "Mejores picks por rol", en silencio. Pedido de Xavier (2026-08-16): "deberia salir una
// fila que diga, usar a wolverine y iron fist... mostrando que si hay the thing evitar la pelea
// con este e ir por los otros tanques".
// ajuste (2026-08-16, con captura): la primera version elegia "el que mejor puntue" de
// ANTI_TANK_TIER contra la composicion puntual -- eso podia dejar afuera a Wolverine/Iron Fist si
// otro pick del tier (ej. Punisher) rendia mejor en la matriz 1v1 para ESE rival especifico.
// Xavier pidio los nombres puntuales, no "el que mejor puntue": ahora se nombran SIEMPRE los 2
// especialistas anti-tanque (dano por % de vida + autocuracion) si no estan baneados, y solo cae
// a las alternativas de presion a distancia (Punisher/Hela/Winter Soldier) si ambos lo estan.
// "Evitar a X" ahora exige que TODOS los heroes recomendados pierdan contra ese tanque puntual
// (interseccion, no union) para no marcar "evitar" con demasiada facilidad si solo uno de los dos
// tiene una mala matriz contra el.
function antiTankRowHtml(enemyList, banned){
  const vanguards = enemyList.filter(h=>h.r==="Vanguard");
  if(vanguards.length<3) return "";
  let picks = ["Wolverine","Iron Fist"].filter(n=>!banned.has(n) && byName[n]);
  if(!picks.length){
    picks = Object.keys(ANTI_TANK_TIER).filter(n=>!banned.has(n) && byName[n]).slice(0,1);
  }
  if(!picks.length) return "";
  const avoid = vanguards.filter(v=>picks.every(n=>getMatchupCode(n, v.n)===1)).map(v=>heroLabel(v.n));
  const caveat = avoid.length ? t("analysis.rivalComp.antiTankAvoidCaveat", {avoid: avoid.join(", ")}) : null;
  return multiHeroCardHtml("weak", "🐺", t("analysis.rivalComp.antiTankLabel"), picks, caveat);
}

// tanques de escudo, de mas a menos eficaces reduciendo dano de poke/proyectiles, segun el
// conocimiento de juego de Xavier (2026-08-16): Magneto (burbuja total, el mas eficaz), Doctor
// Strange (escudo direccional grande), Emma Frost (modo diamante), The Hood (el mas pobre del
// grupo -- su escudo deja pasar dano reducido o lo rebota, no lo bloquea del todo). Documentado
// en data-sources-INTERNAL.txt.
const SHIELD_TANK_TIER = {"Magneto": 1.5, "Doctor Strange": 1.35, "Emma Frost": 1.2, "The Hood": 1.08};
function pokeResistBonus(hero, enemyPoke){
  if(enemyPoke>=2 && SHIELD_TANK_TIER[hero.n]) return SHIELD_TANK_TIER[hero.n];
  return 1;
}

// principio general de Xavier (2026-08-16): "los tanques con escudo son debiles al mele, los
// tanques grandes son debiles a los proyectiles". A diferencia de ANTI_TANK_TIER/SHIELD_TANK_TIER
// (favoritos NOMBRADOS), esto es un bonus PAREJO por tag/arquetipo, para cualquier duelista
// cuerpo a cuerpo/dive contra cualquier tanque con arquetipo shield_tank, y cualquier duelista a
// distancia contra cualquier tanque con arquetipo brawl_tank. Se reviso la matriz real contra
// este principio (84 pares escudo-vs-mele, 77 pares tanque grande-vs-proyectil): la enorme
// mayoria esta "pareja" (nada corregido todavia, este bonus cubre eso) y los 20 pares que ya
// estaban EN CONTRA del principio general (el tanque le gana al duelista) se repasaron uno por
// uno con Xavier -- las excepciones tienen mecanica real que las justifica (Emma Frost/Groot
// tienen control que atrapa divers; Devil Dinosaur mata rapido con su propio combo cuerpo a
// cuerpo; Doctor Strange/Magneto tienen escape o contraataque cargado) y se confirmaron TAL CUAL
// estan, sin tocar -- esos pares siguen mandando por matriz real (categoria 1/4), este bonus
// generico no los pisa porque candidateScoreAgainst ya parte de goodAgainst/badAgainst reales.
// OJO: se SUMAN (como archCycleBonus), no se multiplican -- un multiplicador sobre "base" no hace
// nada para un matchup realmente parejo (goodAgainst=0, 0*cualquier-cosa=0), que es justo la
// poblacion que este bonus tiene que empujar. Probado en vivo antes de confirmar esto (Black Cat
// vs Deadpool Vanguard, matchup parejo real): con multiplicacion el bonus no cambiaba el score en
// absoluto; con suma, sí.
function meleeVsShieldTankBonus(hero, enemyList){
  if(!hero.t || !(hero.t.includes("melee")||hero.t.includes("dive"))) return 0;
  const shieldTanks = enemyList.filter(e=>e.arch && e.arch.includes("shield_tank")).length;
  return shieldTanks>0 ? 0.6 : 0;
}
function rangedVsBrawlTankBonus(hero, enemyList){
  if(!hero.t || !(hero.t.includes("poke")||hero.t.includes("sniper")||hero.t.includes("ranged")||hero.t.includes("long_range"))) return 0;
  const brawlTanks = enemyList.filter(e=>e.arch && e.arch.includes("brawl_tank")).length;
  return brawlTanks>0 ? 0.6 : 0;
}

// ciclo de counters entre arquetipos de Duelista (mismo patron piedra-papel-tijera que usan varias
// guias de la comunidad, ver hero-roster.js): Todoterreno > Cuerpo a cuerpo > Flanker > Poke >
// Todoterreno. Antes esto sumaba nada mas cuando el candidato le ganaba en el papel al arquetipo
// rival (nunca restaba cuando era al reves), y se pesaba a *0.5 -- un afinador chico de verdad, casi
// invisible al lado del +-2 por cada matchup 1v1 confirmado en la matriz. Xavier señalo que esto no
// reflejaba bien el peso real: un equipo rival con varios "poke" puede comerse a un "todoterreno"
// aunque la matriz 1v1 los de por parejos, como paso con el equipo Black Cat/Hela/Ciclope/Magik/
// Spider-Man/CnD que lo vencio con un solo healer. Ahora pesa igual en ambos sentidos (bonus si el
// candidato le gana al arquetipo rival, penalidad si el rival le gana al candidato) y a *1 -- cada
// pareja de arquetipos que se cruza vale tanto como un matchup 1v1 confirmado, no una fraccion chica
// de eso. Sigue sin reemplazar la matriz 1v1 real (esa manda cuando hay dato concreto), pero ahora
// es un factor de peso comparable dentro de la enorme bolsa de matchups "parejos" (categoria 2) que
// antes no diferenciaba nada mas alla del puntaje de referencia externa. Heroes sin "arch" cargado
// (ver nota en hero-roster.js) no afectan ni se ven afectados por este bonus.
const ARCH_BEATS = {sustain_dps:"brawl_dps", brawl_dps:"flank_dps", flank_dps:"poke_dps", poke_dps:"sustain_dps"};
const ARCH_BEATEN_BY = {brawl_dps:"sustain_dps", flank_dps:"brawl_dps", poke_dps:"flank_dps", sustain_dps:"poke_dps"};
function archCycleBonus(hero, enemyList){
  if(!hero.arch || !hero.arch.length) return 0;
  const enemyArchCounts = {};
  enemyList.forEach(e=>{
    if(!e || !e.arch) return;
    e.arch.forEach(a=>{ enemyArchCounts[a] = (enemyArchCounts[a]||0)+1; });
  });
  let bonus = 0;
  hero.arch.forEach(a=>{
    const beats = ARCH_BEATS[a];
    if(beats && enemyArchCounts[beats]) bonus += enemyArchCounts[beats];
    const beatenBy = ARCH_BEATEN_BY[a];
    if(beatenBy && enemyArchCounts[beatenBy]) bonus -= enemyArchCounts[beatenBy];
  });
  return bonus;
}
// suma el dano de ataque basico de vanguardias+duelistas contra la curacion principal de los
// estrategas de UN MISMO equipo (pedido explicito de Xavier, 2026-08-15) -- solo cuenta heroes
// con un DPS/HPS confiable (ver hero-basic-stats.js/heroBasicStats): si a un heroe no se le pudo
// calcular un numero limpio (combo, cadencia compuesta, curacion que escala con %vida), se excluye
// de la suma en vez de inventar un valor, y se avisa cuantos quedaron afuera para que no parezca
// que el equipo "no hace nada".
// bug real corregido (2026-08-16, señalado por Xavier con el ejemplo de Ultron): antes esta
// funcion sumaba SOLO curacion para un Strategist y SOLO dano para el resto, como si fueran
// mutuamente excluyentes -- pero varios sanadores tienen ataque basico que hace dano de verdad
// (Ultron: el rayo del clic izquierdo no cura nada, lo que cura son los drones de su E; mismo
// patron dual en Jeff/Jubilee, donde el clic izquierdo SI hace ambas cosas a la vez). Con el bug,
// 9 de los 13 estrategas tenian un dano de ataque basico limpio (Adam Warlock, Cloak & Dagger,
// Deadpool Strategist, Gambit, Jeff, Jubilee, Mantis, Rocket Raccoon) que nunca se sumaba al
// total del equipo. Ahora se revisan basicAttack y primaryHeal por separado para CADA heroe, sin
// importar el rol -- si tiene ambos (dano Y curacion), suma a los dos totales.
function teamDmgHealTotals(team){
  let dmg = 0, heal = 0, dmgCount = 0, healCount = 0, dmgMissing = 0, healMissing = 0;
  team.filter(Boolean).forEach(h=>{
    const bs = heroBasicStats(h.n);
    if(!bs) return;
    if(bs.basicAttack){
      if(typeof bs.basicAttack.dps==="number"){ dmg += bs.basicAttack.dps; dmgCount++; }
      else dmgMissing++;
    }
    if(heroHasRole(h,"Strategist") && bs.primaryHeal){
      if(typeof bs.primaryHeal.hps==="number"){ heal += bs.primaryHeal.hps; healCount++; }
      else healMissing++;
    }
  });
  return {dmg: Math.round(dmg*10)/10, heal: Math.round(heal*10)/10, dmgCount, healCount, dmgMissing, healMissing};
}
// referencia para detectar un rival "de mucho daño de rafaga": mediana real del DPS de ataque
// basico entre los 30/55 heroes con un numero confiable (ver hero-basic-stats.js) -- calculada
// una vez el 2026-08-15, no se recalcula sola si el dataset cambia (recalcular a mano si se
// vuelve a scrapear con datos distintos). Umbral de "rafaga": promedio por cabeza del rival 30%
// por encima de esta mediana, con al menos 2 heroes de dano confiables (para no disparar por un
// solo pick puntual).
const MEDIAN_BASIC_DPS = 90;
function enemyIsBurstHeavy(enemyTeam){
  const {dmg, dmgCount} = teamDmgHealTotals(enemyTeam);
  if(dmgCount<2) return false;
  return (dmg/dmgCount) > MEDIAN_BASIC_DPS*1.3;
}
// barrita delgada roja(dano)/verde(curacion) para un equipo -- ver teamDmgHealTotals arriba.
function dmgHealBarHtml(team){
  const {dmg, heal, dmgMissing, healMissing} = teamDmgHealTotals(team);
  const total = dmg+heal;
  const dmgPct = total>0 ? (dmg/total*100) : 50;
  const healPct = total>0 ? (heal/total*100) : 50;
  const missingNote = (dmgMissing+healMissing)>0
    ? `<div class="empty-hint" style="font-size:10.5px;margin-top:3px;">${t("analysis.dmgHealBar.missingNote",{n:dmgMissing+healMissing})}</div>`
    : "";
  return `<div class="dmgheal-bar-wrap">
    <div class="dmgheal-bar-outer"><div class="dmgheal-bar-dmg" style="width:${dmgPct}%;"></div><div class="dmgheal-bar-heal" style="width:${healPct}%;"></div></div>
    <div class="dmgheal-bar-labels"><span class="dmgheal-lbl-dmg">🗡️ ${dmg} ${t("analysis.dmgHealBar.dmgUnit")}</span><span class="dmgheal-lbl-heal">✚ ${heal} ${t("analysis.dmgHealBar.healUnit")}</span></div>
    ${missingNote}
  </div>`;
}

// dentro de un grupo de rivales (ej. los que tienen escudo, o los que tienen anti-dive), busca al
// que mas te cuenta a TI -- mide con la misma cuenta que ya usa computeWinProbability (cuantos de
// TUS picks actuales contrarresta, pesado por relevancia). Pedido de Xavier (2026-08-16): en vez
// de solo avisar "el rival tiene 2 escudos", nombrar a quien de ese grupo es la amenaza real.
// devuelve tambien CUAL de tus heroes ya elegidos lo contrarresta -- pedido de Xavier
// (2026-08-16): "vigila a seria mejor decir el enemigo mas fuerte es, lo contrarrestas con y sale
// el personaje", mismo formato "X -- usa Y" que ya tiene weakestLinkHtml.
function mostDangerousEnemyHtml(enemyGroup, allyNames, fullEnemyList){
  if(!allyNames.length) return "";
  let best = null, bestScore = 0, bestCounter = null;
  enemyGroup.forEach(e=>{
    const haveCounters = getCounters(e.n, allyNames).filter(c=>c.have);
    const score = haveCounters.reduce((s,c)=>s+c.relevance,0);
    if(score>bestScore){
      bestScore = score; best = e;
      bestCounter = haveCounters.slice().sort((a,b)=>b.relevance-a.relevance)[0];
    }
  });
  if(!best || !bestCounter) return "";
  const risks = fullEnemyList ? counterRisks(bestCounter.c, fullEnemyList, best.n) : [];
  const html = dualHeroCardHtml("threat", "⚠️", t("analysis.rivalComp.biggestThreatLabel"), best.n, bestCounter.c, risks);
  return html;
}

// veredicto CRUZADO (a diferencia de dmgHealBarHtml, que solo mira UN equipo): compara el dano
// promedio por cabeza del equipo RIVAL (mismo criterio que enemyIsBurstHeavy, ya que sumar el
// dano de los 6 rivales como si le pegaran todos a la vez a un mismo blanco seria un peor caso
// irreal) contra la curacion TOTAL de "myTeam" -- responde "si un solo atacante rival me enfoca,
// mi curacion total le hace frente o no". Pedido explicito de Xavier (2026-08-16), se agrega
// APARTE de dmgHealBarHtml (que sigue mostrando el dano/curacion del mismo equipo), no lo
// reemplaza -- las dos lecturas sirven para cosas distintas.
function healEfficiencyHtml(myTeam, enemyTeam){
  const enemy = teamDmgHealTotals(enemyTeam);
  const mine = teamDmgHealTotals(myTeam);
  if(enemy.dmgCount===0 || mine.healCount===0) return "";
  const enemyPerHead = Math.round(enemy.dmg/enemy.dmgCount*10)/10;
  const efficient = mine.heal >= enemyPerHead;
  const cls = efficient ? "healeff-good" : "healeff-bad";
  const verdict = efficient ? t("analysis.healEff.efficient") : t("analysis.healEff.inefficient");
  return `<div class="healeff-wrap ${cls}">
    <span class="healeff-verdict">${efficient?"✅":"⚠️"} ${verdict}</span>
    <span class="healeff-detail">${t("analysis.healEff.detail",{enemyDps:enemyPerHead, heal:mine.heal})}</span>
  </div>`;
}

// puntaje de un candidato "h" contra una lista de rivales: cuenta cuantos le gana/pierde en tu
// matriz (goodAgainst/badAgainst), pesa por relevancia real de pelea + los ajustes de dive/shield
// segun el equipo rival completo, SUMA el puntaje de referencia externa de cada rival puntual
// (externalMatchupScore, ver team-state.js) como afinador chico, y SUMA/RESTA el ciclo de
// arquetipos (archCycleBonus) a peso completo -- este ultimo ya no es un afinador chico, pesa igual
// que un matchup 1v1 real (ver comentario de archCycleBonus) porque es la unica señal que diferencia
// candidatos dentro de la enorme bolsa de matchups "parejos". La matriz 1v1 real sigue mandando
// cuando hay dato concreto (goodAgainst/badAgainst). Comparte formula con recommendMyPick y
// suggestGhostFills para que este afinado se aplique parejo en toda la app.
function candidateScoreAgainst(h, enemyList, antiDiveNow, shieldHeavyNow){
  let goodAgainst = 0, badAgainst = 0, nearBadAgainst = 0, refSum = 0;
  enemyList.forEach(e=>{
    const code = getMatchupCode(h.n, e.n);
    if(code===4) goodAgainst++;
    else if(code===1) badAgainst++;
    else if(code===2){
      // "casi-counter" real (parejo con inclinacion, no counter fuerte) -- mismo criterio que
      // bestPicksByRole. Pedido de Xavier (2026-08-17): "sigue recomendando a Iron Man [en el modo
      // fantasma]... tiene muchos counters y casi counters" -- esta funcion (usada por el relleno
      // fantasma y "Que deberias jugar tu") tenia el mismo bug que bestPicksByRole tenia antes de
      // corregirse, nunca se le aplico el fix porque es un camino de codigo separado.
      const near = (typeof externalMatchupScore==="function") ? externalMatchupScore(h.n, e.n) : null;
      if(near && near.score>=1) nearBadAgainst++;
    }
    const ref = (typeof externalMatchupScore==="function") ? externalMatchupScore(e.n, h.n) : null;
    if(ref) refSum += ref.score;
  });
  const trouble = badAgainst + nearBadAgainst*0.5;
  // bonus de supervivencia: sanadores que aguantan un dive directo (o 3+ tanques encima) cuando
  // corresponde, y tanques de escudo que aguantan poke cuando el rival tiene 2+ poke -- ver
  // diveSurvivorBonus/pokeResistBonus mas arriba. bonus de anti-tanque: duelistas que revientan
  // tanques cuando el rival tiene 3+ vanguardias -- ver antiTankBonus. Se calculan del enemyList
  // ya recibido, no hace falta pasar parametros nuevos a esta funcion compartida.
  const enemyVanguardNow = enemyVanguardCount(enemyList);
  const survivalBonus = diveSurvivorBonus(h, enemyDiveCount(enemyList), enemyVanguardNow) * pokeResistBonus(h, enemyPokeCount(enemyList));
  const tankTypeBonus = meleeVsShieldTankBonus(h,enemyList) + rangedVsBrawlTankBonus(h,enemyList);
  const base = goodAgainst*2*counterRelevance(h.n)*diveViability(h,antiDiveNow)*shieldBreakBonus(h,shieldHeavyNow)*survivalBonus*antiTankBonus(h,enemyVanguardNow) - trouble*2;
  return {score: base + refSum*0.03 + archCycleBonus(h,enemyList) + tankTypeBonus, goodAgainst, badAgainst, nearBadAgainst, trouble};
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
    let good=0, bad=0;
    let cellsHtml = "";
    enemyList.forEach(e=>{
      const code = getMatchupCode(a.n, e.n);
      const cls = code ? TIER_CLASS[code] : "tier-none";
      const sym = code ? TIER_SYMBOL[code] : "–";
      const label = code
        ? t("analysis.matchupTitle", {a: heroLabel(a.n), b: heroLabel(e.n), label: tierLabel(code)})
        : t("analysis.matchupTitleNoData", {a: heroLabel(a.n), b: heroLabel(e.n)});
      cellsHtml += `<td class="${cls}" title="${label}">${sym}</td>`;
      if(code===4) good++;
      else if(code===1) bad++;
    });
    goodTotal += good; badTotal += bad;
    if(good>bestAllyGood){ bestAllyGood=good; bestAlly=a; }
    if(bad>worstAllyBad){ worstAllyBad=bad; worstAlly=a; }
    // resumen rapido por fila (cuantos rivales le gana facil / cuantos lo contrarrestan a este
    // aliado) -- mismo lenguaje visual (🛡️/⚔️) que la leyenda de arriba, para no aprender iconos nuevos
    const tallyTitle = t("analysis.matchupRowTally", {good, bad, hero: heroLabel(a.n)});
    html += `<tr><th>${heroLabel(a.n)}<span class="matchup-row-tally" title="${tallyTitle.replace(/"/g,'&quot;')}">🛡️${good} · ⚔️${bad}</span></th>${cellsHtml}</tr>`;
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
  // goodAgainst/score via candidateScoreAgainst: pesa por counterRelevance (un sanador que "le gana
  // facil" a alguien en la matriz casi siempre es por utilidad/anti-heal, no por pelea directa),
  // por diveViability, por shieldBreakBonus, y afina con el puntaje de referencia externa si hay dato
  const scored = candidates.map(h=>{
    const {score, goodAgainst, badAgainst, trouble} = candidateScoreAgainst(h, enemyList, antiDiveNow, shieldHeavyNow);
    return {h, goodAgainst, badAgainst, trouble, score};
  }).filter(p=> p.trouble<=p.goodAgainst) // mas counters/casi-counters en contra que a favor -- no se recomienda
    .sort((a,b)=>b.score-a.score);
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
        const {score, goodAgainst, trouble} = candidateScoreAgainst(h, enemyList, antiDiveNow, shieldHeavyNow);
        return {h, score, goodAgainst, trouble};
      })
      .filter(p=> p.trouble<=p.goodAgainst) // mas counters/casi-counters en contra que a favor -- no se sugiere en el modo fantasma
      .sort((a,b)=>b.score-a.score);
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

  // mismo criterio que healEfficiencyHtml (dano promedio por cabeza del rival vs tu curacion
  // total) pero como modificador numerico -- pedido de Xavier (2026-08-16): la probabilidad de
  // victoria tambien deberia reflejar si tu curacion aguanta o no la presion del rival, no solo
  // matchups y balance de roles. Solo dispara con datos suficientes de ambos lados (mismo umbral
  // que enemyIsBurstHeavy) para no meter ruido con equipos incompletos o sin sanadores con HPS
  // confiable.
  const dmgHealMy = teamDmgHealTotals(allyList);
  const dmgHealEnemy = teamDmgHealTotals(enemyList);
  if(dmgHealEnemy.dmgCount>=2 && dmgHealMy.healCount>=1){
    const enemyPerHead = dmgHealEnemy.dmg/dmgHealEnemy.dmgCount;
    if(dmgHealMy.heal >= enemyPerHead){
      score += 6;
      reasons.push(t("analysis.winProb.healEfficient"));
    } else if(dmgHealMy.heal < enemyPerHead*0.6){
      score -= 10;
      reasons.push(t("analysis.winProb.healInefficient"));
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

  // barritas de dano/curacion ancladas debajo de cada panel de 6 casilleros (Tu Equipo / Equipo
  // Enemigo), NO adentro de las columnas de analisis -- esas dos columnas tienen contenido de
  // largo muy distinto (Probabilidad de victoria a la izquierda no tiene equivalente a la
  // derecha), asi que la barrita quedaba a alturas distintas segun el lado. Los paneles de
  // casilleros en cambio SIEMPRE miden lo mismo de los dos lados, asi que ancladas ahi quedan
  // garantizadas al mismo nivel (pedido de Xavier, 2026-08-16).
  const allyBarEl = document.getElementById("allyDmgHealBar");
  const enemyBarEl = document.getElementById("enemyDmgHealBar");
  if(allyBarEl) allyBarEl.innerHTML = allyFilled>0 ? dmgHealBarHtml(allyTeam) : "";
  if(enemyBarEl) enemyBarEl.innerHTML = enemyFilled>0 ? dmgHealBarHtml(enemyTeam) : "";

  // veredicto cruzado de eficiencia (dano del rival vs tu curacion, y viceversa) -- ver
  // healEfficiencyHtml arriba. Solo tiene sentido con los dos equipos cargados.
  const allyEffEl = document.getElementById("allyHealEff");
  const enemyEffEl = document.getElementById("enemyHealEff");
  const bothFilled = allyFilled>0 && enemyFilled>0;
  if(allyEffEl) allyEffEl.innerHTML = bothFilled ? healEfficiencyHtml(allyTeam, enemyTeam) : "";
  if(enemyEffEl) enemyEffEl.innerHTML = bothFilled ? healEfficiencyHtml(enemyTeam, allyTeam) : "";

  // la matriz de matchups completa (tus 6 vs los 6 rivales) se sacó -- pedido de Xavier,
  // 2026-08-16: "nadie va a bajar tanto y ponerse a entender en media partida". renderMatchupGrid
  // sigue definida arriba por si se reutiliza en otro lado (ej. el editor), solo se dejó de
  // llamar desde acá.

  // comp analysis (lado del rival)
  right += `<div class="analysis-section"><div class="sec-title">${t("analysis.rivalComp.title")}</div>`;
  if(enemyFilled===0){
    right += `<p class="empty-hint">${t("analysis.rivalComp.addSix")}</p>`;
  } else {
    const counts = roleCounts(enemyTeam);
    const enemyFilledArr = enemyTeam.filter(Boolean);
    const arche = compArchetype(counts, enemyFilled);
    right += `<div class="comp-banner">${t("analysis.rivalComp.detected", {counts: roleCountsIconsHtml(counts), n: enemyFilled})}`;
    if(arche){
      right += `<br><b>${arche.label}.</b> ${arche.advice}`;
    } else {
      right += `<br>${t("analysis.rivalComp.addRestForFull")}`;
    }
    right += `</div>`;
    // pick sugerido SIEMPRE aparte de la descripcion del arquetipo (ver compArchetype) -- pedido de
    // Xavier (2026-08-16): "no comprendi que hace el personaje ahi, que tiene que ver la
    // composicion equilibrada con el personaje". Ahora es su propio callout con icono, para
    // cualquier arquetipo, no solo el caso "equilibrada".
    // galeria unica de tarjetas con icono grande (pedido de Xavier, 2026-08-17: "quiero observar
    // mas a los personajes en iconos grandes" en vez de nombrarlos metidos en una oracion de
    // texto). Se junta todo en un solo array y se renderiza como una sola fila -- antes cada aviso
    // era su propio comp-banner apilado, uno debajo del otro.
    const highlights = [];
    if(enemyFilled===6){
      const topPick = topCounterPick(enemyFilledArr, bannedPool());
      if(topPick){
        highlights.push(`<div class="highlight-card good">${heroIconHtml(topPick.n,52)}
          <div class="h-label">🏆 ${t("analysis.rivalComp.topPickLabel")}</div>
          <div class="h-name">${heroLabel(topPick.n)}</div>
          <div class="h-sub">${t('role.'+topPick.r)}</div>
        </div>`);
      }
    }
    // avisos de anti-dive/escudo: antes eran un parrafo generico ("2 herramientas anti-dive, tu
    // dive no va a rematar el combo...") -- pedido de Xavier (2026-08-16): "no es una advertencia
    // porque es obvio, debemos señalar personaje o personajes". Ahora, si hay 2+ del grupo Y se
    // puede nombrar una amenaza concreta contra TU equipo actual (mostDangerousEnemyHtml), se
    // muestra SOLO esa tarjeta -- nada si no hay un heroe concreto que nombrar (ej. todavia no
    // marcaste tu equipo).
    // bug real corregido (2026-08-16, captura de Xavier: "Vigilá a: Doctor Strange" salía DOS
    // veces seguidas) -- un heroe puede tener tag "shield" Y "anti_dive" a la vez (Doctor Strange
    // es el caso: shield_tank con anti_dive en hero-roster.js), asi que si es la amenaza mas
    // grande de AMBOS grupos, el texto identico se repetia. shownThreats deduplica por el HTML ya
    // armado (mismo heroe = mismo string exacto).
    const allyNamesForThreat = allyTeam.filter(Boolean).map(h=>h.n);
    const shownThreats = new Set();
    const antiDiveGroup = enemyTeam.filter(h=>h && h.t && (h.t.includes("anti_dive")||h.t.includes("peel")));
    if(antiDiveGroup.length>=2){
      const threat = mostDangerousEnemyHtml(antiDiveGroup, allyNamesForThreat, enemyFilledArr);
      if(threat && !shownThreats.has(threat)){
        shownThreats.add(threat);
        highlights.push(threat);
      }
    }
    const shieldGroup = enemyTeam.filter(h=>h && h.t && h.t.includes("shield"));
    if(shieldGroup.length>=2){
      const threat = mostDangerousEnemyHtml(shieldGroup, allyNamesForThreat, enemyFilledArr);
      if(threat && !shownThreats.has(threat)){
        shownThreats.add(threat);
        highlights.push(threat);
      }
    }
    // simetrico al de arriba pero en positivo: el rival mas explotable con dive (ver
    // weakestLinkHtml) -- ocupa el lugar donde antes iba el "perfil de arquetipos" (lista de
    // emojis con conteos).
    const weakLink = weakestLinkHtml(enemyFilledArr, bannedPool());
    if(weakLink) highlights.push(weakLink);
    // fila explicita contra 3+ tanques (ver antiTankRowHtml) -- antes esto solo influia el orden
    // de "Mejores picks por rol" en silencio, sin decirlo. Pedido de Xavier (2026-08-16).
    const antiTankRow = antiTankRowHtml(enemyFilledArr, bannedPool());
    if(antiTankRow) highlights.push(antiTankRow);
    if(highlights.length) right += `<div class="highlight-row">${highlights.join("")}</div>`;
    // el aviso de "sin sanador principal" se sacó por completo -- pedido de Xavier (2026-08-16):
    // "eso no nos sirve como ventaja". El pick de estratega recomendado ya sale, con mas contexto,
    // en "Mejores picks por rol" (columna Estratega) mas abajo -- no hacia falta un banner aparte.
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
    // 4 en vez de 3 -- con retrato en vez de tarjeta de texto, 3 quedaba como una "L" (2 arriba +
    // 1 abajo suelto); 4 completa un cuadrado 2x2 parejo dentro de la columna angosta
    const byRole = bestPicksByRole(enemyListForRoles, banned);
    left += `<div class="role-rec-grid">`;
    ["Vanguard","Duelist","Strategist"].forEach(role=>{
      const ranked = byRole[role].slice(0,4);
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
          const thumb = heroIconHtml(n,48);
          const archTags = archTagsHtml(byName[n]);
          left += `<div class="pick-slot-lg role-${role}${already?' already':''}" title="${reason.replace(/"/g,'&quot;')}">
            ${thumb}<div class="pick-slot-lg-info"><div class="name">${heroLabel(n)}</div><div class="role">${roleIconHtml(role,12)}${s.hits}/${enemyListForRoles.length}</div>
            ${archTags?`<div class="arch-tags">${archTags}</div>`:''}
            ${already?`<div class="already-tag">${t("analysis.bestPicks.alreadyInTeam")}</div>`:''}
            ${diveWarn?`<div class="dive-warn">${t("analysis.bestPicks.diveFrozen")}</div>`:''}
            </div>
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
    // maximo UNA linea de texto aparte de los chips -- pedido de Xavier (2026-08-16): esta caja
    // llegaba a apilar hasta 3 lineas (aviso de vanguard + aviso de strategist + jugadores
    // faltantes), "muy grande... falta priorizar". Prioridad: primero jugadores faltantes (lo mas
    // accionable), despues el desbalance de rol mas grave si ya estas 6/6 -- nunca las dos a la vez.
    // El caso "2-2-2 perfecto" ya no dice nada aparte: los chips ya lo muestran de un vistazo.
    const myCounts = roleCounts(allyTeam);
    left += `<div class="comp-banner">${t("analysis.yourComp.summary", {counts: roleCountsIconsHtml(myCounts), n: allyFilled})}`;
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
    } else if(myCounts.Vanguard<=1){
      left += `<br>${myCounts.Vanguard===0 ? t("analysis.yourComp.vanguardWarnZero") : t("analysis.yourComp.vanguardWarnOne")}`;
    } else if(myCounts.Vanguard>=4){
      left += `<br>${t("analysis.yourComp.tooManyVanguard")}`;
    } else if(myCounts.Strategist<=1){
      left += `<br>${myCounts.Strategist===0 ? t("analysis.yourComp.strategistWarnZero") : t("analysis.yourComp.strategistWarnOne")}`;
    } else if(myCounts.Strategist>=3){
      left += `<br>${t("analysis.yourComp.tooManyStrategist")}`;
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
    left += `<div class="comp-banner">${t("analysis.whatToPlay.summary", {counts: roleCountsIconsHtml(rec.fixedCounts, 22, rec.roleNeed), role: roleIconHtml(rec.roleNeed,16)+t('role.'+rec.roleNeed)})}</div>`;
  }
  left += `</div>`;
  left += `</div>`;

  // fila aparte (ancho completo del bloque, no anidada) con las listas de picks en 2 columnas reales
  // -- siempre 2 columnas, nunca 1 sola, para que la fila no se vea rota/asimetrica ni de la impresion
  // de que "desaparecio" una columna
  if(rec){
    // retrato tipo casillero (mismo lenguaje visual que "Mejores picks contra esta composicion" y
    // que "Tu equipo") en vez de la tarjeta horizontal de texto que tenia antes -- pedido de
    // Xavier (2026-08-16, eligio la opcion 1 de 3 mockups): el "por que" (good/bad matchups) pasa
    // al tooltip (title), no ocupa renglon aparte.
    const renderPickCard = p=>{
      const badSuffix = p.badAgainst>0 ? t("analysis.pickCard.badSuffix", {bad:p.badAgainst}) : "";
      const reason = t("analysis.pickCard.reason", {good:p.goodAgainst, total:enemyFilled, badSuffix});
      return `<div class="pick-slot role-${p.h.r}" title="${reason.replace(/"/g,'&quot;')}">
        ${heroIconHtml(p.h.n,40)}<div class="name">${heroLabel(p.h.n)}</div><div class="role">${roleIconHtml(p.h.r,12)}${p.goodAgainst}/${enemyFilled}</div>
      </div>`;
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
      left += `<div class="pick-slot-row">${rec.inRolePicks.map(renderPickCard).join("")}</div>`;
    }
    left += `</div>`;
    left += `<div class="role-rec-col"><div class="role-rec-title">${roleIconHtml(rec.currentRole||rec.roleNeed,16)}${col2Title}</div>
      <p class="empty-hint" style="font-size:11px;margin:-4px 0 2px;">${col2Sub}</p>`;
    if(rec.topOverallPicks.length===0){
      left += `<p class="empty-hint" style="font-size:12px;">${t("analysis.pickCard.noData")}</p>`;
    } else {
      left += `<div class="pick-slot-row">${rec.topOverallPicks.map(renderPickCard).join("")}</div>`;
    }
    left += `</div>`;
    left += `</div>`;
  }

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
    // si el rival promedia mucho dano de rafaga por cabeza (ver enemyIsBurstHeavy), el desempate
    // final entre sanadores igual de "seguros" pasa a preferir mas curacion/seg conocida en vez
    // del orden arbitrario de antes -- pedido explicito de Xavier (2026-08-15), ver
    // data-sources-INTERNAL.txt seccion 7 para el porque del umbral (mediana real del roster).
    const burstHeavy = enemyIsBurstHeavy(enemyTeam);
    // si el rival tiene 2+ divers, el desempate tambien prioriza sanadores con buena
    // supervivencia personal contra un dive directo (ver DIVE_SURVIVOR_TIER) -- pedido de
    // Xavier, 2026-08-16, mismo patron que el desempate por rafaga de arriba.
    const diveHeavy = enemyDiveCount(enemyTeam.filter(Boolean))>=2;
    const hpsOf = hn => { const bs = heroBasicStats(hn); return (bs && bs.primaryHeal && typeof bs.primaryHeal.hps==="number") ? bs.primaryHeal.hps : -1; };
    const pool = Array.from(new Set([...Object.keys(recs), ...allStrategists])).map(hn=>({
      hn, risk: riskOf(hn), reasons: recs[hn] ? [...recs[hn].reasons] : [], hps: hpsOf(hn),
      survivalTier: DIVE_SURVIVOR_TIER[hn] || 0
    }));
    pool.sort((a,b)=>{
      const aRisky = a.risk>=0.4, bRisky = b.risk>=0.4;
      if(aRisky!==bRisky) return aRisky?1:-1; // los que no estan en riesgo van primero
      if((a.reasons.length>0)!==(b.reasons.length>0)) return a.reasons.length>0?-1:1; // con sinergia real primero
      if(diveHeavy && b.survivalTier!==a.survivalTier) return b.survivalTier-a.survivalTier; // rival de dive: sanadores resistentes primero
      if(burstHeavy && b.hps!==a.hps) return b.hps-a.hps; // rival de rafaga: mas curacion/seg conocida primero
      return a.risk-b.risk; // entre iguales, el menos riesgoso
    });
    const nonRiskyCount = pool.filter(p=>p.risk<0.4).length;
    const keys = pool.slice(0, Math.max(MIN_HEALER_RECS, nonRiskyCount));
    if(burstHeavy){
      left += `<div class="comp-banner" style="margin-bottom:8px;border-color:var(--gold);">${t("analysis.healerSupport.burstWarn")}</div>`;
    }
    if(keys.length===0){
      left += `<p class="empty-hint">${t("analysis.healerSupport.noSpecific")}</p>`;
    } else {
      left += `<div class="healer-grid">`;
      keys.forEach(({hn, risk, reasons, hps})=>{
        const already = allyNames.includes(hn);
        const risky = risk>=0.4;
        const reasonText = reasons.length ? reasons.join("<br>") : t("analysis.healerSupport.noSynergyReason");
        const riskWarn = risky ? `<br>${t("analysis.healerSupport.riskWarn")}` : "";
        const hpsTag = hps>=0 ? ` <span class="empty-hint">(≈${hps} ${t("editor.hpsUnit")})</span>` : "";
        left += `<div class="healer-card role-Strategist${risky?' risky':''}"><div class="h-name">${heroIconHtml(hn,28)}${heroLabel(hn)}${hpsTag}${already?` <span class="already-tag">${t("analysis.healerSupport.alreadyInTeam")}</span>`:''}</div>
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
    const enemyListForDefinitive = enemyTeam.filter(Boolean);
    const antiDiveNow = antiDiveCount(enemyListForDefinitive);
    const shieldHeavyNow = shieldHeavyCount(enemyListForDefinitive);
    const enemyDiveNow = enemyDiveCount(enemyListForDefinitive);
    const enemyPokeNow = enemyPokeCount(enemyListForDefinitive);
    const enemyVanguardNow = enemyVanguardCount(enemyListForDefinitive);
    const pillHtml = (c, isDefinitive)=>{
      const cls = `pill ${c.have?'have':''} ${c.banned?'hidden-pill':''} ${isDefinitive?'top-pill':''}`;
      // el logo de clase (Vanguard/Duelist/Strategist) es lo unico que distingue, a simple vista,
      // entre los 3 Deadpool (mismo retrato, mismo nombre en pantalla) -- sin esto dos sugerencias
      // de "Deadpool" se ven identicas aunque sean roles totalmente distintos.
      const role = byName[c.c] && byName[c.c].r;
      const definitiveTag = isDefinitive ? `<span class="definitive-tag">🏆 ${t("analysis.countersPerHero.definitiveLabel")}</span> · ` : "";
      return `<span class="${cls}">${heroIconHtml(c.c,20)}${role?roleIconHtml(role,13):''}${definitiveTag}${c.banned?t("analysis.countersPerHero.banned"):''}${c.have?`<span class="check">${t("analysis.countersPerHero.alreadyInTeam")}</span> · `:''}<b>${heroLabel(c.c)}</b></span>`;
    };
    const MAX_PRIMARY_COUNTERS = 6;
    enemyTeam.forEach(h=>{
      if(!h) return;
      // ya viene ordenado por counterRelevance: pelea directa primero, soporte que rara vez
      // duelea al final -- se muestran los mas utiles y el resto queda plegado para no saturar
      const counters = getCounters(h.n, allyNames);
      // "counter definitivo": dentro de los counters de ESTE rival puntual, el que mejor puntua
      // con la MISMA formula contextual que "Mejores picks por rol" (relevancia * viabilidad de
      // dive * bonus de shield-break contra el equipo rival completo) -- no solo la matriz 1v1
      // pelada. Se ignoran los baneados: recomendar algo que no se puede elegir no sirve.
      let definitiveName = null, bestScore = -Infinity;
      counters.forEach(c=>{
        if(c.banned) return;
        const ch = byName[c.c];
        if(!ch) return;
        // el puntaje de referencia externa (c.refScore, ya viene calculado desde
        // countersFromMatrixFor en matchups.js) se suma como afinador chico -- pesa poco a
        // proposito para no tapar la matriz propia ni el ajuste de dive/shield, solo desempata
        // entre candidatos parejos.
        const refBonus = c.refScore ? c.refScore.score*0.03 : 0;
        const score = c.relevance * diveViability(ch, antiDiveNow) * shieldBreakBonus(ch, shieldHeavyNow) * diveSurvivorBonus(ch, enemyDiveNow, enemyVanguardNow) * pokeResistBonus(ch, enemyPokeNow) * antiTankBonus(ch, enemyVanguardNow) + refBonus + meleeVsShieldTankBonus(ch, enemyListForDefinitive) + rangedVsBrawlTankBonus(ch, enemyListForDefinitive);
        if(score>bestScore){ bestScore = score; definitiveName = c.c; }
      });
      let ordered = counters;
      if(definitiveName){
        const idx = counters.findIndex(c=>c.c===definitiveName);
        if(idx>0) ordered = [counters[idx], ...counters.slice(0,idx), ...counters.slice(idx+1)];
      }
      const shown = ordered.slice(0, MAX_PRIMARY_COUNTERS);
      const rest = ordered.slice(MAX_PRIMARY_COUNTERS);
      right += `<div class="counter-card">
        <span class="enemy-name">${heroIconHtml(h.n,26)}${heroLabel(h.n)}</span>${roleIconHtml(h.r,15)}
        <div class="counter-list">`;
      if(counters.length===0){
        right += `<span class="pill">${t("analysis.countersPerHero.noneCataloged")}</span>`;
      } else {
        shown.forEach(c=>{ right += pillHtml(c, c.c===definitiveName); });
      }
      right += `</div>`;
      if(rest.length>0){
        right += `<details class="counters-more"><summary>${tp("analysis.countersPerHero.more", rest.length, {n: rest.length})}</summary>
          <div class="counter-list" style="margin-top:8px;">${rest.map(c=>pillHtml(c, c.c===definitiveName)).join("")}</div></details>`;
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
