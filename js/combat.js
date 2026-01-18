// Система боя

import { ABILS, ITEMS, LOCS, RES_ICON } from './gameData.js';
import { S, saveGame } from './gameState.js';
import { updHdr } from './ui.js';
import { goTo } from './movement.js';

export function attackPlayer() {
  if (!S.event?.data) return;
  const pl = S.event.data;
  S.combat = {...pl, hp: pl.hp, maxHp: pl.hp, isPvP: 1};
  startCombatUI();
}

export function startCombat() {
  if (!S.event?.data) return;
  const e = S.event.data;
  S.combat = {...e, hp: e.hp, maxHp: e.hp};
  startCombatUI();
}

function startCombatUI() {
  const eventCard = document.getElementById('eventCard');
  const combatCard = document.getElementById('combatCard');
  const enemyAva = document.getElementById('cEnemyAva');
  const enemyName = document.getElementById('cEnemyName');
  const turnInd = document.getElementById('turnInd');
  const combatLog = document.getElementById('combatLog');

  if (eventCard) eventCard.style.display = 'none';
  if (combatCard) combatCard.style.display = 'block';
  if (enemyAva) enemyAva.textContent = S.combat.icon || '👤';
  if (enemyName) enemyName.textContent = S.combat.name;

  S.turn = 'player';
  updCombat();
  renderAbils();
  if (combatLog) combatLog.innerHTML = '';
  if (turnInd) turnInd.textContent = 'Ваш ход';
}

function updCombat() {
  const c = S.combat;
  if (!c) return;

  const enemyHp = document.getElementById('cEnemyHp');
  const enemyHpTxt = document.getElementById('cEnemyHpTxt');
  const playerHp = document.getElementById('cPlayerHp');
  const playerHpTxt = document.getElementById('cPlayerHpTxt');

  if (enemyHp) enemyHp.style.width = (c.hp / c.maxHp * 100) + '%';
  if (enemyHpTxt) enemyHpTxt.textContent = `${Math.max(0, c.hp)}/${c.maxHp}`;
  if (playerHp) playerHp.style.width = (S.p.hp / S.p.maxHp * 100) + '%';
  if (playerHpTxt) playerHpTxt.textContent = `${S.p.hp}/${S.p.maxHp}`;

  updHdr();
}

function renderAbils() {
  const eq = S.p.eq;
  let abs = [];

  if (eq.mainHand && ITEMS[eq.mainHand]) {
    ITEMS[eq.mainHand].ab.forEach(a => abs.push({key: a, ...ABILS[a]}));
  } else {
    abs.push({key: 'punch', ...ABILS.punch});
  }

  if (eq.offHand && ITEMS[eq.offHand]) {
    ITEMS[eq.offHand].ab.forEach(a => abs.push({key: a, ...ABILS[a]}));
  }
  if (eq.chest && ITEMS[eq.chest]) {
    ITEMS[eq.chest].ab.forEach(a => abs.push({key: a, ...ABILS[a]}));
  }
  if (eq.boots && ITEMS[eq.boots]) {
    ITEMS[eq.boots].ab.forEach(a => abs.push({key: a, ...ABILS[a]}));
  }

  while (abs.length < 4) abs.push({key: 'wait', ...ABILS.wait});
  abs = abs.slice(0, 4);

  const grid = document.getElementById('abilGrid');
  if (!grid) return;

  grid.innerHTML = abs.map(a =>
    `<button class="abil-btn" onclick="useAbil('${a.key}')" ${S.turn !== 'player' ? 'disabled' : ''}>
      <div class="abil-name">${a.icon} ${a.name}</div>
      <div class="abil-desc">${a.desc}</div>
    </button>`
  ).join('');
}

export function useAbil(k) {
  if (S.turn !== 'player' || !S.combat) return;

  const a = ABILS[k];
  const c = S.combat;
  const log = document.getElementById('combatLog');
  const turnInd = document.getElementById('turnInd');

  if (!a || !c) return;

  S.turn = 'wait';
  if (turnInd) turnInd.textContent = '...';
  renderAbils();

  setTimeout(() => {
    if (a.dmg) {
      c.hp -= a.dmg;
      if (log) log.innerHTML += `<div class="log-dmg">→${a.name}: ${a.dmg}</div>`;
    }
    if (a.heal) {
      S.p.hp = Math.min(S.p.maxHp, S.p.hp + a.heal);
      if (log) log.innerHTML += `<div class="log-heal">→${a.name}: +${a.heal}</div>`;
    }

    updCombat();
    saveGame();

    if (c.hp <= 0) {
      endCombat(1);
      return;
    }

    S.turn = 'enemy';
    if (turnInd) turnInd.textContent = 'Ход врага';

    setTimeout(() => {
      const dmg = c.dmg || 10;
      S.p.hp -= dmg;
      if (log) log.innerHTML += `<div class="log-dmg">←${c.name}: ${dmg}</div>`;
      updCombat();

      if (S.p.hp <= 0) {
        S.p.hp = 1;
        endCombat(0);
        return;
      }

      S.turn = 'player';
      if (turnInd) turnInd.textContent = 'Ваш ход';
      renderAbils();
    }, 1000);
  }, 500);
}

function endCombat(won) {
  const eventCard = document.getElementById('eventCard');
  const combatCard = document.getElementById('combatCard');
  const log = document.getElementById('combatLog');

  if (combatCard) combatCard.style.display = 'none';
  if (eventCard) eventCard.style.display = 'block';

  if (won) {
    let loot = '';
    const hasKnife = S.p.inv.includes('skinning_knife') || S.p.eq.tool === 'skinning_knife';

    const c = S.combat;
    if (c.xp) {
      const cat = S.p.eq.mainHand && ITEMS[S.p.eq.mainHand]?.cat || 'sword';
      if (!S.p.mast[cat]) S.p.mast[cat] = {lv: 1, xp: 0};
      S.p.mast[cat].xp += c.xp;
      while (S.p.mast[cat].xp >= S.p.mast[cat].lv * 50) {
        S.p.mast[cat].xp -= S.p.mast[cat].lv * 50;
        S.p.mast[cat].lv++;
      }
    }
    if (c.loot) {
      c.loot.forEach(l => {
        if (ITEMS[l]) {
          S.p.inv.push(l);
          loot += `<div>🎁${ITEMS[l].name}</div>`;
        } else if (l === 'leather') {
          if (hasKnife) {
            S.p.res.leather++;
            loot += `<div>${RES_ICON.leather}+1</div>`;
          } else {
            loot += `<div style="color:var(--muted)">Нужен нож для кожи</div>`;
          }
        } else {
          if (S.p.res[l] !== undefined) {
            S.p.res[l]++;
            loot += `<div>${RES_ICON[l]}+1</div>`;
          }
        }
      });
    }

    const gold = Math.floor(Math.random() * 15) + 5;
    S.p.gold += gold;

    if (eventCard) {
      eventCard.innerHTML = `<div class="event-icon res">🎉</div><div class="event-title">Победа!</div><div style="color:var(--ok);margin:8px">${loot}<div style="color:var(--accent)">💰+${gold}</div></div>`;
    }
  } else {
    const c = S.combat;
    const isPvP = c?.isPvP;
    const L = LOCS[S.loc];

    if (isPvP && L?.pvp === 'open') {
      S.p.eq = {mainHand: null, offHand: null, chest: null, boots: null, tool: null};
      S.p.inv = [];
      S.p.res = {wood: 0, metal: 0, cloth: 0, leather: 0};
      if (eventCard) eventCard.innerHTML = `<div class="event-icon enemy">💀</div><div class="event-title">PvP смерть!</div><p style="color:var(--bad)">Всё потеряно!</p>`;
    } else {
      if (log) log.innerHTML += `<div class="log-dmg">Поражение...</div>`;
    }
    S.p.hp = Math.floor(S.p.maxHp * 0.5);
    goTo('city');
  }

  S.combat = null;
  S.event = null;
  saveGame();
  // Импортируем genEvent динамически для избежания циклических зависимостей
  import('./events.js').then(m => m.genEvent());
}

// Экспорт для глобального использования
window.startCombat = startCombat;
window.attackPlayer = attackPlayer;
window.useAbil = useAbil;