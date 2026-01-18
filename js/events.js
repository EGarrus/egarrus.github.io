// Генерация событий в чанках

import { LOCS, ENEMIES, PLAYERS } from './gameData.js';
import { RES_ICON, RES_TOOL, ITEMS } from './gameData.js';
import { S } from './gameState.js';
import { renderGather } from './gathering.js';

export function genEvent() {
  const L = LOCS[S.loc];
  if (!L || L.isCity || S.traveling) return; // Не генерируем события при быстром перемещении
  
  const r = Math.random();
  const c = document.getElementById('eventCard');
  if (!c) return;
  
  S.event = null;
  
  if (r < 0.3 && L.enemies?.length) {
    const ek = L.enemies[Math.floor(Math.random() * L.enemies.length)];
    const e = ENEMIES[ek];
    if (e) {
      S.event = {type: 'enemy', key: ek, data: e};
      c.innerHTML = `<div class="event-icon enemy">${e.icon}</div><div class="event-title">${e.name}</div><div class="event-stats"><span style="color:var(--hp)">❤️${e.hp}</span><span style="color:var(--bad)">⚔️${e.dmg}</span></div><div class="event-acts"><button class="btn btn-p" onclick="startCombat()">⚔️ Бой</button><button class="btn btn-s" onclick="genEvent()">Убежать</button></div>`;
    }
  } else if (r < 0.55 && L.res?.length) {
    const rt = L.res[Math.floor(Math.random() * L.res.length)];
    S.event = {type: 'res', rt, left: 4};
    S.gatherLeft = 4;
    renderGather();
  } else if (r < 0.7 && L.pvp !== 'safe') {
    const pl = PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
    if (pl) {
      S.event = {type: 'player', data: pl};
      let btns = `<button class="btn btn-s btn-sm" onclick="wave()">👋</button>`;
      btns += L.pvp === 'open' ? `<button class="btn btn-d btn-sm" onclick="attackPlayer()">⚔️</button>` : `<button class="btn btn-s btn-sm" onclick="duel()">Дуэль</button>`;
      c.innerHTML = `<div class="event-icon player">👤</div><div class="event-title">${pl.name}</div><div class="event-acts">${btns}</div>`;
    }
  } else {
    c.innerHTML = `<div class="event-icon">🌿</div><div class="event-title">Пусто</div>`;
  }
}

export function wave() {
  const c = document.getElementById('eventCard');
  if (c) c.innerHTML += '<p style="color:var(--dim);margin-top:8px">👋</p>';
}

export function duel() {
  const c = document.getElementById('eventCard');
  if (!c) return;
  c.innerHTML = `<p style="color:var(--dim)">Ожидание...</p>`;
  setTimeout(() => {
    if (Math.random() > 0.5) {
      // Динамический импорт для избежания циклических зависимостей
      import('./combat.js').then(m => m.attackPlayer());
    } else {
      if (c) c.innerHTML = `<p style="color:var(--bad)">Отказ</p>`;
    }
  }, 1000);
}

// Экспорт для глобального использования
window.genEvent = genEvent;
window.wave = wave;
window.duel = duel;
