// Система перемещения по чанкам

import { LOCS } from './gameData.js';
import { S, saveGame } from './gameState.js';
import { genEvent } from './events.js';
import { renderMap } from './map.js';

const STEP_TIME = 1000; // Время одного шага в мс

let stepInterval = null;
let stepProgress = 0;
let travelInterval = null;
let travelProgress = 0;

export function renderMovementUI() {
  const btn = document.getElementById('stepBtn');
  const text = document.getElementById('stepText');
  const prog = document.getElementById('stepProg');
  
  if (!btn || !text) return;
  
  const L = LOCS[S.loc];
  if (!L) return;
  
  // Если идёт быстрое перемещение
  if (S.traveling) {
    btn.style.display = '';
    text.textContent = `🚶 Идём в ${LOCS[S.traveling.toLoc]?.name || S.traveling.toLoc}...`;
    btn.onclick = null;
    btn.onmousedown = btn.ontouchstart = null;
    return;
  }
  
  // Если в городе
  if (L.isCity) {
    btn.style.display = 'none';
    return;
  }
  
  btn.style.display = '';
  
  const isLastChunk = S.chunk >= L.chunks - 1;
  
  if (isLastChunk) {
    // На последнем чанке - можно начать заново или перейти дальше
    text.textContent = '🏁 Конец локации';
    btn.onclick = () => showLocationEnd();
  } else {
    // Обычный шаг вперёд
    text.textContent = `🚶 Сделать шаг (${S.chunk + 1}/${L.chunks})`;
    btn.onclick = () => startStep();
  }
  
  if (prog) prog.style.width = '0';
}

function showLocationEnd() {
  const L = LOCS[S.loc];
  const modal = document.getElementById('modal');
  const title = document.getElementById('modTitle');
  const content = document.getElementById('modContent');
  
  if (!modal || !title || !content) return;
  
  title.textContent = 'Конец локации';
  
  let buttons = `<button class="btn btn-s" style="width:100%;margin-bottom:6px" onclick="restartLocation();closeMod()">🔄 Начать заново</button>`;
  
  if (L.nextLoc) {
    buttons += `<button class="btn btn-p" style="width:100%;margin-bottom:6px" onclick="goToNextLocation();closeMod()">➡️ Перейти в ${LOCS[L.nextLoc]?.name || L.nextLoc}</button>`;
  }
  
  content.innerHTML = `<p style="margin-bottom:12px">Вы прошли всю локацию!</p>${buttons}`;
  modal.classList.add('active');
}

export function restartLocation() {
  S.chunk = 0;
  saveGame();
  renderMap();
  genEvent();
  renderMovementUI();
}

export function goToNextLocation() {
  const L = LOCS[S.loc];
  if (!L.nextLoc) return;
  
  // Открываем локацию если ещё не открыта
  if (!S.openedLocs.includes(L.nextLoc)) {
    S.openedLocs.push(L.nextLoc);
  }
  
  // Переходим в следующую локацию
  S.loc = L.nextLoc;
  S.chunk = 0;
  saveGame();
  renderMap();
  genEvent();
  renderMovementUI();
}

export function goTo(loc) {
  if (!LOCS[loc]) return;
  S.loc = loc;
  S.chunk = 0;
  saveGame();
  renderMap();
  const eventCard = document.getElementById('eventCard');
  if (LOCS[loc].isCity) {
    if (eventCard) eventCard.innerHTML = `<div class="event-icon res">🏰</div><div class="event-title">Город</div><p style="color:var(--dim);margin-top:8px">Используйте "Город" в меню</p>`;
  } else {
    genEvent();
  }
}

export function startStep() {
  if (stepInterval || S.combat || S.traveling) return;
  
  const L = LOCS[S.loc];
  if (!L || S.chunk >= L.chunks) return;
  
  stepProgress = 0;
  stepInterval = setInterval(() => {
    stepProgress += 50;
    const prog = document.getElementById('stepProg');
    if (prog) prog.style.width = (stepProgress / STEP_TIME * 100) + '%';
    
    if (stepProgress >= STEP_TIME) {
      stopStep();
      S.chunk++;
      saveGame();
      renderMap();
      genEvent();
      renderMovementUI();
    }
  }, 50);
}

export function stopStep() {
  if (stepInterval) {
    clearInterval(stepInterval);
    stepInterval = null;
    stepProgress = 0;
    const prog = document.getElementById('stepProg');
    if (prog) prog.style.width = '0';
  }
}

// Быстрое перемещение между локациями
export function fastTravel(targetLoc) {
  if (S.traveling || S.combat) return;
  
  // Проверяем что локация открыта
  if (!S.openedLocs.includes(targetLoc)) {
    alert('Локация ещё не открыта!');
    return;
  }
  
  // Вычисляем путь и количество чанков
  const path = findPath(S.loc, targetLoc);
  if (!path) {
    alert('Невозможно добраться до этой локации');
    return;
  }
  
  const totalChunks = path.reduce((sum, loc) => sum + LOCS[loc].chunks, 0);
  
  S.traveling = {
    toLoc: targetLoc,
    progress: 0,
    totalChunks: totalChunks,
    path: path
  };
  
  renderMovementUI();
  
  // Показываем прогресс
  const eventCard = document.getElementById('eventCard');
  if (eventCard) {
    eventCard.innerHTML = `<div class="event-icon">🚶</div><div class="event-title">Путешествие в ${LOCS[targetLoc]?.name || targetLoc}</div><div class="gather-prog"><div class="gather-prog-fill" id="travelProg"></div></div><p style="color:var(--dim);margin-top:8px">Чанков: ${totalChunks}</p>`;
  }
  
  // Запускаем перемещение
  travelProgress = 0;
  travelInterval = setInterval(() => {
    travelProgress += 50;
    const prog = document.getElementById('travelProg');
    if (prog) prog.style.width = (travelProgress / (totalChunks * STEP_TIME) * 100) + '%';
    
    if (travelProgress >= totalChunks * STEP_TIME) {
      stopFastTravel();
      S.loc = targetLoc;
      S.chunk = 0;
      S.traveling = null;
      saveGame();
      renderMap();
      genEvent();
      renderMovementUI();
    }
  }, 50);
}

function findPath(fromLoc, toLoc) {
  // Простой поиск пути (BFS)
  if (fromLoc === toLoc) return [];
  
  const queue = [[fromLoc]];
  const visited = new Set([fromLoc]);
  
  while (queue.length > 0) {
    const path = queue.shift();
    const current = path[path.length - 1];
    const L = LOCS[current];
    
    if (!L) continue;
    
    // Проверяем прямую связь
    if (L.nextLoc === toLoc) {
      return [...path, toLoc];
    }
    
    // Проверяем следующую локацию
    if (L.nextLoc && !visited.has(L.nextLoc)) {
      visited.add(L.nextLoc);
      queue.push([...path, L.nextLoc]);
    }
    
    // Проверяем предыдущие локации (обратный поиск)
    for (const [key, loc] of Object.entries(LOCS)) {
      if (loc.nextLoc === current && !visited.has(key)) {
        visited.add(key);
        queue.push([key, ...path]);
      }
    }
  }
  
  return null; // Путь не найден
}

export function stopFastTravel() {
  if (travelInterval) {
    clearInterval(travelInterval);
    travelInterval = null;
    travelProgress = 0;
  }
}

// Экспорт для глобального использования
window.restartLocation = restartLocation;
window.goToNextLocation = goToNextLocation;
