// Управление состоянием игры

import { LOCS } from './gameData.js';

export let S = null;

let saveTimeout = null;

export function initGameState() {
  const saved = localStorage.getItem('mmorpg_save');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      if (data && data.p && typeof data.p.hp === 'number') {
        // Миграция: если есть node, конвертируем в chunk
        if (data.node !== undefined && data.chunk === undefined) {
          data.chunk = data.node;
          delete data.node;
        }
        // Если нет открытых локаций, открываем начальные
        if (!data.openedLocs) {
          data.openedLocs = ['city', 'meadow'];
        }
        // Если нет текущего чанка, ставим 0
        if (data.chunk === undefined) {
          data.chunk = 0;
        }
        S = data;
        return;
      }
    } catch(e) {
      console.error('Ошибка загрузки сохранения:', e);
    }
  }

  // Начальные данные
  S = {
    p: {
      hp: 100, maxHp: 100, gold: 150,
      res: {wood: 8, metal: 5, cloth: 3, leather: 4},
      inv: ['wooden_sword', 'leather_armor', 'pickaxe', 'axe', 'sickle', 'skinning_knife'],
      eq: {mainHand: null, offHand: null, chest: null, boots: null, tool: null},
      bank: {res: {wood: 10, metal: 0, cloth: 0, leather: 0}, items: ['cloth_robe']},
      mast: {
        sword: {lv: 3, xp: 45}, bow: {lv: 1, xp: 0}, staff: {lv: 2, xp: 80},
        cloth: {lv: 1, xp: 20}, leather: {lv: 2, xp: 10}, plate: {lv: 1, xp: 0}
      }
    },
    loc: 'meadow',
    chunk: 0, // Текущий чанк в локации (0-based)
    openedLocs: ['city', 'meadow'], // Открытые локации
    combat: null,
    event: null,
    turn: 'player',
    gatherLeft: 0,
    traveling: null // {toLoc: 'forest', progress: 0, totalChunks: 15} - для быстрого перемещения
  };
}

export function saveGame() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      localStorage.setItem('mmorpg_save', JSON.stringify(S));
    } catch(e) {
      console.error('Ошибка сохранения:', e);
    }
  }, 500);
}