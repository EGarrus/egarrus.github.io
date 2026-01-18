// Локации

import { LOCS } from './gameData.js';
import { S } from './gameState.js';
import { fastTravel } from './movement.js';

export function renderLocList() {
  const list = document.getElementById('locList');
  if (!list) return;

  let h = '';
  for (const [k, L] of Object.entries(LOCS)) {
    const canGo = k === 'city' || S.openedLocs.includes(k);
    const isCurrent = k === S.loc;

    h += `<div class="loc-item ${!canGo ? 'locked' : isCurrent ? 'current' : ''}" onclick="${canGo ? `goTo('${k}')` : ''}">
      <div class="loc-icon">${L.icon}</div>
      <div class="loc-info">
        <div class="loc-name">${L.name}</div>
        <div class="loc-desc">${L.isCity ? 'Город' : `Уровень ${L.tier}`}</div>
      </div>
      ${canGo ? (isCurrent ? '<div class="loc-badge">Текущая</div>' : `<button class="btn btn-s btn-sm" onclick="fastTravel('${k}'); event.stopPropagation()">🚀</button>`) : '<div class="loc-badge locked">🔒</div>'}
    </div>`;
  }
  list.innerHTML = h;
}

// Экспорт для глобального использования
window.renderLocList = renderLocList;