/* ---------------- HERO DATA ---------------- */
const HEROES = [
  // Vanguards
  {n:"Angela",r:"Vanguard",t:["dive","aerial","mobility"]},
  {n:"Captain America",r:"Vanguard",t:["brawl","anti_dive","peel"]},
  {n:"Deadpool (Vanguard)",r:"Vanguard",dpGroup:true,t:["shield","brawl","melee"]},
  {n:"Devil Dinosaur",r:"Vanguard",t:["brawl","melee","anti_dive"]},
  {n:"Doctor Strange",r:"Vanguard",t:["shield","melee_caster","anti_dive"]},
  {n:"Emma Frost",r:"Vanguard",t:["shield","brawl","cc"]},
  {n:"Groot",r:"Vanguard",t:["shield","zone","wall"]},
  {n:"Hulk",r:"Vanguard",t:["brawl","melee","cc"]},
  {n:"Magneto",r:"Vanguard",t:["shield","zone","poke_resist"]},
  {n:"Peni Parker",r:"Vanguard",t:["zone","turret","area_denial"]},
  {n:"Rogue",r:"Vanguard",t:["dive","aerial","mobility"]},
  {n:"The Thing",r:"Vanguard",t:["brawl","melee","anti_dive"]},
  {n:"Thor",r:"Vanguard",t:["brawl","melee","dive_lite"]},
  {n:"Venom",r:"Vanguard",t:["dive","mobility","brawl"]},
  // Duelists
  {n:"Black Cat",r:"Duelist",t:["dive","melee","mobility"]},
  {n:"Black Panther",r:"Duelist",t:["dive","mobility","melee"]},
  {n:"Black Widow",r:"Duelist",t:["sniper","long_range","poke"]},
  {n:"Blade",r:"Duelist",t:["dive","melee","anti_heal"]},
  {n:"Cyclops",r:"Duelist",t:["ranged","burst","poke"]},
  {n:"Daredevil",r:"Duelist",t:["dive","melee","mobility"]},
  {n:"Deadpool (Duelist)",r:"Duelist",dpGroup:true,t:["melee","mobility","sustain"]},
  {n:"Elsa Bloodstone",r:"Duelist",t:["ranged","sustained","poke"]},
  {n:"Hawkeye",r:"Duelist",t:["sniper","long_range","poke"]},
  {n:"Hela",r:"Duelist",t:["ranged","burst","anti_heal","shield_breaker"]},
  {n:"Human Torch",r:"Duelist",t:["aerial","mobility","burst"]},
  {n:"Iron Fist",r:"Duelist",t:["dive","melee","mobility"]},
  {n:"Iron Man",r:"Duelist",t:["ranged","aerial","burst"]},
  {n:"Magik",r:"Duelist",t:["dive","melee","mobility"]},
  {n:"Mister Fantastic",r:"Duelist",t:["poke","mobility","area_denial","anti_dive"]},
  {n:"Moon Knight",r:"Duelist",t:["burst","true_damage","cc"]},
  {n:"Namor",r:"Duelist",t:["zone","shield_breaker","ranged","anti_dive"]},
  {n:"Phoenix",r:"Duelist",t:["ranged","aerial","mobility"]},
  {n:"Psylocke",r:"Duelist",t:["dive","mobility","stealth_counter"]},
  {n:"Punisher",r:"Duelist",t:["ranged","sustained","shield_breaker"]},
  {n:"Scarlet Witch",r:"Duelist",t:["burst","area_denial","cc"]},
  {n:"Spider-Man",r:"Duelist",t:["dive","mobility","melee"]},
  {n:"Squirrel Girl",r:"Duelist",t:["melee","annoy","mobility"]},
  {n:"Star-Lord",r:"Duelist",t:["aerial","mobility","dive"]},
  {n:"Storm",r:"Duelist",t:["aerial","area_denial","poke"]},
  {n:"Winter Soldier",r:"Duelist",t:["mobility","burst","hook","shield_breaker"]},
  {n:"Wolverine",r:"Duelist",t:["dive","melee","sustain"]},
  // Strategists
  {n:"Adam Warlock",r:"Strategist",t:["revive","static","burst_heal"]},
  {n:"Cloak & Dagger",r:"Strategist",t:["mobile","dash","dual","peel"]},
  {n:"Deadpool (Strategist)",r:"Strategist",dpGroup:true,t:["sustain_heal","mobile","brawl"]},
  {n:"Gambit",r:"Strategist",t:["burst_heal","utility","area_denial"]},
  {n:"Invisible Woman",r:"Strategist",t:["shield","static","aoe"]},
  {n:"Jeff the Land Shark",r:"Strategist",t:["mobile","poke_heal","escape"]},
  {n:"Jubilee",r:"Strategist",t:["burst_heal","mobile","aoe"]},
  {n:"Loki",r:"Strategist",t:["deception","ult_steal","clone"]},
  {n:"Luna Snow",r:"Strategist",t:["burst_heal","static","aoe"]},
  {n:"Mantis",r:"Strategist",t:["sustain_heal","cc","mobile"]},
  {n:"Rocket Raccoon",r:"Strategist",t:["static","turret","backline"]},
  {n:"Ultron",r:"Strategist",t:["turret","aerial","backline"]},
  {n:"White Fox",r:"Strategist",t:["brawl_heal","melee","mobile"]},
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

