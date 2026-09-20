import { Card, Suit } from '../../types/solitaire';

const SUIT_MAP: Suit[] = ['clubs', 'diamonds', 'hearts', 'spades'];

/**
 * Authentic Microsoft FreeCell random number generator and deal generator.
 * Supports canonical Game #1 to #32000 (and beyond).
 */
export const generateFreeCellDeal = (gameNumber: number): Card[][] => {
  let seed = gameNumber;

  const msRand = (): number => {
    seed = (Math.imul(seed, 214013) + 2531011) & 0x7fffffff;
    return (seed >> 16) & 0x7fff;
  };

  const deck = Array.from({ length: 52 }, (_, i) => i);
  let wLeft = 52;
  const dealtCards: number[] = [];

  for (let i = 0; i < 52; i++) {
    const j = msRand() % wLeft;
    dealtCards.push(deck[j]);
    deck[j] = deck[wLeft - 1];
    wLeft--;
  }

  const cascades: Card[][] = [[], [], [], [], [], [], [], []];
  for (let i = 0; i < 52; i++) {
    const cardNum = dealtCards[i];
    const suit = SUIT_MAP[cardNum % 4];
    const rank = Math.floor(cardNum / 4) + 1;

    cascades[i % 8].push({
      id: `${suit}-${rank}`,
      suit,
      rank,
      faceUp: true,
    });
  }

  return cascades;
};

export const getRandomFreeCellGameNumber = (): number => {
  return Math.floor(Math.random() * 32000) + 1;
};
