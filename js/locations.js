// Список локаций и быстрое перемещение

import { LOCS } from './gameData.js';
import { S } from './gameState.js';
import { fastTravel } from './movement.js';

export function renderLocList() {
  const list = document.getElementById('locList');
  if (!list) return;
  
  let h = '';
  Object.entries(LOCS).forEach(([key, L]) => {
    const isOpen = S.openedLocs.includes(key);
    const isCurrent = S.loc === key;
    
    if (!isOpen && !isCurrent) return; // Не показываем закрытые локации
    
    h += `<div class="loc-item${isCurrent ? ' current' : ''}" onclick="${isOpen ? `fastTravel('${key}')` : ''}">
      <div style="font-size:24px">${L.icon}</div>
      <div style="flex:1">
        <div style="font-weight:600">${L.name}</div>
        <div style="font-size:11px;color:var(--dim)">${L.isCity ? 'Город' : `Ур.${L.tier} • ${L.chunks} чанков`}</div>
      </div>
      ${isCurrent ? '<div style="color:var(--ok)">📍</div>' : isOpen ? '<div style="color:var(--accent)">➡️</div>' : '<div style="color:var(--muted)">🔒</div>'}
    </div>`;
  });
  
  list.innerHTML = h || '<p style="color:var(--dim);text-align:center;padding:20px">Нет доступных локаций</p>';
}

// Экспорт для глобального использования
window.fastTravel = fastTravel;
