import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface CreditScoreDialProps {
  score: number;
  size?: number;
  className?: string;
  animate?: boolean;
}

export function CreditScoreDial({ score, size = 120, className, animate = true }: CreditScoreDialProps) {
  // CIBIL range is 300 to 900
  const min = 300;
  const max = 900;
  
  // Constrain score between min and max
  const validScore = Math.max(min, Math.min(max, score || 300));
  const percentage = ((validScore - min) / (max - min)) * 100;

  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // We only want a semi-circle (gauge style) or 3/4 circle
  // Let's do a 3/4 circle dial (270 degrees)
  const arcLength = circumference * 0.75; 
  const dashOffset = arcLength - (percentage / 100) * arcLength;

  let colorClass = 'text-loss stroke-loss'; // Poor
  let label = 'Poor';

  if (validScore >= 750) {
    colorClass = 'text-brand-500 stroke-brand-500'; // Excellent
    label = 'Excellent';
  } else if (validScore >= 650) {
    colorClass = 'text-caution stroke-caution'; // Good
    label = 'Good';
  }

  return (
    <div className={cn('relative flex flex-col items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-[135deg]"
      >
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-canvas-300 dark:stroke-white/[0.05] fill-none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.25} // 1/4 gap
          strokeLinecap="round"
        />
        {/* Progress Track */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={cn('fill-none transition-colors duration-500', colorClass)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={animate ? { strokeDashoffset: arcLength + (circumference * 0.25) } : false}
          animate={{ strokeDashoffset: dashOffset + (circumference * 0.25) }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>
      
      {/* Score Text in Center */}
      <div className="absolute flex flex-col items-center justify-center text-center mt-2">
        <motion.span 
          key={validScore}
          initial={{ scale: 0.9, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn("text-3xl font-display font-extrabold tabular-nums tracking-tighter", colorClass.split(' ')[0])}
        >
          {validScore}
        </motion.span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-ink-tertiary">
          {label}
        </span>
      </div>
    </div>
  );
}
