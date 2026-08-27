import { ShanghaiLayoutId, TilePos } from '../../types/shanghai';
import { TranslationKey } from '../../i18n/translations';

/**
 * Standard 144-tile Classic Turtle (Pyramid) Layout
 */
export const TURTLE_LAYOUT: TilePos[] = [];

// Layer 0: 87 tiles
for (let x = 2; x <= 24; x += 2) TURTLE_LAYOUT.push({ layer: 0, x, y: 0 });
for (let x = 6; x <= 20; x += 2) TURTLE_LAYOUT.push({ layer: 0, x, y: 2 });
for (let x = 4; x <= 22; x += 2) TURTLE_LAYOUT.push({ layer: 0, x, y: 4 });
for (let x = 2; x <= 24; x += 2) TURTLE_LAYOUT.push({ layer: 0, x, y: 6 });
TURTLE_LAYOUT.push({ layer: 0, x: 0, y: 7 });
TURTLE_LAYOUT.push({ layer: 0, x: 26, y: 7 });
TURTLE_LAYOUT.push({ layer: 0, x: 28, y: 7 });
for (let x = 2; x <= 24; x += 2) TURTLE_LAYOUT.push({ layer: 0, x, y: 8 });
for (let x = 4; x <= 22; x += 2) TURTLE_LAYOUT.push({ layer: 0, x, y: 10 });
for (let x = 6; x <= 20; x += 2) TURTLE_LAYOUT.push({ layer: 0, x, y: 12 });
for (let x = 2; x <= 24; x += 2) TURTLE_LAYOUT.push({ layer: 0, x, y: 14 });

// Layer 1: 36 tiles
for (let y = 4; y <= 14; y += 2) {
  for (let x = 8; x <= 18; x += 2) TURTLE_LAYOUT.push({ layer: 1, x, y });
}

// Layer 2: 16 tiles
for (let y = 6; y <= 12; y += 2) {
  for (let x = 10; x <= 16; x += 2) TURTLE_LAYOUT.push({ layer: 2, x, y });
}

// Layer 3: 4 tiles
for (let y = 8; y <= 10; y += 2) {
  for (let x = 12; x <= 14; x += 2) TURTLE_LAYOUT.push({ layer: 3, x, y });
}

// Layer 4: 1 tile
TURTLE_LAYOUT.push({ layer: 4, x: 13, y: 9 });


/**
 * 144-tile Fortress (城塞 / 4 Corner Bastions & Castle Keep) Layout
 */
export const FORTRESS_LAYOUT: TilePos[] = [];

// Layer 0: 84 tiles
const fCorners = [
  { xs: [2, 4, 6], ys: [0, 2, 4] },
  { xs: [20, 22, 24], ys: [0, 2, 4] },
  { xs: [2, 4, 6], ys: [10, 12, 14] },
  { xs: [20, 22, 24], ys: [10, 12, 14] },
];
fCorners.forEach((c) => {
  c.ys.forEach((y) => {
    c.xs.forEach((x) => FORTRESS_LAYOUT.push({ layer: 0, x, y }));
  });
});
for (let x = 8; x <= 18; x += 2) {
  FORTRESS_LAYOUT.push({ layer: 0, x, y: 0 });
  FORTRESS_LAYOUT.push({ layer: 0, x, y: 2 });
  FORTRESS_LAYOUT.push({ layer: 0, x, y: 12 });
  FORTRESS_LAYOUT.push({ layer: 0, x, y: 14 });
}
for (let y = 6; y <= 8; y += 2) {
  FORTRESS_LAYOUT.push({ layer: 0, x: 2, y });
  FORTRESS_LAYOUT.push({ layer: 0, x: 4, y });
  FORTRESS_LAYOUT.push({ layer: 0, x: 22, y });
  FORTRESS_LAYOUT.push({ layer: 0, x: 24, y });
}
for (let y = 6; y <= 8; y += 2) {
  for (let x = 8; x <= 18; x += 2) {
    FORTRESS_LAYOUT.push({ layer: 0, x, y });
  }
}
FORTRESS_LAYOUT.push({ layer: 0, x: 0, y: 6 });
FORTRESS_LAYOUT.push({ layer: 0, x: 0, y: 8 });
FORTRESS_LAYOUT.push({ layer: 0, x: 26, y: 6 });
FORTRESS_LAYOUT.push({ layer: 0, x: 26, y: 8 });

// Layer 1: 38 tiles
const fCornerTowersL1 = [
  { xs: [2, 4], ys: [0, 2] },
  { xs: [22, 24], ys: [0, 2] },
  { xs: [2, 4], ys: [12, 14] },
  { xs: [22, 24], ys: [12, 14] },
];
fCornerTowersL1.forEach((c) => {
  c.ys.forEach((y) => {
    c.xs.forEach((x) => FORTRESS_LAYOUT.push({ layer: 1, x, y }));
  });
});
for (let x = 10; x <= 16; x += 2) {
  FORTRESS_LAYOUT.push({ layer: 1, x, y: 1 });
  FORTRESS_LAYOUT.push({ layer: 1, x, y: 13 });
}
FORTRESS_LAYOUT.push({ layer: 1, x: 3, y: 6 });
FORTRESS_LAYOUT.push({ layer: 1, x: 3, y: 8 });
FORTRESS_LAYOUT.push({ layer: 1, x: 23, y: 6 });
FORTRESS_LAYOUT.push({ layer: 1, x: 23, y: 8 });
for (let x = 11; x <= 15; x += 2) {
  FORTRESS_LAYOUT.push({ layer: 1, x, y: 6 });
  FORTRESS_LAYOUT.push({ layer: 1, x, y: 8 });
}
FORTRESS_LAYOUT.push({ layer: 1, x: 0, y: 7 });
FORTRESS_LAYOUT.push({ layer: 1, x: 26, y: 7 });
FORTRESS_LAYOUT.push({ layer: 1, x: 13, y: 3 });
FORTRESS_LAYOUT.push({ layer: 1, x: 13, y: 11 });

// Layer 2: 16 tiles
FORTRESS_LAYOUT.push({ layer: 2, x: 3, y: 1 });
FORTRESS_LAYOUT.push({ layer: 2, x: 23, y: 1 });
FORTRESS_LAYOUT.push({ layer: 2, x: 3, y: 13 });
FORTRESS_LAYOUT.push({ layer: 2, x: 23, y: 13 });
FORTRESS_LAYOUT.push({ layer: 2, x: 12, y: 1 });
FORTRESS_LAYOUT.push({ layer: 2, x: 14, y: 1 });
FORTRESS_LAYOUT.push({ layer: 2, x: 12, y: 13 });
FORTRESS_LAYOUT.push({ layer: 2, x: 14, y: 13 });
FORTRESS_LAYOUT.push({ layer: 2, x: 3, y: 7 });
FORTRESS_LAYOUT.push({ layer: 2, x: 23, y: 7 });
FORTRESS_LAYOUT.push({ layer: 2, x: 12, y: 6 });
FORTRESS_LAYOUT.push({ layer: 2, x: 14, y: 6 });
FORTRESS_LAYOUT.push({ layer: 2, x: 12, y: 8 });
FORTRESS_LAYOUT.push({ layer: 2, x: 14, y: 8 });
FORTRESS_LAYOUT.push({ layer: 2, x: 13, y: 3 });
FORTRESS_LAYOUT.push({ layer: 2, x: 13, y: 11 });

// Layer 3: 5 tiles
FORTRESS_LAYOUT.push({ layer: 3, x: 3, y: 1 });
FORTRESS_LAYOUT.push({ layer: 3, x: 23, y: 1 });
FORTRESS_LAYOUT.push({ layer: 3, x: 3, y: 13 });
FORTRESS_LAYOUT.push({ layer: 3, x: 23, y: 13 });
FORTRESS_LAYOUT.push({ layer: 3, x: 13, y: 7 });

// Layer 4: 1 tile
FORTRESS_LAYOUT.push({ layer: 4, x: 13, y: 7 });


/**
 * 144-tile Canyon (キャニオン / 双峰 - Twin Peaks & Mountain Bridge) Layout
 */
export const CANYON_LAYOUT: TilePos[] = [];

// Layer 0: 84 tiles
for (let y = 2; y <= 12; y += 2) {
  for (let x = 2; x <= 10; x += 2) {
    CANYON_LAYOUT.push({ layer: 0, x, y });
  }
}
for (let x = 4; x <= 8; x += 2) {
  CANYON_LAYOUT.push({ layer: 0, x, y: 0 });
  CANYON_LAYOUT.push({ layer: 0, x, y: 14 });
}
CANYON_LAYOUT.push({ layer: 0, x: 0, y: 7 });

for (let y = 2; y <= 12; y += 2) {
  for (let x = 16; x <= 24; x += 2) {
    CANYON_LAYOUT.push({ layer: 0, x, y });
  }
}
for (let x = 18; x <= 22; x += 2) {
  CANYON_LAYOUT.push({ layer: 0, x, y: 0 });
  CANYON_LAYOUT.push({ layer: 0, x, y: 14 });
}
CANYON_LAYOUT.push({ layer: 0, x: 26, y: 7 });

for (let y = 4; y <= 10; y += 2) {
  CANYON_LAYOUT.push({ layer: 0, x: 12, y });
  CANYON_LAYOUT.push({ layer: 0, x: 14, y });
}
CANYON_LAYOUT.push({ layer: 0, x: 13, y: 1 });
CANYON_LAYOUT.push({ layer: 0, x: 13, y: 13 });

// Layer 1: 38 tiles
for (let y = 4; y <= 10; y += 2) {
  for (let x = 4; x <= 8; x += 2) {
    CANYON_LAYOUT.push({ layer: 1, x, y });
  }
}
CANYON_LAYOUT.push({ layer: 1, x: 6, y: 2 });
CANYON_LAYOUT.push({ layer: 1, x: 6, y: 12 });
CANYON_LAYOUT.push({ layer: 1, x: 2, y: 7 });
CANYON_LAYOUT.push({ layer: 1, x: 10, y: 7 });

for (let y = 4; y <= 10; y += 2) {
  for (let x = 18; x <= 22; x += 2) {
    CANYON_LAYOUT.push({ layer: 1, x, y });
  }
}
CANYON_LAYOUT.push({ layer: 1, x: 20, y: 2 });
CANYON_LAYOUT.push({ layer: 1, x: 20, y: 12 });
CANYON_LAYOUT.push({ layer: 1, x: 16, y: 7 });
CANYON_LAYOUT.push({ layer: 1, x: 24, y: 7 });

CANYON_LAYOUT.push({ layer: 1, x: 12, y: 6 });
CANYON_LAYOUT.push({ layer: 1, x: 14, y: 6 });
CANYON_LAYOUT.push({ layer: 1, x: 12, y: 8 });
CANYON_LAYOUT.push({ layer: 1, x: 14, y: 8 });

CANYON_LAYOUT.push({ layer: 1, x: 13, y: 3 });
CANYON_LAYOUT.push({ layer: 1, x: 13, y: 11 });

// Layer 2: 16 tiles
for (let y = 6; y <= 8; y += 2) {
  for (let x = 5; x <= 7; x += 2) {
    CANYON_LAYOUT.push({ layer: 2, x, y });
  }
}
CANYON_LAYOUT.push({ layer: 2, x: 6, y: 4 });
CANYON_LAYOUT.push({ layer: 2, x: 6, y: 10 });

for (let y = 6; y <= 8; y += 2) {
  for (let x = 19; x <= 21; x += 2) {
    CANYON_LAYOUT.push({ layer: 2, x, y });
  }
}
CANYON_LAYOUT.push({ layer: 2, x: 20, y: 4 });
CANYON_LAYOUT.push({ layer: 2, x: 20, y: 10 });

CANYON_LAYOUT.push({ layer: 2, x: 13, y: 6 });
CANYON_LAYOUT.push({ layer: 2, x: 13, y: 8 });
CANYON_LAYOUT.push({ layer: 2, x: 3, y: 7 });
CANYON_LAYOUT.push({ layer: 2, x: 23, y: 7 });

// Layer 3: 4 tiles
CANYON_LAYOUT.push({ layer: 3, x: 6, y: 6 });
CANYON_LAYOUT.push({ layer: 3, x: 6, y: 8 });
CANYON_LAYOUT.push({ layer: 3, x: 20, y: 6 });
CANYON_LAYOUT.push({ layer: 3, x: 20, y: 8 });

// Layer 4: 2 tiles
CANYON_LAYOUT.push({ layer: 4, x: 6, y: 7 });
CANYON_LAYOUT.push({ layer: 4, x: 20, y: 7 });


/**
 * 144-tile Spider (スパイダー / 蜘蛛 - 8-Legged Radiating Creature) Layout
 */
export const SPIDER_LAYOUT: TilePos[] = [];

// Layer 0: 84 tiles
for (const x of [2, 4, 8, 10, 16, 18, 22, 24]) {
  SPIDER_LAYOUT.push({ layer: 0, x, y: 0 });
  SPIDER_LAYOUT.push({ layer: 0, x, y: 2 });
  SPIDER_LAYOUT.push({ layer: 0, x, y: 12 });
  SPIDER_LAYOUT.push({ layer: 0, x, y: 14 });
}
for (let y = 4; y <= 10; y += 2) {
  for (let x = 6; x <= 20; x += 2) {
    SPIDER_LAYOUT.push({ layer: 0, x, y });
  }
}
for (let y = 6; y <= 8; y += 2) {
  SPIDER_LAYOUT.push({ layer: 0, x: 2, y });
  SPIDER_LAYOUT.push({ layer: 0, x: 4, y });
  SPIDER_LAYOUT.push({ layer: 0, x: 22, y });
  SPIDER_LAYOUT.push({ layer: 0, x: 24, y });
}
SPIDER_LAYOUT.push({ layer: 0, x: 0, y: 6 });
SPIDER_LAYOUT.push({ layer: 0, x: 0, y: 8 });
SPIDER_LAYOUT.push({ layer: 0, x: 26, y: 6 });
SPIDER_LAYOUT.push({ layer: 0, x: 26, y: 8 });
for (let x = 12; x <= 14; x += 2) {
  SPIDER_LAYOUT.push({ layer: 0, x, y: 0 });
  SPIDER_LAYOUT.push({ layer: 0, x, y: 2 });
  SPIDER_LAYOUT.push({ layer: 0, x, y: 12 });
  SPIDER_LAYOUT.push({ layer: 0, x, y: 14 });
}

// Layer 1: 36 tiles
for (let y = 4; y <= 10; y += 2) {
  for (let x = 8; x <= 18; x += 2) {
    SPIDER_LAYOUT.push({ layer: 1, x, y });
  }
}
SPIDER_LAYOUT.push({ layer: 1, x: 4, y: 2 });
SPIDER_LAYOUT.push({ layer: 1, x: 22, y: 2 });
SPIDER_LAYOUT.push({ layer: 1, x: 4, y: 12 });
SPIDER_LAYOUT.push({ layer: 1, x: 22, y: 12 });
SPIDER_LAYOUT.push({ layer: 1, x: 2, y: 7 });
SPIDER_LAYOUT.push({ layer: 1, x: 24, y: 7 });
SPIDER_LAYOUT.push({ layer: 1, x: 13, y: 1 });
SPIDER_LAYOUT.push({ layer: 1, x: 13, y: 13 });
SPIDER_LAYOUT.push({ layer: 1, x: 6, y: 7 });
SPIDER_LAYOUT.push({ layer: 1, x: 20, y: 7 });
SPIDER_LAYOUT.push({ layer: 1, x: 13, y: 3 });
SPIDER_LAYOUT.push({ layer: 1, x: 13, y: 11 });

// Layer 2: 16 tiles
for (let y = 6; y <= 8; y += 2) {
  for (let x = 10; x <= 16; x += 2) {
    SPIDER_LAYOUT.push({ layer: 2, x, y });
  }
}
SPIDER_LAYOUT.push({ layer: 2, x: 8, y: 6 });
SPIDER_LAYOUT.push({ layer: 2, x: 8, y: 8 });
SPIDER_LAYOUT.push({ layer: 2, x: 18, y: 6 });
SPIDER_LAYOUT.push({ layer: 2, x: 18, y: 8 });
SPIDER_LAYOUT.push({ layer: 2, x: 12, y: 4 });
SPIDER_LAYOUT.push({ layer: 2, x: 14, y: 4 });
SPIDER_LAYOUT.push({ layer: 2, x: 12, y: 10 });
SPIDER_LAYOUT.push({ layer: 2, x: 14, y: 10 });

// Layer 3: 6 tiles
for (let x = 11; x <= 15; x += 2) {
  SPIDER_LAYOUT.push({ layer: 3, x, y: 6 });
  SPIDER_LAYOUT.push({ layer: 3, x, y: 8 });
}

// Layer 4: 2 tiles
SPIDER_LAYOUT.push({ layer: 4, x: 12, y: 7 });
SPIDER_LAYOUT.push({ layer: 4, x: 14, y: 7 });


/**
 * 144-tile Dragon (ドラゴン / 昇龍 - Serpentine Winding Dragon & Pearl) Layout
 */
export const DRAGON_LAYOUT: TilePos[] = [];

// Layer 0: 84 tiles
for (let y = 10; y <= 14; y += 2) {
  for (let x = 2; x <= 6; x += 2) {
    DRAGON_LAYOUT.push({ layer: 0, x, y });
  }
}
for (let y = 8; y <= 12; y += 2) {
  for (let x = 8; x <= 14; x += 2) {
    DRAGON_LAYOUT.push({ layer: 0, x, y });
  }
}
for (let y = 4; y <= 6; y += 2) {
  for (let x = 8; x <= 18; x += 2) {
    DRAGON_LAYOUT.push({ layer: 0, x, y });
  }
}
for (let y = 0; y <= 2; y += 2) {
  for (let x = 4; x <= 18; x += 2) {
    DRAGON_LAYOUT.push({ layer: 0, x, y });
  }
}
for (let y = 2; y <= 8; y += 2) {
  for (let x = 20; x <= 24; x += 2) {
    DRAGON_LAYOUT.push({ layer: 0, x, y });
  }
}
for (let y = 10; y <= 14; y += 2) {
  DRAGON_LAYOUT.push({ layer: 0, x: 22, y });
  DRAGON_LAYOUT.push({ layer: 0, x: 24, y });
}
DRAGON_LAYOUT.push({ layer: 0, x: 26, y: 5 });
DRAGON_LAYOUT.push({ layer: 0, x: 28, y: 5 });
DRAGON_LAYOUT.push({ layer: 0, x: 26, y: 7 });
DRAGON_LAYOUT.push({ layer: 0, x: 28, y: 7 });

DRAGON_LAYOUT.push({ layer: 0, x: 0, y: 12 });
DRAGON_LAYOUT.push({ layer: 0, x: 0, y: 14 });
DRAGON_LAYOUT.push({ layer: 0, x: 2, y: 2 });
DRAGON_LAYOUT.push({ layer: 0, x: 2, y: 4 });
DRAGON_LAYOUT.push({ layer: 0, x: 20, y: 0 });
DRAGON_LAYOUT.push({ layer: 0, x: 22, y: 0 });
DRAGON_LAYOUT.push({ layer: 0, x: 26, y: 2 });
DRAGON_LAYOUT.push({ layer: 0, x: 16, y: 12 });
DRAGON_LAYOUT.push({ layer: 0, x: 18, y: 12 });
DRAGON_LAYOUT.push({ layer: 0, x: 16, y: 8 });
DRAGON_LAYOUT.push({ layer: 0, x: 18, y: 8 });
DRAGON_LAYOUT.push({ layer: 0, x: 26, y: 9 });
DRAGON_LAYOUT.push({ layer: 0, x: 28, y: 9 });

// Layer 1: 38 tiles
DRAGON_LAYOUT.push({ layer: 1, x: 3, y: 11 });
DRAGON_LAYOUT.push({ layer: 1, x: 5, y: 11 });
DRAGON_LAYOUT.push({ layer: 1, x: 3, y: 13 });
DRAGON_LAYOUT.push({ layer: 1, x: 5, y: 13 });
for (let y = 9; y <= 11; y += 2) {
  for (let x = 9; x <= 13; x += 2) {
    DRAGON_LAYOUT.push({ layer: 1, x, y });
  }
}
for (let x = 9; x <= 17; x += 2) {
  DRAGON_LAYOUT.push({ layer: 1, x, y: 5 });
}
for (let y = 1; y <= 3; y += 2) {
  for (let x = 7; x <= 15; x += 2) {
    DRAGON_LAYOUT.push({ layer: 1, x, y });
  }
}
for (let y = 3; y <= 9; y += 2) {
  DRAGON_LAYOUT.push({ layer: 1, x: 21, y });
  DRAGON_LAYOUT.push({ layer: 1, x: 23, y });
}
DRAGON_LAYOUT.push({ layer: 1, x: 27, y: 6 });
DRAGON_LAYOUT.push({ layer: 1, x: 19, y: 1 });
DRAGON_LAYOUT.push({ layer: 1, x: 25, y: 3 });
DRAGON_LAYOUT.push({ layer: 1, x: 23, y: 13 });
DRAGON_LAYOUT.push({ layer: 1, x: 1, y: 13 });

// Layer 2: 15 tiles
DRAGON_LAYOUT.push({ layer: 2, x: 22, y: 4 });
DRAGON_LAYOUT.push({ layer: 2, x: 22, y: 6 });
DRAGON_LAYOUT.push({ layer: 2, x: 22, y: 8 });
DRAGON_LAYOUT.push({ layer: 2, x: 8, y: 2 });
DRAGON_LAYOUT.push({ layer: 2, x: 10, y: 2 });
DRAGON_LAYOUT.push({ layer: 2, x: 12, y: 2 });
DRAGON_LAYOUT.push({ layer: 2, x: 14, y: 2 });
DRAGON_LAYOUT.push({ layer: 2, x: 11, y: 5 });
DRAGON_LAYOUT.push({ layer: 2, x: 13, y: 5 });
DRAGON_LAYOUT.push({ layer: 2, x: 15, y: 5 });
DRAGON_LAYOUT.push({ layer: 2, x: 10, y: 10 });
DRAGON_LAYOUT.push({ layer: 2, x: 12, y: 10 });
DRAGON_LAYOUT.push({ layer: 2, x: 4, y: 12 });
DRAGON_LAYOUT.push({ layer: 2, x: 27, y: 6 });
DRAGON_LAYOUT.push({ layer: 2, x: 24, y: 2 });

// Layer 3: 5 tiles
DRAGON_LAYOUT.push({ layer: 3, x: 22, y: 6 });
DRAGON_LAYOUT.push({ layer: 3, x: 11, y: 2 });
DRAGON_LAYOUT.push({ layer: 3, x: 13, y: 5 });
DRAGON_LAYOUT.push({ layer: 3, x: 11, y: 10 });
DRAGON_LAYOUT.push({ layer: 3, x: 27, y: 6 });

// Layer 4: 2 tiles
DRAGON_LAYOUT.push({ layer: 4, x: 22, y: 6 });
DRAGON_LAYOUT.push({ layer: 4, x: 27, y: 6 });


/**
 * Map of Layout IDs to TilePos arrays
 */
export const SHANGHAI_LAYOUTS: Record<ShanghaiLayoutId, TilePos[]> = {
  turtle: TURTLE_LAYOUT,
  fortress: FORTRESS_LAYOUT,
  canyon: CANYON_LAYOUT,
  spider: SPIDER_LAYOUT,
  dragon: DRAGON_LAYOUT,
};

/**
 * Layout Metadata for UI Selection
 */
export const LAYOUT_METADATA: {
  id: ShanghaiLayoutId;
  nameKey: TranslationKey;
  descKey: TranslationKey;
  iconSymbol: string;
}[] = [
  { id: 'turtle', nameKey: 'layoutTurtle', descKey: 'layoutTurtleDesc', iconSymbol: '🐢' },
  { id: 'fortress', nameKey: 'layoutFortress', descKey: 'layoutFortressDesc', iconSymbol: '🏰' },
  { id: 'canyon', nameKey: 'layoutCanyon', descKey: 'layoutCanyonDesc', iconSymbol: '⛰️' },
  { id: 'spider', nameKey: 'layoutSpider', descKey: 'layoutSpiderDesc', iconSymbol: '🕷️' },
  { id: 'dragon', nameKey: 'layoutDragon', descKey: 'layoutDragonDesc', iconSymbol: '🐉' },
];

