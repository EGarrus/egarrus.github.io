// Движение

import { LOCS } from './gameData.js';
import { S, saveGame } from './gameState.js';
import { genEvent } from './events.js';
import { renderMap } from './map.js';

let stepProgress = 0;
let stepInterval = null;
const STEP_TIME = 1000; // 1 секунда на шаг

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
  }
  stepProgress = 0;
  const prog = document.getElementById('stepProg');
  if (prog) prog.style.width = '0';
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

export function restartLocation() {
  S.chunk = 0;
  saveGame();
  renderMap();
  genEvent();
  renderMovementUI();
  if (window.closeMod) window.closeMod();
}

export function goToNextLocation() {
  const L = LOCS[S.loc];
  if (L && L.nextLoc) {
    S.openedLocs.push(L.nextLoc);
    goTo(L.nextLoc);
  }
  if (window.closeMod) window.closeMod();
}

export function fastTravel(targetLoc) {
  if (S.traveling || !S.openedLocs.includes(targetLoc)) return;

  // Подсчитываем общее количество чанков в пути
  const currentLocIndex = S.openedLocs.indexOf(S.loc);
  const targetLocIndex = S.openedLocs.indexOf(targetLoc);

  let totalChunks = 0;
  const start = Math.min(currentLocIndex, targetLocIndex);
  const end = Math.max(currentLocIndex, targetLocIndex);

  for (let i = start; i < end; i++) {
    const loc = S.openedLocs[i];
    if (LOCS[loc]) {
      totalChunks += LOCS[loc].chunks;
    }
  }

  // Показываем окно подтверждения с временем пути
  const modTitle = document.getElementById('modTitle');
  const modContent = document.getElementById('modContent');
  const modal = document.getElementById('modal');

  if (modTitle) modTitle.textContent = 'Быстрое путешествие';
  if (modContent) {
    const timeSeconds = Math.ceil(totalChunks / 5); // Примерное время в секундах
    modContent.innerHTML = `
      <p style="margin-bottom:12px">Перемещение в ${LOCS[targetLoc]?.name || targetLoc}</p>
      <p style="color:var(--accent);margin-bottom:12px">Время пути: ${timeSeconds} сек</p>
      <p style="color:var(--dim);font-size:12px;margin-bottom:16px">Во время путешествия события не происходят</p>
      <button class="btn btn-p" style="width:100%;margin-bottom:8px" onclick="startFastTravel('${targetLoc}', ${totalChunks})">Начать путешествие</button>
      <button class="btn btn-s" style="width:100%" onclick="closeMod()">Отмена</button>
    `;
  }
  if (modal) modal.classList.add('active');
}

export function startFastTravel(targetLoc, totalChunks) {
  if (window.closeMod) window.closeMod();

  S.traveling = {toLoc: targetLoc, progress: 0, totalChunks: totalChunks};
  renderMovementUI();

  // Переходим в экран "мир"
  if (window.nav) window.nav('Explore');

  // Имитируем быстрое перемещение
  const travelInterval = setInterval(() => {
    S.traveling.progress++;
    if (S.traveling.progress >= S.traveling.totalChunks) {
      clearInterval(travelInterval);
      goTo(S.traveling.toLoc);
      S.traveling = null;
      renderMovementUI();
    }
  }, 200); // Каждые 200ms - один чанк
}

export function showLocationEnd() {
  const modTitle = document.getElementById('modTitle');
  const modContent = document.getElementById('modContent');
  const modal = document.getElementById('modal');

  if (modTitle) modTitle.textContent = 'Конец локации';
  if (modContent) {
    const L = LOCS[S.loc];
    let content = `<p style="margin-bottom:12px">Вы прошли ${L.name}!</p>`;

    if (L.nextLoc) {
      content += `<button class="btn btn-p" style="width:100%;margin-bottom:8px" onclick="goToNextLocation()">Продолжить в ${LOCS[L.nextLoc].name}</button>`;
    }
    content += `<button class="btn btn-s" style="width:100%" onclick="restartLocation()">Начать заново</button>`;

    modContent.innerHTML = content;
  }
  if (modal) modal.classList.add('active');
}

// Экспорт для глобального использования
window.restartLocation = restartLocation;
window.goToNextLocation = goToNextLocation;
window.startFastTravel = startFastTravel;
window.fastTravel = fastTravel;