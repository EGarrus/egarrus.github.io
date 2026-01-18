// Система мастерства

import { S } from './gameState.js';

export function renderMast() {
  const list = document.getElementById('mastList');
  if (!list) return;
  
  const icons = {sword: '⚔️', bow: '🏹', staff: '🪄', cloth: '👘', leather: '🦺', plate: '🛡️'};
  
  list.innerHTML = Object.entries(S.p.mast).map(([k, m]) => {
    const need = m.lv * 100;
    const pct = Math.min(100, m.xp / need * 100);
    return `<div class="mast-item">
      <div class="mast-icon">${icons[k] || '📊'}</div>
      <div class="mast-info">
        <div class="mast-head">
          <span>${k}</span>
          <span class="mast-lv">Ур.${m.lv}</span>
        </div>
        <div class="mast-bar">
          <div class="mast-bar-fill" style="width:${pct}%"></div>
        </div>
      </div>
    </div>`;
  }).join('');
}
