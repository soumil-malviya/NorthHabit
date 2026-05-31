import { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { FocusEcosystemState } from '../../types';
import {
  GROVE_GROUND_Y,
  GROVE_VIEW_W,
  layoutPlantedTrees,
  layoutSaplingX,
} from '../../lib/focusEcosystem/layout';
import { AmbientLayers } from './AmbientLayers';
import { ProceduralTree } from './ProceduralTree';

interface FocusEcosystemProps {
  state: FocusEcosystemState;
  phase: 'work' | 'break' | 'longBreak' | 'idle';
  isGrowing: boolean;
  stats: {
    todayMinutes: number;
    weekMinutes: number;
    vitality: number;
    treeCount: number;
  };
}

function formatMinutes(m: number): string {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r > 0 ? `${h}h ${r}m` : `${h}h`;
}

export function FocusEcosystem({ state, phase, isGrowing, stats }: FocusEcosystemProps) {
  const sapling = state.activeSapling;
  const showSapling = phase === 'work' && sapling && (sapling.growth > 0 || isGrowing);

  const planted = useMemo(() => layoutPlantedTrees(state.trees), [state.trees]);

  const saplingX = useMemo(
    () => layoutSaplingX(planted, showSapling ? sapling : null),
    [planted, showSapling, sapling],
  );

  return (
    <div className="focus-ecosystem relative w-full overflow-hidden rounded-t-2xl border-b border-[var(--border-light)]">
      <div className="relative h-52 sm:h-60 md:h-72 w-full">
        <AmbientLayers
          vitality={stats.vitality}
          isGrowing={isGrowing}
          phase={phase}
        />

        <svg
          viewBox={`0 0 ${GROVE_VIEW_W} ${GROVE_GROUND_Y + 16}`}
          className="absolute inset-0 w-full h-full block"
          preserveAspectRatio="xMidYMax meet"
          aria-label="Focus ecosystem"
        >
          <defs>
            <clipPath id="groveClip">
              <rect x={0} y={0} width={GROVE_VIEW_W} height={GROVE_GROUND_Y + 16} />
            </clipPath>
            <linearGradient id="ecoGround" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--focus-grove-ground-top)" />
              <stop offset="100%" stopColor="var(--focus-grove-ground-bottom)" />
            </linearGradient>
            <radialGradient id="ecoLight" cx="50%" cy="0%" r="80%">
              <stop offset="0%" stopColor="var(--focus-grove-light)" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g clipPath="url(#groveClip)">
            <rect width={GROVE_VIEW_W} height={GROVE_GROUND_Y + 16} fill="url(#ecoLight)" />
            <ellipse
              cx={GROVE_VIEW_W / 2}
              cy={GROVE_GROUND_Y + 4}
              rx={220}
              ry={14}
              fill="url(#ecoGround)"
            />
            <rect
              x={0}
              y={GROVE_GROUND_Y}
              width={GROVE_VIEW_W}
              height={16}
              fill="var(--focus-grove-floor)"
              opacity={0.5}
            />

            {planted.map(({ tree, x }) => (
              <g key={tree.id}>
                <ProceduralTree
                  species={tree.species}
                  scale={tree.growthScale}
                  health={tree.health}
                  x={x}
                  groundY={GROVE_GROUND_Y}
                />
              </g>
            ))}

            <AnimatePresence>
              {showSapling && sapling && (
                <g key={sapling.sessionId}>
                  <ProceduralTree
                    species={sapling.species}
                    scale={1}
                    health={sapling.health}
                    x={saplingX}
                    groundY={GROVE_GROUND_Y}
                    isLive
                    growth={sapling.growth}
                  />
                </g>
              )}
            </AnimatePresence>
          </g>

          {planted.length === 0 && !showSapling && (
            <text
              x={GROVE_VIEW_W / 2}
              y={58}
              textAnchor="middle"
              className="fill-slate-400/80 text-[11px] font-medium"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Begin a focus session to grow your grove
            </text>
          )}
        </svg>

        <div className="absolute top-3 left-3 right-3 flex justify-between items-start gap-2 pointer-events-none z-10">
          <div className="focus-grove-badge rounded-xl px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-primary)]">
            Grove · {stats.treeCount}
          </div>
          <div className="focus-grove-badge rounded-xl px-3 py-1.5 text-[10px] font-semibold text-[var(--text-primary)] tabular-nums">
            Vitality {stats.vitality}%
          </div>
        </div>

        <AnimatePresence>
          {showSapling && sapling && isGrowing && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full focus-grove-badge text-[10px] font-semibold text-[var(--state-success)]"
            >
              Growing · {Math.round(sapling.growth)}%
            </motion.div>
          )}
        </AnimatePresence>

        {showSapling && sapling && !isGrowing && sapling.growth > 0 && sapling.growth < 100 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 text-[10px] text-[var(--state-warning)] font-semibold px-3 py-1 rounded-full focus-grove-badge"
          >
            Growth paused
          </motion.p>
        )}
      </div>

      <div className="relative z-10 flex items-center justify-center gap-6 sm:gap-10 py-2.5 px-4 border-t border-[var(--border-light)] bg-[var(--glass-background)]">
        <Stat label="Today" value={formatMinutes(stats.todayMinutes)} />
        <div className="w-px h-4 bg-[var(--border-light)]" />
        <Stat label="This week" value={formatMinutes(stats.weekMinutes)} />
        <div className="w-px h-4 bg-[var(--border-light)]" />
        <Stat label="Sessions" value={String(state.sessions.filter((s) => s.outcome === 'completed').length)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center min-w-[4.5rem]">
      <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-semibold">{label}</p>
      <p className="text-xs font-semibold text-[var(--text-primary)] tabular-nums mt-0.5">{value}</p>
    </div>
  );
}
