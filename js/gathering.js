// Сбор ресурсов

import { RES_ICON, RES_TOOL, ITEMS } from './gameData.js';
import { S, saveGame } from './gameState.js';

let gatherInterval = null;
let gatherProgress = 0;
const GATHER_TIME = 1000;

export function renderGather() {
  const rt = S.event?.rt;
  if (!rt || !RES_ICON[rt]) return;

  const c = document.getElementById('eventCard');
  if (!c) return;

  c.innerHTML = `<div class="event-icon res">${RES_ICON[rt]}</div><div class="event-title">Сбор ${rt === 'wood' ? 'дерева' : rt === 'metal' ? 'руды' : rt === 'cloth' ? 'волокон' : 'кожи'}</div><div class="event-stats"><span style="color:var(--accent)">Осталось: ${S.gatherLeft}</span></div><div class="event-acts"><button class="btn btn-p" id="gatherBtn" onmousedown="startGather()" onmouseup="stopGather()" onmouseleave="stopGather()">Собирать</button></div>`;
}

export function startGather() {
  if (gatherInterval || !S.event?.rt) return;

  gatherProgress = 0;
  gatherInterval = setInterval(() => {
    gatherProgress += 50;
    const prog = document.getElementById('stepProg');
    if (prog) prog.style.width = (gatherProgress / GATHER_TIME * 100) + '%';

    if (gatherProgress >= GATHER_TIME) {
      stopGather();
      S.gatherLeft--;

      const rt = S.event.rt;
      if (S.p.res[rt] !== undefined) {
        S.p.res[rt]++;
      }

      if (S.gatherLeft <= 0) {
        S.event = null;
        if (window.genEvent) window.genEvent();
      } else {
        renderGather();
      }

      if (window.updHdr) window.updHdr();
      saveGame();
    }
  }, 50);
}

export function stopGather() {
  if (gatherInterval) {
    clearInterval(gatherInterval);
    gatherInterval = null;
  }
  gatherProgress = 0;
  const prog = document.getElementById('stepProg');
  if (prog) prog.style.width = '0';
}

// Экспорт для глобального использования
window.startGather = startGather;
window.stopGather = stopGather;