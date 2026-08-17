/* ---------------- CARPETA DE CAPTURAS AUTOMATICA (File System Access API) ---------------- */
// Idea de Xavier (2026-08-17): jugar con captura por F12 (ej. la carpeta de Steam) manda las
// imagenes a una carpeta fija en disco -- en vez de tener que pegarlas a mano cada vez, se le
// pide al usuario UNA sola vez que elija esa carpeta, y desde ahi la app detecta sola la captura
// mas reciente cada vez que volves a esta pestaña (evento "focus" de la ventana).
//
// Esto SOLO es posible gracias a la File System Access API del navegador (showDirectoryPicker),
// que da acceso de lectura a una carpeta local con permiso explicito del usuario -- nada se sube a
// ningun lado, el handle y el permiso quedan 100% locales. Solo la implementan navegadores
// basados en Chromium (Chrome, Edge, Opera, Brave); Firefox y Safari no la tienen todavia, por eso
// el aviso de "no soportado" cuando falta.
const SCREENSHOT_FOLDER_SUPPORTED = typeof window.showDirectoryPicker === "function";
let screenshotFolderHandle = null;
let lastLoadedScreenshotKey = null; // nombre+fecha de la ultima captura ya cargada, para no repetir

function openScreenshotFolderDB(){
  return new Promise((res, rej)=>{
    const req = indexedDB.open("marvelCountersFS", 1);
    req.onupgradeneeded = ()=> req.result.createObjectStore("handles");
    req.onsuccess = ()=> res(req.result);
    req.onerror = ()=> rej(req.error);
  });
}
async function saveScreenshotFolderHandle(handle){
  try{
    const db = await openScreenshotFolderDB();
    await new Promise((res, rej)=>{
      const tx = db.transaction("handles", "readwrite");
      tx.objectStore("handles").put(handle, "screenshotFolder");
      tx.oncomplete = res; tx.onerror = ()=> rej(tx.error);
    });
    db.close();
  }catch(e){ /* si no se puede persistir, no pasa nada -- solo hay que elegir la carpeta de nuevo la proxima vez */ }
}
async function loadSavedScreenshotFolderHandle(){
  try{
    const db = await openScreenshotFolderDB();
    const handle = await new Promise((res, rej)=>{
      const tx = db.transaction("handles", "readonly");
      const req = tx.objectStore("handles").get("screenshotFolder");
      req.onsuccess = ()=> res(req.result || null);
      req.onerror = ()=> rej(req.error);
    });
    db.close();
    return handle;
  }catch(e){ return null; }
}

const SCREENSHOT_IMAGE_EXT = [".png", ".jpg", ".jpeg", ".webp", ".bmp"];

// recorre la carpeta (sin entrar a subcarpetas) y devuelve el archivo de imagen mas reciente
// segun su fecha de modificacion -- asi encuentra la ultima captura sin importar como se llame.
async function findNewestScreenshot(dirHandle){
  let newest = null, newestTime = -1;
  for await (const [name, entry] of dirHandle.entries()){
    if(entry.kind !== "file") continue;
    const lower = name.toLowerCase();
    if(!SCREENSHOT_IMAGE_EXT.some(ext => lower.endsWith(ext))) continue;
    const file = await entry.getFile();
    if(file.lastModified > newestTime){ newestTime = file.lastModified; newest = {file, name}; }
  }
  return newest;
}

async function checkForNewScreenshot(isAutoCheck){
  if(!screenshotFolderHandle) return;
  const statusEl = document.getElementById("autoFolderStatus");
  try{
    let perm = await screenshotFolderHandle.queryPermission({mode: "read"});
    if(perm !== "granted"){
      if(isAutoCheck) return; // no interrumpir con el prompt del navegador en un chequeo silencioso
      perm = await screenshotFolderHandle.requestPermission({mode: "read"});
      if(perm !== "granted"){ if(statusEl) statusEl.textContent = t("status.folderPermissionDenied"); return; }
    }
    const newest = await findNewestScreenshot(screenshotFolderHandle);
    if(!newest){ if(statusEl) statusEl.textContent = t("status.folderEmpty"); return; }
    const key = newest.name + "_" + newest.file.lastModified;
    if(key === lastLoadedScreenshotKey){
      if(!isAutoCheck && statusEl) statusEl.textContent = t("status.folderNoNew");
      return;
    }
    lastLoadedScreenshotKey = key;
    const dataUrl = await new Promise((res, rej)=>{
      const reader = new FileReader();
      reader.onload = ()=> res(reader.result);
      reader.onerror = rej;
      reader.readAsDataURL(newest.file);
    });
    if(statusEl) statusEl.textContent = t("status.folderLoaded", {name: newest.name});
    loadCombinedImage(dataUrl);
  }catch(e){
    console.error(e);
    if(statusEl) statusEl.textContent = t("status.folderError");
  }
}

async function pickScreenshotFolder(){
  try{
    const handle = await window.showDirectoryPicker({id: "marvelcounters-screenshots", mode: "read"});
    screenshotFolderHandle = handle;
    lastLoadedScreenshotKey = null; // carpeta nueva -- no arrastrar el "ya cargado" de la anterior
    await saveScreenshotFolderHandle(handle);
    const btn = document.getElementById("pickFolderBtn");
    if(btn) btn.setAttribute("data-i18n", "team.pickFolderAgainBtn"), btn.textContent = t("team.pickFolderAgainBtn");
    const statusEl = document.getElementById("autoFolderStatus");
    if(statusEl) statusEl.textContent = t("status.folderSelected", {name: handle.name});
    checkForNewScreenshot(false);
  }catch(e){
    // el usuario cerro el selector de carpeta sin elegir nada -- no hacer nada
  }
}

async function initScreenshotFolderUI(){
  const supportedEl = document.getElementById("autoFolderSupported");
  const unsupportedEl = document.getElementById("autoFolderUnsupported");
  if(!SCREENSHOT_FOLDER_SUPPORTED){
    if(unsupportedEl) unsupportedEl.style.display = "";
    return;
  }
  if(supportedEl) supportedEl.style.display = "";
  const btn = document.getElementById("pickFolderBtn");
  if(btn) btn.addEventListener("click", pickScreenshotFolder);

  const saved = await loadSavedScreenshotFolderHandle();
  if(saved){
    screenshotFolderHandle = saved;
    if(btn) btn.setAttribute("data-i18n", "team.pickFolderAgainBtn"), btn.textContent = t("team.pickFolderAgainBtn");
    const statusEl = document.getElementById("autoFolderStatus");
    if(statusEl) statusEl.textContent = t("status.folderSelected", {name: saved.name});
  }

  // cuando volves a esta pestaña (ej. despues de apretar F12 en el juego y volver con Alt+Tab),
  // se fija sola si hay una captura nueva -- asi no hace falta ningun click extra en el flujo normal.
  window.addEventListener("focus", ()=> checkForNewScreenshot(true));
}
initScreenshotFolderUI();
