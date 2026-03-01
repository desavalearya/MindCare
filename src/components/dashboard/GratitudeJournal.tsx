import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface GratitudeJournalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (points: number) => void;
}

const BLOSSOM_POSITIONS = [
  { x: 75, y: 60 }, { x: 90, y: 40 }, { x: 110, y: 45 }, { x: 125, y: 65 },
  { x: 80, y: 85 }, { x: 100, y: 70 }, { x: 120, y: 85 }, { x: 95, y: 95 },
  { x: 110, y: 100 }, { x: 135, y: 75 }, { x: 65, y: 75 }, { x: 85, y: 105 },
  { x: 115, y: 60 }, { x: 130, y: 55 }, { x: 70, y: 50 }, { x: 145, y: 90 },
  { x: 55, y: 90 }, { x: 95, y: 55 }, { x: 105, y: 85 }, { x: 85, y: 70 },
];

const GratitudeJournal = ({ open, onClose, onComplete }: GratitudeJournalProps) => {
  const [entry, setEntry] = useState("");
  const [entries, setEntries] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const points = entries.length;
  const maxAward = 10; // cap to align with challenge points
  const award = Math.min(points, maxAward);

  const handleAdd = () => {
    const text = entry.trim();
    if (!text) return;
    setEntries(prev => [...prev, text]);
    setEntry("");
  };

  const handleFinish = () => {
    if (points === 0 || isSubmitting) return;
    setIsSubmitting(true);
    // Play blossom animation then auto-complete and close
    setTimeout(() => {
      onComplete(award);
      // reset state
      setEntries([]);
      setEntry("");
      setIsSubmitting(false);
      onClose();
    }, 1800);
  };

  // auto-complete handled in handleFinish

  const bloomProgress = Math.min(points / maxAward, 1);
  const canopyHue = 120 + (330 - 120) * bloomProgress; // green to pink
  const canopyColor = `hsl(${Math.round(canopyHue)} 60% 80%)`;
  const canopyInner = `hsl(${Math.round(canopyHue)} 60% 88%)`;
  const canopyOuter = `hsl(${Math.round(canopyHue)} 60% 72%)`;

  // Progress ring metrics
  const ringR = 62;
  const circumference = 2 * Math.PI * ringR;
  const dashOffset = circumference * (1 - bloomProgress);

  // Clustered canopy for a more realistic look
  const CANOPY_CLUSTERS = [
    { x: 100, y: 70, r: 30 },
    { x: 80, y: 80, r: 24 },
    { x: 120, y: 82, r: 24 },
    { x: 90, y: 60, r: 20 },
    { x: 110, y: 60, r: 20 },
    { x: 75, y: 95, r: 18 },
    { x: 125, y: 95, r: 18 },
    { x: 100, y: 95, r: 16 },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-foreground">Gratitude Journaling</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-4">
            {/* Left: Journaling Form */}
            <div className="space-y-4">
              <div className="text-muted-foreground text-sm">Write down things you’re grateful for. Each entry adds a blossom 🌸</div>
              <Textarea
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="I am grateful for..."
                className="min-h-[120px]"
                disabled={isSubmitting}
              />
              <div className="flex items-center gap-2">
                <Button onClick={handleAdd} className="gap-2" disabled={isSubmitting}>
                  <Sparkles className="w-5 h-5" />
                  Add Gratitude
                </Button>
                <Badge variant="secondary">Points: {points}</Badge>
              </div>

              {/* Entries list */}
              {entries.length > 0 && (
                <Card className="p-4 bg-card border-border">
                  <h4 className="font-medium text-foreground mb-2">Your Gratitude Entries</h4>
                  <ul className="space-y-2 list-disc list-inside">
                    {entries.map((e, i) => (
                      <li key={i} className="text-sm text-muted-foreground">{e}</li>
                    ))}
                  </ul>
                </Card>
              )}

              <Button onClick={handleFinish} disabled={points === 0 || isSubmitting} className="w-full mt-2">
                {isSubmitting ? "Submitting..." : "Finish Journaling"}
              </Button>
            </div>

            {/* Right: Blooming Tree Visualization */}
            <Card className="p-4 bg-card border-border">
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <Heart className="w-5 h-5 text-peach-foreground" />
                Gratitude Tree
              </h4>
              <div className="flex items-center justify-center">
                <svg width="220" height="220" viewBox="0 0 200 200" className="shadow-gentle rounded-md">
                  <defs>
                    {/* Trunk gradient */}
                    <linearGradient id="trunkGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="hsl(30 25% 45%)" />
                      <stop offset="100%" stopColor="hsl(30 25% 30%)" />
                    </linearGradient>
                    {/* Canopy radial gradient, responsive to bloom hue */}
                    <radialGradient id="canopyGrad" cx="50%" cy="45%" r="60%">
                      <stop offset="0%" stopColor={canopyInner} />
                      <stop offset="100%" stopColor={canopyOuter} />
                    </radialGradient>
                    {/* Blossom gradient & soft glow */}
                    <radialGradient id="blossomGrad" cx="50%" cy="40%" r="60%">
                      <stop offset="0%" stopColor="hsl(330 80% 92%)" />
                      <stop offset="80%" stopColor="hsl(330 70% 75%)" />
                      <stop offset="100%" stopColor="hsl(330 70% 68%)" />
                    </radialGradient>
                    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="1.8" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Subtle sky backdrop */}
                  <rect x="0" y="0" width="200" height="200" rx="12" fill="url(#bgGrad)" opacity="0.0" />

                  {/* Ground */}
                  <path d="M40 180 Q 100 160 160 180 L 160 200 L 40 200 Z" fill="hsl(140 45% 92%)" />

                  {/* Trunk & branches */}
                  <g>
                    <rect x="95" y="110" width="10" height="70" rx="4" fill="url(#trunkGrad)" />
                    <path d="M100 120 C 85 110, 70 95, 60 85" stroke="hsl(30 20% 35%)" strokeWidth="6" strokeLinecap="round" fill="none" />
                    <path d="M100 120 C 115 110, 130 95, 140 85" stroke="hsl(30 20% 35%)" strokeWidth="6" strokeLinecap="round" fill="none" />
                    <path d="M100 130 C 92 118, 85 112, 78 108" stroke="hsl(30 20% 35%)" strokeWidth="4" strokeLinecap="round" fill="none" />
                    <path d="M100 130 C 108 118, 115 112, 122 108" stroke="hsl(30 20% 35%)" strokeWidth="4" strokeLinecap="round" fill="none" />
                  </g>

                  {/* Canopy group with a gentle sway */}
                  <motion.g
                    style={{ transformOrigin: "100px 80px" }}
                    animate={{ rotate: [0, 1.5, 0, -1.5, 0] }}
                    transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                  >
                    {/* Clustered canopy for a more realistic look */}
                    {CANOPY_CLUSTERS.map((c, i) => (
                      <circle key={i} cx={c.x} cy={c.y} r={c.r} fill="url(#canopyGrad)" stroke={canopyColor} strokeWidth="0.8" />
                    ))}
                    {/* Pink overlay that slowly increases with progress and fully blooms on submit */}
                    <motion.circle
                      cx="100"
                      cy="80"
                      r="58"
                      fill="hsl(330 60% 82%)"
                      initial={false}
                      animate={{ opacity: isSubmitting ? 1 : Math.min(bloomProgress * 0.8, 0.8) }}
                      transition={{ duration: isSubmitting ? 2 : 0.6, ease: "easeInOut" }}
                    />

                    {/* Blossoms */}
                    {(isSubmitting ? BLOSSOM_POSITIONS : BLOSSOM_POSITIONS.slice(0, points)).map((p, idx) => {
                      const petalCount = 5;
                      const baseRotation = (idx * 7) % 360; // small variation per blossom
                      const petalOffset = 6;
                      const rx = 4;
                      const ry = 7;
                      return (
                        <motion.g
                          key={idx}
                          initial={{ scale: 0, opacity: 0, rotate: baseRotation }}
                          animate={{ scale: 1, opacity: 1, rotate: baseRotation }}
                          transition={{ duration: 0.45, delay: idx * (isSubmitting ? 0.03 : 0.06), ease: "easeOut" }}
                          filter="url(#softGlow)"
                        >
                          {[...Array(petalCount)].map((_, i) => {
                            const theta = (i * 360) / petalCount;
                            const rad = (theta * Math.PI) / 180;
                            const cx = p.x + Math.cos(rad) * petalOffset;
                            const cy = p.y + Math.sin(rad) * petalOffset;
                            return (
                              <ellipse
                                key={i}
                                cx={cx}
                                cy={cy}
                                rx={rx}
                                ry={ry}
                                transform={`rotate(${theta} ${cx} ${cy})`}
                                fill="url(#blossomGrad)"
                                stroke="hsl(330 60% 65%)"
                                strokeWidth="0.6"
                                opacity="0.95"
                              />
                            );
                          })}
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={2.3}
                            fill="hsl(45 90% 60%)" // warm stamen center
                            stroke="hsl(45 80% 40%)"
                            strokeWidth="0.5"
                          />
                        </motion.g>
                      );
                    })}

                    {/* Progress ring around canopy */}
                    <circle
                      cx="100"
                      cy="80"
                      r={ringR}
                      fill="none"
                      stroke="hsl(0 0% 90%)"
                      strokeWidth="6"
                      opacity="0.6"
                      transform="rotate(-90 100 80)"
                    />
                    <motion.circle
                      cx="100"
                      cy="80"
                      r={ringR}
                      fill="none"
                      stroke="hsl(330 70% 62%)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      style={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset: dashOffset }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      transform="rotate(-90 100 80)"
                    />
                  </motion.g>
                </svg>
              </div>
              <div className="text-center mt-3 text-sm text-muted-foreground">Bloom Progress: {(bloomProgress * 100).toFixed(0)}%</div>
            </Card>
          </div>
      </DialogContent>
    </Dialog>
  );
};

export default GratitudeJournal;