import { useMemo } from 'react';
import type { ForestTree } from '../types';

const GROUND_Y = 88;
const VIEW_WIDTH = 400;

const SPECIES_COLORS = {
  pine: { trunk: '#5c4033', foliage: '#166534' },
  oak: { trunk: '#6b4423', foliage: '#15803d' },
  birch: { trunk: '#d4d4d8', foliage: '#22c55e' },
  maple: { trunk: '#78350f', foliage: '#ea580c' },
} as const;

interface FocusForestProps {
  trees: ForestTree[];
  currentGrowth: number;
  isGrowing: boolean;
  phase: 'work' | 'break' | 'longBreak' | 'idle';
}

interface ForestTreeShapeProps {
  species: ForestTree['species'];
  growth: number;
  x: number;
  wilting?: boolean;
}

function renderForestTree({ species, growth, x, wilting = false }: ForestTreeShapeProps) {
  const scale = 0.4 + (growth / 100) * 0.6;
  const colors = SPECIES_COLORS[species];
  const fade = wilting ? 0.45 : 1;

  return (
    <g transform={`translate(${x}, ${GROUND_Y})`} opacity={fade}>
      <g transform={`scale(${scale})`}>
        <rect x={-2.5} y={-10} width={5} height={10} fill={colors.trunk} rx={1} />
        {species === 'pine' && (
          <path d="M0 -42 L-14 -10 L14 -10 Z" fill={colors.foliage} />
        )}
        {species === 'oak' && (
          <circle cx={0} cy={-24} r={14} fill={colors.foliage} />
        )}
        {species === 'birch' && (
          <ellipse cx={0} cy={-26} rx={11} ry={14} fill={colors.foliage} />
        )}
        {species === 'maple' && (
          <circle cx={0} cy={-24} r={13} fill={colors.foliage} />
        )}
      </g>
    </g>
  );
}

function layoutTreePositions(count: number, includeSapling: boolean): number[] {
  const total = count + (includeSapling ? 1 : 0);
  if (total === 0) return [];
  const padding = 48;
  const span = VIEW_WIDTH - padding * 2;
  const step = total === 1 ? 0 : span / (total - 1);
  return Array.from({ length: total }, (_, i) => padding + i * step);
}

export function FocusForest({ trees, currentGrowth, isGrowing, phase }: FocusForestProps) {
  const displayTrees = useMemo(() => trees.slice(-10), [trees]);
  const showSapling = phase === 'work' && (isGrowing || currentGrowth > 0);

  const positions = useMemo(
    () => layoutTreePositions(displayTrees.length, showSapling),
    [displayTrees.length, showSapling],
  );

  return (
    <div className="focus-forest relative h-28 sm:h-32 w-full overflow-hidden border-b border-emerald-500/10 dark:border-emerald-500/15">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-100/90 via-emerald-50/95 to-emerald-200/80 dark:from-slate-900 dark:via-teal-950/50 dark:to-emerald-950/60" />
      <div className="absolute top-2 right-3 z-10 text-[9px] font-bold uppercase tracking-widest text-teal-700/90 dark:text-cyan-400/90">
        {trees.length} planted
      </div>

      <svg
        viewBox={`0 0 ${VIEW_WIDTH} 96`}
        className="relative w-full h-full block"
        preserveAspectRatio="xMidYMax meet"
        aria-label="Focus forest"
        overflow="hidden"
      >
        <defs>
          <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#16a34a" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <ellipse cx={VIEW_WIDTH / 2} cy={GROUND_Y + 6} rx={200} ry={10} fill="url(#groundGrad)" />
        <rect x={0} y={GROUND_Y} width={VIEW_WIDTH} height={12} fill="#22c55e" className="dark:fill-emerald-800" opacity={0.45} />

        {displayTrees.map((tree, i) => (
          <g key={tree.id}>
            {renderForestTree({
              species: tree.species,
              growth: 100,
              x: positions[i] ?? VIEW_WIDTH / 2,
            })}
          </g>
        ))}

        {showSapling &&
          renderForestTree({
            species: 'pine',
            growth: currentGrowth,
            x: positions[displayTrees.length] ?? VIEW_WIDTH / 2,
            wilting: !isGrowing && currentGrowth > 0 && currentGrowth < 100,
          })}

        {displayTrees.length === 0 && !showSapling && (
          <text
            x={VIEW_WIDTH / 2}
            y={52}
            textAnchor="middle"
            className="fill-slate-500 dark:fill-slate-400 text-[10px] font-semibold"
          >
            Focus to grow your forest
          </text>
        )}
      </svg>

      {isGrowing && phase === 'work' && (
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-500/30 text-[9px] font-bold text-emerald-800 dark:text-emerald-200">
          Growing {Math.round(currentGrowth)}%
        </div>
      )}
    </div>
  );
}
