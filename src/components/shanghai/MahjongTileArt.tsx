import React from 'react';
import { MahjongTileType } from '../../types/shanghai';

interface MahjongTileArtProps {
  type: MahjongTileType;
  value: number;
}

export const MahjongTileArt: React.FC<MahjongTileArtProps> = ({
  type,
  value,
}) => {

  // 1-Tong (Ornate Rosette / Pinwheel Flower Circle)
  if (type === 'tong' && value === 1) {
    return (
      <svg viewBox="0 0 100 120" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Outer Ring */}
        <circle cx="50" cy="60" r="38" fill="#dc2626" />
        <circle cx="50" cy="60" r="32" fill="#047857" />
        <circle cx="50" cy="60" r="26" fill="#f8fafc" />
        {/* Flower Petals */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <circle
            key={i}
            cx={50 + 16 * Math.cos((angle * Math.PI) / 180)}
            cy={60 + 16 * Math.sin((angle * Math.PI) / 180)}
            r="6"
            fill={i % 2 === 0 ? '#dc2626' : '#047857'}
          />
        ))}
        {/* Center Rosette */}
        <circle cx="50" cy="60" r="10" fill="#dc2626" />
        <circle cx="50" cy="60" r="5" fill="#f8fafc" />
      </svg>
    );
  }

  // Dots / Circles (2-Tong to 9-Tong)
  if (type === 'tong') {
    const dotPositions: Record<number, { x: number; y: number; color: string }[]> = {
      2: [
        { x: 50, y: 34, color: '#047857' },
        { x: 50, y: 86, color: '#0284c7' },
      ],
      3: [
        { x: 26, y: 30, color: '#0284c7' },
        { x: 50, y: 60, color: '#dc2626' },
        { x: 74, y: 90, color: '#047857' },
      ],
      4: [
        { x: 30, y: 35, color: '#0284c7' },
        { x: 70, y: 35, color: '#047857' },
        { x: 30, y: 85, color: '#047857' },
        { x: 70, y: 85, color: '#0284c7' },
      ],
      5: [
        { x: 26, y: 32, color: '#0284c7' },
        { x: 74, y: 32, color: '#047857' },
        { x: 50, y: 60, color: '#dc2626' },
        { x: 26, y: 88, color: '#047857' },
        { x: 74, y: 88, color: '#0284c7' },
      ],
      6: [
        { x: 30, y: 30, color: '#047857' },
        { x: 70, y: 30, color: '#047857' },
        { x: 30, y: 60, color: '#dc2626' },
        { x: 70, y: 60, color: '#dc2626' },
        { x: 30, y: 90, color: '#dc2626' },
        { x: 70, y: 90, color: '#dc2626' },
      ],
      7: [
        { x: 26, y: 26, color: '#047857' },
        { x: 50, y: 38, color: '#047857' },
        { x: 74, y: 50, color: '#047857' },
        { x: 30, y: 72, color: '#dc2626' },
        { x: 70, y: 72, color: '#dc2626' },
        { x: 30, y: 96, color: '#dc2626' },
        { x: 70, y: 96, color: '#dc2626' },
      ],
      8: [
        { x: 30, y: 24, color: '#0284c7' },
        { x: 70, y: 24, color: '#0284c7' },
        { x: 30, y: 48, color: '#0284c7' },
        { x: 70, y: 48, color: '#0284c7' },
        { x: 30, y: 72, color: '#0284c7' },
        { x: 70, y: 72, color: '#0284c7' },
        { x: 30, y: 96, color: '#0284c7' },
        { x: 70, y: 96, color: '#0284c7' },
      ],
      9: [
        { x: 26, y: 28, color: '#047857' },
        { x: 50, y: 28, color: '#0284c7' },
        { x: 74, y: 28, color: '#dc2626' },
        { x: 26, y: 60, color: '#047857' },
        { x: 50, y: 60, color: '#0284c7' },
        { x: 74, y: 60, color: '#dc2626' },
        { x: 26, y: 92, color: '#047857' },
        { x: 50, y: 92, color: '#0284c7' },
        { x: 74, y: 92, color: '#dc2626' },
      ],
    };

    const dots = dotPositions[value] || [];
    return (
      <svg viewBox="0 0 100 120" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {dots.map((d, idx) => (
          <g key={idx}>
            <circle cx={d.x} cy={d.y} r="12" fill={d.color} />
            <circle cx={d.x} cy={d.y} r="8" fill="#f8fafc" />
            <circle cx={d.x} cy={d.y} r="4" fill={d.color} />
          </g>
        ))}
      </svg>
    );
  }

  // 1-Tiao (Peacock / Sparrow Bird)
  if (type === 'tiao' && value === 1) {
    return (
      <svg viewBox="0 0 100 120" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Branch / Perch */}
        <path d="M 15 95 Q 50 100 85 95" stroke="#92400e" strokeWidth="6" strokeLinecap="round" fill="none" />
        {/* Tail Feathers */}
        <path d="M 50 75 C 65 50 85 45 80 25 C 70 45 60 55 50 75" fill="#047857" />
        <path d="M 45 75 C 55 45 70 35 65 20 C 55 40 50 55 45 75" fill="#dc2626" />
        {/* Bird Body */}
        <ellipse cx="40" cy="70" rx="18" ry="14" fill="#047857" />
        <ellipse cx="36" cy="68" rx="12" ry="8" fill="#15803d" />
        {/* Head */}
        <circle cx="28" cy="50" r="10" fill="#047857" />
        <circle cx="25" cy="48" r="3" fill="#dc2626" />
        <circle cx="25" cy="48" r="1.2" fill="#ffffff" />
        {/* Beak */}
        <polygon points="20,50 12,53 20,55" fill="#eab308" />
        {/* Crest */}
        <path d="M 28 42 Q 22 30 18 32" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>
    );
  }

  // Bamboo Sticks (2-Tiao to 9-Tiao)
  if (type === 'tiao') {
    const bambooPositions: Record<number, { x: number; y: number; h: number; color: string }[]> = {
      2: [
        { x: 50, y: 32, h: 32, color: '#047857' },
        { x: 50, y: 88, h: 32, color: '#0284c7' },
      ],
      3: [
        { x: 50, y: 30, h: 28, color: '#0284c7' },
        { x: 30, y: 85, h: 28, color: '#047857' },
        { x: 70, y: 85, h: 28, color: '#047857' },
      ],
      4: [
        { x: 30, y: 34, h: 30, color: '#0284c7' },
        { x: 70, y: 34, h: 30, color: '#047857' },
        { x: 30, y: 86, h: 30, color: '#047857' },
        { x: 70, y: 86, h: 30, color: '#0284c7' },
      ],
      5: [
        { x: 26, y: 32, h: 26, color: '#0284c7' },
        { x: 74, y: 32, h: 26, color: '#047857' },
        { x: 50, y: 60, h: 26, color: '#dc2626' },
        { x: 26, y: 88, h: 26, color: '#047857' },
        { x: 74, y: 88, h: 26, color: '#0284c7' },
      ],
      6: [
        { x: 26, y: 34, h: 30, color: '#047857' },
        { x: 50, y: 34, h: 30, color: '#047857' },
        { x: 74, y: 34, h: 30, color: '#047857' },
        { x: 26, y: 86, h: 30, color: '#0284c7' },
        { x: 50, y: 86, h: 30, color: '#0284c7' },
        { x: 74, y: 86, h: 30, color: '#0284c7' },
      ],
      7: [
        { x: 50, y: 22, h: 22, color: '#dc2626' },
        { x: 26, y: 54, h: 22, color: '#047857' },
        { x: 50, y: 54, h: 22, color: '#0284c7' },
        { x: 74, y: 54, h: 22, color: '#047857' },
        { x: 26, y: 92, h: 22, color: '#047857' },
        { x: 50, y: 92, h: 22, color: '#0284c7' },
        { x: 74, y: 92, h: 22, color: '#047857' },
      ],
      8: [
        { x: 28, y: 30, h: 24, color: '#047857' },
        { x: 44, y: 38, h: 24, color: '#047857' },
        { x: 56, y: 38, h: 24, color: '#0284c7' },
        { x: 72, y: 30, h: 24, color: '#0284c7' },
        { x: 28, y: 90, h: 24, color: '#047857' },
        { x: 44, y: 82, h: 24, color: '#047857' },
        { x: 56, y: 82, h: 24, color: '#0284c7' },
        { x: 72, y: 90, h: 24, color: '#0284c7' },
      ],
      9: [
        { x: 26, y: 28, h: 24, color: '#047857' },
        { x: 50, y: 28, h: 24, color: '#0284c7' },
        { x: 74, y: 28, h: 24, color: '#dc2626' },
        { x: 26, y: 60, h: 24, color: '#047857' },
        { x: 50, y: 60, h: 24, color: '#0284c7' },
        { x: 74, y: 60, h: 24, color: '#dc2626' },
        { x: 26, y: 92, h: 24, color: '#047857' },
        { x: 50, y: 92, h: 24, color: '#0284c7' },
        { x: 74, y: 92, h: 24, color: '#dc2626' },
      ],
    };

    const sticks = bambooPositions[value] || [];
    return (
      <svg viewBox="0 0 100 120" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {sticks.map((s, idx) => (
          <g key={idx}>
            {/* Bamboo Stem */}
            <line
              x1={s.x}
              y1={s.y - s.h / 2}
              x2={s.x}
              y2={s.y + s.h / 2}
              stroke={s.color}
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Bamboo Joint Knots */}
            <circle cx={s.x} cy={s.y} r="4" fill="#dc2626" />
            <ellipse cx={s.x} cy={s.y - s.h / 2 + 2} rx="4" ry="2" fill={s.color} />
            <ellipse cx={s.x} cy={s.y + s.h / 2 - 2} rx="4" ry="2" fill={s.color} />
          </g>
        ))}
      </svg>
    );
  }

  // 萬子 (Characters / Wan: 1 to 9)
  if (type === 'wan') {
    const kanjiNums = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const num = kanjiNums[value - 1];
    return (
      <svg viewBox="0 0 100 120" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Top Numeral */}
        <text
          x="50"
          y="48"
          textAnchor="middle"
          fill="#0f172a"
          fontWeight="900"
          fontSize={value === 1 ? '44' : '38'}
          fontFamily="'Kaiti', 'STKaiti', 'KaiTi', 'SimKai', serif, sans-serif"
        >
          {num}
        </text>
        {/* Bottom Character '萬' */}
        <text
          x="50"
          y="98"
          textAnchor="middle"
          fill="#dc2626"
          fontWeight="900"
          fontSize="42"
          fontFamily="'Kaiti', 'STKaiti', 'KaiTi', 'SimKai', serif, sans-serif"
        >
          萬
        </text>
      </svg>
    );
  }

  // 風牌 (Winds)
  if (type === 'wind') {
    const winds = ['東', '南', '西', '北'];
    const char = winds[value - 1];
    return (
      <svg viewBox="0 0 100 120" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <text
          x="50"
          y="74"
          textAnchor="middle"
          fill="#0f172a"
          fontWeight="900"
          fontSize="56"
          fontFamily="'Kaiti', 'STKaiti', 'KaiTi', 'SimKai', serif, sans-serif"
        >
          {char}
        </text>
      </svg>
    );
  }

  // 三元牌 (Dragons: Red, Green, White)
  if (type === 'dragon') {
    if (value === 1) {
      // Red Dragon: '中'
      return (
        <svg viewBox="0 0 100 120" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <text
            x="50"
            y="76"
            textAnchor="middle"
            fill="#dc2626"
            fontWeight="900"
            fontSize="62"
            fontFamily="'Kaiti', 'STKaiti', 'KaiTi', 'SimKai', serif, sans-serif"
          >
            中
          </text>
        </svg>
      );
    }
    if (value === 2) {
      // Green Dragon: '發'
      return (
        <svg viewBox="0 0 100 120" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <text
            x="50"
            y="76"
            textAnchor="middle"
            fill="#047857"
            fontWeight="900"
            fontSize="58"
            fontFamily="'Kaiti', 'STKaiti', 'KaiTi', 'SimKai', serif, sans-serif"
          >
            發
          </text>
        </svg>
      );
    }
    // White Dragon: '白' (Authentic Japanese pure blank pristine face)
    return null;
  }

  return null;
};
