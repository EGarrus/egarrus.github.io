// Рендеринг карты локации

import { LOCS } from './gameData.js';
import { S } from './gameState.js';
import { renderMovementUI } from './movement.js';

export function renderMap() {
  const L = LOCS[S.loc];
  const mv = document.getElementById('mapView');
  if (!mv || !L) return;
  
  const nameEl = document.getElementById('locName');
  const tierEl = document.getElementById('locTier');
  const badgeEl = document.getElementById('locBadge');
  
  if (nameEl) nameEl.textContent = L.name;
  if (tierEl) tierEl.textContent = L.isCity ? 'Город' : 'Ур.' + L.tier;
  
  if (badgeEl) {
    badgeEl.className = 'badge ' + (L.pvp === 'safe' ? 'badge-ok' : L.pvp === 'request' ? 'badge-warn' : 'badge-bad');
    badgeEl.textContent = L.pvp === 'safe' ? 'Безопасно' : L.pvp === 'request' ? 'PvP запрос' : '⚠️ PvP';
  }
  
  // Рендерим прогресс по локации (линейная полоса)
  let h = '';
  
  if (!L.isCity) {
    // Прогресс-бар локации
    const progress = ((S.chunk + 1) / L.chunks * 100);
    h += `<div style="position:absolute;bottom:10px;left:10px;right:10px;height:8px;background:var(--bg);border-radius:4px;overflow:hidden">
      <div style="height:100%;background:var(--accent);width:${progress}%;transition:width 0.3s"></div>
    </div>`;
    
    // Показываем текущий чанк
    h += `<div style="position:absolute;bottom:25px;left:50%;transform:translateX(-50%);font-size:12px;color:var(--dim)">Чанк ${S.chunk + 1}/${L.chunks}</div>`;
  }
  
  // Иконка локации в центре
  h += `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:64px">${L.icon}</div>`;
  
  mv.innerHTML = h;
  renderMovementUI();
}
