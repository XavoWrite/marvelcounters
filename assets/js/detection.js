/* ================= IDENTIFICACIÓN LOCAL SIN IA (comparación de color, 100% offline) ================= */
// convierte una region (canvas ya recortado a un icono) en una "huella" de 8x8 = 192 números (RGB por celda)
function computeSignatureFromCanvas(sourceCanvas){
  const small = document.createElement("canvas");
  small.width = 8; small.height = 8;
  const sctx = small.getContext("2d");
  sctx.drawImage(sourceCanvas, 0, 0, 8, 8);
  const data = sctx.getImageData(0,0,8,8).data;
  const sig = [];
  for(let i=0;i<data.length;i+=4){ sig.push(data[i], data[i+1], data[i+2]); }
  return sig;
}
function sigDistance(a, b){
  let sum = 0;
  for(let i=0;i<a.length;i++){ sum += Math.abs(a[i]-b[i]); }
  return sum;
}
// distancia máxima tolerada para aceptar una coincidencia — más bajo = más estricto
const SIG_MATCH_THRESHOLD = 5500;

function loadAllHeroSignatures(){
  // devuelve entradas "Nombre::variante" -> firma, para TODAS las variantes registradas de cada héroe
  // (default/deluxe/dynamic más cualquier variante extra: bruce-banner, hero-hulk, female, darkchylde, etc.)
  const sigs = {};
  HEROES.forEach(h=>{
    getHeroVariants(h.n).forEach(v=>{
      try{
        const raw = localStorage.getItem(`heroImageSig:${h.n}:${v}`);
        if(raw){ sigs[`${h.n}::${v}`] = JSON.parse(raw); return; }
      }catch(e){}
      // sin firma guardada por el usuario para esta variante: usa la precargada de fabrica
      const pre = window.PRELOADED_IMAGES && window.PRELOADED_IMAGES[h.n] && window.PRELOADED_IMAGES[h.n][v];
      if(pre) sigs[`${h.n}::${v}`] = pre.sig;
    });
    try{
      const legacyRaw = localStorage.getItem(`heroImageSig:${h.n}`);
      if(legacyRaw && !sigs[`${h.n}::default`]) sigs[`${h.n}::default`] = JSON.parse(legacyRaw);
    }catch(e){}
  });
  return sigs;
}

// cada captura ahora muestra UN solo equipo (mas grande y claro), asi que la calibracion
// es independiente para "ally" y "enemy" -- cada una con su propia imagen y su propio set de campos.
// Ademas, distintas pantallas del juego (fin de partida / Tab vs. selección de héroes) tienen los
// iconos y nombres en posiciones distintas -- por eso la calibración tambien esta separada por
// "escenario" (currentScenario), no solo por lado.
// valores por defecto para una captura de UN solo equipo (recortada aprox. desde el logo de
// rol hasta el nombre) -- son solo un punto de partida, cada quien recalibra segun su formato.
// "scoreboard" esta calibrado sobre el "cuadro" estandar acordado: captura ajustada del scoreboard
// (Tab) de la partida (ver capturas de referencia del 2026-07-25, recalibrado a mano por el usuario
// en la captura de las 20h20 -- el logo de rol/clase queda a la IZQUIERDA del retrato, no el
// circulo de la derecha que es de team-ups/sinergias). "select" (pantalla de selección de héroes)
// todavia no tiene una referencia real -- arranca con los mismos valores como punto de partida y
// se recalibra a mano la primera vez que se use con capturas de esa pantalla.
// "loading" (pantalla de carga previa a elegir heroe, tarjetas en diagonal): NO hay icono de heroe
// todavia en esta pantalla, asi que el rect "main" se calibra directo sobre el texto de nivel+nombre
// (nameOffsetX:0, nameW/nameH = w/h) y la deteccion de heroe simplemente no encuentra nada ahi, sin
// romper nada. Las tarjetas estan inclinadas: el texto del lado aliado se corre hacia la izquierda
// en cada fila (xShiftPerRow negativo); el lado rival, en las capturas de referencia, se mantuvo
// casi vertical (xShiftPerRow casi 0) -- varia segun el modo/mapa, por eso es ajustable.
const CAL_DEFAULTS = {
  scoreboard: {
    // x/w del retrato re-medidos a mano en pixeles reales (2026-08-17, sobre la imagen SIN
    // trimDarkBorders -- ver comentario en loadCombinedImage). Medido pixel a pixel: hay un icono de
    // rol (~0-4%), un separador oscuro (~5%), el RETRATO (~5.3-11.9%), y despues el icono de
    // team-up/sinergia (~12.2%+). x:5.5,w:6.0 cae bien adentro del retrato con margen de sobra.
    ally:  {x:5.5, y:2, w:6.0, h:15, rowGap:16.5, xShiftPerRow:0, roleOffsetX:-5, roleW:3.5, roleH:14, nameOffsetX:34, nameW:35, nameH:15},
    enemy: {x:5.5, y:2, w:6.0, h:15, rowGap:16.5, xShiftPerRow:0, roleOffsetX:-5, roleW:3.5, roleH:14, nameOffsetX:25, nameW:43, nameH:15},
  },
  loading: {
    ally:  {x:12.5,  y:28.52, w:9.90,  h:4.81, rowGap:11.48, xShiftPerRow:-1.1458, roleOffsetX:0, roleW:0, roleH:0, nameOffsetX:0, nameW:9.90,  nameH:4.81},
    enemy: {x:74.48, y:17.41, w:10.42, h:4.81, rowGap:11.48, xShiftPerRow:-1.5625, roleOffsetX:0, roleW:0, roleH:0, nameOffsetX:0, nameW:10.42, nameH:4.81},
  },
};
let currentScenario = "scoreboard";
// sube este numero cada vez que se corrijan los CAL_DEFAULTS: invalida calibraciones viejas
// guardadas en el navegador (con coordenadas de otra version) para que se use la corregida.
const CALIBRATION_VERSION = 9;
function loadCalibration(side){
  try{
    const savedVersion = parseInt(localStorage.getItem("iconCalibrationVersion")||"0", 10);
    if(savedVersion < CALIBRATION_VERSION) return {...CAL_DEFAULTS[currentScenario][side]};
    const raw = localStorage.getItem(`iconCalibration_${currentScenario}_${side}`);
    if(raw) return {...CAL_DEFAULTS[currentScenario][side], ...JSON.parse(raw)};
  }catch(e){}
  return {...CAL_DEFAULTS[currentScenario][side]};
}
function saveCalibration(side, cal){
  try{
    localStorage.setItem(`iconCalibration_${currentScenario}_${side}`, JSON.stringify(cal));
    localStorage.setItem("iconCalibrationVersion", String(CALIBRATION_VERSION));
  }catch(e){}
}
function readCalibrationInputs(side){
  const d = CAL_DEFAULTS[currentScenario][side];
  const val = (field)=>{
    const el = document.getElementById(`cal_${side}_${field}`);
    if(!el) return d[field];
    const n = parseFloat(el.value);
    return isNaN(n) ? d[field] : n;
  };
  return {
    x: val("x"), y: val("y"), w: val("w"), h: val("h"), rowGap: val("rowGap"), xShiftPerRow: val("xShiftPerRow"),
    roleOffsetX: val("roleOffsetX"), roleW: val("roleW"), roleH: val("roleH"),
    nameOffsetX: val("nameOffsetX"), nameW: val("nameW"), nameH: val("nameH"),
  };
}
function fillCalibrationInputs(side, cal){
  Object.keys(cal).forEach(field=>{
    const el = document.getElementById(`cal_${side}_${field}`);
    if(el) el.value = cal[field];
  });
}
// calcula los 6 rectangulos del icono de un equipo (uno por fila), mas el logo de rol y el
// nombre de jugador de cada uno (relativos al icono del heroe)
function computeSlotRectsSingle(imgWidth, imgHeight, cal){
  const rects = {main:[], role:[], name:[]};
  for(let i=0;i<6;i++){
    const yPct = cal.y + i*cal.rowGap;
    // xShiftPerRow: para pantallas con las tarjetas en diagonal (ver escenario "loading"), la
    // posicion horizontal se corre un poco en cada fila -- en pantallas rectas queda en 0 y no cambia nada.
    const xPct = cal.x + i*(cal.xShiftPerRow||0);
    const y = yPct/100*imgHeight, w = cal.w/100*imgWidth, h = cal.h/100*imgHeight;
    const x = xPct/100*imgWidth;
    const roleW = cal.roleW/100*imgWidth, roleH = cal.roleH/100*imgHeight;
    const nameW = cal.nameW/100*imgWidth, nameH = cal.nameH/100*imgHeight;
    const roleOffX = cal.roleOffsetX/100*imgWidth;
    const nameOffX = cal.nameOffsetX/100*imgWidth;
    rects.main.push({x, y, w, h});
    rects.role.push({x: x+roleOffX, y, w: roleW, h: roleH});
    rects.name.push({x: x+nameOffX, y, w: nameW, h: nameH});
  }
  return rects;
}

let detectImages = {ally:null, enemy:null}; // <img> cargada por lado, se reutiliza al recalibrar

function drawCalibrationPreview(side){
  // el panel de calibracion ya no se muestra en la interfaz principal (nadie tiene tiempo de
  // calibrar a mano) -- si el canvas no existe en el DOM, no hay nada que dibujar.
  const canvas = document.getElementById(`cal_${side}_canvas`);
  if(!canvas) return;
  const img = detectImages[side];
  if(!img) return;
  canvas.style.display = "block";
  const maxW = 640;
  const scale = Math.min(1, maxW/img.width);
  canvas.width = img.width*scale;
  canvas.height = img.height*scale;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const cal = readCalibrationInputs(side);
  const rects = computeSlotRectsSingle(canvas.width, canvas.height, cal);
  ctx.lineWidth = 2;
  ctx.strokeStyle = side==="ally" ? "#3e8eff" : "#ff3b4e";
  rects.main.forEach(r=>ctx.strokeRect(r.x, r.y, r.w, r.h));
  ctx.strokeStyle = "#ffd23e";
  rects.role.forEach(r=>ctx.strokeRect(r.x, r.y, r.w, r.h));
  ctx.strokeStyle = "#3ef2c8";
  rects.name.forEach(r=>ctx.strokeRect(r.x, r.y, r.w, r.h));
}

/* ---------------- OCR OFFLINE (lee nombres de jugador de la captura, sin IA ni internet) ---------------- */
function b64ToBytesOcr(b64){
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
function textToDataUrlJs(jsSource){
  const bytes = new TextEncoder().encode(jsSource);
  let bin = "";
  for(let i=0;i<bytes.length;i++) bin += String.fromCharCode(bytes[i]);
  return "data:text/javascript;base64," + btoa(bin);
}
async function seedTesseractLangCache(){
  const bytes = b64ToBytesOcr(window.TESSERACT_TRAINEDDATA_B64);
  const dbReq = indexedDB.open("keyval-store");
  const db = await new Promise((res,rej)=>{
    dbReq.onupgradeneeded = ()=> dbReq.result.createObjectStore("keyval");
    dbReq.onsuccess = ()=>res(dbReq.result);
    dbReq.onerror = ()=>rej(dbReq.error);
  });
  await new Promise((res,rej)=>{
    const tx = db.transaction("keyval","readwrite");
    tx.objectStore("keyval").put(bytes, "./eng.traineddata");
    tx.oncomplete = res; tx.onerror = ()=>rej(tx.error);
  });
  db.close();
}
let tesseractWorkerPromise = null;
function getTesseractWorker(onStatus){
  if(!tesseractWorkerPromise){
    tesseractWorkerPromise = (async ()=>{
      await seedTesseractLangCache();
      const workerUrl = textToDataUrlJs(window.TESSERACT_WORKER_JS);
      // el codigo de tesseract.js usa corePath tal cual solo si termina en "js";
      // si no, le pega el nombre de archivo esperado al final (rompe una data URL).
      const coreUrl = textToDataUrlJs(window.TESSERACT_CORE_JS) + "#.js";
      const worker = await Tesseract.createWorker("eng", 1, {
        workerPath: workerUrl,
        corePath: coreUrl,
        langPath: ".",
        logger: onStatus || (()=>{}),
      });
      // cada recorte es SIEMPRE una sola linea de texto (un nombre) -- el modo de segmentacion por
      // defecto ("pagina completa") intenta encontrar parrafos/columnas y confunde bastante en
      // recortes tan chicos. Forzar "una sola linea" mejora la lectura notablemente.
      await worker.setParameters({ tessedit_pageseg_mode: Tesseract.PSM.SINGLE_LINE });
      return worker;
    })();
  }
  return tesseractWorkerPromise;
}
// lee el nombre de jugador de un recorte; "" si no logra leer nada usable
async function ocrReadName(worker, canvas){
  try{
    // el texto de la interfaz del juego es chico -- agrandarlo antes de leerlo ayuda bastante a
    // tesseract (funciona mucho mejor con texto de varias decenas de px de alto que con el
    // tamaño original del recorte).
    const scaled = document.createElement("canvas");
    scaled.width = canvas.width*2; scaled.height = canvas.height*2;
    scaled.getContext("2d").drawImage(canvas, 0, 0, scaled.width, scaled.height);
    const { data } = await worker.recognize(scaled);
    // algunos nombres de jugador incluyen comillas simples como parte del nombre (ej. 'Washed') --
    // se preservan en vez de tratarlas como separador, para no perderlas del resultado.
    const tokens = (data.text||"").replace(/[^\w\-\.']+/g," ").trim().split(/\s+/).filter(Boolean);
    // en la pantalla de carga el nombre viene precedido del nivel del jugador en el mismo renglon
    // ("96 XavoDraw") -- se toma el primer token que NO sea puramente numerico, para no devolver el
    // nivel en vez del nombre. En las demas pantallas esto no cambia nada (nunca hay un token
    // numerico suelto antes del nombre).
    const cleaned = tokens.find(t=>!/^\d+$/.test(t)) || tokens[0] || "";
    return cleaned;
  }catch(e){ console.error("OCR error:", e); return ""; }
}

// Deadpool comparte el mismo retrato en sus 3 roles: cuando el match cae en cualquiera de
// los 3, el logo de rol pegado al ícono (espada/escudo/cruz) es lo único que distingue cuál es.
const DEADPOOL_ROLE_MAP = {"Vanguard":"Deadpool (Vanguard)", "Duelist":"Deadpool (Duelist)", "Strategist":"Deadpool (Strategist)"};
function resolveRoleFromCrop(roleCanvas){
  const roleSig = computeSignatureFromCanvas(roleCanvas);
  let bestRole = null, bestRoleDist = Infinity;
  ["Vanguard","Duelist","Strategist"].forEach(role=>{
    const refSig = getRoleIconSig(role);
    if(!refSig) return;
    const d = sigDistance(roleSig, refSig);
    if(d<bestRoleDist){ bestRoleDist = d; bestRole = role; }
  });
  return bestRole;
}

// analiza UNA captura (un solo equipo, 6 casilleros) y llena allyTeam o enemyTeam segun "side".
// el heroe de cada casillero se intenta autocompletar comparando el recorte contra la libreria de
// referencias reales (ver hero-detect.js) -- lo que no matchea con suficiente confianza se deja vacío
// para elegir a mano, en vez de adivinar y arriesgar un pick equivocado sin que se note.
async function runLocalDetectionForSide(side){
  const statusEl = document.getElementById(`${side}DetectStatus`);
  const img = detectImages[side];
  if(!img){ statusEl.textContent = t("status.pasteFirst"); return; }
  const cal = readCalibrationInputs(side);
  saveCalibration(side, cal);
  const fullCanvas = document.createElement("canvas");
  fullCanvas.width = img.width; fullCanvas.height = img.height;
  fullCanvas.getContext("2d").drawImage(img, 0, 0);
  const rects = computeSlotRectsSingle(fullCanvas.width, fullCanvas.height, cal);
  function cropRect(r){
    const c = document.createElement("canvas");
    c.width = Math.max(1, r.w); c.height = Math.max(1, r.h);
    c.getContext("2d").drawImage(fullCanvas, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
    return c;
  }

  const team = side==="ally" ? allyTeam : enemyTeam;
  // cada (re)deteccion arranca de cero: borra heroes y nombres previos de este lado para no mezclar
  // resultados viejos con los nuevos (evita que queden picks o nombres pegados de una captura anterior).
  for(let i=0;i<6;i++){ team[i] = null; }
  for(let i=0;i<6;i++){ clearScoutRow(side, i); }

  // un mismo equipo no puede repetir heroe -- si un rival sin referencia buena en la libreria
  // "cae" por cercania sobre un heroe que otro casillero de este mismo equipo ya ocupó, se descarta
  // esa coincidencia y se prueba la siguiente mejor en su lugar (usedNames se va llenando a medida
  // que se confirman coincidencias, en orden de casillero).
  let autoCount = 0;
  const usedNames = new Set();
  for(let i=0;i<6;i++){
    const match = matchHeroIcon(cropRect(rects.main[i]), usedNames);
    if(match && byName[match.name]){
      team[i] = {...byName[match.name], _auto: true};
      usedNames.add(match.name);
      autoCount++;
    }
  }
  renderSlots();

  statusEl.textContent = autoCount>0
    ? t("status.autoDetected", {n: autoCount})
    : t("status.noneDetected");

  // lectura de nombres de jugador con OCR offline (Tesseract.js, sin IA ni internet) -- siempre
  // activa (sin checkbox visible): alimenta el Explorador de Jugadores, que no se expone en la UI
  // principal (pedido de Xavier, 2026-08-17).
  try{
    statusEl.textContent += t("status.startingOcrSuffix");
    const worker = await getTesseractWorker();
    let namesRead = 0;
    for(let i=0;i<6;i++){
      statusEl.textContent = t("status.readingNames", {i: i+1});
      const name = await ocrReadName(worker, cropRect(rects.name[i]));
      if(name){
        const input = document.getElementById(`scoutName_${side}_${i}`);
        if(input && !input.value.trim()){
          input.value = name;
          namesRead++;
          renderScoutLinks(side, i);
        }
      }
    }
    statusEl.textContent = t("status.namesReadDone", {n: namesRead});
  }catch(e){
    console.error("No se pudo leer nombres con OCR:", e);
    statusEl.textContent += t("status.ocrStartFailedSuffix");
  }
}

// recorta franjas negras solidas en los bordes -- pasa cuando alguien pega una captura de TODA la
// pantalla (ej. un segundo monitor mas chico que deja barras negras alrededor del juego) en vez de
// una captura ya recortada solo al juego. Solo recorta franjas MUY oscuras y uniformes (letterboxing
// real), nunca mas del 20% por lado, para no comerse contenido de una escena legitimamente oscura.
function trimDarkBorders(img){
  const w = img.width, h = img.height;
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const DARK = 10, MAX_TRIM = 0.2;
  function rowBrightness(y){
    const data = ctx.getImageData(0, y, w, 1).data;
    let sum = 0, n = 0;
    for(let i=0; i<data.length; i+=4*7){ sum += (data[i]+data[i+1]+data[i+2])/3; n++; }
    return n ? sum/n : 255;
  }
  function colBrightness(x){
    const data = ctx.getImageData(x, 0, 1, h).data;
    let sum = 0, n = 0;
    for(let i=0; i<data.length; i+=4*7){ sum += (data[i]+data[i+1]+data[i+2])/3; n++; }
    return n ? sum/n : 255;
  }
  let top=0, bottom=h, left=0, right=w;
  while(top < h*MAX_TRIM && rowBrightness(top) < DARK) top++;
  while(bottom > h*(1-MAX_TRIM) && rowBrightness(bottom-1) < DARK) bottom--;
  while(left < w*MAX_TRIM && colBrightness(left) < DARK) left++;
  while(right > w*(1-MAX_TRIM) && colBrightness(right-1) < DARK) right--;
  if(top===0 && bottom===h && left===0 && right===w) return img; // nada para recortar
  const cw = Math.max(1, right-left), ch = Math.max(1, bottom-top);
  const trimmed = document.createElement("canvas");
  trimmed.width = cw; trimmed.height = ch;
  trimmed.getContext("2d").drawImage(canvas, left, top, cw, ch, 0, 0, cw, ch);
  return trimmed;
}

// las calibraciones manuales (cal_${side}_previewBtn/redetectBtn) solo existen si el panel de
// calibracion esta presente en el DOM -- queda oculto de la interfaz principal (nadie tiene tiempo
// de calibrar a mano), pero si algun dia se muestra, sigue funcionando con la calibracion por defecto.
["ally","enemy"].forEach(side=>{
  const previewBtn = document.getElementById(`cal_${side}_previewBtn`);
  if(previewBtn) previewBtn.onclick = ()=>{
    saveCalibration(side, readCalibrationInputs(side));
    drawCalibrationPreview(side);
  };
  const redetectBtn = document.getElementById(`cal_${side}_redetectBtn`);
  if(redetectBtn) redetectBtn.onclick = ()=>{
    saveCalibration(side, readCalibrationInputs(side));
    drawCalibrationPreview(side);
    runLocalDetectionForSide(side);
  };
  fillCalibrationInputs(side, loadCalibration(side));
});

/* ---------------- CAPTURA COMBINADA (un solo screenshot con los dos equipos) ---------------- */
// medido a mano sobre una captura real del marcador en curso (Tab), 1920x1080 -- ver
// capturas-pruebas/Capturas de juego con diferentes colores/Screenshot_2026-07-28_12-19-36.png.
// Reconstruye, a partir del screenshot completo, el mismo recorte "ajustado a un solo equipo" que
// ya usa la calibracion "scoreboard" (ver CAL_DEFAULTS.scoreboard) -- asi no hace falta una
// calibracion nueva, se recorta la porcion de cada equipo y se reutiliza la misma. Si el usuario
// cambia el escala de UI del juego esto puede desalinearse un poco -- es un punto de partida.
const COMBINED_SPLIT = {
  ally:  {x:9.0,  y:26.5, w:41.0, h:40.0},
  enemy: {x:50.0, y:26.5, w:41.0, h:40.0},
};
function cropPercentToCanvas(sourceCanvas, pct){
  const sw = sourceCanvas.width, sh = sourceCanvas.height;
  const sx = pct.x/100*sw, sy = pct.y/100*sh, cw = pct.w/100*sw, ch = pct.h/100*sh;
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(cw)); c.height = Math.max(1, Math.round(ch));
  c.getContext("2d").drawImage(sourceCanvas, sx, sy, cw, ch, 0, 0, c.width, c.height);
  return c;
}
function loadCombinedImage(dataUrl){
  const statusEl = document.getElementById("combinedDetectStatus");
  const img = new Image();
  img.onload = async ()=>{
    // NO se recorta con trimDarkBorders aca (2026-08-17): se midio a mano, comparando pixel a pixel
    // dos capturas reales del mismo heroe/fila, que sin el trim las coordenadas son estables entre
    // capturas (valores identicos), pero CON el trim la cantidad recortada varia un poco de captura
    // en captura (aunque ambas sean 1920x1080 sin letterboxing real) y eso corre COMBINED_SPLIT lo
    // suficiente como para que el recorte del icono caiga fuera del retrato. Como estas capturas ya
    // vienen nativas sin barras negras reales, saltear el trim aca es mas confiable que aplicarlo.
    const fullCanvas = document.createElement("canvas");
    fullCanvas.width = img.width; fullCanvas.height = img.height;
    fullCanvas.getContext("2d").drawImage(img, 0, 0);
    document.getElementById("pasteZoneCombined").classList.add("has-image");
    statusEl.textContent = t("status.splitting");
    detectImages.ally = cropPercentToCanvas(fullCanvas, COMBINED_SPLIT.ally);
    detectImages.enemy = cropPercentToCanvas(fullCanvas, COMBINED_SPLIT.enemy);
    await runLocalDetectionForSide("ally");
    await runLocalDetectionForSide("enemy");
    statusEl.textContent = t("status.combinedDone");
  };
  img.src = dataUrl;
}
function setupCombinedZone(){
  const zone = document.getElementById("pasteZoneCombined");
  const fileInput = document.getElementById("combinedFileInput");
  zone.addEventListener("click", (e)=>{
    if(e.target.closest("u")){ e.stopPropagation(); fileInput.click(); return; }
    zone.focus();
  });
  zone.addEventListener("paste", (e)=>{
    const items = e.clipboardData && e.clipboardData.items;
    if(!items) return;
    for(const item of items){
      if(item.type && item.type.startsWith("image/")){
        const blob = item.getAsFile();
        const reader = new FileReader();
        reader.onload = ()=> loadCombinedImage(reader.result);
        reader.readAsDataURL(blob);
        e.preventDefault();
        return;
      }
    }
  });
  fileInput.onchange = (e)=>{
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=> loadCombinedImage(reader.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };
  zone.addEventListener("dragover", (e)=>{ e.preventDefault(); zone.classList.add("drag-over"); });
  zone.addEventListener("dragleave", ()=> zone.classList.remove("drag-over"));
  zone.addEventListener("drop", (e)=>{
    e.preventDefault();
    zone.classList.remove("drag-over");
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if(!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = ()=> loadCombinedImage(reader.result);
    reader.readAsDataURL(file);
  });
}
setupCombinedZone();

/* ---------------- CAPTURA DE CARGA (pre-partida): solo completa nombres ---------------- */
// la pantalla de carga (antes de elegir heroe) no tiene icono de heroe todavia -- ver
// CAL_DEFAULTS.loading. Esta zona es opcional y solo completa los nombres del Explorador de
// Jugadores que hayan quedado vacios -- nunca pisa un nombre que ya se haya leido o escrito a mano
// desde la captura principal (por eso no hace falta subirla si el usuario no llegó a tiempo).
async function runLoadingNameFill(img){
  const statusEl = document.getElementById("loadingDetectStatus");
  const trimmed = trimDarkBorders(img);
  const fullCanvas = document.createElement("canvas");
  fullCanvas.width = trimmed.width; fullCanvas.height = trimmed.height;
  fullCanvas.getContext("2d").drawImage(trimmed, 0, 0);
  function cropRect(r){
    const c = document.createElement("canvas");
    c.width = Math.max(1, r.w); c.height = Math.max(1, r.h);
    c.getContext("2d").drawImage(fullCanvas, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
    return c;
  }
  statusEl.textContent = t("status.startingOcr");
  try{
    const worker = await getTesseractWorker();
    let namesRead = 0;
    for(const side of ["ally","enemy"]){
      const rects = computeSlotRectsSingle(fullCanvas.width, fullCanvas.height, CAL_DEFAULTS.loading[side]);
      for(let i=0;i<6;i++){
        const input = document.getElementById(`scoutName_${side}_${i}`);
        if(!input || input.value.trim()) continue; // no pisa nombres que ya estaban completos
        statusEl.textContent = t("status.readingNamesSide", {side: side==="ally"?t("team.yourTeam"):t("team.enemyTeam"), i: i+1});
        const name = await ocrReadName(worker, cropRect(rects.name[i]));
        if(name){
          input.value = name;
          namesRead++;
          renderScoutLinks(side, i);
        }
      }
    }
    statusEl.textContent = namesRead>0
      ? tp("status.namesCompletedInScouting", namesRead, {n: namesRead})
      : t("status.noNewNames");
  }catch(e){
    console.error("No se pudo leer nombres con OCR:", e);
    statusEl.textContent = t("status.ocrStartFailed");
  }
}
function setupLoadingDropZone(){
  const zone = document.getElementById("pasteZoneLoading");
  const fileInput = document.getElementById("loadingFileInput");
  function handleFile(dataUrl){
    const img = new Image();
    img.onload = ()=>{
      zone.classList.add("has-image");
      runLoadingNameFill(img);
    };
    img.src = dataUrl;
  }
  zone.addEventListener("click", (e)=>{
    if(e.target.closest("u")){ e.stopPropagation(); fileInput.click(); return; }
    zone.focus();
  });
  zone.addEventListener("paste", (e)=>{
    const items = e.clipboardData && e.clipboardData.items;
    if(!items) return;
    for(const item of items){
      if(item.type && item.type.startsWith("image/")){
        const blob = item.getAsFile();
        const reader = new FileReader();
        reader.onload = ()=> handleFile(reader.result);
        reader.readAsDataURL(blob);
        e.preventDefault();
        return;
      }
    }
  });
  fileInput.onchange = (e)=>{
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=> handleFile(reader.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };
  zone.addEventListener("dragover", (e)=>{ e.preventDefault(); zone.classList.add("drag-over"); });
  zone.addEventListener("dragleave", ()=> zone.classList.remove("drag-over"));
  zone.addEventListener("drop", (e)=>{
    e.preventDefault();
    zone.classList.remove("drag-over");
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if(!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = ()=> handleFile(reader.result);
    reader.readAsDataURL(file);
  });
}
setupLoadingDropZone();

