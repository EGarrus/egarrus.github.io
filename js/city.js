// Город

import { ITEMS, RECIPES, RES_ICON } from './gameData.js';
import { S, saveGame } from './gameState.js';
import { updHdr } from './ui.js';

export function renderCity() {
  cityTab('craft');
}

export function cityTab(t) {
  document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
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

export function renderBank() {
  renderBankRes();
  renderBankItems();
}

// Экспорт для глобального использования
window.cityTab = cityTab;
window.renderCity = renderCity;
window.renderCraft = renderCraft;
window.craft = craft;
window.renderBank = renderBank;
window.depositRes = depositRes;
window.withdrawRes = withdrawRes;
window.depositItem = depositItem;
window.withdrawItem = withdrawItem;
window.toggleAucGroup = toggleAucGroup;
window.showSell = showSell;
window.sellAuc = sellAuc;
window.buyAuc = buyAuc;

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
        <div class="bank-name">${
          res === 'wood' ? 'Дерево' :
          res === 'metal' ? 'Металл' :
          res === 'cloth' ? 'Ткань' : 'Кожа'
        }</div>
        <div class="bank-amt">У вас: ${amt} | В банке: ${bankAmt}</div>
      </div>
      <div class="bank-acts">
        <button class="btn btn-s btn-sm" onclick="depositRes('${res}')" ${
          amt <= 0 ? 'disabled' : ''
        }>→</button>
        <button class="btn btn-s btn-sm" onclick="withdrawRes('${res}')" ${
          bankAmt <= 0 ? 'disabled' : ''
        }>←</button>
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

export function renderBankItems() {
  const grid = document.getElementById('bankItemsGrid');
  if (!grid) return;

  let h = '';
  const allItems = [...new Set([...S.p.inv, ...S.p.bank.items])];

  for (const ik of allItems) {
    const it = ITEMS[ik];
    if (!it) continue;

    const invCount = S.p.inv.filter(i => i === ik).length;
    const bankCount = S.p.bank.items.filter(i => i === ik).length;

    h += `<div class="bank-item">
      <div class="bank-icon">${it.icon}</div>
      <div class="bank-info">
        <div class="bank-name">${it.name}</div>
        <div class="bank-amt">У вас: ${invCount} | В банке: ${bankCount}</div>
      </div>
      <div class="bank-acts">
        <button class="btn btn-s btn-sm" onclick="depositItem('${ik}')" ${
          invCount <= 0 ? 'disabled' : ''
        }>→</button>
        <button class="btn btn-s btn-sm" onclick="withdrawItem('${ik}')" ${
          bankCount <= 0 ? 'disabled' : ''
        }>←</button>
      </div>
    </div>`;
  }
  grid.innerHTML = h;
}

export function depositItem(ik) {
  const idx = S.p.inv.indexOf(ik);
  if (idx === -1) return;

  S.p.inv.splice(idx, 1);
  S.p.bank.items.push(ik);
  renderBankItems();
  if (window.renderInv) window.renderInv();
  saveGame();
}

export function withdrawItem(ik) {
  const idx = S.p.bank.items.indexOf(ik);
  if (idx === -1) return;

  S.p.bank.items.splice(idx, 1);
  S.p.inv.push(ik);
  renderBankItems();
  if (window.renderInv) window.renderInv();
  saveGame();
}

export function renderAuc() {
  renderAucItems();
  renderAucSell();
}

export function renderAucItems() {
  const tabsGrid = document.getElementById('aucTabsGrid');
  const itemsGrid = document.getElementById('aucItemsGrid');
  if (!tabsGrid || !itemsGrid) return;

  let h = '';
  const cats = ['all', 'weapon', 'armor', 'tool'];
  for (const cat of cats) {
    h += `<button class="auc-tab" onclick="toggleAucGroup('${cat}')">${
      cat === 'all' ? 'Все' :
      cat === 'weapon' ? 'Оружие' :
      cat === 'armor' ? 'Броня' : 'Инструменты'
    }</button>`;
  }
  tabsGrid.innerHTML = h;

  // Начнем с показа всех товаров
  toggleAucGroup('all');
}

export function toggleAucGroup(cat) {
  document.querySelectorAll('.auc-tab').forEach(x => x.classList.remove('active'));
  const tab = Array.from(document.querySelectorAll('.auc-tab')).find(x =>
    x.textContent === (
      cat === 'all' ? 'Все' :
      cat === 'weapon' ? 'Оружие' :
      cat === 'armor' ? 'Броня' : 'Инструменты'
    )
  );
  if (tab) tab.classList.add('active');

  const items = document.getElementById('aucItemsGrid');
  if (!items) return;

  let h = '';
  const aucItems = [
    {item: 'iron_sword', price: 25},
    {item: 'wooden_bow', price: 15},
    {item: 'cloth_robe', price: 20},
    {item: 'leather_armor', price: 30},
    {item: 'pickaxe', price: 10}
  ];

  for (const ai of aucItems) {
    const it = ITEMS[ai.item];
    if (!it) continue;

    let show = cat === 'all';
    if (!show) {
      if (cat === 'weapon' && (it.slot === 'mainHand' || it.slot === 'offHand')) show = true;
      if (cat === 'armor' && (it.slot === 'chest' || it.slot === 'boots')) show = true;
      if (cat === 'tool' && it.slot === 'tool') show = true;
    }

    if (show) {
      h += `<div class="auc-item">
        <div class="auc-icon">${it.icon}</div>
        <div class="auc-info">
          <div class="auc-name">${it.name}</div>
          <div class="auc-price">💰${ai.price}</div>
        </div>
        <button class="btn btn-p btn-sm" onclick="buyAuc('${ai.item}', ${ai.price})" ${
          S.p.gold < ai.price ? 'disabled' : ''
        }>Купить</button>
      </div>`;
    }
  }
  items.innerHTML = h;
}

export function renderAucSell() {
  const grid = document.getElementById('aucSellGrid');
  if (!grid) return;

  let h = '';
  for (const ik of S.p.inv) {
    const it = ITEMS[ik];
    if (!it) continue;

    h += `<div class="auc-sell-item">
      <div class="auc-icon">${it.icon}</div>
      <div class="auc-info">
        <div class="auc-name">${it.name}</div>
        <div class="auc-price">💰${Math.floor(Math.random() * 10) + 5}</div>
      </div>
      <button class="btn btn-s btn-sm" onclick="showSell('${ik}')">Продать</button>
    </div>`;
  }
  grid.innerHTML = h;
}

export function showSell(ik) {
  const modTitle = document.getElementById('modTitle');
  const modContent = document.getElementById('modContent');
  const modal = document.getElementById('modal');

  const it = ITEMS[ik];
  const price = Math.floor(Math.random() * 10) + 5;

  if (modTitle) modTitle.textContent = 'Продажа';
  if (modContent) modContent.innerHTML = `
    <p>Продать ${it.icon} ${it.name} за 💰${price}?</p>
    <button class="btn btn-p" onclick="sellAuc('${ik}', ${price})">Да</button>
    <button class="btn btn-s" onclick="closeMod()">Нет</button>
  `;
  if (modal) modal.classList.add('active');
}

export function sellAuc(ik, price) {
  const idx = S.p.inv.indexOf(ik);
  if (idx === -1) return;

  S.p.inv.splice(idx, 1);
  S.p.gold += price;
  renderAucSell();
  if (window.renderInv) window.renderInv();
  updHdr();
  if (window.closeMod) window.closeMod();
  saveGame();
}

export function buyAuc(ik, price) {
  if (S.p.gold < price) return;

  S.p.gold -= price;
  S.p.inv.push(ik);
  toggleAucGroup(
    document.querySelector('.auc-tab.active')?.textContent === 'Все' ? 'all' :
    document.querySelector('.auc-tab.active')?.textContent === 'Оружие' ? 'weapon' :
    document.querySelector('.auc-tab.active')?.textContent === 'Броня' ? 'armor' : 'tool'
  );
  if (window.renderInv) window.renderInv();
  updHdr();
  saveGame();
}

// Экспорт для глобального использования
window.cityTab = cityTab;
window.renderCity = renderCity;
window.renderCraft = renderCraft;
window.craft = craft;
window.renderBank = renderBank;
window.depositRes = depositRes;
window.withdrawRes = withdrawRes;
window.depositItem = depositItem;
window.withdrawItem = withdrawItem;
window.toggleAucGroup = toggleAucGroup;
window.showSell = showSell;
window.sellAuc = sellAuc;
window.buyAuc = buyAuc;