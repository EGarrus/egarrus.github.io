// Город: крафт, банк, аукцион

import { ITEMS, RECIPES, RES_ICON } from './gameData.js';
import { S, saveGame } from './gameState.js';
import { updHdr } from './ui.js';

let AUC = [
  {id: 1, item: 'iron_sword', price: 100, seller: 'Торговец'},
  {id: 2, item: 'iron_sword', price: 120, seller: 'Кузнец'},
  {id: 3, item: 'plate_armor', price: 200, seller: 'Кузнец'},
  {id: 4, item: 'leather_boots', price: 50, seller: 'Охотник'},
  {id: 5, item: 'leather_boots', price: 45, seller: 'Скорняк'},
  {id: 6, item: 'wooden_bow', price: 40, seller: 'Лучник'}
];
let aucId = 7, aucFilter = 'all', aucSort = 'price', aucSearch = '', aucExec = false;

export function renderCity() {
  cityTab('craft');
}

export function cityTab(t) {
  const tabs = document.querySelectorAll('#cityTabs .tab');
  tabs.forEach((x, i) => {
    x.classList.toggle('active', (t === 'craft' && i === 0) || (t === 'bank' && i === 1) || (t === 'auc' && i === 2));
  });
  
  if (t === 'craft') renderCraft();
  else if (t === 'bank') renderBank();
  else renderAuc();
}

function renderCraft(cat = 'weapons') {
  const cats = {
    weapons: ['wooden_sword', 'iron_sword', 'wooden_bow', 'wooden_staff', 'wooden_shield'],
    armor: ['cloth_robe', 'leather_armor', 'plate_armor'],
    boots: ['cloth_boots', 'leather_boots', 'plate_boots'],
    tools: ['pickaxe', 'axe', 'sickle', 'skinning_knife']
  };
  
  const content = document.getElementById('cityContent');
  if (!content) return;
  
  let h = `<div class="tabs">
    <button class="tab${cat === 'weapons' ? ' active' : ''}" onclick="renderCraft('weapons')">Оружие</button>
    <button class="tab${cat === 'armor' ? ' active' : ''}" onclick="renderCraft('armor')">Броня</button>
    <button class="tab${cat === 'boots' ? ' active' : ''}" onclick="renderCraft('boots')">Обувь</button>
    <button class="tab${cat === 'tools' ? ' active' : ''}" onclick="renderCraft('tools')">Инстр.</button>
  </div>`;
  
  h += cats[cat].map(k => {
    const it = ITEMS[k];
    const rec = RECIPES[k];
    if (!it || !rec) return '';
    
    const can = Object.entries(rec).every(([r, n]) => S.p.res[r] >= n);
    const reqs = Object.entries(rec).map(([r, n]) => 
      `<span class="craft-req ${S.p.res[r] >= n ? 'ok' : 'no'}">${RES_ICON[r]}${S.p.res[r]}/${n}</span>`
    ).join('');
    
    return `<div class="craft-item">
      <div class="craft-icon">${it.icon}</div>
      <div class="craft-info">
        <div class="craft-name">${it.name}</div>
        <div class="craft-reqs">${reqs}</div>
      </div>
      <button class="btn btn-sm${can ? ' btn-p' : ' btn-s'}" onclick="craft('${k}')"${can ? '' : ' disabled'}>+</button>
    </div>`;
  }).join('');
  
  content.innerHTML = h;
}

function renderBank() {
  const content = document.getElementById('cityContent');
  if (!content) return;
  
  content.innerHTML = `<div class="card">
    <div class="card-title">Банк</div>
    <p style="font-size:11px;color:var(--dim);margin-bottom:8px">Защищено от PvP смерти</p>
    <div class="res-bar" style="margin-bottom:8px">
      ${Object.entries(S.p.bank.res).map(([k, v]) => `<div class="res-item">${RES_ICON[k]}${v}</div>`).join('')}
    </div>
    <div style="display:flex;gap:6px;margin-bottom:10px">
      <button class="btn btn-sm btn-s" onclick="depositRes()">📥Рес.</button>
      <button class="btn btn-sm btn-s" onclick="withdrawRes()">📤Рес.</button>
    </div>
    <div class="card-title">Предметы в банке</div>
    <div class="bank-grid">
      ${S.p.bank.items.length ? S.p.bank.items.map((ik, i) => `<div class="inv-slot" onclick="withdrawItem(${i})">${ITEMS[ik]?.icon || ''}<div class="name">${ITEMS[ik]?.name || ik}</div></div>`).join('') : '<div style="grid-column:span 4;color:var(--muted);font-size:11px;text-align:center;padding:12px">Пусто</div>'}
    </div>
  </div>
  <div class="card">
    <div class="card-title">Положить</div>
    <div class="bank-grid">
      ${S.p.inv.filter(ik => !Object.values(S.p.eq).includes(ik)).length ? S.p.inv.filter(ik => !Object.values(S.p.eq).includes(ik)).map(ik => `<div class="inv-slot" onclick="depositItem(${S.p.inv.indexOf(ik)})">${ITEMS[ik]?.icon || ''}<div class="name">${ITEMS[ik]?.name || ik}</div></div>`).join('') : '<div style="grid-column:span 4;color:var(--muted);font-size:11px;text-align:center;padding:12px">Пусто</div>'}
    </div>
  </div>`;
}

function renderAuc() {
  const content = document.getElementById('cityContent');
  if (!content) return;
  
  const grouped = {};
  AUC.forEach(a => {
    if (!grouped[a.item]) {
      grouped[a.item] = {item: a.item, orders: [], minPrice: a.price};
    }
    grouped[a.item].orders.push(a);
    if (a.price < grouped[a.item].minPrice) {
      grouped[a.item].minPrice = a.price;
    }
  });
  
  let items = Object.values(grouped).filter(g => {
    const it = ITEMS[g.item];
    if (!it) return false;
    
    if (aucFilter !== 'all') {
      if (aucFilter === 'weapon' && it.slot !== 'mainHand' && it.slot !== 'offHand') return false;
      if (aucFilter === 'armor' && it.slot !== 'chest') return false;
      if (aucFilter === 'boots' && it.slot !== 'boots') return false;
      if (aucFilter === 'tool' && it.slot !== 'tool') return false;
    }
    
    if (aucSearch && !it.name.toLowerCase().includes(aucSearch.toLowerCase())) return false;
    return true;
  });
  
  if (aucSort === 'price') {
    items.sort((a, b) => a.minPrice - b.minPrice);
  } else {
    items.sort((a, b) => ITEMS[a.item].name.localeCompare(ITEMS[b.item].name));
  }
  
  content.innerHTML = `<div class="auc-filters">
    <select onchange="aucFilter=this.value;renderAuc()">
      <option value="all">Все</option>
      <option value="weapon"${aucFilter === 'weapon' ? ' selected' : ''}>Оружие</option>
      <option value="armor"${aucFilter === 'armor' ? ' selected' : ''}>Броня</option>
      <option value="boots"${aucFilter === 'boots' ? ' selected' : ''}>Обувь</option>
      <option value="tool"${aucFilter === 'tool' ? ' selected' : ''}>Инстр.</option>
    </select>
    <select onchange="aucSort=this.value;renderAuc()">
      <option value="price">Цена↑</option>
      <option value="name"${aucSort === 'name' ? ' selected' : ''}>Имя</option>
    </select>
    <input type="text" placeholder="Поиск" value="${aucSearch}" oninput="aucSearch=this.value;renderAuc()">
    <label class="toggle"><input type="checkbox" ${aucExec ? 'checked' : ''} onchange="aucExec=this.checked;renderAuc()">Тест</label>
  </div>
  <div class="card">
    <div class="card-title">Купить</div>
    ${items.length ? items.map(g => {
      const it = ITEMS[g.item];
      return `<div class="auc-group" id="aucg_${g.item}">
        <div class="auc-group-head" onclick="toggleAucGroup('${g.item}')">
          <div class="auc-icon">${it.icon}</div>
          <div class="auc-group-info">
            <div class="auc-group-name">${it.name}</div>
            <div class="auc-group-meta">${g.orders.length} лотов</div>
          </div>
          <div class="auc-group-price">от 💰${g.minPrice}</div>
        </div>
        <div class="auc-orders" id="auco_${g.item}">
          ${g.orders.sort((a, b) => a.price - b.price).map(o => 
            `<div class="auc-order">
              <div class="auc-order-info">${o.seller}</div>
              <div class="auc-order-price">💰${o.price}</div>
              ${aucExec ? `<button class="btn btn-sm btn-s" onclick="execOrder(${o.id})">Исполн.</button>` : `<button class="btn btn-sm${S.p.gold >= o.price ? ' btn-p' : ' btn-s'}" onclick="buyAuc(${o.id})"${S.p.gold >= o.price ? '' : ' disabled'}>Купить</button>`}
            </div>`
          ).join('')}
        </div>
      </div>`;
    }).join('') : '<p style="color:var(--muted);font-size:11px;text-align:center;padding:12px">Нет лотов</p>'}
  </div>
  <div class="card">
    <div class="card-title">Продать</div>
    ${S.p.inv.filter(ik => !Object.values(S.p.eq).includes(ik)).length ? S.p.inv.filter(ik => !Object.values(S.p.eq).includes(ik)).map(ik => {
      const it = ITEMS[ik];
      return `<div class="craft-item">
        <div class="craft-icon">${it?.icon || ''}</div>
        <div class="craft-info">
          <div class="craft-name">${it?.name || ik}</div>
        </div>
        <button class="btn btn-sm btn-s" onclick="showSell('${ik}')">Продать</button>
      </div>`;
    }).join('') : '<p style="color:var(--muted);font-size:11px;text-align:center;padding:12px">Нет предметов</p>'}
  </div>`;
}

// Экспорт для глобального использования
window.renderCraft = renderCraft;
window.craft = (k) => {
  const rec = RECIPES[k];
  if (!rec) return;
  
  for (const [r, n] of Object.entries(rec)) {
    if (S.p.res[r] < n) return;
  }
  
  for (const [r, n] of Object.entries(rec)) {
    S.p.res[r] -= n;
  }
  
  S.p.inv.push(k);
  renderCraft();
  saveGame();
};

window.depositRes = () => {
  for (const r in S.p.res) {
    if (S.p.bank.res[r] !== undefined) {
      S.p.bank.res[r] += S.p.res[r];
      S.p.res[r] = 0;
    }
  }
  renderBank();
  saveGame();
};

window.withdrawRes = () => {
  for (const r in S.p.bank.res) {
    if (S.p.res[r] !== undefined) {
      S.p.res[r] += S.p.bank.res[r];
      S.p.bank.res[r] = 0;
    }
  }
  renderBank();
  saveGame();
};

window.depositItem = (i) => {
  if (i < 0 || i >= S.p.inv.length) return;
  const ik = S.p.inv[i];
  if (Object.values(S.p.eq).includes(ik)) return;
  
  S.p.inv.splice(i, 1);
  S.p.bank.items.push(ik);
  renderBank();
  saveGame();
};

window.withdrawItem = (i) => {
  if (i < 0 || i >= S.p.bank.items.length) return;
  const ik = S.p.bank.items[i];
  S.p.bank.items.splice(i, 1);
  S.p.inv.push(ik);
  renderBank();
  saveGame();
};

window.renderAuc = renderAuc;
window.toggleAucGroup = (item) => {
  const orders = document.getElementById('auco_' + item);
  if (orders) orders.classList.toggle('open');
};

window.showSell = (ik) => {
  const title = document.getElementById('modTitle');
  const content = document.getElementById('modContent');
  const modal = document.getElementById('modal');
  const it = ITEMS[ik];
  
  if (!title || !content || !modal || !it) return;
  
  title.textContent = 'Продать ' + it.name;
  content.innerHTML = `<input type="number" id="sellPrice" placeholder="Цена" min="1" value="50" style="width:100%;padding:8px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text);margin-bottom:8px">
    <button class="btn btn-p" style="width:100%" onclick="sellAuc('${ik}')">Выставить</button>`;
  modal.classList.add('active');
};

window.sellAuc = (ik) => {
  const priceEl = document.getElementById('sellPrice');
  if (!priceEl) return;
  
  const price = parseInt(priceEl.value) || 50;
  const idx = S.p.inv.indexOf(ik);
  if (idx === -1) return;
  
  S.p.inv.splice(idx, 1);
  AUC.push({id: aucId++, item: ik, price, seller: 'Вы'});
  import('./ui.js').then(m => m.closeMod());
  renderAuc();
  saveGame();
};

window.buyAuc = (id) => {
  const idx = AUC.findIndex(a => a.id === id);
  if (idx === -1) return;
  
  const a = AUC[idx];
  if (S.p.gold < a.price) return;
  
  S.p.gold -= a.price;
  S.p.inv.push(a.item);
  AUC.splice(idx, 1);
  updHdr();
  renderAuc();
  saveGame();
};

window.execOrder = (id) => {
  const idx = AUC.findIndex(a => a.id === id);
  if (idx === -1) return;
  
  const a = AUC[idx];
  S.p.gold += a.price;
  AUC.splice(idx, 1);
  updHdr();
  renderAuc();
  
  const title = document.getElementById('modTitle');
  const content = document.getElementById('modContent');
  const modal = document.getElementById('modal');
  if (title && content && modal) {
    title.textContent = 'Ордер исполнен';
    content.innerHTML = `<p>Игрок купил ваш ${ITEMS[a.item]?.name || a.item} за 💰${a.price}</p>`;
    modal.classList.add('active');
  }
  saveGame();
};
