// Инициализация игры

import { initGameState, S } from './gameState.js';
import { renderMap } from './map.js';
import { genEvent } from './events.js';
import { updHdr } from './ui.js';

let tg = null;

export function initTelegram() {
  if (window.Telegram?.WebApp) {
    tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#23272f');
    tg.setBackgroundColor('#1a1d23');
  }
  return tg;
}

export function updatePlayerName() {
  if (tg?.initDataUnsafe?.user) {
    const user = tg.initDataUnsafe.user;
    const nameEl = document.getElementById('hdrName');
    const avatarEl = document.getElementById('avatar');
    if (nameEl) nameEl.textContent = user.first_name || 'Игрок';
    if (avatarEl) avatarEl.textContent = user.first_name?.[0] || '👤';
  }
}

export function initGame() {
  try {
    initGameState();
    initTelegram();
    updatePlayerName();
    updHdr();
    renderMap();
    genEvent();

    // Убедимся, что экран исследования активен
    document.querySelectorAll('.screen').forEach(x => x.classList.remove('active'));
    const exploreScreen = document.getElementById('sExplore');
    if (exploreScreen) {
      exploreScreen.classList.add('active');
    }
  } catch (error) {
    console.error("Ошибка инициализации игры:", error);
    const modTitle = document.getElementById('modTitle');
    const modContent = document.getElementById('modContent');
    const modal = document.getElementById('modal');

    if (modTitle) modTitle.textContent = 'Ошибка';
    if (modContent) modContent.innerHTML = `<p style="color:var(--bad);">${error.message}</p><button class="btn btn-p" style="width:100%;margin-top:12px" onclick="closeMod()">ОК</button>`;
    if (modal) modal.classList.add('active');
  }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', initGame);