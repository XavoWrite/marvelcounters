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
const CAL_DEFAULTS = {
  scoreboard: {
    ally:  {x:5, y:2, w:9, h:15, rowGap:16.5, roleOffsetX:-5, roleW:4.5, roleH:14, nameOffsetX:34, nameW:35, nameH:15},
    enemy: {x:5, y:2, w:9, h:15, rowGap:16.5, roleOffsetX:-5, roleW:4.5, roleH:14, nameOffsetX:25, nameW:43, nameH:15},
  },
  select: {
    ally:  {x:5, y:2, w:9, h:15, rowGap:16.5, roleOffsetX:-5, roleW:4.5, roleH:14, nameOffsetX:34, nameW:35, nameH:15},
    enemy: {x:5, y:2, w:9, h:15, rowGap:16.5, roleOffsetX:-5, roleW:4.5, roleH:14, nameOffsetX:25, nameW:43, nameH:15},
  },
};
let currentScenario = "scoreboard";
// sube este numero cada vez que se corrijan los CAL_DEFAULTS: invalida calibraciones viejas
// guardadas en el navegador (con coordenadas de otra version) para que se use la corregida.
const CALIBRATION_VERSION = 6;
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
  const val = (field)=> parseFloat(document.getElementById(`cal_${side}_${field}`).value) || d[field];
  return {
    x: val("x"), y: val("y"), w: val("w"), h: val("h"), rowGap: val("rowGap"),
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
    const y = yPct/100*imgHeight, w = cal.w/100*imgWidth, h = cal.h/100*imgHeight;
    const x = cal.x/100*imgWidth;
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
  const canvas = document.getElementById(`cal_${side}_canvas`);
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
      return Tesseract.createWorker("eng", 1, {
        workerPath: workerUrl,
        corePath: coreUrl,
        langPath: ".",
        logger: onStatus || (()=>{}),
      });
    })();
  }
  return tesseractWorkerPromise;
}
// lee el nombre de jugador de un recorte; "" si no logra leer nada usable
async function ocrReadName(worker, canvas){
  try{
    const { data } = await worker.recognize(canvas);
    const cleaned = (data.text||"").replace(/[^\w\-\.]+/g," ").trim().split(/\s+/)[0] || "";
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

// analiza UNA captura (un solo equipo, 6 casilleros) y llena allyTeam o enemyTeam segun "side"
// nota: la identificacion automatica del HEROE por color se probo y se descarto (2026-07-25) --
// el recorte del scoreboard (chico, con tinte de color, y en un encuadre muy distinto al arte de
// wiki usado como referencia) nunca matcheaba de forma confiable, ni ajustando threshold ni recorte.
// queda pendiente para el futuro si aparece un metodo mas robusto (comparar formas en vez de color,
// o conseguir iconos de referencia con el mismo estilo que el juego). por ahora esta funcion solo
// calibra la posicion (para que sea facil clickear el casillero correcto a mano) y lee los nombres
// de jugador con OCR offline, que si funciona bien.
async function runLocalDetectionForSide(side){
  const statusEl = document.getElementById(`${side}DetectStatus`);
  const img = detectImages[side];
  if(!img){ statusEl.textContent = "Primero pegá (Ctrl+V) o subí una captura."; return; }
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
  renderSlots();

  statusEl.textContent = `Posiciones calibradas — clickeá cada casillero de arriba para elegir el héroe (mirá el recuadro celeste como guía).`;

  // lectura de nombres de jugador con OCR offline (Tesseract.js, sin IA ni internet)
  const ocrCheckbox = document.getElementById("ocrReadNamesCheck");
  if(!ocrCheckbox || !ocrCheckbox.checked) return;
  try{
    statusEl.textContent += " · iniciando lector de nombres (offline, puede tardar la primera vez)...";
    const worker = await getTesseractWorker();
    let namesRead = 0;
    for(let i=0;i<6;i++){
      statusEl.textContent = `Leyendo nombres (${i+1}/6)...`;
      const name = await ocrReadName(worker, cropRect(rects.name[i]));
      if(name){
        const input = document.getElementById(`scoutName_${side}_${i}`);
        if(input && !input.value.trim()){
          input.value = name;
          namesRead++;
          renderScoutLinksAndVerdict(side, i);
        }
      }
    }
    statusEl.textContent = `${namesRead}/6 nombres leídos con OCR offline — clickeá cada casillero de arriba para elegir el héroe correspondiente.`;
  }catch(e){
    console.error("No se pudo leer nombres con OCR:", e);
    statusEl.textContent += " (no se pudo iniciar el lector de nombres offline)";
  }
}

function loadImageForSide(side, dataUrl){
  const img = new Image();
  img.onload = ()=>{
    detectImages[side] = img;
    const zone = document.getElementById(side==="ally" ? "pasteZoneAlly" : "pasteZoneEnemy");
    zone.classList.add("has-image");
    drawCalibrationPreview(side);
    runLocalDetectionForSide(side);
  };
  img.src = dataUrl;
}

function setupCaptureZone(side){
  const zone = document.getElementById(side==="ally" ? "pasteZoneAlly" : "pasteZoneEnemy");
  const fileInput = document.getElementById(side==="ally" ? "allyFileInput" : "enemyFileInput");
  const filePick = document.getElementById(side==="ally" ? "allyFilePick" : "enemyFilePick");
  zone.addEventListener("click", ()=> zone.focus());
  filePick.onclick = (e)=>{ e.stopPropagation(); fileInput.click(); };
  zone.addEventListener("paste", (e)=>{
    const items = e.clipboardData && e.clipboardData.items;
    if(!items) return;
    for(const item of items){
      if(item.type && item.type.startsWith("image/")){
        const blob = item.getAsFile();
        const reader = new FileReader();
        reader.onload = ()=> loadImageForSide(side, reader.result);
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
    reader.onload = ()=> loadImageForSide(side, reader.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };
  // tambien se puede arrastrar y soltar la imagen directo sobre el recuadro
  zone.addEventListener("dragover", (e)=>{ e.preventDefault(); zone.classList.add("drag-over"); });
  zone.addEventListener("dragleave", ()=> zone.classList.remove("drag-over"));
  zone.addEventListener("drop", (e)=>{
    e.preventDefault();
    zone.classList.remove("drag-over");
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if(!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = ()=> loadImageForSide(side, reader.result);
    reader.readAsDataURL(file);
  });
  document.getElementById(`cal_${side}_previewBtn`).onclick = ()=>{
    saveCalibration(side, readCalibrationInputs(side));
    drawCalibrationPreview(side);
  };
  document.getElementById(`cal_${side}_redetectBtn`).onclick = ()=>{
    saveCalibration(side, readCalibrationInputs(side));
    drawCalibrationPreview(side);
    runLocalDetectionForSide(side);
  };
  fillCalibrationInputs(side, loadCalibration(side));
}
setupCaptureZone("ally");
setupCaptureZone("enemy");

// cambia entre las dos pantallas del juego (fin de partida vs seleccion de heroes) -- cada una
// guarda su propia calibracion, asi que cambiar de escenario no pisa la calibracion de la otra
function setScenario(scenario){
  currentScenario = scenario;
  document.querySelectorAll(".scenario-btn").forEach(b=> b.classList.toggle("active", b.dataset.scenario===scenario));
  ["ally","enemy"].forEach(side=>{
    fillCalibrationInputs(side, loadCalibration(side));
    if(detectImages[side]) drawCalibrationPreview(side);
  });
}
document.querySelectorAll(".scenario-btn").forEach(btn=>{
  btn.onclick = ()=> setScenario(btn.dataset.scenario);
});

