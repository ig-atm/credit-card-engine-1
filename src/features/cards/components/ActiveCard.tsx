import { useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
} from 'framer-motion';
import { Wifi } from 'lucide-react';

import { cn, formatCardNumber, clamp, mapRange } from '../../../lib/utils';
import type { CardData } from '../types/card.types';
import {
  VisaLogo,
  MastercardLogo,
  AmexLogo,
  DiscoverLogo,
  RupayLogo,
} from './NetworkLogo';

// ─────────────────────────────────────────────────────────────────────────────
//  SPRING CONFIG
//  Tuned for a weighty, organic feel — not bouncy, not snappy.
//  stiffness: resistance of the spring (higher = stiffer)
//  damping:   how quickly oscillation decays (higher = less bounce)
//  mass:      inertia of the element (higher = slower response)
// ─────────────────────────────────────────────────────────────────────────────

const TILT_SPRING: SpringOptions = { stiffness: 260, damping: 28, mass: 1.2 };
const LIFT_SPRING: SpringOptions = { stiffness: 200, damping: 24, mass: 1.4 };
const GLOW_SPRING: SpringOptions = { stiffness: 180, damping: 22, mass: 1.0 };

// Maximum tilt angle in degrees
const MAX_TILT = 14;
// Y-axis lift on hover (px)
const HOVER_LIFT = -18;

// ─────────────────────────────────────────────────────────────────────────────
//  NETWORK LOGO MAP
// ─────────────────────────────────────────────────────────────────────────────

const NetworkLogoMap = {
  visa:       VisaLogo,
  mastercard: MastercardLogo,
  amex:       AmexLogo,
  discover:   DiscoverLogo,
  rupay:      RupayLogo,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
//  PROPS
// ─────────────────────────────────────────────────────────────────────────────

interface ActiveCardProps {
  card: CardData;
  /** Show full PAN or masked. Defaults to false (masked). */
  revealed?: boolean;
  /** Extra wrapper class names */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function ActiveCard({ card, revealed = false, className }: ActiveCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // ── Raw motion values (mouse position relative to card center, -0.5 → 0.5) ─
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const rawLift    = useMotionValue(0);
  const rawGlow    = useMotionValue(0);

  // ── Spring-smoothed values ───────────────────────────────────────────────
  const rotateX = useSpring(rawRotateX, TILT_SPRING);
  const rotateY = useSpring(rawRotateY, TILT_SPRING);
  const liftY   = useSpring(rawLift,    LIFT_SPRING);
  const glowOp  = useSpring(rawGlow,    GLOW_SPRING);

  // ── Derived transforms ───────────────────────────────────────────────────
  // Primary specular highlight moves opposite to tilt (light reflection simulation)
  const specularX = useTransform(rotateY, [-MAX_TILT, MAX_TILT], ['8%',  '92%']);
  const specularY = useTransform(rotateX, [MAX_TILT, -MAX_TILT], ['8%',  '92%']);
  // Secondary smaller specular (dual-light sim)
  const specular2X = useTransform(rotateY, [-MAX_TILT, MAX_TILT], ['75%', '25%']);
  const specular2Y = useTransform(rotateX, [MAX_TILT, -MAX_TILT], ['70%', '30%']);

  // ─── Event Handlers ────────────────────────────────────────────────────────

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect   = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width  / 2;
    const centerY = rect.top  + rect.height / 2;

    // Normalize: -1 to 1
    const nx = clamp((e.clientX - centerX) / (rect.width  / 2), -1, 1);
    const ny = clamp((e.clientY - centerY) / (rect.height / 2), -1, 1);

    // Map to degree range, flip Y so moving mouse up tilts card back
    rawRotateY.set(mapRange(nx, -1, 1, -MAX_TILT,  MAX_TILT));
    rawRotateX.set(mapRange(ny, -1, 1,  MAX_TILT, -MAX_TILT));
  }

  function handleMouseEnter() {
    setIsHovered(true);
    rawLift.set(HOVER_LIFT);
    rawGlow.set(1);
  }

  function handleMouseLeave() {
    setIsHovered(false);
    rawRotateX.set(0);
    rawRotateY.set(0);
    rawLift.set(0);
    rawGlow.set(0);
  }

  // ─── Render Helpers ────────────────────────────────────────────────────────

  const NetworkLogo = NetworkLogoMap[card.network as keyof typeof NetworkLogoMap] || VisaLogo;

  const gradientStyle = {
    background: card.gradientVia
      ? `linear-gradient(135deg, ${card.gradientFrom} 0%, ${card.gradientVia} 50%, ${card.gradientTo} 100%)`
      : `linear-gradient(135deg, ${card.gradientFrom} 0%, ${card.gradientTo} 100%)`,
  };

  const availablePct = card.creditLimit > 0
    ? (card.availableCredit / card.creditLimit) * 100
    : 0;

  // ─── JSX ──────────────────────────────────────────────────────────────────

  return (
    /* Outer wrapper — owns the glow halo filter and perspective context */
    <div
      className={cn(
        'relative flex items-center justify-center select-none',
        className,
      )}
      style={{ perspective: '1000px' }}
    >

      {/* ── Ambient glow halo (behind the card) ─────────────────────────── */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 50% 55%, ${card.gradientFrom}55, transparent 75%)`,
          opacity: glowOp,
          filter: 'blur(28px)',
          transform: 'translateY(24px) scale(0.92)',
        }}
      />

      {/* ── The Card ────────────────────────────────────────────────────── */}
      <motion.div
        ref={cardRef}
        id="active-credit-card"
        aria-label={`${card.label ?? 'Primary'} card ending in ${card.pan.slice(-4)}`}
        className="relative w-full overflow-hidden rounded-3xl cursor-pointer card-particles"
        style={{
          rotateX,
          rotateY,
          y: liftY,
          transformStyle: 'preserve-3d',
          // Aspect ratio of a standard credit card: 85.6mm × 53.98mm ≈ 1.586
          aspectRatio: '1.586',
          maxWidth: '420px',
          ...gradientStyle,
          boxShadow: isHovered
            ? '0 20px 60px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.16), 0 2px 6px rgba(0,0,0,0.10), inset 0 0 0 1px rgba(255,255,255,0.10), inset 0 1px 0 0 rgba(255,255,255,0.15)'
            : '0 8px 32px rgba(0,0,0,0.16), 0 4px 12px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 0 rgba(255,255,255,0.10)',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        transition={{ duration: 0 }} // spring handles timing — no CSS transition needed
      >

        {/* ── Frosted glass overlay ──────────────────────────────────────── */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-3xl"
          style={{
            backdropFilter: 'blur(2px) saturate(1.3)',
            WebkitBackdropFilter: 'blur(2px) saturate(1.3)',
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.12) 100%)',
          }}
        />

        {/* ── Mesh gradient overlay (organic, alive) ────────────────────── */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 rounded-3xl pointer-events-none"
          animate={{
            backgroundPosition: isHovered ? '100% 50%' : '0% 50%',
          }}
          transition={{ duration: 3, ease: 'easeInOut' }}
          style={{
            backgroundSize: '200% 200%',
            backgroundImage: `radial-gradient(ellipse 60% 50% at 30% 40%, ${card.gradientFrom}44, transparent 60%),
                              radial-gradient(ellipse 50% 60% at 70% 60%, ${card.gradientTo}33, transparent 55%)`,
            mixBlendMode: 'soft-light',
          }}
        />

        {/* ── Primary specular highlight (follows mouse) ─────────────────── */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background: `radial-gradient(circle 200px at ${specularX} ${specularY}, rgba(255,255,255,0.30), transparent 65%)`,
            mixBlendMode: 'screen',
          }}
        />

        {/* ── Secondary specular highlight (smaller, offset) ────────────── */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background: `radial-gradient(circle 100px at ${specular2X} ${specular2Y}, rgba(255,255,255,0.12), transparent 55%)`,
            mixBlendMode: 'screen',
          }}
        />

        {/* ── Noise texture for premium depth ───────────────────────────── */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-3xl opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '160px',
          }}
        />

        {/* ── Card Content ──────────────────────────────────────────────── */}
        <div className="relative z-10 h-full flex flex-col justify-between p-4 sm:p-5 md:p-6">

          {/* Row 1: Card label + Network logo */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {card.label && (
                <p 
                  className={cn(
                    "font-display font-semibold tracking-[0.12em] sm:tracking-[0.18em] uppercase text-white/60 mb-0.5 leading-tight line-clamp-2 overflow-hidden text-ellipsis",
                    card.label.length > 30 
                      ? "text-[8px] sm:text-[9px] md:text-[10px]" 
                      : card.label.length > 18 
                      ? "text-[9px] sm:text-[10px] md:text-[11px]" 
                      : "text-[10px] sm:text-[11px] md:text-[12px]"
                  )}
                  title={card.label}
                >
                  {card.label}
                </p>
              )}
              <p className="text-xs sm:text-sm font-semibold text-white/85 tracking-wide">
                {card.status === 'frozen' ? '❄ Frozen' : card.status === 'pending' ? '⏳ Pending' : 'Active'}
              </p>
            </div>
            <div className="flex-shrink-0 mt-0.5 scale-90 sm:scale-100 origin-top-right">
              <NetworkLogo />
            </div>
          </div>

          {/* Row 2: Chip + Contactless icon */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* EMV chip */}
            <div
              className="w-10 h-7.5 sm:w-12 sm:h-9 rounded-md flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #d4aa60 0%, #f0d080 40%, #c8963c 70%, #e8c060 100%)',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), 0 1px 3px rgba(0,0,0,0.3)',
              }}
              aria-hidden="true"
            >
              {/* Chip grooves */}
              <div className="w-6 h-5 sm:w-7 sm:h-6 rounded-sm border border-yellow-900/20 grid grid-cols-3 grid-rows-3 gap-px p-px opacity-60">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="bg-yellow-800/20 rounded-[1px]" />
                ))}
              </div>
            </div>
            {/* Contactless */}
            <Wifi
              size={18}
              strokeWidth={1.5}
              className="text-white/70 rotate-90 flex-shrink-0"
              aria-label="Contactless payment enabled"
            />
          </div>

          {/* Row 3: Card number */}
          <div>
            <p
              className="font-card-number text-sm sm:text-base md:text-lg text-white tracking-[0.16em] sm:tracking-[0.22em] drop-shadow-sm whitespace-nowrap overflow-hidden text-ellipsis"
              aria-label={`Card number ending ${card.pan.slice(-4)}`}
            >
              {formatCardNumber(card.pan, !revealed)}
            </p>
          </div>

          {/* Row 4: Cardholder name + Expiry */}
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[8px] sm:text-[9px] font-medium tracking-[0.14em] uppercase text-white/50 mb-0.5">
                Card Holder
              </p>
              <p className="text-xs sm:text-sm md:text-base font-semibold text-white tracking-wide drop-shadow-sm truncate">
                {card.cardholderName}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[8px] sm:text-[9px] font-medium tracking-[0.14em] uppercase text-white/50 mb-0.5">
                Expires
              </p>
              <p className="text-xs sm:text-sm md:text-base font-semibold text-white font-card-number tracking-widest drop-shadow-sm">
                {card.expiry}
              </p>
            </div>
          </div>

        </div>{/* /card content */}

        {/* ── Available limit bar (bottom edge) ──────────────────────── */}
        <div
          aria-label={`Available credit: ${availablePct.toFixed(2)}%`}
          className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 hidden sm:block"
        >
          <motion.div
            className="h-full bg-white/50 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${availablePct}%` }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
          />
        </div>

      </motion.div>{/* /card */}
    </div>
  );
}

export default ActiveCard;
