// Система инвентаря

import { ITEMS, RES_ICON, ABILS } from './gameData.js';
import { S, saveGame } from './gameState.js';

export function renderInv() {
  const resBar = document.getElementById('resBar');
  const eqPanel = document.getElementById('eqPanel');
  const invGrid = document.getElementById('invGrid');
  
  if (resBar) {
    resBar.innerHTML = Object.entries(S.p.res).map(([k, v]) => 
      `<div class="res-item">${RES_ICON[k]}${v}</div>`
    ).join('');
  }
  
  const slots = ['mainHand', 'offHand', 'chest', 'boots', 'tool'];
  const icons = {mainHand: '⚔️', offHand: '🛡️', chest: '👕', boots: '👢', tool: '🔧'};
  
  if (eqPanel) {
    eqPanel.innerHTML = slots.map(s => {
      const ik = S.p.eq[s];
      const it = ik ? ITEMS[ik] : null;
      return `<div class="eq-slot${it ? ' filled' : ''}" title="${s}">${it ? it.icon : icons[s]}</div>`;
    }).join('');
  }
  
  let h = '';
  for (let i = 0; i < 20; i++) {
    if (S.p.inv[i]) {
      const it = ITEMS[S.p.inv[i]];
      const eq = Object.values(S.p.eq).includes(S.p.inv[i]);
      h += `<div class="inv-slot${eq ? ' eq' : ''}" onclick="itemMod('${S.p.inv[i]}',${i})">${eq ? '<div class="eq-dot"></div>' : ''}${it?.icon || ''}<div class="name">${it?.name || S.p.inv[i]}</div></div>`;
    } else {
      h += `<div class="inv-slot empty"></div>`;
    }
  }
  
  if (invGrid) invGrid.innerHTML = h;
}

export function itemMod(ik, idx) {
  const it = ITEMS[ik];
  if (!it) return;
  
  const eq = Object.values(S.p.eq).includes(ik);
  const title = document.getElementById('modTitle');
  const content = document.getElementById('modContent');
  const modal = document.getElementById('modal');
  
  if (!title || !content || !modal) return;
  
  title.textContent = it.icon + ' ' + it.name;
  content.innerHTML = `<p style="color:var(--dim);margin-bottom:8px">${it.desc}</p>
${it.ab?.length ? '<div style="font-size:12px;margin-bottom:12px">' + it.ab.map(a => `<div>${ABILS[a]?.icon || ''}${ABILS[a]?.name || a}: ${ABILS[a]?.desc || ''}</div>`).join('') + '</div>' : ''}
<div style="display:flex;gap:6px">
${eq ? `<button class="btn btn-s" style="flex:1" onclick="unequip('${ik}');closeMod()">Снять</button>` : `<button class="btn btn-p" style="flex:1" onclick="equip('${ik}');closeMod()">Надеть</button>`}
</div>`;
  modal.classList.add('active');
}

export function equip(ik) {
  const it = ITEMS[ik];
  if (!it) return;
  if (it.two) S.p.eq.offHand = null;
  S.p.eq[it.slot] = ik;
  renderInv();
  saveGame();
}

export function unequip(ik) {
  const it = ITEMS[ik];
  if (!it) return;
  S.p.eq[it.slot] = null;
  renderInv();
  saveGame();
}

// Экспорт для глобального использования
window.itemMod = itemMod;
window.equip = equip;
window.unequip = unequip;
