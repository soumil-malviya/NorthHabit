import { motion } from 'motion/react';
import type { AmbientPalette } from '../../types/ambient';

interface AmbientGradientLayerProps {
  palette: AmbientPalette;
  animate: boolean;
  intensity: 'soft' | 'normal';
}

export function AmbientGradientLayer({ palette, animate, intensity }: AmbientGradientLayerProps) {
  const duration = intensity === 'soft' ? 28 : 22;
  const orbSizeA = intensity === 'soft' ? 360 : 440;
  const orbSizeB = intensity === 'soft' ? 320 : 390;
  const orbSizeC = intensity === 'soft' ? 280 : 340;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 transition-colors duration-[2000ms] ease-out"
        style={{ backgroundColor: palette.base }}
      />

      <motion.div
        className="absolute rounded-full pointer-events-none ambient-orb"
        style={{
          top: '-20%',
          left: '5%',
          width: orbSizeA,
          height: orbSizeA,
          background: palette.orbA,
          filter: 'blur(110px)',
        }}
        animate={
          animate
            ? { x: [0, 30, -15, 0], y: [0, -20, 12, 0] }
            : undefined
        }
        transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute rounded-full pointer-events-none ambient-orb"
        style={{
          top: '10%',
          right: '-5%',
          width: orbSizeB,
          height: orbSizeB,
          background: palette.orbB,
          filter: 'blur(120px)',
        }}
        animate={
          animate
            ? { x: [0, -25, 18, 0], y: [0, 15, -10, 0] }
            : undefined
        }
        transition={{ duration: duration * 1.1, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute rounded-full pointer-events-none ambient-orb"
        style={{
          bottom: '0%',
          left: '20%',
          width: orbSizeC,
          height: orbSizeC,
          background: palette.orbC,
          filter: 'blur(105px)',
        }}
        animate={
          animate
            ? { x: [0, 20, -12, 0], opacity: [0.75, 1, 0.8, 0.75] }
            : undefined
        }
        transition={{ duration: duration * 0.95, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 130% 90% at 50% 100%, transparent 35%, ${palette.vignette} 100%)`,
        }}
      />
    </div>
  );
}
