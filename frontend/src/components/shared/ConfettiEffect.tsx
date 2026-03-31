import { useEffect } from 'react';
import { motion } from 'motion/react';

interface ConfettiEffectProps {
  onComplete: () => void;
}

export const ConfettiEffect: React.FC<ConfettiEffectProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: 0,
            y: 0,
            scale: 0,
            rotate: 0,
          }}
          animate={{
            x: (Math.random() - 0.5) * 1000,
            y: (Math.random() - 0.5) * 1000,
            scale: [0, 1, 0],
            rotate: Math.random() * 360,
          }}
          transition={{
            duration: 2 + Math.random(),
            ease: 'easeOut',
          }}
          className="absolute w-2 h-2 rounded-sm bg-[#6366F1]"
          style={{
            backgroundColor: i % 2 === 0 ? '#6366F1' : '#A5B4FC',
            opacity: 0.6,
          }}
        />
      ))}
    </div>
  );
};
