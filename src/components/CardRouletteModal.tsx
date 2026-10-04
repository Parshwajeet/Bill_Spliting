import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Trophy, X, RotateCw, Dices } from 'lucide-react';

interface CardRouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  friends: string[];
  onSelectPayer: (index: number) => void;
}

const SEGMENT_COLORS = [
  '#f87171', // red
  '#fb923c', // orange
  '#fbbf24', // amber
  '#34d399', // emerald
  '#38bdf8', // sky
  '#818cf8', // indigo
  '#c084fc', // purple
  '#f472b6', // pink
];

export const CardRouletteModal: React.FC<CardRouletteModalProps> = ({
  isOpen,
  onClose,
  friends,
  onSelectPayer,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const numSegments = Math.max(2, friends.length);

  // Draw the roulette wheel on canvas
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 12;
    const anglePerSegment = (2 * Math.PI) / numSegments;

    ctx.clearRect(0, 0, size, size);

    // Draw wheel segments
    for (let i = 0; i < numSegments; i++) {
      const startAngle = i * anglePerSegment;
      const endAngle = (i + 1) * anglePerSegment;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.fillStyle = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Text label
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + anglePerSegment / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 3;
      const friendName = friends[i] || `Friend ${i + 1}`;
      ctx.fillText(friendName.slice(0, 10), radius - 16, 4);
      ctx.restore();
    }

    // Outer rim
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    // Center pin
    ctx.beginPath();
    ctx.arc(center, center, 18, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
  }, [isOpen, friends, numSegments]);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWinnerIndex(null);

    // Random winner
    const chosenIndex = Math.floor(Math.random() * numSegments);
    const anglePerSegment = 360 / numSegments;

    // Pointer is at the top (270 degrees / 12 o'clock).
    // Calculate rotation so chosen segment lands under top pointer
    const randomRotations = 5 + Math.floor(Math.random() * 4); // 5 to 8 full spins
    const targetSegmentOffset = (numSegments - chosenIndex - 0.5) * anglePerSegment - 90;
    const finalDegree = randomRotations * 360 + targetSegmentOffset + (Math.random() * (anglePerSegment * 0.5) - anglePerSegment * 0.25);

    setRotation((prev) => prev + finalDegree);

    setTimeout(() => {
      setIsSpinning(false);
      setWinnerIndex(chosenIndex);
    }, 4200);
  };

  const handleConfirmWinner = () => {
    if (winnerIndex !== null) {
      onSelectPayer(winnerIndex);
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-roulette-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/75 backdrop-blur-sm"
    >
      <div className="flex max-h-[92vh] w-full max-w-sm flex-col rounded-3xl bg-neutral-900 text-white shadow-2xl overflow-hidden border border-neutral-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-neutral-950 font-bold shadow-sm">
              <Dices className="h-5 w-5" />
            </div>
            <div>
              <h2 id="card-roulette-title" className="text-base font-bold text-white">
                Credit Card Roulette
              </h2>
              <p className="text-xs text-neutral-400">
                Let fate choose who treats the table!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
            aria-label="Close roulette modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Wheel Viewport */}
        <div className="p-6 flex flex-col items-center text-center">
          <div className="relative flex items-center justify-center">
            {/* Top Pointer arrow */}
            <div className="absolute -top-3 z-20 flex flex-col items-center">
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[16px] border-t-amber-400 drop-shadow-md" />
            </div>

            {/* Rotating Wheel */}
            <div
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning
                  ? 'transform 4.2s cubic-bezier(0.15, 0.9, 0.25, 1)'
                  : 'none',
              }}
              className="rounded-full shadow-2xl"
            >
              <canvas
                ref={canvasRef}
                width={280}
                height={280}
                className="rounded-full"
              />
            </div>
          </div>

          {/* Winner announcement */}
          {winnerIndex !== null && !isSpinning && (
            <div className="mt-4 w-full rounded-2xl bg-amber-500/20 border border-amber-500/40 p-3.5 animate-bounce">
              <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider block">
                🎉 The Table Payer Is:
              </span>
              <p className="text-xl font-black text-amber-400 mt-0.5">
                {friends[winnerIndex] || `Friend ${winnerIndex + 1}`}
              </p>
              <button
                type="button"
                onClick={handleConfirmWinner}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-bold text-neutral-950 hover:bg-amber-300 transition-colors shadow-sm cursor-pointer"
              >
                <Trophy className="h-3.5 w-3.5" />
                <span>Set as Payer in Bill</span>
              </button>
            </div>
          )}

          {winnerIndex === null && !isSpinning && (
            <p className="mt-4 text-xs text-neutral-400">
              Spin to see who puts down their card for the group tonight!
            </p>
          )}

          {isSpinning && (
            <p className="mt-4 text-xs font-semibold text-amber-300 animate-pulse">
              Spinning the wheel of fate...
            </p>
          )}

          <div className="mt-5 w-full">
            <button
              type="button"
              onClick={handleSpin}
              disabled={isSpinning}
              className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 px-6 text-sm font-bold shadow-lg transition-all cursor-pointer ${
                isSpinning
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  : 'bg-amber-400 text-neutral-950 hover:bg-amber-300 active:scale-98'
              }`}
            >
              <RotateCw className={`h-4 w-4 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'Spinning...' : 'Spin the Wheel!'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-800 bg-neutral-950 px-6 py-3 text-center text-xs text-neutral-500">
          Randomized with unbiased physics
        </div>
      </div>
    </div>
  );
};
