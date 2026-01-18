// Мастерство

import { S } from './gameState.js';

export function renderMast() {
  const grid = document.getElementById('mastGrid');
  if (!grid) return;

  let h = '';
  const cats = {
    sword: 'Меч', bow: 'Лук', staff: 'Посох',
    cloth: 'Ткань', leather: 'Кожа', plate: 'Латы'
  };

  for (const [k, name] of Object.entries(cats)) {
    const m = S.p.mast[k] || {lv: 1, xp: 0};
    const nextXp = m.lv * 50;

    h += `<div class="mast-item">
      <div class="mast-icon">${k === 'sword' ? '⚔️' : k === 'bow' ? '🏹' : k === 'staff' ? '🪄' : k === 'cloth' ? '👘' : k === 'leather' ? '🦺' : '🛡️'}</div>
      <div class="mast-info">
        <div class="mast-name">${name}</div>
        <div class="mast-lv">Уровень ${m.lv}</div>
      </div>
      <div class="mast-xp">
        <div class="xp-bar">
          <div class="xp-fill" style="width:${(m.xp / nextXp * 100)}%"></div>
        </div>
        <div class="xp-text">${m.xp}/${nextXp}</div>
      </div>
    </div>`;
  }
  grid.innerHTML = h;
}

// Экспорт для глобального использования
window.renderMast = renderMast;