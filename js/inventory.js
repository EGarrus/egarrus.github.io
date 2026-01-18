// Инвентарь

import { ITEMS, RES_ICON, ABILS } from './gameData.js';
import { S, saveGame } from './gameState.js';

export function renderInv() {
  const grid = document.getElementById('invGrid');
  if (!grid) return;

  let h = '';
  const eq = S.p.eq;

  // Экипировка
  h += `<div class="inv-section">
    <div class="inv-title">Экипировка</div>
    <div class="inv-eq">
      <div class="eq-slot">
        <div class="eq-label">Главная рука</div>
        <div class="eq-item" onclick="itemMod('${eq.mainHand || ''}', -1)">
          ${eq.mainHand ? ITEMS[eq.mainHand].icon + ' ' + ITEMS[eq.mainHand].name : 'Пусто'}
        </div>
      </div>
      <div class="eq-slot">
        <div class="eq-label">Вторая рука</div>
        <div class="eq-item" onclick="itemMod('${eq.offHand || ''}', -1)">
          ${eq.offHand ? ITEMS[eq.offHand].icon + ' ' + ITEMS[eq.offHand].name : 'Пусто'}
        </div>
      </div>
      <div class="eq-slot">
        <div class="eq-label">Броня</div>
        <div class="eq-item" onclick="itemMod('${eq.chest || ''}', -1)">
          ${eq.chest ? ITEMS[eq.chest].icon + ' ' + ITEMS[eq.chest].name : 'Пусто'}
        </div>
      </div>
      <div class="eq-slot">
        <div class="eq-label">Обувь</div>
        <div class="eq-item" onclick="itemMod('${eq.boots || ''}', -1)">
          ${eq.boots ? ITEMS[eq.boots].icon + ' ' + ITEMS[eq.boots].name : 'Пусто'}
        </div>
      </div>
      <div class="eq-slot">
        <div class="eq-label">Инструмент</div>
        <div class="eq-item" onclick="itemMod('${eq.tool || ''}', -1)">
          ${eq.tool ? ITEMS[eq.tool].icon + ' ' + ITEMS[eq.tool].name : 'Пусто'}
        </div>
      </div>
    </div>
  </div>`;

  // Инвентарь
  h += `<div class="inv-section">
    <div class="inv-title">Инвентарь</div>
    <div class="inv-items">`;

  for (let i = 0; i < S.p.inv.length; i++) {
    const ik = S.p.inv[i];
    const it = ITEMS[ik];
    if (!it) continue;

    h += `<div class="inv-item" onclick="itemMod('${ik}', ${i})">
      <div class="inv-icon">${it.icon}</div>
      <div class="inv-name">${it.name}</div>
    </div>`;
  }

  h += `</div></div>`;
  grid.innerHTML = h;
}

export function itemMod(ik, idx) {
  if (!ik) return;

  const it = ITEMS[ik];
  if (!it) return;

  const modTitle = document.getElementById('modTitle');
  const modContent = document.getElementById('modContent');
  const modal = document.getElementById('modal');

  if (modTitle) modTitle.textContent = it.name;
  if (modContent) {
    let content = `<div style="text-align:center;margin-bottom:16px">${it.icon} ${it.name}</div>`;
    content += `<div style="color:var(--dim);margin-bottom:16px">${it.desc}</div>`;

    if (it.slot) {
      const isEquipped = S.p.eq[it.slot] === ik;
      content += `<button class="btn ${isEquipped ? 'btn-s' : 'btn-p'}" onclick="${isEquipped ? 'unequip' : 'equip'}('${ik}')">${isEquipped ? 'Снять' : 'Надеть'}</button>`;
    }

    if (idx >= 0) {
      content += `<button class="btn btn-d" onclick="S.p.inv.splice(${idx}, 1); renderInv(); saveGame(); closeMod()">Выбросить</button>`;
    }

    modContent.innerHTML = content;
  }
  if (modal) modal.classList.add('active');
}

export function equip(ik) {
  const it = ITEMS[ik];
  if (!it || !it.slot) return;

  S.p.eq[it.slot] = ik;
  renderInv();
  if (window.updHdr) window.updHdr();
  if (window.closeMod) window.closeMod();
  saveGame();
}

export function unequip(ik) {
  const it = ITEMS[ik];
  if (!it || !it.slot) return;

  S.p.eq[it.slot] = null;
  renderInv();
  if (window.updHdr) window.updHdr();
  if (window.closeMod) window.closeMod();
  saveGame();
}

// Экспорт для глобального использования
window.renderInv = renderInv;
window.itemMod = itemMod;
window.equip = equip;
window.unequip = unequip;