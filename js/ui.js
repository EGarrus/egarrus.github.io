// UI функции

import { S, saveGame } from './gameState.js';
import { renderInv } from './inventory.js';
import { renderLocList } from './locations.js';
import { renderCity } from './city.js';
import { renderMast } from './mastery.js';

export function updHdr() {
  const hpEl = document.getElementById('hdrHp');
  const goldEl = document.getElementById('hdrGold');
  if (hpEl) hpEl.style.width = (S.p.hp / S.p.maxHp * 100) + '%';
  if (goldEl) goldEl.textContent = S.p.gold;
  saveGame();
}

export function nav(s, btn) {
  document.querySelectorAll('.screen').forEach(x => x.classList.remove('active'));
  const screen = document.getElementById('s' + s);
  if (screen) screen.classList.add('active');
  
  document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
  if (btn) btn.classList.add('active');
  
  if (s === 'Inv') renderInv();
  if (s === 'Map') renderLocList();
  if (s === 'City') renderCity();
  if (s === 'Mast') renderMast();
}

export function closeMod() {
  const modal = document.getElementById('modal');
  if (modal) modal.classList.remove('active');
}

// Экспорт для глобального использования
window.closeMod = closeMod;
window.nav = nav;
