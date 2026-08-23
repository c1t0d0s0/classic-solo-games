import { TilePos } from '../../types/shanghai';

/**
 * Standard 144-tile Classic Turtle (Pyramid) Layout
 * Unit scale: Tile width = 2 half-units, Tile height = 2 half-units.
 * Layers: 0 (bottom) to 4 (top). Total exactly 144 tiles.
 */
export const TURTLE_LAYOUT: TilePos[] = [];

// Layer 0: 87 tiles
// Row 0 (y = 0): 12 tiles (x: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24)
for (let x = 2; x <= 24; x += 2) {
  TURTLE_LAYOUT.push({ layer: 0, x, y: 0 });
}

// Row 1 (y = 2): 8 tiles (x: 6, 8, 10, 12, 14, 16, 18, 20)
for (let x = 6; x <= 20; x += 2) {
  TURTLE_LAYOUT.push({ layer: 0, x, y: 2 });
}

// Row 2 (y = 4): 10 tiles (x: 4, 6, 8, 10, 12, 14, 16, 18, 20, 22)
for (let x = 4; x <= 22; x += 2) {
  TURTLE_LAYOUT.push({ layer: 0, x, y: 4 });
}

// Row 3 (y = 6): 12 tiles (x: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24)
for (let x = 2; x <= 24; x += 2) {
  TURTLE_LAYOUT.push({ layer: 0, x, y: 6 });
}

// Left wing tile (x = 0, y = 7)
TURTLE_LAYOUT.push({ layer: 0, x: 0, y: 7 });

// Right wing tiles (x = 26, y = 7), (x = 28, y = 7)
TURTLE_LAYOUT.push({ layer: 0, x: 26, y: 7 });
TURTLE_LAYOUT.push({ layer: 0, x: 28, y: 7 });

// Row 4 (y = 8): 12 tiles (x: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24)
for (let x = 2; x <= 24; x += 2) {
  TURTLE_LAYOUT.push({ layer: 0, x, y: 8 });
}

// Row 5 (y = 10): 10 tiles (x: 4, 6, 8, 10, 12, 14, 16, 18, 20, 22)
for (let x = 4; x <= 22; x += 2) {
  TURTLE_LAYOUT.push({ layer: 0, x, y: 10 });
}

// Row 6 (y = 12): 8 tiles (x: 6, 8, 10, 12, 14, 16, 18, 20)
for (let x = 6; x <= 20; x += 2) {
  TURTLE_LAYOUT.push({ layer: 0, x, y: 12 });
}

// Row 7 (y = 14): 12 tiles (x: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24)
for (let x = 2; x <= 24; x += 2) {
  TURTLE_LAYOUT.push({ layer: 0, x, y: 14 });
}

// Layer 1: 36 tiles (6x6 grid in center, x=8..18, y=4..14 in half-units)
for (let y = 4; y <= 14; y += 2) {
  for (let x = 8; x <= 18; x += 2) {
    TURTLE_LAYOUT.push({ layer: 1, x, y });
  }
}

// Layer 2: 16 tiles (4x4 grid in center, x=10..16, y=6..12)
for (let y = 6; y <= 12; y += 2) {
  for (let x = 10; x <= 16; x += 2) {
    TURTLE_LAYOUT.push({ layer: 2, x, y });
  }
}

// Layer 3: 4 tiles (2x2 grid in center, x=12..14, y=8..10)
for (let y = 8; y <= 10; y += 2) {
  for (let x = 12; x <= 14; x += 2) {
    TURTLE_LAYOUT.push({ layer: 3, x, y });
  }
}

// Layer 4: 1 tile at the top center peak (x=13, y=9)
TURTLE_LAYOUT.push({ layer: 4, x: 13, y: 9 });
