import { motion, useScroll, useTransform } from 'motion/react';

interface AmbientBackgroundProps {
  theme: 'light' | 'dark';
}

export function AmbientBackground({ theme }: AmbientBackgroundProps) {
  const { scrollYProgress } = useScroll();

  const orb1Y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const orb2Y = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const orb3Y = useTransform(scrollYProgress, [0, 1], [0, 60]);

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 landing-grain" aria-hidden />

      <motion.div
        style={{ y: orb1Y }}
        className={`landing-ambient-orb landing-glow-orb absolute -top-[20%] left-[5%] w-[min(90vw,520px)] h-[min(90vw,520px)] rounded-full ${
          isDark ? 'bg-cyan-500/20' : 'bg-cyan-400/15'
        }`}
      />
      <motion.div
        style={{ y: orb2Y }}
        className={`landing-ambient-orb absolute top-[30%] -right-[15%] w-[min(80vw,440px)] h-[min(80vw,440px)] rounded-full landing-glow-orb ${
          isDark ? 'bg-cyan-600/15' : 'bg-cyan-500/12'
        }`}
      />
      <motion.div
        style={{ y: orb3Y }}
        className={`landing-ambient-orb absolute bottom-[10%] left-[20%] w-[min(70vw,380px)] h-[min(70vw,380px)] rounded-full ${
          isDark ? 'bg-cyan-700/10' : 'bg-cyan-300/8'
        }`}
      />

      <div
        className={`absolute inset-0 ${
          isDark
            ? 'bg-gradient-to-b from-[#040405] via-transparent to-[#040405]'
            : 'bg-gradient-to-b from-[#f4f6f9] via-transparent to-[#f0f2f5]'
        }`}
      />
    </div>
  );
}
