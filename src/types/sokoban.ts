export type SokobanDirection = 'up' | 'down' | 'left' | 'right';

export interface SokobanBox {
  id: number;
  x: number;
  y: number;
}

export interface SokobanPlayer {
  x: number;
  y: number;
  dir: SokobanDirection;
  face: string;
}

export interface SokobanSnapshot {
  player: SokobanPlayer;
  boxes: SokobanBox[];
  movesCount: number;
  pushesCount: number;
}

export interface SokobanState {
  stageIndex: number; // 0 to 24
  rows: number;
  cols: number;
  grid: number[][]; // 0: floor, 1: wall, 2: goal
  player: SokobanPlayer;
  boxes: SokobanBox[];
  movesCount: number;
  pushesCount: number;
  timeSeconds: number;
  isPlaying: boolean;
  isWon: boolean;
  history: SokobanSnapshot[];
}
