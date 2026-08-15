/* ---------------- HERO DATA ---------------- */
// "t" son tags FUNCIONALES -- analysis.js los usa para calcular bonos reales (diveViability,
// shieldBreakBonus, etc.), no tocar sin revisar esos calculos.
// "arch" es solo VISUAL (arquetipo de juego tipo Overwatch: dive tank/shield tank/brawler/poke/
// flanker/sustainer/lifeline/playmaker/guardian) -- no afecta ningun calculo, solo se muestra
// como etiqueta chica en "Mejores picks por rol" para comparar arquetipos entre candidatos.
// Investigado 2026-08-01 (exitlag.com, marvelrivalshub.gg), completado 2026-08-02 con
// clasificaciones manuales de Xavier para heroes que esas fuentes no cubrian (Angela, Black Cat,
// Cyclops, Daredevil, Deadpool, Devil Dinosaur, Elsa Bloodstone, Emma Frost, Gambit, Hawkeye,
// Jubilee, Punisher, Rogue, Spider-Man, Squirrel Girl, Thor, White Fox) -- deliberadamente
// incompleto: los heroes que siguen sin "arch" quedaron sin clasificar en vez de inventar una.
// The Hood agregado 2026-08-14 (salio 2026-08-07, temporada 9.5) -- Vanguard atipico: pelea a
// distancia con pistolas (mas parecido a Magneto/Doctor Strange que a un tanque de choque),
// escudo para aliados via su Cloak, y Void Walk le da movilidad para meterse a la retaguardia
// enemiga -- de ahi el doble arquetipo shield_tank + dive_tank. Detalle completo en
// data-sources-INTERNAL.txt.
const HEROES = [
  // Vanguards
  {n:"Angela",r:"Vanguard",t:["dive","aerial","mobility"],arch:["dive_tank"]},
  {n:"Captain America",r:"Vanguard",t:["brawl","anti_dive","peel"],arch:["dive_tank"]},
  {n:"Deadpool (Vanguard)",r:"Vanguard",dpGroup:true,t:["shield","brawl","melee"],arch:["shield_tank"]},
  {n:"Devil Dinosaur",r:"Vanguard",t:["brawl","melee","anti_dive"],arch:["shield_tank","brawl_tank"]},
  {n:"Doctor Strange",r:"Vanguard",t:["shield","melee_caster","anti_dive"],arch:["shield_tank"]},
  {n:"Emma Frost",r:"Vanguard",t:["shield","brawl","cc"],arch:["shield_tank","brawl_tank"]},
  {n:"Groot",r:"Vanguard",t:["shield","zone","wall"],arch:["shield_tank"]},
  {n:"Hulk",r:"Vanguard",t:["brawl","melee","cc"],arch:["brawl_tank"]},
  {n:"Magneto",r:"Vanguard",t:["shield","zone","poke_resist"],arch:["shield_tank"]},
  {n:"Peni Parker",r:"Vanguard",t:["zone","turret","area_denial"],arch:["brawl_tank","bunker_tank"]},
  {n:"Rogue",r:"Vanguard",t:["dive","aerial","mobility"],arch:["brawl_tank"]},
  {n:"The Hood",r:"Vanguard",t:["shield","dive","mobility"],arch:["shield_tank","dive_tank"]},
  {n:"The Thing",r:"Vanguard",t:["brawl","melee","anti_dive"],arch:["brawl_tank"]},
  {n:"Thor",r:"Vanguard",t:["brawl","melee","dive_lite"],arch:["brawl_tank"]},
  {n:"Venom",r:"Vanguard",t:["dive","mobility","brawl"],arch:["dive_tank"]},
  // Duelists
  {n:"Black Cat",r:"Duelist",t:["dive","melee","mobility"],arch:["flank_dps","brawl_dps"]},
  {n:"Black Panther",r:"Duelist",t:["dive","mobility","melee"],arch:["flank_dps","brawl_dps"]},
  {n:"Black Widow",r:"Duelist",t:["sniper","long_range","poke"],arch:["poke_dps"]},
  {n:"Blade",r:"Duelist",t:["dive","melee","anti_heal"],arch:["brawl_dps","sustain_dps"]},
  {n:"Cyclops",r:"Duelist",t:["ranged","burst","poke"],arch:["poke_dps","sustain_dps"]},
  {n:"Daredevil",r:"Duelist",t:["dive","melee","mobility"],arch:["brawl_dps","flank_dps"]},
  {n:"Deadpool (Duelist)",r:"Duelist",dpGroup:true,t:["melee","mobility","sustain"],arch:["sustain_dps"]},
  {n:"Elsa Bloodstone",r:"Duelist",t:["ranged","sustained","poke"],arch:["sustain_dps","brawl_dps"]},
  {n:"Hawkeye",r:"Duelist",t:["sniper","long_range","poke"],arch:["poke_dps"]},
  {n:"Hela",r:"Duelist",t:["ranged","burst","anti_heal","shield_breaker"],arch:["poke_dps","sustain_dps"]},
  {n:"Human Torch",r:"Duelist",t:["aerial","mobility","burst"],arch:["sustain_dps","flank_dps"]},
  {n:"Iron Fist",r:"Duelist",t:["dive","melee","mobility"],arch:["brawl_dps","flank_dps"]},
  {n:"Iron Man",r:"Duelist",t:["ranged","aerial","burst"],arch:["sustain_dps","poke_dps"]},
  {n:"Magik",r:"Duelist",t:["dive","melee","mobility"],arch:["brawl_dps","flank_dps"]},
  {n:"Mister Fantastic",r:"Duelist",t:["poke","mobility","area_denial","anti_dive"],arch:["brawl_dps"]},
  {n:"Moon Knight",r:"Duelist",t:["burst","true_damage","cc"],arch:["sustain_dps","poke_dps"]},
  {n:"Namor",r:"Duelist",t:["zone","shield_breaker","ranged","anti_dive"],arch:["poke_dps","brawl_dps"]},
  {n:"Phoenix",r:"Duelist",t:["ranged","aerial","mobility"],arch:["sustain_dps","poke_dps"]},
  {n:"Psylocke",r:"Duelist",t:["dive","mobility","stealth_counter"],arch:["flank_dps","sustain_dps"]},
  {n:"Punisher",r:"Duelist",t:["ranged","sustained","shield_breaker"],arch:["sustain_dps","poke_dps"]},
  {n:"Scarlet Witch",r:"Duelist",t:["burst","area_denial","cc"],arch:["brawl_dps","flank_dps"]},
  {n:"Spider-Man",r:"Duelist",t:["dive","mobility","melee"],arch:["flank_dps","brawl_dps"]},
  {n:"Squirrel Girl",r:"Duelist",t:["melee","annoy","mobility"],arch:["poke_dps"]},
  {n:"Star-Lord",r:"Duelist",t:["aerial","mobility","dive"],arch:["sustain_dps","flank_dps"]},
  {n:"Storm",r:"Duelist",t:["aerial","area_denial","poke"],arch:["brawl_dps","sustain_dps"]},
  {n:"Winter Soldier",r:"Duelist",t:["mobility","burst","hook","shield_breaker"],arch:["sustain_dps","brawl_dps"]},
  {n:"Wolverine",r:"Duelist",t:["dive","melee","sustain"],arch:["brawl_dps","flank_dps"]},
  // Strategists
  {n:"Adam Warlock",r:"Strategist",t:["revive","static","burst_heal"],arch:["guardian"]},
  {n:"Cloak & Dagger",r:"Strategist",t:["mobile","dash","dual","peel"],arch:["lifeline","playmaker"]},
  {n:"Deadpool (Strategist)",r:"Strategist",dpGroup:true,t:["sustain_heal","mobile","brawl"]},
  {n:"Gambit",r:"Strategist",t:["burst_heal","utility","area_denial"],arch:["playmaker","lifeline"]},
  {n:"Invisible Woman",r:"Strategist",t:["shield","static","aoe"],arch:["lifeline","guardian"]},
  {n:"Jeff the Land Shark",r:"Strategist",t:["mobile","poke_heal","escape"],arch:["playmaker","lifeline"]},
  {n:"Jubilee",r:"Strategist",t:["burst_heal","mobile","aoe"],arch:["guardian"]},
  {n:"Loki",r:"Strategist",t:["deception","ult_steal","clone"],arch:["playmaker","guardian"]},
  {n:"Luna Snow",r:"Strategist",t:["burst_heal","static","aoe"],arch:["lifeline"]},
  {n:"Mantis",r:"Strategist",t:["sustain_heal","cc","mobile"],arch:["guardian","lifeline"]},
  {n:"Rocket Raccoon",r:"Strategist",t:["static","turret","backline"],arch:["playmaker"]},
  {n:"Ultron",r:"Strategist",t:["turret","aerial","backline"],arch:["playmaker","guardian"]},
  {n:"White Fox",r:"Strategist",t:["brawl_heal","melee","mobile"],arch:["lifeline"]},
];
const byName = Object.fromEntries(HEROES.map(h=>[h.n,h]));

// true si el héroe cubre ese rol, incluyendo héroes Multi-Role (ej: Deadpool) que cubren varios
function heroHasRole(hero, role){
  if(!hero) return false;
  if(hero.r===role) return true;
  if(hero.roles && hero.roles.includes(role)) return true;
  return false;
}
// genera el/los roletag de un héroe (varios si es Multi-Role) -- el logo de la clase en vez de
// la palabra: se lee mas rapido y no depende del idioma. roleIconHtml vive en team-state.js, pero
// para cuando esto se llama (al renderizar) todos los scripts ya cargaron.
function roleTagsHtml(hero){
  if(hero.roles && hero.roles.length){
    return hero.roles.map(r=>`<span class="roletag ${r}">${roleIconHtml(r,14)}</span>`).join(" ");
  }
  return `<span class="roletag ${hero.r}">${roleIconHtml(hero.r,14)}</span>`;
}
// etiquetas chicas de arquetipo (dive tank/brawler/poke/lifeline/etc, ver nota arriba de HEROES)
// -- puramente visual, no afecta ningun calculo. Heroes sin "arch" cargado no muestran nada.
function archTagsHtml(hero){
  if(!hero || !hero.arch || !hero.arch.length) return "";
  return hero.arch.map(a=>`<span class="arch-tag">${t("arch."+a)}</span>`).join("");
}

