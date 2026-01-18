// Система сбора ресурсов

import { RES_ICON, RES_TOOL, ITEMS } from './gameData.js';
import { S, saveGame } from './gameState.js';

let gatherInterval = null;
let gatherProgress = 0;

export function renderGather() {
  const e = S.event;
  if (!e || e.type !== 'res') return;
  
  const rt = e.rt;
  const tool = RES_TOOL[rt];
  const hasTool = S.p.inv.includes(tool) || S.p.eq.tool === tool;
  const c = document.getElementById('eventCard');
  if (!c) return;
  
  c.innerHTML = `<div class="event-icon res">${RES_ICON[rt]}</div><div class="event-title">${rt} (${e.left}/4)</div>
${hasTool ? `<button class="btn btn-p gather-btn" id="gatherBtn" onmousedown="startGather()" onmouseup="stopGather()" onmouseleave="stopGather()" ontouchstart="startGather()" ontouchend="stopGather()">Удерживайте: ${ITEMS[tool]?.icon || ''}</button><div class="gather-prog"><div class="gather-prog-fill" id="gatherProg"></div></div>` : `<p style="color:var(--bad);margin:8px">Нужен: ${ITEMS[tool]?.icon || ''} ${ITEMS[tool]?.name || tool}</p>`}
${e.left < 4 ? `<p style="color:var(--ok);margin-top:8px">Собрано: ${4 - e.left}</p>` : ''}`;
}

export function startGather() {
  if (gatherInterval || !S.event) return;
  gatherProgress = 0;
  gatherInterval = setInterval(() => {
    gatherProgress += 50;
    const prog = document.getElementById('gatherProg');
    if (prog) prog.style.width = (100 - gatherProgress / 1000 * 100) + '%';
    if (gatherProgress >= 1000) {
      gatherProgress = 0;
      if (S.p.res[S.event.rt] !== undefined) {
        S.p.res[S.event.rt]++;
      }
      S.event.left--;
      if (S.event.left <= 0) {
        stopGather();
        const eventCard = document.getElementById('eventCard');
        if (eventCard) eventCard.innerHTML = `<div class="event-icon res">${RES_ICON[S.event.rt]}</div><div class="event-title">Собрано!</div><p style="color:var(--ok)">+4 ${S.event.rt}</p>`;
        S.event = null;
        saveGame();
      } else {
        renderGather();
      }
    }
  }, 50);
}

export function stopGather() {
  if (gatherInterval) {
    clearInterval(gatherInterval);
    gatherInterval = null;
    gatherProgress = 0;
    const pg = document.getElementById('gatherProg');
    if (pg) pg.style.width = '100%';
  }
}

// Экспорт для глобального использования
window.startGather = startGather;
window.stopGather = stopGather;
