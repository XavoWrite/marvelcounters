/* ---------------- DETECCION AUTOMATICA DE HEROE POR ICONO (firma de color, 100% offline) ---------------- */
// mismo principio que la lectura de nombres con OCR: recorta el icono del casillero segun la
// calibracion vigente, lo compara contra una libreria de referencias, y si hay una coincidencia
// razonablemente clara, autocompleta el heroe (marcado "auto" para que se revise a simple vista).
//
// La comparacion por color YA se habia probado antes (2026-07-25) y se descarto -- pero esa vez
// comparaba contra el arte de la wiki (PRELOADED_IMAGES), que se ve muy distinto al icono chico y
// teñido de color de equipo del scoreboard real. Esta vez la libreria de referencia se construye con
// capturas REALES del juego (ver capturas-pruebas/Capturas del juego de los personajes/detect_poc.py
// para la prueba que validó el metodo: ~90% de aciertos comparando dentro del mismo formato de
// pantalla). Por eso mismo, una referencia de un formato de pantalla (scoreboard "Tab") NO sirve para
// otro formato (tabla final, seleccion de heroes) -- cada escenario necesita su propia libreria.
//
// La libreria arranca con una semilla chica (hero-icon-seed.js, 12 heroes de una partida real) y
// crece con el uso: cuando confirmas o corregis un heroe en un casillero que vino de una captura,
// se guarda esa muestra para la próxima vez.
// calibrado a mano contra capturas reales (ver detect_poc.py): los aciertos genuinos quedan casi
// siempre por debajo de ~2000-2100, las confusiones claras arrancan cerca de 2300+. No hay un umbral
// perfecto con tan pocas muestras por heroe todavia -- crece con el aprendizaje incremental.
const HERO_ICON_MATCH_THRESHOLD = 2600;
const HERO_ICON_LEARN_CAP = 6; // maximo de muestras aprendidas por heroe (no crece sin limite)

function heroIconSignature(canvas, size){
  size = size || 24;
  const small = document.createElement("canvas");
  small.width = size; small.height = size;
  small.getContext("2d").drawImage(canvas, 0, 0, size, size);
  const data = small.getContext("2d").getImageData(0, 0, size, size).data;
  const sig = new Float32Array(size * size * 3);
  let idx = 0;
  for(let i=0; i<data.length; i+=4){ sig[idx++]=data[i]; sig[idx++]=data[i+1]; sig[idx++]=data[i+2]; }
  // centrado por canal: reduce sensibilidad al tinte de color de equipo / iluminacion general,
  // compara mas el patron relativo de forma y color que el brillo absoluto
  for(let c=0; c<3; c++){
    let sum = 0;
    for(let i=c; i<sig.length; i+=3) sum += sig[i];
    const mean = sum / (size*size);
    for(let i=c; i<sig.length; i+=3) sig[i] -= mean;
  }
  return sig;
}
function sigDistanceIcon(a, b){
  let sum = 0;
  for(let i=0; i<a.length; i++){ const d = a[i]-b[i]; sum += d*d; }
  return Math.sqrt(sum);
}
function loadLearnedIconRefs(){
  try{ return JSON.parse(localStorage.getItem("heroIconLearnedRefs")||"{}"); }catch(e){ return {}; }
}
function saveLearnedIconRefs(refs){
  try{ localStorage.setItem("heroIconLearnedRefs", JSON.stringify(refs)); }catch(e){}
}
// guarda una muestra nueva para ese heroe -- asi la libreria mejora con el uso real en vez de depender
// solo de la semilla inicial. Las muestras mas nuevas reemplazan a las mas viejas por heroe.
function learnHeroIcon(heroName, sig){
  const refs = loadLearnedIconRefs();
  if(!refs[heroName]) refs[heroName] = [];
  refs[heroName].push(Array.from(sig));
  if(refs[heroName].length > HERO_ICON_LEARN_CAP) refs[heroName].shift();
  saveLearnedIconRefs(refs);
}
function allHeroIconRefs(){
  const merged = {};
  const seed = window.HERO_ICON_SEED_SIGNATURES || {};
  Object.keys(seed).forEach(n=>{ merged[n] = [seed[n]]; });
  const learned = loadLearnedIconRefs();
  Object.keys(learned).forEach(n=>{
    if(!merged[n]) merged[n] = [];
    merged[n] = merged[n].concat(learned[n]);
  });
  return merged;
}
// compara el recorte contra toda la libreria -- si no hay ninguna referencia razonablemente parecida
// no adivina (mejor dejarlo para elegir a mano que autocompletar mal y que pase desapercibido).
// excludeNames evita que dos casilleros del MISMO equipo terminen con el mismo heroe asignado --
// el rival de turno con menos referencias en la libreria (ej. un heroe que todavia no aprendimos)
// puede "caerle" por cercania al vecino mas parecido y duplicar a alguien que ya estaba asignado.
function matchHeroIcon(canvas, excludeNames){
  const refs = allHeroIconRefs();
  const sig = heroIconSignature(canvas);
  let best = null, bestDist = Infinity;
  Object.keys(refs).forEach(name=>{
    if(excludeNames && excludeNames.has(name)) return;
    refs[name].forEach(refSig=>{
      const d = sigDistanceIcon(sig, refSig);
      if(d < bestDist){ bestDist = d; best = name; }
    });
  });
  if(best && bestDist <= HERO_ICON_MATCH_THRESHOLD) return {name: best, dist: bestDist};
  return null;
}

// si el casillero (side, idx) que se acaba de editar a mano viene de una captura todavia cargada,
// aprende ese recorte bajo el nombre confirmado -- asi la proxima captura parecida ya lo reconoce.
function learnHeroIconFromCurrentCapture(side, idx, heroName){
  try{
    const img = detectImages[side];
    if(!img) return;
    const cal = loadCalibration(side);
    const fullCanvas = document.createElement("canvas");
    fullCanvas.width = img.width; fullCanvas.height = img.height;
    fullCanvas.getContext("2d").drawImage(img, 0, 0);
    const rects = computeSlotRectsSingle(fullCanvas.width, fullCanvas.height, cal);
    const r = rects.main[idx];
    if(!r) return;
    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = Math.max(1, r.w); cropCanvas.height = Math.max(1, r.h);
    cropCanvas.getContext("2d").drawImage(fullCanvas, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
    learnHeroIcon(heroName, heroIconSignature(cropCanvas));
  }catch(e){ /* si algo falla acá no debe romper el flujo normal de elegir el héroe */ }
}
