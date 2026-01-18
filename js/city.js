// Город

import { ITEMS, RECIPES, RES_ICON } from './gameData.js';
import { S, saveGame } from './gameState.js';
import { updHdr } from './ui.js';

export function renderCity() {
  cityTab('craft');
}

export function cityTab(t) {
  document.querySelectorAll('.city-tab').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.city-panel').forEach(x => x.classList.remove('active'));

  const tab = document.querySelector(`[onclick="cityTab('${t}')"]`);
  const panel = document.getElementById('city' + t.charAt(0).toUpperCase() + t.slice(1));

  if (tab) tab.classList.add('active');
  if (panel) panel.classList.add('active');

  if (t === 'craft') renderCraft();
  if (t === 'bank') renderBank();
  if (t === 'auc') renderAuc();
}

export function renderCraft() {
  const grid = document.getElementById('craftGrid');
  if (!grid) return;

  let h = '';
  for (const [k, r] of Object.entries(RECIPES)) {
    const it = ITEMS[k];
    if (!it) continue;

    // Проверяем, есть ли все ресурсы
    let canCraft = true;
    let cost = '';
    for (const [res, amt] of Object.entries(r)) {
      cost += `${RES_ICON[res]}${amt} `;
      if ((S.p.res[res] || 0) < amt) canCraft = false;
    }

    h += `<div class="craft-item ${!canCraft ? 'disabled' : ''}">
      <div class="craft-icon">${it.icon}</div>
      <div class="craft-info">
        <div class="craft-name">${it.name}</div>
        <div class="craft-cost">${cost.trim()}</div>
      </div>
      <button class="btn btn-p btn-sm" onclick="craft('${k}')" ${!canCraft ? 'disabled' : ''}>Создать</button>
    </div>`;
  }
  grid.innerHTML = h;
}

export function craft(k) {
  const r = RECIPES[k];
  if (!r) return;

  // Проверяем ресурсы
  for (const [res, amt] of Object.entries(r)) {
    if ((S.p.res[res] || 0) < amt) return;
  }

  // Тратим ресурсы
  for (const [res, amt] of Object.entries(r)) {
    S.p.res[res] -= amt;
  }

  // Добавляем предмет
  S.p.inv.push(k);
  renderCraft();
  if (window.renderInv) window.renderInv();
  updHdr();
  saveGame();
}

// Остальные функции города (сократить для краткости)
export function renderBank() {
  renderBankRes();
  renderBankItems();
}

export function renderBankRes() {
  const grid = document.getElementById('bankResGrid');
  if (!grid) return;

  let h = '';
  for (const [res, amt] of Object.entries(S.p.res)) {
    const icon = RES_ICON[res];
    const bankAmt = S.p.bank.res[res] || 0;

    h += `<div class="bank-item">
      <div class="bank-icon">${icon}</div>
      <div class="bank-info">
        <div class="bank-name">${res === 'wood' ? 'Дерево' : res === 'metal' ? 'Металл' : res === 'cloth' ? 'Ткань' : 'Кожа'}</div>
        <div class="bank-amt">У вас: ${amt} | В банке: ${bankAmt}</div>
      </div>
      <div class="bank-acts">
        <button class="btn btn-s btn-sm" onclick="depositRes('${res}')" ${amt <= 0 ? 'disabled' : ''}>→</button>
        <button class="btn btn-s btn-sm" onclick="withdrawRes('${res}')" ${bankAmt <= 0 ? 'disabled' : ''}>←</button>
      </div>
    </div>`;
  }
  grid.innerHTML = h;
}

export function depositRes(res) {
  if (S.p.res[res] <= 0) return;
  S.p.res[res]--;
  S.p.bank.res[res] = (S.p.bank.res[res] || 0) + 1;
  renderBankRes();
  saveGame();
}

export function withdrawRes(res) {
  const bankAmt = S.p.bank.res[res] || 0;
  if (bankAmt <= 0) return;
  S.p.res[res] = (S.p.res[res] || 0) + 1;
  S.p.bank.res[res]--;
  renderBankRes();
  saveGame();
}

// Остальные функции сокращены для краткости
export function renderBankItems() { /* реализация */ }
export function depositItem(ik) { /* реализация */ }
export function withdrawItem(ik) { /* реализация */ }
export function renderAuc() { /* реализация */ }
export function toggleAucGroup(cat) { /* реализация */ }
export function renderAucSell() { /* реализация */ }
export function showSell(ik) { /* реализация */ }
export function sellAuc(ik, price) { /* реализация */ }
export function buyAuc(ik, price) { /* реализация */ }

// Экспорт для глобального использования
window.cityTab = cityTab;
window.renderCity = renderCity;
window.renderCraft = renderCraft;
window.craft = craft;
window.renderBank = renderBank;
window.depositRes = depositRes;
window.withdrawRes = withdrawRes;