// Игровые данные (константы)

export const LOCS = {
  city: {
    name: 'Город', icon: '🏰', tier: 0, pvp: 'safe', isCity: 1,
    chunks: 1, // Город - 1 чанк
    nextLoc: null, // Нет следующей локации
    enemies: [], res: []
  },
  meadow: {
    name: 'Луга', icon: '🌿', tier: 1, pvp: 'request',
    chunks: 10, // 10 чанков
    nextLoc: 'forest', // Следующая локация
    enemies: ['slime', 'wolf'], res: ['wood', 'cloth']
  },
  forest: {
    name: 'Лес', icon: '🌲', tier: 2, pvp: 'request',
    chunks: 15, // 15 чанков
    nextLoc: 'highlands',
    enemies: ['wolf', 'bear'], res: ['wood', 'leather']
  },
  highlands: {
    name: 'Высокогорье', icon: '⛰️', tier: 3, pvp: 'open',
    chunks: 20, // 20 чанков
    nextLoc: null, // Последняя локация
    enemies: ['golem', 'harpy'], res: ['metal', 'leather']
  }
};

export const ENEMIES = {
  slime: {name: 'Слизень', icon: '🟢', hp: 30, dmg: 5, xp: 10, loot: ['cloth']},
  wolf: {name: 'Волк', icon: '🐺', hp: 50, dmg: 10, xp: 20, loot: ['leather']},
  bear: {name: 'Медведь', icon: '🐻', hp: 80, dmg: 15, xp: 35, loot: ['leather', 'leather']},
  golem: {name: 'Голем', icon: '🗿', hp: 120, dmg: 18, xp: 50, loot: ['metal', 'metal']},
  harpy: {name: 'Гарпия', icon: '🦅', hp: 60, dmg: 20, xp: 45, loot: ['cloth']}
};

export const PLAYERS = [
  {name: 'Рыцарь_42', hp: 80, dmg: 15, loot: ['iron_sword']},
  {name: 'MagicUser', hp: 60, dmg: 20, loot: ['wooden_staff']},
  {name: 'Охотник', hp: 70, dmg: 18, loot: ['wooden_bow']}
];

export const ITEMS = {
  wooden_sword: {name: 'Деревянный меч', icon: '🗡️', slot: 'mainHand', ab: ['slash', 'block'], cat: 'sword', desc: 'Базовое оружие'},
  iron_sword: {name: 'Железный меч', icon: '⚔️', slot: 'mainHand', ab: ['slash', 'parry'], cat: 'sword', desc: 'Улучшенный меч'},
  wooden_bow: {name: 'Лук', icon: '🏹', slot: 'mainHand', ab: ['shoot', 'multishot'], cat: 'bow', two: 1, desc: 'Стреляет издалека'},
  wooden_staff: {name: 'Посох', icon: '🪄', slot: 'mainHand', ab: ['fireball', 'heal'], cat: 'staff', two: 1, desc: 'Магическое оружие'},
  wooden_shield: {name: 'Щит', icon: '🛡️', slot: 'offHand', ab: ['shieldblock'], cat: 'shield', desc: 'Блокирует урон'},
  cloth_robe: {name: 'Роба', icon: '👘', slot: 'chest', ab: ['mana_shield'], cat: 'cloth', desc: 'Магическая броня'},
  leather_armor: {name: 'Кожаная броня', icon: '🦺', slot: 'chest', ab: ['dodge'], cat: 'leather', desc: 'Баланс защиты'},
  plate_armor: {name: 'Латы', icon: '🛡️', slot: 'chest', ab: ['fortify'], cat: 'plate', desc: 'Макс. защита'},
  cloth_boots: {name: 'Тканевые сапоги', icon: '👟', slot: 'boots', ab: ['blink'], cat: 'cloth', desc: 'Телепортация'},
  leather_boots: {name: 'Кожаные сапоги', icon: '🥾', slot: 'boots', ab: ['dash'], cat: 'leather', desc: 'Быстрый рывок'},
  plate_boots: {name: 'Латные сапоги', icon: '🦶', slot: 'boots', ab: ['stomp'], cat: 'plate', desc: 'Оглушающий удар'},
  pickaxe: {name: 'Кирка', icon: '⛏️', slot: 'tool', ab: [], cat: 'tool', desc: 'Для добычи руды'},
  axe: {name: 'Топор', icon: '🪓', slot: 'tool', ab: [], cat: 'tool', desc: 'Для рубки дерева'},
  sickle: {name: 'Серп', icon: '🌾', slot: 'tool', ab: [], cat: 'tool', desc: 'Для сбора волокон'},
  skinning_knife: {name: 'Нож свежевателя', icon: '🔪', slot: 'tool', ab: [], cat: 'tool', desc: 'Для снятия кожи'}
};

export const ABILS = {
  punch: {name: 'Удар', icon: '👊', dmg: 5, desc: 'Без оружия'},
  wait: {name: 'Ждать', icon: '⏳', heal: 5, desc: '+5 HP'},
  slash: {name: 'Рубящий', icon: '⚔️', dmg: 15, desc: '15 урона'},
  block: {name: 'Блок', icon: '🛡️', def: 20, desc: '20 защиты'},
  parry: {name: 'Парирование', icon: '↩️', dmg: 10, def: 10, desc: '10 урона, 10 защиты'},
  shoot: {name: 'Выстрел', icon: '🏹', dmg: 18, desc: '18 урона'},
  multishot: {name: 'Залп', icon: '🎯', dmg: 24, desc: '24 урона'},
  fireball: {name: 'Огнешар', icon: '🔥', dmg: 25, desc: '25 урона'},
  heal: {name: 'Лечение', icon: '💚', heal: 30, desc: '+30 HP'},
  shieldblock: {name: 'Блок щитом', icon: '🛡️', def: 25, desc: '25 защиты'},
  mana_shield: {name: 'Мана-щит', icon: '🔮', def: 25, desc: '25 защиты'},
  dodge: {name: 'Уклонение', icon: '💨', evade: 1, desc: 'Избежать удара'},
  fortify: {name: 'Укрепление', icon: '🏰', def: 30, desc: '30 защиты'},
  blink: {name: 'Телепорт', icon: '✨', dmg: 15, evade: 1, desc: '15 урона + уклон'},
  dash: {name: 'Рывок', icon: '💨', dmg: 12, desc: '12 урона'},
  stomp: {name: 'Топот', icon: '💥', dmg: 20, desc: '20 урона'}
};

export const RECIPES = {
  wooden_sword: {wood: 2, metal: 1}, iron_sword: {metal: 4, wood: 1},
  wooden_bow: {wood: 3}, wooden_staff: {wood: 2, cloth: 1},
  wooden_shield: {wood: 2, leather: 1}, cloth_robe: {cloth: 4},
  leather_armor: {leather: 4}, plate_armor: {metal: 4, leather: 2},
  cloth_boots: {cloth: 2}, leather_boots: {leather: 2},
  plate_boots: {metal: 2, leather: 1}, pickaxe: {wood: 1, metal: 2},
  axe: {wood: 1, metal: 2}, sickle: {wood: 1, metal: 1},
  skinning_knife: {wood: 1, metal: 1}
};

export const RES_ICON = {wood: '🪵', metal: '🧱', cloth: '🧶', leather: '🦴'};
export const RES_TOOL = {wood: 'axe', metal: 'pickaxe', cloth: 'sickle', leather: 'skinning_knife'};
