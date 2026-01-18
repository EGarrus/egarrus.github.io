// UI функции

import { S, saveGame } from './gameState.js';

// Импортируем функции после их определения для избежания циклических зависимостей
let renderInv, renderLocList, renderCity, renderMast;

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

  // Используем глобальные функции
  if (s === 'Inv' && window.renderInv) window.renderInv();
  if (s === 'Map' && window.renderLocList) window.renderLocList();
  if (s === 'City' && window.renderCity) window.renderCity();
  if (s === 'Mast' && window.renderMast) window.renderMast();
}

export function closeMod() {
  const modal = document.getElementById('modal');
  if (modal) modal.classList.remove('active');
}

// Экспорт для глобального использования
window.closeMod = closeMod;
window.nav = nav;